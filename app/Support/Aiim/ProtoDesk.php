<?php

namespace App\Support\Aiim;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\IntelData;
use App\Support\Industries\IndustryData;

/**
 * Shared helpers for the desk and dashboard pages rebuilt from the client's "TBCA AIIM Botswana"
 * prototype (mock-ups 72 to 82): the embedded-service catalogue with the app's own prices, register
 * tables in sheet order and the country pack tables (prototype svc, svcRail, sheetTable, docTable).
 */
class ProtoDesk
{
    /** The prototype's 581 embedded services (catalogue fields only; prices are taken from the app). */
    public static function emb(): array
    {
        return once(fn () => CountryHub::meta('aiim_services') ?? []);
    }

    /** One embedded service with the app's selling price, or null when the code is unknown. */
    public static function svc(string $code): ?array
    {
        $s = once(fn () => collect(self::emb())->keyBy('code')->all())[$code] ?? null;

        return $s ? self::card($s) : null;
    }

    /** Card payload for an embedded service: catalogue fields plus the app's Sprint price by code. */
    public static function card(array $s): array
    {
        $app = IndustryData::sprint($s['code']);
        $ep = $app && $app['app'] !== null && ($app['ep'] ?? 0) > 0 ? (int) $app['ep'] : null;

        return [
            'code' => $s['code'], 'name' => $s['name'], 'cat' => $s['cat'] ?? null,
            'et' => $ep !== null ? ($app['entry'] ?? $s['et']) : ($s['et'] ?? null),
            'db' => $s['db'] ?? null, 'a0' => $s['a0'] ?? null,
            'ep' => $ep, 'inApp' => $ep !== null,
        ];
    }

    /** Service rail (prototype svcRail): up to $max services in the given order. */
    public static function rail(array $codes, string $title = 'Embedded services on this page', int $max = 6): array
    {
        return [
            'title' => $title,
            'items' => array_values(array_slice(array_filter(array_map(fn ($c) => self::svc($c), $codes)), 0, $max)),
            'total' => count(self::emb()),
        ];
    }

    /**
     * A register as the prototype's sheetTable shows it: headers in sheet order, rows keyed by
     * header and the low-cardinality filter columns (more than one and at most 24 values, more than
     * 8 rows, first four).
     */
    public static function sheet(string $name, bool $filters = true): array
    {
        $rows = CountryHub::register($name);
        $h = IntelData::headers($name);
        $rows = array_map(fn ($r) => array_combine($h, array_map(fn ($k) => $r[$k] ?? null, $h)), $rows);

        return ['name' => $name, 'h' => $h, 'rows' => $rows, 'filters' => $filters && count($rows) > 8 ? IntelData::lowcard($rows, $h, 24) : []];
    }

    /** The $n-th table under the pack heading that starts with $prefix (prototype docTable), header row first. */
    public static function docTable(string $prefix, int $n = 0): array
    {
        $blocks = IntelData::docBlocks();
        $start = null;
        foreach ($blocks as $i => $b) {
            if (self::level($b) < 99 && str_starts_with((string) ($b['x'] ?? ''), $prefix)) {
                $start = $i;
                break;
            }
        }
        if ($start === null) {
            return [];
        }
        $lv = self::level($blocks[$start]);
        $tables = [];
        for ($j = $start + 1; $j < count($blocks); $j++) {
            if (self::level($blocks[$j]) <= $lv) {
                break;
            }
            if (($blocks[$j]['t'] ?? '') === 'tbl') {
                $tables[] = array_map(fn ($r) => array_map(fn ($c) => (string) ($c ?? ''), $r), $blocks[$j]['rows'] ?? []);
            }
        }

        return $tables[$n] ?? [];
    }

    /** Heading level of a pack block (Title 0, Heading N, otherwise 99). */
    private static function level(array $b): int
    {
        if (($b['t'] ?? '') !== 'p') {
            return 99;
        }
        if (($b['s'] ?? '') === 'Title') {
            return 0;
        }

        return preg_match('/^Heading (\d)/', (string) ($b['s'] ?? ''), $m) ? (int) $m[1] : 99;
    }
}
