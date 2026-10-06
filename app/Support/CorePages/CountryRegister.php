<?php

namespace App\Support\CorePages;

/**
 * Country objects, evidence and corridor truth surfaced in the Find the Right Service journey.
 *
 * Africa (Active): all 54 African country objects are activated across the five African Union
 * regions. Standard catalogue prices are shown for every country (stored in ZAR and converted to
 * the visitor's display currency). Country reference data lives in AfricaCountries; anything the
 * country desk has not yet confirmed is flagged as placeholder on the page.
 */
class CountryRegister
{
    public const STATES = ['Activated', 'Shell', 'Degraded', 'Suspended', 'Restricted'];

    public const REVIEWED = '05 Oct 2026';

    public static function countries(): array
    {
        return collect(AfricaCountries::all())->map(fn ($c) => [
            'iso' => $c['iso'],
            'name' => $c['name'],
            'region' => $c['region'],
            'state' => 'Activated',
            'rcs' => 100,
            'evidence' => $c['confirmed'] ? 'Current' : 'Baseline',
            'updated' => $c['confirmed'] ? '15 Aug 2026' : self::REVIEWED,
            'capital' => $c['capital'],
            'currency' => $c['currency'],
            'currency_name' => $c['currency_name'],
            'languages' => $c['languages'],
            'legal_system' => $c['legal_system'],
            'office' => $c['office'],
            'confirmed' => $c['confirmed'],
        ])->sortBy('name')->values()->all();
    }

    public static function find(string $iso): ?array
    {
        return collect(self::countries())->firstWhere('iso', strtoupper($iso));
    }

    public static function regions(): array
    {
        return AfricaCountries::REGIONS;
    }

    /** Every activated country shows standard catalogue prices. */
    public static function priceResolved(array $country, bool $permit = true): bool
    {
        return $country['state'] === 'Activated' && $permit;
    }

    public static function profile(string $iso): array
    {
        $c = self::find($iso);
        $tbc = $c['confirmed'] ? '' : ' (to be confirmed)';

        return [
            'country' => $c,
            'summary' => "{$c['name']} is an activated country object in TBCA's Africa (Active) market, within the {$c['region']} region. "
                .'Standard catalogue services and prices are available, with regulated or licensed work routed to vetted partners on a service-by-service basis.'
                .($c['confirmed'] ? '' : ' Country reference data marked "to be confirmed" is a working baseline pending country-desk verification.'),
            'facts' => [
                ['label' => 'ISO Code', 'value' => $c['iso']],
                ['label' => 'Region', 'value' => $c['region']],
                ['label' => 'Capital', 'value' => $c['capital']],
                ['label' => 'Currency', 'value' => "{$c['currency_name']} ({$c['currency']})"],
                ['label' => 'Languages', 'value' => $c['languages']],
                ['label' => 'Legal System', 'value' => $c['legal_system'].$tbc],
                ['label' => 'TBCA Presence', 'value' => $c['office']],
            ],
            'kpis' => [
                ['label' => 'Country State', 'value' => $c['state']],
                ['label' => 'Region', 'value' => $c['region']],
                ['label' => 'Resolver Completeness', 'value' => $c['rcs'].'%'],
                ['label' => 'Hard Blocks', 'value' => '0'],
                ['label' => 'Last Reviewed', 'value' => $c['updated']],
                ['label' => 'Commercial Actions', 'value' => 'Open — standard catalogue'],
            ],
            'availability' => [
                ['label' => 'Advisory Services', 'status' => 'Available'],
                ['label' => 'Reports & Analysis', 'status' => 'Available'],
                ['label' => 'Market Intelligence', 'status' => 'Available'],
                ['label' => 'Regulated / Licensed Work', 'status' => 'Partner-routed'],
            ],
            'access' => ['Country Profile (this page)', 'Market Intelligence Hub', 'Opportunity Scan', 'Regulatory & Compliance Check', 'Partner & Network Connection', 'Risk & Political Assessment'],
            'evidence_quality' => [
                ['label' => 'Local Data Sources', 'value' => $c['confirmed'] ? '100+' : 'Baseline set'],
                ['label' => 'Freshness', 'value' => $c['evidence']],
                ['label' => 'Confidence Treatment', 'value' => $c['confirmed'] ? 'High' : 'Medium'],
                ['label' => 'Review Type', 'value' => 'Human-Reviewed'],
                ['label' => 'Contradiction Handling', 'value' => 'Reconciled'],
                ['label' => 'Data Status', 'value' => $c['confirmed'] ? 'Verified' : 'Placeholder — to be confirmed'],
            ],
            'guardrails' => ['Standard catalogue prices shown in your selected currency', 'Statutory and partner fees quoted at cost', 'Tax treatment confirmed at engagement', 'Regulated work delivered by licensed partners'],
            'updates' => $c['confirmed'] ? [
                ['title' => 'Country activated for Africa (Active)', 'date' => self::REVIEWED],
                ['title' => 'Economic indicators refreshed with latest verified sources', 'date' => '15 Aug 2026'],
                ['title' => 'Source manifest updated and reconciled', 'date' => '14 Aug 2026'],
                ['title' => 'Evidence review completed (human-reviewed)', 'date' => '13 Aug 2026'],
            ] : [
                ['title' => 'Country activated for Africa (Active)', 'date' => self::REVIEWED],
                ['title' => 'Baseline reference data loaded (capital, currency, languages)', 'date' => self::REVIEWED],
                ['title' => 'Country-desk verification scheduled', 'date' => 'Pending'],
            ],
            'control' => [
                ['label' => 'Country State', 'value' => $c['state']],
                ['label' => 'Activation Scope', 'value' => 'Africa (Active)'],
                ['label' => 'Evidence Status', 'value' => $c['confirmed'] ? 'Evidence Current' : 'Evidence Baseline'],
                ['label' => 'Resolver Completeness', 'value' => $c['rcs'].'%'],
                ['label' => 'Last Update', 'value' => $c['updated']],
                ['label' => 'Commercial Availability', 'value' => 'Standard catalogue available'],
            ],
        ];
    }

    public static function evidenceItems(string $iso = 'ZA'): array
    {
        $iso = strtoupper($iso);
        if ($iso === 'ZA') {
            return self::zaEvidenceItems();
        }
        $c = self::find($iso);
        $n = $c['name'];
        $rows = [
            ['Central bank monetary policy statement (latest)', 'Economy & Financial', "Central Bank of {$n}", 'Official Publication'],
            ['Companies and commercial registration law (consolidated)', 'Legal & Regulatory', "{$n} Official Gazette", 'Primary Legislation'],
            ['Revenue authority tax guide (current year)', 'Tax & Statutory', "{$n} Revenue Authority", 'Official Publication'],
            ["{$n} investment policy and FDI review", 'Investment & Business', 'UNCTAD / national investment agency', 'International Report'],
            ['Transport and logistics infrastructure overview', 'Infrastructure & Logistics', 'African Development Bank', 'International Report'],
            ['National population and labour statistics', 'Social & Demographic', "{$n} National Statistics Office", 'Official Statistics'],
            ['Environmental and ESG regulatory framework', 'Environment & ESG', "{$n} Environment Ministry", 'Official Publication'],
        ];

        return collect($rows)->map(fn ($r, $i) => [
            'id' => sprintf('EV-%s-%04d', $iso, $i + 1),
            'title' => $r[0],
            'domain' => $r[1],
            'source' => $r[2].' (to be confirmed)',
            'class' => $r[3],
            'as_of' => self::REVIEWED,
            'freshness' => 'Baseline',
            'confidence' => 'Medium',
            'contradictions' => 0,
            'status' => 'Placeholder',
        ])->all();
    }

    public static function legal(string $iso = 'ZA'): array
    {
        $iso = strtoupper($iso);
        if ($iso === 'ZA') {
            return self::zaLegal();
        }
        $c = self::find($iso);
        $n = $c['name'];
        $ohada = str_contains($c['legal_system'], 'OHADA');

        return [
            'kpis' => [
                ['label' => 'Regulatory Environment', 'value' => 'Mapped (baseline)', 'sub' => 'To be confirmed by country desk', 'icon' => 'scale'],
                ['label' => 'Licensing Requirements', 'value' => 'Sector specific', 'sub' => 'Confirmed per engagement', 'icon' => 'clipboard-list'],
                ['label' => 'Legal System', 'value' => explode(' (', $c['legal_system'])[0], 'sub' => $ohada ? 'OHADA Uniform Acts apply' : 'Placeholder — to be confirmed', 'icon' => 'shield-check'],
                ['label' => 'Last Reviewed', 'value' => self::REVIEWED, 'sub' => 'Baseline review', 'icon' => 'calendar-days'],
            ],
            'overview' => [
                ['Country', "{$n} ({$c['iso']})"], ['Region', $c['region']], ['Capital', $c['capital']],
                ['Legal System', $c['legal_system'].' (to be confirmed)'], ['Business Law Harmonisation', $ohada ? 'OHADA member state' : 'National law (no OHADA membership)'],
                ['Currency', "{$c['currency_name']} ({$c['currency']})"], ['Language of Law', $c['languages'].' (to be confirmed)'],
                ['Date of Baseline', self::REVIEWED],
            ],
            'implications' => [
                "All engagements must comply with the laws of {$n} and applicable sector regulations.",
                'Certain services require licensing, registration or specific professional accreditation.',
                'Foreign entities may be subject to local incorporation or registration requirements.',
                'Data protection, consumer protection and tax compliance obligations apply to all engagements.',
                'Cross-border payments and data transfers are subject to local exchange-control and data rules.',
            ],
            'principles' => [
                'TBCA does not provide reserved legal or regulated professional services.',
                'All regulated services are delivered by licensed, independent partners.',
                'Engagements follow all mandatory legal, regulatory and professional rules.',
                'Operating outside the legal boundary may create legal or regulatory consequences.',
            ],
            'authorities' => [
                ['name' => "{$n} Companies / Business Registry", 'mandate' => 'Company registration and business records', 'site' => 'To be confirmed', 'relevance' => 'High', 'requirement' => 'Registration / Compliance', 'tab' => 'licences'],
                ['name' => "{$n} Revenue Authority", 'mandate' => 'Tax administration and customs', 'site' => 'To be confirmed', 'relevance' => 'High', 'requirement' => 'Tax Compliance', 'tab' => 'compliance'],
                ['name' => "Central Bank of {$n}", 'mandate' => 'Monetary policy, banking and exchange control', 'site' => 'To be confirmed', 'relevance' => 'High', 'requirement' => 'Licensing (regulated activities)', 'tab' => 'licences'],
                ['name' => "{$n} Investment Promotion Agency", 'mandate' => 'Investment facilitation and incentives', 'site' => 'To be confirmed', 'relevance' => 'Medium', 'requirement' => 'Investor Registration', 'tab' => 'sector'],
                ['name' => 'Data Protection Authority (where established)', 'mandate' => 'Personal data protection', 'site' => 'To be confirmed', 'relevance' => 'Medium', 'requirement' => 'Data Protection Compliance', 'tab' => 'compliance'],
            ],
            'status' => [
                ['Overall Compliance', 'Baseline'], ['Regulatory Mapping', 'Baseline'], ['Licensing Requirements', 'To be confirmed'],
                ['Legal Restrictions', '0 Open'], ['Boundary Breaches (30 days)', '0'], ['Last Legal Review', self::REVIEWED],
            ],
            'licences' => [
                ['Company registration', 'All companies', 'Before trading'], ['Tax registration', 'All taxable entities', 'On commencement (to be confirmed)'],
                ['Sector licences', 'Regulated sectors (finance, telecoms, mining, health)', 'Before rendering services'],
            ],
            'sector' => [['Financial services', 'Licence required; TBCA routes to licensed partners'], ['Legal services', 'Reserved to admitted practitioners'], ['Audit', 'Reserved to registered auditors']],
            'obligations' => [['Tax', 'Returns filed per local calendar'], ['Labour', 'Local labour law compliance'], ['Annual returns', 'Registry annual filings']],
            'disputes' => [['Courts', "National courts of {$n}"], ['Arbitration', $ohada ? 'OHADA CCJA arbitration available' : 'Arbitration availability to be confirmed']],
            'changes' => [[self::REVIEWED, 'Country activated for Africa (Active); baseline legal map loaded']],
        ];
    }

    /** Standard catalogue offered in every activated country. Prices are whole ZAR. */
    private const CATALOGUE = [
        ['BCS-001', 'Company Registration', 'Business & Corporate Services', 14500, '5 – 15 Business Days', 'End-to-end company registration with the national companies registry, from name reservation to certificate of incorporation.'],
        ['BCS-002', 'Tax & VAT Registration', 'Business & Corporate Services', 6500, '5 – 10 Business Days', 'Registration with the national revenue authority for corporate income tax and VAT / sales tax, including tax-number confirmation.'],
        ['ADV-001', 'Market Entry Assessment', 'Advisory Services', 45000, '2 – 3 Weeks', 'Structured assessment of market size, entry routes, competitors and regulatory hurdles, with a go / no-go recommendation.'],
        ['MKT-001', 'Market Intelligence Brief', 'Market Intelligence', 18500, '5 – 7 Business Days', 'Evidence-backed country brief covering the macro outlook, sector signals and recent policy changes.'],
        ['REG-001', 'Regulatory & Compliance Check', 'Advisory Services', 22000, '1 – 2 Weeks', 'Review of licences, registrations and compliance obligations that apply to your activity, with partner routing for regulated work.'],
        ['PRT-001', 'Partner & Network Connection', 'Business & Corporate Services', 12000, '1 – 2 Weeks', 'Introductions to vetted local partners: legal, tax, banking, logistics and sector specialists.'],
        ['RSK-001', 'Risk & Political Assessment', 'Market Intelligence', 28000, '1 – 2 Weeks', 'Political, security, currency and regulatory risk assessment with mitigation options.'],
    ];

    public static function services(string $iso = 'ZA'): array
    {
        $c = self::find($iso);
        if (! $c) {
            return [];
        }
        $out = [];
        foreach (self::CATALOGUE as [$suffix, $name, $category, $zar, $timeline, $summary]) {
            $code = "{$c['iso']}-{$suffix}";
            $out[$code] = self::service($c, $code, $name, $category, $zar, $timeline, $summary);
        }

        return $out;
    }

    private static function service(array $c, string $code, string $name, string $category, int $zar, string $timeline, string $summary): array
    {
        $n = $c['name'];
        $za = $c['iso'] === 'ZA';
        $registry = $za ? 'CIPC' : 'the national companies registry';
        $isReg = str_ends_with($code, 'BCS-001');

        return [
            'code' => $code,
            'name' => $name,
            'category' => $category,
            'status' => 'Active',
            'price_zar' => $zar,
            'summary' => $summary,
            'overview' => $isReg
                ? "We manage the entire company registration process with {$registry} in {$n}, ensuring compliance with local legislation and best-practice governance."
                : "TBCA delivers {$name} for {$n} using its standard methodology, local evidence and, where required, vetted in-country partners.",
            'included' => $isReg
                ? ['Name search and reservation', 'Constitutional documents preparation', 'Registry filing and tracking', 'Certificate of Incorporation', 'Directors & shareholders registration', 'Share structure setup']
                : ['Scoping call with a TBCA advisor', "Desk research and {$n} evidence review", 'Local partner input where required', 'Written deliverable with recommendations', 'Follow-up review session'],
            'process' => $isReg ? [
                ['Eligibility Check', 'Resolver validates all dependencies.'],
                ['Name Search & Reservation', "Name availability check and reservation with {$registry}."],
                ['Document Preparation', 'Registration documents prepared.'],
                ['Submission', 'Documents submitted and statutory fees paid.'],
                ['Incorporation Approval', 'Registry reviews and approves registration.'],
                ['Certificate Issued', 'Certificate of Incorporation delivered.'],
            ] : [
                ['Scope', 'Confirm objectives, inputs and timeline.'],
                ['Research', 'Gather and verify country evidence.'],
                ['Partner Input', 'Local specialists consulted where required.'],
                ['Deliver', 'Report and recommendations delivered.'],
            ],
            'fees' => [
                ['label' => 'TBCA Fee (T) — standard catalogue', 'zar' => $zar],
                ['label' => 'Statutory Fees (S)', 'zar' => null],
                ['label' => 'Partner Fees (P)', 'zar' => null],
            ],
            'requirements' => $isReg
                ? ['Certified ID copies of all directors', 'Proof of address for directors', 'Proposed company names (up to 4)', 'Share allocation and shareholder details', 'Registered office address']
                : ['Completed intake questionnaire', 'Company profile or business plan (if available)', 'Target sector and objectives'],
            'limitations' => ['Statutory and partner fees are quoted separately at cost', 'Sector licences are separate and partner-routed', 'Timelines depend on local authority processing'],
            'related' => collect(self::CATALOGUE)->map(fn ($s) => "{$c['iso']}-{$s[0]} {$s[1]}")->reject(fn ($s) => str_starts_with($s, $code))->take(3)->values()->all(),
            'details' => [['Delivery Model', 'Managed Service'], ['Typical Timeline', $timeline], ['Price Basis', 'Standard catalogue (ZAR base)'], ['Service Owner', 'TBCA Operations'], ['Evidence Quality', $c['confirmed'] ? 'High' : 'Baseline'], ['Data Freshness', $c['evidence']]],
            'dependencies' => ['Legal & Regulatory' => true, 'Tax & Statutory' => true, 'Payments & FX' => true, 'Identity & KYC' => true, 'Data & Licences' => true],
            'changes' => [[self::REVIEWED, 'Activated for Africa (Active) with standard catalogue pricing']],
        ];
    }

    public static function evidenceDomains(): array
    {
        return [
            ['name' => 'Economy & Financial', 'icon' => 'landmark', 'sources' => 16, 'current' => 16],
            ['name' => 'Legal & Regulatory', 'icon' => 'scale', 'sources' => 22, 'current' => 22],
            ['name' => 'Tax & Statutory', 'icon' => 'receipt', 'sources' => 14, 'current' => 14],
            ['name' => 'Investment & Business', 'icon' => 'bar-chart-3', 'sources' => 15, 'current' => 15],
            ['name' => 'Infrastructure & Logistics', 'icon' => 'building-2', 'sources' => 16, 'current' => 16],
            ['name' => 'Social & Demographic', 'icon' => 'users', 'sources' => 12, 'current' => 12],
            ['name' => 'Environment & ESG', 'icon' => 'sparkles', 'sources' => 12, 'current' => 12],
        ];
    }

    private static function zaEvidenceItems(): array
    {
        return [
            ['id' => 'EV-25-00187', 'title' => 'SARB Quarterly Bulletin – Q2 2026', 'domain' => 'Economy & Financial', 'source' => 'South African Reserve Bank', 'class' => 'Official Publication', 'as_of' => '30 Jun 2026', 'freshness' => 'Current', 'confidence' => 'High', 'contradictions' => 0, 'status' => 'Current'],
            ['id' => 'EV-25-00191', 'title' => 'Companies Act, 2008 (Act 71 of 2008) – Consolidated', 'domain' => 'Legal & Regulatory', 'source' => 'Government Gazette', 'class' => 'Primary Legislation', 'as_of' => '01 Jul 2026', 'freshness' => 'Current', 'confidence' => 'High', 'contradictions' => 0, 'status' => 'Current'],
            ['id' => 'EV-25-00192', 'title' => 'SARS Guide 2026: Individual Tax Returns', 'domain' => 'Tax & Statutory', 'source' => 'South African Revenue Service', 'class' => 'Official Publication', 'as_of' => '12 Jul 2026', 'freshness' => 'Current', 'confidence' => 'High', 'contradictions' => 0, 'status' => 'Current'],
            ['id' => 'EV-25-00195', 'title' => 'South Africa FDI Report 2026', 'domain' => 'Investment & Business', 'source' => 'UNCTAD', 'class' => 'International Report', 'as_of' => '20 Jul 2026', 'freshness' => 'Current', 'confidence' => 'High', 'contradictions' => 0, 'status' => 'Current'],
            ['id' => 'EV-25-00148', 'title' => 'Transport Freight Statistics FY1 Plan 2026', 'domain' => 'Infrastructure & Logistics', 'source' => 'Transnet', 'class' => 'Corporate Publication', 'as_of' => '18 Jul 2026', 'freshness' => 'Current', 'confidence' => 'Medium', 'contradictions' => 0, 'status' => 'Current'],
            ['id' => 'EV-25-00201', 'title' => 'Census 2022 Community Profiles (2026 refresh)', 'domain' => 'Social & Demographic', 'source' => 'Statistics South Africa', 'class' => 'Official Statistics', 'as_of' => '05 Jul 2026', 'freshness' => 'Current', 'confidence' => 'High', 'contradictions' => 0, 'status' => 'Current'],
            ['id' => 'EV-25-00207', 'title' => 'Carbon Tax Act – Phase 2 Guidance', 'domain' => 'Environment & ESG', 'source' => 'National Treasury', 'class' => 'Official Publication', 'as_of' => '28 Jun 2026', 'freshness' => 'Current', 'confidence' => 'High', 'contradictions' => 0, 'status' => 'Current'],
            ['id' => 'EV-25-00211', 'title' => 'B-BBEE Codes of Good Practice (Amended)', 'domain' => 'Legal & Regulatory', 'source' => 'Dept. of Trade, Industry and Competition', 'class' => 'Primary Legislation', 'as_of' => '10 Jul 2026', 'freshness' => 'Current', 'confidence' => 'High', 'contradictions' => 0, 'status' => 'Current'],
        ];
    }

    public static function sourceManifest(): array
    {
        return [
            ['label' => 'Official Government Sources', 'count' => 31], ['label' => 'Regulatory & Statutory Bodies', 'count' => 18],
            ['label' => 'International Organisations', 'count' => 22], ['label' => 'Research & Think Tanks', 'count' => 16],
            ['label' => 'Private Sector / Corporate', 'count' => 6], ['label' => 'Academic & Universities', 'count' => 6],
            ['label' => 'Media (Verified)', 'count' => 3], ['label' => 'Other Open Sources', 'count' => 2],
        ];
    }

    private static function zaLegal(): array
    {
        return [
            'kpis' => [
                ['label' => 'Regulatory Environment', 'value' => 'Developed', 'sub' => 'Predictable & well established', 'icon' => 'scale'],
                ['label' => 'Licensing Requirements', 'value' => 'Medium', 'sub' => 'Sector specific', 'icon' => 'clipboard-list'],
                ['label' => 'Legal System', 'value' => 'Common Law', 'sub' => 'Based on Roman-Dutch law', 'icon' => 'shield-check'],
                ['label' => 'Last Reviewed', 'value' => '15 Aug 2026', 'sub' => '10:24 SAST', 'icon' => 'calendar-days'],
            ],
            'overview' => [
                ['Constitution', 'Constitution of the Republic of South Africa, 1996'], ['Legal System', 'Common Law (Roman-Dutch foundation)'],
                ['Government Type', 'Parliamentary Republic'], ['Regulator Independence', 'High'], ['Judicial Independence', 'High'],
                ['Contract Enforceability', 'Strong'], ['Arbitration Recognition', 'Enforced (New York Convention)'],
                ['Language of Law', 'English (primary), Afrikaans (co-official)'], ['Time Zone', 'SAST (UTC+2)'], ['Date of Law', '01 Jul 2026'],
            ],
            'implications' => [
                'All engagements must comply with South African law and applicable sector regulations.',
                'Certain services require licensing, registration or specific professional accreditation.',
                'Foreign entities may be subject to local incorporation or registration requirements.',
                'Consumer protection, POPIA and tax compliance obligations apply to all engagements.',
                'Cross-border data transfers are governed by POPIA and data adequacy rules.',
                'Dispute resolution through courts or arbitration within South Africa is available.',
            ],
            'principles' => [
                'TBCA does not provide reserved legal or regulated professional services.',
                'All regulated services are delivered by licensed, independent partners.',
                'Engagements follow all mandatory legal, regulatory and professional rules.',
                'Operating outside the legal boundary may create legal or regulatory consequences.',
            ],
            'authorities' => [
                ['name' => 'Companies and Intellectual Property Commission (CIPC)', 'mandate' => 'Company registration, IP, business records', 'site' => 'www.cipc.co.za', 'relevance' => 'High', 'requirement' => 'Registration / Compliance', 'tab' => 'licences'],
                ['name' => 'Financial Sector Conduct Authority (FSCA)', 'mandate' => 'Financial services regulation', 'site' => 'www.fsca.co.za', 'relevance' => 'High', 'requirement' => 'Authorisation / Compliance', 'tab' => 'licences'],
                ['name' => 'South African Revenue Service (SARS)', 'mandate' => 'Tax administration and customs', 'site' => 'www.sars.gov.za', 'relevance' => 'High', 'requirement' => 'Tax Compliance', 'tab' => 'compliance'],
                ['name' => 'Information Regulator (IR)', 'mandate' => 'POPIA enforcement and data protection', 'site' => 'www.justice.gov.za/inforeg', 'relevance' => 'Medium', 'requirement' => 'Data Protection Compliance', 'tab' => 'compliance'],
                ['name' => 'Competition Commission', 'mandate' => 'Competition regulation and mergers', 'site' => 'www.compcom.co.za', 'relevance' => 'Medium', 'requirement' => 'Merger Notification', 'tab' => 'sector'],
                ['name' => 'Prudential Authority (SARB)', 'mandate' => 'Banking and insurance prudential regulation', 'site' => 'www.resbank.co.za', 'relevance' => 'Medium', 'requirement' => 'Licensing (regulated activities)', 'tab' => 'licences'],
                ['name' => 'B-BBEE Commission', 'mandate' => 'Broad-based black economic empowerment oversight', 'site' => 'www.bbbeecommission.co.za', 'relevance' => 'Medium', 'requirement' => 'Verification / Reporting', 'tab' => 'compliance'],
                ['name' => 'Department of Employment and Labour', 'mandate' => 'Labour relations, UIF, COIDA', 'site' => 'www.labour.gov.za', 'relevance' => 'Medium', 'requirement' => 'Registration / Compliance', 'tab' => 'compliance'],
            ],
            'status' => [
                ['Overall Compliance', 'Compliant'], ['Regulatory Mapping', 'Complete'], ['Licensing Requirements', 'Complete'],
                ['Legal Restrictions', '0 Open'], ['Regulator Confirmations', '14 / 14'], ['Compliance Obligations', 'Complete'],
                ['Boundary Breaches (30 days)', '0'], ['Last Legal Review', '15 Aug 2026'],
            ],
            'licences' => [
                ['Company registration (CIPC)', 'All companies', 'Before trading'], ['Tax registration (SARS income tax / VAT)', 'VAT if turnover > R1m in 12 months', 'Within 21 days of liability'],
                ['FSP licence (FSCA)', 'Financial advice / intermediary services', 'Before rendering services'], ['UIF and COIDA registration', 'All employers', 'On first employee'],
            ],
            'sector' => [
                ['Financial services', 'Licence required; TBCA routes to licensed partners'], ['Legal services', 'Reserved to admitted practitioners'],
                ['Audit', 'Reserved to IRBA-registered auditors'], ['Mergers above thresholds', 'Competition Commission approval required'],
            ],
            'obligations' => [
                ['POPIA', 'Information Officer registered; processing purpose-limited'], ['Tax', 'Returns and tax clearance current'],
                ['Labour', 'BCEA, LRA, EEA compliance'], ['Annual returns', 'CIPC annual return filed annually'],
            ],
            'disputes' => [
                ['Courts', 'High Court and Magistrates Courts; Commercial Court in Johannesburg'], ['Arbitration', 'Arbitration Act 2017 (International) — New York Convention enforced'],
                ['Labour', 'CCMA conciliation and arbitration'], ['Consumer', 'National Consumer Commission and Tribunal'],
            ],
            'changes' => [
                ['15 Aug 2026', 'Legal boundary review completed — no breaches'], ['01 Jul 2026', 'Companies Act consolidation updated'],
                ['12 Jun 2026', 'POPIA cross-border transfer guidance incorporated'],
            ],
        ];
    }

    public static function network(): array
    {
        return [
            'kpis' => ['sellable' => 0, 'theoretical' => 2862, 'with_evidence' => 186, 'high_confidence' => 12, 'activation_cost' => 'R12.8M'],
            'confidence' => [
                ['label' => 'High Confidence', 'count' => 12, 'pct' => 0.4, 'tone' => 'good'],
                ['label' => 'Evidence Available', 'count' => 174, 'pct' => 6.1, 'tone' => 'info'],
                ['label' => 'Limited Evidence', 'count' => 231, 'pct' => 8.1, 'tone' => 'warn'],
                ['label' => 'No Evidence', 'count' => 2445, 'pct' => 85.4, 'tone' => 'neutral'],
            ],
            'regions' => [
                ['label' => 'Africa', 'count' => 1378, 'pct' => 48.2], ['label' => 'Europe', 'count' => 612, 'pct' => 21.4],
                ['label' => 'Asia', 'count' => 516, 'pct' => 18.0], ['label' => 'Americas', 'count' => 268, 'pct' => 9.4], ['label' => 'Oceania', 'count' => 88, 'pct' => 3.1],
            ],
            // From (row) x To (column): Africa, Europe, Asia, Americas, Oceania. null = same region diagonal.
            'heatmap' => [
                'Africa' => [null, 'high', 'medium', 'low', 'none'],
                'Europe' => ['high', null, 'medium', 'medium', 'none'],
                'Asia' => ['medium', 'medium', null, 'low', 'low'],
                'Americas' => ['low', 'medium', 'low', null, 'none'],
                'Oceania' => ['none', 'none', 'low', 'none', null],
            ],
            'routes' => [
                ['to' => 'United Kingdom', 'region' => 'Europe', 'evidence' => 'Evidence Available', 'confidence' => 'Evidence Available', 'x' => 47, 'y' => 22],
                ['to' => 'Germany', 'region' => 'Europe', 'evidence' => 'Limited Evidence', 'confidence' => 'Limited Evidence', 'x' => 52, 'y' => 24],
                ['to' => 'United States', 'region' => 'Americas', 'evidence' => 'Evidence Available', 'confidence' => 'Evidence Available', 'x' => 22, 'y' => 33],
                ['to' => 'Canada', 'region' => 'Americas', 'evidence' => 'Limited Evidence', 'confidence' => 'Limited Evidence', 'x' => 20, 'y' => 20],
                ['to' => 'Brazil', 'region' => 'Americas', 'evidence' => 'Limited Evidence', 'confidence' => 'Limited Evidence', 'x' => 33, 'y' => 62],
                ['to' => 'United Arab Emirates', 'region' => 'Asia', 'evidence' => 'Limited Evidence', 'confidence' => 'High Confidence', 'x' => 63, 'y' => 40],
                ['to' => 'India', 'region' => 'Asia', 'evidence' => 'Limited Evidence', 'confidence' => 'Limited Evidence', 'x' => 70, 'y' => 42],
                ['to' => 'China', 'region' => 'Asia', 'evidence' => 'Limited Evidence', 'confidence' => 'Limited Evidence', 'x' => 79, 'y' => 32],
                ['to' => 'Singapore', 'region' => 'Asia', 'evidence' => 'Limited Evidence', 'confidence' => 'Limited Evidence', 'x' => 77, 'y' => 54],
                ['to' => 'Kenya', 'region' => 'Africa', 'evidence' => 'High Confidence', 'confidence' => 'High Confidence', 'x' => 59, 'y' => 54],
                ['to' => 'Nigeria', 'region' => 'Africa', 'evidence' => 'Evidence Available', 'confidence' => 'Evidence Available', 'x' => 50, 'y' => 47],
            ],
            'popular' => [
                ['to' => 'United Arab Emirates', 'iso' => 'AE', 'status' => 'Limited Evidence', 'ledger' => true],
                ['to' => 'United States', 'iso' => 'US', 'status' => 'Evidence Available', 'ledger' => false],
                ['to' => 'United Kingdom', 'iso' => 'GB', 'status' => 'Evidence Available', 'ledger' => false],
                ['to' => 'Germany', 'iso' => 'DE', 'status' => 'Limited Evidence', 'ledger' => false],
                ['to' => 'China', 'iso' => 'CN', 'status' => 'Limited Evidence', 'ledger' => false],
            ],
        ];
    }

    /** Ledger S (statutory fees) for the South Africa → United Arab Emirates corridor. */
    public static function ledgerS(): array
    {
        $fees = [
            ['category' => 'CIPC Name Reservation', 'description' => 'Business name reservation', 'jurisdiction' => 'SA', 'payable_to' => 'CIPC', 'basis' => 'Per reservation', 'amount' => 100.00, 'when' => 'At reservation', 'ref' => 'EVD-S-001'],
            ['category' => 'CIPC Company Registration', 'description' => 'Company registration fee', 'jurisdiction' => 'SA', 'payable_to' => 'CIPC', 'basis' => 'Per company', 'amount' => 1250.00, 'when' => 'On incorporation', 'ref' => 'EVD-S-002'],
            ['category' => 'CIPC Annual Return Fee', 'description' => 'Annual return fee', 'jurisdiction' => 'SA', 'payable_to' => 'CIPC', 'basis' => 'Per company', 'amount' => 100.00, 'when' => 'Annually', 'ref' => 'EVD-S-003'],
            ['category' => 'SARS VAT Registration', 'description' => 'VAT registration', 'jurisdiction' => 'SA', 'payable_to' => 'SARS', 'basis' => 'Per registration', 'amount' => 0.00, 'when' => 'At registration', 'ref' => 'EVD-S-004'],
            ['category' => 'SARS Tax Clearance Certificate', 'description' => 'Tax clearance certificate', 'jurisdiction' => 'SA', 'payable_to' => 'SARS', 'basis' => 'Per certificate', 'amount' => 0.00, 'when' => 'When requested', 'ref' => 'EVD-S-005'],
            ['category' => 'MOFA Attestation (UAE)', 'description' => 'Document attestation', 'jurisdiction' => 'UAE', 'payable_to' => 'MOFA UAE', 'basis' => 'Per document', 'amount' => 150.00, 'when' => 'Pre-licence', 'ref' => 'EVD-S-006'],
            ['category' => 'UAE Trade Name Reservation', 'description' => 'Trade name reservation', 'jurisdiction' => 'UAE', 'payable_to' => 'DED, UAE', 'basis' => 'Per reservation', 'amount' => 525.00, 'when' => 'At reservation', 'ref' => 'EVD-S-007'],
            ['category' => 'UAE Licence Issue Fee', 'description' => 'Commercial licence issue', 'jurisdiction' => 'UAE', 'payable_to' => 'DED, UAE', 'basis' => 'Per licence', 'amount' => 3000.00, 'when' => 'On licence issue', 'ref' => 'EVD-S-008'],
        ];

        return [
            'from' => ['name' => 'South Africa', 'iso' => 'ZA', 'state' => 'Activated', 'note' => 'Africa (Active)'],
            'to' => ['name' => 'United Arab Emirates', 'iso' => 'AE', 'state' => 'Resolver-Ready', 'note' => 'Resolver-ready destination'],
            'meta' => ['type' => 'Investment', 'purpose' => 'Market Entry', 'evidence' => 'Evidence Available', 'evidence_items' => 6, 'confidence' => 'High (87%)', 'availability' => 'Service-by-service permission applies'],
            'snapshot' => [
                ['From', 'South Africa'], ['To', 'United Arab Emirates'], ['Corridor Type', 'Investment'], ['Purpose', 'Market Entry'], ['Evidence Items', '6'],
                ['Confidence Level', 'High (87%)'], ['Commercial Availability', 'Service-by-service permission applies'],
                ['Estimated Activation Cost', 'R9,850,000 – R14,250,000 (Model Basis)'], ['Time to Activate (Est.)', '15 – 25 days'], ['Resolver', 'TBCA'], ['Permission Scope', 'Full'],
            ],
            'fees' => $fees,
        ];
    }
}
