<?php

namespace App\Support\Content;

/**
 * Part 1 and Part 2 registers: platform engines, canonical methodology,
 * backend module map, systems of record, governance and control tower.
 */
class Platform
{
    /** Section 3 — Platform Engine Model. */
    public static function engines(): array
    {
        return [
            ['name' => 'Business and Management Consultancy', 'role' => 'Diagnostics, Sprints, subscriptions, retainers, projects and dashboards.', 'icon' => 'briefcase', 'href' => '/services'],
            ['name' => 'Online Shop and Commercial Engine', 'role' => 'Fixed-scope products, quote routes, entitlements, payments and renewals.', 'icon' => 'shopping-bag', 'href' => '/shop'],
            ['name' => 'AIIM', 'role' => 'Country, sector, trade, opportunity, risk, live, relationship and AI decision intelligence.', 'icon' => 'globe', 'href' => '/aiim'],
            ['name' => 'Due Diligence', 'role' => 'Consent-based verification, evidence, screening, reports, monitoring and human review.', 'icon' => 'shield-check', 'href' => '/due-diligence'],
            ['name' => 'Virtual Deal Room', 'role' => 'Secure transaction workspace, documents, Q&A, analysis, negotiation, closing and audit evidence.', 'icon' => 'folder-lock', 'href' => '/project-advisory#deal-room'],
            ['name' => 'Agentic AI Council', 'role' => 'Specialised agents that route, draft, check, recommend and trigger approved workflows.', 'icon' => 'bot', 'href' => '/technology-solutions#agents'],
            ['name' => 'RPA and Workflow Automation', 'role' => 'Repeatable execution with credentials, exception queues and logs.', 'icon' => 'workflow', 'href' => '/technology-solutions#rpa'],
            ['name' => 'Zoho One Operating Backbone', 'role' => 'CRM, projects, documents, support, analytics, forms, workflows, identity and approved custom applications.', 'icon' => 'layers', 'href' => '/technology-solutions#zoho'],
            ['name' => 'Data Bank and RAG', 'role' => 'Governed country, sector, funding, project, product, risk and operating knowledge.', 'icon' => 'database', 'href' => '/resources#data-bank'],
            ['name' => 'Management Control Tower', 'role' => 'Executive, commercial, delivery, finance, risk, AI, RPA, AIIM, DD and VDR dashboards.', 'icon' => 'gauge', 'href' => '/portal'],
        ];
    }

    /** Canonical enterprise methodology — five phases. */
    public static function methodology(): array
    {
        return [
            [
                'number' => '01',
                'name' => 'Diagnose',
                'summary' => 'Understand the real challenge, context and desired outcomes.',
                'activities' => ['Stakeholder engagement', 'Current-state assessment', 'Problem framing', 'Data and information review'],
                'output' => 'Validated problem statement and opportunity framing.',
                'icon' => 'search',
            ],
            [
                'number' => '02',
                'name' => 'Select',
                'summary' => 'Choose the right strategic direction and approach.',
                'activities' => ['Option identification', 'Feasibility analysis', 'Prioritisation', 'Business case validation'],
                'output' => 'Approved strategy and engagement approach.',
                'icon' => 'list-checks',
            ],
            [
                'number' => '03',
                'name' => 'Collaborate',
                'summary' => 'Design the solution and align stakeholders for success.',
                'activities' => ['Solution design', 'Stakeholder alignment', 'Plan and resource definition', 'Validation and refinement'],
                'output' => 'Agreed solution design and implementation plan.',
                'icon' => 'handshake',
            ],
            [
                'number' => '04',
                'name' => 'Deliver',
                'summary' => 'Execute with discipline to deliver agreed outcomes.',
                'activities' => ['Implementation', 'Project management', 'Quality assurance', 'Change enablement'],
                'output' => 'Delivered outcomes and performance evidence.',
                'icon' => 'rocket',
            ],
            [
                'number' => '05',
                'name' => 'Scale',
                'summary' => 'Embed, optimise and expand sustainable impact.',
                'activities' => ['Impact measurement', 'Optimisation', 'Knowledge transfer', 'Scale and replication'],
                'output' => 'Sustained capability and scalable capability.',
                'icon' => 'trending-up',
            ],
        ];
    }

    /** Project Advisory sequence — eight service-level steps. */
    public static function advisorySequence(): array
    {
        return ['Discover', 'Analyse', 'Design', 'Validate', 'Package', 'Mobilise', 'Implement', 'Measure Impact'];
    }

    /** Section 2 — Non-negotiable architecture decisions. */
    public static function architectureDecisions(): array
    {
        return [
            ['decision' => 'One client truth', 'position' => 'Zoho CRM owns leads, contacts, accounts, deals, consent, country, language, currency, service history and risk flags.'],
            ['decision' => 'One accounting truth', 'position' => 'QuickBooks Online Plus owns invoices, receipts, refunds, accounting classes and reconciliation in Phase 1.'],
            ['decision' => 'One delivery truth', 'position' => 'Zoho Projects owns tasks, milestones, assigned owner, QA gate and delivery status.'],
            ['decision' => 'One ordinary document truth', 'position' => 'Zoho WorkDrive owns approved client folders, evidence packs, deliverables and versions outside the VDR boundary.'],
            ['decision' => 'One support truth', 'position' => 'Zoho Desk owns tickets, complaints, service levels and recovery history.'],
            ['decision' => 'One custom case layer', 'position' => 'Zoho Creator may own approved DD, AIIM or operational records that do not duplicate CRM, commerce, finance or portal masters.'],
            ['decision' => 'One integration control', 'position' => 'Native Zoho workflows are preferred for simple internal actions. n8n or approved APIs handle complex or external orchestration.'],
            ['decision' => 'Human leadership', 'position' => 'Humans approve high-risk Due Diligence, financial models, project advisory, regulated outputs and material exceptions.'],
        ];
    }

    /** Section 7 — System-of-record architecture. */
    public static function systemsOfRecord(): array
    {
        return [
            ['object' => 'Lead, Contact, Account, Deal and Consent', 'system' => 'Zoho CRM', 'rule' => 'No client route may bypass CRM.'],
            ['object' => 'Product Master', 'system' => 'Governed Product Register with CRM Product mapping', 'rule' => 'One product code must map across page, commerce, CRM, finance, portal and delivery.'],
            ['object' => 'Cart and Order', 'system' => 'Approved commerce platform', 'rule' => 'Commerce status wins until verified finance posting.'],
            ['object' => 'Payment Evidence', 'system' => 'Payment gateway plus commerce payment register', 'rule' => 'Signed gateway event and transaction ID are mandatory.'],
            ['object' => 'Invoice, Receipt and Refund', 'system' => 'QuickBooks Online Plus', 'rule' => 'QuickBooks wins for accounting transactions.'],
            ['object' => 'Delivery Task and Milestone', 'system' => 'Zoho Projects', 'rule' => 'Every paid or accepted service creates a delivery record.'],
            ['object' => 'Ordinary Client Document', 'system' => 'Zoho WorkDrive', 'rule' => 'Approved folder taxonomy, versioning and sharing rules apply.'],
            ['object' => 'Support Ticket', 'system' => 'Zoho Desk', 'rule' => 'Support may not exist only in email or WhatsApp.'],
            ['object' => 'Due Diligence Case', 'system' => 'Custom case application linked to CRM', 'rule' => 'Case ID, consent, vendor result, review and report status are authoritative.'],
            ['object' => 'AIIM Operational Record', 'system' => 'AIIM data store linked to CRM', 'rule' => 'Source, date, confidence, verification and publication status are mandatory.'],
            ['object' => 'Virtual Deal Room', 'system' => 'Dedicated VDR platform data and evidence store', 'rule' => 'Tenant, permission and deal evidence remain within the VDR boundary.'],
            ['object' => 'AI Output', 'system' => 'AI Prompt and QA Register', 'rule' => 'Model, prompt, source context, risk, reviewer and release status are mandatory.'],
            ['object' => 'Workflow and Bot Run', 'system' => 'Integration Hub and RPA logs', 'rule' => 'Every execution has an owner, correlation ID, result and exception route.'],
            ['object' => 'Curated KPI', 'system' => 'Analytics semantic layer', 'rule' => 'KPI must show formula, source, owner and refresh time.'],
        ];
    }

    /** Section 42 — governance framework presented publicly. */
    public static function governancePillars(): array
    {
        return [
            ['number' => 1, 'title' => 'AI Governance', 'body' => 'AI augments our people. Human authority remains for all material decisions. Our AI systems are tested, monitored and controlled.', 'icon' => 'cpu'],
            ['number' => 2, 'title' => 'Privacy & Consent', 'body' => 'We protect personal information in line with POPIA. Consent, individual rights and responsible data use are embedded in every process.', 'icon' => 'user-check'],
            ['number' => 3, 'title' => 'Compliance & Corrections', 'body' => 'We follow the law, our policies and professional standards. Material errors are corrected publicly and transparently.', 'icon' => 'file-check'],
            ['number' => 4, 'title' => 'Third-Party Governance', 'body' => 'We work with trusted partners under strict due diligence, contracts, performance monitoring and ethics expectations.', 'icon' => 'users'],
            ['number' => 5, 'title' => 'Professional Review', 'body' => 'Where judgement or regulated matters are involved, qualified professionals review and validation occurs.', 'icon' => 'user-star'],
            ['number' => 6, 'title' => 'Higher-Risk Work', 'body' => 'Complex, high-impact or regulated work follows additional approvals, higher assurance and staged delivery.', 'icon' => 'triangle-alert'],
            ['number' => 7, 'title' => 'Security Governance', 'body' => 'We apply strong access controls, encryption, secure systems and continuous monitoring across our platform.', 'icon' => 'lock'],
            ['number' => 8, 'title' => 'Access Governance', 'body' => 'Access is role-based, least-privilege and time-bound. We review, certify and revoke access routinely.', 'icon' => 'key'],
            ['number' => 9, 'title' => 'Policy Governance', 'body' => 'Our policies are approved by the Board, reviewed regularly and communicated across the organisation.', 'icon' => 'book-open'],
            ['number' => 10, 'title' => 'Auditability', 'body' => 'Decisions, approvals and changes are recorded. We maintain evidence trails for accountability and improvement.', 'icon' => 'bar-chart-3'],
        ];
    }

    /** Guiding principles — Our Story. */
    public static function principles(): array
    {
        return [
            ['title' => 'Integrity', 'body' => 'We do what is right. Always.', 'icon' => 'handshake'],
            ['title' => 'Excellence', 'body' => 'We pursue the highest standards in everything we do.', 'icon' => 'crown'],
            ['title' => 'Innovation', 'body' => 'We embrace technology and new ideas to create impact.', 'icon' => 'lightbulb'],
            ['title' => 'Collaboration', 'body' => 'We believe in partnerships that multiply value.', 'icon' => 'users'],
            ['title' => 'Accountability', 'body' => 'We own outcomes and deliver measurable results.', 'icon' => 'shield-check'],
            ['title' => 'Impact', 'body' => 'We exist to create sustainable change across Africa.', 'icon' => 'rocket'],
        ];
    }

    /** Section 33 — Agentic AI Council families and authority tiers. */
    public static function agentFamilies(): array
    {
        return [
            ['family' => 'Acquisition', 'agents' => 'Website Concierge, WhatsApp Intake, Lead Qualification, Diagnostic Scoring, Product Recommendation, Country, Language and Currency Routing.'],
            ['family' => 'Commercial', 'agents' => 'Checkout Assistance, Proposal Triage, CRM Data Quality, Renewal, Retention, Webinar Follow-Up and Client Success.'],
            ['family' => 'Delivery', 'agents' => 'Service Intake, Document Request, Folder, Project Task, Sprint Delivery, Business Plan, Market Research and SOP.'],
            ['family' => 'AIIM', 'agents' => 'Intent, Search, Country, Sector, Trade, Opportunity, Risk, Investor Matching, Report Drafting and Source QA.'],
            ['family' => 'Due Diligence', 'agents' => 'DD Intake, Evidence Review, Risk Summary, Partner Routing, Monitoring Alert and Report Drafting.'],
            ['family' => 'Virtual Deal Room', 'agents' => 'Document Intelligence, Financial Analysis, Valuation, Negotiation Strategy, Legal Review, Closing Checklist and Personal Assistant.'],
            ['family' => 'Governance', 'agents' => 'Translation, SEO, Support Triage, Dashboard Insight, Data Curation, Compliance Watch, AI QA, Error Monitoring and Management Briefing.'],
        ];
    }

    public static function agentTiers(): array
    {
        return [
            ['tier' => 1, 'action' => 'Read only', 'rule' => 'No system update.'],
            ['tier' => 2, 'action' => 'Draft only', 'rule' => 'Human review where required.'],
            ['tier' => 3, 'action' => 'Workflow trigger', 'rule' => 'Rule-based trigger with audit log.'],
            ['tier' => 4, 'action' => 'Controlled update', 'rule' => 'Limited fields and logged.'],
            ['tier' => 5, 'action' => 'Human approval required', 'rule' => 'No release or closure before approval.'],
            ['tier' => 6, 'action' => 'Prohibited', 'rule' => 'Refuse and route to qualified owner.'],
        ];
    }

    /** Section 39 — implementation waves. */
    public static function waves(): array
    {
        return [
            ['wave' => 'Wave 0', 'focus' => 'Governance and architecture', 'gate' => 'Approved architecture, field dictionaries and test strategy.'],
            ['wave' => 'Wave 1', 'focus' => 'Core platform launch', 'gate' => 'Paid order completes end to end and reconciles.'],
            ['wave' => 'Wave 2', 'focus' => 'AIIM and Due Diligence launch', 'gate' => 'Verified AIIM data and complete DD test cases pass.'],
            ['wave' => 'Wave 3', 'focus' => 'Enterprise operations', 'gate' => 'Enterprise role, review and bulk workflows pass.'],
            ['wave' => 'Wave 4', 'focus' => 'Virtual Deal Room', 'gate' => 'Transaction scenario passes security and evidence tests.'],
            ['wave' => 'Wave 5', 'focus' => 'Pan-African scale', 'gate' => 'Country readiness gate passed per market.'],
            ['wave' => 'Wave 6', 'focus' => 'Advanced intelligence and API', 'gate' => 'Data quality, entitlement, performance and support gates pass.'],
        ];
    }

    /** Section 37 — KPI dashboard and control tower catalogue. */
    public static function dashboards(): array
    {
        return [
            ['name' => 'Executive', 'metrics' => 'Revenue, conversion, delivery, risk, errors, client success and strategic alerts.'],
            ['name' => 'Sales and Marketing', 'metrics' => 'Sources, leads, scores, conversion, campaigns, webinars and pipeline.'],
            ['name' => 'Shop and Product', 'metrics' => 'Views, checkout, orders, revenue, refunds, entitlement and performance.'],
            ['name' => 'Subscriptions and Retainers', 'metrics' => 'MRR, renewal, churn, service use, SLA and account health.'],
            ['name' => 'AIIM', 'metrics' => 'Coverage, quality, user behaviour, reports, subscriptions, leads and data freshness.'],
            ['name' => 'Due Diligence', 'metrics' => 'Cases, SLA, risk, hits, review, vendor, revenue, monitoring and disputes.'],
            ['name' => 'Virtual Deal Room', 'metrics' => 'Deal stage, access, documents, Q&A, risks, offers, conditions and closing.'],
            ['name' => 'Delivery', 'metrics' => 'Tasks, milestones, workload, QA, overdue work, acceptance and CSAT.'],
            ['name' => 'Finance', 'metrics' => 'Orders, payments, invoices, refunds, currency, VAT and reconciliation.'],
            ['name' => 'AI', 'metrics' => 'Requests, tools, sources, risk, review, correction, incidents and cost.'],
            ['name' => 'RPA and Automation', 'metrics' => 'Runs, success, failures, retries, backlog, owner and recovery time.'],
            ['name' => 'Security and Risk', 'metrics' => 'Access, privilege, incidents, vulnerabilities, privacy, audit and overdue actions.'],
            ['name' => 'Data Bank', 'metrics' => 'Sources, freshness, quality, approval, RAG eligibility and usage.'],
        ];
    }

    /** Section 31 — Virtual Deal Room controlled transaction workflow. */
    public static function dealRoomStages(): array
    {
        return [
            'Deal creation and workspace configuration',
            'Seller secure onboarding',
            'Seller data room build and AI document intake',
            'Buyer qualification and NDA gate',
            'Controlled data room access',
            'Due Diligence and Q&A engine',
            'AI financial analysis and quality of earnings',
            'AI valuation and price bridge',
            'Negotiation preparation',
            'Live negotiation room',
            'Offer management and version control',
            'Legal documentation workflow',
            'Conditions precedent and closing control',
            'Signing, completion and archive',
            'Post-closing handover and integration',
        ];
    }
}
