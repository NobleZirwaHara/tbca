<?php

namespace App\Support\Aiim;

use App\Support\CountryHub\CountryHub;
use App\Support\Industries\IndustryData;

/**
 * Data shaping for the account, workspace and commerce pages of the "TBCA AIIM Botswana"
 * prototype (mock-ups 19 to 33 and 77): the 18 Botswana sectors, the investor personas,
 * the embedded services with app prices, and the Botswana opportunity templates.
 *
 * Service prices come only from the app's Sprint records matched by code (ZAR, VAT-exclusive).
 */
class ProtoAccount
{
    /** Prototype SECTORS: code => [name, colour]. */
    public const SECTORS = [
        'ENR' => ['Energy & Power', '#d6a32e'], 'OGS' => ['Fuels, Strategic Reserves & Coal-bed Methane', '#8a5a2b'], 'MIN' => ['Diamonds, Copper & Mining', '#4f8fca'],
        'AGR' => ['Livestock, Beef & Horticulture', '#5b8c3a'], 'BLU' => ['Fisheries & Aquaculture', '#2a9d9a'], 'FOR' => ['Forestry & Veld Products', '#2f6b3d'],
        'MFG' => ['Manufacturing, SEZs & Beneficiation', '#7a4fa3'], 'WSW' => ['Water, Sanitation & Waste', '#2f7fc1'], 'TRN' => ['Transport, Corridors & Logistics', '#c96a12'],
        'ICT' => ['Digital, Mobile Money & 5G', '#3b5bdb'], 'CRE' => ['Construction, Roads & Housing', '#8c6d46'], 'TOU' => ['Tourism (Okavango, Chobe, Kalahari)', '#d9822b'],
        'HLT' => ['Health & Pharmaceuticals', '#c0392b'], 'EDU' => ['Education & Skills', '#6a4c93'], 'FIN' => ['Finance, Pensions & Fintech', '#1f7a4c'],
        'TRD' => ['Trade, Retail & Citizen Markets', '#b5476b'], 'GRN' => ['Green Economy & Climate Finance', '#3f9c5a'], 'CSP' => ['Creative, Sport & Professional Services', '#9b5de5'],
    ];

    /** Prototype PERSONAS. */
    public const PERSONAS = [
        'SME' => 'Local SME / first-time investor', 'DFI' => 'DFI / impact investor', 'CORP' => 'Strategic corporate',
        'INF' => 'Infrastructure / institutional fund', 'TRD' => 'Trader / distributor', 'DIA' => 'Diaspora',
    ];

    /** Fee schedule by journey (prototype aiimJourney): title, first and last AAB-EMB number. */
    public const JOURNEY = [
        ['Map & entry', 82, 95], ['Country intelligence', 96, 113], ['Sector intelligence', 114, 125], ['Trade & HS', 126, 137],
        ['Opportunities & projects', 138, 151], ['Risk & screening', 152, 161], ['Corridors & GIS', 162, 171], ['Monitoring & alerts', 172, 180],
        ['AI agents', 181, 191], ['Briefs & reports', 192, 203], ['Advisory & transactions', 204, 217], ['Platform, data & desks', 218, 227],
        ['Commerce & engagement', 228, 237], ['Channels & support', 238, 243],
    ];

    /** Fields of the comparison results table (prototype compare-results F). */
    public const COMPARE_FIELDS = ['Sector', 'Band', 'Score', 'RA', 'Tier', 'Downturn tier', 'E', 'D', 'P*', 'R', 'Citizen-reserved', 'FX earner', 'Persona', 'Time to revenue', 'Evidence', 'Fact date', 'Policy', 'Eligible places', 'Institution to call'];

    public const UNLOCK_SERVICE = 'AAB-EMB-139';

    public static function sectorName(?string $code): string
    {
        return self::SECTORS[$code ?? ''][0] ?? (string) $code;
    }

    /** @return list<array{code: string, name: string, color: string}> */
    public static function sectors(): array
    {
        return array_map(fn ($c, $s) => ['code' => $c, 'name' => $s[0], 'color' => $s[1]], array_keys(self::SECTORS), self::SECTORS);
    }

    /* ------------------------------------------------------------------ embedded services */

    /** The 581 embedded services keyed by code. */
    public static function services(): array
    {
        return once(fn () => collect(CountryHub::meta('aiim_services') ?? [])->keyBy('code')->all());
    }

    /** One service with its app price (ZAR, VAT-exclusive) or null when the app does not sell it yet. */
    public static function service(string $code): ?array
    {
        $e = self::services()[$code] ?? null;
        if (! $e) {
            return null;
        }
        $s = IndustryData::sprint($code);
        $price = $s && $s['app'] !== null && ($s['ep'] ?? 0) > 0 ? (int) $s['ep'] : null;

        return [
            'code' => $code,
            'name' => (string) $e['name'],
            'cat' => $e['cat'] ?? null,
            'tier' => $s['entry'] ?? ($e['et'] ?? null),
            'delivery' => $e['db'] ?? null,
            'aai' => isset($e['a0']) && is_numeric($e['a0']) ? (int) round($e['a0'] * 100) : null,
            'price' => $price,
            'saleable' => ! str_starts_with((string) ($e['sale'] ?? ''), 'NO'),
        ];
    }

    /** @return list<array> services for a side rail, unknown codes dropped */
    public static function rail(array $codes, int $max = 6): array
    {
        return array_values(array_slice(array_filter(array_map(fn ($c) => self::service($c), $codes)), 0, $max));
    }

    /** Fee schedule by journey: 14 groups of AIIM services, first five of each. */
    public static function journey(): array
    {
        $aiim = collect(self::services())->filter(fn ($s) => ($s['cat'] ?? '') === 'AIIM');
        $n = fn ($code) => (int) substr((string) $code, 8);

        return array_map(function ($g) use ($aiim, $n) {
            $list = $aiim->filter(fn ($s) => $n($s['code']) >= $g[1] && $n($s['code']) <= $g[2])->values();

            return ['title' => $g[0], 'count' => $list->count(), 'items' => $list->take(5)->map(fn ($s) => self::service($s['code']))->filter()->values()->all()];
        }, self::JOURNEY);
    }

    /** AIIM entry prices: number of AIIM services at each app entry price. */
    public static function entryPrices(): array
    {
        $prices = collect(self::services())->filter(fn ($s) => ($s['cat'] ?? '') === 'AIIM')->map(fn ($s) => self::service($s['code'])['price'] ?? null);
        $missing = $prices->filter(fn ($p) => $p === null)->count();

        return [
            'rows' => $prices->filter()->countBy()->sortDesc()->take(8)->map(fn ($n, $p) => ['price' => (int) $p, 'count' => $n])->values()->all(),
            'total' => $prices->count(),
            'missing' => $missing,
        ];
    }

    /* ------------------------------------------------------------------ Botswana templates */

    /** One template: the BW_Sweep row merged with its BW_Priority row (prototype compare-results). */
    public static function template(string $id): ?array
    {
        $sweep = collect(CountryHub::register('BW_Sweep'))->firstWhere('Opp ID', $id);
        $priority = collect(CountryHub::register('BW_Priority'))->firstWhere('Opp ID', $id);
        if (! $sweep && ! $priority) {
            return null;
        }

        return array_merge($sweep ?? [], $priority ?? []);
    }

    public static function isTemplate(string $id): bool
    {
        return (bool) preg_match('/^BW-[A-Z]{3}-[SA]\d{2}$/', $id) && self::template($id) !== null;
    }

    /** Compact template row for lists. */
    public static function templateRow(array $o): array
    {
        return ['id' => (string) $o['Opp ID'], 'name' => (string) $o['Opportunity'], 'sector' => (string) ($o['Sector'] ?? ''), 'sectorName' => self::sectorName($o['Sector'] ?? null), 'tier' => (string) ($o['Tier'] ?? ''), 'band' => (string) ($o['Band'] ?? '')];
    }

    /** Search the 321 templates (prototype compare "Add templates", first 40 matches). */
    public static function searchTemplates(string $q, int $limit = 40): array
    {
        $q = mb_strtolower(trim($q));

        return collect(CountryHub::register('BW_Sweep'))
            ->filter(fn ($o) => $q === '' || str_contains(mb_strtolower($o['Opp ID'].$o['Opportunity'].$o['Sector']), $q))
            ->take($limit)->map(fn ($o) => self::templateRow($o))->values()->all();
    }

    /** Top 30 Tier A+ (BW_Top30). */
    public static function top30(): array
    {
        return array_map(fn ($r) => ['id' => (string) $r['Opp ID'], 'name' => (string) $r['Opportunity'], 'tier' => (string) $r['Tier'], 'place' => (string) ($r['Best place'] ?? '')], CountryHub::register('BW_Top30'));
    }

    /** Changes that affect Botswana templates (BW_RegChange), all columns. */
    public static function regChange(): array
    {
        $rows = CountryHub::register('BW_RegChange');

        return ['cols' => array_keys($rows[0] ?? []), 'rows' => $rows];
    }

    /** App page for an opportunity template. */
    public static function oppUrl(string $id): string
    {
        return '/aiim/opportunities/'.$id;
    }
}
