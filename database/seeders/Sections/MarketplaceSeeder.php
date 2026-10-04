<?php

namespace Database\Seeders\Sections;

use App\Http\Controllers\Marketplace\ProviderApplicationController;
use App\Models\Marketplace\Brief;
use App\Models\Marketplace\Deliverable;
use App\Models\Marketplace\Dispute;
use App\Models\Marketplace\Earning;
use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\PartnerRequest;
use App\Models\Marketplace\Payout;
use App\Models\Marketplace\Proposal;
use App\Models\Marketplace\Provider;
use App\Models\Marketplace\Record;
use App\Models\Marketplace\Review;
use App\Models\User;
use App\Support\Marketplace\Pricing;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Marketplace + Partner Services demo data from the mockups. Idempotent.
 *
 * Accounts (password "Password123!"):
 *  - provider@alphafinance.co.za   Marketplace provider portal (Alpha Finance Solutions)
 *  - partner@enviroimpact.co.za    Partner Services workspace (EnviroImpact Solutions)
 */
class MarketplaceSeeder extends Seeder
{
    private User $client;

    public function run(): void
    {
        $this->client = User::firstOrCreate(['email' => 'amahle@agritechsa.co.za'], [
            'name' => 'Amahle Dlamini', 'password' => 'Password123!', 'client_id' => 'TBCA-C-000001', 'role' => 'client', 'company' => 'AgriTech SA',
        ]);

        $providers = $this->providers();
        $listings = $this->listings($providers);
        $this->reviews($listings, $providers);
        $this->briefsAndEngagements($providers, $listings);
        $partners = $this->partners();
        $this->partnerListings($partners);
        $this->partnerRequests($partners);
        $this->records();
    }

    private function user(string $email, string $name, string $company): User
    {
        return User::updateOrCreate(['email' => $email], ['name' => $name, 'password' => 'Password123!', 'role' => 'partner', 'company' => $company, 'country' => 'ZA']);
    }

    /* ------------------------------------------------------------------ providers */
    private function providers(): array
    {
        $alphaUser = $this->user('provider@alphafinance.co.za', 'Thabo Mokoena', 'Alpha Finance Solutions (Pty) Ltd');
        $checks = fn (int $verified) => collect(ProviderApplicationController::checklist())->map(fn ($c, $i) => [...$c, 'status' => $i < $verified ? 'verified' : 'pending', 'evidence' => $i < $verified ? Str::slug($c['area'], '_').'.pdf' : null])->all();

        $rows = [
            ['alpha-finance-solutions', 'FIN-PRV-001', 'Alpha Finance Solutions (Pty) Ltd', 'financial-advisory', 'Johannesburg', 'active', 'Gold', 4.7, 128, 48, 94, $alphaUser->id, [
                'categories' => ['financial-advisory', 'due-diligence'], 'skills' => ['Financial Modelling', 'Valuation (DCF, NPV, IRR)', 'Scenario Modelling', 'Risk Assessment', 'Business Planning'],
                'countries' => ['South Africa', 'Kenya', 'Botswana', 'Namibia', 'Ghana', 'Nigeria', 'Egypt', 'Morocco', 'Tanzania'], 'capacity' => 90, 'base_rate' => 7800, 'typical_days' => 10,
                'member_since' => '15 Mar 2023', 'response' => '2.4 hrs', 'last_active' => 'Yesterday', 'countries_served' => 9, 'bank' => 'First National Bank ••••1234',
                'metrics' => ['delivery' => 96, 'on_time' => 92, 'quality' => 4.8, 'response_rate' => 98, 'satisfaction' => 4.7, 'repeat' => 81, 'first_pass' => 88],
                'compliance' => [['KYC / Identity Verification', 'Verified'], ['Business Registration', 'Verified'], ['Tax Compliance', 'Verified'], ['Professional Certifications', '5 Verified'], ['Insurance Coverage', 'Verified'], ['Code of Conduct', 'Accepted'], ['Sanctions Screening', 'Clear'], ['Data Protection Compliance', 'Compliant']],
                'badges' => ['Top Rated Provider', 'Fast Responder', 'High Quality Delivery', 'Preferred Partner'],
                'key_services' => ['Financial Advisory', 'Due Diligence', 'Investment Analysis', 'Business Valuation', 'Risk Assessment', 'Feasibility Studies'],
                'rating_breakdown' => [5 => 94, 4 => 21, 3 => 8, 2 => 3, 1 => 2], 'tier_valid' => '30 Nov 2026', 'month_earnings' => 68450,
                'checklist' => [['Complete Business Profile', true], ['Upload Company Documents', true], ['Add Service Offerings', true], ['Set Availability', true], ['Add QA Evidence', true], ['Link Bank Details', false]],
                'expiries' => [['Verification Expiry', '12 May 2027', 'PASS'], ['Insurance Expiry', '22 Aug 2026', 'ACTION REQUIRED'], ['Agreement Renewal', '10 Nov 2026', 'UPCOMING'], ['Training / Calibration', '30 Oct 2026', 'DUE SOON']],
            ]],
            ['insight-partners-sa', 'FIN-PRV-006', 'Insight Partners SA', 'financial-advisory', 'Johannesburg', 'active', 'Gold', 4.9, 71, 39, 96, null, ['categories' => ['financial-advisory', 'market-research'], 'skills' => ['Financial Modelling', 'Industry Analysis', 'Data Analysis', 'Valuation (DCF, NPV, IRR)'], 'countries' => ['South Africa', 'Kenya'], 'capacity' => 75, 'base_rate' => 9500, 'typical_days' => 12, 'metrics' => ['delivery' => 97, 'on_time' => 94, 'quality' => 4.9, 'response_rate' => 97, 'satisfaction' => 4.8, 'repeat' => 78]]],
            ['alpha-capital-advisors', 'FIN-PRV-007', 'Alpha Capital Advisors', 'financial-advisory', 'Cape Town', 'active', 'Silver', 4.9, 67, 45, 92, null, ['categories' => ['financial-advisory'], 'skills' => ['Financial Modelling', 'Valuation (DCF, NPV, IRR)', 'Scenario Modelling'], 'countries' => ['South Africa'], 'capacity' => 85, 'base_rate' => 7200, 'typical_days' => 10]],
            ['value-metrics-group', 'FIN-PRV-008', 'Value Metrics Group', 'due-diligence', 'Pretoria', 'active', 'Silver', 4.8, 52, 30, 90, null, ['categories' => ['due-diligence', 'financial-advisory'], 'skills' => ['Risk Assessment', 'Valuation (DCF, NPV, IRR)', 'Regulatory Knowledge'], 'countries' => ['South Africa', 'Botswana'], 'capacity' => 60, 'base_rate' => 6900, 'typical_days' => 15]],
            ['greentech-engineering', 'TEC-PRV-002', 'GreenTech Engineering (Pty) Ltd', 'project-management', 'Durban', 'active', 'Silver', 4.6, 40, 26, 91, null, ['categories' => ['project-management', 'tech-digital'], 'skills' => ['Industry Analysis', 'Risk Assessment', 'Business Planning'], 'countries' => ['South Africa', 'Multiple Countries'], 'capacity' => 85, 'base_rate' => 9800, 'typical_days' => 14]],
            ['african-market-research-partners', 'MKT-PRV-009', 'African Market Research Partners (Pty) Ltd', 'market-research', 'Cape Town', 'active', 'Gold', 4.8, 88, 51, 95, null, ['categories' => ['market-research'], 'skills' => ['Industry Analysis', 'Data Analysis', 'Business Planning'], 'countries' => ['South Africa', 'Nigeria', 'Kenya', 'Ghana'], 'capacity' => 70, 'base_rate' => 11500, 'typical_days' => 12]],
            ['sustainmetrics-consulting', 'ESG-PRV-010', 'SustainMetrics Consulting', 'compliance-risk', 'Cape Town', 'active', 'Bronze', 4.4, 22, 14, 86, null, ['categories' => ['compliance-risk'], 'skills' => ['Risk Assessment', 'Regulatory Knowledge'], 'countries' => ['South Africa'], 'capacity' => 65, 'base_rate' => 6500, 'typical_days' => 10]],
            ['powergrid-solutions', 'ENE-PRV-011', 'PowerGrid Solutions (Pty) Ltd', 'project-management', 'Johannesburg', 'active', 'Silver', 4.5, 30, 19, 88, null, ['categories' => ['project-management'], 'skills' => ['Industry Analysis', 'Scenario Modelling'], 'countries' => ['South Africa'], 'capacity' => 55, 'base_rate' => 12500, 'typical_days' => 15]],
            ['legal-shield-advisors', 'LEG-PRV-003', 'Legal Shield Advisors', 'legal-contracts', 'Pretoria', 'verification', null, 4.3, 12, 6, 78, null, ['categories' => ['legal-contracts'], 'countries' => ['South Africa']]],
            ['solargrid-consultants', 'ENE-PRV-004', 'SolarGrid Consultants (Pty) Ltd', 'project-management', 'Cape Town', 'action_required', 'Bronze', 4.1, 9, 8, 62, null, ['categories' => ['project-management'], 'countries' => ['South Africa']]],
            ['buildright-projects', 'CON-PRV-005', 'BuildRight Projects (Pty) Ltd', 'project-management', 'Durban', 'suspended', 'Bronze', 3.6, 14, 11, 45, null, ['categories' => ['project-management'], 'countries' => ['South Africa']]],
            ['finmodel-pro', 'FIN-PRV-012', 'FinModel Pro (Pty) Ltd', 'financial-advisory', 'Sandton', 'applied', null, null, 0, 0, 20, null, ['categories' => ['financial-advisory'], 'countries' => ['South Africa']]],
        ];

        $out = [];
        foreach ($rows as $i => [$slug, $code, $name, $cat, $city, $status, $tier, $rating, $reviews, $eng, $score, $userId, $profile]) {
            $out[$slug] = Provider::updateOrCreate(['slug' => $slug], [
                'code' => $code, 'kind' => 'marketplace', 'user_id' => $userId, 'name' => $name, 'category' => $cat, 'city' => $city, 'country' => 'South Africa',
                'status' => $status, 'tier' => $tier, 'rating' => $rating, 'reviews_count' => $reviews, 'engagements_count' => $eng, 'score' => $score,
                'application_ref' => sprintf('PV-2026-%04d', 40 + $i + 2),
                'last_verified_at' => in_array($status, ['active', 'action_required', 'suspended'], true) ? now()->subDays(10 + $i) : null,
                'next_review_at' => now()->addDays([92, 90, 85, 70, 88, 60, 40, 30, 5, -2, 12, 21][$i]),
                'agreement_signed_at' => $status === 'active' ? now()->subMonths(5) : null,
                'profile' => $profile,
                'application' => ['services_applied' => ['Financial Model Review', 'Cash Flow Projection', 'Valuation Review'], 'business_type' => 'Pty Ltd', 'submitted' => '15 Aug 2026'],
                'vetting' => ['stage' => $status === 'active' ? 'Decision' : 'Document Review', 'checklist' => $checks($status === 'active' ? 8 : 2), 'reviewer' => 'TBCA Vetting Team', 'target' => now()->addDays(21)->format('d M Y'),
                    'activity' => [['at' => '18 Aug 2026, 10:15', 'body' => 'Documents uploaded by applicant'], ['at' => '18 Aug 2026, 11:02', 'body' => 'Document review started by TBCA Vetting Team'], ['at' => '18 Aug 2026, 14:47', 'body' => 'Business registration verified']]],
            ]);
        }

        return $out;
    }

    /* ------------------------------------------------------------------ listings */
    private function listings(array $p): array
    {
        $fixed = fn (array $extra = []) => [
            'features' => ['Bankability Check', 'Scenario Validation', 'Assumption Stress Test', 'Executive Summary Report', 'Formula & Logic Audit', 'QA Standard: MP-QA-MR-02 v2.1'],
            'delivery' => '5–7 Business Days', 'provider_type' => 'TBCA Approved Partner', 'ideal_for' => 'Investors, SMEs, Corporates', 'difficulty' => 'Medium', 'engagement' => 'Fixed Scope',
            'qa_standard' => 'MP-QA-MR-02 v2.1', 'certainty' => 'C2', 'overview' => 'Our experts perform a comprehensive review to ensure it is accurate, consistent and aligned with best practices. You receive a detailed report with findings, recommendations and improvement actions.',
            'get' => ['Detailed review report with issues and recommendations', 'Validated assumptions and scenario analysis', 'QA certificate upon successful review', '5–7 business day turnaround'],
            'for' => ['Startups seeking investor readiness', 'SMEs applying for funding or credit', 'Businesses preparing for transactions', 'Corporate finance teams'],
            'included' => ['Kick-off call and data request', 'Model structure and formula audit', 'Assumption and scenario testing', 'Findings report and executive summary', 'One consolidated correction cycle'],
            'deliverables' => ['Review report (PDF)', 'Annotated model with issue log', 'Executive summary (2 pages)', 'QA certificate'],
            'process' => ['Submit model & context', 'TBCA scoping & assignment', 'Specialist review under TBCA QA', 'QA pass & release', 'Walk-through call'],
            'requirements' => ['Model file (XLSX)', 'Key assumptions and source data', 'Intended use of the model', 'Contact for clarification questions'],
            'faqs' => [['How long does it take?', 'Five to seven business days after your data is received.'], ['Who performs the work?', 'A verified Marketplace provider, quality-assured by TBCA before release.'], ['Is this an audit opinion?', 'No. It is an expert review, not a regulated audit or professional opinion.']],
            ...$extra,
        ];
        $rows = [
            ['financial-model-review', 'fixed', 'alpha-finance-solutions', 'Financial Model Review', 'financial-advisory', 'Valuation & Financial Modeling', 'Independent review of your financial model for accuracy, integrity and bankability. We assess assumptions, formulas, structure and outputs to ensure your model is robust and decision-ready.', 18000, null, 4.8, 127, 98, 'Best Seller', $fixed()],
            ['monthly-financial-reporting-review', 'recurring', 'alpha-finance-solutions', 'Monthly Financial Reporting & Review', 'financial-advisory', 'Retainers & Ongoing Services', 'Stay in control of your numbers. We prepare monthly management accounts, cash flow updates and variance analysis, with expert review and actionable insights to support better decisions.', 7500, 'month', 4.8, 94, 90, 'Recurring Service', $fixed([
                'features' => ['Monthly Management Accounts', 'KPI Dashboard & Insights', 'Cash Flow Monitoring', 'Quarterly Review Meeting', 'Variance & Trend Analysis', 'Secure Document Archive'],
                'delivery' => 'Monthly (Ongoing)', 'engagement' => 'Retainer (Recurring)', 'cancellation' => "30 Days' Notice", 'ideal_for' => 'SMEs, Startups, Corporates', 'allowance' => 'Includes up to 10 transactions per month. Additional transactions at agreed rate.',
                'get' => ['Monthly management accounts (P&L, BS, CF)', 'Cash flow forecast & actuals', 'Variance analysis & explanations', 'KPI dashboard with key metrics', 'Quarterly performance review meeting', 'Secure archive of all reports'],
                'how' => ['We collect your data and documents', 'We prepare reports and perform analysis', 'We review results with you and your team', 'You make better decisions with confidence'],
                'included_icons' => ['Monthly Reports', 'Expert Review', 'Data Security', 'Ongoing Support'],
            ])],
            ['cash-flow-projection', 'fixed', 'alpha-finance-solutions', 'Cash Flow Projection (24 Months)', 'financial-advisory', 'Cash Flow & Forecasting', 'A lender-ready 24-month cash flow projection built from your actuals and growth plan, with scenario toggles and a narrative.', 12500, null, 4.7, 58, 80, null, $fixed(['delivery' => '7–10 Business Days'])],
            ['business-valuation-review', 'fixed', 'value-metrics-group', 'Business Valuation Review', 'financial-advisory', 'Valuation & Financial Modeling', 'DCF and market-multiple valuation range with sensitivity analysis and a valuation memo suitable for negotiations.', 24500, null, 4.8, 41, 76, 'Popular', $fixed(['delivery' => '10 Business Days', 'difficulty' => 'High'])],
            ['commercial-due-diligence', 'fixed', 'value-metrics-group', 'Commercial Due Diligence Pack', 'due-diligence', 'Transaction Support', 'Market, customer and competitive due diligence to support an acquisition or investment decision.', 42000, null, 4.6, 19, 60, null, $fixed(['delivery' => '15 Business Days', 'difficulty' => 'High'])],
            ['market-entry-study', 'fixed', 'african-market-research-partners', 'Market Entry Study', 'market-research', 'Market Studies', 'Market sizing, regulatory scan, competitor landscape and go-to-market recommendations for one African country.', 32000, null, 4.8, 63, 85, 'Best Seller', $fixed(['delivery' => '12 Business Days'])],
            ['competitor-intelligence-brief', 'fixed', 'african-market-research-partners', 'Competitor Intelligence Brief', 'market-research', 'Competitive Intelligence', 'Profiles of up to eight competitors with positioning, pricing and capability benchmarks.', 14500, null, 4.6, 27, 55, null, $fixed(['delivery' => '7 Business Days', 'difficulty' => 'Low'])],
            ['project-pmo-setup', 'fixed', 'greentech-engineering', 'Project PMO Setup', 'project-management', 'PMO & Governance', 'Stand up a lightweight PMO: governance, plans, RAID log, reporting cadence and dashboards.', 28000, null, 4.5, 22, 50, null, $fixed(['delivery' => '10 Business Days'])],
            ['monthly-project-reporting', 'recurring', 'greentech-engineering', 'Monthly Project Monitoring & Reporting', 'project-management', 'Retainers & Ongoing Services', 'Monthly progress tracking, risk reviews and board-ready reporting for capital projects.', 9500, 'month', 4.4, 16, 40, 'Recurring Service', $fixed(['delivery' => 'Monthly (Ongoing)', 'engagement' => 'Retainer (Recurring)', 'cancellation' => "30 Days' Notice"])],
            ['popia-compliance-review', 'fixed', 'sustainmetrics-consulting', 'POPIA Compliance Gap Review', 'compliance-risk', 'Data Privacy', 'Gap assessment against POPIA with prioritised remediation plan and policy templates.', 16500, null, 4.5, 31, 65, null, $fixed(['delivery' => '7 Business Days'])],
            ['risk-register-build', 'fixed', 'sustainmetrics-consulting', 'Enterprise Risk Register Build', 'compliance-risk', 'Risk Management', 'Facilitated risk identification, scoring and a living risk register with owners and controls.', 19500, null, 4.3, 12, 35, null, $fixed()],
            ['grid-connection-study', 'fixed', 'powergrid-solutions', 'Grid Connection Pre-Feasibility', 'tech-digital', 'Energy & Infrastructure', 'Desktop grid connection pre-feasibility for renewable projects, including capacity screening and next steps.', 36000, null, 4.5, 9, 30, 'New', $fixed(['delivery' => '15 Business Days', 'difficulty' => 'High'])],
            ['process-automation-sprint', 'fixed', 'greentech-engineering', 'Process Automation Assessment', 'automation-ai', 'Automation & AI', 'Map two core processes, quantify automation potential and deliver a prioritised automation roadmap.', 22000, null, 4.6, 18, 45, null, $fixed()],
            ['legal-contract-pack', 'fixed', 'legal-shield-advisors', 'Commercial Contract Template Pack', 'legal-contracts', 'Contracts & Agreements', 'Customised supply, services and NDA templates for SMEs (non-regulated drafting support).', 8500, null, 4.2, 6, 20, null, $fixed()],
        ];

        $out = [];
        foreach ($rows as [$slug, $kind, $provider, $title, $cat, $sub, $summary, $price, $period, $rating, $reviews, $pop, $badge, $details]) {
            $out[$slug] = Listing::updateOrCreate(['slug' => $slug], [
                'kind' => $kind, 'provider_id' => $p[$provider]->id, 'title' => $title, 'category' => $cat, 'subcategory' => $sub, 'summary' => $summary,
                'price_zar' => $price, 'period' => $period, 'rating' => $rating, 'reviews_count' => $reviews, 'popularity' => $pop, 'badge' => $badge,
                'status' => $slug === 'legal-contract-pack' ? 'pending' : 'published', 'details' => $details,
            ]);
        }

        return $out;
    }

    private function reviews(array $l, array $p): void
    {
        $rows = [
            ['financial-model-review', 'GreenCity Developments', 5, 'Excellent financial modeling and deep industry insights. Highly recommended.'],
            ['financial-model-review', 'SolarTech Africa', 5, 'Provided exceptional due diligence support. Very thorough and responsive throughout.'],
            ['financial-model-review', 'AgriGrowth Ltd', 4, 'Great strategic advice and market analysis. Would definitely recommend.'],
            ['monthly-financial-reporting-review', 'Sunrise Manufacturing', 5, 'Monthly packs arrive on time and the variance commentary is genuinely useful.'],
            ['market-entry-study', 'TechNova Solutions', 5, 'Clear market sizing and a practical entry plan for Kenya.'],
        ];
        foreach ($rows as $i => [$slug, $company, $rating, $body]) {
            Review::updateOrCreate(['listing_id' => $l[$slug]->id, 'company' => $company], [
                'provider_id' => $l[$slug]->provider_id, 'author' => $company, 'rating' => $rating, 'body' => $body, 'status' => 'published',
                'created_at' => now()->subDays(5 + $i * 3),
            ]);
        }
    }

    /* ------------------------------------------------------------------ briefs, engagements */
    private function briefsAndEngagements(array $p, array $l): void
    {
        $alpha = $p['alpha-finance-solutions'];

        // Amahle's brief awaiting buyer confirmation (MP04).
        $scope = [
            'price_version' => 'PV-03', 'gate' => 'GATE-MP-24',
            'methodology' => 'TBCA Commercial Feasibility Methodology v2.1 (QA-MP-07)',
            'objective' => 'Assess the commercial viability and investment case for expanding solar mini-grid coverage in target communities.',
            'summary' => 'Evaluate market demand, financial viability, key assumptions, risks and provide actionable recommendations.',
            'scope_items' => ['Market and commercial assessment', 'Financial model review', 'Assumption testing', 'Sensitivity analysis', 'Executive memo and recommendations'],
            'deliverables' => ['Financial model review note', 'Commercial feasibility memo', 'Risk and assumptions summary', 'Executive briefing PDF'],
            'exclusions' => ['No legal opinion', 'No tax opinion', 'No engineering certification', 'No lender due diligence report'],
            'assumptions' => ['Buyer provides source data by stated deadline', 'Work limited to supplied scope', 'One consolidated correction cycle included', 'Professional adoption required if regulated conclusions arise'],
            'timing' => ['kickoff' => 'After payment clearance', 'turnaround' => '10 business days', 'buyer_data_due' => '26 May 2026', 'draft' => '9 Jun 2026', 'final' => '13 Jun 2026'],
            'qa' => ['standard' => 'QA-MP-07', 'human_review' => 'Required', 'rights' => 'Required', 'release' => 'No release before QA pass', 'professional' => 'Not Required for current scope'],
            'delivery_class' => 'Standard', 'qa_class' => 'Human Review',
            'ledgers' => ['a' => 18500, 'b' => 4250, 'c' => 7800, 'c_state' => 'estimated_cap'],
            'floor' => ['status' => 'PASS', 'floor' => 18250, 'target' => 23000, 'cts' => 7300, 'benchmark' => 28750],
            'provider_selection' => 'Not Yet Selected',
        ];
        $brief = Brief::updateOrCreate(['reference' => 'BRF-2026-00421'], [
            'user_id' => $this->client->id, 'title' => 'Commercial Feasibility Review for Solar Mini-Grid Expansion', 'category' => 'financial-advisory',
            'client_name' => 'AgriTech SA', 'status' => 'awaiting_buyer_confirmation', 'step' => 5, 'open_to_providers' => true, 'priority_score' => 72,
            'data' => ['title' => 'Commercial Feasibility Review for Solar Mini-Grid Expansion', 'description' => 'Assess the commercial viability and investment case for expanding solar mini-grid coverage in target communities in the Northern Cape.', 'industry' => 'Energy & Infrastructure', 'country' => 'South Africa', 'intended_use' => 'Internal decision making', 'category' => 'financial-advisory', 'urgency' => 'priority', 'budget' => '30-75k', 'delivery_date' => '2026-06-13', 'data_class' => 'confidential', 'vdr' => 'read-only', 'outcome' => 'Investment decision and stakeholder alignment', 'stage' => 'Growth', 'scope' => 'Market assessment; model review', 'deliverables' => 'Memo; briefing', 'skills' => ['Financial Modelling', 'Industry Analysis', 'Scenario Modelling'], 'complexity' => 'medium', 'deadline' => '14-30', 'procurement' => 'Subcontracting permitted with disclosure only', 'authority' => 'Managing Director'],
            'scope' => $scope,
        ]);
        foreach ([['insight-partners-sa', 7500, 12, 96], ['alpha-capital-advisors', 7200, 10, 98], ['african-market-research-partners', 12000, 12, 84]] as [$slug, $rate, $days, $match]) {
            Proposal::updateOrCreate(['brief_id' => $brief->id, 'provider_id' => $p[$slug]->id], ['rate_zar' => $rate, 'days' => $days, 'match_score' => $match, 'status' => 'submitted', 'note' => 'Experienced team with directly relevant renewable-energy feasibility work.']);
        }

        // Open briefs on the provider opportunity feed (MP14/MP19).
        $open = [
            ['BRF-2026-0091', 'Business Valuation Review', 'financial-advisory', '15-30k', 'South Africa', 'Financial Services', 'NEW'],
            ['BRF-2026-0087', 'Financial Due Diligence', 'due-diligence', '30-75k', 'South Africa', 'Manufacturing', 'POPULAR'],
            ['BRF-2026-0093', 'Scenario & Sensitivity Analysis', 'financial-advisory', '15-30k', 'Kenya', 'Agriculture & Agribusiness', 'NEW'],
            ['BRF-2026-0095', 'Solar PV Power Plant Development – Investment Case', 'financial-advisory', '75-150k', 'South Africa', 'Energy & Infrastructure', 'HIGH PRIORITY'],
            ['BRF-2026-0096', 'Agri-Processing Facility Partnership Feasibility', 'market-research', '30-75k', 'Ghana', 'Agriculture & Agribusiness', 'FEATURED'],
            ['BRF-2026-0097', 'Highway Infrastructure PPP Market Sounding', 'project-management', '150k-plus', 'Nigeria', 'Public Sector', 'NEW'],
            ['BRF-2026-0098', 'Digital Skills Training Program Evaluation', 'market-research', '15-30k', 'Multiple Countries', 'Technology & Digital', 'MATCHED'],
        ];
        foreach ($open as $i => [$ref, $title, $cat, $budget, $country, $industry, $flag]) {
            $env = Pricing::envelope($cat, $i % 2 ? 'high' : 'medium');
            Brief::updateOrCreate(['reference' => $ref], [
                'title' => $title, 'category' => $cat, 'client_name' => ['GreenCity Developments', 'Sunrise Manufacturing', 'AgriGrowth (Pty) Ltd', 'Solar Future (Pty) Ltd', 'Kumasi Agro Holdings', 'Lagos State PPP Office', 'SkillsBridge Africa'][$i],
                'status' => 'awaiting_buyer_confirmation', 'step' => 5, 'open_to_providers' => true, 'priority_score' => [55, 62, 48, 92, 70, 78, 60][$i],
                'data' => ['title' => $title, 'description' => "{$title} for a client in {$country}. Provider to work under TBCA QA standard and controlled data access.", 'category' => $cat, 'budget' => $budget, 'country' => $country, 'industry' => $industry, 'skills' => ['Financial Modelling', 'Industry Analysis'], 'complexity' => $i % 2 ? 'high' : 'medium', 'urgency' => 'standard', 'flag' => $flag, 'delivery_date' => now()->addDays(20 + $i)->format('Y-m-d'), 'deadline' => '14-30', 'data_class' => 'confidential', 'vdr' => 'read-only'],
                'scope' => ['price_version' => 'PV-01', 'ledgers' => ['a' => $env['a'], 'b' => $env['b'], 'c' => $env['c'], 'c_state' => 'estimated_cap'], 'floor' => ['status' => 'PASS', 'floor' => $env['floor']], 'qa' => ['standard' => 'QA-MP-07', 'human_review' => 'Required', 'release' => 'No release before QA pass'], 'scope_items' => ['Assessment against brief objective', 'Assumption testing', 'Executive memo'], 'deliverables' => ['Review note', 'Executive briefing PDF'], 'methodology' => 'TBCA Methodology v2.1 (QA-MP-07)', 'timing' => ['turnaround' => '10 business days']],
                'created_at' => now()->subHours(2 + $i * 2),
            ]);
        }

        // Engagements for Alpha Finance (provider dashboard) — ENG-2026-0048 belongs to Amahle (client tracker demo).
        $engs = [
            ['ENG-2026-0048', 'Financial Model Review', 'GreenCity Developments', 'in_qa', 65, '2026-08-20', 22500, 'high', $this->client->id, 'financial-model-review'],
            ['ENG-2026-0042', 'Cash Flow Projection', 'Sunrise Manufacturing', 'in_progress', 40, '2026-08-22', 12500, 'medium', null, 'cash-flow-projection'],
            ['ENG-2026-0037', 'Valuation Review', 'AgriGrowth (Pty) Ltd', 'released', 90, '2026-08-18', 24500, 'medium', $this->client->id, 'business-valuation-review'],
            ['ENG-2026-0021', 'Feasibility Assessment', 'TechNova Solutions', 'closed', 100, '2026-08-10', 30000, 'low', null, null],
            ['ENG-2026-0013', 'Scenario Analysis', 'BuildRight Projects', 'corrections', 25, '2026-08-25', 15000, 'medium', null, null],
        ];
        $timeline = [
            ['at' => '16 Aug 2026, 09:15', 'event' => 'QA Review Started', 'description' => 'Deliverable received and QA review initiated', 'owner' => 'Nokuthula Dlamini', 'status' => 'in_progress'],
            ['at' => '15 Aug 2026, 16:30', 'event' => 'Provider Submission', 'description' => 'Provider submitted deliverable v1.0 for review', 'owner' => 'Alpha Finance Solutions', 'status' => 'completed'],
            ['at' => '14 Aug 2026, 10:00', 'event' => 'Work Commenced', 'description' => 'Provider started work on agreed deliverables', 'owner' => 'Alpha Finance Solutions', 'status' => 'completed'],
            ['at' => '13 Aug 2026, 14:20', 'event' => 'Provider Assigned', 'description' => 'Alpha Finance Solutions assigned to engagement', 'owner' => 'TBCA Marketplace', 'status' => 'completed'],
        ];
        foreach ($engs as $i => [$ref, $title, $clientName, $stage, $progress, $target, $value, $prio, $userId, $listing]) {
            $e = Engagement::updateOrCreate(['reference' => $ref], [
                'assignment_ref' => sprintf('ASN-2026-%04d', 110 + $i), 'listing_id' => $listing ? $l[$listing]->id : null, 'user_id' => $userId, 'provider_id' => $alpha->id,
                'title' => $title, 'service' => $title, 'category' => 'financial-advisory', 'client_name' => $clientName, 'stage' => $stage, 'priority' => $prio,
                'progress' => $progress, 'value_zar' => $value, 'provider_rate_zar' => (int) round($value * 0.8), 'payment_state' => $stage === 'closed' ? 'paid' : 'pay_on_qa',
                'qa_standard' => 'MP-QA-MR-02 v2.1', 'target_date' => $target,
                'meta' => ['timeline' => $timeline, 'budget' => 'ZAR 18,000 – 25,000', 'forecast' => 'On Track', 'reviewer' => 'Nokuthula Dlamini',
                    'documents' => [['Contract & Scope', 'Approved'], ['Provider Work Plan', 'Received'], ['Deliverable v1.0', $stage === 'in_qa' ? 'Under Review' : 'Received'], ['Evidence Pack', 'Pending']],
                    'scope_items' => ['Financial Model Structure', 'Assumptions Register', 'Scenario Analysis (3 Cases)', 'Cash Flow Projections', 'Executive Summary'],
                    'corrections' => $stage === 'corrections' || $ref === 'ENG-2026-0048' ? [['MIN-001', 'Minor', 'Data', 'Provide additional data on energy demand projections', 'Attach latest demand forecast data', 'Open', '28 Aug 2026'], ['MIN-002', 'Minor', 'Risk Assessment', 'Include more details on grid connection risks', 'Update risk assessment section', 'Open', '28 Aug 2026']] : [],
                    'payment_plan' => ['plan' => '50% upfront, 50% on acceptance', 'paid' => $value / 2, 'due' => $value / 2, 'method' => 'Bank Transfer', 'txn' => 'TXN-20260826-0017', 'invoice' => 'INV-2026-0348'],
                ],
            ]);

            if (in_array($stage, ['in_qa', 'released', 'closed', 'corrections'], true)) {
                $status = ['in_qa' => 'submitted', 'released' => 'released', 'closed' => 'accepted', 'corrections' => 'returned_r1'][$stage];
                $qa = $status === 'submitted' ? [] : ['outcome' => 'Passed', 'record' => 'QAR-2026-0198', 'date' => '17 Aug 2026', 'score' => 92, 'requirements' => '12 / 12', 'accuracy' => '98%', 'reviewer' => 'Nokuthula Dlamini',
                    'checks' => ['Methodology Check' => 'Passed', 'Accuracy Check' => 'Passed', 'Evidence Check' => 'Passed', 'Scope Match' => 'Passed', 'Formatting Check' => 'Passed', 'Privacy Check' => 'Passed'],
                    'evidence' => ['QA_Checklist_'.$ref.'.pdf', 'Data_Validation_Report.pdf', 'Methodology_Review_Summary.pdf', 'Traceability_Matrix.xlsx']];
                Deliverable::updateOrCreate(['reference' => sprintf('DEL-2026-%04d', 112 + $i)], [
                    'engagement_id' => $e->id, 'file_name' => str_replace(' ', '_', $title).'_v1.0.pdf', 'version' => '1.0', 'status' => $status,
                    'reviewer' => 'Nokuthula Dlamini', 'qa' => $qa, 'submitted_at' => now()->subHours(20 + $i * 7),
                    'meta' => ['notes' => 'Version 1.0 submitted for your review. We welcome any feedback or requests for refinement.', 'submission_ref' => 'SUB-2026-0224'.$i, 'type' => 'Final Deliverable', 'size' => '12.4 MB', 'pages' => 38, 'submitted_by' => 'Alpha Finance Solutions'],
                ]);
            }
        }

        // QA queue items from other providers (MP29).
        $qa = [
            ['ENG-2026-0053', 'Feasibility Study - Industrial Park', 'greentech-engineering', 'TA-QA-02', 'medium'],
            ['ENG-2026-0057', 'ESG Impact Assessment', 'sustainmetrics-consulting', 'TA-QA-05', 'low'],
            ['ENG-2026-0061', 'Grid Connection Study', 'powergrid-solutions', 'TA-QA-03', 'high'],
            ['ENG-2026-0068', 'Commercial Due Diligence', 'value-metrics-group', 'TA-QA-02', 'high'],
        ];
        foreach ($qa as $i => [$ref, $title, $slug, $std, $prio]) {
            $e = Engagement::updateOrCreate(['reference' => $ref], [
                'assignment_ref' => sprintf('ASN-2026-%04d', 130 + $i), 'provider_id' => $p[$slug]->id, 'title' => $title, 'service' => $title, 'category' => $p[$slug]->category,
                'client_name' => ['Coega Industrial', 'Ubuntu Mining', 'Eskom Distribution', 'Sasol Ventures'][$i], 'stage' => 'in_qa', 'priority' => $prio, 'progress' => 70,
                'value_zar' => [180000, 96750, 248500, 142000][$i], 'provider_rate_zar' => [142000, 76000, 186000, 110000][$i], 'qa_standard' => $std, 'target_date' => now()->addDays(5 + $i),
                'meta' => ['timeline' => []],
            ]);
            Deliverable::updateOrCreate(['reference' => sprintf('DEL-2026-%04d', 130 + $i)], [
                'engagement_id' => $e->id, 'file_name' => Str::slug($title, '_').'_v1.0.pdf', 'version' => '1.0', 'status' => $i === 2 ? 'in_review' : 'submitted',
                'submitted_at' => now()->subHours([5, 3, 50, 30][$i]), 'meta' => ['type' => 'Final Deliverable'],
            ]);
            Payout::updateOrCreate(['reference' => $ref.'-202608'], [
                'provider_id' => $p[$slug]->id, 'engagement_id' => $e->id, 'earnings_zar' => [142000, 96750, 248500, 87250][$i], 'fee_zar' => [21300, 14512.5, 37275, 13087.5][$i],
                'vat_zar' => [18540, 12638.75, 32486.25, 11398.75][$i], 'amount_zar' => [102160, 69598.75, 178738.75, 62763.75][$i],
                'method' => $i === 3 ? 'EFT' : 'Bank Transfer', 'account' => ['FNB ••••7890', 'Nedbank ••••1122', 'Standard Bank ••••3344', 'Capitec ••••7788'][$i],
                'status' => ['ready', 'ready', 'scheduled', 'held'][$i], 'available_from' => now()->addDays($i < 2 ? 0 : 1),
            ]);
        }

        // Alpha payouts + earnings for statements (MP23).
        $e48 = Engagement::where('reference', 'ENG-2026-0048')->first();
        Payout::updateOrCreate(['reference' => 'ENG-2026-0048-202608'], [
            'provider_id' => $alpha->id, 'engagement_id' => $e48->id, 'earnings_zar' => 185750, 'fee_zar' => 27862.5, 'vat_zar' => 23493.75, 'amount_zar' => 134393.75,
            'method' => 'Bank Transfer', 'account' => 'ABSA ••••4567', 'status' => 'ready', 'available_from' => now(),
        ]);
        $e21 = Engagement::where('reference', 'ENG-2026-0021')->first();
        Payout::updateOrCreate(['reference' => 'ENG-2026-0021-202607'], [
            'provider_id' => $alpha->id, 'engagement_id' => $e21->id, 'earnings_zar' => 21600, 'fee_zar' => 2400, 'vat_zar' => 3240, 'amount_zar' => 24840,
            'method' => 'Bank Transfer', 'account' => 'FNB ••••1234', 'status' => 'paid', 'available_from' => now()->subMonth(), 'paid_at' => now()->subWeeks(3),
        ]);

        $month = now()->startOfMonth();
        $earn = [
            ['Feasibility & Technical Studies', 90000, 'INV-2026-0312'], ['Financial Modeling & Analysis', 60000, 'INV-2026-0321'],
            ['Risk Assessment & Due Diligence', 45000, 'INV-2026-0334'], ['Project Roadmap & Advisory', 30000, 'INV-2026-0334'],
        ];
        foreach ($earn as $i => [$cat, $amt, $inv]) {
            Earning::updateOrCreate(['provider_id' => $alpha->id, 'category' => $cat, 'occurred_on' => $month->copy()->addDays(2 + $i)->toDateString()], ['engagement_id' => $e48->id, 'kind' => 'billing', 'description' => $cat, 'amount_zar' => $amt, 'invoice' => $inv]);
        }
        Earning::updateOrCreate(['provider_id' => $alpha->id, 'category' => 'Client Refund', 'occurred_on' => $month->copy()->addDays(19)->toDateString()], ['kind' => 'adjustment', 'description' => 'Partial refund for revised scope - Grid Connection Study', 'amount_zar' => -2000]);
        Earning::updateOrCreate(['provider_id' => $alpha->id, 'category' => 'Chargeback Reserve', 'occurred_on' => $month->copy()->addDays(20)->toDateString()], ['kind' => 'adjustment', 'description' => 'Payment processor reserve (1%)', 'amount_zar' => -500]);
        foreach ([5 => 70000, 4 => 90000, 3 => 125000, 2 => 140000, 1 => 190000] as $back => $amt) {
            Earning::updateOrCreate(['provider_id' => $alpha->id, 'category' => 'Financial Modeling & Analysis', 'occurred_on' => $month->copy()->subMonths($back)->addDays(10)->toDateString()], ['kind' => 'billing', 'description' => 'Monthly billing', 'amount_zar' => $amt, 'invoice' => 'INV-2026-02'.$back.'0']);
        }

        // Disputes (MP11 / MP34).
        Dispute::updateOrCreate(['reference' => 'DIS-2026-0003'], [
            'kind' => 'dispute', 'engagement_id' => Engagement::where('reference', 'ENG-2026-0037')->value('id'), 'user_id' => $this->client->id, 'provider_id' => $alpha->id,
            'type' => 'Quality / Deliverable', 'priority' => 'high', 'subject' => 'The deliverable does not meet the agreed scope and quality standards.',
            'description' => 'Key assumptions in the model are incorrect and sensitivity analysis is incomplete.', 'amount_zar' => 18000, 'status' => 'under_review',
            'response_due_at' => now()->addDays(3),
            'meta' => ['resolution_sought' => 'Revised model with corrected assumptions and complete sensitivity analysis.', 'raised_by' => 'You (Client)', 'linked_deliverable' => 'Valuation_Review_v1.0.pdf', 'linked_stage' => 'Deliverable Received',
                'timeline' => [['at' => '18 Aug 2026, 14:30', 'title' => 'Dispute Raised', 'body' => 'You raised a dispute.'], ['at' => '18 Aug 2026, 15:10', 'title' => 'Acknowledged', 'body' => 'TBCA acknowledged the dispute.'], ['at' => '20 Aug 2026, 09:20', 'title' => 'Under Review', 'body' => 'Review panel is assessing the dispute.']],
                'messages' => [['from' => 'TBCA Dispute Team', 'role' => 'TBCA', 'at' => '20 Aug 2026, 09:20', 'body' => 'We are reviewing your dispute and will update you by 23 Aug 2026.'], ['from' => 'You (Client)', 'role' => 'Client', 'at' => '18 Aug 2026, 14:30', 'body' => 'Dispute raised with supporting evidence.'], ['from' => 'Alpha Finance Solutions', 'role' => 'Provider', 'at' => '18 Aug 2026, 16:45', 'body' => 'We acknowledge your concerns and will provide our response.']],
                'documents' => [['name' => 'Dispute_Statement.pdf', 'by' => 'You', 'at' => '18 Aug 2026', 'size' => '452 KB'], ['name' => 'Supporting_Evidence_1.xlsx', 'by' => 'You', 'at' => '18 Aug 2026', 'size' => '233 KB'], ['name' => 'Deliverable_v1.0.pdf', 'by' => 'Provider', 'at' => '18 Aug 2026', 'size' => '12.4 MB']]],
        ]);
        $console = [
            ['DSP-2026-0022', 'ENG-2026-0053', 'greentech-engineering', 'Billing Error', 'Incorrect amount charged', 102160, 'escalated'],
            ['DSP-2026-0019', 'ENG-2026-0057', 'sustainmetrics-consulting', 'Duplicate Charge', 'Charged twice for same deliverable', 69598, 'raised'],
            ['DSP-2026-0015', 'ENG-2026-0061', 'powergrid-solutions', 'Refund Not Processed', 'Refund promised but not received', 178738, 'acknowledged'],
            ['DSP-2026-0012', 'ENG-2026-0068', 'value-metrics-group', 'Service Delay', 'Significant delay in delivery', 62763, 'won'],
        ];
        foreach ($console as [$ref, $eng, $slug, $type, $subject, $amt, $status]) {
            Dispute::updateOrCreate(['reference' => $ref], [
                'kind' => 'chargeback', 'engagement_id' => Engagement::where('reference', $eng)->value('id'), 'provider_id' => $p[$slug]->id, 'type' => $type, 'priority' => 'medium',
                'subject' => $subject, 'description' => $subject, 'amount_zar' => $amt, 'status' => $status, 'response_due_at' => now()->addDays(6),
                'meta' => ['timeline' => [['at' => now()->subDays(4)->format('d M Y, H:i'), 'title' => 'Chargeback received', 'body' => 'Notified by payment processor.']], 'messages' => []],
            ]);
        }
    }

    /* ------------------------------------------------------------------ partners */
    private function partners(): array
    {
        $envUser = $this->user('partner@enviroimpact.co.za', 'Dr. Lindiwe Maseko', 'EnviroImpact Solutions (Pty) Ltd');
        $rows = [
            ['enviroimpact-solutions', 'P-2026-00058', 'EnviroImpact Solutions (Pty) Ltd', 'Environmental Assessment Practitioner (EAP)', 'EIA Practitioner', 'Cape Town', 'active', $envUser->id, [
                'practitioner' => 'Dr. Lindiwe Maseko', 'lead' => 'Dr. Lindiwe Nkosi', 'specialisation' => 'Environmental Impact Assessment (EIA)', 'firm_type' => 'Independent Specialist Firm',
                'registration' => 'C21845/2016', 'address' => 'Cape Town, Western Cape, South Africa', 'qualifications' => 'PhD Environmental Science', 'professional_registration' => 'Pr.Sci.Nat (400112/08)',
                'registration_body' => 'EAPASA', 'experience' => '18+ years', 'standard_fee' => 68500, 'verification' => 'CURRENT_VERIFIED', 'panel' => 'ACTIVE', 'indemnity' => 'CURRENT', 'member_since' => '15 Feb 2026',
                'methodology' => 'Scoping Phase → Impact Assessment → Mitigation → EMPr → Public Participation → Reporting',
                'deliverables' => 'EIA Report, EMPr, Specialist Studies Coordination, Public Participation Report', 'timeline' => '10–12 weeks from appointment', 'team' => 'Project Manager, Environmental Scientist, Specialist Coordinators',
                'legacy_matters' => 8, 'outstanding' => 48750,
                'matters' => [['PSR-2026-000098', 'GreenFuture Holdings (Pty) Ltd', 'Environmental Compliance Audit', 'A1 – Partner Reviewed', 'In Progress', 'Compliance Report', '20 May 2026'], ['PSR-2026-000075', 'SunRise Developments (Pty) Ltd', 'Heritage Impact Assessment', 'A2 – Partner Introduced', 'Quoted', 'Client Decision', '14 May 2026'], ['PSR-2026-000062', 'BlueWave Projects (Pty) Ltd', 'Water Use Licence Support', 'A3 – Partner Mandated', 'In Progress', 'Submission to DWS', '18 May 2026'], ['PSR-2026-000041', 'EcoBuild (Pty) Ltd', 'Waste Management Plan', 'A1 – Partner Reviewed', 'On Hold', 'Info from Client', '—']],
                'tasks' => [['label' => 'Review draft Scoping Report', 'due' => '15 May 2026', 'done' => false], ['label' => 'Provide updated CV for Ms. N. Dlamini', 'due' => '16 May 2026', 'done' => false], ['label' => 'Confirm availability for site inspection', 'due' => '17 May 2026', 'done' => false], ['label' => 'Upload Waste Management Plan draft', 'due' => '20 May 2026', 'done' => false]],
                'payments' => [['08 May 2026', 'PSR-2026-000062', 'Professional Fee (P)', 52250, 'Paid'], ['02 May 2026', 'PSR-2026-000098', 'Professional Fee (P)', 41400, 'Paid'], ['25 Apr 2026', 'PSR-2026-000021', 'Professional Fee (P)', 33800, 'Paid']],
                'notifications' => [['New opportunity assigned', 'EIA Specialist – Industrial Development', '10 May 2026'], ['Document request', 'Please upload updated Indemnity Certificate', '09 May 2026'], ['Payment received', 'PSR-2026-000062 – R52,250.00', '08 May 2026']],
                'practitioners' => [
                    ['name' => 'Dr. Lindiwe Maseko', 'profession' => 'Environmental Assessment Practitioner (EAP)', 'registration' => 'EAPASA / EAP-2021/345', 'jurisdiction' => 'South Africa', 'valid_until' => now()->addDays(93)->toDateString(), 'next_check' => now()->addDays(60)->format('d M Y')],
                    ['name' => 'Adv. Johan du Toit', 'profession' => 'Attorney', 'registration' => 'LPC / 85632', 'jurisdiction' => 'South Africa', 'valid_until' => now()->addDays(26)->toDateString(), 'next_check' => now()->addDays(10)->format('d M Y')],
                    ['name' => 'CA Nomsa Dlamini', 'profession' => 'Chartered Accountant (SA)', 'registration' => 'SAICA / 9654321', 'jurisdiction' => 'South Africa', 'valid_until' => now()->addDays(18)->toDateString(), 'next_check' => now()->addDays(5)->format('d M Y')],
                    ['name' => 'Mr. Pieter van der Merwe', 'profession' => 'Civil Engineer', 'registration' => 'ECSA / 20051234', 'jurisdiction' => 'South Africa', 'valid_until' => now()->subDays(10)->toDateString(), 'next_check' => '—'],
                    ['name' => 'Ms. Thandi Nkosi', 'profession' => 'Town Planner', 'registration' => 'SACPLAN / A1234', 'jurisdiction' => 'South Africa', 'status' => 'Suspended', 'next_check' => '—'],
                    ['name' => 'Mr. Sipho Khumalo', 'profession' => 'Health & Safety Consultant', 'registration' => 'SACPCMP / 112233', 'jurisdiction' => 'South Africa', 'status' => 'Pending', 'next_check' => now()->format('d M Y')],
                ],
                'verification_events' => [['Verification confirmed', 'Dr. Lindiwe Maseko – EAPASA', '10 May 2026, 09:32', 'good'], ['Expiry approaching', 'Adv. Johan du Toit – LPC Annual Declaration', '08 May 2026, 14:11', 'warn'], ['Verification expired', 'Mr. Pieter van der Merwe – ECSA Registration', '30 Apr 2026, 08:02', 'bad'], ['Practitioner suspended', 'Ms. Thandi Nkosi – SACPLAN', '25 Apr 2026, 10:18', 'neutral'], ['Documents requested', 'Mr. Sipho Khumalo – Indemnity Insurance', '09 May 2026, 16:45', 'info']],
            ]],
            ['greenfields-environmental', 'P-2026-00061', 'GreenFields (Pty) Ltd', 'Environmental Assessment Practitioner (EAP)', 'Biodiversity & Compliance', 'Johannesburg', 'active', null, ['practitioner' => 'Ms. Karin Botha', 'lead' => 'Ms. Karin Botha', 'professional_registration' => 'EAPASA / EAP-2019/221', 'standard_fee' => 61000, 'verification' => 'CURRENT_VERIFIED', 'panel' => 'ACTIVE', 'indemnity' => 'CURRENT']],
            ['mhlaba-legal', 'P-2026-00031', 'Mhlaba Legal Inc.', 'Attorney', 'Commercial Law', 'Johannesburg', 'active_with_conditions', null, ['practitioner' => 'Adv. Johan du Toit', 'lead' => 'Adv. Johan du Toit', 'professional_registration' => 'LPC / 85632', 'standard_fee' => 42000, 'verification' => 'CURRENT_WITH_CONDITIONS', 'panel' => 'ACTIVE', 'indemnity' => 'CURRENT']],
            ['saica-tax-advisory', 'P-2026-00034', 'SAICA Tax & Advisory', 'Chartered Accountant (SA)', 'Tax Advisory', 'Pretoria', 'pending_reverification', null, ['practitioner' => 'CA Nomsa Dlamini', 'professional_registration' => 'SAICA / 9654321', 'standard_fee' => 39000, 'verification' => 'PENDING_VERIFICATION', 'panel' => 'ACTIVE', 'indemnity' => 'CURRENT']],
            ['ecogauge', 'P-2026-00040', 'EcoGauge (Pty) Ltd', 'Environmental Assessment Practitioner (EAP)', 'Biodiversity Specialist', 'Durban', 'suspended', null, ['practitioner' => 'Mr. Pieter van der Merwe', 'professional_registration' => 'ECSA / 20051234', 'verification' => 'LAPSED', 'panel' => 'SUSPENDED', 'indemnity' => 'EXPIRED']],
            ['webber-wentzel', 'P-2026-00012', 'Webber Wentzel', 'Attorney', 'M&A / Corporate', 'Johannesburg', 'active', null, ['practitioner' => 'Mr. Sipho Khumalo', 'professional_registration' => 'LPC / 77120', 'standard_fee' => 85000, 'verification' => 'CURRENT_VERIFIED', 'panel' => 'ACTIVE', 'indemnity' => 'CURRENT']],
            ['townplan-africa', 'P-2026-00044', 'TownPlan Africa (Pty) Ltd', 'Professional Engineer', 'Urban Planning', 'Cape Town', 'pending_reverification', null, ['practitioner' => 'Ms. Thandi Nkosi', 'professional_registration' => 'SACPLAN / A1234', 'verification' => 'PENDING_VERIFICATION', 'panel' => 'ACTIVE', 'indemnity' => 'CURRENT']],
            ['bdo-advisory', 'P-2026-00019', 'BDO Advisory Services', 'Chartered Accountant (SA)', 'Audit & Assurance', 'Johannesburg', 'active_with_conditions', null, ['practitioner' => 'CA Marc Jacobs', 'professional_registration' => 'SAICA / 8722331', 'standard_fee' => 55000, 'verification' => 'CURRENT_WITH_CONDITIONS', 'panel' => 'ACTIVE', 'indemnity' => 'CURRENT']],
            ['health-safety-works', 'P-2026-00052', 'Health & Safety Works', 'Compliance Officer', 'SHEQ', 'Durban', 'not_found', null, ['practitioner' => 'Ms. Lerato Mkhize', 'professional_registration' => 'SACPCMP / 112233', 'verification' => 'NOT_FOUND', 'panel' => 'INACTIVE', 'indemnity' => 'CURRENT']],
            ['coastal-tax-practitioners', 'P-2026-00070', 'Coastal Tax Practitioners', 'Tax Practitioner', 'Tax Compliance & Returns', 'Port Elizabeth', 'verification', null, ['practitioner' => 'Mr. Ryan Govender', 'professional_registration' => 'SAIT / 33421', 'verification' => 'PENDING_VERIFICATION', 'panel' => 'INACTIVE', 'indemnity' => 'PENDING']],
        ];

        $out = [];
        foreach ($rows as $i => [$slug, $code, $name, $profession, $spec, $city, $status, $userId, $profile]) {
            $out[$slug] = Provider::updateOrCreate(['slug' => $slug], [
                'code' => $code, 'kind' => 'partner', 'user_id' => $userId, 'name' => $name, 'profession' => $profession, 'category' => $spec, 'city' => $city, 'country' => 'South Africa',
                'status' => $status, 'tier' => null, 'rating' => [4.6, 4.35, 4.68, 4.22, 3.2, 4.71, 3.9, 4.1, null, null][$i], 'engagements_count' => [9, 12, 18, 11, 2, 24, 4, 17, 0, 0][$i],
                'application_ref' => sprintf('PSA-2026-%06d', 124 + $i), 'last_verified_at' => now()->subDays(20),
                'next_review_at' => now()->addDays([93, 72, 26, 18, -10, -30, 15, 72, 0, 30][$i]), 'agreement_signed_at' => now()->subMonths(3),
                'profile' => $profile,
            ]);
        }

        return $out;
    }

    private function partnerListings(array $partners): void
    {
        $fees = fn ($t, $p, $x) => ['t' => $t, 'p' => $p, 'x' => $x];
        $rows = [
            ['legal-services', ['Contract Drafting & Review', 'Draft, review and negotiate contracts tailored to your business needs.'], ['Corporate & Commercial Advisory', 'Strategic legal guidance for corporate and commercial matters.'], ['Regulatory Compliance Advisory', 'Navigate regulatory requirements and maintain ongoing compliance.'], ['Legal Due Diligence Support', 'Identify and assess legal risks in transactions or business operations.'], ['M&A Transaction Legal Support', 'End-to-end legal support for mergers, acquisitions and investments.'], ['Commercial Dispute Advisory', 'Prevent, manage and resolve commercial disputes efficiently.'], ['Intellectual Property & Licensing Support', 'Protect your IP and structure licensing agreements effectively.'], ['Employment Law Advisory', 'Manage employment matters and ensure labour law compliance.']],
            ['audit-assurance', ['Statutory Audit Coordination', 'Coordinate statutory audits with a registered auditor.'], ['Independent Review (Compilation)', 'Independent review engagements for qualifying companies.'], ['Agreed-Upon Procedures', 'Factual findings reports on specified procedures.']],
            ['tax-advisory', ['Tax Compliance & Returns', 'Corporate and provisional tax compliance by a registered practitioner.'], ['Tax Structuring Review', 'Review of group and transaction structures for tax efficiency.'], ['Transfer Pricing Documentation', 'Master file and local file documentation.']],
            ['esg-advisory', ['ESG Reporting Readiness', 'Gap assessment against ISSB / GRI and a reporting roadmap.'], ['Sustainability Assurance Support', 'Prepare for limited assurance on sustainability metrics.']],
            ['environmental-services', ['Environmental Impact Assessment (EIA)', 'Full NEMA EIA process with registered EAP sign-off.'], ['Basic Assessment Report', 'Basic Assessment for listed activities with lower impact.'], ['Environmental Compliance Audit', 'Audit against EMPr and authorisation conditions.'], ['Water Use Licence Support', 'WULA preparation and submission to DWS.']],
            ['engineering-technical', ['Engineering Design Review', 'Independent review of designs by a registered professional engineer.'], ['Technical Due Diligence', 'Asset condition and technical risk assessment.']],
            ['financial-advisory', ['Financial Model Review (Expert Review)', 'Independent expert review of your financial model with professional sign-off and recommendations.'], ['Independent Valuation Opinion', 'Registered valuer opinion for transactions and reporting.']],
            ['specialist-compliance', ['AML / KYC Programme Review', 'Review of FICA risk management and compliance programme.'], ['POPIA Information Officer Support', 'Outsourced information officer support.']],
            ['business-rescue', ['Business Rescue Feasibility', 'Assessment by a licensed business rescue practitioner.']],
            ['valuation', ['Property Valuation', 'Registered valuer property valuation report.']],
            ['labour-employment', ['Labour Relations Advisory', 'Disciplinary, retrenchment and CCMA support.']],
            ['corporate-governance', ['Board Effectiveness Review', 'King IV aligned board evaluation.']],
        ];
        $profession = ['legal-services' => 'Attorney', 'audit-assurance' => 'Chartered Accountant (SA)', 'tax-advisory' => 'Tax Practitioner', 'esg-advisory' => 'ESG Specialist', 'environmental-services' => 'Environmental Assessment Practitioner (EAP)', 'engineering-technical' => 'Professional Engineer', 'financial-advisory' => 'Chartered Accountant (SA)', 'specialist-compliance' => 'Compliance Officer', 'business-rescue' => 'Business Rescue Practitioner', 'valuation' => 'Registered Valuer', 'labour-employment' => 'Attorney', 'corporate-governance' => 'Chartered Accountant (SA)'];
        foreach ($rows as $row) {
            $cat = array_shift($row);
            foreach ($row as $i => [$title, $summary]) {
                $slug = Str::slug($title);
                $isFmr = $slug === 'financial-model-review-expert-review';
                Listing::updateOrCreate(['slug' => $slug], [
                    'kind' => 'partner', 'title' => $title, 'category' => $cat, 'summary' => $summary, 'price_zar' => null, 'popularity' => 100 - $i * 7, 'status' => 'published',
                    'details' => [
                        'profession' => $isFmr ? 'CA(SA)' : $profession[$cat], 'jurisdiction' => 'South Africa', 'timeline' => $isFmr ? '5–10 Business Days' : '2–6 weeks',
                        'arrangement' => $cat === 'environmental-services' ? 'A2' : 'A1', 'mechanism' => 'M1 – TBCA Coordination Fee',
                        'fees' => $isFmr ? $fees(1950, 7500, 0) : ($cat === 'environmental-services' ? $fees(24500, 68500, 12000) : $fees(9500, 32000, 2500)),
                        'tbca_does' => ['Manage engagement and quality control', 'Prepare materials for review and testing', 'Implement recommendations (if engaged)', 'Overall project oversight'],
                        'professional_does' => ['Independent professional review', 'Professional analysis and validation', 'Issue report and recommendations', 'Professional sign-off'],
                        'limitations' => ['This is an expert review service. The professional does not take management responsibility.', 'The review is based on information you provide. Accuracy of underlying data is not audited unless scoped.', 'The professional provides recommendations, not implementation unless separately engaged.', 'Jurisdictional advice is limited to the stated jurisdiction unless additional approval is obtained.'],
                        'needs' => ['Clear scope of the matter and objectives', 'Access to files and supporting information', 'Confirmation of intended use and decision context', 'Authority to proceed and sign the engagement'],
                    ],
                ]);
            }
        }
    }

    private function partnerRequests(array $partners): void
    {
        $env = $partners['enviroimpact-solutions'];
        $listing = Listing::where('slug', 'environmental-impact-assessment-eia')->first();
        $intake = [
            'category' => 'environmental-services', 'description' => 'Require an independent EIA review and specialist sign-off for a 150MW solar farm project in the Northern Cape.',
            'outcome' => 'Regulatory submission', 'timeline' => '1 – 3 months', 'country' => 'South Africa', 'jurisdiction' => 'South Africa',
            'profession' => 'Environmental Assessment Practitioner (EAP)', 'specialisation' => 'Environmental Impact Assessment (EIA)', 'output' => 'Signed report',
            'intended_use' => 'Regulatory submission', 'role' => 'Business owner / director', 'act_for' => 'My own organisation', 'organisation' => 'Acme Renewable Energy (Pty) Ltd',
            'client_country' => 'South Africa', 'matter_id' => 'PS-REQ-2026-00481',
        ];
        $resolution = ['matched' => true, 'row' => 'PR-2026-0001', 'row_status' => 'authorised', 'client_country' => 'South Africa', 'matter_jurisdiction' => 'South Africa', 'practice_jurisdiction' => 'South Africa', 'profession' => 'Environmental Assessment Practitioner (EAP)', 'specialisation' => 'Environmental Impact Assessment (EIA)', 'output' => 'Signed report', 'intended_use' => 'Regulatory submission', 'credential_class' => 'Independent Expert Review', 'arrangement_path' => 'A2 – Partner Introduced candidate', 'activity' => 'Environmental Authorisation Applications (NEMA EIA)', 'conditions' => false];
        $proposal = ['firm' => $env->name, 'specialisation' => 'Environmental Impact Assessment (EIA)', 'firm_type' => 'Independent Specialist Firm', 'registration' => 'C21845/2016', 'address' => 'Cape Town, Western Cape, South Africa', 'lead' => 'Dr. Lindiwe Nkosi', 'qualifications' => 'PhD Environmental Science', 'professional_registration' => 'Pr.Sci.Nat (400112/08)', 'experience' => '18+ years', 'independence' => 'Filed 02 Jul 2026', 'understanding' => 'Comprehensive EIA required for 150MW solar farm project in the Northern Cape.', 'methodology' => 'Scoping Phase → Impact Assessment → Mitigation → EMPr → Public Participation → Reporting', 'deliverables' => 'EIA Report, EMPr, Specialist Studies Coordination, Public Participation Report', 'timeline' => '10–12 weeks from appointment', 'team' => 'Project Manager, Environmental Scientist, Specialist Coordinators'];
        $quote = [...Pricing::partnerQuote(24500, 68500, 12000), 'basis' => 'Time & Materials (Professional Fee)', 'validity' => now()->addDays(30)->format('d M Y'), 'source' => 'partner', 'hours' => 120, 'rate' => 571, 'scope' => 'Comprehensive Environmental Impact Assessment (EIA) for 150MW solar farm; impact assessment across biophysical, social and economic components; public participation; specialist studies coordination; final EIA report.'];
        $base = ['user_id' => $this->client->id, 'listing_id' => $listing?->id, 'client_name' => 'Acme Renewable Energy (Pty) Ltd', 'title' => 'EIA – 150MW Solar Farm', 'arrangement' => 'A2 – Partner Introduced', 'fee_mechanism' => 'M1 – TBCA Coordination Fee', 'permission_ref' => 'PR-2026-0001', 'intake' => $intake, 'resolution' => $resolution];

        PartnerRequest::updateOrCreate(['reference' => 'PSR-2026-000124'], [...$base, 'partner_id' => $env->id, 'stage' => 'proposal', 'conflict_state' => 'CLEAR', 'quote' => $quote,
            'meta' => ['proposal' => $proposal, 'conflict' => ['result' => 'clear', 'performed_by' => 'Dr. Lindiwe Maseko', 'method' => 'Firm Conflict System', 'submitted_at' => '10 May 2026, 14:32'], 'history' => [['at' => '10 Aug 2026, 09:42', 'title' => 'Request received', 'body' => ''], ['at' => '10 Aug 2026, 14:32', 'title' => 'Conflict cleared', 'body' => 'Partner proposal issued.']]],
            'created_at' => '2026-08-10 09:42:00']);
        PartnerRequest::updateOrCreate(['reference' => 'PSR-2026-001245'], [...$base, 'title' => 'Environmental Authorisation Application (Solar Farm Project)', 'partner_id' => $env->id, 'stage' => 'conflict_pending', 'conflict_state' => 'PENDING', 'quote' => null,
            'meta' => ['requested_by' => 'Natasha De Klerk (TBCA Client Advisor)', 'originating_vehicle' => 'Environmental Compliance Audit (VA-2026-055)', 'history' => [['at' => '10 May 2026, 09:00', 'title' => 'Conflict check requested', 'body' => 'Sent to EnviroImpact Solutions']]]]);
        PartnerRequest::updateOrCreate(['reference' => 'PSR-2026-000127'], [...$base, 'title' => 'Heritage Impact Assessment', 'partner_id' => $partners['ecogauge']->id, 'stage' => 'conflict_identified', 'conflict_state' => 'CONFLICTED',
            'meta' => ['excluded_partners' => [$partners['ecogauge']->id], 'conflict_identified_at' => '10 Aug 2026, 14:32', 'history' => []]]);
        PartnerRequest::updateOrCreate(['reference' => 'PSR-2026-000133'], [...$base, 'title' => 'Project Development Advisory – EIA Escalation', 'partner_id' => null, 'stage' => 'escalated', 'conflict_state' => 'NOT_REQUESTED',
            'meta' => ['escalation' => ['vehicle' => 'VEH-03 – Project Advisory', 'request_id' => 'PAD-2026-00367', 'date' => '05 Aug 2026', 'scope' => 'Project development advisory for 150MW solar farm.', 'escalated_on' => '10 Aug 2026', 'by' => 'TBCA System (Automatic)', 'reason' => 'Professional boundary – Environmental Impact Assessment (EIA) required.', 'activity' => 'Environmental Impact Assessment (EIA) for 150MW solar farm.', 'profession' => 'Environmental Assessment Practitioner'], 'history' => []]]);
        // Completed + settled matter for the partner settlement statement (PS-023).
        PartnerRequest::updateOrCreate(['reference' => 'PSR-2026-000098'], [...$base, 'title' => 'Environmental Compliance Audit', 'client_name' => 'GreenFuture Holdings (Pty) Ltd', 'user_id' => null, 'partner_id' => $env->id, 'stage' => 'completed', 'conflict_state' => 'CLEAR',
            'quote' => [...Pricing::partnerQuote(6600, 66000, 0), 'basis' => 'Time & Materials (Professional Fee)', 'hours' => 120, 'rate' => 550],
            'meta' => ['settlement' => ['reference' => 'SET-2026-000321', 'invoice' => 'INV-2026-000789', 'tax_point' => '09 May 2026', 'p' => 66000, 't' => 6600, 'p_vat' => 9900, 't_vat' => 990, 'paid_on' => '09 May 2026', 'payment_ref' => 'ABSA-FT-882221', 'method' => 'Bank Transfer', 'status' => 'Settled'],
                'delivery' => ['milestone' => 'Final Report', 'progress' => 100, 'files' => [['name' => 'Compliance_Audit_Final.pdf', 'type' => 'PDF', 'version' => '1.0', 'uploaded' => '05 May 2026, 10:00', 'status' => 'Approved']], 'hours_logged' => 118, 'hours_total' => 120, 'qa' => [], 'activity' => []], 'history' => []]]);
        // In delivery (PS-022).
        PartnerRequest::updateOrCreate(['reference' => 'PSR-2026-000075'], [...$base, 'title' => 'Environmental Authorisation – Draft EIA Report', 'client_name' => 'SunRise Developments (Pty) Ltd', 'user_id' => null, 'partner_id' => $env->id, 'stage' => 'delivery', 'conflict_state' => 'CLEAR',
            'quote' => [...Pricing::partnerQuote(24500, 66000, 15000), 'basis' => 'Time & Materials (Professional Fee)', 'hours' => 120, 'rate' => 550],
            'meta' => ['delivery' => ['milestone' => 'Draft EIA Report', 'progress' => 65, 'status' => 'In Progress', 'comment' => 'Draft EIA Report in progress. Baseline studies and impact assessment sections are underway.', 'internal' => 'Awaiting biodiversity data. Legal section to follow after scoping confirmation.', 'hours_logged' => 38.5, 'hours_total' => 120,
                'files' => [['name' => 'Scoping_Report_v1.0.pdf', 'type' => 'PDF', 'version' => '1.0', 'uploaded' => '10 May 2026, 09:32', 'status' => 'In Review'], ['name' => 'Impact_Assessment_Draft.docx', 'type' => 'DOCX', 'version' => '0.3', 'uploaded' => '10 May 2026, 11:01', 'status' => 'Draft'], ['name' => 'Data_Analysis.xlsx', 'type' => 'XLSX', 'version' => '1.1', 'uploaded' => '10 May 2026, 11:15', 'status' => 'Submitted'], ['name' => 'Stakeholder_Engagement_Plan.pdf', 'type' => 'PDF', 'version' => '1.0', 'uploaded' => '10 May 2026, 12:20', 'status' => 'Submitted']],
                'qa' => ['Scope compliance' => 'In Review', 'Professional methodology' => 'Completed', 'Technical accuracy' => 'In Review', 'Legislative compliance' => 'Not Started', 'Completeness of deliverables' => 'Completed'],
                'activity' => [['at' => '10 May 2026, 09:32', 'body' => 'You uploaded Scoping_Report_v1.0.pdf'], ['at' => '10 May 2026, 11:01', 'body' => 'Submitted Impact_Assessment_Draft.docx for partner QA review'], ['at' => '10 May 2026, 11:18', 'body' => 'Note added: Awaiting biodiversity data from client.']]], 'history' => []]]);
    }

    /* ------------------------------------------------------------------ governance registers */
    private function records(): void
    {
        $put = function (string $register, array $rows) {
            foreach ($rows as $r) {
                [$ref, $status, $priority, $data] = $r;
                Record::updateOrCreate(['register' => $register, 'reference' => $ref], ['status' => $status, 'priority' => $priority, 'data' => $data]);
            }
        };

        $put('capacity-rules', [
            ['CAP-001', 'active', 'high', ['name' => 'Financial Model Value Threshold', 'type' => 'Financial', 'threshold' => 'ZAR 50M', 'condition' => 'Project Value > ZAR 50M', 'assigned' => 'John Mwangi', 'review' => 'Yes']],
            ['CAP-002', 'active', 'high', ['name' => 'Cross-Border Jurisdiction', 'type' => 'Jurisdiction', 'threshold' => 'Multiple', 'condition' => 'Involves 2+ Jurisdictions', 'assigned' => 'Legal Team', 'review' => 'Yes']],
            ['CAP-003', 'active', 'medium', ['name' => 'ESG Risk Score Limit', 'type' => 'Risk', 'threshold' => '> 60', 'condition' => 'ESG Risk Score > 60', 'assigned' => 'ESG Specialist', 'review' => 'Yes']],
            ['CAP-004', 'active', 'medium', ['name' => 'Due Diligence Complexity', 'type' => 'Process', 'threshold' => 'High', 'condition' => 'DD Complexity = High', 'assigned' => 'DD Lead', 'review' => 'Yes']],
            ['CAP-005', 'active', 'high', ['name' => 'Budget Variance Limit', 'type' => 'Financial', 'threshold' => '> 15%', 'condition' => 'Budget Variance > 15%', 'assigned' => 'Finance Team', 'review' => 'Yes']],
            ['CAP-006', 'active', 'low', ['name' => 'Stakeholder Count Threshold', 'type' => 'Stakeholder', 'threshold' => '> 10', 'condition' => 'Stakeholders > 10', 'assigned' => 'PMO', 'review' => 'No']],
            ['CAP-007', 'active', 'low', ['name' => 'Payment Delay Alert', 'type' => 'Financial', 'threshold' => '> 14 days', 'condition' => 'Payment Delay > 14 days', 'assigned' => 'Finance Team', 'review' => 'No']],
            ['CAP-008', 'active', 'low', ['name' => 'Document Completeness', 'type' => 'Process', 'threshold' => '< 80%', 'condition' => 'Doc Completeness < 80%', 'assigned' => 'Admin Team', 'review' => 'No']],
        ]);

        $put('corrections', [
            ['ENG-2026-0013', 'overdue', 'high', ['title' => 'Scenario Analysis', 'provider' => 'Alpha Finance Solutions (Pty) Ltd', 'qa_standard' => 'TA-QA-03', 'issue' => 'Financial model assumptions need verification', 'cycle_stage' => 'Provider Correction', 'category' => 'Data / Assumptions', 'opened' => '13 Aug 2026', 'sla_due' => '16 Aug 2026', 'days_open' => 1]],
            ['ENG-2026-0053', 'in_progress', 'medium', ['title' => 'Feasibility Study - Industrial Park', 'provider' => 'GreenTech Engineering (Pty) Ltd', 'qa_standard' => 'TA-QA-02', 'issue' => 'Capex estimate variance > 15%', 'cycle_stage' => 'Provider Correction', 'category' => 'Data / Assumptions', 'opened' => '14 Aug 2026', 'sla_due' => '17 Aug 2026', 'days_open' => 0]],
            ['ENG-2026-0057', 'in_progress', 'low', ['title' => 'ESG Impact Assessment', 'provider' => 'SustainMetrics Consulting', 'qa_standard' => 'TA-QA-05', 'issue' => 'ESG data sources require citations', 'cycle_stage' => 'QA Review', 'category' => 'Missing Documentation', 'opened' => '14 Aug 2026', 'sla_due' => '18 Aug 2026', 'days_open' => 0]],
            ['ENG-2026-0061', 'overdue', 'high', ['title' => 'Grid Connection Study', 'provider' => 'PowerGrid Solutions (Pty) Ltd', 'qa_standard' => 'TA-QA-03', 'issue' => 'Load profile methodology clarification', 'cycle_stage' => 'Provider Correction', 'category' => 'Methodology / Approach', 'opened' => '12 Aug 2026', 'sla_due' => '14 Aug 2026', 'days_open' => 2]],
            ['ENG-2026-0064', 'in_progress', 'medium', ['title' => 'Water Use License Application', 'provider' => 'AquaReg Consulting', 'qa_standard' => 'TA-QA-04', 'issue' => 'Supporting documents incomplete', 'cycle_stage' => 'Pending Client Info', 'category' => 'Missing Documentation', 'opened' => '11 Aug 2026', 'sla_due' => '16 Aug 2026', 'days_open' => 3]],
            ['ENG-2026-0068', 'overdue', 'medium', ['title' => 'Financial Model Review', 'provider' => 'FinModel Pro (Pty) Ltd', 'qa_standard' => 'TA-QA-02', 'issue' => 'Sensitivity analysis missing scenarios', 'cycle_stage' => 'Provider Correction', 'category' => 'Data / Assumptions', 'opened' => '08 Aug 2026', 'sla_due' => '12 Aug 2026', 'days_open' => 6]],
            ['ENG-2026-0070', 'in_progress', 'low', ['title' => 'Environmental Authorisation', 'provider' => 'EnviroSolutions Africa (Pty) Ltd', 'qa_standard' => 'TA-QA-04', 'issue' => 'Public participation plan incomplete', 'cycle_stage' => 'QA Review', 'category' => 'Compliance / Regulatory', 'opened' => '13 Aug 2026', 'sla_due' => '19 Aug 2026', 'days_open' => 1]],
            ['ENG-2026-0031', 'completed', 'low', ['title' => 'Commercial Due Diligence', 'provider' => 'Value Metrics Group', 'qa_standard' => 'TA-QA-02', 'issue' => 'Formatting issues', 'cycle_stage' => 'Closed', 'category' => 'Compliance / Regulatory', 'opened' => '01 Aug 2026', 'sla_due' => '05 Aug 2026', 'days_open' => 3]],
        ]);

        $put('floor-blocks', [
            ['ENG-2026-0048', 'blocked', 'high', ['title' => 'Solar PV Power Plant Development', 'provider' => 'Alpha Finance Solutions (Pty) Ltd', 'reason' => 'Earnings below minimum floor', 'breach' => '-32%', 'earnings' => 134393.75, 'floor' => 198000, 'shortfall' => 63606.25, 'days' => 9]],
            ['ENG-2026-0053', 'blocked', 'medium', ['title' => 'Feasibility Study - Industrial Park', 'provider' => 'GreenTech Engineering (Pty) Ltd', 'reason' => 'Below-floor after scope change', 'breach' => '-18%', 'earnings' => 102160, 'floor' => 125000, 'shortfall' => 22840, 'days' => 5]],
            ['ENG-2026-0057', 'blocked', 'medium', ['title' => 'ESG Impact Assessment', 'provider' => 'SustainMetrics Consulting', 'reason' => 'Earnings below minimum floor', 'breach' => '-25%', 'earnings' => 69598.75, 'floor' => 93000, 'shortfall' => 23401.25, 'days' => 3]],
            ['ENG-2026-0061', 'blocked', 'high', ['title' => 'Grid Connection Study', 'provider' => 'PowerGrid Solutions (Pty) Ltd', 'reason' => 'Below-floor due to fee discount', 'breach' => '-40%', 'earnings' => 178738.75, 'floor' => 300000, 'shortfall' => 121261.25, 'days' => 11]],
            ['ENG-2026-0064', 'blocked', 'low', ['title' => 'Water Use License Application', 'provider' => 'AquaReg Consulting', 'reason' => 'Earnings below minimum floor', 'breach' => '-12%', 'earnings' => 62763.75, 'floor' => 71500, 'shortfall' => 8736.25, 'days' => 2]],
            ['ENG-2026-0068', 'blocked', 'medium', ['title' => 'Financial Model Review', 'provider' => 'FinModel Pro (Pty) Ltd', 'reason' => 'Below-floor after rescope', 'breach' => '-21%', 'earnings' => 88400, 'floor' => 112000, 'shortfall' => 23600, 'days' => 6]],
            ['ENG-2026-0070', 'blocked', 'low', ['title' => 'Environmental Authorisation', 'provider' => 'EnviroSolutions Africa (Pty) Ltd', 'reason' => 'Earnings below minimum floor', 'breach' => '-15%', 'earnings' => 93500, 'floor' => 110000, 'shortfall' => 16500, 'days' => 1]],
        ]);

        $put('circumvention', [
            ['NCM-2026-0015', 'open', 'high', ['engagement' => 'ENG-2026-0048', 'title' => 'Solar PV Power Plant Development', 'party' => 'Solar Future (Pty) Ltd (Client)', 'type' => 'Direct Provider Contact', 'detected' => '14 Aug 2026, 11:22', 'indicators' => '4 / 5']],
            ['NCM-2026-0014', 'under_review', 'medium', ['engagement' => 'ENG-2026-0035', 'title' => 'Feasibility Study - Industrial Park', 'party' => 'GreenTech Engineering (Pty) Ltd (Provider)', 'type' => 'Scope Outside Platform', 'detected' => '14 Aug 2026, 09:41', 'indicators' => '3 / 5']],
            ['NCM-2026-0013', 'under_investigation', 'high', ['engagement' => 'ENG-2026-0057', 'title' => 'ESG Impact Assessment', 'party' => 'SustainMetrics Consulting (Provider)', 'type' => 'Fee Avoidance Attempt', 'detected' => '13 Aug 2026, 16:05', 'indicators' => '5 / 5']],
            ['NCM-2026-0012', 'open', 'medium', ['engagement' => 'ENG-2026-0061', 'title' => 'Grid Connection Study', 'party' => 'PowerGrid Solutions (Pty) Ltd (Provider)', 'type' => 'Communication Off-Platform', 'detected' => '13 Aug 2026, 14:18', 'indicators' => '2 / 5']],
            ['NCM-2026-0011', 'under_investigation', 'high', ['engagement' => 'ENG-2026-0064', 'title' => 'Water Use License Application', 'party' => 'AquaReg Consulting (Provider)', 'type' => 'Undisclosed Side Arrangement', 'detected' => '13 Aug 2026, 10:37', 'indicators' => '4 / 5']],
            ['NCM-2026-0010', 'resolved', 'low', ['engagement' => 'ENG-2026-0068', 'title' => 'Financial Model Review', 'party' => 'FinModel Pro (Pty) Ltd (Provider)', 'type' => 'Data Shared Off-Platform', 'detected' => '12 Aug 2026, 15:51', 'indicators' => '2 / 5']],
            ['NCM-2026-0009', 'open', 'medium', ['engagement' => 'ENG-2026-0070', 'title' => 'Environmental Authorisation', 'party' => 'EnviroSolutions Africa (Pty) Ltd (Provider)', 'type' => 'Client Solicitation Attempt', 'detected' => '12 Aug 2026, 11:20', 'indicators' => '3 / 5']],
        ]);

        $put('permissions', [
            ['PR-2026-0001', 'authorised', null, ['profession' => 'Environmental Assessment Practitioner (EAP)', 'jurisdiction' => 'South Africa', 'activity' => 'Environmental Authorisation Applications (NEMA EIA)', 'arrangement' => 'A2 – Partner Introduced', 'mechanism' => 'M1 – TBCA Coordination Fee', 'opinion' => 'Werksmans Attorneys', 'effective' => '15 Apr 2026', 'version' => '1.2', 'next_review' => '15 Apr 2027']],
            ['PR-2026-0002', 'conditional', null, ['profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'activity' => 'Contract Drafting & Review', 'arrangement' => 'A3 – Partner-Direct (Own Client)', 'mechanism' => 'M3 – Fixed Retainer (Monthly)', 'opinion' => 'Bowmans (Opinion Ref. B-1245)', 'effective' => '01 May 2026', 'version' => '2.0', 'next_review' => '01 May 2027']],
            ['PR-2026-0003', 'authorised', null, ['profession' => 'Chartered Accountant (SA)', 'jurisdiction' => 'South Africa', 'activity' => 'Independent Review (Compilation)', 'arrangement' => 'A1 – TBCA Direct (Review Relationship)', 'mechanism' => 'M2 – Professional Fee', 'opinion' => 'BDO Legal (Ref. OP-7781)', 'effective' => '20 Mar 2026', 'version' => '1.1', 'next_review' => '20 Mar 2027']],
            ['PR-2026-0004', 'authorised', null, ['profession' => 'Tax Practitioner', 'jurisdiction' => 'South Africa', 'activity' => 'Tax Compliance & Returns', 'arrangement' => 'A2 – Partner Introduced', 'mechanism' => 'M1 – TBCA Coordination Fee', 'opinion' => 'Webber Wentzel (Ref. WW-9903)', 'effective' => '10 Apr 2026', 'version' => '1.0', 'next_review' => '10 Apr 2027']],
            ['PR-2026-0005', 'not_authorised', null, ['profession' => 'Registered Valuer', 'jurisdiction' => 'South Africa', 'activity' => 'Property Valuation', 'arrangement' => 'A3 – Partner-Direct (Own Client)', 'mechanism' => 'M4 – Value Percentage', 'opinion' => 'N/A', 'effective' => '—', 'version' => '—', 'next_review' => '—']],
            ['PR-2026-0006', 'under_review', null, ['profession' => 'Environmental Assessment Practitioner (EAP)', 'jurisdiction' => 'South Africa', 'activity' => 'Basic Assessment Reports', 'arrangement' => 'A2 – Partner Introduced', 'mechanism' => 'M1 – TBCA Coordination Fee', 'opinion' => 'Cliffe Dekker Hofmeyr (Opinion Pending)', 'effective' => '—', 'version' => '0.1', 'next_review' => '—']],
            ['PR-2026-0007', 'conditional', null, ['profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'activity' => 'Litigation Advisory', 'arrangement' => 'A3 – Partner-Direct (Own Client)', 'mechanism' => 'M3 – Fixed Retainer (Monthly)', 'opinion' => 'Spoor & Fisher (Ref. SF-5562)', 'effective' => '05 May 2026', 'version' => '1.0', 'next_review' => '05 May 2027']],
            ['PR-2026-0008', 'withdrawn', null, ['profession' => 'Business Rescue Practitioner', 'jurisdiction' => 'South Africa', 'activity' => 'Business Rescue Advisory', 'arrangement' => 'A1 – TBCA Direct (Review Relationship)', 'mechanism' => 'M2 – Professional Fee', 'opinion' => 'ENSafrica (Withdrawn 08/05/2026)', 'effective' => '—', 'version' => '1.1', 'next_review' => '—']],
            ['PR-2026-0009', 'authorised', null, ['profession' => 'Professional Engineer', 'jurisdiction' => 'South Africa', 'activity' => 'Engineering Design Review', 'arrangement' => 'A1 – Partner Reviewed', 'mechanism' => 'M1 – TBCA Coordination Fee', 'opinion' => 'Webber Wentzel (Ref. WW-9911)', 'effective' => '12 Apr 2026', 'version' => '1.0', 'next_review' => '12 Apr 2027']],
        ]);

        $put('arrangements', [
            ['AR-2026-0001', 'authorised', null, ['activity' => 'Environmental Authorisation Applications (NEMA EIA)', 'profession' => 'Environmental Assessment Practitioner', 'jurisdiction' => 'South Africa', 'mechanism' => 'M1 – TBCA Coordination Fee', 'disposition' => '992 – Partner Services', 'evidence' => 'Current', 'opinion' => 'WEBBER WENTZEL WW-2026-0193 v1.2', 'next_review' => '15 Apr 2027']],
            ['AR-2026-0002', 'authorised', null, ['activity' => 'Contract Drafting & Review', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'mechanism' => 'M3 – Fixed Retainer (Monthly)', 'disposition' => '992 – Partner Services', 'evidence' => 'Current', 'opinion' => 'BOWMANS BW-2026-0447 v1.0', 'next_review' => '01 May 2027']],
            ['AR-2026-0003', 'authorised', null, ['activity' => 'Basic Assessment Reports', 'profession' => 'Environmental Assessment Practitioner', 'jurisdiction' => 'South Africa', 'mechanism' => 'M1 – TBCA Coordination Fee', 'disposition' => '992 – Partner Services', 'evidence' => 'Current', 'opinion' => 'CLIFFE DEKKER HOFMEYR CDH-2026-0211 v1.1', 'next_review' => '20 Apr 2027']],
            ['AR-2026-0004', 'authorised', null, ['activity' => 'AIIM Country Intelligence Pack', 'profession' => 'N/A', 'jurisdiction' => 'N/A', 'mechanism' => 'M2 – Professional Fee', 'disposition' => '658 – Digital Products', 'evidence' => 'Current', 'opinion' => 'TBCA INTERNAL OP-2026-0087 v1.0', 'next_review' => '10 Apr 2027']],
            ['AR-2026-0005', 'awaiting_approval', null, ['activity' => 'Virtual Deal Room Configuration', 'profession' => 'N/A', 'jurisdiction' => 'N/A', 'mechanism' => 'M4 – Value Percentage', 'disposition' => '537 – Technology Solutions', 'evidence' => 'Current', 'opinion' => 'TBCA LEGAL OP-2026-0071 v1.0', 'next_review' => '05 Apr 2027']],
            ['AR-2026-0006', 'awaiting_opinion', null, ['activity' => 'Webinar – Carbon Tax Update', 'profession' => 'Tax Professional', 'jurisdiction' => 'South Africa', 'mechanism' => 'M2 – Professional Fee', 'disposition' => '334 – Webinars', 'evidence' => 'Current', 'opinion' => 'ENS AFRICA OP-2026-0155 v1.0', 'next_review' => '03 Apr 2027']],
            ['AR-2026-0007', 'requires_evidence', null, ['activity' => 'Diagnostics – Health Check', 'profession' => 'N/A', 'jurisdiction' => 'N/A', 'mechanism' => 'M2 – Professional Fee', 'disposition' => '121 – Diagnostics', 'evidence' => 'Stale', 'opinion' => 'TBCA INTERNAL OP-2026-0099 v1.0', 'next_review' => '07 Apr 2027']],
        ]);

        $put('expiry', [
            ['EAPA-SA/2024/345', 'current', null, ['partner' => 'EnviroImpact Solutions (Pty) Ltd', 'practitioner' => 'Dr. Lindiwe Maseko', 'profession' => 'Environmental Assessment Practitioner', 'jurisdiction' => 'South Africa', 'item' => 'Registration', 'expiry' => '12 Aug 2026', 'days_left' => 93]],
            ['POL/ALLRISK/2025/7781', 'expiring_30', null, ['partner' => 'Mhlaba Legal Inc.', 'practitioner' => 'Adv. Johan du Toit', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'item' => 'Indemnity Insurance', 'expiry' => '05 Jun 2026', 'days_left' => 26]],
            ['SAICA/9654321', 'expiring_60', null, ['partner' => 'SAICA Tax & Advisory', 'practitioner' => 'CA Nomsa Dlamini', 'profession' => 'Chartered Accountant (SA)', 'jurisdiction' => 'South Africa', 'item' => 'Registration', 'expiry' => '28 May 2026', 'days_left' => 18]],
            ['BOW/PI/2025-0447', 'expiring_90', null, ['partner' => 'EcoGauge (Pty) Ltd', 'practitioner' => 'Mr. Pieter van der Merwe', 'profession' => 'Environmental Assessment Practitioner', 'jurisdiction' => 'South Africa', 'item' => 'Indemnity Insurance', 'expiry' => '30 Apr 2026', 'days_left' => -10]],
            ['LPC/85632', 'expired', null, ['partner' => 'Webber Wentzel', 'practitioner' => 'Mr. Sipho Khumalo', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'item' => 'Registration', 'expiry' => '10 Apr 2026', 'days_left' => -30]],
            ['POL/TP/2025/5532', 'expired', null, ['partner' => 'TownPlan Africa (Pty) Ltd', 'practitioner' => 'Ms. Thandi Nkosi', 'profession' => 'Town & Regional Planner', 'jurisdiction' => 'South Africa', 'item' => 'Indemnity Insurance', 'expiry' => '03 Apr 2026', 'days_left' => -37]],
            ['SAICA/8722331', 'current', null, ['partner' => 'BDO Advisory Services', 'practitioner' => 'CA Marc Jacobs', 'profession' => 'Chartered Accountant (SA)', 'jurisdiction' => 'South Africa', 'item' => 'Registration', 'expiry' => '22 Jul 2026', 'days_left' => 72]],
            ['SACPCMP/112233', 'expiring_60', null, ['partner' => 'Health & Safety Works', 'practitioner' => 'Ms. Lerato Mkhize', 'profession' => 'Health & Safety Practitioner', 'jurisdiction' => 'South Africa', 'item' => 'Registration', 'expiry' => '25 May 2026', 'days_left' => 15]],
            ['POL/CDH/2025/2211', 'expiring_30', null, ['partner' => 'Cliffe Dekker Hofmeyr Inc.', 'practitioner' => 'Mr. Ryan Govender', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'item' => 'Indemnity Insurance', 'expiry' => '01 Jun 2026', 'days_left' => 22]],
            ['POL/ENSA/2025/9881', 'current', null, ['partner' => 'ENSafrica', 'practitioner' => 'Ms. Nomvula Dube', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'item' => 'Indemnity Insurance', 'expiry' => '18 Sep 2026', 'days_left' => 130]],
        ]);

        $put('conflicts', [
            ['PCF-10432', 'under_review', 'high', ['matter' => 'Baobab Capital Raise', 'partner' => 'Maseko & Co (SA)', 'type' => 'Current Client / Related Matter', 'opened' => '10 May 2026', 'days' => 0]],
            ['PCF-10428', 'open', 'medium', ['matter' => 'Wills & Estate – Thandi', 'partner' => 'Nkosana Legal (SA)', 'type' => 'Personal Interest', 'opened' => '09 May 2026', 'days' => 1]],
            ['PCF-10427', 'open', 'medium', ['matter' => 'IP Licensing', 'partner' => 'Van der Merwe Attorneys', 'type' => 'Prior Engagement', 'opened' => '09 May 2026', 'days' => 1]],
            ['PCF-10424', 'under_review', 'low', ['matter' => 'Tax Review', 'partner' => 'CA Nomsa Dlamini', 'type' => 'Family / Related Party', 'opened' => '08 May 2026', 'days' => 2]],
            ['PCF-10420', 'open', 'high', ['matter' => 'Employment Dispute', 'partner' => 'LPC Legal', 'type' => 'Adverse Interest', 'opened' => '08 May 2026', 'days' => 2]],
            ['PCF-10418', 'resolved', 'medium', ['matter' => 'Property Transfer', 'partner' => 'Mhlaba Legal Inc.', 'type' => 'Financial Interest', 'opened' => '07 May 2026', 'days' => 3]],
        ]);

        $put('fee-mechanisms', [
            ['M1', 'approved', null, ['name' => 'Fixed Fee (Defined Scope)', 'description' => 'Fixed fee for a defined scope of professional work with agreed deliverables.', 'applies' => 'A1, A2, A3', 'opinion' => 'Legal Opinion Required', 'counsel' => 'Yes – Counsel v1.2', 'version' => '1.2', 'effective' => '01 May 2026']],
            ['M2', 'approved', null, ['name' => 'Time & Materials (Time-Based)', 'description' => 'Fees based on time spent and agreed hourly rates with monthly reconciliation.', 'applies' => 'A1, A3', 'opinion' => 'Legal Opinion May Be Required', 'counsel' => 'Yes – Counsel v1.1', 'version' => '1.1', 'effective' => '01 May 2026']],
            ['M3', 'approved', null, ['name' => 'Success / Outcome-Based', 'description' => 'Fees linked to successful achievement of defined outcomes or milestones.', 'applies' => 'A1', 'opinion' => 'Legal Opinion Required', 'counsel' => 'Yes – Counsel v1.3', 'version' => '1.3', 'effective' => '01 May 2026']],
            ['M4', 'approved', null, ['name' => 'Subscription / Retainer', 'description' => 'Recurring fee for ongoing availability and specified services over a period.', 'applies' => 'A1, A2', 'opinion' => 'Legal Opinion May Be Required', 'counsel' => 'Yes – Counsel v1.1', 'version' => '1.1', 'effective' => '01 May 2026']],
        ]);

        $put('ledgers', [
            ['TXN-2026-000984', 'posted', null, ['date' => '10 May 2026 09:32', 'ledger' => 'T', 'type' => 'Client Payment Into Trust', 'matter' => 'DUE-2026-1183 Due Diligence', 'client' => 'Baobab Holdings (Pty) Ltd', 'partner' => '—', 'ref' => 'INV-2026-4587', 'amount' => 125000]],
            ['TXN-2026-000983', 'posted', null, ['date' => '10 May 2026 09:28', 'ledger' => 'P', 'type' => 'Professional Fee To Partner', 'matter' => 'M&A-2026-0957 Merger Advisory', 'client' => 'EnviroImpact Solutions (Pty) Ltd', 'partner' => 'GreenFields (Pty) Ltd', 'ref' => 'SET-2026-3321', 'amount' => 68750]],
            ['TXN-2026-000982', 'posted', null, ['date' => '10 May 2026 09:21', 'ledger' => 'T', 'type' => 'Disbursement From Trust', 'matter' => 'LIT-2026-0771 Litigation Support', 'client' => 'Mhlaba Legal Inc.', 'partner' => '—', 'ref' => 'DISB-2026-1199', 'amount' => 4350]],
            ['TXN-2026-000981', 'pending', null, ['date' => '10 May 2026 09:15', 'ledger' => 'P', 'type' => 'Partner Reimbursement Expenses', 'matter' => 'TAX-2026-0663 Tax Advisory', 'client' => 'SAICA Tax & Advisory', 'partner' => 'TaxPro Advisory (Pty) Ltd', 'ref' => 'EXP-2026-2244', 'amount' => 12840]],
            ['TXN-2026-000980', 'mismatch', null, ['date' => '10 May 2026 09:10', 'ledger' => '—', 'type' => 'Client Payment Into Trust', 'matter' => 'DUE-2026-1184 Due Diligence', 'client' => 'EcoGauge (Pty) Ltd', 'partner' => '—', 'ref' => 'INV-2026-4588', 'amount' => 55000]],
            ['TXN-2026-000979', 'posted', null, ['date' => '10 May 2026 08:59', 'ledger' => 'P', 'type' => 'Professional Fee To Partner', 'matter' => 'COM-2026-0412 Company Secretarial', 'client' => 'Webber Wentzel', 'partner' => 'LegalEdge Partners (Inc)', 'ref' => 'SET-2026-3319', 'amount' => 9800]],
            ['TXN-2026-000978', 'posted', null, ['date' => '10 May 2026 08:45', 'ledger' => 'T', 'type' => 'Refund To Client', 'matter' => 'FIN-2026-0510 Financing', 'client' => 'TownPlan Africa (Pty) Ltd', 'partner' => '—', 'ref' => 'RFN-2026-1155', 'amount' => 7500]],
        ]);

        $put('ps-floor-blocks', [
            ['BF-2026-0179', 'in_remediation', 'high', ['matter' => 'DUE-2026-1142 Legal Compliance Review', 'partner' => 'Mhlaba Legal Inc.', 'profession' => 'Attorney', 'arrangement' => 'A1 – Partner Review', 'quoted' => 18500, 'floor' => 38337, 'variance' => '-R19,837 (-51.7%)', 'created' => '08 May 2026']],
            ['BF-2026-0178', 'in_remediation', 'high', ['matter' => 'ENV-2026-2107 Environmental Authorisation', 'partner' => 'EnviroImpact Solutions (Pty) Ltd', 'profession' => 'Environmental Practitioner', 'arrangement' => 'A1 – Partner Review', 'quoted' => 22000, 'floor' => 38337, 'variance' => '-R16,337 (-42.6%)', 'created' => '07 May 2026']],
            ['BF-2026-0177', 'blocked', 'high', ['matter' => 'FIN-2026-0893 Funding Readiness', 'partner' => 'GreenFields (Pty) Ltd', 'profession' => 'Company Secretary', 'arrangement' => 'A1 – Partner Review', 'quoted' => 25000, 'floor' => 38337, 'variance' => '-R13,337 (-34.8%)', 'created' => '10 May 2026']],
            ['BF-2026-0176', 'blocked', 'medium', ['matter' => 'TAX-2026-1540 Tax Advisory', 'partner' => 'SAICA Tax & Advisory', 'profession' => 'Tax Practitioner', 'arrangement' => 'A1 – Partner Review', 'quoted' => 28000, 'floor' => 38337, 'variance' => '-R10,337 (-27.0%)', 'created' => '10 May 2026']],
            ['BF-2026-0175', 'in_remediation', 'medium', ['matter' => 'HR-2026-0441 Employment Contracts', 'partner' => 'Webber Wentzel', 'profession' => 'Attorney', 'arrangement' => 'A1 – Partner Review', 'quoted' => 30000, 'floor' => 38337, 'variance' => '-R8,337 (-21.7%)', 'created' => '06 May 2026']],
            ['BF-2026-0174', 'remediated', 'low', ['matter' => 'GOV-2026-1033 Corporate Governance', 'partner' => 'EcoGauge (Pty) Ltd', 'profession' => 'Company Secretary', 'arrangement' => 'A1 – Partner Review', 'quoted' => 32000, 'floor' => 38337, 'variance' => '-R6,337 (-16.5%)', 'created' => '04 May 2026']],
            ['BF-2026-0173', 'remediated', 'low', ['matter' => 'CON-2026-1978 Contract Drafting', 'partner' => 'Cliffe Dekker Hofmeyr Inc.', 'profession' => 'Attorney', 'arrangement' => 'A1 – Partner Review', 'quoted' => 35000, 'floor' => 38337, 'variance' => '-R3,337 (-8.7%)', 'created' => '03 May 2026']],
        ]);

        $put('escalations', [
            ['ES-2026-0042', 'awaiting_review', 'high', ['type' => 'Escalation', 'category' => 'Professional Limitation', 'matter' => 'DUE-2026-1163 Due Diligence', 'client' => 'Baobab Holdings (Pty) Ltd', 'partner' => 'Mhlaba Legal Inc.', 'jurisdiction' => 'South Africa', 'assigned' => 'Legal Review Team', 'due' => '12 May 2026']],
            ['ES-2026-0041', 'awaiting_review', 'high', ['type' => 'Boundary Trigger', 'category' => 'Jurisdiction Not Available', 'matter' => 'ENV-2026-0977 Environmental Authorisation', 'client' => 'EnviroImpact Solutions (Pty) Ltd', 'partner' => 'External Counsel Network', 'jurisdiction' => 'Nigeria', 'assigned' => 'Jurisdiction Team', 'due' => '13 May 2026']],
            ['ES-2026-0040', 'in_progress', 'high', ['type' => 'Escalation', 'category' => 'Conflict Confirmed', 'matter' => 'TAX-2026-1540 Tax Advisory', 'client' => 'SAICA Tax & Advisory', 'partner' => 'Webber Wentzel', 'jurisdiction' => 'South Africa', 'assigned' => 'Conflict Team', 'due' => '11 May 2026']],
            ['ES-2026-0039', 'awaiting_review', 'medium', ['type' => 'Boundary Trigger', 'category' => 'Scope Exceeds Permission', 'matter' => 'COR-2026-1084 Corporate Governance', 'client' => 'EcoGauge (Pty) Ltd', 'partner' => 'Cliffe Dekker Hofmeyr Inc.', 'jurisdiction' => 'South Africa', 'assigned' => 'Professional Standards', 'due' => '14 May 2026']],
            ['ES-2026-0038', 'in_progress', 'medium', ['type' => 'Escalation', 'category' => 'Indemnity Lapse Detected', 'matter' => 'FIN-2026-0510 Financing', 'client' => 'TownPlan Africa', 'partner' => 'Bowmans', 'jurisdiction' => 'South Africa', 'assigned' => 'Risk & Compliance', 'due' => '10 May 2026']],
            ['ES-2026-0037', 'resolved', 'low', ['type' => 'Boundary Trigger', 'category' => 'Unclear Output / Classification', 'matter' => 'HR-2026-0441 Employment Contracts', 'client' => 'HR Dynamics (Pty) Ltd', 'partner' => 'LabourNet Advisory', 'jurisdiction' => 'South Africa', 'assigned' => 'Legal Review Team', 'due' => '—']],
            ['ES-2026-0036', 'closed', 'low', ['type' => 'Boundary Trigger', 'category' => 'Client Instruction Ambiguous', 'matter' => 'PRIV-2026-0062 Privacy Policy Review', 'client' => 'DataShield (Pty) Ltd', 'partner' => 'CTS Privacy Services', 'jurisdiction' => 'South Africa', 'assigned' => 'Privacy Team', 'due' => '—']],
        ]);

        $put('performance', [
            ['PERF-001', 'active', null, ['partner' => 'Mhlaba Legal Inc.', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'matters' => 18, 'quality' => '4.68', 'tier' => 'Excellent', 'complaints' => '2 / 12', 'qa_reviews' => 16, 'slt' => '98%', 'last_review' => '08 May 2026']],
            ['PERF-002', 'active', null, ['partner' => 'GreenFields (Pty) Ltd', 'profession' => 'Environmental Practitioner', 'jurisdiction' => 'South Africa', 'matters' => 12, 'quality' => '4.35', 'tier' => 'Good', 'complaints' => '1 / 7', 'qa_reviews' => 10, 'slt' => '96%', 'last_review' => '08 May 2026']],
            ['PERF-003', 'active', null, ['partner' => 'SAICA Tax & Advisory', 'profession' => 'Tax Practitioner', 'jurisdiction' => 'South Africa', 'matters' => 11, 'quality' => '4.22', 'tier' => 'Good', 'complaints' => '3 / 14', 'qa_reviews' => 14, 'slt' => '92%', 'last_review' => '07 May 2026']],
            ['PERF-004', 'active', null, ['partner' => 'EnviroImpact Solutions (Pty) Ltd', 'profession' => 'Environmental Practitioner', 'jurisdiction' => 'Nigeria', 'matters' => 9, 'quality' => '3.84', 'tier' => 'Average', 'complaints' => '2 / 9', 'qa_reviews' => 8, 'slt' => '90%', 'last_review' => '06 May 2026']],
            ['PERF-005', 'active', null, ['partner' => 'Webber Wentzel', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'matters' => 24, 'quality' => '4.71', 'tier' => 'Excellent', 'complaints' => '1 / 8', 'qa_reviews' => 20, 'slt' => '99%', 'last_review' => '05 May 2026']],
            ['PERF-006', 'active', null, ['partner' => 'Cliffe Dekker Hofmeyr Inc.', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'matters' => 17, 'quality' => '4.10', 'tier' => 'Average', 'complaints' => '4 / 16', 'qa_reviews' => 12, 'slt' => '88%', 'last_review' => '02 May 2026']],
            ['PERF-007', 'active', null, ['partner' => 'Bowmans', 'profession' => 'Attorney', 'jurisdiction' => 'South Africa', 'matters' => 21, 'quality' => '3.52', 'tier' => 'Needs Improvement', 'complaints' => '6 / 21', 'qa_reviews' => 11, 'slt' => '82%', 'last_review' => '30 Apr 2026']],
            ['PERF-008', 'under_review', null, ['partner' => 'Outside Counsel Network', 'profession' => 'External Counsel', 'jurisdiction' => 'Multiple', 'matters' => 7, 'quality' => '3.20', 'tier' => 'Needs Improvement', 'complaints' => '4 / 11', 'qa_reviews' => 6, 'slt' => '78%', 'last_review' => '28 Apr 2026']],
            ['PERF-009', 'suspended', null, ['partner' => 'LabourNet Advisory', 'profession' => 'Labour Consultant', 'jurisdiction' => 'South Africa', 'matters' => 6, 'quality' => 'N/A', 'tier' => 'Not Rated', 'complaints' => '1 / 2', 'qa_reviews' => 0, 'slt' => '85%', 'last_review' => '—']],
            ['PERF-010', 'active', null, ['partner' => 'CTS Privacy Services', 'profession' => 'Information Officer', 'jurisdiction' => 'South Africa', 'matters' => 5, 'quality' => '4.05', 'tier' => 'Average', 'complaints' => '0 / 3', 'qa_reviews' => 5, 'slt' => '94%', 'last_review' => '05 May 2026']],
        ]);
    }
}
