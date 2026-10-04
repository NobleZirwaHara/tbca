<?php

namespace App\Support\Aiim;

/**
 * Demo content for the enterprise, government/DFI and API desks and the staff
 * dashboards (from the AIIM mockups). Replaced by live aggregates as the backend
 * for those desks is built.
 */
class DeskData
{
    public static function enterprise(): array
    {
        return [
            'org' => ['name' => 'Ubuntu Energy Group (Pty) Ltd', 'id' => 'ENT-2025-0007', 'industry' => 'Energy & Utilities', 'country' => 'South Africa'],
            'admin' => ['name' => 'Thabo Mokoena', 'title' => 'Head: Strategy & Investments', 'email' => 'thabo.mokoena@ubuntuenergy.co.za', 'phone' => '+27 82 555 0147'],
            'plan' => ['name' => 'Enterprise Annual Plan', 'valid' => '12 June 2026', 'renewal' => 'ON'],
            'value' => 1245000, 'paid' => 871500, 'balance' => 373500, 'mandates' => 8, 'units' => 3, 'members' => 24, 'users' => 18,
            'mandateRows' => [
                ['MND-2025-05-07-001', 'Market & Sector Deep Dive', 'Strategy & Projects', 'Verification', 48, '30 Jun 2025'],
                ['MND-2025-04-15-002', 'Renewable Energy Pipeline', 'Business Development', 'Partner Mapping', 62, '15 Jul 2025'],
                ['MND-2025-03-28-003', 'Investor Matching Programme', 'Capital Raising', 'Matching', 71, '20 Aug 2025'],
                ['MND-2025-03-10-004', 'Project Packaging Support', 'Strategy & Projects', 'Packaging', 55, '30 Jul 2025'],
                ['MND-2025-02-18-005', 'Due Diligence Coordination', 'Risk & Compliance', 'Due Diligence', 33, '15 Jul 2025'],
            ],
            'usage' => [['API Calls', 78450, 100000], ['Reports Generated', 24, 50], ['Data Exports', 18, 30], ['Team Seats', 18, 24], ['Watchlists', 7, 15]],
            'contacts' => [['Lerato Dlamini', 'Account Manager', 'lerato.dlamini@tbca.africa', '+27 82 555 0101'], ['Sipho Maseko', 'Lead Advisor', 'sipho.maseko@tbca.africa', '+27 82 555 0102'], ['Nomsa Khumalo', 'Support Specialist', 'support@tbca.africa', '+27 87 550 0010']],
            'activity' => [['Market & Sector Deep Dive report delivered', '08 May 2025 14:32'], ['New mandate "Hydrogen Opportunity Scan" created', '07 May 2025 10:15'], ['Team member Sipho Nkosi added to Capital Raising unit', '06 May 2025 16:45'], ['API integration with internal system updated', '05 May 2025 11:20']],
            'billing' => [['Plan Fee (Annual)', 1000000], ['Add-ons', 175000]],
        ];
    }

    public static function institutional(): array
    {
        return [
            'org' => ['name' => 'Department of Trade, Industry and Competition (DTIC)', 'type' => 'Government Department', 'country' => 'South Africa'],
            'admin' => ['name' => 'Nomsa Dlamini', 'title' => 'Director: Investment Facilitation', 'email' => 'nomsa.dlamini@dtic.gov.za', 'phone' => '+27 12 394 1532'],
            'plan' => ['name' => 'Government Annual Plan', 'valid' => '12 June 2026', 'renewal' => 'ON', 'account' => 'GOV-SA-2026-00021'],
            'value' => 987600, 'paid' => 691320, 'balance' => 296280, 'mandates' => 12, 'sectors' => 4, 'departments' => 3, 'projects' => 24,
            'priority' => [['Renewable Energy', 10], ['Infrastructure', 6], ['Manufacturing', 4], ['Agri-Processing', 3], ['Digital Economy', 1]],
            'pipeline' => [['Total Projects', 24], ['Bankable Stage', 8], ['In Development', 6], ['Early Stage', 10]],
            'capital' => ['required' => 'ZAR 78.4B', 'interest' => 'ZAR 42.7B'],
            'investorInterest' => [['Development Finance Institutions', 42], ['Private Investors', 33], ['Commercial Banks', 15], ['Impact Investors', 10]],
            'activity' => [['New mandate "Green Hydrogen Hub" created', 'Department of Mineral Resources & Energy', 'Today, 10:24'], ['Project "Boegoebaai Green Ammonia" updated to Bankable Stage', 'Renewable Energy', 'Today, 09:15'], ['Stakeholder "IDC" engaged on Infrastructure Portfolio', 'Investor Engagement', 'Yesterday, 16:45'], ['Priority Report "SA Investment Priorities 2026" generated', 'Reports & Deliverables', 'Yesterday, 14:30']],
            'milestones' => [['20 May 2025', 'Stakeholder Roundtable: Renewable Energy', 'Engagement with DFIs and Private Investors', 'Upcoming'], ['28 May 2025', 'Infrastructure Portfolio Review Meeting', 'National Treasury & DPME', 'Upcoming'], ['05 Jun 2025', 'Investor Roadshow: Manufacturing Opportunities', 'Johannesburg', 'Upcoming'], ['12 Jun 2025', 'Subscription Renewal', 'Government Annual Plan', 'Renewal']],
            'alerts' => [['Update: Renewable Energy Procurement Policy', 'Published 02 May 2025', 'warn'], ['Risk: Eskom Grid Capacity Constraints in Northern Cape', 'Impact on project timelines', 'bad'], ['Incentive: Green Hydrogen Incentive Scheme Extended', 'Valid until 31 December 2026', 'good']],
        ];
    }

    public static function developer(): array
    {
        return [
            'org' => ['name' => 'Ubuntu Insights (Pty) Ltd', 'licence' => 'API & White-Label Enterprise', 'account' => 'API-SA-ENT-00027', 'country' => 'South Africa'],
            'contact' => ['name' => 'Sipho Maseko', 'title' => 'CTO', 'email' => 'sipho.maseko@ubuntuinsights.co.za', 'phone' => '+27 82 555 0147'],
            'plan' => ['name' => 'Enterprise API Plan', 'valid' => '12 June 2026', 'renewal' => 'ON'],
            'monthly' => 185000, 'paid' => 111000, 'balance' => 74000, 'calls' => [812450, 2000000], 'exports' => [64, 200],
            'access' => [['Base URL', 'https://api.aiim.africa/v1'], ['Authentication', 'API Key (Bearer Token)'], ['Environment', 'Production'], ['Status', 'Active'], ['Last Successful Call', '12 May 2025 14:32'], ['Documentation', 'v1.3.2']],
            'endpoints' => [['/opportunities/search', 182450, 99.2], ['/projects/details', 145220, 98.7], ['/investors/search', 98310, 99.1], ['/funders/search', 76890, 99.0], ['/reports/generate', 64120, 97.6]],
            'limits' => [['Standard Endpoints', 2000, 812], ['Search Endpoints', 1000, 312], ['Reports & Exports', 500, 64], ['Authentication', 200, 18]],
            'whiteLabel' => ['brand' => 'Ubuntu Insights', 'logo' => 'ubuntu-insights-logo.png', 'colour' => '#5821B6', 'domain' => 'insights.ubuntu.co.za', 'status' => 'Active'],
            'integrations' => [['Zoho CRM', '12 May 2025 13:45'], ['Microsoft Power BI', '12 May 2025 12:10'], ['Slack Alerts', '12 May 2025 14:20']],
        ];
    }

    public static function advisor(): array
    {
        return [
            'kpis' => [['Active Mandates', 18, 'Across 6 sectors'], ['Active Clients', 24, '8 new this month'], ['Introductions', 7, '3 pending acceptance'], ['Deliverables In Progress', 13, '4 due this week'], ['Pending Approvals', 5, 'Awaiting approval'], ['Tasks Due This Week', 9, 'Across all mandates']],
            'byStage' => [['Discovery', 3], ['Research', 4], ['Verification', 3], ['Packaging', 4], ['Closed', 4]],
            'pipeline' => [['Identified', 26], ['In Discovery', 14], ['In Progress', 18], ['In Packaging', 9], ['Closed (This Month)', 6]],
            'bySector' => [['Renewable Energy', 6], ['Infrastructure', 4], ['Manufacturing', 3], ['Agriculture', 2], ['Other Sectors', 3]],
            'tasks' => [['Review verification findings', 'Renewable Energy Corp', '15 May 2025', 'High'], ['Approve market report', 'GreenPower Investments', '16 May 2025', 'Medium'], ['Client introduction follow-up', 'DBSA Development Partners', '17 May 2025', 'Medium'], ['Update financial model', 'Northern Cape Solar Holdings', '19 May 2025', 'Low'], ['Prepare investor pack', 'Infrastructure Africa Fund', '20 May 2025', 'Low']],
            'meetings' => [['15 May', 'Mandate Review – GreenPower Investments', '10:00', 'Confirmed'], ['16 May', 'Strategy Session – DBSA Development Partners', '09:00', 'Confirmed'], ['19 May', 'Market Briefing – Renewable Energy Corp', '11:00', 'Pending']],
            'performance' => [['Mandates Won', '6', '↑ 33% vs last month'], ['Client Satisfaction', '4.8/5', '↑ 0.3 vs last month'], ['Reports Delivered', '14', '↑ 40% vs last month'], ['On-Time Delivery', '92%', '↑ 5% vs last month']],
        ];
    }

    public static function admin(): array
    {
        return [
            'kpis' => [['Total Registered Users', '12,842', '↑ 16% vs Apr 2025'], ['Active Clients', '3,245', '↑ 16% vs Apr 2025'], ['Active Advisors', '256', '↑ 12% vs Apr 2025'], ['Active Mandates', '1,248', '↑ 14% vs Apr 2025'], ['Opportunities in System', '24,316', '↑ 9% vs Apr 2025'], ['Verified Projects', '4,823', '↑ 11% vs Apr 2025'], ['Monthly Revenue (ex VAT)', 'ZAR 8,642,150', '↑ 22% vs Apr 2025'], ['System Uptime', '99.98%', 'This Month']],
            'growth' => [['Dec 2024', 6.2], ['Jan 2025', 8.1], ['Feb 2025', 9.6], ['Mar 2025', 11.2], ['Apr 2025', 12.1], ['May 2025', 12.8]],
            'health' => ['Platform Services', 'Database', 'AI Services', 'External Integrations', 'Payment Gateway', 'Notifications Service'],
            'topSources' => [['Eskom Grid Data', 89451], ['Stats SA', 76230], ['DMRE', 65812], ['National Treasury', 42188], ['IDC', 31774]],
        ];
    }
}
