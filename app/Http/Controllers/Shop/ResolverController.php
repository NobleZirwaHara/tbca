<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Support\Shop\Catalogue;
use App\Support\Shop\Search;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Services Resolver: the primary front door for an ambiguous client need
 * (blueprint 5.1 layer 1). Maps a described need and/or a priority to
 * capability aisles and governed Product Masters.
 */
class ResolverController extends Controller
{
    public const BUDGETS = [
        'under-5000' => ['label' => 'Under R5 000', 'max' => 5000],
        '5000-25000' => ['label' => 'R5 000 - R25 000', 'max' => 25000],
        'over-25000' => ['label' => 'Over R25 000', 'max' => null],
        'unsure' => ['label' => 'Not sure yet', 'max' => null],
    ];

    public function show(Request $request): Response
    {
        $data = $request->validate([
            'need' => ['nullable', 'string', 'max:300'],
            'priority' => ['nullable', 'string', 'max:30'],
            'buyer' => ['nullable', 'string', 'max:30'],
            'budget' => ['nullable', 'string', 'max:30'],
            'urgency' => ['nullable', 'string', 'max:30'],
            'language' => ['nullable', 'string', 'max:5'],
            'guided' => ['nullable', 'boolean'],
        ]);

        $priorities = Catalogue::priorities();
        $priority = collect($priorities)->firstWhere('key', $data['priority'] ?? null);
        $need = trim((string) ($data['need'] ?? ''));

        $result = null;
        if ($need !== '' || $priority) {
            $query = trim($need.' '.($need === '' && $priority ? implode(' ', array_slice($priority['keywords'], 0, 1)) : ''));
            $run = Search::run($query, ['all' => true, 'buyer' => $data['buyer'] ?? null]);
            $matches = collect($run['results']);

            // Widen with the priority's aisles when the need text alone is thin.
            if ($priority) {
                $byAisle = collect(Search::run('', ['all' => true])['results'])->filter(fn ($r) => in_array($r['aisle'], $priority['aisles'], true));
                $matches = $matches->concat($byAisle)->unique('key');
            }

            $max = self::BUDGETS[$data['budget'] ?? '']['max'] ?? null;
            if ($max) {
                $matches = $matches->filter(fn ($r) => $r['price_zar'] === null || $r['price_zar'] <= $max);
            }
            if (($data['urgency'] ?? null) === 'this-week') {
                $matches = $matches->sortBy(fn ($r) => $r['delivery_band'] === '0-5' ? 0 : 1);
            }

            $aisles = $priority
                ? collect(Catalogue::aisles())->whereIn('slug', $priority['aisles'])->values()
                : Catalogue::nearestAisles($need, 3);

            $result = [
                'products' => $matches->take(6)->values(),
                'aisles' => $aisles,
                'total' => $matches->count(),
                'priority' => $priority,
                'interpreted' => $need !== '' ? Search::tokens($need) : [],
            ];
        }

        return Inertia::render('Shop/Resolver', [
            'priorities' => collect($priorities)->map(fn ($p) => collect($p)->only(['key', 'title', 'body', 'icon']))->values(),
            'budgets' => collect(self::BUDGETS)->map(fn ($b, $k) => ['value' => $k, 'label' => $b['label']])->values(),
            'buyers' => collect(Catalogue::BUYER_TYPES)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values(),
            'filters' => [
                'need' => $need, 'priority' => $data['priority'] ?? null, 'buyer' => $data['buyer'] ?? null, 'budget' => $data['budget'] ?? null,
                'urgency' => $data['urgency'] ?? null, 'language' => $data['language'] ?? 'en', 'guided' => (bool) ($data['guided'] ?? false),
            ],
            'result' => $result,
        ]);
    }
}
