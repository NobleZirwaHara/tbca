<?php

namespace App\Support\Aiim;

/**
 * Static AIIM page content shared across screens (landing, cockpit, risk outlook).
 */
class Content
{
    public static function landing(): array
    {
        return [
            'numbers' => [['54', 'Countries Covered', 'globe'], ['7', 'Languages Supported', 'languages'], ['5', 'Currencies Supported', 'coins'], ['100+', 'Local Data Sources', 'database'], ['24/7', 'AI & Human Insights', 'bot']],
            'pillars' => [
                ['Comprehensive Coverage', '54 African markets in one place', 'globe'],
                ['Actionable Intelligence', 'Data, insights & opportunities', 'clipboard-list'],
                ['Real-Time Updates', 'Always current, always relevant', 'refresh-cw'],
                ['Human + AI Powered', 'Expert insight, AI speed', 'user-check'],
                ['Risk & Opportunity Outlook', 'Make informed decisions', 'shield-check'],
                ['Secure & Compliant', 'POPIA & ISO 27001 aligned', 'lock'],
            ],
            'regions' => [['North Africa', 7], ['West Africa', 16], ['Central Africa', 9], ['East Africa', 10], ['Southern Africa', 12]],
            'platform' => ['Countries & Market Profiles', 'Investment Opportunities', 'Projects & Infrastructure', 'Investors & Funders', 'Sectors & Value Chains', 'Trade Corridors & Hubs', 'Market Intelligence & Risk', 'Regulatory & Policy Insights'],
            'countries' => [
                ['name' => 'South Africa', 'code' => 'ZA', 'status' => 'High Opportunity', 'active' => true],
                ['name' => 'Kenya', 'code' => 'KE', 'status' => 'High Opportunity', 'active' => false],
                ['name' => 'Ghana', 'code' => 'GH', 'status' => 'High Opportunity', 'active' => false],
                ['name' => 'Rwanda', 'code' => 'RW', 'status' => 'Stable Growth', 'active' => false],
                ['name' => 'Nigeria', 'code' => 'NG', 'status' => 'High Potential', 'active' => false],
            ],
            'actions' => [
                ['Country Profile Report', '/aiim/store?category=Investment+Climate'],
                ['Investment Opportunity Scan', '/aiim/opportunities'],
                ['Regulatory & Compliance Check', '/aiim/store?category=Regulatory+%26+Policy'],
                ['Market Entry Advisory', '/aiim/workspace/advisor-request'],
                ['Partner & Network Connection', '/aiim/investors'],
                ['Risk & Political Assessment', '/aiim/risk'],
                ['Custom Country Intelligence', '/aiim/custom-intelligence'],
            ],
            'snapshot' => [['Priority Opportunities', '1,248'], ['Active Investment Projects', '562'], ['Verified Investors & Funds', '312'], ['Strategic Sectors', '12'], ['Trade Corridors Tracked', '8'], ['AI Confidence (Avg.)', 'High']],
            'verifiedSources' => ['Stats SA', 'the dtic', 'DBSA', 'SARS'],
        ];
    }

    public static function cockpit(): array
    {
        return [
            'kpis' => [
                ['Investment Opportunities', '1,248', 'High Potential', 'target'], ['Active Projects', '562', 'Fundable', 'building-2'],
                ['Verified Investors', '312', 'Active Mandates', 'users'], ['Funding Institutions', '189', 'Active Lenders', 'landmark'],
                ['Trade Corridors', '18', 'Active Corridors', 'route'], ['Capital Inflows (Q1 2025)', 'R 128.7 B', '▲ 14.6% vs Q1 2024', 'trending-up'],
                ['FDI Confidence Index', '72.4 /100', 'Positive', 'gauge'], ['Market Outlook (Q2 2025)', 'Positive', 'Stable Growth', 'sun'],
            ],
            'topSectors' => ['Renewable Energy', 'Agriculture & Agro-Processing', 'Transport & Logistics', 'ICT & Digital Services', 'Mining & Critical Minerals'],
            'opportunityScore' => 78.4,
            'risk' => ['score' => 3.2, 'label' => 'Moderate Risk', 'split' => [['Low Risk', 24], ['Moderate', 52], ['Elevated', 16], ['High Risk', 8]]],
            'glance' => [['Population (2024)', '62.0M'], ['GDP (Nominal, 2024)', 'R 7.7 Trillion'], ['GDP Growth (2024)', '0.6%'], ['FDI Inflows (2023)', 'R 118.7 Billion'], ['Exports (2023)', 'R 1.6 Trillion'], ['Ease of Doing Business Rank', '84 / 190'], ['Global Competitiveness Rank', '60 / 67']],
        ];
    }

    public static function risk(): array
    {
        return [
            'score' => 54, 'label' => 'Medium Risk', 'outlook' => 'Positive', 'confidence' => 'High', 'asAt' => '6 May 2025',
            'categories' => [
                ['Political & Governance', 'Medium', 52, 'stable', 0], ['Macroeconomic Stability', 'Medium', 58, 'improving', 3],
                ['Currency & Fiscal', 'Medium', 48, 'stable', -1], ['Regulatory & Policy', 'Medium', 55, 'improving', 2],
                ['Infrastructure & Logistics', 'Low', 38, 'improving', 4], ['Security & Safety', 'Medium', 50, 'stable', -2],
                ['Climate & Environment', 'Medium', 53, 'improving', 1], ['Technology & Cyber', 'Low', 35, 'improving', 3],
            ],
            'outlookRows' => [['GDP Growth Forecast (2025)', '1.7%'], ['Inflation Forecast (2025)', '4.5%'], ['Unemployment Rate (2025)', '32.2%'], ['Current Account Balance (% GDP)', '-2.1%'], ['ZAR Stability Outlook', 'Stable']],
            'trend' => [['Dec 2024', 46], ['Jan 2025', 48], ['Feb 2025', 50], ['Mar 2025', 52], ['Apr 2025', 54]],
            'top' => ['Slow economic growth and high unemployment', 'Eskom and energy supply constraints', 'Policy uncertainty and regulatory delays', 'Logistics bottlenecks at ports and rail', 'Geopolitical and global market volatility'],
            'sectorRisk' => [['ICT & Digital Services', 'Medium', 44], ['Renewable Energy', 'Medium', 47], ['Mining & Minerals', 'Medium-High', 61], ['Agriculture & Agro-Processing', 'Medium', 52], ['Transport & Logistics', 'High', 66], ['Financial Services', 'Low', 33]],
            'signals' => [['NERSA wheeling charge framework consultation', 'Regulatory', 'Watch'], ['Transnet port recovery plan milestones', 'Infrastructure', 'Improving'], ['Rand volatility against USD', 'Currency', 'Watch'], ['Municipal service delivery protests', 'Security', 'Elevated']],
            'scenarios' => [['Base case (60%)', 'GDP growth 1.5–2.0%, steady reform progress, energy availability improves.'], ['Upside (25%)', 'Accelerated logistics reform and private generation lift growth above 2.5%.'], ['Downside (15%)', 'Coalition instability and global slowdown push growth below 1%.']],
            'mitigation' => ['Diversify energy supply via embedded generation and PPAs', 'Hedge ZAR exposure for USD-linked capex', 'Use DFI guarantees and blended finance', 'Engage early with municipal and provincial authorities'],
            'sources' => 'IMF, World Bank, SARB, National Treasury',
        ];
    }

    /** Sub-navigation of the public AIIM explorer. */
    public static function nav(): array
    {
        return [
            ['Map View', '/aiim/country/south-africa'], ['Opportunities', '/aiim/opportunities'], ['Projects', '/aiim/projects'],
            ['Investors', '/aiim/investors'], ['Funders', '/aiim/funders'], ['Trade Corridors', '/aiim/corridors'],
            ['Risk & Outlook', '/aiim/risk'], ['Sources & Evidence', '/aiim/sources/IMF-WEO-2025-04'], ['My Workspace', '/aiim/workspace'],
        ];
    }
}
