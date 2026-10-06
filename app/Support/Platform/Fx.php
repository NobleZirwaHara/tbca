<?php

namespace App\Support\Platform;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Daily display FX rates with ZAR as the base (units of each currency per 1 ZAR).
 *
 * Prices are stored and charged in ZAR; these rates only convert for display.
 * The feed is fetched at most once a day and any failure (timeout, bad payload,
 * missing currency) falls back to config('tbca.currencies.*.fallback_rate'), so
 * a page render is never blocked for longer than the short HTTP timeout once
 * per cache window.
 */
class Fx
{
    private const CACHE_KEY = 'tbca.fx.zar';

    /**
     * @return array{base: string, rates: array<string, float>, source: string, updated_at: string|null}
     */
    public static function snapshot(): array
    {
        $cached = Cache::get(self::CACHE_KEY);

        if (is_array($cached)) {
            return $cached;
        }

        $live = self::fetch();
        $snapshot = $live ?? self::fallback();

        // Cache failures briefly so a dead feed is retried, but not on every request.
        Cache::put(self::CACHE_KEY, $snapshot, $live ? (int) config('tbca.fx.cache_seconds', 86400) : 900);

        return $snapshot;
    }

    /**
     * @return array<string, float>
     */
    public static function rates(): array
    {
        return self::snapshot()['rates'];
    }

    public static function rate(string $currency): float
    {
        return self::rates()[strtoupper($currency)] ?? 1.0;
    }

    public static function convert(int|float $zar, string $currency): float
    {
        return $zar * self::rate($currency);
    }

    /**
     * @return array{base: string, rates: array<string, float>, source: string, updated_at: string|null}|null
     */
    private static function fetch(): ?array
    {
        // Never reach the network from the test suite.
        if (app()->runningUnitTests()) {
            return null;
        }

        try {
            $response = Http::timeout((int) config('tbca.fx.timeout_seconds', 3))
                ->acceptJson()
                ->get((string) config('tbca.fx.url'));

            if (! $response->successful()) {
                return null;
            }

            $feed = $response->json('rates');

            if (! is_array($feed)) {
                return null;
            }

            $rates = [];
            foreach (self::codes() as $code) {
                $value = $feed[$code] ?? null;
                $rates[$code] = is_numeric($value) && $value > 0
                    ? (float) $value
                    : self::fallbackRate($code);
            }
            $rates['ZAR'] = 1.0;

            $updated = $response->json('time_last_update_unix');

            return [
                'base' => 'ZAR',
                'rates' => $rates,
                'source' => 'live',
                'updated_at' => is_numeric($updated) ? date(DATE_ATOM, (int) $updated) : now()->toAtomString(),
            ];
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @return array{base: string, rates: array<string, float>, source: string, updated_at: string|null}
     */
    private static function fallback(): array
    {
        $rates = [];
        foreach (self::codes() as $code) {
            $rates[$code] = self::fallbackRate($code);
        }

        return ['base' => 'ZAR', 'rates' => $rates, 'source' => 'fallback', 'updated_at' => null];
    }

    /**
     * @return list<string>
     */
    private static function codes(): array
    {
        return collect(config('tbca.currencies'))->pluck('code')->map(fn ($c) => strtoupper($c))->values()->all();
    }

    private static function fallbackRate(string $code): float
    {
        $currency = collect(config('tbca.currencies'))->firstWhere('code', $code);

        return (float) ($currency['fallback_rate'] ?? 1.0);
    }
}
