<?php

namespace App\Support\Countries;

/**
 * Country service catalogue (CT-006 / CT-007). South Africa is the only activated
 * country object, so it is the only country with service rows. Each service carries
 * its own availability state; a numeric price exists only where a signed
 * ResolvedPricePermit has been issued (price_permit + price_zar).
 */
class ServiceCatalogue
{
    /** key => [code prefix, name, blurb, icon, category state, service state for available rows] */
    public const CATEGORIES = [
        'business' => ['BCS', 'Business & Corporate Services', 'Company formation, corporate governance, secretarial and compliance.', 'briefcase', 'Active', AvailabilityState::ACTIVE],
        'tax' => ['TAX', 'Tax & Statutory Services', 'Tax advisory, compliance, VAT, PAYE, returns and tax structuring.', 'receipt', 'Active', AvailabilityState::ACTIVE],
        'legal' => ['LEG', 'Legal & Regulatory Services', 'Legal advisory, contracts, regulatory licensing and approvals.', 'scale', 'Active', AvailabilityState::ACTIVE],
        'financial' => ['FIN', 'Financial & Investment Services', 'Financial advisory, investment structuring, M&A and capital raising.', 'landmark', 'Active (Limited)', AvailabilityState::ACTIVE_LIMITED],
        'hr' => ['HR', 'Employment & HR Services', 'HR advisory, employment contracts, policies and payroll support.', 'users', 'Active (Limited)', AvailabilityState::ACTIVE_LIMITED],
        'trade' => ['CBT', 'Cross-Border & Trade Services', 'Export-import advisory, trade compliance and customs support.', 'globe', 'Quote-Only', AvailabilityState::QUOTE_ONLY],
        'technology' => ['TEC', 'Technology & Data Services', 'IT advisory, digital transformation, data governance and cybersecurity.', 'cpu', 'Quote-Only', AvailabilityState::QUOTE_ONLY],
        'specialist' => ['SPA', 'Specialist & Advisory Services', 'Specialist advisory, research, ESG, sustainability, and expert opinions.', 'sparkles', 'Restricted', AvailabilityState::QUOTE_ONLY],
    ];

    /** Services per category: [name, access] — access a = available, r = restricted, u = unavailable. Optional price permit. */
    public const SERVICES = [
        'business' => [
            ['Company Registration', 'a'], ['Annual CIPC Returns Filing', 'a', 3500], ['Company Secretarial Services', 'a'],
            ['Shareholder Agreement Drafting Support', 'a'], ['Director Changes & Amendments', 'a', 6500], ['Memorandum of Incorporation Amendment', 'a'],
            ['Share Register Maintenance', 'a'], ['B-BBEE Readiness Review', 'a'], ['Business Name Reservation', 'a'],
            ['Company Deregistration Support', 'a'], ['Corporate Governance Framework', 'a'], ['Board Charter & Policies', 'a'],
            ['Beneficial Ownership Filing', 'a'], ['Business Plan Development', 'a'],
            ['Branch Office Registration (Foreign Company)', 'r'], ['Business Rescue Readiness Review', 'r'],
        ],
        'tax' => [
            ['Tax Registration (Income Tax)', 'a'], ['VAT Registration & Compliance', 'a', 4950], ['PAYE, UIF & SDL Registration', 'a'],
            ['Provisional Tax Planning', 'a', 7600], ['Tax Compliance Status (TCS) Support', 'a'], ['Monthly VAT Return Preparation', 'a'],
            ['Annual Tax Return Preparation Support', 'a'], ['Payroll Tax Reconciliation (EMP501)', 'a'], ['Tax Structuring Review', 'a'],
            ['Transfer Pricing Documentation Readiness', 'a'], ['Customs & Excise Registration', 'a'], ['Tax Dispute Representation', 'r'],
        ],
        'legal' => [
            ['Contract Review Support', 'a'], ['Commercial Agreement Templates', 'a'], ['POPIA Compliance Programme', 'a', 8900],
            ['Regulatory Licensing Roadmap', 'a'], ['Consumer Protection Act Compliance Review', 'a'], ['Terms & Conditions Drafting Support', 'a'],
            ['Intellectual Property Registration Support', 'a'], ['Competition Compliance Review', 'a'],
            ['Litigation Support Referral', 'r'], ['Legal Opinion Referral', 'r'],
        ],
        'financial' => [
            ['Financial Model Development', 'a'], ['Investor Readiness Assessment', 'a'], ['Capital Raising Strategy', 'a'],
            ['Business Valuation', 'a'], ['Budgeting & Forecasting', 'a'], ['Management Accounts Setup', 'a'],
            ['Cash Flow Management Review', 'a'], ['Funding Application Support', 'a'], ['Grant & Incentive Application Support', 'a'],
            ['Debt Funding Readiness', 'a'], ['M&A Transaction Advisory', 'r'], ['Investment Structuring', 'r'],
            ['Audit Preparation Support', 'r'], ['Regulated Investment Advice', 'u'],
        ],
        'hr' => [
            ['HR Policy Framework', 'a', 5400], ['Employment Contract Templates', 'a'], ['Employment Equity Plan Support', 'a'],
            ['Skills Development Plan (WSP/ATR)', 'a'], ['Payroll Setup Support', 'a'], ['Performance Management Framework', 'a'],
            ['Labour Relations Advisory', 'r'], ['Retrenchment Process Support', 'r'], ['Labour Broking Services', 'u'],
        ],
        'trade' => [
            ['Export Readiness Assessment', 'a'], ['Import/Export Registration Support', 'a'], ['Trade Compliance Review', 'a'],
            ['Customs Classification Support', 'a'], ['AfCFTA Market Access Review', 'a'], ['Export Incentive Application', 'a'],
            ['Trade Finance Readiness', 'a'], ['Supplier Due Diligence (Cross-Border)', 'a'], ['Market Entry Assessment (Inbound)', 'a'],
            ['Cross-Border Payment Structuring', 'r'], ['Foreign Exchange Control Applications', 'r'], ['Transfer of Goods Logistics Advisory', 'r'],
            ['Cross-Border Tax Advisory', 'r'], ['Customs Clearing & Forwarding', 'u'], ['Cross-Border Settlement Services', 'u'],
        ],
        'technology' => [
            ['Digital Transformation Roadmap', 'a'], ['IT Governance Review', 'a'], ['Data Governance Framework', 'a'],
            ['Cybersecurity Readiness Assessment', 'a'], ['AI Automation Opportunity Scan', 'a'], ['Cloud Migration Planning', 'a'],
            ['Systems Selection Advisory', 'a'], ['Data Residency Assessment', 'r'], ['Penetration Testing Referral', 'r'],
            ['Managed Security Operations', 'u'],
        ],
        'specialist' => [
            ['Market Research & Feasibility', 'a'], ['ESG Advisory & Reporting', 'a'], ['Sustainability Strategy', 'a'],
            ['Industry Research Briefs', 'a'], ['Operational Efficiency Review', 'a'], ['Strategy Development Workshop', 'a'],
            ['Risk Assessment Framework', 'a'], ['Project Feasibility Study', 'a'], ['Stakeholder Engagement Planning', 'a'],
            ['Impact Measurement Framework', 'a'], ['Expert Opinion Briefs', 'a'], ['Environmental Authorisation Support', 'r'],
            ['Mining Sector Advisory', 'r'], ['Statutory Audit', 'u'], ['Actuarial Services', 'u'], ['Legal Representation', 'u'],
        ],
    ];

    public static function category(string $key): ?array
    {
        $c = self::CATEGORIES[$key] ?? null;

        return $c ? ['key' => $key, 'prefix' => $c[0], 'name' => $c[1], 'blurb' => $c[2], 'icon' => $c[3], 'state' => $c[4]] : null;
    }

    public static function categoryOptions(): array
    {
        return collect(self::CATEGORIES)->map(fn ($c, $k) => ['value' => $k, 'label' => $c[1]])->values()->all();
    }

    /** Rows for seeding the South Africa catalogue. */
    public static function southAfricaRows(): array
    {
        $rows = [];
        $sort = 0;
        foreach (self::SERVICES as $key => $services) {
            [$prefix, $catName, , , , $availableState] = self::CATEGORIES[$key];
            foreach ($services as $i => $s) {
                [$name, $access] = $s;
                $code = sprintf('ZA-%s-%03d', $prefix, $i + 1);
                $state = match ($access) {
                    'a' => $availableState,
                    'r' => AvailabilityState::PARTNER_ROUTED,
                    default => AvailabilityState::RESTRICTED,
                };
                $rows[] = [
                    'code' => $code,
                    'category' => $key,
                    'name' => $name,
                    'summary' => self::summary($name, $catName, $access),
                    'availability_state' => $state,
                    'access' => ['a' => 'available', 'r' => 'restricted', 'u' => 'unavailable'][$access],
                    'access_type' => $access === 'r' ? 'Partner-routed' : 'Service-by-service',
                    'commercial_model' => $state === AvailabilityState::QUOTE_ONLY ? 'Quote' : 'Commercial',
                    'price_permit' => isset($s[2]),
                    'price_zar' => $s[2] ?? null,
                    'timeline' => self::timeline($key),
                    'details' => $code === 'ZA-BCS-001' ? self::companyRegistration() : self::genericDetails($name, $catName, $access),
                    'sort' => $sort++,
                ];
            }
        }

        return $rows;
    }

    private static function summary(string $name, string $category, string $access): string
    {
        if ($name === 'Company Registration') {
            return 'End-to-end company registration with CIPC including name search, document preparation, submission, and incorporation certificate.';
        }

        return match ($access) {
            'a' => "{$name} delivered by TBCA under the {$category} catalogue, subject to Country Resolver permission.",
            'r' => "{$name} is routed to a qualified, verified partner; TBCA coordinates within the professional boundary.",
            default => "{$name} is not provided by TBCA in South Africa — reserved for licensed professionals or outside scope.",
        };
    }

    private static function timeline(string $key): string
    {
        return match ($key) {
            'business', 'tax' => '5 – 10 Business Days',
            'legal', 'hr' => '7 – 15 Business Days',
            'financial', 'specialist' => '10 – 20 Business Days',
            default => '15 – 30 Business Days',
        };
    }

    private static function genericDetails(string $name, string $category, string $access): array
    {
        return [
            'overview' => $access === 'u'
                ? "TBCA does not provide {$name} in South Africa. The honest absence register records why and the permitted route."
                : "{$name} is part of the {$category} catalogue. Delivery follows the controlled TBCA journey: eligibility check, scoping, evidence-backed delivery, human review and release.",
            'included' => ['Eligibility check against the Country Resolver', 'Scoping session and requirements confirmation', 'Evidence-backed working papers', 'Human-reviewed deliverable', 'Release with source and limitation manifest'],
            'process' => [
                ['Eligibility Check', 'Country Resolver validates all dependencies.'],
                ['Scoping', 'Requirements, documents and timelines confirmed.'],
                ['Delivery', 'Specialist team prepares the deliverable.'],
                ['Human Review', 'Subject matter expert reviews and approves.'],
                ['Release', 'Deliverable and evidence manifest released to you.'],
            ],
            'requirements' => ['Verified client identity (KYC)', 'Company registration details', 'Signed engagement letter before delivery'],
            'dependencies' => ['Legal & Regulatory', 'Tax & Statutory', 'Payments & FX', 'Identity & KYC', 'Data & Licences'],
            'limitations' => $access === 'r'
                ? ['Delivered or reviewed by an approved partner — no direct route bypasses the partner gate.']
                : ['Commercial availability is service-by-service and resolver-governed.', 'TBCA does not provide reserved professional services.'],
        ];
    }

    private static function companyRegistration(): array
    {
        return [
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
            'requirements' => ['Certified ID copies of all directors', 'Proposed company names (up to four)', 'Registered office address', 'Share structure and shareholder details'],
            'dependencies' => ['Legal & Regulatory', 'Tax & Statutory', 'Payments & FX', 'Identity & KYC', 'Data & Licences'],
            'limitations' => ['Service delivery is subject to Country Resolver permit and any sector-specific regulatory approvals.', 'CIPC statutory fees are Ledger S charges payable to the authority, never TBCA revenue.'],
            'key' => ['Delivery Model' => 'Managed Service', 'Service Type' => 'Service-by-service', 'Typical Timeline' => '5 – 10 Business Days', 'Renewal Required' => 'No', 'Refund Policy' => 'See Refunds Policy', 'Service Owner' => 'TBCA Operations', 'Evidence Quality' => 'High', 'Data Freshness' => 'Current'],
        ];
    }
}
