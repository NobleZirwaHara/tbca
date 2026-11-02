<?php

namespace App\Support\Aiim;

use App\Support\CountryHub\CountryHub;
use App\Support\Industries\IndustryData;
use App\Support\Industries\ServerTable;
use Illuminate\Http\Request;

/**
 * Read model for the search and object pages rebuilt from the client's "TBCA AIIM Botswana"
 * prototype (mock-ups 7 to 16 plus the leads centre, the HS code mapper and the investor and trader
 * information types). Every figure comes from the BW-1.0 registers loaded in CountryHub; selling
 * prices come only from the app's Sprint records by code (prototype PERSONAS, FUNDERS, CORR,
 * mapData, docSlice, svcRail and the object cards used by Save, Watch and Compare).
 */
class ProtoSearch
{
    public const COUNTRY = 'botswana';

    /** The 18 sectors as the prototype names and colours them (prototype SECTORS). */
    public const SECTORS = [
        'ENR' => ['Energy & Power', '#d6a32e'], 'OGS' => ['Fuels, Strategic Reserves & Coal-bed Methane', '#8a5a2b'], 'MIN' => ['Diamonds, Copper & Mining', '#4f8fca'],
        'AGR' => ['Livestock, Beef & Horticulture', '#5b8c3a'], 'BLU' => ['Fisheries & Aquaculture', '#2a9d9a'], 'FOR' => ['Forestry & Veld Products', '#2f6b3d'],
        'MFG' => ['Manufacturing, SEZs & Beneficiation', '#7a4fa3'], 'WSW' => ['Water, Sanitation & Waste', '#2f7fc1'], 'TRN' => ['Transport, Corridors & Logistics', '#c96a12'],
        'ICT' => ['Digital, Mobile Money & 5G', '#3b5bdb'], 'CRE' => ['Construction, Roads & Housing', '#8c6d46'], 'TOU' => ['Tourism (Okavango, Chobe, Kalahari)', '#d9822b'],
        'HLT' => ['Health & Pharmaceuticals', '#c0392b'], 'EDU' => ['Education & Skills', '#6a4c93'], 'FIN' => ['Finance, Pensions & Fintech', '#1f7a4c'],
        'TRD' => ['Trade, Retail & Citizen Markets', '#b5476b'], 'GRN' => ['Green Economy & Climate Finance', '#3f9c5a'], 'CSP' => ['Creative, Sport & Professional Services', '#9b5de5'],
    ];

    /** Investor personas (prototype PERSONAS). */
    public const PERSONAS = [
        'SME' => 'Local SME / first-time investor', 'DFI' => 'DFI / impact investor', 'CORP' => 'Strategic corporate',
        'INF' => 'Infrastructure / institutional fund', 'TRD' => 'Trader / distributor', 'DIA' => 'Diaspora',
    ];

    /** Strategic investors named in the evidence: name, note, precedent, sector. */
    public const STRATEGIC = [
        ['De Beers', 'Botswana–De Beers sales agreement; Debswana 50:50', 'P-01', 'MIN'],
        ['MMG', 'Khoemacau expansion ≈US$900 m to 130,000 tpa', 'P-02', 'MIN'],
        ['Sandfire', 'Motheo copper mine (Kalahari Copper Belt)', '', 'MIN'],
        ['Lucara', 'Karowe diamond mine', '', 'MIN'],
        ['CCI Global', 'BPO investment', '', 'CSP'],
        ['BPOPF', 'P128 bn pension fund — the largest domestic capital pool', '', 'FIN'],
    ];

    /** Funders (prototype FUNDERS): code => [name, role]. */
    public const FUNDERS = [
        'CEDA' => ['Citizen Entrepreneurial Development Agency', 'Development finance; citizen empowerment'],
        'NDB' => ['National Development Bank', 'Development finance'],
        'BDC' => ['Botswana Development Corporation', 'Development finance'],
        'BPOPF' => ['Botswana Public Officers Pension Fund', 'Pensions'],
        'NBFIRA' => ['Non-Bank Financial Institutions Regulatory Authority', 'Pensions; capital markets'],
        'BSE' => ['Botswana Stock Exchange', 'Capital markets'],
        'BoB' => ['Bank of Botswana', 'Central bank; fintech sandbox'],
        'BECI' => ['Export Credit Insurance (BECI)', 'Export credit'],
        'GCF' => ['Green Climate Fund', 'Climate finance'],
        'LEA' => ['Local Enterprise Authority', 'Rural; SME support'],
        'BITC' => ['Botswana Investment and Trade Centre', 'Investment promotion'],
        'SEZA' => ['Special Economic Zones Authority', 'Special economic zones'],
    ];

    /** Gateway colours (prototype GWCOL). */
    public const GWCOL = ['#d6a32e', '#4f8fca', '#b5476b', '#3f9c5a', '#7a4fa3', '#c96a12'];

    /** Trade corridors (prototype CORR): schematic alignments, gateway index, linked instrument and fact. */
    public const CORR = [
        ['id' => 'KAZ', 'name' => 'Kazungula / North–South Corridor', 'gw' => 0, 'pts' => [[25.16, -17.802], [25.86, -17.85], [28.28, -15.42]], 'to' => 'Kasane → Kazungula Bridge OSBP → Livingstone → Lusaka → DRC Copperbelt', 'policy' => 'KAZUNGULA', 'fact' => 'BW-TRN-F3', 'dash' => false],
        ['id' => 'MKL', 'name' => 'Mosetse–Kazungula–Livingstone railway', 'gw' => 0, 'pts' => [[26.62, -20.67], [25.16, -17.802], [25.86, -17.85]], 'to' => '430 km rail link in preparation', 'policy' => 'MKLRAIL', 'fact' => 'BW-TRN-F4', 'dash' => true],
        ['id' => 'TKC', 'name' => 'Trans-Kalahari Corridor', 'gw' => 3, 'pts' => [[21.646, -21.698], [20.0, -22.2], [17.08, -22.56], [14.5, -22.95]], 'to' => 'Ghanzi → Mamuno → Windhoek → Walvis Bay', 'policy' => '', 'fact' => '', 'dash' => false],
        ['id' => 'TLK', 'name' => 'Tlokweng Gate – Gauteng – Maputo', 'gw' => 1, 'pts' => [[25.971, -24.669], [26.25, -25.25], [28.05, -26.2], [32.58, -25.97]], 'to' => 'Gaborone → Tlokweng → Zeerust → Gauteng → Maputo', 'policy' => '', 'fact' => '', 'dash' => false],
        ['id' => 'RAM', 'name' => 'Ramatlabama / Pioneer Gate – Mahikeng – Durban', 'gw' => 2, 'pts' => [[25.667, -25.217], [25.64, -25.86], [28.05, -26.2], [31.02, -29.86]], 'to' => 'Lobatse → Ramatlabama → Mahikeng → Gauteng → Durban', 'policy' => '', 'fact' => '', 'dash' => false],
        ['id' => 'RMK', 'name' => 'Ramokgwebana – Bulawayo – Beira', 'gw' => 4, 'pts' => [[27.512, -21.174], [27.98, -20.5], [28.58, -20.15], [34.84, -19.83]], 'to' => 'Francistown → Ramokgwebana/Plumtree → Bulawayo → Beira', 'policy' => '', 'fact' => '', 'dash' => false],
        ['id' => 'MDR', 'name' => "Martin's Drift – Polokwane (Limpopo)", 'gw' => 5, 'pts' => [[27.489, -23.186], [27.95, -22.98], [29.45, -23.9], [28.05, -26.2]], 'to' => "Mahalapye/Machaneng → Martin's Drift → Polokwane → Gauteng", 'policy' => '', 'fact' => '', 'dash' => false],
    ];

    /** Fact IDs in free text, long (BW-ENR-F1) or short (ENR-F1) (prototype SHORTFACT). */
    public const FACT_RE = '/\b((?:BW-)?(?:MAC|ENR|OGS|MIN|AGR|BLU|FOR|MFG|WSW|TRN|ICT|CRE|TOU|HLT|EDU|FIN|TRD|GRN|CSP)-F\d+)\b/';

    /* ------------------------------------------------------------------ registers */

    public static function ready(): bool
    {
        return CountryHub::ready() && CountryHub::register('BW_Sweep') !== [];
    }

    public static function reg(string $name): array
    {
        return CountryHub::register($name);
    }

    /** Measure => value from BW_Summary. */
    public static function summary(): array
    {
        return CountryHub::summary();
    }

    public static function secName(?string $code): string
    {
        return self::SECTORS[$code ?? ''][0] ?? (string) $code;
    }

    /** Facts by ID: BW_Facts plus BW_Macro in the same shape (prototype facts()). */
    public static function facts(): array
    {
        return once(function () {
            $out = [];
            foreach (self::reg('BW_Facts') as $f) {
                $out[$f['Fact ID']] = $f;
            }
            foreach (self::reg('BW_Macro') as $f) {
                $out[$f['Fact ID']] = ['Sector' => 'MAC', 'Sector name' => 'Macro', 'Fact ID' => $f['Fact ID'], 'Fact' => $f['Item'], 'Value' => $f['Value'], 'Source' => $f['Source'], 'Date' => $f['Date'], 'URL' => $f['URL'], 'Grade' => $f['Grade']];
            }

            return $out;
        });
    }

    public static function sweep(?string $id = null): ?array
    {
        $all = once(fn () => collect(self::reg('BW_Sweep'))->keyBy('Opp ID')->all());

        return $id === null ? $all : ($all[$id] ?? null);
    }

    private static function find(string $reg, string $col, string $v): ?array
    {
        foreach (self::reg($reg) as $r) {
            if ((string) ($r[$col] ?? '') === $v) {
                return $r;
            }
        }

        return null;
    }

    /** Opportunity record parts: priority row, sweep row, register row and Issue 2.0 row. */
    public static function opp(string $id): ?array
    {
        $p = self::find('BW_Priority', 'Opp ID', $id);
        $sw = self::sweep($id);
        $ob = self::find('BW_Opportunities', 'Opp ID', $id);
        $i2 = self::find('I2_Opportunity_Register', 'Opp ID', $id);
        $o = $p ?? $sw ?? $ob ?? $i2;

        return $o ? ['o' => $o, 'p' => $p, 'sw' => $sw, 'ob' => $ob, 'i2' => $i2] : null;
    }

    /** Border gateways with index, short name and colour. */
    public static function gateways(): array
    {
        return once(fn () => array_map(fn ($g, $i) => $g + ['i' => $i, 'short' => explode(' (', (string) $g['Gateway (proxy)'])[0], 'col' => self::GWCOL[$i] ?? '#999'], self::reg('BW_Gateways'), array_keys(self::reg('BW_Gateways'))));
    }

    public static function gwIndex(?string $label): int
    {
        foreach (self::gateways() as $g) {
            if (str_starts_with((string) $label, $g['short'])) {
                return $g['i'];
            }
        }

        return -1;
    }

    /** Towns with their gateway index. */
    public static function towns(): array
    {
        return once(fn () => array_map(fn ($t) => $t + ['gw' => self::gwIndex($t['Nearest gateway'] ?? null)], self::reg('BW_Towns')));
    }

    /** Evidence hotspots with index, coordinates, leads and best lead (prototype mapData().hot). */
    public static function hot(): array
    {
        return once(function () {
            $towns = collect(self::reg('BW_Towns'))->keyBy('ID');
            $leads = collect(self::reg('BW_Hotspot_Leads'))->groupBy('Hotspot');

            return array_map(function ($h, $i) use ($towns, $leads) {
                $t = $towns[$h['Place ID']] ?? null;
                $l = ($leads[$h['Hotspot']] ?? collect())->values()->all();
                $tiers = array_map(fn ($x) => (string) $x['Tier'], $l);

                return $h + [
                    'i' => $i, 'lat' => $t ? (float) $t['Lat'] : null, 'lon' => $t ? (float) $t['Lon'] : null, 'leads' => $l,
                    'best' => array_reduce($l, fn ($m, $x) => max($m, (float) ($x['Lead score'] ?? 0)), 0),
                    'aplus' => (bool) array_filter($tiers, fn ($t) => str_starts_with($t, 'A+')),
                    'tierA' => (bool) array_filter($tiers, fn ($t) => str_starts_with($t, 'A')),
                ];
            }, self::reg('BW_Hotspots'), array_keys(self::reg('BW_Hotspots')));
        });
    }

    public static function corridor(string $id): ?array
    {
        foreach (self::CORR as $c) {
            if (strcasecmp($c['id'], $id) === 0) {
                return $c;
            }
        }

        return null;
    }

    public static function persona(string $code): ?string
    {
        foreach (self::PERSONAS as $k => $v) {
            if (strcasecmp($k, $code) === 0) {
                return $k;
            }
        }

        return null;
    }

    public static function funder(string $code): ?string
    {
        foreach (self::FUNDERS as $k => $v) {
            if (strcasecmp($k, $code) === 0) {
                return $k;
            }
        }

        return null;
    }

    /** Facts, priority templates and policy instruments that cite a funder (prototype funderHits). */
    public static function funderHits(string $code): array
    {
        $name = self::FUNDERS[$code][0];
        $k = [$code, explode(' (', $name)[0]];
        if ($code === 'BoB') {
            $k[] = 'Bank of Botswana';
        }
        if ($code === 'GCF') {
            $k[] = 'Green Climate';
        }
        $has = fn (string $s) => (bool) array_filter($k, fn ($t) => str_contains($s, $t));

        return [
            'f' => array_values(array_filter(self::facts(), fn ($x) => $has($x['Fact'].' '.$x['Value'].' '.$x['Source']))),
            't' => array_values(array_filter(self::reg('BW_Priority'), fn ($o) => $has(($o['Institution to call'] ?? '').' '.($o['Verification owner'] ?? '')))),
            'pol' => array_values(array_filter(self::reg('BW_Policy'), fn ($p) => $has((string) $p['Instrument']))),
        ];
    }

    /** Count rows by a column, keeping first-seen order. */
    public static function countBy(array $rows, string $key): array
    {
        $out = [];
        foreach ($rows as $r) {
            $v = (string) ($r[$key] ?? '');
            $out[$v] = ($out[$v] ?? 0) + 1;
        }

        return $out;
    }

    /** Sector bars for a set of templates: [code, name, colour, count], biggest first. */
    public static function sectorBars(array $rows, string $key = 'Sector'): array
    {
        $n = self::countBy($rows, $key);
        $out = [];
        foreach (self::SECTORS as $code => [$name, $col]) {
            if (($n[$code] ?? 0) > 0) {
                $out[] = ['code' => $code, 'name' => $name, 'color' => $col, 'v' => $n[$code]];
            }
        }
        usort($out, fn ($a, $b) => $b['v'] <=> $a['v']);

        return $out;
    }

    /** Sweep columns shown in template tables (prototype sweepCols). */
    public const SWEEP_COLS = ['Opp ID', 'Opportunity', 'Band', 'Score', 'RA', 'Tier', 'Downturn tier', 'Citizen-reserved', 'FX earner', 'Persona', 'Time to revenue', 'Evidence'];

    public static function sweepRows(array $rows): array
    {
        return array_values(array_map(fn ($r) => array_intersect_key($r, array_flip(self::SWEEP_COLS)), $rows));
    }

    /* ------------------------------------------------------------------ the country pack */

    private static function level(array $b): int
    {
        if (($b['t'] ?? '') !== 'p') {
            return 99;
        }
        $s = (string) ($b['s'] ?? '');
        if ($s === 'Title') {
            return 0;
        }

        return preg_match('/^Heading (\d)/', $s, $m) ? (int) $m[1] : 99;
    }

    /** Blocks under the first heading starting with $prefix, to the next heading of the same or a higher level (prototype docSlice). */
    public static function slice(string $prefix): array
    {
        $doc = CountryHub::meta('pack_doc') ?? [];
        $i = null;
        foreach ($doc as $k => $b) {
            if (self::level($b) < 99 && str_starts_with((string) ($b['x'] ?? ''), $prefix)) {
                $i = $k;
                break;
            }
        }
        if ($i === null) {
            return [];
        }
        $lv = self::level($doc[$i]);
        $out = [$doc[$i]];
        for ($j = $i + 1; $j < count($doc); $j++) {
            if (self::level($doc[$j]) <= $lv) {
                break;
            }
            $out[] = $doc[$j];
        }

        return $out;
    }

    /** The nth table under a heading (prototype docTable). */
    public static function table(string $prefix, int $n = 0): ?array
    {
        $t = array_values(array_filter(self::slice($prefix), fn ($b) => ($b['t'] ?? '') === 'tbl'));

        return $t[$n]['rows'] ?? null;
    }

    /** Text of the first paragraph of a style under a heading. */
    public static function para(string $prefix, string $style): string
    {
        foreach (self::slice($prefix) as $b) {
            if (($b['s'] ?? '') === $style) {
                return (string) $b['x'];
            }
        }

        return '';
    }

    /* ------------------------------------------------------------------ embedded services */

    /** One embedded service with the app's selling price by code (null price: not in the app catalogue yet). */
    public static function svc(string $code): ?array
    {
        $s = once(fn () => collect(CountryHub::meta('aiim_services') ?? [])->keyBy('code')->all())[$code] ?? null;
        if (! $s) {
            return null;
        }
        $app = IndustryData::sprint($code);
        $inApp = $app && ($app['app'] ?? null) !== null;
        $tiers = $inApp ? array_filter($app['tiers'] ?? [], fn ($v) => $v !== null && $v > 0) : [];
        $price = $tiers ? min($tiers) : ($inApp && ($app['ep'] ?? 0) > 0 ? (int) $app['ep'] : null);

        return [
            'code' => $s['code'], 'name' => $s['name'], 'et' => $inApp ? ($app['entry'] ?? $s['et'] ?? null) : ($s['et'] ?? null),
            'db' => $s['db'] ?? null, 'a0' => $s['a0'] ?? null, 'price' => $price, 'inApp' => $inApp,
        ];
    }

    /** Service rail (prototype svcRail). */
    public static function rail(array $codes, string $title = 'Embedded services on this page', int $max = 6): array
    {
        return ['title' => $title, 'items' => array_values(array_slice(array_filter(array_map(fn ($c) => self::svc($c), $codes)), 0, $max))];
    }

    /** Brief call to action (prototype briefCTA). */
    public static function brief(string $title, string $sub, string $code, string $label = 'Get the Brief'): array
    {
        return ['title' => $title, 'sub' => $sub, 'code' => $code, 'label' => $label, 'svc' => self::svc($code)];
    }

    /* ------------------------------------------------------------------ tables */

    /**
     * One page of a register table, searched, filtered and sorted on the server. Several tables can
     * share a page: each reads its own query parameters, prefixed with $p (q, f, sort, dir, page, size).
     *
     * @param  string[]  $cols  columns to send, in order
     * @param  string[]  $filters  columns offered as filters
     */
    public static function page(Request $r, string $p, array $rows, array $cols, array $filters = [], int $size = 15): array
    {
        $q = trim((string) $r->query($p.'q', ''));
        $f = array_filter((array) $r->query($p.'f', []), fn ($v) => is_string($v) && $v !== '');
        $f = array_intersect_key($f, array_flip($filters));
        $sort = $r->query($p.'sort');
        $sort = $sort === null || $sort === '' || ! is_numeric($sort) ? null : (int) $sort;
        $dir = (int) $r->query($p.'dir', 1) < 0 ? -1 : 1;
        $size = in_array((int) $r->query($p.'size'), [10, 15, 20, 25, 50, 100], true) ? (int) $r->query($p.'size') : $size;

        $options = [];
        foreach ($filters as $k) {
            $vals = array_values(array_unique(array_map('strval', array_filter(array_map(fn ($x) => $x[$k] ?? null, $rows), fn ($v) => $v !== null && $v !== ''))));
            sort($vals);
            $options[$k] = $vals;
        }
        $out = ServerTable::apply($rows, $q, $f, $cols, $sort, $dir, $cols);
        $pages = max(1, (int) ceil(count($out) / $size));
        $page = min(max(0, (int) $r->query($p.'page', 0)), $pages - 1);
        $keep = array_flip($cols);

        return [
            'p' => $p, 'cols' => $cols, 'filters' => $filters,
            'rows' => array_map(fn ($x) => array_intersect_key($x, $keep), array_values(array_slice($out, $page * $size, $size))),
            'total' => count($rows), 'count' => count($out), 'page' => $page, 'pages' => $pages, 'size' => $size,
            'q' => $q, 'f' => (object) $f, 'sort' => $sort, 'dir' => $dir, 'options' => (object) $options,
        ];
    }

    /** Headers of a register in sheet order. */
    public static function headers(string $name): array
    {
        $rows = self::reg($name);

        return $rows ? array_map('strval', array_keys($rows[0])) : [];
    }

    /* ------------------------------------------------------------------ facts on a page */

    /** Facts cited anywhere in a page payload, keyed by long ID (the fact drawer's data). */
    public static function factsIn(mixed $props): array
    {
        preg_match_all(self::FACT_RE, json_encode($props, JSON_UNESCAPED_UNICODE) ?: '', $m);
        $all = self::facts();
        $out = [];
        foreach (array_unique($m[1]) as $id) {
            $long = str_starts_with($id, 'BW-') ? $id : 'BW-'.$id;
            if (isset($all[$long])) {
                $out[$long] = array_intersect_key($all[$long], array_flip(['Fact ID', 'Sector', 'Sector name', 'Fact', 'Value', 'Source', 'Date', 'URL', 'Grade']));
            }
        }

        return $out;
    }

    /* ------------------------------------------------------------------ map */

    /** Botswana map layers (districts, neighbours, rivers, lakes and optionally rail and roads), coordinates rounded to 3 decimals. */
    public static function geo(bool $transport = false): array
    {
        $g = CountryHub::meta('geo_bw') ?? [];
        $keys = $transport ? ['districts', 'countries', 'rivers', 'lakes', 'rail', 'roads'] : ['districts', 'countries', 'rivers', 'lakes'];
        $round = function ($c) use (&$round) {
            return is_array($c) ? array_map($round, $c) : (is_float($c) ? round($c, 3) : $c);
        };
        $out = [];
        foreach ($keys as $k) {
            $out[$k] = array_map(fn ($f) => ['properties' => array_intersect_key($f['properties'] ?? [], array_flip(['name', 'a3'])), 'geometry' => ['type' => $f['geometry']['type'], 'coordinates' => $round($f['geometry']['coordinates'])]], $g[$k] ?? []);
        }

        return $out;
    }

    /** Town points for the map. */
    public static function mapTowns(): array
    {
        return array_map(fn ($t) => ['ID' => $t['ID'], 'Place' => $t['Place'], 'Unit' => $t['Unit'], 'Lat' => (float) $t['Lat'], 'Lon' => (float) $t['Lon'], 'Population used' => $t['Population used'], 'Kind' => $t['Kind'], 'gw' => $t['gw']], self::towns());
    }

    public static function mapGateways(): array
    {
        return array_map(fn ($g) => ['i' => $g['i'], 'name' => $g['Gateway (proxy)'], 'short' => $g['short'], 'col' => $g['col'], 'Lat' => (float) $g['Lat'], 'Lon' => (float) $g['Lon']], self::gateways());
    }

    public static function mapHot(): array
    {
        return array_map(fn ($h) => ['i' => $h['i'], 'Hotspot' => $h['Hotspot'], 'Status' => $h['Status'], 'Fact' => $h['Fact'], 'lat' => $h['lat'], 'lon' => $h['lon']], self::hot());
    }

    /* ------------------------------------------------------------------ links */

    public static function unitUrl(string $code): string
    {
        return '/aiim/province/'.$code;
    }

    public static function townUrl(string $id): string
    {
        return '/aiim/country/'.self::COUNTRY.'/towns/'.$id;
    }

    /* ------------------------------------------------------------------ catalogue objects */

    /** Saved, watch, compare and fee card for a Botswana prototype object, or null when the key is not one. */
    public static function card(string $type, string $key): ?array
    {
        if (! self::ready()) {
            return null;
        }

        return match ($type) {
            'opportunity' => self::oppCard($key),
            'project' => self::projectCard($key),
            'investor' => self::personaCard($key),
            'funder' => self::funderCard($key),
            'corridor' => self::corridorCard($key),
            'place' => self::placeCard($key),
            'unit' => self::unitCard($key),
            'lead' => self::leadCard($key),
            'product' => self::productCard($key),
            default => null,
        };
    }

    /**
     * App confidence for an evidence grade: the lower bound of the matching app band
     * (grade 3 official source = 85, grade 2 = 70, grade 1 = 55).
     */
    public static function confidence(mixed $grade): int
    {
        return match ((string) $grade) {
            '3' => 85, '2' => 70, '1' => 55, default => 55,
        };
    }

    private static function base(string $type, string $key, string $name, array $extra): array
    {
        return $extra + [
            'type' => $type, 'key' => $key, 'name' => $name, 'summary' => '', 'icon' => 'globe', 'location' => 'Botswana', 'sector' => null, 'province' => null,
            'metricLabel' => null, 'metric' => null, 'stageLabel' => null, 'stage' => null, 'score' => null, 'url' => '#', 'confidence' => 70,
            'country' => 'Botswana', 'countrySlug' => self::COUNTRY, 'bw' => true, 'facts' => [],
        ];
    }

    private static function factGrade(?string $id): mixed
    {
        if (! $id) {
            return null;
        }
        $long = str_starts_with($id, 'BW-') ? $id : 'BW-'.$id;

        return self::facts()[$long]['Grade'] ?? null;
    }

    private static function oppCard(string $key): ?array
    {
        $x = self::opp($key);
        if (! $x) {
            return null;
        }
        $o = $x['o'];
        $sw = $x['sw'];
        $code = (string) ($o['Sector'] ?? '');
        $grade = $sw ? ($sw['E'] ?? null) : self::factGrade($o['Evidence trigger'] ?? null);
        $facts = array_filter([
            ['Sector', self::secName($code)], ['Band', $o['Band'] ?? null], ['Tier', $o['Tier'] ?? null], ['Score', $o['Score'] ?? null], ['RA', $o['RA'] ?? null],
            ['Persona', $o['Persona'] ?? null], ['Time to revenue', $o['Time to revenue'] ?? null], ['Citizen-reserved', $o['Citizen-reserved'] ?? null], ['FX earner', $o['FX earner'] ?? null],
            ['Evidence', $o['Evidence'] ?? ($o['Evidence trigger'] ?? null)],
        ], fn ($p) => $p[1] !== null && $p[1] !== '' && $p[1] !== '—');

        return self::base('opportunity', (string) $o['Opp ID'], (string) $o['Opportunity'], [
            'summary' => (string) ($sw['Trigger'] ?? $o['Evidence trigger'] ?? ''),
            'icon' => SectorCodes::icon($code), 'sector' => self::secName($code), 'province' => $x['p']['Eligible places'] ?? null ? $x['p']['Eligible places'].' eligible places' : null,
            'metricLabel' => 'Score', 'metric' => isset($o['Score']) && $o['Score'] !== '—' ? 'Score '.$o['Score'].' · RA '.($o['RA'] ?? '—') : ($o['Band'] ?? null),
            'stageLabel' => 'Tier', 'stage' => ($o['Tier'] ?? '') !== '—' ? ($o['Tier'] ?? null) : ($o['Type'] ?? ($o['Status'] ?? null)),
            'url' => '/aiim/opportunities/'.$o['Opp ID'], 'confidence' => self::confidence($grade), 'facts' => array_values($facts),
        ]);
    }

    private static function projectCard(string $key): ?array
    {
        if (preg_match('/^H(\d+)$/i', $key, $m)) {
            $h = self::hot()[(int) $m[1]] ?? null;
            if (! $h) {
                return null;
            }

            return self::base('project', 'H'.$h['i'], (string) $h['Hotspot'], [
                'summary' => $h['Place'].' · '.$h['Status'], 'icon' => 'target', 'location' => (string) $h['Place'], 'sector' => 'Evidence hotspot', 'province' => (string) $h['Unit code'],
                'metricLabel' => 'Leads', 'metric' => count($h['leads']).' leads · best '.$h['best'], 'stageLabel' => 'Status', 'stage' => (string) $h['Status'],
                'url' => '/aiim/projects/H'.$h['i'], 'confidence' => self::confidence(self::factGrade($h['Fact'] ?? null)),
                'facts' => [['Place', $h['Place']], ['Unit', $h['Unit code']], ['Status', $h['Status']], ['Evidence', $h['Fact']], ['Leads', count($h['leads'])]],
            ]);
        }
        $p = self::find('BW_Precedents', 'ID', strtoupper($key));
        if (! $p) {
            return null;
        }
        $sec = explode('-', (string) $p['Evidence'])[1] ?? '';

        return self::base('project', (string) $p['ID'], (string) $p['Deal'], [
            'summary' => $p['Scope'].' · '.$p['Date'], 'icon' => SectorCodes::icon($sec), 'sector' => self::secName($sec),
            'metricLabel' => 'Size', 'metric' => (string) $p['Size'], 'stageLabel' => 'Status', 'stage' => (string) $p['Status'],
            'url' => '/aiim/projects/'.$p['ID'], 'confidence' => self::confidence(self::factGrade($p['Evidence'])),
            'facts' => [['Size', $p['Size']], ['Date', $p['Date']], ['Scope', $p['Scope']], ['Evidence', $p['Evidence']], ['Status', $p['Status']]],
        ]);
    }

    private static function personaCard(string $key): ?array
    {
        $c = self::persona($key);
        if (! $c) {
            return null;
        }
        $t = array_filter(self::reg('BW_Sweep'), fn ($o) => $o['Persona'] === $c);
        $a = count(array_filter($t, fn ($o) => str_starts_with((string) $o['Tier'], 'A')));

        return self::base('investor', $c, self::PERSONAS[$c], [
            'summary' => count($t).' templates match this persona.', 'icon' => 'users', 'sector' => 'Investor persona', 'province' => 'Persona '.$c,
            'metricLabel' => 'Templates', 'metric' => count($t).' templates · '.$a.' Tier A', 'stageLabel' => 'Type', 'stage' => 'Investor persona',
            'url' => '/aiim/investors/'.$c, 'confidence' => 85,
            'facts' => [['Templates', count($t)], ['Tier A', $a]],
        ]);
    }

    private static function funderCard(string $key): ?array
    {
        $c = self::funder($key);
        if (! $c) {
            return null;
        }
        $h = self::funderHits($c);

        return self::base('funder', $c, self::FUNDERS[$c][0], [
            'summary' => self::FUNDERS[$c][1], 'icon' => 'landmark', 'sector' => self::FUNDERS[$c][1], 'province' => $c,
            'metricLabel' => 'Evidence', 'metric' => count($h['f']).' facts · '.count($h['t']).' templates', 'stageLabel' => 'Type', 'stage' => self::FUNDERS[$c][1],
            'url' => '/aiim/funders/'.$c, 'confidence' => 85,
            'facts' => [['Facts citing', count($h['f'])], ['Templates routed here', count($h['t'])], ['Policy instruments', count($h['pol'])]],
        ]);
    }

    private static function corridorCard(string $key): ?array
    {
        $c = self::corridor($key);
        if (! $c) {
            return null;
        }
        $g = self::gateways()[$c['gw']] ?? null;

        return self::base('corridor', $c['id'], $c['name'], [
            'summary' => $c['to'], 'icon' => 'route', 'location' => $c['to'], 'sector' => 'Transport, Corridors & Logistics', 'province' => $g['short'] ?? null,
            'metricLabel' => 'Gateway', 'metric' => $g['short'] ?? '—', 'stageLabel' => 'Linked instrument', 'stage' => $c['policy'] ?: '—',
            'url' => '/aiim/corridors/'.$c['id'], 'confidence' => $c['fact'] ? self::confidence(self::factGrade($c['fact'])) : 70,
            'facts' => array_values(array_filter([['Gateway', $g['Gateway (proxy)'] ?? null], ['Route', $c['to']], ['Instrument', $c['policy'] ?: null], ['Evidence', $c['fact'] ?: null]], fn ($p) => $p[1] !== null)),
        ]);
    }

    private static function placeCard(string $key): ?array
    {
        $t = self::find('BW_Towns', 'ID', $key);
        if (! $t) {
            return null;
        }

        return self::base('place', (string) $t['ID'], (string) $t['Place'], [
            'summary' => $t['Unit'].' · '.$t['Kind'], 'icon' => 'globe', 'location' => (string) $t['Place'], 'province' => (string) $t['Unit'],
            'metricLabel' => 'Population', 'metric' => number_format((float) $t['Population used']), 'stageLabel' => 'Nearest gateway', 'stage' => (string) $t['Nearest gateway'],
            'url' => self::townUrl((string) $t['ID']), 'confidence' => 85,
            'facts' => [['Unit', $t['Unit']], ['Population', $t['Population used']], ['Nearest gateway', $t['Nearest gateway']], ['Gateway km', $t['Gateway km']]],
        ]);
    }

    private static function unitCard(string $key): ?array
    {
        $u = self::find('BW_Units', 'Code', strtoupper($key));
        if (! $u) {
            return null;
        }

        return self::base('unit', (string) $u['Code'], (string) $u['Unit'], [
            'summary' => ucfirst((string) $u['Kind']).' · '.$u['Tags'], 'icon' => 'globe', 'location' => (string) $u['Unit'], 'province' => (string) $u['Unit'],
            'metricLabel' => 'Population (Census 2022)', 'metric' => number_format((float) $u['Population (Census 2022)']), 'stageLabel' => 'Templates', 'stage' => $u['Templates'].' templates · '.$u['Tier A'].' Tier A',
            'url' => self::unitUrl((string) $u['Code']), 'confidence' => 85,
            'facts' => [['Population', $u['Population (Census 2022)']], ['Places', $u['Places']], ['Templates', $u['Templates']], ['Tier A', $u['Tier A']], ['Envelope US$ m (weighted)', $u['Envelope US$ m (weighted)']]],
        ]);
    }

    private static function leadCard(string $key): ?array
    {
        $l = self::find('BW_Hotspot_Leads', 'Lead ID', $key) ?? self::find('BW_Ranked_Leads', 'Lead ID', $key);
        if (! $l) {
            return null;
        }
        $code = (string) ($l['Sector'] ?? (explode('-', (string) $l['Template'])[1] ?? ''));

        return self::base('lead', (string) $l['Lead ID'], (string) $l['Opportunity'], [
            'summary' => trim(($l['Hotspot'] ?? '').' '.$l['Place'].' · '.$l['Unit']), 'icon' => SectorCodes::icon($code), 'location' => (string) $l['Place'], 'sector' => self::secName($code), 'province' => (string) $l['Unit'],
            'metricLabel' => 'Lead score', 'metric' => (string) $l['Lead score'], 'stageLabel' => 'Tier', 'stage' => (string) $l['Tier'],
            'url' => '/aiim/country/'.self::COUNTRY.'/leads/'.$l['Lead ID'], 'confidence' => 70,
            'facts' => [['Template', $l['Template']], ['Place', $l['Place']], ['Lead score', $l['Lead score']], ['Tier', $l['Tier']]],
        ]);
    }

    private static function productCard(string $key): ?array
    {
        $p = self::find('BW_Products', 'Product', $key);
        $c = $p ? null : self::find('I2_Commodity_HS', 'Commodity', $key);
        if (! $p && ! $c) {
            return null;
        }
        $name = $p ? $p['Product'] : $c['Commodity'];
        $hs = $p ? $p['HS 2022'] : $c['HS 2022 (6-digit)'];
        $sec = $p ? $p['Sector'] : $c['Sector'];

        return self::base('product', (string) $name, (string) $name, [
            'summary' => $p ? ($p['Setswana [VERIFY]'].' · '.$p['Note']) : (string) $c['SA model anchor / note'], 'icon' => SectorCodes::icon($sec), 'sector' => self::secName($sec),
            'province' => $p ? $p['Group'] : $c['Group'], 'metricLabel' => 'HS 2022', 'metric' => (string) $hs, 'stageLabel' => 'Group', 'stage' => $p ? $p['Group'] : $c['Group'],
            'url' => '/aiim/country/'.self::COUNTRY.'/hs/'.rawurlencode((string) $name), 'confidence' => 70,
            'facts' => [['HS 2022', $hs], ['Sector', self::secName($sec)], ['Group', $p ? $p['Group'] : $c['Group']]],
        ]);
    }
}
