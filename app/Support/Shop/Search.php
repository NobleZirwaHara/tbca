<?php

namespace App\Support\Shop;

use App\Models\Shop\Product;
use App\Models\Sprint;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Structured site search (blueprint 5.3-5.7): eligibility filter, margin-neutral
 * relevance ranking, near-duplicate collapsing to one principal result per
 * Product Master, a too-many-results discriminator path and zero-result recovery.
 */
class Search
{
    /** Over-result threshold for the refine path. */
    public const TOO_MANY = 10;

    public const PER_PAGE = 12;

    private const STOP = ['the', 'and', 'for', 'with', 'a', 'an', 'of', 'to', 'in', 'my', 'i', 'need', 'help', 'on'];

    /** @return list<string> */
    public static function tokens(string $q): array
    {
        return collect(preg_split('/[^a-z0-9]+/', Str::lower($q)))
            ->filter(fn ($t) => strlen($t) > 1 && ! in_array($t, self::STOP, true))
            ->unique()->values()->all();
    }

    /** Every eligible record (listed shop masters + published sprints), normalised. */
    public static function corpus(): Collection
    {
        $shop = Product::query()->listed()->get()->map(fn (Product $p) => self::fromProduct($p));

        $shopCodes = $shop->pluck('code')->all();
        $sprints = Sprint::query()->where('status', 'published')->get()
            ->reject(fn (Sprint $s) => in_array($s->code, $shopCodes, true))
            ->map(fn (Sprint $s) => self::fromSprint($s));

        return $shop->concat($sprints)->values();
    }

    public static function fromProduct(Product $p): array
    {
        $subs = collect(Catalogue::subcategories((string) $p->aisle));

        return [
            'key' => 'shop:'.$p->slug,
            'source' => 'shop',
            'code' => $p->code,
            'sprint_code' => $p->sprint_code,
            'slug' => $p->slug,
            'name' => $p->name,
            'summary' => $p->tagline,
            'act' => $p->act,
            'act_label' => Acts::label($p->act),
            'delivery' => $p->delivery,
            'delivery_band' => Catalogue::deliveryBand($p->delivery),
            'price_zar' => $p->act === 'A7' ? 0 : ($p->price_zar ?? $p->indicative_zar),
            'price_unit' => $p->price_unit,
            'price_state' => self::priceState($p),
            'available' => $p->isPurchasable() || in_array($p->listing_state, ['LS-02', 'LS-04'], true),
            'listing_state' => $p->listing_state,
            'url' => $p->url(),
            'icon' => $p->icon,
            'aisle' => $p->aisle,
            'subcategory' => $p->subcategory,
            'subcategory_name' => $subs->firstWhere('slug', $p->subcategory)['name'] ?? Str::headline((string) $p->subcategory),
            'output_format' => $p->output_format,
            'source_records' => $p->source_records,
            'aliases' => $p->aliases ?? [],
            'key_benefit' => $p->contentValue('key_benefit', $p->tagline),
            'buyer_types' => $p->buyer_types ?? [],
            'featured' => $p->featured,
            'automation' => self::automation($p->vehicle),
            'review' => in_array($p->act, ['A2', 'A7'], true) ? 'self-service' : 'included',
            'languages' => $p->contentValue('languages', ['EN']),
            'rating' => $p->rating,
            'haystack' => Str::lower(implode(' ', [$p->tagline, $p->summary, $p->output_format, $p->vehicle])),
        ];
    }

    public static function fromSprint(Sprint $s): array
    {
        $act = Acts::fromSprintAct($s->commercial_act);

        return [
            'key' => 'sprint:'.$s->slug,
            'source' => 'sprint',
            'code' => $s->code,
            'sprint_code' => $s->code,
            'slug' => $s->slug,
            'name' => $s->title,
            'summary' => $s->summary,
            'act' => $act,
            'act_label' => Acts::label($act),
            'delivery' => $s->delivery,
            'delivery_band' => Catalogue::deliveryBand($s->delivery),
            'price_zar' => $s->price_zar,
            'price_unit' => null,
            'price_state' => $s->price_zar ? 'INDICATIVE_FROM' : 'QUOTE_REQUIRED',
            'available' => true,
            'listing_state' => null,
            'url' => "/sprints/{$s->slug}",
            'icon' => 'target',
            'aisle' => null,
            'subcategory' => $s->subcategory ?? $s->category,
            'subcategory_name' => Str::headline((string) ($s->subcategory ?? $s->category ?? 'Sprints')),
            'output_format' => $s->type ? Str::headline($s->type) : null,
            'source_records' => 1,
            'aliases' => [],
            'key_benefit' => $s->summary,
            'buyer_types' => [],
            'featured' => (bool) $s->featured,
            'automation' => 'human-led',
            'review' => 'included',
            'languages' => ['EN'],
            'rating' => $s->rating,
            'haystack' => Str::lower(implode(' ', [$s->summary, $s->type, $s->category, $s->subcategory])),
        ];
    }

    public static function automation(?string $vehicle): string
    {
        return match ($vehicle) {
            'Digital Product', 'Diagnostic' => 'automated',
            'Subscription' => 'ai-assisted',
            default => 'human-led',
        };
    }

    public static function priceState(Product $p): string
    {
        return match (true) {
            $p->act === 'A7' => 'FREE_APPROVED',
            $p->listing_state === 'LS-05' => 'PRICE_SUSPENDED',
            $p->act === 'A4' => 'PROPOSAL_REQUIRED',
            in_array($p->act, ['A5', 'A6'], true) => 'QUOTE_REQUIRED',
            $p->price_zar === null => 'PRICE_UNRESOLVED',
            ! empty($p->variants['tiers']) || ! empty($p->variants['licences']) || ! empty($p->variants['plans']) => 'INDICATIVE_FROM',
            default => 'FIXED_CONFIRMED',
        };
    }

    /** Scores one record against the query tokens (identity > aliases > content). */
    public static function score(array $r, array $tokens, string $q): array
    {
        $name = Str::lower($r['name']);
        $aliases = Str::lower(implode(' | ', $r['aliases']));
        $codes = Str::lower($r['code'].' '.$r['sprint_code']);
        $sub = Str::lower($r['subcategory_name'].' '.$r['act_label']);
        $score = 0;
        $matched = 0;
        $aliasHits = 0;

        foreach ($tokens as $t) {
            $hit = false;
            if (str_contains($codes, $t)) {
                $score += 10;
                $hit = true;
            }
            if (preg_match('/\b'.preg_quote($t, '/').'/', $name)) {
                $score += 5;
                $hit = true;
            }
            if ($aliases !== '' && str_contains($aliases, $t)) {
                $score += 2;
                $aliasHits++;
                $hit = true;
            }
            if (str_contains($sub, $t)) {
                $score += 2;
                $hit = true;
            }
            if (str_contains($r['haystack'], $t)) {
                $score += 1;
                $hit = true;
            }
            $matched += $hit ? 1 : 0;
        }

        $ql = Str::lower(trim($q));
        if ($ql !== '' && str_contains($name, $ql)) {
            $score += 8;
        }

        $required = count($tokens) <= 3 ? count($tokens) : (int) ceil(count($tokens) * 0.75);

        return ['score' => $matched >= $required && $matched > 0 ? $score : 0, 'alias_hits' => $aliasHits];
    }

    /**
     * @param  array{acts?: list<string>, delivery?: list<string>, subcategories?: list<string>, aisle?: ?string, sort?: ?string, page?: int, all?: bool, dedupe?: ?string, buyer?: ?string, price_min?: ?int, price_max?: ?int}  $f
     */
    public static function run(string $q, array $f = []): array
    {
        $started = microtime(true);
        $tokens = self::tokens($q);
        $corpus = self::corpus();

        $matches = $tokens === []
            ? $corpus->map(fn ($r) => [...$r, 'score' => $r['featured'] ? 2 : 1, 'alias_hits' => 0])
            : $corpus->map(fn ($r) => [...$r, ...self::score($r, $tokens, $q)])->filter(fn ($r) => $r['score'] > 0);

        // Near-duplicate collapse: one principal result per canonical name (shop master preferred);
        // equivalent records become source coverage and aliases rather than repeated cards.
        $rawMatches = (int) $matches->sum(fn ($r) => max(1, $r['source_records']));
        $matches = $matches->groupBy(fn ($r) => Str::slug(preg_replace('/\s*\(.*?\)\s*/', ' ', $r['name'])))
            ->map(function (Collection $group) {
                $principal = $group->sortByDesc(fn ($r) => [$r['source'] === 'shop' ? 1 : 0, $r['score']])->first();
                if ($group->count() > 1) {
                    $principal['source_records'] = (int) $group->sum(fn ($r) => max(1, $r['source_records']));
                    $principal['aliases'] = array_values(array_unique([...$principal['aliases'], ...$group->reject(fn ($r) => $r['key'] === $principal['key'])->map(fn ($r) => "{$r['name']} ({$r['code']})")->all()]));
                    $principal['score'] = $group->max('score');
                }

                return $principal;
            })->values();

        $facets = [
            'acts' => $matches->countBy('act')->all(),
            'delivery' => $matches->countBy('delivery_band')->all(),
            'subcategories' => $matches->groupBy('subcategory')->map(fn ($g) => ['name' => $g->first()['subcategory_name'], 'count' => $g->count()])->all(),
            'aisles' => $matches->countBy('aisle')->all(),
        ];

        $filtered = $matches
            ->when(! empty($f['acts']), fn ($c) => $c->whereIn('act', $f['acts']))
            ->when(! empty($f['delivery']), fn ($c) => $c->whereIn('delivery_band', $f['delivery']))
            ->when(! empty($f['subcategories']), fn ($c) => $c->whereIn('subcategory', $f['subcategories']))
            ->when(! empty($f['aisle']), fn ($c) => $c->where('aisle', $f['aisle']))
            ->when(! empty($f['buyer']), fn ($c) => $c->filter(fn ($r) => in_array($f['buyer'], $r['buyer_types'], true)))
            ->when(! empty($f['automation']), fn ($c) => $c->where('automation', $f['automation']))
            ->when(! empty($f['review']), fn ($c) => $c->where('review', $f['review']))
            ->when(! empty($f['language']), fn ($c) => $c->filter(fn ($r) => in_array($f['language'], $r['languages'], true)))
            ->when(isset($f['price_min']) && $f['price_min'] !== null, fn ($c) => $c->filter(fn ($r) => $r['price_zar'] !== null && $r['price_zar'] >= $f['price_min']))
            ->when(isset($f['price_max']) && $f['price_max'] !== null, fn ($c) => $c->filter(fn ($r) => $r['price_zar'] !== null && $r['price_zar'] <= $f['price_max']));

        $sorted = match ($f['sort'] ?? 'relevance') {
            'price_asc' => $filtered->sortBy(fn ($r) => $r['price_zar'] ?? PHP_INT_MAX),
            'price_desc' => $filtered->sortByDesc(fn ($r) => $r['price_zar'] ?? -1),
            'name' => $filtered->sortBy('name'),
            default => $filtered->sortByDesc(fn ($r) => sprintf('%05d-%s', $r['score'], $r['source'] === 'shop' ? '1' : '0')),
        };

        $total = $sorted->count();
        $hasFilters = ! empty($f['acts']) || ! empty($f['delivery']) || ! empty($f['subcategories']) || ! empty($f['aisle']) || ! empty($f['buyer'])
            || ! empty($f['automation']) || ! empty($f['review']) || ! empty($f['language'])
            || ($f['price_min'] ?? null) !== null || ($f['price_max'] ?? null) !== null;

        $mode = match (true) {
            $total === 0 => 'zero',
            ($f['dedupe'] ?? null) === 'consolidated' => 'consolidated',
            $tokens !== [] && $total > self::TOO_MANY && ! $hasFilters && empty($f['all']) => 'too_many',
            default => 'standard',
        };

        $page = max(1, (int) ($f['page'] ?? 1));
        $results = $sorted->values()->slice(($page - 1) * self::PER_PAGE, self::PER_PAGE)->values()
            ->map(fn ($r) => collect($r)->except('haystack')->all());

        return [
            'query' => $q,
            'tokens' => $tokens,
            'mode' => $mode,
            'total' => $total,
            'raw_matches' => $rawMatches,
            'consolidated' => $matches->count(),
            'page' => $page,
            'pages' => (int) max(1, ceil($total / self::PER_PAGE)),
            'results' => $results->all(),
            'facets' => $facets,
            'has_filters' => $hasFilters,
            'elapsed' => round(microtime(true) - $started, 2),
            'suggestions' => $mode === 'zero' ? self::suggestions($q, $corpus) : [],
            'nearest' => $mode === 'zero' || $mode === 'too_many' ? Catalogue::nearestAisles($q)->all() : [],
            'refinements' => $mode === 'too_many' ? collect($facets['subcategories'])->sortByDesc('count')->take(5)->map(fn ($s, $k) => ['slug' => $k, ...$s])->values()->all() : [],
            'top' => $mode === 'zero' ? $corpus->where('featured', true)->take(4)->map(fn ($r) => collect($r)->except('haystack')->all())->values()->all() : [],
        ];
    }

    /** Synonym and spelling suggestions for a zero-result query. */
    public static function suggestions(string $q, Collection $corpus): array
    {
        $tokens = self::tokens($q);
        $suggestions = [];
        $synonyms = Catalogue::synonyms();

        foreach ($tokens as $t) {
            if (isset($synonyms[$t])) {
                $suggestions[] = $synonyms[$t];
            }
        }

        $vocabulary = $corpus->flatMap(fn ($r) => self::tokens($r['name']))->unique()->filter(fn ($w) => strlen($w) > 3);
        foreach ($tokens as $t) {
            $best = $vocabulary->map(fn ($w) => ['w' => $w, 'd' => levenshtein($t, $w)])
                ->filter(fn ($x) => $x['d'] > 0 && $x['d'] <= 2)->sortBy('d')->first();
            if ($best) {
                $suggestions[] = str_replace($t, $best['w'], Str::lower($q));
            }
        }

        // Relax to single strongest tokens.
        foreach ($tokens as $t) {
            if (strlen($t) > 3) {
                $suggestions[] = $t;
            }
        }

        return collect($suggestions)->unique()->take(6)->values()->all();
    }
}
