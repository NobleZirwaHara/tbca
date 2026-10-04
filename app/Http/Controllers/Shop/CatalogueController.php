<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\SavedItem;
use App\Models\Shop\Product;
use App\Support\Platform\Basket;
use App\Support\Shop\Acts;
use App\Support\Shop\Catalogue;
use App\Support\Shop\ProductPresenter;
use App\Support\Shop\Search;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shop entry, A-Z aisle browser, sub-category browser and product listings
 * (blueprint 5.1 layers 2-3: curated entry and structured browse).
 */
class CatalogueController extends Controller
{
    public const PRICE_BANDS = [
        'under-1000' => ['label' => 'Under R1 000', 'min' => null, 'max' => 999],
        '1000-2500' => ['label' => 'R1 000 - R2 500', 'min' => 1000, 'max' => 2500],
        '2500-5000' => ['label' => 'R2 500 - R5 000', 'min' => 2500, 'max' => 5000],
        '5000-10000' => ['label' => 'R5 000 - R10 000', 'min' => 5000, 'max' => 10000],
        '10000-25000' => ['label' => 'R10 000 - R25 000', 'min' => 10000, 'max' => 25000],
        'over-25000' => ['label' => 'Over R25 000', 'min' => 25001, 'max' => null],
    ];

    public function index(Request $request, Basket $basket): Response
    {
        $filters = $request->only(['q', 'category', 'buyer', 'delivery', 'price', 'automation', 'review', 'language', 'format']);
        $active = array_filter($filters);

        $results = null;
        if ($active !== []) {
            $band = self::PRICE_BANDS[$filters['price'] ?? ''] ?? null;
            $run = Search::run((string) ($filters['q'] ?? ''), [
                'aisle' => $filters['category'] ?? null,
                'buyer' => $filters['buyer'] ?? null,
                'delivery' => ! empty($filters['delivery']) ? [$filters['delivery']] : [],
                'price_min' => $band['min'] ?? null,
                'price_max' => $band['max'] ?? null,
                'automation' => $filters['automation'] ?? null,
                'review' => $filters['review'] ?? null,
                'language' => $filters['language'] ?? null,
                'all' => true,
            ]);
            $results = ['total' => $run['total'], 'items' => $run['results']];
        }

        $user = $request->user();

        return Inertia::render('Shop/Index', [
            'featured' => Product::query()->listed()->where('featured', true)->orderBy('id')->take(5)->get()->map(fn ($p) => [
                ...ProductPresenter::card($p), 'languages' => $p->contentValue('languages', ['EN']),
            ]),
            'formats' => Catalogue::formats(),
            'aisles' => collect(Catalogue::aisles())->map(fn ($a) => ['value' => $a['slug'], 'label' => $a['name']])->all(),
            'routeTiles' => Catalogue::routeTiles(),
            'priceBands' => collect(self::PRICE_BANDS)->map(fn ($b, $k) => ['value' => $k, 'label' => $b['label']])->values(),
            'filters' => $filters,
            'results' => $results,
            'cart' => ['count' => $basket->count(), 'subtotal' => $basket->subtotal()],
            'savedCount' => $user ? SavedItem::query()->where('user_id', $user->id)->count() : 0,
            'governedTotal' => Catalogue::GOVERNED_TOTAL,
        ]);
    }

    public function aisles(Request $request): Response
    {
        $q = Str::lower(trim((string) $request->query('q', '')));
        $buyer = $request->query('buyer');
        $acts = array_values(array_filter((array) $request->query('acts', [])));
        $sort = $request->query('sort', 'az');

        $all = collect(Catalogue::aisles());
        $aisles = $all
            ->when($q !== '', fn ($c) => $c->filter(fn ($a) => str_contains(Str::lower($a['name'].' '.$a['description']), $q)))
            ->when($buyer, fn ($c) => $c->filter(fn ($a) => in_array($buyer, $a['buyers'], true)))
            ->when($acts !== [], fn ($c) => $c->filter(fn ($a) => array_intersect($acts, $a['acts']) !== []));
        $aisles = match ($sort) {
            'za' => $aisles->sortByDesc('name'),
            'largest' => $aisles->sortByDesc('products'),
            default => $aisles->sortBy('name'),
        };

        return Inertia::render('Shop/AtoZ', [
            'aisles' => $aisles->values()->map(fn ($a) => [...$a, 'listed' => Catalogue::productCountForAisle($a['slug'])]),
            'filters' => ['q' => $request->query('q', ''), 'buyer' => $buyer, 'acts' => $acts, 'sort' => $sort, 'view' => $request->query('view', 'grid')],
            'buyerCounts' => collect(Catalogue::BUYER_TYPES)->map(fn ($label, $key) => ['value' => $key, 'label' => $label, 'count' => $all->filter(fn ($a) => in_array($key, $a['buyers'], true))->count()])->values(),
            'actCounts' => collect(Acts::ACTS)->map(fn ($a, $key) => ['value' => $key, 'label' => $a['label'], 'count' => $all->filter(fn ($x) => in_array($key, $x['acts'], true))->count()])->values(),
            'totals' => ['aisles' => $all->count(), 'products' => Catalogue::GOVERNED_TOTAL],
        ]);
    }

    public function aisle(Request $request, string $aisle): Response
    {
        $meta = Catalogue::aisle($aisle);
        abort_if($meta === null, 404);

        $q = Str::lower(trim((string) $request->query('q', '')));
        $acts = array_values(array_filter((array) $request->query('acts', [])));
        $delivery = array_values(array_filter((array) $request->query('delivery', [])));
        $sort = $request->query('sort', 'az');

        $products = Product::query()->listed()->where('aisle', $aisle)->get();
        $subs = collect(Catalogue::subcategories($aisle))->map(function ($s) use ($products) {
            $own = $products->where('subcategory', $s['slug']);
            $prices = $own->pluck('price_zar')->filter(fn ($p) => $p > 0);

            return [
                ...$s,
                'listed' => $own->count(),
                'from_zar' => $prices->min() ?? $s['from_zar'],
                'acts' => array_values(array_unique([...$s['acts'], ...$own->pluck('act')->all()])),
                'bands' => $own->map(fn ($p) => Catalogue::deliveryBand($p->delivery))->filter()->unique()->values()->all(),
            ];
        });

        $all = $subs;
        $subs = $subs
            ->when($q !== '', fn ($c) => $c->filter(fn ($s) => str_contains(Str::lower($s['name'].' '.$s['description']), $q)))
            ->when($acts !== [], fn ($c) => $c->filter(fn ($s) => array_intersect($acts, $s['acts']) !== []))
            ->when($delivery !== [], fn ($c) => $c->filter(fn ($s) => array_intersect($delivery, $s['bands']) !== []));
        $subs = match ($sort) {
            'za' => $subs->sortByDesc('name'),
            'price' => $subs->sortBy(fn ($s) => $s['from_zar'] ?? PHP_INT_MAX),
            'largest' => $subs->sortByDesc('sprints'),
            default => $subs->sortBy('name'),
        };

        $actsAvailable = $all->flatMap(fn ($s) => $s['acts'])->unique()->sort()->values();

        return Inertia::render('Shop/Aisle', [
            'aisle' => $meta,
            'subcategories' => $subs->values(),
            'filters' => ['q' => $request->query('q', ''), 'acts' => $acts, 'delivery' => $delivery, 'sort' => $sort, 'view' => $request->query('view', 'grid')],
            'actCounts' => collect(Acts::ACTS)->map(fn ($a, $k) => ['value' => $k, 'label' => $a['label'], 'count' => $products->where('act', $k)->count()])->values(),
            'deliveryCounts' => collect(Catalogue::DELIVERY_BANDS)->map(fn ($label, $k) => ['value' => $k, 'label' => $label, 'count' => $products->filter(fn ($p) => Catalogue::deliveryBand($p->delivery) === $k)->count()])->values(),
            'stats' => [
                'subcategories' => $all->count(),
                'acts' => $actsAvailable->take(3)->implode(', '),
                'delivery' => '5-30 Days',
            ],
        ]);
    }

    public function subcategory(Request $request, string $aisle, string $sub): Response
    {
        $meta = Catalogue::aisle($aisle);
        $subMeta = collect(Catalogue::subcategories($aisle))->firstWhere('slug', $sub);
        abort_if($meta === null || $subMeta === null, 404);

        $acts = array_values(array_filter((array) $request->query('acts', [])));
        $delivery = array_values(array_filter((array) $request->query('delivery', [])));
        $sort = $request->query('sort', 'relevance');

        $run = Search::run('', ['aisle' => $aisle, 'subcategories' => [$sub], 'acts' => $acts, 'delivery' => $delivery, 'sort' => $sort, 'all' => true]);
        $base = Product::query()->listed()->where('aisle', $aisle)->where('subcategory', $sub)->get();

        return Inertia::render('Shop/Subcategory', [
            'aisle' => $meta,
            'subcategory' => $subMeta,
            'results' => $run['results'],
            'total' => $run['total'],
            'filters' => ['acts' => $acts, 'delivery' => $delivery, 'sort' => $sort],
            'actCounts' => collect(Acts::ACTS)->map(fn ($a, $k) => ['value' => $k, 'label' => $a['label'], 'count' => $base->where('act', $k)->count()])->values(),
            'deliveryCounts' => collect(Catalogue::DELIVERY_BANDS)->map(fn ($label, $k) => ['value' => $k, 'label' => $label, 'count' => $base->filter(fn ($p) => Catalogue::deliveryBand($p->delivery) === $k)->count()])->values(),
        ]);
    }

    /** Legacy /shop/{slug-or-code} links resolve to the canonical product URL. */
    public function legacy(string $code)
    {
        $product = Product::query()->where('slug', $code)->orWhere('code', strtoupper($code))->orWhere('sprint_code', strtoupper($code))->first();

        return $product
            ? redirect($product->url(), 301)
            : redirect('/search?q='.urlencode(str_replace('-', ' ', $code)));
    }
}
