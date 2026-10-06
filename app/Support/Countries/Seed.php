<?php

namespace App\Support\Countries;

use App\Models\Countries\ChangeRequest;
use App\Models\Countries\Corridor;
use App\Models\Countries\Country;
use App\Models\Countries\Engagement;
use App\Models\Countries\FeeLine;
use App\Models\Countries\Interest;
use App\Models\Countries\Observation;
use App\Models\Countries\RegisterEntry;
use App\Models\Countries\Release;
use App\Models\Countries\ResolverDomain;
use App\Models\Countries\Retraction;
use App\Models\Countries\Service;
use App\Models\Countries\SovereignEngagement;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Idempotent seeding of the Countries ecosystem (used by CountriesSeeder and tests).
 */
class Seed
{
    public static function run(bool $demo = true): void
    {
        self::countries();
        self::services();
        self::registers();
        self::corridors();
        self::governance();
        if ($demo) {
            self::demand();
            self::engagements();
        }
    }

    /** Mockup-sourced draft metrics for the ten countries shown on admin consoles. */
    private const METRICS = [
        'ZA' => ['tax' => ['Standard VAT', '15% VAT', '27%', '5% – 20%', 54, 'Approved', 96], 'pay' => [8, 12, 4, 'Yes', '1.0 day', 'Excellent'], 'lic' => ['Business Operations', 124, 102, 10, 2, 92], 'ptn' => [245, 1240, 862, 93, 94, 'Healthy'], 'dem' => [1.22, -0.04, 'ESG, Advisory, Compliance', 'High'], 'inv' => ['Tier 0: Anchor', 0, 1480, 0, 100, 'Low'], 'ana' => [96, 'High', 'Ready', 'Low', 'Strong market depth, high demand, mature partners.'], 'rcs_admin' => [1248, 24]],
        'DZ' => ['tax' => ['VAT Regime', '19% VAT', '26%', '10%', 42, 'Under Review', 78], 'pay' => [6, 8, 3, 'Yes', '1.5 days', 'Good'], 'lic' => ['Business Operations', 86, 68, 14, 4, 79], 'ptn' => [128, 510, 342, 87, 88, 'Healthy'], 'dem' => [1.58, -0.11, 'Tax, Legal, Company', 'Medium'], 'inv' => ['Tier 3: Monitor', 38, 88, 15.8, 61, 'High']],
        'AO' => ['tax' => ['Standard VAT', '14% VAT', '30%', '10%', 38, 'Under Review', 64], 'pay' => [6, 8, 2, 'Yes', '2.0 days', 'Good'], 'lic' => ['Sector Specific', 78, 61, 12, 5, 78], 'ptn' => [96, 420, 298, 82, 85, 'Healthy'], 'rcs_admin' => [542, 308]],
        'BW' => ['tax' => ['Zero Rated', '12% VAT', '22%', '5%', 21, 'Approved', 92], 'pay' => [5, 6, 2, 'Yes', '1.5 days', 'Good'], 'lic' => ['Business Operations', 64, 52, 9, 3, 81], 'ptn' => [64, 280, 176, 90, 86, 'Stable'], 'dem' => [0.98, 0.03, 'Tax, Company', 'Medium'], 'rcs_admin' => [854, 139]],
        'CM' => ['tax' => ['VAT Regime', '19.25% VAT', '35%', '10%', 24, 'Outdated', 48], 'pay' => [6, 8, 3, 'Yes', '2.0 days', 'Good'], 'lic' => ['Employment & Labour', 72, 58, 11, 3, 81], 'ptn' => [112, 460, 318, 78, 81, 'Stable'], 'inv' => ['Tier 3: Monitor', 34, 76, 16.2, 58, 'Medium']],
        'GH' => ['tax' => ['Standard VAT', '15% VAT', '25%', '8%', 31, 'Approved', 90], 'pay' => [7, 10, 3, 'Yes', '1.0 day', 'Excellent'], 'lic' => ['Sector Specific', 94, 74, 16, 4, 79], 'ptn' => [132, 550, 374, 86, 88, 'Healthy'], 'dem' => [1.88, -0.19, 'Accounting, Tax, Finance', 'High'], 'inv' => ['Tier 2: High Value', 72, 198, 11.6, 83, 'Low'], 'rcs_admin' => [1102, 103]],
        'KE' => ['tax' => ['Standard VAT', '16% VAT', '30%', '5% – 20%', 36, 'Approved', 93], 'pay' => [7, 10, 4, 'Yes', '1.0 day', 'Good'], 'lic' => ['Business Operations', 88, 73, 13, 3, 82], 'ptn' => [186, 710, 492, 83, 87, 'Healthy'], 'dem' => [2.02, -0.21, 'Company, Payroll, VAT', 'High'], 'inv' => ['Tier 1: Strategic', 96, 287, 10.1, 88, 'Medium']],
        'MU' => ['tax' => ['Zero Rated', '15% VAT', '15%', '0%', 18, 'Approved', 100], 'pay' => [6, 8, 3, 'Yes', '1.5 days', 'Good'], 'lic' => ['Financial Services', 96, 80, 14, 2, 83], 'ptn' => [78, 320, 192, 76, 79, 'Stable'], 'dem' => [1.10, 0.02, 'Investment, Company', 'Medium'], 'inv' => ['Tier 3: Monitor', 28, 62, 16.9, 54, 'Low'], 'rcs_admin' => [1200, 63]],
        'NG' => ['tax' => ['VAT Regime', '7.5% VAT', '30%', '10%', 28, 'Under Review', 70], 'pay' => [5, 7, 2, 'Partial', '2.5 days', 'Fair'], 'lic' => ['Sector Specific', 102, 68, 22, 12, 67], 'ptn' => [312, 1050, 840, 71, 72, 'At Risk'], 'dem' => [2.41, -0.28, 'Tax, Compliance, HR', 'High'], 'inv' => ['Tier 1: Strategic', 125, 412, 9.2, 92, 'Medium']],
        'ZM' => ['tax' => ['Standard VAT', '16% VAT', '30%', '15%', 45, 'Approved', 82], 'pay' => [6, 8, 3, 'Yes', '1.5 days', 'Good'], 'lic' => ['Environmental', 56, 47, 7, 2, 84], 'ptn' => [84, 340, 218, 76, 78, 'Stable'], 'dem' => [1.66, -0.16, 'Tax, Payroll, Compliance', 'Medium'], 'inv' => ['Tier 2: High Value', 56, 142, 13.3, 76, 'Medium'], 'rcs_admin' => [612, 236]],
        'TZ' => ['dem' => [1.74, -0.18, 'Compliance, HR, Finance', 'Medium'], 'inv' => ['Tier 2: High Value', 68, 176, 12.8, 79, 'Low']],
        'EG' => ['dem' => [1.69, -0.15, 'Tax, Company, Advisory', 'Medium'], 'inv' => ['Tier 1: Strategic', 110, 268, 12.2, 73, 'Medium']],
    ];

    public static function countries(): void
    {
        foreach (CountryRegister::countries() as [$iso2, $iso3, $name, $region, $currency, $income, $rcs]) {
            $za = $iso2 === 'ZA';
            $h = crc32($iso2);
            $m = self::METRICS[$iso2] ?? [];
            $metrics = [
                'tax' => $m['tax'] ?? [['Standard VAT', 'VAT Regime', 'Zero Rated'][$h % 3], 'Pending evidence', 'Pending evidence', 'Pending evidence', 12 + $h % 30, ['Under Review', 'Outdated', 'Incomplete'][$h % 3], 20 + $h % 50],
                'pay' => $m['pay'] ?? [3 + $h % 4, 4 + $h % 5, 1 + $h % 3, ['Yes', 'Partial'][$h % 2], (1 + $h % 3).'.0 days', ['Good', 'Fair', 'Poor'][$h % 3]],
                'lic' => $m['lic'] ?? [['Business Operations', 'Sector Specific', 'Employment & Labour', 'Financial Services'][$h % 4], 30 + $h % 60, 0, 0, 0, 30 + $h % 40],
                'ptn' => $m['ptn'] ?? [10 + $h % 90, 50 + $h % 300, 20 + $h % 150, 40 + $h % 40, 40 + $h % 40, ['Stable', 'At Risk', 'Thin'][$h % 3]],
                'dem' => $m['dem'] ?? [round(0.4 + ($h % 90) / 100, 2), round(-(($h % 25) / 100), 2), ['Tax, Company', 'Compliance, HR', 'Payroll, VAT', 'Company, Advisory'][$h % 4], ['Medium', 'Low'][$h % 2]],
                'inv' => $m['inv'] ?? ['Tier 3: Monitor', 15 + $h % 30, 25 + $h % 50, 18 + ($h % 80) / 10, 20 + $h % 40, ['Medium', 'High', 'Low'][$h % 3]],
                'ana' => $m['ana'] ?? null,
                'rcs_admin' => $m['rcs_admin'] ?? null,
            ];
            if (isset($metrics['lic']) && $metrics['lic'][2] === 0) {
                $metrics['lic'][2] = (int) round($metrics['lic'][1] * 0.7);
                $metrics['lic'][3] = (int) round($metrics['lic'][1] * 0.15);
                $metrics['lic'][4] = (int) round($metrics['lic'][1] * 0.05);
            }
            if ($za) {
                $metrics['ledger_outlook'] = self::OUTLOOK;
                $metrics['evidence_domains'] = [['Economy & Financial', 16], ['Legal & Regulatory', 22], ['Tax & Statutory', 14], ['Investment & Business', 15], ['Infrastructure & Logistics', 16], ['Social & Demographic', 12], ['Environment & ESG', 12]];
                $metrics['source_manifest'] = [['Official Government Sources', 31], ['Regulatory & Statutory Bodies', 18], ['International Organisations', 22], ['Research & Think Tanks', 16], ['Private Sector / Corporate', 14], ['Academic & Universities', 6], ['Media (Verified)', 3], ['Other Open Sources', 2]];
            }

            $country = Country::updateOrCreate(['iso2' => $iso2], [
                'iso3' => $iso3,
                'slug' => CountryRegister::slug($name),
                'name' => $name,
                'region' => $region,
                'currency' => $currency,
                'income_group' => $income,
                'programme_status' => $za ? 'Phase 1 controlled environment' : 'Future architecture shell',
                'availability_state' => $za ? AvailabilityState::ACTIVE : AvailabilityState::SHELL,
                'gate_status' => $za ? 'G-D1..G-D9 / CT-RC-001 required for production scope' : 'G-D1..G-D9 NOT PASSED FOR ACTIVATION',
                'evidence_currentness' => $za ? 'current' : 'partial',
                'evidence_confidence' => $za ? 'High' : 'Low',
                'confidence_pct' => $za ? 92 : 0,
                'last_reviewed_at' => $za ? '2026-08-15' : Carbon::parse('2026-08-15')->subDays($h % 6)->toDateString(),
                'next_review_at' => $za ? '2026-11-15' : '2026-11-10',
                'activation_date' => $za ? '2026-08-15' : null,
                'profile_valid_to' => $za ? '2026-11-15' : null,
                'resolver_version' => $za ? 'RSA-CTX-2026-08-15.v4' : null,
                'release_certificate_ref' => $za ? 'CT-RC-001 (scope-limited)' : null,
                'updated_by' => $h % 2 ? 'TBCA Admin' : 'TBCA System',
                'metrics' => $metrics,
            ]);

            // Resolver domains: distribute completed fields to land at the register RCS.
            $totalRequired = array_sum(array_column(CountryRegister::DOMAINS, 3));
            $target = (int) round($totalRequired * $rcs / 100);
            foreach (CountryRegister::DOMAINS as $i => [$key, $label, $desc, $required, $class]) {
                if ($za) {
                    $done = $required;
                } else {
                    $done = min($required, intdiv($target, 9) + ($i < $target % 9 ? 1 : 0));
                }
                ResolverDomain::updateOrCreate(['country_id' => $country->id, 'key' => $key], [
                    'label' => $label, 'description' => $desc, 'hard_block_class' => $class,
                    'required_fields' => $required, 'completed_fields' => $done,
                    'evidence_status' => $done >= $required ? 'current' : ($done === 0 ? 'missing' : 'partial'),
                    'last_verified_at' => $za ? Carbon::parse('2026-08-15')->subDays([0, 1, 1, 1, 2, 1, 2, 2, 3][$i])->toDateString() : null,
                    'missing' => $done >= $required ? [] : ['Sovereign source sweep', 'Qualified review / opinion', 'Licence-to-use confirmation'],
                    'sort' => $i,
                ]);
            }
        }
    }

    private const OUTLOOK = [
        'months' => ['Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027', 'May 2027', 'Jun 2027', 'Jul 2027', 'Aug 2027'],
        'T' => [9800, 9950, 10200, 10750, 10500, 10300, 10400, 10300, 10600, 10750, 10800, 10500],
        'X' => [21500, 22800, 23200, 23900, 23600, 23100, 22900, 22600, 23400, 23800, 23600, 23900],
        'S' => [2600, 2700, 2800, 2900, 3000, 3100, 3100, 3000, 3000, 3000, 3000, 3000],
        'P' => [12500, 12800, 13200, 13900, 13400, 13100, 13000, 12800, 12900, 13000, 13100, 13000],
        'D' => [4800, 4900, 5100, 5200, 5200, 5100, 5000, 5000, 5100, 5200, 5200, 5150],
        'CT-C' => [4500, 4500, 4600, 4700, 4700, 4600, 4600, 4700, 4600, 4600, 4600, 4200],
    ];

    public static function services(): void
    {
        $za = Country::where('iso2', 'ZA')->firstOrFail();
        foreach (ServiceCatalogue::southAfricaRows() as $row) {
            Service::updateOrCreate(['code' => $row['code']], [...$row, 'country_id' => $za->id]);
        }
    }

    public static function registers(): void
    {
        $za = Country::where('iso2', 'ZA')->firstOrFail();
        $put = function (Country $c, string $register, array $rows) {
            foreach ($rows as $i => $r) {
                RegisterEntry::updateOrCreate(['country_id' => $c->id, 'register' => $register, 'code' => $r['code']], [...$r, 'sort' => $i]);
            }
        };

        $ev = [
            ['EV-SA-001', 'Commercial Availability Confirmation', 'Activation', 'Policy', 'Resolver', '2026-08-15', ['T', 'CT-C'], 'Country'],
            ['EV-SA-002', 'Regulatory Operating Environment Report', 'Legal & Regulatory', 'Report', 'Authority', '2026-08-12', ['S', 'P'], 'Country'],
            ['EV-SA-003', 'Tax & Statutory Fee Authority Schedule', 'Permissions', 'Authority', 'SARS', '2026-08-11', ['S'], 'Country'],
            ['EV-SA-004', 'Data / Licence Permission Pack', 'Data & Licences', 'Licence', 'Vendor', '2026-08-10', ['D'], 'Country'],
            ['EV-SA-005', 'Corridor / Pair Permission Matrix', 'Corridors & Pairs', 'Resolver', 'TBCA', '2026-08-10', ['CT-C'], 'Corridors'],
            ['EV-SA-006', 'Sanctions Screening Clearance', 'Permissions', 'Screening', 'Third Party', '2026-08-09', ['All'], 'Country'],
            ['EV-SA-007', 'Resolver Analysis & Assumptions', 'Activation', 'Analysis', 'Resolver', '2026-08-08', ['All'], 'Country'],
            ['EV-SA-008', 'Market Intelligence Report', 'Economics', 'Report', 'MI Hub', '2026-08-07', ['T', 'X'], 'Country'],
            ['EV-SA-009', 'Labour Cost & Skills Availability Report', 'Economics', 'Report', 'Authority', '2026-08-06', ['T', 'X'], 'Country'],
            ['EV-SA-010', 'FX Rate Source & Methodology', 'Commercial', 'Methodology', 'Authority', '2026-08-05', ['All'], 'Country'],
            ['EV-25-00187', 'SARB Quarterly Bulletin – Q2 2026', 'Economy & Financial', 'Official Publication', 'South African Reserve Bank', '2026-06-30', ['X'], 'Country'],
            ['EV-25-00191', 'Companies Act, 2008 (Act 71 of 2008) – Consolidated', 'Legal & Regulatory', 'Primary Legislation', 'Government Gazette', '2026-07-01', ['S'], 'Country'],
            ['EV-25-00192', 'SARS Guide 2026: Individual Tax Returns', 'Tax & Statutory', 'Official Publication', 'South African Revenue Service', '2026-07-12', ['S'], 'Country'],
            ['EV-25-00195', 'South Africa FDI Report 2026', 'Investment & Business', 'International Report', 'UNCTAD', '2026-07-20', ['T'], 'Country'],
            ['EV-25-00148', 'Transport Freight Statistics FY1 Plan 2026', 'Infrastructure & Logistics', 'Corporate Publication', 'Transnet', '2026-07-18', ['CT-C'], 'Country'],
        ];
        $put($za, 'evidence', array_map(fn ($e) => [
            'code' => $e[0], 'title' => $e[1], 'category' => $e[2], 'type' => $e[3], 'status' => 'Current', 'recorded_on' => $e[5],
            'impact' => $e[0] === 'EV-25-00148' ? 'Medium' : 'High',
            'data' => ['source' => $e[4], 'ledgers' => $e[6], 'applies_to' => $e[7], 'review_due' => Carbon::parse($e[5])->addMonths(6)->format('d M Y'), 'contradictions' => 0],
        ], $ev));

        $src = [
            ['SRC-SA-001', 'Companies Act 71 of 2008', 'Authority', 'Legislation', 'Government of RSA', 'Company Law', '2026-08-01', '2026-11-01', 'Critical', 'Sprints, Paths'],
            ['SRC-SA-002', 'CIPC Company Data API', 'Market', 'Dataset / API', 'CIPC', 'Company Data', '2026-08-10', '2026-11-10', 'Critical', 'Sprints, Permissions'],
            ['SRC-SA-003', 'SARS Tax Guide for Businesses', 'Authority', 'Guide', 'SARS', 'Tax & Duties', '2026-08-05', '2026-11-05', 'Critical', 'Sprints, Economics'],
            ['SRC-SA-004', 'VAT Act 89 of 1991', 'Authority', 'Legislation', 'Government of RSA', 'Tax', '2026-08-01', '2026-11-01', 'Critical', 'Sprints, Economics'],
            ['SRC-SA-005', 'Labour Relations Act 66 of 1995', 'Authority', 'Legislation', 'Government of RSA', 'Labour Law', '2026-08-01', '2026-11-01', 'High', 'Sprints, Compliance'],
            ['SRC-SA-006', 'Employment Equity Act 55 of 1998', 'Authority', 'Legislation', 'Government of RSA', 'Labour Law', '2026-08-01', '2026-11-01', 'High', 'Sprints, Compliance'],
            ['SRC-SA-007', 'Exchange Rates – SARB', 'Economic', 'Dataset', 'South African Reserve Bank', 'Economic', '2026-08-14', '2026-08-15', 'High', 'Economics, Corridors'],
            ['SRC-SA-008', 'BI Rate – SARB', 'Economic', 'Dataset', 'South African Reserve Bank', 'Economic', '2026-08-14', '2026-08-15', 'High', 'Economics'],
            ['SRC-SA-009', 'Consumer Price Index (CPI)', 'Economic', 'Dataset', 'Statistics South Africa', 'Economic', '2026-08-14', '2026-09-15', 'High', 'Economics'],
            ['SRC-SA-010', 'GDP – Quarterly', 'Economic', 'Dataset', 'Statistics South Africa', 'Economic', '2026-08-14', '2026-08-15', 'High', 'Economics'],
            ['SRC-SA-011', 'Competition Act 89 of 1998', 'Authority', 'Legislation', 'Government of RSA', 'Competition Law', '2026-08-01', '2026-11-01', 'High', 'Sprints, Compliance'],
            ['SRC-SA-012', 'POPIA Act 4 of 2013', 'Authority', 'Legislation', 'Government of RSA', 'Data Protection', '2026-08-01', '2026-11-01', 'High', 'Sprints, Compliance'],
            ['SRC-SA-013', 'FICA Guidance Note', 'Regulatory', 'Guidance', 'FSCA', 'Financial Regulation', '2026-08-05', '2026-11-05', 'High', 'Sprints, Compliance'],
            ['SRC-SA-014', 'Banks Act 94 of 1990', 'Authority', 'Legislation', 'Government of RSA', 'Financial Law', '2026-08-01', '2026-11-01', 'Medium', 'Sprints'],
            ['SRC-SA-015', 'Insurance Act 18 of 2017', 'Authority', 'Legislation', 'Government of RSA', 'Financial Law', '2026-08-01', '2026-11-01', 'Medium', 'Sprints'],
        ];
        $put($za, 'sources', array_map(fn ($s) => [
            'code' => $s[0], 'title' => $s[1], 'category' => $s[2], 'type' => $s[3], 'status' => 'Current', 'impact' => $s[8], 'recorded_on' => $s[6],
            'data' => ['publisher' => $s[4], 'domain' => $s[5], 'scope' => 'National', 'next_due' => Carbon::parse($s[7])->format('d M Y'), 'used_in' => $s[9]],
        ], $src));

        $con = [
            ['CT-CON-001', 'Company Tax Rate – 27% vs 28%', 'Data', 'Tax', 'SARS Guide vs Budget Speech', 'Medium', '01', '05', 'EV-SA-003'],
            ['CT-CON-002', 'VAT Registration Threshold – R1M vs R1.5M', 'Regulatory', 'Tax', 'SARS vs CIPC', 'High', '01', '05', 'EV-SA-004'],
            ['CT-CON-003', 'Exchange Control – Current vs Historical Limit', 'Data', 'FX Control', 'SARB vs Old Circular', 'High', '02', '06', 'EV-SA-005'],
            ['CT-CON-004', 'Employment Equity Targets – 50% vs 55%', 'Regulatory', 'Labour Law', 'EE Act vs Sector Charter', 'Medium', '02', '06', 'EV-SA-006'],
            ['CT-CON-005', 'Withholding Tax – Dividends Rate', 'Tariff & Tax', 'Tax', 'SARS vs DTA Text', 'Medium', '02', '06', 'EV-SA-007'],
            ['CT-CON-006', 'Import Duty – HS 8471 Rate', 'Tariff & Tax', 'Trade', 'ITAC vs SARS Tariff', 'High', '03', '07', 'EV-SA-008'],
            ['CT-CON-007', 'B-BBEE Verification Cost Range', 'Market', 'B-BBEE', 'SANAS vs Market Quotes', 'Low', '03', '07', 'EV-SA-009'],
            ['CT-CON-008', 'Environmental Authorisation Trigger', 'Regulatory', 'Environment', 'NEMA vs Sector Guideline', 'High', '03', '07', 'EV-SA-010'],
            ['CT-CON-009', 'Company Name Reservation Period', 'Data', 'CIPC', 'CIPC vs Practice Note', 'Low', '04', '08', 'EV-SA-011'],
            ['CT-CON-010', 'Work Visa Processing Time', 'Data', 'Home Affairs', 'DHA vs BMA Statements', 'Medium', '04', '08', 'EV-SA-012'],
            ['CT-CON-011', 'Customs Clearance Time – Sea Freight', 'Data', 'Trade', 'Transnet vs SARS Broker Avg', 'Low', '04', '08', 'EV-SA-013'],
            ['CT-CON-012', 'Interest Deduction Limitation Rules', 'Tariff & Tax', 'Tax', 'ITA vs SARS Interpretation', 'High', '05', '09', 'EV-SA-014'],
            ['CT-CON-013', 'Sector Code Classification – Manufacturing', 'Data', 'CIPC', 'CIPC vs Stats SA', 'Low', '05', '09', 'EV-SA-015'],
            ['CT-CON-014', 'Skills Levy Rate – 1% vs 1.5%', 'Regulatory', 'Labour Law', 'SDL Act vs SETA Notice', 'Medium', '05', '09', 'EV-SA-016'],
            ['CT-CON-015', 'Transfer Pricing Documentation Threshold', 'Regulatory', 'Tax', 'ITA vs SARS Guide', 'High', '06', '10', 'EV-SA-017'],
            ['CT-CON-016', 'Consumer Cooling-off Period Wording', 'Legal & Policy', 'Consumer', 'CPA vs ECTA', 'Medium', '06', '10', 'EV-SA-018'],
            ['CT-CON-017', 'POPIA Transfer Adequacy Wording', 'Legal & Policy', 'Data Protection', 'IR Guidance vs Draft Regs', 'High', '07', '11', 'EV-SA-019'],
            ['CT-CON-018', 'Partner Fee Basis – Hourly vs Engagement', 'Commercial', 'Partners', 'Partner Schedule vs Quote', 'High', '07', '11', 'EV-SA-020'],
        ];
        $put($za, 'contradictions', array_map(fn ($c) => [
            'code' => $c[0], 'title' => $c[1], 'type' => $c[2], 'category' => $c[2], 'status' => 'Resolved', 'impact' => $c[5], 'recorded_on' => "2026-08-{$c[6]}",
            'data' => ['domain' => $c[3], 'sources' => $c[4], 'resolved_on' => "{$c[7]} Aug 2026", 'resolver' => 'TBCA', 'evidence' => $c[8]],
        ], $con));

        $lic = [
            ['DL-SA-001', 'SARS Tax Guide for Businesses', 'Tax & Revenue', 'SARS', 'Official Publication Licence', 'Licensed'],
            ['DL-SA-002', 'CIPC Company Data API', 'Company Data', 'CIPC', 'API Commercial Licence', 'Licensed'],
            ['DL-SA-003', 'Exchange Rates - SARB', 'Economic', 'South African Reserve Bank', 'Data Redistribution Licence', 'Licensed'],
            ['DL-SA-004', 'Labour Law Regulations', 'Regulatory', 'Department of Labour', 'Government Data Licence', 'Public Domain'],
            ['DL-SA-005', 'VAT Act & Regulations', 'Tax & Revenue', 'National Treasury', 'Open Government Licence', 'Public Domain'],
            ['DL-SA-006', 'Competition Act Regulations', 'Regulatory', 'DTIC', 'Government Data Licence', 'Public Domain'],
            ['DL-SA-007', 'Environmental Authorisations', 'Environment', 'DFFE', 'Government Data Licence', 'Licensed'],
            ['DL-SA-008', 'Municipal Tariff Benchmark', 'Market Data', 'SALGA', 'Data Use Agreement', 'Restricted Use'],
            ['DL-SA-009', 'Consumer Price Index (CPI)', 'Economic', 'Stats SA', 'Statistics Licence', 'Licensed'],
            ['DL-SA-010', 'Industry Benchmark Data', 'Industry', 'Private Providers', 'Commercial Data Licence', 'Licensed'],
        ];
        $put($za, 'licences', array_map(fn ($l) => [
            'code' => $l[0], 'title' => $l[1], 'category' => $l[5], 'type' => $l[4], 'status' => 'Valid', 'recorded_on' => '2026-01-01',
            'data' => ['source_category' => $l[2], 'vendor' => $l[3], 'jurisdiction' => 'South Africa', 'valid_to' => '31 Dec 2026', 'use' => $l[5] === 'Restricted Use' ? 'Internal Use Only' : 'Commercial Use'],
        ], $lic));

        $abs = [
            ['CT-ABS-001', 'Foreign Exchange Control Approvals', 'Regulatory', 'Not Applicable', 'Exchange control approval not required for domestic ZA transactions'],
            ['CT-ABS-002', 'Import Duty – Physical Goods', 'Tariff & Tax', 'Not Required', 'Services and digital products only'],
            ['CT-ABS-003', 'Sanctions Licence – UN', 'Regulatory', 'Not Applicable', 'No UN sanctions applicable to ZA'],
            ['CT-ABS-004', 'FATCA Reporting', 'Data', 'Not Applicable', 'No FATCA reporting obligation for this service scope'],
            ['CT-ABS-005', 'Withholding Tax – Dividends (Inbound)', 'Tax', 'Not Required', 'Not applicable to local engagements'],
            ['CT-ABS-006', 'Local Content Requirements', 'Market', 'Not Available', 'No approved source for services local content rules'],
            ['CT-ABS-007', 'Environmental Impact Rating (EIA)', 'Environmental', 'Not Required', 'Not required for digital/service delivery'],
            ['CT-ABS-008', 'Sector Specific Licence – Mining', 'Regulatory', 'Out of Scope', 'Mining sector not in scope'],
            ['CT-ABS-009', 'Broad-Based Black Economic Empowerment Certificate', 'Legal & Policy', 'Out of Scope', 'B-BBEE assessed at enterprise not product', 'Medium'],
            ['CT-ABS-010', 'Competition Filing – Large Merger', 'Regulatory', 'Not Applicable', 'No merger or transaction being filed'],
            ['CT-ABS-011', 'Nuclear Regulatory Approval', 'Regulatory', 'Not Available', 'No nuclear activities involved — no source held', 'Medium'],
            ['CT-ABS-012', 'Customs Bond Registration', 'Trade', 'Not Required', 'No customs processes applicable'],
            ['CT-ABS-013', 'Agricultural Export Permit', 'Trade', 'Not Applicable', 'No agricultural exports facilitated'],
            ['CT-ABS-014', 'Telecom Spectrum Licence', 'Regulatory', 'Not Available', 'No telecom services provided — no source held'],
        ];
        $put($za, 'absences', array_map(fn ($a, $i) => [
            'code' => $a[0], 'title' => $a[1], 'category' => $a[2], 'type' => $a[3], 'status' => 'Accounted For', 'impact' => $a[5] ?? 'Low',
            'recorded_on' => Carbon::parse('2026-08-01')->addDays(intdiv($i, 3))->toDateString(), 'data' => ['reason' => $a[4], 'reviewed_by' => 'TBCA'],
        ], $abs, array_keys($abs)));

        $chg = [
            ['CT-CH-00087', '2026-08-15 10:15', 'Status Change', 'Activation State', 'Activation confirmed', 'Pending', 'Activated', 'TBCA', 'Phase 1 activation approval'],
            ['CT-CH-00086', '2026-08-15 09:42', 'Permission Change', 'Permission State', 'All permissions resolved', 'In Progress', 'Resolved', 'TBCA', 'Resolver sign-off'],
            ['CT-CH-00085', '2026-08-14 16:30', 'Evidence Change', 'Evidence: VAT Act', 'Evidence document updated', 'v2.1', 'v2.2', 'AI Reviewer', 'Act amendment 2026-07'],
            ['CT-CH-00084', '2026-08-14 11:05', 'Configuration Change', 'Commercial Availability', 'Availability rule updated', 'Manual Review', 'Service-by-service permission', 'TBCA', 'Process improvement'],
            ['CT-CH-00083', '2026-08-13 14:22', 'Status Change', 'Evidence Status', 'Evidence review completed', 'Under Review', 'Evidence Current', 'Reviewer Bot', 'Auto review completion'],
            ['CT-CH-00082', '2026-08-12 17:10', 'Permission Change', 'Resolver Completeness', 'Resolver actions completed', '85%', '100%', 'TBCA', 'All actions closed'],
            ['CT-CH-00081', '2026-08-11 09:55', 'Evidence Change', 'SARS Data Source', 'Source dataset refreshed', '2026-07-01', '2026-08-10', 'Data Bot', 'Monthly data refresh'],
            ['CT-CH-00080', '2026-08-10 12:13', 'Configuration Change', 'Payment Guardrails', 'Tax treatment rule refined', 'General Rule', 'ZA Tax Rule Set 1.4', 'TBCA', 'Tax advisory update'],
            ['CT-CH-00079', '2026-08-09 15:30', 'Status Change', 'Confidence Level', 'Confidence recalculated', 'High (88%)', 'High (92%)', 'AI Model', 'Model recalibration'],
            ['CT-CH-00078', '2026-08-08 10:00', 'Evidence Change', 'Banking Act Source', 'Evidence document replaced', 'Government Gazette 2026-06', 'Government Gazette 2026-07', 'AI Reviewer', 'Gazette update'],
        ];
        $put($za, 'history', array_map(fn ($c) => [
            'code' => $c[0], 'title' => $c[4], 'category' => $c[2], 'type' => $c[3], 'status' => 'Recorded', 'recorded_on' => substr($c[1], 0, 10),
            'data' => ['at' => $c[1], 'old' => $c[5], 'new' => $c[6], 'by' => $c[7], 'reason' => $c[8]],
        ], $chg));

        $gaps = [
            ['ABS-SA-0001', 'Payments', 'Non-South-African payment rail evidence is not held.', 'Cannot confirm availability or settlement terms.', 'Obtain source confirmations', 'Open'],
            ['ABS-SA-0002', 'Cross-Border Corridors', 'Confirmed corridor permission is absent for select routes.', 'Routes cannot be transacted or priced.', 'Resolver approval & permission', 'Open'],
            ['ABS-SA-0003', 'Legal & Regulatory', 'Local licence opinion is absent for other markets.', 'Legal exposure cannot be assessed.', 'Engage local legal counsel', 'Waiting Source'],
            ['ABS-SA-0004', 'Statutory', 'Statutory confirmation unavailable for non-activated countries.', 'Compliance stance cannot be validated.', 'Await regulator feedback', 'Quote-Only'],
            ['ABS-SA-0005', 'Data & Infrastructure', 'Data residency confirmation absent for some destinations.', 'Data flow risk cannot be assured.', 'Source or authority attestation', 'Waiting Source'],
            ['ABS-SA-0006', 'Market Intelligence', 'Field verification absent in low-source domains.', 'Market assertions remain theoretical.', 'Field research & validation', 'Open'],
            ['ABS-SA-0007', 'Commercial Availability', 'Service availability not confirmed for some providers.', 'Resolver cannot authorise availability.', 'Provider confirmation', 'Not Transaction-Permitted'],
            ['ABS-SA-0008', 'Support & Operations', 'Local support capability not confirmed in all locations.', 'SLA and support cannot be guaranteed.', 'Operational partner verification', 'Quote-Only'],
        ];
        $put($za, 'gaps', array_map(fn ($g) => ['code' => $g[0], 'title' => $g[2], 'category' => $g[1], 'status' => $g[5], 'data' => ['consequence' => $g[3], 'closure' => $g[4]]], $gaps));

        $limits = [
            ['LIM-1', 'Sector coverage limits', 'Some sector data has reduced depth outside priority domains.', 'Limited'],
            ['LIM-2', 'Geographic granularity', 'Sub-national evidence varies by source and recency.', 'Qualified'],
            ['LIM-3', 'Historical series gaps', 'Some time series contain breaks or delayed updates.', 'Partial'],
            ['LIM-4', 'Third-party licence limits', 'Certain source material may not be republished in full.', 'Restricted use'],
            ['LIM-5', 'Commercial scope limit', 'Commercial availability remains service-by-service and resolver-governed.', 'Controlled'],
            ['LIM-6', 'Cross-border corridor limit', 'Directional corridor permissions are not currently sellable.', 'Not Active'],
        ];
        $put($za, 'limitations', array_map(fn ($l) => ['code' => $l[0], 'title' => $l[1], 'status' => $l[3], 'data' => ['body' => $l[2]]], $limits));

        // Shells: the honest absence register for every non-activated country object.
        foreach (Country::where('iso2', '!=', 'ZA')->get() as $c) {
            $put($c, 'gaps', [
                ['code' => 'ABS-'.$c->iso2.'-0001', 'title' => 'No approved sovereign source sweep has been completed.', 'category' => 'Evidence', 'status' => 'Open', 'data' => ['consequence' => 'No country fact may be published.', 'closure' => 'Sovereign source sweep']],
                ['code' => 'ABS-'.$c->iso2.'-0002', 'title' => 'Tax, statutory and legal positions require qualified opinions.', 'category' => 'Legal & Tax', 'status' => 'Open', 'data' => ['consequence' => 'No numeric price; no transaction.', 'closure' => 'Qualified local opinion (L3)']],
                ['code' => 'ABS-'.$c->iso2.'-0003', 'title' => 'Payment rails, settlement and repatriation are unverified.', 'category' => 'Payments', 'status' => 'Open', 'data' => ['consequence' => 'No payment instruction permitted.', 'closure' => 'Finance / engineering rail verification']],
                ['code' => 'ABS-'.$c->iso2.'-0004', 'title' => 'Professional partner routes are not established.', 'category' => 'Partners', 'status' => 'Open', 'data' => ['consequence' => 'Regulated work cannot be routed.', 'closure' => 'Partner accreditation']],
            ]);
            $put($c, 'history', [
                ['code' => 'CT-CH-'.$c->iso2.'-0001', 'title' => 'Country object created as shell', 'category' => 'Status Change', 'type' => 'Activation State', 'status' => 'Recorded', 'recorded_on' => '2026-07-01', 'data' => ['at' => '2026-07-01 09:00', 'old' => '—', 'new' => 'INACTIVE/SHELLED', 'by' => 'TBCA System', 'reason' => 'CT-COUNTRY-OBJECT-v2.0.0 instantiation']],
            ]);
        }
    }

    public static function corridors(): void
    {
        $saTo = [
            ['AE', 'United Arab Emirates', 'Investment', 'Evidence Available', 6, 87, 9850000, 14250000, '15 – 25 days', 'Low', true],
            ['US', 'United States', 'Trade', 'Evidence Available', 8, 82, 11200000, 16800000, '20 – 30 days', 'Low', true],
            ['GB', 'United Kingdom', 'Investment', 'Limited Evidence', 3, 64, 8400000, 12100000, '25 – 40 days', 'Low', true],
            ['DE', 'Germany', 'Trade', 'Evidence Available', 5, 80, 7950000, 11750000, '18 – 28 days', 'Medium', true],
            ['IN', 'India', 'Capital Flow', 'No Evidence', 0, 28, 6200000, 9500000, '30 – 60 days', 'Medium', true],
            ['CN', 'China', 'Trade', 'Limited Evidence', 2, 45, 9100000, 13600000, '30 – 45 days', 'Medium', false],
            ['SG', 'Singapore', 'Investment', 'Limited Evidence', 2, 52, 7400000, 10900000, '25 – 35 days', 'Low', false],
            ['BR', 'Brazil', 'Trade', 'No Evidence', 0, 22, 6800000, 9900000, '40 – 60 days', 'Medium', false],
            ['CA', 'Canada', 'Investment', 'Limited Evidence', 1, 41, 7100000, 10300000, '30 – 45 days', 'Low', false],
            ['MX', 'Mexico', 'Trade', 'No Evidence', 0, 18, 6500000, 9400000, '45 – 60 days', 'Medium', false],
        ];
        foreach ($saTo as [$iso, $name, $type, $evs, $items, $conf, $min, $max, $time, $risk, $featured]) {
            Corridor::updateOrCreate(['code' => "COR-SA-{$iso}-001"], [
                'from_iso' => 'ZA', 'from_name' => 'South Africa', 'to_iso' => $iso, 'to_name' => $name, 'to_endpoint_state' => 'RESOLVER-READY',
                'type' => $type, 'purpose' => 'Market Entry', 'group_name' => "South Africa – {$name}", 'path_type' => 'Bilateral',
                'evidence_status' => $evs, 'evidence_items' => $items, 'confidence_pct' => $conf, 'cost_min_zar' => $min, 'cost_max_zar' => $max,
                'time_to_activate' => $time, 'risk' => $risk, 'pair_rcs' => $iso === 'AE' ? 100 : min(99, $conf + 10), 'pair_certified' => false, 'featured' => $featured,
                'details' => $iso === 'AE' ? self::aeDetails() : null,
            ]);
        }

        $african = [
            ['ZA', 'NG', 'SADC Intra-Corridor', 'Regional', 'Payment', 160, 312, 'Medium', 92, 28, 1450],
            ['ZA', 'KE', 'SADC / EAC Link', 'Inter-Regional', 'Process', 132, 246, 'Medium', 91, 32, 1210],
            ['KE', 'UG', 'EAC Corridor', 'Regional', 'Process', 94, 176, 'Low', 89, 30, 760],
            ['NG', 'GH', 'WAMZ Corridor', 'Regional', 'Payment', 78, 138, 'Medium', 88, 41, 680],
            ['GH', 'CI', 'WAMZ Corridor', 'Regional', 'Payment', 64, 116, 'Low', 86, 38, 620],
            ['TZ', 'RW', 'EAC Corridor', 'Regional', 'Delivery', 60, 110, 'Low', 84, 45, 540],
            ['ZM', 'CD', 'SADC Intra-Corridor', 'Regional', 'Process', 70, 128, 'High', 76, 55, 460],
            ['MZ', 'ZA', 'SADC Intra-Corridor', 'Regional', 'Payment', 50, 88, 'Medium', 74, 60, 410],
            ['BW', 'ZA', 'SADC Intra-Corridor', 'Regional', 'Payment', 52, 94, 'Low', 86, 34, 520],
            ['MZ', 'ZM', 'SADC Intra-Corridor', 'Regional', 'Delivery', 50, 88, 'Medium', 72, 64, 380],
            ['ET', 'DJ', 'Horn of Africa', 'Regional', 'Delivery', 44, 80, 'Low', 70, 66, 360],
            ['EG', 'SD', 'Nile Corridor', 'Regional', 'Process', 58, 104, 'High', 65, 70, 300],
        ];
        $names = collect(CountryRegister::countries())->mapWithKeys(fn ($c) => [$c[0] => $c[2]]);
        foreach ($african as [$from, $to, $group, $pathType, $type, $inv, $rev, $risk, $rcs, $friction, $potential]) {
            Corridor::updateOrCreate(['code' => "COR-{$from}-{$to}-001"], [
                'from_iso' => $from, 'from_name' => $names[$from], 'to_iso' => $to, 'to_name' => $names[$to], 'to_endpoint_state' => null,
                'type' => $type, 'purpose' => 'Market Entry', 'group_name' => $group, 'path_type' => $pathType,
                'evidence_status' => $rcs >= 85 ? 'Evidence Available' : 'Limited Evidence', 'evidence_items' => intdiv($rcs, 15), 'confidence_pct' => $rcs - 8,
                'cost_min_zar' => $inv * 1000000, 'cost_max_zar' => $rev * 1000000, 'time_to_activate' => 'Not estimable (endpoint shell)', 'risk' => $risk,
                'pair_rcs' => $rcs, 'pair_certified' => false, 'featured' => false,
                'details' => ['investment_m' => $inv, 'revenue_m' => $rev, 'friction' => $friction, 'potential_m' => $potential],
            ]);
        }

        $ae = Corridor::where('code', 'COR-SA-AE-001')->first();
        foreach (self::FEES as $ledger => $lines) {
            foreach ($lines as $n => $l) {
                FeeLine::updateOrCreate(['corridor_id' => $ae->id, 'ledger' => $ledger, 'line_no' => $n + 1], [
                    'name' => $l[0], 'description' => $l[1], 'payer' => 'Client', 'payable_to' => $l[2] ?? null, 'jurisdiction' => $l[3] ?? null,
                    'basis' => $l[4], 'quantity' => $l[5] ?? 1, 'unit_amount' => $l[6], 'amount' => $l[6] === null ? null : $l[6] * ($l[5] ?? 1),
                    'currency' => $l[7] ?? 'ZAR', 'fx_to_zar' => ($l[7] ?? 'ZAR') === 'AED' ? 4.5367 : 1, 'when_payable' => $l[8] ?? null,
                    'evidence_ref' => $l[9] ?? null, 'certainty' => $l[10] ?? 'model_basis',
                    'resolver_ref' => $ledger === 'T' ? sprintf('RES-SZA-UAE-CT-041-%03d', $n + 1) : null,
                    'status' => ($l[10] ?? '') === 'suppressed' ? 'Suppressed' : ($ledger === 'P' ? 'Verified' : 'Current'),
                ]);
            }
        }
    }

    /** [name, description, payable to, jurisdiction, basis, qty, unit, currency, when, evidence, certainty] */
    private const FEES = [
        'T' => [
            ['Discovery & Resolver Setup', 'Client intake, resolver setup & scoping', 'TBCA', 'SA', 'Model Basis', 1, 18750, 'ZAR', 'On engagement', null, 'resolved'],
            ['Country Context Assessment', 'Country profile review & commercial context', 'TBCA', 'SA', 'Model Basis', 1, 22500, 'ZAR', 'On engagement', null, 'model_basis'],
            ['Regulatory Review Coordination', 'Regulatory landscape & compliance mapping', 'TBCA', 'SA', 'Model Basis', 1, 27500, 'ZAR', 'On milestone', null, 'resolved'],
            ['Corridor Structuring Review', 'Corridor viability & structure review', 'TBCA', 'SA', 'Model Basis', 1, 31250, 'ZAR', 'On milestone', null, 'model_basis'],
            ['Evidence Pack Preparation', 'Assemble evidence pack for permission', 'TBCA', 'SA', 'Model Basis', 1, 26000, 'ZAR', 'On milestone', null, 'resolved'],
            ['Client Advisory Session', 'Review findings & recommendations', 'TBCA', 'SA', 'Model Basis', 1, 15000, 'ZAR', 'On delivery', null, 'resolved'],
            ['Activation Planning', 'Activation roadmap & next steps', 'TBCA', 'SA', 'Model Basis', 1, 17500, 'ZAR', 'On delivery', null, 'model_basis'],
            ['Ongoing Support Option', 'Post-activation advisory support (monthly)', 'TBCA', 'SA', 'Model Basis', 1, null, 'ZAR', 'Monthly', null, 'suppressed'],
        ],
        'X' => [
            ['UAE Commercial Registration Fee', 'Fees for trade name reservation and commercial licence issuance', 'Department of Economic Development (DED), UAE', 'UAE', 'Per licence', 1, 14250, 'AED', 'At incorporation', 'EVD-X-001'],
            ['Notarisation & Legalisation (UAE)', 'Notarisation and MOFA attestation of documents', 'UAE Notary Public & Ministry of Foreign Affairs', 'UAE', 'Per document', 1, 1850, 'AED', 'Pre-licence', 'EVD-X-002'],
            ['Emirates ID Establishment Card', 'Issuance of establishment card for company', 'Federal Authority for Identity, Citizenship, Customs & Port Security', 'UAE', 'Per company', 1, 1035, 'AED', 'Post-licence', 'EVD-X-003'],
            ['Immigration Establishment Card Fee', 'Company immigration file establishment', 'General Directorate of Residency & Foreigners Affairs', 'UAE', 'Per establishment', 1, 620, 'AED', 'Post-licence', 'EVD-X-004'],
            ['Chamber of Commerce Membership', 'Annual membership and registration', 'Dubai Chamber of Commerce', 'UAE', 'Annual', 1, 1200, 'AED', 'Annual', 'EVD-X-005'],
            ['PRO Services (Government Liaison)', 'Government liaison and document processing', 'Authorised PRO / Typing Centre', 'UAE', 'Lump sum', 1, 850, 'AED', 'As required', 'EVD-X-006'],
        ],
        'S' => [
            ['CIPC Name Reservation', 'Business name reservation', 'CIPC', 'SA', 'Per reservation', 1, 100, 'ZAR', 'At reservation', 'EVD-S-001'],
            ['CIPC Company Registration', 'Company registration fee', 'CIPC', 'SA', 'Per company', 1, 1250, 'ZAR', 'On incorporation', 'EVD-S-002'],
            ['CIPC Annual Return Fee', 'Annual return fee', 'CIPC', 'SA', 'Per company', 1, 100, 'ZAR', 'Annually', 'EVD-S-003'],
            ['SARS VAT Registration', 'VAT registration', 'SARS', 'SA', 'Per registration', 1, 0, 'ZAR', 'At registration', 'EVD-S-004'],
            ['SARS Tax Clearance Certificate', 'Tax clearance certificate', 'SARS', 'SA', 'Per certificate', 1, 0, 'ZAR', 'When requested', 'EVD-S-005'],
            ['MOFA Attestation (UAE)', 'Document attestation', 'MOFA UAE', 'UAE', 'Per document', 1, 150, 'ZAR', 'Pre-licence', 'EVD-S-006'],
            ['UAE Trade Name Reservation', 'Trade name reservation', 'DED, UAE', 'UAE', 'Per reservation', 1, 525, 'ZAR', 'At reservation', 'EVD-S-007'],
            ['UAE Licence Issue Fee', 'Commercial licence issue', 'DED, UAE', 'UAE', 'Per licence', 1, 3000, 'ZAR', 'On licence issue', 'EVD-S-008'],
        ],
        'P' => [
            ['Norton Rose Fulbright', 'Corporate Structuring & Incorporation', 'Law Firm', 'UAE', 'Per engagement', 1, 18000, 'AED', 'On engagement', 'EVD-P-001'],
            ['PwC Middle East', 'Tax Advisory - UAE', 'Accounting Firm', 'UAE', 'Per engagement', 1, 22500, 'AED', 'On completion', 'EVD-P-002'],
            ['Deloitte & Touche (ME)', 'Audit & Assurance', 'Accounting Firm', 'UAE', 'Per engagement', 1, 19750, 'AED', 'On completion', 'EVD-P-003'],
            ['Afridi & Angell', 'Legal Advisory (UAE Law)', 'Law Firm', 'UAE', 'Per hour', 1, 1250, 'AED', 'Monthly', 'EVD-P-004'],
            ['BDO South Africa', 'Cross-border Tax Advisory', 'Accounting Firm', 'SA', 'Per engagement', 1, 15000, 'ZAR', 'On completion', 'EVD-P-005'],
            ['ENSafrica', 'Regulatory Compliance', 'Law Firm', 'SA', 'Per engagement', 1, 12500, 'ZAR', 'On completion', 'EVD-P-006'],
            ['GIBS (Gordon Institute)', 'Market Entry Advisory', 'Consulting Firm', 'SA', 'Per engagement', 1, 8750, 'ZAR', 'On completion', 'EVD-P-007'],
            ['AfricSearch', 'Background & Due Diligence', 'Specialist Provider', 'SA', 'Per report', 1, 2950, 'ZAR', 'On delivery', 'EVD-P-008'],
        ],
        'D' => [
            ['Global Company Registry', 'Company Data — Annual Subscription', 'Orbis (Bureau van Dijk)', 'SA', 'Per country', 1, 12900, 'ZAR', 'Annually', 'EVD-D-001'],
            ['Africa Regulatory Database', 'Regulatory Data — Annual Subscription', 'RegulData (Africa)', 'SA', 'Per country', 1, 8750, 'ZAR', 'Annually', 'EVD-D-002'],
            ['UAE Laws & Regulations Feed', 'Legal & Statutory Data — Annual Subscription', 'LexisNexis Middle East', 'UAE', 'Per country', 1, 11600, 'ZAR', 'Annually', 'EVD-D-003'],
            ['Global Sanctions & PEP List', 'Compliance Data — Annual Subscription', 'Dow Jones (Risk Center)', 'SA', 'Per user', 1, 6850, 'ZAR', 'Annually', 'EVD-D-004'],
            ['Trade & Tariff Dataset', 'Trade Data — Annual Licence', 'UN Comtrade', 'SA', 'Per licence', 1, 3250, 'ZAR', 'Annually', 'EVD-D-005'],
            ['Economic Indicators API', 'Economic Data — Annual Subscription', 'World Bank Data API', 'SA', 'Per seat', 1, 4950, 'ZAR', 'Annually', 'EVD-D-006'],
            ['Market Intelligence Platform', 'Market Intelligence — Annual Subscription', 'Statista', 'SA', 'Per user', 1, 9900, 'ZAR', 'Annually', 'EVD-D-007'],
            ['Document Translation Engine', 'Tools & Software — Annual Subscription', 'DeepL Pro (API)', 'SA', 'Per seat', 1, 2750, 'ZAR', 'Annually', 'EVD-D-008'],
        ],
        'CT-C' => [
            ['Cross-Border Compliance Coordination', 'Coordination with authorities and compliance for cross-border requirements', 'TBCA / Partners', 'SA–UAE', 'Per engagement', 1, 12500, 'ZAR', 'On engagement', 'EVD-CTC-001'],
            ['Documentation Legalisation & Attestation', 'Apostille / legalisation / attestation for documents where required', 'Authorities', 'SA–UAE', 'Per document', 8, 750, 'ZAR', 'Per document', 'EVD-CTC-002'],
            ['Cross-Border Bank & FX Routing', 'Banking relationships, FX routing and settlement facilitation costs', 'Banks', 'SA–UAE', 'Per transfer setup', 1, 7900, 'ZAR', 'On setup', 'EVD-CTC-003'],
            ['Partner Coordination & Handover', 'Cross-border partner coordination and professional handover', 'Partners', 'SA–UAE', 'Per engagement', 1, 18000, 'ZAR', 'On engagement', 'EVD-CTC-004'],
            ['Regulatory Filing Routing', 'Filing routing and submissions through relevant jurisdictions', 'Authorities', 'SA–UAE', 'Per filing', 3, 2200, 'ZAR', 'On filing', 'EVD-CTC-005'],
            ['Courier / Secure Dispatch', 'Secure courier of original documents where physical transfer is required', 'Courier', 'SA–UAE', 'Per dispatch', 2, 1450, 'ZAR', 'On dispatch', 'EVD-CTC-006'],
        ],
    ];

    private static function aeDetails(): array
    {
        return [
            'corridor_id' => 'COR-SA-AE-001', 'created' => '01 Aug 2026', 'last_reviewed' => '15 Aug 2026', 'package_ref' => 'EVD-COR-SA-AE-001',
            'strengths' => ['Evidence-supported regulatory pathway', 'High confidence based on 6 verified items', 'Service-by-service commercial permission', 'No outstanding hard blocks on the departure endpoint', 'Resolver-ready in destination market'],
            'evidence' => [
                ['Regulatory & Legal', 'Investment laws and regulations governing foreign investors.', 'Government Publication', 'SA Investment Act, 2016 GN R. 1180', '12 Aug 2026'],
                ['Tax & Fiscal', 'Double Tax Agreement (DTA) South Africa – UAE.', 'Government Treaty', 'DTA SA–UAE (2013) Schedule & Art. 7', '13 Aug 2026'],
                ['Financial & Banking', 'Banking access for foreign investors and capital flows.', 'Regulator Guideline', 'SARB Exchange Control Circular 5/2022', '13 Aug 2026'],
                ['Immigration & Mobility', 'Investor visa and residency pathways.', 'Government Portal', 'UAE ICP – Investor Visa Program', '12 Aug 2026'],
                ['Trade & Customs', 'Customs duties, import/export procedures and codes.', 'Government Publication', 'UAE Federal Customs Tariff – 2024', '11 Aug 2026'],
                ['Commercial Environment', 'Market overview, ease of doing business and sector openness.', 'International Report', 'World Bank – EoDB 2024 (UAE Rank 16)', '12 Aug 2026'],
            ],
            'timeline' => [['Resolver Mandate & Engagement', 'Day 1 – Day 3'], ['Regulatory & Compliance Processing', 'Day 4 – Day 15'], ['Approvals & Licences', 'Day 16 – Day 20'], ['Commercial & Service Setup', 'Day 21 – Day 25'], ['Activation Complete', 'Day 15 – Day 25']],
            'endpoints' => [
                'Regulatory Environment' => ['Strong', 'Strong'], 'Ease of Doing Business' => ['Rank 82 / 190', 'Rank 16 / 190'],
                'Time Zone' => ['SAST (UTC+2)', 'GST (UTC+4)'], 'Primary Language' => ['English', 'English / Arabic'],
                'Key Regulator' => ['CIPC, SARS, FIC', 'MoEF, ADGM, DFSA'], 'Currency' => ['ZAR – South African Rand', 'AED – UAE Dirham'],
                'Key Strength' => ['Financial market depth, infrastructure', 'Strategic location, capital connectivity'],
            ],
            'categories' => [
                ['Business Setup', 7, [28950, 67450, 8700, 35200, 12400, 9800]], ['Tax & Compliance', 14, [26750, 59800, 14200, 48900, 16250, 12600]],
                ['Banking & Finance', 9, [17850, 41900, 5300, 21600, 7900, 6700]], ['Employment & HR', 8, [11700, 24350, 2100, 10800, 3900, 3300]],
                ['Trade & Customs', 6, [9800, 18950, 1600, 7600, 2900, 2900]], ['Other Categories', 98, [29800, 65850, 4300, 32600, 18600, 18600]],
            ],
        ];
    }

    public static function governance(): void
    {
        $obs = [
            ['L9-OC-20260815-00123', 'Marketplace Brief', 'Nigeria', 'Payment Success', 'NIP Transfer Success Rate', '10:18', 86, 0.82, null, 'under_review', 'Medium', 'Evidence Candidate'],
            ['L9-OC-20260815-00122', 'Client Portal', 'Kenya', 'Process Turnaround', 'Company Registration (Avg Days)', '10:05', 91, 0.91, null, 'candidate', 'Medium', 'Evidence Candidate'],
            ['L9-OC-20260815-00121', 'Corridor Workflow', 'SA → Kenya', 'Corridor Friction', 'Cross-border Settlement Delay', '09:52', 88, 0.76, null, 'candidate', 'High', 'Product Candidate'],
            ['L9-OC-20260815-00120', 'Partner Delivery', 'Ghana', 'Regulatory Friction', 'Work Permit Processing', '09:41', 93, 0.88, null, 'under_review', 'Medium', 'Evidence Candidate'],
            ['L9-OC-20260815-00119', 'Evidence Acquisition', 'South Africa', 'Evidence Availability', 'Bank Confirmation (Days to Obtain)', '09:30', 78, 0.68, null, 'candidate', 'Low', 'Evidence Candidate'],
            ['L9-OC-20260815-00118', 'WhatsApp / Talk', 'Tanzania', 'Client Outcome Signal', 'Satisfaction – Delivery Experience', '09:21', 85, 0.79, null, 'candidate', 'Low', 'Evidence Candidate'],
            ['L9-OC-20260815-00117', 'Due Diligence', 'Mozambique', 'Liquidity Friction', 'FX Availability – USD', '09:10', 90, 0.84, null, 'under_review', 'High', 'Product Candidate'],
            ['L9-OC-20260815-00116', 'Subscription Delivery', 'Uganda', 'Delivery Variance', 'Plan vs Actual Time Variance', '08:58', 84, 0.72, null, 'candidate', 'Medium', 'Product Candidate'],
            ['L9-CAND-20260815-0156', 'Client Portal', 'Kenya', 'Process Turnaround', 'Company Registration (Avg Days)', '10:22', 91, 0.91, 0.92, 'anonymity_review', 'Medium', 'Evidence Candidate'],
            ['L9-CAND-20260815-0155', 'Marketplace Brief', 'South Africa', 'Payment Success', 'Card Authorisation Success', '10:20', 93, 0.90, 0.95, 'anonymity_review', 'Low', 'Evidence Candidate'],
            ['L9-CAND-20260815-0154', 'Partner Delivery', 'Nigeria', 'Regulatory Friction', 'Licence Turnaround', '10:15', 88, 0.86, 0.89, 'anonymity_review', 'High', 'Product Candidate'],
            ['L9-CAND-20260815-0153', 'WhatsApp / Talk', 'Tanzania', 'Client Outcome Signal', 'Advice Satisfaction', '10:11', 86, 0.84, 0.88, 'anonymity_review', 'Medium', 'Evidence Candidate'],
            ['L9-CAND-20260815-0152', 'Corridor Workflow', 'Zambia', 'Corridor Friction', 'Border Document Delay', '10:08', 89, 0.87, 0.90, 'passed_gate', 'Medium', 'Product Candidate'],
            ['L9-CAND-20260815-0151', 'Subscription Delivery', 'Uganda', 'Delivery Variance', 'Plan vs Actual Variance', '10:03', 90, 0.89, 0.93, 'passed_gate', 'Low', 'Product Candidate'],
            ['L9-CAND-20260815-0150', 'Client Portal', 'Ghana', 'Documentation Delay', 'Document Turnaround', '09:59', 76, 0.72, 0.61, 'rejected', 'Medium', 'Evidence Candidate'],
            ['L9-CAND-20260815-0149', 'Partner Delivery', 'Mozambique', 'Evidence Acquisition', 'Source Effort (Hours)', '09:56', 82, 0.82, 0.81, 'anonymity_review', 'Low', 'Evidence Candidate'],
        ];
        foreach ($obs as $o) {
            Observation::updateOrCreate(['code' => $o[0]], [
                'origin_surface' => $o[1], 'subject_area' => $o[2], 'observation_class' => $o[3], 'metric' => $o[4],
                'captured_at' => "2026-08-15 {$o[5]}:00", 'rcs_link' => $o[6], 'quality_score' => $o[7], 'anonymity_score' => $o[8],
                'status' => $o[9], 'risk' => $o[10], 'candidate_type' => $o[11],
            ]);
        }

        $ret = [
            ['RET-20260815-0048', 'EV-2026-08-01234', 'Payment Success Rate - Q2', 'Payment', 'Marketplace Brief', 'South Africa', 'AIIM Data Steward', 'under_review', 'High', 342, 48],
            ['RET-20260815-0047', 'EV-2026-07-00987', 'Process Turnaround Time', 'Process', 'Client Portal', 'Kenya', 'Partner Auditor', 'under_review', 'Medium', 276, 31],
            ['RET-20260815-0046', 'EV-2026-07-00876', 'Corridor Friction Index', 'Corridor', 'Corridor Workflow', 'Nigeria → Ghana', 'AIIM Data Steward', 'approved', 'High', 198, 26],
            ['RET-20260815-0045', 'EV-2026-06-01200', 'Evidence Acquisition Effort', 'Evidence', 'Partner Delivery', 'Tanzania', 'Partner Auditor', 'approved', 'Medium', 164, 19],
            ['RET-20260815-0044', 'EV-2026-07-00765', 'Regulatory Friction Score', 'Regulatory', 'WhatsApp / Talk', 'Uganda', 'AIIM Data Steward', 'awaiting_info', 'Low', 92, 9],
            ['RET-20260815-0043', 'EV-2026-07-00654', 'Delivery Variance Signal', 'Delivery', 'Subscription Delivery', 'Mozambique', 'AIIM Data Steward', 'under_review', 'Low', 68, 5],
            ['RET-20260815-0042', 'EV-2026-08-01111', 'Client Outcome Satisfaction', 'Outcome', 'Client Portal', 'Zambia', 'Client Champion', 'approved', 'Medium', 108, 14],
            ['RET-20260815-0041', 'EV-2026-07-00543', 'Liquidity Friction Index', 'Liquidity', 'Marketplace Brief', 'South Africa', 'AIIM Data Steward', 'rejected', 'Low', 0, 0],
        ];
        foreach ($ret as $r) {
            Retraction::updateOrCreate(['code' => $r[0]], [
                'evidence_ref' => $r[1], 'evidence_title' => $r[2], 'evidence_type' => $r[3], 'origin_surface' => $r[4], 'subject_area' => $r[5],
                'requested_by' => $r[6], 'status' => $r[7], 'impact' => $r[8],
                'objects_impacted' => $r[7] === 'rejected' ? 0 : $r[9], 'products_impacted' => $r[10],
                'outputs_impacted' => (int) round($r[9] * 0.78), 'clients_notified' => $r[7] === 'approved' ? (int) round($r[9] * 0.25) : 0,
                'created_at' => '2026-08-15 10:00:00',
            ]);
        }

        $allApproved = ['resolver_owner' => 'approved', 'compliance' => 'approved', 'tax' => 'approved', 'legal' => 'approved', 'board' => 'approved'];
        $rel = [
            ['CT-R-027', 'CT-TEB v2.0.1', 'Production', 54, 1248, 'ready', 96, '2026-08-29', $allApproved, ['critical' => 0, 'high' => 1, 'medium' => 2, 'low' => 1], true],
            ['CT-R-026', 'CT-TEB v2.0.1 RC2', 'UAT', 54, 842, 'in_uat', 88, '2026-08-22', ['resolver_owner' => 'approved', 'compliance' => 'approved', 'tax' => 'pending', 'legal' => 'pending', 'board' => 'pending'], ['critical' => 2, 'high' => 3, 'medium' => 2, 'low' => 1], false],
            ['CT-R-025', 'CT-TEB v2.0.1 RC1', 'UAT', 42, 611, 'in_uat', 84, '2026-08-15', ['resolver_owner' => 'approved', 'compliance' => 'pending', 'tax' => 'pending', 'legal' => 'pending', 'board' => 'pending'], ['critical' => 0, 'high' => 1, 'medium' => 1, 'low' => 0], false],
            ['CT-R-024', 'CT-TEB v2.0.0 HF2', 'Production', 54, 301, 'released', 100, '2026-08-05', $allApproved, [], true],
            ['CT-R-023', 'CT-TEB v2.0.0 HF1', 'Production', 54, 276, 'released', 100, '2026-07-20', $allApproved, [], true],
            ['CT-R-022', 'CT-TEB v2.0.0', 'Production', 54, 7008, 'released', 100, '2026-07-01', $allApproved, [], true],
        ];
        foreach ($rel as $r) {
            Release::updateOrCreate(['code' => $r[0]], [
                'name' => $r[1], 'environment' => $r[2], 'countries' => $r[3], 'scope_objects' => $r[4], 'status' => $r[5], 'readiness' => $r[6],
                'target_date' => $r[7], 'authorisations' => $r[8], 'defects' => $r[9], 'rollback_proven' => $r[10],
            ]);
        }
    }

    public static function demand(): void
    {
        $za = Country::where('iso2', 'ZA')->first();
        $orgs = ['GreenFuture (Pty) Ltd', 'TechNova Solutions', 'BuildRight Projects', 'FutureRetail (Pty) Ltd', 'ImpactLab Africa', 'Karoo Foods', 'Umoya Energy', 'Sizwe Logistics', 'Ubuntu Health', 'Lekker Digital'];
        $cats = [['specialist', 'ESG Advisory & Reporting'], ['tax', 'Tax Advisory & Compliance'], ['financial', 'Funding & Investor Readiness'], ['financial', 'Business Valuation'], ['hr', 'Payroll & HR Compliance'], ['trade', 'Cross-Border Settlement Services']];
        $sectors = ['Technology & Digital Services', 'Manufacturing', 'Professional Services', 'Construction & Real Estate', 'Retail & E-Commerce'];
        $provinces = ['Gauteng', 'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Gauteng', 'Western Cape', 'Free State'];
        $levels = ['high', 'high', 'medium', 'high', 'medium', 'low', 'watchlist', 'medium'];
        for ($i = 0; $i < 64; $i++) {
            $cat = $cats[$i % count($cats)];
            $org = $orgs[$i % count($orgs)];
            Interest::updateOrCreate(['episode_key' => hash('sha256', "seed|ZA|{$i}")], [
                'reference' => sprintf('TBCA-WL-2026-SA%04d', $i + 1), 'country_id' => $za->id,
                'service_category' => $cat[0], 'service_code' => null, 'name' => 'Demo Contact '.($i + 1), 'email' => "contact{$i}@example.co.za",
                'organisation' => $org, 'sector' => $sectors[$i % 5], 'province' => $provinces[$i % 8], 'interest_level' => $levels[$i % 8],
                'origin_surface' => ['countries', 'shop', 'aiim', 'whatsapp'][$i % 4], 'notes' => $cat[1],
                'created_at' => Carbon::parse('2026-08-15 12:00')->subHours($i * 7),
            ]);
        }
        foreach (['KE' => 9, 'NG' => 12, 'GH' => 6] as $iso => $n) {
            $c = Country::where('iso2', $iso)->first();
            for ($i = 0; $i < $n; $i++) {
                Interest::updateOrCreate(['episode_key' => hash('sha256', "seed|{$iso}|{$i}")], [
                    'reference' => sprintf('TBCA-WL-2026-%s%04d', $iso, $i + 1), 'country_id' => $c->id, 'service_category' => $cats[$i % 6][0],
                    'name' => 'Demo Contact', 'email' => "lead{$i}.{$iso}@example.com", 'organisation' => $orgs[$i % 10], 'interest_level' => $levels[$i % 8],
                    'notes' => 'Country activation interest', 'created_at' => Carbon::parse('2026-08-10'),
                ]);
            }
        }
    }

    public static function engagements(): void
    {
        $user = User::where('email', 'amahle@agritechsa.co.za')->first();
        if (! $user) {
            return;
        }
        $za = Country::where('iso2', 'ZA')->first();
        $contact = ['name' => $user->name, 'email' => $user->email, 'phone' => $user->phone, 'organisation' => 'GreenFuture (Pty) Ltd', 'country' => 'South Africa', 'preferred' => 'Email'];

        $active = Engagement::updateOrCreate(['reference' => 'ENG-2026-00123'], [
            'user_id' => $user->id, 'country_id' => $za->id, 'status' => 'active', 'request_type' => 'engagement', 'service_category' => 'specialist',
            'service_code' => 'ZA-SPA-002', 'title' => 'ESG Advisory & Reporting', 'summary' => 'ESG baseline, stakeholder engagement and annual ESG report for our South African operations.',
            'scope' => 'See Engagement Letter, Schedules & SoW', 'sector' => 'Agriculture', 'region' => 'Gauteng', 'desired_start' => '2026-09-01', 'budget_range' => 'R100k – R250k',
            'contact' => $contact, 'letter' => self::letter('EL-2026-00123', 'SA/EL/2026/0013'), 'letter_accepted_at' => '2026-08-15 09:00:00',
            'activated_at' => '2026-08-12 09:00:00', 'workspace' => self::workspace(),
        ]);
        ChangeRequest::updateOrCreate(['reference' => 'CR-2026-0027'], [
            'engagement_id' => $active->id, 'change_type' => 'Scope Change', 'reason' => 'Additional ESG data requirements and extended stakeholder review.',
            'desired_date' => '2026-09-01', 'requested_by' => 'John Smith (ESG Specialist)', 'impact' => 'Medium', 'status' => 'impact_assessment', 'reresolution_required' => true,
            'assessment' => ['Scope Impact' => 'Increased', 'Timeline Impact' => '+10 business days', 'Fee Impact (est.)' => '+R18,400.00 (incl. VAT)', 'Resource Impact' => 'Additional ESG Analyst time', 'Deliverables Impact' => 'Additional stakeholder report', 'Risk Impact' => 'Low', 'Overall Impact' => 'Medium'],
        ]);
        foreach ([['CR-2026-0019', 'Timeline Change', '2026-08-05', 'approved', 'Low'], ['CR-2026-0012', 'Deliverable Change', '2026-07-28', 'approved', 'Medium'], ['CR-2026-0007', 'Scope Change', '2026-07-15', 'closed', 'Low']] as $c) {
            ChangeRequest::updateOrCreate(['reference' => $c[0]], [
                'engagement_id' => $active->id, 'change_type' => $c[1], 'reason' => 'Historical change request.', 'requested_by' => 'Lerato Molefe',
                'impact' => $c[4], 'status' => $c[3], 'created_at' => $c[2].' 09:00:00',
            ]);
        }

        Engagement::updateOrCreate(['reference' => 'ENG-2026-00124'], [
            'user_id' => $user->id, 'country_id' => $za->id, 'status' => 'letter_issued', 'request_type' => 'engagement', 'service_category' => 'specialist',
            'service_code' => 'ZA-SPA-002', 'title' => 'ESG Advisory & Reporting – Phase 2', 'summary' => 'Extension of ESG advisory to subsidiary operations.',
            'scope' => 'See Engagement Letter, Schedules & SoW', 'sector' => 'Agriculture', 'region' => 'Gauteng', 'desired_start' => '2026-10-15',
            'contact' => $contact, 'letter' => self::letter('EL-2026-00124', 'SA/EL/2026/0014'),
        ]);

        SovereignEngagement::updateOrCreate(['reference' => 'SA-ENG-2026-0815-001'], [
            'user_id' => $user->id, 'country_id' => $za->id, 'stage' => 4, 'status' => 'release',
            'intake' => ['type' => 'Sovereign Activation', 'title' => 'National Activation Advisory & Evidence Assurance', 'description' => 'Country activation readiness and evidence assurance for national programme.', 'priority' => 'High', 'start_date' => '2026-09-01', 'duration' => '1 month', 'value' => 1250000, 'entity' => 'National Treasury', 'contact' => 'Amahle Dlamini', 'designation' => 'Programme Director', 'email' => 'programme@treasury.gov.za', 'phone' => '+27 12 315 5111', 'areas' => ['Country Activation Support', 'Evidence Assurance'], 'scope' => 'National (South Africa)', 'completion' => '2026-09-30'],
            'declarations' => [
                ['id' => 'CD-0001', 'type' => 'Financial Interest', 'party' => 'ABC Consulting (Pty) Ltd', 'nature' => '10% shareholding in associated entity', 'level' => 'Actual', 'plan' => 'Recusal from evaluation panel', 'by' => 'John Advisor', 'date' => '15 Aug 2026'],
                ['id' => 'CD-0002', 'type' => 'Employment History', 'party' => 'Jane Advisor', 'nature' => 'Former employee (ended 18 months ago)', 'level' => 'Potential', 'plan' => 'Cooling-off period observed', 'by' => 'Jane Advisor', 'date' => '15 Aug 2026'],
                ['id' => 'CD-0003', 'type' => 'Business Relationship', 'party' => 'GovTech Solutions', 'nature' => 'Current service provider to department', 'level' => 'Potential', 'plan' => 'Information barriers in place', 'by' => 'John Advisor', 'date' => '15 Aug 2026'],
                ['id' => 'CD-0004', 'type' => 'No Conflict', 'party' => 'N/A', 'nature' => 'No relevant interests or relationships', 'level' => 'None', 'plan' => 'N/A', 'by' => 'John Advisor', 'date' => '15 Aug 2026'],
            ],
            'disclosure_submitted_at' => '2026-08-15 10:00:00', 'conflict_outcome' => 'Cleared with Safeguards', 'independence_confirmed_at' => '2026-08-15 11:00:00', 'evidence_approved_at' => '2026-08-15 12:00:00',
            'deliverables' => [
                ['name' => 'Country Activation Readiness Report', 'type' => 'Report', 'version' => 'v1.0', 'pack' => 'EV-SA-0001', 'reviewer' => 'TBCA Reviewer Panel', 'date' => '15 Aug 2026', 'quality' => 94, 'status' => 'approved', 'package' => 'CAR-Report_v1.0.zip'],
                ['name' => 'Evidence Assurance Summary', 'type' => 'Summary', 'version' => 'v1.0', 'pack' => 'EV-SA-0002', 'reviewer' => 'John Naidoo (Lead Reviewer)', 'date' => '15 Aug 2026', 'quality' => 92, 'status' => 'approved', 'package' => 'EAS_v1.0.zip'],
                ['name' => 'Independence & Conflict Statement', 'type' => 'Statement', 'version' => 'v1.0', 'pack' => 'EV-SA-0003', 'reviewer' => 'TBCA Independence Officer', 'date' => '15 Aug 2026', 'quality' => 100, 'status' => 'approved', 'package' => 'ICS_v1.0.zip'],
            ],
        ]);
    }

    public static function letter(string $ref, string $docRef): array
    {
        return [
            'reference' => $ref, 'document_ref' => $docRef, 'version' => 'v1.0', 'date' => '15 August 2026', 'engagement_type' => 'Retainer (C1)',
            'client' => 'GreenFuture (Pty) Ltd', 'client_id' => 'CLI-447821', 'client_reg' => '2021/113344/07', 'scope' => 'ESG Advisory & Reporting',
            'term_months' => 12, 'start' => '01 Sep 2026', 'end' => '31 Aug 2027', 'payment_terms' => 'Net 30', 'monthly_estimate' => 35000,
            'fees' => [
                ['ledger' => 'T', 'label' => 'Platform Access & Enablement', 'recipient' => 'TBCA', 'amount' => 5000],
                ['ledger' => 'X', 'label' => 'Crossing / Liquidity', 'recipient' => 'Third-party providers', 'amount' => 2400],
                ['ledger' => 'T', 'label' => 'Service Delivery', 'recipient' => 'TBCA', 'amount' => 75600],
                ['ledger' => 'P', 'label' => 'Professional Review', 'recipient' => 'Approved partner', 'amount' => 12000],
                ['ledger' => 'D', 'label' => 'Data & Evidence Access', 'recipient' => 'Data licensors', 'amount' => 6000],
            ],
            'checklist' => [
                ['Parties', 'compliant', ''], ['Engagement & Purpose', 'compliant', ''], ['Scope of Work', 'compliant', ''], ['Deliverables', 'compliant', ''],
                ['Fees & Payment Terms', 'needs_review', 'Verify fee estimate'], ['Expenses & Disbursements', 'compliant', ''], ['Client Responsibilities', 'compliant', ''],
                ['TBCA Responsibilities', 'compliant', ''], ['Confidentiality', 'compliant', ''], ['Limitation of Liability', 'needs_review', 'Confirm cap amount'],
                ['Indemnity', 'compliant', ''], ['Term & Termination', 'compliant', ''], ['Governing Law & Jurisdiction', 'compliant', ''], ['Schedules & Annexures', 'not_applicable', 'See attached notes'],
            ],
            'documents' => [['Company Registration (Client)', 'Uploaded'], ['Directors\' Resolution / Mandate', 'Uploaded'], ['FICA / KYC Documentation', 'Uploaded'], ['POPIA Consent (Where applicable)', 'Uploaded']],
            'gate' => [['Conflict Check', 'Cleared'], ['Risk Assessment', 'Low'], ['Regulatory Check', 'Compliant'], ['Quality Gate', 'Passed']],
        ];
    }

    private static function workspace(): array
    {
        return [
            'next_milestone' => ['Deliver ESG Baseline Report', '22 Aug 2026'],
            'milestones' => [
                ['Engagement Activated', '12 Aug 2026', 'completed'], ['Stakeholder Engagement Plan', '05 Aug 2026', 'completed'], ['Data Request Submitted', '01 Aug 2026', 'completed'],
                ['ESG Data Collection', '08 Aug 2026', 'completed'], ['Deliver ESG Baseline Report', '22 Aug 2026', 'in_progress'], ['Stakeholder Consultation Workshop', '29 Aug 2026', 'pending'],
                ['ESG Action Plan Draft', '12 Sep 2026', 'pending'], ['Final ESG Report Delivery', '30 Sep 2026', 'pending'], ['Engagement Review', 'TBD', 'pending'], ['Engagement Closure', 'TBD', 'pending'],
            ],
            'deliverables' => [
                ['ESG Baseline Report (Draft)', 'v1.1', 'completed', '24 Jul 2026', 'Lerato M.', 'ZA-01', true],
                ['Stakeholder Consultation Summary', 'v1.0', 'in_review', '12 Aug 2026', 'John S.', 'ZA-01', false],
                ['Data Request Register', 'v1.2', 'in_progress', '18 Aug 2026', 'Priya S.', 'ZA-02', false],
                ['Materiality Workshop Brief', 'v1.0', 'in_progress', '22 Aug 2026', 'Lerato M.', 'ZA-01', false],
                ['Evidence Pack ZA-01', 'v1.0', 'pending', '26 Aug 2026', 'TBC', 'ZA-01', false],
                ['Final ESG Report', 'v0.1', 'not_started', '05 Sep 2026', 'TBC', '—', false],
            ],
            'tasks' => ['completed' => 7, 'in_progress' => 6, 'pending' => 3, 'not_started' => 2],
            'activity' => [['Document uploaded: ESG Data Request.xlsx', '15 Aug 2026, 10:10'], ['Task completed: Data Collection Kick-off', '15 Aug 2026, 09:45'], ['Message from TBCA Advisor', '14 Aug 2026, 16:20'], ['Payment received', '14 Aug 2026, 14:05'], ['Milestone due soon: Deliver ESG Baseline Report', '14 Aug 2026, 09:15']],
            'messages' => [['Lerato Molefe', 'ESG Baseline Report – Data Requirements', 'Please find the latest data request for the ESG Baseline Report. Kindly provide the outstanding items.', '15 Aug', true], ['John Smith', 'Stakeholder Workshop Confirmation', 'The stakeholder consultation workshop is confirmed for 29 Aug 2026 at 10:00.', '14 Aug', false]],
            'team' => [['Lerato Molefe', 'Engagement Lead'], ['John Smith', 'ESG Specialist'], ['Priya Singh', 'Data Analyst']],
            'documents' => ['all' => 24, 'client' => 8, 'tbca' => 16, 'recent' => ['ESG Data Request.xlsx', '15 Aug 2026']],
            'invoices' => [['INV-2026-0045', 'paid', 58075, '05 Aug 2026'], ['INV-2026-0056', 'due', 58075, '05 Sep 2026']],
            'evidence' => [['Legal & Regulatory', 12, 'Current', 'High', 'Verified'], ['Tax & Statutory', 8, 'Current', 'High', 'Verified'], ['Environment & ESG', 10, 'Current', 'High', 'Verified'], ['Business & Sector', 9, 'Current', 'Medium', 'In Review'], ['Payments & Settlement', 5, 'Current', 'High', 'Verified'], ['Data & Privacy', 4, 'Due Soon', 'Medium', 'In Review']],
            'notes' => [['Stakeholder Consultation Summary', 'Review in progress. Please address 3 data gap notes and clarify SME inputs.', 'John Smith', '14 Aug 2026'], ['Data Request Register', 'Additional data provided. Under review.', 'Priya Singh', '14 Aug 2026'], ['ESG Baseline Report (Draft)', 'Approved. No further action.', 'Lerato M.', '14 Aug 2026']],
            'files' => [['Evidence Pack ZA-01 (v1.0).pdf', '24 Jul 2026', '4.2 MB'], ['Data Request Register (v1.2).xlsx', '14 Aug 2026', '1.8 MB'], ['Materiality Workshop Brief (v1.0).docx', '22 Jul 2026', '2.1 MB'], ['ESG Baseline Report (v1.1).pdf', '24 Jul 2026', '3.8 MB']],
            'closure' => ['support_confirmed' => false],
        ];
    }
}
