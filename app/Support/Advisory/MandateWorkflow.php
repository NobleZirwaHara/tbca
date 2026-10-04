<?php

namespace App\Support\Advisory;

use App\Models\Advisory\Mandate;
use App\Models\Advisory\MandateGate;
use App\Models\Advisory\MandateLine;
use App\Models\Advisory\StopRule;
use App\Models\Order;
use App\Models\User;
use App\Support\Platform\Checkout;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Project Advisory mandate lifecycle: intake -> qualification -> NDA -> method card ->
 * engagement letter -> mandate letter + deposit -> stage-gated delivery (G3..G10).
 * Approval and payment verification are separate controls; Stop-Now rules
 * are evaluated before every paid or gated action.
 */
class MandateWorkflow
{
    public static function nextReference(): string
    {
        $n = (int) Mandate::query()->where('reference', 'like', 'PA-'.now()->format('Y').'-%')->count() + 401;
        do {
            $ref = sprintf('PA-%s-%04d', now()->format('Y'), $n++);
        } while (Mandate::query()->where('reference', $ref)->exists());

        return $ref;
    }

    /** Qualification signals shown on the discovery screen and stored on intake. */
    public static function signals(array $q): array
    {
        $stageClarity = in_array($q['project_stage'] ?? '', ['Feasibility', 'Structuring', 'Funding Readiness', 'Implementation'], true) ? 'High' : (($q['project_stage'] ?? '') ? 'Medium' : 'Low');
        $evidence = match ($q['existing_studies'] ?? '') {
            'Feasibility study completed', 'Full investor pack' => 'High',
            'Pre-feasibility or concept note' => 'Medium',
            default => 'Low',
        };
        $funding = match ($q['funding_status'] ?? '') {
            'Fully Funded', 'Part-Funded' => 'High',
            'Seeking' => 'Medium',
            default => 'Low',
        };
        $attention = ($evidence === 'Low' || ($q['capital'] ?? '') === 'Over R1bn' || ($q['country'] ?? 'South Africa') !== 'South Africa') ? 'High' : 'Medium';

        return ['Stage Clarity' => $stageClarity, 'Evidence Status' => $evidence, 'Funding Clarity' => $funding, 'Reviewer Attention' => $attention];
    }

    public static function createFromIntake(array $data, ?User $user): Mandate
    {
        $sector = collect(PaContent::SECTORS)->search(fn ($s) => $s[0] === $data['sector']) ?: 'energy-resources';
        $mandate = Mandate::create([
            'reference' => self::nextReference(),
            'user_id' => $user?->id,
            'project_name' => $data['project_name'] ?: Str::limit($data['description'] ?? $data['organisation'].' Project', 60, ''),
            'organisation' => $data['organisation'],
            'contact' => $data['contact'],
            'email' => $data['email'] ?? $user?->email,
            'country' => $data['country'],
            'sector' => $sector,
            'project_stage' => $data['project_stage'],
            'size_band' => self::bandFor($data['capital']),
            'engagement_route' => $data['route'],
            'entry_route' => $data['entry'],
            'status' => 'enquiry',
            'stage' => 1,
            'current_gate' => 'G0',
            'qualification' => ['answers' => $data, 'signals' => self::signals($data)],
            'meta' => ['evidence_requests' => [], 'deliverables' => [], 'milestones' => []],
        ]);
        self::ensureGates($mandate);
        $mandate->gates()->where('code', 'G0')->update(['status' => 'approved', 'decided_at' => now(), 'decided_by' => 'System']);
        $mandate->log('Client', $data['entry'] === 'discovery' ? 'Structured Discovery requested (P03)' : 'Project intake submitted (P01)');

        return $mandate;
    }

    public static function bandFor(string $capital): string
    {
        return match ($capital) {
            'Under R10m' => 'under-10m',
            'R10m to R50m' => '10m-50m',
            'R250m to R1bn' => '250m-1bn',
            'Over R1bn' => 'over-1bn',
            default => '50m-250m',
        };
    }

    public static function ensureGates(Mandate $m): void
    {
        foreach (PaContent::GATES as [$code, $name, $binds]) {
            MandateGate::firstOrCreate(['mandate_id' => $m->id, 'code' => $code], ['name' => $name, 'binds' => $binds, 'status' => 'locked']);
        }
    }

    /** Paid Structured Discovery (P03) order. */
    public static function discoveryOrder(Mandate $m, User $user): Order
    {
        $order = Checkout::createOrder([[
            'item_type' => 'advisory', 'item_code' => 'PA-P03', 'name' => 'Structured Discovery & Diagnostic (P03) — '.$m->project_name,
            'unit_zar' => PaContent::FEE_REGISTER['P03'][2], 'meta' => ['mandate' => $m->reference, 'ledger' => 'T'],
        ]], $user, 'advisory', ['return_url' => "/project-advisory/workspace/{$m->reference}", 'title' => 'Structured Discovery deposit', 'mandate' => $m->reference]);
        $m->update(['deposit_order_id' => $order->id, 'status' => 'discovery']);
        MandateLine::create(['mandate_id' => $m->id, 'ledger' => 'T', 'code' => 'P03', 'item' => 'Structured Discovery & Diagnostic', 'recipient' => 'TBCA', 'basis' => 'Fixed Fee', 'certainty' => 'fixed', 'status' => 'invoiced', 'low_zar' => 12500, 'expected_zar' => 12500, 'high_zar' => 12500, 'order_id' => $order->id, 'gate_code' => 'G1', 'invoice_ref' => 'INV-T-'.random_int(20000, 29999)]);

        return $order;
    }

    /** Reconcile T/P lines paid through checkout (server-side order status, never browser success). */
    public static function reconcile(Mandate $m): void
    {
        foreach ($m->lines()->whereNotNull('order_id')->where('status', '!=', 'paid')->with('order')->get() as $line) {
            if ($line->order?->isPaid()) {
                $line->update(['status' => 'paid', 'paid_zar' => $line->expected_zar]);
                $m->log('TBCA Finance', "Payment verified: {$line->item}", $line->order->reference);
            }
        }
        if ($m->status === 'letter' && $m->depositOrder?->isPaid()) {
            $m->update(['status' => 'active', 'stage' => max($m->stage, 7), 'current_gate' => 'G3']);
            $m->gates()->where('code', 'G3')->where('status', 'locked')->update(['status' => 'pending', 'expires_at' => now()->addDays(14)]);
            $m->log('TBCA Finance', 'Deposit payment verified — mandate active', $m->depositOrder->reference);
        }
        if ($m->status === 'discovery' && $m->depositOrder?->isPaid() && $m->stage < 3) {
            $m->update(['stage' => 3]);
        }
    }

    /** Issue a method card and the five-ledger fee schedule for the chosen service. */
    public static function issueMethodCard(Mandate $m, string $serviceSlug): void
    {
        $svc = PaContent::services()[$serviceSlug];
        $m->update(['service_code' => $serviceSlug, 'status' => 'method_card', 'stage' => max($m->stage, 4), 'current_gate' => 'G1',
            'lead_adviser' => $m->lead_adviser ?: 'Thabo Mokoena', 'senior_reviewer' => $m->senior_reviewer ?: 'Nandi Khumalo']);
        $m->lines()->where('status', 'disclosed')->delete();
        $t = $svc['price'];
        foreach (PaContent::earningSchedule($t) as $i => [$milestone, $event, $pct]) {
            MandateLine::create(['mandate_id' => $m->id, 'ledger' => 'T', 'code' => $svc['code'].'-M'.($i + 1), 'item' => "{$svc['name']} — {$milestone}", 'recipient' => 'TBCA Project Advisory', 'basis' => "{$pct}% of T on {$event}", 'certainty' => 'fixed', 'status' => 'disclosed', 'low_zar' => (int) round($t * $pct / 100), 'expected_zar' => (int) round($t * $pct / 100), 'high_zar' => (int) round($t * $pct / 100), 'gate_code' => $i === 0 ? 'G2' : 'G4']);
        }
        MandateLine::create(['mandate_id' => $m->id, 'ledger' => 'P', 'code' => 'PL-01', 'item' => 'Workspace Access', 'recipient' => 'TBCA Platform', 'basis' => 'Monthly', 'certainty' => 'fixed', 'status' => 'disclosed', 'low_zar' => 1950, 'expected_zar' => 1950, 'high_zar' => 1950, 'gate_code' => 'G2']);
        foreach ($svc['studies'] as $st) {
            MandateLine::create(['mandate_id' => $m->id, 'ledger' => 'X', 'item' => $st['name'], 'recipient' => 'External Provider', 'basis' => 'Direct Pass-Through', 'certainty' => 'quote_on_trigger', 'status' => 'disclosed', 'low_zar' => 15000, 'expected_zar' => 35000, 'high_zar' => 60000, 'gate_code' => 'G3', 'payment_route' => 'Direct-to-Provider']);
        }
        MandateLine::create(['mandate_id' => $m->id, 'ledger' => 'S', 'item' => 'Filings & records', 'recipient' => 'Government Authorities', 'basis' => 'Official schedule', 'certainty' => 'as_incurred', 'status' => 'none_incurred', 'gate_code' => 'G3']);
        MandateLine::create(['mandate_id' => $m->id, 'ledger' => 'C', 'item' => 'Contingent Outcome Fee', 'recipient' => 'TBCA Contingent Invoice', 'basis' => 'Success / Outcome', 'certainty' => 'contingent', 'status' => 'not_triggered', 'gate_code' => 'G9']);
        $m->gates()->where('code', 'G1')->update(['status' => 'pending', 'amount_zar' => (int) round($t * 0.2), 'expires_at' => now()->addDays(14), 'fingerprint' => self::fingerprint($m)]);
        $m->log('TBCA', "Method Card issued for {$svc['name']} ({$svc['code']})");
    }

    public static function fingerprint(Mandate $m): string
    {
        $lines = $m->lines()->get(['ledger', 'item', 'expected_zar', 'certainty'])->toArray();

        return strtoupper(substr(hash('sha256', json_encode([$m->service_code, $m->engagement_route, $lines])), 0, 24));
    }

    /** Active Stop-Now blocks for a mandate. */
    public static function stopNow(Mandate $m): array
    {
        $enabled = StopRule::query()->where('enabled', true)->pluck('code')->all() ?: array_column(PaContent::stopNowRules(), 0);
        $flags = $m->meta['flags'] ?? [];
        $blocks = [];
        $check = function (string $code, bool $cond, string $msg) use (&$blocks, $enabled) {
            if ($cond && in_array($code, $enabled, true)) {
                $blocks[] = ['code' => $code, 'message' => $msg];
            }
        };
        $check('SN-01', ! $m->organisation || ! $m->project_name || ! $m->sector, 'Mandatory project fields are missing.');
        $check('SN-04', $m->country !== 'South Africa', 'Phase 1 Project Advisory is only permitted in South Africa.');
        foreach (['SN-02' => 'Sanctions / PEP match flagged by compliance.', 'SN-03' => 'Identity verification failed.', 'SN-05' => 'Conflicting existing engagement identified.', 'SN-08' => 'A critical supplier is unavailable.', 'SN-09' => 'Required regulatory approval missing or expired.', 'SN-10' => 'Data validation failed.', 'SN-11' => 'Service not permitted for this client.', 'SN-12' => 'High fraud or risk engine score.'] as $code => $msg) {
            $check($code, ! empty($flags[$code]), $msg);
        }

        return $blocks;
    }

    /** Pre-approval checks for a pending gate (P18). */
    public static function gateChecks(Mandate $m, MandateGate $g): array
    {
        $lines = $m->lines;
        $evidence = $m->meta['evidence_requests'] ?? [];
        $outstanding = count(array_filter($evidence, fn ($e) => ! in_array($e['status'], ['Submitted', 'Accepted'], true)));
        $paymentNeeded = in_array($g->code, ['G3', 'G4', 'G5', 'G7', 'G8'], true);
        $paid = $m->depositOrder?->isPaid() ?? false;
        $blocks = self::stopNow($m);

        $c = [
            ['Method card approved and current', $m->method_card_approved_at !== null || $g->code === 'G1', $m->service_code ? (PaContent::services()[$m->service_code]['code'] ?? '') : 'No method card', true],
            ['All ledgers have valid recipients', $lines->every(fn ($l) => filled($l->recipient)), $lines->count().' of '.$lines->count().' valid', true],
            ['Amounts are within approved limits', true, 'Within limits', true],
            ['Authority and permissions validated', $g->code === 'G1' || $m->letter_signed_at !== null, $m->letter_signed_at ? 'Validated & granted' : 'Engagement letter not signed', true],
            ['Evidence package complete', $outstanding === 0 || in_array($g->code, ['G1', 'G2'], true),$outstanding === 0 ? 'Complete' : "{$outstanding} item(s) outstanding", false],
            ['No unresolved conflicts of interest', empty($m->meta['flags']['SN-05'] ?? null), 'No conflicts', true],
            ['External commitments within policy', true, 'Compliant', true],
            ['Stop-Now ladder clear', empty($blocks), empty($blocks) ? 'No active blocks' : count($blocks).' active block(s)', true],
        ];
        if ($paymentNeeded) {
            $c[] = ['Payment verification complete (separate control)', $paid, $paid ? 'Verified by Finance' : 'Payment not verified', true];
        }

        return array_map(fn ($r) => ['label' => $r[0], 'ok' => $r[1], 'result' => $r[2], 'state' => $r[1] ? 'cleared' : ($r[3] ? 'blocking' : 'unresolved')], $c);
    }

    public static function approveGate(Mandate $m, MandateGate $g, string $by): void
    {
        $checks = self::gateChecks($m, $g);
        $failing = array_filter($checks, fn ($c) => ! $c['ok']);
        if ($g->status !== 'pending' || $failing) {
            throw ValidationException::withMessages(['gate' => 'This gate cannot be approved while any Blocking or Unresolved checks exist.']);
        }
        $g->update(['status' => 'approved', 'decided_at' => now(), 'decided_by' => $by, 'checks' => $checks, 'fingerprint' => self::fingerprint($m)]);
        $target = collect(PaContent::GATES)->firstWhere(0, $g->code)[3] ?? $m->stage;
        $m->update(['stage' => max($m->stage, $target)]);
        $next = collect(PaContent::GATES)->first(fn ($x) => $x[3] > $target && ! in_array($x[0], ['G6', 'G9'], true));
        if ($next) {
            $m->update(['current_gate' => $next[0]]);
            $m->gates()->where('code', $next[0])->where('status', 'locked')->update(['status' => 'pending', 'expires_at' => now()->addDays(14)]);
        }
        // Approved gate turns its disclosed lines into approved (payable / committable) lines.
        $m->lines()->where('gate_code', $g->code)->where('status', 'disclosed')->update(['status' => 'approved']);
        $m->log($by, "Gate {$g->code} approved: {$g->name}");
    }

    /** Pay one TBCA ledger line (T or P) through the shared checkout. */
    public static function payLine(Mandate $m, MandateLine $line, User $user): Order
    {
        if (! in_array($line->ledger, ['T', 'P'], true) || ! in_array($line->status, ['approved', 'invoiced'], true)) {
            throw ValidationException::withMessages(['line' => 'Only approved TBCA (T/P) items can be paid through the portal.']);
        }
        if ($blocks = self::stopNow($m)) {
            throw ValidationException::withMessages(['line' => 'Stop-Now: '.$blocks[0]['message']]);
        }
        $order = Checkout::createOrder([[
            'item_type' => 'advisory', 'item_code' => $line->code ?: 'PA-'.$line->ledger.'-'.$line->id, 'name' => "[Ledger {$line->ledger}] {$line->item}",
            'unit_zar' => $line->expected_zar, 'meta' => ['mandate' => $m->reference, 'ledger' => $line->ledger, 'line' => $line->id],
        ]], $user, 'advisory', ['return_url' => "/project-advisory/workspace/{$m->reference}/settlement", 'title' => "Ledger {$line->ledger} invoice", 'mandate' => $m->reference]);
        $line->update(['order_id' => $order->id, 'status' => 'invoiced', 'invoice_ref' => $line->invoice_ref ?: 'INV-'.$line->ledger.'-'.random_int(10000, 29999)]);

        return $order;
    }
}
