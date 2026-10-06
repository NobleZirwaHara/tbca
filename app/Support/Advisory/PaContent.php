<?php

namespace App\Support\Advisory;

/**
 * Project Advisory content register (PA-TEB v2.0): services, lifecycle A0-A17,
 * gates G0-G10, engagement architectures, sector studies, NDA and method cards.
 */
class PaContent
{
    /** Sectors are the 17 canonical TBCA industries: see PaSectors (read from the Insights industry register). */
    public const SPONSORS = ['Corporate', 'Developer', 'Public Sector', 'DFI-backed', 'Founder-led', 'Investor Group'];

    public const STAGES = ['Idea', 'Pre-Feasibility', 'Feasibility', 'Structuring', 'Funding Readiness', 'Implementation'];

    public const SIZE_BANDS = [
        'under-10m' => ['Under R10m', 0.7],
        '10m-50m' => ['R10m to R50m', 0.85],
        '50m-250m' => ['R50m to R250m', 1.0],
        '250m-1bn' => ['R250m to R1bn', 1.25],
        'over-1bn' => ['Over R1bn', 1.5],
    ];

    /** A0-A17 lifecycle (blueprint §3.1). */
    public const LIFECYCLE = [
        ['A0', 'Intake', 'Orientation', 'Discover', 'Free'],
        ['A1', 'Qualification', 'Country, Sector, Stage and Sponsor Context', 'Discover', 'Free'],
        ['A2', 'NDA', 'Confidentiality / NDA', 'Discover', 'Free'],
        ['A3', 'Discovery', 'Readiness, Structured Discovery and Cost Exposure', 'Discover', 'P03 if paid path selected'],
        ['A4', 'Method Card', 'Method Card Approval', 'Discover', 'Free'],
        ['A5', 'Engagement Letter', 'Engagement Letter', 'Discover', 'Signature'],
        ['A6', 'Mandate', 'Mandate Letter & Deposit', 'Discover', 'Signature + deposit'],
        ['A7', 'Evidence Intake', 'Concept Development & Evidence Intake', 'Analyse', 'P04'],
        ['A8', 'Feasibility', 'Pre-Feasibility and Feasibility', 'Analyse', 'P05/P06'],
        ['A9', 'Structuring', 'Third-Party Studies and Structuring', 'Analyse / Validate', 'P06 + approved X/S'],
        ['A10', 'Funding Prep', 'Business Case, Financial Model and Valuation', 'Design / Validate', 'P07-P10'],
        ['A11', 'Market Approach', 'Structuring and Risk Allocation', 'Design', 'P11'],
        ['A12', 'Diligence Support', 'Packaging / Information Memorandum', 'Package', 'P15'],
        ['A13', 'Mobilisation', 'Mobilisation / VDR / Funder Approach', 'Mobilise', 'Recurring vehicle + Ledger P'],
        ['A14', 'Negotiation', 'Negotiation / Term Sheet', 'Mobilise', 'P17'],
        ['A15', 'Execution Support', 'CP and Financial Close', 'Mobilise', 'P18/P19 + separate C trigger'],
        ['A16', 'Close Readiness', 'Implementation / PMO', 'Implement', 'P21'],
        ['A17', 'Impact Monitoring', 'Monitoring / Impact / Renewal / Exit', 'Measure Impact', 'P26'],
    ];

    /** G0-G10 gate set (blueprint §9.1); the stage index each gate opens. */
    public const GATES = [
        ['G0', 'Intake & Eligibility', 'No fee', 1],
        ['G1', 'Discovery Method Approval', 'P03 + PL-01', 5],
        ['G2', 'Mandate & Engagement Letter', 'Signed commercial configuration', 6],
        ['G3', 'External Commitment Approval', 'Each X/S line', 9],
        ['G4', 'Preparation Stage Approval', 'P05-P10 or Full Preparation Package', 10],
        ['G5', 'Structuring Approval', 'P11 + P12 + permitted external inputs', 11],
        ['G6', 'Project Integrity Gate', 'No separate fee', 12],
        ['G7', 'Mobilisation & Platform Approval', 'Primary Recurring Vehicle + PL allowances', 13],
        ['G8', 'Market Approach Approval', 'P15 + P17 + PL-07', 14],
        ['G9', 'Contingent Crystallisation', 'Applicable C class only after trigger', 15],
        ['G10', 'Renewal Approval', 'Next recurring T/P term', 17],
    ];

    public const METHOD = [
        ['Discover', 'Understand your vision, objectives and success criteria.', 'search'],
        ['Analyse', 'Research, assess and analyse opportunities, risks and constraints.', 'bar-chart-3'],
        ['Design', 'Develop options, strategies and recommended solutions.', 'pen-tool'],
        ['Validate', 'Test assumptions, financials and market viability.', 'shield-check'],
        ['Package', 'Structure, document and prepare investor-ready materials.', 'package'],
        ['Mobilise', 'Connect with capital, partners and key stakeholders.', 'users'],
        ['Implement', 'Support execution, governance and performance.', 'settings'],
        ['Measure Impact', 'Monitor outcomes and report on impact and value.', 'target'],
    ];

    public const LEDGERS = [
        'T' => ['Professional Fee', 'TBCA', 'We deliver advice and due skill.'],
        'P' => ['Platform Fee', 'TBCA Platform', 'Platform access, security & support.'],
        'X' => ['External Provider', 'External Provider', 'Third-party studies & specialist costs.'],
        'S' => ['Statutory Charge', 'Authority', 'Authority fees, levies & statutory items.'],
        'C' => ['Contingent Fee', 'TBCA Contingent Invoice', 'Outcome-based only if authorised.'],
    ];

    /** Ledger T professional fee register (blueprint §5.2): code => [service, benchmark, price]. */
    public const FEE_REGISTER = [
        'P01' => ['Project Intake & Eligibility Screen', 0, 0],
        'P02' => ['Opportunity Orientation Session', 7500, 5250],
        'P03' => ['Structured Discovery & Diagnostic', 17850, 12500],
        'P04' => ['Concept Note & Investability Screen', 32500, 22750],
        'P05' => ['Pre-Feasibility Study', 92500, 64750],
        'P06' => ['Feasibility Study (TBCA advisory scope)', 128500, 89950],
        'P07' => ['Business Case & Investment Memorandum', 96500, 67550],
        'P08' => ['Financial Model (build + audit-ready pack)', 112000, 78400],
        'P09' => ['Valuation & Returns Analysis', 74500, 52150],
        'P10' => ['Risk, ESG & Safeguards Assessment', 86000, 60200],
        'P11' => ['Transaction Structuring & Options Paper', 118000, 82600],
        'P12' => ['Funder Mapping & Approach Strategy', 68000, 47600],
        'P13' => ['Mobilisation Retainer (monthly)', 42500, 29750],
        'P15' => ['Information Memorandum / Teaser Pack', 58000, 40600],
        'P17' => ['Term Sheet & Negotiation Support', 92000, 64400],
        'P21' => ['Advisory Retainer (monthly)', 48000, 33600],
        'P26' => ['Post-Investment Monitoring (monthly)', 38000, 26600],
    ];

    public static function services(): array
    {
        $common = [
            'human' => ['Adviser-led scoping and alignment', 'Insight, challenge and judgement', 'Risk assessment and mitigation', 'Stakeholder engagement', 'Senior review and sign-off'],
            'ai' => ['Market and data intelligence', 'Scenario and sensitivity modelling', 'Forecasting and pattern analysis', 'Drafting sections and visuals', 'Consistency and quality checks'],
            'acceptance' => ['Scope completed in full', 'Analysis technically sound', 'Financial model validated', 'Report meets quality standards', 'Senior review approved'],
            'limitations' => ['Dependent on quality of client inputs', 'Based on assumptions and forecasts', 'Subject to market and regulatory change', 'No guarantee of funding or approval', 'External studies may influence outcome'],
            'inputs' => ['Project concept and objectives', 'Site information and access', 'Existing studies and data', 'Market and customer information', 'Financial assumptions and requirements', 'Stakeholder expectations'],
        ];

        $s = [
            'project-concept-development' => ['PA-T-001', 'P04', 'Project Concept Development', 22750, 'lightbulb', 'Clarify vision, define opportunity and test strategic alignment.',
                'Turn ideas into structured concepts with a clear value proposition, investability screen and roadmap.', '8–10 working days', 'Low–Mid', 'Medium', 'Adviser Review', 'Focused',
                ['Opportunity framing and objectives', 'Value proposition and beneficiaries', 'Concept options and screening', 'High-level cost and revenue view', 'Investability screen', 'Concept note and roadmap'],
                ['Detailed market or technical studies', 'Financial model build', 'Legal or regulatory opinions', 'External provider costs and fees'],
                ['Frame', 'Explore', 'Screen', 'Shape', 'Recommend'],
                ['Concept Note (PDF)', 'Investability Screen (PDF)', 'Roadmap (PPTX)'],
                [['Market Scan', 'Separate if required']]],
            'feasibility-studies' => ['PA-T-002', 'P06', 'Feasibility Studies', 89950, 'clipboard-list', 'Technical, market and financial feasibility with risk review.',
                'Assess technical, market, financial, legal and operational viability of the proposed project to determine bankability and investment readiness.', '15–20 working days', 'Mid–High', 'High', 'Senior Review', 'Comprehensive',
                ['Multi-discipline feasibility assessment', 'Market demand and commercial analysis', 'Technical concept and options analysis', 'Financial model and key ratios', 'Risk assessment and sensitivities', 'Feasibility report and presentation'],
                ['Detailed engineering design', 'Full environmental impact assessment', 'Land acquisition or title searches', 'Legal opinions and transaction docs', 'Statutory approvals and permits', 'External provider costs and fees'],
                ['Discover', 'Define', 'Analyse', 'Model', 'Test', 'Conclude'],
                ['Feasibility Report (PDF)', 'Financial Model (Excel)', 'Executive Summary (PDF)', 'Presentation Deck (PPTX)', 'Data & Assumptions Pack (ZIP)'],
                [['Market Study', 'Separate if required'], ['Technical Specialist Review', 'Quote required'], ['Environmental / Regulatory Study', 'Separate if required'], ['Legal Review', 'Quote required']]],
            'business-case-strategy' => ['PA-T-003', 'P07', 'Business Case & Strategy', 67550, 'target', 'Strategic case, options appraisal and compelling investment narrative.',
                'Build a decision-ready business case with options appraisal, strategic rationale and an investment memorandum.', '12–15 working days', 'Mid', 'High', 'Senior Review', 'Standard',
                ['Strategic rationale and objectives', 'Options appraisal and scoring', 'Economic and commercial case', 'Risk and benefit analysis', 'Investment narrative', 'Business case and memorandum'],
                ['Full financial model audit', 'Detailed technical design', 'Legal opinions', 'External provider costs and fees'],
                ['Context', 'Options', 'Appraise', 'Recommend', 'Narrate'],
                ['Business Case (PDF)', 'Investment Memorandum (PDF)', 'Options Appraisal (Excel)'],
                [['Market Study', 'Separate if required']]],
            'financial-modelling-valuation' => ['PA-T-004', 'P08 + P09', 'Financial Modelling & Valuation', 130550, 'calculator', 'Robust financial models, valuations and scenario analysis.',
                'Build an audit-ready financial model with valuation, returns analysis and scenario testing for funders and investors.', '15–20 working days', 'High', 'High', 'Senior Review', 'Comprehensive',
                ['Integrated three-statement model', 'Funding structure and debt sizing', 'Valuation (DCF and comparables)', 'Returns analysis (IRR, NPV, DSCR)', 'Scenario and sensitivity analysis', 'Model book and assumptions log'],
                ['Independent model audit', 'Tax opinions', 'Legal structuring', 'External provider costs and fees'],
                ['Assumptions', 'Build', 'Calibrate', 'Value', 'Stress-test', 'Document'],
                ['Financial Model (Excel)', 'Valuation Report (PDF)', 'Model Book (PDF)'],
                [['Independent Model Audit', 'Quote required']]],
            'project-structuring-packaging' => ['PA-T-005', 'P11 + P15', 'Project Structuring & Packaging', 123200, 'boxes', 'Structure, allocation, contracts and bankability documentation.',
                'Design the transaction structure, risk allocation and investor-ready package including the information memorandum.', '20–25 working days', 'High', 'High', 'Senior Review', 'Comprehensive',
                ['Transaction structure options paper', 'Risk allocation matrix', 'SPV and contract architecture', 'Information memorandum', 'Teaser pack', 'Data room index'],
                ['Legal drafting of agreements', 'Tax structuring opinions', 'Regulatory filings', 'External provider costs and fees'],
                ['Diagnose', 'Structure', 'Allocate', 'Package', 'Review'],
                ['Structuring Options Paper (PDF)', 'Information Memorandum (PDF)', 'Teaser (PDF)', 'Risk Matrix (Excel)'],
                [['Legal Review', 'Quote required'], ['Tax Opinion', 'Quote required']]],
            'funding-investor-readiness' => ['PA-T-006', 'P12', 'Funding & Investor Readiness', 47600, 'users', 'Investor targeting, information memoranda and deal preparation.',
                'Map funders, prepare the approach strategy and get the project ready for investor and lender engagement.', '10–12 working days', 'Mid', 'Medium', 'Adviser Review', 'Standard',
                ['Funder universe mapping', 'Funder criteria fit analysis', 'Approach strategy and sequencing', 'Investor Q&A preparation', 'Readiness gap list', 'Approach pack'],
                ['Regulated capital-raising activity', 'Placement or brokerage', 'External provider costs and fees'],
                ['Map', 'Match', 'Prepare', 'Sequence', 'Approach'],
                ['Funder Map (Excel)', 'Approach Strategy (PDF)', 'Readiness Gap List (PDF)'],
                [['Regulatory Routing Partner', 'Quote required']]],
            'implementation-support-pmo' => ['PA-T-007', 'P21', 'Implementation Support & PMO', 33600, 'settings', 'Execution support, PMO services and change management.',
                'Monthly advisory retainer providing PMO, governance and change management support through implementation.', 'Monthly (rolling)', 'Mid', 'Medium', 'Adviser Review', 'Ongoing',
                ['Programme management office', 'Governance and reporting cadence', 'Risk and issue management', 'Stakeholder and change management', 'Monthly performance reporting'],
                ['Construction management', 'Procurement execution', 'External provider costs and fees'],
                ['Mobilise', 'Govern', 'Track', 'Report', 'Improve'],
                ['Monthly PMO Report (PDF)', 'Risk Register (Excel)', 'Dashboard (Portal)'],
                [['Independent Engineer', 'Separate if required']]],
        ];

        $out = [];
        foreach ($s as $slug => [$code, $pcode, $name, $price, $icon, $summary, $scope, $duration, $complexity, $depth, $review, $pack, $included, $excluded, $method, $deliverables, $studies]) {
            $out[$slug] = [
                'slug' => $slug, 'code' => $code, 'pcode' => $pcode, 'name' => $name, 'price' => $price, 'icon' => $icon,
                'summary' => $summary, 'scope' => $scope, 'duration' => $duration,
                'derivation' => ['Scope Complexity' => $complexity, 'Analytical Depth' => $depth, 'Review Requirement' => $review, 'Deliverable Pack' => $pack],
                'included' => $included, 'excluded' => $excluded, 'method' => $method, 'deliverables' => $deliverables,
                'studies' => array_map(fn ($x) => ['name' => $x[0], 'status' => $x[1]], $studies),
                ...$common,
            ];
        }

        return $out;
    }

    public static function engagementOptions(): array
    {
        $rows = ['TBCA Fee Logic', 'Platform (P)', 'External (X)', 'Statutory (S)', 'Contingent (C)', 'Typical Gates', 'Capacity Need', 'Permission Need', 'Cancellation / Stop', 'You Keep'];

        return [
            'rows' => $rows,
            'options' => [
                ['key' => 'fixed-scope', 'name' => 'Fixed Scope', 'badge' => 'Most Predictable', 'tone' => 'good', 'icon' => 'clipboard-check', 'body' => 'Defined scope, deliverables and timeline. Best for clear, well-scoped phases.', 'values' => ['Fixed T fee', 'Per engagement', 'Pre-approved only', 'As incurred', 'None by default', 'A0 → A17', 'Standard', 'Standard', 'Pro-rata credits', 'All work to date'],
                    'detail' => 'Each phase is priced as a fixed Ledger T fee with a published Method Card. Platform access is billed per engagement, external studies only after line-by-line approval (G3) and statutory items only as incurred. Stopping at any gate leaves you with all paid work and pro-rata credits for unearned milestones.'],
                ['key' => 'recurring-advisory', 'name' => 'Recurring Advisory', 'badge' => 'Ongoing Partnership', 'tone' => 'info', 'icon' => 'refresh-cw', 'body' => 'Retainer-based ongoing advisory support. Ideal for long-horizon projects.', 'values' => ['Monthly retainer (T)', 'Monthly platform fee', 'Pre-approved only', 'As incurred', 'None by default', 'A0 → A17 (iterative)', 'Ongoing', 'Standard', 'Notice period applies', 'All work to date'],
                    'detail' => 'A monthly Advisory Retainer (P21) or Mobilisation Retainer (P13) with an allowance, an 80% usage warning and a hard cap. Every recurring term requires fresh assent at G10 — there is no silent renewal.'],
                ['key' => 'contingent', 'name' => 'Contingent', 'badge' => 'Conditional', 'tone' => 'bad', 'icon' => 'target', 'body' => 'Outcome-based success fee. Only where legally permitted & approved.', 'subtitle' => 'Requires Class-Specific Authorisation', 'values' => ['Success fee (C)', 'As per engagement', 'Pre-approved only', 'As incurred', 'On valid trigger only', 'Additional C-gates', 'Senior-led', 'Specific authorisation', 'Terms apply', 'All eligible work'],
                    'detail' => 'Contingent economics remain unpayable unless a class-specific legal opinion, board authorisation, conflict disclosure and approved term sheet exist and a valid crystallisation trigger is evidenced at G9.'],
                ['key' => 'co-advisory', 'name' => 'Co-Advisory / Partner-Supported', 'badge' => 'Collaborative', 'tone' => 'gold', 'icon' => 'handshake', 'body' => 'Work with trusted partners. Share expertise and capability.', 'values' => ['Agreed T share', 'As per engagement', 'Partner-led costs', 'As incurred', 'As per agreement', 'Joint approvals', 'Expanded team', 'Partner approvals', 'Joint terms apply', 'All work to date'],
                    'detail' => 'TBCA and a qualified partner deliver jointly. Each party invoices its own ledger; partner costs are disclosed as Ledger X and require joint approvals at every gate.'],
            ],
            'included' => ['Method card approval before paid work', 'Transparent five-ledger fee separation', 'Stop / pause ladder at any gate', 'Portable work product and evidence', 'Human review where it matters', 'Bankability & investor-readiness focus', 'POPIA-aware data controls'],
        ];
    }

    /** Sector study register for the Sector Study Explorer. */
    public static function studies(string $sector): array
    {
        $generic = [
            ['Market Demand & Offtake Study', 'Validates demand, buyers, contract terms and revenue bankability.', 'available', 'Named Provider Required', 'Quote Required', '3–4 weeks', 'Reliance: Full · Rights: TBCA Standard (IP owned by client)', 'Reusable', 'High', 'High', 'Quote Required', [15000, 45000, 80000]],
            ['Technical Feasibility Study', 'Assesses technology options, sizing, performance and operational viability.', 'partial', 'Named Provider Required', 'Quote Pending', '4–6 weeks', 'Reliance: Full · Rights: TBCA Standard (IP owned by client)', 'Reusable', 'High', 'High', 'Quote Pending', [30000, 60000, 95000]],
        ];
        $sector = PaSectors::key($sector);
        $rows = array_merge($generic, PaSectors::specificStudies($sector));

        return array_map(fn ($r, $i) => [
            'key' => $sector.'-'.$i, 'name' => $r[0], 'why' => $r[1], 'evidence' => $r[2], 'provider' => $r[3], 'quote' => $r[4],
            'timing' => $r[5], 'rights' => $r[6], 'reuse' => $r[7], 'transferability' => $r[8], 'abort' => $r[9], 'cost' => $r[10],
            'range' => $r[11],
        ], $rows, array_keys($rows));
    }

    public static function readinessDimensions(): array
    {
        return [
            ['project-definition', 'Project Definition', 'Clarity of vision, objectives and scope', ['available' => 'Well defined objectives. Proceed to next stage.', 'gap' => 'Objectives unclear. Run a concept workshop.']],
            ['sponsor-readiness', 'Sponsor Readiness', 'Sponsor alignment, governance and authority', ['available' => 'Sponsor aligned with clear authority.', 'gap' => 'Sponsor approvals pending. Obtain Board resolution.']],
            ['site-rights', 'Site & Rights', 'Land, permits, access and tenure', ['available' => 'Land rights and access secured.', 'gap' => 'Land rights and permits not secured. Engage legal and authorities.']],
            ['technical-evidence', 'Technical Evidence', 'Engineering data, designs and technology', ['available' => 'Technical basis documented.', 'gap' => 'Technical feasibility needs review. Schedule technical review.']],
            ['market-evidence', 'Market Evidence', 'Market demand, competition and offtake', ['available' => 'Demand and offtake evidenced.', 'gap' => 'Detailed market study required. Commission market research.']],
            ['financial-information', 'Financial Information', 'Cost estimates, funding plan and returns', ['available' => 'Financials validated.', 'gap' => 'Financial model needs validation. Engage financial modeller.']],
            ['regulatory-pathway', 'Regulatory Pathway', 'Licences, environmental and compliance', ['available' => 'Approvals pathway confirmed.', 'gap' => 'Environmental approvals outstanding. Initiate EIA process.']],
            ['esg-safeguards', 'ESG & Safeguards', 'Sustainability, social and governance', ['available' => 'ESG plan in place.', 'gap' => 'ESG plan in draft. Develop full ESG plan.']],
            ['funding-readiness', 'Funding Readiness', 'Financing strategy and lender engagement', ['available' => 'Lender engagement underway.', 'gap' => 'Lender conversations not started. Initiate lender engagement.']],
            ['transaction-documentation', 'Transaction Documentation', 'Key agreements and structuring docs', ['available' => 'Key agreements drafted.', 'gap' => 'Term sheets and agreements missing. Draft key documentation.']],
        ];
    }

    public const EVIDENCE_POINTS = ['available' => 10, 'partial' => 6, 'human_review' => 5, 'external_review' => 4, 'missing' => 0];

    public static function readinessScore(array $answers): array
    {
        $dims = self::readinessDimensions();
        $score = 0;
        $rows = [];
        foreach ($dims as [$key, $name, $sub, $g]) {
            $status = $answers[$key] ?? 'missing';
            $score += self::EVIDENCE_POINTS[$status] ?? 0;
            $rows[] = ['key' => $key, 'name' => $name, 'sub' => $sub, 'status' => $status, 'guidance' => $status === 'available' ? $g['available'] : $g['gap']];
        }
        $band = match (true) {
            $score >= 80 => ['Well Prepared', 'Ready to commit to the next advisory gate with confidence.'],
            $score >= 60 => ['Ready for Next Advisory Gate', 'Most evidence is in place. Close remaining gaps in parallel.'],
            $score >= 30 => ['Developing', 'Strong foundation in some areas. Address key gaps to advance.'],
            default => ['Early Stage', 'Significant evidence gaps. Start with structured discovery.'],
        };
        $priority = ['missing' => 0, 'human_review' => 1, 'external_review' => 2, 'partial' => 3];
        $resolve = collect($rows)->filter(fn ($r) => $r['status'] !== 'available')
            ->sortBy(fn ($r) => $priority[$r['status']] ?? 9)->take(5)->values()
            ->map(fn ($r) => ['name' => $r['name'], 'action' => $r['guidance'], 'status' => $r['status']])->all();

        return ['score' => $score, 'band' => $band[0], 'band_note' => $band[1], 'rows' => $rows, 'resolve' => $resolve];
    }

    /** Path-to-close cost exposure: per-ledger low/expected/high. No cross-ledger total. */
    public static function costExposure(array $ctx, array $reuse = []): array
    {
        $mult = self::SIZE_BANDS[$ctx['size_band'] ?? '50m-250m'][1] ?? 1.0;
        $stageIdx = array_search($ctx['stage'] ?? 'Feasibility', self::STAGES, true);
        $stageIdx = $stageIdx === false ? 2 : $stageIdx;
        $reusable = count(array_filter($reuse, fn ($v) => $v === 'reusable'));
        $reuseFactor = 1 - min(0.15, $reusable * 0.05);

        $t = [
            ['Structured Discovery & Diagnostic', 'Time & Materials', 'High', [12500, 22750, 35000], 0],
            ['Concept Note & Investability Screen', 'Fixed Fee', 'High', [22750, 22750, 22750], 0],
            ['Feasibility Review', 'Time & Materials', 'High', [18500, 33250, 50000], 1],
            ['Financial Modelling', 'Time & Materials', 'High', [15000, 27500, 40000], 2],
            ['Structuring Support', 'Time & Materials', 'Medium', [20000, 37500, 60000], 3],
            ['Investor Readiness Pack', 'Fixed Fee', 'High', [25000, 25000, 25000], 3],
        ];
        $lines = ['T' => [], 'P' => [], 'X' => [], 'S' => [], 'C' => []];
        foreach ($t as $i => [$item, $basis, $certainty, $range, $minStage]) {
            if ($i === 1 && $stageIdx > 1) {
                continue; // concept note already behind the project
            }
            if ($minStage > $stageIdx + 2) {
                continue;
            }
            $scale = $basis === 'Fixed Fee' ? 1 : $mult * $reuseFactor;
            $lines['T'][] = ['item' => $item, 'recipient' => 'TBCA', 'basis' => $basis, 'certainty' => $certainty, 'range' => array_map(fn ($v) => (int) (round($v * $scale / 50) * 50), $range)];
        }
        foreach ([['Client Portal Workspace', 'Monthly', [1200, 1950, 2750]], ['Document Workflow', 'Monthly', [600, 1150, 1750]], ['Secure Collaboration', 'Monthly', [800, 1250, 1950]], ['AI-Assisted Analysis Workspace', 'Usage', [1200, 2500, 3950]]] as [$item, $basis, $range]) {
            $lines['P'][] = ['item' => $item, 'recipient' => 'TBCA', 'basis' => $basis, 'certainty' => 'Medium', 'range' => $range];
        }
        $sectorStudies = self::studies($ctx['sector'] ?? 'energy-resources');
        foreach ($sectorStudies as $st) {
            $lines['X'][] = ['item' => $st['name'], 'recipient' => 'External Provider', 'basis' => $st['quote'], 'certainty' => 'Estimate Pending', 'range' => array_map(fn ($v) => (int) (round($v * $mult / 500) * 500), $st['range'])];
        }
        foreach (['Company Registry Filings', 'Environmental Submission Fees', 'Municipal Application Charges', 'Licensing or Permit Filing'] as $item) {
            $lines['S'][] = ['item' => $item, 'recipient' => 'Authority', 'basis' => 'Official schedule required', 'certainty' => 'Authority', 'range' => null];
        }

        $subtotals = [];
        foreach (['T', 'P', 'X'] as $l) {
            $subtotals[$l] = [0, 1, 2];
            foreach ([0, 1, 2] as $k) {
                $subtotals[$l][$k] = array_sum(array_map(fn ($r) => $r['range'][$k] ?? 0, $lines[$l]));
            }
        }

        return ['lines' => $lines, 'subtotals' => $subtotals, 'reuse_factor' => $reuseFactor, 'multiplier' => $mult];
    }

    /** Illustrative tiered contingent fee (marginal tiers) with floor, cap and retainer credit. */
    public static function contingent(int $amount, int $retainerCredit = 150000): array
    {
        $tiers = [[10_000_000, 0.025], [25_000_000, 0.030], [50_000_000, 0.035], [PHP_INT_MAX, 0.040]];
        $fee = 0.0;
        $prev = 0;
        $breakdown = [];
        foreach ($tiers as [$upTo, $rate]) {
            if ($amount <= $prev) {
                break;
            }
            $slice = min($amount, $upTo) - $prev;
            $fee += $slice * $rate;
            $breakdown[] = ['from' => $prev, 'to' => min($amount, $upTo), 'rate' => $rate * 100, 'fee' => (int) round($slice * $rate)];
            $prev = $upTo;
        }
        $gross = (int) round(max(150000, min(2500000, $fee)));
        $net = max(0, $gross - $retainerCredit);

        return [
            'amount' => $amount, 'gross' => $gross, 'credit' => $retainerCredit, 'net' => $net,
            'gross_pct' => $amount > 0 ? round($gross / $amount * 100, 2) : 0,
            'net_pct' => $amount > 0 ? round($net / $amount * 100, 2) : 0,
            'floor_applied' => $fee < 150000, 'cap_applied' => $fee > 2500000, 'breakdown' => $breakdown,
        ];
    }

    public static function ndaClauses(): array
    {
        return [
            ['Parties', 'Defines the disclosing and receiving parties and their roles under this agreement.'],
            ['Confidential Information Covered', 'Outlines the categories of confidential information protected by this agreement.'],
            ['Permitted Use', 'Limits use of confidential information to evaluation and advisory preparation only.'],
            ['Disclosure Restrictions', 'Restricts disclosure to authorised persons on a strict need-to-know basis.'],
            ['Third-Party Access Treatment', 'Sets conditions for external advisers and third-party access where permitted.'],
            ['Term and Survival', 'Defines the term of the agreement and survival of obligations after termination.'],
            ['Return / Destruction of Information', 'Obligates return or secure destruction of confidential information on request or expiry.'],
            ['Governing Commercial Process', 'Confirms applicable law, dispute resolution, and commercial conduct standards.'],
        ];
    }

    public static function methodCard(array $m): array
    {
        $svc = self::services()[$m['service'] ?? 'feasibility-studies'] ?? self::services()['feasibility-studies'];

        return [
            ['Stage Code & Objective', ($m['stage_label'] ?? 'A8 – Feasibility').'. '.$svc['summary']],
            ['Plain-Language Method', 'We analyse documents and data, test key assumptions, assess risks and opportunities, and prepare findings with recommendations.'],
            ['Step Sequence', implode(' → ', array_map(fn ($s, $i) => ($i + 1).' '.$s, $svc['method'], array_keys($svc['method'])))],
            ['Inputs Required from Client', implode(', ', $svc['inputs'])],
            ['Inputs Sourced by TBCA', 'Industry benchmarks, public records, credit reports, market data, regulatory databases, prior project intel'],
            ['Analytical Techniques', 'Ratio analysis, trend analysis, variance analysis, risk scoring, sensitivity analysis, scenario modelling'],
            ['AI-Assisted Components', 'Data extraction, pattern detection, anomaly flags, draft summaries, visualisation, benchmarking, report structuring'],
            ['Human-Led Components', 'Judgement calls, risk interpretation, materiality assessment, recommendations, professional sign-off'],
            ['Lead Adviser', $m['lead'] ?? 'Thabo Mokoena – CA(SA), CFA'],
            ['Senior Reviewer', $m['reviewer'] ?? 'Nandi Khumalo – CA(SA), MBA'],
            ['External Studies Required', implode('; ', array_map(fn ($s) => $s['name'].' ('.$s['status'].')', $svc['studies']))],
            ['Deliverable Specification', implode('; ', $svc['deliverables'])],
            ['Acceptance Criteria', 'All required workstreams complete; evidence standards met; findings clear, accurate and review-signed.'],
            ['Limitations & Exclusions', 'No audit or assurance; excludes tax advisory; relies on client-provided data accuracy and completeness.'],
            ['Assumptions', 'Information provided is complete & accurate; No material changes during this stage; Access remains uninterrupted.'],
            ['Duration (Working Days)', $svc['duration'].' from approval and receipt of all inputs.'],
            ['Fee Position (T/P/X/S/C)', 'See fee position table.'],
            ['Earning Schedule', 'See earning schedule table.'],
            ['Available Stop Points', 'See stop points table.'],
            ['Client Decision Required', 'Approve to proceed; request change; or decline this stage.'],
        ];
    }

    public static function earningSchedule(int $t): array
    {
        return [
            ['M1 – Commencement', 'Method Approval', 20, 'On Approval'],
            ['M2 – Data Complete', 'Data Acceptance', 20, 'After 100% Data'],
            ['M3 – Findings Draft', 'Draft Submission', 30, 'On Submission'],
            ['M4 – Final Report', 'Final Acceptance', 30, 'On Acceptance'],
        ];
    }

    public static function stopNowRules(): array
    {
        return [
            ['SN-01', 'Incomplete Required Data', 'Mandatory fields missing or invalid', 'High', 'System'],
            ['SN-02', 'SANCTION / PEP Match', 'Match on sanctions, watchlist or PEP', 'High', 'Compliance'],
            ['SN-03', 'AML / KYC Failure', 'Identity verification failed', 'High', 'Compliance'],
            ['SN-04', 'Jurisdiction Prohibited', 'Not permitted in client jurisdiction', 'High', 'Compliance'],
            ['SN-05', 'Conflict of Interest', 'Conflicting existing engagement', 'High', 'Commercial'],
            ['SN-06', 'Inadequate Authority', 'User lacks legal signing authority', 'Medium', 'Commercial'],
            ['SN-07', 'Uncleared Payment', 'Payment not cleared / available', 'Medium', 'Finance'],
            ['SN-08', 'Supplier Unavailable', 'Critical supplier not available', 'Medium', 'Operations'],
            ['SN-09', 'Regulatory Approval Needed', 'Approval not obtained or expired', 'Medium', 'Compliance'],
            ['SN-10', 'Data Integrity Failure', 'Data validation or checksum failed', 'Medium', 'System'],
            ['SN-11', 'Service Not Permitted', 'Service not allowed for this client', 'Medium', 'Commercial'],
            ['SN-12', 'Fraud / Risk Flag', 'High fraud or risk engine score', 'High', 'Risk'],
        ];
    }
}
