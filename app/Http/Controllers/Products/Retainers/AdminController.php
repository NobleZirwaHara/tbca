<?php

namespace App\Http\Controllers\Products\Retainers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Products\Retainers\Alert;
use App\Models\Products\Retainers\CapacityPool;
use App\Models\Products\Retainers\Commitment;
use App\Models\Products\Retainers\Dispute;
use App\Models\Products\Retainers\Event;
use App\Models\Products\Retainers\Period;
use App\Models\Products\Retainers\Proposal;
use App\Models\Products\Retainers\Retainer;
use App\Models\Products\Retainers\Rollover;
use App\Models\Products\Retainers\Scenario;
use App\Models\Products\Retainers\ScopeChange;
use App\Models\Products\Retainers\Service;
use App\Models\Products\Retainers\Substitution;
use App\Support\Products\Retainers\Catalogue;
use App\Support\Products\Retainers\Engine;
use App\Support\Products\Retainers\Presenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Track C governance consoles (Screens 21-29) at /admin/products/retainers/... */
class AdminController extends Controller
{
    protected function pick(Request $request): Retainer
    {
        $code = (string) $request->query('retainer', $request->input('retainer', 'RET-2026-0001'));

        return Retainer::where('code', $code)->first() ?? Retainer::orderBy('code')->firstOrFail();
    }

    protected function retainerOptions(): array
    {
        return Retainer::orderBy('code')->get(['code', 'name', 'client_name'])->map(fn ($r) => ['value' => $r->code, 'label' => "{$r->code} · {$r->name} — {$r->client_name}"])->all();
    }

    protected function events(?Retainer $r = null, array $types = [], int $limit = 6): array
    {
        return Event::query()
            ->when($r, fn ($q) => $q->where('retainer_id', $r->id))
            ->when($types, fn ($q) => $q->where(fn ($w) => collect($types)->each(fn ($t) => $w->orWhere('type', 'like', "{$t}%"))))
            ->latest('id')->limit($limit)->get()
            ->map(fn ($e) => ['type' => $e->type, 'summary' => $e->summary, 'at' => $e->created_at->toDateTimeString(), 'retainer' => $e->retainer?->code])->all();
    }

    public function index(): RedirectResponse
    {
        return redirect('/admin/products/retainers/capacity-test');
    }

    /* ------------------------------------------------ 21 Capacity Test */

    public function capacityTest(Request $request): Response
    {
        $r = $this->pick($request);
        $m = Engine::meter($r);
        $forecastEnd = $m['period'] && $m['days_elapsed'] > 0 ? round($m['confirmed'] / $m['days_elapsed'] * $m['days_total'], 1) : 0;
        $periods = $r->periods()->where('status', 'closed')->latest('starts_on')->limit(3)->get();
        $byCat = \App\Models\Products\Retainers\Usage::whereIn('period_id', $periods->pluck('id'))->whereIn('status', ['confirmed', 'corrected'])->selectRaw('category, sum(units) as h')->groupBy('category')->orderByDesc('h')->get()
            ->map(fn ($x) => ['category' => $x->category, 'hours' => round((float) $x->h / max(1, $periods->count()), 1)]);

        return Inertia::render('Products/Retainers/Admin/CapacityTest', [
            'retainer' => Presenter::retainer($r),
            'options' => $this->retainerOptions(),
            'baseline' => ['allowance' => $r->allowance_qty, 'used' => $m['confirmed'] ?? 0, 'util' => $m['utilisation'] ?? 0, 'forecast_end' => $forecastEnd, 'forecast_pct' => $r->allowance_qty > 0 ? round($forecastEnd / $r->allowance_qty * 100) : 0, 'grade' => Engine::grade($r->allowance_qty > 0 ? $forecastEnd / $r->allowance_qty * 100 : 0), 'basis' => round($r->hourlyBasis()), 'forecast' => Engine::forecastUsage($r)],
            'demand' => $byCat,
            'scenarios' => $r->scenarios()->latest()->limit(8)->get()->map(fn (Scenario $s) => [...$s->only(['id', 'name', 'type', 'allowance_qty', 'monthly_fee_zar', 'result', 'classification', 'detail', 'run_by']), 'starts_on' => $s->starts_on->toDateString(), 'created_at' => $s->created_at->toDateTimeString()]),
            'latest' => ($s = $r->scenarios()->latest('id')->first()) ? [...$s->only(['id', 'name', 'type', 'allowance_qty', 'monthly_fee_zar', 'result', 'classification', 'detail']), 'starts_on' => $s->starts_on->toDateString()] : null,
            'services' => Service::with('pool')->orderBy('code')->get()->map(fn (Service $s) => ['id' => $s->id, 'code' => $s->code, 'name' => $s->name, 'certification' => $s->certification, 'price_zar' => $s->price_zar, 'floor_zar' => $s->floor_zar, 'custom' => $s->custom_pricing, 'test' => Engine::capacityTest($s), 'floor' => Engine::floorStatus($s->price_zar, $s->floor_zar), 'state' => Engine::saleState($s)]),
            'next_start' => $m['period']['next_reset'] ?? today()->toDateString(),
        ]);
    }

    public function runScenario(Request $request): RedirectResponse
    {
        $r = $this->pick($request);
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:80'],
            'type' => ['required', 'in:Resize Allowance,Change Scope,Change Team,Change Period'],
            'allowance' => ['required', 'numeric', 'min:1', 'max:200'],
            'fee' => ['required', 'integer', 'min:0'],
            'starts_on' => ['required', 'date'],
        ]);
        $s = Engine::runScenario($r, $data, $request->user()->name);

        return back()->with('success', 'Capacity test complete: '.str_replace('_', ' ', $s->result).'. Scenario is not yet active.');
    }

    public function deleteScenario(Scenario $scenario): RedirectResponse
    {
        $scenario->delete();

        return back()->with('success', 'Scenario removed.');
    }

    public function certify(Request $request, Service $service): RedirectResponse
    {
        $data = $request->validate(['decision' => ['required', 'in:certify,reject'], 'note' => ['nullable', 'string', 'max:300']]);
        Engine::certify($service, $data['decision'] === 'certify', $data['note'] ?? null);

        return back()->with('success', "{$service->name} ".($data['decision'] === 'certify' ? 'certified' : 'rejected').'.');
    }

    /* ---------------------------------------- 22 Capacity Commitment Register */

    public function capacityRegister(Request $request): Response
    {
        $r = $this->pick($request);
        $f = ['status' => (string) $request->query('status', ''), 'type' => (string) $request->query('type', ''), 'owner' => (string) $request->query('owner', ''), 'q' => (string) $request->query('q', '')];
        $all = $r->commitments()->orderByDesc('reference')->get();
        $rows = $all->when($f['status'], fn ($c) => $c->where('status', $f['status']))
            ->when($f['type'], fn ($c) => $c->where('type', $f['type']))
            ->when($f['owner'], fn ($c) => $c->where('owner', $f['owner']))
            ->when($f['q'], fn ($c) => $c->filter(fn ($x) => str_contains(strtolower($x->description.' '.$x->reference), strtolower($f['q']))));
        $confirmed = (float) $all->where('status', 'confirmed')->sum('hours');
        $tentative = (float) $all->whereIn('status', ['tentative', 'on_hold'])->sum('hours');
        $m = Engine::meter($r);

        return Inertia::render('Products/Retainers/Admin/CapacityRegister', [
            'retainer' => Presenter::retainer($r),
            'options' => $this->retainerOptions(),
            'kpis' => ['allowance' => $r->allowance_qty, 'total' => $confirmed + $tentative, 'confirmed' => $confirmed, 'tentative' => $tentative, 'available' => max(0, $r->allowance_qty - $confirmed - $tentative), 'over' => max(0, $confirmed + $tentative - $r->allowance_qty), 'days_left' => $m['days_left'] ?? 0],
            'commitments' => $rows->values()->map(fn (Commitment $c) => [...$c->only(['id', 'reference', 'type', 'description', 'owner', 'hours', 'status']), 'committed_on' => $c->committed_on->toDateString(), 'starts_on' => $c->starts_on->toDateString(), 'ends_on' => $c->ends_on->toDateString()]),
            'filters' => $f,
            'owners' => $all->pluck('owner')->unique()->values(),
            'pools' => CapacityPool::orderBy('code')->get()->map(fn ($p) => ['id' => $p->id, 'code' => $p->code, 'name' => $p->name, 'skill' => $p->skill, 'seniority' => $p->seniority, ...Engine::headroom($p), 'effective' => $p->data_effective_at?->toDateString()]),
            'proposals' => Proposal::with('service')->whereIn('status', ['hold', 'issued', 'accepted'])->latest()->limit(10)->get()->map(fn ($p) => ['id' => $p->id, 'reference' => $p->reference, 'organisation' => $p->organisation, 'service' => $p->service->name, 'units' => $p->allowance_qty, 'status' => $p->status, 'hold_reason' => $p->hold_reason, 'reserved_units' => $p->reserved_units, 'expires' => $p->reservation_expires_at?->toDateString()]),
        ]);
    }

    public function storeCommitment(Request $request): RedirectResponse
    {
        $r = $this->pick($request);
        $data = $request->validate([
            'type' => ['required', 'in:Deliverable,Milestone,Meeting,Event'],
            'description' => ['required', 'string', 'max:160'],
            'owner' => ['required', 'string', 'max:60'],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['required', 'date', 'after_or_equal:starts_on'],
            'hours' => ['required', 'numeric', 'min:0.25', 'max:200'],
            'status' => ['required', 'in:confirmed,tentative,on_hold'],
        ]);
        $c = Engine::addCommitment($r, $data);

        return back()->with('success', "Commitment {$c->reference} added.");
    }

    public function commitmentStatus(Request $request, Commitment $commitment): RedirectResponse
    {
        Engine::setCommitmentStatus($commitment, $request->validate(['status' => ['required', 'in:confirmed,tentative,on_hold,released']])['status']);

        return back()->with('success', 'Commitment updated.');
    }

    public function reserveCapacity(Proposal $proposal): RedirectResponse
    {
        $ok = Engine::retryHold($proposal);

        return back()->with($ok ? 'success' : 'error', $ok ? "Capacity reserved and proposal {$proposal->reference} issued." : 'Reservation failed: insufficient or stale exact-pool headroom.');
    }

    public function updatePool(Request $request, CapacityPool $pool): RedirectResponse
    {
        $data = $request->validate(['productive_units' => ['required', 'numeric', 'min:0'], 'cross_vehicle_units' => ['required', 'numeric', 'min:0'], 'protective_reserve' => ['required', 'numeric', 'min:0'], 'review_reserve' => ['required', 'numeric', 'min:0']]);
        $pool->update([...$data, 'data_effective_at' => now()]);
        Engine::log('re.capacity.pool.updated', "Capacity pool {$pool->code} re-measured", null, null, $data);

        return back()->with('success', 'Capacity pool updated.');
    }

    /* ---------------------------------------------- 23 Allocation */

    public function allocation(Request $request): Response
    {
        $r = $this->pick($request);
        $allocs = $r->allocations()->orderByDesc('is_primary')->orderByDesc('allocation_pct')->get();

        return Inertia::render('Products/Retainers/Admin/Allocation', [
            'retainer' => [...Presenter::retainer($r), 'allocation_notes' => $r->allocation_notes],
            'options' => $this->retainerOptions(),
            'allocations' => $allocs->map(fn ($a) => $a->only(['id', 'adviser', 'role', 'allocation_pct', 'workload_pct', 'is_primary', 'available', 'note'])),
            'handovers' => Event::where('retainer_id', $r->id)->where('type', 're.owner.handover')->latest('id')->limit(5)->get()->map(fn ($e) => ['from' => $e->data['from'] ?? '', 'to' => $e->data['to'] ?? '', 'date' => $e->created_at->toDateString(), 'reason' => $e->data['reason'] ?? ''])
                ->concat([['from' => 'T. Dlamini', 'to' => $r->account_owner['name'] ?? '', 'date' => $r->account_owner['since'] ?? '', 'reason' => 'Role change'], ['from' => 'P. Govender', 'to' => 'T. Dlamini', 'date' => $r->start_date?->toDateString(), 'reason' => 'Internal transfer']])->take(5)->values(),
            'recent_usage' => $r->usage()->latest('occurred_at')->limit(5)->get()->map(fn ($u) => Presenter::usage($u)),
            'meter' => Engine::meter($r),
        ]);
    }

    public function saveAllocation(Request $request): RedirectResponse
    {
        $r = $this->pick($request);
        $data = $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.id' => ['nullable', 'integer'],
            'rows.*.adviser' => ['required', 'string', 'max:60'],
            'rows.*.role' => ['required', 'string', 'max:60'],
            'rows.*.allocation_pct' => ['required', 'integer', 'min:0', 'max:100'],
            'rows.*.workload_pct' => ['required', 'integer', 'min:0', 'max:150'],
            'rows.*.is_primary' => ['boolean'],
            'rows.*.available' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
        $rows = collect($data['rows'])->map(fn ($x) => [...$x, 'is_primary' => (bool) ($x['is_primary'] ?? false), 'available' => (bool) ($x['available'] ?? true), 'allocation_pct' => (int) $x['allocation_pct'], 'workload_pct' => (int) $x['workload_pct']])->all();
        Engine::saveAllocation($r, $rows);
        $r->update(['allocation_notes' => $data['notes'] ?? $r->allocation_notes]);

        return back()->with('success', 'Allocation confirmed and audit-logged.');
    }

    public function logUsage(Request $request): RedirectResponse
    {
        $r = $this->pick($request);
        $data = $request->validate([
            'activity' => ['required', 'string', 'max:120'],
            'adviser' => ['required', 'string', 'max:60'],
            'units' => ['required', 'numeric', 'min:0.25', 'max:24'],
            'category' => ['required', 'string', 'max:60'],
            'evidence_class' => ['required', 'in:E1,E2,E3,E4'],
        ]);
        $u = Engine::logUsage($r, $data);

        return back()->with('success', "{$u->units}h posted to the client-visible ledger ({$u->billing_effect}).");
    }

    /* ------------------------------------------ 24 Under-use queue */

    public function underUse(Request $request): Response
    {
        $f = ['status' => (string) $request->query('status', ''), 'level' => (string) $request->query('level', ''), 'owner' => (string) $request->query('owner', ''), 'q' => (string) $request->query('q', '')];
        $alerts = Alert::with('retainer')->get();
        $rows = $alerts->when($f['status'], fn ($c) => $c->where('status', $f['status']))
            ->when($f['level'], fn ($c) => $c->where('level', $f['level']))
            ->when($f['owner'], fn ($c) => $c->filter(fn ($a) => ($a->retainer->adviser['name'] ?? '') === $f['owner']))
            ->when($f['q'], fn ($c) => $c->filter(fn ($a) => str_contains(strtolower($a->retainer->code.' '.$a->retainer->client_name), strtolower($f['q']))))
            ->sortBy(fn ($a) => [array_search($a->level, ['at_risk', 'moderate', 'low'], true), $a->utilisation_pct])->values();

        $open = $alerts->where('status', '!=', 'resolved');
        $active = Retainer::whereIn('status', ['active', 'cancelling'])->get();
        $bands = ['high' => 0, 'healthy' => 0, 'moderate' => 0, 'under' => 0];
        foreach ($active as $x) {
            $u = Engine::meter($x)['utilisation'] ?? 0;
            $bands[$u >= 90 ? 'high' : ($u >= 75 ? 'healthy' : ($u >= 50 ? 'moderate' : 'under'))]++;
        }

        return Inertia::render('Products/Retainers/Admin/UnderUse', [
            'kpis' => ['total' => $open->count(), 'at_risk' => $open->where('level', 'at_risk')->count(), 'moderate' => $open->where('level', 'moderate')->count(), 'low' => $open->where('level', 'low')->count(), 'avg' => round((float) $open->avg('utilisation_pct'))],
            'alerts' => $rows->map(fn (Alert $a) => ['id' => $a->id, 'level' => $a->level, 'status' => $a->status, 'utilisation' => $a->utilisation_pct, 'code' => $a->retainer->code, 'client' => $a->retainer->client_name, 'used' => Engine::meter($a->retainer)['confirmed'] ?? 0, 'allowance' => Engine::meter($a->retainer)['denominator'] ?? 0, 'days_left' => Engine::meter($a->retainer)['days_left'] ?? 0, 'fee' => $a->retainer->monthly_fee_zar, 'adviser' => $a->retainer->adviser['name'] ?? '', 'last_activity' => $a->last_activity?->toDateString(), 'notice_sent_at' => $a->notice_sent_at?->toDateTimeString()]),
            'filters' => $f,
            'owners' => $alerts->map(fn ($a) => $a->retainer->adviser['name'] ?? '')->unique()->filter()->values(),
            'profile' => Catalogue::UNDER_USE_PROFILE,
            'bands' => $bands,
            'active' => $active->count(),
        ]);
    }

    public function detectUnderUse(): RedirectResponse
    {
        $n = 0;
        foreach (Retainer::where('status', 'active')->get() as $r) {
            $n += Engine::detectUnderUse($r) ? 1 : 0;
        }

        return back()->with('success', "Approved profile evaluated across the book: {$n} retainers below threshold.");
    }

    public function alertAction(Request $request, Alert $alert): RedirectResponse
    {
        $action = $request->validate(['action' => ['required', 'in:notice,in_progress,monitoring,escalated,resolved,suppress']])['action'];
        Engine::updateAlert($alert, $action);

        return back()->with('success', $action === 'notice' ? 'Neutral utilisation review sent with four equal options.' : 'Alert updated.');
    }

    public function bulkAlerts(Request $request): RedirectResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer'], 'action' => ['required', 'in:notice,in_progress,monitoring,escalated,resolved']]);
        foreach (Alert::whereIn('id', $data['ids'])->get() as $a) {
            Engine::updateAlert($a, $data['action']);
        }

        return back()->with('success', count($data['ids']).' alerts updated.');
    }

    /* ------------------------------------------ 25 Scope-creep monitor */

    public function scopeCreep(Request $request): Response
    {
        $f = ['status' => (string) $request->query('status', ''), 'risk' => (string) $request->query('risk', ''), 'type' => (string) $request->query('type', ''), 'raised_by' => (string) $request->query('raised_by', ''), 'q' => (string) $request->query('q', '')];
        $all = ScopeChange::with('retainer')->latest()->get();
        $rows = $all->when($f['status'], fn ($c) => $c->where('status', $f['status']))
            ->when($f['risk'], fn ($c) => $c->where('risk', $f['risk']))
            ->when($f['type'], fn ($c) => $c->where('change_type', $f['type']))
            ->when($f['raised_by'], fn ($c) => $c->where('raised_by', $f['raised_by']))
            ->when($f['q'], fn ($c) => $c->filter(fn ($x) => str_contains(strtolower($x->summary.' '.$x->reference), strtolower($f['q']))));
        $decided = $all->whereIn('status', ['approved', 'rejected'])->count();
        $heat = [];
        foreach (['High', 'Medium', 'Low'] as $impact) {
            foreach (['Low', 'Medium', 'High'] as $likelihood) {
                $heat[$impact][$likelihood] = $all->filter(fn ($x) => $x->risk === $impact && ($x->impact_hours >= 2.5 ? 'High' : ($x->impact_hours >= 1.5 ? 'Medium' : 'Low')) === $likelihood)->count();
            }
        }
        $demo = Retainer::where('code', 'RET-2026-0001')->first();
        $usedHours = $demo ? (Engine::meter($demo)['confirmed'] ?? 0) : 0;

        return Inertia::render('Products/Retainers/Admin/ScopeCreep', [
            'kpis' => ['potential' => $all->count(), 'review' => $all->whereIn('status', ['under_review', 'proposed'])->count(), 'approved' => $all->where('status', 'approved')->count(), 'rejected' => $all->where('status', 'rejected')->count(), 'hours' => round((float) $all->where('status', 'approved')->sum('impact_hours'), 1), 'rate' => $decided ? round($all->where('status', 'approved')->count() / $decided * 100) : 0],
            'changes' => $rows->values()->map(fn ($c) => [...$c->only(['id', 'reference', 'summary', 'change_type', 'raised_by', 'risk', 'status', 'stage', 'impact_hours', 'impact_zar']), 'retainer' => $c->retainer->code, 'client' => $c->retainer->client_name, 'created_at' => $c->created_at->toDateString()]),
            'filters' => $f,
            'heat' => $heat,
            'alignment' => ['within' => $usedHours, 'approved' => (float) $all->where('status', 'approved')->sum('impact_hours'), 'pending' => (float) $all->whereIn('status', ['under_review', 'proposed'])->sum('impact_hours'), 'rejected' => (float) $all->where('status', 'rejected')->sum('impact_hours')],
            'types' => $all->groupBy('change_type')->map->count()->sortDesc(),
            'timeline' => $all->take(4)->map(fn ($c) => ['date' => $c->created_at->toDateString(), 'summary' => $c->summary, 'status' => $c->status, 'hours' => $c->impact_hours])->values(),
            'options' => $this->retainerOptions(),
        ]);
    }

    public function decideScope(Request $request, ScopeChange $change): RedirectResponse
    {
        $data = $request->validate(['decision' => ['required', 'in:propose,approve,reject'], 'hours' => ['nullable', 'numeric', 'min:0', 'max:200']]);
        Engine::decideScopeChange($change, $data['decision'], isset($data['hours']) ? (float) $data['hours'] : null);

        return back()->with('success', "Scope change {$change->reference} updated.");
    }

    public function storeScope(Request $request): RedirectResponse
    {
        $r = $this->pick($request);
        $data = $request->validate([
            'change_type' => ['required', 'in:Additional Deliverable,Additional Activity,Schedule Change,Out of Scope'],
            'summary' => ['required', 'string', 'max:200'],
            'risk' => ['required', 'in:Low,Medium,High'],
            'impact_hours' => ['required', 'numeric', 'min:0', 'max:200'],
        ]);
        Engine::requestScopeChange($r, $data, 'Adviser');

        return back()->with('success', 'Scope review opened.');
    }

    /* ------------------------------------------ 26 Profitability */

    public function profitability(Request $request): Response
    {
        $f = ['owner' => (string) $request->query('owner', ''), 'q' => (string) $request->query('q', ''), 'status' => (string) $request->query('status', '')];
        $retainers = Retainer::whereIn('status', ['active', 'cancelling', 'paused'])->get();
        $clients = $retainers->groupBy('client_name')->map(function ($group, $client) {
            $rev = (int) $group->sum('period_revenue_zar');
            $cost = (int) $group->sum('period_cost_zar');
            $util = round($group->avg(fn ($r) => Engine::meter($r)['utilisation'] ?? 0));
            $margin = $rev > 0 ? round(($rev - $cost) / $rev * 100, 1) : 0;

            return ['client' => $client, 'retainers' => $group->count(), 'revenue' => $rev, 'cost' => $cost, 'profit' => $rev - $cost, 'margin' => $margin, 'utilisation' => $util, 'status' => $margin >= 45 ? 'Healthy' : ($margin >= 20 ? 'At Risk' : 'Critical'), 'owners' => $group->map(fn ($r) => $r->account_owner['name'] ?? '')->unique()->values(), 'review' => $group->contains('commercial_review', true), 'codes' => $group->pluck('code')];
        })->sortByDesc('margin')->values();

        $rows = $clients->when($f['owner'], fn ($c) => $c->filter(fn ($x) => $x['owners']->contains($f['owner'])))
            ->when($f['q'], fn ($c) => $c->filter(fn ($x) => str_contains(strtolower($x['client']), strtolower($f['q']))))
            ->when($f['status'], fn ($c) => $c->where('status', $f['status']))->values();
        $rev = $clients->sum('revenue');
        $cost = $clients->sum('cost');

        return Inertia::render('Products/Retainers/Admin/Profitability', [
            'kpis' => ['revenue' => $rev, 'cost' => $cost, 'profit' => $rev - $cost, 'margin' => $rev > 0 ? round(($rev - $cost) / $rev * 100, 1) : 0, 'clients' => $clients->count(), 'under' => $clients->where('utilisation', '<', 60)->count()],
            'clients' => $rows,
            'distribution' => ['> 50%' => $clients->where('margin', '>', 50)->count(), '35% – 50%' => $clients->whereBetween('margin', [35, 50])->count(), '20% – 35%' => $clients->filter(fn ($x) => $x['margin'] >= 20 && $x['margin'] < 35)->count(), '< 20%' => $clients->where('margin', '<', 20)->count()],
            'scatter' => $clients->map(fn ($x) => ['client' => $x['client'], 'x' => $x['utilisation'], 'y' => $x['margin'], 'status' => $x['status']])->values(),
            'filters' => $f,
            'owners' => $retainers->map(fn ($r) => $r->account_owner['name'] ?? '')->unique()->filter()->values(),
            'paid_orders' => Order::where('section', 'retainers')->where('status', 'paid')->sum('total_zar'),
        ]);
    }

    public function commercialReview(Request $request): RedirectResponse
    {
        $client = $request->validate(['client' => ['required', 'string']])['client'];
        $retainers = Retainer::where('client_name', $client)->get();
        foreach ($retainers as $r) {
            $r->update(['commercial_review' => true]);
            Engine::log('re.commercial.review', 'Commercial review opened (margin from low utilisation is a governance signal)', $r);
        }

        return back()->with('success', "Commercial review opened for {$client}.");
    }

    /* ------------------------------------------ 27 Below-floor monitor */

    public function belowFloor(Request $request): Response
    {
        $f = ['level' => (string) $request->query('level', ''), 'type' => (string) $request->query('type', ''), 'unit' => (string) $request->query('unit', ''), 'q' => (string) $request->query('q', '')];
        $all = Retainer::with('service')->whereIn('status', ['active', 'pending_activation', 'paused', 'cancelling'])->get()->map(function (Retainer $r) {
            $floor = Engine::floorFor($r);
            $st = Engine::floorStatus($r->monthly_fee_zar, $floor);

            return ['id' => $r->id, 'code' => $r->code, 'name' => $r->name, 'client' => $r->client_name, 'type' => $r->retainer_type, 'unit' => $r->business_unit, 'floor' => $floor, 'price' => $r->monthly_fee_zar, ...$st, 'state' => $r->floor_disposition ? 'Remediated' : ($st['blocked'] ? ($st['level'] === 'At Risk' && $st['pct'] > -2.5 ? 'On Hold' : 'Blocked') : 'Active'), 'disposition' => $r->floor_disposition];
        });
        $rows = $all->when($f['level'], fn ($c) => $c->where('level', $f['level']))
            ->when($f['type'], fn ($c) => $c->where('type', $f['type']))
            ->when($f['unit'], fn ($c) => $c->where('unit', $f['unit']))
            ->when($f['q'], fn ($c) => $c->filter(fn ($x) => str_contains(strtolower($x['code'].' '.$x['client'].' '.$x['name']), strtolower($f['q']))))
            ->sortBy('pct')->values();
        $services = Service::where('custom_pricing', false)->get()->map(fn ($s) => ['name' => $s->name, ...Engine::floorStatus($s->price_zar, $s->floor_zar), 'certification' => $s->certification])->where('blocked', true)->values();

        return Inertia::render('Products/Retainers/Admin/BelowFloor', [
            'kpis' => ['blocked' => $all->where('blocked', true)->whereNull('disposition')->count(), 'at_risk' => $all->where('level', 'At Risk')->count(), 'below' => $all->where('level', 'Below Floor')->count(), 'compliant' => $all->where('blocked', false)->count(), 'total' => $all->count()],
            'rows' => $rows,
            'filters' => $f,
            'types' => $all->pluck('type')->unique()->values(),
            'units' => $all->groupBy('unit')->map(fn ($g, $u) => ['unit' => $u, 'blocked' => $g->where('level', 'Below Floor')->count(), 'at_risk' => $g->where('level', 'At Risk')->count(), 'total' => $g->count()])->values(),
            'byType' => $all->where('blocked', true)->groupBy('type')->map->count(),
            'services' => $services,
            'activity' => $this->events(null, ['re.floor', 're.renewal.capacity_failed', 're.proposal.hold']),
        ]);
    }

    public function remediate(Request $request, Retainer $retainer): RedirectResponse
    {
        Engine::remediate($retainer, $request->validate(['disposition' => ['required', 'in:RE-D1,RE-D2,RE-D3,RE-D4']])['disposition']);

        return back()->with('success', "{$retainer->code} remediated.");
    }

    /* ------------------------------------------ 28 Substitution console */

    public function substitution(Request $request): Response
    {
        $f = ['status' => (string) $request->query('status', ''), 'type' => (string) $request->query('type', ''), 'risk' => (string) $request->query('risk', ''), 'q' => (string) $request->query('q', '')];
        $all = Substitution::with('retainer')->latest()->get();
        $rows = $all->when($f['status'], fn ($c) => $c->where('status', $f['status']))
            ->when($f['type'], fn ($c) => $c->where('type', $f['type']))
            ->when($f['risk'], fn ($c) => $c->where('risk', $f['risk']))
            ->when($f['q'], fn ($c) => $c->filter(fn ($x) => str_contains(strtolower(($x->current_adviser['name'] ?? '').' '.($x->proposed_adviser['name'] ?? '').' '.$x->retainer->client_name), strtolower($f['q']))));
        $total = max(1, $all->count());

        return Inertia::render('Products/Retainers/Admin/Substitution', [
            'kpis' => ['active' => Retainer::whereIn('status', ['active', 'cancelling'])->count(), 'total' => $all->count(), 'pending' => $all->where('status', 'pending_notice')->count(), 'approved' => $all->where('status', 'approved')->count(), 'declined' => $all->where('status', 'client_declined')->count(), 'high' => $all->where('risk', 'High')->count(), 'approved_pct' => round($all->where('status', 'approved')->count() / $total * 100), 'declined_pct' => round($all->where('status', 'client_declined')->count() / $total * 100)],
            'rows' => $rows->values()->map(fn ($s) => ['id' => $s->id, 'reference' => $s->reference, 'retainer' => $s->retainer->code, 'client' => $s->retainer->client_name, 'from' => $s->current_adviser['name'] ?? '', 'to' => $s->proposed_adviser['name'] ?? '', 'type' => $s->type, 'reason' => $s->reason, 'requested' => $s->created_at->toDateString(), 'status' => $s->status, 'risk' => $s->risk, 'note' => $s->client_note]),
            'filters' => $f,
            'risk' => $all->groupBy('risk')->map->count(),
            'reasons' => $all->groupBy('reason')->map->count()->sortDesc()->take(5),
            'sla' => ['sent' => $all->whereNotNull('notice_sent_at')->count(), 'awaiting' => $all->where('status', 'awaiting_approval')->count(), 'overdue' => $all->where('status', 'pending_notice')->filter(fn ($s) => $s->created_at->lt(now()->subDays(5)))->count(), 'total' => $all->count()],
            'activity' => $this->events(null, ['re.substitution']),
            'options' => $this->retainerOptions(),
        ]);
    }

    public function storeSubstitution(Request $request): RedirectResponse
    {
        $r = $this->pick($request);
        $data = $request->validate([
            'proposed_name' => ['required', 'string', 'max:80'],
            'proposed_title' => ['nullable', 'string', 'max:80'],
            'type' => ['required', 'in:Planned,Emergency'],
            'reason' => ['required', 'string', 'max:80'],
            'reason_detail' => ['nullable', 'string', 'max:500'],
            'effective_from' => ['required', 'date', 'after_or_equal:today'],
        ]);
        $sub = Engine::createSubstitution($r, $data);

        return back()->with('success', "Substitution {$sub->reference} created. Issue the client notice next.");
    }

    public function issueNotice(Substitution $substitution): RedirectResponse
    {
        Engine::issueSubstitutionNotice($substitution);

        return back()->with('success', 'Client notice issued.');
    }

    /* ------------------------------------------ 29 Rollover liability */

    public function rollover(Request $request): Response
    {
        $f = ['risk' => (string) $request->query('risk', ''), 'type' => (string) $request->query('type', ''), 'q' => (string) $request->query('q', '')];
        $all = Rollover::with('retainer')->where('status', 'open')->get()->map(function (Rollover $x) {
            $risk = $x->rollover_pct >= 40 ? 'High' : ($x->rollover_pct >= 25 ? 'Medium' : 'Low');

            return ['id' => $x->id, 'code' => $x->retainer->code, 'client' => $x->retainer->client_name, 'type' => $x->retainer->retainer_type, 'period_ended' => $x->period_ended->toDateString(), 'units' => $x->units, 'unit_type' => $x->unit_type, 'cpu' => $x->cost_per_unit_zar, 'value' => (int) round($x->units * $x->cost_per_unit_zar), 'pct' => $x->rollover_pct, 'risk' => $risk, 'note' => $x->note, 'expires_on' => $x->expires_on->toDateString(), 'days' => (int) today()->diffInDays($x->expires_on, false)];
        });
        $rows = $all->when($f['risk'], fn ($c) => $c->where('risk', $f['risk']))
            ->when($f['type'], fn ($c) => $c->where('type', $f['type']))
            ->when($f['q'], fn ($c) => $c->filter(fn ($x) => str_contains(strtolower($x['code'].' '.$x['client']), strtolower($f['q']))))->sortByDesc('value')->values();
        $total = $all->sum('value');
        $units = $all->sum('units');
        $revenue = Retainer::whereIn('status', ['active', 'cancelling'])->sum('monthly_fee_zar');

        $closable = Period::with('retainer')->where('status', 'open')->where('ends_on', '<=', today()->addDays(31))->orderBy('ends_on')->limit(12)->get()
            ->map(fn (Period $p) => ['id' => $p->id, 'code' => $p->retainer->code, 'client' => $p->retainer->client_name, 'ends_on' => $p->ends_on->toDateString(), 'blockers' => Engine::closeBlockers($p), 'meter' => Engine::meter($p->retainer, $p)]);

        return Inertia::render('Products/Retainers/Admin/Rollover', [
            'kpis' => ['total' => $total, 'units' => round($units, 2), 'clients' => $all->pluck('client')->unique()->count(), 'cpu' => $units > 0 ? (int) round($total / $units) : 0, 'expiring' => round($all->where('days', '<=', 31)->sum('units'), 2), 'at_risk' => round($all->where('risk', 'High')->where('days', '<=', 31)->sum('units'), 2), 'pct_revenue' => $revenue > 0 ? round($total / $revenue * 100, 1) : 0],
            'rows' => $rows,
            'filters' => $f,
            'byRisk' => $all->groupBy('risk')->map(fn ($g) => $g->sum('value')),
            'byType' => $all->groupBy('type')->map(fn ($g) => $g->sum('value')),
            'windows' => ['0 – 30 days' => $all->where('days', '<=', 30)->sum('value'), '31 – 60 days' => $all->whereBetween('days', [31, 60])->sum('value'), '61 – 90 days' => $all->whereBetween('days', [61, 90])->sum('value'), '90+ days' => $all->where('days', '>', 90)->sum('value')],
            'periods' => $closable,
            'disputes' => Dispute::with(['usage', 'retainer'])->where('status', 'under_review')->latest()->get()->map(fn ($d) => ['id' => $d->id, 'reference' => $d->reference, 'retainer' => $d->retainer->code, 'client' => $d->retainer->client_name, 'entry' => $d->usage->reference.' · '.$d->usage->activity, 'units' => $d->usage->units, 'reason' => $d->reason, 'outcome' => $d->outcome, 'proposed_units' => $d->proposed_units, 'created_at' => $d->created_at->toDateString()]),
            'types' => $all->pluck('type')->unique()->values(),
        ]);
    }

    public function reconcile(Period $period): RedirectResponse
    {
        Engine::reconcile($period);

        return back()->with('success', "Period for {$period->retainer->code} reconciled and closed.");
    }

    public function resolveDispute(Request $request, Dispute $dispute): RedirectResponse
    {
        $data = $request->validate(['decision' => ['required', 'in:upheld,rejected'], 'units' => ['nullable', 'numeric', 'min:0'], 'note' => ['nullable', 'string', 'max:300']]);
        Engine::resolveDispute($dispute, $data['decision'] === 'upheld', isset($data['units']) ? (float) $data['units'] : null, $data['note'] ?? null);

        return back()->with('success', "Dispute {$dispute->reference} {$data['decision']}.");
    }
}
