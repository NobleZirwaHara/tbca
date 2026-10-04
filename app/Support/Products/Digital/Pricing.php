<?php

namespace App\Support\Products\Digital;

use App\Models\Products\Digital\DpPriceItem;
use Illuminate\Support\Collection;

/**
 * Blueprint Part 8: FLOOR(tier) = TCS(tier) ÷ (1 − 0.45). Price must be strictly
 * greater than TCS and every tier must carry ≥ 45% gross profit. A floor may
 * never be edited downward to rescue a price.
 */
class Pricing
{
    public const MIN_GP = 0.45;

    public static function floor(int $tcs): int
    {
        return (int) ceil($tcs / (1 - self::MIN_GP));
    }

    public static function gp(int $price, int $tcs): float
    {
        return $price > 0 ? round(($price - $tcs) / $price * 100, 1) : 0.0;
    }

    public static function belowFloor(DpPriceItem $i): bool
    {
        return $i->lowest_price < $i->floor_price;
    }

    /** Validates a proposed price against the floor & margin rules; returns the failure or null. */
    public static function violation(DpPriceItem $i, int $price): ?string
    {
        return match (true) {
            $price <= $i->tcs => 'Every proposed tier must be greater than TCS (R'.$i->tcs.').',
            self::gp($price, $i->tcs) < self::MIN_GP * 100 => 'Gross profit must be at least 45% at every tier.',
            $price < $i->floor_price => 'Price cannot be below the 45% GP floor (R'.$i->floor_price.').',
            default => null,
        };
    }

    /** Blended GP across items, at current prices or after remediation to the floor. */
    public static function blended(Collection $items, bool $afterRemediation): float
    {
        $revenue = $items->sum(fn ($i) => $afterRemediation ? max($i->lowest_price, $i->proposed_price ?? $i->floor_price) : $i->lowest_price);
        $cost = $items->sum('tcs');

        return $revenue > 0 ? round(($revenue - $cost) / $revenue * 100, 1) : 0.0;
    }
}
