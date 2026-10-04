<?php

namespace App\Http\Controllers\Products\Subscriptions;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Products\Subscriptions\Plan;
use App\Models\Products\Subscriptions\SubEvent;
use App\Models\Products\Subscriptions\SubOp;
use App\Models\Products\Subscriptions\Subscription;
use App\Support\Products\Subscriptions\AdminData;
use App\Support\Products\Subscriptions\Capacity;
use App\Support\Products\Subscriptions\Lifecycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Subscriptions governance consoles (Blueprint screens 22-31) at /admin/products/subscriptions.
 * Tables combine live platform records (plans, subscriptions, orders) with operating records
 * in prd_sub_ops; every admin action changes state and is written to prd_sub_events.
 */
class AdminController extends Controller
{
    private function page(string $name, array $props): Response
    {
        return Inertia::render("Products/Subscriptions/Admin/{$name}", $props);
    }

    private function audit(string $type, array $payload = [], ?Subscription $sub = null, ?int $planId = null): void
    {
        SubEvent::log($type, $sub, ['actor_role' => 'admin', 'plan_id' => $planId ?? $sub?->plan_id, 'payload' => $payload]);
    }

    private function opRow(SubOp $op): array
    {
        return [
            'id' => $op->id, 'reference' => $op->reference, 'title' => $op->title, 'client' => $op->client, 'plan_name' => $op->plan_name,
            'recurrence_class' => $op->recurrence_class, 'status' => $op->status, 'amount_zar' => $op->amount_zar,
            'due_at' => $op->due_at?->toIso8601String(), 'data' => $op->data ?? (object) [],
        ];
    }

    /* ------------------------------------------------------------------ console home */

    public function index(): Response
    {
        $subs = Subscription::with('plan')->get();
        $live = $subs->whereIn('status', ['ACTIVE', 'IN_GRACE', 'PAST_DUE', 'CANCELLED_PENDING', 'PAUSED']);

        return $this->page('Console', [
            'kpis' => [
                'live' => $live->count(),
                'mrr' => (int) $live->sum(fn ($s) => $s->billing_interval === 'annual' ? round($s->price_zar / 12) : $s->price_zar),
                'plans' => Plan::where('status', 'live')->count(),
                'below_floor' => Plan::where('status', 'live')->get()->filter->isBelowFloor()->count(),
                'dunning' => $subs->whereIn('status', ['IN_GRACE', 'PAST_DUE'])->count(),
                'disuse' => $subs->where('disuse_flagged', true)->count(),
            ],
            'byStatus' => $subs->groupBy(fn ($s) => $s->displayStatus())->map->count(),
            'subscriptions' => $subs->sortByDesc('id')->take(15)->values()->map(fn ($s) => [
                'reference' => $s->reference, 'client' => $s->user?->company ?? $s->user?->name, 'plan' => $s->plan->name, 'class' => $s->plan->recurrence_class,
                'status' => $s->displayStatus(), 'price_zar' => $s->price_zar, 'interval' => $s->billing_interval, 'next_charge_at' => $s->next_charge_at?->toDateString(),
            ]),
            'events' => SubEvent::latest('id')->limit(12)->get(['event_type', 'actor_role', 'previous_state', 'new_state', 'created_at', 'subscription_id']),
        ]);
    }

    /* ------------------------------------------------------------------ recurrence test workbench */

    public function recurrenceTest(Request $request): Response
    {
        $filters = $request->validate(['class' => ['nullable', Rule::in(['R1', 'R2', 'R3', 'R4', 'R5'])], 'status' => ['nullable', Rule::in(['PASS', 'FAIL'])]]);
        $plans = Plan::orderBy('recurrence_class')->orderBy('name')->get();
        $run = SubOp::kind('recurrence_run')->latest('due_at')->first();

        $rows = $plans->map(fn (Plan $p) => [
            'slug' => $p->slug, 'name' => $p->name, 'class' => $p->recurrence_class, 'status' => $p->status, 'gate' => $p->recurrence_gate ?? 'NOT_RUN',
            'evidence_id' => $p->evidence_id, 'price' => $p->monthly_zar, 'floor' => $p->floor_zar, 'next_period_value' => $p->next_period_value,
        ])->filter(fn ($r) => (! ($filters['class'] ?? null) || $r['class'] === $filters['class'])
            && (! ($filters['status'] ?? null) || ($filters['status'] === 'PASS' ? $r['gate'] === 'PASS' : $r['gate'] !== 'PASS')))->values();

        return $this->page('RecurrenceTest', [
            'results' => AdminData::RECURRENCE_RESULTS,
            'trend' => AdminData::PASS_TREND,
            'reasons' => AdminData::FAILURE_REASONS,
            'run' => $run ? $this->opRow($run) : null,
            'catalogue' => $rows,
            'filters' => ['class' => $filters['class'] ?? '', 'status' => $filters['status'] ?? ''],
            'live' => ['tested' => $plans->count(), 'passed' => $plans->where('recurrence_gate', 'PASS')->count()],
        ]);
    }

    /** Row-level test of every plan. No bulk PASS and no manual override (Blueprint 2.3, 14.8). */
    public function runTest(): RedirectResponse
    {
        $plans = Plan::all();
        $failures = [];

        foreach ($plans as $plan) {
            $result = $plan->evaluateRecurrence();
            $plan->forceFill(['recurrence_gate' => $result])->save();
            if ($result !== 'PASS') {
                $failures[] = [$plan->name, $plan->classLabel(), $result, now()->format('H:i')];
            }
        }

        $ref = 'RT-'.now()->format('Y-m-d-Hi');
        SubOp::updateOrCreate(['kind' => 'recurrence_run', 'reference' => $ref], [
            'title' => 'Manual recurrence test', 'status' => $failures ? 'FAIL' : 'PASS', 'due_at' => now(),
            'data' => ['type' => 'Manual', 'triggered_by' => auth()->user()->name, 'environment' => 'Production', 'engine' => 'Recurrence Engine v2.4.1',
                'records' => $plans->count(), 'rules' => 11, 'baseline' => 'v2026.05.01', 'failures' => $failures],
        ]);
        $this->audit('recurrence_test_run', ['run' => $ref, 'tested' => $plans->count(), 'failed' => count($failures)]);

        return back()->with('success', "Recurrence test {$ref} completed: ".($plans->count() - count($failures))." passed, ".count($failures).' need attention.');
    }

    /* ------------------------------------------------------------------ catalogue and class register */

    public function catalogue(Request $request): Response
    {
        $filters = $request->validate([
            'class' => ['nullable', Rule::in(['R1', 'R2', 'R3', 'R4', 'R5', 'R0'])],
            'status' => ['nullable', Rule::in(['live', 'under_review', 'retired'])],
            'q' => ['nullable', 'string', 'max:60'],
        ]);
        $plans = Plan::query()
            ->when($filters['class'] ?? null, fn ($q, $c) => $c === 'R0' ? $q->where('status', 'retired') : $q->where('recurrence_class', $c))
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($filters['q'] ?? null, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('recurrence_class')->orderBy('name')->get();
        $all = Plan::all();

        $classes = collect(AdminData::CLASS_REGISTER)->map(function ($c, $code) use ($all) {
            $mine = $all->where('recurrence_class', $code);

            return [
                'code' => $code, 'name' => $c[0], 'body' => $c[1],
                'plans' => $c[2] + $mine->count(), 'active' => $c[3] + $mine->where('status', 'live')->count(),
                'review' => $c[4] + $mine->where('status', 'under_review')->count(), 'retired' => $c[5] + $mine->where('status', 'retired')->count(),
                'first' => $c[6], 'updated' => $mine->max('updated_at')?->toIso8601String(),
            ];
        })->values();

        return $this->page('Catalogue', [
            'classes' => $classes,
            'plans' => $plans->map(fn (Plan $p) => [...$p->toCard(), 'gate' => $p->recurrence_gate, 'evidence_id' => $p->evidence_id, 'certified_until' => $p->certified_until?->toDateString(), 'subscribers' => $p->subscriptions()->whereNotIn('status', ['CANCELLED', 'CLOSED_NONPAYMENT', 'PENDING_PAYMENT'])->count()]),
            'filters' => ['class' => $filters['class'] ?? '', 'status' => $filters['status'] ?? '', 'q' => $filters['q'] ?? ''],
        ]);
    }

    public function storePlan(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'recurrence_class' => ['required', Rule::in(['R1', 'R2', 'R3', 'R4', 'R5'])],
            'category' => ['required', 'string', 'max:60'],
            'monthly_zar' => ['required', 'integer', 'min:1'],
            'cost_zar' => ['required', 'integer', 'min:0'],
            'next_period_value' => ['required', 'string', 'max:300'],
            'delivery_cadence' => ['required', 'string', 'max:80'],
        ]);

        $plan = Plan::create([
            ...$data,
            'code' => 'SUB-'.strtoupper(Str::random(5)),
            'slug' => Str::slug($data['name']).'-'.strtolower(Str::random(4)),
            'tier' => 'product', 'ladder' => Str::slug($data['name']),
            'floor_zar' => (int) ceil($data['cost_zar'] / (1 - AdminData::FLOOR_MARGIN / 100)),
            'description' => $data['next_period_value'], 'what_recurs' => $data['next_period_value'], 'tagline' => $data['next_period_value'],
            'status' => 'under_review', 'evidence_id' => null, 'features' => [], 'entitlements' => [],
        ]);
        $plan->forceFill(['recurrence_gate' => $plan->evaluateRecurrence()])->save();
        $this->audit('plan_proposed', ['plan' => $plan->name, 'class' => $plan->recurrence_class], null, $plan->id);

        return back()->with('success', "{$plan->name} added to the register as Under Review.");
    }

    /** Certification requires a row-level recurrence PASS with evidence (GATE-SU-01). */
    public function certify(Request $request, Plan $plan): RedirectResponse
    {
        $evidence = $request->validate(['evidence_id' => ['nullable', 'string', 'max:40']])['evidence_id'] ?? null;
        if ($evidence) {
            $plan->evidence_id = $evidence;
        }
        $result = $plan->evaluateRecurrence();
        $plan->recurrence_gate = $result;

        if ($result !== 'PASS') {
            $plan->save();
            throw ValidationException::withMessages(['plan' => "{$plan->name} cannot be certified: {$result}."]);
        }

        $plan->forceFill(['status' => 'live', 'certified_until' => now()->addMonths(6)->endOfMonth()])->save();
        $this->audit('plan_certified', ['plan' => $plan->name, 'evidence_id' => $plan->evidence_id], null, $plan->id);

        return back()->with('success', "{$plan->name} certified and live.");
    }

    public function retire(Plan $plan): RedirectResponse
    {
        $active = $plan->subscriptions()->whereIn('status', ['ACTIVE', 'PAUSED', 'IN_GRACE', 'PAST_DUE'])->count();
        $plan->forceFill(['status' => 'retired', 'sales_blocked' => true])->save();
        $this->audit('plan_retired', ['plan' => $plan->name, 'active_subscribers' => $active], null, $plan->id);

        return back()->with('success', "{$plan->name} retired. New sales are frozen; {$active} active subscriber(s) need a migration or exit plan.");
    }

    /** Creates a new price version for every live subscriber with 30 days notice and an exit right. */
    public function priceChange(Request $request, Plan $plan): RedirectResponse
    {
        $data = $request->validate([
            'new_price_zar' => ['required', 'integer', 'min:1'],
            'notice_days' => ['required', 'integer', 'min:'.Lifecycle::PRICE_NOTICE_DAYS, 'max:180'],
        ]);

        $effective = now()->startOfDay()->addDays((int) $data['notice_days']);
        $subs = $plan->subscriptions()->whereIn('status', ['ACTIVE', 'PAUSED'])->get();
        foreach ($subs as $sub) {
            Lifecycle::announcePriceChange($sub, (int) $data['new_price_zar'], $effective);
        }
        $old = $plan->monthly_zar;
        $plan->forceFill(['monthly_zar' => (int) $data['new_price_zar']])->save();
        $this->audit('price_version_created', ['plan' => $plan->name, 'old' => $old, 'new' => $data['new_price_zar'], 'effective_at' => $effective->toDateString(), 'subscribers_notified' => $subs->count()], null, $plan->id);

        return back()->with('success', "New price for {$plan->name} published. {$subs->count()} subscriber(s) notified with an exit right until ".$effective->copy()->subDay()->format('d M Y').'.');
    }

    /* ------------------------------------------------------------------ deferred revenue */

    public function deferredRevenue(): Response
    {
        $today = now()->startOfDay();
        $lines = SubOp::kind('deferred_line')->orderBy('reference', 'desc')->get()->map(function (SubOp $op) use ($today) {
            $start = Carbon::parse($op->data['start']);
            $end = Carbon::parse($op->data['end']);
            $total = max(1, $start->diffInDays($end) + 1);
            $elapsed = max(0, min($total, (int) $start->diffInDays($today, false)));
            $months = max(0, min(12, (int) floor($elapsed / 30.4)));
            $recognised = round($op->amount_zar * $months / 12, 2);
            $next = $start->copy()->addMonthsNoOverflow($months + 1);

            return [...$this->opRow($op), 'recognised' => $recognised, 'remaining' => $op->amount_zar - $recognised, 'next_recognition' => $next->toDateString(), 'days_remaining' => (int) $today->diffInDays($next, false)];
        });

        // Annual subscriptions sold on the platform are added as live deferred lines.
        $annual = Subscription::with('plan', 'user')->where('billing_interval', 'annual')->whereIn('status', ['ACTIVE', 'CANCELLED_PENDING', 'PAUSED'])->get()->map(function (Subscription $s) use ($today) {
            $months = $s->current_period_start ? min(12, (int) floor($s->current_period_start->diffInDays($today) / 30.4)) : 0;
            $recognised = round($s->price_zar * $months / 12, 2);

            return ['id' => 'S'.$s->id, 'reference' => $s->order_reference ?? $s->reference, 'client' => $s->user?->company ?? $s->user?->name, 'plan_name' => $s->plan->name,
                'recurrence_class' => $s->plan->recurrence_class, 'status' => 'Active', 'amount_zar' => $s->price_zar, 'due_at' => null,
                'data' => ['start' => $s->current_period_start?->toDateString(), 'end' => $s->current_period_end?->toDateString()],
                'recognised' => $recognised, 'remaining' => $s->price_zar - $recognised,
                'next_recognition' => $s->current_period_start?->copy()->addMonthsNoOverflow($months + 1)->toDateString(), 'days_remaining' => 0];
        });

        $adjustments = SubOp::kind('adjustment')->latest('id')->limit(5)->get()->map(fn ($o) => $this->opRow($o));

        return $this->page('DeferredRevenue', [
            'lines' => $lines->concat($annual)->values(),
            'aging' => AdminData::DEFERRED_AGING,
            'trend' => AdminData::DEFERRED_TREND,
            'byClass' => AdminData::DEFERRED_BY_CLASS,
            'adjustments' => $adjustments,
            'manual' => (float) SubOp::kind('adjustment')->sum('amount_zar'),
        ]);
    }

    public function adjustment(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'reference' => ['required', 'string', 'max:40'],
            'amount_zar' => ['required', 'integer', 'not_in:0'],
            'reason' => ['required', 'string', 'max:200'],
        ]);

        SubOp::create(['kind' => 'adjustment', 'reference' => 'ADJ-'.strtoupper(Str::random(6)), 'title' => $data['reason'], 'status' => 'Posted', 'amount_zar' => $data['amount_zar'], 'due_at' => now(), 'data' => ['source' => $data['reference']]]);
        $this->audit('deferred_revenue_adjustment', $data);

        return back()->with('success', 'Manual recognition adjustment posted to the journal.');
    }

    /* ------------------------------------------------------------------ billing calendar and run monitor */

    public function billingCalendar(Request $request): Response
    {
        $month = Carbon::parse(($request->validate(['month' => ['nullable', 'date_format:Y-m']])['month'] ?? now()->format('Y-m')).'-01');
        $runs = SubOp::kind('billing_run')->orderBy('due_at')->get();
        $platformDue = Subscription::with('plan')->where('status', 'ACTIVE')->whereNotNull('next_charge_at')->orderBy('next_charge_at')->limit(20)->get();

        return $this->page('BillingCalendar', [
            'month' => $month->format('Y-m'),
            'runs' => $runs->map(fn ($o) => $this->opRow($o)),
            'performance' => AdminData::RUN_PERFORMANCE,
            'exceptions' => AdminData::INVOICE_EXCEPTIONS,
            'channels' => AdminData::CHANNELS,
            'due' => $platformDue->map(fn ($s) => ['reference' => $s->reference, 'plan' => $s->plan->name, 'next_charge_at' => $s->next_charge_at->toDateString(), 'price_zar' => $s->price_zar, 'blockers' => Lifecycle::chargeBlockers($s)]),
            'orders' => [
                'month' => Order::where('section', 'subscriptions')->where('created_at', '>=', now()->startOfMonth())->count(),
                'paid' => Order::where('section', 'subscriptions')->where('status', 'paid')->count(),
                'failed' => Order::where('section', 'subscriptions')->where('status', 'failed')->count(),
            ],
        ]);
    }

    /** Ad-hoc run: charges every due subscription that passes the Universal Next-Period Gate. */
    public function triggerRun(Request $request): RedirectResponse
    {
        $type = $request->validate(['type' => ['nullable', Rule::in(['Ad-hoc', 'Retry'])]])['type'] ?? 'Ad-hoc';
        $ref = 'RUN-'.now()->format('Ymd-His');
        $due = Subscription::with('plan')->where('status', 'ACTIVE')->whereDate('next_charge_at', '<=', now()->addDays($type === 'Retry' ? 0 : 1))->get();
        $tally = ['SUCCESS' => 0, 'HOLD' => 0, 'DECLINED' => 0, 'DUPLICATE_BLOCKED' => 0];
        $value = 0;

        foreach ($due as $sub) {
            Lifecycle::sweep($sub);
            $outcome = Lifecycle::runCharge($sub->refresh()->load('plan'), $ref);
            $tally[$outcome] = ($tally[$outcome] ?? 0) + 1;
            if ($outcome === 'SUCCESS') {
                $value += $sub->price_zar;
            }
        }

        SubOp::create(['kind' => 'billing_run', 'reference' => $ref, 'title' => "{$type} Run – ".now()->format('d M Y'), 'status' => 'Completed', 'amount_zar' => $value, 'due_at' => now(),
            'data' => ['type' => $type, 'invoices' => $tally['SUCCESS'], 'tally' => $tally]]);
        $this->audit('billing_run_triggered', ['run' => $ref, ...$tally]);

        return back()->with('success', "{$ref}: {$tally['SUCCESS']} charged, {$tally['HOLD']} held by gate, {$tally['DECLINED']} declined.");
    }

    /* ------------------------------------------------------------------ dunning */

    public function dunning(): Response
    {
        $cases = SubOp::kind('dunning_case')->orderBy('due_at')->get()->map(fn ($o) => [...$this->opRow($o), 'days_overdue' => (int) $o->due_at->diffInDays(now())]);
        $platform = Subscription::with('plan', 'user')->whereIn('status', ['IN_GRACE', 'PAST_DUE'])->get()->map(fn (Subscription $s) => [
            'reference' => $s->reference, 'client' => $s->user?->company ?? $s->user?->name, 'plan' => $s->plan->classLabel(), 'amount_zar' => $s->overdue_zar,
            'status' => $s->status, 'stage' => $s->meta['dunning']['stage'] ?? 'Payment Failed', 'failed_at' => $s->payment_failed_at?->toDateString(),
            'days_overdue' => $s->payment_failed_at ? (int) $s->payment_failed_at->diffInDays(now()) : 0,
        ]);

        return $this->page('Dunning', [
            'cases' => $cases,
            'platform' => $platform,
            'aging' => AdminData::DUNNING_AGING,
            'funnel' => AdminData::DUNNING_FUNNEL,
            'closed' => Subscription::where('status', 'CLOSED_NONPAYMENT')->count(),
            'stages' => Lifecycle::DUNNING_STAGES,
        ]);
    }

    public function dunningAction(Request $request, SubOp $op): RedirectResponse
    {
        abort_unless($op->kind === 'dunning_case', 404);
        $action = $request->validate(['action' => ['required', Rule::in(['notice', 'paid', 'arrangement', 'churn', 'reactivate'])]])['action'];
        $data = $op->data ?? [];
        $stages = Lifecycle::DUNNING_STAGES;

        switch ($action) {
            case 'notice':
                $i = array_search($data['stage'] ?? 'Payment Failed', $stages, true);
                if ($i === false || $i >= count($stages) - 1) {
                    throw ValidationException::withMessages(['action' => 'The final notice has already been sent.']);
                }
                $data['stage'] = $stages[$i + 1];
                $data['last_contact'] = now()->toDateString();
                $op->status = $data['stage'] === 'Final Notice Sent' ? 'At Risk' : 'In Dunning';
                break;
            case 'paid':
                $op->status = 'Recovered';
                break;
            case 'arrangement':
                $op->status = 'Payment Arrangement';
                break;
            case 'churn':
                if (($data['stage'] ?? null) !== 'Final Notice Sent') {
                    throw ValidationException::withMessages(['action' => 'Involuntary churn is only triggered after final notice and expiry of the grace period.']);
                }
                $op->status = 'Churned';
                break;
            case 'reactivate':
                if ($op->status !== 'Churned') {
                    throw ValidationException::withMessages(['action' => 'Only churned accounts can be reactivated.']);
                }
                $op->status = 'Recovered';
                break;
        }

        $op->data = $data;
        $op->save();
        $this->audit('dunning_'.$action, ['case' => $op->reference, 'client' => $op->client, 'status' => $op->status]);

        return back()->with('success', "{$op->client}: {$op->status}".(isset($data['stage']) && $action === 'notice' ? " ({$data['stage']})" : '').'.');
    }

    public function dunningSubscription(Request $request, Subscription $subscription): RedirectResponse
    {
        $action = $request->validate(['action' => ['required', Rule::in(['notice', 'paid', 'churn'])]])['action'];
        $subscription->load('plan');

        $message = match ($action) {
            'notice' => 'Sent: '.Lifecycle::advanceDunning($subscription),
            'paid' => tap('Marked as paid outside Portal; access restored.', fn () => Lifecycle::recover($subscription, 'outside_portal')),
            'churn' => tap('Closed for non-payment (CH-INV). History and data are retained.', fn () => Lifecycle::closeNonPayment($subscription)),
        };

        return back()->with('success', "{$subscription->reference}: {$message}");
    }

    /* ------------------------------------------------------------------ engagement and disuse */

    public function engagement(Request $request): Response
    {
        $filters = $request->validate(['risk' => ['nullable', Rule::in(['At Risk', 'High Risk'])], 'outreach' => ['nullable', 'string', 'max:30'], 'q' => ['nullable', 'string', 'max:60']]);
        $cases = SubOp::kind('disuse_case')->orderBy('due_at')->get()
            ->filter(fn ($o) => (! ($filters['risk'] ?? null) || ($o->data['risk'] ?? '') === $filters['risk'])
                && (! ($filters['outreach'] ?? null) || ($o->data['outreach'] ?? '') === $filters['outreach'])
                && (! ($filters['q'] ?? null) || str_contains(strtolower($o->client.' '.$o->plan_name.' '.$o->reference), strtolower($filters['q']))))
            ->values()->map(fn ($o) => [...$this->opRow($o), 'days_inactive' => (int) Carbon::parse($o->data['last_activity'])->diffInDays(now())]);

        $platform = Subscription::with('plan', 'user')->where('status', 'ACTIVE')->get()->map(fn (Subscription $s) => [
            'reference' => $s->reference, 'client' => $s->user?->company ?? $s->user?->name, 'plan' => $s->plan->name, 'class' => $s->plan->recurrence_class,
            'score' => $s->engagementScore(), 'days_inactive' => (int) ($s->usage['days_inactive'] ?? 0), 'idle_periods' => (int) ($s->usage['idle_periods'] ?? 0),
            'confidence' => $s->usage['confidence'] ?? 'HIGH', 'flagged' => $s->disuse_flagged, 'qualifies' => Lifecycle::disuseQualifies($s),
        ]);

        return $this->page('Engagement', [
            'cases' => $cases,
            'platform' => $platform,
            'health' => AdminData::ENGAGEMENT_HEALTH,
            'trend' => AdminData::ENGAGEMENT_TREND,
            'indicators' => AdminData::DISUSE_INDICATORS,
            'byClass' => AdminData::DISUSE_BY_CLASS,
            'filters' => ['risk' => $filters['risk'] ?? '', 'outreach' => $filters['outreach'] ?? '', 'q' => $filters['q'] ?? ''],
        ]);
    }

    /** Applies the class-specific disuse thresholds to live subscriptions (Blueprint 5.1 - 5.3). */
    public function runDisuseCheck(): RedirectResponse
    {
        $flagged = 0;
        Subscription::with('plan')->where('status', 'ACTIVE')->get()->each(function (Subscription $s) use (&$flagged) {
            if (Lifecycle::flagDisuse($s)) {
                $flagged++;
            }
        });
        $this->audit('disuse_check_run', ['flagged' => $flagged]);

        return back()->with('success', "Disuse check complete: {$flagged} new qualified episode(s) disclosed to clients.");
    }

    public function disuseAction(Request $request, SubOp $op): RedirectResponse
    {
        abort_unless($op->kind === 'disuse_case', 404);
        $action = $request->validate(['action' => ['required', Rule::in(['reminder', 'email', 'call', 'waiver', 'reengaged'])]])['action'];
        $data = $op->data ?? [];

        match ($action) {
            'reminder', 'email' => $data['outreach'] = 'Email Sent',
            'call' => $data['outreach'] = 'Call Scheduled',
            'waiver' => $op->status = 'waived',
            'reengaged' => $op->status = 'reengaged',
        };
        $op->data = $data;
        $op->save();
        $this->audit('disuse_'.$action, ['case' => $op->reference, 'client' => $op->client]);

        return back()->with('success', "{$op->client}: ".match ($action) {
            'reminder' => 'value reminder sent', 'email' => 're-engagement email sent', 'call' => 'phone call task created',
            'waiver' => 'disuse waiver applied', 'reengaged' => 'marked as re-engaged',
        }.'.');
    }

    /* ------------------------------------------------------------------ recurring delivery calendar */

    public function deliveryCalendar(Request $request): Response
    {
        $filters = $request->validate(['month' => ['nullable', 'date_format:Y-m'], 'class' => ['nullable', Rule::in(['R1', 'R2', 'R3', 'R4', 'R5'])], 'status' => ['nullable', Rule::in(['Completed', 'Upcoming', 'Overdue'])]]);
        $month = Carbon::parse(($filters['month'] ?? now()->format('Y-m')).'-01');

        // Overdue = upcoming deliveries whose time has passed.
        SubOp::kind('delivery')->where('status', 'Upcoming')->where('due_at', '<', now()->startOfDay())->update(['status' => 'Overdue']);

        $items = SubOp::kind('delivery')
            ->whereBetween('due_at', [$month->copy()->startOfMonth()->subDays(7), $month->copy()->endOfMonth()->addDays(7)])
            ->when($filters['class'] ?? null, fn ($q, $c) => $q->where('recurrence_class', $c))
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('due_at')->get();
        $monthItems = SubOp::kind('delivery')->whereBetween('due_at', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])->get();

        return $this->page('DeliveryCalendar', [
            'month' => $month->format('Y-m'),
            'items' => $items->map(fn ($o) => $this->opRow($o)),
            'upcoming' => SubOp::kind('delivery')->where('status', 'Upcoming')->where('due_at', '>=', now()->startOfDay())->orderBy('due_at')->limit(5)->get()->map(fn ($o) => $this->opRow($o)),
            'stats' => [
                'total' => $monthItems->count(), 'value' => (int) $monthItems->sum('amount_zar'),
                'completed' => $monthItems->where('status', 'Completed')->count(), 'completed_value' => (int) $monthItems->where('status', 'Completed')->sum('amount_zar'),
                'upcoming' => $monthItems->where('status', 'Upcoming')->count(), 'upcoming_value' => (int) $monthItems->where('status', 'Upcoming')->sum('amount_zar'),
                'overdue' => SubOp::kind('delivery')->where('status', 'Overdue')->count(), 'overdue_value' => (int) SubOp::kind('delivery')->where('status', 'Overdue')->sum('amount_zar'),
                'renewals' => Subscription::where('status', 'ACTIVE')->whereBetween('next_charge_at', [now(), now()->addDays(30)])->count(),
                'subscriptions' => Subscription::whereIn('status', ['ACTIVE', 'CANCELLED_PENDING'])->count(),
            ],
            'filters' => ['class' => $filters['class'] ?? '', 'status' => $filters['status'] ?? ''],
        ]);
    }

    public function storeDelivery(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'recurrence_class' => ['required', Rule::in(['R1', 'R2', 'R3', 'R4', 'R5'])],
            'type' => ['required', 'string', 'max:40'],
            'client' => ['required', 'string', 'max:80'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'category' => ['required', Rule::in(['review', 'delivery', 'update', 'capacity'])],
        ]);

        SubOp::create(['kind' => 'delivery', 'reference' => 'DLV-'.strtoupper(Str::random(6)), 'title' => "{$data['recurrence_class']} {$data['type']}", 'client' => $data['client'],
            'recurrence_class' => $data['recurrence_class'], 'status' => 'Upcoming', 'due_at' => Carbon::parse("{$data['date']} {$data['time']}"), 'amount_zar' => 0, 'data' => ['category' => $data['category']]]);
        $this->audit('delivery_added', $data);

        return back()->with('success', 'Delivery scheduled.');
    }

    public function deliveryAction(Request $request, SubOp $op): RedirectResponse
    {
        abort_unless($op->kind === 'delivery', 404);
        $data = $request->validate(['action' => ['required', Rule::in(['complete', 'reschedule', 'remind'])], 'date' => ['required_if:action,reschedule', 'nullable', 'date', 'after_or_equal:today']]);

        match ($data['action']) {
            'complete' => $op->status = 'Completed',
            'reschedule' => [$op->due_at = Carbon::parse($data['date'])->setTimeFrom($op->due_at), $op->status = 'Upcoming'],
            'remind' => null,
        };
        $op->save();
        $this->audit('delivery_'.$data['action'], ['delivery' => $op->reference, 'title' => $op->title]);

        return back()->with('success', "{$op->title} for {$op->client}: ".['complete' => 'marked completed', 'reschedule' => 'rescheduled', 'remind' => 'reminder sent'][$data['action']].'.');
    }

    /* ------------------------------------------------------------------ review capacity */

    public function capacity(): Response
    {
        return $this->page('Capacity', [
            'rows' => Capacity::rows(),
            'trend' => AdminData::CAPACITY_TREND,
            'commitments' => SubOp::kind('capacity')->get()->map(fn ($o) => ['id' => $o->id, 'class' => $o->recurrence_class, 'boost' => $o->data['boost_hours'] ?? 0]),
        ]);
    }

    public function capacityAction(Request $request, SubOp $op): RedirectResponse
    {
        abort_unless($op->kind === 'capacity', 404);
        $data = $request->validate(['action' => ['required', Rule::in(['increase', 'boost', 'reduce'])], 'hours' => ['required', 'numeric', 'min:1', 'max:2000']]);
        $d = $op->data ?? [];
        $hours = (float) $data['hours'];

        if ($data['action'] === 'reduce') {
            $rows = collect(Capacity::rows())->keyBy('class');
            if (($rows[$op->recurrence_class]['demand_hours'] ?? 0) > ($d['committed_hours'] - $hours)) {
                throw ValidationException::withMessages(['hours' => 'Capacity cannot be reduced below current review demand.']);
            }
            $d['committed_hours'] -= $hours;
        } else {
            $d['committed_hours'] += $hours;
            if ($data['action'] === 'boost') {
                $d['boost_hours'] = ($d['boost_hours'] ?? 0) + $hours;
            }
        }
        $op->data = $d;
        $op->save();
        $this->audit('capacity_'.$data['action'], ['class' => $op->recurrence_class, 'hours' => $hours, 'committed' => $d['committed_hours']]);

        return back()->with('success', "{$op->title}: committed capacity is now ".number_format($d['committed_hours'], 1).' hrs.');
    }

    /* ------------------------------------------------------------------ churn */

    public function churn(Request $request): Response
    {
        $filters = $request->validate(['type' => ['nullable', Rule::in(['Voluntary', 'Involuntary', 'Proactive'])], 'q' => ['nullable', 'string', 'max:60']]);

        $rows = SubOp::kind('churn')->orderByDesc('due_at')->get()->map(fn ($o) => $this->opRow($o));
        $platform = Subscription::with('plan', 'user')->whereIn('status', ['CANCELLED', 'CANCELLED_PENDING', 'CLOSED_NONPAYMENT'])->get()->map(fn (Subscription $s) => [
            'id' => 'S'.$s->id, 'reference' => $s->reference, 'title' => null, 'client' => $s->user?->company ?? $s->user?->name, 'plan_name' => $s->plan->classLabel(),
            'recurrence_class' => $s->plan->recurrence_class, 'status' => ['CH-INV' => 'Involuntary', 'CH-PRO' => 'Proactive'][$s->churn_code] ?? 'Voluntary',
            'amount_zar' => $s->price_zar, 'due_at' => ($s->cancel_requested_at ?? $s->updated_at)?->toIso8601String(),
            'data' => ['tenure' => $s->started_at ? $s->started_at->diffInMonths(now()) < 1 ? $s->started_at->diffInDays(now()).'d' : (int) $s->started_at->diffInMonths(now()).'m' : '—',
                'cause' => $s->churn_code === 'CH-INV' ? 'Payment failed' : ($s->cancel_reason ?: 'Not provided'), 'detail' => $s->churn_code, 'action' => $s->status === 'CANCELLED_PENDING' ? 'Effective '.$s->cancel_effective_at?->format('d M Y') : 'Exit Survey sent'],
        ]);

        $all = $platform->concat($rows)->filter(fn ($r) => (! ($filters['type'] ?? null) || $r['status'] === $filters['type'])
            && (! ($filters['q'] ?? null) || str_contains(strtolower($r['client'].' '.$r['plan_name'].' '.$r['reference']), strtolower($filters['q']))))->values();

        return $this->page('Churn', [
            'rows' => $all,
            'causes' => AdminData::CHURN_CAUSES,
            'trend' => AdminData::CHURN_TREND,
            'byClass' => AdminData::CHURN_BY_CLASS,
            'topLtm' => AdminData::CHURN_TOP_LTM,
            'platform' => ['count' => $platform->count(), 'mrr' => (int) $platform->sum('amount_zar'), 'codes' => Subscription::whereNotNull('churn_code')->get()->groupBy('churn_code')->map->count()],
            'plans' => SubOp::kind('action_plan')->latest('id')->limit(5)->get()->map(fn ($o) => $this->opRow($o)),
            'filters' => ['type' => $filters['type'] ?? '', 'q' => $filters['q'] ?? ''],
        ]);
    }

    public function actionPlan(Request $request): RedirectResponse
    {
        $data = $request->validate(['cause' => ['required', 'string', 'max:60'], 'action' => ['required', 'string', 'max:300'], 'owner' => ['required', 'string', 'max:60']]);
        SubOp::create(['kind' => 'action_plan', 'reference' => 'CAP-'.strtoupper(Str::random(6)), 'title' => $data['action'], 'status' => 'Open', 'due_at' => now()->addDays(30), 'data' => $data]);
        $this->audit('churn_action_plan', $data);

        return back()->with('success', 'Retention action plan created.');
    }

    /* ------------------------------------------------------------------ below-floor monitor */

    public function belowFloor(): Response
    {
        $plans = Plan::where('status', 'live')->whereNotNull('monthly_zar')->get();
        $below = $plans->filter->isBelowFloor()->values();
        $subscribers = collect(AdminData::BELOW_FLOOR_SUBSCRIBERS)->map(function ($r) use ($plans) {
            $plan = $plans->firstWhere('slug', $r[1]);

            return ['client' => $r[0], 'slug' => $r[1], 'plan' => $r[2], 'since' => $r[3], 'mrr' => $r[4], 'next_review' => $r[5], 'status' => $plan && $plan->isBelowFloor() ? 'At Risk' : 'Remediated'];
        });

        return $this->page('BelowFloor', [
            'plans' => $below->map(fn (Plan $p) => [...$p->toCard(), 'sales_blocked' => $p->sales_blocked, 'cost_zar' => $p->cost_zar, 'subscription_type' => $p->details['subscription_type'] ?? 'Monthly',
                'variance' => $p->monthly_zar - $p->floor_zar, 'variance_pct' => round(($p->monthly_zar - $p->floor_zar) / $p->floor_zar * 100, 1)]),
            'subscribers' => $subscribers,
            'trend' => AdminData::MRR_AT_RISK,
            'live' => $plans->count(),
            'blockLog' => SubEvent::whereIn('event_type', ['floor_block_sales', 'floor_remediate', 'floor_check_run'])->latest('id')->limit(8)->get(['event_type', 'payload', 'created_at']),
            'margin' => AdminData::FLOOR_MARGIN,
            'remediated' => SubEvent::where('event_type', 'floor_remediate')->where('created_at', '>=', now()->subDays(30))->count(),
            'blocked' => SubEvent::where('event_type', 'floor_block_sales')->where('created_at', '>=', now()->subDays(30))->count(),
        ]);
    }

    /** Recomputes every floor: (direct + indirect cost) / (1 - target margin), rounded up to R1. */
    public function floorCheck(): RedirectResponse
    {
        $changed = 0;
        Plan::whereNotNull('cost_zar')->get()->each(function (Plan $p) use (&$changed) {
            $floor = (int) ceil($p->cost_zar / (1 - AdminData::FLOOR_MARGIN / 100));
            if ($floor !== $p->floor_zar) {
                $p->forceFill(['floor_zar' => $floor])->save();
                $changed++;
            }
        });
        $below = Plan::where('status', 'live')->get()->filter->isBelowFloor()->count();
        $this->audit('floor_check_run', ['floors_updated' => $changed, 'below_floor' => $below]);

        return back()->with('success', "Floor check complete: {$below} live plan(s) below floor; {$changed} floor(s) updated.");
    }

    public function floorAction(Request $request, Plan $plan): RedirectResponse
    {
        $action = $request->validate(['action' => ['required', Rule::in(['block', 'unblock', 'remediate'])]])['action'];

        if ($action === 'block' || $action === 'unblock') {
            $plan->forceFill(['sales_blocked' => $action === 'block'])->save();
            $this->audit('floor_block_sales', ['plan' => $plan->name, 'blocked' => $action === 'block'], null, $plan->id);

            return back()->with('success', $action === 'block' ? "New sales and renewals blocked for {$plan->name}." : "Sales re-opened for {$plan->name}.");
        }

        // Remediate: raise to floor as a new price version; subscribers get 30 days notice and an exit right.
        if (! $plan->isBelowFloor()) {
            throw ValidationException::withMessages(['action' => 'This plan is already at or above floor.']);
        }
        $old = $plan->monthly_zar;
        $effective = now()->startOfDay()->addDays(Lifecycle::PRICE_NOTICE_DAYS);
        $subs = $plan->subscriptions()->whereIn('status', ['ACTIVE', 'PAUSED'])->get();
        foreach ($subs as $sub) {
            Lifecycle::announcePriceChange($sub, $plan->floor_zar, $effective, 'Price raised to floor');
        }
        $plan->forceFill(['monthly_zar' => $plan->floor_zar, 'sales_blocked' => false])->save();
        $this->audit('floor_remediate', ['plan' => $plan->name, 'old' => $old, 'new' => $plan->floor_zar, 'subscribers_notified' => $subs->count()], null, $plan->id);

        return back()->with('success', "{$plan->name} raised to floor (R{$plan->floor_zar}). {$subs->count()} subscriber(s) notified with 30 days notice and an exit right.");
    }
}
