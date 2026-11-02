<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\Corridors;
use App\Support\CountryHub\CountryHub;
use App\Support\Industries\IndustryData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Corridors & Ledgers P35 to P48 (prototype pages-corridors.js): 54 x 53 directional pairs, the
 * selector, corridor detail, endpoint comparison, pair evidence, the network view, the six ledger
 * views, the fee schedule comparison and the 12-month ledger outlook. Every corridor number is the
 * prototype's model (App\Support\CountryHub\Corridors); ledger T uses the app's Sprint entry prices.
 */
class CorridorController extends Controller
{
    /** Benchmark column per country (prototype BENCHCOL). */
    public const BENCHCOL = ['MWI' => 'Malawi', 'GHA' => 'Ghana', 'NGA' => 'Nigeria', 'EGY' => 'Egypt', 'MAR' => 'Morocco', 'ZAF' => 'South Africa', 'DZA' => 'Algeria', 'BWA' => 'Botswana'];

    /* ------------------------------------------------------------------ P35 landing */

    public function landing(Request $request): Response
    {
        $from = $this->from($request->query('from'));
        $mine = $this->mine($from['iso3']);
        $lines = [];
        foreach (Corridors::all() as $p) {
            if ($p['st'] === 'High Confidence' || ($p['st'] === 'Evidence Available' && $p['a'] === $from['iso3'])) {
                $lines[] = [$p['a'], $p['b'], $p['st'] === 'High Confidence' ? 2 : 1.2, $p['st'] === 'High Confidence' ? '#2fa35a' : '#ffd21f'];
            }
        }

        return $this->plain('Corridors/Landing', [
            'from' => Corridors::endpoint($from['iso3']),
            'map' => $this->map(),
            'cnt' => Corridors::counts(),
            'sellable' => Corridors::sellableCount(),
            'lines' => $lines,
            'mine' => array_map(fn ($p) => ['b' => $p['b'], 'iso2' => CountryHub::countries()[$p['b']]['iso2'], 'name' => CountryHub::countries()[$p['b']]['name'], 'st' => $p['st'], 'items' => $p['items'], 'conf' => $p['conf']], $mine),
            'est' => array_sum(Corridors::ledgerTotals($mine[0])),
        ]);
    }

    /* ------------------------------------------------------------------ P36 selector */

    public function select(Request $request): Response
    {
        $a = $this->from($request->query('from'));
        $b = $request->query('to') ? CountryHub::country((string) $request->query('to')) : null;
        $rows = [];
        foreach (CountryHub::countries() as $iso => $x) {
            if ($iso === $a['iso3'] || ($b && $iso !== $b['iso3'])) {
                continue;
            }
            $p = Corridors::pair($a['iso3'], $iso);
            $rows[] = [
                'a' => $p['a'], 'b' => $p['b'], 'aIso2' => $a['iso2'], 'bIso2' => $x['iso2'], 'to' => $x['name'], 'type' => $p['type'], 'st' => $p['st'], 'items' => $p['items'],
                'conf' => $p['conf'], 'sellable' => Corridors::sellable($p), 'est' => array_sum(Corridors::ledgerTotals($p)), 'days' => $p['days'],
            ];
        }

        return $this->plain('Corridors/Select', ['from' => Corridors::endpoint($a['iso3']), 'to' => $b ? Corridors::endpoint($b['iso3']) : null, 'rows' => $rows]);
    }

    /* ------------------------------------------------------------------ P40 network */

    public function network(Request $request): Response|StreamedResponse
    {
        if ($request->query('export') === 'csv') {
            $by = CountryHub::countries();

            return response()->streamDownload(function () use ($by) {
                $out = fopen('php://output', 'w');
                fputcsv($out, ['From', 'To', 'Status', 'Items', 'Confidence']);
                foreach (Corridors::all() as $p) {
                    fputcsv($out, [$by[$p['a']]['name'], $by[$p['b']]['name'], $p['st'], $p['items'], $p['conf']]);
                }
                fclose($out);
            }, 'corridor_network.csv', ['Content-Type' => 'text/csv']);
        }

        $by = CountryHub::countries();
        $regions = array_values(array_unique(array_column($by, 'region')));
        $heat = [];
        foreach ($regions as $r1) {
            foreach ($regions as $r2) {
                $heat[$r1][$r2] = ['n' => 0, 'e' => 0];
            }
        }
        $lines = [];
        foreach (Corridors::all() as $p) {
            $cell = &$heat[$by[$p['a']]['region']][$by[$p['b']]['region']];
            $cell['n']++;
            $cell['e'] += $p['items'] > 0 ? 1 : 0;
            unset($cell);
            if ($p['st'] === 'High Confidence' || $p['st'] === 'Evidence Available') {
                $lines[] = [$p['a'], $p['b'], $p['st'] === 'High Confidence' ? 2 : 1, $p['st'] === 'High Confidence' ? '#2fa35a' : '#ffd21f'];
            }
        }
        foreach ($heat as $r1 => $row) {
            foreach ($row as $r2 => $x) {
                $heat[$r1][$r2]['p'] = $x['n'] ? (int) round(100 * $x['e'] / $x['n']) : 0;
            }
        }

        return $this->plain('Corridors/Network', [
            'map' => $this->map(), 'cnt' => Corridors::counts(), 'sellable' => Corridors::sellableCount(), 'total' => count(Corridors::all()),
            'lines' => $lines, 'regions' => $regions, 'heat' => $heat,
        ]);
    }

    /* ------------------------------------------------------------------ P37 to P39, P47, P48 pair views */

    public function pair(string $view, string $a, string $b): Response|RedirectResponse
    {
        if ($a !== strtoupper($a) || $b !== strtoupper($b)) {
            return redirect('/countries/corridors/'.$view.'/'.strtoupper($a).'/'.strtoupper($b));
        }
        $p = $this->resolve($a, $b);
        $cr = Corridors::view($p);
        $tot = Corridors::ledgerTotals($p);
        $bw = $p['a'] === 'BWA' || $p['b'] === 'BWA';

        return match ($view) {
            'detail' => $this->plain('Corridors/Detail', ['cr' => $cr, 'tot' => $tot, 'map' => $this->map()] + $this->detail($p, $bw)),
            'compare' => $this->plain('Corridors/Compare', ['cr' => $cr, 'ea' => $this->endpointFull($p['a']), 'eb' => $this->endpointFull($p['b'])]),
            'evidence' => $this->plain('Corridors/Evidence', ['cr' => $cr, 'bw' => $bw, 'items' => $this->evidence($p, $bw)]),
            'fees' => $this->plain('Corridors/Fees', ['cr' => $cr, 'tot' => $tot]),
            'outlook' => $this->plain('Corridors/Outlook', ['cr' => $cr, 'tot' => $tot]),
        };
    }

    /* ------------------------------------------------------------------ P41 to P46 ledgers */

    public function ledger(string $ledger, string $a, string $b): Response|RedirectResponse
    {
        if ($a !== strtoupper($a) || $b !== strtoupper($b)) {
            return redirect('/countries/corridors/ledger/'.$ledger.'/'.strtoupper($a).'/'.strtoupper($b));
        }
        $p = $this->resolve($a, $b);
        $tot = Corridors::ledgerTotals($p);
        $lg = collect(Corridors::LEDG)->firstWhere(0, $ledger);
        $A = CountryHub::countries()[$p['a']];
        $B = CountryHub::countries()[$p['b']];
        $lines = [];
        if ($ledger === 'T') {
            foreach (Corridors::corrSprints() as $i => $s) {
                $lines[] = ['name' => $s['name'], 'purpose' => CountryHub::TOPICS[$s['topic']] ?? $s['topic'], 'amount' => $s['ep'], 'cert' => $i % 3 === 2 ? 'Model Basis' : 'Resolved',
                    'ref' => "RES-{$A['iso2']}-{$B['iso2']}-CT-041-00".($i + 1), 'code' => $s['code']];
            }
            $lines[] = ['name' => 'Post-activation advisory support (monthly)', 'purpose' => 'Retainer', 'amount' => null, 'cert' => 'Price Suppressed', 'ref' => '—', 'code' => null];
        } else {
            $names = match ($ledger) {
                'X' => ['FX conversion & liquidity spread', 'Cross-border bank charges', 'Courier & document legalisation', 'Payment-gateway fees'],
                'S' => $p['a'] === 'BWA' || $p['b'] === 'BWA'
                    ? array_map(fn ($r) => "{$r['Permits']} ({$r['Issuer']})", array_slice(CountryHub::register('BW_Permits'), 0, 4))
                    : ['Company registration filing', 'Trade licence', 'Customs registration', 'Statutory notices'],
                'P' => ['Independent attorney — legal opinion', 'Registered tax practitioner', 'Licensed customs broker', 'Notary / commissioner of oaths'],
                'D' => ['Country evidence pack licence', 'Trade statistics licence', 'Map & geography layer licence'],
                'CT-C' => ['Corridor activation fee', 'Transit & border-post facilitation', 'Corridor risk sign-off'],
            };
            $n = count($names);
            $ws = $n * ($n + 1) / 2;
            foreach ($names as $i => $name) {
                $lines[] = ['name' => $name, 'purpose' => $lg[2], 'amount' => $tot[$ledger] * ($n - $i) / $ws, 'cert' => $p['st'] === 'No Evidence' ? 'Price Suppressed' : 'Model Basis',
                    'ref' => "RES-{$A['iso2']}-{$B['iso2']}-{$ledger}-00".($i + 1), 'code' => null];
            }
        }

        return $this->plain('Corridors/Ledger', ['cr' => Corridors::view($p), 'ledger' => $ledger, 'lg' => $lg, 'lines' => $lines, 'aSlug' => $A['slug']]);
    }

    /* ------------------------------------------------------------------ helpers */

    /** Departure country from ?from= (ISO3, ISO2 or slug), Botswana by default (prototype CBY(q.from) || BYISO.BWA). */
    private function from(mixed $key): array
    {
        abort_unless(CountryHub::ready(), 404);

        return ($key ? CountryHub::country((string) $key) : null) ?? CountryHub::countries()['BWA'];
    }

    private function resolve(string $a, string $b): array
    {
        abort_unless(CountryHub::ready(), 404);
        $p = Corridors::pair($a, $b);
        abort_unless($p !== null, 404);

        return $p;
    }

    /** Pairs from one country, highest confidence first. */
    private function mine(string $iso): array
    {
        $mine = array_values(array_filter(Corridors::all(), fn ($p) => $p['a'] === $iso));
        usort($mine, fn ($x, $y) => $y['conf'] <=> $x['conf']);

        return $mine;
    }

    /** The 54 country objects for the Africa map. */
    private function map(): array
    {
        return array_values(array_map(fn ($c) => ['iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name'], 'region' => $c['region'], 'pack' => $c['pack'], 'rcs' => $c['rcs']], CountryHub::countries()));
    }

    /** Corridor detail extras: modelled trade both ways and the Botswana gateways. */
    private function detail(array $p, bool $bw): array
    {
        $t = IndustryData::trade();

        return [
            'fl' => array_sum(IndustryData::flow($t, $p['a'], $p['b'])),
            'rv' => array_sum(IndustryData::flow($t, $p['b'], $p['a'])),
            'gw' => $bw ? array_map(fn ($g) => explode(' (', (string) $g['Gateway (proxy)'])[0], CountryHub::register('BW_Gateways')) : [],
            'sacu' => in_array($p['a'], Corridors::SACU, true) && in_array($p['b'], Corridors::SACU, true),
            'ledg' => Corridors::LEDG,
        ];
    }

    /** Endpoint attributes for the comparison (prototype ep()). */
    private function endpointFull(string $iso): array
    {
        $c = CountryHub::countries()[$iso];
        $col = self::BENCHCOL[$iso] ?? null;
        $bench = $col ? array_map(fn ($r) => [(string) $r['Metric'], (string) ($r[$col] ?? '')], array_slice(CountryHub::register('BW_Benchmark'), 1, 5)) : [];

        return array_intersect_key($c, array_flip(['iso3', 'iso2', 'slug', 'name', 'region', 'rcs', 'capital', 'currency', 'languages', 'recs', 'pop', 'gdp', 'landlocked'])) + ['bench' => $bench];
    }

    /** Pair evidence items (prototype P39). */
    private function evidence(array $p, bool $bw): array
    {
        if (! $bw) {
            $cats = ['Regulatory & Legal', 'Tax & Fiscal', 'Financial & Banking', 'Immigration & Mobility', 'Trade & Customs', 'Commercial Environment'];

            return $p['items'] ? array_map(fn ($i) => [$cats[$i], 'Evidence item '.($i + 1), 'Government publication', 'Pending source attachment', '—', true], range(0, $p['items'] - 1)) : [];
        }
        $facts = collect(CountryHub::register('BW_Facts'))->keyBy('Fact ID');
        $F = fn ($id, $k) => (string) ($facts[$id][$k] ?? '');
        $items = [
            ['Trade & Customs', $F('BW-TRD-F3', 'Fact'), 'Budget summary', $F('BW-TRD-F3', 'Source'), $F('BW-TRD-F3', 'Date'), false],
            ['Trade & Customs', $F('BW-TRD-F5', 'Fact'), 'News report', $F('BW-TRD-F5', 'Source'), $F('BW-TRD-F5', 'Date'), false],
            ['Trade statistics', $F('BW-TRD-F2', 'Fact'), 'Official statistics', $F('BW-TRD-F2', 'Source'), $F('BW-TRD-F2', 'Date'), false],
            ['Transport & Logistics', 'Border gateways (6) and nearest-place distances', 'Computed register', 'BW_Gateways / BW_Towns', '2026-10-09', false],
            ['Financial & Banking', 'Exchange controls abolished; pula crawling peg', 'IMF / Ministry of Finance', 'BW-MAC-F19 · F11', '2026-01-02', false],
            ['Energy', $F('BW-ENR-F5', 'Fact'), 'News (Bloomberg)', $F('BW-ENR-F5', 'Source'), $F('BW-ENR-F5', 'Date'), false],
        ];

        return array_slice($items, 0, max($p['items'], 1));
    }
}
