<?php

namespace App\Support\Sprints;

use App\Models\Sprint;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Server-side search, filtering, faceting, sorting and pagination of the sprint catalogue.
 *
 * The whole published catalogue is filtered in memory: delivery bands and buyer
 * routes live in free-text / comma-separated columns, and this keeps the logic
 * identical across SQLite and MySQL. The catalogue is a few thousand rows at most.
 */
class Catalogue
{
    public const PER_PAGE = 12;

    public const FILTER_KEYS = ['q', 'type', 'category', 'audience', 'price', 'delivery', 'need', 'act', 'rating', 'letter', 'sort', 'page', 'flag'];

    /** Map client_type on users to buyer route keys. */
    private const CLIENT_TYPE_AUDIENCE = [
        'sme' => 'smes', 'founder' => 'founders', 'corporate' => 'corporates', 'investor' => 'investors',
        'ngo' => 'ngos', 'public' => 'public-sector', 'sponsor' => 'sponsors',
    ];

    /** @var Collection<int, Sprint>|null */
    private ?Collection $all = null;

    public function __construct(private ?User $user = null)
    {
        self::$attrCache = [];
    }

    /** Attribute keys the catalogue reads; everything else is dropped from the cached index. */
    private const INDEX_ATTRIBUTES = ['badge', 'billing_period', 'brief', 'icon', 'ideal_for', 'keywords', 'label', 'marketplace', 'needs', 'outcomes', 'price_display', 'reviews', 'spotlight', 'why'];

    /**
     * Published sprints with a trimmed attribute set. Full rows carry ~10 MB of JSON, so the
     * index is cached and keyed on the table's row count and latest update, which changes
     * whenever a seeder or admin edits a sprint.
     *
     * @return Collection<int, Sprint>
     */
    public function all(): Collection
    {
        if ($this->all !== null) {
            return $this->all;
        }

        $version = Sprint::query()->count().'-'.Sprint::query()->max('updated_at');

        $rows = Cache::remember('sprints.catalogue-index.'.md5($version), now()->addDay(), function () {
            return Sprint::query()
                ->where('status', 'published')
                ->orderBy('title')
                ->get()
                ->map(function (Sprint $s) {
                    $row = $s->getAttributes();
                    $row['attributes'] = json_encode(array_intersect_key((array) ($s->attributes ?? []), array_flip(self::INDEX_ATTRIBUTES)));
                    unset($row['description']);

                    return $row;
                })
                ->all();
        });

        return $this->all = Sprint::hydrate($rows);
    }

    /**
     * @param  array<string, mixed>  $filters  normalised filters (see normalise())
     * @param  callable(Sprint): bool|null  $scope  restricts the base set (curated view, fixed category ...)
     * @return array{results: LengthAwarePaginator, facets: array<string, mixed>, total: int, spotlight: ?array}
     */
    public function search(array $filters, ?callable $scope = null, string $path = '/sprints', bool $paginate = true): array
    {
        $base = $scope ? $this->all()->filter($scope)->values() : $this->all();

        $filtered = $base->filter(fn (Sprint $s) => $this->matches($s, $filters))->values();
        $sorted = $this->sort($filtered, $filters['sort'] ?? 'recommended');

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = $paginate ? self::PER_PAGE : max(1, $sorted->count());
        $items = $sorted->forPage($page, $perPage)->values()->map(fn (Sprint $s) => self::card($s, $this->audienceFor()));

        $query = array_filter(collect($filters)->except('page')->all(), fn ($v) => $v !== null && $v !== '');

        $paginator = new LengthAwarePaginator($items, $sorted->count(), $perPage, $page, [
            'path' => $path,
            'query' => $query,
        ]);

        return [
            'results' => $paginator,
            'facets' => $this->facets($base, $filters),
            'total' => $base->count(),
            'spotlight' => ($spot = $this->spotlight($sorted)) ? self::card($spot, $this->audienceFor()) : null,
        ];
    }

    /** @return array<string, mixed> */
    public static function normalise(array $input): array
    {
        $out = [];
        foreach (self::FILTER_KEYS as $key) {
            $value = $input[$key] ?? null;
            if (is_string($value)) {
                $value = trim(Str::limit($value, 120, ''));
            }
            $out[$key] = ($value === '' ? null : $value);
        }

        if ($out['sort'] && ! array_key_exists($out['sort'], Taxonomy::sorts())) {
            $out['sort'] = null;
        }

        return $out;
    }

    private function matches(Sprint $s, array $f): bool
    {
        if ($f['q'] ?? null) {
            $haystack = Str::lower(implode(' ', [
                $s->title, $s->summary, $s->subcategory, $s->category,
                Taxonomy::categories()[$s->category]['label'] ?? '',
                implode(' ', self::strings(self::attrs($s)['ideal_for'] ?? [])),
                implode(' ', self::strings(self::attrs($s)['needs'] ?? [])),
                implode(' ', self::strings(self::attrs($s)['keywords'] ?? [])),
            ]));
            foreach (preg_split('/\s+/', Str::lower($f['q'])) as $token) {
                if ($token !== '' && ! str_contains($haystack, $token)) {
                    return false;
                }
            }
        }

        if (($f['type'] ?? null) && ! in_array($s->type, self::list($f['type']), true)) {
            return false;
        }
        if (($f['category'] ?? null) && ! in_array($s->category, self::list($f['category']), true)) {
            return false;
        }
        if (($f['audience'] ?? null) && ! array_intersect(self::list($f['audience']), self::audiences($s))) {
            return false;
        }
        if (($f['act'] ?? null) && ! in_array($s->commercial_act, self::list($f['act']), true)) {
            return false;
        }
        if (($f['price'] ?? null) && ! in_array(self::priceBand($s), self::list($f['price']), true)) {
            return false;
        }
        if (($f['delivery'] ?? null) && ! in_array(self::deliveryBand($s->delivery), self::list($f['delivery']), true)) {
            return false;
        }
        if (($f['rating'] ?? null) && (float) $s->rating < (float) $f['rating']) {
            return false;
        }
        if ($f['need'] ?? null) {
            $needs = array_map('strtolower', self::strings(self::attrs($s)['needs'] ?? []));
            if (! array_intersect(array_map('strtolower', self::list($f['need'])), $needs)) {
                return false;
            }
        }
        if ($f['flag'] ?? null) {
            $ok = match ($f['flag']) {
                'popular' => $s->popular,
                'featured' => $s->featured,
                'new' => $s->is_new,
                'recommended' => in_array(self::attrs($s)['badge'] ?? '', ['Recommended', 'High Match', 'AI Suggested'], true) || ($s->rating ?? 0) >= 4.7,
                'best-value' => (self::attrs($s)['badge'] ?? '') === 'Best Value',
                default => true,
            };
            if (! $ok) {
                return false;
            }
        }
        if ($f['letter'] ?? null) {
            $letter = strtoupper(substr($f['letter'], 0, 1));
            if (strtoupper(substr($s->title, 0, 1)) !== $letter) {
                return false;
            }
        }

        return true;
    }

    /** @return Collection<int, Sprint> */
    private function sort(Collection $items, string $sort): Collection
    {
        $audience = $this->audienceFor();
        $score = fn (Sprint $s) => ($s->featured ? 30 : 0) + ($s->popular ? 20 : 0) + ($s->is_new ? 5 : 0)
            + (float) $s->rating * 10 + min(20, self::reviewCount($s) / 10)
            + ($audience && in_array($audience, self::audiences($s), true) ? 40 : 0);

        return (match ($sort) {
            'featured' => $items->sortBy([fn ($a, $b) => $b->featured <=> $a->featured, fn ($a, $b) => $score($b) <=> $score($a)]),
            'popular' => $items->sortBy([fn ($a, $b) => $b->popular <=> $a->popular, fn ($a, $b) => self::reviewCount($b) <=> self::reviewCount($a)]),
            'new' => $items->sortBy([fn ($a, $b) => $b->is_new <=> $a->is_new, fn ($a, $b) => $b->id <=> $a->id]),
            'rating' => $items->sortBy([fn ($a, $b) => (float) $b->rating <=> (float) $a->rating, fn ($a, $b) => self::reviewCount($b) <=> self::reviewCount($a)]),
            'price_asc' => $items->sortBy([fn ($a, $b) => ($a->price_zar ?? PHP_INT_MAX) <=> ($b->price_zar ?? PHP_INT_MAX)]),
            'price_desc' => $items->sortBy([fn ($a, $b) => ($b->price_zar ?? -1) <=> ($a->price_zar ?? -1)]),
            'az' => $items->sortBy(fn ($s) => Str::lower($s->title)),
            default => $items->sortByDesc($score),
        })->values();
    }

    private function spotlight(Collection $sorted): ?Sprint
    {
        return $sorted->first(fn (Sprint $s) => ! empty(self::attrs($s)['spotlight'])) ?? $sorted->first();
    }

    /** Counts for each filter option within the current base set. */
    private function facets(Collection $base, array $filters): array
    {
        $count = fn (callable $key) => $base->groupBy($key)->map->count();

        $categories = collect(Taxonomy::categories())->map(fn ($c, $slug) => [
            'value' => $slug, 'label' => $c['label'], 'count' => $base->where('category', $slug)->count(),
        ])->values()->filter(fn ($o) => $o['count'] > 0 || $filters['category'] === $o['value'])->values();

        $audiences = collect(Taxonomy::audiences())->map(fn ($a, $slug) => [
            'value' => $slug, 'label' => $a['label'], 'count' => $base->filter(fn ($s) => in_array($slug, self::audiences($s), true))->count(),
        ])->values();

        $types = $count(fn ($s) => $s->type)->map(fn ($n, $type) => ['value' => $type, 'label' => Taxonomy::typeLabel($type), 'count' => $n])->sortByDesc('count')->values();

        $prices = collect(Taxonomy::priceBands())->map(fn ($b, $key) => [
            'value' => $key, 'label' => $b['label'], 'count' => $base->filter(fn ($s) => self::priceBand($s) === $key)->count(),
        ])->values();

        $delivery = collect(Taxonomy::deliveryBands())->map(fn ($b, $key) => [
            'value' => $key, 'label' => $b['label'], 'count' => $base->filter(fn ($s) => self::deliveryBand($s->delivery) === $key)->count(),
        ])->values();

        $acts = collect(Taxonomy::commercialActs())->map(fn ($label, $key) => [
            'value' => $key, 'label' => $label, 'count' => $base->where('commercial_act', $key)->count(),
        ])->values()->filter(fn ($o) => $o['count'] > 0)->values();

        $needs = $base->flatMap(fn ($s) => self::strings(self::attrs($s)['needs'] ?? []))->countBy()->sortDesc()->take(14)
            ->map(fn ($n, $label) => ['value' => $label, 'label' => $label, 'count' => $n])->values();

        $ratings = collect([4.5, 4.0])->map(fn ($r) => [
            'value' => (string) $r, 'label' => "{$r} stars and above", 'count' => $base->filter(fn ($s) => (float) $s->rating >= $r)->count(),
        ]);

        return compact('categories', 'audiences', 'types', 'prices', 'delivery', 'acts', 'needs', 'ratings');
    }

    private function audienceFor(): ?string
    {
        return $this->user ? (self::CLIENT_TYPE_AUDIENCE[$this->user->client_type] ?? null) : null;
    }

    /** @var array<int, array<string, mixed>> decoded attributes per sprint id (JSON casts decode on every access) */
    private static array $attrCache = [];

    public static function attrs(Sprint $s): array
    {
        return self::$attrCache[$s->id] ??= (array) ($s->attributes ?? []);
    }

    /** Scalar strings from a loosely-shaped attribute (other templates may store objects). */
    public static function strings(mixed $value): array
    {
        return array_values(array_map('strval', array_filter((array) $value, fn ($v) => is_string($v) || is_numeric($v))));
    }

    public static function reviewCount(Sprint $s): int
    {
        $r = self::attrs($s)['reviews'] ?? null;

        return is_numeric($r) ? (int) $r : (is_array($r) ? (int) ($r['count'] ?? count($r)) : 0);
    }

    /** @return list<string> */
    public static function list(mixed $value): array
    {
        return array_values(array_filter(array_map('trim', is_array($value) ? $value : explode(',', (string) $value))));
    }

    /** @return list<string> */
    public static function audiences(Sprint $s): array
    {
        return self::list($s->audience ?? '');
    }

    public static function priceBand(Sprint $s): string
    {
        $p = $s->price_zar;
        if ($p === null || $s->commercial_act === 'quote') {
            return 'quote';
        }

        foreach (Taxonomy::priceBands() as $key => $band) {
            if ($band['min'] !== null && $p >= $band['min'] && ($band['max'] === null || $p <= $band['max'])) {
                return $key;
            }
        }

        return 'quote';
    }

    /** Upper bound of a delivery string in days ("5 – 12 days" -> 12, "10 – 15 min" -> 0). */
    public static function deliveryDays(?string $delivery): ?int
    {
        if (! $delivery) {
            return null;
        }
        $d = Str::lower($delivery);
        if (str_contains($d, 'min') || str_contains($d, 'instant') || str_contains($d, 'same day')) {
            return 0;
        }
        if (str_contains($d, 'scope')) {
            return null;
        }
        preg_match_all('/\d+/', $d, $m);
        if (! $m[0]) {
            return null;
        }
        $n = (int) max($m[0]);

        return str_contains($d, 'week') ? $n * 7 : $n;
    }

    public static function deliveryBand(?string $delivery): string
    {
        $days = self::deliveryDays($delivery);

        return match (true) {
            $days === null => 'after-scope',
            $days <= 1 => 'instant',
            $days <= 7 => 'up-to-7',
            $days <= 14 => 'up-to-14',
            default => 'over-14',
        };
    }

    /** Compact card payload for listing pages. */
    public static function card(Sprint $s, ?string $audience = null): array
    {
        $a = self::attrs($s);
        $cat = Taxonomy::categories()[$s->category] ?? null;

        return [
            'id' => $s->id,
            'code' => $s->code,
            'slug' => $s->slug,
            'title' => $s->title,
            'type' => $s->type,
            'category' => $s->category,
            'category_label' => $s->subcategory ?: ($cat['label'] ?? null),
            'summary' => $s->summary,
            'price_zar' => $s->price_zar,
            'price_display' => $a['price_display'] ?? ($s->commercial_act === 'free' ? 'free' : ($s->price_zar === null ? 'quote' : 'from')),
            'delivery' => $s->delivery,
            'commercial_act' => $s->commercial_act,
            'rating' => $s->rating,
            'reviews' => self::reviewCount($s),
            'badge' => (is_string($a['badge'] ?? null) ? $a['badge'] : null) ?? ($s->is_new ? 'New' : ($s->popular ? 'Popular' : null)),
            'icon' => is_string($a['icon'] ?? null) ? $a['icon'] : ($cat['icon'] ?? 'briefcase'),
            'ideal_for' => array_slice(self::strings($a['ideal_for'] ?? []), 0, 4),
            'packages' => array_values(Packages::TIERS), // every sprint sells Basic / Standard / Premium
            'why' => array_slice(self::strings($a['why'] ?? $a['outcomes'] ?? []), 0, 4),
            'featured' => $s->featured,
            'popular' => $s->popular,
            'is_new' => $s->is_new,
            'audience' => self::audiences($s),
            'match' => $audience !== null && in_array($audience, self::audiences($s), true),
            'recurring' => in_array($s->commercial_act, ['subscription', 'retainer'], true) ? ($a['billing_period'] ?? 'month') : null,
        ];
    }
}
