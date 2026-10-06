<?php

namespace App\Support\About;

/**
 * Controlled copy registers for the About / Trust static surfaces
 * (boundaries, AI disclosure, privacy, terms, trust centre, candidate privacy ...).
 */
class Copy
{
    public static function boundaries(): array
    {
        return [
            'nav' => [
                ['key' => 'overview', 'label' => 'Our Boundaries', 'icon' => 'shield-check'],
                ['key' => 'do', 'label' => 'What We Do', 'icon' => 'circle-check'],
                ['key' => 'dont', 'label' => 'What We Do Not Do', 'icon' => 'triangle-alert'],
                ['key' => 'who', 'label' => 'Who We Work With', 'icon' => 'users'],
                ['key' => 'partners', 'label' => 'Use of Partners', 'icon' => 'handshake'],
                ['key' => 'conflicts', 'label' => 'Conflict of Interest', 'icon' => 'scale'],
                ['key' => 'client', 'label' => 'Client Responsibilities', 'icon' => 'clipboard-check'],
                ['key' => 'escalation', 'label' => 'Escalation & Referrals', 'icon' => 'workflow'],
                ['key' => 'policies', 'label' => 'Related Policies', 'icon' => 'file-text'],
            ],
            'do' => [
                'Project structuring and preparation',
                'Market, sector and feasibility analysis',
                'Capital mobilisation advisory',
                'PPP structuring and transaction support',
                'AI-enabled data, insights and decision support',
                'Governance, risk and compliance advisory',
                'Stakeholder engagement facilitation',
            ],
            'dont' => [
                'Legal advice or representation',
                'Tax advice or tax compliance services',
                'Auditing or assurance services',
                'Investment advice or portfolio management',
                'Brokerage or securities dealing',
                'Banking or deposit-taking activities',
                'Insurance advice or underwriting',
            ],
            'protect' => [
                ['icon' => 'target', 'text' => 'We operate within our areas of competence.'],
                ['icon' => 'user-check', 'text' => 'We engage qualified partners for specialist services.'],
                ['icon' => 'scale', 'text' => 'We maintain independence and objectivity.'],
                ['icon' => 'file-check', 'text' => 'We disclose conflicts and obtain informed consent.'],
                ['icon' => 'handshake', 'text' => 'We act with integrity, transparency and care.'],
            ],
            'sections' => [
                'who' => ['title' => 'Who We Work With', 'body' => 'Entrepreneurs, SMEs, corporates, investors, development finance institutions and public-sector bodies across Africa. Every engagement starts with a defined scope and named accountable owner.'],
                'partners' => ['title' => 'Use of Partners', 'body' => 'Where an engagement needs a reserved or regulated conclusion, we route that work to an appropriately qualified, independent professional. Partner involvement is disclosed to the client before work starts.'],
                'conflicts' => ['title' => 'Conflict of Interest', 'body' => 'Every engagement is screened for conflicts. Conflicts are disclosed, and work proceeds only with informed consent or is declined.'],
                'client' => ['title' => 'Client Responsibilities', 'body' => 'Clients provide accurate information, make their own final decisions and obtain independent professional advice where a regulated conclusion is required.'],
                'escalation' => ['title' => 'Escalation & Referrals', 'body' => 'GREEN: general preparation and decision support proceeds within scope. AMBER: matters touching a regulated domain display a limitation and require human review. RED: requests for a reserved professional conclusion are blocked and routed to a qualified professional.'],
                'policies' => ['title' => 'Related Policies', 'body' => 'Professional Boundary Policy · Conflict of Interest Policy · AI Disclosure Policy · Terms of Service · Complaints Policy.'],
            ],
            'matrix' => [
                ['area' => 'Legal', 'may' => 'Templates, issue lists, contract registers, evidence collation, negotiation points', 'qualified' => 'Legal opinions, enforceability advice, litigation and final legal sign-off'],
                ['area' => 'Tax', 'may' => 'Calendars, evidence packs, basic education, draft correspondence', 'qualified' => 'Tax advice, filing, tax opinions and representation'],
                ['area' => 'Audit and accounting', 'may' => 'Audit readiness, internal checklists, management reporting', 'qualified' => 'Statutory audit, assurance and formal sign-off'],
                ['area' => 'Investment and credit', 'may' => 'Readiness packs, data rooms, risk screens, decision support', 'qualified' => 'Regulated investment advice and credit decisions'],
                ['area' => 'Employment', 'may' => 'HR templates, policy packs, issue spotting', 'qualified' => 'Labour-law advice and disputes'],
                ['area' => 'Engineering and environmental', 'may' => 'Project evidence packs, ESG screens, readiness checklists', 'qualified' => 'Engineering certification, EIA and technical sign-off'],
                ['area' => 'Procurement and PPP', 'may' => 'Checklists, data rooms, risk registers, process support', 'qualified' => 'Public-procurement legal advice and regulated sign-off'],
            ],
        ];
    }

    public static function aiDisclosure(): array
    {
        return [
            ['title' => '1. How We Use AI', 'icon' => 'cpu', 'tone' => 'purple', 'body' => 'AI is used to support, not replace, our experts. Typical uses include:', 'items' => ['Research and data synthesis', 'Document drafting and summarisation', 'Translation and localisation support', 'Quality assurance and anomaly detection', 'Process automation and analytics'], 'link' => ['label' => 'View Use Cases', 'href' => '/about/ai-disclosure/notice']],
            ['title' => '2. Human Oversight', 'icon' => 'file-search', 'tone' => 'green', 'body' => 'All AI-generated outputs are reviewed, edited and approved by qualified professionals.', 'items' => ['Human-in-the-loop review', 'Expert validation and sign-off', 'Contextual accuracy checks', 'Final responsibility remains with our professionals'], 'link' => ['label' => 'Our Review Process', 'href' => '/about/methodology']],
            ['title' => '3. Data & Privacy', 'icon' => 'lock', 'tone' => 'blue', 'body' => 'We protect your information and comply with applicable data protection laws.', 'items' => ['No client data used to train public models', 'Secure and encrypted processing', 'Data minimisation by design', 'POPIA-aligned practices'], 'link' => ['label' => 'Privacy & Data Protection', 'href' => '/privacy']],
            ['title' => '4. Accuracy & Limitations', 'icon' => 'scale', 'tone' => 'orange', 'body' => 'AI can make mistakes. We are clear about its limits.', 'items' => ['Outputs are probabilistic, not absolute', 'May reflect training data biases', 'Not legal, tax, investment or regulated advice', 'Verify critical information before decision-making'], 'link' => ['label' => 'Understand the Limitations', 'href' => '/about/professional-limitation-notice']],
            ['title' => '5. Models & Tools', 'icon' => 'network', 'tone' => 'green', 'body' => 'We use trusted AI models and tools under strict governance.', 'items' => ['Enterprise-grade providers', 'Regular model and tool reviews', 'Approved use-list and controls', 'No unauthorised AI tools'], 'link' => ['label' => 'Approved AI Tools', 'href' => '/about/ai-disclosure/notice']],
            ['title' => '6. Evolving Responsibility', 'icon' => 'file-text', 'tone' => 'purple', 'body' => 'We continuously improve our AI practices and disclosures.', 'items' => ['Ongoing monitoring and updates', 'Feedback and incident reporting', 'Continuous training for our teams', 'Public disclosure of material changes'], 'link' => ['label' => 'Report Feedback', 'href' => '/about/corrections#concern']],
        ];
    }

    public static function aiNotice(): array
    {
        return [
            'banner' => 'AI assisted with organisation and analysis. Material conclusions remain subject to the stated human or qualified review control.',
            'rows' => [
                ['icon' => 'network', 'label' => 'AI role', 'value' => 'Organisation, summarisation, pattern support', 'chip' => null, 'tone' => null],
                ['icon' => 'user', 'label' => 'Human-review state', 'value' => 'Human review required before publication', 'chip' => 'Human Review Required', 'tone' => 'neutral'],
                ['icon' => 'database', 'label' => 'Source state', 'value' => 'Based on controlled internal and approved source records', 'chip' => 'Controlled Sources', 'tone' => 'neutral'],
                ['icon' => 'shield', 'label' => 'Risk class', 'value' => 'Moderate informational support', 'chip' => 'Moderate Risk', 'tone' => 'warn'],
                ['icon' => 'user-check', 'label' => 'Qualified-review requirement', 'value' => 'Required when reserved or regulated conclusions arise', 'chip' => 'Qualified Review Required', 'tone' => 'neutral'],
                ['icon' => 'calendar', 'label' => 'Last reviewed', 'value' => 'Current as at approved review date', 'chip' => 'Current', 'tone' => 'good'],
            ],
            'rules' => [
                ['icon' => 'pencil', 'title' => 'AI proposes', 'body' => 'AI may suggest and structure information.'],
                ['icon' => 'workflow', 'title' => 'Automation executes controlled tasks', 'body' => 'Systems handle repeatable, non-discretionary actions.'],
                ['icon' => 'users', 'title' => 'Humans approve material decisions', 'body' => 'Accountable humans review and approve before release.'],
                ['icon' => 'award', 'title' => 'Qualified professionals provide reserved conclusions', 'body' => 'Use qualified review when regulated or reserved matters are present.'],
                ['icon' => 'triangle-alert', 'title' => 'Do not portray AI assistance as professional approval', 'body' => 'AI is a tool, not an authority or signatory.'],
            ],
            'guidance' => [
                ['icon' => 'megaphone', 'title' => 'What this notice communicates', 'body' => 'It explains how AI was used, the source and review state, the risk class and required controls.'],
                ['icon' => 'calendar', 'title' => 'When it must appear', 'body' => 'Use this notice wherever AI assistance informs internal or external content, analysis or advice.'],
                ['icon' => 'sparkles', 'title' => 'What AI may assist with', 'body' => 'Organisation, summarisation, pattern support, data structuring and controlled insight generation.'],
                ['icon' => 'shield-alert', 'title' => 'What AI may not approve', 'body' => 'AI does not approve, certify or assume responsibility for decisions, opinions or professional conclusions.'],
                ['icon' => 'file-check', 'title' => 'Evidence & risk clarity', 'body' => 'Evidence status and risk class must use only on-colour above. Icon and text labels must always be present.'],
            ],
        ];
    }

    public static function privacy(): array
    {
        return [
            'updated' => '2025-05-18',
            'cards' => [
                ['title' => '1. Information We Collect', 'icon' => 'shield-check', 'tone' => 'blue', 'body' => 'We collect personal information you provide to us directly, information we obtain automatically when you use our services, and information from third parties where permitted by law.', 'detail' => ['Identity and contact details (name, email, phone, organisation)', 'Account, order and engagement records', 'Device, log and cookie data when you use our platforms', 'Information from referrers or public registers where lawful']],
                ['title' => '2. How We Use Your Information', 'icon' => 'target', 'tone' => 'green', 'body' => 'We use your information to deliver our services, communicate with you, personalise your experience, improve our offering, ensure security and comply with legal obligations.', 'detail' => ['Delivering diagnostics, advisory and digital products', 'Billing, payments and support', 'Security monitoring and fraud prevention', 'Meeting legal and regulatory obligations']],
                ['title' => '3. How We Protect Your Information', 'icon' => 'lock', 'tone' => 'purple', 'body' => 'We implement appropriate technical, physical and organisational measures to safeguard your personal information from unauthorised access, loss or misuse.', 'detail' => ['ISO/IEC 27001 certified information security management', 'Encryption in transit and at rest', 'Role-based, least-privilege access with routine review']],
                ['title' => '4. Your Rights', 'icon' => 'user', 'tone' => 'orange', 'body' => 'You have the right to access, correct, update, object to processing, restrict processing and request deletion of your personal information in certain circumstances.', 'detail' => ['Request a copy of your information', 'Correct inaccurate information', 'Object to direct marketing at any time', 'Lodge a complaint with the Information Regulator (South Africa)'], 'link' => 'View Your Rights'],
                ['title' => '5. Data Sharing', 'icon' => 'workflow', 'tone' => 'green', 'body' => 'We do not sell your personal information. We may share data with trusted partners only where necessary to deliver our services or comply with legal requirements.', 'detail' => ['Payment processors and hosting providers under contract', 'Qualified professionals you have asked us to involve', 'Authorities where required by law']],
                ['title' => '6. International Transfers', 'icon' => 'globe', 'tone' => 'red', 'body' => 'Where we transfer your personal information outside South Africa, we ensure appropriate safeguards are in place to protect your information.', 'detail' => ['Transfers only to jurisdictions or recipients with adequate protection', 'Binding contractual safeguards with processors']],
            ],
            'glance' => [
                ['icon' => 'shield-check', 'text' => 'We comply with POPIA (Protection of Personal Information Act)'],
                ['icon' => 'user', 'text' => 'We collect only what is necessary for a clear purpose'],
                ['icon' => 'database', 'text' => 'We keep your data accurate, secure and up to date'],
                ['icon' => 'calendar', 'text' => 'We retain data only as long as necessary'],
                ['icon' => 'file-text', 'text' => 'You can withdraw consent at any time'],
            ],
            'history' => [
                ['date' => '2025-05-18', 'change' => 'Added candidate privacy cross-reference and testimonial consent withdrawal route.'],
                ['date' => '2024-11-02', 'change' => 'Clarified international transfer safeguards.'],
                ['date' => '2024-03-15', 'change' => 'First controlled version published.'],
            ],
        ];
    }

    public static function terms(): array
    {
        return [
            'version' => 'v3.2',
            'updated' => '2025-05-18',
            'cards' => [
                ['title' => '1. Acceptance of Terms', 'icon' => 'file-text', 'tone' => 'blue', 'body' => 'By accessing or using any TBCA platform, service or content, you agree to be bound by these Terms and our policies.', 'detail' => 'If you use TBCA on behalf of an organisation, you confirm you are authorised to bind it. If you do not agree, do not use the platform.'],
                ['title' => '2. Our Services', 'icon' => 'user', 'tone' => 'green', 'body' => 'We provide strategic advisory, project support, digital tools, content and related services in accordance with these terms.', 'detail' => 'Service scope, deliverables and timelines are set in your order, Sprint description or engagement letter. TBCA does not provide reserved professional services (legal, tax, audit, regulated financial advice).'],
                ['title' => '3. User Responsibilities', 'icon' => 'shield-check', 'tone' => 'purple', 'body' => 'You agree to use our platforms and services lawfully, not to misuse content, and to provide accurate information.', 'detail' => 'You are responsible for keeping your credentials secure and for decisions you make using our outputs.'],
                ['title' => '4. Intellectual Property', 'icon' => 'lock', 'tone' => 'orange', 'body' => 'All content, trademarks, frameworks and tools are owned by TBCA or our licensors and are protected by law.', 'detail' => 'Deliverables are licensed to you for your internal use on payment. TBCA marks may not be used without written permission.'],
                ['title' => '5. Purchases & Payments', 'icon' => 'shopping-cart', 'tone' => 'blue', 'body' => 'Payments for services, products and subscriptions are governed by the terms at checkout and our billing policies.', 'detail' => 'Prices exclude VAT unless stated. A platform fee and applicable bank charges are shown before payment.'],
                ['title' => '6. Cancellations & Refunds', 'icon' => 'clock', 'tone' => 'red', 'body' => 'Refunds and cancellations are handled in line with the terms of your agreement or product purchase.', 'detail' => 'Digital products are non-refundable once accessed unless defective. Services may be cancelled before work starts.'],
                ['title' => '7. Limitation of Liability', 'icon' => 'scale', 'tone' => 'blue', 'body' => 'To the fullest extent permitted by law, TBCA is not liable for indirect, incidental or consequential losses.', 'detail' => 'Our aggregate liability is limited to the fees paid for the relevant service in the preceding 12 months.'],
                ['title' => '8. Governing Law', 'icon' => 'scale', 'tone' => 'green', 'body' => 'These Terms are governed by the laws of the Republic of South Africa and subject to its courts.', 'detail' => 'Disputes are first addressed through our complaints process before formal proceedings.'],
            ],
            'documents' => [
                ['name' => 'Full Terms & Conditions (Website)', 'href' => '/terms#acceptance'],
                ['name' => 'Terms of Service (Platforms)', 'href' => '/terms#services'],
                ['name' => 'Client Engagement Terms', 'href' => '/terms#services'],
                ['name' => 'Subscription Terms', 'href' => '/terms#payments'],
                ['name' => 'Privacy Policy', 'href' => '/privacy'],
            ],
            'history' => [
                ['date' => '2025-05-18', 'change' => 'v3.2 — clarified platform fee and bank charge disclosure.'],
                ['date' => '2024-10-01', 'change' => 'v3.1 — added subscription terms.'],
                ['date' => '2024-03-15', 'change' => 'v3.0 — consolidated controlled terms.'],
            ],
        ];
    }

    public static function trustCentre(): array
    {
        return [
            'cards' => [
                ['title' => 'Security & Data', 'icon' => 'shield-check', 'tone' => 'green', 'body' => 'We protect client data with industry-leading security controls and privacy by design.', 'link' => ['label' => 'View Security Practices', 'href' => '/about/governance#security']],
                ['title' => 'Policies & Legal', 'icon' => 'file-text', 'tone' => 'blue', 'body' => 'Read our key policies that govern how we work and protect your information.', 'link' => ['label' => 'View Policies Library', 'href' => '/terms']],
                ['title' => 'Certifications', 'icon' => 'award', 'tone' => 'purple', 'body' => 'Our certifications and verifications from globally recognised standards bodies.', 'link' => ['label' => 'View Certifications & Verifications', 'href' => '/about/certifications']],
                ['title' => 'Governance', 'icon' => 'users', 'tone' => 'orange', 'body' => 'Our governance structure, leadership oversight and decision-making principles.', 'link' => ['label' => 'View Governance Framework', 'href' => '/about/governance']],
                ['title' => 'Compliance', 'icon' => 'shield', 'tone' => 'blue', 'body' => 'We comply with applicable laws, regulations and professional standards across our markets.', 'link' => ['label' => 'View Compliance Information', 'href' => '/about/professional-boundaries']],
                ['title' => 'Reports & Assurance', 'icon' => 'bar-chart-3', 'tone' => 'red', 'body' => 'Independent assurance reports and key metrics that demonstrate our accountability.', 'link' => ['label' => 'View Assurance Reports', 'href' => '/about/our-promise']],
            ],
            'commitments' => ['Act with integrity in everything we do', 'Protect your data and privacy', 'Be transparent and accountable', 'Deliver independent, objective advice', 'Enable sustainable impact across Africa'],
        ];
    }

    public static function candidatePrivacy(): array
    {
        return [
            'updated' => '2025-05-18',
            'cards' => [
                ['key' => 'collect', 'title' => '1. Information We Collect', 'icon' => 'user', 'body' => 'We collect personal information you provide when applying for a role, including:', 'items' => ['Personal details (name, contact information)', 'Professional history (CV, work experience, qualifications)', 'Supporting documents (cover letter, certificates, references)', 'Any additional information you choose to provide']],
                ['key' => 'use', 'title' => '2. How We Use Your Information', 'icon' => 'workflow', 'body' => 'We use your information to:', 'items' => ['Assess your application and suitability for the role', 'Communicate with you about your application', 'Improve our recruitment process', 'Comply with legal and regulatory obligations']],
                ['key' => 'basis', 'title' => '3. Legal Basis for Processing', 'icon' => 'shield-check', 'body' => 'We process your personal information based on:', 'items' => ['Your consent', 'The necessity to take steps at your request before entering into a contract', 'Our legitimate interests in recruiting the best talent', 'Compliance with legal obligations']],
                ['key' => 'protect', 'title' => '4. How We Protect Your Data', 'icon' => 'lock', 'body' => 'We implement appropriate technical and organisational measures to protect your personal information against:', 'items' => ['Unauthorised access', 'Alteration or disclosure', 'Accidental loss or destruction', 'All data is stored securely and access is restricted to authorised personnel only']],
                ['key' => 'retention', 'title' => '5. How Long We Keep Your Information', 'icon' => 'clock', 'body' => 'We retain your personal information for:', 'items' => ['24 months from the date of your last application', 'Longer if required by law', 'You may request deletion of your data at any time (see Your Rights)']],
                ['key' => 'rights', 'title' => '6. Your Rights', 'icon' => 'user-check', 'body' => 'You have the right to:', 'items' => ['Access the personal information we hold about you', 'Request correction of inaccurate data', 'Request deletion of your data', 'Object to or restrict processing', 'Withdraw consent at any time']],
            ],
            'ai' => 'AI may assist with administration and structured screening. It never issues a final rejection, infers sensitive attributes or approves an employment offer — those decisions are made by people.',
        ];
    }

    public static function trustBadge(): array
    {
        return [
            'means' => ['Verified standards and governance', 'Human-led. AI-powered. Ethical by design.', 'Transparent operations and clear fees', "Committed to Africa's development impact", 'Your trust. Our responsibility.'],
            'pillars' => [
                ['title' => 'Verified Governance', 'icon' => 'shield-check', 'body' => 'Our governance framework is independently reviewed and continuously enforced.', 'link' => ['label' => 'View Governance', 'href' => '/about/governance']],
                ['title' => 'Data & Privacy', 'icon' => 'lock', 'body' => 'Your data is protected with industry-leading security and privacy controls.', 'link' => ['label' => 'View Privacy Standards', 'href' => '/privacy']],
                ['title' => 'Human-Led, AI-Powered', 'icon' => 'users', 'body' => 'We combine human judgement with responsible AI to deliver measurable impact.', 'link' => ['label' => 'Our AI Responsibility', 'href' => '/about/ai-disclosure']],
                ['title' => 'Ethical Practice', 'icon' => 'scale', 'body' => 'We operate with integrity, professional independence and zero tolerance for conflict.', 'link' => ['label' => 'Code of Ethics', 'href' => '/about/professional-boundaries']],
                ['title' => 'Measurable Impact', 'icon' => 'target', 'body' => 'We are committed to creating real, measurable value for clients and communities across Africa.', 'link' => ['label' => 'Our Impact', 'href' => '/about/our-promise']],
            ],
        ];
    }

    public static function limitationNotice(): array
    {
        return [
            ['title' => 'Our Role', 'icon' => 'scale', 'lines' => ['We are transaction advisers and information architects. We provide independent research, structured frameworks, data insights and decision support.']],
            ['title' => 'What We Do Not Do', 'icon' => 'user', 'lines' => ['We do not provide legal advice.', 'We do not provide tax advice.', 'We do not provide accounting or audit services.', 'We do not act as a regulatory authority.']],
            ['title' => 'Professional Reliance', 'icon' => 'shield-check', 'lines' => ['You should obtain independent legal, tax, financial, technical and other professional advice before acting on any information or recommendation from TBCA.']],
            ['title' => 'No Warranty', 'icon' => 'file-text', 'lines' => ['While we strive for accuracy and reliability, information may change and may not be complete. We make no warranty, express or implied, as to accuracy, completeness or fitness for purpose.']],
        ];
    }

    public static function contact(): array
    {
        return [
            'channels' => [
                ['icon' => 'phone', 'title' => 'Call Us', 'value' => '+27 60 801 1365', 'note' => 'Mon – Fri: 08:00 – 17:00 (SAST)', 'href' => 'tel:+27608011365'],
                ['icon' => 'message-circle', 'title' => 'WhatsApp / Talk', 'value' => '+27 60 801 1365', 'note' => 'Chat with our team', 'href' => 'https://wa.me/27608011365'],
                ['icon' => 'mail', 'title' => 'Email Us', 'value' => 'Consult@thebusinessclinic.africa', 'note' => "We'll get back to you", 'href' => 'mailto:Consult@thebusinessclinic.africa'],
                ['icon' => 'map-pin', 'title' => 'Visit Us', 'value' => "5th Floor, Business's Building, Blue Gum Road, Lynnwood Ridge, Pretoria, 0081, South Africa", 'note' => 'By appointment', 'href' => null],
                ['icon' => 'globe', 'title' => 'Website', 'value' => 'www.thebusinessclinic.africa', 'note' => 'Explore our platform', 'href' => '/'],
            ],
            'offices' => [
                ['name' => 'Pretoria (Head Office)', 'lines' => ["5th Floor, Business's Building,", 'Blue Gum Road, Lynnwood Ridge,', 'Pretoria, 0081, South Africa'], 'phone' => '+27 60 801 1365'],
                ['name' => 'Johannesburg', 'lines' => ['7th Floor, Sandton Gate,', '25 Minerva Avenue,', 'Glenadrienne, 2196, South Africa'], 'phone' => '+27 11 100 2345'],
            ],
            'subjects' => ['General enquiry', 'Client support', 'Media enquiry', 'Partnership', 'Regulator / formal request', 'Complaint', 'Privacy request', 'Careers'],
            'strip' => [
                ['icon' => 'clock', 'title' => 'Hours of Operation', 'body' => 'Mon – Fri: 08:00 – 17:00 (SAST). Closed on public holidays'],
                ['icon' => 'shield-check', 'title' => 'Trusted & Secure', 'body' => 'Your information is protected with industry-standard security.'],
                ['icon' => 'users', 'title' => 'AI + Human Support', 'body' => 'AI agents for speed. Humans for wisdom.'],
                ['icon' => 'globe', 'title' => 'Pan-African Focus', 'body' => 'Supporting projects and partners across Africa and beyond.'],
            ],
        ];
    }

    public static function differentiators(): array
    {
        return [
            ['title' => 'AI-Powered Platform', 'body' => 'Intelligent systems that think, learn and recommend what\'s next.'],
            ['title' => 'Human Expertise', 'body' => 'Seasoned experts across industries and disciplines.'],
            ['title' => 'Robotic Execution', 'body' => 'Automation that delivers speed, accuracy and scale.'],
            ['title' => 'End-to-End Support', 'body' => 'From strategy to implementation and beyond.'],
            ['title' => 'Pan-African Reach', 'body' => 'Local insight with global standards.'],
            ['title' => 'Client Success Focused', 'body' => 'Your growth is our mission.'],
        ];
    }
}
