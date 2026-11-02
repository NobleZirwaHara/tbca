<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\Corridors;
use App\Support\CountryHub\CountryHub;
use App\Support\Industries\ServerTable;
use Inertia\Response;

/**
 * Governance, sovereign client and admin pages P49 to P84 (prototype pages-gov.js): the hub and one
 * page per key. Botswana reads the BW-1.0 registers; every other country shows the country object
 * and the prototype's placeholder panels.
 */
class GovController extends Controller
{
    /** Page keys (prototype GOV). */
    public const KEYS = [
        'activation', 'manifest', 'freshness', 'contradictions', 'licence', 'absence', 'changes',
        'sovereign', 'intake', 'conflict', 'independence', 'sovreview', 'panel', 'release', 'sovclose',
        'tower', 'objects', 'rcs', 'states', 'taxadmin', 'payadmin', 'partneradmin', 'bias', 'workbench',
        'corrobj', 'corrresolver', 'correcon', 'l9intake', 'l9review', 'retraction', 'analyst', 'corragent', 'absenceagent', 'uat',
    ];

    public function hub(string $country): Response
    {
        $c = $this->country($country);

        return $this->countryPage($c, 'Gov/Hub');
    }

    public function page(string $country, string $page): Response
    {
        $c = $this->country($country);
        abort_unless(in_array($page, self::KEYS, true), 404);
        $B = CountryHub::isBW($c);
        $R = fn (string $n) => CountryHub::register($n);

        $data = match ($page) {
            'activation', 'objects', 'rcs', 'workbench' => ['rows' => $this->ctry()],
            'manifest' => $B ? ['rows' => $R('BW_Sources')] : null,
            'freshness' => $B ? ['fresh' => $R('BW_Freshness'), 'years' => $this->factYears()] : null,
            'contradictions' => $B ? ['rows' => $R('BW_Conflicts')] : null,
            'licence' => $B ? ['blocks' => $this->annex3()] : null,
            'absence' => $B ? ['gaps' => $R('BW_DataGaps'), 'closed' => $R('BW_ClosedGaps')] : null,
            'changes' => $B ? ['edition' => $R('BW_EditionLog'), 'verify' => $R('BW_VerifyLog')] : null,
            'intake', 'partneradmin' => ['inst' => $B ? $R('BW_Institutions') : []],
            'sovreview' => $B ? ['verify' => $R('BW_VerifyLog'), 'validator' => $R('BW_Validator')] : null,
            'panel' => $B ? ['rows' => array_map(fn ($r) => ['Sector' => CountryHub::SECT[$r['Sector']] ?? $r['Sector']] + $r, $R('BW_Permits'))] : null,
            'tower' => $this->tower(),
            'states' => ['cnt' => array_count_values(array_column(CountryHub::countries(), 'state'))],
            'bias' => ['rows' => $this->bias()],
            'corrobj' => ['table' => $this->corrobj()],
            'corrresolver' => ['rows' => $this->resolver($c['iso3'])],
            'correcon' => $this->correcon($c['iso3']),
            'analyst', 'corragent', 'absenceagent' => ['answers' => $this->answers()],
            default => null,
        };

        return $this->countryPage($c, 'Gov/Page', ['k' => $page, 'data' => $data]);
    }

    /* ------------------------------------------------------------------ helpers */

    /** Activation priority (prototype priority()). */
    public static function priority(array $c): string
    {
        return match (true) {
            in_array($c['iso3'], ['BWA', 'ZAF'], true) => 'Active',
            (bool) $c['pack'] => 'High',
            str_starts_with((string) $c['wave'], '1') => 'High',
            str_starts_with((string) $c['wave'], '2') => 'Medium',
            default => 'Low',
        };
    }

    /** The 54 country objects with the columns the governance tables show. */
    private function ctry(): array
    {
        return array_values(array_map(fn ($c) => array_intersect_key($c, array_flip(['iso3', 'iso2', 'slug', 'name', 'region', 'state', 'wave', 'packStatus', 'pack', 'rcs', 'capital', 'currency', 'languages', 'recs', 'pop', 'gdp']))
            + ['priority' => self::priority($c)], CountryHub::countries()));
    }

    /** BW_Facts counted by the year of their date, oldest first. */
    private function factYears(): array
    {
        $n = [];
        foreach (CountryHub::register('BW_Facts') as $f) {
            $y = substr((string) $f['Date'], 0, 4);
            $n[$y] = ($n[$y] ?? 0) + 1;
        }
        ksort($n, SORT_STRING);

        return array_map(fn ($y, $v) => [(string) $y, $v], array_keys($n), $n);
    }

    /** Annex 3 (Data licences) of the Country Pack (prototype docSection(/^ANNEX 3/, /^ZZZ/)). */
    private function annex3(): array
    {
        $bl = CountryHub::meta('pack_doc') ?? [];
        $head = fn ($b) => ($b['t'] ?? '') === 'p' && str_contains((string) ($b['s'] ?? ''), 'Heading');
        foreach ($bl as $i => $b) {
            if ($head($b) && str_starts_with((string) ($b['x'] ?? ''), 'ANNEX 3')) {
                $out = [$b];
                for ($k = $i + 1; $k < count($bl); $k++) {
                    if ($head($bl[$k]) && str_starts_with((string) ($bl[$k]['x'] ?? ''), 'ZZZ')) {
                        break;
                    }
                    $out[] = $bl[$k];
                }

                return $out;
            }
        }

        return [];
    }

    private function tower(): array
    {
        $all = CountryHub::countries();

        return [
            'cnt' => array_count_values(array_column($all, 'state')),
            'packs' => count(array_filter($all, fn ($c) => $c['pack'])),
            'nopack' => count(array_filter($all, fn ($c) => ! $c['pack'])),
            'gaps' => count(CountryHub::register('BW_DataGaps')),
            'conflicts' => count(CountryHub::register('BW_Conflicts')),
            'regchange' => count(CountryHub::register('BW_RegChange')),
            'sellable' => Corridors::sellableCount(),
            'map' => array_values(array_map(fn ($c) => ['iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name'], 'region' => $c['region'], 'pack' => $c['pack'], 'rcs' => $c['rcs']], $all)),
        ];
    }

    /** Non-viable country Sprints counted by topic, in catalogue order (prototype countBy(SPR.filter(!viable), 'topic')). */
    private function bias(): array
    {
        $n = [];
        foreach (CountryHub::sprints() as $s) {
            if (! ($s['viable'] ?? false)) {
                $n[$s['topic']] = ($n[$s['topic']] ?? 0) + 1;
            }
        }

        return array_map(fn ($t, $v) => [CountryHub::TOPICS[$t] ?? $t, $v], array_keys($n), $n);
    }

    /** The 2,862 corridor objects, paged on the server. */
    private function corrobj(): array
    {
        $by = CountryHub::countries();
        $rows = array_map(fn ($p) => ['from' => $by[$p['a']]['name'], 'to' => $by[$p['b']]['name'], 'st' => $p['st'], 'items' => $p['items'], 'conf' => $p['conf'], 'type' => $p['type']], Corridors::all());

        return ServerTable::make($rows, request(), ['from', 'to', 'st', 'type'], ['st', 'type'], ['from', 'to', 'st', 'items', 'conf', 'type']);
    }

    /** Pairs from one country (prototype corrresolver). */
    private function resolver(string $iso): array
    {
        $out = [];
        foreach (CountryHub::countries() as $b => $x) {
            if ($b !== $iso) {
                $p = Corridors::pair($iso, $b);
                $out[] = ['a' => $iso, 'b' => $b, 'to' => $x['name'], 'st' => $p['st'], 'conf' => $p['conf'], 'days' => $p['days']];
            }
        }

        return $out;
    }

    private function correcon(string $iso): array
    {
        $p = Corridors::pair($iso, $iso === 'ZAF' ? 'BWA' : 'ZAF');

        return ['pair' => Corridors::view($p), 'tot' => Corridors::ledgerTotals($p)];
    }

    /** Agent answers from the loaded registers (prototype agent()); every answer reads the BW-1.0 registers. */
    private function answers(): array
    {
        $by = CountryHub::countries();
        $top = array_slice(CountryHub::register('BW_Top30'), 0, 5);
        $shocks = CountryHub::register('BW_Shocks');
        usort($shocks, fn ($x, $y) => (float) $y['Downturn index'] <=> (float) $x['Downturn index']);
        $gaps = CountryHub::register('BW_DataGaps');
        $old = array_values(array_filter(CountryHub::register('BW_Facts'), fn ($f) => (int) substr((string) $f['Date'], 0, 4) <= 2023));
        $noEv = count(array_filter(Corridors::all(), fn ($p) => $p['st'] === 'No Evidence'));
        $fromBw = [];
        foreach ($by as $b => $x) {
            if ($b !== 'BWA') {
                $p = Corridors::pair('BWA', $b);
                if ($p['items']) {
                    $fromBw[] = "{$x['name']} ({$p['st']})";
                }
            }
        }

        return [
            'priority' => 'Highest activation priority: '.implode(', ', array_slice(array_values(array_map(fn ($c) => $c['name'], array_filter($by, fn ($c) => in_array(self::priority($c), ['High', 'Active'], true)))), 0, 10)).'. Basis: state, issued pack and proposed wave (I2_Country_Activation).',
            'opps' => 'Top 5 in Botswana: '.implode('; ', array_map(fn ($r) => "{$r['Opportunity']} ({$r['Tier']}, {$r['Best place']})", $top)).'.',
            'exposed' => 'Most exposed (downturn index): '.implode('; ', array_map(fn ($r) => "{$r['Sector name']} {$r['Downturn index']}", array_slice($shocks, 0, 4))).'.',
            'gaps' => count($gaps).' open gaps, e.g. '.implode('; ', array_map(fn ($r) => "{$r['ID']} {$r['Missing data']}", array_slice($gaps, 0, 3))).'.',
            'contradictions' => count(CountryHub::register('BW_Conflicts')).' contradictions are logged and all are labelled (range shown or corrected); none are left silently resolved.',
            'older' => count($old).' sector facts are dated 2023 or earlier, e.g. '.implode(', ', array_map(fn ($f) => $f['Fact ID'], array_slice($old, 0, 3))).' — kept as baselines, never as Tier A triggers.',
            'noEvidence' => number_format($noEv).' of 2,862 directional pairs hold no evidence (modelled status).',
            'corridors' => 'From Botswana: '.implode(', ', $fromBw).'.',
            'cost' => Corridors::ledgerTotals(Corridors::pair('BWA', 'ZAF')),
        ];
    }
}
