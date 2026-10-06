<?php

/*
 * Marketplace service content: Inputs Required, Process and the Basic / Standard / Premium
 * package ladder for every published Marketplace service (MarketplaceSeeder).
 *
 * days:  delivery in business days per package (null = monthly recurring)
 * tiers: [scope sentence, features ADDED at that tier] — features are cumulative upwards.
 */

return [
    'financial-model-review' => [
        'inputs' => ['Financial model file (XLSX) with all linked workbooks', 'Key assumptions register and source data', 'Intended use of the model (lender, investor, board)', 'Latest management accounts or actuals (12–24 months)', 'Named contact for clarification questions'],
        'process' => ['Submit model & context', 'TBCA scoping & specialist assignment', 'Structure, formula & logic audit', 'Assumption and scenario stress testing', 'QA pass & release of findings', 'Walk-through call and correction cycle'],
        'days' => [4, 7, 10],
        'tiers' => [
            'basic' => ['Formula and logic audit of one model (up to 10 sheets).', ['Formula & logic audit', 'Issue log with severity', 'Summary findings note (PDF)']],
            'standard' => ['Full bankability review with assumption and scenario testing.', ['Assumption stress test', 'Scenario validation (3 cases)', 'Executive summary report', 'QA certificate', 'Walk-through call (60 min)']],
            'premium' => ['Bankability review plus model rebuild of failing modules and lender pack.', ['Rebuild of flagged modules', 'Lender / investor Q&A pack', 'Senior specialist sign-off', '30-day follow-up support']],
        ],
    ],
    'monthly-financial-reporting-review' => [
        'inputs' => ['Read-only access to accounting system (Xero, Sage, QuickBooks)', 'Monthly bank statements', 'Payroll summary and debtors / creditors ageing', 'Budget or forecast for variance analysis', 'Finance contact for month-end queries'],
        'process' => ['Onboarding & chart-of-accounts mapping', 'Monthly data collection by working day 3', 'Preparation of management accounts', 'Expert review & variance commentary', 'Monthly report release', 'Quarterly review meeting'],
        'days' => [null, null, null],
        'tiers' => [
            'basic' => ['Monthly management accounts for one entity, up to 5 transactions reviewed.', ['Monthly management accounts', 'Cash flow monitoring', 'Secure document archive']],
            'standard' => ['Accounts plus KPI dashboard and variance analysis, up to 10 transactions.', ['KPI dashboard & insights', 'Variance & trend analysis', 'Quarterly review meeting']],
            'premium' => ['Multi-entity reporting with rolling forecast and board pack.', ['Rolling 12-month forecast', 'Board pack preparation', 'Monthly review call', 'Up to 3 entities']],
        ],
    ],
    'cash-flow-projection' => [
        'inputs' => ['Actuals for the last 12–24 months', 'Growth plan, pipeline or sales targets', 'Debt, lease and capex schedules', 'Payment terms for customers and suppliers', 'Intended lender or investor (if known)'],
        'process' => ['Data request & kick-off', 'Baseline from actuals', 'Driver-based 24-month projection', 'Scenario toggles & sensitivity', 'QA review & narrative', 'Handover call'],
        'days' => [5, 8, 12],
        'tiers' => [
            'basic' => ['12-month projection from your actuals with one scenario.', ['Driver-based monthly projection', 'Opening balance reconciliation', 'Projection workbook (XLSX)']],
            'standard' => ['Lender-ready 24-month projection with scenarios and narrative.', ['24-month horizon', 'Three scenario toggles', 'Narrative commentary', 'QA certificate']],
            'premium' => ['36-month integrated projection (P&L, balance sheet, cash) with funding plan.', ['Integrated three-statement model', 'Funding requirement & covenant tests', 'Lender presentation slides', '30-day follow-up support']],
        ],
    ],
    'business-valuation-review' => [
        'inputs' => ['Three years of audited or reviewed financial statements', 'Current-year management accounts and budget', 'Business plan or forecast (3–5 years)', 'Shareholding structure and purpose of valuation', 'Material contracts and customer concentration data'],
        'process' => ['Scoping & purpose of value', 'Normalisation of earnings', 'DCF and market-multiple analysis', 'Sensitivity & valuation range', 'QA review', 'Valuation memo and debrief'],
        'days' => [6, 10, 15],
        'tiers' => [
            'basic' => ['Indicative valuation range using one method.', ['Normalised earnings analysis', 'Single-method valuation range', 'Valuation summary note']],
            'standard' => ['DCF and market-multiple valuation with sensitivity and memo.', ['DCF valuation', 'Market-multiple cross-check', 'Sensitivity analysis', 'Valuation memo (negotiation-ready)']],
            'premium' => ['Full valuation with peer set, scenario values and negotiation support.', ['Peer benchmarking set', 'Scenario-weighted value', 'Negotiation support session', 'Senior specialist sign-off']],
        ],
    ],
    'commercial-due-diligence' => [
        'inputs' => ['Target company information memorandum', 'Customer list and revenue by customer (anonymised if needed)', 'Market and competitor information held', 'Investment thesis and key questions', 'Access to target management for interviews'],
        'process' => ['Thesis & key questions workshop', 'Market sizing and trend analysis', 'Customer and competitor interviews', 'Revenue quality and pipeline review', 'Red-flag synthesis & QA', 'Findings presentation'],
        'days' => [8, 15, 22],
        'tiers' => [
            'basic' => ['Desktop red-flag review of the target market and position.', ['Desktop market scan', 'Competitor landscape', 'Red-flag memo']],
            'standard' => ['Full commercial due diligence with interviews and revenue quality.', ['Customer interviews (up to 8)', 'Revenue quality analysis', 'Market sizing model', 'Due diligence report']],
            'premium' => ['Investment-committee grade CDD with value-creation plan.', ['Customer interviews (up to 20)', 'Value-creation plan', 'Investment committee presentation', '30-day follow-up support']],
        ],
    ],
    'market-entry-study' => [
        'inputs' => ['Target country and product / service definition', 'Current pricing and unit economics', 'Entry objectives, budget and timeline', 'Existing partners or distributors (if any)', 'Regulatory licences already held'],
        'process' => ['Entry objectives workshop', 'Market sizing & segmentation', 'Regulatory and licensing scan', 'Competitor and channel mapping', 'Go-to-market recommendations & QA', 'Presentation and Q&A'],
        'days' => [7, 12, 18],
        'tiers' => [
            'basic' => ['Market snapshot for one country: size, demand drivers and key rules.', ['Market size & growth estimate', 'Regulatory scan', 'Country snapshot report']],
            'standard' => ['Full entry study with competitor landscape and go-to-market plan.', ['Competitor landscape', 'Channel & partner mapping', 'Go-to-market recommendations', 'Entry risk register']],
            'premium' => ['Entry study plus partner shortlist and 12-month entry roadmap.', ['Partner / distributor shortlist', 'Expert interviews (up to 6)', '12-month entry roadmap', 'Senior specialist lead']],
        ],
    ],
    'competitor-intelligence-brief' => [
        'inputs' => ['List of known competitors (or let us identify them)', 'Your product / service positioning', 'Markets and segments in scope', 'Specific questions you need answered'],
        'process' => ['Scope & competitor set confirmation', 'Desk research and data gathering', 'Positioning and pricing benchmarks', 'Capability comparison', 'QA & brief release'],
        'days' => [4, 7, 10],
        'tiers' => [
            'basic' => ['Profiles of up to four competitors.', ['Competitor profiles (up to 4)', 'Positioning summary', 'Brief (PDF)']],
            'standard' => ['Profiles of up to eight competitors with pricing and capability benchmarks.', ['Competitor profiles (up to 8)', 'Pricing benchmark', 'Capability matrix']],
            'premium' => ['Twelve-competitor intelligence pack with win / loss implications.', ['Competitor profiles (up to 12)', 'Win / loss implications', 'Quarterly refresh (1x)', 'Strategy workshop (90 min)']],
        ],
    ],
    'project-pmo-setup' => [
        'inputs' => ['Project charter or business case', 'Current project plan, budget and milestones', 'Organogram and key stakeholders', 'Existing reporting templates or tools (MS Project, Jira, Excel)', 'Governance requirements from board, funder or client'],
        'process' => ['PMO diagnostic & stakeholder interviews', 'Governance structure and decision rights', 'Integrated plan, RAID log and baseline', 'Reporting cadence and dashboard build', 'QA review & handover', 'Team training session'],
        'days' => [5, 10, 15],
        'tiers' => [
            'basic' => ['Lightweight PMO for one project: governance, plan and RAID log.', ['Governance structure & decision rights', 'Integrated project plan', 'RAID log (risks, actions, issues, decisions)']],
            'standard' => ['Full PMO setup with reporting cadence and dashboard.', ['Reporting cadence & templates', 'Project dashboard (Excel / Power BI)', 'Steering committee pack template', 'PMO handover & training session']],
            'premium' => ['Portfolio PMO for up to five projects with 30-day embedded support.', ['Portfolio view (up to 5 projects)', 'Benefits & stage-gate framework', 'PMO lead embedded for 30 days', 'Board-ready reporting pack']],
        ],
    ],
    'monthly-project-reporting' => [
        'inputs' => ['Project plan, budget and baseline', 'Monthly progress data from contractors', 'Risk register and change log', 'Access to site or project team for updates'],
        'process' => ['Onboarding & baseline capture', 'Monthly progress data collection', 'Earned-value and risk review', 'Board-ready report preparation', 'QA review & release', 'Monthly review call'],
        'days' => [null, null, null],
        'tiers' => [
            'basic' => ['Monthly progress report for one project.', ['Monthly progress report', 'Milestone tracking', 'Risk register update']],
            'standard' => ['Progress, cost and risk reporting with board-ready pack.', ['Cost & earned-value tracking', 'Board-ready monthly pack', 'Monthly review call']],
            'premium' => ['Portfolio monitoring with site verification and funder reporting.', ['Up to 3 projects', 'Quarterly site verification visit', 'Funder / lender reporting format', 'Dedicated project analyst']],
        ],
    ],
    'popia-compliance-review' => [
        'inputs' => ['List of systems and databases holding personal information', 'Current privacy policy and PAIA manual', 'Information Officer details', 'Contracts with operators / processors', 'Any previous incidents or complaints'],
        'process' => ['Scoping & data inventory', 'Gap assessment against POPIA conditions', 'Risk rating of gaps', 'Remediation plan & policy templates', 'QA review & release', 'Debrief with Information Officer'],
        'days' => [4, 7, 12],
        'tiers' => [
            'basic' => ['High-level gap checklist against the eight POPIA conditions.', ['POPIA gap checklist', 'Risk-rated gap summary', 'Priority action list']],
            'standard' => ['Full gap assessment with remediation plan and policy templates.', ['Personal information inventory', 'Remediation plan', 'Policy & notice templates', 'Information Officer debrief']],
            'premium' => ['Gap assessment plus implementation support and staff training.', ['Operator contract review (up to 10)', 'Staff awareness training session', 'Implementation support (30 days)', 'Senior specialist lead']],
        ],
    ],
    'risk-register-build' => [
        'inputs' => ['Strategy or business plan', 'Existing risk register or incident log', 'Organogram and risk owners', 'Board or audit committee risk appetite (if defined)'],
        'process' => ['Risk context & appetite workshop', 'Facilitated risk identification', 'Scoring and heat map', 'Controls and owners mapping', 'QA review', 'Register handover & training'],
        'days' => [5, 8, 12],
        'tiers' => [
            'basic' => ['Risk register for one business unit from a single workshop.', ['Facilitated risk workshop', 'Scored risk register', 'Risk heat map']],
            'standard' => ['Enterprise register with owners, controls and treatment plans.', ['Controls & owners mapping', 'Treatment action plans', 'Risk reporting template']],
            'premium' => ['Enterprise risk framework with appetite statement and board reporting.', ['Risk appetite statement', 'Board risk reporting pack', 'Quarterly refresh (1x)', 'Senior specialist lead']],
        ],
    ],
    'grid-connection-study' => [
        'inputs' => ['Site location (coordinates or KML) and land status', 'Planned technology and capacity (MW)', 'Nearest substation or line information (if known)', 'Project timeline and procurement route', 'Any prior grid correspondence'],
        'process' => ['Site & capacity confirmation', 'Network and substation screening', 'Capacity and constraint analysis', 'Connection options & indicative costs', 'QA review', 'Findings presentation & next steps'],
        'days' => [8, 15, 22],
        'tiers' => [
            'basic' => ['Desktop capacity screening for one site.', ['Substation proximity screening', 'Capacity screening note', 'Next-steps checklist']],
            'standard' => ['Pre-feasibility with connection options and indicative costs.', ['Connection options analysis', 'Indicative connection cost range', 'Pre-feasibility report']],
            'premium' => ['Multi-site pre-feasibility with utility engagement plan.', ['Up to 3 sites compared', 'Utility engagement plan', 'Risk & timeline assessment', '30-day follow-up support']],
        ],
    ],
    'process-automation-sprint' => [
        'inputs' => ['Two processes to assess (names and owners)', 'Process documents, SOPs or screen recordings', 'Systems and tools in use', 'Volumes, cycle times and staff effort (estimates are fine)', 'Access to process owners for interviews'],
        'process' => ['Process selection & kick-off', 'As-is process mapping', 'Automation potential scoring', 'Business case & tooling options', 'QA review', 'Roadmap presentation'],
        'days' => [5, 8, 12],
        'tiers' => [
            'basic' => ['As-is map and automation score for one process.', ['As-is process map', 'Automation potential score', 'Quick-win list']],
            'standard' => ['Two processes mapped with business case and prioritised roadmap.', ['Second process mapped', 'Automation business case', 'Prioritised automation roadmap']],
            'premium' => ['Up to four processes with to-be design and a working prototype.', ['Up to 4 processes', 'To-be process design', 'Working automation prototype', 'Senior specialist lead']],
        ],
    ],
    'legal-contract-pack' => [
        'inputs' => ['Business description and contracting scenarios', 'Existing contracts or templates (if any)', 'Preferred governing law and dispute forum', 'Key commercial terms (payment, liability caps)'],
        'process' => ['Requirements call', 'Template selection & customisation', 'Plain-language drafting notes', 'QA review', 'Delivery & walkthrough'],
        'days' => [3, 5, 8],
        'tiers' => [
            'basic' => ['Two customised templates (e.g. NDA and services agreement).', ['2 customised templates', 'Drafting notes', 'Editable Word files']],
            'standard' => ['Supply, services and NDA template pack with usage guide.', ['4 customised templates', 'Template usage guide', 'Walkthrough call']],
            'premium' => ['Full SME contract pack with clause library.', ['8 customised templates', 'Clause library', 'Annual update (1x)', 'Dedicated contact']],
        ],
    ],
];
