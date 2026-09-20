<?php

namespace App\Support\Content;

/**
 * Table 1 — Revised Main Navigation Route Matrix.
 * AIIM and Due Diligence are primary destinations, not sub-pages.
 */
class Navigation
{
    /** Row 1 of the primary navigation. */
    public static function primary(): array
    {
        return [
            self::tab('Home', '/', 'Route visitors into diagnostics, shop, AIIM, DD, advisory and portal.', 'Business Health Score', 'Explore AIIM'),
            self::tab('Services', '/services', 'Explain the full advisory universe.', 'Find the Right Service', 'Request Consultation'),
            self::tab('Online Shop', '/shop', 'Sell Sprints, products, subscriptions and retainers.', 'Browse Sprints', 'Request Quote'),
            self::tab('AIIM', '/aiim', 'Provide Africa trade and investment intelligence.', 'Explore Africa', 'Buy Premium Brief'),
            self::tab('Due Diligence', '/due-diligence', 'Sell consent-driven checks, monitoring and enterprise screening.', 'Start a Due Diligence Case', 'Request Enterprise Screening'),
            self::tab('Digital Products', '/digital-products', 'Sell toolkits, reports, templates and courses.', 'Browse Products', 'View Related Sprints'),
            self::tab('Subscriptions', '/subscriptions', 'Sell recurring intelligence, dashboards and support.', 'Choose Plan', 'Compare Plans'),
            self::tab('Retainers', '/retainers', 'Sell ongoing advisory, procurement, DD and project desks.', 'Request Proposal', 'View Service Levels'),
            self::tab('Marketplace', '/marketplace', 'Coordinate controlled analyst and specialist delivery.', 'Submit Brief', 'Join Marketplace'),
            self::tab('Partner Services', '/partner-services', 'Route regulated and specialist work.', 'Request Partner Review', 'View Boundaries'),
            self::tab('Technology Solutions', '/technology-solutions', 'Package Zoho, BI, AI, RPA, workflow and API services.', 'Request Setup', 'Book Discovery'),
        ];
    }

    /** Row 2 of the primary navigation. */
    public static function secondary(): array
    {
        return [
            self::tab('Diagnostics', '/diagnostics', 'Capture structured need and recommend next steps.', 'Start Diagnostic', 'View Scores'),
            self::tab('Project Advisory', '/project-advisory', 'Route concept, feasibility, financing and implementation work.', 'Request Discovery', 'Open Data Room'),
            self::tab('Countries', '/countries', 'Localise country services, language, currency and payments.', 'Select Country', 'Compare Countries'),
            self::tab('Industries', '/industries', 'Route sector-specific demand.', 'Select Industry', 'View Opportunities'),
            self::tab('Resources', '/resources', 'Provide authoritative content and lead magnets.', 'Download Guide', 'Start Diagnostic'),
            self::tab('Client Portal', '/portal', 'Secure access to orders, cases, projects, documents and support.', 'Enter Portal', 'Get Support'),
            self::tab('About TBCA', '/about', 'Establish institutional trust and operating doctrine.', 'Meet TBCA', 'View Governance'),
            self::tab('KP Thought Leadership', '/kp-thought-leadership', 'Use founder insight to educate and route demand.', 'Read Insight', 'Book Session'),
            self::tab('Webinars', '/webinars', 'Convert education into leads, attendance and offers.', 'Register', 'View Replay'),
            self::tab('Contact', '/contact', 'Route enquiries to CRM, WhatsApp, booking or proposal.', 'Talk to TBCA', 'Continue on WhatsApp'),
        ];
    }

    public static function all(): array
    {
        return [...self::primary(), ...self::secondary()];
    }

    public static function find(string $href): ?array
    {
        foreach (self::all() as $tab) {
            if ($tab['href'] === $href) {
                return $tab;
            }
        }

        return null;
    }

    /** Mega-menu children keyed by parent href. */
    public static function children(): array
    {
        return [
            '/aiim' => [
                ['label' => 'AIIM Home', 'href' => '/aiim', 'note' => 'Intent selector, Africa map and saved items'],
                ['label' => 'Compare', 'href' => '/aiim/compare', 'note' => 'Countries, sectors, projects and opportunities'],
                ['label' => 'Corridors', 'href' => '/aiim/corridors', 'note' => 'Ports, rail, roads, borders and bottlenecks'],
                ['label' => 'Reports Store', 'href' => '/aiim/store', 'note' => 'Premium country, sector and risk briefs'],
                ['label' => 'Workspace', 'href' => '/aiim/workspace', 'note' => 'Saved searches, alerts and downloads'],
                ['label' => 'Watchlists', 'href' => '/aiim/workspace/watchlists', 'note' => 'Monitored countries, entities and signals'],
            ],
            '/due-diligence' => [
                ['label' => 'Individual Checks', 'href' => '/due-diligence/individual', 'note' => 'Identity, sanctions, PEP and adverse media'],
                ['label' => 'Company Checks', 'href' => '/due-diligence/company', 'note' => 'Registration, directors, ownership and risk'],
                ['label' => 'Supplier Checks', 'href' => '/due-diligence/supplier', 'note' => 'Compliance, capacity and procurement readiness'],
                ['label' => 'Director and UBO', 'href' => '/due-diligence/director-ubo', 'note' => 'Beneficial ownership and control evidence'],
                ['label' => 'AML, KYC and KYB', 'href' => '/due-diligence/aml-kyc-kyb', 'note' => 'Structured onboarding and screening'],
                ['label' => 'Enterprise Screening', 'href' => '/due-diligence/enterprise', 'note' => 'Bulk counterparty and procurement desk'],
                ['label' => 'Monitoring', 'href' => '/due-diligence/monitoring', 'note' => 'Recurring screening, alerts and renewal'],
                ['label' => 'Reports and Dashboards', 'href' => '/due-diligence/reports', 'note' => 'Entitled reports and portfolio views'],
            ],
            '/about' => [
                ['label' => 'Our Story', 'href' => '/about/our-story', 'note' => 'Why we exist, who we serve, how we deliver'],
                ['label' => 'Our Methodology', 'href' => '/about/methodology', 'note' => 'Five phases. One disciplined path to impact'],
                ['label' => 'Our Team', 'href' => '/about/team', 'note' => 'Verified current team and practice leadership'],
                ['label' => 'Governance', 'href' => '/about/governance', 'note' => 'How we operate with integrity and accountability'],
                ['label' => 'Certifications & Verifications', 'href' => '/about/certifications', 'note' => 'Evidence-backed trust, current and verifiable'],
            ],
        ];
    }

    /** Footer column register. */
    public static function footer(): array
    {
        return [
            'Explore' => [
                ['label' => 'Services', 'href' => '/services'],
                ['label' => 'Online Shop', 'href' => '/shop'],
                ['label' => 'AIIM', 'href' => '/aiim'],
                ['label' => 'Marketplace', 'href' => '/marketplace'],
                ['label' => 'Partner Services', 'href' => '/partner-services'],
                ['label' => 'Technology Solutions', 'href' => '/technology-solutions'],
                ['label' => 'Diagnostics', 'href' => '/diagnostics'],
            ],
            'Platform' => [
                ['label' => 'Client Portal', 'href' => '/portal'],
                ['label' => 'AI Agents & Automation', 'href' => '/technology-solutions#agents'],
                ['label' => 'Due Diligence', 'href' => '/due-diligence'],
                ['label' => 'Virtual Deal Room', 'href' => '/project-advisory#deal-room'],
                ['label' => 'Data Bank & RAG', 'href' => '/resources#data-bank'],
                ['label' => 'Digital Products', 'href' => '/digital-products'],
                ['label' => 'Subscriptions', 'href' => '/subscriptions'],
                ['label' => 'Retainers', 'href' => '/retainers'],
            ],
            'Resources' => [
                ['label' => 'Project Advisory', 'href' => '/project-advisory'],
                ['label' => 'KP Thought Leadership', 'href' => '/kp-thought-leadership'],
                ['label' => 'Webinars', 'href' => '/webinars'],
                ['label' => 'Resource Library', 'href' => '/resources'],
                ['label' => 'Guides & Reports', 'href' => '/resources#guides'],
                ['label' => 'Templates & Tools', 'href' => '/resources#templates'],
                ['label' => 'Countries', 'href' => '/countries'],
                ['label' => 'Industries', 'href' => '/industries'],
            ],
            'Company' => [
                ['label' => 'About TBCA', 'href' => '/about'],
                ['label' => 'Our Story', 'href' => '/about/our-story'],
                ['label' => 'Our Team', 'href' => '/about/team'],
                ['label' => 'Governance', 'href' => '/about/governance'],
                ['label' => 'Certifications', 'href' => '/about/certifications'],
                ['label' => 'Contact Us', 'href' => '/contact'],
            ],
            'Support' => [
                ['label' => 'Help Centre', 'href' => '/contact#help'],
                ['label' => 'Ask a Question', 'href' => '/contact#ask'],
                ['label' => 'WhatsApp / Talk', 'href' => '/contact#whatsapp'],
                ['label' => 'System Status', 'href' => '/contact#status'],
                ['label' => 'Report an Issue', 'href' => '/contact#issue'],
                ['label' => 'Privacy & Terms', 'href' => '/about/governance#privacy'],
            ],
        ];
    }

    private static function tab(string $label, string $href, string $purpose, string $cta, string $secondary): array
    {
        return [
            'label' => $label,
            'href' => $href,
            'purpose' => $purpose,
            'cta' => $cta,
            'secondary_cta' => $secondary,
        ];
    }
}
