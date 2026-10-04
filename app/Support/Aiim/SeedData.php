<?php

namespace App\Support\Aiim;

/**
 * Catalogue content for AIIM, transcribed from the AIIM mockups (synthetic data).
 * Used by Database\Seeders\Sections\AiimSeeder and by feature tests.
 */
class SeedData
{
    public static function provinces(): array
    {
        $glance = fn (string $pop, string $gdp, string $growth, string $fdi, string $export, string $ease, string $gci) => [
            ['label' => 'Population (2024)', 'value' => $pop, 'icon' => 'users'],
            ['label' => 'GDP (Nominal, 2024)', 'value' => $gdp, 'icon' => 'landmark'],
            ['label' => 'GDP Growth (2024)', 'value' => $growth, 'icon' => 'trending-up'],
            ['label' => 'FDI Inflows (2023)', 'value' => $fdi, 'icon' => 'banknote'],
            ['label' => 'Top Export Sector', 'value' => $export, 'icon' => 'ship'],
            ['label' => 'Ease of Doing Business Rank (SA)', 'value' => $ease, 'icon' => 'briefcase'],
            ['label' => 'Global Competitiveness Rank', 'value' => $gci, 'icon' => 'globe'],
        ];
        $evidence = fn (string $updated, int $conf) => ['updated' => $updated, 'confidence' => $conf, 'verification' => 'Human-Reviewed', 'sources' => 'Stats SA, QLFS Q1 2025, SARB'];

        return [
            [
                'slug' => 'gauteng', 'name' => 'Gauteng', 'code' => 'GP', 'score' => 81.2,
                'tagline' => "South Africa's economic powerhouse and innovation hub",
                'glance' => $glance('15.4M', 'R 2.7 Trillion', '1.2%', 'R 72.4 Billion', 'Metals & Machinery', '1 / 9', '52 / 67'),
                'kpis' => ['opportunities' => 298, 'projects' => 142, 'investors' => 186, 'funders' => 98, 'corridors' => 6, 'sectors' => 7, 'risk' => 'Moderate'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 34.1, 'display' => '34.1%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 18.7, 'display' => '18.7%'],
                    ['label' => 'Services Contribution', 'value' => 71.3, 'display' => '71.3%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 32.4, 'display' => '32.4%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 76.5, 'display' => '76.5 /100'],
                ],
                'key_sectors' => ['ict-digital-services', 'financial-services', 'transport-logistics', 'manufacturing', 'energy'],
                'evidence' => $evidence('6 May 2025', 72),
            ],
            [
                'slug' => 'western-cape', 'name' => 'Western Cape', 'code' => 'WC', 'score' => 78.6,
                'tagline' => 'Tourism, agri-exports and the continent’s leading tech-startup cluster',
                'glance' => $glance('7.4M', 'R 1.1 Trillion', '1.4%', 'R 31.2 Billion', 'Agri-Food & Wine', '2 / 9', '55 / 67'),
                'kpis' => ['opportunities' => 214, 'projects' => 96, 'investors' => 142, 'funders' => 71, 'corridors' => 4, 'sectors' => 6, 'risk' => 'Low-Moderate'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 13.9, 'display' => '13.9%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 15.2, 'display' => '15.2%'],
                    ['label' => 'Services Contribution', 'value' => 74.1, 'display' => '74.1%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 21.1, 'display' => '21.1%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 79.0, 'display' => '79.0 /100'],
                ],
                'key_sectors' => ['agriculture-agro-processing', 'tourism-hospitality', 'ict-digital-services', 'renewable-energy'],
                'evidence' => $evidence('8 May 2025', 74),
            ],
            [
                'slug' => 'kwazulu-natal', 'name' => 'KwaZulu-Natal', 'code' => 'KZN', 'score' => 73.4,
                'tagline' => 'Port-led logistics, manufacturing and agro-processing gateway',
                'glance' => $glance('12.4M', 'R 1.0 Trillion', '0.9%', 'R 18.6 Billion', 'Automotive & Chemicals', '4 / 9', '61 / 67'),
                'kpis' => ['opportunities' => 176, 'projects' => 81, 'investors' => 94, 'funders' => 63, 'corridors' => 5, 'sectors' => 6, 'risk' => 'Moderate'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 16.0, 'display' => '16.0%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 20.3, 'display' => '20.3%'],
                    ['label' => 'Services Contribution', 'value' => 64.8, 'display' => '64.8%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 30.2, 'display' => '30.2%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 71.2, 'display' => '71.2 /100'],
                ],
                'key_sectors' => ['transport-logistics', 'manufacturing', 'agriculture-agro-processing', 'tourism-hospitality'],
                'evidence' => $evidence('7 May 2025', 70),
            ],
            [
                'slug' => 'mpumalanga', 'name' => 'Mpumalanga', 'code' => 'MP', 'score' => 69.8,
                'tagline' => 'Energy transition, mining and agriculture heartland',
                'glance' => $glance('5.1M', 'R 0.5 Trillion', '0.7%', 'R 9.4 Billion', 'Coal & Ferro-alloys', '6 / 9', '63 / 67'),
                'kpis' => ['opportunities' => 102, 'projects' => 47, 'investors' => 58, 'funders' => 44, 'corridors' => 3, 'sectors' => 5, 'risk' => 'Moderate'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 7.4, 'display' => '7.4%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 13.1, 'display' => '13.1%'],
                    ['label' => 'Services Contribution', 'value' => 52.0, 'display' => '52.0%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 36.3, 'display' => '36.3%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 64.0, 'display' => '64.0 /100'],
                ],
                'key_sectors' => ['energy', 'mining-minerals', 'agriculture-agro-processing', 'green-economy'],
                'evidence' => $evidence('5 May 2025', 68),
            ],
            [
                'slug' => 'free-state', 'name' => 'Free State', 'code' => 'FS', 'score' => 66.1,
                'tagline' => 'Grain basket, solar corridor and logistics crossroads',
                'glance' => $glance('3.0M', 'R 0.3 Trillion', '0.4%', 'R 4.1 Billion', 'Grains & Gold', '7 / 9', '64 / 67'),
                'kpis' => ['opportunities' => 74, 'projects' => 33, 'investors' => 39, 'funders' => 31, 'corridors' => 2, 'sectors' => 4, 'risk' => 'Moderate'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 5.0, 'display' => '5.0%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 11.0, 'display' => '11.0%'],
                    ['label' => 'Services Contribution', 'value' => 58.4, 'display' => '58.4%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 34.9, 'display' => '34.9%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 61.0, 'display' => '61.0 /100'],
                ],
                'key_sectors' => ['agriculture-agro-processing', 'renewable-energy', 'mining-minerals'],
                'evidence' => $evidence('5 May 2025', 66),
            ],
            [
                'slug' => 'limpopo', 'name' => 'Limpopo', 'code' => 'LP', 'score' => 62.7,
                'tagline' => 'Critical minerals, SEZ manufacturing and cross-border trade',
                'glance' => $glance('6.6M', 'R 0.4 Trillion', '0.5%', 'R 6.2 Billion', 'Platinum Group Metals', '8 / 9', '65 / 67'),
                'kpis' => ['opportunities' => 69, 'projects' => 31, 'investors' => 36, 'funders' => 29, 'corridors' => 2, 'sectors' => 4, 'risk' => 'Elevated'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 7.0, 'display' => '7.0%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 6.2, 'display' => '6.2%'],
                    ['label' => 'Services Contribution', 'value' => 49.5, 'display' => '49.5%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 33.1, 'display' => '33.1%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 58.0, 'display' => '58.0 /100'],
                ],
                'key_sectors' => ['mining-minerals', 'agriculture-agro-processing', 'tourism-hospitality'],
                'evidence' => $evidence('4 May 2025', 64),
            ],
            [
                'slug' => 'north-west', 'name' => 'North West', 'code' => 'NW', 'score' => 60.4,
                'tagline' => 'Platinum belt with agro-processing and tourism upside',
                'glance' => $glance('4.1M', 'R 0.35 Trillion', '0.3%', 'R 3.8 Billion', 'Platinum & Chrome', '9 / 9', '66 / 67'),
                'kpis' => ['opportunities' => 58, 'projects' => 26, 'investors' => 30, 'funders' => 24, 'corridors' => 2, 'sectors' => 4, 'risk' => 'Elevated'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 6.0, 'display' => '6.0%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 5.4, 'display' => '5.4%'],
                    ['label' => 'Services Contribution', 'value' => 47.0, 'display' => '47.0%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 38.0, 'display' => '38.0%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 57.0, 'display' => '57.0 /100'],
                ],
                'key_sectors' => ['mining-minerals', 'agriculture-agro-processing', 'tourism-hospitality'],
                'evidence' => $evidence('4 May 2025', 63),
            ],
            [
                'slug' => 'eastern-cape', 'name' => 'Eastern Cape', 'code' => 'EC', 'score' => 58.3,
                'tagline' => 'Automotive cluster, SEZs and a world-class wind resource',
                'glance' => $glance('7.2M', 'R 0.5 Trillion', '0.6%', 'R 8.7 Billion', 'Automotive', '5 / 9', '62 / 67'),
                'kpis' => ['opportunities' => 121, 'projects' => 54, 'investors' => 61, 'funders' => 47, 'corridors' => 3, 'sectors' => 5, 'risk' => 'Moderate'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 7.6, 'display' => '7.6%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 17.0, 'display' => '17.0%'],
                    ['label' => 'Services Contribution', 'value' => 66.0, 'display' => '66.0%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 41.9, 'display' => '41.9%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 60.5, 'display' => '60.5 /100'],
                ],
                'key_sectors' => ['manufacturing', 'renewable-energy', 'agriculture-agro-processing', 'transport-logistics'],
                'evidence' => $evidence('6 May 2025', 69),
            ],
            [
                'slug' => 'northern-cape', 'name' => 'Northern Cape', 'code' => 'NC', 'score' => 54.6,
                'tagline' => 'Solar and green-hydrogen frontier with iron ore and manganese',
                'glance' => $glance('1.4M', 'R 0.1 Trillion', '0.8%', 'R 12.5 Billion', 'Iron Ore & Manganese', '3 / 9', '60 / 67'),
                'kpis' => ['opportunities' => 87, 'projects' => 39, 'investors' => 47, 'funders' => 38, 'corridors' => 2, 'sectors' => 4, 'risk' => 'Moderate'],
                'economy' => [
                    ['label' => 'GDP Contribution to South Africa', 'value' => 2.1, 'display' => '2.1%'],
                    ['label' => 'Manufacturing Contribution', 'value' => 3.0, 'display' => '3.0%'],
                    ['label' => 'Services Contribution', 'value' => 46.0, 'display' => '46.0%'],
                    ['label' => 'Unemployment Rate (Q1 2025)', 'value' => 27.5, 'display' => '27.5%', 'warn' => true],
                    ['label' => 'Infrastructure Score', 'value' => 55.0, 'display' => '55.0 /100'],
                ],
                'key_sectors' => ['renewable-energy', 'mining-minerals', 'green-economy'],
                'evidence' => $evidence('3 May 2025', 65),
            ],
        ];
    }

    public static function sectors(): array
    {
        $s = fn (string $slug, string $name, string $icon, string $summary, array $scores, array $profile = []) => compact('slug', 'name', 'icon', 'summary', 'scores', 'profile');

        $ictProfile = [
            'tagline' => "Detailed intelligence on Gauteng's leading digital growth sector.",
            'intro' => "Explore market potential, digital infrastructure, investors, active projects, talent availability, and risk context across Gauteng's ICT & Digital Services ecosystem. Intelligence is AI-generated and human-reviewed.",
            'overview' => [
                ['label' => 'Sector Focus', 'text' => 'ICT, software, digital platforms, cloud, data services, cybersecurity, and IT-enabled business services.'],
                ['label' => 'Key Strengths', 'text' => 'Strong digital infrastructure, financial hub proximity, skilled talent base, and innovation ecosystem.'],
                ['label' => 'Demand Drivers', 'text' => 'Digital transformation, cloud adoption, fintech growth, e-commerce, automation, and data-driven services.'],
                ['label' => 'Investment Themes', 'text' => 'Scalable SaaS platforms, AI & automation, cloud & data infrastructure, cybersecurity, and digital BPO.'],
            ],
            'performance' => [['Market Opportunity', 86], ['Investment Readiness', 81], ['Digital Infrastructure', 84], ['Talent Availability', 78], ['Export Potential', 74], ['Innovation Ecosystem', 83]],
            'kpis' => ['projects' => 142, 'investors' => 186, 'funders' => 98, 'useCases' => 24],
            'subsectors' => [['Fintech', 'High'], ['AI & Automation', 'High'], ['Cloud & Data Infrastructure', 'High'], ['Digital Commerce', 'High'], ['Cybersecurity', 'High'], ['Business Process Outsourcing', 'High']],
            'topOpportunities' => [
                ['Fintech Payments Platform Expansion', 'Fintech', 'High Opportunity'],
                ['AI-Powered Customer Analytics Platform', 'AI & Automation', 'High Opportunity'],
                ['Cloud Data Centre Capacity Project', 'Cloud & Infrastructure', 'High Opportunity'],
                ['Cybersecurity Operations Centre (SOC)', 'Cybersecurity', 'Growth Opportunity'],
                ['Digital Commerce Enablement Hub', 'Digital Commerce', 'Growth Opportunity'],
                ['IT Services Delivery & BPO Expansion', 'BPO', 'Growth Opportunity'],
            ],
            'risks' => [['Power reliability & energy resilience', 'High'], ['Digital skills gap & talent retention', 'Medium-High'], ['Licensing & regulatory friction', 'Medium'], ['Cybersecurity exposure & threats', 'High'], ['Infrastructure bottlenecks (last-mile)', 'Medium']],
            'riskLevel' => 'High',
            'evidence' => ['coverage' => 'High', 'confidence' => 86, 'verification' => 'Human-Reviewed', 'refreshed' => '12 May 2025', 'humanReview' => '09 May 2025', 'nextReview' => '26 May 2025', 'updated' => '12 May 2025, 09:30 SAST'],
        ];

        $generic = fn (string $name, int $conf, array $sub, array $risks) => [
            'tagline' => "Province-level intelligence on South Africa's {$name} sector.",
            'intro' => "Market potential, investors, active projects and risk context for {$name}. Intelligence is AI-generated and human-reviewed.",
            'overview' => [
                ['label' => 'Sector Focus', 'text' => implode(', ', $sub).'.'],
                ['label' => 'Key Strengths', 'text' => 'Established value chains, policy support and access to regional markets.'],
                ['label' => 'Demand Drivers', 'text' => 'Domestic demand recovery, export growth under AfCFTA and the energy transition.'],
                ['label' => 'Investment Themes', 'text' => 'Capacity expansion, localisation, productivity technology and green upgrades.'],
            ],
            'performance' => [['Market Opportunity', 76], ['Investment Readiness', 72], ['Infrastructure', 70], ['Talent Availability', 71], ['Export Potential', 74], ['Innovation Ecosystem', 68]],
            'kpis' => ['projects' => 48, 'investors' => 61, 'funders' => 37, 'useCases' => 12],
            'subsectors' => array_map(fn ($x) => [$x, 'High'], $sub),
            'topOpportunities' => [],
            'risks' => $risks,
            'riskLevel' => 'Medium',
            'evidence' => ['coverage' => 'Medium-High', 'confidence' => $conf, 'verification' => 'Human-Reviewed', 'refreshed' => '10 May 2025', 'humanReview' => '07 May 2025', 'nextReview' => '24 May 2025', 'updated' => '10 May 2025, 10:00 SAST'],
        ];

        return [
            $s('ict-digital-services', 'ICT & Digital Services', 'cpu', 'High growth in tech, fintech, AI, cloud, and digital infrastructure.', ['gauteng' => 86.2, 'western-cape' => 84.0, 'kwazulu-natal' => 66.0, 'eastern-cape' => 61.0], $ictProfile),
            $s('financial-services', 'Financial Services', 'landmark', 'Banking, fintech, insurance, capital markets & payments.', ['gauteng' => 81.4, 'western-cape' => 79.0, 'kwazulu-natal' => 63.0], $generic('Financial Services', 84, ['Banking', 'Insurance', 'Capital Markets', 'Payments'], [['Regulatory change', 'Medium'], ['Cyber risk', 'High'], ['Credit cycle', 'Medium']])),
            $s('manufacturing', 'Manufacturing', 'factory', 'Machinery, auto, chemicals, consumer goods & components.', ['gauteng' => 76.8, 'kwazulu-natal' => 74.0, 'eastern-cape' => 72.0, 'western-cape' => 68.0], $generic('Manufacturing', 80, ['Automotive', 'Chemicals', 'Machinery', 'Consumer Goods'], [['Power reliability', 'High'], ['Port & rail logistics', 'Medium-High'], ['Input cost inflation', 'Medium']])),
            $s('energy', 'Energy', 'zap', 'Power, renewable energy, oil & gas, energy services.', ['gauteng' => 72.6, 'mpumalanga' => 74.0, 'northern-cape' => 80.0], $generic('Energy', 82, ['Power Generation', 'Transmission', 'Gas', 'Energy Services'], [['Grid capacity', 'High'], ['Policy timing', 'Medium'], ['Offtake risk', 'Medium']])),
            $s('transport-logistics', 'Transport & Logistics', 'truck', 'Rail, road, ports, warehousing & supply chain solutions.', ['gauteng' => 70.3, 'kwazulu-natal' => 79.0, 'eastern-cape' => 66.0], $generic('Transport & Logistics', 79, ['Ports', 'Rail', 'Warehousing', 'Road Freight'], [['Port congestion', 'High'], ['Rail performance', 'High'], ['Fuel prices', 'Medium']])),
            $s('agriculture-agro-processing', 'Agriculture & Agro-Processing', 'wheat', 'Food production, processing, agribusiness & inputs.', ['gauteng' => 68.1, 'western-cape' => 82.0, 'kwazulu-natal' => 75.0, 'free-state' => 78.0, 'eastern-cape' => 64.0], $generic('Agriculture & Agro-Processing', 78, ['Grains', 'Horticulture', 'Food Processing', 'Agri-inputs'], [['Climate & drought', 'High'], ['Export market access', 'Medium'], ['Water security', 'Medium-High']])),
            $s('mining-minerals', 'Mining & Minerals', 'pickaxe', 'Gold, platinum, coal, industrial minerals & beneficiation.', ['gauteng' => 63.7, 'limpopo' => 79.0, 'north-west' => 77.0, 'northern-cape' => 74.0, 'mpumalanga' => 72.0], $generic('Mining & Minerals', 81, ['PGMs', 'Iron Ore', 'Manganese', 'Beneficiation'], [['Commodity prices', 'Medium-High'], ['Rail export capacity', 'High'], ['Community relations', 'Medium']])),
            $s('tourism-hospitality', 'Tourism & Hospitality', 'briefcase', 'Hotels, leisure, events, tourism services & attractions.', ['gauteng' => 61.2, 'western-cape' => 83.0, 'kwazulu-natal' => 72.0], $generic('Tourism & Hospitality', 76, ['Hotels', 'Events', 'Leisure', 'Eco-tourism'], [['Safety perception', 'Medium-High'], ['Air connectivity', 'Medium'], ['Seasonality', 'Medium']])),
            $s('green-economy', 'Green Economy', 'leaf', 'Clean tech, recycling, water, waste & sustainability.', ['gauteng' => 57.8, 'western-cape' => 71.0, 'northern-cape' => 69.0], $generic('Green Economy', 74, ['Clean Tech', 'Recycling', 'Water', 'Waste'], [['Policy implementation', 'Medium'], ['Financing cost', 'Medium'], ['Market maturity', 'Medium']])),
            $s('renewable-energy', 'Renewable Energy', 'sun', 'Wind, solar PV, storage and green hydrogen.', ['gauteng' => 66.0, 'eastern-cape' => 78.0, 'northern-cape' => 84.0, 'western-cape' => 75.0], $generic('Renewable Energy', 85, ['Wind', 'Solar PV', 'Battery Storage', 'Green Hydrogen'], [['Grid connection', 'High'], ['Procurement timing', 'Medium'], ['Currency exposure', 'Medium']])),
        ];
    }

    public static function sources(): array
    {
        $src = fn (string $code, string $name, string $provider, string $category, string $type, string $coverage, int $tier, string $model, int $conf, string $ver, string $updated, array $profile = []) => [
            'code' => $code, 'name' => $name, 'provider' => $provider, 'category' => $category, 'data_type' => $type, 'coverage' => $coverage,
            'tier' => $tier, 'confidence_model' => $model, 'confidence' => $conf, 'verification_status' => $ver, 'status' => 'active',
            'last_updated' => $updated, 'next_review' => date('Y-m-d', strtotime($updated.' +3 months')), 'profile' => $profile + [
                'frequency' => 'Monthly', 'format' => 'CSV / API', 'licence' => 'Public Domain', 'cost' => 0,
                'points' => ['total' => 156, 'active' => 142, 'flagged' => 3, 'inactive' => 11],
            ],
        ];

        return [
            $src('IMF-WEO-2025-04', 'IMF World Economic Outlook (April 2025)', 'International Monetary Fund (IMF)', 'Development', 'Macroeconomic Forecasts', 'Global', 2, 'CM-02', 93, 'verified', '2025-04-22', [
                'description' => 'Quarterly assessment of global economic prospects by the International Monetary Fund. Includes growth projections, inflation outlook, fiscal balances and external sector analysis.',
                'sourceType' => 'International Organisation', 'published' => 'Apr 2025', 'nextRelease' => 'Jul 2025', 'language' => 'English', 'access' => 'Public', 'use' => 'Analytical & Reference',
                'reliability' => ['score' => 92.5, 'Timeliness' => 94, 'Methodology' => 93, 'Transparency' => 92, 'Independence' => 91, 'Reputation' => 93],
                'summary' => 'The IMF World Economic Outlook (WEO) provides comprehensive analysis and forecasts of global economic trends and risks. The April 2025 update projects global growth to remain steady at 3.2% in 2025, with emerging markets and developing economies driving most of the expansion.',
                'bullets' => ['Global growth forecasts and regional outlooks', 'Inflation projections and monetary policy analysis', 'Fiscal balances and debt sustainability assessments', 'External sector and trade outlook', 'Risks, downside scenarios and policy recommendations'],
                'findings' => [['Global GDP growth forecast', '3.2% in 2025'], ['Advanced economies growth', '1.6%'], ['Emerging & developing economies growth', '4.2%'], ['Global inflation forecast', '4.5%'], ['Global trade growth forecast', '3.0%']],
                'dataPoints' => [['GDP Growth Projections', 12], ['Inflation Projections', 8], ['Fiscal Indicators', 7], ['Trade Indicators', 9], ['Debt & Financial Indicators', 6]],
                'premium' => true, 'url' => 'https://www.imf.org/en/Publications/WEO',
            ]),
            $src('SRC-SA-GOV-001', 'National Treasury Budget Data', 'National Treasury', 'Government', 'Fiscal Data', 'National', 1, 'CM-01', 94, 'verified', '2025-05-12'),
            $src('SRC-SA-STAT-002', 'Stats SA Economic Indicators', 'Statistics South Africa', 'Government', 'Economic Data', 'National', 1, 'CM-01', 92, 'verified', '2025-05-12'),
            $src('SRC-WB-DEV-003', 'World Bank Open Data', 'World Bank', 'Development', 'Development Data', 'Global', 2, 'CM-02', 88, 'verified', '2025-05-11'),
            $src('SRC-AFDB-004', 'AfDB Project Database', 'African Development Bank', 'Development', 'Project Data', 'Africa', 2, 'CM-02', 90, 'verified', '2025-05-11'),
            $src('SRC-IEC-005', 'IEC Election Results', 'Independent Electoral Commission', 'Government', 'Political Data', 'National', 1, 'CM-01', 93, 'verified', '2025-05-10'),
            $src('SRC-NBI-006', 'NBI Sector Reports', 'National Business Initiative', 'Private Sector', 'Market Intelligence', 'National', 3, 'CM-03', 76, 'review', '2025-05-10'),
            $src('SRC-PVT-007', 'Private Trade Dataset', 'Private Data Provider', 'Private Sector', 'Trade Data', 'Regional', 3, 'CM-03', 65, 'review', '2025-05-09', ['licence' => 'Commercial', 'cost' => 1200]),
            $src('SRC-UNI-008', 'University Research Hub', 'University Consortium', 'Research', 'Research Data', 'National', 4, 'CM-04', 74, 'pending', '2025-05-09'),
            $src('SRC-NEWS-009', 'Verified News Feeds', 'Reuters / Bloomberg', 'Media', 'News Data', 'Global', 5, 'CM-05', 68, 'review', '2025-05-08', ['licence' => 'Commercial', 'cost' => 2500]),
            $src('SRC-SOC-010', 'Social Sentiment Index', 'Social Analytics Inc.', 'Analytics', 'Sentiment Data', 'National', 5, 'CM-06', 58, 'pending', '2025-05-08'),
            $src('SRC-IDC-DC-2025', 'IDC Africa, 2025 Data Centres Report', 'IDC Africa', 'Private Sector', 'Market Intelligence', 'Africa', 3, 'CM-03', 82, 'verified', '2025-05-02', ['licence' => 'Commercial']),
            $src('SRC-SARB-011', 'SARB Quarterly Bulletin', 'South African Reserve Bank', 'Government', 'Monetary & Financial Data', 'National', 1, 'CM-01', 95, 'verified', '2025-05-06'),
        ];
    }

    public static function projects(): array
    {
        $compare = fn (string $irr, string $payback, int $risk, int $fit, string $jobs, string $align) => compact('irr', 'payback', 'risk', 'fit', 'jobs', 'align') + ['alignment' => $align];
        $premium = fn (string $title = 'Detailed financial model') => ['title' => $title, 'product_type' => 'Premium Financial Model', 'views' => 10, 'duration_days' => 7, 'preview' => ['Overview and key highlights', 'Location and infrastructure summary', 'Investment size range', 'Opportunity score and risk snapshot'], 'locked' => ['Detailed financial model', 'Feasibility and demand analysis', 'Site plans and technical specifications', 'Sponsor and partner details', 'Full risk assessment and mitigation', 'Downloadable report (PDF)'], 'model' => ['dataSource' => 'Industry Reports, Operator Filings, Market Research', 'modelType' => '10-Year Financial Projection', 'confidence' => 'Medium-High', 'updated' => '4 May 2025']];

        $p = function (string $code, string $slug, string $name, string $summary, string $province, string $sector, string $location, string $type, string $stage, int $min, int $max, float $score, int $conf, string $ver, string $icon, string $added, array $details, string $kind = 'both', ?array $prem = null, string $source = 'SRC-SA-STAT-002') {
            $level = $score >= 80 ? 'High Opportunity' : ($score >= 70 ? 'Medium Opportunity' : 'Emerging Opportunity');

            return [
                'code' => $code, 'slug' => $slug, 'name' => $name, 'kind' => $kind, 'summary' => $summary,
                'province_slug' => $province, 'sector_slug' => $sector, 'location' => $location, 'type' => $type, 'stage' => $stage,
                'size_min_zar' => $min, 'size_max_zar' => $max, 'score' => $score, 'opportunity_level' => $level,
                'confidence' => $conf, 'verification' => $ver, 'source_code' => $source, 'icon' => $icon,
                'added_on' => $added, 'next_review_on' => date('Y-m-d', strtotime($added.' +30 days')),
                'details' => $details, 'premium' => $prem,
            ];
        };

        $dccDetails = [
            'tags' => ['High Opportunity', 'Verified'],
            'subsector' => 'Data Centres & Cloud Infrastructure',
            'sponsor' => 'Private Developer Consortium',
            'metrics' => [
                'Power Capacity' => '40 MW (Expandable)', 'Jobs Potential' => '1,250+', 'Land Size' => '28 ha',
                'IRR (Projected)' => '18.6%', 'IRR band' => '±2.3%', 'NPV (ZAR)' => 'R 1.42B', 'NPV basis' => '@ 12% discount rate',
                'Payback Period' => '6.8', 'Construction Start' => 'Q4 2025',
            ],
            'description' => 'The Gauteng Data Centre Campus is a phased, hyperscale-ready development designed to meet escalating demand for secure, low-latency, and high-availability data infrastructure in South Africa. Strategically located in Midrand, the campus will support cloud providers, AI workloads, fintech platforms, and enterprise digital transformation initiatives across the region. The project includes modular data halls, redundant power infrastructure, and sustainable design for long-term scalability.',
            'projectDescription' => 'A phased, hyperscale-ready data centre campus in Midrand designed to support cloud, AI, fintech, and enterprise workloads across Southern Africa. The campus will deliver Tier III+ data halls, redundant power and cooling, and low-latency connectivity to major exchange points.',
            'highlights' => ['Strong digital demand from cloud, AI, fintech, and enterprises sectors', 'Strategic location with access to Johannesburg business ecosystem', 'Excellent connectivity via fibre, metro network & IX infrastructure', 'Anchor tenant interest from regional and global hyperscalers', 'Sustainable design with renewable power integration and water efficiency'],
            'projectHighlights' => ['Strategic location in Johannesburg digital corridor', 'Access to multiple fiber routes and IX connectivity', 'Reliable power strategy with renewable integration', 'Strong anchor tenant interest and pre-leasing pipeline', 'Supportive regulatory environment & incentives', 'High demand for cloud and AI compute capacity'],
            'funds' => [['Land & Site Development', 10], ['Construction & Civil Works', 35], ['IT Infrastructure & Equipment', 30], ['Power & Cooling Systems', 15], ['Professional & Other Costs', 10]],
            'projectFunds' => [['Land & Site Development', 18], ['Construction & Civil Works', 32], ['IT Infrastructure & Equipment', 28], ['Power & Cooling Systems', 12], ['Professional & Other Costs', 10]],
            'market' => [['Cloud & AI Demand', 'South African cloud market projected to grow at 18% CAGR to 2030.'], ['Fintech Expansion', 'Rapid fintech growth driving demand for secure, local data infrastructure.'], ['Data Localisation', 'Regulatory and enterprise preference for local data residency increasing.'], ['Regional Digital Hub', 'South Africa as a gateway to SADC drives regional infrastructure needs.']],
            'risks' => [['Power supply & grid stability', 'Medium'], ['Construction cost inflation', 'Medium'], ['Tenant concentration', 'Low'], ['Regulatory approvals', 'Low']],
            'esg' => ['Renewable PPA for 60% of load by Year 3', 'Closed-loop cooling to minimise water use', 'Local skills academy for 300 technicians'],
            'stakeholders' => [['Private Developer Consortium', 'Sponsor'], ['City of Johannesburg', 'Municipal approvals'], ['Eskom / City Power', 'Grid connection'], ['DBSA', 'Potential lender']],
            'documents' => [['Teaser (2 pages)', 'Public'], ['Information Memorandum', 'Locked'], ['Financial Model', 'Locked'], ['Site Plan', 'Locked']],
            'compare' => $compare('18% – 22%', '7 – 9 years', 30, 4, '1 200 – 1 800', 'High'),
            'source' => 'IDC Africa, 2025 Data Centres Report',
        ];

        $genericDetails = fn (array $tags, string $desc, array $compareRow, array $highlights = []) => [
            'tags' => $tags,
            'description' => $desc,
            'projectDescription' => $desc,
            'highlights' => $highlights ?: ['Aligned to provincial priority sector strategy', 'Identified sponsor with development track record', 'Access to enabling infrastructure and logistics', 'Eligible for public incentive programmes'],
            'projectHighlights' => $highlights ?: ['Aligned to provincial priority sector strategy', 'Identified sponsor with development track record', 'Access to enabling infrastructure and logistics', 'Eligible for public incentive programmes'],
            'funds' => [['Land & Site Development', 15], ['Construction & Civil Works', 35], ['Equipment & Technology', 30], ['Working Capital', 10], ['Professional & Other Costs', 10]],
            'market' => [['Demand Outlook', 'Sustained domestic and regional demand growth.'], ['Policy Support', 'Programme incentives and enabling regulation.']],
            'risks' => [['Execution', 'Medium'], ['Funding', 'Medium']],
            'compare' => $compareRow,
        ];

        return [
            $p('OPP-GA-DCC-001', 'gauteng-data-centre-campus', 'Gauteng Data Centre Campus', 'Tier III data centre campus to support cloud, AI and enterprise demand.', 'gauteng', 'ict-digital-services', 'Midrand, City of Johannesburg', 'Greenfield Project', 'Feasibility', 2_500_000_000, 4_000_000_000, 92.4, 92, 'human-reviewed', 'server', '2025-05-06', $dccDetails, 'both', $premium(), 'SRC-IDC-DC-2025'),
            $p('OPP-GA-FIH-002', 'fintech-innovation-hub-expansion', 'Fintech Innovation Hub Expansion', 'Expand existing fintech hub with incubators, labs and training facilities.', 'gauteng', 'ict-digital-services', 'Sandton, City of Johannesburg', 'Expansion Project', 'Implementation', 180_000_000, 350_000_000, 88.7, 89, 'source-confirmed', 'smartphone', '2025-05-05', $genericDetails(['High Opportunity', 'Verified'], 'Expansion of an established Sandton fintech hub with incubator floors, testing labs and a skills academy serving banks, insurers and start-ups.', $compare('24% – 30%', '4 – 6 years', 45, 5, '350 – 600', 'High')), 'both', $premium()),
            $p('OPP-GA-SDT-003', 'sizwe-digital-township-connect', 'Sizwe Digital Township Connect', 'High-speed fibre network roll-out in underserved townships across Gauteng.', 'gauteng', 'ict-digital-services', 'Tshwane, Ekurhuleni, West Rand', 'Public Private Partnership', 'Procurement', 450_000_000, 900_000_000, 85.1, 84, 'human-reviewed', 'network', '2025-05-04', $genericDetails(['High Opportunity', 'Human-Reviewed'], 'Open-access fibre network covering 120,000 township households with public Wi-Fi zones and SMME connectivity packages.', $compare('14% – 17%', '6 – 8 years', 40, 4, '900 – 1 400', 'High')), 'both', $premium()),
            $p('OPP-GA-SOC-004', 'cybersecurity-operations-centre', 'Cybersecurity Operations Centre', 'Regional SOC to provide managed security services to enterprises and government.', 'gauteng', 'ict-digital-services', 'Rosebank, City of Johannesburg', 'Greenfield Project', 'Feasibility', 120_000_000, 200_000_000, 78.6, 79, 'source-confirmed', 'shield-check', '2025-05-04', $genericDetails(['Medium Opportunity', 'Verified'], '24/7 security operations centre offering managed detection and response to enterprises and public bodies.', $compare('20% – 25%', '4 – 5 years', 38, 4, '150 – 220', 'High')), 'both', $premium()),
            $p('OPP-GA-AIA-005', 'ai-analytics-solutions-company', 'AI & Analytics Solutions Company', 'Equity investment in a high-growth AI analytics software business.', 'gauteng', 'ict-digital-services', 'Pretoria, City of Tshwane', 'Equity Investment', 'Growth', 60_000_000, 120_000_000, 74.3, 76, 'human-reviewed', 'chart-line', '2025-05-02', $genericDetails(['Medium Opportunity', 'Human-Reviewed'], 'Series B growth round for an AI analytics platform serving retail and financial services customers.', $compare('28% – 35%', '3 – 5 years', 55, 4, '120 – 180', 'Medium')), 'opportunity', $premium()),
            $p('PRJ-GA-GDU-006', 'gautrain-digital-upgrade', 'Gautrain Digital Upgrade', 'System modernisation and smart mobility integration.', 'gauteng', 'transport-logistics', 'Gauteng Province', 'Technology Upgrade', 'Implementation', 102_700_000_000, 102_700_000_000, 85.1, 83, 'human-reviewed', 'train-front', '2025-05-06', $genericDetails(['High Opportunity'], 'Signalling, ticketing and passenger information modernisation with integrated smart-mobility services.', $compare('11% – 14%', '9 – 12 years', 35, 4, '2 000 – 3 500', 'High')), 'project'),
            $p('PRJ-GA-GEX-007', 'gautrain-expansion-phase-2', 'Gautrain Expansion Phase 2', 'Rail network extension connecting new growth nodes.', 'gauteng', 'transport-logistics', 'Johannesburg – Tshwane', 'Infrastructure', 'Feasibility', 30_000_000_000, 45_000_000_000, 86.0, 80, 'human-reviewed', 'train-front', '2025-05-03', $genericDetails(['High Opportunity'], 'Extension of the Gautrain network to Soweto, Fourways and Mamelodi under a PPP model.', $compare('9% – 12%', '12 – 15 years', 50, 4, '10 000+', 'High')), 'project'),
            $p('PRJ-GA-ORT-008', 'or-tambo-logistics-hub', 'OR Tambo Logistics Hub', 'Airport-linked logistics and cargo park.', 'gauteng', 'transport-logistics', 'Ekurhuleni', 'Greenfield Project', 'Procurement', 2_000_000_000, 3_200_000_000, 82.0, 81, 'source-confirmed', 'warehouse', '2025-05-03', $genericDetails(['High Opportunity'], 'Bonded cargo and cold-chain logistics park adjacent to OR Tambo International Airport.', $compare('15% – 18%', '7 – 9 years', 36, 4, '1 500 – 2 200', 'High')), 'project'),
            $p('PRJ-GA-TAC-009', 'tshwane-automotive-city', 'Tshwane Automotive City', 'Automotive supplier park and SEZ expansion.', 'gauteng', 'manufacturing', 'Rosslyn, City of Tshwane', 'Expansion Project', 'Implementation', 4_000_000_000, 6_500_000_000, 79.0, 80, 'human-reviewed', 'car', '2025-05-02', $genericDetails(['High Opportunity'], 'Automotive component supplier park expanding the Rosslyn cluster around OEM plants.', $compare('13% – 16%', '8 – 10 years', 42, 4, '3 000+', 'High')), 'project'),
            $p('PRJ-GA-WRG-010', 'west-rand-green-energy-park', 'West Rand Green Energy Park', 'Solar, storage and green manufacturing park.', 'gauteng', 'energy', 'Randfontein, West Rand', 'Greenfield Project', 'Feasibility', 1_800_000_000, 2_600_000_000, 77.0, 78, 'source-confirmed', 'sun', '2025-05-01', $genericDetails(['High Opportunity'], 'Integrated solar PV, battery storage and green manufacturing park on rehabilitated mining land.', $compare('14% – 17%', '7 – 9 years', 40, 4, '800 – 1 200', 'High')), 'project'),
            $p('PRJ-GA-DID-011', 'digital-innovation-district-jhb', 'Digital Innovation District, JHB', 'Mixed-use innovation district for technology firms.', 'gauteng', 'ict-digital-services', 'Braamfontein, Johannesburg', 'Infrastructure', 'Feasibility', 900_000_000, 1_400_000_000, 76.0, 77, 'human-reviewed', 'building-2', '2025-04-30', $genericDetails(['High Opportunity'], 'Mixed-use innovation district with offices, labs and student housing near Wits University.', $compare('12% – 15%', '8 – 10 years', 44, 3, '1 000+', 'Medium')), 'project'),
            $p('OPP-GA-LTP-012', 'logistics-trade-park-gauteng', 'Logistics & Trade Park', 'Inland port and trade park on the N3 corridor.', 'gauteng', 'transport-logistics', 'Gauteng', 'Greenfield Project', 'Feasibility', 1_200_000_000, 1_900_000_000, 80.0, 70, 'source-confirmed', 'warehouse', '2025-05-05', $genericDetails(['Medium Opportunity'], 'Inland container terminal and trade park linking Gauteng to Durban via the N3 and rail.', $compare('13% – 16%', '7 – 9 years', 41, 4, '900 – 1 300', 'High')), 'opportunity'),
            $p('OPP-NC-GH2-013', 'green-hydrogen-northern-cape', 'Green Hydrogen', 'Export-scale green hydrogen and ammonia production.', 'northern-cape', 'renewable-energy', 'Boegoebaai, Northern Cape', 'Greenfield Project', 'Feasibility', 15_000_000_000, 22_000_000_000, 84.0, 86, 'human-reviewed', 'atom', '2025-05-06', $genericDetails(['High Opportunity', 'Verified'], 'Export-oriented green hydrogen and ammonia hub with dedicated port and renewable generation.', $compare('12% – 16%', '10 – 12 years', 48, 5, '5 000+', 'High')), 'both', $premium()),
            $p('OPP-KZN-AGH-014', 'agri-processing-hub-kzn', 'Agri-Processing Hub', 'Food processing cluster serving export markets.', 'kwazulu-natal', 'agriculture-agro-processing', 'Pietermaritzburg, KwaZulu-Natal', 'Greenfield Project', 'Feasibility', 450_000_000, 700_000_000, 81.0, 74, 'source-confirmed', 'wheat', '2025-05-05', $genericDetails(['High Opportunity'], 'Shared processing, packing and cold-storage facilities for macadamia, citrus and sugar-cane value chains.', $compare('15% – 19%', '6 – 8 years', 38, 4, '1 100 – 1 600', 'High')), 'both', $premium()),
            $p('PRJ-EC-JBW-015', 'jeffreys-bay-wind-farm', 'Jeffreys Bay Wind Farm', 'Utility-scale wind farm with grid connection.', 'eastern-cape', 'renewable-energy', 'Jeffreys Bay, Eastern Cape', 'Greenfield', 'Feasibility', 3_200_000_000, 3_280_000_000, 83.0, 85, 'human-reviewed', 'wind', '2025-05-06', $genericDetails(['High Opportunity'], '150 MW wind farm sponsored by Coega Green Energy (Pty) Ltd with an estimated CAPEX of ZAR 3.28 billion.', $compare('14% – 18%', '8 – 10 years', 36, 5, '450 – 700', 'High')), 'both', $premium()),
            $p('PRJ-EC-CGH-016', 'coega-green-hydrogen-hub', 'Coega Green Hydrogen Hub', 'Green hydrogen production in the Coega SEZ.', 'eastern-cape', 'renewable-energy', 'Coega SEZ, Eastern Cape', 'Greenfield Project', 'Feasibility', 8_500_000_000, 8_500_000_000, 81.0, 82, 'source-confirmed', 'atom', '2025-05-05', $genericDetails(['High Opportunity'], 'Electrolyser-based green hydrogen production for export and local industrial users.', $compare('16% – 22%', '9 – 11 years', 50, 5, '1 200+', 'High')), 'project'),
            $p('PRJ-EC-NXS-017', 'solar-pv-nxuba-project', 'Solar PV – Nxuba Project', 'Utility-scale solar PV plant.', 'eastern-cape', 'renewable-energy', 'Nxuba, Eastern Cape', 'Greenfield Project', 'Development', 1_800_000_000, 1_800_000_000, 78.0, 80, 'human-reviewed', 'sun', '2025-05-04', $genericDetails(['Medium Opportunity'], '100 MW solar PV plant bid into REIPPPP Bid Window 7.', $compare('13% – 17%', '7 – 9 years', 32, 4, '300 – 500', 'High')), 'project'),
            $p('PRJ-EC-BSG-018', 'battery-storage-gqeberha', 'Battery Storage – Gqeberha', 'Grid-scale battery energy storage.', 'eastern-cape', 'renewable-energy', 'Gqeberha, Eastern Cape', 'Greenfield Project', 'Development', 2_400_000_000, 2_400_000_000, 76.0, 79, 'source-confirmed', 'battery-charging', '2025-05-03', $genericDetails(['Medium Opportunity'], 'Grid-scale battery energy storage system supporting Nelson Mandela Bay grid stability.', $compare('12% – 16%', '8 – 10 years', 34, 4, '120 – 200', 'High')), 'project'),
            $p('OPP-WC-SBH-019', 'hydrogen-export-saldanha-bay', 'Hydrogen Export Opportunity – Saldanha Bay', 'Green hydrogen export terminal and IDZ expansion.', 'western-cape', 'renewable-energy', 'Saldanha Bay, Western Cape', 'Greenfield Project', 'Feasibility', 6_000_000_000, 9_000_000_000, 80.0, 78, 'source-confirmed', 'ship', '2025-05-07', $genericDetails(['High Opportunity'], 'Export terminal and hydrogen derivatives facility in the Saldanha Bay IDZ.', $compare('12% – 15%', '10 – 12 years', 46, 4, '2 000+', 'High')), 'opportunity', $premium()),
            $p('PRJ-NC-SOL-020', 'northern-cape-solar-park', 'Northern Cape Solar Park', 'Multi-developer solar park with shared grid infrastructure.', 'northern-cape', 'renewable-energy', 'Upington, Northern Cape', 'Infrastructure', 'Development', 5_000_000_000, 7_500_000_000, 82.0, 83, 'human-reviewed', 'sun', '2025-05-06', $genericDetails(['High Opportunity'], 'Shared transmission and multi-developer solar park in the Upington solar corridor.', $compare('13% – 16%', '8 – 10 years', 33, 5, '1 500+', 'High')), 'project'),
            $p('OPP-LP-MMS-021', 'musina-makhado-sez-metals', 'Musina-Makhado SEZ Metals Cluster', 'Energy-metallurgical complex in the SEZ.', 'limpopo', 'mining-minerals', 'Musina, Limpopo', 'Greenfield Project', 'Feasibility', 10_000_000_000, 14_000_000_000, 64.0, 58, 'machine-checked', 'pickaxe', '2025-04-28', $genericDetails(['Emerging Opportunity'], 'Metallurgical complex anchored by Chinese investors in the Musina-Makhado SEZ (low-confidence evidence).', $compare('10% – 14%', '10 – 14 years', 68, 3, '8 000+', 'Medium')), 'opportunity', $premium()),
        ];
    }

    public static function organisations(): array
    {
        $o = fn (string $slug, string $kind, string $name, ?string $short, string $type, string $summary, array $focus, array $stages, array $instruments, ?string $beneficiaries, int $min, int $max, string $location, string $origin, float $score, int $conf, string $added, array $sectors, array $profile = []) => [
            'slug' => $slug, 'kind' => $kind, 'name' => $name, 'short_name' => $short, 'type' => $type, 'summary' => $summary,
            'focus' => $focus, 'stages' => $stages, 'instruments' => $instruments, 'beneficiaries' => $beneficiaries,
            'ticket_min_zar' => $min, 'ticket_max_zar' => $max, 'location' => $location, 'origin' => $origin,
            'match_score' => $score, 'confidence' => $conf, 'verification' => 'human-reviewed', 'added_on' => $added,
            'sector_slugs' => $sectors, 'profile' => $profile,
        ];
        $ict = ['ict-digital-services'];

        return [
            $o('saviu-ventures', 'investor', 'SAVIU Ventures', null, 'Venture Capital', 'Pan-African early-stage VC backing tech entrepreneurs.', ['AI', 'Fintech', 'SaaS', 'Digital Infrastructure'], ['Seed', 'Series A'], ['Equity'], null, 5_000_000, 25_000_000, 'Johannesburg, South Africa', 'South Africa', 95.2, 90, '2025-05-06', $ict, [
                'headline' => 'Pan-African early-stage VC backing tech entrepreneurs building scalable solutions across fintech, SaaS, AI and enterprise software.',
                'founded' => '2018', 'team' => '15 – 25', 'aum' => 'R 1.2B+', 'portfolio' => '32', 'countries' => '8 African Countries',
                'ownership' => '10% – 25%', 'pace' => 'R 200M+', 'stagesLong' => 'Seed, Series A, Growth',
                'about' => 'SAVIU Ventures is a South African venture capital firm that invests in technology startups with the potential to scale across Africa and globally. The firm combines capital, strategic support, and an extensive network to help founders build market-leading companies.',
                'bullets' => ['Focus on disruptive technologies and resilient business models', 'Hands-on support in growth, go-to-market and scaling', 'Strong network across corporates, investors and operators'],
                'website' => 'www.saviu.vc',
                'focusAreas' => ['Fintech & Digital Payments', 'Enterprise SaaS', 'Artificial Intelligence & ML', 'Cloud & Infrastructure', 'Cybersecurity', 'E-commerce & Marketplaces'],
                'geo' => ['primary' => 'South Africa', 'secondary' => 'Kenya, Nigeria, Ghana, Rwanda', 'active' => '8 African Countries'],
                'allocation' => [['Fintech', 32], ['Enterprise SaaS', 26], ['AI & Data', 18], ['Cloud & Infra', 12], ['Cybersecurity', 6], ['Other', 6]],
                'compare' => ['irr' => '25% – 35%', 'payback' => '5 – 7 years', 'risk' => 52, 'fit' => 5, 'jobs' => 'N/A', 'alignment' => 'High'],
            ]),
            $o('naspers-ventures', 'investor', 'Naspers Ventures', null, 'Corporate Investor', 'Global internet group investing in disruptive tech businesses.', ['E-commerce', 'AI', 'Marketplaces', 'SaaS'], ['Series A', 'Growth'], ['Equity'], null, 10_000_000, 200_000_000, 'Cape Town, South Africa', 'South Africa', 93.1, 88, '2025-05-05', $ict, ['ticket_plus' => true, 'headline' => 'Corporate venture arm investing in South African technology companies with global potential.', 'founded' => '2019', 'team' => '20 – 30', 'aum' => 'R 1.4B', 'portfolio' => '18', 'countries' => '3 African Countries', 'ownership' => '10% – 30%', 'pace' => 'R 300M+', 'stagesLong' => 'Series A, Growth', 'compare' => ['irr' => '20% – 30%', 'payback' => '5 – 7 years', 'risk' => 45, 'fit' => 4, 'jobs' => 'N/A', 'alignment' => 'High']]),
            $o('idc-venture-capital', 'investor', 'IDC Venture Capital', null, 'DFI', "South Africa's DFI supporting innovation and growth.", ['Technology', 'Innovation', 'Digital Economy'], ['Seed', 'Growth'], ['Equity', 'Quasi-equity'], null, 2_000_000, 50_000_000, 'Sandton, South Africa', 'South Africa', 90.3, 92, '2025-05-04', $ict, ['founded' => '2016', 'team' => '10 – 15', 'aum' => 'R 900M', 'portfolio' => '27', 'countries' => '1', 'ownership' => '15% – 35%', 'pace' => 'R 150M', 'stagesLong' => 'Seed, Growth', 'compare' => ['irr' => '12% – 18%', 'payback' => '6 – 8 years', 'risk' => 40, 'fit' => 4, 'jobs' => 'N/A', 'alignment' => 'High']]),
            $o('sequoia-capital-africa', 'investor', 'Sequoia Capital Africa', null, 'Venture Capital', 'Global VC with Africa-focused investment mandate.', ['Enterprise Software', 'Fintech', 'AI'], ['Series A', 'Growth'], ['Equity'], null, 10_000_000, 150_000_000, 'Johannesburg, South Africa', 'International', 89.0, 80, '2025-05-04', $ict, ['founded' => '2020', 'team' => '8 – 12', 'aum' => 'Undisclosed', 'portfolio' => '12', 'countries' => '5', 'ownership' => '15% – 25%', 'pace' => 'R 250M', 'stagesLong' => 'Series A, Growth', 'compare' => ['irr' => '25% – 40%', 'payback' => '5 – 8 years', 'risk' => 55, 'fit' => 4, 'jobs' => 'N/A', 'alignment' => 'Medium']]),
            $o('tia-technology-impact-fund', 'investor', 'TIA Technology Impact Fund', null, 'Impact Investor', 'Impact investor backing tech solutions for Africa.', ['EdTech', 'HealthTech', 'FinTech', 'ICT4D'], ['Seed', 'Series A'], ['Equity', 'Grants'], null, 1_000_000, 20_000_000, 'Pretoria, South Africa', 'South Africa', 87.6, 86, '2025-05-03', $ict, ['founded' => '2017', 'team' => '10', 'aum' => 'R 600M', 'portfolio' => '40', 'countries' => '2', 'ownership' => '10% – 20%', 'pace' => 'R 80M', 'stagesLong' => 'Seed, Series A', 'compare' => ['irr' => '10% – 15%', 'payback' => '6 – 8 years', 'risk' => 42, 'fit' => 4, 'jobs' => 'N/A', 'alignment' => 'High']]),
            $o('microsoft-africa-transformation-fund', 'investor', 'Microsoft Africa Transformation Fund', null, 'Corporate Investor', 'Strategic investments in cloud and digital transformation.', ['Cloud', 'AI', 'Cybersecurity', 'Developer Tools'], ['Growth', 'Expansion'], ['Equity', 'Partnership'], null, 20_000_000, 300_000_000, 'Johannesburg, South Africa', 'International', 86.4, 84, '2025-05-02', $ict, ['ticket_plus' => true, 'founded' => '2021', 'team' => '12', 'aum' => 'Undisclosed', 'portfolio' => '9', 'countries' => '6', 'ownership' => '5% – 20%', 'pace' => 'R 400M', 'stagesLong' => 'Growth, Expansion', 'compare' => ['irr' => '15% – 22%', 'payback' => '5 – 7 years', 'risk' => 38, 'fit' => 4, 'jobs' => 'N/A', 'alignment' => 'High']]),
            $o('ai-data-sovereignty-partner-fund', 'investor', 'AI & Data Sovereignty Partner Fund', null, 'Impact Fund', 'Impact fund focused on AI, cloud and data infrastructure.', ['AI', 'Cloud', 'Data Infrastructure'], ['Growth'], ['Equity', 'Mezzanine'], null, 50_000_000, 250_000_000, 'South Africa (National)', 'South Africa', 81.2, 81, '2025-05-02', $ict, ['fund_size' => 'R 1.2B', 'fund_size_zar' => 1_200_000_000, 'status' => 'Active', 'coverage' => 'National', 'founded' => '2023', 'team' => '8 – 12', 'aum' => 'R 1.2B', 'portfolio' => '7', 'countries' => '1', 'ownership' => '10% – 30%', 'pace' => 'R 250M', 'stagesLong' => 'Growth', 'compare' => ['irr' => '16% – 20%', 'payback' => '6 – 8 years', 'risk' => 40, 'fit' => 4, 'jobs' => 'N/A', 'alignment' => 'Medium']]),
            $o('aiim-clean-energy-fund', 'investor', 'AIIM Clean Energy Fund', null, 'Private Equity', 'Private equity fund investing in renewable energy and infrastructure.', ['Renewable Energy', 'Infrastructure'], ['Growth', 'Expansion'], ['Equity'], null, 100_000_000, 1_000_000_000, 'Johannesburg, South Africa', 'South Africa', 92.0, 85, '2025-05-01', ['renewable-energy', 'energy'], ['founded' => '2015', 'team' => '25', 'aum' => 'R 8B', 'portfolio' => '21', 'countries' => '4', 'compare' => ['irr' => '14% – 18%', 'payback' => '7 – 9 years', 'risk' => 35, 'fit' => 5, 'jobs' => 'N/A', 'alignment' => 'High']]),
            $o('aureos-capital-partners', 'investor', 'Aureos Capital Partners', null, 'Private Equity', 'Private equity fund focused on renewable energy and infrastructure.', ['Renewable Energy', 'Infrastructure'], ['Growth'], ['Equity'], null, 150_000_000, 1_500_000_000, 'Johannesburg, South Africa', 'International', 88.0, 82, '2025-04-30', ['renewable-energy'], ['founded' => '2001', 'team' => '40', 'aum' => 'US$ 1.3B', 'portfolio' => '35', 'countries' => '12']),
            $o('energy-catalyst-fund', 'investor', 'Energy Catalyst Fund', null, 'Impact Fund', 'Impact fund backing clean energy and climate technology.', ['Clean Energy', 'Climate Tech'], ['Growth'], ['Equity', 'Blended'], null, 20_000_000, 300_000_000, 'Cape Town, South Africa', 'South Africa', 85.0, 80, '2025-04-29', ['renewable-energy', 'green-economy'], []),
            $o('futuregrowth-pe', 'investor', 'Futuregrowth PE', null, 'Private Equity', 'Infrastructure and energy private equity.', ['Infrastructure', 'Energy'], ['Growth', 'Expansion'], ['Equity', 'Debt'], null, 200_000_000, 2_000_000_000, 'Johannesburg, South Africa', 'South Africa', 80.0, 83, '2025-04-28', ['energy', 'renewable-energy'], []),

            $o('dbsa', 'funder', 'Development Bank of Southern Africa', 'DBSA', 'DFI', 'State-owned DFI financing infrastructure across Southern Africa.', ['Infrastructure', 'ICT', 'Digital Transformation'], ['Development', 'Construction'], ['Debt', 'Equity', 'Guarantees'], 'Enterprises, PPPs, Public Sector', 10_000_000, 2_000_000_000, 'Pretoria, South Africa', 'South Africa', 96.1, 94, '2025-05-06', ['ict-digital-services', 'energy', 'transport-logistics'], ['ticket_plus' => true, 'established' => '1983', 'website' => 'www.dbsa.org']),
            $o('idc', 'funder', 'Industrial Development Corporation (IDC)', 'IDC', 'DFI', 'National DFI funding industrial capacity and job creation.', ['Industrialisation', 'ICT', 'Green Economy'], ['Growth', 'Expansion'], ['Loans', 'Equity', 'Mezzanine'], 'SMEs, Mid-Caps, Large Enterprises', 5_000_000, 1_000_000_000, 'Sandton, South Africa', 'South Africa', 94.3, 93, '2025-05-06', ['manufacturing', 'ict-digital-services', 'green-economy'], ['ticket_plus' => true, 'established' => '1940', 'website' => 'www.idc.co.za']),
            $o('sefa', 'funder', 'Small Enterprise Finance Agency', 'SEFA', 'Government Fund', 'Government agency providing finance to SMMEs and co-operatives.', ['SME Finance', 'ICT', 'Enterprise Growth'], ['Start-up', 'Growth'], ['Loans', 'Guarantees'], 'SMMEs', 100_000, 10_000_000, 'Johannesburg, South Africa', 'South Africa', 89.7, 88, '2025-05-05', ['ict-digital-services', 'agriculture-agro-processing'], ['established' => '2012', 'website' => 'www.sefa.org.za']),
            $o('technology-innovation-agency', 'funder', 'Technology Innovation Agency (TIA)', 'TIA', 'Government Fund', 'Agency funding R&D and technology commercialisation.', ['R&D', 'Innovation', 'Technology Commercialisation'], ['Seed', 'Early Stage'], ['Grants', 'Co-funding'], 'Startups, Innovators, Researchers', 500_000, 30_000_000, 'Pretoria, South Africa', 'South Africa', 88.9, 87, '2025-05-04', ['ict-digital-services'], ['established' => '2010', 'website' => 'www.tia.org.za']),
            $o('cenfri', 'funder', 'Centre for Financial Regulation & Inclusion', 'cenfri', 'Grant Provider', 'Think-tank funding financial inclusion research and pilots.', ['Fintech', 'Financial Inclusion', 'Data & Research'], ['Seed'], ['Grants', 'Technical Assistance'], 'Fintechs, NGOs, Researchers', 250_000, 5_000_000, 'Cape Town, South Africa', 'South Africa', 87.2, 82, '2025-05-04', ['financial-services', 'ict-digital-services'], ['established' => '2010', 'website' => 'www.cenfri.org']),
            $o('afdb', 'funder', 'African Development Bank (AfDB)', 'AfDB', 'Multilateral Agency', 'Leading pan-African development finance institution promoting inclusive economic growth and sustainable development across Africa.', ['ICT', 'Infrastructure', 'Regional Integration'], ['Development', 'Construction', 'Expansion'], ['Loans', 'Guarantees', 'Blended Finance'], 'Governments, PPPs, Institutions', 50_000_000, 5_000_000_000, 'Abidjan (HQ), South Africa Office', 'International', 86.5, 92, '2025-05-03', ['ict-digital-services', 'energy', 'transport-logistics', 'agriculture-agro-processing'], [
                'ticket_plus' => true, 'designation' => 'Multilateral Development Bank', 'offices' => 'South Africa (Regional Office) · Abidjan, Côte d’Ivoire (HQ)',
                'established' => '1964', 'members' => '81', 'assets' => 'US$ 208B+', 'staff' => '3,200+', 'hq' => 'Abidjan, Côte d’Ivoire',
                'approvals' => 'US$ 8.5B+', 'approvalsNote' => '(FY2023)', 'activeCountries' => '53', 'saProjects' => '46', 'ticketLabel' => 'R 50M – R 3B+', 'instrumentCount' => '8',
                'about' => ['The African Development Bank (AfDB) is Africa’s premier multilateral development finance institution, driving sustainable economic growth and poverty reduction.', 'AfDB provides financial and technical assistance to governments, private sector and regional initiatives across the continent.'],
                'bullets' => ['Promotes inclusive and green growth', 'Supports private sector development', 'Mobilises resources for Africa’s transformation', 'Delivers knowledge and policy advisory'],
                'website' => 'www.afdb.org',
                'focusAreas' => ['Infrastructure Development', 'Industrialisation & Trade', 'Agriculture & Food Security', 'Climate Change & Green Growth', 'Governance & Institutions', 'Human Capital Development'],
                'eligible' => ['Sovereigns & Governments', 'State-Owned Enterprises', 'Private Sector Companies', 'Financial Institutions', 'Regional Economic Communities', 'Public-Private Partnerships'],
                'allocation' => [['Infrastructure', 29], ['Energy', 22], ['Agriculture', 17], ['Industry & Trade', 16], ['Social Development', 10], ['Other', 6]],
                'allocationNote' => 'Based on AfDB approvals in Africa (FY2023)',
            ]),
            $o('ai-sovereignty-venture-fund', 'funder', 'AI Sovereignty Venture Fund', null, 'Impact Investor', 'Pan-African fund investing in AI infrastructure and platforms.', ['Technology', 'AI Infrastructure'], ['Growth'], ['Equity'], 'Technology companies', 20_000_000, 250_000_000, 'Pan Africa', 'International', 79.6, 78, '2025-04-30', ['ict-digital-services'], ['fund_size' => '$250M', 'fund_size_zar' => 4_500_000_000, 'status' => 'Active', 'coverage' => 'Pan Africa', 'compare' => ['irr' => '18% – 24%', 'payback' => '6 – 8 years', 'risk' => 50, 'fit' => 4, 'jobs' => 'N/A', 'alignment' => 'Medium']]),
            $o('dbsa-green-finance', 'funder', 'DBSA Green Finance', null, 'DFI', 'Green infrastructure finance window of the DBSA.', ['Green Infrastructure', 'Renewable Energy'], ['Development'], ['Debt', 'Blended Finance'], 'IPPs, Municipalities', 50_000_000, 1_500_000_000, 'Pretoria, South Africa', 'South Africa', 88.0, 90, '2025-04-29', ['renewable-energy', 'green-economy'], []),
            $o('nedbank-project-finance', 'funder', 'Nedbank Project Finance', 'Nedbank CIB', 'Commercial Bank', 'Project finance desk of Nedbank Corporate & Investment Banking.', ['Project Finance', 'Infrastructure'], ['Development', 'Construction'], ['Senior Debt'], 'Project companies', 100_000_000, 3_000_000_000, 'Sandton, South Africa', 'South Africa', 78.0, 86, '2025-04-28', ['renewable-energy', 'energy', 'transport-logistics'], []),
        ];
    }

    public static function corridors(): array
    {
        $c = fn (string $slug, string $name, string $type, string $countries, string $route, string $agreement, array $modes, float $score, int $volume, string $sectors, string $region, string $infra, string $added) => [
            'slug' => $slug, 'name' => $name, 'type' => $type, 'countries' => $countries, 'route' => $route, 'agreement' => $agreement,
            'modes' => $modes, 'score' => $score, 'volume_zar' => $volume, 'sectors' => $sectors, 'destination_region' => $region,
            'infrastructure' => $infra, 'confidence' => (int) round($score - 4), 'added_on' => $added,
            'profile' => ['compare' => ['irr' => null, 'payback' => null, 'risk' => (int) round(100 - $score + 10), 'fit' => $score > 85 ? 5 : 4, 'jobs' => 'N/A', 'alignment' => $score > 85 ? 'High' : 'Medium'],
                'bottlenecks' => ['Border dwell times', 'Rail capacity constraints', 'Port congestion at peak season'], 'year' => 2023],
        ];

        return [
            $c('north-corridor', 'North Corridor', 'SADC', 'South Africa – Botswana – Zimbabwe – Zambia – DRC', 'Pretoria – Gaborone – Harare – Lusaka – Lubumbashi', 'SADC FTA', ['road', 'rail', 'sea', 'air'], 92.1, 218_400_000_000, 'Minerals, ICT, Energy, Manufacturing', 'Southern & Central Africa', 'High', '2025-05-06'),
            $c('port-of-durban-corridor', 'Port of Durban Corridor', 'SADC', 'South Africa – Mozambique – Malawi – Zambia', 'Durban – Maputo – Blantyre – Chipata – Lusaka', 'SADC FTA', ['road', 'rail', 'sea', 'air'], 89.3, 176_200_000_000, 'Agriculture, FMCG, Construction', 'Southern Africa', 'High', '2025-05-05'),
            $c('trans-kalahari-corridor', 'Trans-Kalahari Corridor', 'SADC', 'South Africa – Botswana – Namibia', 'Johannesburg – Gaborone – Windhoek – Walvis Bay', 'SADC FTA', ['road', 'rail', 'sea'], 86.7, 102_700_000_000, 'Automotive, Mining, Logistics', 'Southern Africa', 'Medium', '2025-05-04'),
            $c('africa-growth-corridor', 'Africa Growth Corridor', 'Multilateral', 'South Africa – DRC – Rwanda – Uganda – South Sudan', 'Durban – Kigali – Kampala – Juba', 'AfCFTA', ['road', 'rail', 'air'], 84.2, 95_600_000_000, 'ICT, Energy, Infrastructure', 'East & Central Africa', 'Medium', '2025-05-03'),
            $c('eu-southern-africa-corridor', 'EU–Southern Africa Corridor', 'Global', 'South Africa – EU Markets', 'Durban / Cape Town – Rotterdam – Hamburg', 'SADC – EU EPA', ['sea', 'air'], 82.5, 312_800_000_000, 'Automotive, Chemicals, Agriculture', 'Europe', 'High', '2025-05-02'),
            $c('lobito-corridor', 'Lobito Corridor', 'Emerging', 'South Africa – DRC – Angola', 'Durban – Lubumbashi – Lobito Port', 'Under Development', ['road', 'rail'], 78.4, 68_300_000_000, 'Minerals, Energy, Infrastructure', 'Central Africa', 'Developing', '2025-05-01'),
            $c('maputo-development-corridor', 'Maputo Development Corridor', 'Bilateral', 'South Africa – Mozambique', 'Johannesburg – Nelspruit – Komatipoort – Maputo', 'SA–Mozambique Bilateral', ['road', 'rail', 'sea'], 85.0, 88_900_000_000, 'Mining, Agriculture, Logistics', 'Southern Africa', 'High', '2025-04-30'),
            $c('beira-corridor', 'Beira Corridor', 'SADC', 'South Africa – Zimbabwe – Mozambique', 'Johannesburg – Harare – Mutare – Beira', 'SADC FTA', ['road', 'rail', 'sea'], 74.0, 41_200_000_000, 'Agriculture, Fuel, Minerals', 'Southern Africa', 'Developing', '2025-04-29'),
            $c('asia-pacific-trade-route', 'Asia-Pacific Trade Route', 'Global', 'South Africa – China – India – Japan', 'Durban / Richards Bay – Singapore – Shanghai – Mumbai', 'WTO MFN / Bilateral', ['sea', 'air'], 83.1, 401_500_000_000, 'Minerals, Agriculture, Chemicals', 'Asia', 'High', '2025-04-28'),
        ];
    }

    public static function briefs(): array
    {
        $b = fn (string $sku, string $title, string $category, string $format, string $size, string $published, int $price, ?string $badge, int $pop, string $summary, string $image, ?string $province = null, array $profile = []) => [
            'sku' => $sku, 'title' => $title, 'category' => $category, 'format' => $format, 'size_label' => $size, 'published' => $published,
            'price_zar' => $price, 'enterprise_from_zar' => (int) round($price * 3 / 50) * 50, 'badge' => $badge, 'popularity' => $pop, 'summary' => $summary,
            'image' => $image, 'province_slug' => $province, 'profile' => $profile + [
                'coverage' => 'South Africa', 'sectors' => 'Multi-sector', 'currency' => 'April–May 2025', 'sources' => 'Stats SA, SARB, National Treasury, DTIC',
                'confidence' => 'High', 'verification' => 'Human-reviewed',
                'insights' => ['Source-backed analysis with dated evidence', 'Methodology notes and assumptions', 'Commercial usage licence (single user)'],
                'inside' => ['Executive summary', 'Market and economic indicators', 'Opportunities and risks', 'Source list and methodology'],
            ],
        ];

        return [
            $b('SA-IC-2025', 'South Africa Investment Climate Brief 2025', 'Investment Climate', 'PDF', '32 pages', 'May 2025', 2950, 'Best Seller', 98, "Comprehensive overview of South Africa's economic outlook, reforms, risks and opportunities.", 'city'),
            $b('SA-REO-2025', 'Renewable Energy Outlook 2025', 'Sectors', 'PDF', '28 pages', 'May 2025', 2950, 'New', 91, 'Market sizing, policy landscape, key players and pipeline of projects across South Africa.', 'solar'),
            $b('GP-EP-2025', 'Gauteng Economic Profile 2025', 'Provinces', 'PDF', '36 pages', 'Apr 2025', 2850, 'Popular', 88, "Deep dive into Gauteng's economy, industries, infrastructure, talent and investment opportunities.", 'port', 'gauteng'),
            $b('SA-MM-2025', 'Mining & Minerals Sector Brief 2025', 'Sectors', 'PDF', '30 pages', 'May 2025', 2850, null, 80, 'Commodity outlook, production trends, value chain analysis and investment opportunities.', 'mine'),
            $b('SA-MACRO-DP-2025', 'South Africa Macroeconomic Data Pack 2025', 'Data Packs', 'Excel', '150+ metrics', 'May 2025', 1950, 'Data Pack', 76, 'Key macro indicators, forecasts and time series data in Excel with methodology notes.', 'data'),
            $b('SA-EC-IPAP-2025', 'Eastern Cape Industrial Parks Attractiveness Profile 2025', 'Provinces', 'PDF Report', '48 Pages', 'May 2025', 2850, 'Premium Brief', 72, "Comprehensive analysis of the Eastern Cape's industrial parks, infrastructure, incentives and investment attractiveness.", 'coast', 'eastern-cape', [
                'overview' => 'This premium brief provides a detailed assessment of key industrial parks across the Eastern Cape, including location analysis, infrastructure readiness, sector strengths, incentives and investment opportunities.',
                'coverage' => '5 priority industrial parks', 'sectors' => 'Automotive, Agro-processing, Metals, Green Energy, Logistics', 'currency' => 'April–May 2025',
                'sources' => 'Government, DTI, Quantec, Stats SA, SANRAL, Eskom, IDC', 'confidence' => 'High', 'verification' => 'Human-reviewed',
                'insights' => ['Coega SEZ offers competitive incentives for export-oriented manufacturing.', 'East London IDZ is expanding with strong logistics and port connectivity.', 'Automotive supplier clusters are growing in Gqeberha.', 'Reliable renewable energy initiatives are attracting green investments.'],
                'inside' => ['Industrial park scorecard (5 parks)', 'Infrastructure readiness: power, water, transport, digital', 'Incentives and SEZ benefits', 'Sector strengths and anchor investors', 'Investment opportunities and site options', 'Risks and mitigation'],
                'scorecard' => [['Coega SEZ', 88, 84, 86], ['East London IDZ', 82, 80, 79], ['Dube Trade Port (benchmark)', 85, 83, 80], ['Gqeberha Automotive Park', 79, 81, 74], ['Komani Industrial Park', 64, 62, 58]],
                'readiness' => [['Power Supply', 3], ['Water Supply', 4], ['Transport Connectivity', 4], ['Digital Connectivity', 3]],
            ]),
            $b('WC-AGRI-2025', 'Western Cape Agri-Export Brief 2025', 'Markets & Trade', 'PDF', '26 pages', 'May 2025', 2650, null, 60, 'Export markets, logistics and value-chain opportunities for Western Cape agriculture.', 'farm', 'western-cape'),
            $b('KZN-LOG-2025', 'KwaZulu-Natal Ports & Logistics Brief 2025', 'Infrastructure', 'PDF', '30 pages', 'Apr 2025', 2750, null, 58, 'Port of Durban performance, corridor bottlenecks and logistics investment pipeline.', 'port', 'kwazulu-natal'),
            $b('SA-REG-2025', 'Regulatory & Policy Tracker Q2 2025', 'Regulatory & Policy', 'PDF', '22 pages', 'May 2025', 2250, 'New', 64, 'Key regulatory changes, policy timelines and incentive schemes affecting investors.', 'city'),
            $b('SA-RISK-Q2', 'South Africa Risk & Outlook Q2 2025', 'Risk & Outlook', 'PDF', '24 pages', 'May 2025', 2450, null, 70, 'Sovereign, currency, regulatory and infrastructure risk outlook with early-warning signals.', 'data'),
            $b('SA-PROJ-DP-2025', 'Infrastructure Projects Pipeline Data Pack', 'Projects', 'Excel', '500 rows', 'May 2025', 3450, 'Data Pack', 55, 'Unlocked CSV/Excel extract of priority projects with source, date and confidence.', 'data'),
            $b('SA-NC-GH2-2025', 'Northern Cape Green Hydrogen Brief', 'Infrastructure', 'PDF', '34 pages', 'Apr 2025', 2950, null, 66, 'Green hydrogen value chain, Boegoebaai port plans, offtake and financing structures.', 'solar', 'northern-cape'),
        ];
    }

    public static function feeCodes(): array
    {
        $f = fn (string $code, string $name, string $desc, string $cat, string $type, string $model, float $amount, ?string $basis = null, ?float $rate = null, array $components = [], ?string $trigger = null, ?string $refund = null) => [
            'code' => $code, 'name' => $name, 'description' => $desc, 'category' => $cat, 'fee_type' => $type, 'pricing_model' => $model,
            'amount_zar' => $amount, 'rate' => $rate, 'basis' => $basis, 'components' => $components, 'trigger' => $trigger,
            'refund_policy' => $refund, 'status' => 'active', 'effective_from' => '2025-05-01',
        ];

        return [
            // Catalogue codes shown in Pricing Administration.
            $f('AIIM-DATA-001', 'Opportunity Deep Dive Report', 'Provincial or sector deep intelligence report', 'Data Products', 'Pay per Use', 'Fixed', 2950, null, null, ['TBCA Expert' => 1680, 'TBCA Platform' => 890, 'External Supplier Cost' => 160, 'TBCA External Administration' => 220], 'Report Generated', '7 days before delivery'),
            $f('AIIM-VERIFY-001', 'Verification & Due Diligence Pack', 'Basic verification for opportunities/investors', 'Verification', 'Pay per Use', 'Fixed', 4500, null, null, ['TBCA Expert' => 2900, 'TBCA Platform' => 700, 'External Supplier Cost' => 600, 'TBCA External Administration' => 300], 'Verification Started', 'Before verification starts'),
            $f('AIIM-MAND-ENT', 'Enterprise Annual Mandate', 'Full platform access for enterprise clients', 'Mandates', 'Subscription', 'Annual', 195000, null, null, [], 'Subscription Start', 'Pro-rata within 14 days'),
            $f('AIIM-MAND-PRO', 'Professional Annual Mandate', 'Enhanced access for professional users', 'Mandates', 'Subscription', 'Annual', 65000, null, null, [], 'Subscription Start', 'Pro-rata within 14 days'),
            $f('AIIM-INTRO-001', 'Investor Introduction', 'Facilitated investor or partner introduction', 'Introductions', 'Success Fee', 'Success %', 0, null, 2.5, [], 'Introduction Completed', 'Disabled pending Section 25 gate'),
            $f('AIIM-API-ENT', 'API Access – Enterprise', 'White-label API access (enterprise)', 'API & Licensing', 'Subscription', 'Annual', 120000, null, null, [], 'Licence Start', 'Pro-rata within 14 days'),
            $f('AIIM-WL-LIC', 'White-Label Licence', 'White-label deployment licence', 'API & Licensing', 'Subscription', 'Annual', 180000, null, null, [], 'Licence Start', 'Pro-rata within 14 days'),
            $f('AIIM-CANCEL-001', 'Transaction Cancellation', 'Cancellation before access or delivery', 'Adjustments', 'Refund Rule', 'Fixed', 0, null, -100, [], 'Cancellation Approved', 'Full refund before access'),
            $f('AIIM-ARCHIVE-001', 'Archive Renewal', 'Annual archive access renewal', 'Adjustments', 'Subscription', 'Annual', 7500, null, null, [], 'Renewal Date', 'Non-refundable'),
            // Fee manifest components.
            $f('AIIM-EXP-001', 'TBCA Expert Fee', 'Research, analysis, curation and expert oversight by TBCA specialists.', 'Premium Intelligence', 'Pay per Use', 'Per item', 950, 'Per item'),
            $f('AIIM-PLAT-001', 'TBCA Platform Fee', 'Platform access, data processing, AI agents and infrastructure.', 'Premium Intelligence', 'Pay per Use', 'Per item', 450, 'Per item'),
            $f('AIIM-EXT-001', 'External Supplier Cost', 'Third-party data providers, licences and verified datasets.', 'Premium Intelligence', 'Pass-through', 'At cost', 400, 'At cost'),
            $f('AIIM-ADM-001', 'TBCA External Administration', 'Client success, compliance, security and administration.', 'Premium Intelligence', 'Pay per Use', 'Per quote', 600, 'Per quote'),
            // Metered unlock.
            $f('AIIM-UNL-001', 'Metered Unlock Fee (10 views)', 'Pay-per-view access to a premium intelligence object for 7 days', 'Metered Unlock', 'Pay per Use', 'Fixed', 2000, null, null, [], 'Unlock Approved', 'Non-refundable once access is initiated'),
            $f('AIIM-UNL-XV', 'Extra View', 'Additional view beyond the included allowance', 'Metered Unlock', 'Pay per Use', 'Per view', 285, 'Per view'),
            $f('AIIM-UNL-PLT', 'Unlock Platform Fee', 'Platform access, metering and secure delivery', 'Metered Unlock', 'Pay per Use', 'Fixed', 280),
            // Report configuration.
            $f('AIIM-RPT-PFM-001', 'Premium Financial Model Report (base)', 'Base expert fee for a premium financial model report', 'Premium Intelligence Report', 'Quoted', 'Formula', 1500, null, null, [], 'Quote Accepted', 'Non-refundable once processing begins'),
            $f('AIIM-RPT-SEC-001', 'Sector Intelligence Report (base)', 'Base expert fee for a sector intelligence report', 'Premium Intelligence Report', 'Quoted', 'Formula', 1200, null, null, [], 'Quote Accepted', 'Non-refundable once processing begins'),
            $f('AIIM-RPT-PRV-001', 'Province Investment Profile (base)', 'Base expert fee for a province profile report', 'Premium Intelligence Report', 'Quoted', 'Formula', 1000, null, null, [], 'Quote Accepted', 'Non-refundable once processing begins'),
            $f('AIIM-RPT-MOD', 'Report Content Module', 'Expert fee per selected content module', 'Premium Intelligence Report', 'Quoted', 'Per module', 350, 'Per module'),
            $f('AIIM-RPT-PRV', 'Additional Province', 'Expert fee per additional named province', 'Premium Intelligence Report', 'Quoted', 'Per province', 400, 'Per province'),
            $f('AIIM-RPT-EXT', 'External Data & Sources', 'Third-party datasets per selected sector', 'Premium Intelligence Report', 'Pass-through', 'Per sector', 600, 'Per sector'),
            $f('AIIM-RPT-PLT', 'Report Platform Fee', 'Platform access, data processing and tools', 'Premium Intelligence Report', 'Quoted', 'Fixed', 1350),
            $f('AIIM-RPT-ADM', 'Report Administration', 'Project management and quality assurance', 'Premium Intelligence Report', 'Quoted', 'Fixed', 600),
            // Engagements and verification.
            $f('AIIM-ENG-PLT', 'Engagement Platform Fee', 'Mandate workspace, AI research assistant and secure storage', 'Mandates', 'Quoted', 'Fixed', 6000),
            $f('AIIM-ENG-ADM', 'Engagement Administration', 'Engagement governance, compliance and administration', 'Mandates', 'Quoted', 'Fixed', 4000),
            $f('AIIM-VER-PLT', 'Verification Platform Fee', 'Verification workflow platform fee (% of expert fee)', 'Verification', 'Quoted', 'Percentage', 0, null, 18),
            // Wallet credit packs.
            $f('AIIM-CRD-2K', 'Credit Pack – 2,000 credits', 'Prepaid AIIM credits', 'Wallet', 'Prepaid', 'Fixed', 2000),
            $f('AIIM-CRD-5K', 'Credit Pack – 5,000 credits', 'Prepaid AIIM credits (5% saving)', 'Wallet', 'Prepaid', 'Fixed', 4750),
            $f('AIIM-CRD-10K', 'Credit Pack – 10,000 credits', 'Prepaid AIIM credits (10% saving)', 'Wallet', 'Prepaid', 'Fixed', 9000),
        ];
    }

    public static function advisors(): array
    {
        return [
            ['slug' => 'sipho-maseko', 'name' => 'Sipho Maseko', 'title' => 'Partner: Energy & Infrastructure', 'years' => 18, 'email' => 'sipho.maseko@tbca.africa', 'phone' => '+27 82 555 0102', 'strengths' => ['Specialist in energy, infrastructure and project finance', 'Former investment banker', 'Extensive experience across Africa', 'Fluent in English']],
            ['slug' => 'lerato-ngwenya', 'name' => 'Lerato Ngwenya', 'title' => 'Partner: Investment Strategy', 'years' => 15, 'email' => 'lerato.ngwenya@tbca.africa', 'phone' => '+27 82 555 0103', 'strengths' => ['Investment strategy and portfolio construction', 'Private equity fundraising', 'Board advisory', 'Fluent in English and isiZulu']],
            ['slug' => 'thabo-dlamini', 'name' => 'Thabo Dlamini', 'title' => 'Director: Project Finance', 'years' => 16, 'email' => 'thabo.dlamini@tbca.africa', 'phone' => '+27 82 555 0104', 'strengths' => ['Project finance structuring', 'DFI and blended finance', 'Financial modelling', 'Fluent in English and Sesotho']],
            ['slug' => 'nomsa-khumalo', 'name' => 'Nomsa Khumalo', 'title' => 'Director: Public Policy', 'years' => 14, 'email' => 'nomsa.khumalo@tbca.africa', 'phone' => '+27 82 555 0105', 'strengths' => ['Public policy and regulation', 'Government stakeholder engagement', 'Incentive programmes', 'Fluent in English and isiXhosa']],
        ];
    }

    public static function alerts(): array
    {
        $a = fn (string $risk, string $cat, string $title, string $entity, string $source, int $conf, string $status, string $when, string $channel = 'in-platform') => [
            'risk' => $risk, 'category' => $cat, 'title' => $title, 'entity' => $entity, 'source' => $source, 'confidence' => $conf,
            'status' => $status, 'raised_at' => now()->modify($when), 'channel' => $channel,
        ];

        return [
            $a('high', 'Regulatory Change', 'NERSA proposes new wheeling charge framework', 'Renewable Energy Opportunities', 'NERSA Notice 145/2025', 92, 'new', '-2 hours'),
            $a('medium', 'Policy Update', 'DMRE updates REIPPPP Bid Window 7 timeline', 'Green Energy Projects', 'DMRE Press Release', 88, 'new', '-3 hours', 'email'),
            $a('high', 'Financing Update', 'DBSA increases funding window for energy storage', 'Infrastructure Projects', 'DBSA Bulletin', 91, 'in_review', '-1 day'),
            $a('low', 'Market Signal', 'Hydrogen demand outlook revised upward', 'Green Hydrogen Hub', 'S&P Global Commodity Insights', 76, 'acknowledged', '-1 day -4 hours', 'whatsapp'),
            $a('medium', 'Project Risk', 'Construction delay risk flagged: N2 Wild Coast Road', 'Transport Infrastructure', 'Project Monitoring Feed', 83, 'in_review', '-2 days'),
            $a('high', 'Infrastructure', 'Eskom grid capacity constraints in Northern Cape', 'Northern Cape Solar Park', 'Eskom GCCA 2025', 90, 'new', '-3 days'),
            $a('low', 'Incentive', 'Green Hydrogen Incentive Scheme extended to Dec 2026', 'Green Hydrogen', 'DTIC Gazette', 87, 'acknowledged', '-4 days', 'sms'),
        ];
    }

    public static function discoveryOutcome(): array
    {
        return [
            'points' => ['Explored renewable energy opportunities in South Africa', 'Focus on solar and battery storage projects', 'Reviewed regulatory and policy environment', 'Discussed project feasibility and funding options', 'Identified key stakeholders and partners', 'Explored risk mitigation and market outlook'],
            'objectives' => ['To identify investable renewable energy projects in the Eastern Cape.', 'To understand market attractiveness, risks and incentives.', 'To receive advisory support on deal structuring and next steps.'],
            'assessment' => [['Opportunity Attractiveness', 4, 'High'], ['Readiness Level', 4, 'Good'], ['Complexity', 3, 'Medium']],
            'priority' => 'High',
            'next' => ['Prepare a formal proposal and quotation based on your requirements.', 'We will share a tailored commercial proposal and scope of work.', 'Upon your approval, we will move to management and onboarding.', 'Kick-off meeting to commence your engagement.'],
            'duration' => 60,
            'method' => 'Microsoft Teams (Online)',
        ];
    }

    public static function customRequest(): array
    {
        return [
            'title' => 'Renewable energy opportunities in the Eastern Cape',
            'detail' => 'Identify investable solar and wind projects, grid connectivity constraints, permitting requirements and incentive programmes in the Eastern Cape.',
            'category' => 'Custom Intelligence', 'subcategory' => 'Opportunity Scan', 'country' => 'South Africa', 'provinces' => ['eastern-cape'],
            'sectors' => ['ict-digital-services', 'manufacturing', 'renewable-energy'], 'depth' => 'advanced',
            'questions' => 'Which projects are investment-ready? What are the grid connection timelines?', 'decision' => 'Investment committee screening',
            'background' => 'We are exploring investment opportunities in renewable energy across the Eastern Cape, with a focus on solar and wind projects, grid connectivity, permitting requirements, policy incentives, key stakeholders, and potential local partners and suppliers. We are particularly interested in projects that support energy access and industrial development in underserved areas.',
            'format' => 'PDF report plus advisory call', 'required_by' => 'To be confirmed after expert review', 'channel' => 'Workspace + email',
        ];
    }

    public static function deliverables(): array
    {
        return [
            ['name' => 'Inception Note', 'format' => 'PDF', 'size' => '412 KB', 'status' => 'completed'],
            ['name' => 'Detailed Workplan', 'format' => 'PDF', 'size' => '285 KB', 'status' => 'completed'],
            ['name' => 'Data Sources Register', 'format' => 'XLSX', 'size' => '634 KB', 'status' => 'in_progress'],
            ['name' => 'Draft Report', 'format' => 'PDF', 'size' => null, 'status' => 'pending'],
            ['name' => 'Final Report', 'format' => 'PDF', 'size' => null, 'status' => 'pending'],
        ];
    }

    public static function verificationItems(): array
    {
        $v = fn (string $code, string $name, string $desc, string $rec, bool $sel, string $supplier, string $purpose, string $basis, float $cost, float $expert, string $timeline, string $status, string $owner, ?string $start, ?string $eta, ?string $conf = 'High') => [
            'code' => $code, 'name' => $name, 'description' => $desc, 'recommendation' => $rec, 'selected' => $sel, 'supplier' => $supplier,
            'purpose' => $purpose, 'basis' => $basis, 'supplier_cost_zar' => $cost, 'expert_fee_zar' => $expert, 'timeline' => $timeline,
            'cost_approved' => $sel, 'status' => $status, 'owner' => $owner,
            'started_on' => $start ? now()->modify($start)->toDateString() : null, 'eta_on' => $eta ? now()->modify($eta)->toDateString() : null,
            'confidence' => $conf,
        ];

        return [
            $v('company-registration', 'Company Registration Verification', 'Verify legal registration and good standing', 'High', true, 'CIPC (Companies & IP Commission)', 'Company records search (COR14.3, status, directors)', 'Official Records', 310, 4500, '3–5 days', 'completed', 'TBCA Expert', '-12 days', '-10 days'),
            $v('director-ownership', 'Director & Beneficial Ownership Verification', 'Verify directors, shareholders and ownership structure', 'High', true, 'DHA (Home Affairs)', 'ID verification & ownership screening', 'Official Records', 230, 5500, '3–7 days', 'in_progress', 'External Partner', '-12 days', '+2 days'),
            $v('licence-permit', 'Licence & Permit Verification', 'Verify required licences and permits', 'Medium', true, 'DMRE (Energy Regulator)', 'Energy licence & compliance status', 'Direct Confirmation', 680, 5000, '5–10 days', 'in_progress', 'External Partner', '-11 days', '+3 days'),
            $v('project-sponsor', 'Project Existence & Sponsor Verification', 'Verify project existence and sponsor authority', 'High', true, 'Municipal Records Office', 'Zoning, approvals & project confirmation', 'Document Review', 410, 5250, '5–10 days', 'in_progress', 'TBCA Expert', '-11 days', '+3 days'),
            $v('contact-mandate', 'Contact & Mandate Verification', 'Verify authorised contacts and mandates', 'Medium', true, 'SARS (South African Revenue Service)', 'Tax status & contact validation', 'Direct Confirmation', 120, 3500, '2–4 days', 'completed', 'TBCA Expert', '-12 days', '-10 days'),
            $v('sanctions-pep', 'Sanctions, PEP & Adverse Media Review', 'Screen against sanctions, PEP and adverse media', 'Medium', true, 'World-Check / LexisNexis', 'Global sanctions & adverse media screening', 'Third Party Databases', 950, 5000, '3–5 days', 'in_progress', 'External Partner', '-11 days', '+1 day', 'Medium'),
            $v('bank-reference', 'Bank Reference Verification', 'Verify banking relationships and references', 'Low', false, 'Bankers Association (RBB)', 'Bank reference confirmation', 'Direct Confirmation', 180, 2500, '2–5 days', 'pending', 'TBCA Expert', null, '+6 days'),
            $v('site-visit', 'Site Visit / Physical Inspection', 'Physical inspection of assets or project site', 'Low', false, 'On-site Inspection', 'Physical inspection of project site', 'Physical Verification', 2400, 6500, '5–10 days', 'pending', 'TBCA Expert', null, '+9 days'),
        ];
    }

    public static function sharing(): array
    {
        return [
            ['key' => 'executive-summary', 'label' => 'Executive Summary', 'share' => true],
            ['key' => 'project-overview', 'label' => 'Project Overview & Objectives', 'share' => true],
            ['key' => 'technical-overview', 'label' => 'Technical Overview', 'share' => true],
            ['key' => 'financial-overview', 'label' => 'Financial Overview (Summary)', 'share' => true],
            ['key' => 'risk-assessment', 'label' => 'Risk Assessment (Summary)', 'share' => true],
            ['key' => 'documents', 'label' => 'Documents & Reports (Selective)', 'share' => true],
            ['key' => 'financial-model', 'label' => 'Financial Model (High-Level)', 'share' => false],
            ['key' => 'dd-reports', 'label' => 'Detailed Due Diligence Reports', 'share' => false],
        ];
    }

    public static function introParties(): array
    {
        $p = fn (string $name, string $type, string $focus, string $stage, int $fit, string $location, bool $sel, string $contact) => [
            'name' => $name, 'type' => $type, 'focus' => $focus, 'stage' => $stage, 'fit_score' => $fit, 'location' => $location,
            'selected' => $sel, 'consent_status' => 'pending', 'engagement_status' => 'Awaiting response', 'contact' => $contact,
        ];

        return [
            $p('AIIM Clean Energy Fund', 'Private Equity', 'Renewable Energy, Infra', 'Growth / Expansion', 92, 'Johannesburg, SA', true, 'investments@aiimcleanenergy.example'),
            $p('DBSA Green Finance', 'Development Finance', 'Green Infrastructure', 'Development', 88, 'Pretoria, SA', true, 'greenfinance@dbsa.example'),
            $p('Energy Catalyst Fund', 'Impact Fund', 'Clean Energy, Climate Tech', 'Growth', 85, 'Cape Town, SA', true, 'deals@energycatalyst.example'),
            $p('Futuregrowth PE', 'Private Equity', 'Infrastructure, Energy', 'Growth / Expansion', 80, 'Johannesburg, SA', false, 'pe@futuregrowth.example'),
            $p('Nedbank Project Finance', 'Commercial Bank', 'Project Finance, Infra', 'Development', 78, 'Sandton, SA', false, 'projectfinance@nedbank.example'),
        ];
    }

    public static function handoffPackets(string $target): array
    {
        $packets = [
            ['Executive Summary Pack', 'Project overview, objectives, key metrics and highlights', 6],
            ['Market & Sector Insights', 'Market research, sector analysis and demand outlook', 8],
            ['Financial & Commercial', 'Financial model, revenue analysis and projections', 10],
            ['Risk & ESG Assessment', 'Risk assessment, mitigations and ESG evaluation', 9],
            ['Legal & Regulatory', 'Permits, licenses, legal opinions and compliance docs', 5],
            ['Stakeholder & Partner Info', 'Partner agreements, MOUs and stakeholder maps', 4],
        ];
        if ($target === 'vdr') {
            $packets[] = ['Verification & Evidence', 'Verification reports, evidence and data sources', 8];
        }
        if ($target === 'project-advisory') {
            $packets = [$packets[0], $packets[1], ['Technical & Infrastructure', 'Technical studies, site data and infrastructure requirements', 9], $packets[2], $packets[3], $packets[4]];
        }

        return array_map(fn ($p) => ['name' => $p[0], 'description' => $p[1], 'items' => $p[2], 'included' => true, 'updated' => now()->subDays(2)->format('d M Y')], $packets);
    }

    public static function handoffSummary(string $target): array
    {
        return match ($target) {
            'dd' => ['to' => 'Due Diligence Workspace', 'leadLabel' => 'Due Diligence Lead', 'lead' => 'Thabo Ndlovu', 'documents' => 42, 'assets' => 18, 'insights' => 24, 'gate' => 'G11 – Due Diligence Handoff', 'readiness' => 92, 'url' => '/due-diligence'],
            'vdr' => ['to' => 'Virtual Deal Room', 'leadLabel' => 'VDR Lead', 'lead' => 'Thabo Ndlovu', 'documents' => 58, 'assets' => 24, 'insights' => 32, 'gate' => 'G12 – VDR Handoff', 'readiness' => 94, 'url' => '/virtual-deal-room'],
            default => ['to' => 'Project Advisory Workspace', 'leadLabel' => 'Project Advisory Lead', 'lead' => 'Lerato Khumalo', 'documents' => 51, 'assets' => 22, 'insights' => 19, 'gate' => 'G13 – Project Advisory Handoff', 'readiness' => 91, 'url' => '/project-advisory'],
        };
    }

    public static function deepDive(): array
    {
        return [
            'sector' => 'Renewable Energy', 'province' => 'Eastern Cape', 'marketSize' => 'ZAR 28.6 Billion', 'cagr' => '12.4%',
            'drivers' => 'Energy security, policy support, private investment, green hydrogen', 'outlook' => 'High Growth',
            'forecast' => [['2022', 20.1], ['2023', 22.4], ['2024', 28.6], ['2025F', 31.7], ['2026F', 35.8], ['2027F', 40.4], ['2028F', 45.6], ['2029F', 51.2], ['2030F', 57.3]],
            'insights' => ['South Africa targets 42.5% renewable share in the energy mix by 2030.', 'Eastern Cape is a strategic hub for wind and solar projects.', 'Strong pipeline of projects under REIPPPP and private sector initiatives.', 'Growing opportunities in green hydrogen and storage solutions.', 'Supportive policy environment and improving grid infrastructure.'],
            'attractiveness' => [['Market Size', 80], ['Growth Potential', 85], ['Regulatory Support', 75], ['Investment Climate', 70], ['Infrastructure Readiness', 70]],
            'opportunities' => [['Jeffreys Bay Wind Farm', 'Wind', 'Eastern Cape', 'ZAR 3.2B', '14% – 18%'], ['Coega Green Hydrogen Hub', 'Hydrogen', 'Eastern Cape', 'ZAR 8.5B', '16% – 22%'], ['Solar PV – Nxuba Project', 'Solar', 'Eastern Cape', 'ZAR 1.8B', '13% – 17%'], ['Battery Storage – Gqeberha', 'Storage', 'Eastern Cape', 'ZAR 2.4B', '12% – 16%']],
            'risks' => [['Policy & Regulatory Risk', 'Low'], ['Market Risk', 'Medium'], ['Execution Risk', 'Medium'], ['Funding Risk', 'Low'], ['Environmental Risk', 'Low']],
            'sources' => 'DMRE, NERSA, SARB, World Bank, GWEC',
        ];
    }

    public static function packaging(): array
    {
        return [
            'project' => [['Project Name', 'Jeffreys Bay Wind Farm'], ['Project Type', 'Greenfield'], ['Sector', 'Renewable Energy – Wind'], ['Location', 'Jeffreys Bay, Eastern Cape'], ['Capacity', '150 MW'], ['Estimated CAPEX', 'ZAR 3.28 Billion'], ['Project Sponsor', 'Coega Green Energy Pty Ltd'], ['Stage', 'Feasibility']],
            'health' => 72,
            'steps' => [['Information Collection', 'completed'], ['Structure & Positioning', 'in_progress'], ['Financial Modelling', 'pending'], ['Risk & ESG Assessment', 'pending'], ['Value Proposition Development', 'pending'], ['Documentation & Review', 'pending']],
            'workstreams' => [
                ['name' => 'Project Structure & Vehicle', 'status' => 'in_progress', 'lead' => 'Sipho Maseko', 'due' => '+3 days', 'completion' => 45],
                ['name' => 'Financial Model & Assumptions', 'status' => 'in_progress', 'lead' => 'Lerato Dlamini', 'due' => '+8 days', 'completion' => 30],
                ['name' => 'Market & Offtake Analysis', 'status' => 'completed', 'lead' => 'AI Agent', 'due' => '-7 days', 'completion' => 100],
                ['name' => 'Risk Assessment & Mitigation', 'status' => 'in_progress', 'lead' => 'Thabo Ndlovu', 'due' => '+6 days', 'completion' => 30],
                ['name' => 'ESG & Sustainability Review', 'status' => 'pending', 'lead' => 'External Expert', 'due' => '+10 days', 'completion' => 0],
                ['name' => 'Investment Memorandum Draft', 'status' => 'pending', 'lead' => 'Research Analyst', 'due' => '+13 days', 'completion' => 0],
            ],
            'insights' => ['Strong wind resource with average capacity factor estimated at 38%.', 'Consider green hydrogen offtake partnership to improve bankability.', 'Explore blended finance with DFIs to reduce cost of capital.', 'Grid connection timeline is critical – engage with Eskom for assurance.'],
            'next' => ['Complete structure and positioning', 'Finalise financial model and scenario analysis', 'Complete risk & ESG assessments', 'Develop and review value proposition', 'Prepare investment memorandum'],
        ];
    }

    public static function delivery(): array
    {
        return [
            'id' => 'DLV-2025-05-12-001', 'type' => 'Final Delivery', 'version' => '1.0', 'quality' => 95,
            'outputs' => [
                ['Project Advisory Package', 'Comprehensive project advisory report with recommendations', 'PDF'],
                ['Financial Model', '5-year financial projections and analysis', 'XLSX'],
                ['Risk Assessment', 'Risk register and mitigation strategies', 'PDF'],
                ['Implementation Roadmap', 'Phased implementation plan and timeline', 'PDF'],
                ['Supporting Data Pack', 'Data sources, assumptions and evidence', 'ZIP'],
            ],
            'checks' => [['Content Completeness', 'All required deliverables provided'], ['Data Accuracy', 'Sources verified and cross-checked'], ['Methodology Compliance', 'TBCA methodology followed'], ['Confidentiality Applied', 'Classification and access controls applied'], ['Plagiarism Check', 'All content original and verified']],
        ];
    }

    public static function scopeChange(): array
    {
        return [
            'changeType' => 'Additional Deliverables',
            'reason' => 'Client request for deeper financial and risk analysis and stakeholder mapping.',
            'requestedBy' => 'Sipho Maseko',
            'gate' => 'G2 / G3 / G6 – Scope Change',
            'purpose' => ['Address emerging client priorities', 'Enhance depth and accuracy of outputs', 'Mitigate risks identified during execution', 'Improve investor readiness'],
            'changes' => [
                ['Deliverables', '5 deliverables', 'Add 2 deliverables', 'Deeper financial model & stakeholder map'],
                ['Data & Analysis', 'Standard financial analysis', 'Add sensitivity & scenario analysis', 'Investor requires scenario insights'],
                ['Stakeholder Engagement', 'Limited stakeholder mapping', 'Comprehensive stakeholder mapping', 'Support negotiations and risk mitigation'],
                ['Timeline', '20 business days', 'Extend by 7 business days', 'Additional data collection and analysis'],
                ['Reporting', 'Standard report', 'Enhanced report with annexures', 'Provide more detailed insights'],
            ],
            'impact' => [['Quality Impact', 'Positive', 'Enhances depth, accuracy and investor confidence.'], ['Risk Impact', 'Moderate', 'Improves risk mitigation through broader stakeholder and scenario analysis.'], ['Resource Impact', 'Moderate', 'Requires additional analyst time and expert input.']],
            'additionalFee' => 22500,
            'additionalDays' => 7,
            'readiness' => 85,
        ];
    }
}
