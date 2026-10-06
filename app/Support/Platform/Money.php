<?php

namespace App\Support\Platform;

/**
 * Pricing rules shared by every checkout. All stored and charged amounts are
 * whole ZAR; USD, XOF, EUR and CNY (RMB) are display conversions only, using
 * the daily FX feed (see Fx).
 */
class Money
{
    public static function vat(int $zar): int
    {
        return (int) round($zar * config('tbca.commerce.vat_rate'));
    }

    public static function toUsd(int $zar): int
    {
        return self::convert($zar, 'USD');
    }

    /**
     * Whole-unit display conversion of a ZAR amount into another currency.
     */
    public static function convert(int $zar, string $currency): int
    {
        return (int) round(Fx::convert($zar, $currency));
    }

    /**
     * Platform and bank charges for a payment method.
     *
     * @return array{platform: int, bank: int}
     */
    public static function fees(int $subtotalZar, string $method = 'card'): array
    {
        $bankRate = config("tbca.commerce.bank_charge_rates.{$method}", 0);

        return [
            'platform' => $subtotalZar > 0 ? (int) config('tbca.commerce.platform_fee_zar') : 0,
            'bank' => (int) round($subtotalZar * $bankRate),
        ];
    }

    /**
     * @return array{subtotal: int, vat: int, platform: int, bank: int, fees: int, total: int}
     */
    public static function totals(int $subtotalZar, string $method = 'card'): array
    {
        $vat = self::vat($subtotalZar);
        $fees = self::fees($subtotalZar, $method);

        return [
            'subtotal' => $subtotalZar,
            'vat' => $vat,
            'platform' => $fees['platform'],
            'bank' => $fees['bank'],
            'fees' => $fees['platform'] + $fees['bank'],
            'total' => $subtotalZar + $vat + $fees['platform'] + $fees['bank'],
        ];
    }
}
