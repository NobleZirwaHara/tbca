<?php

namespace App\Support\Content;

/**
 * Sprint catalogue, digital products, subscriptions and retainer register.
 * Every product code maps across page, commerce, CRM, finance, portal and delivery.
 */
class Commerce
{
    public static function featuredSprints(): array
    {
        return array_slice(self::sprints(), 0, 4);
    }

    public static function sprints(): array
    {
        return [
            [
                'code' => 'SPR-BPD',
                'name' => 'Business Plan Development Sprint',
                'summary' => 'Investor-ready business plan for growth, funding and scaling.',
                'zar' => 7600,
                'usd' => 420,
                'turnaround' => '7-10 days',
                'review' => 'Human Reviewed',
                'icon' => 'file-text',
                'category' => 'Strategy and Funding',
                'outputs' => ['Investor-ready business plan', 'Financial summary and assumptions', 'Market and competitor section', 'Implementation roadmap'],
            ],
            [
                'code' => 'SPR-MRF',
                'name' => 'Market Research & Feasibility Sprint',
                'summary' => 'Validate your idea with data and market insights.',
                'zar' => 6500,
                'usd' => 360,
                'turnaround' => '5-7 days',
                'review' => 'Human Reviewed',
                'icon' => 'search',
                'category' => 'Strategy and Funding',
                'outputs' => ['Market size and segmentation', 'Competitor landscape', 'Demand and pricing evidence', 'Feasibility conclusion'],
            ],
            [
                'code' => 'SPR-FMV',
                'name' => 'Financial Model & Valuation Sprint',
                'summary' => 'Build investor financial models and valuations.',
                'zar' => 9500,
                'usd' => 530,
                'turnaround' => '7-10 days',
                'review' => 'Human Reviewed',
                'icon' => 'trending-up',
                'category' => 'Strategy and Funding',
                'outputs' => ['Three-statement model', 'Scenario and sensitivity analysis', 'Valuation range and method note', 'Funding requirement schedule'],
            ],
            [
                'code' => 'SPR-ADT',
                'name' => 'AI Automation & Digital Transformation Sprint',
                'summary' => 'Automate operations and scale with AI.',
                'zar' => 14500,
                'usd' => 810,
                'turnaround' => '10-15 days',
                'review' => 'Human Reviewed',
                'icon' => 'bot',
                'category' => 'Technology and Automation',
                'outputs' => ['Process and automation map', 'Agent and RPA design', 'Integration plan', 'Implementation backlog'],
            ],
            [
                'code' => 'SPR-BHS',
                'name' => 'Business Health Score Sprint',
                'summary' => 'Structured diagnostic across strategy, finance, operations and risk.',
                'zar' => 3200,
                'usd' => 180,
                'turnaround' => '3-5 days',
                'review' => 'Human Reviewed',
                'icon' => 'activity',
                'category' => 'Diagnostics',
                'outputs' => ['Scored health assessment', 'Priority gap register', 'Recommended Sprint sequence'],
            ],
            [
                'code' => 'SPR-GRW',
                'name' => 'Growth Strategy Sprint',
                'summary' => 'Define where to play and how to win in your market.',
                'zar' => 11500,
                'usd' => 640,
                'turnaround' => '10-14 days',
                'review' => 'Human Reviewed',
                'icon' => 'target',
                'category' => 'Strategy and Funding',
                'outputs' => ['Growth thesis and options', 'Prioritised initiative portfolio', 'Resourcing and milestone plan'],
            ],
            [
                'code' => 'SPR-MEB',
                'name' => 'Market Entry Brief Sprint',
                'summary' => 'Country-specific entry route with regulatory, tax and partner evidence.',
                'zar' => 12800,
                'usd' => 715,
                'turnaround' => '10-14 days',
                'review' => 'Human Reviewed',
                'icon' => 'globe',
                'category' => 'Africa Market Entry',
                'outputs' => ['Country entry assessment', 'Regulatory and licensing route', 'Partner and channel shortlist', 'Risk register'],
            ],
            [
                'code' => 'SPR-PPS',
                'name' => 'Project Concept & Prefeasibility Sprint',
                'summary' => 'Turn a project idea into a fundable concept note.',
                'zar' => 16500,
                'usd' => 920,
                'turnaround' => '12-18 days',
                'review' => 'Human Reviewed',
                'icon' => 'layout-template',
                'category' => 'Project Advisory',
                'outputs' => ['Concept note', 'Prefeasibility assessment', 'Indicative capital structure', 'Next-stage roadmap'],
            ],
            [
                'code' => 'SPR-GOV',
                'name' => 'Corporate Governance Sprint',
                'summary' => 'Board, policy and delegation architecture for growing enterprises.',
                'zar' => 8900,
                'usd' => 495,
                'turnaround' => '7-12 days',
                'review' => 'Human Reviewed',
                'icon' => 'scale',
                'category' => 'Governance and Risk',
                'outputs' => ['Board and committee charter set', 'Delegation of authority', 'Policy register', 'Governance calendar'],
            ],
            [
                'code' => 'SPR-SOP',
                'name' => 'Operations & SOP Sprint',
                'summary' => 'Document and standardise the way your business runs.',
                'zar' => 7900,
                'usd' => 440,
                'turnaround' => '7-12 days',
                'review' => 'Human Reviewed',
                'icon' => 'clipboard-list',
                'category' => 'Operations',
                'outputs' => ['Process map', 'SOP pack', 'Control points and owners', 'Training note'],
            ],
            [
                'code' => 'SPR-DAT',
                'name' => 'Data & Dashboard Sprint',
                'summary' => 'Turn operating data into a governed management dashboard.',
                'zar' => 10500,
                'usd' => 585,
                'turnaround' => '10-14 days',
                'review' => 'Human Reviewed',
                'icon' => 'bar-chart-3',
                'category' => 'Technology and Automation',
                'outputs' => ['KPI definition register', 'Data source mapping', 'Management dashboard', 'Refresh and owner schedule'],
            ],
            [
                'code' => 'SPR-FND',
                'name' => 'Funding Readiness Sprint',
                'summary' => 'Prepare the evidence pack lenders and investors actually ask for.',
                'zar' => 9900,
                'usd' => 550,
                'turnaround' => '8-12 days',
                'review' => 'Human Reviewed',
                'icon' => 'landmark',
                'category' => 'Strategy and Funding',
                'outputs' => ['Funding readiness assessment', 'Lender and investor pack', 'Gap remediation plan'],
            ],
        ];
    }

    public static function sprintCategories(): array
    {
        $categories = [];

        foreach (self::sprints() as $sprint) {
            $categories[$sprint['category']] = ($categories[$sprint['category']] ?? 0) + 1;
        }

        return $categories;
    }

    public static function digitalProducts(): array
    {
        return [
            ['name' => 'Business Plan Template Pack', 'type' => 'Template', 'zar' => 950, 'usd' => 55, 'summary' => 'Structured plan, financial template and investor summary format.', 'icon' => 'file-text'],
            ['name' => 'Financial Model Toolkit', 'type' => 'Toolkit', 'zar' => 1850, 'usd' => 105, 'summary' => 'Three-statement model, scenario sheet and valuation calculator.', 'icon' => 'calculator'],
            ['name' => 'Africa Market Entry Checklist', 'type' => 'Guide', 'zar' => 650, 'usd' => 38, 'summary' => 'Regulatory, tax, banking and partner readiness checklist.', 'icon' => 'clipboard-check'],
            ['name' => 'Governance Policy Library', 'type' => 'Template', 'zar' => 2400, 'usd' => 135, 'summary' => 'Board charter, delegation of authority and core policy set.', 'icon' => 'book-open'],
            ['name' => 'Procurement Due Diligence Pack', 'type' => 'Toolkit', 'zar' => 1650, 'usd' => 92, 'summary' => 'Supplier screening forms, risk matrix and evidence checklist.', 'icon' => 'shield-check'],
            ['name' => 'AI Adoption Playbook', 'type' => 'Course', 'zar' => 2950, 'usd' => 165, 'summary' => 'Structured programme covering agents, automation and controls.', 'icon' => 'bot'],
        ];
    }

    public static function subscriptions(): array
    {
        return [
            [
                'name' => 'Intelligence Essential',
                'zar' => 1450,
                'usd' => 80,
                'cadence' => 'per month',
                'summary' => 'AIIM entitled layers, monthly country brief and saved workspace.',
                'features' => ['AIIM registered and subscriber layers', 'One country brief each month', 'Saved searches and alerts', 'Email and portal support'],
                'featured' => false,
            ],
            [
                'name' => 'Intelligence Professional',
                'zar' => 3950,
                'usd' => 220,
                'cadence' => 'per month',
                'summary' => 'Full AIIM entitlement, dashboards, comparison tools and quarterly advisory hour.',
                'features' => ['All AIIM subscriber layers', 'Compare and corridor tools', 'Management dashboard access', 'Quarterly advisory session', 'Two premium briefs each quarter'],
                'featured' => true,
            ],
            [
                'name' => 'Enterprise Intelligence',
                'zar' => null,
                'usd' => null,
                'cadence' => 'contract entitlement',
                'summary' => 'Team workspace, bulk data, dashboards, API and advisory access.',
                'features' => ['Team workspace and roles', 'Bulk data and API entitlement', 'Enterprise dashboards', 'Named account manager', 'Data-sharing controls and DPA'],
                'featured' => false,
            ],
        ];
    }

    public static function retainers(): array
    {
        return [
            ['name' => 'Advisory Desk', 'summary' => 'Ongoing strategic advisory with a named lead and monthly cadence.', 'sla' => 'Two working day response', 'icon' => 'briefcase'],
            ['name' => 'Procurement and Supplier Desk', 'summary' => 'Continuous supplier screening, onboarding support and risk review.', 'sla' => 'Three working day screening turnaround', 'icon' => 'package-search'],
            ['name' => 'Due Diligence Desk', 'summary' => 'Standing DD capacity for counterparty, investor and sponsor checks.', 'sla' => 'Per SKU service level', 'icon' => 'shield-check'],
            ['name' => 'Project Desk', 'summary' => 'Project development, funding support and implementation oversight.', 'sla' => 'Monthly steering and milestone reporting', 'icon' => 'layout-template'],
        ];
    }

    /** Why the platform, as shown on Home. */
    public static function differentiators(): array
    {
        return [
            ['title' => 'Integrated Platform', 'body' => 'All your needs. One secure system.', 'icon' => 'layers'],
            ['title' => 'Controlled AI', 'body' => 'AI plus human expertise. Verified, not generated.', 'icon' => 'bot'],
            ['title' => 'Bankable Outputs', 'body' => 'Designed for funding, compliance and growth.', 'icon' => 'badge-check'],
            ['title' => 'Secure & Accountable', 'body' => 'Enterprise-grade security and governance.', 'icon' => 'shield'],
        ];
    }

    /** How TBCA works — client-facing five steps. */
    public static function howItWorks(): array
    {
        return [
            ['step' => 1, 'title' => 'Diagnose', 'body' => 'Assess your business health and opportunity.'],
            ['step' => 2, 'title' => 'Select', 'body' => 'Choose the right Sprint or advisory solution.'],
            ['step' => 3, 'title' => 'Collaborate', 'body' => 'Work with experts and AI tools.'],
            ['step' => 4, 'title' => 'Deliver', 'body' => 'Receive bankable outputs on time.'],
            ['step' => 5, 'title' => 'Scale', 'body' => 'Implement, automate and grow sustainably.'],
        ];
    }
}
