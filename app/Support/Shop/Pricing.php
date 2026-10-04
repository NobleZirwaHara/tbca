<?php

namespace App\Support\Shop;

use App\Models\Shop\Product;
use Illuminate\Validation\ValidationException;

/**
 * Authoritative server-side pricing for shop basket lines. Public renderers and
 * basket lines read price from the Product Master (never from the browser) and
 * a line is refused when the effective price would sit below the floor.
 */
class Pricing
{
    public const INTENDED_USES = [
        'internal' => ['label' => 'Internal Use', 'body' => 'For internal policies, processes or operations.', 'min' => 1],
        'client' => ['label' => 'Client Work', 'body' => 'Use in work performed for clients.', 'min' => 4],
        'training' => ['label' => 'Training / Education', 'body' => 'Use in training or educational materials.', 'min' => 2],
        'publication' => ['label' => 'Commercial Publication', 'body' => 'Include in books, articles or publications.', 'min' => 5],
        'software' => ['label' => 'Software / System Use', 'body' => 'Integrate into software, apps or systems.', 'min' => 5],
        'other' => ['label' => 'Other (Please specify)', 'body' => 'Describe your intended use.', 'min' => 1],
    ];

    /**
     * @param  array{tier?: ?string, addons?: list<string>, licence?: ?string, use?: ?string, use_other?: ?string, plan?: ?string, quantity?: ?int, config?: array}  $options
     * @return array{item_type: string, item_code: string, name: string, variant: ?string, unit_zar: int, quantity: int, commercial_act: string, meta: array}
     */
    public static function line(Product $product, array $options = []): array
    {
        if (! in_array($product->act, ['A1', 'A2'], true) || ! $product->isPurchasable()) {
            throw ValidationException::withMessages(['product' => 'This product is not available for direct online purchase.']);
        }

        $variants = $product->variants ?? [];
        $unit = (int) $product->price_zar;
        $variant = null;
        $meta = ['section' => 'shop', 'slug' => $product->slug, 'act' => $product->act, 'vehicle' => $product->vehicle, 'version' => $product->version, 'return_url' => null];

        if (! empty($variants['tiers'])) {
            $tier = collect($variants['tiers'])->firstWhere('key', $options['tier'] ?? collect($variants['tiers'])->firstWhere('popular', true)['key'] ?? null);
            if (! $tier) {
                throw ValidationException::withMessages(['tier' => 'Choose a tier.']);
            }
            $unit = (int) $tier['zar'];
            $variant = $tier['name'];
            $addons = collect($variants['addons'] ?? [])->whereIn('key', $options['addons'] ?? []);
            $unit += (int) $addons->sum('zar');
            $meta['tier'] = $tier['key'];
            $meta['addons'] = $addons->pluck('name')->values()->all();
            $meta['config'] = array_filter($options['config'] ?? []);
        }

        if (! empty($variants['licences'])) {
            $licence = collect($variants['licences'])->firstWhere('key', $options['licence'] ?? null);
            $use = $options['use'] ?? null;
            if (! $licence) {
                throw ValidationException::withMessages(['licence' => 'Select a licence.']);
            }
            if (! isset(self::INTENDED_USES[$use])) {
                throw ValidationException::withMessages(['use' => 'Confirm your intended use.']);
            }
            if ($use === 'other' && trim((string) ($options['use_other'] ?? '')) === '') {
                throw ValidationException::withMessages(['use_other' => 'Describe your intended use.']);
            }
            if (! self::licenceCovers($licence['key'], $use)) {
                $min = self::INTENDED_USES[$use]['min'];
                throw ValidationException::withMessages(['use' => self::INTENDED_USES[$use]['label']." requires licence L{$min} or higher."]);
            }
            $unit = (int) $licence['zar'];
            $variant = $licence['key'].' - '.$licence['name'];
            $meta['licence'] = $licence['key'];
            $meta['intended_use'] = self::INTENDED_USES[$use]['label'].($use === 'other' ? ': '.$options['use_other'] : '');
        }

        if ($product->floor_zar !== null && $unit < $product->floor_zar) {
            throw ValidationException::withMessages(['product' => 'This price is below the authoritative floor and cannot be sold.']);
        }

        return [
            'item_type' => $product->act === 'A2' ? 'digital-product' : 'sprint',
            'item_code' => $product->code,
            'name' => $product->name,
            'variant' => $variant,
            'unit_zar' => $unit,
            'quantity' => max(1, min(50, (int) ($options['quantity'] ?? 1))),
            'commercial_act' => 'purchase',
            'meta' => array_filter($meta, fn ($v) => $v !== null),
        ];
    }

    public static function licenceCovers(string $licence, string $use): bool
    {
        $level = (int) preg_replace('/\D/', '', $licence);

        return $level >= (self::INTENDED_USES[$use]['min'] ?? 1);
    }

    /**
     * Retainer proposal estimate: allowance x seniority rate x entity factor, never below the floor.
     */
    public static function retainerEstimate(array $data): int
    {
        $rates = ['specialist' => 1650, 'senior' => 2225, 'partner' => 3200];
        $hours = (float) ($data['allowance'] ?? 0);
        $rate = $rates[$data['seniority'] ?? 'senior'] ?? 2225;
        $entities = max(1, (int) ($data['entities'] ?? 1));
        $estimate = (int) round($hours * $rate * (1 + 0.1 * ($entities - 1)), -2);

        return max(24500, $estimate);
    }

    public const RETAINER_RATES = ['specialist' => 1650, 'senior' => 2225, 'partner' => 3200];
}
