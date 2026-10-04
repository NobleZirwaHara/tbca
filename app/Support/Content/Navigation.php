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
            self::tab('Virtual Deal Room', '/virtual-deal-room', 'Run governed transactions from mandate to close in one secure room.', 'Start a Deal Room', 'My Deal Rooms'),
        ];
    }

    /** Row 2 of the primary navigation. */
    public static function secondary(): array
    {
        return [
            self::tab('Technology Solutions', '/technology-solutions', 'Package Zoho, BI, AI, RPA, workflow and API services.', 'Request Setup', 'Book Discovery'),
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
            '/services' => [
                ['label' => 'All Services', 'href' => '/services', 'note' => 'The full advisory universe'],
                ['label' => 'A-Z Service Categories', 'href' => '/services/a-z', 'note' => 'Every service category, alphabetically'],
                ['label' => 'Find the Right Service', 'href' => '/services/resolver/1', 'note' => 'Fit-ranked recommendation in four steps'],
                ['label' => 'Not Sure Which?', 'href' => '/services/not-sure-which', 'note' => 'Guided help choosing a route'],
                ['label' => 'Ways to Work with TBCA', 'href' => '/services/ways-to-work-with-tbca', 'note' => 'Sprints, retainers, mandates and more'],
                ['label' => 'Business Consultancy', 'href' => '/services/business-consultancy', 'note' => 'Strategy, growth and performance'],
                ['label' => 'Management Consultancy', 'href' => '/services/management-consultancy', 'note' => 'Operations, governance and change'],
                ['label' => 'Browse All Sprints', 'href' => '/sprints', 'note' => 'Search and filter the governed catalogue'],
                ['label' => 'Enterprise Relationship', 'href' => '/services/enterprise-relationship', 'note' => 'Multi-service enterprise accounts'],
                ['label' => 'Request a Proposal', 'href' => '/services/proposal-request', 'note' => 'Scoped proposal for your situation'],
                ['label' => 'My Services Dashboard', 'href' => '/services/relationship', 'note' => 'Your vehicles, fees and statement'],
            ],
            '/shop' => [
                ['label' => 'Shop Home', 'href' => '/shop', 'note' => 'Sprints, products, subscriptions and retainers'],
                ['label' => 'Featured Sprints', 'href' => '/sprints/featured', 'note' => 'Hand-picked by TBCA specialists'],
                ['label' => 'Popular Sprints', 'href' => '/sprints/popular', 'note' => 'Most ordered this quarter'],
                ['label' => 'New Sprints', 'href' => '/sprints/new', 'note' => 'Recently released and version-controlled'],
                ['label' => 'Services Resolver', 'href' => '/shop/resolver', 'note' => 'Find the right product for your need'],
                ['label' => 'A-Z Aisles', 'href' => '/shop/a-z', 'note' => 'Browse the shop by aisle'],
                ['label' => 'Compare Products', 'href' => '/shop/compare', 'note' => 'Side-by-side scope, price and delivery'],
                ['label' => 'Retainer Proposal', 'href' => '/shop/retainer-proposal', 'note' => 'Build a proposal for ongoing support'],
                ['label' => 'Marketplace Brief', 'href' => '/shop/marketplace-brief', 'note' => 'Brief vetted specialists'],
                ['label' => 'My Basket', 'href' => '/basket', 'note' => 'Review your selection and check out'],
            ],
            '/digital-products' => [
                ['label' => 'Browse Digital Products', 'href' => '/digital-products/browse', 'note' => 'Toolkits, reports, templates and courses'],
                ['label' => 'Dashboard Sprints', 'href' => '/sprints/category/data-dashboards', 'note' => 'Management-ready dashboards and data builds'],
                ['label' => 'Toolkits', 'href' => '/sprints/category/digital-products', 'note' => 'Ready-to-use toolkits and packs'],
                ['label' => 'Templates & Toolkits', 'href' => '/sprints/category/templates-toolkits', 'note' => 'Templates, checklists and registers'],
                ['label' => 'Tools, Templates & Calculators', 'href' => '/tools', 'note' => 'Working calculators and downloadable tools'],
                ['label' => 'My Digital Library', 'href' => '/digital-products/library', 'note' => 'Your licences, downloads and updates'],
            ],
            '/subscriptions' => [
                ['label' => 'Subscription Plans', 'href' => '/subscriptions', 'note' => 'Recurring intelligence, dashboards and support'],
                ['label' => 'Compare Plans', 'href' => '/subscriptions/compare', 'note' => 'Features, cadence and pricing side by side'],
                ['label' => 'Choose a Subscription', 'href' => '/subscriptions/choose-subscription', 'note' => 'Guided plan selection'],
                ['label' => 'My Subscriptions', 'href' => '/subscriptions/account', 'note' => 'Manage, pause, change or renew'],
            ],
            '/retainers' => [
                ['label' => 'Retainer Desks', 'href' => '/retainers', 'note' => 'Ongoing advisory, procurement, DD and project desks'],
                ['label' => 'Compare Retainers', 'href' => '/retainers/compare', 'note' => 'Allowances, service levels and pricing'],
                ['label' => 'Allowance Sizing Tool', 'href' => '/retainers/allowance-sizing', 'note' => 'Estimate the hours you need'],
                ['label' => 'Request a Proposal', 'href' => '/retainers/proposal-request', 'note' => 'Scoped retainer proposal'],
                ['label' => 'My Retainers', 'href' => '/retainers/account', 'note' => 'Allowance meter, ledger and statements'],
            ],
            '/virtual-deal-room' => [
                ['label' => 'Overview', 'href' => '/virtual-deal-room', 'note' => 'How the governed deal room works'],
                ['label' => 'Start a Deal Room', 'href' => '/virtual-deal-room/enquiry', 'note' => 'Enquiry, fit check and diagnostic'],
                ['label' => 'My Deal Rooms', 'href' => '/virtual-deal-room/rooms', 'note' => 'Your rooms, stages and invitations'],
            ],
            '/project-advisory' => [
                ['label' => 'Overview', 'href' => '/project-advisory', 'note' => 'Concept, feasibility, financing and implementation'],
                ['label' => 'Build Your Advisory Path', 'href' => '/project-advisory/context', 'note' => 'Tell us about your project'],
                ['label' => 'Readiness Diagnostic', 'href' => '/project-advisory/readiness', 'note' => 'Scored project readiness'],
                ['label' => 'Path-to-Close Cost Exposure', 'href' => '/project-advisory/cost-exposure', 'note' => 'Low, expected and high costs per ledger'],
                ['label' => 'Sector Study Explorer', 'href' => '/project-advisory/studies', 'note' => 'Studies and evidence by sector'],
                ['label' => 'Engagement Options', 'href' => '/project-advisory/engagement-options', 'note' => 'How an advisory mandate can be structured'],
                ['label' => 'Contingent Fee Calculator', 'href' => '/project-advisory/contingent-fee-calculator', 'note' => 'Success-fee estimate with floor and cap'],
                ['label' => 'Request Advisory', 'href' => '/project-advisory/discovery', 'note' => 'Start a discovery engagement'],
                ['label' => 'Evidence Library', 'href' => '/project-advisory/evidence', 'note' => 'Precedents and supporting evidence'],
                ['label' => 'My Advisory Workspace', 'href' => '/project-advisory/workspace', 'note' => 'Mandates, gates and ledgers'],
            ],
            '/marketplace' => [
                ['label' => 'Marketplace Home', 'href' => '/marketplace', 'note' => 'Controlled analyst and specialist delivery'],
                ['label' => 'How It Works', 'href' => '/marketplace/how-it-works', 'note' => 'From brief to approved deliverable'],
                ['label' => 'Browse Services', 'href' => '/marketplace/services', 'note' => 'Search, filter and compare services'],
                ['label' => 'Submit a Brief', 'href' => '/marketplace/brief', 'note' => 'Five-step brief, matched to vetted providers'],
                ['label' => 'Verified Providers', 'href' => '/marketplace/providers', 'note' => 'Rated and tiered specialists'],
                ['label' => 'Become a Provider', 'href' => '/marketplace/providers/apply', 'note' => 'Apply to join the provider network'],
                ['label' => 'My Marketplace', 'href' => '/marketplace/my', 'note' => 'Your briefs, proposals and engagements'],
                ['label' => 'Provider Portal', 'href' => '/marketplace/provider', 'note' => 'Opportunities, engagements and earnings'],
            ],
            '/partner-services' => [
                ['label' => 'Partner Services Home', 'href' => '/partner-services', 'note' => 'Regulated and specialist work, routed safely'],
                ['label' => 'Choose a Partner Service', 'href' => '/partner-services/choose-service', 'note' => 'Find the right regulated service'],
                ['label' => 'How Partner Engagements Work', 'href' => '/partner-services/how-it-works', 'note' => 'Conflict check, scope, quote and delivery'],
                ['label' => 'Profession & Jurisdiction Coverage', 'href' => '/partner-services/coverage', 'note' => 'Where partners can act'],
                ['label' => 'Request Partner Review', 'href' => '/partner-services/request', 'note' => 'Start a partner request'],
                ['label' => 'My Partner Requests', 'href' => '/partner-services/requests', 'note' => 'Track your requests by stage'],
                ['label' => 'Partner Network', 'href' => '/partner-services/network', 'note' => 'Verified professional partners'],
                ['label' => 'Professional Limitation Notice', 'href' => '/partner-services/professional-limitation-notice', 'note' => 'What TBCA does and does not do'],
                ['label' => 'Apply to Become a Partner', 'href' => '/partner-services/apply', 'note' => 'Join the partner network'],
                ['label' => 'Partner Workspace', 'href' => '/partner-services/workspace', 'note' => 'Conflicts, quotes, delivery and settlement'],
            ],
            '/technology-solutions' => [
                ['label' => 'Overview', 'href' => '/technology-solutions', 'note' => 'Zoho, BI, AI, RPA, web and cloud services'],
                ['label' => 'Solution Towers', 'href' => '/technology-solutions/towers', 'note' => 'Seven technology towers'],
                ['label' => 'Free Readiness Diagnostic', 'href' => '/technology-solutions/readiness', 'note' => 'Scored digital readiness'],
                ['label' => 'AI Solution Architect', 'href' => '/technology-solutions/configure', 'note' => 'Configure your solution and fees'],
                ['label' => 'Fee Transparency', 'href' => '/technology-solutions/fees', 'note' => 'Separate TBCA, supplier and statutory ledgers'],
                ['label' => 'AI & Automation Sprint', 'href' => '/technology-solutions/sprints/ai-automation', 'note' => 'Agents, RPA and workflow automation'],
                ['label' => 'Technology Setup Sprints', 'href' => '/sprints?type=technology-setup', 'note' => 'CRM, portal, automation and admin setup'],
                ['label' => 'My Technology Workspace', 'href' => '/technology-solutions/workspace', 'note' => 'Gates, payments, UAT and support'],
            ],
            '/diagnostics' => [
                ['label' => 'Diagnostics', 'href' => '/diagnostics', 'note' => 'Structured diagnostics and packs'],
                ['label' => 'Business Health Score', 'href' => '/business-health-score', 'note' => 'Free scored assessment in minutes'],
                ['label' => 'Diagnostic Sprints', 'href' => '/sprints/category/diagnostics', 'note' => 'Deeper diagnostics with human review'],
            ],
            '/countries' => [
                ['label' => 'Country Explorer', 'href' => '/find-the-right-service/countries', 'note' => 'Country readiness and available services'],
                ['label' => 'Corridor Network', 'href' => '/find-the-right-service/corridors', 'note' => 'Cross-border trade and service corridors'],
            ],
            '/portal' => [
                ['label' => 'Portal Overview', 'href' => '/portal', 'note' => 'Secure gateway and how it works'],
                ['label' => 'My Dashboard', 'href' => '/portal/dashboard', 'note' => 'Your signed-in command centre'],
                ['label' => 'One Action Centre', 'href' => '/portal/actions', 'note' => 'Everything waiting on you'],
                ['label' => 'My Orders & Invoices', 'href' => '/portal/invoices', 'note' => 'Pay, statements and receipts'],
                ['label' => 'My Projects & Deliverables', 'href' => '/portal/projects', 'note' => 'Delivery, approvals and QA'],
                ['label' => 'Document Vault', 'href' => '/portal/documents', 'note' => 'Secure uploads and downloads'],
                ['label' => 'Support Tickets', 'href' => '/portal/support', 'note' => 'Help with response-time tracking'],
                ['label' => 'My Meetings', 'href' => '/discovery-call/meetings', 'note' => 'Upcoming calls, reschedule or cancel'],
                ['label' => 'My DD Cases', 'href' => '/due-diligence/cases', 'note' => 'Consent, evidence, review and reports'],
                ['label' => 'My Deal Rooms', 'href' => '/virtual-deal-room/rooms', 'note' => 'Your transaction rooms'],
                ['label' => 'My Subscriptions', 'href' => '/subscriptions/account', 'note' => 'Manage, pause, change or renew'],
                ['label' => 'My Retainers', 'href' => '/retainers/account', 'note' => 'Allowance meter and statements'],
                ['label' => 'Privacy & Data Rights', 'href' => '/portal/privacy', 'note' => 'Consent and POPIA requests'],
                ['label' => 'Client Login', 'href' => '/login', 'note' => 'Secure access with email or Client ID'],
            ],
            '/contact' => [
                ['label' => 'Contact Us', 'href' => '/contact', 'note' => 'Offices, channels and enquiry form'],
                ['label' => 'Book a Discovery Call', 'href' => '/discovery-call', 'note' => 'Free 30-minute call with a specialist'],
                ['label' => 'Request a Quote', 'href' => '/sprints/request-a-quote', 'note' => 'Scoped and priced for your situation'],
            ],
            '/industries' => [
                ['label' => 'Industries Home', 'href' => '/industries', 'note' => 'Seventeen canonical industries and their routes'],
                ['label' => 'Select Your Industry', 'href' => '/industries/select', 'note' => 'Find your sector and sub-industry'],
                ['label' => 'Financial Services', 'href' => '/industries/financial-services', 'note' => 'Highly regulated sector hub'],
                ['label' => 'Sector Intelligence', 'href' => '/industries/sector-intelligence/agriculture-agro-industry', 'note' => 'Paid sector briefs'],
                ['label' => 'Sector Diagnostic', 'href' => '/industries/agriculture-agro-industry/diagnostic', 'note' => 'Scored industry readiness check'],
                ['label' => 'Benchmarks', 'href' => '/industries/agriculture-agro-industry/benchmarks', 'note' => 'Anonymised, threshold-governed benchmarks'],
                ['label' => 'Partner Directory', 'href' => '/industries/agriculture-agro-industry/partners', 'note' => 'Sector specialists and regulated partners'],
                ['label' => 'Client Workspace', 'href' => '/industries/workspace', 'note' => 'Your industry engagements'],
            ],
            '/resources' => [
                ['label' => 'Resource Library', 'href' => '/resources/library', 'note' => 'Search every guide, template and tool'],
                ['label' => 'Guides & Reports', 'href' => '/resources/guides-reports', 'note' => 'Authoritative guides and research'],
                ['label' => 'Templates & Tools', 'href' => '/resources/templates-tools', 'note' => 'Ready-to-use templates and tools'],
                ['label' => 'KP Insights', 'href' => '/resources/insights', 'note' => 'Founder thought leadership'],
                ['label' => 'Webinars & Replays', 'href' => '/resources/webinars', 'note' => 'Live sessions and recordings'],
                ['label' => 'Free Diagnostic', 'href' => '/resources/free-diagnostic', 'note' => 'Quick scored assessment'],
                ['label' => 'Free vs Paid', 'href' => '/resources/free-vs-paid', 'note' => 'What is included at each access level'],
                ['label' => 'FAQ', 'href' => '/resources/faq', 'note' => 'Access, licensing and downloads'],
                ['label' => 'My Resource Library', 'href' => '/resources/account/library', 'note' => 'Your entitlements and downloads'],
                ['label' => 'Preference Centre', 'href' => '/resources/preferences', 'note' => 'Consent and communication preferences'],
            ],
            '/aiim' => [
                ['label' => 'AIIM Home', 'href' => '/aiim', 'note' => 'Africa investment intelligence map'],
                ['label' => 'South Africa Investor Cockpit', 'href' => '/aiim/country/south-africa', 'note' => 'Country view, provinces and signals'],
                ['label' => 'Sectors', 'href' => '/aiim/sectors', 'note' => 'Sector intelligence and outlook'],
                ['label' => 'Opportunities', 'href' => '/aiim/opportunities', 'note' => 'Investment opportunities with evidence'],
                ['label' => 'Projects', 'href' => '/aiim/projects', 'note' => 'Project pipeline and readiness'],
                ['label' => 'Investors & Funders', 'href' => '/aiim/investors', 'note' => 'Investor and funder profiles'],
                ['label' => 'Trade Corridors', 'href' => '/aiim/corridors', 'note' => 'Ports, rail, roads and borders'],
                ['label' => 'Risk & Outlook', 'href' => '/aiim/risk', 'note' => 'Country and sector risk'],
                ['label' => 'Premium Brief Store', 'href' => '/aiim/store', 'note' => 'Country, sector and risk briefs'],
                ['label' => 'Custom Intelligence', 'href' => '/aiim/custom-intelligence', 'note' => 'Commissioned research and verification'],
                ['label' => 'Sources & Methodology', 'href' => '/aiim/methodology', 'note' => 'Confidence grades and source tiers'],
                ['label' => 'My AIIM Workspace', 'href' => '/aiim/workspace', 'note' => 'Saved items, watchlists and reports'],
                ['label' => 'Wallet & Credits', 'href' => '/aiim/wallet', 'note' => 'Credits for metered unlocks'],
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
                ['label' => 'Start a Case', 'href' => '/due-diligence/services', 'note' => 'Choose a check and get a live quote'],
                ['label' => 'Compare Packages & Pricing', 'href' => '/due-diligence/pricing', 'note' => 'Package comparison with live pricing'],
                ['label' => 'Investor Checks', 'href' => '/due-diligence/investor', 'note' => 'Investor and funder verification'],
                ['label' => 'Project DD', 'href' => '/due-diligence/project', 'note' => 'Project and sponsor due diligence'],
                ['label' => 'ESG DD', 'href' => '/due-diligence/esg', 'note' => 'Environmental, social and governance review'],
                ['label' => 'Request Enterprise Screening', 'href' => '/due-diligence/enterprise/request', 'note' => 'Bulk and recurring screening desk'],
                ['label' => 'My DD Cases', 'href' => '/due-diligence/cases', 'note' => 'Track consent, evidence, review and reports'],
            ],
            '/about' => [
                ['label' => 'Our Story', 'href' => '/about/our-story', 'note' => 'Why we exist, who we serve, how we deliver'],
                ['label' => 'Our Methodology', 'href' => '/about/methodology', 'note' => 'Five phases. One disciplined path to impact'],
                ['label' => 'Our Team', 'href' => '/about/team', 'note' => 'Verified current team and practice leadership'],
                ['label' => 'Governance', 'href' => '/about/governance', 'note' => 'How we operate with integrity and accountability'],
                ['label' => 'Certifications & Verifications', 'href' => '/about/certifications', 'note' => 'Evidence-backed trust, current and verifiable'],
                ['label' => 'Institutional Relationships', 'href' => '/about/relationships', 'note' => 'Institutions we work with, by permission'],
                ['label' => 'Our Promise', 'href' => '/about/our-promise', 'note' => 'Commitments backed by evidence'],
                ['label' => 'Testimonials', 'href' => '/about/testimonials', 'note' => 'Consented client feedback'],
                ['label' => 'Trust Centre', 'href' => '/trust-centre', 'note' => 'Security, privacy and compliance in one place'],
                ['label' => 'Corrections Register', 'href' => '/about/corrections', 'note' => 'Published corrections and how to raise a concern'],
                ['label' => 'Professional Boundaries', 'href' => '/about/professional-boundaries', 'note' => 'What we do and do not provide'],
                ['label' => 'AI Disclosure', 'href' => '/about/ai-disclosure', 'note' => 'How AI is used and where humans review'],
                ['label' => 'Careers', 'href' => '/careers', 'note' => 'Open roles at TBCA'],
                ['label' => 'Newsroom', 'href' => '/newsroom', 'note' => 'Press releases and media contact'],
                ['label' => 'Partner With Us', 'href' => '/about/partner-enquiry', 'note' => 'Institutional and delivery partnerships'],
            ],
        ];
    }

    /** Footer column register. */
    public static function footer(): array
    {
        return [
            'Explore' => [
                ['label' => 'Browse Sprints', 'href' => '/sprints'],
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
                ['label' => 'AI Agents & Automation', 'href' => '/technology-solutions/sprints/ai-automation'],
                ['label' => 'Due Diligence', 'href' => '/due-diligence'],
                ['label' => 'Virtual Deal Room', 'href' => '/virtual-deal-room'],
                ['label' => 'Data Bank & RAG', 'href' => '/resources/library'],
                ['label' => 'Digital Products', 'href' => '/digital-products'],
                ['label' => 'Subscriptions', 'href' => '/subscriptions'],
                ['label' => 'Retainers', 'href' => '/retainers'],
            ],
            'Resources' => [
                ['label' => 'Project Advisory', 'href' => '/project-advisory'],
                ['label' => 'KP Thought Leadership', 'href' => '/kp-thought-leadership'],
                ['label' => 'Webinars', 'href' => '/webinars'],
                ['label' => 'Resource Library', 'href' => '/resources/library'],
                ['label' => 'Research Reports', 'href' => '/sprints/category/research-reports'],
                ['label' => 'Tools & Calculators', 'href' => '/tools'],
                ['label' => 'Countries', 'href' => '/countries'],
                ['label' => 'Industries', 'href' => '/industries'],
            ],
            'Company' => [
                ['label' => 'About TBCA', 'href' => '/about'],
                ['label' => 'Our Story', 'href' => '/about/our-story'],
                ['label' => 'Our Team', 'href' => '/about/team'],
                ['label' => 'Governance', 'href' => '/about/governance'],
                ['label' => 'Careers', 'href' => '/careers'],
                ['label' => 'Newsroom', 'href' => '/newsroom'],
                ['label' => 'Contact Us', 'href' => '/contact'],
            ],
            'Support' => [
                ['label' => 'Help Centre', 'href' => '/contact'],
                ['label' => 'Book a Discovery Call', 'href' => '/discovery-call'],
                ['label' => 'System Status', 'href' => '/system-status'],
                ['label' => 'Complaints', 'href' => '/complaints'],
                ['label' => 'Whistleblowing', 'href' => '/whistleblowing'],
                ['label' => 'Trust Centre', 'href' => '/trust-centre'],
                ['label' => 'Privacy', 'href' => '/privacy'],
                ['label' => 'Terms', 'href' => '/terms'],
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
