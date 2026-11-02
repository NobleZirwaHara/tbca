<?php

namespace App\Support\Aiim;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\IntelData;
use App\Support\Industries\IndustryData;

/**
 * Read model for the Explore pages of the client's "TBCA AIIM Botswana" prototype (landing, cockpit,
 * map view, units, towns, sectors, risk, evidence and unit economics). Every figure comes from the
 * Botswana BW-1.0 registers and country pack loaded in cty_meta / ind_registers; service prices come
 * only from the app's Sprint records, matched by service code.
 */
class ProtoExplore
{
    public const SLUG = 'botswana';

    /** The 18 Botswana sectors in pack order: code => [name, colour] (prototype SECTORS). */
    public const SECTORS = [
        'ENR' => ['Energy & Power', '#d6a32e'], 'OGS' => ['Fuels, Strategic Reserves & Coal-bed Methane', '#8a5a2b'], 'MIN' => ['Diamonds, Copper & Mining', '#4f8fca'],
        'AGR' => ['Livestock, Beef & Horticulture', '#5b8c3a'], 'BLU' => ['Fisheries & Aquaculture', '#2a9d9a'], 'FOR' => ['Forestry & Veld Products', '#2f6b3d'],
        'MFG' => ['Manufacturing, SEZs & Beneficiation', '#7a4fa3'], 'WSW' => ['Water, Sanitation & Waste', '#2f7fc1'], 'TRN' => ['Transport, Corridors & Logistics', '#c96a12'],
        'ICT' => ['Digital, Mobile Money & 5G', '#3b5bdb'], 'CRE' => ['Construction, Roads & Housing', '#8c6d46'], 'TOU' => ['Tourism (Okavango, Chobe, Kalahari)', '#d9822b'],
        'HLT' => ['Health & Pharmaceuticals', '#c0392b'], 'EDU' => ['Education & Skills', '#6a4c93'], 'FIN' => ['Finance, Pensions & Fintech', '#1f7a4c'],
        'TRD' => ['Trade, Retail & Citizen Markets', '#b5476b'], 'GRN' => ['Green Economy & Climate Finance', '#3f9c5a'], 'CSP' => ['Creative, Sport & Professional Services', '#9b5de5'],
    ];

    /** Trade corridors drawn on the Botswana map (prototype CORR; schematic alignments). */
    public const CORRIDORS = [
        ['id' => 'KAZ', 'name' => 'Kazungula / North–South Corridor', 'gw' => 0, 'pts' => [[25.16, -17.802], [25.86, -17.85], [28.28, -15.42]], 'to' => 'Kasane → Kazungula Bridge OSBP → Livingstone → Lusaka → DRC Copperbelt', 'dash' => false],
        ['id' => 'MKL', 'name' => 'Mosetse–Kazungula–Livingstone railway', 'gw' => 0, 'pts' => [[26.62, -20.67], [25.16, -17.802], [25.86, -17.85]], 'to' => '430 km rail link in preparation', 'dash' => true],
        ['id' => 'TKC', 'name' => 'Trans-Kalahari Corridor', 'gw' => 3, 'pts' => [[21.646, -21.698], [20.0, -22.2], [17.08, -22.56], [14.5, -22.95]], 'to' => 'Ghanzi → Mamuno → Windhoek → Walvis Bay', 'dash' => false],
        ['id' => 'TLK', 'name' => 'Tlokweng Gate – Gauteng – Maputo', 'gw' => 1, 'pts' => [[25.971, -24.669], [26.25, -25.25], [28.05, -26.2], [32.58, -25.97]], 'to' => 'Gaborone → Tlokweng → Zeerust → Gauteng → Maputo', 'dash' => false],
        ['id' => 'RAM', 'name' => 'Ramatlabama / Pioneer Gate – Mahikeng – Durban', 'gw' => 2, 'pts' => [[25.667, -25.217], [25.64, -25.86], [28.05, -26.2], [31.02, -29.86]], 'to' => 'Lobatse → Ramatlabama → Mahikeng → Gauteng → Durban', 'dash' => false],
        ['id' => 'RMK', 'name' => 'Ramokgwebana – Bulawayo – Beira', 'gw' => 4, 'pts' => [[27.512, -21.174], [27.98, -20.5], [28.58, -20.15], [34.84, -19.83]], 'to' => 'Francistown → Ramokgwebana/Plumtree → Bulawayo → Beira', 'dash' => false],
        ['id' => 'MDR', 'name' => "Martin's Drift – Polokwane (Limpopo)", 'gw' => 5, 'pts' => [[27.489, -23.186], [27.95, -22.98], [29.45, -23.9], [28.05, -26.2]], 'to' => "Mahalapye/Machaneng → Martin's Drift → Polokwane → Gauteng", 'dash' => false],
    ];

    /* ------------------------------------------------------------------ registers and pack */

    public static function ready(): bool
    {
        return CountryHub::ready() && CountryHub::register('BW_Units') !== [];
    }

    public static function reg(string $name): array
    {
        return CountryHub::register($name);
    }

    /** A whole register with its headers in sheet order (prototype sheetTable). */
    public static function sheet(string $name, ?array $rows = null): array
    {
        return ['name' => $name, 'h' => IntelData::headers($name), 'rows' => array_values($rows ?? self::reg($name))];
    }

    public static function summary(): array
    {
        return CountryHub::summary();
    }

    /** Pack blocks (prototype doc()). */
    public static function doc(): array
    {
        return IntelData::docBlocks();
    }

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

    /** Heading whose text starts with $prefix and every block under it (prototype docSlice). */
    public static function slice(string $prefix, ?string $stopAt = null): array
    {
        $d = self::doc();
        $i = null;
        foreach ($d as $k => $b) {
            if (self::level($b) < 99 && str_starts_with((string) ($b['x'] ?? ''), $prefix)) {
                $i = $k;
                break;
            }
        }
        if ($i === null) {
            return [];
        }
        $lv = self::level($d[$i]);
        $out = [$d[$i]];
        for ($j = $i + 1; $j < count($d); $j++) {
            $l = self::level($d[$j]);
            if ($l <= $lv) {
                break;
            }
            if ($stopAt !== null && $l < 99 && str_starts_with((string) ($d[$j]['x'] ?? ''), $stopAt)) {
                break;
            }
            $out[] = $d[$j];
        }

        return $out;
    }

    /** The n-th table under a heading (prototype docTable). */
    public static function table(string $prefix, int $n = 0): ?array
    {
        $t = array_values(array_filter(self::slice($prefix), fn ($b) => ($b['t'] ?? '') === 'tbl'))[$n] ?? null;

        return $t['rows'] ?? null;
    }

    /** First paragraph with the given style under a heading. */
    public static function para(string $prefix, string $style): string
    {
        foreach (self::slice($prefix) as $b) {
            if (($b['s'] ?? '') === $style) {
                return (string) $b['x'];
            }
        }

        return '';
    }

    /* ------------------------------------------------------------------ facts */

    /** Fact ID => fact row (BW_Facts and BW_Macro, prototype facts()). */
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

    public static function mac(string $id): string
    {
        return (string) (self::facts()['BW-'.$id]['Value'] ?? '');
    }

    /** First percentage in a value (prototype firstPct). */
    public static function pct(string $s): string
    {
        return preg_match('/[+\-−]?\d+(?:\.\d+)?%/u', $s, $m) ? $m[0] : $s;
    }

    /** Fact detail for the evidence drawer: the fact, its re-verification and linked conflicts. */
    public static function factDetail(string $id): ?array
    {
        $f = self::facts()[$id] ?? null;
        if (! $f) {
            return null;
        }
        $short = str_replace('BW-', '', $id);
        $ver = collect(self::reg('BW_VerifyLog'))->firstWhere('Fact', $id);
        $conf = array_values(array_filter(self::reg('BW_Conflicts'), fn ($c) => str_contains($c['Source'].$c['Item'].$c['Value A'].$c['Value B'], $short)));

        return ['fact' => $f, 'verify' => $ver, 'conflicts' => $conf];
    }

    /* ------------------------------------------------------------------ embedded services */

    /**
     * Service cards for a rail or a brief call to action: the prototype's embedded service name,
     * delivery time and automation share, with the selling price from the app's Sprint record.
     */
    public static function services(array $codes): array
    {
        $emb = collect(CountryHub::meta('aiim_services') ?? [])->keyBy('code');
        $out = [];
        foreach ($codes as $code) {
            $e = $emb[$code] ?? null;
            if (! $e) {
                continue;
            }
            $s = IndustryData::sprint($code);
            $tiers = $s['tiers'] ?? [];
            $out[] = [
                'code' => $code, 'name' => (string) $e['name'], 'tier' => (string) ($e['et'] ?? ''), 'delivery' => (string) ($e['db'] ?? ''),
                'aai' => isset($e['a0']) && is_numeric($e['a0']) ? (int) round($e['a0'] * 100) : null,
                'inApp' => (bool) ($s['app'] ?? null), 'from' => $tiers ? min($tiers) : null, 'entry' => $s['entry'] ?? null,
            ];
        }

        return $out;
    }

    public static function service(string $code): ?array
    {
        return self::services([$code])[0] ?? null;
    }

    /* ------------------------------------------------------------------ geography */

    /** Resolve a unit key (GA, ga, bw-ga, gaborone) to its BW_Units code. */
    public static function unitCode(string $key): ?string
    {
        $k = strtoupper(preg_replace('/^bw-/i', '', $key));
        $units = collect(self::reg('BW_Units'));
        if ($units->firstWhere('Code', $k)) {
            return $k;
        }
        $slug = strtolower($key);
        $hit = $units->first(fn ($u) => strtolower(preg_replace('/[^a-z0-9]+/i', '-', $u['Unit'])) === $slug);

        return $hit['Code'] ?? null;
    }

    public static function unitUrl(string $code): string
    {
        return '/aiim/province/'.$code;
    }

    /** Gateway index for a "Nearest gateway" label. */
    private static function gwIndex(array $gws, ?string $label): int
    {
        foreach ($gws as $i => $g) {
            $short = explode(' (', (string) $g['Gateway (proxy)'])[0];
            if (str_starts_with((string) $label, $short)) {
                return $i;
            }
        }

        return -1;
    }

    private static function tierClass(mixed $t): string
    {
        $s = (string) $t;

        return str_starts_with($s, 'A+') ? 'A+' : (str_starts_with($s, 'A') ? 'A' : (str_starts_with($s, 'B') ? 'B' : 'C'));
    }

    private static function roundCoords(mixed $c): mixed
    {
        if (is_array($c)) {
            if (count($c) === 2 && is_numeric($c[0] ?? null) && is_numeric($c[1] ?? null)) {
                return [round((float) $c[0], 3), round((float) $c[1], 3)];
            }

            return array_map(fn ($x) => self::roundCoords($x), $c);
        }

        return $c;
    }

    private static function features(array $list, array $keep = ['name']): array
    {
        return array_map(fn ($f) => [
            'p' => array_intersect_key($f['properties'] ?? [], array_flip($keep)),
            'g' => ['type' => $f['geometry']['type'], 'coordinates' => self::roundCoords($f['geometry']['coordinates'])],
        ], array_values($list));
    }

    /**
     * Botswana map payload shared by the cockpit heatmap, Map View, unit, town and sector maps
     * (prototype mapData + bwMap layers). $full adds roads, rail, rivers, lakes and airports.
     */
    public static function mapBase(bool $full = true): array
    {
        return $full ? self::mapFull() : self::mapLite();
    }

    /**
     * Map payload for a page: the geometry layers travel as one JSON string (the client parses it),
     * which keeps the response fast for the thousands of coordinate pairs.
     */
    public static function mapPayload(bool $full = true): array
    {
        $m = self::mapBase($full);
        $g = array_intersect_key($m, array_flip(['districts', 'countries', 'roads', 'rail', 'rivers', 'lakes']));

        return array_diff_key($m, $g) + ['geo' => json_encode($g)];
    }

    private static function mapFull(): array
    {
        return once(fn () => self::buildMap(true));
    }

    private static function mapLite(): array
    {
        return once(fn () => self::buildMap(false));
    }

    private static function buildMap(bool $full): array
    {
        $geo = CountryHub::meta('geo_bw') ?? [];
        $units = self::reg('BW_Units');
        $towns = self::reg('BW_Towns');
        $gws = array_values(self::reg('BW_Gateways'));
        $hl = self::reg('BW_Hotspot_Leads');
        $hlBy = collect($hl)->groupBy('Hotspot');
        $townIdx = array_flip(array_column($towns, 'ID'));
        $rlBy = collect(self::reg('BW_Ranked_Leads'))->groupBy('Place ID');
        $covBy = collect(self::reg('BW_Coverage'))->countBy('Place ID');

        $hot = [];
        foreach (array_values(self::reg('BW_Hotspots')) as $i => $h) {
            $t = isset($townIdx[$h['Place ID']]) ? $towns[$townIdx[$h['Place ID']]] : null;
            $leads = $hlBy[$h['Hotspot']] ?? collect();
            $tiers = $leads->pluck('Tier')->map(fn ($x) => (string) $x);
            $hot[] = [
                'i' => $i, 'name' => $h['Hotspot'], 'place' => $h['Place'], 'placeId' => $h['Place ID'], 'unit' => $h['Unit code'], 'fact' => $h['Fact'],
                'status' => $h['Status'], 'match' => $h['Match'], 'lat' => $t['Lat'] ?? null, 'lon' => $t['Lon'] ?? null,
                'leads' => $leads->count(), 'best' => (int) $leads->max('Lead score'),
                'aplus' => $tiers->contains(fn ($x) => str_starts_with($x, 'A+')), 'tierA' => $tiers->contains(fn ($x) => str_starts_with($x, 'A')),
            ];
        }

        $base = [
            'districts' => self::features($geo['districts'] ?? []),
            'countries' => self::features($geo['countries'] ?? [], ['name', 'a3']),
            'units' => array_map(fn ($u) => [
                'code' => $u['Code'], 'name' => $u['Unit'], 'kind' => $u['Kind'], 'pop' => (int) $u['Population (Census 2022)'], 'lat' => $u['Lat'], 'lon' => $u['Lon'],
                'templates' => (int) $u['Templates'], 'tierA' => (int) $u['Tier A'], 'envW' => (float) $u['Envelope US$ m (weighted)'], 'envE' => (float) $u['Envelope US$ m (equal)'], 'places' => (int) $u['Places'],
            ], $units),
            'towns' => array_map(fn ($t) => [
                'id' => $t['ID'], 'name' => $t['Place'], 'unit' => $t['Unit code'], 'unitName' => $t['Unit'], 'kind' => $t['Kind'], 'lat' => $t['Lat'], 'lon' => $t['Lon'],
                'pop' => (int) $t['Population used'], 'gw' => self::gwIndex($gws, $t['Nearest gateway']), 'km' => $t['Gateway km'],
                'rl' => count($rlBy[$t['ID']] ?? []), 'cov' => (int) ($covBy[$t['ID']] ?? 0),
            ], $towns),
            'gateways' => array_map(fn ($g, $i) => ['i' => $i, 'name' => $g['Gateway (proxy)'], 'short' => explode(' (', (string) $g['Gateway (proxy)'])[0], 'lat' => $g['Lat'], 'lon' => $g['Lon'], 'places' => (int) $g['Places nearest']], $gws, array_keys($gws)),
            'hotspots' => $hot,
            'corridors' => self::CORRIDORS,
        ];
        if ($full) {
            $base += [
                'roads' => self::features(array_filter($geo['roads'] ?? [], fn ($r) => preg_match('/Major|Primary|Secondary|Road/i', (string) ($r['properties']['type'] ?? ''))), ['type']),
                'rail' => self::features($geo['rail'] ?? [], []),
                'rivers' => self::features($geo['rivers'] ?? []),
                'lakes' => self::features($geo['lakes'] ?? []),
                'airports' => array_map(fn ($a) => ['name' => $a['properties']['name'] ?? '', 'iata' => $a['properties']['iata_code'] ?? '', 'lon' => $a['geometry']['coordinates'][0], 'lat' => $a['geometry']['coordinates'][1]], $geo['airports'] ?? []),
            ];
        }

        return $base;
    }

    /**
     * Filterable lead data for the Map View: ranked leads as [town, unit, sector, tier, persona, citizen]
     * and coverage rows aggregated as [town, sector, tier, count]. Indexes refer to mapBase towns,
     * units and the SECTORS order; tiers are A+, A, B, C.
     */
    public static function mapFilters(): array
    {
        $towns = array_column(self::reg('BW_Towns'), 'ID');
        $ti = array_flip($towns);
        $ui = array_flip(array_column(self::reg('BW_Units'), 'Code'));
        $si = array_flip(array_keys(self::SECTORS));
        $personas = ['SME', 'DFI', 'CORP', 'INF', 'TRD', 'DIA'];
        $pi = array_flip($personas);
        $rl = [];
        foreach (self::reg('BW_Ranked_Leads') as $r) {
            $rl[] = [$ti[$r['Place ID']] ?? -1, $ui[$r['Unit code']] ?? -1, $si[$r['Sector']] ?? -1, self::tierClass($r['Tier']), $pi[$r['Persona']] ?? -1, str_starts_with((string) $r['Citizen-reserved'], 'Y') ? 1 : 0];
        }
        $agg = [];
        foreach (self::reg('BW_Coverage') as $r) {
            $k = ($ti[$r['Place ID']] ?? -1).'|'.($si[$r['Sector']] ?? -1).'|'.self::tierClass($r['Tier']);
            $agg[$k] = ($agg[$k] ?? 0) + 1;
        }
        $cov = [];
        foreach ($agg as $k => $n) {
            [$t, $s, $tier] = explode('|', $k);
            $cov[] = [(int) $t, (int) $s, $tier, $n];
        }

        return ['rl' => $rl, 'cov' => $cov, 'personas' => $personas];
    }

    /** Coverage rows per sector at each unit or town (prototype townSectorMix). */
    public static function sectorMix(array $rows): array
    {
        $c = collect($rows)->countBy('Sector');
        $out = [];
        foreach (self::SECTORS as $code => [$name, $col]) {
            if ($c[$code] ?? 0) {
                $out[] = ['code' => $code, 'name' => $name, 'color' => $col, 'n' => $c[$code]];
            }
        }
        usort($out, fn ($a, $b) => $b['n'] <=> $a['n']);

        return $out;
    }

    /** Unit card (prototype unitCard). */
    public static function unitCard(string $code): ?array
    {
        $u = collect(self::reg('BW_Units'))->firstWhere('Code', $code);
        if (! $u) {
            return null;
        }
        $popTot = array_sum(array_column(self::reg('BW_Units'), 'Population (Census 2022)'));
        $rl = array_filter(self::reg('BW_Ranked_Leads'), fn ($r) => $r['Unit code'] === $code);
        $cov = array_filter(self::reg('BW_Coverage'), fn ($r) => $r['Unit code'] === $code);
        $hot = array_values(array_filter(self::mapBase(false)['hotspots'], fn ($h) => $h['unit'] === $code));

        return [
            'code' => $code, 'name' => $u['Unit'], 'kind' => $u['Kind'], 'wikidata' => $u['Wikidata'], 'pop' => (int) $u['Population (Census 2022)'],
            'popShare' => $popTot ? round(100 * $u['Population (Census 2022)'] / $popTot, 1) : 0, 'envW' => (float) $u['Envelope US$ m (weighted)'], 'envE' => (float) $u['Envelope US$ m (equal)'],
            'templates' => (int) $u['Templates'], 'tierA' => (int) $u['Tier A'], 'places' => (int) $u['Places'], 'tags' => array_map('trim', explode(',', (string) $u['Tags'])),
            'ranked' => count($rl), 'hotLeads' => array_sum(array_column($hot, 'leads')), 'coverage' => count($cov), 'mix' => self::sectorMix($cov), 'hotspots' => $hot,
        ];
    }

    /** Town card (prototype townCard). */
    public static function townCard(string $id): ?array
    {
        $t = collect(self::reg('BW_Towns'))->firstWhere('ID', $id);
        if (! $t) {
            return null;
        }
        $rl = array_values(array_filter(self::reg('BW_Ranked_Leads'), fn ($r) => $r['Place ID'] === $id));
        $cov = array_values(array_filter(self::reg('BW_Coverage'), fn ($r) => $r['Place ID'] === $id));
        $top = $rl;
        usort($top, fn ($a, $b) => $b['Lead score'] <=> $a['Lead score']);
        $gws = array_values(self::reg('BW_Gateways'));
        $gi = self::gwIndex($gws, $t['Nearest gateway']);
        $hot = array_values(array_filter(self::mapBase(false)['hotspots'], fn ($h) => $h['placeId'] === $id));

        return [
            'id' => $id, 'name' => $t['Place'], 'unit' => $t['Unit code'], 'unitName' => $t['Unit'], 'kind' => $t['Kind'], 'pop' => (int) $t['Population used'],
            'datasetPop' => (int) $t['Dataset population'], 'gateway' => $t['Nearest gateway'], 'gw' => $gi, 'gwShort' => $gi >= 0 ? explode(' (', (string) $gws[$gi]['Gateway (proxy)'])[0] : null,
            'km' => $t['Gateway km'], 'ranked' => count($rl), 'rankedA' => count(array_filter($rl, fn ($r) => str_starts_with((string) $r['Tier'], 'A'))),
            'coverage' => count($cov), 'mix' => self::sectorMix($cov), 'hotspots' => $hot,
            'top' => array_map(fn ($r) => array_intersect_key($r, array_flip(['Lead ID', 'Template', 'Opportunity', 'Rank', 'Persona', 'Time to revenue', 'Tier', 'Lead score'])), array_slice($top, 0, 8)),
        ];
    }
}
