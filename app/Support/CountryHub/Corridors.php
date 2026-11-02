<?php

namespace App\Support\CountryHub;

/**
 * Directional corridor model (prototype pages-corridors.js corr()): 54 x 53 = 2,862 directional
 * pairs. A pair's evidence state comes from SACU membership, Botswana's border gateways and shared
 * regional economic communities; confidence, evidence items, corridor type and typical days follow
 * the prototype's deterministic rules. Every number here is modelled, not sourced.
 */
class Corridors
{
    public const SACU = ['BWA', 'ZAF', 'NAM', 'LSO', 'SWZ'];

    public const GATE = ['BWA' => ['ZAF', 'NAM', 'ZMB', 'ZWE']];

    /** Six ledgers: code, name, what it covers, share of the total (prototype LEDG). */
    public const LEDG = [
        ['T', 'TBCA Fees', 'TBCA professional fees', 0.175], ['X', 'External Fees', 'Crossing, liquidity, banking, couriers', 0.391],
        ['S', 'Statutory Fees', 'Government filings, permits, duties', 0.051], ['P', 'Partner Fees', 'Licensed partner review (legal, tax, audit)', 0.22],
        ['D', 'Data & Licence Fees', 'Evidence and data licences', 0.087], ['CT-C', 'Corridor Fees', 'Corridor activation and transit', 0.076],
    ];

    /** One directional pair a → b, or null for the same country / unknown ISO3. */
    public static function pair(string $a, string $b): ?array
    {
        $all = CountryHub::countries();
        $a = strtoupper($a);
        $b = strtoupper($b);
        $A = $all[$a] ?? null;
        $B = $all[$b] ?? null;
        if (! $A || ! $B || $a === $b) {
            return null;
        }
        $ra = array_filter(array_map('trim', explode(',', (string) $A['recs'])));
        $rb = array_filter(array_map('trim', explode(',', (string) $B['recs'])));
        $shared = array_values(array_filter($rb, fn ($x) => in_array($x, $ra, true)));
        $bw = in_array($b, self::GATE[$a] ?? [], true) || in_array($a, self::GATE[$b] ?? [], true);
        $o = fn (string $s, int $i) => ord($s[$i]);

        if (in_array($a, self::SACU, true) && in_array($b, self::SACU, true)) {
            [$st, $items, $conf] = ['High Confidence', 6, 86 + ($o($a, 0) + $o($b, 1)) % 6];
        } elseif ($bw || (in_array('SADC', $shared, true) && in_array('ZAF', [$a, $b], true)) || (in_array('SADC', $shared, true) && in_array('BWA', [$a, $b], true))) {
            [$st, $items, $conf] = ['Evidence Available', $bw ? 5 : 3, 64 + ($o($a, 1) + $o($b, 2)) % 16];
        } elseif ($shared) {
            [$st, $items, $conf] = ['Limited Evidence', 1 + ($o($a, 2) + $o($b, 0)) % 2, 30 + ($o($a, 0) + $o($b, 0)) % 25];
        } else {
            [$st, $items, $conf] = ['No Evidence', 0, 5 + ($o($a, 1) + $o($b, 1)) % 20];
        }
        $type = ['Trade', 'Investment', 'Capital Flow', 'Market Entry'][($o($a, 0) + $o($b, 2)) % 4];
        $days = match ($st) {
            'High Confidence' => '15–25', 'Evidence Available' => '20–30', 'Limited Evidence' => '30–45', default => '45–90'
        };

        return [
            'a' => $a, 'b' => $b, 'st' => $st, 'items' => $items, 'conf' => $conf, 'type' => $type, 'days' => $days, 'shared' => $shared,
            'id' => "COR-{$A['iso2']}-{$B['iso2']}-001",
        ];
    }

    public static function sellable(?array $p): bool
    {
        return $p !== null && in_array($p['st'], ['High Confidence', 'Evidence Available'], true);
    }

    /** All 2,862 directional pairs. */
    public static function all(): array
    {
        return once(function () {
            $out = [];
            foreach (array_keys(CountryHub::countries()) as $a) {
                foreach (array_keys(CountryHub::countries()) as $b) {
                    if ($a !== $b) {
                        $out[] = self::pair($a, $b);
                    }
                }
            }

            return $out;
        });
    }

    public static function sellableCount(): int
    {
        return once(fn () => count(array_filter(self::all(), fn ($p) => self::sellable($p))));
    }

    /** Corridor states in display order (prototype CHIP). */
    public const STATES = ['High Confidence', 'Evidence Available', 'Limited Evidence', 'No Evidence'];

    /** Count of pairs by evidence state (prototype countBy(allPairs(), 'st')). */
    public static function counts(): array
    {
        return once(function () {
            $out = array_fill_keys(self::STATES, 0);
            foreach (self::all() as $p) {
                $out[$p['st']]++;
            }

            return $out;
        });
    }

    /**
     * The 8 corridor Sprints (prototype corrSprints): first viable, published Sprint whose name starts
     * with each key, in catalogue order. Prices are the app's entry prices (`ep`).
     */
    public static function corrSprints(): array
    {
        return once(function () {
            $keys = ['Trade Partner Scan Sprint', 'Import/Export Risk Register Sprint', 'Export Document Pack Sprint', 'Country Market Brief Sprint', 'Market Entry Checklist Sprint', 'Country Launch Pack Sprint', 'Export Readiness Score Sprint', 'Distributor Prospectus Sprint'];
            $out = [];
            foreach ($keys as $k) {
                foreach (CountryHub::sprints() as $s) {
                    if (str_starts_with($s['name'], $k) && ($s['viable'] ?? false) && $s['pop'] === 'PUBLISHED') {
                        $out[] = $s;
                        break;
                    }
                }
            }

            return $out;
        });
    }

    /**
     * Six-ledger model-basis totals for a pair (prototype ledgerTotals): T is the sum of the corridor
     * Sprints' entry prices; the other ledgers scale T by the LEDG shares and the evidence state.
     *
     * @return array<string, float>
     */
    public static function ledgerTotals(array $p): array
    {
        $T = (float) array_sum(array_map(fn ($s) => (int) ($s['ep'] ?? 0), self::corrSprints()));
        $tot = $T / self::LEDG[0][3];
        $k = match ($p['st']) {
            'High Confidence' => 1.0, 'Evidence Available' => 1.15, default => 1.4
        };
        $out = [];
        foreach (self::LEDG as [$l, , , $share]) {
            $out[$l] = $l === 'T' ? $T : $tot * $share * $k;
        }

        return $out;
    }

    /** Country summary for a corridor endpoint. */
    public static function endpoint(string $iso3): array
    {
        $c = CountryHub::countries()[$iso3];

        return ['iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name'], 'state' => $c['state'], 'region' => $c['region']];
    }

    /** A pair with its endpoint summaries (A, B) and the sellable flag, for the page props. */
    public static function view(array $p): array
    {
        return $p + ['A' => self::endpoint($p['a']), 'B' => self::endpoint($p['b']), 'sellable' => self::sellable($p)];
    }
}
