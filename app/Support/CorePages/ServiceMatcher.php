<?php

namespace App\Support\CorePages;

/**
 * Find the Right Service: stage options, the offering register and the matching engine.
 * Recommendations are derived only from the visitor's answers.
 */
class ServiceMatcher
{
    public const STEPS = [
        1 => ['slug' => 'your-need', 'label' => 'Your Need', 'subtitle' => 'Tell us what you need. We will match you to the right TBCA service, Sprint or advisory route.'],
        2 => ['slug' => 'about-you', 'label' => 'About You', 'subtitle' => 'Tell us about you so we can match the right Sprint, tool or template.'],
        3 => ['slug' => 'business-context', 'label' => 'Business Context', 'subtitle' => 'Tell us about your business so we can match the right Sprint, tool or template to your context.'],
        4 => ['slug' => 'timing-budget', 'label' => 'Timing & Budget', 'subtitle' => 'Tell us your timing and budget so we can match the right Sprint, tool or template to your needs.'],
        5 => ['slug' => 'recommendations', 'label' => 'Recommendations', 'subtitle' => 'Based on your answers, we have matched the most suitable Sprints, tools and templates for your needs.'],
    ];

    public static function needs(): array
    {
        return [
            ['key' => 'diagnose', 'title' => 'Diagnose My Business', 'icon' => 'activity', 'body' => 'Assess business health, readiness, performance and priority gaps.'],
            ['key' => 'strategy', 'title' => 'Develop a Strategy or Business Plan', 'icon' => 'target', 'body' => 'Build a strategy, business model, business plan or growth roadmap.'],
            ['key' => 'finance', 'title' => 'Improve Finance and Cash Flow', 'icon' => 'bar-chart-3', 'body' => 'Strengthen financial control, profitability, forecasting and cash management.'],
            ['key' => 'funding', 'title' => 'Become Funding or Investment Ready', 'icon' => 'landmark', 'body' => 'Prepare for funding, capital raising, investor review or lender engagement.'],
            ['key' => 'project', 'title' => 'Develop or Finance a Project', 'icon' => 'clipboard-list', 'body' => 'Structure a project concept, feasibility study, financial model or funding process.'],
            ['key' => 'verify', 'title' => 'Verify a Business, Person or Project', 'icon' => 'shield-check', 'body' => 'Conduct consent-led Due Diligence, risk screening or verification.'],
            ['key' => 'automate', 'title' => 'Automate or Digitise My Operations', 'icon' => 'settings', 'body' => 'Implement Zoho, AI, RPA, workflows, dashboards or systems integration.'],
            ['key' => 'intelligence', 'title' => 'Access Market or Investment Intelligence', 'icon' => 'globe', 'body' => 'Use AIIM for country, sector, opportunity, investor or project intelligence.'],
            ['key' => 'buy', 'title' => 'Buy a Sprint, Tool or Template', 'icon' => 'shopping-bag', 'body' => 'Find a governed Sprint, report, toolkit, calculator, template or dashboard.'],
            ['key' => 'ongoing', 'title' => 'Get Ongoing Advisory Support', 'icon' => 'users', 'body' => 'Conduct a subscription, retainer or managed advisory service.'],
            ['key' => 'specialist', 'title' => 'Find a Specialist or Professional Partner', 'icon' => 'handshake', 'body' => 'Access legal, tax, audit, ESG, engineering or other specialist support.'],
            ['key' => 'unsure', 'title' => 'I Am Not Sure Yet', 'icon' => 'info', 'body' => 'Allow TBCA to guide the customer through a broader diagnostic route.'],
        ];
    }

    public static function needTitle(?string $key): ?string
    {
        return collect(self::needs())->firstWhere('key', $key)['title'] ?? null;
    }

    public static function options(): array
    {
        return [
            'describes' => ['Business Owner / Founder', 'Executive / Manager', 'Finance Professional', 'Investor / Funder', 'Project Sponsor / Developer', 'Public Sector Official', 'NGO / Development Partner', 'Consultant / Advisor', 'Student / Individual'],
            'role' => ['Chief Executive / Managing Director', 'Owner / Partner', 'Finance Director / CFO', 'Operations Lead', 'Head of Strategy', 'Project Manager', 'Other'],
            'heard_from' => ['Search Engine (Google, Bing, etc.)', 'LinkedIn / Social Media', 'Referral from a client or partner', 'Webinar or Event', 'KP Thought Leadership', 'Other'],
            'language' => ['English', 'Afrikaans'],
            'currency' => ['ZAR (South African Rand)', 'USD (US Dollar)'],
            'engage' => ['Self-Service (Shop and Digital Access)', 'Guided (Sprint with an expert)', 'Advisory (Dedicated advisor)', 'Not sure yet'],
            'stage' => ['Idea / Pre-revenue', 'Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise', 'Turnaround'],
            'industry' => ['Professional Services', 'Agriculture & Agri-processing', 'Construction & Infrastructure', 'Energy & Renewables', 'Financial Services', 'Healthcare', 'ICT & Digital', 'Manufacturing', 'Mining & Resources', 'Retail & Wholesale', 'Tourism & Hospitality', 'Transport & Logistics', 'Public Sector', 'Other'],
            'company_size' => ['Just me', '2–10 employees', '11–50 employees', '51–200 employees', '200+ employees'],
            'country' => ['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Malawi', 'Zambia', 'Other'],
            'province' => ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Not applicable'],
            'turnover' => ['Pre-revenue', 'Under R1m', 'R1m – R10m', 'R10m – R50m', 'R50m – R250m', 'Over R250m'],
            'challenge' => ['Standardising processes and templates', 'Cash flow and financial control', 'Access to funding', 'Finding new customers', 'Scaling operations', 'Compliance and governance', 'Digital transformation', 'Entering new markets'],
            'looking_for' => ['Sprint', 'Template', 'Calculator', 'Toolkit', 'Dashboard', 'Report'],
            'how_soon' => ['Within 1 week', 'Within 2 weeks', 'Within 1 month', 'Within 3 months', 'Just exploring'],
            'timeline' => ['As soon as possible', '1–2 weeks', '3–6 weeks', '2–3 months', 'Flexible'],
            'budget' => ['Under R5,000', 'R5,000 - R25,000', 'R25,000 - R75,000', 'R75,000 - R250,000', 'Over R250,000', 'Not sure yet'],
            'purchase' => ['One-time purchase', 'Monthly subscription', 'Retainer', 'Project-based quote'],
            'formats' => ['Guided Sprint', 'Template Pack', 'Calculator', 'Toolkit', 'Dashboard', 'Report'],
            'support' => ['Self-service access', 'Light guidance', 'Advisor support'],
            'alternatives' => ['Yes, if relevant', 'No, show only my chosen route'],
            // human assistance
            'help_with' => ['Buying a Sprint, Tool or Template', 'Understanding my recommendations', 'A custom or larger engagement', 'Due Diligence or verification', 'Project development or funding', 'Something else'],
            'assistance_type' => ['I need advice before I purchase', 'I need a quote or proposal', 'I need help with an existing order', 'I want to speak to a specialist'],
            'assist_how' => ['Help me understand what I need', 'Review my business context', 'Compare options for me', 'Prepare a proposal'],
            'urgency' => ['Within 1 business day', 'Within 2 business days', 'Within 5 business days', 'No rush'],
            'preferred_time' => ['Morning (08:00 – 12:00 SAST)', 'Afternoon (12:00 – 17:00 SAST)', 'Any time'],
            'contact_channel' => ['WhatsApp', 'Email', 'Phone call', 'Video call'],
        ];
    }

    /** Budget bands in ZAR [min, max]. */
    public static function budgetRange(?string $budget): array
    {
        return match ($budget) {
            'Under R5,000' => [0, 5000],
            'R5,000 - R25,000' => [5000, 25000],
            'R25,000 - R75,000' => [25000, 75000],
            'R75,000 - R250,000' => [75000, 250000],
            'Over R250,000' => [250000, PHP_INT_MAX],
            default => [0, PHP_INT_MAX],
        };
    }

    /** Validation rules per step. */
    public static function rules(int $step): array
    {
        $o = self::options();
        $in = fn (string $k) => \Illuminate\Validation\Rule::in($o[$k]);

        return match ($step) {
            1 => [
                'need' => ['required', \Illuminate\Validation\Rule::in(collect(self::needs())->pluck('key')->all())],
                'description' => ['nullable', 'string', 'max:1000'],
            ],
            2 => [
                'describes' => ['required', $in('describes')],
                'role' => ['required', $in('role')],
                'heard_from' => ['required', $in('heard_from')],
                'language' => ['required', $in('language')],
                'currency' => ['required', $in('currency')],
                'engage' => ['required', $in('engage')],
                'email' => ['required', 'email', 'max:190'],
                'whatsapp' => ['required', 'string', 'min:7', 'max:30'],
            ],
            3 => [
                'business_name' => ['required', 'string', 'max:190'],
                'stage' => ['required', $in('stage')],
                'industry' => ['required', $in('industry')],
                'company_size' => ['required', $in('company_size')],
                'country' => ['required', $in('country')],
                'province' => ['required', $in('province')],
                'turnover' => ['required', $in('turnover')],
                'challenge' => ['required', $in('challenge')],
                'looking_for' => ['required', 'array', 'min:1'],
                'looking_for.*' => [$in('looking_for')],
                'context' => ['required', 'string', 'max:1000'],
            ],
            4 => [
                'how_soon' => ['required', $in('how_soon')],
                'timeline' => ['required', $in('timeline')],
                'budget' => ['required', $in('budget')],
                'purchase' => ['required', $in('purchase')],
                'formats' => ['required', 'array', 'min:1'],
                'formats.*' => [$in('formats')],
                'support' => ['required', $in('support')],
                'alternatives' => ['required', $in('alternatives')],
                'notes' => ['nullable', 'string', 'max:1000'],
            ],
            default => [],
        };
    }

    public static function offerings(): array
    {
        return [
            ['key' => 'bpd-growth', 'name' => 'Business Plan Development Sprint – Growth', 'kind' => 'Guided Sprint', 'format' => 'Guided Sprint', 'icon' => 'rocket', 'zar' => 18500, 'needs' => ['strategy', 'funding', 'buy', 'unsure'], 'stages' => ['Startup', 'Growing / Scaling', 'Established'], 'support' => ['Light guidance', 'Advisor support'], 'weeks' => 6, 'challenges' => ['Standardising processes and templates', 'Access to funding', 'Scaling operations'], 'body' => 'A structured 6-week roadmap to define your growth business plan, aligning financials and execution roadmap.', 'bullets' => ['Ideal for growing businesses', 'Expert guidance with actionable deliverables'], 'delivery' => 'Guided Sprint', 'includes' => 'Template Pack + Review', 'href' => '/sprints/business-plan-development-sprint', 'primary' => 'View Sprint', 'secondary' => 'Book Consultation'],
            ['key' => 'sop-pack', 'name' => 'Operations & SOP Template Pack', 'kind' => 'Template Pack', 'format' => 'Template Pack', 'icon' => 'file-text', 'zar' => 6500, 'needs' => ['strategy', 'automate', 'buy'], 'stages' => ['Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise'], 'support' => ['Self-service access', 'Light guidance'], 'weeks' => 0, 'challenges' => ['Standardising processes and templates', 'Scaling operations', 'Compliance and governance'], 'body' => 'Ready-to-use operational templates to standardise internal processes, responsibilities and delivery consistency.', 'bullets' => ['Editable templates', 'Quick implementation', 'Used for scaling teams'], 'delivery' => 'Self-service access', 'includes' => 'SOP templates and planning templates', 'href' => '/tools/toolkits/standard-operating-procedure-toolkit', 'primary' => 'View Template Pack', 'secondary' => 'Add to Saved Items'],
            ['key' => 'planning-toolkit', 'name' => 'Strategic Planning Toolkit', 'kind' => 'Toolkit', 'format' => 'Toolkit', 'icon' => 'briefcase', 'zar' => 8900, 'needs' => ['strategy', 'buy', 'project'], 'stages' => ['Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise'], 'support' => ['Self-service access', 'Light guidance'], 'weeks' => 0, 'challenges' => ['Standardising processes and templates', 'Scaling operations', 'Entering new markets'], 'body' => 'A practical planning toolkit with frameworks, decision tools and worksheets to support strategy and scenario planning.', 'bullets' => ['Structured templates', 'Practical frameworks', 'Supports structured planning'], 'delivery' => 'Digital access', 'includes' => 'Planning worksheets + action tools', 'href' => '/tools/templates/business-plan-development-template', 'primary' => 'View Toolkit', 'secondary' => 'Ask a Question'],
            ['key' => 'action-register', 'name' => 'Action Tracking Register Starter', 'kind' => 'Template', 'format' => 'Template Pack', 'icon' => 'list-checks', 'zar' => 3500, 'needs' => ['strategy', 'buy', 'automate'], 'stages' => ['Startup', 'Growing / Scaling', 'Established'], 'support' => ['Self-service access'], 'weeks' => 0, 'challenges' => ['Standardising processes and templates'], 'body' => 'A ready-made register to track actions, owners and deadlines across your team.', 'bullets' => ['Editable', 'Owner and deadline tracking'], 'delivery' => 'Self-service access', 'includes' => 'Excel register', 'href' => '/tools?type=templates', 'primary' => 'View', 'secondary' => 'Add to Saved Items'],
            ['key' => 'kpi-dashboard', 'name' => 'KPI Dashboard Starter Template', 'kind' => 'Template', 'format' => 'Dashboard', 'icon' => 'layout-dashboard', 'zar' => 4900, 'needs' => ['automate', 'buy', 'finance', 'diagnose'], 'stages' => ['Growing / Scaling', 'Established', 'Mature / Enterprise'], 'support' => ['Self-service access', 'Light guidance'], 'weeks' => 0, 'challenges' => ['Scaling operations', 'Digital transformation', 'Standardising processes and templates'], 'body' => 'Track your core operational and financial KPIs in one starter dashboard.', 'bullets' => ['Pre-built KPI views', 'Excel and Zoho-ready'], 'delivery' => 'Self-service access', 'includes' => 'Dashboard template', 'href' => '/tools?type=templates', 'primary' => 'View', 'secondary' => 'Add to Saved Items'],
            ['key' => 'fmv-sprint', 'name' => 'Financial Model & Valuation Sprint', 'kind' => 'Guided Sprint', 'format' => 'Guided Sprint', 'icon' => 'trending-up', 'zar' => 9500, 'needs' => ['finance', 'funding', 'project'], 'stages' => ['Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise'], 'support' => ['Light guidance', 'Advisor support'], 'weeks' => 2, 'challenges' => ['Cash flow and financial control', 'Access to funding'], 'body' => 'Build an investor-grade financial model, cash flow forecast and valuation with a TBCA analyst.', 'bullets' => ['Driver-based model', 'Valuation and scenarios'], 'delivery' => 'Guided Sprint', 'includes' => 'Model + valuation memo', 'href' => '/sprints/financial-model-valuation-sprint', 'primary' => 'View Sprint', 'secondary' => 'Book Consultation'],
            ['key' => 'mrf-sprint', 'name' => 'Market Research & Feasibility Sprint', 'kind' => 'Guided Sprint', 'format' => 'Guided Sprint', 'icon' => 'search', 'zar' => 6500, 'needs' => ['strategy', 'intelligence', 'project', 'buy'], 'stages' => ['Idea / Pre-revenue', 'Startup', 'Growing / Scaling'], 'support' => ['Light guidance', 'Advisor support'], 'weeks' => 1, 'challenges' => ['Finding new customers', 'Entering new markets'], 'body' => 'Validate your idea, market size, competitors and pricing with data before you invest further.', 'bullets' => ['Market sizing', 'Competitor landscape'], 'delivery' => 'Guided Sprint', 'includes' => 'Research report + feasibility view', 'href' => '/sprints/market-research-feasibility-sprint', 'primary' => 'View Sprint', 'secondary' => 'Book Consultation'],
            ['key' => 'ai-sprint', 'name' => 'AI Automation & Digital Transformation Sprint', 'kind' => 'Guided Sprint', 'format' => 'Guided Sprint', 'icon' => 'bot', 'zar' => 14500, 'needs' => ['automate', 'buy'], 'stages' => ['Growing / Scaling', 'Established', 'Mature / Enterprise'], 'support' => ['Light guidance', 'Advisor support'], 'weeks' => 2, 'challenges' => ['Digital transformation', 'Scaling operations', 'Standardising processes and templates'], 'body' => 'Map workflows and implement automation, Zoho One and AI agents with human review built in.', 'bullets' => ['Workflow automation', 'Human-reviewed AI'], 'delivery' => 'Guided Sprint', 'includes' => 'Automation blueprint + build', 'href' => '/sprints/ai-automation-digital-transformation-sprint', 'primary' => 'View Sprint', 'secondary' => 'Book Consultation'],
            ['key' => 'cash-flow-calc', 'name' => '13-Week Cash Flow Forecast Calculator', 'kind' => 'Calculator', 'format' => 'Calculator', 'icon' => 'calculator', 'zar' => 2950, 'needs' => ['finance', 'buy', 'funding'], 'stages' => ['Startup', 'Growing / Scaling', 'Established', 'Turnaround'], 'support' => ['Self-service access'], 'weeks' => 0, 'challenges' => ['Cash flow and financial control'], 'body' => 'Project cash inflows and outflows week by week for 13 weeks and spot shortfalls early.', 'bullets' => ['Instant download', 'Weekly liquidity view'], 'delivery' => 'Instant download', 'includes' => 'Excel calculator', 'href' => '/tools/calculators/13-week-cash-flow-forecast-calculator', 'primary' => 'View Calculator', 'secondary' => 'Add to Saved Items'],
            ['key' => 'funding-checklist', 'name' => 'Funding Readiness Checklist & Pitch Deck Pack', 'kind' => 'Template Pack', 'format' => 'Template Pack', 'icon' => 'clipboard-check', 'zar' => 2500, 'needs' => ['funding', 'buy'], 'stages' => ['Idea / Pre-revenue', 'Startup', 'Growing / Scaling'], 'support' => ['Self-service access'], 'weeks' => 0, 'challenges' => ['Access to funding'], 'body' => 'Check your readiness for investors or lenders and present it with a professional pitch deck.', 'bullets' => ['Checklist + deck template', 'Investor-ready structure'], 'delivery' => 'Instant download', 'includes' => 'Checklist + PowerPoint deck', 'href' => '/tools/checklists/funding-readiness-checklist', 'primary' => 'View Template Pack', 'secondary' => 'Add to Saved Items'],
            ['key' => 'health-score', 'name' => 'Business Health Score + Health Check Diagnostic', 'kind' => 'Report', 'format' => 'Report', 'icon' => 'heart-pulse', 'zar' => 1950, 'needs' => ['diagnose', 'unsure', 'finance'], 'stages' => ['Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise', 'Turnaround'], 'support' => ['Self-service access', 'Light guidance'], 'weeks' => 0, 'challenges' => ['Cash flow and financial control', 'Scaling operations', 'Compliance and governance'], 'body' => 'Start with the free Business Health Score, then upgrade to a human-reviewed Health Check report.', 'bullets' => ['Free initial score', '30-day action plan'], 'delivery' => 'Digital diagnostic', 'includes' => 'Score + PDF report', 'href' => '/business-health-score', 'primary' => 'Start Health Score', 'secondary' => 'Ask a Question'],
            ['key' => 'comprehensive-diagnostic', 'name' => 'Comprehensive Business Diagnostic', 'kind' => 'Report', 'format' => 'Report', 'icon' => 'badge-check', 'zar' => 6950, 'needs' => ['diagnose', 'unsure', 'strategy'], 'stages' => ['Growing / Scaling', 'Established', 'Mature / Enterprise', 'Turnaround'], 'support' => ['Light guidance', 'Advisor support'], 'weeks' => 1, 'challenges' => ['Scaling operations', 'Compliance and governance', 'Cash flow and financial control'], 'body' => 'A deep dive across finance, operations, market, risk, people and technology with benchmarking.', 'bullets' => ['Benchmarking', 'Action plan'], 'delivery' => 'Expert-reviewed report', 'includes' => 'Diagnostic report + action plan', 'href' => '/diagnostics', 'primary' => 'View Diagnostic', 'secondary' => 'Book Consultation'],
            ['key' => 'due-diligence', 'name' => 'Consent-led Due Diligence Verification', 'kind' => 'Report', 'format' => 'Report', 'icon' => 'shield-check', 'zar' => 12500, 'needs' => ['verify'], 'stages' => ['Idea / Pre-revenue', 'Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise', 'Turnaround'], 'support' => ['Light guidance', 'Advisor support'], 'weeks' => 2, 'challenges' => ['Compliance and governance', 'Access to funding'], 'body' => 'Verify a business, person or project with consent, evidence classes and human review.', 'bullets' => ['Consent-led', 'Evidence-backed findings'], 'delivery' => 'Due Diligence case', 'includes' => 'Verification report', 'href' => '/due-diligence', 'primary' => 'Start Due Diligence', 'secondary' => 'Ask a Question'],
            ['key' => 'aiim', 'name' => 'AIIM Country & Sector Intelligence', 'kind' => 'Dashboard', 'format' => 'Dashboard', 'icon' => 'globe', 'zar' => 4500, 'needs' => ['intelligence', 'project', 'funding'], 'stages' => ['Idea / Pre-revenue', 'Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise'], 'support' => ['Self-service access', 'Light guidance'], 'weeks' => 0, 'challenges' => ['Entering new markets', 'Access to funding'], 'body' => 'Verified African country, sector, opportunity and risk intelligence through the AIIM.', 'bullets' => ['Evidence-classed data', 'Country and sector views'], 'delivery' => 'Digital access', 'includes' => 'AIIM workspace access', 'href' => '/aiim', 'primary' => 'Explore AIIM', 'secondary' => 'Ask a Question'],
            ['key' => 'market-entry', 'name' => 'Country & Market Entry Scan', 'kind' => 'Report', 'format' => 'Report', 'icon' => 'map', 'zar' => 7500, 'needs' => ['intelligence', 'project', 'specialist'], 'stages' => ['Growing / Scaling', 'Established', 'Mature / Enterprise'], 'support' => ['Light guidance', 'Advisor support'], 'weeks' => 2, 'challenges' => ['Entering new markets'], 'body' => 'Country resolver state, legal boundary, statutory fees and corridor evidence for your target market.', 'bullets' => ['Country Explorer data', 'Statutory fee view'], 'delivery' => 'Expert-reviewed report', 'includes' => 'Country profile + corridor evidence', 'href' => '/find-the-right-service/countries', 'primary' => 'Open Country Explorer', 'secondary' => 'Ask a Question'],
            ['key' => 'project-advisory', 'name' => 'Project Feasibility & Funding Advisory', 'kind' => 'Advisory', 'format' => 'Guided Sprint', 'icon' => 'clipboard-list', 'zar' => 35000, 'needs' => ['project', 'funding'], 'stages' => ['Idea / Pre-revenue', 'Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise'], 'support' => ['Advisor support'], 'weeks' => 6, 'challenges' => ['Access to funding', 'Entering new markets'], 'body' => 'Structure your project concept, feasibility study, financial model and funding process with a TBCA project advisor.', 'bullets' => ['Feasibility and model', 'Funder engagement'], 'delivery' => 'Advisory mandate', 'includes' => 'Feasibility + funding pack', 'href' => '/project-advisory', 'primary' => 'View Project Advisory', 'secondary' => 'Book Consultation'],
            ['key' => 'retainer', 'name' => 'Advisory Retainer', 'kind' => 'Retainer', 'format' => 'Guided Sprint', 'icon' => 'users', 'zar' => 15000, 'needs' => ['ongoing', 'strategy', 'finance'], 'stages' => ['Growing / Scaling', 'Established', 'Mature / Enterprise', 'Turnaround'], 'support' => ['Advisor support'], 'weeks' => 0, 'challenges' => ['Scaling operations', 'Cash flow and financial control', 'Compliance and governance'], 'body' => 'Monthly access to a TBCA advisory team for ongoing strategy, finance and execution support.', 'bullets' => ['Monthly hours', 'Dedicated advisor'], 'delivery' => 'Monthly retainer', 'includes' => 'Advisory hours + reviews', 'href' => '/retainers', 'primary' => 'View Retainers', 'secondary' => 'Book Consultation'],
            ['key' => 'partner', 'name' => 'Specialist Partner Referral', 'kind' => 'Partner Service', 'format' => 'Report', 'icon' => 'handshake', 'zar' => 0, 'needs' => ['specialist', 'verify'], 'stages' => ['Idea / Pre-revenue', 'Startup', 'Growing / Scaling', 'Established', 'Mature / Enterprise', 'Turnaround'], 'support' => ['Light guidance', 'Advisor support'], 'weeks' => 0, 'challenges' => ['Compliance and governance', 'Entering new markets'], 'body' => 'Access vetted legal, tax, audit, ESG and engineering partners through a governed referral.', 'bullets' => ['Vetted partners', 'Quote on request'], 'delivery' => 'Partner-delivered', 'includes' => 'Matched partner introduction', 'href' => '/partner-services', 'primary' => 'View Partner Services', 'secondary' => 'Ask a Question'],
        ];
    }

    /**
     * Rank offerings against the visitor's answers.
     *
     * @return array{best: list<array>, also: list<array>, basis: array}
     */
    public static function match(array $a): array
    {
        [$min, $max] = self::budgetRange($a['budget'] ?? null);
        $formats = array_unique([...($a['formats'] ?? []), ...array_map(fn ($f) => match ($f) {
            'Sprint' => 'Guided Sprint',
            'Template' => 'Template Pack',
            default => $f,
        }, $a['looking_for'] ?? [])]);
        $strict = ($a['alternatives'] ?? '') === 'No, show only my chosen route';
        $urgentWeeks = match ($a['how_soon'] ?? null) {
            'Within 1 week' => 1,
            'Within 2 weeks' => 2,
            'Within 1 month' => 4,
            default => 12,
        };

        $scored = collect(self::offerings())
            ->when($strict && $formats, fn ($c) => $c->filter(fn ($o) => in_array($o['format'], $formats, true)))
            ->map(function ($o) use ($a, $min, $max, $formats, $urgentWeeks) {
                $score = 0;
                $score += in_array($a['need'] ?? '', $o['needs'], true) ? 38 : 0;
                $score += in_array($o['format'], $formats, true) ? 18 : 0;
                $score += ($o['zar'] >= $min && $o['zar'] <= $max) || $o['zar'] === 0 ? 15 : ($o['zar'] <= $max * 1.5 ? 6 : 0);
                $score += in_array($a['support'] ?? '', $o['support'], true) ? 10 : 0;
                $score += in_array($a['stage'] ?? '', $o['stages'], true) ? 8 : 0;
                $score += in_array($a['challenge'] ?? '', $o['challenges'], true) ? 7 : 0;
                $score += $o['weeks'] <= $urgentWeeks ? 4 : 0;

                return [...collect($o)->except(['needs', 'stages', 'support', 'challenges'])->all(), 'match' => min(99, $score)];
            })
            ->sortByDesc('match')
            ->values();

        return [
            'best' => $scored->take(3)->values()->all(),
            'also' => $scored->slice(3)->filter(fn ($o) => $o['match'] >= 40)->take(2)->values()->all(),
            'basis' => [
                'need' => self::needTitle($a['need'] ?? null),
                'stage' => $a['stage'] ?? null,
                'industry' => $a['industry'] ?? null,
                'budget' => $a['budget'] ?? null,
                'formats' => $a['formats'] ?? [],
                'challenge' => $a['challenge'] ?? null,
            ],
        ];
    }
}
