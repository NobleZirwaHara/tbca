<?php

namespace App\Support\Products\Subscriptions;

/**
 * Plan register seeded into prd_sub_plans (copy taken from the Subscriptions mockups).
 */
class PlanCatalogue
{
    public const CATEGORIES = [
        'Intelligence Dashboards', 'Market Monitoring', 'Advisory Intelligence', 'Maintained Content',
        'Executive Briefings', 'Compliance & Regulatory', 'AI Tools & Automation', 'Research Libraries',
        'Data & Analytics', 'Reporting & Alerts', 'Strategy Support', 'Custom Enterprise',
    ];

    private const BRAS_ENTITLEMENTS = [
        'Full access to Business Rescue Advisory system', 'Updated regulatory intelligence and alerts', 'Templates, tools and checklists',
        'Dashboards and early warning indicators', 'Document drafting assistance', 'Consultation and advisory support',
        'Monthly insights and compliance guidance', 'Priority email and WhatsApp support', 'Access for 1 user included',
        'Data export of your usage and reports', 'Audit trail and activity history',
    ];

    public static function plans(): array
    {
        return [
            /* ---------------- tier plans shown on the landing and comparison pages */
            [
                'code' => 'SUB-ESS', 'slug' => 'essentials', 'name' => 'Essentials', 'tier' => 'essentials', 'ladder' => 'tbca-intelligence', 'category' => null,
                'recurrence_class' => 'R1', 'tagline' => 'Core Intelligence & Support', 'sort' => 1,
                'description' => 'Essential dashboards, insights and support to keep your business informed.',
                'what_recurs' => 'Maintained dashboards, weekly market updates, email alerts',
                'why_recurs' => 'Market and business conditions change weekly; stale intelligence harms decisions.',
                'next_period_value' => 'Refreshed intelligence each billing period',
                'who_for' => 'Owner-managed businesses that need to stay informed.',
                'monthly_zar' => 2950, 'usd_monthly' => 199, 'delivery_cadence' => 'Weekly updates, Monthly reports', 'cost_zar' => 1250,
                'features' => ['Business Health Dashboard', 'Weekly Market Intelligence', 'Email Updates & Alerts', 'WhatsApp Support (Business Hours)', '5 Reports per Month', '1 User Access'],
                'entitlements' => ['1 user', 'Core dashboards', '5 reports per month'],
                'details' => ['matrix_blurb' => 'Core intelligence & support to keep you informed.'],
            ],
            [
                'code' => 'SUB-GRO', 'slug' => 'growth', 'name' => 'Growth', 'tier' => 'growth', 'ladder' => 'tbca-intelligence', 'category' => null,
                'recurrence_class' => 'R2', 'tagline' => 'Advanced Intelligence & Monitoring', 'popular' => true, 'sort' => 2,
                'description' => 'Deeper insights, monitoring and more reports for growing businesses.',
                'what_recurs' => 'Always-on KPI dashboards, daily alerts, priority support',
                'why_recurs' => 'Live monitoring only has value while the system keeps running and updating.',
                'next_period_value' => 'Continuous system access and live monitoring',
                'who_for' => 'Growing businesses that monitor KPIs and deal flow daily.',
                'monthly_zar' => 6950, 'usd_monthly' => 449, 'delivery_cadence' => 'Daily alerts, Continuous access', 'cost_zar' => 3100,
                'features' => ['Everything in Essentials', 'Advanced KPI Dashboards', 'Daily Market & Deal Alerts', 'WhatsApp Priority Support', '15 Reports per Month', 'Up to 3 Users', 'Data Bank & RAG Access'],
                'entitlements' => ['Up to 3 users', 'Advanced dashboards', '15 reports per month'],
                'details' => ['matrix_blurb' => 'Advanced intelligence & monitoring for growing businesses.'],
            ],
            [
                'code' => 'SUB-PRO', 'slug' => 'professional', 'name' => 'Professional', 'tier' => 'professional', 'ladder' => 'tbca-intelligence', 'category' => null,
                'recurrence_class' => 'R3', 'tagline' => 'Strategic Intelligence & Advisory', 'sort' => 3,
                'description' => 'Strategic insights, extended reports and advisory support for decision makers.',
                'what_recurs' => 'Strategic reports, executive briefings, project and investor tracking',
                'why_recurs' => 'A new decision-support output is produced and reviewed every period.',
                'next_period_value' => 'Defined new decision-support outputs every period',
                'who_for' => 'Executives and boards making strategic decisions.',
                'monthly_zar' => 12950, 'usd_monthly' => 799, 'delivery_cadence' => 'Monthly briefing, Periodic reports', 'cost_zar' => 6200,
                'features' => ['Everything in Growth', 'Strategy & Risk Dashboards', 'Project & Investor Tracking', 'Monthly Executive Briefing', 'Unlimited Reports', 'Up to 10 Users', 'AIIM Premium Access'],
                'entitlements' => ['Up to 10 users', 'Unlimited reports', 'Monthly executive briefing'],
                'details' => ['matrix_blurb' => 'Strategic intelligence & advisory for decision makers.'],
            ],
            [
                'code' => 'SUB-ENT', 'slug' => 'enterprise', 'name' => 'Enterprise', 'tier' => 'enterprise', 'ladder' => 'tbca-intelligence', 'category' => 'Custom Enterprise',
                'recurrence_class' => 'R4', 'tagline' => 'Full Intelligence & Managed Support', 'sort' => 4,
                'description' => 'Comprehensive intelligence, managed support and dedicated advisory.',
                'what_recurs' => 'Managed support, specialist availability, custom dashboards, dedicated account management',
                'why_recurs' => 'Specialist capacity is reserved for you whether or not it is used in a period.',
                'next_period_value' => 'Maintained organisational readiness and reserved support capacity',
                'who_for' => 'Organisations that need managed intelligence and dedicated advisory.',
                'monthly_zar' => null, 'delivery_cadence' => 'Ongoing readiness, SLA-based response', 'min_term_months' => 12,
                'cancellation_route' => 'Contractual Portal + adviser review',
                'features' => ['Everything in Professional', 'Dedicated Account Manager', 'Custom Dashboards & Alerts', 'Managed Reporting (SLA Based)', 'Unlimited Users', 'On-site & Executive Advisory', 'Custom Integrations & Workflows'],
                'entitlements' => ['Dedicated account manager', 'Managed reporting', 'Managed support'],
                'details' => ['matrix_blurb' => 'Full intelligence & managed support for organisations.'],
            ],
            [
                'code' => 'SUB-CUS', 'slug' => 'custom-intelligence-archive', 'name' => 'Custom / Intelligence Archive', 'tier' => 'custom', 'ladder' => 'tbca-intelligence', 'category' => 'Custom Enterprise',
                'recurrence_class' => 'R5', 'tagline' => 'Bespoke solutions for your unique needs', 'sort' => 5,
                'description' => 'Tailored subscription solutions designed around your organisation.',
                'what_recurs' => 'Ongoing accumulation of records, benchmark history, intelligence archive, longitudinal analytics',
                'why_recurs' => 'The archive and benchmarks become more valuable every period they are maintained.',
                'next_period_value' => 'Value grows through retained history and preserved records',
                'who_for' => 'Organisations that need longitudinal intelligence and bespoke analytics.',
                'monthly_zar' => null, 'delivery_cadence' => 'Continuous accumulation, Periodic additions', 'min_term_months' => 12,
                'cancellation_route' => 'Contractual Portal + adviser review',
                'features' => ['Bespoke Dashboards', 'Custom Data & Reports', 'Dedicated Specialist Team', 'Flexible Engagement Model', 'Integration with Your Systems'],
                'entitlements' => ['Tailored archive access', 'Accumulated datasets', 'Custom analytics'],
                'details' => ['matrix_blurb' => 'Intelligence archive & longitudinal analytics for lasting value.'],
            ],

            /* ---------------- Business Rescue ladder (product page, change plan) */
            [
                'code' => 'SUB-BRAS', 'slug' => 'business-rescue-advisory-sprint', 'name' => 'Business Rescue Advisory Sprint', 'tier' => 'product', 'ladder' => 'business-rescue',
                'category' => 'Advisory Intelligence', 'recurrence_class' => 'R4', 'product_type' => 'Retainer-Equivalent Product', 'popular' => true, 'sort' => 10,
                'tagline' => 'Comprehensive readiness with priority support.',
                'description' => 'Continuous access to our Business Rescue Advisory system, decision tools, templates and live regulatory intelligence. Stay compliant, act with confidence and meet your obligations every month.',
                'what_recurs' => 'Standing access to the entire Business Rescue Advisory system, updated intelligence, templates and tools.',
                'why_recurs' => 'Regulatory and risk conditions change continuously. Ongoing access keeps you current, compliant and prepared.',
                'next_period_value' => 'You receive current intelligence, updated templates, monitoring and support for the next 30 days.',
                'who_for' => 'Board members, practitioners, companies under pressure and their advisors.',
                'monthly_zar' => 6500, 'usd_monthly' => 361, 'min_term_months' => 24, 'delivery_cadence' => 'Continuous', 'cost_zar' => 3300,
                'features' => ['Full access to advisory system', 'All templates, tools & checklists', 'Priority email & WhatsApp support', 'Monthly insights & alerts', '24/7 secure portal access', 'Up to 5 users'],
                'entitlements' => self::BRAS_ENTITLEMENTS,
                'details' => ['recurrence' => [
                    ['label' => 'What repeats', 'value' => 'Access, updates, monitoring, support and readiness'],
                    ['label' => 'Delivery cadence', 'value' => 'Continuous'],
                    ['label' => 'Updates', 'value' => 'Real-time intelligence + monthly insights'],
                    ['label' => 'Support availability', 'value' => 'Business hours + priority response'],
                    ['label' => 'Next-period value', 'value' => 'Current intelligence, tools, support and alerts'],
                ], 'compare' => ['templates' => 'All', 'intelligence' => 'Full', 'analytics' => 'Standard Dashboards', 'reports' => 'Standard', 'support' => 'Priority (within 8 hours)', 'users' => 'Up to 5'],
                    'short' => 'R4 Standing Readiness', 'important' => 'This is a subscription to a system and advisory service, not a substitute for specific legal, accounting or professional advice. Use with professional judgement.'],
            ],
            [
                'code' => 'SUB-BR-R3', 'slug' => 'business-rescue-essential-readiness', 'name' => 'Business Rescue Essential Readiness', 'tier' => 'product', 'ladder' => 'business-rescue',
                'category' => 'Advisory Intelligence', 'recurrence_class' => 'R3', 'sort' => 11,
                'tagline' => 'Essential tools and templates to stay compliant.',
                'description' => 'Core business rescue templates, monthly alerts and basic dashboards delivered every period.',
                'what_recurs' => 'Monthly alert pack, core templates and basic dashboards.',
                'why_recurs' => 'A new monthly alert pack and template refresh is produced each period.',
                'next_period_value' => 'A new monthly alert pack and refreshed core templates.',
                'who_for' => 'Smaller companies and practitioners who need the essentials.',
                'monthly_zar' => 4250, 'min_term_months' => 1, 'delivery_cadence' => 'Monthly', 'cost_zar' => 2000,
                'features' => ['Core templates & tools', 'Basic dashboards & reports', 'Standard email support', 'Monthly alerts', 'Portal access (business hours)', 'Up to 3 users'],
                'details' => ['compare' => ['templates' => 'Core', 'intelligence' => 'Basic', 'analytics' => '—', 'reports' => '—', 'support' => 'Standard (1 business day)', 'users' => 'Up to 3'], 'short' => 'R3 Essential Readiness'],
            ],
            [
                'code' => 'SUB-BR-R5', 'slug' => 'business-rescue-strategic-command', 'name' => 'Business Rescue Strategic Command', 'tier' => 'product', 'ladder' => 'business-rescue',
                'category' => 'Advisory Intelligence', 'recurrence_class' => 'R5', 'sort' => 12,
                'tagline' => 'Advanced analytics, custom reports & priority access.',
                'description' => 'Everything in Standing Readiness plus accumulating analytics, custom reports and dedicated advisor access.',
                'what_recurs' => 'Accumulating analytics history, custom reports and advisor access.',
                'why_recurs' => 'Your case history and analytics grow every period they are maintained.',
                'next_period_value' => 'New analytics added to your retained case history plus advisor access.',
                'who_for' => 'Boards and practitioners running complex or multiple rescue matters.',
                'monthly_zar' => 9950, 'min_term_months' => 1, 'delivery_cadence' => 'Continuous', 'cost_zar' => 4800,
                'features' => ['Everything in R4', 'Advanced analytics & dashboards', 'Custom report builder', 'Priority response (within 4 hours)', 'Dedicated advisor access (monthly)', 'Up to 10 users', 'API access (read-only)'],
                'details' => ['compare' => ['templates' => 'All + Advanced', 'intelligence' => 'Full + Predictive', 'analytics' => 'Advanced Dashboards', 'reports' => 'Custom Builder', 'support' => 'Priority (within 4 hours) + Advisor', 'users' => 'Up to 10'], 'short' => 'R5 Strategic Command'],
            ],

            /* ---------------- maintained content */
            [
                'code' => 'SUB-MCA', 'slug' => 'maintained-content', 'name' => 'Maintained Content Subscription', 'tier' => 'product', 'ladder' => 'maintained-content',
                'category' => 'Maintained Content', 'recurrence_class' => 'R1', 'sort' => 20,
                'tagline' => 'Includes Access + Ongoing Updates',
                'description' => 'Access to governed Digital Products that we continuously maintain, update and keep current. Your subscription ensures you always have the latest versions, updates, templates and compliance content.',
                'what_recurs' => 'We maintain, update and keep your content current. You receive new versions, updates and compliance revisions regularly.',
                'why_recurs' => 'Information, rules and templates change. Staying current protects your decisions, compliance and business outcomes.',
                'next_period_value' => 'Always current versions, updated templates, future-proofing and compliance confidence in the next period.',
                'who_for' => 'Companies, consultants and practitioners who rely on accurate, up-to-date frameworks, templates and guidance.',
                'monthly_zar' => 950, 'usd_monthly' => 53, 'min_term_months' => 1, 'delivery_cadence' => 'As released (monthly or as required)', 'cost_zar' => 380,
                'features' => ['Access to the latest versions and updates', 'New templates, examples and tools', 'Compliance and regulatory updates', 'Version history and change summaries', 'Guidance notes and implementation support', 'Secure access anytime, anywhere', 'Expert help during business hours'],
                'entitlements' => ['Access to the latest versions and updates', 'New templates, examples and tools', 'Compliance and regulatory updates', 'Version history and change summaries', 'Guidance notes and implementation support', 'Secure access anytime, anywhere', 'Expert help during business hours'],
                'details' => ['recurrence' => [
                    ['label' => 'What repeats', 'value' => 'Updates, new versions and improvements'],
                    ['label' => 'Delivery cadence', 'value' => 'As released (monthly or as required)'],
                    ['label' => 'Updates included', 'value' => 'All approved updates in your plan'],
                    ['label' => 'Support availability', 'value' => 'Business hours support'],
                    ['label' => 'Next-period value', 'value' => 'Current, accurate and compliant content'],
                ], 'important' => 'This is a subscription to maintained content, not a licence to redistribute. See terms for full usage and access conditions.'],
            ],
            [
                'code' => 'SUB-TLM', 'slug' => 'template-library-maintenance', 'name' => 'Template Library Maintenance', 'tier' => 'product', 'ladder' => 'maintained-content',
                'category' => 'Maintained Content', 'recurrence_class' => 'R1', 'sort' => 21,
                'tagline' => 'Your purchased templates kept current.',
                'description' => 'Keeps every template you own on the latest governed version with change summaries.',
                'what_recurs' => 'New versions of the templates you own.', 'why_recurs' => 'Templates change when law and practice change.',
                'next_period_value' => 'Updated versions and change summaries for your template library.', 'who_for' => 'Template owners and advisors.',
                'monthly_zar' => 1450, 'delivery_cadence' => 'As released', 'cost_zar' => 600,
                'features' => ['Latest template versions', 'Change summaries', 'Version history'],
            ],

            /* ---------------- choose-a-subscription catalogue (Intelligence Dashboards) */
            ...self::catalogue(),

            /* ---------------- below-floor plans (admin monitor) */
            ...self::belowFloor(),

            [
                'code' => 'SUB-ESG', 'slug' => 'esg-reporting-monthly', 'name' => 'ESG Reporting Monthly', 'tier' => 'product', 'ladder' => 'esg',
                'category' => 'Reporting & Alerts', 'recurrence_class' => 'R3', 'sort' => 60, 'status' => 'under_review', 'evidence_id' => null,
                'tagline' => 'Monthly ESG reporting pack.', 'description' => 'A monthly ESG reporting pack for your board.',
                'what_recurs' => 'Monthly ESG report.', 'next_period_value' => 'A new monthly ESG report.', 'who_for' => 'Boards with ESG obligations.',
                'monthly_zar' => 3200, 'delivery_cadence' => null, 'cost_zar' => 1500,
            ],
        ];
    }

    private static function catalogue(): array
    {
        $rows = [
            ['SUB-EID', 'executive-insight-dashboard', 'Executive Insight Dashboard', 'R2', 2950, 'Leadership-level dashboards, KPIs and strategic monitoring.', 'Intelligence Dashboards', 1250],
            ['SUB-GMD', 'growth-monitoring-dashboard', 'Growth Monitoring Dashboard', 'R2', 6950, 'Continuous business intelligence, market updates and alerts.', 'Intelligence Dashboards', 3000],
            ['SUB-PID', 'professional-intelligence-desk', 'Professional Intelligence Desk', 'R3', 12950, 'Advanced dashboards, reports and executive insights.', 'Intelligence Dashboards', 6000],
            ['SUB-CTS', 'compliance-tracker-subscription', 'Compliance Tracker Subscription', 'R1', 4950, 'Regulatory monitoring, reminders and compliance watch.', 'Intelligence Dashboards', 2100],
            ['SUB-MSS', 'market-signals-subscription', 'Market Signals Subscription', 'R2', 5950, 'Track changes, signals and priority developments.', 'Intelligence Dashboards', 2600],
            ['SUB-KPI', 'kpi-reporting-subscription', 'KPI & Reporting Subscription', 'R3', 7950, 'Monthly dashboards, benchmarking and performance reporting.', 'Intelligence Dashboards', 3500],
            ['SUB-IAS', 'intelligence-archive-subscription', 'Intelligence Archive Subscription', 'R5', 3950, 'Maintained access to records, reports and accumulated intelligence.', 'Intelligence Dashboards', 1700],
            ['SUB-MBIB', 'monthly-board-intelligence-briefing', 'Monthly Board Intelligence Briefing', 'R3', 10000, 'Monthly briefings, analysis and board-ready intelligence.', 'Executive Briefings', 4400],
            ['SUB-DTA', 'deal-and-tender-alerts', 'Deal & Tender Alerts', 'R1', 1950, 'Daily deal, tender and opportunity alerts for your sectors.', 'Market Monitoring', 800],
            ['SUB-AAM', 'ai-agent-monitoring', 'AI Agent Monitoring Subscription', 'R2', 3450, 'Live monitoring of your AI agents, workflows and automation health.', 'AI Tools & Automation', 1500],
            ['SUB-SDF', 'sector-data-feed', 'Sector Data Feed', 'R1', 2450, 'Refreshed sector datasets and indicators for analysis.', 'Data & Analytics', 1000],
        ];

        $value = [
            'R1' => ['Refreshed content and alerts', 'Refreshed intelligence each billing period'],
            'R2' => ['Live dashboard access, data feeds and continuous enhancements', 'Continuous system access and live monitoring'],
            'R3' => ['A defined report or briefing every period', 'Defined new decision-support outputs every period'],
            'R5' => ['Archive grows over time with new records', 'Value grows through retained history and preserved records'],
        ];

        return array_map(fn ($r, $i) => [
            'code' => $r[0], 'slug' => $r[1], 'name' => $r[2], 'tier' => 'product', 'ladder' => $r[1], 'category' => $r[6],
            'recurrence_class' => $r[3], 'monthly_zar' => $r[4], 'usd_monthly' => (int) round($r[4] / 18), 'description' => $r[5], 'tagline' => $r[5], 'sort' => 30 + $i,
            'what_recurs' => $value[$r[3]][0], 'next_period_value' => $value[$r[3]][1],
            'why_recurs' => 'The underlying information changes every period, so current access keeps decisions sound.',
            'who_for' => 'Business owners, executives and advisors.',
            'delivery_cadence' => ['R1' => 'Weekly', 'R2' => 'Continuous', 'R3' => 'Monthly', 'R5' => 'Continuous accumulation'][$r[3]],
            'cost_zar' => $r[7],
            'features' => [$r[5], 'Secure Client Portal access', 'Human-reviewed outputs', 'Cancel anytime in Portal'],
        ], $rows, array_keys($rows));
    }

    private static function belowFloor(): array
    {
        $rows = [
            ['SUB-LUM', 'r1-legal-updates-monthly', 'R1 Legal Updates Monthly', 'R1', 249, 375, 'Compliance & Regulatory', 'Monthly'],
            ['SUB-SOP', 'r2-sop-library-access', 'R2 SOP Library Access', 'R2', 399, 650, 'Research Libraries', 'Monthly'],
            ['SUB-CDG', 'r3-compliance-digest', 'R3 Compliance Digest', 'R3', 199, 320, 'Reporting & Alerts', 'Monthly'],
            ['SUB-HRL', 'r4-hr-hotline-light', 'R4 HR Hotline Light', 'R4', 450, 780, 'Strategy Support', 'Monthly'],
            ['SUB-PPB', 'r2-policy-pack-basic', 'R2 Policy Pack (Basic)', 'R2', 246, 375, 'Compliance & Regulatory', 'Annual'],
        ];

        return array_map(fn ($r, $i) => [
            'code' => $r[0], 'slug' => $r[1], 'name' => $r[2], 'tier' => 'product', 'ladder' => $r[1], 'category' => $r[6],
            'recurrence_class' => $r[3], 'monthly_zar' => $r[4], 'floor_zar' => $r[5], 'cost_zar' => (int) floor($r[5] * 0.65), 'sort' => 50 + $i,
            'tagline' => 'Entry-level recurring access.', 'description' => 'Entry-level recurring access priced below the current floor.',
            'what_recurs' => 'Periodic updates and access.', 'next_period_value' => 'Updated content and access for the next period.',
            'who_for' => 'Small businesses.', 'delivery_cadence' => 'Monthly',
            'details' => ['subscription_type' => $r[7]],
        ], $rows, array_keys($rows));
    }
}
