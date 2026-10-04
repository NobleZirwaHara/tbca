<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\ExceptionItem;
use App\Models\Advisory\FeeRule;
use App\Models\Advisory\Setting;
use App\Models\Advisory\Supplier;
use App\Models\Advisory\TechEngagement;
use App\Support\Advisory\TechContent;
use App\Support\Advisory\TechWorkflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Technology Solutions admin: engagement control, fee rules, suppliers, exception queue and WhatsApp channel. */
class TechAdminController extends Controller
{
    public function engagements(Request $request): Response
    {
        $list = TechEngagement::query()->with('gates')->latest()->get();
        $value = $list->sum(fn ($e) => (int) round(TechContent::ledgerTotals($e->fee_lines ?? [])['t_fixed'] * 1.15));

        return Inertia::render('Advisory/Admin/TechEngagements', [
            'settings' => Setting::query()->orderBy('id')->get()->map(fn ($s) => [...$s->toArray(), 'updated' => $s->updated_at->format('d M Y, H:i')]),
            'engagements' => $list->map(fn ($e) => [...TechWorkspaceController::header($e), 'value' => (int) round(TechContent::ledgerTotals($e->fee_lines ?? [])['t_fixed'] * 1.15), 'uat' => $e->uat, 'gates' => $e->gates->map(fn ($g) => ['number' => $g->number, 'status' => $g->status])])->values(),
            'kpis' => ['active' => $list->whereIn('status', ['in_delivery', 'qa_review', 'payment_pending', 'approval_requested'])->count(), 'draft' => $list->where('status', 'disclosed')->count(),
                'signature' => $list->whereNull('letter_signed_at')->count(), 'overdue' => ExceptionItem::query()->where('status', '!=', 'resolved')->whereDate('sla_due', '<', now())->count(),
                'renewals' => $list->filter(fn ($e) => ($e->subscription['auto_renew'] ?? false) && ! empty($e->subscription['period_end']) && $e->subscription['period_end'] <= now()->addDays(30)->toDateString())->count(), 'value' => $value],
            'roles' => [['Super Admin', ['y', 'y', 'y', 'y', 'y']], ['Admin', ['y', 'y', 'y', 'y', 'y']], ['Account Manager', ['y', 'y', 'y', 'p', 'p']], ['Project Manager', ['y', 'y', 'y', 'y', 'p']], ['Client (Full Access)', ['y', 'y', 'y', 'y', 'n']], ['Client (Read Only)', ['y', 'y', 'n', 'n', 'n']]],
        ]);
    }

    public function setting(Request $request, Setting $setting): RedirectResponse
    {
        $d = $request->validate(['value' => ['required', 'string', 'max:80']]);
        $setting->update($d);

        return back()->with('success', "{$setting->label} updated.");
    }

    /** Ops actions on an engagement: advance UAT evidence, resolve defects, verify checks, present next gate. */
    public function engagementAction(Request $request, TechEngagement $engagement): RedirectResponse
    {
        $d = $request->validate(['action' => ['required', Rule::in(['resolve_defects', 'pass_checks', 'meter', 'present_gate'])]]);
        $u = $engagement->uat ?? [];
        switch ($d['action']) {
            case 'resolve_defects':
                $u['defects_open'] = 0;
                $u['critical_open'] = 0;
                $u['towers'] = array_map(fn ($t) => [...$t, 'passed' => $t['passed'] + $t['failed'] + $t['blocked'], 'failed' => 0, 'blocked' => 0], $u['towers'] ?? []);
                $engagement->update(['uat' => $u]);
                break;
            case 'pass_checks':
                $u['checks'] = ['performance' => true, 'security' => true];
                $engagement->update(['uat' => $u]);
                break;
            case 'meter':
                $m = $engagement->meters ?? TechWorkflow::defaultMeters();
                $m['services'] = array_map(fn ($s) => [...$s, 'used' => min($s['inclusion'] * 2, $s['used'] + (int) ceil($s['inclusion'] * 0.1))], $m['services']);
                $m['consumed'] = min($m['cap'] * 2, $m['consumed'] + (int) round($m['cap'] * 0.08));
                $engagement->update(['meters' => $m]);
                break;
            case 'present_gate':
                $g = $engagement->gates()->where('status', 'review_requested')->first();
                $g?->update(['status' => 'presented', 'expires_at' => now()->addDays(14)]);
                break;
        }
        $engagement->addTimeline('Admin action: '.str_replace('_', ' ', $d['action']), $request->user()->name);

        return back()->with('success', 'Engagement updated.');
    }

    public function feeRules(Request $request): Response
    {
        $f = $request->only(['q', 'tower', 'status', 'type']);
        $q = FeeRule::query()
            ->when($f['q'] ?? null, fn ($b, $v) => $b->where(fn ($w) => $w->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%")))
            ->when($f['tower'] ?? null, fn ($b, $v) => $b->where('tower', $v))
            ->when($f['status'] ?? null, fn ($b, $v) => $b->where('status', $v))
            ->when($f['type'] ?? null, fn ($b, $v) => $b->where('rule_type', $v))
            ->orderBy('code');
        $all = FeeRule::query()->get();

        return Inertia::render('Advisory/Admin/FeeRules', [
            'rules' => $q->paginate(8)->withQueryString()->through(fn ($r) => [...$r->toArray(), 'updated' => $r->updated_at->format('d M Y, H:i')]), 'filters' => $f,
            'kpis' => ['total' => $all->count(), 'active' => $all->where('status', 'active')->count(), 'draft' => $all->where('status', 'draft')->count(), 'archived' => $all->where('status', 'archived')->count(),
                'warning' => $all->where('health', 'warning')->count(), 'error' => $all->where('health', 'error')->count(), 'last' => $all->sortByDesc('updated_at')->first()?->only(['updated_by', 'updated_at'])],
            'towers' => ['All Towers', ...array_column(TechContent::towers(), 'code')], 'types' => ['Flat Fee', 'Tiered', 'Multiplier', 'Surcharge', 'Pass-Through', 'Discount', 'Recurring', 'Percentage'],
        ]);
    }

    /** Hard controls: pass-through can never carry a value (no markup); discounts > 10% stay in draft and raise an exception. */
    private function health(array $d): string
    {
        if ($d['rule_type'] === 'Pass-Through' && ($d['value'] ?? 0) > 0) {
            return 'error';
        }
        if ($d['rule_type'] === 'Discount' && ($d['value'] ?? 0) > 10) {
            return 'warning';
        }
        if ($d['rule_type'] === 'Flat Fee' && ($d['value'] ?? 0) > 0 && $d['value'] < 995) {
            return 'error';
        }

        return 'healthy';
    }

    public function feeRuleStore(Request $request): RedirectResponse
    {
        $d = $request->validate(['name' => ['required', 'string', 'max:120'], 'tower' => ['required', 'string'], 'applies_to' => ['required', 'string', 'max:80'], 'rule_type' => ['required', 'string'], 'priority' => ['required', Rule::in(['High', 'Medium', 'Low'])], 'value' => ['nullable', 'numeric', 'min:0']]);
        $n = FeeRule::query()->count() + 1;
        $health = $this->health($d);
        FeeRule::create([...$d, 'code' => sprintf('FR-%s-%04d', now()->format('Y'), $n), 'status' => 'draft', 'health' => $health, 'updated_by' => $request->user()->name]);
        if ($health !== 'healthy') {
            $this->exception('Fees', $health === 'error' ? 'Fee Rule Violation' : 'Discount Approval', "{$d['name']} — ".($health === 'error' ? 'violates floor / pass-through control' : 'discount > 10% requires approval'), $health === 'error' ? 'High' : 'Medium', $request->user()->name);
        }

        return back()->with('success', 'Rule created as draft (quarantined from live resolution until activated).');
    }

    public function feeRuleUpdate(Request $request, FeeRule $rule): RedirectResponse
    {
        $d = $request->validate(['action' => ['required', Rule::in(['activate', 'deactivate', 'archive', 'duplicate'])]]);
        if ($d['action'] === 'activate' && $rule->health === 'error') {
            return back()->with('error', 'A rule failing a hard control cannot be activated. No override turns a FAIL into a PASS.');
        }
        if ($d['action'] === 'duplicate') {
            $copy = $rule->replicate();
            $copy->code = sprintf('FR-%s-%04d', now()->format('Y'), FeeRule::query()->count() + 1);
            $copy->status = 'draft';
            $copy->updated_by = $request->user()->name;
            $copy->save();

            return back()->with('success', "Duplicated as {$copy->code}.");
        }
        $rule->update(['status' => ['activate' => 'active', 'deactivate' => 'draft', 'archive' => 'archived'][$d['action']], 'updated_by' => $request->user()->name]);

        return back()->with('success', "{$rule->code} {$d['action']}d.");
    }

    public function suppliers(Request $request): Response
    {
        $f = $request->only(['q', 'status', 'category']);
        $q = Supplier::query()
            ->when($f['q'] ?? null, fn ($b, $v) => $b->where(fn ($w) => $w->where('name', 'like', "%{$v}%")->orWhere('services', 'like', "%{$v}%")))
            ->when($f['status'] ?? null, fn ($b, $v) => $b->where('status', $v))
            ->when($f['category'] ?? null, fn ($b, $v) => $b->where('category', $v))
            ->orderBy('code');
        $all = Supplier::query()->get();
        $expiring = $all->filter(fn ($s) => $s->contract_end && $s->contract_end->between(now(), now()->addDays(30)))->count();

        return Inertia::render('Advisory/Admin/Suppliers', [
            'suppliers' => $q->paginate(8)->withQueryString()->through(fn ($s) => [...$s->toArray(), 'contract' => $s->contract_end?->format('d M Y'), 'over' => $s->rate_card_max_zar > 0 && $s->last_cost_zar > $s->rate_card_max_zar]),
            'filters' => $f, 'categories' => $all->pluck('category')->unique()->values(),
            'kpis' => ['total' => $all->count(), 'active' => $all->where('status', 'active')->count(), 'hold' => $all->where('status', 'on_hold')->count(), 'inactive' => $all->where('status', 'inactive')->count(),
                'expiring' => $expiring, 'cost' => $all->sum('last_cost_zar'), 'over' => $all->filter(fn ($s) => $s->rate_card_max_zar > 0 && $s->last_cost_zar > $s->rate_card_max_zar)->count(),
                'pending' => ExceptionItem::query()->where('area', 'Suppliers')->where('status', '!=', 'resolved')->count()],
        ]);
    }

    public function supplierStore(Request $request): RedirectResponse
    {
        $d = $request->validate(['name' => ['required', 'string', 'max:160'], 'category' => ['required', 'string', 'max:80'], 'services' => ['required', 'string', 'max:160'], 'contract_end' => ['required', 'date'], 'rate_card_max_zar' => ['required', 'integer', 'min:0']]);
        $n = Supplier::query()->count() + 1;
        Supplier::create([...$d, 'code' => sprintf('SUP-%s-%04d', now()->format('Y'), $n), 'status' => 'active', 'rate_card' => sprintf('RC-%s-%03d', now()->format('Y'), $n), 'last_cost_zar' => 0, 'rating' => 4]);

        return back()->with('success', 'Supplier added.');
    }

    public function supplierUpdate(Request $request, Supplier $supplier): RedirectResponse
    {
        $d = $request->validate(['action' => ['required', Rule::in(['active', 'on_hold', 'inactive', 'cost'])], 'cost' => ['required_if:action,cost', 'nullable', 'integer', 'min:0']]);
        if ($d['action'] === 'cost') {
            $supplier->update(['last_cost_zar' => $d['cost']]);
            if ($supplier->rate_card_max_zar > 0 && $d['cost'] > $supplier->rate_card_max_zar) {
                $this->exception('Suppliers', 'Rate Card Mismatch', "External cost exceeds rate card — {$supplier->name}", 'High', $request->user()->name);

                return back()->with('error', 'Cost exceeds the rate card. An exception has been raised for review.');
            }

            return back()->with('success', 'External cost recorded within rate card.');
        }
        $supplier->update(['status' => $d['action']]);

        return back()->with('success', "{$supplier->name} set to ".str_replace('_', ' ', $d['action']).'.');
    }

    private function exception(string $area, string $type, string $subject, string $priority, string $by): void
    {
        ExceptionItem::create(['code' => sprintf('EXC-%s-%04d', now()->format('Y'), ExceptionItem::query()->count() + 44), 'area' => $area, 'type' => $type, 'subject' => $subject, 'priority' => $priority, 'status' => 'new', 'raised_by' => $by, 'assigned_to' => 'Lerato M.', 'raised_at' => now(), 'sla_due' => now()->addDays($priority === 'High' ? 1 : 3)]);
    }

    public function exceptions(Request $request): Response
    {
        $f = $request->only(['area', 'type', 'priority', 'status', 'assigned', 'tab', 'q']);
        $tab = $f['tab'] ?? 'queue';
        $q = ExceptionItem::query()
            ->when($f['q'] ?? null, fn ($b, $v) => $b->where(fn ($w) => $w->where('subject', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%")))
            ->when($f['area'] ?? null, fn ($b, $v) => $b->where('area', $v))
            ->when($f['type'] ?? null, fn ($b, $v) => $b->where('type', $v))
            ->when($f['priority'] ?? null, fn ($b, $v) => $b->where('priority', $v))
            ->when($f['status'] ?? null, fn ($b, $v) => $b->where('status', $v))
            ->when($f['assigned'] ?? null, fn ($b, $v) => $b->where('assigned_to', $v))
            ->when($tab === 'mine', fn ($b) => $b->where('assigned_to', $request->user()->name)->where('status', '!=', 'resolved'))
            ->when($tab === 'escalations', fn ($b) => $b->where('status', 'escalated'))
            ->when($tab === 'sla', fn ($b) => $b->where('status', '!=', 'resolved')->whereDate('sla_due', '<', now()))
            ->when($tab === 'resolved', fn ($b) => $b->where('status', 'resolved'))
            ->when($tab === 'queue', fn ($b) => $b->where('status', '!=', 'resolved'))
            ->orderByDesc('raised_at');
        $all = ExceptionItem::query()->get();
        $open = $all->where('status', '!=', 'resolved');

        return Inertia::render('Advisory/Admin/Exceptions', [
            'rows' => $q->paginate(8)->withQueryString()->through(fn ($x) => [...$x->toArray(), 'raised' => $x->raised_at->format('d M Y, H:i'), 'sla' => $x->sla_due->format('d M Y'), 'breached' => $x->status !== 'resolved' && $x->sla_due->isPast() && ! $x->sla_due->isToday(), 'today' => $x->sla_due->isToday()]),
            'filters' => [...$f, 'tab' => $tab],
            'kpis' => ['total' => $open->count(), 'high' => $open->where('priority', 'High')->count(), 'medium' => $open->where('priority', 'Medium')->count(), 'low' => $open->where('priority', 'Low')->count(),
                'mine' => $open->where('assigned_to', $request->user()->name)->count(), 'sla' => $open->filter(fn ($x) => $x->sla_due->isPast() && ! $x->sla_due->isToday())->count(),
                'resolved' => $all->where('status', 'resolved')->filter(fn ($x) => $x->updated_at->isToday())->count(), 'escalated' => $open->where('status', 'escalated')->count()],
            'breakdown' => $open->groupBy('area')->map->count(),
            'options' => ['areas' => $all->pluck('area')->unique()->values(), 'types' => $all->pluck('type')->unique()->values(), 'assignees' => $all->pluck('assigned_to')->unique()->values()],
        ]);
    }

    public function exceptionUpdate(Request $request, ExceptionItem $exception): RedirectResponse
    {
        $d = $request->validate(['action' => ['required', Rule::in(['assign_me', 'in_review', 'pending_info', 'escalate', 'resolve', 'priority'])], 'priority' => ['nullable', Rule::in(['High', 'Medium', 'Low'])]]);
        $patch = match ($d['action']) {
            'assign_me' => ['assigned_to' => $request->user()->name, 'status' => $exception->status === 'new' ? 'in_review' : $exception->status],
            'in_review' => ['status' => 'in_review'],
            'pending_info' => ['status' => 'pending_info'],
            'escalate' => ['status' => 'escalated', 'priority' => 'High', 'sla_due' => now()->addDay()],
            'resolve' => ['status' => 'resolved'],
            'priority' => ['priority' => $d['priority'] ?? $exception->priority],
        };
        $exception->update($patch);

        return back()->with('success', "{$exception->code} updated.");
    }

    public function whatsapp(Request $request): Response
    {
        $list = TechEngagement::query()->latest()->get();
        $e = $list->firstWhere('reference', $request->query('engagement')) ?? $list->first();
        $templates = [
            ['Configuration Saved', 'Your solution configuration has been saved successfully.', null, 'good'],
            ['Fee Schedule Ready', 'Your fee schedule is ready for review.', 'View Fee Schedule', 'good'],
            ['Engagement Letter Ready', 'Your engagement letter is ready for review and signature.', 'Open Engagement Letter', 'good'],
            ['Gate Ready for Review', 'The Commercial Gate is ready for your review and approval. Approval must be done in the secure portal.', 'Review Gate in Portal', 'warn'],
            ['External Funding Required', 'External funding or deposit is required to proceed.', 'View Funding Options', 'warn'],
            ['Payment Failed', 'We were unable to process your payment. Please update your payment method.', 'Update Payment Method', 'bad'],
            ['Meter Warning', 'Usage has reached '.Setting::get('meter_warning', '80').'% of your approved commitment level.', 'View Usage & Meter', 'warn'],
            ['UAT Action Required', 'UAT activities require your action.', 'Review UAT', 'warn'],
            ['Renewal Approaching', 'Your subscription/solution renewal is due in 30 days.', 'Manage Renewal', 'info'],
            ['Support Case Update', 'Your support case has been updated.', 'View Support Case', 'info'],
            ['Opt-Out Confirmation', 'You will no longer receive WhatsApp messages from TBCA Technology Solutions. You can manage your preferences anytime in the secure portal.', null, 'neutral'],
        ];
        $consent = $e?->context['whatsapp'] ?? ['opt_in' => true, 'since' => now()->subDays(30)->format('d M Y, H:i')];
        $triggers = [];
        if ($e) {
            $meter = TechWorkflow::usage($e->meters ?? TechWorkflow::defaultMeters());
            $triggers = array_values(array_filter([
                $e->gates()->where('status', 'presented')->exists() ? 'Gate Ready for Review' : null,
                $e->gates()->where('x_funded', false)->where('x_high_zar', '>', 0)->whereIn('status', ['presented', 'approved'])->exists() ? 'External Funding Required' : null,
                $meter['cap_pct'] >= (int) Setting::get('meter_warning', '80') ? 'Meter Warning' : null,
                ($e->uat['defects_open'] ?? 0) > 0 ? 'UAT Action Required' : null,
            ]));
        }

        return Inertia::render('Advisory/Admin/WhatsApp', [
            'engagements' => $list->map(fn ($x) => ['reference' => $x->reference, 'organisation' => $x->organisation])->values(),
            'engagement' => $e ? TechWorkspaceController::header($e->load('gates')) : null,
            'templates' => $templates, 'consent' => $consent, 'triggers' => $triggers, 'timeline' => array_slice($e?->timeline ?? [], 0, 8),
        ]);
    }

    public function whatsappConsent(Request $request, TechEngagement $engagement): RedirectResponse
    {
        $ctx = $engagement->context ?? [];
        $opt = ! ($ctx['whatsapp']['opt_in'] ?? true);
        $ctx['whatsapp'] = ['opt_in' => $opt, 'since' => now()->format('d M Y, H:i')];
        $engagement->update(['context' => $ctx]);
        $engagement->addTimeline($opt ? 'WhatsApp opt-in recorded' : 'Opt-Out Confirmation sent', 'System');

        return back()->with('success', $opt ? 'WhatsApp notifications re-enabled.' : 'Client opted out of WhatsApp messages.');
    }
}
