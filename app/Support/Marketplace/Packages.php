<?php

namespace App\Support\Marketplace;

use App\Models\Marketplace\Listing;

/**
 * Basic / Standard / Premium packages for every Marketplace service (fixed and recurring).
 *
 * Curated package data lives in `details.packages` (seeded per service). Any listing
 * without it — e.g. a newly approved provider listing — gets packages derived from its
 * list price, so the three-package comparison is always available. The listing's
 * `price_zar` is the Standard package price.
 */
class Packages
{
    public const KEYS = ['basic' => 'Basic', 'standard' => 'Standard', 'premium' => 'Premium'];

    /** Price multipliers against the Standard (list) price when packages are derived. */
    private const FACTORS = ['basic' => 0.6, 'standard' => 1.0, 'premium' => 1.75];

    public static function for(Listing $l): array
    {
        if ($l->kind === 'partner') {
            return [];
        }

        $seeded = collect($l->details['packages'] ?? [])->keyBy('key');
        $base = (int) ($l->price_zar ?? 0);
        $recurring = $l->kind === 'recurring';
        $derived = self::derived($l, $base, $recurring);

        return collect(self::KEYS)->map(function ($name, $key) use ($seeded, $derived) {
            $p = [...$derived[$key], ...($seeded[$key] ?? [])];
            $p['key'] = $key;
            $p['name'] = $name;
            $p['priceZar'] = (int) ($p['price_zar'] ?? $p['priceZar'] ?? 0);
            unset($p['price_zar']);

            return $p;
        })->values()->all();
    }

    /** One package by key (falls back to Standard). */
    public static function find(Listing $l, ?string $key): array
    {
        $all = collect(self::for($l));

        return $all->firstWhere('key', $key) ?? $all->firstWhere('key', 'standard') ?? [];
    }

    /** Feature-by-package matrix for the comparison table, built from the cumulative feature lists. */
    public static function comparison(array $packages): array
    {
        $features = collect($packages)->flatMap(fn ($p) => $p['features'] ?? [])->unique()->values();

        return $features->map(fn ($f) => [
            'label' => $f,
            ...collect($packages)->mapWithKeys(fn ($p) => [$p['key'] => in_array($f, $p['features'] ?? [], true)])->all(),
        ])->all();
    }

    private static function derived(Listing $l, int $base, bool $recurring): array
    {
        $round = fn (float $v) => (int) (round($v / 500) * 500);
        $core = array_slice($l->details['features'] ?? ['Core scope delivered to TBCA QA standard'], 0, 3);
        $days = self::days($l->details['delivery'] ?? '');

        return [
            'basic' => [
                'price_zar' => $round($base * self::FACTORS['basic']),
                'delivery' => $recurring ? 'Monthly' : self::range($days, 0.6),
                'scope' => 'Essential scope for a focused question or a single entity.',
                'features' => [...$core, 'Summary report (PDF)', '1 revision round'],
                'revisions' => '1 round',
                'support' => 'Email support',
            ],
            'standard' => [
                'price_zar' => $base,
                'delivery' => $recurring ? 'Monthly' : ($l->details['delivery'] ?? self::range($days, 1)),
                'scope' => 'Full scope as described, with walkthrough and QA certificate.',
                'features' => [...$core, 'Summary report (PDF)', '1 revision round', 'Detailed findings & recommendations', 'Walkthrough call (60 min)', 'TBCA QA certificate'],
                'revisions' => '2 rounds',
                'support' => 'Email & call support',
                'recommended' => true,
            ],
            'premium' => [
                'price_zar' => $round($base * self::FACTORS['premium']),
                'delivery' => $recurring ? 'Monthly' : self::range($days, 1.5),
                'scope' => 'Extended scope with senior specialist, board-ready outputs and follow-up.',
                'features' => [...$core, 'Summary report (PDF)', '1 revision round', 'Detailed findings & recommendations', 'Walkthrough call (60 min)', 'TBCA QA certificate', 'Senior specialist lead', 'Board / investor-ready pack', '30-day follow-up support'],
                'revisions' => 'Unlimited within 30 days',
                'support' => 'Dedicated contact',
            ],
        ];
    }

    private static function days(string $delivery): int
    {
        preg_match_all('/\d+/', $delivery, $m);

        return (int) (collect($m[0])->map(fn ($n) => (int) $n)->max() ?: 10);
    }

    private static function range(int $days, float $factor): string
    {
        $n = max(2, (int) round($days * $factor));

        return "{$n} Business Days";
    }
}
