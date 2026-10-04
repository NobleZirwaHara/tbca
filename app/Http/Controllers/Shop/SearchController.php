<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Support\Shop\Acts;
use App\Support\Shop\Catalogue;
use App\Support\Shop\Search;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Site search (header search box): standard results, near-duplicate
 * consolidation, too-many-results refinement and zero-result recovery.
 */
class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'acts' => ['nullable', 'array'], 'acts.*' => ['string', 'max:2'],
            'delivery' => ['nullable', 'array'], 'delivery.*' => ['string', 'max:6'],
            'subs' => ['nullable', 'array'], 'subs.*' => ['string', 'max:80'],
            'category' => ['nullable', 'string', 'max:80'],
            'buyer' => ['nullable', 'string', 'max:30'],
            'sort' => ['nullable', 'in:relevance,price_asc,price_desc,name'],
            'page' => ['nullable', 'integer', 'min:1'],
            'all' => ['nullable', 'boolean'],
            'dedupe' => ['nullable', 'in:consolidated'],
            'price_min' => ['nullable', 'integer', 'min:0'],
            'price_max' => ['nullable', 'integer', 'min:0'],
            'view' => ['nullable', 'in:list,grid'],
        ]);

        $q = trim((string) ($data['q'] ?? ''));
        if ($q !== '') {
            $recent = collect($request->session()->get('shop.recent_searches', []))->reject(fn ($s) => strcasecmp($s, $q) === 0)->prepend($q)->take(8)->values()->all();
            $request->session()->put('shop.recent_searches', $recent);
        }

        $run = Search::run($q, [
            'acts' => $data['acts'] ?? [],
            'delivery' => $data['delivery'] ?? [],
            'subcategories' => $data['subs'] ?? [],
            'aisle' => $data['category'] ?? null,
            'buyer' => $data['buyer'] ?? null,
            'sort' => $data['sort'] ?? 'relevance',
            'page' => $data['page'] ?? 1,
            'all' => (bool) ($data['all'] ?? false),
            'dedupe' => $data['dedupe'] ?? null,
            'price_min' => $data['price_min'] ?? null,
            'price_max' => $data['price_max'] ?? null,
        ]);

        return Inertia::render('Search/Results', [
            'search' => $run,
            'filters' => [
                'q' => $q, 'acts' => $data['acts'] ?? [], 'delivery' => $data['delivery'] ?? [], 'subs' => $data['subs'] ?? [],
                'category' => $data['category'] ?? null, 'buyer' => $data['buyer'] ?? null, 'sort' => $data['sort'] ?? 'relevance',
                'price_min' => $data['price_min'] ?? null, 'price_max' => $data['price_max'] ?? null, 'view' => $data['view'] ?? 'list',
                'dedupe' => $data['dedupe'] ?? null,
            ],
            'acts' => Acts::options(),
            'deliveryBands' => collect(Catalogue::DELIVERY_BANDS)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values(),
            'aisles' => collect(Catalogue::aisles())->map(fn ($a) => ['value' => $a['slug'], 'label' => $a['name']])->values(),
            'buyers' => collect(Catalogue::BUYER_TYPES)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values(),
            'recent' => $request->session()->get('shop.recent_searches', []),
        ]);
    }

    public function clearHistory(Request $request): RedirectResponse
    {
        $request->session()->forget('shop.recent_searches');

        return back()->with('success', 'Search history cleared.');
    }
}
