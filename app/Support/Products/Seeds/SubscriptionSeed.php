<?php

namespace App\Support\Products\Seeds;

use App\Models\Products\Subscriptions\Plan;
use App\Models\Products\Subscriptions\SubEvent;
use App\Models\Products\Subscriptions\SubExport;
use App\Models\Products\Subscriptions\SubOp;
use App\Models\Products\Subscriptions\Subscription;
use App\Models\User;
use App\Support\Products\Subscriptions\PlanCatalogue;
use Illuminate\Support\Carbon;

/**
 * Idempotent demo data for the Subscriptions family: the plan register, the demo
 * client's subscriptions (one per lifecycle state shown in the mockups) and the
 * operating records behind the admin consoles. Mockup dates (May 2026) are shifted
 * so the mockup's "today" (25 May 2026) lands on the real current date.
 */
class SubscriptionSeed
{
    private int $shiftDays;

    public function run(): void
    {
        $this->shiftDays = (int) Carbon::parse('2026-05-25')->diffInDays(now()->startOfDay(), false);

        $this->plans();
        $this->ops();
        $this->demoSubscriptions();
    }

    /** Shifts a mockup date onto the current calendar. */
    private function d(string $mockDate): Carbon
    {
        return Carbon::parse($mockDate)->addDays($this->shiftDays);
    }

    private function plans(): void
    {
        foreach (PlanCatalogue::plans() as $p) {
            $cost = $p['cost_zar'] ?? null;
            $floor = $p['floor_zar'] ?? ($cost ? (int) ceil($cost / 0.65) : null);

            Plan::updateOrCreate(['code' => $p['code']], [
                ...$p,
                'product_type' => $p['product_type'] ?? 'Subscription Product',
                'popular' => $p['popular'] ?? false,
                'min_term_months' => $p['min_term_months'] ?? 1,
                'cancellation_route' => $p['cancellation_route'] ?? 'Cancel anytime in Portal',
                'cost_zar' => $cost,
                'floor_zar' => $floor,
                'status' => $p['status'] ?? 'live',
                'evidence_id' => array_key_exists('evidence_id', $p) ? $p['evidence_id'] : 'EV-'.$p['code'],
                'recurrence_gate' => null,
                'certified_until' => ($p['status'] ?? 'live') === 'live' ? '2026-12-31' : null,
                'features' => $p['features'] ?? [],
                'entitlements' => $p['entitlements'] ?? ($p['features'] ?? []),
                'details' => $p['details'] ?? [],
            ]);
        }

        Plan::all()->each(fn (Plan $plan) => $plan->forceFill(['recurrence_gate' => $plan->evaluateRecurrence()])->save());
    }

    /* ------------------------------------------------------------------ demo client */

    private function demoSubscriptions(): void
    {
        $user = User::where('email', 'amahle@agritechsa.co.za')->first();
        if (! $user) {
            return;
        }

        $today = now()->startOfDay();
        $plan = fn (string $slug) => Plan::where('slug', $slug)->firstOrFail();
        $mandate = fn (string $last4 = '4242') => ['reference' => 'MDT-'.strtoupper(substr(md5($last4.$user->id), 0, 8)), 'status' => 'ACTIVE', 'method' => 'card', 'brand' => 'Visa', 'last4' => $last4, 'consent_version' => 'SU-MANDATE-v1.0', 'terms_version' => 'SU-TERMS-v2.0', 'captured_at' => $today->copy()->subDays(20)->toIso8601String()];

        $daily = [];
        foreach (range(0, 28) as $i) {
            $daily[] = ['date' => $today->copy()->subDays(28 - $i)->toDateString(), 'logins' => [4, 5, 7, 8, 9, 12, 6, 7, 4, 6, 5, 4, 8, 7, 9, 6, 5, 8, 10, 12, 8, 11, 13, 9, 10, 14, 11, 8, 6][$i], 'content' => [3, 4, 3, 4, 2, 5, 3, 4, 2, 3, 2, 3, 4, 3, 5, 2, 3, 4, 4, 5, 3, 4, 5, 4, 3, 6, 4, 3, 2][$i]];
        }

        $healthy = [
            'logins' => 24, 'logins_delta' => 26, 'content' => 38, 'content_delta' => 19, 'reports' => 6, 'reports_delta' => 50,
            'exports' => 3, 'support' => 2, 'session_minutes' => 27, 'session_delta' => 14, 'tasks' => 9,
            'score' => 82, 'confidence' => 'HIGH', 'idle_periods' => 0, 'days_inactive' => 1,
            'daily' => $daily,
            'top_content' => [['Regulatory Alerts – May 2026', 8], ['Business Rescue Checklist Template', 6], ['Creditors Meeting Agenda Template', 5], ['Case Law Update – Recent Decisions', 4], ['Business Rescue KPI Dashboard', 3]],
            'features' => [['Templates & Tools', 78], ['Regulatory Intelligence', 64], ['Dashboards', 52], ['Ask an Expert', 21]],
            'value' => ['decisions' => 5, 'decisions_delta' => 25, 'hours' => 6.2, 'hours_delta' => 18, 'risks' => 4, 'risks_delta' => 33],
            'health' => ['Regular logins' => true, 'Content accessed' => true, 'Reports generated' => true, 'Up to date' => true, 'Alerts reviewed' => false],
        ];

        $low = [
            'logins' => 3, 'logins_delta' => -70, 'content' => 4, 'content_delta' => -67, 'reports' => 1, 'reports_delta' => -75,
            'exports' => 0, 'support' => 0, 'session_minutes' => 8, 'session_delta' => -73, 'tasks' => 0, 'tasks_delta' => -100,
            'score' => 18, 'confidence' => 'HIGH', 'idle_periods' => 2, 'days_inactive' => 37,
            'activity' => [
                [$today->copy()->subDays(37)->toDateString(), 'Business Rescue Checklist Template', 'Viewed'],
                [$today->copy()->subDays(40)->toDateString(), 'Creditors Meeting Agenda Template', 'Viewed'],
                [$today->copy()->subDays(45)->toDateString(), 'Republic v ABC (Pty) Ltd Case Note', 'Viewed'],
                [$today->copy()->subDays(53)->toDateString(), 'Business Rescue KPI Dashboard', 'Viewed'],
                [$today->copy()->subDays(58)->toDateString(), 'Regulatory Alert: CIPC Update', 'Viewed'],
            ],
            'missing' => ['Updated regulatory intelligence and alerts', 'New templates, checklists and tools', 'Business rescue case updates and insights', 'Priority email and WhatsApp support', 'Monthly readiness and compliance guidance'],
        ];

        $period = function (int $startedDaysAgo, string $interval = 'monthly') use ($today) {
            $start = $today->copy()->subDays($startedDaysAgo);
            $end = ($interval === 'annual' ? $start->copy()->addYearNoOverflow() : $start->copy()->addMonthNoOverflow())->subDay();

            return ['current_period_start' => $start, 'current_period_end' => $end, 'next_charge_at' => $end->copy()->addDay()];
        };

        $subs = [
            'TBCA-SUB-2026-BRAS01' => [
                'plan' => 'business-rescue-advisory-sprint', 'status' => 'ACTIVE', 'started' => 20, 'min' => 24, 'usage' => $healthy,
                'next_review_at' => $today->copy()->subDays(20)->addYear(),
            ],
            'TBCA-SUB-2026-MCA002' => [
                'plan' => 'maintained-content', 'status' => 'ACTIVE', 'started' => 12, 'usage' => $low,
                'disuse_flagged' => true, 'disuse_flagged_at' => $today->copy()->subDays(2), 'disuse_notified_at' => $today->copy()->subDays(2),
            ],
            'TBCA-SUB-2026-EID003' => [
                'plan' => 'executive-insight-dashboard', 'status' => 'ACTIVE', 'started' => 25, 'usage' => [...$healthy, 'score' => 71],
                'renewal_notice_at' => $today->copy()->subDay(),
            ],
            'TBCA-SUB-2026-MBI004' => [
                'plan' => 'monthly-board-intelligence-briefing', 'status' => 'ACTIVE', 'started' => 8, 'usage' => [...$healthy, 'score' => 64],
                'price_change' => [
                    'state' => 'pending', 'old_price_zar' => 10000, 'new_price_zar' => 11000, 'notice_at' => $today->copy()->subDays(5)->toDateString(),
                    'effective_at' => $today->copy()->addDays(25)->toDateString(), 'decide_by' => $today->copy()->addDays(24)->toDateString(),
                    'basis' => 'Annual pricing update', 'decision' => null,
                ],
            ],
            'TBCA-SUB-2026-IAS005' => [
                'plan' => 'intelligence-archive-subscription', 'status' => 'PAUSED', 'started' => 70, 'usage' => [...$healthy, 'score' => 40],
                'paused_at' => $today->copy()->subDays(15), 'pause_until' => $today->copy()->addDays(45),
            ],
            'TBCA-SUB-2026-CTS006' => [
                'plan' => 'compliance-tracker-subscription', 'status' => 'IN_GRACE', 'started' => 31, 'usage' => [...$healthy, 'score' => 55], 'last4' => '0002',
                'payment_failed_at' => $today->copy()->setTime(9, 15), 'overdue_zar' => 4950,
                'meta' => ['dunning' => ['stage' => 'Payment Failed', 'reason' => 'Insufficient funds', 'attempts' => 1], 'invoice' => ['number' => 'INV-2026-0501', 'issued' => $today->copy()->subDays(11)->toDateString(), 'due' => $today->toDateString()]],
            ],
            'TBCA-SUB-2026-MSS007' => [
                'plan' => 'market-signals-subscription', 'status' => 'CANCELLED', 'started' => 120, 'usage' => [...$low, 'score' => 30],
                'cancel_requested_at' => $today->copy()->subDays(38), 'cancel_effective_at' => $today->copy()->subDays(20), 'churn_code' => 'CH-VOL', 'next_charge_at' => null,
                'meta' => ['cancellation' => ['requested_at' => $today->copy()->subDays(38)->toIso8601String(), 'effective_at' => $today->copy()->subDays(20)->toDateString(), 'mandatory_actions' => 3, 'signup_actions' => 3, 'human_handoffs' => 0, 'reason' => 'Not provided', 'early_exit_amount_status' => 'NONE']],
            ],
        ];

        foreach ($subs as $ref => $s) {
            $p = $plan($s['plan']);
            $dates = $period($s['started']);
            if (($s['status'] ?? '') === 'CANCELLED') {
                $dates = ['current_period_start' => $today->copy()->subDays(50), 'current_period_end' => $today->copy()->subDays(20)];
            }

            $sub = Subscription::updateOrCreate(['reference' => $ref], [
                'user_id' => $user->id,
                'plan_id' => $p->id,
                'pending_plan_id' => null,
                'status' => $s['status'],
                'billing_interval' => 'monthly',
                'price_zar' => $p->monthly_zar,
                'started_at' => $today->copy()->subDays($s['started']),
                ...$dates,
                'next_charge_at' => array_key_exists('next_charge_at', $s) ? $s['next_charge_at'] : ($dates['next_charge_at'] ?? null),
                'next_review_at' => $s['next_review_at'] ?? $today->copy()->subDays($s['started'])->addYear(),
                'min_term_months' => $s['min'] ?? $p->min_term_months,
                'mandate' => $s['status'] === 'CANCELLED' ? [...$mandate(), 'status' => 'STOPPED'] : $mandate($s['last4'] ?? '4242'),
                'usage' => $s['usage'],
                'disuse_flagged' => $s['disuse_flagged'] ?? false,
                'disuse_flagged_at' => $s['disuse_flagged_at'] ?? null,
                'disuse_notified_at' => $s['disuse_notified_at'] ?? null,
                'price_change' => $s['price_change'] ?? null,
                'renewal_notice_at' => $s['renewal_notice_at'] ?? null,
                'paused_at' => $s['paused_at'] ?? null,
                'pause_until' => $s['pause_until'] ?? null,
                'cancel_requested_at' => $s['cancel_requested_at'] ?? null,
                'cancel_effective_at' => $s['cancel_effective_at'] ?? null,
                'cancel_reason' => null,
                'churn_code' => $s['churn_code'] ?? null,
                'payment_failed_at' => $s['payment_failed_at'] ?? null,
                'overdue_zar' => $s['overdue_zar'] ?? 0,
                'meta' => $s['meta'] ?? [],
            ]);

            if (! $sub->events()->exists()) {
                SubEvent::log('activated', $sub, ['user_id' => $user->id, 'actor_role' => 'system', 'new_state' => 'ACTIVE', 'money_effect' => true, 'entitlement_effect' => true, 'payload' => ['seed' => true]]);
                $sub->events()->latest('id')->first()?->forceFill(['created_at' => $sub->started_at])->save();
                if ($s['status'] === 'PAUSED') {
                    SubEvent::log('paused', $sub, ['user_id' => $user->id, 'previous_state' => 'ACTIVE', 'new_state' => 'PAUSED', 'payload' => ['days' => 60]]);
                }
            }
        }

        $cancelled = Subscription::where('reference', 'TBCA-SUB-2026-MSS007')->first();
        if ($cancelled && ! $cancelled->exports()->exists()) {
            foreach ([
                ['Invoices & Receipts', 'PDF (zip)', 'Completed', '7.6 MB', 9],
                ['Activity & Audit History', 'CSV', 'Completed', '1.9 MB', 10],
                ['Downloaded Reports Index', 'CSV', 'Completed', '0.6 MB', 12],
                ['Account Data Request', 'ZIP (JSON)', 'Processing', null, 14],
                ['Saved Templates & Checklists', 'ZIP (JSON)', 'Completed', '3.1 MB', 15],
            ] as [$type, $file, $status, $size, $ago]) {
                SubExport::create([
                    'subscription_id' => $cancelled->id, 'user_id' => $user->id, 'export_type' => $type, 'file_type' => $file,
                    'status' => $status, 'size_label' => $size, 'requested_at' => $today->copy()->subDays($ago)->setTime(10, 42),
                    'completed_at' => $status === 'Completed' ? $today->copy()->subDays($ago)->setTime(10, 50) : null,
                ]);
            }
        }
    }

    /* ------------------------------------------------------------------ admin operating records */

    private function op(string $kind, string $reference, array $attrs): void
    {
        SubOp::updateOrCreate(['kind' => $kind, 'reference' => $reference], $attrs);
    }

    private function ops(): void
    {
        // Review capacity pools (mockup: Review Capacity versus Subscriber Book).
        foreach ([
            ['R1', 'R1 Refreshed Content', 512, 612.8, 700, 70],
            ['R2', 'R2 Live System', 654, 943.6, 980, 85],
            ['R3', 'R3 Periodic Delivery', 328, 358.4, 450, 65],
            ['R4', 'R4 Standing Readiness', 214, 218.0, 250, 60],
            ['R5', 'R5 Accumulating Value', 134, 52.1, 120, 25],
        ] as [$class, $title, $subs, $demand, $committed, $mins]) {
            $this->op('capacity', "CAP-{$class}", ['title' => $title, 'recurrence_class' => $class, 'status' => 'active',
                'data' => ['baseline_subscribers' => $subs, 'baseline_demand_hours' => $demand, 'committed_hours' => $committed, 'minutes_per_subscriber' => $mins]]);
        }

        // Billing runs.
        foreach ([
            ['RUN-2026-05-M', 'Monthly Run – May 2026', 'Monthly', '2026-05-25 02:00', 'Scheduled', 6800, 26820000],
            ['RUN-2026-05-A', 'Add-on Run – May 2026', 'Ad-hoc', '2026-05-27 02:00', 'Scheduled', 480, 1250000],
            ['RUN-2026-06-MM', 'Mid-Month Run – May 2026', 'Mid-Month', '2026-06-08 02:00', 'Scheduled', 1100, 4500000],
            ['RUN-2026-06-M', 'Monthly Run – Jun 2026', 'Monthly', '2026-06-25 02:00', 'Scheduled', 6950, 27311000],
            ['RUN-2026-06-AN', 'Annual Run – Jun 2026', 'Annual', '2026-06-30 01:00', 'Scheduled', 320, 3950000],
            ['RUN-2026-04-M', 'Monthly Run – Apr 2026', 'Monthly', '2026-04-25 02:07', 'Completed', 6342, 25412771],
            ['RUN-2026-04-A', 'Add-on Run – Apr 2026', 'Ad-hoc', '2026-04-27 02:03', 'Completed', 476, 1214882],
            ['RUN-2026-04-R', 'Retry Run – Apr 2026', 'Retry', '2026-04-15 02:00', 'Completed', 58, 197344],
            ['RUN-2026-04-MM', 'Mid-Month Run – Apr 2026', 'Mid-Month', '2026-04-08 02:01', 'Completed', 1052, 4186211],
            ['RUN-2026-03-M', 'Monthly Run – Mar 2026', 'Monthly', '2026-03-25 02:05', 'Completed', 6135, 24801009],
            ['RUN-2026-05-01', 'Monthly Run', 'Monthly', '2026-05-01 00:00', 'Completed', 6100, 24900000],
            ['RUN-2026-05-05', 'Add-on Run', 'Ad-hoc', '2026-05-05 02:00', 'Completed', 410, 1100000],
            ['RUN-2026-05-08', 'Mid-Month Run', 'Mid-Month', '2026-05-08 00:00', 'Completed', 1040, 4100000],
            ['RUN-2026-05-15', 'Retry Run', 'Retry', '2026-05-15 02:00', 'Completed', 61, 201000],
            ['RUN-2026-05-22', 'Annual Run', 'Annual', '2026-05-22 01:00', 'Completed', 300, 3700000],
        ] as [$ref, $title, $type, $at, $status, $count, $value]) {
            $this->op('billing_run', $ref, ['title' => $title, 'status' => $status, 'amount_zar' => $value, 'due_at' => $this->d($at),
                'data' => ['type' => $type, 'invoices' => $count]]);
        }

        // Dunning cases.
        foreach ([
            ['DUN-001', 'Acme (Pty) Ltd', 'R2 Live System', 'R2', 'INV-2026-004512', '2026-05-01', 18450, '2nd Notice Sent', '2026-05-15', 'Email', 'In Dunning'],
            ['DUN-002', 'BluePeak Holdings', 'R1 Refreshed Content', 'R1', 'INV-2026-004498', '2026-04-15', 12900, 'Final Notice Sent', '2026-05-18', 'SMS', 'At Risk'],
            ['DUN-003', 'Cedar Logistics', 'R3 Periodic Delivery', 'R3', 'INV-2026-004470', '2026-05-01', 9850, '1st Notice Sent', '2026-05-14', 'Email', 'In Dunning'],
            ['DUN-004', 'Delta Manufacturing', 'R4 Standing Readiness', 'R4', 'INV-2026-004516', '2026-05-10', 24100, '1st Notice Sent', '2026-05-16', 'Email', 'In Dunning'],
            ['DUN-005', 'EverGreen Trust', 'R2 Live System', 'R2', 'INV-2026-004460', '2026-05-01', 16650, '2nd Notice Sent', '2026-05-15', 'SMS', 'In Dunning'],
        ] as [$ref, $client, $plan, $class, $inv, $due, $amt, $stage, $contact, $channel, $status]) {
            $this->op('dunning_case', $ref, ['client' => $client, 'plan_name' => $plan, 'recurrence_class' => $class, 'status' => $status, 'amount_zar' => $amt, 'due_at' => $this->d($due),
                'data' => ['invoice' => $inv, 'stage' => $stage, 'last_contact' => $this->d($contact)->toDateString(), 'channel' => $channel]]);
        }

        // Disuse queue.
        foreach ([
            ['SUB-2026-001234', 'Acme (Pty) Ltd', 'R2 Live System', 'R2', '2026-04-22', 'Moderate', 'At Risk', 'No sign-in, No content consumed', 'Send Value Reminder', '2026-05-16', 'Not Contacted', 'JS'],
            ['SUB-2026-001567', 'BluePeak Holdings', 'R1 Refreshed Content', 'R1', '2026-04-05', 'Low', 'High Risk', 'No sign-in, No report downloads', 'Phone Call', '2026-05-14', 'Email Sent', 'LM'],
            ['SUB-2026-001890', 'Cedar Logistics', 'R3 Periodic Delivery', 'R3', '2026-04-12', 'Moderate', 'At Risk', 'No tool usage', 'Send Value Reminder', '2026-05-16', 'Not Contacted', 'AN'],
            ['SUB-2026-002345', 'Delta Manufacturing', 'R4 Standing Readiness', 'R4', '2026-03-30', 'Low', 'High Risk', 'No sign-in, No support interactions', 'Phone Call', '2026-05-15', 'Not Contacted', 'KD'],
            ['SUB-2026-002678', 'EverGreen Trust', 'R2 Live System', 'R2', '2026-04-25', 'Moderate', 'At Risk', 'No content consumed', 'Send Value Reminder', '2026-05-17', 'Email Sent', 'SJ'],
        ] as [$ref, $client, $plan, $class, $last, $health, $risk, $ind, $next, $by, $outreach, $owner]) {
            $this->op('disuse_case', $ref, ['client' => $client, 'plan_name' => $plan, 'recurrence_class' => $class, 'status' => 'open', 'due_at' => $this->d($by),
                'data' => ['last_activity' => $this->d($last)->toDateString(), 'health' => $health, 'risk' => $risk, 'indicators' => $ind, 'next_action' => $next, 'outreach' => $outreach, 'owner' => $owner]]);
        }

        // Deferred revenue lines (annual prepaid contracts).
        foreach ([
            ['INV-2026-004512', 'Acme (Pty) Ltd', 'Business Advisory Pro', 'R2', '2026-05-01', '2027-04-30', 1560000],
            ['INV-2026-004498', 'BluePeak Holdings', 'Compliance Suite Annual', 'R1', '2026-04-15', '2027-04-14', 980000],
            ['INV-2026-004470', 'Cedar Logistics', 'Operations Dashboard', 'R2', '2026-05-01', '2027-04-30', 720000],
            ['INV-2026-004515', 'Delta Manufacturing', 'Monthly Insights Pack', 'R3', '2026-05-10', '2027-05-09', 480000],
            ['INV-2026-004460', 'EverGreen Trust', 'Strategic Readiness Plan', 'R4', '2026-05-01', '2027-04-30', 1200000],
        ] as [$ref, $client, $plan, $class, $start, $end, $amt]) {
            $this->op('deferred_line', $ref, ['client' => $client, 'plan_name' => $plan, 'recurrence_class' => $class, 'status' => 'Active', 'amount_zar' => $amt,
                'due_at' => $this->d($start), 'data' => ['start' => $this->d($start)->toDateString(), 'end' => $this->d($end)->toDateString()]]);
        }

        // Churned subscribers.
        foreach ([
            ['SUB-2026-000987', 'Acme (Pty) Ltd', 'R2 Live System', 'R2', '2026-05-10', '7m 12d', 12500, 'Voluntary', 'Too expensive', 'Budget constraints', 'Exit Survey sent'],
            ['SUB-2026-001234', 'BluePeak Holdings', 'R1 Refreshed Content', 'R1', '2026-05-09', '11m 3d', 4250, 'Voluntary', 'No longer needed', 'Project completed', 'Re-engagement email'],
            ['SUB-2026-000765', 'Cedar Logistics', 'R3 Periodic Delivery', 'R3', '2026-05-08', '5m 27d', 9850, 'Involuntary', 'Payment failed', 'Card expired', 'Dunning completed'],
            ['SUB-2026-000321', 'Delta Manufacturing', 'R4 Standing Readiness', 'R4', '2026-05-06', '9m 18d', 24100, 'Voluntary', 'Switched provider', 'Competitor feature set', 'Exit Survey sent'],
            ['SUB-2026-000654', 'EverGreen Trust', 'R2 Live System', 'R2', '2026-05-03', '6m 4d', 6650, 'Voluntary', 'Low usage / Not using', 'Not enough usage', 'Re-engagement email'],
        ] as [$ref, $client, $plan, $class, $date, $tenure, $mrr, $type, $cause, $detail, $action]) {
            $this->op('churn', $ref, ['client' => $client, 'plan_name' => $plan, 'recurrence_class' => $class, 'status' => $type, 'amount_zar' => $mrr, 'due_at' => $this->d($date),
                'data' => ['tenure' => $tenure, 'cause' => $cause, 'detail' => $detail, 'action' => $action]]);
        }

        // Recurring deliveries across the month (mockup: Recurring Delivery Calendar).
        $clients = ['Acme (Pty) Ltd', 'BluePeak Holdings', 'Cedar Logistics', 'Delta Manufacturing', 'EverGreen Trust'];
        $pattern = [
            ['R2', 'Live Review', 'review', '10:00'], ['R1', 'Content Refresh', 'update', '14:00'], ['R3', 'Delivery', 'delivery', '09:00'],
            ['R1', 'Update Bulletin', 'update', '11:00'], ['R4', 'Capacity Check', 'capacity', '15:00'], ['R2', 'Portal Update', 'update', '14:00'],
            ['R3', 'Periodic Report', 'delivery', '10:00'], ['R5', 'Accum Value', 'delivery', '15:00'],
        ];
        $n = 0;
        foreach (range(1, 29) as $day) {
            $date = Carbon::create(2026, 5, $day);
            if ($date->isWeekend()) {
                continue;
            }
            foreach ([0, 1] as $k) {
                [$class, $type, $cat, $time] = $pattern[($day + $k * 3) % count($pattern)];
                $at = $this->d($date->toDateString().' '.$time);
                $status = $day === 11 && $k === 0 ? 'Overdue' : ($day < 25 ? 'Completed' : 'Upcoming');
                $this->op('delivery', sprintf('DLV-%02d-%d', $day, $k), [
                    'title' => "{$class} {$type}", 'client' => $clients[$n % 5], 'recurrence_class' => $class, 'status' => $status,
                    'due_at' => $at, 'amount_zar' => [24500, 18200, 31000, 12800, 22650][$n % 5], 'data' => ['category' => $day === 11 && $k === 0 ? 'overdue' : $cat],
                ]);
                $n++;
            }
        }

        // Latest recurrence test run summary.
        $this->op('recurrence_run', 'RT-2026-05-12-0915', ['title' => 'Scheduled recurrence test', 'status' => 'PASS', 'due_at' => $this->d('2026-05-12 09:15'), 'data' => [
            'type' => 'Scheduled', 'triggered_by' => 'System Scheduler', 'environment' => 'Production', 'engine' => 'Recurrence Engine v2.4.1',
            'records' => 2516, 'rules' => 156, 'baseline' => 'v2026.05.01',
            'failures' => [
                ['Business Rescue Advisory Sprint', 'R4 Standing Readiness', 'No recurring value evidence', '09:14'],
                ['ESG Reporting Monthly', 'R3 Periodic Delivery', 'Insufficient content updates', '09:13'],
                ['AIIM Risk Monitor', 'R1 Refreshed Content', 'Undefined delivery cadence', '09:12'],
                ['Partner Legal Updates', 'R3 Periodic Delivery', 'Access not continuous', '09:11'],
                ['Monthly Compliance Pack', 'R3 Periodic Delivery', 'Missing usage metrics', '09:10'],
            ],
        ]]);
    }
}
