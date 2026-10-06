<?php

namespace App\Support\Sprints;

/**
 * Sprint catalogue taxonomy: categories, buyer routes (audiences), curated views,
 * sort options and filter bands. Shared by the catalogue controllers, the seeder
 * and the order flow so labels and slugs stay in one place.
 */
class Taxonomy
{
    public const BADGES = [
        ['label' => 'Delivered by TBCA Experts', 'icon' => 'user-check'],
        ['label' => 'Structured outcomes', 'icon' => 'layers'],
        ['label' => 'Secure and confidential', 'icon' => 'shield-check'],
        ['label' => 'Built for African businesses', 'icon' => 'globe'],
    ];

    /**
     * @return array<string, array{label: string, icon: string, description: string, quick: list<string>, badges?: list<array{label: string, icon: string}>, search: string}>
     */
    public static function categories(): array
    {
        return [
            'business-management' => [
                'label' => 'Business and Management',
                'icon' => 'briefcase',
                'description' => 'Explore expert-led Sprints for strategy, planning, governance, business performance, operations and management execution.',
                'quick' => ['Business Planning', 'Strategy', 'Governance', 'Operations', 'CRM', 'Board Support'],
                'search' => 'Search Business and Management Sprints by business need, deliverable or keyword',
            ],
            'ai-automation' => [
                'label' => 'AI and Automation',
                'icon' => 'bot',
                'description' => 'Explore expert-led AI, automation and intelligent workflow Sprints designed to improve efficiency, insight, customer engagement and scalable execution.',
                'quick' => ['AI Readiness', 'Workflow Automation', 'CRM Automation', 'Chatbots', 'AI Agents', 'Process Automation', 'Prompt Engineering'],
                'badges' => [
                    ['label' => 'AI-enabled solutions', 'icon' => 'cpu'],
                    ['label' => 'Workflow efficiency', 'icon' => 'workflow'],
                    ['label' => 'Secure & confidential', 'icon' => 'shield-check'],
                    ['label' => 'Built for African businesses', 'icon' => 'globe'],
                ],
                'search' => 'Search AI and Automation Sprints by use case, workflow, tool or business need',
            ],
            'data-dashboards' => [
                'label' => 'Data and Dashboards',
                'icon' => 'layout-dashboard',
                'description' => 'Explore expert-led dashboards, analytics tools and decision-support Sprints designed to improve visibility, performance tracking and smarter business decisions.',
                'quick' => ['Executive Dashboards', 'KPI Tracking', 'Cashflow', 'Financial Models', 'Loan Amortisation', 'Business Intelligence'],
                'badges' => [
                    ['label' => 'Decision-ready insights', 'icon' => 'bar-chart-3'],
                    ['label' => 'Executive visibility', 'icon' => 'eye'],
                    ['label' => 'Secure & confidential', 'icon' => 'shield-check'],
                    ['label' => 'Built for African businesses', 'icon' => 'globe'],
                ],
                'search' => 'Search Data and Dashboard Sprints by KPI, dashboard, report or business need',
            ],
            'courses-learning' => [
                'label' => 'Courses and Learning',
                'icon' => 'graduation-cap',
                'description' => 'Explore expert-led learning Sprints, bootcamps, masterclasses and practical business training designed to build capability, accelerate execution and strengthen decision-making.',
                'quick' => ['Bootcamps', 'Masterclasses', 'Founder Training', 'Finance Skills', 'Board Training', 'AI Literacy', 'Strategy Learning'],
                'badges' => [
                    ['label' => 'Expert-led learning', 'icon' => 'graduation-cap'],
                    ['label' => 'Practical outcomes', 'icon' => 'circle-check'],
                    ['label' => 'Secure & confidential', 'icon' => 'shield-check'],
                    ['label' => 'Built for Africa', 'icon' => 'globe'],
                ],
                'search' => 'Search Courses and Learning by topic, skill, sprint or business need',
            ],
            'diagnostics' => [
                'label' => 'Diagnostics',
                'icon' => 'heart-pulse',
                'description' => 'AI-powered diagnostic Sprints that assess, benchmark and uncover insights across every area of your business.',
                'quick' => ['Business Health Check', 'Cash Flow Diagnostic', 'Marketing Effectiveness', 'HR Maturity', 'Cybersecurity', 'Sustainability Diagnostic'],
                'badges' => [
                    ['label' => 'Evidence-based assessments', 'icon' => 'clipboard-check'],
                    ['label' => 'Benchmarking insights', 'icon' => 'bar-chart-3'],
                    ['label' => 'Instant scoring & analysis', 'icon' => 'gauge'],
                    ['label' => 'Secure & confidential', 'icon' => 'shield-check'],
                ],
                'search' => 'Search Diagnostics by name, keyword or business area',
            ],
            'digital-products' => [
                'label' => 'Digital Products',
                'icon' => 'download',
                'description' => 'Instant access to expert-built reports, templates, toolkits and tools that help you plan, model, assess and execute with confidence. All products are human-reviewed and version-controlled.',
                'quick' => ['Reports', 'Templates', 'Toolkits', 'Checklists', 'Calculators', 'Dashboards', 'Guides'],
                'badges' => [
                    ['label' => 'Human-reviewed quality', 'icon' => 'user-check'],
                    ['label' => 'Version controlled', 'icon' => 'history'],
                    ['label' => 'Secure downloads', 'icon' => 'download'],
                    ['label' => '7 languages available', 'icon' => 'languages'],
                ],
                'search' => 'Search digital products, reports, templates and tools',
            ],
            'project-advisory' => [
                'label' => 'Project Advisory',
                'icon' => 'compass',
                'description' => 'Expert-led advisory Sprints to plan, structure and deliver successful projects from concept to completion.',
                'quick' => ['Feasibility Study', 'Project Structuring', 'Business Case', 'Implementation Plan', 'PPP Advisory', 'Risk Assessment'],
                'badges' => [
                    ['label' => 'Expert advisors', 'icon' => 'user-star'],
                    ['label' => 'Practical frameworks', 'icon' => 'layers'],
                    ['label' => 'Bankable outputs', 'icon' => 'badge-check'],
                    ['label' => 'Built for Africa', 'icon' => 'globe'],
                ],
                'search' => 'Search Project Advisory Sprints by keyword or business need',
            ],
            'research-reports' => [
                'label' => 'Research and Reports',
                'icon' => 'file-text',
                'description' => 'In-depth research, market intelligence and analytical reports to support better decisions, strategies and investments.',
                'quick' => ['Market Research', 'Industry Report', 'Feasibility Study', 'Economic Outlook', 'Benchmarking', 'Risk Analysis'],
                'badges' => [
                    ['label' => 'Expert research', 'icon' => 'search'],
                    ['label' => 'Data-driven insights', 'icon' => 'bar-chart-3'],
                    ['label' => 'Actionable intelligence', 'icon' => 'lightbulb'],
                    ['label' => 'Built for Africa', 'icon' => 'globe'],
                ],
                'search' => 'Search Research and Reports by topic, industry or keyword',
            ],
            'templates-toolkits' => [
                'label' => 'Templates and Toolkits',
                'icon' => 'layout-template',
                'description' => 'Explore practical templates, structured toolkits and ready-to-use business resources designed to speed up execution and improve quality.',
                'quick' => ['Business Planning', 'Due Diligence', 'Finance Templates', 'Board Packs', 'HR Templates', 'Investor Tools', 'Project Templates'],
                'badges' => [
                    ['label' => 'Ready-to-use resources', 'icon' => 'download'],
                    ['label' => 'Practical frameworks', 'icon' => 'layers'],
                    ['label' => 'Secure & confidential', 'icon' => 'shield-check'],
                    ['label' => 'Built for Africa', 'icon' => 'globe'],
                ],
                'search' => 'Search Templates and Toolkits by topic, template, toolkit or business need',
            ],
            'technology' => [
                'label' => 'Technology',
                'icon' => 'cpu',
                'description' => 'Technology setup, implementation and integration Sprints that put the right systems in place for your business.',
                'quick' => ['Accounting Systems', 'CRM Setup', 'Cloud', 'Integrations', 'Cybersecurity'],
                'search' => 'Search Technology Sprints by system, tool or business need',
            ],
            'due-diligence' => [
                'label' => 'Due Diligence',
                'icon' => 'shield-check',
                'description' => 'Due diligence and trust Sprints that prepare you for investors, lenders, partners and transactions.',
                'quick' => ['Readiness', 'Transaction Support', 'Data Room', 'Compliance', 'Risk Review'],
                'search' => 'Search Due Diligence Sprints by transaction, readiness or risk need',
            ],
            'subscriptions-retainers' => [
                'label' => 'Subscriptions and Retainers',
                'icon' => 'history',
                'description' => 'Ongoing advisory, monitoring and support on a monthly subscription or retainer.',
                'quick' => ['Advisory Retainers', 'Monitoring', 'Board Support', 'Finance Support'],
                'search' => 'Search Subscriptions and Retainers by service or business need',
            ],
        ];
    }

    /**
     * Buyer routes. "audience" in the sprints table holds a comma-separated list of these keys.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function audiences(): array
    {
        $support = fn (string $who) => [
            ['title' => 'Find the Right Sprint', 'body' => "Get matched to the best Sprint for your {$who}.", 'icon' => 'compass', 'href' => '/sprints/recommended'],
            ['title' => 'Start Business Health Score', 'body' => 'Understand your strengths and improvement areas.', 'icon' => 'activity', 'href' => '/sprints/category/diagnostics'],
            ['title' => 'Book Discovery Call', 'body' => 'Speak with a TBCA expert about your priorities.', 'icon' => 'calendar-days', 'href' => '/sprints/request-a-quote'],
            ['title' => 'Request a Custom Sprint', 'body' => "Tell us what you need and we'll structure the right Sprint.", 'icon' => 'rocket', 'href' => '/sprints/request-a-quote'],
            ['title' => 'Continue on WhatsApp', 'body' => 'Chat with our team on WhatsApp.', 'icon' => 'message-circle', 'href' => 'https://wa.me/27608011365'],
        ];

        return [
            'founders' => [
                'label' => 'Founders and Startups',
                'short' => 'Founder',
                'icon' => 'rocket',
                'title' => 'Sprints for Founders and Startups',
                'description' => 'Practical, expert-led Sprints to help you start, structure, fund, grow and scale your business.',
                'needs' => ['Start a Business', 'Grow Revenue', 'Raise Capital', 'Improve Operations', 'Build a Strategy', 'Develop a Project', 'Manage Risk', 'Automate Processes', 'Improve Governance'],
                'focusLabel' => 'Business Stage',
                'focus' => ['Idea Stage', 'Early-Stage', 'Growth Stage', 'Scale-Up'],
                'popular' => ['Business Plan', 'Pitch Deck', 'Funding Readiness', 'Financial Model', 'Business Health Score', 'Market Entry'],
                'support' => $support('business'),
            ],
            'smes' => [
                'label' => 'SMEs',
                'short' => 'SME',
                'icon' => 'building',
                'title' => 'Sprints for SMEs',
                'description' => 'Practical, expert-led Sprints to help you improve performance, grow revenue, manage risk and build a stronger business.',
                'needs' => ['Grow Revenue', 'Raise Capital', 'Improve Operations', 'Build a Strategy', 'Manage Risk', 'Automate Processes', 'Improve Governance'],
                'focusLabel' => 'Business Stage',
                'focus' => ['Early-Stage', 'Growth Stage', 'Established'],
                'popular' => ['Business Health Score', 'Business Plan', 'Funding Readiness', 'Financial Model', 'CRM', 'Cashflow'],
                'support' => $support('business'),
            ],
            'corporates' => [
                'label' => 'Corporates',
                'short' => 'Corporate',
                'icon' => 'building-2',
                'title' => 'Sprints for Corporates',
                'description' => 'Practical, expert-led Sprints to help corporates improve performance, strengthen governance, manage risk, execute strategic projects and drive transformation.',
                'needs' => ['Strategy and Growth', 'Operational Excellence', 'Governance and Risk', 'Project Advisory', 'AI and Automation', 'Data and Dashboards', 'Market Expansion'],
                'focusLabel' => 'Corporate Focus',
                'focus' => ['Growth and Strategy', 'Operations', 'Governance', 'Risk', 'Transformation', 'Market Expansion'],
                'popular' => ['Board Pack', 'Due Diligence', 'Operational Improvement', 'AI Readiness', 'Market Entry', 'Dashboard Design'],
                'support' => $support('business'),
            ],
            'investors' => [
                'label' => 'Investors and Funders',
                'short' => 'Investor',
                'icon' => 'trending-up',
                'title' => 'Sprints for Investors and Funders',
                'description' => 'Practical, expert-led Sprints to help investors and funders screen opportunities, assess risk, evaluate projects, strengthen due diligence and make better decisions.',
                'needs' => ['Screen Opportunities', 'Conduct Due Diligence', 'Review Financials', 'Assess Risk', 'Evaluate Projects', 'Portfolio Monitoring', 'Investment Memos', 'Data and Dashboards'],
                'focusLabel' => 'Investment Focus',
                'focus' => ['Due Diligence', 'Project Appraisal', 'Financial Review', 'Risk Assessment', 'Portfolio Monitoring', 'Investment Committee Support'],
                'popular' => ['Due Diligence', 'Financial Model', 'Risk Review', 'Investment Memo', 'Project Feasibility', 'Portfolio Dashboard'],
                'support' => $support('investment need'),
            ],
            'ngos' => [
                'label' => 'NGOs and Development Programmes',
                'short' => 'NGO',
                'icon' => 'handshake',
                'title' => 'Sprints for NGOs and Development Programmes',
                'description' => 'Impact-driven Sprints to help you design, fund, implement and evaluate programmes that transform communities.',
                'needs' => ['Programme Planning', 'Donor Funding', 'Monitoring and Evaluation', 'Governance', 'Financial Management', 'Sustainability and Impact'],
                'focusLabel' => 'Programme Focus',
                'focus' => ['Programme Design', 'Fundraising', 'M&E', 'Governance', 'Finance', 'Sustainability'],
                'popular' => ['Programme Design', 'Donor Proposal', 'M&E Framework', 'Governance', 'Financial Management', 'Impact Strategy'],
                'support' => $support('mission'),
            ],
            'sponsors' => [
                'label' => 'Project Sponsors',
                'short' => 'Sponsor',
                'icon' => 'landmark',
                'title' => 'Sprints for Project Sponsors',
                'description' => 'Practical, expert-led Sprints to help project sponsors structure opportunities, test viability, prepare documentation, mobilise funding and execute complex projects with confidence.',
                'needs' => ['Structure a Project', 'Assess Feasibility', 'Raise Capital', 'Prepare Documentation', 'Manage Risk', 'Execute Delivery', 'Build Partnerships', 'Due Diligence Support'],
                'focusLabel' => 'Sponsor Focus',
                'focus' => ['Project Structuring', 'Feasibility', 'Capital Mobilisation', 'Implementation Planning', 'Governance', 'Risk Management', 'Stakeholder Alignment'],
                'popular' => ['Project Feasibility', 'Financial Model', 'Board Pack', 'Capital Raise', 'Risk Review', 'Delivery Plan'],
                'support' => $support('project goals'),
            ],
            'public-sector' => [
                'label' => 'Public Sector and Institutions',
                'short' => 'Public Sector',
                'icon' => 'landmark',
                'title' => 'Sprints for Public Sector and Institutions',
                'description' => 'Practical, expert-led Sprints to help public institutions strengthen delivery, improve governance, structure projects and execute with confidence.',
                'needs' => ['Institutional Strategy', 'Service Delivery', 'Governance and Compliance', 'Project Advisory', 'PPP Readiness', 'Risk Management', 'Data and Dashboards', 'Funding Support'],
                'focusLabel' => 'Institution Focus',
                'focus' => ['Ministries', 'Municipalities', 'State-Owned Entities', 'Development Agencies', 'Regulators', 'Public Programmes'],
                'popular' => ['Governance Review', 'PPP Readiness', 'Institutional Strategy', 'Delivery Plan', 'Dashboard Design', 'Risk Review'],
                'support' => $support('institution'),
            ],
        ];
    }

    /**
     * Curated listing views from the Navigating Sprints mockups.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function views(): array
    {
        return [
            'all' => [
                'title' => 'Browse All Sprints',
                'description' => 'Find the right expert-led Sprint for your business challenge, growth objective or investment requirement.',
                'search' => 'Search Sprints by business need, deliverable, industry or keyword',
                'sort' => 'recommended',
                'spotlight' => null,
            ],
            'featured' => [
                'title' => 'Featured Sprints',
                'description' => "Explore TBCA's curated selection of standout Sprints designed to accelerate growth, readiness, strategy and execution.",
                'search' => 'Search featured Sprints by business need, growth stage or deliverable',
                'sort' => 'featured',
                'spotlight' => ['label' => "This week's spotlight", 'why' => "Why it's featured"],
                'badges' => [
                    ['label' => 'Delivered by TBCA Experts', 'icon' => 'user-check'],
                    ['label' => 'High-demand solutions', 'icon' => 'sparkles'],
                    ['label' => 'Structured outcomes', 'icon' => 'layers'],
                    ['label' => 'Built for African businesses', 'icon' => 'globe'],
                ],
            ],
            'new' => [
                'title' => 'New Sprints',
                'description' => "Freshly launched expert-led Sprints designed to address today's challenges and create tomorrow's opportunities.",
                'search' => 'Search New Sprints by business need, deliverable, industry or keyword',
                'sort' => 'new',
                'spotlight' => null,
                'badges' => [
                    ['label' => 'Latest solutions', 'icon' => 'sparkles'],
                    ['label' => 'Expert validated', 'icon' => 'badge-check'],
                    ['label' => 'Rapid impact', 'icon' => 'zap'],
                    ['label' => 'Built for Africa', 'icon' => 'globe'],
                ],
            ],
            'popular' => [
                'title' => 'Popular Sprints',
                'description' => "Explore TBCA's most in-demand Sprints trusted by founders, SMEs, corporates and project sponsors across Africa.",
                'search' => 'Search popular Sprints by business need, growth stage or deliverable',
                'sort' => 'popular',
                'spotlight' => ['label' => 'Most selected this month', 'why' => "Why it's popular"],
                'badges' => [
                    ['label' => 'Most selected by clients', 'icon' => 'users'],
                    ['label' => 'High-demand solutions', 'icon' => 'sparkles'],
                    ['label' => 'Structured outcomes', 'icon' => 'layers'],
                    ['label' => 'Built for African businesses', 'icon' => 'globe'],
                ],
            ],
            'recommended' => [
                'title' => 'Recommended Sprints',
                'description' => 'Personalised expert-led Sprints selected to match your business stage, growth objective and investment needs.',
                'search' => 'Search recommended Sprints by business need, growth stage or deliverable',
                'sort' => 'match',
                'spotlight' => ['label' => 'Best match for you', 'why' => "Why it's recommended"],
                'badges' => [
                    ['label' => 'AI-tailored matches', 'icon' => 'sparkles'],
                    ['label' => 'Delivered by TBCA Experts', 'icon' => 'user-check'],
                    ['label' => 'Structured outcomes', 'icon' => 'target'],
                    ['label' => 'Built for African businesses', 'icon' => 'globe'],
                ],
            ],
            'marketplace' => [
                'title' => 'Sprint Marketplace',
                'description' => 'Discover packaged Sprints, partner-delivered solutions, specialist toolkits and ready-to-buy business outcomes from across the TBCA ecosystem.',
                'search' => 'Search marketplace Sprints by business need, category, partner or deliverable',
                'sort' => 'featured',
                'spotlight' => ['label' => 'Marketplace spotlight', 'why' => 'Marketplace advantages'],
                'badges' => [
                    ['label' => 'Delivered by TBCA Experts', 'icon' => 'user-check'],
                    ['label' => 'Partner-enabled offers', 'icon' => 'handshake'],
                    ['label' => 'Structured outcomes', 'icon' => 'layers'],
                    ['label' => 'Built for African businesses', 'icon' => 'globe'],
                ],
            ],
        ];
    }

    /** @return array<string, string> */
    public static function sorts(): array
    {
        return [
            'recommended' => 'Recommended',
            'featured' => 'Featured First',
            'popular' => 'Most Popular',
            'new' => 'Newest',
            'rating' => 'Highest Rated',
            'price_asc' => 'Price: Low to High',
            'price_desc' => 'Price: High to Low',
            'az' => 'A to Z',
            'match' => 'Best Match',
        ];
    }

    /** @return array<string, array{label: string, min: ?int, max: ?int}> */
    public static function priceBands(): array
    {
        return [
            'under-5000' => ['label' => 'Under R5 000', 'min' => 0, 'max' => 4999],
            '5000-10000' => ['label' => 'R5 000 – R10 000', 'min' => 5000, 'max' => 10000],
            '10000-20000' => ['label' => 'R10 001 – R20 000', 'min' => 10001, 'max' => 20000],
            'over-20000' => ['label' => 'Over R20 000', 'min' => 20001, 'max' => null],
            'quote' => ['label' => 'Quote / price on scope', 'min' => null, 'max' => null],
        ];
    }

    /** @return array<string, array{label: string, max: ?int}> */
    public static function deliveryBands(): array
    {
        return [
            'instant' => ['label' => 'Instant / same day', 'max' => 1],
            'up-to-7' => ['label' => 'Up to 7 days', 'max' => 7],
            'up-to-14' => ['label' => 'Up to 14 days', 'max' => 14],
            'over-14' => ['label' => 'More than 14 days', 'max' => null],
            'after-scope' => ['label' => 'Confirmed after scope', 'max' => null],
        ];
    }

    /** @return array<string, string> */
    public static function commercialActs(): array
    {
        return [
            'purchase' => 'Buy now',
            'quote' => 'Request a quote',
            'subscription' => 'Subscription',
            'retainer' => 'Retainer',
            'free' => 'Free',
        ];
    }

    /** Human label for a type key, e.g. "fixed-scope" -> "Fixed Scope". */
    public static function typeLabel(string $type): string
    {
        return [
            'core-service' => 'Core Service Sprint',
            'embedded' => 'Embedded Service',
            'fixed-scope' => 'Fixed Scope Service',
            'client-service' => 'Client Service Sprint',
            'diagnostic' => 'Diagnostic',
            'ai-advisory' => 'AI Advisory Sprint',
            'ai-automation' => 'AI / Automation Sprint',
            'premium' => 'Premium Sprint',
            'premium-service' => 'Premium Service Sprint',
            'dashboard-data' => 'Dashboard / Data Sprint',
            'technology-setup' => 'Technology Setup',
            'partner-delivered' => 'Partner-Delivered Sprint',
        ][$type] ?? ucwords(str_replace('-', ' ', $type));
    }

    /** Legacy / mockup URL slugs that redirect to the canonical routes. */
    public static function aliases(): array
    {
        return [
            'featured-sprints' => '/sprints/featured',
            'new-sprints' => '/sprints/new',
            'popular-sprints' => '/sprints/popular',
            'recommended-sprints' => '/sprints/recommended',
            'a-to-z-services' => '/sprints/a-z',
            'browse' => '/sprints',
            'explore' => '/sprints',
            'business-and-management' => '/sprints/category/business-management',
            'ai-and-automation' => '/sprints/category/ai-automation',
            'data-and-dashboards' => '/sprints/category/data-dashboards',
            'courses-and-learning' => '/sprints/category/courses-learning',
            'templates-and-toolkits' => '/sprints/category/templates-toolkits',
            'research-and-reports' => '/sprints/category/research-reports',
            'founders-and-startups' => '/sprints/for/founders',
            'smes' => '/sprints/for/smes',
            'corporates' => '/sprints/for/corporates',
            'investors-and-funders' => '/sprints/for/investors',
            'ngos-and-development-programmes' => '/sprints/for/ngos',
            'project-sponsors' => '/sprints/for/sponsors',
            'public-sector-and-institutions' => '/sprints/for/public-sector',
        ];
    }

    /** Category slug aliases used in mockup URLs under /sprints/category/... */
    public static function categoryAliases(): array
    {
        return [
            'research-and-reports' => 'research-reports',
            'business-and-management' => 'business-management',
            'ai-and-automation' => 'ai-automation',
            'data-and-dashboards' => 'data-dashboards',
            'courses-and-learning' => 'courses-learning',
            'templates-and-toolkits' => 'templates-toolkits',
        ];
    }
}
