<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\CountryState;
use App\Support\Industries\ServerTable;
use Illuminate\Http\Request;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Intelligence (AIIM) part 1 (prototype pages-intel.js, first half): Economy & Macro, 18 Sectors and
 * the sector pages, Opportunities and the opportunity page, Geography & Places with the Botswana map,
 * the unit and place profiles, and Ranked Leads. Botswana carries the BW-1.0 data set; other countries
 * follow the prototype's non-BW branches (benchmark card where one exists, otherwise the pack panel).
 */
class IntelController extends Controller
{
    /** Countries with a column in BW_Benchmark (prototype BENCHCOL). */
    public const BENCHCOL = ['MWI' => 'Malawi', 'GHA' => 'Ghana', 'NGA' => 'Nigeria', 'EGY' => 'Egypt', 'MAR' => 'Morocco', 'ZAF' => 'South Africa', 'DZA' => 'Algeria', 'BWA' => 'Botswana'];

    /** Prototype bwOnly(): heading, pack panel and the intelligence shelf. */
    private function bwOnly(array $c, string $key, string $title, string $desc, array $extra = []): Response
    {
        return $this->countryPage($c, 'Intel/BwOnly', ['pageKey' => $key, 'title' => $title, 'desc' => $desc, 'shelf' => CountryHub::shelf(['intelligence'], 4)] + $extra);
    }

    /** Keep only the given columns of each row. */
    private static function pick(array $rows, array $keys): array
    {
        $flip = array_flip($keys);

        return array_values(array_map(fn ($r) => array_intersect_key($r, $flip), $rows));
    }

    private static function where(string $reg, string $key, string $val): array
    {
        return array_values(array_filter(CountryHub::register($reg), fn ($r) => (string) ($r[$key] ?? '') === $val));
    }

    /** Country pack blocks from a heading matching $start to the next heading matching $end (prototype docSection). */
    private static function docSection(string $start, string $end): array
    {
        $bl = CountryHub::meta('pack_doc') ?? [];
        $isH = fn ($b) => ($b['t'] ?? '') === 'p' && str_contains((string) ($b['s'] ?? ''), 'Heading');
        $i = null;
        foreach ($bl as $k => $b) {
            if ($isH($b) && preg_match($start, (string) $b['x'])) {
                $i = $k;
                break;
            }
        }
        if ($i === null) {
            return [];
        }
        $j = count($bl);
        foreach ($bl as $k => $b) {
            if ($k > $i && $isH($b) && preg_match($end, (string) $b['x'])) {
                $j = $k;
                break;
            }
        }

        return array_slice($bl, $i, $j - $i);
    }

    /* ------------------------------------------------------------------ economy | sectors | opps | geo | leads */

    public function page(Request $request, string $country, string $page): Response|StreamedResponse
    {
        $c = $this->country($country);

        return match ($page) {
            'economy' => $this->economy($c),
            'sectors' => $this->sectors($c),
            'opps' => $this->opps($c, $request),
            'geo' => $this->geo($c, $request),
            'leads' => $this->leads($c, $request),
            default => abort(404),
        };
    }

    private function economy(array $c): Response
    {
        if (! CountryHub::isBW($c)) {
            $col = self::BENCHCOL[$c['iso3']] ?? null;

            return $this->countryPage($c, 'Intel/Economy', [
                'bw' => false,
                'bench' => $col ? array_map(fn ($r) => [(string) $r['Metric'], (string) ($r[$col] ?? '')], CountryHub::register('BW_Benchmark')) : null,
            ]);
        }

        return $this->countryPage($c, 'Intel/Economy', [
            'bw' => true,
            'macro' => CountryHub::register('BW_Macro'),
            'fxScen' => CountryHub::register('BW_FX'),
            'benchmark' => CountryHub::register('BW_Benchmark'),
            'freshness' => CountryHub::register('BW_Freshness'),
            'doc' => array_slice(self::docSection('/^A-2 Macro/', '/^PART B/'), 0, 12),
            'shelf' => CountryHub::shelf(['intelligence', 'investment'], 4),
        ]);
    }

    private function sectors(array $c): Response
    {
        if (! CountryHub::isBW($c)) {
            return $this->bwOnly($c, 'sectors', '18 Sectors', 'Sector briefs with facts, chains, permits and opportunities.');
        }
        $count = fn (string $reg) => array_count_values(array_map(fn ($r) => (string) $r['Sector'], CountryHub::register($reg)));
        $facts = $count('BW_Facts');
        $sweep = $count('BW_Sweep');
        $tierA = array_count_values(array_map(fn ($r) => (string) $r['Sector'], array_filter(CountryHub::register('BW_Priority'), fn ($r) => str_contains((string) $r['Tier'], 'A'))));
        $shocks = CountryHub::register('BW_Shocks');
        $sh = array_column($shocks, null, 'Sector');
        $cards = [];
        foreach (CountryHub::SECT as $k => $n) {
            $cards[] = ['code' => $k, 'name' => $n, 'facts' => $facts[$k] ?? 0, 'templates' => $sweep[$k] ?? 0, 'tierA' => $tierA[$k] ?? 0,
                'index' => $sh[$k]['Index'] ?? null, 'rationale' => (string) ($sh[$k]['Rationale'] ?? '')];
        }

        return $this->countryPage($c, 'Intel/Sectors', [
            'cards' => $cards,
            'shocks' => $shocks,
            'shelf' => CountryHub::shelf(['intelligence'], 4, 'Sector briefs and research Sprints'),
        ]);
    }

    public const OPP_TABS = ['top30' => 'Top 30', 'priority' => 'All 321 (priority)', 'register' => 'Register (610)', 'persona' => 'By persona', 'downturn' => 'Downturn re-tiering'];

    private function opps(array $c, Request $request): Response|StreamedResponse
    {
        if (! CountryHub::isBW($c)) {
            return $this->bwOnly($c, 'opps', 'Opportunities', 'Ranked, gated and persona-filtered opportunities.');
        }
        $tab = (string) $request->query('tab', 'top30');
        $tab = isset(self::OPP_TABS[$tab]) ? $tab : 'top30';
        $s = CountryHub::summary();
        $data = match ($tab) {
            'top30' => CountryHub::register('BW_Top30'),
            'priority' => self::pick(CountryHub::register('BW_Priority'), ['Rank', 'Opp ID', 'Sector', 'Opportunity', 'Band', 'Score', 'RA', 'Tier pre-gate', 'Tier', 'Gate reason', 'Robust', 'Persona', 'Citizen-reserved', 'FX earner']),
            'register' => null,
            'persona' => collect(CountryHub::register('BW_Priority'))->groupBy(fn ($r) => (string) $r['Persona'])
                ->map(fn ($l, $p) => ['persona' => $p, 'n' => $l->count(), 'rows' => self::pick($l->take(5)->all(), ['Opp ID', 'Opportunity', 'Band', 'Tier', 'Time to revenue'])])->values()->all(),
            'downturn' => CountryHub::register('BW_Downturn'),
        };

        $table = null;
        if ($tab === 'register') {
            // 610 entries: paged on the server like the other large registers.
            $keys = ['Opp ID', 'Sector name', 'Opportunity', 'Evidence trigger', 'Placement', 'Model', 'Band', 'Tier', 'Type', 'Verification owner'];
            $rows = self::pick(CountryHub::register('BW_Opportunities'), $keys);
            if ($request->query('csv')) {
                return ServerTable::csv('BW_Opportunities', $rows, $request, $keys, $keys, array_combine($keys, $keys));
            }
            $table = ServerTable::make($rows, $request, $keys, ['Sector name', 'Model', 'Type'], $keys);
        }

        return $this->countryPage($c, 'Intel/Opps', [
            'tab' => $tab,
            'table' => $table,
            'tabs' => self::OPP_TABS,
            'kpi' => ['templates' => $s['Sweep templates'] ?? null, 'sShare' => $s['S-band share %'] ?? null, 'aPlus' => $s['Tier A+'] ?? null, 'a' => $s['Tier A'] ?? null, 'b' => $s['Tier B'] ?? null, 'c' => $s['Tier C'] ?? null,
                'robust' => $s['Robust Tier A'] ?? null, 'fx' => $s['FX-earning templates'] ?? null, 'citizen' => $s['Citizen-reserved templates'] ?? null],
            'data' => $data,
            'shelf' => CountryHub::shelf(['investment', 'intelligence'], 4, 'Turn an opportunity into a plan'),
        ]);
    }

    private function geoMaps(): array
    {
        $g = CountryHub::meta('geo_bw') ?? [];

        return array_intersect_key($g, array_flip(['districts', 'countries', 'roads', 'rail', 'rivers', 'lakes'])) + ['districts' => []];
    }

    private function geo(array $c, Request $request): Response
    {
        if (! CountryHub::isBW($c)) {
            return $this->bwOnly($c, 'geo', 'Geography & Places', 'Units, towns, gateways and hotspots.');
        }
        $metric = in_array($request->query('metric'), ['pop', 'env', 'tierA'], true) ? (string) $request->query('metric') : 'pop';

        return $this->countryPage($c, 'Intel/Geo', [
            'metric' => $metric,
            'geo' => $this->geoMaps(),
            'units' => CountryHub::register('BW_Units'),
            'towns' => CountryHub::register('BW_Towns'),
            'gateways' => CountryHub::register('BW_Gateways'),
            'hotspots' => CountryHub::register('BW_Hotspots'),
            'shelf' => CountryHub::shelf(['market-entry'], 4, 'Plan where to land'),
        ]);
    }

    public const LEAD_TABS = ['ranked' => 'Ranked leads (2,137)', 'hotspot' => 'Hotspot leads (126)', 'coverage' => 'Coverage (10,346)', 'envelopes' => 'Envelopes (16)'];

    /** Server-table setup for the two large lead registers: register, search keys, filters, sort key per column, CSV columns. */
    private const LEAD_TABLES = [
        'ranked' => ['BW_Ranked_Leads', ['Lead ID', 'Template', 'Sector', 'Opportunity', 'Band', 'Persona', 'Place', 'Unit', 'Tier', 'Time to revenue'], ['Sector', 'Unit', 'Tier', 'Persona'],
            ['Lead ID', 'Template', 'Sector', 'Opportunity', 'Band', 'Persona', 'Citizen-reserved', 'Rank', 'Place', 'Unit', 'Gateway km', 'RA', 'M', 'H', 'F', 'G', 'Lead score', 'Tier', 'Time to revenue', 'Population']],
        'coverage' => ['BW_Coverage', ['Row', 'Template', 'Sector', 'Opportunity', 'Band', 'Place', 'Unit', 'Tier'], ['Sector', 'Unit', 'Tier', 'Band'],
            ['Row', 'Template', 'Sector', 'Opportunity', 'Band', 'Place', 'Unit', 'Gateway km', 'Lead score', 'Tier']],
    ];

    private function leads(array $c, Request $request): Response|StreamedResponse
    {
        if (! CountryHub::isBW($c)) {
            return $this->bwOnly($c, 'leads', 'Ranked Leads', 'Place-level leads.');
        }
        $tab = (string) $request->query('tab', 'ranked');
        $tab = isset(self::LEAD_TABS[$tab]) ? $tab : 'ranked';
        $props = ['tab' => $tab, 'tabs' => self::LEAD_TABS, 'table' => null, 'rows' => null, 'shelf' => CountryHub::shelf(['investment', 'market-entry'], 4)];
        if (isset(self::LEAD_TABLES[$tab])) {
            [$reg, $search, $filters, $sortKeys] = self::LEAD_TABLES[$tab];
            $keys = array_values(array_unique([...$sortKeys, 'Place ID']));
            $rows = self::pick(CountryHub::register($reg), $keys);
            if ($request->query('csv')) {
                return ServerTable::csv($reg, $rows, $request, $search, $sortKeys, array_combine($sortKeys, $sortKeys));
            }
            $props['table'] = ServerTable::make($rows, $request, $search, $filters, $sortKeys);
        } else {
            $props['rows'] = CountryHub::register($tab === 'hotspot' ? 'BW_Hotspot_Leads' : 'BW_Envelopes');
        }

        return $this->countryPage($c, 'Intel/Leads', $props);
    }

    /* ------------------------------------------------------------------ sector/{CODE} */

    public function sector(string $country, string $sector): Response
    {
        $c = $this->country($country);
        $k = strtoupper($sector);
        $n = CountryHub::SECT[$k] ?? null;
        abort_unless($n !== null, 404);
        if (! CountryHub::isBW($c)) {
            return $this->bwOnly($c, 'sectors', $n, '');
        }
        $pri = self::where('BW_Priority', 'Sector', $k);

        return $this->countryPage($c, 'Intel/Sector', [
            'code' => $k,
            'name' => $n,
            'sect' => CountryHub::SECT,
            'facts' => self::where('BW_Facts', 'Sector', $k),
            'shock' => collect(CountryHub::register('BW_Shocks'))->firstWhere('Sector', $k) ?? (object) [],
            'pri' => self::pick($pri, ['Rank', 'Opp ID', 'Opportunity', 'Band', 'Score', 'RA', 'Tier', 'Persona', 'Time to revenue']),
            'chains' => self::where('BW_Chains', 'Sector', $k),
            'mapStack' => self::where('BW_MapStack', 'Sector', $k),
            'permits' => self::where('BW_Permits', 'Sector', $k),
            'products' => self::where('BW_Products', 'Sector', $k),
            'unitEconomics' => self::where('BW_UnitEconomics', 'Sector', $k),
            'doc' => self::docSection('/^E\d+\. .*\('.$k.'\)/', '/^E\d+\. |^PART G/'),
            'shelf' => CountryHub::shelf(['intelligence', 'investment'], 4, 'Sector Sprints'),
        ]);
    }

    /* ------------------------------------------------------------------ opp/{ID} */

    public function opp(string $country, string $id): Response
    {
        $c = $this->country($country);
        $id = strtoupper($id);
        $sw = collect(CountryHub::register('BW_Sweep'))->firstWhere('Opp ID', $id) ?? [];
        $pr = collect(CountryHub::register('BW_Priority'))->firstWhere('Opp ID', $id) ?? [];
        if (! $sw && ! $pr) {
            return $this->countryPage($c, 'Intel/Opp', ['id' => $id, 'found' => false]);
        }
        $all = array_merge($sw, $pr);
        $ev = (string) (($sw['Evidence'] ?? '') ?: ($pr['Evidence'] ?? ''));
        $fact = collect(CountryHub::register('BW_Facts'))->firstWhere('Fact ID', $ev);
        $saved = CountryState::get('saved', []);

        return $this->countryPage($c, 'Intel/Opp', [
            'id' => $id,
            'found' => true,
            'all' => $all,
            'sectorName' => CountryHub::SECT[$all['Sector'] ?? ''] ?? ($all['Sector'] ?? ''),
            'trigger' => (string) ($sw['Trigger'] ?? ''),
            'fact' => $fact,
            'leads' => self::pick(self::where('BW_Ranked_Leads', 'Template', $id), ['Rank', 'Place ID', 'Place', 'Unit', 'Population', 'Nearest gateway', 'Gateway km', 'Lead score', 'Tier']),
            'hotspotLeads' => self::where('BW_Hotspot_Leads', 'Template', $id),
            'saved' => is_array($saved) && in_array($id, $saved, true),
            'savedList' => is_array($saved) ? array_values($saved) : [],
            'shelf' => CountryHub::shelf(['investment'], 4, 'Sprints to validate this opportunity'),
        ]);
    }

    /* ------------------------------------------------------------------ geo/unit/{CODE} and geo/town/{ID} */

    public function unit(string $country, string $unit): Response
    {
        $c = $this->country($country);
        $code = strtoupper($unit);
        $u = collect(CountryHub::register('BW_Units'))->firstWhere('Code', $code);
        abort_unless($u !== null, 404);
        $rl = self::where('BW_Ranked_Leads', 'Unit code', $code);
        $bySec = array_count_values(array_map(fn ($r) => (string) $r['Sector'], $rl));
        arsort($bySec);

        return $this->countryPage($c, 'Intel/Unit', [
            'u' => $u,
            'covCount' => count(self::where('BW_Coverage', 'Unit code', $code)),
            'bySec' => array_map(fn ($s, $n) => [CountryHub::SECT[$s] ?? $s, $n], array_keys($bySec), array_values($bySec)),
            'towns' => self::pick(self::where('BW_Towns', 'Unit code', $code), ['ID', 'Place', 'Kind', 'Population used', 'Nearest gateway', 'Gateway km']),
            'hotspotLeads' => self::pick(self::where('BW_Hotspot_Leads', 'Unit code', $code), ['Lead ID', 'Hotspot', 'Place', 'Opportunity', 'Tier', 'Next action', 'Institution to call', 'Due']),
            'leads' => self::pick($rl, ['Lead ID', 'Template', 'Opportunity', 'Place', 'Lead score', 'Tier', 'Persona', 'Time to revenue', 'Sector']),
        ]);
    }

    public function town(string $country, string $town): Response
    {
        $c = $this->country($country);
        $id = strtoupper($town);
        $t = collect(CountryHub::register('BW_Towns'))->firstWhere('ID', $id);
        if (! $t) {
            $u = collect(CountryHub::register('BW_Units'))->first(fn ($u) => 'U'.$u['Code'] === $id);
            abort_unless($u !== null, 404);
            $t = ['ID' => $id, 'Place' => $u['Unit'].' (council point)', 'Unit' => $u['Unit'], 'Unit code' => $u['Code'], 'Kind' => $u['Kind'], 'Lat' => $u['Lat'], 'Lon' => $u['Lon'], 'Population used' => $u['Population (Census 2022)']];
        }

        return $this->countryPage($c, 'Intel/Town', [
            't' => $t,
            'leads' => self::pick(self::where('BW_Ranked_Leads', 'Place ID', $id), ['Template', 'Opportunity', 'Sector', 'Rank', 'Lead score', 'Tier']),
            'coverage' => self::pick(self::where('BW_Coverage', 'Place ID', $id), ['Template', 'Opportunity', 'Sector', 'Band', 'Lead score', 'Tier']),
            'hotspots' => array_column(self::where('BW_Hotspots', 'Place ID', $id), 'Hotspot'),
        ]);
    }
}
