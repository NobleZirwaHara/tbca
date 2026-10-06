<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Advisor;
use App\Models\Aiim\Alert;
use App\Models\Aiim\Comparison;
use App\Models\Aiim\Corridor;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\EngagementEvent;
use App\Models\Aiim\Organisation;
use App\Models\Aiim\Project;
use App\Models\Aiim\ReportRequest;
use App\Models\Aiim\SavedItem;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\ComparisonEngine;
use App\Support\Aiim\EngagementFlow;
use App\Support\Aiim\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

/**
 * Stage 1 — shortlisting and comparison: client dashboard, saved items,
 * watchlists and the comparison builder.
 */
class WorkspaceController extends AiimController
{
    public function dashboard(Request $request): Response
    {
        $this->sync($request);
        $user = $request->user();
        $saved = SavedItem::query()->where('user_id', $user->id)->latest()->get();
        $engagements = Engagement::query()->where('user_id', $user->id)->latest()->get();

        $portfolio = $saved->where('list', 'saved')
            ->map(fn ($s) => Catalogue::card($s->entity_type, $s->entity_key)['sector'] ?? 'Other')
            ->map(fn ($s) => $s ?: 'Other')->countBy()->sortDesc()->map(fn ($n, $k) => ['label' => $k, 'value' => $n])->values();

        $paid = $engagements->sum(fn ($e) => $e->deposit_paid_at ? $e->depositExVat() : 0) + $engagements->sum(fn ($e) => $e->balance_paid_at ? $e->feeExVat() - $e->depositExVat() : 0);
        $value = $engagements->whereNotIn('status', ['draft', 'submitted', 'under_review', 'cancelled'])->sum(fn ($e) => $e->feeExVat());

        return $this->render($request, 'Aiim/Workspace/Dashboard', [
            'kpis' => [
                'mandates' => $engagements->whereIn('status', ['in_progress', 'paused', 'delivered', 'accepted'])->count(),
                'saved' => $saved->where('list', 'saved')->count(),
                'comparisons' => Comparison::query()->where('user_id', $user->id)->count(),
                'reports' => ReportRequest::query()->where('user_id', $user->id)->whereIn('status', ['paid', 'in_production', 'delivered'])->count(),
                'introductions' => \App\Models\Aiim\Introduction::query()->whereIn('engagement_id', $engagements->pluck('id'))->count(),
                'alerts' => Alert::query()->where(fn ($q) => $q->whereNull('user_id')->orWhere('user_id', $user->id))->where('status', 'new')->count(),
            ],
            'portfolio' => $portfolio,
            'activity' => EngagementEvent::query()->whereIn('engagement_id', $engagements->pluck('id'))->latest('id')->take(6)->get()
                ->map(fn ($e) => ['action' => $e->action, 'note' => $e->note ?? $engagements->firstWhere('id', $e->engagement_id)?->title, 'at' => $e->created_at->diffForHumans()]),
            'mandates' => $engagements->map(fn ($e) => [
                'reference' => $e->reference, 'mandate' => $e->mandate_reference, 'title' => $e->title, 'stage' => $e->stage ?? EngagementFlow::label($e->status),
                'status' => EngagementFlow::label($e->status), 'rawStatus' => $e->status, 'progress' => $e->progress, 'end' => $e->end_date?->format('j M Y'),
                'next' => EngagementFlow::nextAction($e),
            ]),
            'payment' => ['value' => $value, 'paid' => $paid, 'balance' => max(0, $value - $paid), 'wallet' => WalletService::balance($user)],
            'savedRecent' => $saved->where('list', 'saved')->take(4)->map(fn ($s) => ['type' => Catalogue::typeLabel($s->entity_type), 'name' => $s->label, 'category' => Catalogue::card($s->entity_type, $s->entity_key)['sector'] ?? '—', 'saved' => $s->created_at->format('j M Y'), 'url' => Catalogue::card($s->entity_type, $s->entity_key)['url'] ?? '#'])->values(),
            'watchlists' => $saved->where('list', 'watchlist')->groupBy('entity_type')->map(fn ($g, $t) => ['label' => Catalogue::typeLabel($t).'s', 'count' => $g->count()])->values(),
            'advisor' => Advisor::query()->where('slug', 'sipho-maseko')->first()?->only(['name', 'title', 'email', 'phone']),
            'lastLogin' => now()->format('j M Y, H:i'),
        ], 'Client Dashboard');
    }

    public function saved(Request $request): Response
    {
        return $this->list($request, 'saved');
    }

    public function watchlist(Request $request): Response
    {
        return $this->list($request, 'watchlist');
    }

    private function list(Request $request, string $list): Response
    {
        $user = $request->user();
        $tab = $request->query('tab', 'all');
        $q = trim((string) $request->query('q', ''));
        $sort = $request->query('sort', 'newest');

        $items = SavedItem::query()->where('user_id', $user->id)->where('list', $list)->get()
            ->map(fn ($s) => ($card = Catalogue::card($s->entity_type, $s->entity_key)) ? $card + ['id' => $s->id, 'type' => $s->entity_type, 'typeLabel' => Catalogue::typeLabel($s->entity_type), 'savedOn' => $s->created_at->format('j M Y'), 'savedTs' => $s->created_at->timestamp, 'alerts' => $s->alerts] : null)
            ->filter();
        $counts = ['all' => $items->count()] + $items->countBy('type')->all();
        $items = $items
            ->when($tab !== 'all', fn ($c) => $c->where('type', $tab))
            ->when($q !== '', fn ($c) => $c->filter(fn ($i) => str_contains(strtolower($i['name'].' '.$i['summary'].' '.$i['location']), strtolower($q))))
            ->sortBy(fn ($i) => match ($sort) { 'score' => -($i['score'] ?? 0), 'name' => $i['name'], 'oldest' => $i['savedTs'], default => -$i['savedTs'] })
            ->values();

        return $this->render($request, 'Aiim/Workspace/Saved', [
            'list' => $list, 'tab' => $tab, 'q' => $q, 'sort' => $sort, 'counts' => $counts, 'items' => $items,
            'compareCount' => count($this->draft($user)->items),
        ], $list === 'saved' ? 'Saved Items' : 'Watchlist');
    }

    /** Toggle an item in the saved list or watchlist. */
    public function toggle(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'list' => ['required', Rule::in(['saved', 'watchlist'])],
            'type' => ['required', Rule::in(Catalogue::TYPES)],
            'key' => ['required', 'string', 'max:120'],
        ]);
        $card = Catalogue::card($data['type'], $data['key']);
        abort_unless($card, 404);

        $existing = SavedItem::query()->where(['user_id' => $request->user()->id, 'list' => $data['list'], 'entity_type' => $data['type'], 'entity_key' => $card['key']])->first();
        $label = $data['list'] === 'saved' ? 'Saved Items' : 'your Watchlist';
        if ($existing) {
            $existing->delete();

            return back()->with('success', "{$card['name']} removed from {$label}.");
        }
        SavedItem::create(['user_id' => $request->user()->id, 'list' => $data['list'], 'entity_type' => $data['type'], 'entity_key' => $card['key'], 'label' => $card['name']]);

        return back()->with('success', "{$card['name']} added to {$label}.");
    }

    public function toggleAlerts(Request $request, SavedItem $item): RedirectResponse
    {
        abort_unless($item->user_id === $request->user()->id, 403);
        $item->update(['alerts' => ! $item->alerts]);

        return back()->with('success', $item->alerts ? "Alerts switched on for {$item->label}." : "Alerts paused for {$item->label}.");
    }

    public function clearSelection(Request $request): RedirectResponse
    {
        $request->session()->put('aiim.selection', ['country' => 'Africa (all 54 countries)']);

        return back();
    }

    /* ---------------------------------------------------------- comparison */

    private function draft($user): Comparison
    {
        return Comparison::query()->where('user_id', $user->id)->where('saved', false)->latest('id')->first()
            ?? Comparison::create(['reference' => 'cmp_'.now()->format('Ymd').'_'.strtolower(substr(md5(uniqid()), 0, 4)), 'user_id' => $user->id, 'items' => []]);
    }

    public function builder(Request $request): Response
    {
        $user = $request->user();
        $draft = $this->draft($user);
        if ($ref = $request->query('set')) {
            $source = Comparison::query()->where('reference', $ref)->where('user_id', $user->id)->first();
            if ($source && $source->id !== $draft->id) {
                $draft->update(['items' => $source->items]);
            }
        }

        $q = trim((string) $request->query('q', ''));
        $type = $request->query('type', '');
        $candidates = collect();
        if ($request->query('tab', 'search') === 'saved') {
            $candidates = SavedItem::query()->where('user_id', $user->id)->where('list', 'saved')->whereIn('entity_type', ['opportunity', 'project', 'investor', 'funder', 'corridor'])->get()
                ->map(fn ($s) => Catalogue::card($s->entity_type, $s->entity_key))->filter();
        } else {
            if (! $type || in_array($type, ['opportunity', 'project'], true)) {
                $candidates = $candidates->merge(Project::query()->when($q, fn ($w) => $w->where('name', 'like', "%{$q}%"))->when($request->query('sector'), fn ($w, $s) => $w->where('sector_slug', $s))->when($request->query('province'), fn ($w, $p) => $w->where('province_slug', $p))->orderByDesc('score')->take(8)->get()->map(fn ($p) => Catalogue::card($p->kind === 'project' ? 'project' : 'opportunity', $p->slug)));
            }
            if (! $type || in_array($type, ['investor', 'funder'], true)) {
                $candidates = $candidates->merge(Organisation::query()->when($type, fn ($w) => $w->where('kind', $type))->when($q, fn ($w) => $w->where('name', 'like', "%{$q}%"))->orderByDesc('match_score')->take(6)->get()->map(fn ($o) => Catalogue::card($o->kind, $o->slug)));
            }
            if (! $type || $type === 'corridor') {
                $candidates = $candidates->merge(Corridor::query()->when($q, fn ($w) => $w->where('name', 'like', "%{$q}%"))->take(4)->get()->map(fn ($c) => Catalogue::card('corridor', $c->slug)));
            }
        }

        return $this->render($request, 'Aiim/Workspace/CompareBuilder', [
            'draft' => ['reference' => $draft->reference, 'count' => count($draft->items)] + ComparisonEngine::compare($draft->items),
            'max' => ComparisonEngine::MAX_ITEMS,
            'candidates' => $candidates->values(),
            'filters' => ['q' => $q, 'type' => $type, 'tab' => $request->query('tab', 'search'), 'sector' => $request->query('sector', ''), 'province' => $request->query('province', '')],
            'options' => ['sectors' => \App\Models\Aiim\Sector::query()->orderBy('sort')->get(['slug', 'name']), 'provinces' => \App\Models\Aiim\Province::query()->orderBy('rank')->get(['slug', 'name'])],
        ], 'Comparison Builder');
    }

    public function addItem(Request $request): RedirectResponse
    {
        $data = $request->validate(['type' => ['required', Rule::in(['opportunity', 'project', 'investor', 'funder', 'corridor'])], 'key' => ['required', 'string']]);
        $card = Catalogue::card($data['type'], $data['key']);
        abort_unless($card, 404);
        $draft = $this->draft($request->user());
        $items = collect($draft->items);
        if ($items->contains(fn ($i) => $i['type'] === $data['type'] && $i['key'] === $card['key'])) {
            return back()->with('success', "{$card['name']} is already in your comparison.");
        }
        if ($items->count() >= ComparisonEngine::MAX_ITEMS) {
            return back()->with('error', 'You can compare up to '.ComparisonEngine::MAX_ITEMS.' items. Remove one first.');
        }
        $draft->update(['items' => $items->push(['type' => $data['type'], 'key' => $card['key']])->values()->all()]);

        return back()->with('success', "{$card['name']} added to comparison (".($items->count()).' of '.ComparisonEngine::MAX_ITEMS.' slots used).');
    }

    public function removeItem(Request $request): RedirectResponse
    {
        $data = $request->validate(['type' => ['required', 'string'], 'key' => ['required', 'string']]);
        $draft = $this->draft($request->user());
        $draft->update(['items' => collect($draft->items)->reject(fn ($i) => $i['type'] === $data['type'] && $i['key'] === $data['key'])->values()->all()]);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        $this->draft($request->user())->update(['items' => []]);

        return back()->with('success', 'Comparison cleared.');
    }

    public function generate(Request $request): RedirectResponse
    {
        $draft = $this->draft($request->user());
        if (count($draft->items) < 2) {
            return back()->with('error', 'Add at least two items to compare.');
        }
        $result = Comparison::create(['reference' => 'cmp_'.now()->format('Ymd').'_'.strtolower(substr(md5(uniqid()), 0, 3)), 'user_id' => $request->user()->id, 'items' => $draft->items, 'saved' => false]);
        $draft->update(['saved' => true]); // retire the draft; the next visit opens a fresh one
        $result->update(['saved' => true]);

        return redirect("/aiim/workspace/compare/{$result->reference}");
    }

    public function results(Request $request, Comparison $comparison): Response
    {
        abort_unless($comparison->user_id === $request->user()->id, 403);

        return $this->render($request, 'Aiim/Workspace/CompareResults', [
            'comparison' => ['reference' => $comparison->reference, 'generated' => $comparison->created_at->format('j M Y, H:i').' SAST', 'saved' => $comparison->saved] + ComparisonEngine::compare($comparison->items),
        ], 'Comparison Results');
    }

    public function exportComparison(Request $request, Comparison $comparison)
    {
        abort_unless($comparison->user_id === $request->user()->id, 403);
        $data = ComparisonEngine::compare($comparison->items);
        $rows = [array_merge(['Metric'], array_map(fn ($c) => $c['card']['name'], $data['columns']))];
        foreach ($data['rows'] as $row) {
            $rows[] = array_merge([$row['label']], array_map(fn ($c) => $c['metrics'][$row['key']]['display'], $data['columns']));
        }
        $rows[] = array_merge(['Overall Score (Weighted)'], array_map(fn ($c) => $c['overall'], $data['columns']));
        $csv = collect($rows)->map(fn ($r) => collect($r)->map(fn ($v) => '"'.str_replace('"', '""', (string) $v).'"')->implode(','))->implode("\n");

        return response($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename=aiim-{$comparison->reference}.csv"]);
    }
}
