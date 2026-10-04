<?php

namespace App\Support\Advisory;

use App\Models\Advisory\TechEngagement;
use App\Models\Advisory\TechGate;
use App\Models\Order;
use App\Models\User;
use App\Support\Platform\Checkout;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * Technology Solutions commercial state machine:
 * DISCLOSED -> APPROVAL_REQUESTED -> APPROVED_NOT_PAID -> PAYMENT_VERIFIED -> IN_DELIVERY -> QA_REVIEW -> ACCEPTED,
 * with X_FUNDING_PENDING -> X_FUNDED for supplier commitments. Entitlement only follows a
 * server-side paid order (never browser success). Approval is current-gate only.
 */
class TechWorkflow
{
    public static function nextReference(): string
    {
        $n = 1043 + TechEngagement::query()->count();
        while (TechEngagement::query()->where('reference', "ENG-TS-{$n}")->exists()) {
            $n++;
        }

        return "ENG-TS-{$n}";
    }

    public static function create(array $journey, User $user, string $signer): TechEngagement
    {
        $config = $journey['config'] ?? TechContent::defaultConfig();
        $lines = TechContent::feeLines($config);
        $towerCode = $journey['tower'] ?? 'TS-1';
        $e = TechEngagement::create([
            'reference' => self::nextReference(),
            'user_id' => $user->id,
            'tower' => $towerCode,
            'organisation' => $journey['context']['legal_name'] ?? ($user->company ?: $user->name),
            'owner' => 'Thabo Mokoena',
            'status' => 'approval_requested',
            'stage' => 6,
            'current_gate' => 1,
            'letter_signed_at' => now(),
            'signer_name' => $signer,
            'payment_plan' => $journey['payment_plan'] ?? 'deposit_milestones',
            'context' => $journey['context'] ?? [],
            'diagnostic' => $journey['diagnostic'] ?? null,
            'config' => $config,
            'fee_lines' => $lines,
            'timeline' => [],
        ]);
        self::bootstrap($e);
        $e->addTimeline('Engagement letter signed (EL-TS v1.2)', $signer);

        return $e;
    }

    /** Default gates, tasks, meters, UAT plan, subscription and exit plan for a new engagement. */
    public static function bootstrap(TechEngagement $e): void
    {
        $totals = TechContent::ledgerTotals($e->fee_lines ?? []);
        foreach (TechContent::gatePlan($totals) as [$n, $name, $assent, $t, $xl, $xh]) {
            TechGate::updateOrCreate(['engagement_id' => $e->id, 'number' => $n], [
                'name' => $name, 'assent' => $assent, 't_amount_zar' => $t, 'x_low_zar' => $xl, 'x_high_zar' => $xh,
                'status' => $n === 1 ? 'presented' : 'locked', 'expires_at' => now()->addDays(14),
                'fingerprint' => sprintf('TS%s-%s-%04d', substr($e->tower, 3), strtoupper(substr(md5($e->reference.$n), 0, 3)), $n * 107),
            ]);
        }
        if ($e->tasks()->count() === 0) {
            foreach ([
                ['client', 'Confirm user access list', 'Client IT Admin', 10, 'due_soon', 'Required before sandbox setup', 'Signed access matrix', 'high'],
                ['client', 'Upload final process maps', 'Client Operations Lead', 7, 'in_progress', null, 'Process map pack PDF', 'medium'],
                ['tbca', 'Prepare solution architecture draft', 'TBCA Solutions Team', 14, 'pending', 'Depends on process maps', 'Architecture document', 'medium'],
                ['dependency', 'API credentials pending from client', 'Client IT Admin', 12, 'waiting_on_client', 'Blocks integration mapping and test connection', 'Credential handover record', 'critical'],
            ] as [$g, $title, $owner, $days, $status, $dep, $ev, $prio]) {
                $e->tasks()->create(['group' => $g, 'title' => $title, 'owner' => $owner, 'due_date' => now()->addDays($days), 'status' => $status, 'dependency' => $dep, 'evidence' => $ev, 'priority' => $prio]);
            }
            $e->documents()->create(['name' => 'Signed Engagement Letter.pdf', 'type' => 'Engagement Letter', 'category' => 'Contract', 'linked_to' => 'Engagement Letter', 'uploaded_by' => $e->signer_name ?? 'Client', 'uploaded_at' => now(), 'status' => 'Signed', 'visibility' => 'All Parties', 'version' => 'v1.2']);
            $e->documents()->create(['name' => 'Fee Schedule FS-'.$e->tower.'.pdf', 'type' => 'Fee Schedule', 'category' => 'Financial', 'linked_to' => 'Fees & Ledgers', 'uploaded_by' => 'TBCA System', 'uploaded_at' => now(), 'status' => 'Approved', 'visibility' => 'All Parties', 'version' => 'v1.2']);
        }
        if (! $e->meters) {
            $e->meters = self::defaultMeters();
            $e->uat = ['cycle' => 'Cycle 1', 'build' => 'v1.0.0-UAT', 'start' => now()->addWeeks(6)->toDateString(), 'end' => now()->addWeeks(8)->toDateString(), 'towers' => [], 'defects_open' => 0, 'critical_open' => 0, 'signoff' => false, 'checks' => ['performance' => false, 'security' => false]];
            $e->subscription = ['plan' => 'Professional Plan', 'id' => 'SUB-TBCA-'.now()->format('Y').'-'.str_pad((string) $e->id, 5, '0', STR_PAD_LEFT), 'status' => 'Not activated', 'annual_fee' => 24000, 'auto_renew' => false, 'period_start' => null, 'period_end' => null, 'seats' => 3];
            $e->exit_plan = self::defaultExitPlan(now()->addYear());
            $e->transactions = [];
            $e->save();
        }
    }

    public static function defaultMeters(): array
    {
        return [
            'term_start' => now()->toDateString(), 'term_end' => now()->addDays(60)->toDateString(), 'cap' => 100000, 'cap_unit' => 'task-runs', 'consumed' => 0, 'warning' => 80,
            'services' => [
                ['service' => 'API Calls', 'sub' => 'Zoho CRM Integration', 'inclusion' => 50000, 'unit' => 'calls', 'used' => 0],
                ['service' => 'Data Storage', 'sub' => 'Secure Cloud Storage', 'inclusion' => 100, 'unit' => 'GB', 'used' => 0],
                ['service' => 'Document Generation', 'sub' => 'Automated Documents', 'inclusion' => 1000, 'unit' => 'docs', 'used' => 0],
                ['service' => 'Email Sends', 'sub' => 'Transactional Emails', 'inclusion' => 10000, 'unit' => 'emails', 'used' => 0],
                ['service' => 'SMS Notifications', 'sub' => 'Client Notifications', 'inclusion' => 2000, 'unit' => 'sms', 'used' => 0],
                ['service' => 'Hypercare Support', 'sub' => 'Support Hours (Go-Live)', 'inclusion' => 20, 'unit' => 'hours', 'used' => 0],
            ],
        ];
    }

    public static function defaultExitPlan(Carbon $date): array
    {
        $d = $date->toDateString();

        return ['date' => $d, 'reason' => 'End of engagement', 'status' => 'Planned', 'closed_at' => null, 'steps' => [
            ['Confirm exit date and plan', 'You', $d, 'pending', 'View'],
            ['Export your data', 'You', $d, 'pending', 'Export'],
            ['Download documents & reports', 'You', $d, 'pending', 'Download'],
            ['Set handover contacts', 'You', $d, 'pending', 'Configure'],
            ['Settle outstanding amounts', 'You', $d, 'pending', 'View'],
            ['Close engagement', 'TBCA System', $d, 'pending', 'Close'],
        ]];
    }

    /** Approve the presented gate: records assent and, if a T amount is due, raises the current-gate order. */
    public static function approveGate(TechEngagement $e, TechGate $g, User $user): ?Order
    {
        if ($g->status !== 'presented') {
            throw ValidationException::withMessages(['gate' => 'Only the gate currently presented can be approved.']);
        }
        if ($g->expires_at && $g->expires_at->isPast()) {
            throw ValidationException::withMessages(['gate' => 'This gate has expired and must be re-presented.']);
        }
        $g->update(['decided_at' => now()]);
        $e->addTimeline("Gate {$g->number} approved by client: {$g->name}", $user->name);
        if ($g->t_amount_zar <= 0) {
            $g->update(['status' => 'approved']);
            self::advance($e, $g);

            return null;
        }
        $order = Checkout::createOrder([[
            'item_type' => 'advisory', 'item_code' => "{$e->reference}-G{$g->number}-T", 'name' => "[Ledger T] Gate {$g->number}: {$g->name} — {$e->reference}",
            'unit_zar' => $g->t_amount_zar, 'meta' => ['engagement' => $e->reference, 'gate' => $g->number, 'ledger' => 'T'],
        ]], $user, 'advisory', ['return_url' => "/technology-solutions/workspace/{$e->reference}", 'title' => "Gate {$g->number} — amount payable now", 'engagement' => $e->reference]);
        $g->update(['status' => 'approved_not_paid', 'order_id' => $order->id]);
        $e->update(['status' => 'payment_pending']);

        return $order;
    }

    /** Fund the Ledger X estimate (pass-through, no markup). Supplier commitment only after cleared funds. */
    public static function fundX(TechEngagement $e, TechGate $g, User $user): Order
    {
        if ($g->x_high_zar <= 0 || $g->x_funded) {
            throw ValidationException::withMessages(['gate' => 'No external funding is required for this gate.']);
        }

        return Checkout::createOrder([[
            'item_type' => 'advisory', 'item_code' => "{$e->reference}-G{$g->number}-X", 'name' => "[Ledger X] External cost funding — Gate {$g->number} (pass-through at cost)",
            'unit_zar' => $g->x_high_zar, 'meta' => ['engagement' => $e->reference, 'gate' => $g->number, 'ledger' => 'X'],
        ]], $user, 'advisory', ['return_url' => "/technology-solutions/workspace/{$e->reference}/fee-meter", 'title' => 'Ledger X funding', 'engagement' => $e->reference, 'x_gate' => $g->id]);
    }

    /** Server-side reconciliation of paid orders into gate state and entitlements. */
    public static function reconcile(TechEngagement $e): void
    {
        foreach ($e->gates()->where('status', 'approved_not_paid')->with('order')->get() as $g) {
            if ($g->order?->isPaid()) {
                $g->update(['status' => 'approved']);
                $tx = $e->transactions ?? [];
                $excl = $g->order->subtotal_zar;
                $tx[] = ['date' => now()->toDateString(), 'type' => 'Invoice', 'ref' => 'INV-'.now()->format('Y').'-'.str_pad((string) random_int(100, 9999), 4, '0', STR_PAD_LEFT), 'desc' => "Gate {$g->number} - {$g->name}", 'excl' => $excl, 'status' => 'Paid', 'due' => now()->toDateString()];
                $tx[] = ['date' => now()->toDateString(), 'type' => 'Payment', 'ref' => $g->order->reference, 'desc' => "Payment received - Gate {$g->number}", 'excl' => -$excl, 'status' => 'Paid', 'due' => null];
                $e->transactions = $tx;
                $e->save();
                $e->addTimeline("Gate {$g->number} payment verified (server-side)", 'TBCA Finance');
                self::advance($e, $g);
            }
        }
        $sub = $e->subscription ?? [];
        if (! empty($sub['pending_order']) && Order::query()->where('reference', $sub['pending_order'])->value('status') === 'paid') {
            $start = ! empty($sub['period_end']) && ($sub['status'] ?? '') === 'Active' ? Carbon::parse($sub['period_end']) : now();
            $sub = [...$sub, 'status' => 'Active', 'period_start' => $start->toDateString(), 'period_end' => $start->copy()->addYear()->toDateString(), 'last_invoice' => $sub['pending_order']];
            unset($sub['pending_order']);
            $e->subscription = $sub;
            $e->save();
            $e->addTimeline('Subscription renewal approved and paid (S13-RENEW)', 'TBCA Finance');
        }
        foreach ($e->gates()->where('x_funded', false)->where('x_high_zar', '>', 0)->get() as $g) {
            $paid = Order::query()->where('section', 'advisory')->where('status', 'paid')->where('meta->x_gate', $g->id)->exists();
            if ($paid) {
                $g->update(['x_funded' => true]);
                $e->addTimeline("Ledger X funding cleared for Gate {$g->number}", 'TBCA Finance');
            }
        }
    }

    private static function advance(TechEngagement $e, TechGate $g): void
    {
        $stage = match ($g->number) { 1 => 7, 2, 3, 4, 5 => 8, 6, 7 => 9, 8 => 10, default => $e->stage };
        $status = match (true) { $g->number >= 8 => 'accepted', $g->number >= 6 => 'qa_review', default => 'in_delivery' };
        $e->update(['stage' => max($e->stage, $stage), 'status' => $status, 'current_gate' => min(8, $g->number + 1)]);
        $next = $e->gates()->where('number', $g->number + 1)->first();
        if ($next && $next->status === 'locked') {
            $next->update(['status' => 'presented', 'expires_at' => now()->addDays(14)]);
        }
    }

    public static function decline(TechEngagement $e, TechGate $g, User $user): void
    {
        $g->update(['status' => 'declined', 'decided_at' => now()]);
        $e->update(['status' => 'stopped', 'health' => 'paused']);
        $e->addTimeline("Gate {$g->number} declined — work paused at current boundary", $user->name);
    }

    /** Linear usage projection to term end with status per meter. */
    public static function usage(array $m): array
    {
        $start = Carbon::parse($m['term_start']);
        $end = Carbon::parse($m['term_end']);
        $termDays = max(1, $start->diffInDays($end));
        $elapsed = max(1, min($termDays, $start->diffInDays(now())));
        $rows = [];
        $totalPct = [];
        foreach ($m['services'] as $s) {
            $pct = $s['inclusion'] > 0 ? round($s['used'] / $s['inclusion'] * 100) : 0;
            $projected = $s['inclusion'] > 0 ? round($s['used'] / $elapsed * $termDays / $s['inclusion'] * 100) : 0;
            $status = match (true) { $projected > 100 => 'Over Allowance', $pct >= $m['warning'] => 'Warning', $pct >= 60 => 'At Risk', default => 'On Track' };
            $rows[] = [...$s, 'remaining' => max(0, $s['inclusion'] - $s['used']), 'pct' => $pct, 'projected' => $projected, 'status' => $status];
            $totalPct[] = $pct;
        }
        $allowance = 100;
        $used = (int) round(array_sum($totalPct) / max(1, count($totalPct)));
        $projectedUnits = (int) round($used / $elapsed * $termDays);

        return [
            'rows' => $rows, 'allowance' => $allowance, 'used' => $used, 'remaining' => max(0, $allowance - $used),
            'projected' => min(999, $projectedUnits), 'overage' => max(0, $projectedUnits - $allowance),
            'term_end' => $end->format('d M Y'), 'days_left' => max(0, (int) now()->diffInDays($end, false)),
            'cap' => $m['cap'], 'consumed' => $m['consumed'], 'cap_pct' => $m['cap'] ? round($m['consumed'] / $m['cap'] * 100) : 0, 'warning' => $m['warning'],
            'series' => self::series($used, $projectedUnits),
        ];
    }

    private static function series(int $used, int $projected): array
    {
        $pts = [];
        for ($i = 0; $i <= 4; $i++) {
            $pts[] = ['actual' => $i <= 2 ? (int) round($used * $i / 2) : null, 'projected' => $i >= 2 ? (int) round($used + ($projected - $used) * ($i - 2) / 2) : null];
        }

        return $pts;
    }

    /** Statement with VAT, running balance and ageing (VAT = 15% of excl.). */
    public static function statement(array $tx): array
    {
        usort($tx, fn ($a, $b) => strcmp($a['date'], $b['date']));
        $bal = 0;
        $rows = [];
        $invoiced = 0;
        $paid = 0;
        $aging = ['0-30' => 0, '31-60' => 0, '61-90' => 0, '90+' => 0];
        foreach ($tx as $t) {
            $vat = (int) round($t['excl'] * ServicesContent::VAT);
            $incl = $t['excl'] + $vat;
            $bal += $incl;
            if ($t['type'] === 'Invoice') {
                $invoiced += $incl;
            }
            if (in_array($t['type'], ['Payment', 'Credit'], true)) {
                $paid += -$incl;
            }
            $rows[] = [...$t, 'vat' => $vat, 'incl' => $incl, 'balance' => $bal];
        }
        // Ageing on open invoices by due date (oldest paid first, FIFO).
        $credit = $paid;
        foreach ($rows as $r) {
            if ($r['type'] !== 'Invoice') {
                continue;
            }
            $open = max(0, $r['incl'] - $credit);
            $credit = max(0, $credit - $r['incl']);
            if ($open <= 0) {
                continue;
            }
            $days = $r['due'] ? (int) Carbon::parse($r['due'])->diffInDays(now(), false) : 0;
            $bucket = match (true) { $days > 90 => '90+', $days > 60 => '61-90', $days > 30 => '31-60', default => '0-30' };
            $aging[$bucket] += $open;
        }
        $overdue = $aging['31-60'] + $aging['61-90'] + $aging['90+'];

        return ['rows' => $rows, 'invoiced' => $invoiced, 'paid' => $paid, 'balance' => $bal, 'aging' => $aging, 'overdue' => $overdue];
    }
}
