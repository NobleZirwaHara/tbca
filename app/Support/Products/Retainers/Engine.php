<?php

namespace App\Support\Products\Retainers;

use App\Models\Order;
use App\Models\Products\Retainers\Alert;
use App\Models\Products\Retainers\CapacityPool;
use App\Models\Products\Retainers\Commitment;
use App\Models\Products\Retainers\Dispute;
use App\Models\Products\Retainers\Event;
use App\Models\Products\Retainers\Overage;
use App\Models\Products\Retainers\Period;
use App\Models\Products\Retainers\Proposal;
use App\Models\Products\Retainers\Retainer;
use App\Models\Products\Retainers\Rollover;
use App\Models\Products\Retainers\Scenario;
use App\Models\Products\Retainers\ScopeChange;
use App\Models\Products\Retainers\Service;
use App\Models\Products\Retainers\Substitution;
use App\Models\Products\Retainers\Usage;
use App\Models\Products\Retainers\UtilisationDecision;
use App\Models\User;
use App\Support\Platform\Checkout;
use App\Support\Platform\Reference;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * The Retainers rule engine. Every gate in the blueprint that changes money,
 * capacity or allowance state runs through here and writes an audit event.
 *
 *   Proposal:  requested -> hold | issued -> accepted -> signed      (+ declined / expired)
 *   Retainer:  pending_activation -> active -> paused | cancelling -> ended
 *   Usage:     pending -> confirmed -> disputed -> corrected | credited | confirmed
 *   Overage:   requested -> authorised | declined | expired ; authorised -> cap_reached
 */
class Engine
{
    /* ----------------------------------------------------------------- audit */

    public static function log(string $type, string $summary, ?Retainer $retainer = null, ?Proposal $proposal = null, array $data = []): Event
    {
        return Event::create([
            'retainer_id' => $retainer?->id,
            'proposal_id' => $proposal?->id ?? $retainer?->proposal_id,
            'actor_id' => auth()->id(),
            'type' => $type,
            'summary' => $summary,
            'data' => $data ?: null,
            'correlation_id' => (string) Str::uuid(),
            'created_at' => now(),
        ]);
    }

    protected static function fail(string $field, string $message): never
    {
        throw ValidationException::withMessages([$field => $message]);
    }

    /* ----------------------------------------------------- C1-C5 and floor */

    /** GATE-RE-01: the five capacity-test elements, evaluated row by row. */
    public static function capacityTest(Service $s): array
    {
        $rows = [
            ['key' => 'C1', 'label' => 'Quantified allowance', 'pass' => $s->allowance_qty > 0 && in_array($s->allowance_unit, ['HOUR', 'TICKET', 'DELIVERABLE', 'RESPONSE_WINDOW', 'AVAILABILITY_BLOCK'], true) && filled($s->period), 'detail' => "{$s->allowance_qty} {$s->allowance_unit} / {$s->period}", 'fail' => 'RE-FAIL-C1-UNBOUNDED'],
            ['key' => 'C2', 'label' => 'Bounded scope + exclusions', 'pass' => count($s->inclusions ?? []) > 0 && count($s->exclusions ?? []) > 0, 'detail' => count($s->inclusions ?? []).' inclusions · '.count($s->exclusions ?? []).' exclusions', 'fail' => 'RE-FAIL-C2-SCOPE'],
            ['key' => 'C3', 'label' => 'Reserved capacity owner', 'pass' => in_array($s->owner_model, ['NAMED_PERSON', 'DEFINED_ROLE', 'TEAM'], true) && $s->pool_id !== null && filled($s->owner['seniority'] ?? null), 'detail' => Catalogue::ownerModelLabel($s->owner_model).' · '.($s->owner['seniority'] ?? 'no seniority'), 'fail' => 'RE-FAIL-C3-CAPACITY'],
            ['key' => 'C4', 'label' => 'Unused treatment disclosed', 'pass' => in_array($s->unused_rule, ['FORFEIT', 'CAPPED_ROLL_FORWARD', 'CONVERT_TO_CREDIT'], true) && ($s->unused_rule !== 'CAPPED_ROLL_FORWARD' || $s->rollover_cap_pct > 0), 'detail' => Catalogue::unusedLabel($s->unused_rule, $s->rollover_cap_pct), 'fail' => 'RE-FAIL-C4-UNUSED'],
            ['key' => 'C5', 'label' => 'Overage treatment disclosed', 'pass' => in_array($s->overage_rule, ['PREAPPROVED_RATE', 'REFUSE', 'ABSORB_TO_CAP', 'RESCOPE'], true) && ($s->overage_rule !== 'PREAPPROVED_RATE' || $s->overage_rate_zar > 0), 'detail' => $s->overage_rule.($s->overage_rate_zar ? ' · R'.number_format($s->overage_rate_zar).'/h' : ''), 'fail' => 'RE-FAIL-C5-OVERAGE'],
        ];

        return $rows;
    }

    /** Approved floor for a contract at a given allowance (contract floor, else service floor per unit). */
    public static function floorFor(Retainer $r, ?float $allowance = null): int
    {
        $allowance ??= $r->allowance_qty;
        $perUnit = $r->floor_zar !== null
            ? $r->floor_zar / max(1, $r->allowance_qty)
            : $r->service->floor_zar / max(1, $r->service->allowance_qty);

        return (int) round($perUnit * $allowance);
    }

    public static function floorStatus(int $fee, int $floor): array
    {
        $variance = $fee - $floor;
        $pct = $floor > 0 ? round($variance / $floor * 100, 1) : 0.0;
        $level = $variance >= 0 ? 'Compliant' : ($pct < -5 ? 'Below Floor' : 'At Risk');

        return ['variance' => $variance, 'pct' => $pct, 'level' => $level, 'blocked' => $variance < 0];
    }

    /** Public CTA state for a service (Screen 3 control table). */
    public static function saleState(Service $s): string
    {
        if ($s->custom_pricing) {
            return 'ELIGIBLE';
        }
        if ($s->certification !== 'certified') {
            return collect(self::capacityTest($s))->every('pass') ? 'DRAFT_NOT_CERTIFIED' : 'C1_C5_INCOMPLETE';
        }
        if (self::floorStatus($s->price_zar, $s->floor_zar)['blocked']) {
            return 'BELOW_FLOOR_BLOCKED';
        }
        if (! $s->pool) {
            return 'CAPACITY_UNKNOWN';
        }
        $h = self::headroom($s->pool);
        if ($h['stale']) {
            return 'CAPACITY_DATA_STALE';
        }

        return $h['headroom'] < $s->allowance_qty ? 'CAPACITY_CEILING_REACHED' : 'ELIGIBLE';
    }

    public static function certify(Service $s, bool $approve, ?string $note = null): void
    {
        $test = self::capacityTest($s);
        if ($approve && ! collect($test)->every('pass')) {
            self::fail('certification', 'All five C1–C5 elements must PASS with row evidence before certification.');
        }
        if ($approve && self::floorStatus($s->price_zar, $s->floor_zar)['blocked']) {
            self::fail('certification', 'Price is below the approved floor (GATE-RE-02). Remediate before certifying.');
        }

        $s->update([
            'certification' => $approve ? 'certified' : 'rejected',
            'certification_notes' => ['by' => auth()->user()?->name, 'at' => now()->toDateTimeString(), 'note' => $note, 'test' => $test],
        ]);
        self::log('re.capacity_test.decided', ($approve ? 'Certified ' : 'Rejected ').$s->name, null, null, ['service' => $s->code, 'decision' => $s->certification]);
    }

    /* -------------------------------------------------------------- capacity */

    /** HARD_HEADROOM for an exact pool (Part 8.2). */
    public static function headroom(CapacityPool $pool, ?int $exceptRetainerId = null): array
    {
        $serviceIds = $pool->services()->pluck('id');

        $active = (float) Retainer::whereIn('service_id', $serviceIds)
            ->whereIn('status', ['pending_activation', 'active', 'paused', 'cancelling'])
            ->when($exceptRetainerId, fn ($q) => $q->where('id', '!=', $exceptRetainerId))
            ->sum('allowance_qty');

        $reserved = (float) Proposal::whereIn('service_id', $serviceIds)
            ->whereIn('status', ['issued', 'accepted'])
            ->where('reservation_expires_at', '>', now())
            ->sum('reserved_units');

        $rollover = (float) Rollover::whereIn('retainer_id', Retainer::whereIn('service_id', $serviceIds)->pluck('id'))
            ->where('status', 'open')->sum('units');

        $headroom = $pool->productive_units - $active - $reserved - $pool->cross_vehicle_units - $rollover - $pool->protective_reserve - $pool->review_reserve;
        $stale = ! $pool->data_effective_at || $pool->data_effective_at->lt(now()->subDays(45));

        return [
            'productive' => $pool->productive_units,
            'active' => round($active, 2),
            'reserved' => round($reserved, 2),
            'cross_vehicle' => $pool->cross_vehicle_units,
            'rollover' => round($rollover, 2),
            'protective' => $pool->protective_reserve,
            'review' => $pool->review_reserve,
            'headroom' => round($headroom, 2),
            'stale' => $stale,
        ];
    }

    /** GATE-RE-03 atomic reservation: only one competing proposal can take the final units. */
    public static function reserve(Proposal $proposal): bool
    {
        $service = $proposal->service;
        if (! $service->pool_id) {
            self::log('re.capacity.reservation.failed', 'No capacity pool on service', null, $proposal);

            return false;
        }

        return DB::transaction(function () use ($proposal, $service) {
            $pool = CapacityPool::whereKey($service->pool_id)->lockForUpdate()->first();
            $proposal->refresh();
            self::log('re.capacity.reservation.requested', "Reserve {$proposal->allowance_qty}h in {$pool->name}", null, $proposal);

            $h = self::headroom($pool);
            $own = ($proposal->reservation_expires_at?->isFuture() && in_array($proposal->status, ['issued', 'accepted'], true)) ? $proposal->reserved_units : 0;
            if ($h['stale'] || ($h['headroom'] + $own) < $proposal->allowance_qty) {
                self::log('re.capacity.reservation.failed', $h['stale'] ? 'Capacity data stale' : 'Insufficient exact-pool headroom', null, $proposal, $h);

                return false;
            }

            $proposal->update([
                'reserved_units' => $proposal->allowance_qty,
                'reservation_expires_at' => now()->addDays(Catalogue::PROPOSAL_VALIDITY_DAYS)->endOfDay(),
            ]);
            self::log('re.capacity.reserved', "Reserved {$proposal->allowance_qty}h until ".$proposal->reservation_expires_at->format('d M Y'), null, $proposal);

            return true;
        });
    }

    /* -------------------------------------------------------------- proposals */

    /**
     * Track A P0-P6: request -> vehicle -> C1-C5 -> floor -> capacity -> disclosures -> frozen proposal.
     *
     * @param  array<string, mixed>  $data  validated proposal-request fields
     */
    public static function submitRequest(?User $user, Service $service, array $data, array $acks): Proposal
    {
        $allowance = (float) ($data['allowance'] ?? $service->allowance_qty) ?: $service->allowance_qty;
        $basis = $service->allowance_qty > 0 ? $service->price_zar / $service->allowance_qty : 0;
        $fee = (int) (round($basis * $allowance / 500) * 500) ?: $service->price_zar;

        $proposal = Proposal::create([
            'reference' => 'TBCA-PR-'.now()->format('Y-md').'-'.str_pad((string) (Proposal::count() + 1), 4, '0', STR_PAD_LEFT),
            'user_id' => $user?->id,
            'service_id' => $service->id,
            'status' => 'requested',
            'request' => $data,
            'organisation' => $data['organisation'],
            'allowance_qty' => $allowance,
            'monthly_fee_zar' => $fee,
            'overage_rate_zar' => $service->overage_rate_zar,
            'rollover_cap_pct' => $service->rollover_cap_pct,
            'service_level' => $data['service_level'] ?? 'Standard',
            'owner_model' => $data['owner_model'] ?? $service->owner_model,
            'start_date' => $data['start_date'] ?? null,
            'exclusions_version' => $acks['exclusions'] ?? null,
            'disclosure_version' => $acks['disclosure'] ?? null,
        ]);
        self::log('re.proposal.created', 'Proposal request received (no money, no capacity promise)', null, $proposal);

        $hold = null;
        if (! $service->custom_pricing && $service->certification !== 'certified') {
            $hold = 'RET_NOT_CERTIFIED';
        } elseif (! $service->custom_pricing && self::floorStatus($fee, (int) round($service->floor_zar / max(1, $service->allowance_qty) * $allowance))['blocked']) {
            $hold = 'BELOW_FLOOR';
        } elseif (($acks['exclusions'] ?? null) !== Catalogue::EXCLUSIONS_VERSION) {
            $hold = 'EXCLUSION_HOLD';
        } elseif (($acks['disclosure'] ?? null) !== Catalogue::DISCLOSURE_VERSION) {
            $hold = 'DISCLOSURE_HOLD';
        } elseif (! self::reserve($proposal)) {
            $hold = 'CAPACITY_HOLD';
        }

        if ($hold) {
            $proposal->update(['status' => 'hold', 'hold_reason' => $hold]);
            self::log('re.proposal.hold', "Proposal held: {$hold}", null, $proposal);

            return $proposal;
        }

        self::issue($proposal->fresh());

        return $proposal->fresh();
    }

    /** P6: freeze the proposal (version + hash + validity). */
    public static function issue(Proposal $proposal): void
    {
        $proposal->update([
            'status' => 'issued',
            'hold_reason' => null,
            'issued_at' => now(),
            'valid_until' => now()->addDays(Catalogue::PROPOSAL_VALIDITY_DAYS)->toDateString(),
        ]);
        $proposal->update(['hash' => self::proposalHash($proposal->fresh())]);
        self::log('re.proposal.issued', 'Frozen proposal issued v'.$proposal->version, null, $proposal);
    }

    public static function proposalHash(Proposal $p): string
    {
        return hash('sha256', json_encode([$p->reference, $p->version, $p->service_id, $p->allowance_qty, $p->monthly_fee_zar, $p->overage_rate_zar, $p->rollover_cap_pct, $p->exclusions_version, $p->disclosure_version]));
    }

    /** Retry the hard gates on a held proposal (admin "Reserve Capacity"). */
    public static function retryHold(Proposal $proposal): bool
    {
        if ($proposal->status !== 'hold') {
            self::fail('proposal', 'Only held proposals can be re-tested.');
        }
        if ($proposal->hold_reason === 'BELOW_FLOOR' || $proposal->hold_reason === 'RET_NOT_CERTIFIED') {
            self::fail('proposal', "Hold {$proposal->hold_reason} cannot be cleared by a capacity retry.");
        }
        if (! self::reserve($proposal)) {
            return false;
        }
        self::issue($proposal->fresh());

        return true;
    }

    public static function expireIfLapsed(Proposal $p): void
    {
        if (in_array($p->status, ['issued', 'accepted'], true) && $p->valid_until && $p->valid_until->lt(today())) {
            $p->update(['status' => 'expired', 'reserved_units' => 0]);
            self::log('re.proposal.expired', 'Proposal validity lapsed — re-scope and re-price required', null, $p);
        }
    }

    /** P7: client accepts the frozen proposal; acceptance revalidates capacity and integrity. */
    public static function accept(Proposal $p): void
    {
        self::expireIfLapsed($p);
        if ($p->status !== 'issued') {
            self::fail('proposal', "A {$p->status} proposal cannot be accepted.");
        }
        if ($p->hash !== self::proposalHash($p)) {
            self::fail('proposal', 'Proposal changed after issue. A new version is required (GATE-RE-06).');
        }
        if ($p->exclusions_version !== Catalogue::EXCLUSIONS_VERSION || $p->disclosure_version !== Catalogue::DISCLOSURE_VERSION) {
            self::fail('proposal', 'Exclusions or utilisation disclosure changed since you acknowledged them. Please review them again.');
        }
        if (! $p->reservation_expires_at?->isFuture() && ! self::reserve($p)) {
            self::fail('proposal', 'Capacity is no longer available for this proposal (GATE-RE-03).');
        }

        $p->update(['status' => 'accepted', 'accepted_at' => now()]);
        self::log('re.proposal.accepted', 'Client accepted frozen proposal', null, $p);
    }

    public static function decline(Proposal $p): void
    {
        if (! in_array($p->status, ['issued', 'hold'], true)) {
            self::fail('proposal', "A {$p->status} proposal cannot be declined.");
        }
        $p->update(['status' => 'declined', 'reserved_units' => 0]);
        self::log('re.proposal.declined', 'Client declined proposal', null, $p);
    }

    /** P8: execute the agreement. Creates the Retainer and the first-period order. */
    public static function sign(Proposal $p, User $user, array $signatory): Retainer
    {
        if ($p->status !== 'accepted') {
            self::fail('proposal', 'Only an accepted proposal can be signed.');
        }
        if (! $p->reservation_expires_at?->isFuture()) {
            self::fail('proposal', 'The capacity reservation expired before signature. Please request re-validation.');
        }

        return DB::transaction(function () use ($p, $user, $signatory) {
            $service = $p->service;
            $code = self::nextCode();
            $agreement = str_replace('TBCA-PR-', 'TBCA-AGR-', $p->reference);
            $start = $p->start_date ?? today()->addDay();

            $retainer = Retainer::create([
                'code' => $code,
                'agreement_ref' => $agreement,
                'user_id' => $user->id,
                'service_id' => $service->id,
                'proposal_id' => $p->id,
                'name' => $service->name,
                'client_name' => $p->organisation,
                'status' => 'pending_activation',
                'allowance_qty' => $p->allowance_qty,
                'monthly_fee_zar' => $p->monthly_fee_zar,
                'overage_rate_zar' => $p->overage_rate_zar,
                'rollover_cap_pct' => $p->rollover_cap_pct,
                'service_level' => $service->response_window.' response',
                'owner_model' => $p->owner_model,
                'named_person_material' => $p->owner_model === 'NAMED_PERSON',
                'adviser' => ['name' => $service->owner['name'] ?? 'To be confirmed', 'title' => $service->owner['title'] ?? 'Senior Partner', 'since' => Carbon::parse($start)->toDateString()],
                'account_owner' => ['name' => $service->owner['name'] ?? 'TBCA Account Director', 'role' => 'Account Director', 'email' => 'accounts@thebusinessclinic.africa', 'phone' => '+27 60 801 1365', 'since' => Carbon::parse($start)->toDateString(), 'delegation' => ['scope' => 'Full', 'overage' => true, 'scope_change' => true, 'substitution' => true]],
                'min_term_months' => $service->min_term_months,
                'notice_days' => $service->notice_days,
                'start_date' => $start,
                'term_end' => Carbon::parse($start)->addMonths($service->min_term_months)->subDay(),
                'signatory' => $signatory,
                'signed_at' => now(),
                'period_revenue_zar' => $p->monthly_fee_zar,
                'period_cost_zar' => (int) round($service->floor_zar * 0.8),
            ]);

            $order = Checkout::createOrder([[
                'item_type' => 'retainer',
                'item_code' => $code,
                'name' => "{$service->name} — first period ({$p->allowance_qty} hours)",
                'unit_zar' => $p->monthly_fee_zar,
                'meta' => ['retainer' => $code, 'proposal' => $p->reference],
            ]], $user, 'retainers', [
                'return_url' => "/retainers/account/{$code}",
                'title' => "{$service->name} — first payment",
                'retainer' => $code,
            ]);

            $retainer->update(['order_id' => $order->id]);
            $p->update(['status' => 'signed']);
            self::log('re.agreement.executed', "Agreement {$agreement} signed by {$signatory['name']}", $retainer, $p, ['order' => $order->reference]);

            return $retainer;
        });
    }

    public static function nextCode(): string
    {
        $year = now()->format('Y');
        $last = Retainer::where('code', 'like', "RET-{$year}-%")->orderByDesc('code')->value('code');
        $n = $last ? ((int) substr($last, -4)) + 1 : 1;

        return sprintf('RET-%s-%04d', $year, $n);
    }

    /** P9 pull-style activation: when the first-period order is paid, open the allowance (idempotent). */
    public static function syncActivation(Retainer $r): void
    {
        if ($r->status !== 'pending_activation' || ! $r->order_id) {
            return;
        }
        $order = Order::find($r->order_id);
        if (! $order?->isPaid()) {
            return;
        }

        DB::transaction(function () use ($r) {
            $r = Retainer::whereKey($r->id)->lockForUpdate()->first();
            if ($r->status !== 'pending_activation') {
                return;
            }
            $start = $r->start_date && $r->start_date->isFuture() ? $r->start_date : today();
            $r->update(['status' => 'active', 'activated_at' => now(), 'start_date' => $start]);
            $r->proposal?->update(['reserved_units' => 0]);
            self::openPeriod($r, $start, 0);
            $r->allocations()->create(['adviser' => $r->adviser['name'] ?? 'Named Adviser', 'role' => 'Lead Advisor', 'allocation_pct' => 100, 'workload_pct' => 60, 'is_primary' => true]);
            self::log('re.retainer.activated', 'First payment received — Retainer activated', $r);
        });
    }

    public static function openPeriod(Retainer $r, Carbon $start, float $carry): Period
    {
        $period = $r->periods()->create([
            'starts_on' => $start->toDateString(),
            'ends_on' => $start->copy()->addMonth()->subDay()->toDateString(),
            'opening_units' => $r->allowance_qty,
            'carry_units' => $carry,
            'status' => 'open',
        ]);
        self::log('re.period.opened', 'Service period opened '.$period->starts_on->format('d M').' – '.$period->ends_on->format('d M Y'), $r, null, ['opening' => $r->allowance_qty, 'carry' => $carry]);

        return $period;
    }

    /* ---------------------------------------------------------------- ledger */

    /** Live meter (Part 6.2): confirmed, pending and disputed are separate; remaining never negative. */
    public static function meter(Retainer $r, ?Period $period = null): array
    {
        $period ??= $r->currentPeriod();
        if (! $period) {
            return ['period' => null];
        }

        $lines = Usage::where('period_id', $period->id)->get();
        $included = $lines->where('billing_effect', 'INCLUDED');
        $confirmed = (float) $included->whereIn('status', ['confirmed', 'corrected'])->sum('units');
        $pending = (float) $included->where('status', 'pending')->sum('units');
        $disputed = (float) $included->where('status', 'disputed')->sum('units');
        $overage = (float) $lines->where('billing_effect', 'OVERAGE_APPROVED')->whereIn('status', ['confirmed', 'corrected'])->sum('units');
        $denominator = $period->opening_units + $period->carry_units + $period->credit_units;
        $remaining = max(0, $denominator - $confirmed);
        $daysLeft = max(0, (int) today()->diffInDays($period->ends_on->copy()->addDay(), false));
        $daysTotal = (int) $period->starts_on->diffInDays($period->ends_on) + 1;

        $util = $denominator > 0 ? round($confirmed / $denominator * 100, 1) : 0;

        return [
            'period' => ['id' => $period->id, 'starts_on' => $period->starts_on->toDateString(), 'ends_on' => $period->ends_on->toDateString(), 'status' => $period->status, 'next_reset' => $period->ends_on->copy()->addDay()->toDateString()],
            'opening' => $period->opening_units,
            'carry' => $period->carry_units,
            'credits' => $period->credit_units,
            'denominator' => $denominator,
            'confirmed' => round($confirmed, 2),
            'pending' => round($pending, 2),
            'disputed' => round($disputed, 2),
            'overage' => round($overage, 2),
            'remaining' => round($remaining, 2),
            'utilisation' => $util,
            'days_left' => $daysLeft,
            'days_elapsed' => max(0, $daysTotal - $daysLeft),
            'days_total' => $daysTotal,
            'state' => $remaining <= 0 ? 'EXHAUSTED' : ($util >= Catalogue::NEAR_EXHAUSTION_PCT ? 'NEAR_EXHAUSTION' : 'ALLOWANCE_HEALTHY'),
        ];
    }

    /**
     * Log adviser time (D3/D4). Included work locks at exhaustion; extra work needs an
     * authorised overage with remaining authority, otherwise WORK_LOCKED (GATE-RE-09).
     */
    public static function logUsage(Retainer $r, array $data): Usage
    {
        $period = $r->periods()->where('status', 'open')->latest('starts_on')->first();
        if (! $period || ! in_array($r->status, ['active', 'cancelling'], true)) {
            self::fail('units', 'Usage can only be logged against an active Retainer with an open period.');
        }
        $units = round(ceil(((float) $data['units']) * 4) / 4, 2); // 15-minute increments
        $meter = self::meter($r, $period);
        $effect = 'INCLUDED';

        if ($units > $meter['remaining']) {
            $authority = $r->overages()->where('status', 'authorised')->where('expires_at', '>', now())->latest()->first();
            $usedAuthority = (float) $r->usage()->where('billing_effect', 'OVERAGE_APPROVED')->where('created_at', '>=', $authority?->authorised_at ?? now())->sum('units');
            if (! $authority || ($authority->authorised_units - $usedAuthority) < $units) {
                self::log('re.overage.work_locked', "Blocked {$units}h — allowance exhausted and no valid overage authority", $r);
                self::fail('units', 'WORK LOCKED: included allowance is insufficient and there is no valid prior overage authorisation for this work.');
            }
            $effect = 'OVERAGE_APPROVED';
            if (($authority->authorised_units - $usedAuthority - $units) <= 0) {
                $authority->update(['status' => 'cap_reached']);
                self::log('re.overage.cap_reached', 'Overage authority fully used — work lock reinstated', $r);
            }
        }

        $usage = $r->usage()->create([
            'reference' => 'USG-'.now()->format('Y-md').'-'.str_pad((string) (Usage::count() + 1), 3, '0', STR_PAD_LEFT),
            'period_id' => $period->id,
            'occurred_at' => $data['occurred_at'] ?? now(),
            'activity' => $data['activity'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'] ?? 'Strategic Advisory',
            'adviser' => $data['adviser'],
            'units' => $units,
            'billing_effect' => $effect,
            'status' => 'confirmed',
            'evidence_class' => $data['evidence_class'] ?? 'E2',
        ]);
        self::log('re.consumption.client_visible', "{$units}h {$usage->activity} posted to client ledger", $r, null, ['usage' => $usage->reference, 'effect' => $effect]);

        $after = self::meter($r, $period);
        if ($meter['state'] === 'ALLOWANCE_HEALTHY' && $after['state'] !== 'ALLOWANCE_HEALTHY') {
            self::log('re.allowance.near_exhaustion', "Allowance at {$after['utilisation']}%", $r);
        }

        return $usage;
    }

    /* -------------------------------------------------------------- disputes */

    public static function raiseDispute(Usage $u, array $data): Dispute
    {
        if (! in_array($u->status, ['confirmed', 'corrected'], true)) {
            self::fail('usage', 'Only a confirmed ledger line can be disputed.');
        }
        if ($u->disputes()->where('status', 'under_review')->exists()) {
            self::fail('usage', 'This entry already has an open dispute.');
        }

        $dispute = $u->disputes()->create([
            'reference' => Reference::make('DSP'),
            'retainer_id' => $u->retainer_id,
            'reason' => $data['reason'],
            'explanation' => $data['explanation'],
            'outcome' => $data['outcome'],
            'proposed_units' => $data['proposed_units'] ?? null,
            'attachments' => $data['attachments'] ?? null,
            'status' => 'under_review',
        ]);
        $u->update(['status' => 'disputed']);
        self::log('re.consumption.disputed', "Disputed {$u->units}h on {$u->reference} — units isolated, no overage effect", $u->retainer, null, ['dispute' => $dispute->reference]);

        return $dispute;
    }

    public static function resolveDispute(Dispute $d, bool $upheld, ?float $units = null, ?string $note = null): void
    {
        if ($d->status !== 'under_review') {
            self::fail('dispute', 'This dispute has already been decided.');
        }
        $u = $d->usage;

        if (! $upheld) {
            $u->update(['status' => 'confirmed']);
        } elseif ($d->outcome === 'adjust') {
            $new = $units ?? $d->proposed_units ?? $u->units;
            if ($new < 0 || $new > $u->units) {
                self::fail('units', 'The corrected duration must be between 0 and the recorded duration.');
            }
            $u->update(['status' => 'corrected', 'original_units' => $u->units, 'units' => $new]);
        } else {
            $u->update(['status' => 'credited', 'original_units' => $u->units, 'billing_effect' => 'CREDIT']);
        }

        $d->update(['status' => $upheld ? 'upheld' : 'rejected', 'decision_note' => $note, 'decided_at' => now()]);
        self::log('re.dispute.decided', 'Dispute '.($upheld ? 'upheld' : 'rejected')." on {$u->reference}", $d->retainer, null, ['dispute' => $d->reference]);
    }

    /* --------------------------------------------------------------- overage */

    public static function expireOverages(Retainer $r): void
    {
        foreach ($r->overages()->whereIn('status', ['requested', 'authorised'])->where('expires_at', '<', now())->get() as $o) {
            $o->update(['status' => 'expired']);
            self::log('re.overage.expired', "Overage authority {$o->reference} expired — work lock reinstated", $r);
        }
    }

    public static function requestOverage(Retainer $r, array $data): Overage
    {
        $units = (float) collect($data['lines'])->sum('hours');
        $amount = (int) round($units * $r->overage_rate_zar);

        $o = $r->overages()->create([
            'reference' => Reference::make('OVR'),
            'scope' => $data['scope'],
            'lines' => $data['lines'],
            'units' => $units,
            'rate_zar' => $r->overage_rate_zar,
            'max_charge_zar' => $amount + Catalogue::vatOf($amount),
            'status' => 'requested',
            'expires_at' => now()->addDays(Catalogue::OVERAGE_EXPIRY_DAYS),
        ]);
        self::log('re.overage.requested', "Overage requested: {$units}h, max R".number_format($o->max_charge_zar).' incl. VAT', $r);

        return $o;
    }

    /** Prior client authority only (REQUESTED != AUTHORISED; no post-hoc regularisation). */
    public static function decideOverage(Overage $o, string $decision, string $by, ?int $limit, ?string $notes): void
    {
        self::expireOverages($o->retainer);
        $o->refresh();
        if ($o->status !== 'requested') {
            self::fail('decision', "This overage request is {$o->status} and can no longer be decided.");
        }

        if ($decision === 'decline') {
            $o->update(['status' => 'declined', 'authorised_by' => $by, 'notes' => $notes]);
            self::log('re.overage.declined', 'Client declined overage — work stops at allowance boundary', $o->retainer);

            return;
        }

        $units = $o->units;
        $cap = $o->max_charge_zar;
        if ($decision === 'limit') {
            if (! $limit || $limit <= 0) {
                self::fail('limit', 'Enter the maximum amount you are willing to authorise (incl. VAT).');
            }
            $cap = min($limit, $o->max_charge_zar);
            $units = floor(($cap / (1 + Catalogue::VAT_RATE)) / $o->rate_zar * 4) / 4;
            if ($units <= 0) {
                self::fail('limit', 'That limit does not cover a single 15-minute increment.');
            }
        }

        $o->update([
            'status' => 'authorised',
            'authorised_units' => $units,
            'authorised_limit_zar' => $cap,
            'authorised_by' => $by,
            'notes' => $notes,
            'authorised_at' => now(),
        ]);
        self::log('re.overage.authorised', "Prior authority for {$units}h up to R".number_format($cap).' incl. VAT', $o->retainer, null, ['by' => $by]);
    }

    /* ----------------------------------------------------------------- scope */

    public static function requestScopeChange(Retainer $r, array $data, string $raisedBy = 'Client'): ScopeChange
    {
        $sc = $r->scopeChanges()->create([
            'reference' => 'SC-'.now()->format('Y').'-'.str_pad((string) (ScopeChange::count() + 1), 4, '0', STR_PAD_LEFT),
            'change_type' => $data['change_type'],
            'summary' => $data['summary'],
            'description' => $data['description'] ?? null,
            'effective_from' => $data['effective_from'] ?? null,
            'reason' => $data['reason'] ?? null,
            'raised_by' => $raisedBy,
            'risk' => $data['risk'] ?? 'Medium',
            'status' => 'under_review',
            'stage' => 2,
            'impact_hours' => $data['impact_hours'] ?? 0,
            'impact_zar' => (int) round(($data['impact_hours'] ?? 0) * $r->hourlyBasis()),
        ]);
        self::log('re.scope.change.requested', "Scope change {$sc->reference}: {$sc->summary}", $r);

        return $sc;
    }

    public static function decideScopeChange(ScopeChange $sc, string $decision, ?float $hours = null): void
    {
        $allowed = ['under_review' => ['propose', 'approve', 'reject'], 'proposed' => ['approve', 'reject']];
        if (! in_array($decision, $allowed[$sc->status] ?? [], true)) {
            self::fail('decision', "Cannot {$decision} a scope change that is {$sc->status}.");
        }
        $patch = match ($decision) {
            'propose' => ['status' => 'proposed', 'stage' => 4],
            'approve' => ['status' => 'approved', 'stage' => 5],
            default => ['status' => 'rejected', 'stage' => 5],
        };
        if ($hours !== null) {
            $patch['impact_hours'] = $hours;
            $patch['impact_zar'] = (int) round($hours * $sc->retainer->hourlyBasis());
        }
        $sc->update($patch);
        self::log($decision === 'approve' ? 're.scope.change.approved' : 're.scope.change.'.$decision, "Scope change {$sc->reference} {$patch['status']}", $sc->retainer);
    }

    /* ---------------------------------------------------------- substitution */

    public static function createSubstitution(Retainer $r, array $data): Substitution
    {
        $sub = $r->substitutions()->create([
            'reference' => 'SUB-'.now()->format('Y').'-'.str_pad((string) (Substitution::count() + 1), 4, '0', STR_PAD_LEFT),
            'current_adviser' => $r->adviser ?? ['name' => 'Unassigned'],
            'proposed_adviser' => ['name' => $data['proposed_name'], 'title' => $data['proposed_title'] ?? 'Director: Strategy & Advisory'],
            'type' => $data['type'],
            'reason' => $data['reason'],
            'reason_detail' => $data['reason_detail'] ?? null,
            'effective_from' => $data['effective_from'],
            'risk' => $data['type'] === 'Emergency' ? 'High' : ($r->named_person_material ? 'Medium' : 'Low'),
            'status' => 'pending_notice',
        ]);
        self::log('re.substitution.created', "Substitution {$sub->reference} requested", $r);

        return $sub;
    }

    public static function issueSubstitutionNotice(Substitution $sub): void
    {
        if ($sub->status !== 'pending_notice') {
            self::fail('substitution', 'Notice has already been issued for this substitution.');
        }
        $sub->update(['status' => 'awaiting_approval', 'notice_sent_at' => now()]);
        self::log('re.substitution.notice.sent', "Notice sent to {$sub->retainer->client_name} for {$sub->reference}", $sub->retainer);
    }

    public static function respondSubstitution(Substitution $sub, string $response, ?string $note): void
    {
        if (! in_array($sub->status, ['awaiting_approval', 'discuss'], true)) {
            self::fail('response', 'This substitution is not awaiting your decision.');
        }
        $status = ['accept' => 'approved', 'object' => 'client_declined', 'discuss' => 'discuss'][$response];
        $sub->update(['status' => $status, 'client_response' => $response, 'client_note' => $note, 'responded_at' => now()]);

        if ($status === 'approved') {
            $sub->retainer->update(['adviser' => [...$sub->proposed_adviser, 'since' => $sub->effective_from->toDateString()]]);
        }
        self::log('re.substitution.'.$status, "Client {$response} on {$sub->reference}", $sub->retainer);
    }

    /* ---------------------------------------------------- renewal & exit */

    /** GATE-RE-12 hold reasons for the next period. */
    public static function renewalHolds(Retainer $r, ?float $allowance = null, ?int $fee = null): array
    {
        $holds = [];
        $allowance ??= $r->allowance_qty;
        $fee ??= $r->monthly_fee_zar;
        $service = $r->service;

        if ($r->named_person_material && $r->substitutions()->whereIn('status', ['pending_notice', 'awaiting_approval', 'discuss'])->exists()) {
            $holds[] = 'Unresolved material named-adviser substitution — renewal on hold until you decide.';
        }
        $floor = self::floorFor($r, $allowance);
        if ($fee < $floor) {
            $holds[] = 'Next-period price is below the approved floor (GATE-RE-02).';
        }
        if ($service->pool && $allowance > $r->allowance_qty) {
            $h = self::headroom($service->pool, $r->id);
            if ($h['headroom'] < $allowance) {
                $holds[] = 'Insufficient capacity headroom for the requested allowance.';
            }
        }

        return $holds;
    }

    public static function decideRenewal(Retainer $r, string $choice, ?float $allowance, ?string $pauseFrom, ?string $resumeFrom): void
    {
        if ($r->status !== 'active') {
            self::fail('choice', "A {$r->status} Retainer cannot be renewed or resized.");
        }
        $period = $r->currentPeriod();
        $next = $period?->ends_on->copy()->addDay() ?? today();
        $fee = $r->monthly_fee_zar;

        if ($choice === 'resize') {
            if (! $allowance || $allowance <= 0) {
                self::fail('allowance', 'Choose the new allowance.');
            }
            $fee = (int) round($r->hourlyBasis() * $allowance);
        }

        if ($choice !== 'pause') {
            $holds = self::renewalHolds($r, $choice === 'resize' ? $allowance : null, $fee);
            if ($holds) {
                self::log('re.renewal.capacity_failed', 'Renewal held: '.implode(' ', $holds), $r);
                self::fail('choice', implode(' ', $holds));
            }
        }

        $r->update(['renewal' => [
            'choice' => $choice,
            'allowance' => $choice === 'resize' ? $allowance : $r->allowance_qty,
            'fee' => $fee,
            'effective' => $choice === 'pause' ? ($pauseFrom ?: $next->toDateString()) : $next->toDateString(),
            'resume' => $resumeFrom,
            'decided_at' => now()->toDateTimeString(),
        ]]);
        self::log('re.renewal.started', ucfirst($choice).' confirmed for next period', $r, null, $r->renewal);
    }

    /** GATE-RE-16: direct digital exit, no Sales approval prerequisite; effective at period end. */
    public static function cancel(Retainer $r, ?string $reason, ?string $comments): void
    {
        if (! in_array($r->status, ['active', 'paused'], true)) {
            self::fail('confirm', "A {$r->status} Retainer cannot be cancelled again.");
        }
        $period = $r->currentPeriod();
        $effective = $period?->ends_on ?? today();
        $r->update([
            'status' => 'cancelling',
            'cancel_effective' => $effective,
            'cancellation' => ['reason' => $reason, 'comments' => $comments, 'requested_at' => now()->toDateTimeString()],
        ]);
        self::log('re.exit.requested', 'Cancellation requested — effective '.$effective->format('d M Y'), $r);
    }

    /** Utilisation review choice (GATE-RE-10). Each decision is appended and never edited. */
    public static function recordUtilisationChoice(Retainer $r, ?User $user, string $choice, ?float $allowance): UtilisationDecision
    {
        $offered = ['continue', 'right_size', 'pause', 'cancel'];
        $period = $r->currentPeriod();
        $decision = $r->decisions()->create([
            'user_id' => $user?->id,
            'choice' => $choice,
            'offered' => $offered,
            'effective_date' => $period?->ends_on->copy()->addDay(),
            'requested_allowance' => $allowance,
        ]);
        self::log('re.utilisation.choice.recorded', 'Client chose '.str_replace('_', '-', $choice), $r);

        match ($choice) {
            'right_size' => self::requestScopeChange($r, ['change_type' => 'Adjust Allowance', 'summary' => 'Right-size allowance to '.($allowance ?: $r->allowance_qty).' hours / month', 'impact_hours' => ($allowance ?: $r->allowance_qty) - $r->allowance_qty, 'risk' => 'Low', 'effective_from' => $period?->ends_on->copy()->addDay()]),
            'pause' => $r->update(['renewal' => ['choice' => 'pause', 'allowance' => $r->allowance_qty, 'fee' => $r->monthly_fee_zar, 'effective' => $period?->ends_on->copy()->addDay()->toDateString(), 'decided_at' => now()->toDateTimeString()]]),
            'cancel' => self::cancel($r, 'Utilisation review', null),
            default => null,
        };

        $r->alerts()->whereIn('status', ['new', 'in_progress', 'monitoring', 'escalated'])->update(['status' => 'resolved']);

        return $decision;
    }

    /* ------------------------------------------------------- under-use */

    public static function threshold(int $daysElapsed): int
    {
        foreach (Catalogue::UNDER_USE_PROFILE as $band) {
            if ($daysElapsed >= $band['from'] && $daysElapsed <= $band['to']) {
                return $band['threshold'];
            }
        }

        return 80;
    }

    /** Run the approved profile; creates an immutable alert when fired (never suppressed). */
    public static function detectUnderUse(Retainer $r): ?Alert
    {
        if ($r->status !== 'active') {
            return null;
        }
        $m = self::meter($r);
        if (! $m['period']) {
            return null;
        }
        $threshold = self::threshold($m['days_elapsed']);
        if ($m['utilisation'] >= $threshold) {
            return null;
        }
        $level = $m['utilisation'] < 50 ? 'at_risk' : ($m['utilisation'] < 75 ? 'moderate' : 'low');
        $open = $r->alerts()->where('status', '!=', 'resolved')->first();
        if ($open) {
            $open->update(['utilisation_pct' => $m['utilisation'], 'level' => $level, 'days_elapsed' => $m['days_elapsed']]);

            return $open;
        }

        $alert = $r->alerts()->create(['level' => $level, 'utilisation_pct' => $m['utilisation'], 'days_elapsed' => $m['days_elapsed'], 'status' => 'new', 'last_activity' => $r->usage()->max('occurred_at')]);
        self::log('re.underuse.triggered', "Under-use profile fired at {$m['utilisation']}% (threshold {$threshold}%)", $r);

        return $alert;
    }

    public static function updateAlert(Alert $a, string $action): void
    {
        if ($action === 'suppress') {
            self::log('re.underuse.suppression_attempt', 'Suppression attempt denied — alert restored, P0 incident opened', $a->retainer);
            self::log('re.incident.opened', 'P0: commercial suppression of under-use alert attempted', $a->retainer, null, ['severity' => 'P0']);
            self::fail('alert', 'Under-use alerts cannot be suppressed for commercial reasons. A P0 governance incident has been logged.');
        }
        if ($action === 'notice') {
            $a->update(['status' => 'in_progress', 'notice_sent_at' => now()]);
            self::log('re.underuse.notice.sent', 'Neutral utilisation review sent with four equal options', $a->retainer);

            return;
        }
        $a->update(['status' => $action]);
        self::log('re.underuse.status', "Alert marked {$action}", $a->retainer);
    }

    /* ----------------------------------------------------- reconciliation */

    /** Period-close blockers (GATE-RE-08). */
    public static function closeBlockers(Period $p): array
    {
        $b = [];
        if ($p->status !== 'open') {
            $b[] = 'Period already closed.';
        }
        if (Dispute::where('retainer_id', $p->retainer_id)->where('status', 'under_review')->whereIn('usage_id', $p->usage()->pluck('id'))->exists()) {
            $b[] = 'Open material usage dispute in this period.';
        }
        if ($p->usage()->where('status', 'pending')->exists()) {
            $b[] = 'Unreconciled pending usage lines.';
        }

        return $b;
    }

    /** Close the period: evaluate utilisation, compute capped carry, expire old carry, open next period. */
    public static function reconcile(Period $p): void
    {
        if ($blockers = self::closeBlockers($p)) {
            self::fail('period', 'Close blocked: '.implode(' ', $blockers));
        }
        $r = $p->retainer;
        self::log('re.period.reconciliation.started', 'Reconciliation started for '.$p->ends_on->format('M Y'), $r);

        DB::transaction(function () use ($p, $r) {
            self::detectUnderUse($r);
            $m = self::meter($r, $p);

            // Consumption draws valid carry first; carried units are never re-carried.
            $baseUsed = max(0, $m['confirmed'] - $p->carry_units);
            $baseUnused = max(0, $p->opening_units + $p->credit_units - $baseUsed);
            $cap = round($p->opening_units * $r->rollover_cap_pct / 100, 2);
            $carryOut = $r->service->unused_rule === 'CAPPED_ROLL_FORWARD' ? min($baseUnused, $cap) : 0;

            foreach ($r->rollovers()->where('status', 'open')->get() as $old) {
                $old->update(['status' => $m['confirmed'] >= $p->carry_units ? 'used' : 'expired']);
                self::log('re.rollover.expired', "Carry of {$old->units}h closed (no second-generation carry)", $r);
            }

            $p->update(['status' => 'closed', 'utilisation_evaluated' => true, 'carry_out_units' => $carryOut, 'closed_at' => now()]);
            self::log('re.period.closed', 'Period closed: '.$m['confirmed'].'h used, '.$carryOut.'h carried', $r);

            $nextStart = $p->ends_on->copy()->addDay();
            if ($carryOut > 0) {
                $r->rollovers()->create([
                    'source_period_id' => $p->id,
                    'period_ended' => $p->ends_on,
                    'units' => $carryOut,
                    'cost_per_unit_zar' => (int) round($r->period_cost_zar / max(1, $r->allowance_qty)),
                    'rollover_pct' => (int) round($carryOut / max(1, $p->opening_units) * 100),
                    'note' => 'Standard rollover',
                    'expires_on' => $nextStart->copy()->addMonth()->subDay(),
                    'status' => 'open',
                ]);
                self::log('re.rollover.created', "Carried {$carryOut}h into next period (cap {$cap}h)", $r);
            }

            $renewal = $r->renewal ?? [];
            if ($r->status === 'cancelling' && $r->cancel_effective && $r->cancel_effective->lte($p->ends_on)) {
                $r->update(['status' => 'ended']);
                $r->rollovers()->where('status', 'open')->update(['status' => 'expired']);
                self::log('re.exit.settled', 'Retainer ended at period end; unused allowance expired', $r);

                return;
            }
            if (($renewal['choice'] ?? null) === 'pause') {
                $r->update(['status' => 'paused']);
                self::log('re.retainer.paused', 'Retainer paused — standing availability suspended', $r);

                return;
            }
            if (($renewal['choice'] ?? null) === 'resize') {
                $r->update(['allowance_qty' => $renewal['allowance'], 'monthly_fee_zar' => $renewal['fee']]);
            }
            if ($renewal) {
                $r->update(['renewal' => null]);
            }
            self::openPeriod($r->fresh(), $nextStart, $carryOut);
        });
    }

    /* ---------------------------------------------------------- scenarios */

    public static function grade(float $utilPct): array
    {
        return match (true) {
            $utilPct < 30 => ['C1', 'Ample', 'Significant headroom'],
            $utilPct < 60 => ['C2', 'Comfortable', 'Plenty of headroom'],
            $utilPct <= 90 => ['C3', 'Adequate', 'Healthy, monitor peaks'],
            $utilPct <= 100 => ['C4', 'Tight', 'Little headroom'],
            default => ['C5', 'Insufficient', 'Demand exceeds allowance'],
        };
    }

    /** Average confirmed monthly use over the last three periods (forecast basis). */
    public static function forecastUsage(Retainer $r): float
    {
        $periods = $r->periods()->latest('starts_on')->limit(3)->get();
        if ($periods->isEmpty()) {
            return 0;
        }

        return round($periods->avg(fn (Period $p) => self::meter($r, $p)['confirmed']), 1);
    }

    public static function runScenario(Retainer $r, array $data, string $by): Scenario
    {
        $allowance = (float) $data['allowance'];
        $fee = (int) $data['fee'];
        $forecast = self::forecastUsage($r);
        $other = 0.0; // cross-vehicle demand on this client's allowance (none recorded)
        $service = $r->service;
        $floor = self::floorFor($r, $allowance);
        $h = $service->pool ? self::headroom($service->pool, $r->id) : ['headroom' => 0, 'stale' => true];
        // Headroom excludes this retainer's own commitment, so the whole proposed allowance must fit.
        $fits = ! $h['stale'] && $h['headroom'] >= $allowance;
        $util = $allowance > 0 ? round($forecast / $allowance * 100, 1) : 0;
        [$code, $label, $hint] = self::grade($util);

        $result = ! $fits ? 'capacity_hold' : ($fee < $floor ? 'below_floor' : 'capacity_available');

        $scenario = $r->scenarios()->create([
            'name' => $data['name'] ?: ($allowance > $r->allowance_qty ? "Increase to {$allowance}h" : "Reduce to {$allowance}h"),
            'type' => $data['type'],
            'allowance_qty' => $allowance,
            'monthly_fee_zar' => $fee,
            'starts_on' => $data['starts_on'],
            'result' => $result,
            'classification' => $code,
            'detail' => ['forecast' => $forecast, 'available' => round($allowance - $forecast - $other, 1), 'utilisation' => $util, 'label' => $label, 'hint' => $hint, 'floor' => $floor, 'headroom' => $h['headroom'], 'other' => $other],
            'run_by' => $by,
        ]);
        self::log('re.capacity_test.scenario', "Scenario {$scenario->name}: {$result}", $r);

        return $scenario;
    }

    /* -------------------------------------------------------- commitments */

    public static function addCommitment(Retainer $r, array $data): Commitment
    {
        $committed = (float) $r->commitments()->whereIn('status', ['confirmed', 'tentative', 'on_hold'])->sum('hours');
        $available = $r->allowance_qty - $committed;
        if ($data['hours'] > $available) {
            self::fail('hours', 'Commitments cannot exceed available allowance ('.round($available, 1).'h uncommitted).');
        }
        $c = $r->commitments()->create([
            'reference' => 'COM-'.now()->format('Y').'-'.str_pad((string) (Commitment::count() + 1), 4, '0', STR_PAD_LEFT),
            'type' => $data['type'],
            'description' => $data['description'],
            'owner' => $data['owner'],
            'committed_on' => today(),
            'starts_on' => $data['starts_on'],
            'ends_on' => $data['ends_on'],
            'hours' => $data['hours'],
            'status' => $data['status'] ?? 'tentative',
        ]);
        self::log('re.commitment.created', "Commitment {$c->reference} ({$c->hours}h) {$c->status}", $r);

        return $c;
    }

    public static function setCommitmentStatus(Commitment $c, string $status): void
    {
        $allowed = ['tentative' => ['confirmed', 'on_hold', 'released'], 'on_hold' => ['confirmed', 'tentative', 'released'], 'confirmed' => ['released']];
        if (! in_array($status, $allowed[$c->status] ?? [], true)) {
            self::fail('status', "A {$c->status} commitment cannot move to {$status}.");
        }
        $c->update(['status' => $status]);
        self::log('re.commitment.'.$status, "Commitment {$c->reference} {$status}", $c->retainer);
    }

    /* --------------------------------------------------------- allocation */

    /** @param list<array{id?: int, adviser: string, role: string, allocation_pct: int, workload_pct: int, is_primary: bool, available: bool}> $rows */
    public static function saveAllocation(Retainer $r, array $rows): void
    {
        $errors = [];
        if (array_sum(array_column($rows, 'allocation_pct')) !== 100) {
            $errors[] = 'Total allocation must equal 100%.';
        }
        if (count(array_filter($rows, fn ($x) => $x['is_primary'])) !== 1) {
            $errors[] = 'Exactly one primary owner is required.';
        }
        if (count(array_filter($rows, fn ($x) => $x['available'])) < 2) {
            $errors[] = 'At least 2 advisors must be available.';
        }
        if (count(array_filter($rows, fn ($x) => $x['workload_pct'] > 100)) > 0) {
            $errors[] = 'No advisor may exceed 100% workload.';
        }
        if ($errors) {
            self::fail('allocations', implode(' ', $errors));
        }

        DB::transaction(function () use ($r, $rows) {
            $keep = [];
            foreach ($rows as $row) {
                $model = isset($row['id']) ? $r->allocations()->find($row['id']) : null;
                $payload = collect($row)->only(['adviser', 'role', 'allocation_pct', 'workload_pct', 'is_primary', 'available'])->all();
                $model ? $model->update($payload) : $model = $r->allocations()->create($payload);
                $keep[] = $model->id;
            }
            $r->allocations()->whereNotIn('id', $keep)->delete();
        });

        $primary = collect($rows)->firstWhere('is_primary', true);
        $owner = $r->account_owner ?? [];
        if ($primary && ($owner['name'] ?? null) !== $primary['adviser']) {
            self::log('re.owner.handover', "Account ownership {$owner['name']} → {$primary['adviser']}", $r, null, ['from' => $owner['name'] ?? null, 'to' => $primary['adviser'], 'reason' => 'Allocation change']);
            $r->update(['account_owner' => [...$owner, 'name' => $primary['adviser'], 'since' => today()->toDateString()]]);
        }
        self::log('re.allocation.confirmed', 'Allocation confirmed ('.count($rows).' advisors)', $r);
    }

    /* ------------------------------------------------------------- floor */

    public static function remediate(Retainer $r, string $disposition): void
    {
        $service = $r->service;
        $floor = self::floorFor($r);
        if (! self::floorStatus($r->monthly_fee_zar, $floor)['blocked'] && $disposition !== 'RE-D4') {
            self::fail('disposition', 'This Retainer already meets its floor.');
        }

        match ($disposition) {
            'RE-D1' => $r->update(['monthly_fee_zar' => $floor, 'floor_disposition' => 'RE-D1 Reprice']),
            'RE-D2' => $r->update(['allowance_qty' => max(1, floor($r->monthly_fee_zar / max(1, $floor / max(1, $r->allowance_qty)))), 'floor_disposition' => 'RE-D2 Redesign capacity']),
            'RE-D3' => $r->update(['floor_disposition' => 'RE-D3 Reclassify vehicle']),
            default => $r->update(['floor_disposition' => 'RE-D4 Retire', 'status' => $r->status === 'active' ? 'cancelling' : $r->status, 'cancel_effective' => $r->currentPeriod()?->ends_on]),
        };
        self::log('re.floor.remediated', "Below-floor disposition {$disposition}", $r);
    }
}
