<?php

namespace App\Support\Products\Digital;

/**
 * Content register for the Digital Products catalogue: product master data
 * taken from the mockups, plus the shared copy blocks (QA checklist, D-tests,
 * trust strips) used by both the seed and the pages.
 */
class Catalogue
{
    public const QA_CHECKS = [
        ['Product Identity & Description', 'Product name, short description, outcomes and classification are accurate and complete.', 'QA Reviewer'],
        ['Defensibility (D1–D5)', 'All five defensibility tests are satisfied with ACTIVE status.', 'Defensibility Lead'],
        ['Claims & Evidence', 'All claims supported with acceptable evidence and no orphan claims.', 'Claims Officer'],
        ['Professional Boundary', 'Content classification and professional boundary assessed.', 'Legal Reviewer'],
        ['DSS Classification', 'DSS banding applied and documented with rationale.', 'DSS Analyst'],
        ['Licence & Rights', 'Permitted licence classes L1–L5 mapped to the rights chain.', 'IP Legal Reviewer'],
        ['IP Chain & Authorisation', 'Authorship, rights instrument and third-party clearance evidenced.', 'IP Legal Reviewer'],
        ['Version Covenant', 'Semantic version, as-at date, maintenance and update classes set.', 'QA Reviewer'],
        ['Content Completeness', 'Every promised section and usage guide is present in the artefact.', 'Content Owner'],
        ['Language Quality (EN)', 'English copy reviewed for accuracy and plain language.', 'Content Owner'],
        ['Afrikaans (If Offered)', 'Afrikaans artefact passed human bilingual review, or is not offered.', 'Bilingual Reviewer'],
        ['Format & Accessibility', 'Formats open correctly; accessibility and file integrity checked.', 'QA Reviewer'],
        ['Delivery & Instant Access', 'Instant entitlement and download path tested end to end.', 'Platform Owner'],
        ['Refund & Download Disclosure', 'Approved refund / download disclosure version attached.', 'Consumer-Law Reviewer'],
        ['Legal & POPIA Compliance', 'Holder data, notices and privacy controls approved.', 'Information Officer'],
        ['Pricing & Currency', 'Every tier above TCS with GP ≥ 45%; ZAR source price set.', 'Finance Owner'],
        ['Final Functional & QA Sign-off', 'Formulas, links and functional behaviour tested; release sign-off.', 'QA Lead'],
    ];

    public const D_TESTS = [
        'D1' => ['Current for Intended Use', 'Up-to-date and valid for South African use.'],
        'D2' => ['Solved DIY Problem', "Solves a real problem that DIY or free resources don't solve well."],
        'D3' => ['Not Basic or Generic', 'Not basic, generic or commoditised information.'],
        'D4' => ['Expertise / IP Added', 'Reflects expert judgement, original structure or IP.'],
        'D5' => ['Verified Content Claims', 'All material claims verified with evidence.'],
    ];

    public const FORMAT_NOTES = [
        'DOCX' => 'Editable in Microsoft Word',
        'XLSX' => 'Editable in Microsoft Excel',
        'PDF' => 'Read-only (recommended for sharing)',
        'PPTX' => 'Editable in Microsoft PowerPoint',
    ];

    /**
     * Product master rows. prices are ex-VAT ZAR per licence class (null = not permitted).
     *
     * @return list<array<string, mixed>>
     */
    public static function products(): array
    {
        return [
            [
                'code' => 'DP-PLN-000123', 'sku' => 'DP-TPL-BUS-PLAN', 'slug' => 'business-plan-template', 'name' => 'Business Plan Template',
                'type' => 'template', 'category' => 'Business & Management',
                'tagline' => 'Structured plan with market, operations, financials and implementation roadmap.',
                'description' => 'A comprehensive business plan framework designed for SMEs, startups, and project owners, including market analysis, operations, financial projections, risk assessment and a clear implementation roadmap.',
                'audience' => 'Entrepreneurs, SMEs, Startups, Consultants, Project Owners', 'audiences' => ['entrepreneurs', 'smes', 'startups', 'consultants'],
                'best_for' => 'Raising finance, strategic planning, investor proposals, bank applications',
                'industries' => ['cross-industry'], 'business_function' => 'Strategy & Planning',
                'formats' => ['DOCX', 'XLSX', 'PDF', 'PPTX'], 'primary_format' => 'DOCX', 'af' => 'review',
                'prices' => ['L1' => 1950, 'L2' => 2450, 'L3' => 3750, 'L4' => 4950, 'L5' => null],
                'dss' => 82, 'dss_band' => 'DSS 3 – Moderate', 'disposition' => 'DP-PK', 'defensibility_level' => 'D3 – Strong',
                'subscription_suitable' => true, 'subscription_status' => 'Enabled', 'recurring_evidence' => 'Quarterly updates + legal refresh',
                'downloads_count' => 1842, 'popularity' => 98, 'tone' => 'gold',
                'versions' => [
                    ['1.0.0', 'archived', 'major', '2026-03-02', 'Archived first release.'],
                    ['1.1.0', 'historical', 'minor', '2026-05-03', 'Initial release with core template structure and guidance.'],
                    ['1.2.0', 'superseded', 'minor', '2026-06-15', 'Improved implementation roadmap, new case study examples and updated regulatory references.'],
                    ['1.3.0', 'current', 'minor', '2026-08-10', 'Updated for South African Companies Act amendments (2024), enhanced financial projections guidance and expanded implementation roadmap.'],
                    ['1.4.0', 'qa', 'minor', null, 'Additional examples, template refinements and minor clarifications.'],
                ],
                'receive' => ['Executive Summary structure', 'Market Analysis framework', 'Operations Plan sections', 'Financial Plan with assumptions', 'Cash Flow & Profit Projections', 'Risk Assessment template', 'Implementation Roadmap', 'Appendices with guidance', 'Fully editable DOCX file', 'Usage guide (PDF)'],
                'badges' => ['Investor Ready', 'Bankability Focused', 'Customisable', 'Professional Standard'],
            ],
            [
                'code' => 'DP-RPT-000101', 'sku' => 'DP-RPT-ZA-2026', 'slug' => 'south-africa-investment-opportunities-report-2026', 'name' => 'South Africa Investment Opportunities Report 2026',
                'type' => 'report', 'category' => 'Research & Reports',
                'tagline' => 'Comprehensive analysis of priority sectors, projects, risks and opportunities across South Africa.',
                'audience' => 'Investors, DFIs, Corporate Strategy Teams', 'audiences' => ['investors', 'corporates'], 'industries' => ['energy', 'agriculture', 'infrastructure'], 'business_function' => 'Investment',
                'formats' => ['PDF'], 'primary_format' => 'PDF', 'af' => 'approved',
                'prices' => ['L1' => 4950, 'L2' => 6450, 'L3' => 9450, 'L4' => 12450, 'L5' => null],
                'dss' => 78, 'dss_band' => 'DSS 2 – High', 'disposition' => 'DP-PE', 'defensibility_level' => 'D4 – Strong', 'downloads_count' => 612, 'popularity' => 90, 'tone' => 'blue',
                'versions' => [['1.0.0', 'superseded', 'major', '2026-06-01', 'First 2026 edition.'], ['1.3.0', 'current', 'minor', '2026-08-01', 'Q2 data refresh, new energy projects pipeline and updated risk indicators.']],
                'receive' => ['Sector opportunity scorecards', 'Priority project pipeline', 'Risk and mitigation matrix', 'Provincial investment profiles', 'Policy and incentive summary', 'Data appendix'],
            ],
            [
                'code' => 'DP-FIN-000215', 'sku' => 'DP-TPL-FIN-3S', 'slug' => 'financial-model-template-3-statements', 'name' => 'Financial Model Template (3-Statements)',
                'type' => 'template', 'category' => 'Finance & Accounting',
                'tagline' => 'Investor-ready Excel model with integrated assumptions, scenarios and valuation outputs.',
                'audience' => 'Finance Professionals, Analysts', 'audiences' => ['finance', 'smes'], 'industries' => ['cross-industry'], 'business_function' => 'Finance',
                'formats' => ['XLSX', 'PDF'], 'primary_format' => 'XLSX', 'af' => 'review',
                'prices' => ['L1' => null, 'L2' => 2450, 'L3' => 3950, 'L4' => null, 'L5' => null],
                'dss' => 88, 'dss_band' => 'DSS 2 – High', 'disposition' => 'DP-PK', 'defensibility_level' => 'D4 – Strong', 'downloads_count' => 1253, 'popularity' => 95, 'tone' => 'green',
                'versions' => [['2.0.0', 'superseded', 'major', '2026-04-15', 'Rebuilt three-statement engine.'], ['2.1.0', 'current', 'minor', '2026-08-10', 'Scenario manager, DCF valuation tab and covenant tests.']],
                'receive' => ['Integrated income statement, balance sheet and cash flow', 'Assumptions dashboard', 'Scenario manager', 'DCF valuation outputs', 'Covenant and ratio tests', 'Model user guide (PDF)'],
            ],
            [
                'code' => 'DP-DSH-000301', 'sku' => 'DP-DASH-FEAS', 'slug' => 'project-feasibility-dashboard', 'name' => 'Project Feasibility Dashboard',
                'type' => 'dashboard', 'category' => 'Project Advisory',
                'tagline' => 'Dynamic dashboard to analyse KPIs, financials, timelines and risk indicators.',
                'audience' => 'Project Owners, Developers, Consultants', 'audiences' => ['consultants', 'corporates'], 'industries' => ['infrastructure', 'energy'], 'business_function' => 'Projects',
                'formats' => ['XLSX'], 'primary_format' => 'XLSX', 'af' => 'unavailable',
                'prices' => ['L1' => 3750, 'L2' => 4650, 'L3' => 6950, 'L4' => 8950, 'L5' => null],
                'dss' => 74, 'dss_band' => 'DSS 2 – High', 'disposition' => 'DP-PS', 'defensibility_level' => 'D2 – Moderate', 'downloads_count' => 498, 'popularity' => 80, 'tone' => 'teal',
                'versions' => [['1.1.0', 'historical', 'minor', '2026-05-20', 'Timeline view added.'], ['1.2.0', 'superseded', 'minor', '2026-07-30', 'Risk heatmap and sensitivity charts.'], ['1.3.0', 'current', 'minor', '2026-09-20', 'IRR / NPV sensitivity, funder covenant panel and improved risk scoring.']],
                'receive' => ['KPI overview dashboard', 'Financial feasibility tabs', 'Timeline and milestone tracker', 'Risk indicator heatmap', 'Sensitivity analysis', 'Setup guide (PDF)'],
            ],
            [
                'code' => 'DP-TLK-000402', 'sku' => 'DP-TLK-ESG', 'slug' => 'esg-due-diligence-toolkit', 'name' => 'ESG Due Diligence Toolkit',
                'type' => 'toolkit', 'category' => 'Compliance & ESG',
                'tagline' => 'Policies, checklists and assessment frameworks aligned to local and global standards.',
                'audience' => 'ESG Officers, Investors, Compliance Teams', 'audiences' => ['investors', 'corporates'], 'industries' => ['cross-industry'], 'business_function' => 'Compliance',
                'formats' => ['PDF', 'DOCX'], 'primary_format' => 'PDF', 'af' => 'approved',
                'prices' => ['L1' => 2950, 'L2' => 3650, 'L3' => 5450, 'L4' => 7350, 'L5' => null],
                'dss' => 80, 'dss_band' => 'DSS 2 – High', 'disposition' => 'DP-PK', 'defensibility_level' => 'D3 – Strong', 'downloads_count' => 401, 'popularity' => 76, 'tone' => 'green',
                'versions' => [['1.0.0', 'superseded', 'major', '2026-05-01', 'First release.'], ['1.1.0', 'current', 'minor', '2026-08-01', 'IFC Performance Standards mapping and updated JSE sustainability references.']],
                'receive' => ['ESG policy templates', 'Due diligence checklist', 'Materiality assessment framework', 'Scoring matrix', 'Reporting template'],
            ],
            [
                'code' => 'DP-CHK-000188', 'sku' => 'DP-CHK-AML-KYC', 'slug' => 'aml-kyc-compliance-checklist', 'name' => 'AML & KYC Compliance Checklist',
                'type' => 'checklist', 'category' => 'Compliance & ESG',
                'tagline' => 'Practical checklist to ensure compliance with FICA and international standards.',
                'audience' => 'Compliance Officers, Accountable Institutions', 'audiences' => ['corporates', 'smes'], 'industries' => ['financial-services'], 'business_function' => 'Compliance',
                'formats' => ['PDF'], 'primary_format' => 'PDF', 'af' => 'approved', 'risk' => 'High',
                'prices' => ['L1' => 950, 'L2' => 1250, 'L3' => 1850, 'L4' => 2450, 'L5' => null],
                'dss' => 71, 'dss_band' => 'DSS 2 – High', 'disposition' => 'DP-PK', 'defensibility_level' => 'D3 – Strong', 'downloads_count' => 356, 'popularity' => 70, 'tone' => 'gold',
                'versions' => [['1.0.0', 'current', 'major', '2026-07-28', 'FICA amendments and FATF grey-list remediation controls.']],
                'receive' => ['Customer due diligence checklist', 'Risk management and compliance programme (RMCP) checklist', 'Record-keeping controls', 'Reporting obligations checklist'],
            ],
            [
                'code' => 'DP-TPL-000132', 'sku' => 'DP-TPL-LEAN-BP', 'slug' => 'lean-business-plan-template', 'name' => 'Lean Business Plan Template',
                'type' => 'template', 'category' => 'Business & Management',
                'tagline' => 'One-page and lean plan for startups and early-stage ventures.',
                'audience' => 'Startups, Innovators', 'audiences' => ['startups', 'entrepreneurs'], 'industries' => ['cross-industry'], 'business_function' => 'Strategy & Planning',
                'formats' => ['DOCX', 'PDF'], 'primary_format' => 'DOCX', 'af' => 'unavailable',
                'prices' => ['L1' => 950, 'L2' => 1250, 'L3' => null, 'L4' => null, 'L5' => null],
                'dss' => 79, 'dss_band' => 'DSS 3 – Moderate', 'disposition' => 'DP-PK', 'downloads_count' => 512, 'popularity' => 72, 'tone' => 'blue',
                'versions' => [['2.1.0', 'current', 'minor', '2026-08-10', 'Lean canvas refresh and investor one-pager.']],
                'receive' => ['Lean canvas', 'One-page plan', 'Unit economics sheet', 'Investor one-pager'],
            ],
            [
                'code' => 'DP-PR-000441', 'sku' => 'DP-TPL-PITCH', 'slug' => 'pitch-deck-template', 'name' => 'Pitch Deck Template',
                'type' => 'template', 'category' => 'Business & Management',
                'tagline' => 'Professional slide deck for investor presentations and fundraising.',
                'audience' => 'Startups, Fundraisers', 'audiences' => ['startups', 'entrepreneurs'], 'industries' => ['cross-industry'], 'business_function' => 'Fundraising',
                'formats' => ['PPTX', 'PDF'], 'primary_format' => 'PPTX', 'af' => 'approved',
                'prices' => ['L1' => null, 'L2' => 1450, 'L3' => null, 'L4' => 3450, 'L5' => null],
                'dss' => 76, 'dss_band' => 'DSS 3 – Moderate', 'disposition' => 'DP-PS', 'downloads_count' => 721, 'popularity' => 74, 'tone' => 'purple',
                'versions' => [['1.1.1', 'superseded', 'patch', '2026-02-05', 'Investor Q&A appendix.'], ['1.2.0', 'current', 'minor', '2026-08-10', 'Traction and use-of-funds slides refreshed.']],
                'receive' => ['20-slide investor deck', 'Financial summary slides', 'Speaker notes', 'Design guide'],
            ],
            [
                'code' => 'DP-FN-000332', 'sku' => 'DP-CF-0130', 'slug' => 'cash-flow-forecast-template', 'name' => 'Cash Flow Forecast Template',
                'type' => 'calculator', 'category' => 'Finance & Accounting',
                'tagline' => '13-week and 12-month cash flow forecast with scenario toggles.',
                'audience' => 'SMEs, Finance Managers', 'audiences' => ['smes', 'finance'], 'industries' => ['cross-industry'], 'business_function' => 'Finance',
                'formats' => ['XLSX'], 'primary_format' => 'XLSX', 'af' => 'unavailable',
                'prices' => ['L1' => 1950, 'L2' => 2950, 'L3' => null, 'L4' => null, 'L5' => null],
                'dss' => 66, 'dss_band' => 'DSS 3 – Medium', 'disposition' => 'DP-PS', 'defensibility_level' => 'D2 – Moderate', 'subscription_suitable' => true, 'subscription_status' => 'Enabled', 'recurring_evidence' => 'Monthly data updates',
                'downloads_count' => 986, 'popularity' => 82, 'tone' => 'green',
                'versions' => [['1.2.0', 'superseded', 'minor', '2026-03-10', 'Scenario toggles.'], ['1.3.0', 'current', 'minor', '2026-08-06', 'Rolling 13-week view and VAT timing.']],
                'receive' => ['13-week cash flow', '12-month forecast', 'Scenario toggles', 'Bank covenant view'],
            ],
            [
                'code' => 'DP-RS-000511', 'sku' => 'MRK-TOOL-0012', 'slug' => 'market-research-toolkit', 'name' => 'Market Research Toolkit',
                'type' => 'toolkit', 'category' => 'Research & Reports',
                'tagline' => 'Survey instruments, sizing models and competitor frameworks for African markets.',
                'audience' => 'Strategy Teams, Consultants', 'audiences' => ['consultants', 'corporates'], 'industries' => ['cross-industry'], 'business_function' => 'Marketing',
                'formats' => ['XLSX', 'DOCX'], 'primary_format' => 'XLSX', 'af' => 'unavailable',
                'prices' => ['L1' => 2450, 'L2' => 3450, 'L3' => 4490, 'L4' => null, 'L5' => null],
                'dss' => 61, 'dss_band' => 'DSS 2 – High', 'disposition' => 'DP-PE', 'downloads_count' => 842, 'popularity' => 66, 'tone' => 'blue',
                'versions' => [['1.0.3', 'superseded', 'patch', '2026-01-20', 'Source links refreshed.'], ['1.1.0', 'current', 'minor', '2026-07-15', 'Stats SA Q1 2026 data and TAM / SAM / SOM model.']],
                'receive' => ['Survey instrument library', 'Market sizing model', 'Competitor matrix', 'Research plan template'],
            ],
            [
                'code' => 'DP-GOV-000610', 'sku' => 'DP-TPL-BOARD', 'slug' => 'board-pack-template', 'name' => 'Board Pack Template',
                'type' => 'template', 'category' => 'Governance',
                'tagline' => 'King IV-aligned board pack with agenda, resolutions and reporting dashboards.',
                'audience' => 'Company Secretaries, Directors', 'audiences' => ['corporates'], 'industries' => ['cross-industry'], 'business_function' => 'Governance',
                'formats' => ['DOCX', 'PPTX'], 'primary_format' => 'DOCX', 'af' => 'approved',
                'prices' => ['L1' => 1650, 'L2' => 2250, 'L3' => 3250, 'L4' => null, 'L5' => null],
                'dss' => 69, 'dss_band' => 'DSS 3 – Medium', 'disposition' => 'DP-PK', 'downloads_count' => 233, 'popularity' => 55, 'tone' => 'purple',
                'versions' => [['1.3.0', 'superseded', 'minor', '2025-12-12', 'Committee reports.'], ['2.0.0', 'superseded', 'major', '2026-05-01', 'King IV refresh.'], ['2.0.1', 'current', 'patch', '2026-08-02', 'Resolution register fixes.']],
                'receive' => ['Board agenda & minutes', 'Resolution templates', 'Board dashboard', 'Annual board calendar'],
            ],
            [
                'code' => 'DP-PR-000622', 'sku' => 'DP-GDE-FEAS', 'slug' => 'feasibility-study-guide', 'name' => 'Feasibility Study Guide',
                'type' => 'guide', 'category' => 'Project Advisory',
                'tagline' => 'Step-by-step guide to structuring a bankable feasibility study.',
                'audience' => 'Project Developers, Public Sector', 'audiences' => ['public', 'consultants'], 'industries' => ['infrastructure'], 'business_function' => 'Projects',
                'formats' => ['PDF'], 'primary_format' => 'PDF', 'af' => 'unavailable', 'lifecycle' => 'pending_reclass',
                'prices' => ['L1' => 2490, 'L2' => 3490, 'L3' => null, 'L4' => null, 'L5' => null],
                'dss' => 48, 'dss_band' => 'DSS 1 – Very High', 'disposition' => 'DP-RC', 'downloads_count' => 143, 'popularity' => 30, 'tone' => 'teal',
                'versions' => [['1.0.0', 'superseded', 'major', '2026-01-03', 'First release.'], ['1.2.0', 'current', 'minor', '2026-06-03', 'Funder requirements chapter.']],
                'receive' => ['Feasibility study structure', 'Funder checklist', 'Worked example'],
            ],
            [
                'code' => 'DP-GD-000701', 'sku' => 'DP-SG-EN-0301', 'slug' => 'sector-opportunity-guide-energy', 'name' => 'Sector Opportunity Guide – Energy',
                'type' => 'guide', 'category' => 'Research & Reports',
                'tagline' => 'Renewable and gas-to-power opportunity map with procurement windows and risk notes.',
                'audience' => 'Investors, IPP Developers', 'audiences' => ['investors'], 'industries' => ['energy'], 'business_function' => 'Investment',
                'formats' => ['PDF'], 'primary_format' => 'PDF', 'af' => 'unavailable',
                'prices' => ['L1' => 3450, 'L2' => 4450, 'L3' => 6450, 'L4' => 8450, 'L5' => null],
                'dss' => 84, 'dss_band' => 'DSS 2 – High', 'disposition' => 'DP-PE', 'defensibility_level' => 'D4 – Strong', 'subscription_suitable' => true, 'subscription_status' => 'Enabled', 'recurring_evidence' => 'Bi-annual comprehensive refresh',
                'downloads_count' => 188, 'popularity' => 60, 'tone' => 'gold',
                'versions' => [['3.0.1', 'current', 'patch', '2026-08-05', 'REIPPPP Bid Window 7 results.']],
                'receive' => ['Opportunity map', 'Procurement calendar', 'Risk notes', 'Deal case studies'],
            ],
            [
                'code' => 'DP-TR-001010', 'sku' => 'DP-TR-1010', 'slug' => 'africa-trade-101-guide', 'name' => 'Africa Trade 101 Guide',
                'type' => 'guide', 'category' => 'Trade',
                'tagline' => 'Free introduction to AfCFTA, rules of origin and export readiness.',
                'audience' => 'Exporters, SMEs', 'audiences' => ['smes'], 'industries' => ['trade'], 'business_function' => 'Trade',
                'formats' => ['PDF'], 'primary_format' => 'PDF', 'af' => 'approved',
                'prices' => ['L1' => null, 'L2' => null, 'L3' => null, 'L4' => null, 'L5' => null],
                'dss' => 24, 'dss_band' => 'DSS 3 – Medium', 'disposition' => 'DP-FR', 'defensibility_level' => 'D1 – Basic', 'downloads_count' => 2210, 'popularity' => 40, 'tone' => 'teal',
                'versions' => [['1.0.0', 'current', 'major', '2026-08-07', 'First edition.']],
                'receive' => ['AfCFTA overview', 'Rules of origin explainer', 'Export readiness checklist'],
            ],
            [
                'code' => 'DP-LCC-000120', 'sku' => 'DP-LCC-0120', 'slug' => 'local-content-compliance-toolkit', 'name' => 'Local Content Compliance Toolkit',
                'type' => 'toolkit', 'category' => 'Compliance & ESG',
                'tagline' => 'Local content and B-BBEE procurement compliance workbook.',
                'audience' => 'Procurement Teams', 'audiences' => ['corporates', 'public'], 'industries' => ['manufacturing'], 'business_function' => 'Procurement',
                'formats' => ['XLSX'], 'primary_format' => 'XLSX', 'af' => 'unavailable', 'lifecycle' => 'under_review',
                'prices' => ['L1' => 2250, 'L2' => 2950, 'L3' => null, 'L4' => null, 'L5' => null],
                'dss' => 57, 'dss_band' => 'DSS 3 – Medium', 'disposition' => 'DP-RC', 'defensibility_level' => 'D2 – Moderate', 'subscription_suitable' => true, 'subscription_status' => 'Pending', 'recurring_evidence' => 'Quarterly regulatory changes',
                'downloads_count' => 77, 'popularity' => 20, 'tone' => 'green',
                'versions' => [['1.2.0', 'current', 'minor', '2026-08-03', 'DTIC designation updates.']],
                'receive' => ['Designation tracker', 'Supplier declaration templates', 'Compliance scorecard'],
            ],
            [
                'code' => 'DP-CRS-000801', 'sku' => 'DP-CRS-FIN-101', 'slug' => 'financial-literacy-for-founders-course', 'name' => 'Financial Literacy for Founders Course',
                'type' => 'course', 'category' => 'Finance & Accounting',
                'tagline' => 'Six self-paced modules on reading statements, pricing and cash management.',
                'audience' => 'Founders, Entrepreneurs', 'audiences' => ['entrepreneurs', 'startups'], 'industries' => ['cross-industry'], 'business_function' => 'Finance',
                'formats' => ['PDF'], 'primary_format' => 'PDF', 'af' => 'review',
                'prices' => ['L1' => 1450, 'L2' => 2450, 'L3' => null, 'L4' => null, 'L5' => null],
                'dss' => 63, 'dss_band' => 'DSS 3 – Medium', 'disposition' => 'DP-PK', 'downloads_count' => 264, 'popularity' => 50, 'tone' => 'purple',
                'versions' => [['1.0.0', 'current', 'major', '2026-07-01', 'Six modules with workbooks.']],
                'receive' => ['Six module workbooks', 'Pricing calculator', 'Cash management checklist', 'Completion certificate template'],
            ],
            [
                'code' => 'DP-MKT-000909', 'sku' => 'DP-TLK-MKT', 'slug' => 'marketing-strategy-toolkit', 'name' => 'Marketing Strategy Toolkit',
                'type' => 'toolkit', 'category' => 'Business & Management',
                'tagline' => 'Positioning, channel mix and campaign planning frameworks.',
                'audience' => 'Marketing Managers, SMEs', 'audiences' => ['smes'], 'industries' => ['cross-industry'], 'business_function' => 'Marketing',
                'formats' => ['DOCX', 'XLSX'], 'primary_format' => 'DOCX', 'af' => 'unavailable', 'lifecycle' => 'pending_pricing',
                'prices' => ['L1' => 1450, 'L2' => 1950, 'L3' => null, 'L4' => null, 'L5' => null],
                'dss' => 58, 'dss_band' => 'DSS 3 – Medium', 'disposition' => 'DP-PS', 'downloads_count' => 0, 'popularity' => 10, 'tone' => 'blue',
                'versions' => [['1.0.0', 'current', 'major', '2026-08-10', 'First release.']],
                'receive' => ['Positioning canvas', 'Channel mix planner', 'Campaign calendar'],
            ],
        ];
    }

    /** "Why this, not a free AI answer?" comparison for templates. */
    public static function compareRows(string $type): array
    {
        return [
            ['Structured, end-to-end '.($type === 'template' ? 'plan' : 'framework'), 'Yes – complete framework', 'No – fragmented output'],
            ['Investor & bank readiness', 'Yes – built for due diligence', 'No – generic content'],
            [$type === 'report' ? 'Verified data sources' : 'Financial models included', $type === 'report' ? 'Yes – cited and dated' : 'Yes – projections & assumptions', 'Rarely – basic or missing'],
            ['Risk & mitigation framework', 'Yes – built-in structure', 'No – usually missing'],
            ['South Africa context', 'Yes – local alignment', 'No – generic global content'],
            ['Professional quality', 'Yes – polished & editable', 'Low – varies widely'],
            ['Time to complete', 'Fast – guided structure', 'Slow – rewrite required'],
        ];
    }
}
