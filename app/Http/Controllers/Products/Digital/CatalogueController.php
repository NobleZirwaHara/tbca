<?php

namespace App\Http\Controllers\Products\Digital;

use App\Http\Controllers\Controller;
use App\Models\Products\Digital\DpProduct;
use App\Support\Products\Digital\Licences;
use App\Support\Products\Digital\Markets;
use App\Support\Products\Digital\Presenter;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/** Public catalogue: landing / catalogue, search-filter-compare and product page. */
class CatalogueController extends Controller
{
    public const PRICE_RANGES = [
        'under-1000' => ['Under R1 000', 0, 999],
        '1000-2500' => ['R1 000 – R2 500', 1000, 2500],
        '2500-5000' => ['R2 500 – R5 000', 2501, 5000],
        'over-5000' => ['Over R5 000', 5001, PHP_INT_MAX],
    ];

    public const AUDIENCES = [
        'entrepreneurs' => 'Entrepreneurs', 'smes' => 'SMEs', 'startups' => 'Startups', 'consultants' => 'Consultants',
        'investors' => 'Investors', 'corporates' => 'Corporates', 'finance' => 'Finance Professionals', 'public' => 'Public Sector',
    ];

    public const INDUSTRIES = [
        'cross-industry' => 'Cross-industry', 'energy' => 'Energy', 'agriculture' => 'Agriculture', 'infrastructure' => 'Infrastructure',
        'financial-services' => 'Financial Services', 'manufacturing' => 'Manufacturing', 'trade' => 'Trade',
    ];

    public function index(Request $request): Response
    {
        [$all, $results, $filters] = $this->search($request);

        return Inertia::render('Products/Digital/Catalogue', [
            'products' => $results->map(fn ($p) => Presenter::card($p))->values(),
            'total' => $results->count(),
            'facets' => $this->facets($all),
            'filters' => $filters,
        ]);
    }

    public function browse(Request $request): Response
    {
        [$all, $results, $filters] = $this->search($request);

        $compare = collect(explode(',', (string) $request->query('compare', '')))->filter()->unique()->take(4)->values();
        if ($compare->isEmpty()) {
            $compare = $results->take(4)->pluck('slug');
        }

        $compared = $compare->map(fn ($slug) => $all->firstWhere('slug', $slug))->filter()->values();

        return Inertia::render('Products/Digital/Browse', [
            'products' => $results->map(fn ($p) => Presenter::card($p))->values(),
            'total' => $results->count(),
            'compare' => $compared->map(fn ($p) => [
                ...Presenter::card($p),
                'licenceClasses' => collect($p->prices ?? [])->filter()->keys()->implode(', '),
                'languagesLabel' => collect($p->languages ?? [])->where('state', 'approved')->pluck('label')->implode(', '),
                'compareRows' => $p->compare ?? [],
            ]),
            'facets' => $this->facets($all),
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, DpProduct $product): Response
    {
        abort_unless(in_array($product->lifecycle_status, ['live', 'withdrawn_hold'], true) || $product->disposition === 'DP-FR', 404);

        $product->load('versions');
        $related = DpProduct::query()->with('versions')
            ->where('lifecycle_status', 'live')->where('disposition', '!=', 'DP-FR')
            ->where('id', '!=', $product->id)
            ->orderByRaw('case when type = ? then 0 else 1 end', [$product->type])
            ->orderByDesc('popularity')->limit(4)->get();

        $user = $request->user();

        return Inertia::render('Products/Digital/Product', [
            'product' => Presenter::detail($product),
            'licences' => Licences::all(),
            'related' => $related->map(fn ($p) => Presenter::card($p)),
            'saved' => $user ? $user->savedItems()->where('item_type', 'digital-product')->where('item_key', $product->slug)->exists() : false,
            'owned' => $user ? $product->entitlements()->where('user_id', $user->id)->where('status', 'active')->value('reference') : null,
        ]);
    }

    /** @return array{0: Collection<int, DpProduct>, 1: Collection<int, DpProduct>, 2: array<string, mixed>} */
    private function search(Request $request): array
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'types' => array_values(array_filter((array) $request->query('types', $request->query('type') ? [$request->query('type')] : []))),
            'audience' => (string) $request->query('audience', ''),
            'language' => strtoupper((string) $request->query('language', '')),
            'currency' => strtoupper((string) $request->query('currency', '')),
            'jurisdiction' => strtoupper((string) $request->query('jurisdiction', '')),
            'format' => (string) $request->query('format', ''),
            'price' => (string) $request->query('price', ''),
            'licence' => (string) $request->query('licence', ''),
            'industry' => (string) $request->query('industry', ''),
            'function' => (string) $request->query('function', ''),
            'sort' => (string) $request->query('sort', 'relevance'),
        ];

        $all = DpProduct::query()->with('versions')
            ->where('lifecycle_status', 'live')
            ->where('disposition', '!=', 'DP-FR')
            ->get();

        $q = mb_strtolower($filters['q']);
        $words = array_filter(explode(' ', $q));

        $results = $all
            ->when($words, fn ($c) => $c->filter(function (DpProduct $p) use ($words) {
                $hay = mb_strtolower($p->name.' '.$p->tagline.' '.$p->type.' '.$p->category.' '.$p->audience);

                return collect($words)->every(fn ($w) => str_contains($hay, $w));
            }))
            ->when($filters['types'], fn ($c) => $c->whereIn('type', $filters['types']))
            ->when($filters['audience'], fn ($c) => $c->filter(fn ($p) => in_array($filters['audience'], $p->audiences ?? [], true)))
            ->when($filters['industry'], fn ($c) => $c->filter(fn ($p) => in_array($filters['industry'], $p->industries ?? [], true)))
            ->when($filters['function'], fn ($c) => $c->where('business_function', $filters['function']))
            ->when($filters['language'], fn ($c) => $c->filter(fn ($p) => Markets::hasLanguage($p, $filters['language'])))
            ->when($filters['currency'], fn ($c) => $c->filter(fn ($p) => Markets::hasCurrency($p, $filters['currency'])))
            ->when($filters['jurisdiction'], fn ($c) => $c->filter(fn ($p) => Markets::appliesIn($p, $filters['jurisdiction'])))
            ->when($filters['format'], fn ($c) => $c->filter(fn ($p) => collect($p->formats)->contains('code', $filters['format'])))
            ->when($filters['licence'], fn ($c) => $c->filter(fn ($p) => ! empty(($p->prices ?? [])[$filters['licence']])))
            ->when(isset(self::PRICE_RANGES[$filters['price']]), function ($c) use ($filters) {
                [, $min, $max] = self::PRICE_RANGES[$filters['price']];

                return $c->filter(fn ($p) => $p->fromPrice() >= $min && $p->fromPrice() <= $max);
            });

        $results = match ($filters['sort']) {
            'price-asc' => $results->sortBy(fn ($p) => $p->fromPrice()),
            'price-desc' => $results->sortByDesc(fn ($p) => $p->fromPrice()),
            'newest' => $results->sortByDesc('released_at'),
            'dss' => $results->sortByDesc('dss'),
            default => $words
                ? $results->sortByDesc(fn ($p) => (str_contains(mb_strtolower($p->name), $q) ? 1000 : 0) + $p->popularity)
                : $results->sortByDesc('popularity'),
        };

        return [$all, $results->values(), $filters];
    }

    private function facets(Collection $all): array
    {
        $count = fn (callable $fn) => $all->filter($fn)->count();

        return [
            'types' => collect(Presenter::TYPES)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => $all->where('type', $key)->count()])->values(),
            'audiences' => collect(self::AUDIENCES)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => $count(fn ($p) => in_array($key, $p->audiences ?? [], true))])->values(),
            'industries' => collect(self::INDUSTRIES)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => $count(fn ($p) => in_array($key, $p->industries ?? [], true))])->values(),
            'functions' => $all->pluck('business_function')->filter()->unique()->sort()->values()->map(fn ($f) => ['key' => $f, 'label' => $f, 'count' => $all->where('business_function', $f)->count()]),
            'languages' => collect(Markets::LANGUAGES)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => $count(fn ($p) => Markets::hasLanguage($p, $key))])->values(),
            'currencies' => collect(Markets::CURRENCIES)->map(fn ($label, $key) => ['key' => $key, 'label' => "{$key} – {$label}", 'count' => $count(fn ($p) => Markets::hasCurrency($p, $key))])->values(),
            'jurisdictions' => collect(Markets::jurisdictionOptions())->map(fn ($o) => [...$o, 'count' => $count(fn ($p) => Markets::appliesIn($p, $o['key']))])->values(),
            'formats' => collect(['PDF', 'DOCX', 'XLSX', 'PPTX'])->map(fn ($f) => ['key' => $f, 'label' => $f, 'count' => $count(fn ($p) => collect($p->formats)->contains('code', $f))]),
            'prices' => collect(self::PRICE_RANGES)->map(fn ($r, $key) => ['key' => $key, 'label' => $r[0], 'count' => $count(fn ($p) => $p->fromPrice() >= $r[1] && $p->fromPrice() <= $r[2])])->values(),
            'licences' => collect(Licences::all())->map(fn ($l, $key) => ['key' => $key, 'label' => "{$key} {$l['short']}", 'count' => $count(fn ($p) => ! empty(($p->prices ?? [])[$key]))])->values(),
        ];
    }
}
