<?php

namespace App\Http\Controllers\CorePages;

use App\Http\Controllers\Controller;
use App\Models\CorePages\Corridor;
use App\Models\CorePages\Observation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin consoles: Corridor Object Manager and Layer 9 Observation Intake.
 */
class CountryAdminController extends Controller
{
    public function corridors(Request $request): Response
    {
        $f = $request->validate([
            'q' => ['nullable', 'string', 'max:60'],
            'type' => ['nullable', Rule::in(['Regional', 'Bilateral', 'Inter-Regional'])],
            'state' => ['nullable', Rule::in(Corridor::STATES)],
            'region' => ['nullable', 'string', 'max:60'],
            'risk' => ['nullable', Rule::in(['Low', 'Medium', 'High'])],
        ]);

        $all = Corridor::orderBy('id')->get();
        $rows = Corridor::query()
            ->when($f['q'] ?? null, fn ($q, $s) => $q->where(fn ($q) => $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%")))
            ->when($f['type'] ?? null, fn ($q, $v) => $q->where('type', $v))
            ->when($f['state'] ?? null, fn ($q, $v) => $q->where('state', $v))
            ->when($f['region'] ?? null, fn ($q, $v) => $q->where('region', $v))
            ->when($f['risk'] ?? null, fn ($q, $v) => $q->where('risk', $v))
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString();

        $total = max(1, $all->count());

        return Inertia::render('CorePages/Admin/Corridors', [
            'corridors' => $rows->through(fn (Corridor $c) => [
                ...$c->only(['code', 'name', 'type', 'region', 'anchors', 'bidirectional', 'trading_paths', 'state', 'rcs', 'sovereign_approval', 'risk']),
                'last_reviewed' => $c->last_reviewed_at?->format('d M Y'),
                'next_review' => $c->next_review_at?->format('d M Y'),
                'transitions' => Corridor::transitions()[$c->state],
                'history' => array_slice(array_reverse($c->history ?? []), 0, 5),
            ]),
            'kpis' => [
                'total' => $all->count(),
                'paths' => $all->sum('trading_paths'),
                'countries' => 54,
                'active' => $all->where('state', 'active')->count(),
                'active_pct' => (int) round($all->where('state', 'active')->count() / $total * 100),
                'avg_rcs' => (int) round($all->avg('rcs') ?? 0),
                'sellable' => $all->where('state', 'active')->sum('sellable_paths'),
                'sellable_pct' => $all->sum('trading_paths') ? (int) round($all->where('state', 'active')->sum('sellable_paths') / $all->sum('trading_paths') * 100) : 0,
            ],
            'distribution' => collect(Corridor::STATES)->mapWithKeys(fn ($s) => [$s => $all->where('state', $s)->count()]),
            'types' => collect(['Regional', 'Bilateral', 'Inter-Regional'])->mapWithKeys(fn ($t) => [$t => $all->where('type', $t)->count()]),
            'rcsTop' => $all->sortByDesc('trading_paths')->take(5)->map(fn ($c) => ['name' => $c->name, 'rcs' => $c->rcs])->values(),
            'latest' => $all->flatMap(fn ($c) => collect($c->history ?? [])->map(fn ($h) => ['text' => "{$c->name} — {$h['event']}", 'at' => $h['at']]))->sortByDesc('at')->take(5)->values(),
            'regions' => $all->pluck('region')->unique()->sort()->values(),
            'filters' => array_merge(['q' => '', 'type' => '', 'state' => '', 'region' => '', 'risk' => ''], array_filter($f)),
            'activationRcs' => Corridor::ACTIVATION_RCS,
        ]);
    }

    public function storeCorridor(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:30', 'regex:/^COR-[A-Z0-9-]+$/', 'unique:core_corridors,code'],
            'type' => ['required', Rule::in(['Regional', 'Bilateral', 'Inter-Regional'])],
            'region' => ['required', 'string', 'max:60'],
            'anchors' => ['required', 'string', 'max:255'],
            'trading_paths' => ['required', 'integer', 'min:1', 'max:200'],
            'rcs' => ['required', 'integer', 'min:0', 'max:100'],
            'risk' => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'sovereign_approval' => ['boolean'],
        ], ['code.regex' => 'Corridor codes start with COR- and use capitals, digits and hyphens.']);

        $anchors = array_values(array_filter(array_map('trim', preg_split('/[,>→]+/u', $data['anchors']))));

        Corridor::create([
            ...collect($data)->except('anchors')->all(),
            'anchors' => $anchors,
            'bidirectional' => $data['type'] === 'Bilateral',
            'state' => 'pending',
            'sellable_paths' => 0,
            'last_reviewed_at' => today(),
            'next_review_at' => today()->addMonths(3),
            'history' => [['event' => 'created', 'at' => now()->toIso8601String(), 'by' => $request->user()->name]],
        ]);

        return back()->with('success', "Corridor {$data['code']} created in Pending state.");
    }

    public function updateCorridor(Request $request, Corridor $corridor): RedirectResponse
    {
        $data = $request->validate([
            'rcs' => ['required', 'integer', 'min:0', 'max:100'],
            'sovereign_approval' => ['boolean'],
            'risk' => ['required', Rule::in(['Low', 'Medium', 'High'])],
        ]);
        $history = $corridor->history ?? [];
        $history[] = ['event' => "resolver updated (RCS {$data['rcs']}%)", 'at' => now()->toIso8601String(), 'by' => $request->user()->name];
        $corridor->update([...$data, 'history' => $history, 'last_reviewed_at' => today(), 'next_review_at' => today()->addMonths(3)]);

        return back()->with('success', "{$corridor->name} updated.");
    }

    public function transitionCorridor(Request $request, Corridor $corridor): RedirectResponse
    {
        $to = $request->validate(['state' => ['required', Rule::in(Corridor::STATES)]])['state'];

        if (! $corridor->canMoveTo($to)) {
            return back()->with('error', "A {$corridor->state} corridor cannot move to {$to}.");
        }
        if ($to === 'active' && ($blocker = $corridor->activationBlocker())) {
            return back()->with('error', $blocker);
        }

        $history = $corridor->history ?? [];
        $history[] = ['event' => "{$corridor->state} → {$to}", 'at' => now()->toIso8601String(), 'by' => $request->user()->name];
        $corridor->update([
            'state' => $to,
            'sellable_paths' => $to === 'active' ? (int) floor($corridor->trading_paths * $corridor->rcs / 100) : 0,
            'history' => $history,
        ]);

        return back()->with('success', "{$corridor->name} is now ".str_replace('_', ' ', $to).'.');
    }

    public function observations(Request $request): Response
    {
        $f = $request->validate([
            'q' => ['nullable', 'string', 'max:60'],
            'surface' => ['nullable', 'string', 'max:60'],
            'class' => ['nullable', 'string', 'max:60'],
            'country' => ['nullable', 'string', 'max:60'],
            'state' => ['nullable', 'string', 'max:30'],
            'risk' => ['nullable', Rule::in(['Low', 'Medium', 'High'])],
            'status' => ['nullable', Rule::in(array_keys(Observation::transitions()))],
        ]);

        $all = Observation::all();
        $rows = Observation::query()
            ->when($f['q'] ?? null, fn ($q, $s) => $q->where(fn ($q) => $q->where('obs_id', 'like', "%{$s}%")->orWhere('subject', 'like', "%{$s}%")))
            ->when($f['surface'] ?? null, fn ($q, $v) => $q->where('origin_surface', $v))
            ->when($f['class'] ?? null, fn ($q, $v) => $q->where('observation_class', $v))
            ->when($f['country'] ?? null, fn ($q, $v) => $q->where('country', $v))
            ->when($f['state'] ?? null, fn ($q, $v) => $q->where('availability_state', $v))
            ->when($f['risk'] ?? null, fn ($q, $v) => $q->where('risk', $v))
            ->when($f['status'] ?? null, fn ($q, $v) => $q->where('status', $v), fn ($q) => $q->whereIn('status', ['candidate', 'under_review', 'passed']))
            ->orderByDesc('captured_at')
            ->paginate(8)
            ->withQueryString();

        $count = fn (string $field) => $all->groupBy($field)->map->count()->sortDesc();

        return Inertia::render('CorePages/Admin/Observations', [
            'observations' => $rows->through(fn (Observation $o) => [
                ...$o->only(['obs_id', 'origin_surface', 'country', 'country_flag', 'observation_class', 'subject', 'value', 'rcs_link', 'quality_score', 'status', 'risk', 'availability_state', 'publication_permission', 'promoted_id', 'decision_note']),
                'captured_at' => $o->captured_at->format('d M Y H:i'),
                'transitions' => Observation::transitions()[$o->status],
            ]),
            'kpis' => [
                'today' => $all->filter(fn ($o) => $o->captured_at->isToday())->count(),
                'candidates' => $all->where('status', 'candidate')->count(),
                'review' => $all->where('status', 'under_review')->count(),
                'passed' => $all->where('status', 'passed')->count(),
                'promoted' => $all->where('status', 'promoted')->count(),
                'retracted' => $all->where('status', 'retracted')->count(),
            ],
            'byClass' => $count('observation_class'),
            'bySurface' => $count('origin_surface'),
            'byState' => $count('availability_state'),
            'quality' => collect([[0, 0.2], [0.2, 0.4], [0.4, 0.6], [0.6, 0.8], [0.8, 1.01]])->map(fn ($b) => ['label' => number_format($b[0], 1).'-'.number_format(min($b[1], 1), 1), 'count' => $all->filter(fn ($o) => $o->quality_score >= $b[0] && $o->quality_score < $b[1])->count()]),
            'rcsByCountry' => $all->groupBy('country')->map(fn ($g, $k) => ['country' => $k, 'rcs' => (int) round($g->avg('rcs_link'))])->sortByDesc('rcs')->take(5)->values(),
            'promotions' => $all->where('status', 'promoted')->sortByDesc('promoted_at')->take(5)->map(fn ($o) => ['id' => $o->promoted_id, 'class' => $o->observation_class, 'at' => $o->promoted_at?->format('H:i')])->values(),
            'options' => [
                'surfaces' => ['Client Portal', 'Marketplace Brief', 'Partner Delivery', 'Corridor Workflow', 'WhatsApp / Talk', 'Evidence Acquisition', 'Due Diligence', 'Subscription Delivery'],
                'classes' => ['Payment Success', 'Process Turnaround', 'Corridor Friction', 'Regulatory Friction', 'Evidence Availability', 'Client Outcome Signal', 'Liquidity Friction', 'Delivery Variance'],
                'countries' => $all->pluck('country')->unique()->sort()->values(),
                'states' => ['Active', 'Shell', 'Degraded', 'Suspended', 'Restricted'],
            ],
            'filters' => array_merge(['q' => '', 'surface' => '', 'class' => '', 'country' => '', 'state' => '', 'risk' => '', 'status' => ''], array_filter($f)),
            'thresholds' => ['quality' => Observation::QUALITY_THRESHOLD, 'rcs' => Observation::RCS_THRESHOLD],
        ]);
    }

    public function storeObservation(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'origin_surface' => ['required', 'string', 'max:60'],
            'country' => ['required', 'string', 'max:60'],
            'observation_class' => ['required', 'string', 'max:60'],
            'subject' => ['required', 'string', 'max:190'],
            'value' => ['nullable', 'string', 'max:60'],
            'rcs_link' => ['required', 'integer', 'min:0', 'max:100'],
            'quality_score' => ['required', 'numeric', 'min:0', 'max:1'],
            'risk' => ['required', Rule::in(['Low', 'Medium', 'High'])],
            'availability_state' => ['required', Rule::in(['Active', 'Shell', 'Degraded', 'Suspended', 'Restricted'])],
        ]);

        $id = 'L9-OC-'.now()->format('Ymd').'-'.str_pad((string) (Observation::max('id') + 1), 5, '0', STR_PAD_LEFT);

        Observation::create([
            ...$data,
            'obs_id' => $id,
            'captured_at' => now(),
            'status' => 'candidate',
            'publication_permission' => false,
        ]);

        return back()->with('success', "Observation {$id} captured as a candidate (publication permission false).");
    }

    public function transitionObservation(Request $request, Observation $observation): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(Observation::transitions()))],
            'note' => ['nullable', 'string', 'max:190'],
        ]);

        if ($blocker = $observation->gateBlocker($data['status'])) {
            return back()->with('error', $blocker);
        }

        $update = ['status' => $data['status'], 'decision_note' => $data['note'] ?? null];
        if ($data['status'] === 'promoted') {
            $update['promoted_id'] = str_replace('L9-OC-', 'L9-EV-', $observation->obs_id);
            $update['promoted_at'] = now();
        }
        if ($data['status'] === 'retracted') {
            $update['publication_permission'] = false;
        }
        $observation->update($update);

        return back()->with('success', "{$observation->obs_id} moved to ".str_replace('_', ' ', $data['status']).'.');
    }

    public function togglePermission(Observation $observation): RedirectResponse
    {
        abort_if(in_array($observation->status, ['rejected', 'retracted'], true), 422);
        $observation->update(['publication_permission' => ! $observation->publication_permission]);

        return back()->with('success', "Publication permission for {$observation->obs_id} set to ".($observation->publication_permission ? 'true' : 'false').'.');
    }
}
