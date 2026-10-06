<?php

namespace App\Support\Sprints;

/**
 * Every sprint sells exactly three packages: Basic, Standard and Premium.
 *
 * normalise() maps whatever tiers a source register supplied onto those three
 * (lowest -> Basic, middle -> Standard, top -> Premium; extra middle tiers are
 * merged into Standard) and derives missing tiers from the existing price and
 * scope. It is idempotent, so it runs both in the seeders and defensively at
 * render time.
 *
 * Final client prices / delivery times (Batch 4A-4D workbooks) are a data-only
 * change: pass them as $overrides (see data/sprint-package-overrides.php),
 * keyed by tier, and they replace the derived figures.
 */
class Packages
{
    public const TIERS = ['basic' => 'Basic', 'standard' => 'Standard', 'premium' => 'Premium'];

    /** Basic is derived at 60% of Standard (-40%), Premium at 150% (+50%). */
    private const DOWN = 0.6;

    private const UP = 1.5;

    /** Legacy package keys (old registers and URLs) -> tier key, for ?package= aliasing. */
    public const ALIASES = [
        'starter' => 'basic', 'essential' => 'basic', 'essentials' => 'basic', 'essentials-package' => 'basic', 'essentials-pack' => 'basic',
        'clinic-starter' => 'basic', 'executive-briefing' => 'basic', 'basic-s0' => 'basic', 'free' => 'basic', 'lite' => 'basic',
        'growth' => 'standard', 'growth-sprint' => 'standard', 'growth-workshop' => 'standard', 'professional' => 'standard',
        'professional-package' => 'standard', 'professional-pack' => 'standard', 'premium-package' => 'standard',
        'standard-s1' => 'standard', 'monthly' => 'standard', 'standard-plan' => 'standard',
        'executive' => 'premium', 'enterprise' => 'premium', 'enterprise-package' => 'premium', 'enterprise-pack' => 'premium',
        'enterprise-intensive' => 'premium', 'board-ready-sprint' => 'premium', 'premium-s2' => 'premium',
    ];

    private const DEFAULT_FEATURES = [
        'basic' => ['Core outputs', 'Human-reviewed final deliverable', 'Email support'],
        'standard' => ['Full scope outputs', 'Expert review and quality assurance', 'One revision round', 'Client Portal handover'],
        'premium' => ['Full scope outputs', 'Additional expert review session', 'Priority delivery queue', 'Extended post-delivery support (30 days)'],
    ];

    private const DEFAULT_DESCRIPTIONS = [
        'basic' => 'Essential scope: the core outputs to get started.',
        'standard' => 'Complete scope with full outputs and expert review.',
        'premium' => 'Extended scope with deeper analysis, expert sessions and priority delivery.',
    ];

    /** Attribute maps keyed by package key or name that must follow the renamed tiers. */
    private const KEYED_ATTRIBUTES = ['deliverables_by_scope', 'package_guidance', 'scope_by_package', 'package_notes'];

    /** Resolves a requested ?package= value (tier key, legacy key or name) to a tier key. */
    public static function resolveKey(?string $key): ?string
    {
        if ($key === null || $key === '') {
            return null;
        }
        $k = strtolower(trim($key));

        return isset(self::TIERS[$k]) ? $k : (self::ALIASES[$k] ?? null);
    }

    /** True when the list is already exactly basic / standard / premium. */
    public static function isNormalised(mixed $packages): bool
    {
        return is_array($packages) && count($packages) === 3
            && array_column($packages, 'key') === array_keys(self::TIERS)
            && array_column($packages, 'name') === array_values(self::TIERS);
    }

    /**
     * @param  array<int, mixed>|null  $packages
     * @param  array{price?: ?int, delivery?: ?string, act?: ?string, title?: ?string}  $ctx
     * @param  array<string, array<string, mixed>>  $overrides  tier => fields (zar, delivery, features ...)
     * @return list<array<string, mixed>>
     */
    public static function normalise(?array $packages, array $ctx = [], array $overrides = []): array
    {
        return self::map($packages, $ctx, $overrides)['packages'];
    }

    /**
     * @return array{packages: list<array<string, mixed>>, renames: array<string, string>, names: array<string, string>}  renames: old key/name => tier; names: old display name => new name
     */
    public static function map(?array $packages, array $ctx = [], array $overrides = []): array
    {
        $list = array_values(array_filter((array) $packages, 'is_array'));

        if (self::isNormalised($list) && $overrides === []) {
            return ['packages' => $list, 'renames' => [], 'names' => []];
        }

        // Lowest -> highest price, keeping source order for ties and unpriced tiers.
        $indexed = array_map(null, array_keys($list), $list);
        usort($indexed, function ($a, $b) {
            $za = $a[1]['zar'] ?? null;
            $zb = $b[1]['zar'] ?? null;

            return ($za === null || $zb === null || $za === $zb) ? $a[0] <=> $b[0] : $za <=> $zb;
        });
        $list = array_column($indexed, 1);

        $tiers = [];
        $renames = [];
        $n = count($list);

        if ($n >= 3) {
            $middle = array_slice($list, 1, $n - 2);
            $tiers['basic'] = $list[0];
            $tiers['standard'] = self::merge($middle);
            $tiers['premium'] = $list[$n - 1];
            foreach ($middle as $m) {
                self::rename($renames, $m, 'standard');
            }
            self::rename($renames, $list[0], 'basic');
            self::rename($renames, $list[$n - 1], 'premium');
        } elseif ($n === 2) {
            $tiers['basic'] = $list[0];
            $tiers['standard'] = $list[1];
            $tiers['premium'] = self::derive($list[1], 'premium', $ctx);
            self::rename($renames, $list[0], 'basic');
            self::rename($renames, $list[1], 'standard');
        } elseif ($n === 1 && ($list[0]['zar'] ?? null) === 0) {
            // A free entry tier: it becomes Basic, the paid tiers are scoped on request.
            $tiers['basic'] = $list[0];
            $tiers['standard'] = self::derive([...$list[0], 'zar' => null], 'standard', $ctx);
            $tiers['premium'] = self::derive([...$list[0], 'zar' => null], 'premium', $ctx);
            self::rename($renames, $list[0], 'basic');
        } else {
            $base = $list[0] ?? [
                'zar' => ($ctx['act'] ?? null) === 'free' ? 0 : ($ctx['price'] ?? null),
                'delivery' => $ctx['delivery'] ?? null,
                'features' => [],
            ];
            $tiers['basic'] = self::derive($base, 'basic', $ctx);
            $tiers['standard'] = $base;
            $tiers['premium'] = self::derive($base, 'premium', $ctx);
            if ($list) {
                self::rename($renames, $list[0], 'standard');
            }
        }

        // Old display names (e.g. "Clinic Starter", "Basic S0") -> tier, for relabelling copy.
        $names = [];
        foreach ($list as $src) {
            $old = is_string($src['name'] ?? null) ? $src['name'] : null;
            $tier = $old !== null ? ($renames[$old] ?? null) : null;
            if ($tier !== null && $old !== self::TIERS[$tier]) {
                $names[$old] = self::TIERS[$tier];
            }
        }

        $out = [];
        foreach (self::TIERS as $key => $name) {
            $p = $tiers[$key];
            $original = $p['zar'] ?? null;
            $p = array_merge($p, $overrides[$key] ?? []);
            $p['key'] = $key;
            $p['name'] = $name;
            $p['zar'] = isset($p['zar']) ? (int) $p['zar'] : null;
            $p['popular'] = $key === 'standard';
            $p['features'] = array_values((array) ($p['features'] ?? [])) ?: self::DEFAULT_FEATURES[$key];
            $p['delivery'] ??= $ctx['delivery'] ?? null;
            $p['description'] ??= self::DEFAULT_DESCRIPTIONS[$key];
            if (($p['zar'] ?? null) !== $original || ! isset($p['price_label'])) {
                $p['price_label'] = $p['zar'] === null ? null : 'R'.number_format($p['zar']);
            }
            if ($key !== 'standard' && ($p['badge'] ?? null) === 'Most Popular') {
                $p['badge'] = null;
            }
            $out[] = $p;
        }

        return ['packages' => $out, 'renames' => $renames, 'names' => $names];
    }

    /**
     * Normalises a full sprint row (packages, price_zar and package-keyed attributes) for the seeders.
     *
     * @param  array<string, mixed>  $row
     * @param  array<string, array<string, array<string, mixed>>>  $overrides  code => tier => fields
     * @return array<string, mixed>
     */
    public static function applyToRow(array $row, array $overrides = []): array
    {
        $result = self::map($row['packages'] ?? null, [
            'price' => $row['price_zar'] ?? null,
            'delivery' => $row['delivery'] ?? null,
            'act' => $row['commercial_act'] ?? null,
            'title' => $row['title'] ?? null,
        ], $overrides[$row['code'] ?? ''] ?? []);

        $row['packages'] = $result['packages'];

        $prices = array_filter(array_column($result['packages'], 'zar'), fn ($z) => $z !== null);
        if ($prices && ! (($row['commercial_act'] ?? null) === 'quote' && ($row['price_zar'] ?? null) === null)) {
            $row['price_zar'] = min($prices);
        }

        if (is_array($row['attributes'] ?? null)) {
            $row['attributes'] = self::relabel(self::remapAttributes($row['attributes'], $result['renames'], $result['packages']), $result['names']);
        }

        return $row;
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<string, string>  $renames
     * @param  list<array<string, mixed>>  $packages
     */
    public static function remapAttributes(array $attributes, array $renames, array $packages): array
    {
        foreach (self::KEYED_ATTRIBUTES as $attr) {
            if (! is_array($attributes[$attr] ?? null) || array_is_list($attributes[$attr])) {
                continue;
            }
            $byName = str_ends_with($attr, '_by_scope');
            $mapped = [];
            foreach ($attributes[$attr] as $k => $v) {
                $target = $renames[$k] ?? $renames[strtolower((string) $k)] ?? null;
                $tier = $target !== null ? $target : self::resolveKey((string) $k);
                $tier ??= array_search((string) $k, self::TIERS, true) ?: null;
                if ($tier === null || isset($mapped[$tier])) {
                    continue;
                }
                $mapped[$tier] = $v;
            }
            $final = [];
            foreach ($packages as $p) {
                $value = $mapped[$p['key']] ?? ($byName ? array_values(array_filter([$p['description'] ?? null, ...$p['features']])) : null);
                if ($value !== null) {
                    $final[$byName ? $p['name'] : $p['key']] = $value;
                }
            }
            $attributes[$attr] = $final;
        }

        return $attributes;
    }

    /**
     * Rewrites old package names inside copy (FAQs, comparison tables, hero meta ...) to the
     * Basic / Standard / Premium labels. Single-word names ("Growth") are only replaced where
     * they are clearly a package reference, so prose such as "growth strategy" is untouched.
     *
     * @param  array<string, string>  $names  old name => new name
     */
    public static function relabel(mixed $value, array $names): mixed
    {
        if ($names === []) {
            return $value;
        }
        if (is_array($value)) {
            $out = [];
            foreach ($value as $k => $v) {
                $out[is_string($k) && isset($names[$k]) ? $names[$k] : $k] = self::relabel($v, $names);
            }

            return $out;
        }
        if (! is_string($value)) {
            return $value;
        }
        if (isset($names[$value])) {
            return $names[$value];
        }
        uksort($names, fn ($a, $b) => strlen($b) <=> strlen($a));
        foreach ($names as $old => $new) {
            $q = preg_quote($old, '/');
            $value = str_contains($old, ' ') || strtoupper($old) === $old
                ? preg_replace('/(?<![\w-])'.$q.'(?![\w-])/', $new, $value)
                : preg_replace('/\b'.$q.'\b(?=\s*(?:\(|:|package|Package|plan|Plan|tier|Tier|\)|,|;|\||\/|$))/', $new, $value);
        }

        return $value;
    }

    /** @param array<string, string> $renames */
    private static function rename(array &$renames, array $package, string $tier): void
    {
        foreach (['key', 'name'] as $f) {
            if (isset($package[$f]) && is_string($package[$f])) {
                $renames[$package[$f]] = $tier;
                $renames[strtolower($package[$f])] = $tier;
            }
        }
    }

    /** @param list<array<string, mixed>> $packages */
    private static function merge(array $packages): array
    {
        if (count($packages) === 1) {
            return $packages[0];
        }
        $base = collect($packages)->firstWhere('popular', true) ?? $packages[0];
        $base['features'] = array_values(array_unique(array_merge(...array_map(fn ($p) => (array) ($p['features'] ?? []), $packages))));

        return $base;
    }

    /** Builds a missing tier from an existing one: Basic trims scope, Premium extends it. */
    private static function derive(array $from, string $tier, array $ctx): array
    {
        $zar = $from['zar'] ?? null;
        $features = array_values((array) ($from['features'] ?? []));
        $topic = isset($ctx['title']) ? SprintContent::topic((string) $ctx['title']) : null;

        if ($tier === 'basic') {
            return [
                'zar' => $zar === null ? null : self::round($zar * self::DOWN),
                'delivery' => $from['delivery'] ?? ($ctx['delivery'] ?? null),
                'description' => 'Essential scope: the core '.($topic ? "{$topic} " : '').'outputs to get started.',
                'features' => $features ? array_slice($features, 0, max(2, (int) ceil(count($features) * 0.6))) : ['Core outputs', 'Human-reviewed final deliverable', 'Email support'],
                'derived' => true,
            ];
        }

        return [
            'zar' => $zar === null ? null : self::round($zar * ($tier === 'premium' ? self::UP : 1)),
            'delivery' => $from['delivery'] ?? ($ctx['delivery'] ?? null),
            'description' => $tier === 'premium'
                ? 'Extended scope with deeper analysis, expert sessions and priority delivery.'
                : 'Complete scope with full outputs and expert review.',
            'features' => $tier === 'premium'
                ? array_values(array_unique([...$features, 'Additional expert review session', 'Priority delivery queue', 'Extended post-delivery support (30 days)']))
                : ($features ?: ['Full outputs', 'Expert review', 'One revision round']),
            'derived' => true,
        ];
    }

    private static function round(float $v): int
    {
        return $v < 1000 ? (int) (round($v / 10) * 10) : (int) (round($v / 50) * 50);
    }
}
