<?php

namespace App\Support\Content;

/**
 * Section 5 — Front-End Page Template Standard.
 * Each route page carries problem, users, clusters, boundaries, FAQ and CTA.
 */
class Pages
{
    public static function get(string $key): array
    {
        $pages = self::all();

        return $pages[$key] ?? [];
    }

    public static function all(): array
    {
        return [

            'services' => [
                'title' => 'Services',
                'lead' => 'The Full Advisory Universe. One Operating System.',
                'intro' => 'TBCA delivers business and management consultancy through governed Sprints, advisory mandates, subscriptions and retainers. Every engagement follows one disciplined method and produces evidence you can take to a bank, a board or a regulator.',
                'aside' => [
                    'title' => 'How Services Are Delivered',
                    'body' => 'Every service maps to one product code across page, commerce, CRM, finance, portal and delivery. Nothing is delivered outside the controlled architecture.',
                    'items' => ['Fixed scope and turnaround', 'Named delivery owner', 'Quality gate before release', 'Portal delivery and evidence pack'],
                ],
                'clusters' => [
                    ['title' => 'Strategy and Funding', 'body' => 'Business planning, market research, financial modelling, valuation and funding readiness.', 'items' => ['Business Plan Development', 'Market Research and Feasibility', 'Financial Model and Valuation', 'Funding Readiness']],
                    ['title' => 'Project Advisory', 'body' => 'Concept, prefeasibility, feasibility, capital structuring and implementation oversight.', 'items' => ['Project concept and prefeasibility', 'Feasibility and business case', 'Capital raising support', 'Implementation oversight']],
                    ['title' => 'Governance and Risk', 'body' => 'Board architecture, policy, delegation, compliance calendars and risk registers.', 'items' => ['Corporate governance', 'Policy and delegation', 'Risk register design', 'Compliance calendar']],
                    ['title' => 'Technology and Automation', 'body' => 'AI agents, robotic process automation, integration and management dashboards.', 'items' => ['AI automation and transformation', 'Data and dashboard build', 'Workflow and integration design', 'Zoho One configuration']],
                    ['title' => 'Operations', 'body' => 'Process design, standard operating procedures, delivery factories and service levels.', 'items' => ['Process mapping', 'SOP development', 'Control points and owners', 'Delivery factory setup']],
                    ['title' => 'Africa Market Entry', 'body' => 'Country entry routes, regulatory pathways, partner shortlists and corridor logistics.', 'items' => ['Market entry brief', 'Regulatory and licensing route', 'Partner and channel shortlist', 'Corridor and logistics view']],
                ],
                'users' => ['Entrepreneurs and founders', 'Small and medium enterprises', 'Corporates and groups', 'Public sector and institutions', 'Investors and project sponsors'],
                'boundary' => 'TBCA provides advisory, intelligence, tools and execution support. We do not provide legal, tax, audit, financial or regulatory sign-off. Engagements requiring licensed professional authority are referred to qualified professionals.',
                'faq' => [
                    ['q' => 'How do I choose the right service?', 'a' => 'Start with a diagnostic. The Business Health Score assesses strategy, finance, operations and risk, then recommends the Sprint sequence that addresses the highest-priority gaps first.'],
                    ['q' => 'What is a Sprint?', 'a' => 'A Sprint is a fixed-scope, fixed-price engagement with a defined turnaround, named owner, quality gate and bankable deliverable. You buy it like a product and receive it through the client portal.'],
                    ['q' => 'Is the work AI generated?', 'a' => 'AI assists with analysis, drafting and automation inside defined boundaries. Material decisions and final outputs are made and approved by qualified people. Every AI-assisted output carries a review record.'],
                    ['q' => 'Can you work outside South Africa?', 'a' => 'Phase 1 is South Africa. The architecture is built for all 54 African countries and additional markets activate through the country readiness gate in Wave 5.'],
                ],
                'cta' => ['title' => 'Not sure which service you need?', 'body' => 'Start with a structured diagnostic and receive a recommended route within minutes.', 'primary' => ['label' => 'Start Diagnostic', 'href' => '/diagnostics'], 'secondary' => ['label' => 'Request Consultation', 'href' => '/contact']],
            ],

            'marketplace' => [
                'title' => 'Marketplace',
                'lead' => 'Controlled Analyst and Specialist Delivery.',
                'intro' => 'The Marketplace coordinates approved analysts, specialists and delivery partners inside TBCA governance. Clients submit a brief. TBCA scopes, assigns, quality-assures and delivers. Providers work to a controlled standard and a named owner remains accountable throughout.',
                'aside' => [
                    'title' => 'Why It Is Governed',
                    'body' => 'Marketplace work enters the same delivery factory as internal work: one product code, one task template, one quality gate, one portal delivery.',
                    'items' => ['Approved provider register', 'Conflict and scope screening', 'TBCA quality assurance', 'Single accountable owner'],
                ],
                'clusters' => [
                    ['title' => 'For Clients', 'body' => 'Submit a brief and receive a scoped proposal with a named owner and service level.', 'items' => ['Submit a structured brief', 'Receive scope and pricing', 'Track delivery in the portal', 'Accept against defined criteria']],
                    ['title' => 'For Providers', 'body' => 'Join the approved provider register and receive assigned, scoped work.', 'items' => ['Capability and evidence submission', 'Due diligence and onboarding', 'Assignment against approved scope', 'Performance and quality record']],
                ],
                'users' => ['Clients needing specialist capacity', 'Approved analysts and consultants', 'Sector and country specialists', 'Qualified professional reviewers'],
                'boundary' => 'Marketplace providers deliver within TBCA scope and governance. They do not contract directly with clients through the platform and do not issue regulated professional opinions unless separately qualified and appointed.',
                'faq' => [
                    ['q' => 'Who owns the client relationship?', 'a' => 'TBCA does. A named TBCA owner remains accountable for scope, quality and delivery regardless of who performs the work.'],
                    ['q' => 'How are providers screened?', 'a' => 'Providers complete capability submission, due diligence and onboarding before entering the approved register. Conflict and scope screening runs on every assignment.'],
                ],
                'cta' => ['title' => 'Have a brief or capacity to offer?', 'body' => 'Submit a brief for scoping, or apply to join the approved provider register.', 'primary' => ['label' => 'Submit Brief', 'href' => '/contact'], 'secondary' => ['label' => 'Join Marketplace', 'href' => '/contact']],
            ],

            'partner-services' => [
                'title' => 'Partner Services',
                'lead' => 'Regulated and Specialist Work, Correctly Routed.',
                'intro' => 'Some work requires licensed professional authority. Partner Services routes legal, tax, audit, assurance, credit, engineering and other regulated matters to qualified professionals under controlled scope, conflict screening and evidence handling.',
                'aside' => [
                    'title' => 'Where Professional Authority Applies',
                    'body' => 'TBCA prepares, structures and supports. Qualified professionals review, opine and sign where the law or the standard requires it.',
                    'items' => ['Conflict and scope approval', 'Controlled review pack', 'Named qualified reviewer', 'Professional boundary note on every output'],
                ],
                'clusters' => [
                    ['title' => 'Legal and Compliance', 'body' => 'Corporate, commercial, regulatory and transaction legal review.', 'items' => ['Entity and structure review', 'Contract and transaction documents', 'Regulatory opinion', 'Compliance validation']],
                    ['title' => 'Financial and Assurance', 'body' => 'Audit, assurance, tax and credit review by qualified practitioners.', 'items' => ['Audit and assurance', 'Tax structuring and opinion', 'Credit and lending review', 'Valuation sign-off']],
                    ['title' => 'Technical and Sector', 'body' => 'Engineering, environmental, ESG and sector technical review.', 'items' => ['Technical feasibility review', 'Environmental and social assessment', 'ESG validation', 'Sector specialist opinion']],
                ],
                'users' => ['Clients with regulated requirements', 'Lenders and investors requiring opinions', 'Public sector and institutional buyers', 'Project sponsors at financial close'],
                'boundary' => 'TBCA does not provide legal, tax, audit, financial or regulatory sign-off. Where an engagement requires licensed professional authority, TBCA prepares the controlled review pack and refers the matter to a qualified professional who acts under their own mandate.',
                'faq' => [
                    ['q' => 'Does TBCA sign off regulated opinions?', 'a' => 'No. TBCA prepares and structures the work. A qualified professional reviews and signs under their own professional mandate and liability.'],
                    ['q' => 'How is conflict managed?', 'a' => 'Every partner assignment runs conflict and scope screening before the review pack is released. Assignments that fail screening are reassigned.'],
                ],
                'cta' => ['title' => 'Need a qualified professional review?', 'body' => 'Tell us the matter and the required standard. We will scope the review and route it correctly.', 'primary' => ['label' => 'Request Partner Review', 'href' => '/contact'], 'secondary' => ['label' => 'View Boundaries', 'href' => '/about/governance']],
            ],

            'technology-solutions' => [
                'title' => 'Technology Solutions',
                'lead' => 'AI Agents, Automation, Integration and Business Intelligence.',
                'intro' => 'TBCA implements the operating architecture we run ourselves: a governed CRM and delivery backbone, AI agents under authority tiers, robotic process automation with exception queues, controlled integrations and management dashboards with named metric owners.',
                'aside' => [
                    'title' => 'Integration Doctrine',
                    'body' => 'Use the lowest-risk integration that works. Native workflows first. Orchestration platforms or approved APIs for complex or external flows.',
                    'items' => ['Idempotent event handling', 'Correlation ID on every run', 'Exception queue with named owner', 'Secrets in an approved vault'],
                ],
                'clusters' => [
                    ['title' => 'Operating Backbone', 'body' => 'CRM, projects, documents, support, analytics, forms, workflows and identity configuration.', 'items' => ['CRM design and data contracts', 'Delivery factory templates', 'Document taxonomy and retention', 'Support desk and service levels']],
                    ['title' => 'AI Agents and Automation', 'body' => 'Agent families under authority tiers, with prompt versioning and QA registers.', 'items' => ['Agent design and tiering', 'Prompt and QA register', 'Human review gates', 'Output audit trail']],
                    ['title' => 'Robotic Process Automation', 'body' => 'Bots for repeatable execution with credentials, logs and exception routes.', 'items' => ['Bot design and vault setup', 'Run logs and retries', 'Exception queue design', 'Recovery runbooks']],
                    ['title' => 'Business Intelligence', 'body' => 'Semantic layer, curated KPIs, dashboards and refresh governance.', 'items' => ['KPI definition register', 'Semantic layer build', 'Executive and operational dashboards', 'Refresh and owner schedule']],
                ],
                'users' => ['Digital transformation buyers', 'Operations and finance leaders', 'Groups consolidating systems', 'Institutions requiring auditability'],
                'boundary' => 'Technology implementations are governed by approved architecture, data contracts and change control. Material decisions on business rules and data ownership remain with the client.',
                'faq' => [
                    ['q' => 'Do AI agents make decisions?', 'a' => 'No. Agents operate under authority tiers from read-only through to human-approval-required. Regulated conclusions, approvals, permission changes and payment authorisation are prohibited actions.'],
                    ['q' => 'What happens when an automation fails?', 'a' => 'Every run has an owner, a correlation ID, a result and an exception route. Failures enter a queue with a named owner rather than disappearing silently.'],
                ],
                'cta' => ['title' => 'Ready to automate with control?', 'body' => 'Book a discovery session and we will map your processes, systems and automation candidates.', 'primary' => ['label' => 'Request Setup', 'href' => '/contact'], 'secondary' => ['label' => 'Book Discovery', 'href' => '/contact']],
            ],

            'diagnostics' => [
                'title' => 'Diagnostics',
                'lead' => 'Structured Need. Recommended Route. Measurable Score.',
                'intro' => 'Diagnostics capture structured need and recommend the next step. Each diagnostic produces a score, a prioritised gap register and a recommended Sprint sequence, then creates a record so your route is tracked rather than forgotten.',
                'aside' => [
                    'title' => 'What a Diagnostic Produces',
                    'body' => 'A scored assessment, a ranked gap register and a recommended sequence of Sprints or advisory work.',
                    'items' => ['Scored assessment across domains', 'Ranked priority gaps', 'Recommended Sprint sequence', 'Saved record in your portal'],
                ],
                'clusters' => [
                    ['title' => 'Business Health Score', 'body' => 'Strategy, finance, operations, governance and risk assessed in one structured pass.', 'items' => ['Strategy and market position', 'Financial health and funding readiness', 'Operations and delivery capacity', 'Governance and risk maturity']],
                    ['title' => 'Funding Readiness Check', 'body' => 'Assess whether your evidence pack meets lender and investor expectations.', 'items' => ['Financial evidence completeness', 'Governance and compliance readiness', 'Plan and model quality', 'Gap remediation priorities']],
                    ['title' => 'Automation Readiness Check', 'body' => 'Identify which processes are ready for agents, automation or integration.', 'items' => ['Process repeatability', 'Data quality and availability', 'System and integration readiness', 'Control and exception design']],
                ],
                'users' => ['First-time enquirers', 'Businesses preparing to raise funding', 'Operators planning automation', 'Advisors scoping a mandate'],
                'boundary' => 'A diagnostic is a structured assessment, not an audit, credit opinion or regulatory determination. It informs the route and does not replace professional review.',
                'faq' => [
                    ['q' => 'How long does a diagnostic take?', 'a' => 'The online assessment takes a few minutes. A reviewed diagnostic with written commentary is delivered as a Sprint within three to five working days.'],
                    ['q' => 'What happens to my answers?', 'a' => 'Your responses create a record linked to your contact under consent. They are used to recommend a route and are governed by our privacy and retention rules.'],
                ],
                'cta' => ['title' => 'Start with the Business Health Score', 'body' => 'Answer a structured set of questions and receive a scored route recommendation.', 'primary' => ['label' => 'Start Diagnostic', 'href' => '/contact'], 'secondary' => ['label' => 'View Scores', 'href' => '/portal']],
            ],

            'project-advisory' => [
                'title' => 'Project Advisory',
                'lead' => 'Concept. Feasibility. Financing. Implementation.',
                'intro' => 'Project Advisory takes an idea through concept, prefeasibility, feasibility, structuring, capital raising and implementation oversight. Work runs under non-disclosure, with a controlled data room, a risk register and senior human approval at every material gate.',
                'aside' => [
                    'title' => 'Controlled From the Start',
                    'body' => 'Project mandates open a deal record, a project case, an NDA workflow and a controlled document boundary.',
                    'items' => ['NDA gate before disclosure', 'Controlled data room', 'Risk register maintained throughout', 'Senior approval on material outputs'],
                ],
                'clusters' => [
                    ['title' => 'Concept and Prefeasibility', 'body' => 'Turn an idea into a structured, fundable concept.', 'items' => ['Concept note', 'Prefeasibility assessment', 'Indicative capital structure', 'Stakeholder map']],
                    ['title' => 'Feasibility and Business Case', 'body' => 'Commercial, technical, financial, legal and ESG assessment.', 'items' => ['Demand and revenue assessment', 'Technical and delivery review', 'Financial model and returns', 'Risk and mitigation register']],
                    ['title' => 'Capital and Financial Close', 'body' => 'Structuring, lender and investor engagement and condition management.', 'items' => ['Capital structuring', 'Lender and investor pack', 'Conditions precedent tracking', 'Financial close support']],
                    ['title' => 'Implementation Oversight', 'body' => 'Governance, reporting and delivery assurance after close.', 'items' => ['Implementation governance', 'Milestone and disbursement tracking', 'Performance reporting', 'Post-implementation review']],
                ],
                'users' => ['Project sponsors and developers', 'Public sector and state-owned entities', 'Development finance institutions', 'Private investors and funds'],
                'boundary' => 'TBCA structures, prepares and coordinates. Legal, tax, engineering and assurance opinions are issued by qualified professionals appointed under their own mandate.',
                'faq' => [
                    ['q' => 'What is the Virtual Deal Room?', 'a' => 'A secure transaction workspace for documents, Q&A, analysis, negotiation, offers, conditions precedent, signing and closing evidence. It is a distinct high-security boundary, not an ordinary document folder.'],
                    ['q' => 'When does an NDA apply?', 'a' => 'Before any controlled disclosure. Buyer or counterparty qualification and the NDA gate precede data room access.'],
                ],
                'cta' => ['title' => 'Have a project to develop or finance?', 'body' => 'Request a discovery session. We will assess stage, gaps and the route to a fundable position.', 'primary' => ['label' => 'Request Discovery', 'href' => '/contact'], 'secondary' => ['label' => 'Open Data Room', 'href' => '/portal']],
            ],

            'countries' => [
                'title' => 'Countries',
                'lead' => 'One Architecture. Fifty-Four Countries. Activated by Readiness.',
                'intro' => 'TBCA operates one canonical country model across Africa. Markets activate progressively through a country readiness gate covering verified data, language, currency, payment routes, regulatory position and delivery capacity.',
                'aside' => [
                    'title' => 'Country Readiness Gate',
                    'body' => 'A market goes live only when data, language, currency, payments, compliance and delivery capacity all pass.',
                    'items' => ['Verified country data pack', 'Approved language and currency', 'Payment and invoicing route', 'Delivery and support capacity'],
                ],
                'users' => ['Country-focused investors and traders', 'Businesses planning market entry', 'Institutions operating regionally'],
                'boundary' => 'Country information reflects verified sources at the stated date. It is not legal, tax or regulatory advice for a specific transaction.',
                'faq' => [
                    ['q' => 'Which markets are live now?', 'a' => 'Phase 1 is South Africa, with English and Afrikaans, ZAR and USD. Additional country packs activate in Wave 5 as each passes the readiness gate.'],
                    ['q' => 'Can I get intelligence on a market that is not yet live?', 'a' => 'Yes. AIIM covers all 54 countries under one data model. Unverified records are clearly labelled and routed to human verification before premium use.'],
                ],
                'cta' => ['title' => 'Planning entry into an African market?', 'body' => 'Explore country intelligence in AIIM or request a market entry brief.', 'primary' => ['label' => 'Explore AIIM', 'href' => '/aiim'], 'secondary' => ['label' => 'Compare Countries', 'href' => '/aiim/compare']],
            ],

            'industries' => [
                'title' => 'Industries',
                'lead' => 'Sector Intelligence and Sector-Specific Delivery.',
                'intro' => 'Each sector carries its own demand drivers, constraints, regulatory pathway and capital structure. TBCA combines AIIM sector intelligence with advisory, products and project routes designed for how that sector actually works.',
                'aside' => [
                    'title' => 'Sector Data Standard',
                    'body' => 'At least 30 sectors per country and at least 80 fields per sector, each carrying source, date and confidence.',
                    'items' => ['Demand and market structure', 'Constraints and bottlenecks', 'Players and relationships', 'Opportunity pipeline'],
                ],
                'users' => ['Sector investors and operators', 'Trade and export businesses', 'Development partners and funders'],
                'boundary' => 'Sector intelligence supports decision preparation. Transaction decisions require verification against primary sources and, where relevant, professional review.',
                'faq' => [
                    ['q' => 'How current is sector data?', 'a' => 'Every record carries a publication date, an extraction date, a confidence grade and a next review date. Records past review are refreshed or retired.'],
                    ['q' => 'Can I get a sector view across several countries?', 'a' => 'Yes. The Sector Opportunity Assessment compares one sector across up to five countries using consistent metrics.'],
                ],
                'cta' => ['title' => 'Looking at a specific sector?', 'body' => 'Open sector intelligence in AIIM or request a sector opportunity assessment.', 'primary' => ['label' => 'Explore Sectors', 'href' => '/aiim'], 'secondary' => ['label' => 'View Opportunities', 'href' => '/aiim/store'],
                ],
            ],

            'resources' => [
                'title' => 'Resources',
                'lead' => 'Authoritative Content. Practical Tools. Governed Knowledge.',
                'intro' => 'Guides, reports, templates, calculators and the governed knowledge that sits behind our advisory work. Everything published here carries an owner, a date and a review cycle.',
                'aside' => [
                    'title' => 'Data Bank and RAG Governance',
                    'body' => 'Knowledge used by our agents is governed: sources are approved and dated, eligibility is explicit and confidential material is excluded from general retrieval.',
                    'items' => ['Approved source and date', 'Quality score and owner', 'Explicit RAG eligibility', 'Confidential content excluded'],
                ],
                'clusters' => [
                    ['title' => 'Guides and Reports', 'body' => 'Structured guidance on funding, governance, market entry and automation.', 'items' => ['Funding readiness guide', 'Governance essentials', 'Africa market entry guide', 'Automation adoption guide']],
                    ['title' => 'Templates and Tools', 'body' => 'Working templates, calculators and checklists used in real engagements.', 'items' => ['Business plan template pack', 'Financial model toolkit', 'Procurement DD pack', 'Governance policy library']],
                    ['title' => 'Data Bank', 'body' => 'Governed country, sector, funding, project and operating knowledge.', 'items' => ['Country intelligence', 'Sector intelligence', 'Funding intelligence', 'Project lessons']],
                ],
                'users' => ['Researchers and analysts', 'Business owners and operators', 'Advisors and professionals'],
                'boundary' => 'Published resources are general guidance. They do not constitute advice for a specific business, transaction or jurisdiction.',
                'faq' => [
                    ['q' => 'Are resources free?', 'a' => 'Guides and selected tools are free. Premium templates, toolkits and intelligence briefs are sold through the shop and AIIM store.'],
                    ['q' => 'How often is content reviewed?', 'a' => 'Each item carries an owner and a review cycle. Items past review are refreshed, superseded or withdrawn with the reason preserved.'],
                ],
                'cta' => ['title' => 'Want the practical version?', 'body' => 'Download a guide, or run a diagnostic and get a route specific to your business.', 'primary' => ['label' => 'Download Guide', 'href' => '/contact'], 'secondary' => ['label' => 'Start Diagnostic', 'href' => '/diagnostics']],
            ],

            'kp-thought-leadership' => [
                'title' => 'KP Thought Leadership',
                'lead' => 'Founder Insight on AI, Capital and African Enterprise.',
                'intro' => 'Kruger Phiri writes on artificial intelligence, automation, capital mobilisation, project development and the future of African business. The purpose is to educate, sharpen decisions and route serious operators to the right next step.',
                'aside' => [
                    'title' => 'About the Author',
                    'body' => 'Kruger Phiri, FCCA, is Founder and Managing Partner of The Business Clinic.Africa, with more than two decades of entrepreneurial leadership across business advisory, capital mobilisation, project development and digital transformation.',
                    'items' => ['Strategy and business advisory', 'Capital mobilisation and funding strategy', 'Project development and PPP structuring', 'AI strategy and intelligent systems'],
                ],
                'clusters' => [
                    ['title' => 'AI and Automation', 'body' => 'How African businesses should adopt agents and automation without losing control.', 'items' => ['Agent authority and human review', 'Automation without fragility', 'Data governance as a precondition']],
                    ['title' => 'Capital and Project Development', 'body' => 'What actually makes an African project fundable.', 'items' => ['Bankability fundamentals', 'Sponsor credibility', 'Conditions precedent discipline']],
                    ['title' => 'Enterprise Building', 'body' => 'Governance, operating systems and scale for growing African enterprises.', 'items' => ['Operating system thinking', 'Governance before growth', 'Measurement and accountability']],
                ],
                'users' => ['Executives and founders', 'Investors and funders', 'Public sector leaders'],
                'boundary' => 'Published insight reflects the author\'s professional view. It is not advice for a specific business, transaction or jurisdiction.',
                'faq' => [
                    ['q' => 'Can I invite Kruger to speak?', 'a' => 'Yes. Speaking, panel and executive session requests are handled through the contact route with topic, audience and date.'],
                ],
                'cta' => ['title' => 'Want to go deeper?', 'body' => 'Book an executive session or subscribe to receive new insight as it publishes.', 'primary' => ['label' => 'Read Insight', 'href' => '/resources'], 'secondary' => ['label' => 'Book Session', 'href' => '/contact']],
            ],

            'webinars' => [
                'title' => 'Webinars',
                'lead' => 'Education That Leads to a Decision.',
                'intro' => 'Live and recorded sessions on funding, governance, automation, market entry and due diligence. Each session carries a practical takeaway, a tool or template, and a clear next step.',
                'aside' => [
                    'title' => 'How Sessions Run',
                    'body' => 'Registration, reminder, live session, recording and follow-up all run through the controlled platform so nothing is lost.',
                    'items' => ['Registration and confirmation', 'Reminder and joining detail', 'Recording and materials', 'Structured follow-up'],
                ],
                'clusters' => [
                    ['title' => 'Funding and Capital', 'body' => 'What lenders and investors actually assess.', 'items' => ['Funding readiness essentials', 'Building a credible financial model', 'Preparing for due diligence']],
                    ['title' => 'AI and Automation', 'body' => 'Practical adoption with governance in place.', 'items' => ['Agents in the real business', 'Automating without breaking controls', 'Dashboards that get used']],
                    ['title' => 'Africa Market Entry', 'body' => 'Entering a new African market with evidence.', 'items' => ['Country readiness assessment', 'Regulatory and licensing routes', 'Partner selection and screening']],
                ],
                'users' => ['Business owners and operators', 'Finance and strategy teams', 'Advisors and institutional staff'],
                'boundary' => 'Webinar content is general education. It does not constitute advice for a specific business or transaction.',
                'faq' => [
                    ['q' => 'Are recordings available?', 'a' => 'Yes. Registered attendees receive the recording and materials. Selected replays are published in the resource library.'],
                ],
                'cta' => ['title' => 'Join the next session', 'body' => 'Register for an upcoming webinar or request a replay of a past session.', 'primary' => ['label' => 'Register', 'href' => '/contact'], 'secondary' => ['label' => 'View Replay', 'href' => '/resources']],
            ],

            'contact' => [
                'title' => 'Contact',
                'lead' => 'Talk to TBCA.',
                'intro' => 'Every enquiry creates a record with an owner, a route and a response commitment. Choose the channel that suits you and we will route it to the right desk.',
                'aside' => [
                    'title' => 'What Happens Next',
                    'body' => 'Your enquiry is recorded, routed and assigned. You receive confirmation, then a response from a named owner.',
                    'items' => ['Recorded against your contact', 'Routed to the correct desk', 'Named owner assigned', 'Response commitment confirmed'],
                ],
                'users' => ['Prospective clients', 'Existing clients and partners', 'Media and institutional enquiries'],
                'boundary' => 'Please do not send sensitive personal information, due diligence results or confidential deal documents through public channels. Use the client portal for confidential material.',
                'faq' => [
                    ['q' => 'How quickly will I hear back?', 'a' => 'General enquiries are acknowledged the same working day and answered within two working days. Support tickets follow the service level attached to your plan.'],
                    ['q' => 'Can I get support over WhatsApp?', 'a' => 'Yes, for general assistance and notifications. Sensitive results and reports are only delivered through the secure client portal.'],
                ],
                'cta' => ['title' => 'Prefer to talk it through?', 'body' => 'Book a discovery call, or continue the conversation on WhatsApp.', 'primary' => ['label' => 'Book Discovery Call', 'href' => '/contact'], 'secondary' => ['label' => 'Continue on WhatsApp', 'href' => '/contact']],
            ],

        ];
    }
}
