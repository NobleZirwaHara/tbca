<?php

namespace App\Support\Sprints;

use App\Models\Sprint;
use App\Support\Platform\Money;

/**
 * Resolves what is being bought for a sprint: the package, chosen add-ons,
 * checkout lines and the price breakdown shown in the order summary.
 */
class SprintOffer
{
    /**
     * Always exactly Basic / Standard / Premium (normalised by the seeders; re-normalised
     * here so rows written before the normalisation still render three packages).
     *
     * @return list<array<string, mixed>>
     */
    public static function packages(Sprint $sprint): array
    {
        return Packages::normalise($sprint->packages, [
            'price' => $sprint->price_zar,
            'delivery' => $sprint->delivery,
            'act' => $sprint->commercial_act,
            'title' => $sprint->title,
        ]);
    }

    /** The requested package (tier key or legacy alias), else Standard. */
    public static function package(Sprint $sprint, ?string $key): ?array
    {
        $packages = collect(self::packages($sprint));

        return $packages->firstWhere('key', Packages::resolveKey($key))
            ?? $packages->firstWhere('popular', true)
            ?? $packages->first();
    }

    /** @return list<array{key: string, name: string, zar: int, body?: string, tag?: string}> */
    public static function addons(Sprint $sprint): array
    {
        return array_values((array) ($sprint->attributes['addons'] ?? []));
    }

    /**
     * @param  list<string>  $keys
     * @return list<array<string, mixed>>
     */
    public static function selectedAddons(Sprint $sprint, array $keys): array
    {
        return collect(self::addons($sprint))->whereIn('key', $keys)->values()->all();
    }

    /**
     * Checkout lines for Checkout::createOrder().
     *
     * @param  list<array<string, mixed>>  $addons
     * @return list<array<string, mixed>>
     */
    public static function lines(Sprint $sprint, array $package, array $addons): array
    {
        $recurring = in_array($sprint->commercial_act, ['subscription', 'retainer'], true);

        $lines = [[
            'item_type' => 'sprint',
            'item_code' => $sprint->code,
            'name' => "{$sprint->title} — {$package['name']}",
            'variant' => $package['key'],
            'unit_zar' => (int) $package['zar'],
            'quantity' => 1,
            'meta' => array_filter([
                'slug' => $sprint->slug,
                'delivery' => $package['delivery'] ?? $sprint->delivery,
                'commercial_act' => $sprint->commercial_act,
                'billing_period' => $recurring ? ($sprint->attributes['billing_period'] ?? 'month') : null,
            ]),
        ]];

        foreach ($addons as $addon) {
            $lines[] = [
                'item_type' => 'sprint-addon',
                'item_code' => "{$sprint->code}-{$addon['key']}",
                'name' => "Add-on: {$addon['name']}",
                'variant' => $addon['key'],
                'unit_zar' => (int) $addon['zar'],
                'quantity' => 1,
                'meta' => ['slug' => $sprint->slug],
            ];
        }

        return $lines;
    }

    /** Pricing constants the order summary needs to compute totals client-side. */
    public static function pricing(): array
    {
        return [
            'vat_rate' => (float) config('tbca.commerce.vat_rate'),
            'platform_fee' => (int) config('tbca.commerce.platform_fee_zar'),
            'bank_rate' => (float) config('tbca.commerce.bank_charge_rates.card', 0),
        ];
    }

    public static function totals(array $package, array $addons): array
    {
        $subtotal = (int) $package['zar'] + collect($addons)->sum('zar');

        return Money::totals($subtotal, 'card');
    }
}
