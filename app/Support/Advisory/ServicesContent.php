<?php

namespace App\Support\Advisory;

/**
 * Content register for the public Services hub: clusters, canonical vehicles,
 * capability families/pillars/capabilities and resolver vocabularies.
 */
class ServicesContent
{
    public const VAT = 0.15;

    public static function clusters(): array
    {
        return [
            ['title' => 'Diagnose & Assess', 'icon' => 'activity', 'body' => 'Assess your business health, readiness and performance with our Diagnostics.', 'link' => 'View Diagnostics', 'href' => '/diagnostics'],
            ['title' => 'Plan & Strategize', 'icon' => 'target', 'body' => 'Strategy, feasibility, business modeling and project advisory for growth and investment.', 'link' => 'View Project Advisory', 'href' => '/project-advisory'],
            ['title' => 'Verify & De-Risk', 'icon' => 'shield-check', 'body' => 'Due Diligence, compliance and risk verification for confident decisions and transactions.', 'link' => 'View Due Diligence', 'href' => '/due-diligence'],
            ['title' => 'Build & Implement', 'icon' => 'settings', 'body' => 'Technology solutions, automation and implementation services that drive efficiency.', 'link' => 'View Technology Solutions', 'href' => '/technology-solutions'],
            ['title' => 'Access Intelligence', 'icon' => 'bar-chart-3', 'body' => 'AIIM, data insights and opportunity intelligence for smarter decisions.', 'link' => 'Explore AIIM', 'href' => '/aiim'],
            ['title' => 'Fund & Capitalise', 'icon' => 'landmark', 'body' => 'Funding readiness, capital raising and investor connections.', 'link' => 'View Funding Services', 'href' => '/services/capability/finance'],
            ['title' => 'Operate & Outsource', 'icon' => 'users', 'body' => 'Managed retainers and ongoing advisory to run your business better.', 'link' => 'View Retainers', 'href' => '/retainers'],
            ['title' => 'Marketplace & Talent', 'icon' => 'briefcase', 'body' => 'Connect with vetted experts, providers and specialists in our Marketplace.', 'link' => 'Go to Marketplace', 'href' => '/marketplace'],
            ['title' => 'Partner & Professional', 'icon' => 'handshake', 'body' => 'Access legal, audit, tax, ESG and specialist partner services.', 'link' => 'Partner Services', 'href' => '/partner-services'],
            ['title' => 'Shop Products & Tools', 'icon' => 'shopping-bag', 'body' => 'Sprint products, digital tools, templates and resources to accelerate results.', 'link' => 'Visit Shop', 'href' => '/shop'],
            ['title' => 'Learn & Be Inspired', 'icon' => 'graduation-cap', 'body' => 'Knowledge hub, resources, webinars and thought leadership.', 'link' => 'View Resources', 'href' => '/resources'],
            ['title' => 'Get in Touch', 'icon' => 'phone', 'body' => 'Speak to our team, book a call or connect via WhatsApp.', 'link' => 'Contact TBCA', 'href' => '/contact'],
        ];
    }

    public static function featured(): array
    {
        return [
            ['title' => 'Business Health Diagnostic', 'body' => 'Start a comprehensive assessment', 'href' => '/diagnostics'],
            ['title' => 'Funding Readiness Sprint', 'body' => 'Prepare to attract capital', 'href' => '/project-advisory/services/funding-investor-readiness'],
            ['title' => 'Due Diligence – Company Check', 'body' => 'Verify with confidence', 'href' => '/due-diligence/company'],
            ['title' => 'AIIM – Africa Intelligence', 'body' => 'Explore opportunities', 'href' => '/aiim'],
        ];
    }

    /** The 12 canonical execution vehicles plus the enterprise relationship mode (REL-01). */
    public static function vehicles(): array
    {
        return [
            ['slug' => 'diagnostics', 'num' => '01', 'name' => 'Diagnostics', 'icon' => 'activity', 'body' => 'Assess your current state, identify issues and get a clear starting point.', 'pricing' => 'Fixed fee', 'commitment' => 'Short-term', 'ideal' => 'Clarity before action', 'href' => '/diagnostics', 'from' => 0],
            ['slug' => 'sprint', 'num' => '02', 'name' => 'Sprint', 'icon' => 'target', 'body' => 'Fast, focused expert support to solve a specific problem or deliver a specific outcome.', 'pricing' => 'Fixed fee', 'commitment' => 'Short-term', 'ideal' => 'Quick expert', 'href' => '/services/a-z', 'from' => 2450],
            ['slug' => 'digital-product', 'num' => '03', 'name' => 'Digital Product', 'icon' => 'graduation-cap', 'body' => 'Ready-made tools, templates, frameworks and calculators you can use immediately.', 'pricing' => 'Per product', 'commitment' => 'One-time', 'ideal' => 'DIY execution', 'href' => '/digital-products', 'from' => 450],
            ['slug' => 'subscription', 'num' => '04', 'name' => 'Subscription', 'icon' => 'bar-chart-3', 'body' => 'Ongoing access to insights, updates, data and resources.', 'pricing' => 'Recurring', 'commitment' => 'Monthly / Annual', 'ideal' => 'Ongoing guidance', 'href' => '/subscriptions', 'from' => 990],
            ['slug' => 'retainer', 'num' => '05', 'name' => 'Retainer', 'icon' => 'users', 'body' => 'Reserved expert capacity for ongoing advice, reviews and guidance.', 'pricing' => 'Recurring', 'commitment' => 'Monthly / Annual', 'ideal' => 'Continuous advisory', 'href' => '/retainers', 'from' => 9950],
            ['slug' => 'aiim-intelligence', 'num' => '06', 'name' => 'AIIM Intelligence', 'icon' => 'map', 'body' => 'Premium market intelligence, analytics, opportunities and risk signals from AIIM.', 'pricing' => 'Tiered / Usage', 'commitment' => 'Pay-as-you-go', 'ideal' => 'Intelligence driven decisions', 'href' => '/aiim', 'from' => 0],
            ['slug' => 'due-diligence', 'num' => '07', 'name' => 'Due Diligence', 'icon' => 'shield-check', 'body' => 'Verification, background checks, feasibility and risk assessment.', 'pricing' => 'Fixed / Scope', 'commitment' => 'Project-based', 'ideal' => 'Confident decisions', 'href' => '/due-diligence', 'from' => 0],
            ['slug' => 'virtual-deal-room', 'num' => '08', 'name' => 'Virtual Deal Room', 'icon' => 'users-round', 'body' => 'Secure digital room for due diligence, collaboration and deal management.', 'pricing' => 'Usage / Package', 'commitment' => 'Project-based', 'ideal' => 'Deal execution', 'href' => '/marketplace', 'from' => 0],
            ['slug' => 'technology-solutions', 'num' => '09', 'name' => 'Technology Solutions', 'icon' => 'monitor', 'body' => 'Technology consulting, systems, automation and digital implementation.', 'pricing' => 'Stage-based', 'commitment' => 'Project-based', 'ideal' => 'Digital transformation', 'href' => '/technology-solutions', 'from' => 0],
            ['slug' => 'partner-services', 'num' => '10', 'name' => 'Partner Services', 'icon' => 'handshake', 'body' => 'Work with certified partners for specialist, regulated or local expertise.', 'pricing' => 'Partner set', 'commitment' => 'Project / Ongoing', 'ideal' => 'Specialist needs', 'href' => '/partner-services', 'from' => 0],
            ['slug' => 'marketplace-services', 'num' => '11', 'name' => 'Marketplace Services', 'icon' => 'store', 'body' => 'Access third-party providers, tools and specialist solutions.', 'pricing' => 'Provider set', 'commitment' => 'Variable', 'ideal' => 'Specialised solutions', 'href' => '/marketplace', 'from' => 0],
            ['slug' => 'project-advisory', 'num' => '12', 'name' => 'Project Advisory', 'icon' => 'flag', 'body' => 'End-to-end advisory to structure, package and prepare your project for investment.', 'pricing' => 'Mandate-based', 'commitment' => 'Medium to long-term', 'ideal' => 'Capital readiness', 'href' => '/project-advisory', 'from' => 250000],
        ];
    }

    public static function enterpriseMode(): array
    {
        return ['slug' => 'enterprise-relationship', 'name' => 'Enterprise Relationship Mode', 'body' => 'Institutional relationship across all vehicles. Coordinated strategy, execution and reporting.', 'pricing' => 'Bespoke', 'commitment' => 'Relationship-based', 'ideal' => 'Institutions & large orgs', 'href' => '/services/enterprise-relationship'];
    }

    /** Comparison columns used on the Choice Comparison and Capability pages. */
    public static function comparisonVehicles(): array
    {
        return [
            'sprint' => ['name' => 'One-off Sprint', 'tag' => 'Quick advice for a defined need', 'icon' => 'target', 'use' => 'Specific question or short problem', 'get' => 'Expert answer, clear next steps, short report', 'who' => 'TBCA expert team', 'commitment' => 'Short-term', 'price' => 'From R2,450', 'price_note' => '(Fixed price)', 'from' => 2450, 'monthly' => false, 'exit' => 'Complete and done', 'best' => 'Fast clarity before a bigger decision', 'href' => '/services/a-z'],
            'digital-product' => ['name' => 'Digital Product', 'tag' => 'Ready-made tools & templates', 'icon' => 'graduation-cap', 'use' => 'Use templates, tools or guides', 'get' => 'Templates, frameworks, calculators, tools, guides', 'who' => 'TBCA product team', 'commitment' => 'One-time purchase', 'price' => 'From R450', 'price_note' => '(Per product)', 'from' => 450, 'monthly' => false, 'exit' => 'Yours forever', 'best' => 'Independent work with guidance', 'href' => '/digital-products'],
            'subscription' => ['name' => 'Subscription', 'tag' => 'Access to insights & updates', 'icon' => 'bar-chart-3', 'use' => 'Stay updated and informed', 'get' => 'Market intelligence, alerts, dashboards, updates', 'who' => 'TBCA research team', 'commitment' => 'Monthly / Annual', 'price' => 'From R990 / month', 'price_note' => '(Cancel anytime)', 'from' => 990, 'monthly' => true, 'exit' => 'Cancel anytime', 'best' => 'Ongoing visibility and alerts', 'href' => '/subscriptions'],
            'retainer' => ['name' => 'Retainer', 'tag' => 'Ongoing access to people', 'icon' => 'user-check', 'use' => 'Need ongoing expert support', 'get' => 'Advisor time, advice, reviews, ongoing help', 'who' => 'TBCA consultants', 'commitment' => 'Monthly / Annual', 'price' => 'From R9,950 / month', 'price_note' => '(Allowance based)', 'from' => 9950, 'monthly' => true, 'exit' => 'Cancel period applies', 'best' => 'Ongoing access to expert people', 'href' => '/retainers'],
            'project-advisory' => ['name' => 'Project Advisory', 'tag' => 'Structured project mandate', 'icon' => 'flag', 'use' => 'Structured market entry project', 'get' => 'Detailed plan, workstream delivery, execution support', 'who' => 'TBCA project team', 'commitment' => 'Project-based', 'price' => 'From R250,000', 'price_note' => '(Quote required)', 'from' => 250000, 'monthly' => false, 'exit' => 'Notice agreement', 'best' => 'Complex projects needing execution', 'href' => '/project-advisory'],
            'partner-services' => ['name' => 'Partner Services', 'tag' => 'Qualified external experts', 'icon' => 'handshake', 'use' => 'Requires specialist or regulated skill', 'get' => 'Specialist advice or execution', 'who' => 'Qualified partner firm', 'commitment' => 'By agreement', 'price' => 'Quote required', 'price_note' => '(Varies)', 'from' => null, 'monthly' => false, 'exit' => 'By agreement', 'best' => 'Specialist or regulated requirements', 'href' => '/partner-services'],
        ];
    }

    public static function needs(): array
    {
        return [
            ['key' => 'solve-problem', 'title' => 'Solve a business problem', 'body' => 'Strategy, operations, performance, governance or growth', 'icon' => 'search'],
            ['key' => 'expert-advice', 'title' => 'Get expert advice', 'body' => 'Specialist guidance or professional input for decisions', 'icon' => 'lightbulb'],
            ['key' => 'deliver-project', 'title' => 'Deliver a project or initiative', 'body' => 'Structured work with defined scope and timeline', 'icon' => 'flag'],
            ['key' => 'automate', 'title' => 'Automate or optimise', 'body' => 'Technology, processes or systems improvement', 'icon' => 'settings'],
            ['key' => 'ongoing-support', 'title' => 'Access ongoing support', 'body' => 'Regular help, maintenance or continuous value', 'icon' => 'life-buoy'],
            ['key' => 'data', 'title' => 'Access data or intelligence', 'body' => 'Insights, research or decision-ready information', 'icon' => 'bar-chart-3'],
            ['key' => 'check', 'title' => 'Check or assess something', 'body' => 'Diagnostic, review, due diligence or verification', 'icon' => 'shield-check'],
            ['key' => 'not-sure', 'title' => 'Other / Not sure', 'body' => "I'm not sure yet — please help me understand", 'icon' => 'plus'],
        ];
    }

    public static function outcomes(): array
    {
        return [
            ['key' => 'answer', 'title' => 'A clear answer or recommendation', 'body' => 'Expert view on a specific question'],
            ['key' => 'plan', 'title' => 'A plan I can act on', 'body' => 'Roadmap, risks, opportunities and next steps'],
            ['key' => 'tools', 'title' => 'Tools I can use myself', 'body' => 'Templates, calculators and frameworks'],
            ['key' => 'implementation', 'title' => 'Work delivered and implemented', 'body' => 'Hands-on delivery with defined outputs'],
            ['key' => 'ongoing', 'title' => 'Ongoing visibility or support', 'body' => 'Regular updates, alerts or expert access'],
            ['key' => 'verification', 'title' => 'Independent verification', 'body' => 'Checked, evidenced and review-signed'],
        ];
    }

    public static function industries(): array
    {
        return ['Agriculture & Agro-Industry', 'Energy & Resources', 'Engineering & Construction', 'Financial Services', 'Health & Pharmaceuticals', 'ICT & Digital', 'Infrastructure & Transport', 'Manufacturing & Industrial', 'Professional Services', 'Property & Construction', 'Retail & Consumer', 'Tourism & Hospitality', 'Public Sector', 'Other'];
    }

    public static function sizes(): array
    {
        return [
            ['key' => 'micro', 'label' => 'Micro / start-up (1–10 people)'],
            ['key' => 'small', 'label' => 'Small business (11–50 people)'],
            ['key' => 'medium', 'label' => 'Small–medium business (51–250 people)'],
            ['key' => 'large', 'label' => 'Large business (250+ people)'],
            ['key' => 'institution', 'label' => 'Institution, group or government'],
        ];
    }

    public static function timings(): array
    {
        return [
            ['key' => 'urgent', 'label' => 'Urgently (within 2 weeks)'],
            ['key' => '1-3', 'label' => 'In the next 1–3 months'],
            ['key' => '3-6', 'label' => 'Decision in next 3–6 months'],
            ['key' => 'ongoing', 'label' => 'Ongoing / no fixed date'],
        ];
    }

    public static function budgets(): array
    {
        return [
            ['key' => 'under-2k', 'label' => 'Under R2,000', 'max' => 2000],
            ['key' => '2k-25k', 'label' => 'R2,000 – R25,000', 'max' => 25000],
            ['key' => '25k-250k', 'label' => 'R25,000 – R250,000', 'max' => 250000],
            ['key' => '250k-plus', 'label' => 'R250,000+', 'max' => PHP_INT_MAX],
            ['key' => 'monthly', 'label' => 'A monthly amount (R1,000 – R50,000 / month)', 'max' => 50000],
            ['key' => 'unsure', 'label' => 'Not sure yet', 'max' => PHP_INT_MAX],
        ];
    }

    public static function countries(): array
    {
        // Africa (Active): all 54 African countries, plus an explicit out-of-scope option.
        return [...collect(\App\Support\CorePages\AfricaCountries::all())->pluck('name')->sort()->values()->all(), 'Outside Africa'];
    }

    /** "Not sure which" challenge cards, each mapped to a resolver need + outcome. */
    public static function challenges(): array
    {
        return [
            ['key' => 'strategy', 'title' => 'I need clarity on strategy or direction', 'body' => 'Vision, growth strategy, market entry, positioning or performance.', 'icon' => 'target', 'need' => 'solve-problem', 'outcome' => 'plan', 'capability' => 'strategy'],
            ['key' => 'finance', 'title' => 'I need financial support or advice', 'body' => 'Cash flow, funding, financial modelling or investment.', 'icon' => 'landmark', 'need' => 'expert-advice', 'outcome' => 'answer', 'capability' => 'financial-modelling'],
            ['key' => 'operations', 'title' => 'I need help improving operations', 'body' => 'Processes, systems, efficiency or organisational design.', 'icon' => 'settings', 'need' => 'solve-problem', 'outcome' => 'implementation', 'capability' => 'operations'],
            ['key' => 'people', 'title' => 'I need people or leadership help', 'body' => 'Talent, leadership, organisation structure or culture.', 'icon' => 'users', 'need' => 'expert-advice', 'outcome' => 'plan', 'capability' => 'human-capital'],
            ['key' => 'technology', 'title' => 'I need technology or digital solutions', 'body' => 'Systems, automation, software or digital transformation.', 'icon' => 'monitor', 'need' => 'automate', 'outcome' => 'implementation', 'capability' => 'technology'],
            ['key' => 'due-diligence', 'title' => 'I need due diligence or verification', 'body' => 'Background checks, assessments, risk or compliance.', 'icon' => 'shield-check', 'need' => 'check', 'outcome' => 'verification', 'capability' => 'governance-risk'],
            ['key' => 'ongoing', 'title' => 'I need ongoing expert support', 'body' => 'Regular access to experts for advice and guidance.', 'icon' => 'user-check', 'need' => 'ongoing-support', 'outcome' => 'ongoing', 'capability' => 'strategy'],
            ['key' => 'intelligence', 'title' => 'I need access to intelligence', 'body' => 'Market insights, data, analytics or risk signals.', 'icon' => 'bar-chart-3', 'need' => 'data', 'outcome' => 'ongoing', 'capability' => 'performance'],
            ['key' => 'capital', 'title' => 'I need to raise capital or transact', 'body' => 'Fundraising, investor engagement or deal execution.', 'icon' => 'flag', 'need' => 'deliver-project', 'outcome' => 'implementation', 'capability' => 'finance'],
            ['key' => 'tools', 'title' => 'I need specific tools, templates or content', 'body' => 'Guides, templates, frameworks or resources.', 'icon' => 'file-text', 'need' => 'not-sure', 'outcome' => 'tools', 'capability' => 'strategy'],
            ['key' => 'delivery', 'title' => 'I need project delivery support', 'body' => 'Structured delivery, implementation or PMO support.', 'icon' => 'clipboard-list', 'need' => 'deliver-project', 'outcome' => 'implementation', 'capability' => 'operations'],
            ['key' => 'other', 'title' => 'Something else', 'body' => 'Describe your need in your own words.', 'icon' => 'help-circle', 'need' => 'not-sure', 'outcome' => 'answer', 'capability' => 'strategy'],
        ];
    }

    public static function families(): array
    {
        $ways = [
            ['key' => 'sprint', 'title' => 'One-off Sprint', 'body' => 'Quick expert help for a defined need.', 'price' => 'From R2,450', 'icon' => 'clipboard-check', 'href' => '/services/a-z'],
            ['key' => 'project-advisory', 'title' => 'Project Advisory', 'body' => 'Structured project mandate from start to finish.', 'price' => 'From R250,000', 'icon' => 'flag', 'href' => '/project-advisory'],
            ['key' => 'subscription', 'title' => 'Subscription', 'body' => 'Ongoing access to insights and updates.', 'price' => 'From R990 / month', 'icon' => 'bar-chart-3', 'href' => '/subscriptions'],
            ['key' => 'retainer', 'title' => 'Retainer', 'body' => 'Reserved expert capacity for ongoing support.', 'price' => 'From R9,950 / month', 'icon' => 'user-check', 'href' => '/retainers'],
            ['key' => 'partner-services', 'title' => 'Partner Services', 'body' => 'Access qualified external specialists.', 'price' => 'Quote required', 'icon' => 'handshake', 'href' => '/partner-services'],
            ['key' => 'enterprise', 'title' => 'Enterprise Relationship', 'body' => 'For institutions and groups. Coordinated solutions.', 'price' => 'Design only', 'icon' => 'building-2', 'href' => '/services/enterprise-relationship'],
        ];

        return [
            'business-consultancy' => [
                'title' => 'Business Consultancy',
                'tagline' => 'Resolver-first advisory across key business capability areas.',
                'intro' => 'Business consultancy helps you define direction, solve problems and improve outcomes across the core areas of your business. Start with your need. We will show you the best way to work with TBCA — and why.',
                'boxTitle' => 'How we help',
                'box' => ['Match your need with the best way to work with TBCA', 'Show all viable options with equal visibility', 'Explain trade-offs, price state and commitment', 'Respect professional boundaries and capacity', 'Help you move from insight to execution'],
                'areasTitle' => 'Areas we can help with',
                'areas' => [
                    ['title' => 'Strategy', 'body' => 'Business strategy, growth strategy, market entry, competitive positioning and performance strategy.', 'icon' => 'target', 'href' => '/services/capability/strategy'],
                    ['title' => 'Finance', 'body' => 'Financial modelling, cash flow, financial planning, funding strategy and performance improvement.', 'icon' => 'landmark', 'href' => '/services/capability/finance'],
                    ['title' => 'Operations', 'body' => 'Operational efficiency, process improvement, systems, supply chain, quality and performance management.', 'icon' => 'settings', 'href' => '/services/capability/operations'],
                    ['title' => 'Human Capital', 'body' => 'Organisation design, talent strategy, leadership, culture and workforce performance.', 'icon' => 'users', 'href' => '/services/capability/human-capital'],
                    ['title' => 'Marketing & Growth', 'body' => 'Marketing strategy, customer growth, brand positioning and commercial strategy.', 'icon' => 'megaphone', 'href' => '/services/capability/marketing-growth'],
                    ['title' => 'Technology', 'body' => 'Digital strategy, process automation, systems selection and technology improvement.', 'icon' => 'cpu', 'href' => '/services/capability/technology'],
                    ['title' => 'Performance', 'body' => 'KPI frameworks, dashboards, performance reviews and continuous improvement.', 'icon' => 'bar-chart-3', 'href' => '/services/capability/performance'],
                    ['title' => 'Governance & Risk', 'body' => 'Governance frameworks, risk management, compliance and internal controls.', 'icon' => 'scale', 'href' => '/services/capability/governance-risk'],
                ],
                'ways' => $ways,
                'aside' => ['title' => 'Why start with a need?', 'body' => 'We first understand what you are trying to achieve. Then we show you every viable way to work with TBCA — with clear reasons.'],
                'about' => null,
                'boundary' => false,
            ],
            'management-consultancy' => [
                'title' => 'Management Consultancy',
                'tagline' => 'Better systems. Stronger performance. Lasting change.',
                'intro' => 'We help organisations and leadership teams build operating models, improve performance, strengthen governance, manage change and deliver results that last. We start with your context and align our work to your goals, capacity and timeline.',
                'boxTitle' => 'How we help',
                'box' => ['Understand your current operating model', 'Design a better way of working', 'Improve performance and execution', 'Strengthen governance and decision-making', 'Manage change and build buy-in', 'Support implementation and capability uplift'],
                'areasTitle' => 'We help with',
                'areas' => [
                    ['title' => 'Operating model design', 'body' => 'Structure, roles, processes and ways of working.', 'icon' => 'network', 'href' => '/services/capability/operating-model-design'],
                    ['title' => 'Governance & leadership', 'body' => 'Decision frameworks, committees and accountability.', 'icon' => 'shield-check', 'href' => '/services/capability/governance-risk'],
                    ['title' => 'Performance improvement', 'body' => 'KPIs, scorecards, targets and execution systems.', 'icon' => 'trending-up', 'href' => '/services/capability/performance'],
                    ['title' => 'Process optimisation', 'body' => 'Remove waste, reduce cycle time and improve quality.', 'icon' => 'settings', 'href' => '/services/capability/process-optimisation'],
                    ['title' => 'Change management', 'body' => 'Stakeholder engagement, communication and adoption.', 'icon' => 'users', 'href' => '/services/capability/change-management'],
                    ['title' => 'Implementation support', 'body' => 'Project delivery support, PMO and execution management.', 'icon' => 'clipboard-list', 'href' => '/services/capability/operations'],
                ],
                'ways' => array_slice($ways, 0, 4),
                'aside' => null,
                'about' => ['title' => 'About our management consultancy', 'body' => 'We combine practical frameworks, deep experience and AI-enabled analytics to help you act with clarity and confidence.', 'items' => ['Practical and actionable', 'Data-informed', 'Aligned to your goals', 'Built for your context']],
                'boundary' => true,
            ],
        ];
    }

    /** Capability pillars (Service Pillar Template). */
    public static function pillars(): array
    {
        $base = [
            'strategy' => ['Strategy', 'Clear direction. Strong choices. Better outcomes.', 'We help you define where you are going, how you will win and what must change to get there.',
                ['Align goals, markets and capabilities', 'Make confident decisions with clear options', 'Reduce risk and improve execution', 'Create a practical plan you can implement', 'Foundation for funding, partnerships and growth'],
                [['Define where you are going', 'Vision, mission and strategic intent', 'target'], ['Choose the right strategies', 'Market, growth and competitive strategy', 'move'], ['Improve how you create value', 'Business model and value proposition', 'bar-chart-3'], ['Build the right capabilities', 'Operating model and organisation', 'settings'], ['Plan with confidence', 'Roadmaps, priorities and KPIs', 'clipboard-list']],
                ['You want a clear strategic direction', 'You are entering a new market or sector', 'You need to improve performance', 'You want to grow or diversify', 'You need to reorganise or restructure', 'You need to prepare for funding or partners', 'You face pressure, change or uncertainty', 'You need an independent view', 'You want a practical plan, not a theory'],
                ['market-entry-strategy', 'business-model-review', 'operating-model-design']],
            'finance' => ['Finance', 'Numbers you can trust. Decisions you can defend.', 'We help you plan, model, fund and manage the finances of your business and projects.',
                ['Understand cash flow and profitability', 'Build models funders can rely on', 'Plan for growth and investment', 'Strengthen financial controls', 'Prepare for capital raising'],
                [['Model the business', 'Financial models and scenarios', 'calculator'], ['Manage cash', 'Cash flow and working capital', 'wallet'], ['Plan and budget', 'Budgets, forecasts and targets', 'clipboard-list'], ['Raise funding', 'Funding strategy and readiness', 'landmark'], ['Value and invest', 'Valuation and returns analysis', 'trending-up']],
                ['You need a financial model for funders', 'Cash flow is tight or unpredictable', 'You are preparing a budget or forecast', 'You want to raise debt or equity', 'You need a valuation', 'You want better financial reporting', 'You are evaluating an investment', 'You need an independent financial view', 'You want CFO-level guidance'],
                ['financial-modelling', 'cash-flow-planning', 'valuation-returns-analysis']],
            'operations' => ['Operations', 'Run better. Deliver more. Waste less.', 'We help you improve processes, systems, supply chains and quality so your business delivers reliably.',
                ['Reduce cost and cycle time', 'Improve quality and consistency', 'Build scalable systems', 'Strengthen supply chains', 'Free leadership time'],
                [['Map processes', 'Current-state process mapping', 'network'], ['Optimise flow', 'Lean and process improvement', 'settings'], ['Improve quality', 'Standards and quality systems', 'badge-check'], ['Strengthen supply', 'Supply chain and procurement', 'truck'], ['Manage performance', 'Operational KPIs and reviews', 'bar-chart-3']],
                ['Processes are slow or inconsistent', 'Costs are rising faster than revenue', 'You are scaling and systems are straining', 'Quality complaints are increasing', 'Your supply chain is unreliable', 'You need SOPs and documentation', 'You want to automate manual work', 'You need an operational review', 'You want measurable improvement'],
                ['process-optimisation', 'operating-model-design', 'change-management']],
        ];
        $more = [
            'human-capital' => ['Human Capital', 'Right people. Right structure. Right culture.', 'We help you design organisations, develop leaders and build cultures that perform.'],
            'marketing-growth' => ['Marketing & Growth', 'Grow customers. Grow revenue. Grow brand.', 'We help you sharpen positioning, win customers and build commercial engines that scale.'],
            'technology' => ['Technology', 'Digital that works for the business.', 'We help you choose, implement and improve the systems and automation that move your business forward.'],
            'performance' => ['Performance', 'Measure what matters. Improve what counts.', 'We help you set KPIs, build dashboards and run performance reviews that drive continuous improvement.'],
            'governance-risk' => ['Governance & Risk', 'Strong controls. Confident decisions.', 'We help you build governance frameworks, manage risk and maintain compliance and internal controls.'],
        ];
        foreach ($more as $slug => [$t, $tag, $intro]) {
            $base[$slug] = [$t, $tag, $intro,
                ["Clarify priorities in {$t}", 'Make confident decisions with clear options', 'Reduce risk and improve execution', 'Create a practical plan you can implement', 'Measure progress with clear KPIs'],
                [['Diagnose', 'Assess current state and gaps', 'search'], ['Design', 'Options and recommended approach', 'pen-tool'], ['Plan', 'Roadmap, owners and milestones', 'clipboard-list'], ['Implement', 'Hands-on delivery support', 'settings'], ['Review', 'Measure results and improve', 'bar-chart-3']],
                ['You need a clear plan', 'You want an independent view', 'You are going through change', 'You need to improve results', 'You are preparing for growth', 'You want practical tools', 'You need expert capacity', 'You face regulatory pressure', 'You want measurable outcomes'],
                ['financial-modelling', 'process-optimisation', 'change-management']];
        }

        $out = [];
        foreach ($base as $slug => [$title, $tagline, $intro, $why, $achieve, $situations, $caps]) {
            $out[$slug] = [
                'slug' => $slug, 'title' => $title, 'tagline' => $tagline, 'intro' => $intro, 'why' => $why,
                'achieve' => array_map(fn ($a) => ['title' => $a[0], 'body' => $a[1], 'icon' => $a[2]], $achieve),
                'situations' => $situations, 'capabilities' => $caps,
            ];
        }

        return $out;
    }

    /** Capability detail pages (one capability, all delivery vehicles). */
    public static function capabilities(): array
    {
        $caps = [
            'financial-modelling' => ['Financial Modelling', 'finance', 'Build the numbers that drive confident decisions, funding and growth.', 'We help you build, test and optimise financial models for strategy, investment, funding proposals, feasibility, valuations and performance planning.', 'Specific modelling need', 'Expert model, clear outputs', 'Complex model build', 'financial model'],
            'cash-flow-planning' => ['Cash Flow Planning', 'finance', 'See your cash before it moves.', 'We help you forecast, manage and improve cash flow so you can plan with confidence and avoid surprises.', 'Short-term cash forecast', '13-week cash forecast and actions', 'Cash transformation programme', 'cash flow'],
            'valuation-returns-analysis' => ['Valuation & Returns Analysis', 'finance', 'Know what it is worth — and why.', 'We help you value businesses, projects and investments with defensible methods and clear assumptions.', 'Indicative valuation', 'Valuation report and model', 'Transaction valuation support', 'valuation'],
            'market-entry-strategy' => ['Market Entry Strategy', 'strategy', 'Enter new markets with a plan, not a guess.', 'We help you assess markets, choose entry modes and build a practical entry plan with risks, opportunities and next steps.', 'Market entry question', 'Market entry brief and next steps', 'Full market entry project', 'market entry'],
            'business-model-review' => ['Business Model Review', 'strategy', 'Test how you create and capture value.', 'We help you review and redesign your business model, value proposition and revenue streams.', 'Focused model review', 'Business model canvas and options', 'Business model redesign', 'business model'],
            'operating-model-design' => ['Operating Model Design', 'operations', 'Structure, roles, processes and ways of working.', 'We help you design an operating model that fits your strategy and scales with your business.', 'Targeted structure review', 'Operating model blueprint', 'Operating model transformation', 'operating model'],
            'process-optimisation' => ['Process Optimisation', 'operations', 'Remove waste, reduce cycle time and improve quality.', 'We help you map, measure and improve the processes that matter most to your customers and costs.', 'One process improved', 'Process maps and improvement plan', 'Process excellence programme', 'process'],
            'change-management' => ['Change Management', 'operations', 'Stakeholder engagement, communication and adoption.', 'We help you plan and lead change so that people adopt new ways of working and benefits are realised.', 'Change readiness check', 'Change plan and communications', 'Change programme delivery', 'change'],
        ];
        $out = [];
        foreach ($caps as $slug => [$title, $pillar, $tagline, $intro, $sprintFit, $sprintGet, $paFit, $kw]) {
            $out[$slug] = compact('slug', 'title', 'pillar', 'tagline', 'intro', 'sprintFit', 'sprintGet', 'paFit', 'kw');
        }

        return $out;
    }

    /** A–Z letter categories (26). */
    public static function letterCategories(): array
    {
        return [
            'A' => 'Admin Support, Virtual Assistance and Business Back Office',
            'B' => 'Branding, Advertising, Communications and Sales Enablement',
            'C' => 'Corporate Formation, Secretarial Services and Governance',
            'D' => 'Data, Analytics, Research and Business Intelligence',
            'E' => 'Education, Training, Capacity Building and eLearning',
            'F' => 'Financial Management, Accounting, CFO Services and Funding Support',
            'G' => 'Growth, Go To Market, Market Entry and Business Development',
            'H' => 'Human Resources, Talent, Culture and Organisation Design',
            'I' => 'Innovation, Incubation, Product Development and Business Model Design',
            'J' => 'Jobs, Careers, Executive Support and Personal Productivity',
            'K' => 'Knowledge Management, Documentation and Content Systems',
            'L' => 'Legal, Compliance, Risk, Ethics and Regulatory Support',
            'M' => 'Marketing, Media, Digital Growth and Community Management',
            'N' => 'New Technology, AI, Machine Learning and Automation',
            'O' => 'Operations, Process Improvement, Supply Chain and Quality',
            'P' => 'Project Development, Feasibility, PPP, Infrastructure and Capital Projects',
            'Q' => 'Quality Assurance, Standards, ISO Support and Performance Management',
            'R' => 'Restructuring, Turnaround, Recovery and Business Rescue Support',
            'S' => 'Sustainability, ESG, Climate, Impact and Social Development',
            'T' => 'Technology, Digital Transformation, Cybersecurity and Cloud',
            'U' => 'User Experience, Design, Graphics, Creative and Product Design',
            'V' => 'Valuation, Venture Building, Investment Readiness and Transactions',
            'W' => 'Web, eCommerce, Platforms, Portals and Online Shops',
            'X' => 'Cross Border Expansion, Export, Trade and Internationalisation',
            'Y' => 'Youth, Women, MSME, Enterprise Development and Incubation Programmes',
            'Z' => 'Zoho, Qlik, Power BI, UiPath, Power Automate and Resellable Digital Tools',
        ];
    }
}
