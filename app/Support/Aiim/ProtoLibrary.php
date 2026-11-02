<?php

namespace App\Support\Aiim;

use App\Models\Aiim\Country;
use App\Models\Aiim\Project;
use App\Models\Aiim\Source;
use App\Support\CountryHub\CountryHub;
use App\Support\Industries\IndustryData;

/**
 * Data for the Library and Premium store pages of the client's "TBCA AIIM Botswana" prototype:
 * the embedded 581-service catalogue priced from the app's Sprint records by code, the premium
 * briefs (BW_Premium), country pack slices, the coverage check and the page index.
 */
class ProtoLibrary
{
    /** Premium brief => embedded service that prices it (prototype PBSVC; others use AAB-EMB-193). */
    public const PBSVC = [
        'BW-PB-01' => 'AAB-EMB-150', 'BW-PB-02' => 'AAB-EMB-211', 'BW-PB-09' => 'AAB-EMB-194', 'BW-PB-10' => 'AAB-EMB-197',
        'BW-PB-11' => 'AAB-EMB-196', 'BW-PB-15' => 'AAB-EMB-210', 'BW-PB-16' => 'AAB-EMB-173', 'BW-PB-17' => 'AAB-EMB-196',
    ];

    /** Generic configuration key for a Botswana report that starts from no brief. */
    public const BW_REPORT = 'BW-REPORT';

    /** AIIM services by journey: [title, first, last] service number (prototype aiimJourney). */
    public const JOURNEY = [
        ['Map & entry', 82, 95], ['Country intelligence', 96, 113], ['Sector intelligence', 114, 125], ['Trade & HS', 126, 137],
        ['Opportunities & projects', 138, 151], ['Risk & screening', 152, 161], ['Corridors & GIS', 162, 171], ['Monitoring & alerts', 172, 180],
        ['AI agents', 181, 191], ['Briefs & reports', 192, 203], ['Advisory & transactions', 204, 217], ['Platform, data & desks', 218, 227],
        ['Commerce & engagement', 228, 237], ['Channels & support', 238, 243],
    ];

    /** Site sections that sell a service module (links to the rest of the site). */
    public const SECTION_LINKS = [
        'Due Diligence' => '/due-diligence', 'Virtual Deal Room' => '/virtual-deal-room', 'Project Advisory' => '/project-advisory',
        'Subscriptions' => '/subscriptions', 'Retainers' => '/retainers', 'Online Shop' => '/shop', 'Digital Products' => '/digital-products',
        'Partner Services' => '/partner-services', 'Toolkit Universe' => '/marketplace', 'Resources' => '/resources', 'Technology Solutions' => '/technology-solutions',
    ];

    /** Register sheet => pages that present it (prototype SHEETPAGES). */
    public const SHEETPAGES = [
        'BW_Summary' => 'Cockpit', 'BW_Validator' => 'Evidence', 'BW_Challenge' => 'Risk', 'BW_Benchmark' => 'Cockpit', 'BW_Macro' => 'Cockpit, Risk', 'BW_Top30' => 'Opportunities, Landing',
        'BW_Priority' => 'Opportunities, Opportunity pages', 'BW_Units' => 'Units, Unit pages, Map', 'BW_Towns' => 'Town pages, Map', 'BW_Gateways' => 'Map, Corridors', 'BW_Hotspots' => 'Projects, Map',
        'BW_Institutions' => 'Units, Funders', 'BW_Products' => 'Commodity HS, Sectors', 'BW_Policy' => 'Funders, Opportunity pages', 'BW_Sweep' => 'Sectors, Opportunities', 'BW_Shocks' => 'Risk, Sectors, Cockpit',
        'BW_Downturn' => 'Risk', 'BW_Precedents' => 'Projects, Investors', 'BW_Hotspot_Leads' => 'Leads, Map, Projects', 'BW_Ranked_Leads' => 'Leads, Map, Towns', 'BW_Coverage' => 'Leads, Map, Towns',
        'BW_Envelopes' => 'Units, Funders', 'BW_Investor_InfoTypes' => 'Investor Info Type', 'BW_Trader_InfoTypes' => 'Trader Info Type, HS pages', 'BW_Opportunities' => 'Opportunities, Sectors',
        'BW_Investor_Chain' => 'Investor Info Type', 'BW_Trader_Chain' => 'Trader Info Type', 'BW_Chains' => 'Sectors, Info types', 'BW_MapStack' => 'Map, Sectors', 'BW_Facts' => 'Evidence, Sectors, fact drawer',
        'BW_Sources' => 'Evidence', 'BW_UnitEconomics' => 'Economics, Sectors', 'BW_Tornado' => 'Economics', 'BW_FX' => 'Risk, Economics', 'BW_Conflicts' => 'Risk, fact drawer',
        'BW_DataGaps' => 'Risk, Funders, Map alerts', 'BW_ClosedGaps' => 'Risk', 'BW_Freshness' => 'Risk', 'BW_RegChange' => 'Risk, Map alerts, Sectors', 'BW_VerifyLog' => 'Evidence, fact drawer',
        'BW_Permits' => 'Sectors', 'BW_OneStopShop' => 'One-Stop Shop', 'BW_Premium' => 'Premium store', 'BW_Plan90' => 'Admin dashboard', 'BW_CPDS' => 'Evidence', 'BW_Rollout' => 'Landing',
        'BW_EditionLog' => 'Admin dashboard', 'I2_Investor_Chain' => 'Investor Info Type', 'I2_Trader_Chain' => 'Trader Info Type', 'I2_Asset_Register' => 'Investor Info Type, Sectors',
        'I2_Investor_InfoTypes' => 'Investor Info Type', 'I2_Trader_InfoTypes' => 'Trader Info Type, HS pages', 'I2_Opportunity_Register' => 'Opportunities', 'I2_Commodity_HS' => 'Commodity HS',
        'I2_Map_Layers' => 'Map View', 'I2_Replication_Roles' => 'Admin dashboard', 'I2_Country_Activation' => 'Landing', 'I2_Sources_WorkedExamples' => 'Evidence', 'I2_WX_Facts' => 'Sectors',
        'I2_WX_Chains' => 'Sectors', 'I2_WX_MapStack' => 'Sectors', 'I2_WX_Opportunities' => 'Sectors', 'README' => 'Data Room',
    ];

    /* ------------------------------------------------------------------ embedded services */

    /** @return array<string, array> the 581 embedded services keyed by code, as the prototype carries them */
    public static function raw(): array
    {
        return once(fn () => collect(CountryHub::meta('aiim_services') ?? [])->keyBy('code')->all());
    }

    /**
     * One service with the app's selling prices. Prices come only from the app Sprint with the same
     * code; `status` says whether it is priced, in the app but not priced, missing or internal.
     */
    public static function service(string $code): ?array
    {
        $s = self::raw()[$code] ?? null;

        return $s ? self::shape($s) : null;
    }

    public static function shape(array $s): array
    {
        $sp = IndustryData::sprint($s['code']);
        $tiers = $sp['tiers'] ?? [];
        $internal = str_starts_with((string) $s['sale'], 'NO');
        $status = ! $sp || ! $sp['app'] ? 'missing' : ($tiers ? 'priced' : 'unpriced');
        $pct = fn ($v) => $v === null || $v === '' ? null : (int) round(((float) $v) * 100);

        return [
            'code' => $s['code'], 'name' => $s['name'], 'cat' => $s['cat'], 'sub' => $s['sub'], 'type' => $s['type'],
            'et' => $s['et'], 'db' => $s['db'], 'ds' => $s['ds'], 'dp' => $s['dp'],
            'a0' => $pct($s['a0']), 'a1' => $pct($s['a1']), 'a2' => $pct($s['a2']),
            'sale' => $s['sale'], 'internal' => $internal, 'auth' => $s['auth'], 'bref' => $s['bref'],
            'bench' => ['Basic' => $s['bmb'], 'Standard' => $s['bms'], 'Premium' => $s['bmp']],
            'prices' => (object) $tiers,
            'from' => $tiers ? min($tiers) : null,
            'entry' => $sp['entry'] ?? $s['et'],
            'ep' => $sp['ep'] ?? null,
            'status' => $status,
            'slug' => $sp['app']['slug'] ?? null,
        ];
    }

    /** Compact service card (prototype svcRail row). */
    public static function card(string $code): ?array
    {
        $s = self::service($code);

        return $s ? array_intersect_key($s, array_flip(['code', 'name', 'et', 'db', 'a0', 'from', 'entry', 'ep', 'status', 'internal'])) : null;
    }

    /** @param string[] $codes */
    public static function rail(array $codes): array
    {
        return array_values(array_filter(array_map(fn ($c) => self::card($c), $codes)));
    }

    /** Service number from its code (AAB-EMB-193 => 193). */
    public static function num(string $code): int
    {
        return (int) substr($code, 8);
    }

    /** AIIM report formats: services 192 to 203. */
    public static function reportFormats(): array
    {
        return array_values(array_map(fn ($s) => self::card($s['code']), array_filter(self::raw(), fn ($s) => $s['cat'] === 'AIIM' && self::num($s['code']) >= 192 && self::num($s['code']) <= 203)));
    }

    /* ------------------------------------------------------------------ premium briefs */

    public static function isBwBrief(string $code): bool
    {
        return (bool) preg_match('/^BW-PB-\d{2}$/', $code);
    }

    public static function premium(?string $code = null): ?array
    {
        $rows = CountryHub::register('BW_Premium');
        if ($code === null) {
            return $rows;
        }
        foreach ($rows as $r) {
            if ($r['Code'] === $code) {
                return $r;
            }
        }

        return null;
    }

    public static function briefService(string $code): string
    {
        return self::PBSVC[$code] ?? 'AAB-EMB-193';
    }

    /** Store card for a BW_Premium row with the service that prices it. */
    public static function briefCard(array $p): array
    {
        return ['code' => $p['Code'], 'product' => $p['Product'], 'forWhom' => $p['For whom'], 'contents' => $p['Contents'], 'svc' => self::card(self::briefService($p['Code']))];
    }

    /* ------------------------------------------------------------------ country pack */

    /** Heading level of a pack block (prototype hLevel): Title 0, Heading n, anything else 99. */
    public static function level(array $b): int
    {
        if (($b['t'] ?? '') !== 'p') {
            return 99;
        }
        if (($b['s'] ?? '') === 'Title') {
            return 0;
        }

        return preg_match('/^Heading (\d)/', (string) ($b['s'] ?? ''), $m) ? (int) $m[1] : 99;
    }

    /** Blocks under the first heading starting with $prefix (prototype docSlice). */
    public static function slice(string $prefix): array
    {
        $d = CountryHub::meta('pack_doc') ?? [];
        $i = null;
        foreach ($d as $k => $b) {
            if (self::level($b) < 99 && str_starts_with((string) $b['x'], $prefix)) {
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
            if (self::level($d[$j]) <= $lv) {
                break;
            }
            $out[] = $d[$j];
        }

        return $out;
    }

    /** The n-th table under a heading (prototype docTable). */
    public static function table(string $prefix, int $n = 0): ?array
    {
        $t = array_values(array_filter(self::slice($prefix), fn ($b) => $b['t'] === 'tbl'))[$n] ?? null;

        return $t['rows'] ?? null;
    }

    /* ------------------------------------------------------------------ countries */

    /** Country by AIIM slug with the pack state the Library pages need. */
    public static function country(string $slug): array
    {
        $c = Country::query()->where('slug', $slug)->firstOrFail();

        return [
            'slug' => $c->slug, 'name' => $c->name, 'iso2' => $c->iso2, 'flag' => $c->flag(),
            'isBW' => $c->iso2 === 'BW', 'packStatus' => $c->pack_status, 'packCode' => $c->pack_code,
            'hasProvincePack' => (bool) $c->has_province_pack,
        ];
    }

    /* ------------------------------------------------------------------ page index */

    /**
     * Every prototype page with its app URL. `closest` marks pages whose own app screen needs a
     * record reference (an order, quote or engagement), so the link goes to the nearest page that
     * opens without one.
     */
    public static function sitemap(): array
    {
        $bw = '/aiim/country/botswana';
        $project = Project::query()->whereNotNull('premium')->value('code');
        $source = Source::query()->orderBy('id')->value('code');
        $eng = '/aiim/workspace/engagements';

        $urls = [
            'home' => ['/aiim', false], 'cockpit' => [$bw, false], 'units' => [$bw.'/provinces', false],
            'unit.GA' => ['/aiim/province/GA', false],
            'sectors' => ['/aiim/sectors', false],
            'sector.ICT' => ['/aiim/sector/ICT', false],
            'opps' => ['/aiim/opportunities', false],
            'opp.BW-CSP-S01' => ['/aiim/opportunities/BW-CSP-S01', false],
            'projects' => ['/aiim/projects', false],
            'project.P-02' => ['/aiim/projects/P-02', false],
            'investors' => ['/aiim/investors', false],
            'investor.CORP' => ['/aiim/investors/CORP', false],
            'funders' => ['/aiim/funders', false],
            'funder.CEDA' => ['/aiim/funders/CEDA', false],
            'corridors' => ['/aiim/corridors', false],
            'corridor.KAZ' => ['/aiim/corridors/KAZ', false],
            'risk' => ['/aiim/risk', false],
            'evidence' => $source ? ['/aiim/sources/'.$source, false] : ['/aiim/methodology', true],
            'register' => ['/aiim/register', false], 'register-done' => ['/aiim/welcome', false],
            'saved' => ['/aiim/workspace/saved', false], 'watchlist' => ['/aiim/workspace/watchlist', false],
            'compare' => ['/aiim/workspace/compare', false], 'compare-results' => ['/aiim/workspace/compare', true],
            'fees' => ['/aiim/fees/discover', false], 'manifest' => ['/aiim/fees/discover', true],
            'locked' => $project ? ['/aiim/unlock/'.$project, false] : ['/aiim/projects', true],
            'metered' => $project ? ['/aiim/unlock/'.$project.'/approve', false] : ['/aiim/projects', true],
            'wallet' => ['/aiim/wallet', false], 'checkout' => ['/aiim/wallet', true], 'processing' => ['/aiim/wallet', true],
            'confirmation' => ['/aiim/workspace/entitlements', true], 'unlock' => ['/aiim/workspace/entitlements', false],
            'premium' => ['/aiim/store', false], 'brief.BW-PB-08' => ['/aiim/store/BW-PB-08', false],
            'report-config' => ['/aiim/store/BW-PB-08/configure', false], 'report-quote' => ['/aiim/workspace/reports', true],
            'report-delivery' => ['/aiim/workspace/reports', false],
            'custom-request' => ['/aiim/custom-intelligence', false], 'custom-review' => ['/aiim/custom-intelligence', true],
            'advisor' => ['/aiim/workspace/advisor-request', false],
            'enterprise' => ['/aiim/workspace/enterprise', false], 'api' => ['/aiim/workspace/developer', false],
            'gov-dfi' => ['/aiim/workspace/institutional', false], 'alerts' => ['/aiim/workspace/alerts', false],
            'archive' => ['/aiim/workspace/archive', false], 'client-dash' => ['/aiim/workspace', false],
            'advisor-dash' => ['/admin/aiim/advisor', false], 'finance-dash' => ['/admin/aiim/finance', false],
            'admin-dash' => ['/admin/aiim', false], 'pricing-admin' => ['/admin/aiim/pricing', false], 'source-admin' => ['/admin/aiim/sources', false],
        ];

        $mock = array_map(function ($m) use ($urls, $eng) {
            [$url, $closest] = $urls[$m[1]] ?? [$eng, true];

            return ['n' => $m[0], 'route' => $m[1], 'title' => $m[2], 'url' => $url, 'closest' => $closest];
        }, self::MOCK);

        $new = array_map(fn ($m) => ['route' => $m[0], 'title' => $m[1], 'url' => $m[2], 'closest' => false], [
            ['map', 'Map View (drill-down)', $bw.'/map'], ['invinfo', 'Investor Info Type', $bw.'/investor-questions'], ['trdinfo', 'Trader Info Type', $bw.'/trader-questions'],
            ['hs', 'Commodity HS', $bw.'/hs'], ['leads', 'Leads Centre', $bw.'/leads'], ['economics', 'Unit Economics & IRR', $bw.'/economics'],
            ['onestop', 'One-Stop Shop (80 features)', '/aiim/one-stop-shop'], ['services', 'Embedded Services (581)', '/aiim/services'],
            ['pack', 'Country Pack BW-1.0 (full text)', $bw.'/pack'], ['registers', 'Data Room (62 sheets)', $bw.'/registers'],
            ['prompts', 'Master Prompt & Prompts', '/aiim/prompts'], ['coverage', 'Coverage Report', $bw.'/coverage'], ['sitemap', 'Page Index', '/aiim/sitemap'],
        ]);

        $sectors = array_map(fn ($code, $name) => ['route' => 'sector.'.$code, 'title' => $name, 'url' => '/aiim/sector/'.$code, 'closest' => false], array_keys(CountryHub::SECT), CountryHub::SECT);
        $units = array_map(fn ($u) => ['route' => 'unit.'.$u['Code'], 'title' => $u['Unit'], 'url' => '/aiim/province/'.$u['Code'], 'closest' => false], CountryHub::register('BW_Units'));

        return ['mock' => $mock, 'added' => $new, 'sectors' => $sectors, 'units' => $units];
    }

    /** The 79 numbered prototype pages (prototype MOCK). */
    public const MOCK = [
        [1, 'home', 'AIIM Landing Page'], [2, 'cockpit', 'Botswana Investor Cockpit'], [3, 'units', 'District & Council Selector'], [4, 'unit.GA', 'Unit Profile (Gaborone)'], [5, 'sectors', 'Sector Selector'], [6, 'sector.ICT', 'Digital, Mobile Money & 5G'],
        [7, 'opps', 'Opportunity Search'], [8, 'opp.BW-CSP-S01', 'Opportunity Preview'], [9, 'projects', 'Project Search'], [10, 'project.P-02', 'Project Overview'], [11, 'investors', 'Investor Search'], [12, 'investor.CORP', 'Investor Preview'],
        [13, 'funders', 'Funder Search'], [14, 'funder.CEDA', 'Funder Preview'], [15, 'corridors', 'Trade Corridor Search'], [16, 'corridor.KAZ', 'Trade Corridor Detail'], [17, 'risk', 'Risk and Outlook'], [18, 'evidence', 'Source and Evidence Preview'],
        [19, 'register', 'Registration'], [20, 'register-done', 'Registration Confirmation'], [21, 'saved', 'Saved Items'], [22, 'watchlist', 'My Watchlist'], [23, 'compare', 'Comparison Builder'], [24, 'compare-results', 'Comparison Results'],
        [25, 'fees', 'Fee Discovery'], [26, 'manifest', 'Fee Manifest'], [27, 'locked', 'Locked Premium Object'], [28, 'metered', 'Metered Unlock Approval'], [29, 'wallet', 'Wallet and Credits'], [30, 'checkout', 'Secure Checkout'],
        [31, 'processing', 'Payment Processing'], [32, 'confirmation', 'Payment Confirmation'], [33, 'unlock', 'Entitlement Unlock'], [34, 'premium', 'AIIM Premium Brief Store'], [35, 'brief.BW-PB-08', 'Premium Brief Detail'], [36, 'report-config', 'Report Configuration'],
        [37, 'report-quote', 'Report Quotation'], [38, 'report-delivery', 'Report Delivery'], [39, 'custom-request', 'Custom Intelligence Request'], [40, 'custom-review', 'Custom Request Review'], [41, 'advisor', 'Advisor Request'], [42, 'booking', 'Booking Discovery'],
        [43, 'discovery-confirm', 'Discovery Confirmation'], [44, 'discovery-outcome', 'Discovery Outcome'], [45, 'quotation', 'Formal Quotation'], [46, 'engagement', 'Engagement Letter Review'], [47, 'esign', 'Electronic Signature'], [48, 'deposit', 'Deposit Payment'],
        [49, 'custom-report', 'Custom Intelligence Report'], [50, 'verify-scope', 'Verification Scope'], [51, 'ext-cost', 'External Cost Approval'], [52, 'verify-progress', 'Verification Progress'], [53, 'verify-report', 'Verification Report'], [54, 'deep-dive', 'Market and Sector Deep Dive'],
        [56, 'packaging', 'Project Packaging Workspace'], [58, 'intro-consent', 'Introduction Consent'], [59, 'intro-room', 'Introduction Room'], [60, 'dd-handoff', 'Due Diligence Handoff'], [61, 'vdr-handoff', 'Virtual Deal Room Handoff'], [62, 'pa-handoff', 'Project Advisory Handoff'],
        [63, 'acceptance', 'Delivery Acceptance'], [64, 'scope-change', 'Scope Change Approval'], [65, 'refund', 'Refund Request'], [66, 'dispute', 'Dispute Case'], [67, 'pause', 'Pause Mandate'], [68, 'restart', 'Restart Mandate'], [69, 'cancel', 'Cancellation'],
        [70, 'ledger', 'Transaction Ledger'], [72, 'enterprise', 'Enterprise Desk'], [73, 'api', 'API & White Label Management'], [74, 'gov-dfi', 'Government & DFI Desk'], [75, 'alerts', 'Monitoring Alerts'], [76, 'archive', 'Archive and Deletion'],
        [77, 'client-dash', 'Client Dashboard'], [78, 'advisor-dash', 'AIIM Advisor Dashboard'], [79, 'finance-dash', 'Finance Dashboard'], [80, 'admin-dash', 'AIIM Admin and Dashboard'], [81, 'pricing-admin', 'Pricing Administration'], [82, 'source-admin', 'Source and Confidence Administration'],
    ];
}
