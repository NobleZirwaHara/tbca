<?php

namespace App\Support\Shop;

/**
 * Seed register of Online Shop Product Masters, taken from the Online Shop
 * mockups. ShopSeeder upserts these by slug; the Shop Admin consoles then
 * govern them (gates, floors, certification, versions, rights).
 */
class ProductRegister
{
    private const BIZ = ['businesses', 'investors', 'governments'];

    public static function products(): array
    {
        return [
            // ---------------------------------------------------------- A1 Fixed Sprints
            [
                'slug' => 'market-entry-strategy-sprint', 'code' => 'MES-SPR-001', 'sprint_code' => 'SP-A1-101', 'name' => 'Market Entry Strategy Sprint',
                'act' => 'A1', 'vehicle' => 'Services', 'vehicle_code' => 'VEH-02', 'aisle' => 'business-strategy-planning', 'subcategory' => 'market-entry-strategy',
                'icon' => 'target', 'price_zar' => 9800, 'floor_zar' => 8200, 'delivery' => '5-10 Days', 'output_format' => 'Report + Toolkit',
                'tagline' => 'Develop a clear, actionable market entry strategy for your target country or region.',
                'summary' => 'This Sprint delivers a practical go-to-market roadmap based on market assessment, competitor landscape, regulatory considerations and entry options. Ideal for businesses planning to enter or expand into new markets.',
                'buyer_types' => self::BIZ, 'best_for' => 'Businesses, Investors, Governments', 'featured' => false, 'rating' => 4.8, 'reviews_count' => 18, 'source_records' => 8,
                'aliases' => ['Market Entry Strategy (SME)', 'Market Entry Strategy - Investor Edition', 'New Market Entry Plan', 'Country Market Entry Sprint', 'Market Entry Roadmap Sprint', 'Market Entry Strategy Basic', 'Market Entry Strategy Premium'],
                'content' => [
                    'short' => 'A step-by-step plan to help you enter a new market with confidence and clarity.',
                    'key_benefit' => 'Define your route, partners and go-to-market model.',
                    'key_outcome' => 'Go-to-market plan and roadmap',
                    'includes_summary' => 'Research, analysis, strategy, roadmap, recommendations',
                    'format_access' => 'Fixed deliverable', 'updates' => 'One-time', 'support' => 'Email + QA Clarifications', 'licence_usage' => 'Single use',
                    'achieve' => ['Understand your target market opportunity.', 'Identify the best entry model for your business.', 'Assess competitors and market positioning.', 'Map regulatory and compliance requirements.', 'Receive a practical go-to-market roadmap.'],
                    'deliverables' => [['Market Assessment Report', 'PDF'], ['Competitor Landscape Analysis', 'PDF'], ['Entry Options Evaluation', 'PDF'], ['Regulatory & Compliance Overview', 'PDF'], ['Go-to-Market Roadmap', 'PDF'], ['Action Plan & Next Steps', 'PDF'], ['Tools & Templates Pack', 'ZIP']],
                    'glance' => [['Best For', 'Businesses, Investors, Governments'], ['Delivery Time', '5-10 Days'], ['Human Review', 'Included'], ['Interactions', '1 Clarification Round'], ['Updates', 'One-time delivery'], ['Support', 'Email + QA Clarifications'], ['Language', 'EN'], ['Country Focus', 'South Africa'], ['Output Format', 'Report + Toolkit']],
                    'why' => [
                        ['compass', 'Proven Framework', "Built on TBCA's proven 7-step market entry methodology used across multiple industries and market contexts."],
                        ['trending-up', 'Reduce Risk', 'Identify key market risks, regulatory hurdles and competitive pressures before you commit.'],
                        ['coins', 'Save Time & Resources', 'Get to market faster with a clear, prioritised plan and avoid costly trial-and-error approaches.'],
                        ['lightbulb', 'Actionable Insights', 'Receive practical, data-backed recommendations tailored to your business and target market.'],
                        ['users', 'Human Expertise Included', 'All outputs are reviewed by TBCA professionals for accuracy, relevance and implementation readiness.'],
                        ['file-check', 'Implement with Confidence', 'Walk away with a clear roadmap, next steps and tools to execute your market entry plan effectively.'],
                    ],
                    'why_intro' => 'This Sprint is designed to give you the clarity, confidence and practical plan you need to enter a new market successfully.',
                    'why_trust' => 'From startups to established enterprises, our clients rely on this Sprint to make informed market entry decisions and achieve measurable results.',
                    'related_title' => 'Complete Your Market Entry Strategy',
                    'related_intro' => 'These complementary Sprints and resources help you go further, faster.',
                    'inputs' => ['Target country or region and timeline', 'Company profile and current market footprint', 'Product or service description and pricing', 'Known competitors and partners (if any)', 'Budget envelope for market entry'],
                ],
            ],
            self::sprint('financial-feasibility-analysis-sprint', 'FFA-SPR-203', 'SP-A1-203', 'Financial Feasibility Analysis Sprint', 'finance-investment', 'financial-modelling-feasibility', 'bar-chart-3', 7500, 6500, '5-7 Days', 'Report + Model',
                'Assess the financial viability of your market entry with scenario modelling and ROI analysis.', 'Validate the numbers before you commit capital.', ['Financial Feasibility Study', 'Feasibility Model Sprint']),
            self::sprint('competitor-landscape-sprint', 'CLS-SPR-014', 'SP-A1-114', 'Competitor Landscape Sprint', 'business-strategy-planning', 'competitive-analysis', 'users', 6500, 5900, '5-7 Days', 'Report',
                'Understand your competitors, strengths, weaknesses and market positioning.', 'See exactly where you can win.', ['Competitive Analysis Sprint', 'Competitor Benchmarking']),
            self::sprint('go-to-market-roadmap-sprint', 'GMR-SPR-015', 'SP-A1-115', 'Go-to-Market Roadmap Sprint', 'business-strategy-planning', 'strategic-roadmap-development', 'map', 9500, 8200, '7-10 Days', 'Roadmap + Toolkit',
                'Develop a detailed step-by-step roadmap to launch successfully in your target market.', 'A launch sequence your team can execute.', ['GTM Roadmap', 'Launch Roadmap Sprint']),
            self::sprint('go-to-market-strategy-sprint', 'GMS-SPR-016', 'SP-A1-116', 'Go-to-Market Strategy Sprint', 'business-strategy-planning', 'market-entry-strategy', 'bar-chart-3', 8250, 7500, '5-12 Days', 'Strategy Report',
                'Build a winning go-to-market plan tailored to local demand, competition and customer segments.', 'Align your value, pricing, channels and messaging.', ['GTM Strategy', 'Go to Market Plan', 'Go-to-Market Strategy (SME)', 'Go-to-Market Strategy (Corporate)', 'Go-to-Market Strategy Premium'], 6),
            self::sprint('local-partner-identification', 'LPI-SPR-017', 'SP-A1-117', 'Local Partner Identification', 'business-strategy-planning', 'strategic-partnerships', 'handshake', 5900, 5400, '7-15 Days', 'Shortlist + Profiles',
                'Find and shortlist trusted local partners to support your market entry.', 'Enter with partners you can trust.', ['Partner Search Sprint']),
            self::sprint('partner-channel-strategy-sprint', 'PCS-SPR-018', 'SP-A1-118', 'Partner & Channel Strategy Sprint', 'business-strategy-planning', 'market-entry-strategy', 'handshake', 7500, 6500, '7-15 Days', 'Strategy Report',
                'Identify, assess and structure the right local partners and channels to accelerate your successful entry.', 'Accelerate market access through the right partners.', ['Channel Strategy Sprint', 'Partner Strategy', 'Distribution Channel Plan', 'Partner & Channel Strategy (SME)', 'Partner & Channel Strategy (Investor)', 'Channel Partner Sprint'], 7),
            self::sprint('investment-readiness-assessment-sprint', 'IRA-SPR-019', 'SP-A1-119', 'Investment Readiness Assessment Sprint', 'finance-investment', 'investment-readiness', 'clipboard-check', 6900, 6000, '5-10 Days', 'Assessment + Roadmap',
                'Evaluate your business or project readiness for investment. Includes gap analysis and improvement roadmap.', 'Understand investment gaps and strengthen your case.', ['Investor Readiness Sprint', 'Funding Readiness Check', 'Investment Readiness (SME)', 'Bankability Assessment'], 5),
            self::sprint('digital-transformation-strategy', 'DTS-SPR-020', 'SP-A1-120', 'Digital Transformation Strategy', 'business-strategy-planning', 'digital-transformation-strategy', 'cpu', 6800, 6000, '10-15 Days', 'Strategy + Roadmap',
                'Build practical digital strategies that drive real business impact.', 'A digital roadmap tied to measurable outcomes.', ['Digital Strategy Sprint']),
            self::sprint('country-risk-assessment', 'CRA-SPR-021', 'SP-A1-121', 'Country Risk Assessment', 'business-strategy-planning', 'market-entry-strategy', 'globe', 5900, 5000, '5-7 Days', 'Risk Report',
                'Assess political, economic, regulatory and operational risk in your target country.', 'Know the risks before you commit.', ['Country Risk Report']),
            self::sprint('business-plan-development', 'BPD-SPR-022', 'SP-A1-122', 'Business Plan Development', 'business-strategy-planning', 'strategic-planning', 'file-text', 12500, 11000, '7 Days', 'Business Plan + Model',
                'An investor-ready business plan with financial projections and strategy.', 'A bankable plan with projections lenders understand.', ['Business Plan Sprint', 'Bankable Business Plan']),
            self::sprint('business-health-diagnostic-sprint', 'BHD-SPR-023', 'SP-A1-123', 'Business Health Diagnostic Sprint', 'business-strategy-planning', 'business-model-innovation', 'activity', 7500, 6500, '5 days', 'Diagnostic Report',
                'Assess your business health across key performance areas.', 'A scored view of strengths, gaps and priorities.', ['Business Health Check Sprint'], 1, true),
            self::sprint('due-diligence-starter-pack', 'DDS-SPR-024', 'SP-A1-124', 'Due Diligence Starter Pack', 'due-diligence-verification', 'company-supplier-checks', 'file-search', 6500, 5500, '7 days', 'Verification Pack',
                'Essential checks for companies, directors and suppliers.', 'Verify before you sign.', ['DD Starter Pack'], 1, true),
            self::sprint('popia-compliance-health-check', 'PCH-SPR-045', 'SS-00045', 'POPIA Compliance Health Check', 'compliance-governance', 'popia-data-protection', 'shield-check', 2500, 2000, '3-5 Days', 'Health Check Report',
                'A rapid POPIA readiness check with prioritised remediation actions.', 'Know your POPIA exposure in days.', ['POPIA Health Check', 'POPIA Readiness Check']),
            self::sprint('cloud-migration-assessment', 'CMA-SPR-210', 'TE-00210', 'Cloud Migration Assessment', 'technology-automation', 'cloud-infrastructure', 'cloud', 18000, 15000, null, 'Assessment Report',
                'Assess workloads, costs and risks for a governed cloud migration.', 'A costed, risk-rated migration path.', [], 1, false, 'Tech Solution', 'VEH-09', ['missing_hard' => ['Delivery window', 'Country availability']]),
            self::sprint('environmental-compliance-sprint', 'ECS-SPR-011', 'SV-07011', 'Environmental Compliance Sprint', 'compliance-governance', 'regulatory-compliance', 'leaf', 14500, 12000, '10-15 Days', 'Compliance Register',
                'Map environmental permits, obligations and compliance gaps for your operations.', 'Know which permits and obligations apply.', [], 1, false, 'Services', 'VEH-02', ['rights' => 'not_cleared', 'licence_scope' => 'L4']),
            [...self::digital('portal-scoping-template-premium', 'DP-41002', 'Portal Scoping Template (Premium)', 'digital-products-ip', 'templates-toolkits', 'layout-template', 1850, 1500,
                'A premium scoping template for client portal and workspace projects.', 'Template Pack (.docx, .xlsx)', 'v1.0'), 'tax_confirmed' => false],
            self::sprint('internal-audit-plan', 'IAP-SPR-980', 'SS-01980', 'Internal Audit Plan', 'compliance-governance', 'internal-audit-controls', 'clipboard-check', 3800, 4200, '5-7 Days', 'Audit Plan',
                'A risk-based internal audit plan aligned to your control environment.', 'Focus audit effort where risk is highest.'),
            [
                'slug' => 'cybersecurity-risk-assessment', 'code' => 'SMP-RA-001', 'sprint_code' => 'RA-1001', 'name' => 'Cybersecurity Risk Assessment',
                'act' => 'A1', 'vehicle' => 'Services', 'vehicle_code' => 'VEH-02', 'aisle' => 'risk-cybersecurity', 'subcategory' => 'information-security', 'icon' => 'shield-alert',
                'price_zar' => 28500, 'floor_zar' => 24000, 'delivery' => '10-15 Days', 'output_format' => 'Technical Report + Evidence Pack', 'buyer_types' => ['businesses', 'governments'],
                'best_for' => 'Businesses, Governments', 'rating' => 4.7, 'reviews_count' => 22, 'source_records' => 18, 'version' => 'v1.2',
                'tagline' => 'Comprehensive cybersecurity risk assessment to identify vulnerabilities, evaluate risks and provide mitigation recommendations across people, processes and technology.',
                'summary' => 'A governed Sprint that reviews your IT infrastructure, applications and data handling, then delivers a prioritised risk register and remediation roadmap.',
                'aliases' => ['Cyber Risk Review', 'Information Security Assessment', 'IT Security Audit Sprint'],
                'variants' => ['skus' => [
                    ['code' => 'RA-001-V1', 'name' => 'Standard Online', 'tier' => 'Standard', 'licence' => 'L2 Standard', 'format' => 'Online', 'language' => 'English', 'jurisdiction' => 'South Africa', 'buyer' => 'General', 'skus' => 3, 'state' => 'Purchasable', 'status' => 'Active'],
                    ['code' => 'RA-001-V2', 'name' => 'Standard Report', 'tier' => 'Standard', 'licence' => 'L2 Standard', 'format' => 'Report (PDF)', 'language' => 'English', 'jurisdiction' => 'South Africa', 'buyer' => 'General', 'skus' => 2, 'state' => 'Purchasable', 'status' => 'Active'],
                    ['code' => 'RA-001-V3', 'name' => 'Premium Advisory', 'tier' => 'Premium', 'licence' => 'L3 Premium', 'format' => 'Advisory', 'language' => 'English', 'jurisdiction' => 'South Africa', 'buyer' => 'SME', 'skus' => 2, 'state' => 'Purchasable', 'status' => 'Active'],
                ]],
                'gates' => ['qa' => 'passed', 'rights' => 'cleared', 'release' => true, 'completeness' => 100, 'owner' => 'Product Governance', 'steward' => 'Risk & Compliance Lead', 'certificate' => 'OS-RC-2026-05-110', 'batches' => '4A, 4B, 4C', 'first_seen' => '2026-01-12', 'split' => 'VJ-01 Substantive Content'],
            ],
            [
                'slug' => 'popia-compliance-implementation-sprint', 'code' => 'PRD-POPIA-001', 'sprint_code' => 'SS-00146', 'name' => 'POPIA Compliance Implementation Sprint',
                'act' => 'A1', 'vehicle' => 'Services', 'vehicle_code' => 'VEH-02', 'aisle' => 'compliance-governance', 'subcategory' => 'popia-data-protection', 'icon' => 'lock',
                'price_zar' => 19950, 'floor_zar' => 18000, 'delivery' => '6-8 weeks', 'output_format' => 'Policies + Implementation', 'buyer_types' => ['businesses', 'governments'],
                'best_for' => 'Businesses, Governments', 'rating' => 4.9, 'reviews_count' => 128, 'source_records' => 7,
                'tagline' => 'Configure your tier and variant to match your exact needs',
                'summary' => 'Select the scope, variant and options that best fit your business. All options are human-reviewed by TBCA professionals.',
                'aliases' => ['POPIA Implementation', 'POPIa Compliance Sprint', 'POPIA Programme Sprint'],
                'content' => ['chips' => ['Most Popular', 'High Demand', 'South Africa Ready'], 'estimated_start' => 'Within 2 business days', 'estimated_completion' => '6-8 weeks'],
                'variants' => [
                    'tiers' => [
                        ['key' => 'essential', 'name' => 'Essential', 'sub' => 'Start Strong', 'badge' => 'Great for SMEs', 'zar' => 19950, 'fit' => 'Perfect for micro & small businesses', 'features' => ['Up to 10 employees', 'Standard templates', 'Guided implementation', 'Email support (30 days)'], 'support' => 'Standard (30 days)'],
                        ['key' => 'professional', 'name' => 'Professional', 'sub' => 'Growth Ready', 'badge' => 'Most Popular', 'popular' => true, 'zar' => 34950, 'fit' => 'Ideal for established businesses', 'features' => ['11 - 250 employees', 'Customised documentation', 'Risk assessment included', 'Implementation coaching', 'Priority support (60 days)'], 'support' => 'Priority (60 days)'],
                        ['key' => 'enterprise', 'name' => 'Enterprise', 'sub' => 'Fully Comprehensive', 'zar' => 64950, 'fit' => 'For complex organisations', 'features' => ['251+ employees', 'Full data mapping', 'Staff training toolkit', 'Board reporting pack', 'Dedicated advisor (90 days)'], 'support' => 'Dedicated (90 days)'],
                    ],
                    'matrix' => [
                        ['POPIA Gap Assessment', true, true, true],
                        ['Policy & Procedural Templates', '20 Templates', '35 Templates', '50+ Templates'],
                        ['Data Subject Request Process', true, true, true],
                        ['Risk Assessment', 'Basic', 'Comprehensive', 'Full'],
                        ['Staff Training Materials', false, true, true],
                        ['Board Reporting Pack', false, false, true],
                        ['Implementation Support', '30 days', '60 days', '90 days'],
                        ['Advisor Access', 'Email', 'Prioritised', 'Dedicated'],
                    ],
                    'addons' => [
                        ['key' => 'paia-manual', 'name' => 'PAIA Manual Drafting', 'zar' => 3500],
                        ['key' => 'operator-agreements', 'name' => 'Operator Agreement Pack', 'zar' => 2950],
                        ['key' => 'breach-drill', 'name' => 'Breach Response Drill', 'zar' => 4500],
                    ],
                    'sizes' => ['1 - 10 Employees', '11 - 50 Employees', '51 - 100 Employees', '101 - 250 Employees', '251+ Employees'],
                    'industries' => ['Manufacturing', 'Financial Services', 'Healthcare', 'Retail', 'Professional Services', 'Public Sector'],
                    'modes' => ['Remote', 'On-site', 'Hybrid (Remote + On-site)'],
                ],
            ],
            // ---------------------------------------------------------- A2 Digital Products
            [
                'slug' => 'country-entry-framework-digital', 'code' => 'CEF-DIG-002', 'sprint_code' => 'DP-L2-002', 'name' => 'Country Entry Framework (Digital)',
                'act' => 'A2', 'vehicle' => 'Digital Product', 'vehicle_code' => 'VEH-03', 'aisle' => 'business-strategy-planning', 'subcategory' => 'market-entry-strategy', 'icon' => 'globe',
                'price_zar' => 3950, 'floor_zar' => 3500, 'delivery' => 'Instant Access', 'output_format' => 'Templates & Tools', 'buyer_types' => ['businesses', 'advisors', 'investors'],
                'best_for' => 'Businesses, Analysts, Advisors', 'rating' => 4.7, 'reviews_count' => 24, 'source_records' => 6,
                'tagline' => 'Step-by-step digital framework with tools, checklists and templates to plan and execute your market entry with confidence.',
                'summary' => 'This digital product provides a comprehensive, easy-to-follow framework designed by TBCA professionals to help you evaluate, plan and execute entry into new markets. Includes practical tools, editable templates and guidance notes you can apply immediately.',
                'aliases' => ['Country Entry Toolkit', 'Market Entry Framework Template', 'Country Entry Framework (SME)', 'Entry Framework Digital Pack', 'Country Entry Checklist Pack'],
                'content' => [
                    'key_benefit' => 'Practical tools to plan and execute entry with confidence.',
                    'key_outcome' => 'Frameworks, tools and templates', 'includes_summary' => 'Framework guide, tools, templates, checklists',
                    'format_access' => 'Digital download', 'updates' => 'Lifetime updates', 'support' => 'Knowledge Base', 'licence_usage' => 'Single user licence',
                    'achieve' => ['Complete step-by-step framework', 'Editable templates and checklists', 'Country evaluation tools', 'Market analysis worksheets', 'Go-to-market planning guide', 'Risk assessment templates', 'Practical implementation guidance'],
                    'benefits' => ['Save time with proven methodology', 'Reduce risk in market entry decisions', 'Structured approach used by experts', 'Customisable to your business', 'Supports multiple markets', 'Reusable for future expansions', 'Updated continuously for relevance'],
                    'best_for_list' => ['Businesses exploring new markets', 'Strategy and business development teams', 'Consultants and advisors', 'Investors and private equity firms', 'Exporting and expanding organisations'],
                    'glance' => [['Delivery Time', 'Instant Access'], ['Format', 'Digital Download'], ['Language', 'EN'], ['Output Format', 'Templates & Tools'], ['Support', 'Email + Knowledge Base'], ['Human Review', 'Included'], ['Updates', 'Lifetime']],
                ],
                'variants' => ['licences' => [
                    ['key' => 'L1', 'name' => 'Standard Licence (Single User)', 'zar' => 3950, 'body' => 'Single user licence', 'includes' => ['Single user licence', 'Internal use only', 'Lifetime access', 'All updates included', 'Email support']],
                    ['key' => 'L3', 'name' => 'Team Licence (Up to 10 Users)', 'zar' => 8950, 'body' => 'Use across one group', 'includes' => ['Up to 10 named users', 'Group internal use', 'Lifetime access', 'All updates included', 'Priority email support']],
                    ['key' => 'L4', 'name' => 'Advisor Licence (Client Work)', 'zar' => 14950, 'body' => 'For advisors using it with clients', 'includes' => ['Use in client engagements', 'White-label worksheets', 'Lifetime access', 'All updates included', 'Advisor support line']],
                ]],
            ],
            [
                'slug' => 'non-disclosure-agreement-template', 'code' => 'SA-101', 'sprint_code' => 'DP-SA-101', 'name' => 'Non-Disclosure Agreement Template',
                'act' => 'A2', 'vehicle' => 'Digital Product', 'vehicle_code' => 'VEH-03', 'aisle' => 'legal-contracts', 'subcategory' => 'contract-templates', 'icon' => 'file-check',
                'price_zar' => 250, 'floor_zar' => 250, 'delivery' => 'Instant Access', 'output_format' => 'Microsoft Word (.docx)', 'buyer_types' => ['businesses', 'advisors'],
                'best_for' => 'Businesses, Advisors', 'rating' => 4.6, 'reviews_count' => 41, 'source_records' => 4,
                'tagline' => 'Drafted in South Africa. Legally robust, easy to customise.',
                'summary' => 'A mutual and one-way NDA template drafted for South African law with drafting notes and signing guidance.',
                'aliases' => ['NDA Template', 'Confidentiality Agreement Template', 'Mutual NDA (South Africa)'],
                'content' => ['glance' => [['Format', 'Microsoft Word (.docx)'], ['Language', 'English'], ['Jurisdiction', 'South Africa'], ['Currentness', 'June 2026'], ['Last Updated', '01 June 2026'], ['Creation QA', 'TBCA Legal & Content Team']]],
                'variants' => ['licences' => [
                    ['key' => 'L1', 'name' => 'Personal Use', 'zar' => 250, 'body' => 'For personal use only. Not for business or commercial activities.', 'icon' => 'user'],
                    ['key' => 'L2', 'name' => 'Single Business Use', 'zar' => 650, 'body' => 'Use within one business entity or organisation only.', 'icon' => 'briefcase'],
                    ['key' => 'L3', 'name' => 'Multi-Entity Use', 'zar' => 1250, 'body' => 'Use across multiple entities within the same group.', 'icon' => 'building-2'],
                    ['key' => 'L4', 'name' => 'Professional Practice Use', 'zar' => 2450, 'body' => 'For use by legal, accounting or advisory practitioners with clients.', 'icon' => 'scale'],
                    ['key' => 'L5', 'name' => 'Resale or Distribution', 'zar' => 4950, 'body' => 'For resellers or distributors. May not be used as a standalone product.', 'icon' => 'share-2'],
                ]],
            ],
            self::digital('regulatory-compliance-check', 'DP-L2-045', 'Regulatory & Compliance Check', 'compliance-governance', 'regulatory-compliance', 'users', 2450, 2000,
                'Identify legal, regulatory and compliance requirements for your target market.', 'Digital Guide + Excel Checklist', 'v2.1'),
            self::digital('project-feasibility-template', 'PFT-DIG-024', 'Project Feasibility Template', 'finance-investment', 'financial-modelling-feasibility', 'bar-chart-3', 1950, 1500,
                'Build robust financial models and feasibility studies.', 'Excel Model + Guide', 'v1.4', true),
            self::digital('ai-agents-playbook', 'AAP-DIG-025', 'AI Agents Playbook', 'technology-automation', 'ai-agents-automation', 'bot', 2450, 2000,
                'Design, build and deploy AI agents for real results.', 'Playbook + Templates', 'v1.1', true),
            self::digital('market-research-report', 'MRR-DIG-026', 'Market Research Report', 'digital-products-ip', 'reports-research', 'bar-chart-3', 3750, 3000,
                'In-depth insights on South African market trends.', 'Research Report (PDF)', 'v2026.2', true),
            self::digital('popia-policy-template-pack', 'DP-01455', 'POPIA Policy Template Pack', 'compliance-governance', 'popia-data-protection', 'file-text', 950, 950,
                'Editable POPIA policies, notices and registers ready to adopt.', 'Template Pack (.docx)', 'v3.0'),
            // ---------------------------------------------------------- A3 Subscriptions
            [
                'slug' => 'business-planning-subscription', 'code' => 'BPS-SUB-003', 'sprint_code' => 'SU-00003', 'name' => 'Business Planning Subscription',
                'act' => 'A3', 'vehicle' => 'Subscription', 'vehicle_code' => 'VEH-04', 'aisle' => 'subscriptions-intelligence', 'subcategory' => 'business-planning-plans', 'icon' => 'calendar-check',
                'price_zar' => 2950, 'price_unit' => 'month', 'floor_zar' => 2500, 'delivery' => 'Ongoing (Monthly)', 'output_format' => 'Online access (Subscription)', 'buyer_types' => ['businesses', 'investors', 'advisors'],
                'best_for' => 'Businesses, Investors, Consultants', 'rating' => 4.8, 'reviews_count' => 32, 'source_records' => 3,
                'tagline' => 'Ongoing expert support to keep your business plan current, relevant and investor-ready.',
                'summary' => 'Stay on track with monthly updates, KPI reviews and strategic guidance from TBCA advisors. Designed for growing businesses that want continuous oversight and a plan that evolves with them.',
                'aliases' => ['Business Plan Maintenance', 'Plan Refresh Subscription'],
                'recurrence' => self::certified('2026-05-10', '2027-05-10'),
                'content' => [
                    'key_benefit' => 'Continuous plan updates and guidance.', 'key_outcome' => 'Continuous plan updates and guidance', 'includes_summary' => 'Monthly plan reviews, updates, advisory, templates',
                    'format_access' => 'Online access (Subscription)', 'updates' => 'Monthly updates', 'support' => 'Email + Advisor Access', 'licence_usage' => 'Single user (Subscription)',
                    'achieve' => ['Monthly plan performance review', 'Updates to assumptions & financials', 'Market insights & trend alerts', 'Strategic advisory session (monthly)', 'Action plan & task tracking', 'Investor-ready plan refresh', 'Document version history', 'Templates, tools & resources', 'Email + WhatsApp support'],
                    'benefits' => ['Keep your plan current and credible', 'Identify risks and opportunities early', 'Improve decision-making with data', 'Maintain investor confidence', 'Save time with expert oversight', 'Stay aligned with market changes', 'Continuous improvement of your plan'],
                    'best_for_list' => ['Startups & scale-ups', 'Growing businesses', 'SMEs seeking investor funding', 'Businesses in dynamic markets', 'Companies with evolving strategies'],
                    'glance' => [['Billing', 'Monthly'], ['Commitment', 'Month-to-month'], ['Delivery', 'Online (Portal & Email)'], ['Human Review', 'Included'], ['Support', 'Email + WhatsApp'], ['Language', 'EN']],
                ],
                'variants' => ['plans' => [
                    ['key' => 'standard', 'name' => 'Standard Plan', 'zar' => 2950, 'includes' => ['Monthly plan reviews', 'Strategic advisory (1 session / month)', 'Email + WhatsApp support', 'Plan updates & version control', 'Templates, tools & resources', 'No long-term commitment']],
                    ['key' => 'growth', 'name' => 'Growth Plan', 'zar' => 4950, 'includes' => ['Fortnightly plan reviews', 'Strategic advisory (2 sessions / month)', 'Investor pack refresh each quarter', 'Plan updates & version control', 'Priority WhatsApp support', 'No long-term commitment']],
                ]],
            ],
            [
                'slug' => 'compliance-intelligence-subscription', 'code' => 'CIS-SUB-027', 'sprint_code' => 'SU-L2-027', 'name' => 'Compliance Intelligence Subscription',
                'act' => 'A3', 'vehicle' => 'Subscription', 'vehicle_code' => 'VEH-04', 'aisle' => 'subscriptions-intelligence', 'subcategory' => 'regulatory-bulletins', 'icon' => 'users',
                'price_zar' => 1495, 'price_unit' => 'month', 'floor_zar' => 1200, 'delivery' => 'Ongoing (Monthly)', 'output_format' => 'Alerts + Templates', 'buyer_types' => ['businesses', 'advisors'],
                'best_for' => 'Businesses, Advisors', 'rating' => 4.6, 'reviews_count' => 19, 'source_records' => 2,
                'tagline' => 'Access to compliance intelligence updates, legal alerts, templates and expert guidance.',
                'summary' => 'A monthly compliance intelligence service with regulatory alerts, updated templates and access to TBCA compliance advisors.',
                'recurrence' => self::certified('2026-05-08', '2027-05-08'),
                'variants' => ['plans' => [['key' => 'monthly', 'name' => 'Monthly Plan', 'zar' => 1495, 'licence' => 'SU-L2 - Advisory & Information', 'includes' => ['Monthly compliance alerts', 'Updated templates library', 'Advisor Q&A (2 per month)', 'Cancel any time']]]],
            ],
            self::subscription('tax-bulletin-monthly', 'TBM-SUB-388', 'SU-00388', 'Tax Bulletin Monthly', 1250, 'Monthly', self::certified('2026-05-10', '2027-05-10')),
            self::subscription('labour-law-update', 'LLU-SUB-721', 'SU-00721', 'Labour Law Update', 950, 'Monthly', self::certified('2026-05-09', '2027-05-09')),
            self::subscription('esg-insights-weekly', 'EIW-SUB-102', 'SU-01102', 'ESG Insights Weekly', 450, 'Weekly', ['r1' => 'pass', 'r2' => 'pass', 'r3' => 'pass', 'r4' => 'pass', 'r5' => 'pending', 'mandate' => 'pending', 'certified_at' => null, 'expires_at' => null]),
            self::subscription('ai-compliance-monitor', 'ACM-SUB-455', 'SU-01455', 'AI Compliance Monitor', 2750, 'Monthly', ['r1' => 'pass', 'r2' => 'fail', 'r3' => 'pass', 'r4' => 'pending', 'r5' => 'pending', 'mandate' => 'not_captured', 'certified_at' => null, 'expires_at' => null]),
            self::subscription('company-law-amended-updates', 'CLA-SUB-837', 'SU-01837', 'Company Law Amended Updates', 650, 'Monthly', ['r1' => 'pass', 'r2' => 'pass', 'r3' => 'pass', 'r4' => 'pending', 'r5' => 'fail', 'mandate' => 'not_captured', 'certified_at' => null, 'expires_at' => null]),
            // ---------------------------------------------------------- A4 Retainers
            [
                'slug' => 'strategic-advisory-retainer', 'code' => 'SAR-RET-004', 'sprint_code' => 'RE-10105', 'name' => 'Strategic Advisory Retainer',
                'act' => 'A4', 'vehicle' => 'Retainer', 'vehicle_code' => 'VEH-05', 'aisle' => 'retainers-advisory-desks', 'subcategory' => 'strategic-advisory', 'icon' => 'users-round',
                'price_zar' => 24500, 'price_unit' => 'month', 'floor_zar' => 24500, 'delivery' => 'Monthly (Rolling)', 'output_format' => 'Advisory & Strategic Support', 'buyer_types' => ['businesses', 'investors'],
                'best_for' => 'Growing businesses', 'rating' => 4.9, 'reviews_count' => 14, 'source_records' => 4,
                'tagline' => 'Ongoing access to senior expertise for continuous guidance and execution support.',
                'summary' => 'A flexible retainer that gives you dedicated access to an assigned TBCA senior adviser and a team of specialists. Ideal for businesses that need regular strategic input, oversight and problem-solving.',
                'content' => [
                    'achieve' => ['Dedicated access to a senior TBCA adviser', 'Strategic guidance and problem-solving', 'Regular KPI and performance reviews', 'Document and plan reviews', 'Ad-hoc advisory via agreed channels', 'Priority scheduling for consultations', 'Escalation to specialists when required', 'Knowledge base and template access'],
                    'benefits' => ['Trusted expertise when you need it', 'Better decisions, faster', 'Consistent oversight and accountability', 'Early risk and issue identification', 'Cost-effective compared to project fees', 'Scalable support as you grow'],
                    'best_for_list' => ['Growing businesses needing ongoing guidance', 'Companies with recurring strategic needs', 'Management teams wanting expert oversight', 'SMEs seeking external senior expertise', 'Businesses in transformation or scaling'],
                    'glance' => [['Commitment', 'Monthly (Rolling)'], ['Minimum Term', '3 Months'], ['Delivery', 'Advisory & Strategic Support'], ['Human Review', 'Included'], ['Support', 'Email, WhatsApp, Calls'], ['Language', 'EN'], ['Billing', 'Monthly in Advance']],
                ],
                'variants' => ['commitments' => [
                    ['key' => 'C1', 'name' => 'C1 - Essential (10 hrs / month)', 'hours' => 10, 'zar' => 24500],
                    ['key' => 'C2', 'name' => 'C2 - Standard (20 hrs / month)', 'hours' => 20, 'zar' => 44500, 'popular' => true],
                    ['key' => 'C3', 'name' => 'C3 - Extended (30 hrs / month)', 'hours' => 30, 'zar' => 64500],
                    ['key' => 'C4', 'name' => 'C4 - Senior Team (45 hrs / month)', 'hours' => 45, 'zar' => 94500],
                    ['key' => 'C5', 'name' => 'C5 - Partner-Led (60 hrs / month)', 'hours' => 60, 'zar' => 132000],
                ]],
            ],
            [
                'slug' => 'retainer-compliance-advisory', 'code' => 'RCA-RET-012', 'sprint_code' => 'RE-01012', 'name' => 'Retainer: Compliance Advisory',
                'act' => 'A4', 'vehicle' => 'Retainer', 'vehicle_code' => 'VEH-05', 'aisle' => 'retainers-advisory-desks', 'subcategory' => 'compliance-advisory', 'icon' => 'shield-check',
                'price_zar' => 55000, 'price_unit' => 'month', 'floor_zar' => 60000, 'delivery' => 'Monthly (Rolling)', 'output_format' => 'Advisory', 'buyer_types' => ['businesses'],
                'tagline' => 'Retained compliance advisory with monthly reviews and board support.',
                'summary' => 'Ongoing compliance monitoring, legal advisory, policy reviews and board support on a bounded monthly allowance.',
            ],
            [
                'slug' => 'business-rescue-advisory-sprint', 'code' => 'BRA-RET-085', 'sprint_code' => 'PA-30085', 'name' => 'Business Rescue Advisory Sprint',
                'act' => 'A4', 'vehicle' => 'Retainer', 'vehicle_code' => 'VEH-05', 'aisle' => 'project-advisory-restructuring', 'subcategory' => 'business-rescue-turnaround', 'icon' => 'users',
                'price_zar' => null, 'indicative_zar' => 85000, 'price_unit' => 'month', 'floor_zar' => null, 'delivery' => 'Consultation, TBD', 'output_format' => 'Proposal + Engagement Terms', 'buyer_types' => ['businesses', 'financiers'],
                'tagline' => 'Ongoing advisory support for companies in financial distress or business rescue.',
                'summary' => 'Partner-level advisory for boards and practitioners through business rescue, turnaround and restructuring.',
                'aliases' => ['Turnaround Advisory', 'Business Rescue Support'],
                'content' => ['glance' => [['Typical Term', '6-24 Months'], ['Named Senior Adviser', 'Partner-Level'], ['Human Review', 'Required']]],
            ],
            // ---------------------------------------------------------- A5 Marketplace Briefs
            [
                'slug' => 'business-valuation-advisory-brief', 'code' => 'BVA-BRF-005', 'sprint_code' => 'MB-50005', 'name' => 'Business Valuation Advisory Brief',
                'act' => 'A5', 'vehicle' => 'Marketplace Service', 'vehicle_code' => 'VEH-11', 'aisle' => 'finance-investment', 'subcategory' => 'valuation-advisory', 'icon' => 'handshake',
                'delivery' => 'Provider-dependent', 'output_format' => 'Provider Proposals', 'buyer_types' => ['businesses', 'investors'],
                'tagline' => 'Create a structured brief to invite pre-vetted service providers to propose on your project.',
                'summary' => 'Your brief will be matched to the most relevant providers based on expertise, capacity and location.',
                'aliases' => ['Valuation Brief', 'Independent Valuation Request'],
            ],
            [
                'slug' => 'esg-report-writing-project', 'code' => 'ERW-BRF-477', 'sprint_code' => 'PC-00477', 'name' => 'ESG Report Writing (Project)',
                'act' => 'A5', 'vehicle' => 'Partner Service', 'vehicle_code' => 'VEH-10', 'aisle' => 'compliance-governance', 'subcategory' => 'esg-reporting', 'icon' => 'leaf',
                'price_zar' => 35000, 'floor_zar' => 35000, 'delivery' => '4-6 Weeks', 'output_format' => 'ESG Report', 'buyer_types' => ['businesses', 'investors'],
                'tagline' => 'Brief verified ESG writers to produce your sustainability report.',
                'summary' => 'Submit a structured brief and receive proposals from verified ESG reporting providers.',
                'gates' => ['missing_soft' => ['Industry tag']],
            ],
            // ---------------------------------------------------------- A6 Quote Requests
            [
                'slug' => 'tax-due-diligence-compliance-review', 'code' => 'TDD-QTE-006', 'sprint_code' => 'DD-60006', 'name' => 'Tax Due Diligence and Compliance Review',
                'act' => 'A6', 'vehicle' => 'Due Diligence', 'vehicle_code' => 'VEH-07', 'aisle' => 'due-diligence-verification', 'subcategory' => 'tax-financial-due-diligence', 'icon' => 'receipt',
                'delivery' => '4-6 Weeks', 'output_format' => 'Due Diligence Report', 'buyer_types' => ['investors', 'financiers', 'businesses'],
                'tagline' => 'This engagement requires scoping and professional assessment. Submit your requirements and we will provide a tailored proposal with fees, deliverables and timelines.',
                'summary' => 'A comprehensive tax due diligence review covering historical compliance, risk assessment and tax structuring recommendations.',
                'aliases' => ['Tax DD', 'Tax Compliance Review'],
            ],
            // ---------------------------------------------------------- A7 Free Access
            [
                'slug' => 'health-check-business-readiness', 'code' => 'HCB-FRE-007', 'sprint_code' => 'DA-00007', 'name' => 'Health Check: Business Readiness',
                'act' => 'A7', 'vehicle' => 'Diagnostic', 'vehicle_code' => 'VEH-01', 'aisle' => 'diagnostics-free-tools', 'subcategory' => 'free-health-checks', 'icon' => 'clipboard-check',
                'price_zar' => 0, 'floor_zar' => 0, 'tax_treatment' => 'zero', 'delivery' => 'Instant Access', 'output_format' => 'Online Diagnostic', 'buyer_types' => ['businesses'],
                'tagline' => 'Free diagnostic to evaluate your business readiness and next best steps.',
                'summary' => "Complete this quick assessment to understand your business strengths, gaps and priorities. You'll receive instant insights and recommended actions to help you grow with confidence.",
                'content' => ['licence' => 'DI - SME Diagnostic', 'format' => 'Online', 'validity_days' => 30, 'entitlement_name' => 'SME Business Health Diagnostic', 'entitlement_body' => 'A quick diagnostic to assess the health of your business across key performance areas.'],
            ],
            [
                'slug' => 'sme-health-diagnostic', 'code' => 'DA-00122', 'sprint_code' => 'DA-00122', 'name' => 'SME Health Diagnostic',
                'act' => 'A7', 'vehicle' => 'Diagnostic', 'vehicle_code' => 'VEH-01', 'aisle' => 'diagnostics-free-tools', 'subcategory' => 'free-health-checks', 'icon' => 'activity',
                'price_zar' => 0, 'floor_zar' => 0, 'tax_treatment' => 'zero', 'delivery' => 'Instant Access', 'output_format' => 'Online Diagnostic', 'buyer_types' => ['businesses'],
                'tagline' => 'A quick diagnostic to assess the health of your business across key performance areas.',
                'summary' => 'Score your business across strategy, operations, finance and market readiness in 10-15 minutes.',
                'content' => ['licence' => 'DI - SME Diagnostic', 'format' => 'Online', 'validity_days' => 30],
            ],
        ];
    }

    private static function sprint(string $slug, string $code, string $sprintCode, string $name, string $aisle, string $sub, string $icon, int $price, int $floor, ?string $delivery, string $format,
        string $tagline, string $benefit, array $aliases = [], int $sources = 1, bool $featured = false, string $vehicle = 'Services', string $vehicleCode = 'VEH-02', array $gates = []): array
    {
        return [
            'slug' => $slug, 'code' => $code, 'sprint_code' => $sprintCode, 'name' => $name, 'act' => 'A1', 'vehicle' => $vehicle, 'vehicle_code' => $vehicleCode,
            'aisle' => $aisle, 'subcategory' => $sub, 'icon' => $icon, 'price_zar' => $price, 'floor_zar' => $floor, 'delivery' => $delivery, 'output_format' => $format,
            'tagline' => $tagline, 'summary' => $tagline.' Delivered as a governed, fixed-scope Sprint with human review before release.',
            'buyer_types' => self::BIZ, 'best_for' => 'Businesses, Investors, Governments', 'featured' => $featured, 'rating' => 4.7, 'reviews_count' => 9,
            'source_records' => max($sources, count($aliases) + 1), 'aliases' => $aliases, 'content' => ['key_benefit' => $benefit, 'languages' => $featured ? ['EN', 'AF'] : ['EN']], 'gates' => $gates,
        ];
    }

    private static function digital(string $slug, string $code, string $name, string $aisle, string $sub, string $icon, int $price, int $floor, string $tagline, string $format, string $version, bool $featured = false): array
    {
        return [
            'slug' => $slug, 'code' => $code, 'sprint_code' => $code, 'name' => $name, 'act' => 'A2', 'vehicle' => 'Digital Product', 'vehicle_code' => 'VEH-03',
            'aisle' => $aisle, 'subcategory' => $sub, 'icon' => $icon, 'price_zar' => $price, 'floor_zar' => $floor, 'delivery' => 'Instant Access', 'output_format' => $format,
            'tagline' => $tagline, 'summary' => $tagline.' Reviewed by TBCA professionals and delivered instantly to your workspace under licence.',
            'buyer_types' => ['businesses', 'advisors'], 'best_for' => 'Businesses, Advisors', 'featured' => $featured, 'rating' => 4.6, 'reviews_count' => 12, 'version' => $version,
            'content' => ['key_benefit' => 'Instant, licensed, human-reviewed content.', 'languages' => $featured ? ['EN', 'AF'] : ['EN']],
        ];
    }

    private static function subscription(string $slug, string $code, string $sprintCode, string $name, int $price, string $period, array $recurrence): array
    {
        return [
            'slug' => $slug, 'code' => $code, 'sprint_code' => $sprintCode, 'name' => $name, 'act' => 'A3', 'vehicle' => 'Subscription', 'vehicle_code' => 'VEH-04',
            'aisle' => 'subscriptions-intelligence', 'subcategory' => 'regulatory-bulletins', 'icon' => 'bell', 'price_zar' => $price, 'price_unit' => $period === 'Weekly' ? 'week' : 'month',
            'floor_zar' => (int) round($price * 0.9), 'delivery' => "Ongoing ({$period})", 'output_format' => 'Bulletin + Alerts', 'buyer_types' => ['businesses', 'advisors'],
            'tagline' => "{$period} {$name} with expert commentary and practical action points.",
            'summary' => "A recurring {$name} service delivered to your portal and inbox every billing period.",
            'recurrence' => $recurrence,
            'variants' => ['plans' => [['key' => 'standard', 'name' => "{$period} Plan", 'zar' => $price, 'includes' => ["{$period} bulletin", 'Archive access', 'Email support', 'Cancel any time']]]],
        ];
    }

    private static function certified(string $at, string $expires): array
    {
        return ['r1' => 'pass', 'r2' => 'pass', 'r3' => 'pass', 'r4' => 'pass', 'r5' => 'pass', 'mandate' => 'captured', 'certified_at' => $at, 'expires_at' => $expires];
    }
}
