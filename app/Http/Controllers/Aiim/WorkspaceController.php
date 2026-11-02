<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Comparison;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\SavedItem;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\ComparisonEngine;
use App\Support\Aiim\ProtoAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

/**
 * Shortlisting and comparison (mock-ups 21 to 24 and 77): client dashboard, saved items,
 * watchlist and the comparison builder for Botswana opportunity templates.
 */
class WorkspaceController extends AiimController
{
    public function dashboard(Request $request): Response
    {
        $this->sync($request);
        $user = $request->user();
        $snap = $this->snapshot($user);
        $latest = Engagement::query()->where('user_id', $user->id)->latest('id')->value('reference');

        return $this->render($request, 'Aiim/Workspace/Dashboard', [
            'kpis' => ['saved' => $snap['saved'], 'watchlist' => $snap['watchlist'], 'wallet' => $snap['wallet'], 'reports' => $snap['reports']],
            'top' => ProtoAccount::top30(),
            'alerts' => array_map(fn ($r) => ['status' => (string) $r['Status'], 'change' => (string) $r['Change'], 'instrument' => (string) $r['Instrument']], array_slice(ProtoAccount::regChange()['rows'], 0, 5)),
            'ledgerUrl' => $latest ? "/aiim/workspace/engagements/{$latest}/ledger" : '/aiim/wallet',
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
        $items = SavedItem::query()->where('user_id', $user->id)->where('list', $list)->latest('id')->get()
            ->map(function ($s) {
                $card = Catalogue::card($s->entity_type, $s->entity_key);

                return [
                    'id' => $s->id, 'type' => $s->entity_type, 'key' => $s->entity_key, 'typeLabel' => Catalogue::typeLabel($s->entity_type),
                    'label' => $card['name'] ?? $s->label, 'url' => $card['url'] ?? null, 'savedOn' => $s->created_at->format('d/m/Y'), 'alerts' => (bool) $s->alerts,
                ];
            })->values();

        $props = [
            'list' => $list,
            'items' => $items,
            'services' => $list === 'saved'
                ? ProtoAccount::rail(['AAB-EMB-094', 'AAB-EMB-200', 'AAB-EMB-218'], 3)
                : ProtoAccount::rail(['AAB-EMB-113', 'AAB-EMB-172', 'AAB-EMB-173', 'AAB-EMB-174', 'AAB-EMB-175'], 5),
        ];
        if ($list === 'watchlist') {
            $props['changes'] = ProtoAccount::regChange();
        }

        return $this->render($request, 'Aiim/Workspace/Saved', $props, $list === 'saved' ? 'Saved Items' : 'Watchlist');
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

        return $this->render($request, 'Aiim/Workspace/CompareBuilder', [
            'draft' => ['reference' => $draft->reference, 'items' => collect($draft->items)->map(fn ($i) => $this->selectedItem($i))->filter()->values()],
            'max' => ComparisonEngine::MAX_ITEMS,
            'q' => $q,
            'candidates' => ProtoAccount::searchTemplates($q),
            'services' => ProtoAccount::rail(['AAB-EMB-112', 'AAB-EMB-182', 'AAB-EMB-199'], 3),
        ], 'Comparison Builder');
    }

    /** A draft comparison item as shown in the "Selected" panel. */
    private function selectedItem(array $i): ?array
    {
        if ($i['type'] === ComparisonEngine::TEMPLATE) {
            $o = ProtoAccount::template($i['key']);

            return $o ? ['type' => $i['type'], 'key' => $i['key'], 'name' => (string) $o['Opportunity'], 'tier' => (string) ($o['Tier'] ?? ''), 'url' => ProtoAccount::oppUrl($i['key'])] : null;
        }
        $card = Catalogue::card($i['type'], $i['key']);

        return $card ? ['type' => $i['type'], 'key' => $i['key'], 'name' => $card['name'], 'tier' => null, 'url' => $card['url']] : null;
    }

    public function addItem(Request $request): RedirectResponse
    {
        $data = $request->validate(['type' => ['required', Rule::in([ComparisonEngine::TEMPLATE, 'opportunity', 'project', 'investor', 'funder', 'corridor'])], 'key' => ['required', 'string']]);
        if ($data['type'] === 'opportunity' && ProtoAccount::isTemplate($data['key'])) {
            $data['type'] = ComparisonEngine::TEMPLATE; // Botswana opportunities compare as templates
        }
        if ($data['type'] === ComparisonEngine::TEMPLATE) {
            $o = ProtoAccount::template($data['key']);
            abort_unless($o, 404);
            $name = (string) $o['Opportunity'];
            $key = (string) $o['Opp ID'];
        } else {
            $card = Catalogue::card($data['type'], $data['key']);
            abort_unless($card, 404);
            $name = $card['name'];
            $key = $card['key'];
        }
        $draft = $this->draft($request->user());
        $items = collect($draft->items);
        if ($items->contains(fn ($i) => $i['type'] === $data['type'] && $i['key'] === $key)) {
            return back()->with('success', "{$name} is already in your comparison.");
        }
        if ($items->count() >= ComparisonEngine::MAX_ITEMS) {
            return back()->with('error', 'Five is the maximum. Remove one first.');
        }
        $draft->update(['items' => $items->push(['type' => $data['type'], 'key' => $key])->values()->all()]);

        return back()->with('success', "{$name} added to comparison (".($items->count() + 1).' of '.ComparisonEngine::MAX_ITEMS.').');
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
            'comparison' => ['reference' => $comparison->reference, 'generated' => $comparison->created_at->format('j M Y, H:i')] + ComparisonEngine::compare($comparison->items),
            'templates' => ComparisonEngine::templates($comparison->items),
            'fields' => ProtoAccount::COMPARE_FIELDS,
            'report' => ProtoAccount::service('AAB-EMB-199'),
        ], 'Comparison Results');
    }

    public function exportComparison(Request $request, Comparison $comparison)
    {
        abort_unless($comparison->user_id === $request->user()->id, 403);
        $templates = ComparisonEngine::templates($comparison->items);
        $data = ComparisonEngine::compare($comparison->items);
        $rows = [];
        if ($templates) {
            $rows[] = array_merge(['Field'], array_map(fn ($t) => $t['id'].' '.$t['name'], $templates));
            foreach (ProtoAccount::COMPARE_FIELDS as $f) {
                $rows[] = array_merge([$f], array_map(fn ($t) => $t['fields'][$f], $templates));
            }
        }
        if ($data['columns']) {
            $rows[] = array_merge(['Metric'], array_map(fn ($c) => $c['card']['name'], $data['columns']));
            foreach ($data['rows'] as $row) {
                $rows[] = array_merge([$row['label']], array_map(fn ($c) => $c['metrics'][$row['key']]['display'], $data['columns']));
            }
            $rows[] = array_merge(['Overall Score (Weighted)'], array_map(fn ($c) => $c['overall'], $data['columns']));
        }
        $csv = collect($rows)->map(fn ($r) => collect($r)->map(fn ($v) => '"'.str_replace('"', '""', (string) $v).'"')->implode(','))->implode("\n");

        return response($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => "attachment; filename=aiim-{$comparison->reference}.csv"]);
    }
}
