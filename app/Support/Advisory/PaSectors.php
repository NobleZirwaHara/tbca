<?php

namespace App\Support\Advisory;

use App\Support\Insights\IndustryRegister;

/**
 * The 17 canonical TBCA industries (IND-01..IND-17) as Project Advisory sectors.
 *
 * Names, slugs and icons are read from the Insights industry register so there is one source of truth;
 * this class adds the Project Advisory view of each sector: the sector-specific studies and a
 * phased advisory plan (concept -> feasibility -> structuring & funding -> implementation).
 */
class PaSectors
{
    /** Keys used before the 17-sector register (kept so older sessions and mandates still resolve). */
    public const LEGACY = [
        'energy-resources' => 'energy-utilities',
        'infrastructure-transport' => 'infrastructure-public-projects',
        'agriculture' => 'agriculture-agro-industry',
        'manufacturing' => 'manufacturing-industrial',
        'ict-digital' => 'technology-ict-digital',
        'health' => 'health-pharmaceuticals',
    ];

    public const DEFAULT = 'infrastructure-public-projects';

    /** @return array<string, array{code: string, label: string, icon: string, blurb: string, subs: list<string>}> */
    public static function all(): array
    {
        static $cache = null;

        return $cache ??= collect(IndustryRegister::industries())->mapWithKeys(fn ($r) => [$r[2] => [
            'code' => sprintf('IND-%02d', $r[0]),
            'label' => $r[3],
            'icon' => $r[4],
            'blurb' => $r[5],
            'subs' => array_map(fn ($s) => $s[1], $r[19]),
        ]])->all();
    }

    public static function key(?string $key): string
    {
        $key = self::LEGACY[$key] ?? $key;

        return $key && array_key_exists($key, self::all()) ? $key : self::DEFAULT;
    }

    public static function label(?string $key): string
    {
        return self::all()[self::key($key)]['label'];
    }

    public static function keyForLabel(string $label): ?string
    {
        return collect(self::all())->search(fn ($s) => $s['label'] === $label) ?: null;
    }

    /** Front-end vocabulary: [{key, code, label, icon, blurb}]. */
    public static function vocab(): array
    {
        return collect(self::all())->map(fn ($s, $k) => ['key' => $k, 'code' => $s['code'], 'label' => $s['label'], 'icon' => $s['icon'], 'blurb' => $s['blurb']])->values()->all();
    }

    /**
     * Sector specifics: [focus, approvals, risks, funders, [[study, why, evidence, low, mid, high], ...]].
     */
    private const DETAIL = [
        'agriculture-agro-industry' => ['Bankable agri and agro-processing projects with secured offtake and water.', ['Water use licence', 'Land tenure / lease confirmation', 'Food safety certification (HACCP / ISO 22000)'], ['Climate and yield variability', 'Offtake price risk', 'Water rights'], ['Agri DFIs', 'Commercial banks (agri desks)', 'Blended-finance funds'],
            [['Soil & Water Assessment', 'Tests soil quality, water rights and irrigation capacity.', 'partial', 18000, 38000, 65000], ['Offtake & Aggregation Review', 'Confirms buyers, aggregation logistics and price risk.', 'missing', 12000, 28000, 45000]]],
        'retail-consumer-commerce' => ['Store roll-outs, distribution centres and e-commerce platforms with proven demand.', ['Trading licences', 'Zoning for retail sites', 'Consumer protection compliance'], ['Footfall and basket-size risk', 'Lease exposure', 'Currency-driven input costs'], ['Commercial banks', 'Private equity', 'Supplier finance'],
            [['Catchment & Footfall Study', 'Quantifies catchment spend, footfall and competing stores.', 'partial', 15000, 32000, 55000], ['Distribution & Fulfilment Review', 'Tests DC location, routes and last-mile costs.', 'missing', 18000, 36000, 60000]]],
        'manufacturing-industrial' => ['Plant builds and expansions with validated process, inputs and export markets.', ['Environmental authorisation', 'Air emissions licence', 'Industrial zoning / SEZ approval'], ['Input-cost volatility', 'Technology performance', 'Power supply'], ['Industrial DFIs', 'Export credit agencies', 'Commercial banks'],
            [['Process & Plant Engineering Review', 'Validates process design, capacity and capex estimates.', 'human_review', 45000, 90000, 150000], ['Supply Chain & Input Cost Study', 'Assesses input availability, logistics and cost exposure.', 'partial', 15000, 30000, 50000]]],
        'transport-logistics' => ['Logistics hubs, fleets and corridor projects with secured volumes.', ['Operating permits', 'Port / rail access agreements', 'Customs bonded status'], ['Volume risk', 'Fuel price exposure', 'Border delays'], ['Infrastructure funds', 'Asset finance houses', 'DFIs'],
            [['Freight Volume & Corridor Study', 'Forecasts volumes on the target corridor and modal split.', 'partial', 25000, 50000, 85000], ['Site & Access Assessment', 'Assesses site access, road / rail links and expansion room.', 'missing', 15000, 30000, 50000]]],
        'mining-minerals' => ['Exploration-to-production projects with credible resource statements and ESG plans.', ['Mining right / licence', 'Environmental authorisation', 'Social and labour plan'], ['Resource confidence', 'Commodity price', 'Community and permitting risk'], ['Mining-focused funds', 'Streaming / royalty investors', 'DFIs'],
            [['Mineral Resource Estimate (Competent Person)', 'Independent resource statement to SAMREC / JORC standard.', 'human_review', 60000, 120000, 220000], ['Metallurgical Test Work Review', 'Confirms recoveries and processing route.', 'missing', 40000, 80000, 140000]]],
        'energy-utilities' => ['Generation, renewables and utility projects with grid access and bankable PPAs.', ['Generation licence', 'Grid connection approval', 'Environmental authorisation'], ['Grid capacity', 'Off-taker credit', 'Tariff and FX risk'], ['Energy DFIs', 'Green bonds', 'Climate funds'],
            [['Grid / Utility Interface Review', 'Confirms grid capacity, connection requirements and compliance.', 'missing', 15000, 35000, 60000], ['Environmental & Social Baseline Study', 'Establishes environmental and social baseline for permitting and risk management.', 'human_review', 40000, 85000, 140000]]],
        'infrastructure-public-projects' => ['Public works, PPPs and EPC projects with clear procurement routes and funding.', ['Treasury PPP approvals', 'Public procurement compliance', 'Environmental authorisation'], ['Procurement delay', 'Construction cost overrun', 'Availability-payment risk'], ['Infrastructure funds', 'Multilateral development banks', 'Project bonds'],
            [['Traffic & Demand Study', 'Forecasts traffic volumes, demand growth and revenue drivers.', 'missing', 35000, 70000, 120000], ['Geotechnical Investigation', 'Assesses ground conditions for design and cost certainty.', 'missing', 25000, 55000, 90000]]],
        'property-construction' => ['Developments with zoning certainty, cost plans and pre-lets.', ['Zoning and rezoning', 'Building plan approval', 'Environmental screening'], ['Pre-let / sales risk', 'Construction cost escalation', 'Interest-rate exposure'], ['Property funds', 'Commercial banks (development finance)', 'REITs'],
            [['Zoning & Planning Review', 'Confirms zoning rights, bulk and planning approvals path.', 'missing', 15000, 32000, 55000], ['Quantity Surveyor Cost Plan', 'Independent construction cost estimate and contingencies.', 'partial', 25000, 50000, 85000]]],
        'tourism-hospitality' => ['Hotels, lodges and attractions with tested ADR, occupancy and access.', ['Tourism grading', 'Liquor and trading licences', 'Environmental scoping (sensitive sites)'], ['Seasonality', 'Access and airlift', 'Reputational / safety risk'], ['Hospitality funds', 'Tourism DFIs', 'Operator key-money'],
            [['Hospitality Market & ADR Study', 'Forecasts occupancy, ADR and competitive set.', 'available', 25000, 50000, 80000], ['Environmental Scoping', 'Screens environmental sensitivities and permits.', 'missing', 15000, 30000, 50000]]],
        'professional-services' => ['Firm build-outs, regional expansions and shared-service centres.', ['Professional body registration', 'Regulated-activity licences', 'Data protection registration'], ['Talent availability', 'Regulatory scope', 'Client concentration'], ['Private equity', 'Commercial banks', 'Partner capital'],
            [['Market Sizing & Fee Benchmark Study', 'Sizes the addressable market and benchmarks fee levels.', 'partial', 12000, 25000, 40000], ['Regulatory Scope Review', 'Confirms which activities are reserved or licensed.', 'missing', 10000, 22000, 38000]]],
        'technology-ict-digital' => ['Networks, data centres and digital platforms with licences and scale economics.', ['Telecoms / spectrum licence', 'Data protection compliance', 'Data-centre permits'], ['Technology obsolescence', 'Licensing', 'FX on hardware'], ['Tech-focused VCs', 'Infrastructure funds', 'Vendor finance'],
            [['Network & Spectrum Review', 'Assesses coverage, spectrum licensing and network design.', 'missing', 20000, 45000, 75000], ['Cybersecurity & Data Protection Review', 'Data protection and security architecture assessment.', 'human_review', 15000, 30000, 50000]]],
        'government-public-sector' => ['Public programmes, SOE projects and municipal investments with clear mandates.', ['Budget / MTEF approval', 'Public finance management compliance', 'Cabinet or council resolution'], ['Political cycle', 'Procurement challenge', 'Fiscal constraints'], ['National treasury', 'Multilateral development banks', 'Donor programmes'],
            [['Needs & Options Analysis', 'Defines the service need and compares delivery options.', 'partial', 20000, 40000, 70000], ['Value-for-Money Assessment', 'Tests public-sector comparator vs alternative delivery.', 'missing', 25000, 50000, 90000]]],
        'ngo-social-enterprise-development' => ['Donor-funded programmes and social enterprises with measurable impact.', ['NPO / PBO registration', 'Donor compliance requirements', 'Safeguarding policies'], ['Funding continuity', 'Impact measurement', 'Governance capacity'], ['Foundations', 'Bilateral donors', 'Impact investors'],
            [['Baseline & Impact Framework', 'Sets baseline indicators and theory of change.', 'partial', 12000, 25000, 45000], ['Programme Feasibility & Partner Mapping', 'Tests delivery model and implementing partners.', 'missing', 15000, 30000, 50000]]],
        'education-skills' => ['Schools, campuses, training centres and ed-tech with accreditation and demand.', ['Institution registration / accreditation', 'Curriculum approval', 'Zoning for campuses'], ['Enrolment risk', 'Accreditation timing', 'Fee affordability'], ['Education funds', 'DFIs', 'Skills levies / grants'],
            [['Enrolment Demand Study', 'Forecasts learner demand and price points.', 'partial', 15000, 30000, 50000], ['Accreditation Pathway Review', 'Maps accreditation steps and timelines.', 'missing', 10000, 22000, 38000]]],
        'health-pharmaceuticals' => ['Hospitals, clinics, pharma and device projects with licensing and clinical demand.', ['Health facility licence', 'Medicines regulator approvals', 'Certificate of need (where applicable)'], ['Clinical staffing', 'Regulatory approval', 'Reimbursement risk'], ['Health-focused funds', 'DFIs', 'Medical aid partnerships'],
            [['Clinical Service Demand Study', 'Quantifies catchment demand and service mix.', 'partial', 30000, 60000, 100000], ['Regulatory Licensing Review', 'Maps licensing and accreditation requirements.', 'missing', 12000, 25000, 40000]]],
        'creative-media-entertainment' => ['Studios, venues, content and sports projects with rights and audience economics.', ['Broadcasting / content licences', 'Venue and events permits', 'IP and rights clearance'], ['Audience demand', 'Rights ownership', 'Revenue concentration'], ['Media funds', 'Film incentives', 'Sponsorship'],
            [['Audience & Revenue Model Study', 'Tests audience size, monetisation and comparables.', 'partial', 12000, 25000, 45000], ['Rights & IP Review', 'Confirms chain of title and licensing.', 'missing', 10000, 20000, 35000]]],
        'financial-services' => ['Banks, insurers, fintechs and funds with licensing, capital and risk frameworks.', ['Banking / insurance / FSP licence', 'Prudential capital requirements', 'AML / KYC compliance'], ['Capital adequacy', 'Credit and conduct risk', 'Regulatory approval timing'], ['Strategic investors', 'Private equity', 'DFIs (financial-sector lines)'],
            [['Licensing & Capital Requirements Review', 'Maps licences and minimum capital for the business model.', 'human_review', 25000, 50000, 90000], ['Market & Credit Risk Study', 'Sizes the market and models credit and conduct risk.', 'partial', 20000, 45000, 80000]]],
    ];

    /** Sector-specific study rows (in PaContent's study row format). */
    public static function specificStudies(string $key): array
    {
        $rows = self::DETAIL[self::key($key)][4];

        return array_map(fn ($r) => [
            $r[0], $r[1], $r[2],
            $r[2] === 'missing' ? 'Open Provider List' : 'Named Provider Required',
            $r[2] === 'available' ? 'Quote Required' : 'Quote Pending',
            '3–5 weeks', 'Reliance: Full · Rights: TBCA Standard (IP owned by client)',
            $r[2] === 'missing' ? 'Limited Reuse' : 'Reusable', $r[2] === 'missing' ? 'Limited' : 'High', 'Moderate',
            $r[2] === 'human_review' ? 'Estimate Pending' : 'Quote Required', [$r[3], $r[4], $r[5]],
        ], $rows);
    }

    /** Phased advisory plan for a sector. */
    public static function plan(string $key): array
    {
        $key = self::key($key);
        $s = self::all()[$key];
        [$focus, $approvals, $risks, $funders, $studies] = self::DETAIL[$key];
        $names = array_column($studies, 0);

        return [
            'key' => $key,
            'code' => $s['code'],
            'label' => $s['label'],
            'focus' => $focus,
            'subs' => $s['subs'],
            'approvals' => $approvals,
            'risks' => $risks,
            'funders' => $funders,
            'phases' => [
                ['A0–A3', 'Concept & Screening', 'Define the project, test strategic fit and screen for fatal flaws.', ['Project concept note', 'Fatal-flaw screen', "{$s['label']} market snapshot"]],
                ['A4–A7', 'Feasibility & Studies', 'Commission and integrate the studies a funder will rely on.', ['Market Demand & Offtake Study', 'Technical Feasibility Study', ...$names]],
                ['A8–A12', 'Structuring & Funding Readiness', 'Structure the deal, build the model and prepare the investor pack.', ['Financial model & valuation', 'Risk allocation matrix', 'Investor / funder pack']],
                ['A13–A17', 'Implementation & Monitoring', 'Mobilise delivery, track gates and report impact.', ['PMO set-up', 'Approvals tracker: '.implode(', ', $approvals), 'Impact & benefits monitoring']],
            ],
        ];
    }
}
