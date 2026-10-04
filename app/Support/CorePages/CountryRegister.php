<?php

namespace App\Support\CorePages;

/**
 * Country objects, evidence and corridor truth surfaced in the Find the Right Service journey.
 *
 * Doctrine (Countries blueprint): South Africa is the only activated country object in Phase 1;
 * the other 53 are shells. "No Resolution, No Price" — a price is only shown when the country is
 * Activated, Resolver completeness is 100% and a ResolvedPricePermit exists. No manual override.
 */
class CountryRegister
{
    public const STATES = ['Activated', 'Shell', 'Degraded', 'Suspended', 'Restricted'];

    public static function countries(): array
    {
        $raw = [
            ['DZ', 'Algeria', 'North Africa'], ['AO', 'Angola', 'Middle Africa'], ['BJ', 'Benin', 'West Africa'], ['BW', 'Botswana', 'Southern Africa'],
            ['BF', 'Burkina Faso', 'West Africa'], ['BI', 'Burundi', 'East Africa'], ['CV', 'Cabo Verde', 'West Africa'], ['CM', 'Cameroon', 'Middle Africa'],
            ['CF', 'Central African Republic', 'Middle Africa'], ['TD', 'Chad', 'Middle Africa'], ['KM', 'Comoros', 'East Africa'], ['CG', 'Congo', 'Middle Africa'],
            ['CD', 'DR Congo', 'Middle Africa'], ['CI', "Côte d'Ivoire", 'West Africa'], ['DJ', 'Djibouti', 'East Africa'], ['EG', 'Egypt', 'North Africa'],
            ['GQ', 'Equatorial Guinea', 'Middle Africa'], ['ER', 'Eritrea', 'East Africa'], ['SZ', 'Eswatini', 'Southern Africa'], ['ET', 'Ethiopia', 'East Africa'],
            ['GA', 'Gabon', 'Middle Africa'], ['GM', 'Gambia', 'West Africa'], ['GH', 'Ghana', 'West Africa'], ['GN', 'Guinea', 'West Africa'],
            ['GW', 'Guinea-Bissau', 'West Africa'], ['KE', 'Kenya', 'East Africa'], ['LS', 'Lesotho', 'Southern Africa'], ['LR', 'Liberia', 'West Africa'],
            ['LY', 'Libya', 'North Africa'], ['MG', 'Madagascar', 'East Africa'], ['MW', 'Malawi', 'East Africa'], ['ML', 'Mali', 'West Africa'],
            ['MR', 'Mauritania', 'West Africa'], ['MU', 'Mauritius', 'East Africa'], ['MA', 'Morocco', 'North Africa'], ['MZ', 'Mozambique', 'East Africa'],
            ['NA', 'Namibia', 'Southern Africa'], ['NE', 'Niger', 'West Africa'], ['NG', 'Nigeria', 'West Africa'], ['RW', 'Rwanda', 'East Africa'],
            ['ST', 'São Tomé and Príncipe', 'Middle Africa'], ['SN', 'Senegal', 'West Africa'], ['SC', 'Seychelles', 'East Africa'], ['SL', 'Sierra Leone', 'West Africa'],
            ['SO', 'Somalia', 'East Africa'], ['ZA', 'South Africa', 'Southern Africa'], ['SS', 'South Sudan', 'East Africa'], ['SD', 'Sudan', 'North Africa'],
            ['TZ', 'Tanzania', 'East Africa'], ['TG', 'Togo', 'West Africa'], ['TN', 'Tunisia', 'North Africa'], ['UG', 'Uganda', 'East Africa'],
            ['ZM', 'Zambia', 'East Africa'], ['ZW', 'Zimbabwe', 'East Africa'],
        ];

        $fixed = ['DZ' => [18, '14 Aug 2026'], 'AO' => [22, '13 Aug 2026'], 'BJ' => [16, '12 Aug 2026'], 'BW' => [25, '12 Aug 2026'], 'BF' => [17, '11 Aug 2026'], 'BI' => [14, '11 Aug 2026'], 'CM' => [19, '11 Aug 2026']];

        return collect($raw)->map(function ($c) use ($fixed) {
            [$iso, $name, $region] = $c;
            if ($iso === 'ZA') {
                return ['iso' => 'ZA', 'name' => $name, 'region' => $region, 'state' => 'Activated', 'rcs' => 100, 'evidence' => 'Current', 'updated' => '15 Aug 2026'];
            }
            $rcs = $fixed[$iso][0] ?? 10 + (crc32($iso) % 17);

            return ['iso' => $iso, 'name' => $name, 'region' => $region, 'state' => 'Shell', 'rcs' => $rcs, 'evidence' => 'Partial', 'updated' => $fixed[$iso][1] ?? sprintf('%02d Aug 2026', 1 + crc32($name) % 10)];
        })->sortBy(fn ($c) => $c['iso'] === 'ZA' ? '0' : $c['name'])->values()->all();
    }

    public static function find(string $iso): ?array
    {
        return collect(self::countries())->firstWhere('iso', strtoupper($iso));
    }

    public static function regions(): array
    {
        return collect(self::countries())->pluck('region')->unique()->sort()->values()->all();
    }

    /** Price may be displayed only when resolution is complete and a permit exists. */
    public static function priceResolved(array $country, bool $permit = false): bool
    {
        return $country['state'] === 'Activated' && $country['rcs'] === 100 && $permit;
    }

    public static function profile(string $iso): array
    {
        $c = self::find($iso);
        $active = $c['state'] === 'Activated';

        return [
            'country' => $c,
            'summary' => $active
                ? 'South Africa is the only activated country object in Phase 1. Commercial availability remains subject to service-by-service Country Resolver permission. Other African country objects are not implied active.'
                : "{$c['name']} is a shell country object. It is not transaction-permitted, and all prices are suppressed until Country Resolver completeness reaches 100% and a valid ResolvedPricePermit is in place.",
            'kpis' => [
                ['label' => 'Country State', 'value' => $c['state']],
                ['label' => 'Region', 'value' => $c['region']],
                ['label' => 'Resolver Completeness', 'value' => $c['rcs'].'%'],
                ['label' => 'Hard Blocks', 'value' => $active ? '0' : '3'],
                ['label' => 'Last Reviewed', 'value' => $c['updated']],
                ['label' => 'Commercial Actions', 'value' => $active ? 'Controlled by Resolver' : 'Blocked'],
            ],
            'availability' => [
                ['label' => 'Advisory Services', 'status' => $active ? 'Resolver required' : 'Not available'],
                ['label' => 'Reports & Analysis', 'status' => $active ? 'Resolver required' : 'Not available'],
                ['label' => 'Market Intelligence', 'status' => $active ? 'Controlled access' : 'Discovery only'],
            ],
            'access' => $active
                ? ['Country Profile (this page)', 'Market Intelligence Hub', 'Opportunity Scan', 'Regulatory & Compliance Check', 'Partner & Network Connection', 'Risk & Political Assessment']
                : ['Country Profile (this page)', 'Register interest (Unmet Demand)'],
            'evidence_quality' => [
                ['label' => 'Local Data Sources', 'value' => $active ? '100+' : (string) (4 + $c['rcs'] % 9)],
                ['label' => 'Freshness', 'value' => $active ? 'Current' : 'Partial'],
                ['label' => 'Confidence Treatment', 'value' => $active ? 'High' : 'Low'],
                ['label' => 'Currentness', 'value' => $active ? 'Evidence Current' : 'Evidence Partial'],
                ['label' => 'Review Type', 'value' => 'Human-Reviewed'],
                ['label' => 'Contradiction Handling', 'value' => $active ? 'Reconciled' : 'Open items'],
                ['label' => 'Licence Status', 'value' => $active ? 'Verified' : 'Pending'],
            ],
            'guardrails' => ['No price without resolution', 'No unsupported FX conversion', 'Tax treatment resolution required', 'Gateway depends on context'],
            'updates' => $active ? [
                ['title' => 'Economic indicators refreshed with latest verified sources', 'date' => '15 Aug 2026'],
                ['title' => 'Source manifest updated and reconciled', 'date' => '14 Aug 2026'],
                ['title' => 'Evidence review completed (human-reviewed)', 'date' => '13 Aug 2026'],
                ['title' => 'Activation record confirmed by Resolver', 'date' => '12 Aug 2026'],
            ] : [
                ['title' => 'Shell country object created and registered', 'date' => $c['updated']],
            ],
            'control' => [
                ['label' => 'Country State', 'value' => $c['state']],
                ['label' => 'Activation Scope', 'value' => $active ? 'Phase 1 (Controlled)' : 'Not activated'],
                ['label' => 'Evidence Status', 'value' => $active ? 'Evidence Current' : 'Evidence Partial'],
                ['label' => 'Resolver Completeness', 'value' => $c['rcs'].'%'],
                ['label' => 'Last Update', 'value' => $c['updated']],
                ['label' => 'Commercial Availability', 'value' => $active ? 'Service-by-service permission applies' : 'Not transaction-permitted'],
            ],
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

    public static function evidenceItems(): array
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

    public static function legal(): array
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

    public static function services(): array
    {
        return [
            'ZA-BCS-001' => [
                'code' => 'ZA-BCS-001',
                'name' => 'Company Registration',
                'category' => 'Business & Corporate Services',
                'status' => 'Active',
                'summary' => 'End-to-end company registration with CIPC including name search, document preparation, submission, and incorporation certificate.',
                'overview' => 'We manage the entire company registration process with the Companies and Intellectual Property Commission (CIPC), ensuring compliance with South African legislation and best-practice governance.',
                'included' => ['Name search and reservation', 'Memorandum of Incorporation (MOI)', 'Documents preparation and submission', 'CIPC filing and tracking', 'Certificate of Incorporation', 'Directors & shareholders registration', 'Share structure setup', 'Company profile on CIPC verified'],
                'process' => [
                    ['Eligibility Check', 'Country Resolver validates all dependencies.'],
                    ['Name Search & Reservation', 'Name availability check and reservation with CIPC.'],
                    ['Document Preparation', 'MOI and registration documents prepared.'],
                    ['Submission to CIPC', 'Documents submitted and fees paid.'],
                    ['Incorporation Approval', 'CIPC reviews and approves registration.'],
                    ['Certificate Issued', 'Certificate of Incorporation delivered.'],
                ],
                'fees' => ['TBCA Fee (T)', 'External Fees (X)', 'Statutory Fees (S)', 'Partner Fees (P)', 'Data / Licence Fees (D)', 'Corridor Fees (CT-C)'],
                'requirements' => ['Certified ID copies of all directors', 'Proof of address for directors (not older than 3 months)', 'Proposed company names (up to 4)', 'Share allocation and shareholder details', 'Registered office address'],
                'limitations' => ['Name approval is at CIPC discretion', 'Sector licences (e.g. FSP) are separate and partner-routed', 'Timelines depend on CIPC processing'],
                'related' => ['ZA-BCS-002 Tax & VAT Registration', 'ZA-BCS-003 B-BBEE Affidavit', 'ZA-BCS-004 Annual Return Filing'],
                'details' => [['Delivery Model', 'Managed Service'], ['Service Type', 'Service-by-service'], ['Typical Timeline', '5 – 10 Business Days'], ['Renewal Required', 'No'], ['Refund Policy', 'See Refunds Policy'], ['Service Owner', 'TBCA Operations'], ['Evidence Quality', 'High'], ['Data Freshness', 'Current']],
                'dependencies' => ['Legal & Regulatory' => true, 'Tax & Statutory' => true, 'Payments & FX' => true, 'Identity & KYC' => true, 'Data & Licences' => true],
                'changes' => [['15 Aug 2026', 'Annual review completed'], ['20 Jul 2026', 'CIPC fee schedule evidence refreshed (EVD-S-002)']],
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
            'from' => ['name' => 'South Africa', 'iso' => 'ZA', 'state' => 'Activated', 'note' => 'Phase 1 Controlled Country'],
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
