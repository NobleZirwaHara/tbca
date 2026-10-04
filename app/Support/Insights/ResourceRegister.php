<?php

namespace App\Support\Insights;

/**
 * Seed register for TBCA Resources (copy taken from the Resources mockups).
 * Review dates are expressed as day offsets from "today" so currentness states
 * (current / review due / overdue) stay true whenever the seeder runs.
 *
 * Row: [slug, title, type, collection, category, format, minutes, pages, summary, access, price, list price,
 *       source, risk class, reviewed offset, next review offset, publish state, flags[], downloads, extra[]]
 */
class ResourceRegister
{
    public static function rows(): array
    {
        return [
            ['strategic-planning-starter-guide', 'Strategic Planning Starter Guide', 'guide', 'library', 'strategy-planning', 'PDF', 12, null, 'A practical guide to building a one-page strategic plan that connects your goals, markets, offers and actions.', 'free', null, null, 'TBCA Insights', 'RS-C1', -155, 210, 'published', ['featured', 'editors_pick', 'popular', 'ai'], 1842, ['file_size' => '1.4 MB']],
            ['cash-flow-health-checklist', 'Cash Flow Health Checklist', 'checklist', 'library', 'finance-funding', 'XLSX', 10, null, 'Quick diagnostic checklist to assess cash flow health and risks.', 'free', null, null, 'TBCA Finance', 'RS-C2', -40, 50, 'published', ['featured', 'editors_pick'], 1311, ['file_size' => '284 KB']],
            ['project-charter-template', 'Project Charter Template', 'template', 'library', 'project-management', 'DOCX', 15, null, 'Structured project charter template to align stakeholders and define scope and success.', 'paid', 350, 650, 'PMI Basis', 'RS-C1', -330, 20, 'published', ['featured', 'popular'], 966, ['file_size' => '189 KB']],
            ['market-opportunity-report-framework', 'Market Opportunity Report Framework', 'report', 'library', 'market-intelligence', 'PDF', 18, null, 'Framework for analysing market size, trends and opportunities.', 'paid', 450, null, 'TBCA Research', 'RS-C2', -70, 25, 'published', ['featured', 'editors_pick'], 702, ['file_size' => '2.1 MB']],
            ['business-plan-toolkit', 'Business Plan Toolkit', 'toolkit', 'library', 'strategy-planning', 'ZIP', 25, null, 'A complete toolkit with templates, examples and guidance to build investor-ready business plans.', 'free', null, null, 'TBCA Advisory', 'RS-C1', -140, 225, 'published', ['featured', 'editors_pick', 'popular'], 2204, ['file_size' => '6.8 MB']],
            ['financial-model-guide', 'Financial Model Guide', 'guide', 'library', 'finance-funding', 'PDF', 20, null, 'Build dynamic financial models with three statements, scenarios and dashboards.', 'free', null, null, 'TBCA Finance', 'RS-C2', -20, 70, 'published', [], 845, ['file_size' => '1.9 MB']],
            ['industry-insights-reports', 'Industry Insights Reports', 'report', 'library', 'market-intelligence', 'PDF', null, 36, 'Sector trends and analysis across the 17 canonical TBCA industries.', 'subscription', null, null, 'TBCA Research', 'RS-C2', -75, 15, 'published', [], 488, ['file_size' => '4.2 MB']],
            ['sop-template-pack', 'SOP Template Pack', 'sop-pack', 'library', 'operations-process', 'DOCX', 45, null, 'Standard operating procedure templates for core business functions.', 'free', null, null, 'TBCA Basis', 'RS-C1', -150, 215, 'published', ['popular'], 1587, ['file_size' => '940 KB']],
            ['kpi-dashboard-template', 'KPI Dashboard Template', 'dashboard', 'library', 'operations-process', 'XLSX', 30, null, 'Pre-built KPI dashboard to track performance across key business areas.', 'free', null, null, 'TBCA Basis', 'RS-C1', -145, 220, 'published', ['popular'], 1932, ['file_size' => '532 KB']],
            ['risk-register-template', 'Risk Register Template', 'register', 'library', 'risk-compliance', 'XLSX', 30, null, 'Comprehensive risk register to identify, assess and track project risks.', 'free', null, null, 'ISO 31000', 'RS-C1', -152, 213, 'published', [], 1104, ['file_size' => '214 KB']],
            ['cash-flow-forecast-model', 'Cash Flow Forecast Model', 'calculator', 'library', 'finance-funding', 'XLSX', 60, null, '12-month cash flow forecast model with assumptions and scenarios.', 'paid', 450, 850, 'TBCA Basis', 'RS-C2', -62, 28, 'published', [], 1209, ['file_size' => '312 KB']],
            ['investor-readiness-scorecard', 'Investor Readiness Scorecard', 'scorecard', 'library', 'finance-funding', 'XLSX', 20, null, 'Score your readiness for investment across key criteria.', 'paid', 290, 490, 'TBCA Basis', 'RS-C2', -10, 80, 'published', [], 611, ['file_size' => '198 KB']],
            ['market-sizing-calculator', 'Market Sizing Calculator', 'calculator', 'library', 'market-intelligence', 'XLSX', 50, null, 'Advanced market sizing calculator with demand and TAM/SAM/SOM.', 'paid', 1450, null, 'TBCA Research', 'RS-C2', -25, 65, 'published', ['protected'], 274, ['file_size' => '640 KB']],
            ['hiring-interview-scorecard', 'Hiring Interview Scorecard', 'scorecard', 'library', 'people-leadership', 'XLSX', 20, null, 'Structured interview scorecard to improve hiring quality and consistency.', 'paid', 350, null, 'TBCA Basis', 'RS-C1', -30, 335, 'published', ['protected'], 188, ['file_size' => '156 KB']],
            ['investor-readiness-due-diligence-checklist', 'Investor Readiness Due Diligence Checklist', 'checklist', 'library', 'due-diligence', 'PDF', 18, null, 'A structured, investor-focused checklist to help you prepare for due diligence. Cover key areas investors assess, organise your information, and identify gaps before they become deal blockers.', 'gated', null, null, 'TBCA Insights', 'RS-C3', -5, 25, 'published', ['featured', 'ai'], 734, ['file_size' => '1.1 MB', 'use_time' => '15–20 min']],
            ['sector-snapshot-manufacturing-ssa', 'Sector Snapshot: Manufacturing in Sub-Saharan Africa', 'report', 'library', 'market-intelligence', 'PDF', null, 24, 'Key trends, growth drivers and risks in the manufacturing sector.', 'free', null, null, 'TBCA Research', 'RS-C2', -35, 55, 'published', ['editors_pick'], 522, ['file_size' => '3.4 MB', 'industries' => ['manufacturing-industrial']]],
            ['risk-management-essentials', 'Risk Management Essentials', 'guide', 'library', 'risk-compliance', 'PDF', 16, null, 'Practical guide to identifying, assessing and mitigating business risks.', 'free', null, null, 'TBCA Insights', 'RS-C2', -80, 12, 'published', ['editors_pick'], 659, ['file_size' => '1.2 MB']],
            ['country-brief-south-africa-market-overview', 'Country Brief: South Africa Market Overview', 'report', 'library', 'market-intelligence', 'PDF', null, 20, 'Economic outlook, key sectors and investment considerations.', 'free', null, null, 'TBCA Research', 'RS-C2', -18, 72, 'published', ['editors_pick'], 897, ['file_size' => '2.6 MB']],
            ['due-diligence-checklist', 'Due Diligence Checklist', 'guide', 'library', 'due-diligence', 'PDF', 22, null, 'Comprehensive checklist for pre-investment due diligence.', 'restricted', null, null, 'TBCA Toolkit', 'RS-C3', -12, 18, 'published', ['editors_pick'], 141, ['file_size' => '980 KB']],
            ['africa-investment-intelligence-map-premium', 'Africa Investment Intelligence Map – Premium (PDF)', 'report', 'library', 'market-intelligence', 'PDF', null, 160, 'In-depth African country, sector and project intelligence for serious investors and project sponsors.', 'paid', 882, null, 'TBCA Research', 'RS-C2', -14, 76, 'published', ['featured'], 316, ['file_size' => '18.4 MB', 'highlights' => ['160+ country and sector insights', 'Project pipelines and funding gaps', 'Trade and investment opportunity scores']]],
            ['swot-analysis-template', 'SWOT Analysis Template', 'template', 'library', 'strategy-planning', 'XLSX', 10, null, 'Structured SWOT template with prompts for each quadrant and a priorities summary.', 'free', null, null, 'TBCA Basis', 'RS-C1', -60, 305, 'published', ['popular'], 2410, ['file_size' => '248 KB']],
            ['pitch-deck-template', 'Pitch Deck Template', 'template', 'library', 'finance-funding', 'PPTX', 30, null, 'Investor pitch deck template with guidance for each slide.', 'gated', null, null, 'TBCA Advisory', 'RS-C1', -45, 320, 'published', ['popular'], 2051, ['file_size' => '5.2 MB']],
            ['project-charter-quickstart', 'Project Charter Quickstart', 'template', 'library', 'project-management', 'DOCX', 10, null, 'Lightweight one-page charter for small projects.', 'free', null, null, 'PMI Basis', 'RS-C1', -50, 315, 'published', [], 744, ['file_size' => '189 KB']],
            ['cash-flow-forecast-template', 'Cash Flow Forecast Template', 'template', 'library', 'finance-funding', 'XLSX', 40, null, 'Template with the structure and formulas for a 12-month cash flow forecast.', 'gated', null, null, 'Primary Research', 'RS-C2', -16, 74, 'published', ['popular'], 1288, ['file_size' => '312 KB', 'record_id' => 'RS-2025-TR-00123', 'boundary_note' => 'This template provides the structure and formulas for a 12-month cash flow forecast. Paid engagement includes scenario modelling and advisory.', 'linked_product' => 'Financial Modelling Sprint']],
            ['capital-raising-guide', 'Capital Raising Guide', 'guide', 'library', 'finance-funding', 'PDF', 25, null, 'Step-by-step guide to raise capital from investors and lenders.', 'gated', null, null, 'TBCA Advisory', 'RS-C3', -8, 22, 'published', ['featured'], 1022, ['file_size' => '2.2 MB']],
            ['capital-readiness-guide', 'Capital Readiness Guide', 'guide', 'library', 'finance-funding', 'PDF', 30, null, 'Prepare your business for funding and investment.', 'subscription', null, null, 'TBCA Advisory', 'RS-C2', -28, 62, 'published', [], 1540, ['file_size' => '2.0 MB']],
            ['business-plan-template', 'Business Plan Template', 'template', 'library', 'strategy-planning', 'DOCX', 40, null, 'Comprehensive business plan template.', 'paid', 1950, null, 'TBCA Advisory', 'RS-C1', -30, 335, 'published', ['popular'], 3104, ['file_size' => '410 KB']],
            ['cash-flow-calculator', 'Cash Flow Calculator', 'calculator', 'library', 'finance-funding', 'XLSX', 15, null, 'Interactive cash flow forecasting tool.', 'subscription', null, null, 'TBCA Finance', 'RS-C2', -40, null, 'legal_review', [], 1812, ['file_size' => '276 KB']],
            ['market-entry-report-kenya', 'Market Entry Report: Kenya', 'report', 'library', 'market-intelligence', 'PDF', null, 48, 'In-depth market analysis and entry strategies.', 'paid', 2450, null, 'TBCA Research', 'RS-C2', -70, 20, 'published', [], 987, ['file_size' => '5.6 MB']],
            ['funding-readiness-checklist', 'Funding Readiness Checklist', 'checklist', 'library', 'finance-funding', 'PDF', 10, null, 'Step-by-step funding preparation checklist.', 'paid', 350, null, 'TBCA Toolkit', 'RS-C2', -205, -115, 'archived', [], 402, ['file_size' => '310 KB']],
            ['cash-flow-forecasting-guide', 'Cash Flow Forecasting Guide', 'guide', 'library', 'finance-funding', 'PDF', 14, null, 'Step-by-step guide to build accurate cash flow projections.', 'free', null, null, 'TBCA Finance', 'RS-C2', -15, 75, 'published', [], 812, ['file_size' => '1.0 MB']],
            ['ai-in-business-operations-overview', 'AI in Business Operations – Overview', 'article', 'library', 'operations-process', 'Web', 9, null, 'How AI agents and automation improve operational efficiency.', 'free', null, null, 'TBCA Insights', 'RS-C2', -82, 8, 'published', ['ai'], 455, []],
            ['bbbee-compliance-checklist-2024', 'B-BBEE Compliance Checklist (2024)', 'checklist', 'library', 'risk-compliance', 'XLSX', 12, null, 'Checklist for maintaining B-BBEE compliance.', 'free', null, null, 'TBCA Compliance', 'RS-C3', -110, -20, 'published', [], 391, ['file_size' => '120 KB']],
            ['tax-rates-table-south-africa-2023', 'Tax Rates Table South Africa 2023', 'reference', 'library', 'risk-compliance', 'PDF', 5, null, 'Company and individual tax rates reference.', 'free', null, null, 'TBCA Compliance', 'RS-C2', -690, null, 'published', ['restricted'], 1203, ['file_size' => '90 KB']],
            ['how-to-register-a-company-in-south-africa-2025', 'How to Register a Company in South Africa (2025 Update)', 'guide', 'library', 'risk-compliance', 'PDF', 15, null, 'Comprehensive, up-to-date guide with latest steps, requirements and costs.', 'free', null, null, 'TBCA Compliance', 'RS-C3', -6, 24, 'published', [], 1532, ['file_size' => '1.3 MB']],
            ['7-steps-to-register-a-company-in-south-africa', '7 Steps to Register a Company in South Africa', 'guide', 'library', 'risk-compliance', 'PDF', 10, null, 'Step-by-step company registration guide (retired).', 'free', null, null, 'TBCA Compliance', 'RS-C3', -1000, null, 'retired', [], 4120, ['first_published' => '15 March 2022', 'last_reviewed' => '10 January 2023', 'retired_on' => '2025-03-01', 'retired_reason' => 'Outdated regulatory requirements and process changes', 'audience' => 'Entrepreneurs, Startups, Business Owners', 'topics' => ['Company Registration', 'South Africa'], 'replacement' => 'how-to-register-a-company-in-south-africa-2025']],
            ['business-registration-requirements-south-africa', 'Business Registration Requirements in South Africa', 'guide', 'library', 'risk-compliance', 'PDF', 9, null, 'What you need before, during and after registering a business.', 'free', null, null, 'TBCA Compliance', 'RS-C3', -4, 26, 'published', [], 640, []],
            ['company-compliance-checklist-2025', 'Company Compliance Checklist (2025)', 'checklist', 'library', 'risk-compliance', 'PDF', 12, null, 'Annual statutory and governance obligations for South African companies.', 'free', null, null, 'TBCA Compliance', 'RS-C3', -3, 27, 'published', [], 588, []],
            ['tax-compliance-guide-sa', 'Tax Compliance Guide (SA)', 'guide', 'library', 'risk-compliance', 'PDF', 18, null, 'Overview of SARS registration, filing and payment obligations.', 'free', null, null, 'TBCA Compliance', 'RS-C3', -75, -45, 'published', [], 987, []],
            ['employment-contract-template', 'Employment Contract Template', 'template', 'library', 'people-leadership', 'DOCX', 20, null, 'Employment contract template aligned to the BCEA.', 'paid', 650, null, 'TBCA Compliance', 'RS-C3', -62, -32, 'published', [], 803, []],
            ['vat-registration-guide', 'VAT Registration Guide', 'guide', 'library', 'risk-compliance', 'PDF', 10, null, 'When and how to register for VAT in South Africa.', 'free', null, null, 'TBCA Compliance', 'RS-C3', -58, -28, 'published', [], 722, []],
            ['popia-compliance-checklist', 'POPIA Compliance Checklist', 'checklist', 'library', 'risk-compliance', 'PDF', 12, null, 'Practical POPIA readiness checklist for small organisations.', 'free', null, null, 'TBCA Compliance', 'RS-C3', -48, -18, 'published', [], 1145, []],
            ['shareholder-agreement-template', 'Shareholder Agreement Template', 'template', 'library', 'risk-compliance', 'DOCX', 25, null, 'Shareholder agreement template with drafting notes.', 'paid', 950, null, 'TBCA Compliance', 'RS-C3', -45, -15, 'published', [], 610, []],
            ['starter-guide-problem-framing', 'Starter Guide: Problem Framing', 'guide', 'library', 'strategy-planning', 'PDF', 8, null, 'Understand the issue, key questions and first steps to take.', 'free', null, null, 'TBCA Research', 'RS-C1', -150, 215, 'published', [], 905, []],
            ['investor-due-diligence-guide', 'Investor Due Diligence Guide', 'guide', 'library', 'due-diligence', 'PDF', 20, null, 'A practical guide to the due diligence process and investor expectations.', 'free', null, null, 'TBCA Insights', 'RS-C3', -9, 21, 'published', [], 677, []],
            ['due-diligence-readiness-checklist', 'Due Diligence Readiness Checklist', 'checklist', 'library', 'due-diligence', 'PDF', 15, null, 'Ensure you have the right evidence, documents and controls in place.', 'gated', null, null, 'TBCA Insights', 'RS-C3', -9, 21, 'published', [], 512, []],
            ['marketing-plan-template', 'Marketing Plan Template', 'template', 'library', 'marketing-sales', 'DOCX', 25, null, 'One-page and full marketing plan templates with channel planner.', 'free', null, null, 'TBCA Growth', 'RS-C1', -2, 363, 'internal_review', [], 0, []],
            ['quarterly-budget-planner', 'Quarterly Budget Planner', 'calculator', 'library', 'finance-funding', 'XLSX', 20, null, 'Budget planner categories and descriptions for SMEs.', 'free', null, null, 'TBCA Finance', 'RS-C2', 0, 90, 'draft', ['ai'], 0, []],
            ['leadership-development-pathway', 'Leadership Development Pathway', 'playbook', 'library', 'learning-development', 'PDF', 35, null, 'A 90-day leadership development playbook for new managers.', 'free', null, null, 'TBCA People', 'RS-C1', -20, 345, 'published', [], 377, []],
            ['sales-pipeline-playbook', 'Sales Pipeline Playbook', 'playbook', 'library', 'marketing-sales', 'PDF', 30, null, 'Build, measure and manage a predictable sales pipeline.', 'free', null, null, 'TBCA Growth', 'RS-C1', -33, 332, 'published', [], 494, []],

            // KP Thought Leadership
            ['what-smart-founders-fix-before-they-ask-for-capital', 'What Smart Founders Fix Before They Ask for Capital', 'insight', 'insights', 'strategy-planning', 'Web', 7, null, 'Investors look for patterns, not pitches. This insight outlines the discipline gaps, data blind spots and decision habits that quietly weaken founder readiness—and how to fix them early. A practical checklist to help you close the credibility gap.', 'free', null, null, 'Kruger Phiri', 'RS-C2', -12, 78, 'published', ['featured', 'ai'], 0, ['source_count' => 12]],
            ['the-discipline-of-decision-quality', 'The Discipline of Decision Quality', 'insight', 'insights', 'strategy-planning', 'Web', 6, null, 'Better decisions compound. A framework for slowing down at the right time, testing assumptions and choosing well.', 'free', null, null, 'Kruger Phiri', 'RS-C1', -20, 345, 'published', [], 0, ['source_count' => 11]],
            ['capital-readiness-is-a-system-not-a-deck', 'Capital Readiness Is a System, Not a Deck', 'commentary', 'insights', 'finance-funding', 'Web', 6, null, 'What sophisticated investors assess before the first meeting—and how to prepare the system, not just the slides.', 'free', null, null, 'Kruger Phiri', 'RS-C2', -22, 68, 'published', [], 0, ['source_count' => 14]],
            ['due-diligence-preparation-that-pays-back', 'Due Diligence Preparation That Pays Back', 'guide', 'insights', 'due-diligence', 'Web', 8, null, 'Organise your data, documentation and risk story to accelerate diligence and strengthen trust.', 'free', null, null, 'Kruger Phiri', 'RS-C2', -23, 67, 'published', [], 0, ['source_count' => 10]],
            ['project-feasibility-ask-better-questions-early', 'Project Feasibility: Ask Better Questions Early', 'viewpoint', 'insights', 'project-management', 'Web', 7, null, 'The questions that reveal viability, risks and alternatives before you spend more time and money.', 'free', null, null, 'Kruger Phiri', 'RS-C1', -25, 340, 'published', [], 0, ['source_count' => 9]],
            ['entering-african-markets-lessons-that-stick', 'Entering African Markets: Lessons That Stick', 'insight', 'insights', 'market-intelligence', 'Web', 7, null, 'Common pitfalls and practical lessons from market entry across diverse regulatory and operating contexts.', 'free', null, null, 'Kruger Phiri', 'RS-C2', -80, 10, 'published', [], 0, ['source_count' => 13]],
            ['risk-and-execution-discipline-in-uncertain-times', 'Risk and Execution Discipline in Uncertain Times', 'commentary', 'insights', 'risk-compliance', 'Web', 6, null, 'Build resilient projects and portfolios through scenario thinking, controls and adaptive execution.', 'free', null, null, 'Kruger Phiri', 'RS-C2', -27, 63, 'published', [], 0, ['source_count' => 12]],

            // Case studies
            ['growth-turnaround-manufacturing-sector', 'Growth Turnaround in the Manufacturing Sector', 'case-study', 'case-studies', 'operations-process', 'Web', 6, null, "How a mid-sized manufacturer stabilised cash flow, improved operational efficiency and returned to growth with the support of TBCA's Project Advisory AI Agents.", 'free', null, null, 'TBCA Delivery', 'RS-C1', -30, 335, 'published', ['featured'], 0, ['industries' => ['manufacturing-industrial']]],
            ['diligence-success-in-saas', 'Diligence Success in SaaS', 'case-study', 'case-studies', 'due-diligence', 'Web', 5, null, 'How a SaaS company prepared for investor due diligence and closed its funding round.', 'free', null, null, 'TBCA Delivery', 'RS-C1', -40, 325, 'published', [], 0, ['industries' => ['technology-ict-digital']]],
        ];
    }

    /** Body content for detail pages; specific copy for mockup instances, derived for the rest. */
    public static function body(string $slug, string $title, string $type, string $summary): array
    {
        $specific = [
            'strategic-planning-starter-guide' => [
                'about' => 'This guide helps you convert ideas into a clear one-page plan. It covers the essential questions you must answer before you spend more money, time or energy. Use it to align your team and guide execution.',
                'learn' => ['How to define your strategic direction', 'How to understand your market and customers', 'How to shape your offer and value proposition', 'How to set priorities and measurable actions', 'How to review and adapt your plan'],
            ],
            'investor-readiness-due-diligence-checklist' => [
                'about' => 'This is a controlled, high-value resource. To keep content current and relevant, we ask for a small value exchange. Once completed, you will receive the full checklist, working prompts, and a downloadable resource you can use immediately.',
                'get' => ['Current version of the checklist', 'Downloadable PDF checklist', 'Application notes and working prompts', 'Review and source details', 'Suitable next-step guidance'],
                'preview' => [
                    ['title' => '1. Corporate & Legal Readiness', 'items' => ['Company registration documents', 'Shareholder register and agreements', 'Material contracts list']],
                    ['title' => '2. Financial Readiness', 'items' => ['Three years of financial statements', 'Management accounts (YTD)', 'Forecast and key assumptions']],
                    ['title' => '3. Operational Readiness', 'items' => ['Organisational chart', 'Key processes and controls', 'Customer and supplier concentration']],
                ],
            ],
            'what-smart-founders-fix-before-they-ask-for-capital' => [
                'sections' => [
                    ['heading' => 'Executive Summary', 'text' => 'Investors look for patterns, not pitches. Founders who prepare the underlying system — evidence, decisions and governance — close faster and on better terms.'],
                    ['heading' => 'What You Need to Know', 'text' => 'Most readiness gaps are not in the deck. They sit in unreconciled numbers, undocumented decisions and unclear ownership of risks.'],
                    ['heading' => 'Key Insights', 'text' => 'Close the credibility gap by showing traction with evidence, unit economics that reconcile to the ledger, and a risk register you actually use.'],
                    ['heading' => 'Action Steps', 'text' => 'Reconcile management accounts, build a data room index, document key decisions and run a mock diligence session before the first investor meeting.'],
                ],
                'checklist' => ['Reconciled financials for 24 months', 'Unit economics that tie to the ledger', 'Customer evidence and retention data', 'Cap table and governance documents', 'Risk register with owners'],
            ],
        ];

        if (isset($specific[$slug])) {
            return $specific[$slug];
        }

        $noun = str_replace('-', ' ', $type);

        return [
            'about' => "{$summary} Use this {$noun} to understand the issue, gather the right evidence and decide on the next step with confidence.",
            'learn' => ['What good looks like and why it matters', 'The key questions to answer first', 'Evidence and information to gather', 'Common mistakes and how to avoid them', 'When to seek professional or paid support'],
            'get' => ['Current version of the resource', 'Downloadable file', 'Source and review details', 'Suitable next-step guidance'],
            'who' => ['Founders and business owners', 'SME managers and finance leads', 'Project sponsors and advisers'],
            'how' => ['Read the overview and complete the prompts', 'Apply it to your own business context', 'Use the free diagnostic to confirm next steps'],
            'sections' => [
                ['heading' => 'Executive Summary', 'text' => $summary],
                ['heading' => 'What You Need to Know', 'text' => 'Clarify the problem, collect evidence and test your assumptions before you commit money, time or energy.'],
                ['heading' => 'Action Steps', 'text' => 'Work through the checklist, record gaps, and choose the right free or paid route to complete the work.'],
            ],
        ];
    }

    public static function caseStudies(): array
    {
        return [
            'growth-turnaround-manufacturing-sector' => [
                'industry' => 'Manufacturing', 'companySize' => '51 – 200 employees', 'location' => 'Gauteng, South Africa', 'period' => '6 Months',
                'services' => 'Project Advisory, Cash Flow Optimisation, Operational Efficiency, KPI Framework',
                'quote' => 'TBCA helped us see our business clearly and take the right actions. Our cash flow improved within 90 days and we are now growing with confidence.',
                'quoteBy' => 'Operations Director, Manufacturing Company',
                'challenge' => 'The company was experiencing declining margins, inconsistent cash flow and delivery delays. Leadership needed a clear plan to stabilise operations and return to growth.',
                'solution' => 'TBCA deployed AI Agents and Specialists to assess the business, identify priority actions and implement a turnaround plan.',
                'results' => [['value' => '+28%', 'label' => 'Increase in Gross Profit'], ['value' => '+35%', 'label' => 'Improvement in Cash Flow'], ['value' => '-22%', 'label' => 'Reduction in Operational Costs'], ['value' => '+18%', 'label' => 'On-Time Delivery Performance']],
                'helped' => ['Diagnosed root causes using AI-driven business analysis', 'Implemented cash flow optimisation and working capital controls', 'Streamlined key operational processes', 'Developed KPI dashboard and performance review cadence', 'Coached leadership team for execution and accountability'],
                'outcome' => 'Strong financial recovery and operational excellence',
                'testimonial' => "TBCA's structured approach and practical tools transformed our business. The results speak for themselves.",
            ],
            'diligence-success-in-saas' => [
                'industry' => 'Technology, ICT & Digital', 'companySize' => '11 – 50 employees', 'location' => 'Cape Town, South Africa', 'period' => '10 Weeks',
                'services' => 'Due Diligence Readiness, Financial Model, Data Room Setup',
                'quote' => 'We walked into diligence with every answer documented. The round closed three weeks ahead of plan.',
                'quoteBy' => 'Co-founder & CEO, SaaS Company',
                'challenge' => 'A growing SaaS business had term-sheet interest but scattered data, unreconciled metrics and no data room.',
                'solution' => 'TBCA ran a readiness diagnostic, rebuilt the financial model and structured a governed data room.',
                'results' => [['value' => '-3 wks', 'label' => 'Faster Close'], ['value' => '100%', 'label' => 'Data Room Completeness'], ['value' => '0', 'label' => 'Material Findings'], ['value' => '+12%', 'label' => 'Valuation vs First Offer']],
                'helped' => ['Reconciled SaaS metrics to the ledger', 'Built an investor-grade financial model', 'Structured a governed data room index', 'Ran a mock diligence session with specialists'],
                'outcome' => 'Funding round closed ahead of plan with no material findings',
                'testimonial' => 'The preparation paid for itself many times over.',
            ],
        ];
    }

    public static function webinars(): array
    {
        // [slug, title, tagline, summary, speaker, role, topic, day offset, hour, minutes, cpd, icon]
        return [
            ['scoping-projects-that-win', 'Scoping Projects That Win', 'A practical framework for clear, profitable scopes.', 'Practical steps to define, scope and price projects with confidence.', 'Kruger Phiri', 'Founder & Strategic Advisor', 'Project Advisory', 18, 11, 60, true, 'chart'],
            ['cash-flow-that-works', 'Cash Flow That Works', 'Strengthen liquidity and improve cash conversion.', 'Proven strategies to manage cash flow and fund growth.', 'Thandi Maseko', 'Finance Specialist', 'Finance', 32, 11, 60, true, 'coins'],
            ['ai-automation-africas-advantage', "AI, Automation & Africa's Advantage", 'Where automation creates leverage for African businesses.', 'How AI agents and automation can leapfrog operations and service delivery.', 'Kruger Phiri', 'Founder & Strategic Advisor', 'Technology', 45, 14, 60, false, 'cpu'],
            ['strategic-planning-in-uncertain-times', 'Strategic Planning in Uncertain Times', 'Build resilient plans and adapt with confidence.', 'How to create flexible strategies in a rapidly changing environment.', 'Kruger Phiri', 'Founder & Strategic Advisor', 'Strategy', -40, 11, 48, true, 'route'],
            ['compliance-made-simple', 'Compliance Made Simple', 'Understand obligations and reduce risk.', 'Key compliance essentials every business owner should know.', 'Lerato Dlamini', 'Compliance Lead', 'Legal & Compliance', -55, 11, 38, true, 'shield'],
            ['raising-capital-for-high-impact-projects', 'Raising Capital for High-Impact Projects', 'From concept note to funded project.', 'Structuring and presenting projects funders can say yes to.', 'Mpho Dlamini', 'Capital Advisor', 'Finance', -70, 11, 49, true, 'coins'],
            ['building-high-performance-teams', 'Building High-Performance Teams for Growth', 'Hire, align and lead for scale.', 'Practical leadership habits that lift team performance.', 'Kruger Phiri', 'Founder & Strategic Advisor', 'People & Leadership', -90, 11, 45, false, 'users'],
            ['marketing-that-converts', 'Marketing That Converts', 'Turn attention into qualified pipeline.', 'Positioning, channels and measurement for SMEs with limited budgets.', 'Sipho Ndlovu', 'Growth Strategist', 'Marketing & Sales', -105, 11, 52, false, 'megaphone'],
            ['operations-excellence-for-smes', 'Operations Excellence for SMEs', 'Fewer fires, better margins.', 'Process mapping, KPIs and simple controls that scale.', 'Thandiwe Maseko', 'Operations Advisor', 'Operations', -120, 11, 41, false, 'settings'],
            ['preparing-for-investor-due-diligence', 'Preparing for Investor Due Diligence', 'Know what investors look for.', 'Expert insights on what investors look for and how to prepare.', 'Mpho Dlamini', 'Capital Advisor', 'Strategy', -20, 11, 55, true, 'search'],
        ];
    }

    public static function faqs(): array
    {
        return [
            ['How do I prepare for investor due diligence?', 'Prepare for investor due diligence by organising clear evidence, validating key assumptions, and demonstrating execution readiness. Focus on the areas investors assess most.', 'Due Diligence', true,
                ['Clarify the issue: Investors need confidence in traction, unit economics, risks, and governance.', 'Gather evidence: Financials, KPIs, customer proof, legal and compliance, IP, and key contracts.', 'Validate assumptions: Stress-test forecasts and market claims with independent evidence.', 'Show readiness: Document processes, controls, and leadership capacity to scale.', 'Seek tailored help: Engage specialists for gaps that require context-specific execution.'],
                ['investor-due-diligence-guide', 'due-diligence-readiness-checklist', 'webinar:preparing-for-investor-due-diligence', 'diligence-success-in-saas']],
            ['How do I assess project readiness?', 'Assess clarity of objectives, scope, stakeholders, risks, resources and benefits. Use a readiness framework and validate assumptions before committing.', 'Project Management', false, null, ['project-charter-template']],
            ['How can I improve cash flow in my business?', 'Shorten the cash conversion cycle: invoice promptly, tighten debtor terms, manage stock levels and negotiate supplier terms. Forecast 13 weeks ahead and review weekly.', 'Finance & Funding', false, null, ['cash-flow-health-checklist', 'cash-flow-forecasting-guide']],
            ['What should I consider when entering a new market?', 'Validate demand, understand regulation and licensing, test routes to market and partners, and model unit economics in the local currency before scaling.', 'Market Intelligence', false, null, ['market-opportunity-report-framework']],
            ['What is a practical strategy for sustainable growth?', 'Focus on a small number of priorities, fund growth from improving margins and cash, and measure progress with a few leading indicators reviewed monthly.', 'Strategy & Planning', false, null, ['strategic-planning-starter-guide']],
            ['How do I stay compliant with regulations?', 'Maintain a compliance calendar, assign owners to each obligation, keep evidence of filings and review changes in law at least quarterly. Seek professional advice for regulated activities.', 'Risk & Compliance', false, null, ['company-compliance-checklist-2025']],
        ];
    }
}
