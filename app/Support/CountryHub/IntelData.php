<?php

namespace App\Support\CountryHub;

/**
 * Helpers for the second half of the Intelligence (AIIM) pages (prototype pages-intel.js from the
 * Investment case to the Data Room): the country pack text (docBlocks, docSection), register headers
 * in sheet order and the low-cardinality filter columns the prototype offers on generic tables.
 */
class IntelData
{
    /** All 636 blocks of the BW-1.0 Word pack: {t: 'p', s: style, x: text} or {t: 'tbl', rows: string[][]}. */
    public static function docBlocks(): array
    {
        return CountryHub::meta('pack_doc') ?? [];
    }

    /**
     * Blocks from the heading matching $start up to (not including) the next heading matching $end
     * (prototype docSection).
     */
    public static function docSection(string $start, string $end): array
    {
        $bl = self::docBlocks();
        $isHead = fn ($b) => ($b['t'] ?? '') === 'p' && str_contains((string) ($b['s'] ?? ''), 'Heading');
        $i = null;
        foreach ($bl as $k => $b) {
            if ($isHead($b) && preg_match($start, (string) $b['x'])) {
                $i = $k;
                break;
            }
        }
        if ($i === null) {
            return [];
        }
        $j = count($bl);
        foreach ($bl as $k => $b) {
            if ($k > $i && $isHead($b) && preg_match($end, (string) $b['x'])) {
                $j = $k;
                break;
            }
        }

        return array_slice($bl, $i, $j - $i);
    }

    /** Index entry of a register sheet, or null when the workbook has no such sheet. */
    public static function sheet(string $name): ?array
    {
        foreach (CountryHub::registerIndex() as $x) {
            if ($x['sheet'] === $name) {
                return $x;
            }
        }

        return null;
    }

    /** Column headers of a register in sheet order; blank headers are named "Col N" (prototype decodeReg). */
    public static function headers(string $name): array
    {
        $x = self::sheet($name);
        if ($x) {
            return array_map(fn ($h, $i) => $h === '' || $h === null ? 'Col '.($i + 1) : (string) $h, $x['h'], array_keys($x['h']));
        }
        $rows = CountryHub::register($name);

        return $rows ? array_map('strval', array_keys($rows[0])) : [];
    }

    /**
     * Columns with more than one and at most $max distinct values, first four (the prototype's
     * `lowcard` filters on the Continental and Data Room tables).
     */
    public static function lowcard(array $rows, array $headers, int $max): array
    {
        $out = [];
        foreach ($headers as $h) {
            $u = [];
            foreach ($rows as $r) {
                $u[self::key($r[$h] ?? null)] = true;
                if (count($u) > $max) {
                    break;
                }
            }
            if (count($u) > 1 && count($u) <= $max) {
                $out[] = $h;
            }
            if (count($out) >= 4) {
                break;
            }
        }

        return $out;
    }

    /** Distinct-value key that keeps 1 and "1" apart, as JavaScript's Set does. */
    private static function key(mixed $v): string
    {
        return get_debug_type($v).':'.(is_scalar($v) ? (string) $v : json_encode($v));
    }

    /** Pick columns from register rows. */
    public static function pick(array $rows, array $keys): array
    {
        return array_map(fn ($r) => array_combine($keys, array_map(fn ($k) => $r[$k] ?? null, $keys)), $rows);
    }
}
