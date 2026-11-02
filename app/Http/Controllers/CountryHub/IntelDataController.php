<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\IntelData;
use App\Support\Industries\ServerTable;
use Illuminate\Http\Request;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Intelligence (AIIM), second part (prototype pages-intel.js from the Investment case to the end):
 * Investment Case, Risk & Outlook, Products & HS Codes, Investor & Trader Questions, Continental
 * Model, One-Stop Shop & Premium, Country Pack Reader and the Data Room with one page per register.
 * Botswana carries the BW-1.0 data; other countries get the prototype's bwOnly panel, except the
 * Continental Model and the register pages, which the prototype shows for every country.
 * Big registers are searched, filtered, sorted and paged on the server (ServerTable).
 */
class IntelDataController extends Controller
{
    /** Title and description of each page for the bwOnly branch (prototype bwOnly calls). */
    private const BW_ONLY = [
        'invest' => ['Investment Case', 'Unit economics, sensitivities, FX and precedents.'],
        'risk' => ['Risk & Outlook', 'Shocks, downturn, regulatory change and data gaps.'],
        'products' => ['Products & HS Codes', 'Product register with HS 2022 codes.'],
        'infotypes' => ['Investor & Trader Questions', 'Information types per asset and product.'],
        'onestop' => ['One-Stop Shop & Premium', 'Platform features and premium products.'],
        'pack' => ['Country Pack Reader', 'The full country pack document.'],
        'dataroom' => ['Data Room', 'Every register sheet.'],
    ];

    /** Continental Model tabs: key => [sheet, label] (prototype map). */
    public const CONTINENTAL = [
        'activation' => ['I2_Country_Activation', 'Country activation (54)'], 'assets' => ['I2_Asset_Register', 'Asset register (97)'],
        'layers' => ['I2_Map_Layers', 'Map layers (174)'], 'roles' => ['I2_Replication_Roles', 'Replication roles (30)'],
        'opps' => ['I2_Opportunity_Register', 'Opportunity register (744)'], 'ichain' => ['I2_Investor_Chain', 'Investor chain (SA model)'],
        'tchain' => ['I2_Trader_Chain', 'Trader chain (SA model)'], 'inv' => ['I2_Investor_InfoTypes', 'Investor info types (4,600)'],
        'trd' => ['I2_Trader_InfoTypes', 'Trader info types (3,523)'], 'wxf' => ['I2_WX_Facts', 'Worked-example facts (40)'],
        'wxc' => ['I2_WX_Chains', 'Worked-example chains (220)'], 'wxm' => ['I2_WX_MapStack', 'Worked-example map stack (92)'],
        'wxo' => ['I2_WX_Opportunities', 'Worked-example opportunities (190)'], 'src' => ['I2_Sources_WorkedExamples', 'Worked-example sources (19)'],
    ];

    /** Investor & Trader Questions tabs. */
    public const INFO_TABS = [['investor', 'Investor chain'], ['bwi', 'Investor info types (18,810)'], ['trader', 'Trader chain'], ['bwt', 'Trader info types (5,600)']];

    public function page(Request $request, string $country, string $page): Response|StreamedResponse
    {
        $c = $this->country($country);

        if ($page === 'continental') {
            return $this->continental($request, $c);
        }
        if (! CountryHub::isBW($c)) {
            [$title, $desc] = self::BW_ONLY[$page];

            return $this->countryPage($c, 'IntelData/'.ucfirst($page), ['bwOnly' => ['title' => $title, 'desc' => $desc], 'shelf' => CountryHub::shelf(['intelligence'], 4)]);
        }

        return match ($page) {
            'invest' => $this->invest($c),
            'risk' => $this->risk($c),
            'products' => $this->products($c),
            'infotypes' => $this->infotypes($request, $c),
            'onestop' => $this->onestop($c),
            'pack' => $this->countryPage($c, 'IntelData/Pack', ['bwOnly' => null, 'blocks' => IntelData::docBlocks()]),
            'dataroom' => $this->dataroom($c),
            default => abort(404),
        };
    }

    /** One register of the Deep Registers workbook, every row, paged on the server. */
    public function sheet(Request $request, string $country, string $sheet): Response|StreamedResponse
    {
        $c = $this->country($country);
        $x = IntelData::sheet($sheet);
        abort_unless($x !== null, 404);
        $rows = CountryHub::register($sheet);
        $h = IntelData::headers($sheet);
        $filters = IntelData::lowcard($rows, $h, 30);
        if ($request->query('csv')) {
            return $this->csv($sheet, $rows, $request, $h);
        }

        return $this->countryPage($c, 'IntelData/Sheet', [
            'sheet' => $sheet, 'headers' => $h, 'rowCount' => count($rows), 'filters' => $filters,
            'table' => ServerTable::make($rows, $request, $h, $filters, $h, 20),
        ]);
    }

    /* ------------------------------------------------------------------ Investment case */
    private function invest(array $c): Response
    {
        $ue = CountryHub::register('BW_UnitEconomics');
        $packs = array_column($ue, 'Pack', 'ID');

        return $this->countryPage($c, 'IntelData/Invest', [
            'bwOnly' => null,
            'ue' => IntelData::pick($ue, ['ID', 'Pack', 'Sector', 'Band', 'Revenue driver', 'Anchor', 'Assumptions', 'Capex P m', 'Revenue P m', 'Margin', 'Pre-tax P m', 'After-tax P m', 'Payback yrs', 'Project IRR']),
            'tornado' => array_map(fn ($t) => $t + ['Pack' => $packs[$t['ID']] ?? ''], IntelData::pick(CountryHub::register('BW_Tornado'),
                ['ID', 'Base IRR', 'Price −20 %', 'Price +20 %', 'Volume −20 %', 'Volume +20 %', 'Capex +20 %', 'Capex −20 %', 'Biggest driver'])),
            'precedents' => CountryHub::register('BW_Precedents'),
            'scenarios' => CountryHub::register('BW_FX'),
            'method' => IntelData::docSection('/^H-1a Logic/u', '/^H-2 /u'),
            'shelf' => CountryHub::shelf(['investment'], 4, 'Investor-readiness Sprints'),
        ]);
    }

    /* ------------------------------------------------------------------ Risk & Outlook */
    private function risk(array $c): Response
    {
        $s = CountryHub::summary();
        $shocks = array_map(fn ($r) => [
            'label' => (string) $r['Sector name'], 'value' => is_numeric($r['Downturn index']) ? +$r['Downturn index'] : 0,
            'text' => $r['Downturn index'].' / '.$r['Index'],
        ], CountryHub::register('BW_Shocks'));
        usort($shocks, fn ($a, $b) => $b['value'] <=> $a['value']);
        $f24 = collect(CountryHub::register('BW_Macro'))->firstWhere('Fact ID', 'BW-MAC-F24') ?? [];

        return $this->countryPage($c, 'IntelData/Risk', [
            'bwOnly' => null,
            'downturn' => ['ap' => $s['Downturn: A+ base → downturn'] ?? null, 'down' => $s['Downturn: downgraded'] ?? null],
            'exposed' => $shocks,
            'downgraded' => IntelData::pick(array_values(array_filter(CountryHub::register('BW_Downturn'), fn ($r) => $r['Tier base'] !== $r['Tier downturn'])),
                ['Opp ID', 'Sector', 'Opportunity', 'Tier base', 'Tier downturn']),
            'regChange' => CountryHub::register('BW_RegChange'),
            'gaps' => IntelData::pick(array_slice(CountryHub::register('BW_DataGaps'), 0, 8), ['ID', 'Missing data', 'Priority']),
            'political' => array_intersect_key($f24, array_flip(['Fact ID', 'Value', 'Source', 'Date', 'Grade'])),
            'shelf' => CountryHub::shelf(['risk', 'regulatory'], 4),
        ]);
    }

    /* ------------------------------------------------------------------ Products & HS */
    private function products(array $c): Response
    {
        return $this->countryPage($c, 'IntelData/Products', [
            'bwOnly' => null,
            'products' => CountryHub::register('BW_Products'),
            'traderChain' => CountryHub::register('BW_Trader_Chain'),
            'commodities' => CountryHub::register('I2_Commodity_HS'),
            'shelf' => CountryHub::shelf(['trade'], 4),
        ]);
    }

    /* ------------------------------------------------------------------ Investor & trader info types */
    private function infotypes(Request $request, array $c): Response|StreamedResponse
    {
        $tab = in_array($request->query('tab'), array_column(self::INFO_TABS, 0), true) ? $request->query('tab') : 'investor';
        $props = ['bwOnly' => null, 'tab' => $tab, 'tabs' => self::INFO_TABS, 'chain' => null, 'table' => null, 'filters' => [], 'shelf' => CountryHub::shelf(['intelligence', 'trade'], 4)];
        if ($tab === 'investor' || $tab === 'trader') {
            $props['chain'] = CountryHub::register($tab === 'investor' ? 'BW_Investor_Chain' : 'BW_Trader_Chain');
        } else {
            $sheet = $tab === 'bwi' ? 'BW_Investor_InfoTypes' : 'BW_Trader_InfoTypes';
            $filters = $tab === 'bwi' ? ['Sector', 'Q', 'Tag'] : ['Group', 'Product', 'Q'];
            $rows = CountryHub::register($sheet);
            $h = IntelData::headers($sheet);
            if ($request->query('csv')) {
                return $this->csv($sheet, $rows, $request, $h);
            }
            $props['table'] = ServerTable::make($rows, $request, $h, $filters, $h, 15);
            $props['filters'] = $filters;
        }

        return $this->countryPage($c, 'IntelData/Infotypes', $props);
    }

    /* ------------------------------------------------------------------ Continental model (every country) */
    private function continental(Request $request, array $c): Response|StreamedResponse
    {
        $tab = array_key_exists((string) $request->query('tab'), self::CONTINENTAL) ? (string) $request->query('tab') : 'activation';
        [$sheet, $label] = self::CONTINENTAL[$tab];
        $rows = CountryHub::register($sheet);
        $h = IntelData::headers($sheet);
        $filters = IntelData::lowcard($rows, $h, 25);
        if ($request->query('csv')) {
            return $this->csv($sheet, $rows, $request, $h);
        }
        $act = null;
        if ($tab === 'activation') {
            $act = collect($rows)->mapWithKeys(fn ($r) => [(string) $r['ISO3'] => ['wave' => (string) ($r['Wave [PROPOSED]'] ?? ''), 'status' => (string) ($r['Pack status'] ?? '')]])->all();
        }

        return $this->countryPage($c, 'IntelData/Continental', [
            'tab' => $tab, 'tabs' => array_map(fn ($k, $v) => [$k, $v[1]], array_keys(self::CONTINENTAL), self::CONTINENTAL),
            'sheet' => $sheet, 'label' => $label, 'headers' => $h, 'filters' => $filters,
            'table' => ServerTable::make($rows, $request, $h, $filters, $h, 15),
            'activation' => $act,
            'map' => $act === null ? null : array_values(array_map(fn ($x) => ['iso3' => $x['iso3'], 'iso2' => $x['iso2'], 'slug' => $x['slug'], 'name' => $x['name'], 'region' => $x['region'], 'pack' => $x['pack']], CountryHub::countries())),
        ]);
    }

    /* ------------------------------------------------------------------ One-stop shop & premium */
    private function onestop(array $c): Response
    {
        return $this->countryPage($c, 'IntelData/Onestop', [
            'bwOnly' => null,
            'premium' => CountryHub::register('BW_Premium'),
            'features' => CountryHub::register('BW_OneStopShop'),
            'plan90' => CountryHub::register('BW_Plan90'),
            'rollout' => CountryHub::register('BW_Rollout'),
            'readme' => array_map(fn ($r) => (string) (array_values($r)[0] ?? ''), CountryHub::register('README')),
            'summary' => IntelData::pick(CountryHub::register('BW_Summary'), ['Measure', 'Value']),
        ]);
    }

    /* ------------------------------------------------------------------ Data Room */
    private function dataroom(array $c): Response
    {
        $idx = array_map(fn ($x) => ['sheet' => $x['sheet'], 'rows' => (int) $x['rows'], 'cols' => (int) $x['cols'], 'h' => array_map('strval', $x['h'] ?? [])], CountryHub::registerIndex());
        $cov = CountryHub::meta('coverage') ?? [];

        return $this->countryPage($c, 'IntelData/Dataroom', [
            'bwOnly' => null,
            'index' => $idx,
            'totalRows' => array_sum(array_column($idx, 'rows')),
            'coverage' => [
                'summary' => $cov['summary'] ?? null,
                'sheets' => array_map(fn ($s, $r) => ['s' => (string) $s, 'r' => (string) $r], array_keys($cov['sheets'] ?? []), $cov['sheets'] ?? []),
            ],
        ]);
    }

    /** CSV of the filtered register rows (the prototype table's export), all columns in sheet order. */
    private function csv(string $sheet, array $rows, Request $request, array $h): StreamedResponse
    {
        return ServerTable::csv($sheet, $rows, $request, $h, $h, array_combine($h, $h));
    }
}
