<?php

namespace App\Support\Insights;

/**
 * Canonical Industry master register (Industries blueprint 2.1) plus the page
 * content used by the Industry page template (IN-SCR-003) and its variants.
 * Seeded into ins_industries / ins_sub_industries by InsightsSeeder.
 */
class IndustryRegister
{
    /**
     * [number, short code, slug, name, icon, selector blurb, catalogue, class, regulatory, gate, stage, score, owner, target, sprints total, activated, risks, sprint category, keywords, sub-industries]
     */
    public static function industries(): array
    {
        return [
            [1, 'AGR', 'agriculture-agro-industry', 'Agriculture & Agro-Industry', 'wheat', 'Farming, livestock, crops, agro-processing, agri-tech and inputs.', 'deep', 'C1', 'mixed', 'mandatory', 8, 88, 'M. Khumalo', '2026-03-31', 340, 298, 1, 'research-reports', ['agri', 'farm', 'food', 'export'],
                [['AGR01', 'Crop Production', 'Grains, vegetables, fruits, oilseeds, etc.', 'C1 - C4', 142], ['AGR02', 'Livestock & Animal Production', 'Cattle, poultry, dairy, aquaculture, etc.', 'C1 - C4', 118], ['AGR03', 'Agro-Processing & Food Manufacturing', 'Food processing, milling, beverages, packaging.', 'C2 - C5', 96], ['AGR04', 'Agri-Inputs & Supplies', 'Fertilisers, seeds, feed, chemicals.', 'C1 - C3', 0], ['AGR05', 'Agri-Tech & Equipment', 'Farm machinery, irrigation, technology.', 'C1 - C3', 0], ['AGR06', 'Forestry & Fisheries', 'Forestry, timber, fisheries, aquaculture.', 'C1 - C4', 0]]],
            [2, 'RET', 'retail-consumer-commerce', 'Retail & Consumer Commerce', 'shopping-cart', 'Retail trade, e-commerce, wholesale, FMCG, consumer goods and services.', 'deep', 'C0', 'low', 'advisory', 6, 68, 'L. Mokoena', '2026-05-30', 384, 228, 2, 'business-management', ['retail', 'customer', 'market', 'sales'],
                [['RET01', 'Wholesale', 'Wholesale trade and distribution.', 'C0 - C2', 0], ['RET02', 'Retail Stores & Chains', 'Physical retail stores and chains.', 'C0 - C2', 0], ['RET03', 'FMCG & Consumer Goods', 'Fast-moving consumer goods.', 'C0 - C2', 0], ['RET04', 'E-commerce & Digital Retail', 'Online and marketplace retail.', 'C0 - C2', 0]]],
            [3, 'MFG', 'manufacturing-industrial', 'Manufacturing & Industrial', 'factory', 'Manufacturing, assembly, industrial goods, chemicals and components.', 'deep', 'C1', 'mixed', 'mandatory', 7, 86, 'J. Dlamini', '2026-05-15', 468, 401, 1, 'business-management', ['manufactur', 'operation', 'process', 'export'],
                [['MFG01', 'Heavy & Industrial', 'Heavy industry and industrial production.', 'C1 - C4', 0], ['MFG02', 'Light Manufacturing', 'Consumer goods, textiles, plastics and components.', 'C1 - C3', 0], ['MFG03', 'Chemicals & Materials', 'Chemicals, materials and process industries.', 'C2 - C4', 0], ['MFG04', 'Automotive & Components', 'Assembly, parts, service and aftermarket.', 'C1 - C3', 0], ['MFG05', 'Machinery & Equipment', 'Industrial machinery, tools and equipment.', 'C1 - C3', 0]]],
            [4, 'TRN', 'transport-logistics', 'Transport & Logistics', 'truck', 'Freight, logistics, warehousing, supply chain, courier and passenger transport.', 'deep', 'C1', 'mixed', 'advisory', 8, 81, 'S. Mthembu', '2026-02-28', 296, 251, 0, 'business-management', ['logistic', 'transport', 'supply', 'operation'],
                [['TRN01', 'Road Freight', 'Road haulage and freight.', 'C1 - C3', 0], ['TRN02', 'Ports & Maritime', 'Ports, shipping and maritime services.', 'C1 - C4', 0], ['TRN03', 'Warehousing & Distribution', 'Storage, warehousing and distribution.', 'C0 - C2', 0]]],
            [5, 'MIN', 'mining-minerals', 'Mining & Minerals', 'pickaxe', 'Exploration, mining, extraction, minerals processing and metals.', 'deep', 'C2', 'high', 'mandatory', 8, 80, 'P. Naidoo', '2026-01-31', 352, 301, 1, 'project-advisory', ['mining', 'feasibility', 'project', 'esg'],
                [['MIN01', 'Exploration', 'Exploration and resource definition.', 'C2 - C4', 0], ['MIN02', 'Mining Operations', 'Mine development and operations.', 'C2 - C4', 0], ['MIN03', 'Mineral Processing & Beneficiation', 'Processing and beneficiation.', 'C2 - C4', 0], ['MIN04', 'Mining Services & Contractors', 'Contract mining and services.', 'C1 - C3', 0]]],
            [6, 'ENE', 'energy-utilities', 'Energy & Utilities', 'zap', 'Power, oil & gas, renewables, utilities, energy services and infrastructure.', 'below_threshold', 'C2', 'high', 'mandatory', 0, 5, null, '2026-10-31', 0, 0, 2, 'project-advisory', ['energy', 'solar', 'feasibility', 'project'],
                [['ENE01', 'Electricity Generation', 'Power generation.', 'C2 - C4', 0], ['ENE02', 'Renewable Energy', 'Solar, wind and storage.', 'C2 - C4', 0], ['ENE03', 'Water Utilities', 'Water and sanitation utilities.', 'C2 - C4', 0]]],
            [7, 'INF', 'infrastructure-public-projects', 'Infrastructure & Public Projects', 'landmark', 'Infrastructure development, public works, engineering and EPC.', 'deep', 'C2', 'high', 'mandatory', 7, 77, 'T. Molefe', '2026-04-30', 312, 254, 1, 'project-advisory', ['infrastructure', 'ppp', 'feasibility', 'project'],
                [['INF01', 'Transport Infrastructure', 'Roads, rail and airports.', 'C2 - C4', 0], ['INF02', 'Water & Sanitation Infrastructure', 'Bulk water and sanitation.', 'C2 - C4', 0], ['INF03', 'PPPs & Concessions', 'Public-private partnerships.', 'C2 - C4', 0]]],
            [8, 'PRC', 'property-construction', 'Property & Construction', 'building', 'Real estate, construction, development, facilities and property services.', 'deep', 'C1', 'mixed', 'advisory', 4, 54, 'T. Molefe', '2026-06-30', 372, 132, 3, 'project-advisory', ['property', 'construction', 'feasibility', 'project'],
                [['PRC01', 'Property Development', 'Development and land.', 'C1 - C3', 0], ['PRC02', 'Commercial Real Estate', 'Offices, retail and industrial property.', 'C1 - C3', 0], ['PRC03', 'Construction & Contracting', 'Building and civil contracting.', 'C1 - C4', 0], ['PRC04', 'Facilities Management', 'Facilities and property services.', 'C0 - C2', 0]]],
            [9, 'TOU', 'tourism-hospitality', 'Tourism & Hospitality', 'luggage', 'Travel, hospitality, hotels, restaurants, attractions and leisure.', 'thin', 'C0', 'low', 'advisory', 7, 78, 'N. Dube', '2026-04-15', 196, 152, 1, 'project-advisory', ['tourism', 'hospitality', 'feasibility', 'market'],
                [['TOU01', 'Accommodation', 'Hotels, lodges and guest houses.', 'C0 - C2', 0], ['TOU02', 'Tourism Operators & Travel', 'Tour operators and travel.', 'C0 - C2', 0], ['TOU03', 'Events & Conferences', 'MICE and events.', 'C0 - C2', 0]]],
            [10, 'PRO', 'professional-services', 'Professional Services', 'briefcase', 'Legal, accounting, consulting, management, HR and general professional services.', 'deep', 'C2', 'high', 'mandatory', 8, 84, 'P. Naidoo', '2026-02-15', 420, 371, 0, 'business-management', ['legal', 'advisory', 'consult', 'compliance'],
                [['PRO01', 'Management Consulting & Business Advisory', 'Strategy and management consulting.', 'C0 - C2', 0], ['PRO02', 'Legal', 'Legal services.', 'C2 - C4', 0], ['PRO03', 'Accounting, Audit & Tax', 'Accounting, audit and tax.', 'C2 - C4', 0], ['PRO04', 'HR & Recruitment', 'People services and recruitment.', 'C1 - C3', 0]]],
            [11, 'ICT', 'technology-ict-digital', 'Technology, ICT & Digital', 'cpu', 'Software, IT services, ICT, telecoms, digital platforms and innovation.', 'thin', 'C1', 'mixed', 'advisory', 1, 18, 'R. Isaacs', '2026-09-30', 288, 18, 3, 'technology', ['software', 'digital', 'ICT', 'automation'],
                [['ICT01', 'Software & SaaS', 'Software products and SaaS.', 'C0 - C2', 0], ['ICT02', 'Telecommunications & Connectivity', 'Telecoms and connectivity.', 'C2 - C4', 0], ['ICT03', 'Cybersecurity', 'Security services.', 'C1 - C3', 0], ['ICT04', 'AI, Automation & Data', 'AI, automation and data services.', 'C1 - C3', 0]]],
            [12, 'GOV', 'government-public-sector', 'Government & Public Sector', 'landmark', 'Government departments, state-owned entities and public administration.', 'deep', 'C2', 'mixed', 'mandatory', 7, 74, 'S. Mthembu', '2026-04-30', 264, 205, 1, 'project-advisory', ['public', 'governance', 'institution', 'project'],
                [['GOV01', 'National', 'National departments.', 'C1 - C3', 0], ['GOV02', 'Local / Municipal', 'Municipalities.', 'C1 - C3', 0], ['GOV03', 'SOE / Public Entities', 'State-owned entities.', 'C2 - C4', 0]]],
            [13, 'NGO', 'ngo-social-enterprise-development', 'NGO, Social Enterprise & Development', 'hand-heart', 'NGOs, NPOs, social enterprises, development organisations and donors.', 'deep', 'C1', 'mixed', 'advisory', 7, 79, 'N. Dube', '2026-03-31', 248, 204, 0, 'project-advisory', ['donor', 'impact', 'programme', 'NGO'],
                [['NGO01', 'NPO / NGO', 'Non-profit organisations.', 'C0 - C2', 0], ['NGO02', 'Social Enterprise', 'Social enterprises.', 'C0 - C2', 0], ['NGO03', 'Donor & Development Programme', 'Donor-funded programmes.', 'C1 - C3', 0]]],
            [14, 'EDU', 'education-skills', 'Education & Skills', 'graduation-cap', 'Schools, colleges, training, ed-tech, skills development and education services.', 'deep', 'C1', 'mixed', 'advisory', 7, 76, 'T. Dlamini', '2026-04-30', 236, 190, 1, 'courses-learning', ['education', 'skills', 'training', 'course'],
                [['EDU01', 'Basic Education', 'Schools.', 'C1 - C3', 0], ['EDU02', 'Higher Education', 'Universities and colleges.', 'C1 - C3', 0], ['EDU03', 'EdTech & E-learning', 'Digital learning.', 'C0 - C2', 0]]],
            [15, 'HLT', 'health-pharmaceuticals', 'Health & Pharmaceuticals', 'stethoscope', 'Healthcare, providers, hospitals, pharma, medical devices and wellness.', 'deep', 'C3', 'high', 'mandatory', 3, 46, 'N. Dube', '2026-07-31', 316, 98, 3, 'due-diligence', ['health', 'compliance', 'risk', 'audit'],
                [['HLT01', 'Hospitals & Clinics', 'Hospitals and clinics.', 'C2 - C4', 0], ['HLT02', 'Pharmaceuticals', 'Pharmaceutical manufacturing and distribution.', 'C3 - C4', 0], ['HLT03', 'Medical Devices & Diagnostics', 'Devices and diagnostics.', 'C3 - C4', 0]]],
            [16, 'CME', 'creative-media-entertainment', 'Creative, Media & Entertainment', 'clapperboard', 'Media, advertising, design, content, entertainment and creative services.', 'below_threshold', 'C1', 'mixed', 'advisory', 2, 32, 'M. Khumalo', '2026-08-31', 160, 18, 2, 'business-management', ['media', 'creative', 'brand', 'marketing'],
                [['CME01', 'Advertising & Communications', 'Agencies and communications.', 'C0 - C2', 0], ['CME02', 'Film, TV & Production', 'Production.', 'C1 - C3', 0], ['CME03', 'Sports', 'Sports management.', 'C1 - C3', 0]]],
            [17, 'FIN', 'financial-services', 'Financial Services', 'banknote', 'Banking, insurance, investments, fintech, financial markets and related services.', 'deep', 'C3', 'high', 'mandatory', 8, 92, 'P. Naidoo', '2026-04-30', 512, 492, 0, 'research-reports', ['financ', 'bank', 'investment', 'capital'],
                [['FIN01', 'Banking & Credit', 'Banks and lenders.', 'C3 - C4', 0], ['FIN02', 'Insurance', 'Insurers and brokers.', 'C3 - C4', 0], ['FIN03', 'Investment & Asset Management', 'Asset managers.', 'C3 - C4', 0], ['FIN04', 'Payments & Fintech', 'Payments and fintech.', 'C2 - C4', 0]]],
        ];
    }

    /** Industry page content (profile JSON). Detailed for the mockup instances, derived for the rest. */
    public static function profile(string $slug, string $name, array $subs, string $catalogue): array
    {
        $base = [
            'tagline' => "Sector-adapted diagnostics, intelligence and professional-route advisory for {$name}.",
            'intro' => "We help {$name} organisations strengthen performance, unlock markets, secure investment and build resilient businesses across Africa.",
            'kpis' => ['opportunity' => 61.4, 'opportunityLabel' => 'Moderate Opportunity', 'projects' => 64, 'mandates' => 48, 'institutions' => 40, 'freshness' => 'Updated 4 days ago', 'nextUpdate' => '18 Aug 2026', 'confidence' => 'High'],
            'services' => [
                ['title' => 'Market Assessment & Entry', 'text' => 'Size demand, test entry routes and prioritise markets.', 'icon' => 'globe'],
                ['title' => 'Investment Readiness & Packaging', 'text' => 'Prepare bankable, investable projects and businesses.', 'icon' => 'trending-up'],
                ['title' => 'Financing & Capital Advisory', 'text' => 'Access debt, equity and blended finance.', 'icon' => 'circle-dollar-sign'],
                ['title' => 'Operations & Productivity', 'text' => 'Lean operations, cost control and efficiency.', 'icon' => 'settings'],
                ['title' => 'Sustainability & ESG Advisory', 'text' => 'Build climate-smart, sustainable operations.', 'icon' => 'leaf'],
                ['title' => 'Technology & Innovation Advisory', 'text' => 'Adopt digital, data and automation solutions.', 'icon' => 'cpu'],
            ],
            'diagnostics' => [
                ['title' => "{$name} Readiness Diagnostic", 'text' => 'Assess readiness to grow and scale.', 'minutes' => 20, 'popular' => true],
                ['title' => 'Market Access Diagnostic', 'text' => 'Evaluate market readiness and barriers.', 'minutes' => 18],
                ['title' => 'ESG & Sustainability Diagnostic', 'text' => 'Measure sustainability and ESG maturity.', 'minutes' => 25],
                ['title' => 'Investment Attractiveness Diagnostic', 'text' => 'Score your investment readiness.', 'minutes' => 20],
            ],
            'brief' => ['title' => "{$name} Brief", 'regions' => 'North, South, East, West, Central Africa', 'updated' => 'Updated 4 days ago', 'pages' => 28, 'price' => 950, 'summary' => 'Trends, opportunities, risks, trade flows, investment themes and policy signals.'],
            'opportunities' => collect($subs)->take(6)->map(fn ($s) => ['title' => $s[1], 'text' => $s[2]])->values()->all(),
            'can' => ['Provide industry-specific diagnostics', 'Share relevant intelligence and benchmarks when released', 'Connect you with qualified partners', 'Support project packaging and investment readiness'],
            'cannot' => [],
            'caseStudy' => null,
        ];

        $overrides = [
            'agriculture-agro-industry' => [
                'tagline' => 'From farm to market. From inputs to processing. From local value chains to global demand.',
                'intro' => 'We help agriculture and agro-businesses strengthen productivity, unlock markets, secure investment and build resilient, sustainable agri-value chains across Africa.',
                'kpis' => ['opportunity' => 68.1, 'opportunityLabel' => 'High Opportunity', 'projects' => 142, 'mandates' => 186, 'institutions' => 98, 'freshness' => 'Updated 3 days ago', 'nextUpdate' => '15 Aug 2026', 'confidence' => 'High'],
                'services' => [
                    ['title' => 'Market Access & Export Development', 'text' => 'Find buyers, open markets and grow exports.', 'icon' => 'globe'],
                    ['title' => 'Agri-Value Chain Development', 'text' => 'Improve productivity, reduce losses, increase value.', 'icon' => 'link'],
                    ['title' => 'Investment Readiness & Packaging', 'text' => 'Prepare bankable, investable agri-projects.', 'icon' => 'trending-up'],
                    ['title' => 'Financing & Capital Advisory', 'text' => 'Access debt, equity and blended finance.', 'icon' => 'circle-dollar-sign'],
                    ['title' => 'Sustainability & ESG Advisory', 'text' => 'Build climate-smart, sustainable agri-businesses.', 'icon' => 'leaf'],
                    ['title' => 'Technology & Innovation Advisory', 'text' => 'Adopt agri-tech, digital and smart farming solutions.', 'icon' => 'cpu'],
                ],
                'diagnostics' => [
                    ['title' => 'Agri-Business Readiness Diagnostic', 'text' => 'Assess readiness to grow and scale.', 'minutes' => 20, 'popular' => true],
                    ['title' => 'Market Access Diagnostic', 'text' => 'Evaluate export readiness and barriers.', 'minutes' => 18],
                    ['title' => 'ESG & Sustainability Diagnostic', 'text' => 'Measure sustainability and ESG maturity.', 'minutes' => 25],
                    ['title' => 'Value Chain Maturity Diagnostic', 'text' => 'Assess efficiency across your value chain.', 'minutes' => 22],
                    ['title' => 'Investment Attractiveness Diagnostic', 'text' => 'Score your investment readiness.', 'minutes' => 20],
                ],
                'brief' => ['title' => 'Agriculture & Agro-Industry Brief', 'regions' => 'North, South, East, West, Central Africa', 'updated' => 'Updated 3 days ago', 'pages' => 32, 'price' => 950, 'summary' => 'Trends, opportunities, risks, trade flows, investment themes and policy signals.'],
                'opportunities' => [
                    ['title' => 'High-Yield Crops', 'text' => 'Rising demand for maize, wheat, soybeans, pulses and oilseeds.'],
                    ['title' => 'Agri-Processing', 'text' => 'Value addition in milling, oils, sugars, meats and dairy.'],
                    ['title' => 'Irrigation & Water Solutions', 'text' => 'Smart irrigation, water storage and climate-resilient farming.'],
                    ['title' => 'Agri-Technology', 'text' => 'Precision agriculture, drones, IoT and digital platforms.'],
                    ['title' => 'Logistics & Cold Chain', 'text' => 'Post-harvest handling, storage, transport and export logistics.'],
                    ['title' => 'Blended Finance', 'text' => 'Access concessional and commercial capital for growth.'],
                ],
                'caseStudy' => ['title' => 'Export readiness for a Limpopo citrus packhouse', 'text' => 'Sector-adapted diagnostic and partner route cut certification lead time by 6 weeks.'],
            ],
            'manufacturing-industrial' => [
                'tagline' => "Strengthening Africa's industrial base through innovation, efficiency, value addition and global competitiveness.",
                'kpis' => ['opportunity' => 76.8, 'opportunityLabel' => 'High Opportunity', 'projects' => 214, 'mandates' => 162, 'institutions' => 126, 'freshness' => 'Updated 2 days ago', 'nextUpdate' => '16 Aug 2026', 'confidence' => 'High'],
                'services' => [
                    ['title' => 'Market Access & Exports', 'text' => 'Find buyers, open markets and scale exports.', 'icon' => 'globe'],
                    ['title' => 'Industrial Strategy & Capability', 'text' => 'Build competitive, efficient and resilient industries.', 'icon' => 'factory'],
                    ['title' => 'Investment Readiness & Site Selection', 'text' => 'Prepare bankable, investable projects.', 'icon' => 'trending-up'],
                    ['title' => 'Supply Chain & Value Chain', 'text' => 'Improve sourcing, suppliers and logistics.', 'icon' => 'link'],
                    ['title' => 'Operations & Productivity', 'text' => 'Lean, automation, digital, cost control.', 'icon' => 'settings'],
                    ['title' => 'Finance & Incentives', 'text' => 'Access funding, incentives and grants.', 'icon' => 'circle-dollar-sign'],
                ],
                'brief' => ['title' => 'Manufacturing & Industrial Brief', 'regions' => 'North, South, East, West, Central Africa', 'updated' => 'Updated 2 days ago', 'pages' => 38, 'price' => 950, 'summary' => 'Cross-border trade flows, sector trends, demand outlook, risks and opportunities.'],
                'opportunities' => [
                    ['title' => 'Agri-Processing', 'text' => 'High demand for food processing and packaging.'],
                    ['title' => 'Light Manufacturing', 'text' => 'Consumer goods, textiles, plastics and components.'],
                    ['title' => 'Industrial Inputs', 'text' => 'Chemicals, metals, packaging materials, industrial supplies.'],
                    ['title' => 'Automotive & Components', 'text' => 'Assembly, parts, service and aftermarket.'],
                    ['title' => 'Machinery & Equipment', 'text' => 'Industrial machinery, tools and equipment.'],
                    ['title' => 'Export Orientation', 'text' => 'Regional and global export growth opportunities.'],
                ],
            ],
            'tourism-hospitality' => [
                'tagline' => "Unlocking Africa's tourism potential through destination development, visitor experience and investment.",
                'kpis' => ['opportunity' => 57.8, 'opportunityLabel' => 'Moderate Opportunity', 'projects' => 28, 'mandates' => 14, 'institutions' => 16, 'freshness' => 'Updated 6 days ago', 'nextUpdate' => '20 Aug 2026', 'confidence' => 'Medium'],
                'services' => [
                    ['title' => 'Market Assessment (South Africa)', 'text' => 'Destination and market intelligence overview.', 'icon' => 'globe'],
                    ['title' => 'Tourism Opportunity Scan', 'text' => 'Identify priority segments and opportunities.', 'icon' => 'search'],
                    ['title' => 'Feasibility Scoping', 'text' => 'High-level feasibility and concept screening.', 'icon' => 'clipboard-check'],
                    ['title' => 'Investor Introduction Support', 'text' => 'Connect with relevant investors and partners.', 'icon' => 'users'],
                    ['title' => 'Project Packaging (Basic)', 'text' => 'Support with concept and investment summary.', 'icon' => 'package'],
                ],
                'brief' => ['title' => 'Tourism & Hospitality Brief', 'regions' => 'North, South, East, West, Central Africa', 'updated' => 'Updated 6 days ago', 'pages' => 22, 'price' => 750, 'summary' => 'Trends, visitor demand, destinations, investment themes and policy signals.'],
                'opportunities' => [
                    ['title' => 'Eco & Nature', 'text' => 'Tourism grown in protected and natural areas.'],
                    ['title' => 'Business & MICE', 'text' => 'Conferences, events, business travel and incentives.'],
                    ['title' => 'Hospitality', 'text' => 'Hotels, resorts, lodges and guest experiences.'],
                    ['title' => 'Cultural & Heritage', 'text' => 'Heritage sites, cultural tourism and experiential travel.'],
                    ['title' => 'Adventure', 'text' => 'Adventure tourism and activity-based travel.'],
                ],
            ],
            'financial-services' => [
                'tagline' => "Strengthening Africa's financial systems through innovation, inclusion, prudence and regulatory compliance.",
                'kpis' => ['opportunity' => 63.7, 'opportunityLabel' => 'High Opportunity', 'projects' => 86, 'mandates' => 58, 'institutions' => 72, 'freshness' => 'Updated 3 days ago', 'nextUpdate' => '17 Aug 2026', 'confidence' => 'High'],
                'services' => [
                    ['title' => 'Banking & Financial Institutions', 'text' => 'Regulated advisory and compliance support.', 'icon' => 'landmark', 'regulated' => true],
                    ['title' => 'Insurance & Risk Services', 'text' => 'Risk, underwriting and regulatory support.', 'icon' => 'shield', 'regulated' => true],
                    ['title' => 'Capital Markets & Investment Services', 'text' => 'Markets advisory and capital raising support.', 'icon' => 'trending-up', 'regulated' => true],
                    ['title' => 'Fintech & Digital Finance', 'text' => 'Digital financial services and innovation.', 'icon' => 'cpu', 'regulated' => true],
                    ['title' => 'Compliance & Regulatory Advisory', 'text' => 'Regulatory compliance and governance.', 'icon' => 'scale', 'regulated' => true],
                ],
                'brief' => ['title' => 'Financial Services Brief', 'regions' => 'North, South, East, West, Central Africa', 'updated' => 'Updated 2 days ago', 'pages' => 46, 'price' => 1250, 'summary' => 'Financial stability, regulation, fintech trends, inclusion, and investment themes.'],
                'opportunities' => [
                    ['title' => 'Digital Banking', 'text' => 'Expanding access and digital experiences.'],
                    ['title' => 'Fintech Innovation', 'text' => 'Payments, lending, wealth, insurtech and regtech.'],
                    ['title' => 'SME Finance', 'text' => 'Credit, working capital and trade finance.'],
                    ['title' => 'Insurance Growth', 'text' => 'Life, health, property and microinsurance.'],
                    ['title' => 'ESG & Green Finance', 'text' => 'Sustainable finance and impact.'],
                ],
            ],
            'creative-media-entertainment' => [
                'tagline' => 'From creative production to media distribution and digital content, this industry powers culture, storytelling, and the creative economy across Africa.',
                'can' => ['Industry Diagnostics', 'Sector Intelligence (AIIM)', 'Partner Introduction', 'Project Exploration'],
                'cannot' => ['Full service catalogue not live.', 'No industry-specific subscriptions.', 'No benchmark contribution yet.', 'No regulated outputs released.', 'Some services require capacity build.'],
                'tiles' => ['approvedServices' => 18, 'diagnostics' => 2, 'professionalRoutes' => 4, 'leadTime' => 'Varies', 'evidence' => 'Moderate'],
            ],
            'energy-utilities' => [
                'can' => ['Industry Diagnostics', 'Sector Intelligence (AIIM)', 'Partner Introduction', 'Project Exploration'],
                'cannot' => ['Full service catalogue not live.', 'No industry-specific subscriptions.', 'No benchmark contribution yet.', 'No regulated outputs released.', 'Licensing and grid-connection scopes require specialist routes.'],
                'tiles' => ['approvedServices' => 9, 'diagnostics' => 1, 'professionalRoutes' => 3, 'leadTime' => 'Varies', 'evidence' => 'High'],
            ],
        ];

        $profile = array_replace($base, $overrides[$slug] ?? []);

        if ($catalogue === 'below_threshold' && empty($profile['cannot'])) {
            $profile['cannot'] = ['Full service catalogue not live.', 'No industry-specific subscriptions.', 'No benchmark contribution yet.', 'No regulated outputs released.'];
        }

        return $profile;
    }

    /** Partner categories shown on the sector partner directory (IN-SCR-010). */
    public static function partnerCategories(): array
    {
        return [
            ['name' => 'Accounting & Auditing', 'count' => 18, 'text' => 'Financial reporting, audits, assurance', 'icon' => 'calculator'],
            ['name' => 'Tax Advisory', 'count' => 16, 'text' => 'Tax planning, compliance, advisory', 'icon' => 'percent'],
            ['name' => 'Legal Services', 'count' => 22, 'text' => 'Commercial, contracts, regulatory', 'icon' => 'scale'],
            ['name' => 'Sector Advisory', 'count' => 28, 'text' => 'Production, operations, compliance', 'icon' => 'leaf'],
            ['name' => 'Environmental Services', 'count' => 15, 'text' => 'Environmental impact, permitting', 'icon' => 'sprout'],
            ['name' => 'Engineering & Technical', 'count' => 17, 'text' => 'Infrastructure, systems, engineering', 'icon' => 'settings'],
            ['name' => 'Food Safety & Quality', 'count' => 12, 'text' => 'HACCP, ISO 22000, quality systems', 'icon' => 'shield-check'],
            ['name' => 'Supply Chain & Logistics', 'count' => 14, 'text' => 'Logistics, warehousing, distribution', 'icon' => 'truck'],
            ['name' => 'Finance & Funding', 'count' => 19, 'text' => 'Finance advisory, funding, grants', 'icon' => 'landmark'],
            ['name' => 'Insurance & Risk', 'count' => 11, 'text' => 'Insurance, risk management', 'icon' => 'umbrella'],
            ['name' => 'Research & Development', 'count' => 10, 'text' => 'R&D, innovation, testing', 'icon' => 'flask-conical'],
            ['name' => 'Technology & Digital', 'count' => 13, 'text' => 'Digital tools, data and transformation', 'icon' => 'monitor'],
        ];
    }

    /** Country intersection content (IN-SCR-009). Keyed by country slug. */
    public static function countries(): array
    {
        return [
            'south-africa' => ['name' => 'South Africa', 'code' => 'ZA', 'phase' => 'Phase 1', 'status' => 'Active'],
            'egypt' => ['name' => 'Egypt', 'code' => 'EG', 'phase' => 'Selected Africa', 'status' => 'Active'],
            'kenya' => ['name' => 'Kenya', 'code' => 'KE', 'phase' => 'Pan-African Next', 'status' => 'Scheduled'],
            'nigeria' => ['name' => 'Nigeria', 'code' => 'NG', 'phase' => 'Pan-African Next', 'status' => 'Scheduled'],
        ];
    }
}
