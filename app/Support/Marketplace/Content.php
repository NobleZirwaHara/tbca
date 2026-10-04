<?php

namespace App\Support\Marketplace;

/**
 * Copy registers for the public Marketplace and Partner Services pages,
 * taken from the approved mockups.
 */
class Content
{
    public static function landing(): array
    {
        return [
            'features' => [
                ['icon' => 'shield-check', 'title' => 'Quality Assured', 'body' => 'Human review & QA at every stage'],
                ['icon' => 'lock', 'title' => 'Secure & Private', 'body' => 'Data protected. Access controlled.'],
                ['icon' => 'handshake', 'title' => 'Transparent Pricing', 'body' => '3-Ledger model. No hidden fees.'],
                ['icon' => 'clock', 'title' => 'On Time Delivery', 'body' => 'Managed workflow. Results you can trust.'],
            ],
            'stats' => [
                ['value' => '2,450+', 'label' => 'Verified Specialists', 'icon' => 'users'],
                ['value' => '18', 'label' => 'Service Categories', 'icon' => 'briefcase'],
                ['value' => '54', 'label' => 'African Countries', 'icon' => 'globe'],
                ['value' => '98%', 'label' => 'Quality Success Rate', 'icon' => 'badge-check'],
                ['value' => '24–72 hrs', 'label' => 'Average Delivery', 'icon' => 'calendar-days'],
                ['value' => '7,000+', 'label' => 'Projects Completed', 'icon' => 'star'],
            ],
            'categories' => [
                ['key' => 'financial-advisory', 'icon' => 'bar-chart-3', 'title' => 'Financial Advisory', 'body' => 'Business valuation, modelling, fundraising, due diligence.', 'count' => '85+'],
                ['key' => 'legal-contracts', 'icon' => 'scale', 'title' => 'Legal & Contracts', 'body' => 'Contracts, agreements, legal research, company secretarial.', 'count' => '30+'],
                ['key' => 'project-management', 'icon' => 'folder', 'title' => 'Project Management', 'body' => 'Planning, execution, PMO, monitoring and reporting.', 'count' => '120+'],
                ['key' => 'market-research', 'icon' => 'pie-chart', 'title' => 'Market Research', 'body' => 'Market studies, analysis, feasibility, competitive intel.', 'count' => '60+'],
                ['key' => 'compliance-risk', 'icon' => 'shield-check', 'title' => 'Compliance & Risk', 'body' => 'Risk assessments, policies, compliance frameworks.', 'count' => '40+'],
                ['key' => 'tech-digital', 'icon' => 'code', 'title' => 'Tech & Digital', 'body' => 'Software, automation, data, web & app development.', 'count' => '75+'],
            ],
            'guardrails' => [
                ['title' => 'Vetted Providers Only', 'body' => 'ID, credentials & track record verified'],
                ['title' => 'Governed Delivery', 'body' => 'Standard briefs, milestones & QA'],
                ['title' => 'Secure Portal', 'body' => 'Bank-grade security & data protection'],
                ['title' => 'Dispute Support', 'body' => 'Structured escalation & resolution'],
                ['title' => 'Bank-Grade Security', 'body' => 'ISO 27001, POPIA & secure payments'],
            ],
            'why' => [
                'Quality assured, human-reviewed outputs',
                'Transparent pricing & milestone control',
                'Secure payments held in trust',
                'Expert matching, not open directory',
                'Local context. Global standards.',
            ],
            'workflow' => [
                ['title' => 'Submit Brief', 'body' => 'You define the work, requirements & budget.'],
                ['title' => 'TBCA Review', 'body' => 'We review, scope & govern the brief.'],
                ['title' => 'Matched Providers', 'body' => 'Vetted specialists matched to your need.'],
                ['title' => 'Assignment Control', 'body' => 'We govern scope, price & delivery.'],
                ['title' => 'Milestones', 'body' => 'Work delivered in tracked milestones.'],
                ['title' => 'Evidence & QA', 'body' => 'Evidence submitted & quality assured.'],
                ['title' => 'Delivery & Acceptance', 'body' => 'You accept, we release secure payment.'],
            ],
            'milestones' => ['Kick-off & Data Request', 'Draft Analysis / First Deliverable', 'Final Report / Presentation', 'Revisions (If Any)', 'Final Delivery & Handover'],
        ];
    }

    public static function howItWorks(): array
    {
        return [
            'steps' => [
                ['icon' => 'file-text', 'title' => 'Submit Brief', 'body' => 'Tell us what you need, your goals, timeline and budget.'],
                ['icon' => 'search', 'title' => 'Review & Scope', 'body' => 'TBCA reviews your brief and confirms scope and price.'],
                ['icon' => 'scale', 'title' => 'Disclosure & Authority', 'body' => 'We disclose delivery model and obtain your authority.'],
                ['icon' => 'credit-card', 'title' => 'Payment Authorisation', 'body' => 'You authorise payment to start the process.'],
                ['icon' => 'users', 'title' => 'Provider Assignment', 'body' => 'TBCA assigns a verified specialist or firm.'],
                ['icon' => 'activity', 'title' => 'Work in Progress', 'body' => "Specialist works under TBCA's oversight."],
                ['icon' => 'clipboard-check', 'title' => 'QA & Review', 'body' => 'Work is quality assured against our standards.'],
                ['icon' => 'refresh-cw', 'title' => 'Corrections (If needed)', 'body' => 'Any required corrections are completed.'],
                ['icon' => 'package-check', 'title' => 'Deliver & Release', 'body' => 'You receive the final, approved deliverable.'],
                ['icon' => 'headphones', 'title' => 'Support & Completion', 'body' => "Post-delivery support until you're satisfied."],
                ['icon' => 'calendar-days', 'title' => 'Repeat or Ongoing', 'body' => 'Return for new work or ongoing engagements.'],
            ],
            'parties' => [
                ['title' => 'You (Buyer)', 'items' => ['Define the need and approve scope', 'Authorise payment', 'Receive quality-assured deliverables', 'Raise issues or request support']],
                ['title' => 'The Business Clinic.Africa™ (TBCA)', 'items' => ['Owns the process and remains accountable', 'Vets providers and assigns work', 'Manages QA, corrections and disputes', 'Ensures quality, security and compliance']],
                ['title' => 'Marketplace Provider', 'items' => ['Specialist or firm with verified capability', 'Delivers work to TBCA standards', 'Participates in QA and corrections', 'Paid on successful delivery']],
            ],
            'why' => [
                'Verified specialists across Africa', 'TBCA accountable at every step', 'Transparent pricing with no hidden fees',
                'Professional standards and QA', 'Secure, compliant and private', 'Dispute resolution managed by TBCA', 'Flexible – one-off or ongoing work',
            ],
            'tiles' => [
                ['icon' => 'shield-check', 'title' => 'Quality Assurance', 'body' => 'Every deliverable is reviewed by TBCA against our strict quality standards before release.'],
                ['icon' => 'lock', 'title' => 'Secure & Private', 'body' => 'Your information is protected. Access is controlled and data never shared without permission.'],
                ['icon' => 'circle-dollar-sign', 'title' => 'Transparent Fees', 'body' => 'All fees are separated into: Ledger A (TBCA Fees), Ledger B (Platform Fees), Ledger C (Costs).'],
                ['icon' => 'clock', 'title' => 'On Time. Every Time.', 'body' => 'We manage timelines, track progress and ensure you get results you can rely on.'],
            ],
        ];
    }

    /** MP17 Provider Agreement MP-PA-v2.1 key terms. */
    public static function providerAgreement(): array
    {
        return [
            ['title' => 'Independent External-Provider Relationship', 'items' => ['You are an independent provider, not a TBCA employee.', 'You control your resources, staff and methods.', 'No agency, partnership or joint venture is created.']],
            ['title' => 'No Guaranteed Work', 'items' => ['Work is provided on a needs basis only.', 'TBCA does not guarantee any volume or frequency.', 'You may stop or decline work at any time.']],
            ['title' => 'Provider Rights', 'items' => ['You may accept, decline or withdraw from briefs.', 'You choose the capacity and timeline you can deliver.', 'You are treated fairly and paid per agreed terms.']],
            ['title' => 'Rate and Payment Treatment', 'items' => ['Rates and fees are disclosed before acceptance.', 'Payment is for work properly completed and accepted.', 'Gross payments are made; taxes are your responsibility.']],
            ['title' => 'QA Process', 'items' => ['All work is subject to QA verification and audit.', 'QA checks accuracy, compliance and completeness.', 'QA outcomes determine acceptance and payment.']],
            ['title' => 'Correction Rules', 'items' => ['R1 (minor): Fix without extra charge within 5 days.', 'R2 (major): Re-do at no charge within 7 days.', 'Repeat issues may affect eligibility and access.']],
            ['title' => 'Access Restrictions', 'items' => ['Access is limited to approved information only.', 'You must not access unrelated or excessive data.', 'Return or delete all data when work is complete.']],
            ['title' => 'Confidentiality', 'items' => ['Keep all TBCA and client information confidential.', 'Do not disclose or use information for other purposes.', 'Duty continues after the engagement ends.']],
            ['title' => 'IP and Rights', 'items' => ['TBCA and clients retain all rights in deliverables.', 'You grant TBCA a licence to use your deliverables.', 'You may reference only with written permission.']],
            ['title' => 'Security', 'items' => ['Follow all security controls and access protocols.', 'Protect data from loss, misuse and unauthorised access.', 'Report incidents immediately via the correct channel.']],
            ['title' => 'Professional-Boundary Stop-Work Right', 'items' => ['Do not perform regulated, legal or reserved services.', 'Stop work and escalate boundary or scope issues.', 'Follow TBCA instructions until the issue is resolved.']],
            ['title' => 'Six-Month Protected-Relationship Scope', 'items' => ['No direct solicitation or engagement of clients.', 'No hiring or contracting client staff.', 'Protected scope lasts six (6) months from completion.']],
        ];
    }

    public static function providerAcks(): array
    {
        return [
            'independent' => 'I confirm I am an independent external provider.',
            'no_volume' => 'I understand there is no guaranteed volume of work.',
            'corrections' => 'I accept the correction guarantee and appeal rules.',
            'confidentiality' => 'I accept confidentiality, privacy and security duties.',
            'stop_work' => 'I understand my duty to stop work and escalate regulated or reserved matters.',
        ];
    }

    /* =================================================================
     | Partner Services
     * ================================================================= */

    public static function disciplines(): array
    {
        return [
            ['key' => 'legal-services', 'icon' => 'scale', 'title' => 'Legal Services', 'body' => 'Contracts, corporate advisory, regulatory compliance, dispute support.'],
            ['key' => 'audit-assurance', 'icon' => 'file-check', 'title' => 'Audit & Assurance', 'body' => 'Statutory audits, due diligence audits, financial reviews and attestations.'],
            ['key' => 'tax-advisory', 'icon' => 'calculator', 'title' => 'Tax Advisory', 'body' => 'Tax planning, compliance, structuring, transfer pricing and tax reviews.'],
            ['key' => 'esg-advisory', 'icon' => 'leaf', 'title' => 'ESG Advisory', 'body' => 'ESG strategy, reporting, ratings readiness and sustainability assurance.'],
            ['key' => 'environmental-services', 'icon' => 'sprout', 'title' => 'Environmental Services', 'body' => 'Environmental impact assessments, management plans and compliance.'],
            ['key' => 'engineering-technical', 'icon' => 'settings', 'title' => 'Engineering & Technical', 'body' => 'Technical studies, design reviews, engineering due diligence and inspections.'],
            ['key' => 'financial-advisory', 'icon' => 'bar-chart-3', 'title' => 'Financial Advisory', 'body' => 'Business valuation, financial modelling, restructuring and M&A support.'],
            ['key' => 'specialist-compliance', 'icon' => 'shield-check', 'title' => 'Specialist Compliance', 'body' => 'AML/KYC/KYB, risk compliance, data privacy and regulatory support.'],
        ];
    }

    /** Choose-a-service categories (PS Page 2) with display labels. */
    public const PS_CATEGORIES = [
        'legal-services' => 'Legal Services',
        'audit-assurance' => 'Audit & Assurance',
        'tax-advisory' => 'Tax Advisory',
        'esg-advisory' => 'ESG Advisory',
        'environmental-services' => 'Environmental Services',
        'engineering-technical' => 'Engineering and Technical',
        'financial-advisory' => 'Financial Advisory',
        'specialist-compliance' => 'Specialist Compliance',
        'business-rescue' => 'Business Rescue Advisory',
        'valuation' => 'Business & Property Valuation',
        'labour-employment' => 'Labour and Employment',
        'corporate-governance' => 'Corporate Governance',
    ];

    public static function psLanding(): array
    {
        return [
            'confidence' => ['Vetted professional firms', 'Qualified & independent', 'Conflict of interest checks', 'Clear scope & boundaries', 'Evidence-based reviews', 'Secure documentation', 'Human review required'],
            'how' => [
                ['title' => 'Submit Request', 'body' => 'Tell us what you need and upload initial documents.'],
                ['title' => 'Conflict Check', 'body' => 'We run conflict and independence screening.'],
                ['title' => 'Scope & Evidence', 'body' => 'Define scope, jurisdiction and evidence required.'],
                ['title' => 'Partner Assignment', 'body' => 'Qualified partner(s) assigned for the review.'],
                ['title' => 'Review & Report', 'body' => 'Human-reviewed report with clear findings.'],
                ['title' => 'Delivery to Portal', 'body' => 'Final report delivered securely to your portal.'],
            ],
            'safeguards' => ['Jurisdiction & Licensing Verified', 'Independence & Conflict Checked', 'Clear Scope & Terms of Engagement', 'Evidence Requirements Defined', 'Confidentiality & POPIA Compliant', 'Human Review & Sign-Off Required', 'Limitation of Liability Applied'],
            'needs' => [
                ['icon' => 'file-text', 'title' => 'Purpose & Background', 'body' => 'Why you need the review.'],
                ['icon' => 'files', 'title' => 'Documents & Evidence', 'body' => 'Upload relevant documents.'],
                ['icon' => 'map-pin', 'title' => 'Jurisdiction & Location', 'body' => 'Where the engagement applies.'],
                ['icon' => 'clock', 'title' => 'Timeframe & Urgency', 'body' => 'Your required turnaround.'],
                ['icon' => 'pen-line', 'title' => 'Consent & Authorisation', 'body' => 'Agree to terms and permissions.'],
            ],
            'deliverables' => [
                ['title' => 'Professional Review Report', 'body' => 'Detailed findings and analysis.'],
                ['title' => 'Recommendations', 'body' => 'Actionable, practical recommendations.'],
                ['title' => 'Compliance Checklists', 'body' => 'Jurisdictional compliance status.'],
                ['title' => 'Risk & Issue Register', 'body' => 'Identified risks and mitigation.'],
                ['title' => 'Supporting Evidence', 'body' => 'Schedules, calculations and annexures.'],
            ],
            'boundaries' => ['Partners provide expert input only.', 'Decisions remain with the client.', 'Regulated outcomes require client sign-off.', 'AI does not approve regulated decisions.', 'Reports subject to scope and evidence.', 'No brokerage or circumvention allowed.'],
        ];
    }

    public static function arrangements(): array
    {
        return [
            ['code' => 'A1', 'title' => 'Partner Reviewed', 'lead' => 'TBCA performs the substantive scope. The professional reviews or signs off.', 'icon' => 'clipboard-check', 'rows' => [
                ['Who Performs Professional Work', 'The Professional (review or sign-off only)'],
                ['Who Contracts With You', 'The Business Clinic.Africa™'],
                ['How TBCA Is Paid', 'TBCA fee for substantive work'],
                ['Who Receives Professional Fee', 'The Professional (review/sign-off fee)'],
                ['Typical Use', 'Reviews, validations, sign-offs, attestations'],
            ]],
            ['code' => 'A2', 'title' => 'Partner Delivered', 'lead' => 'The professional delivers the service under an approved contracting structure.', 'icon' => 'users', 'rows' => [
                ['Who Performs Professional Work', 'The Professional'],
                ['Who Contracts With You', 'The Professional (approved structure)'],
                ['How TBCA Is Paid', 'Subcontract / fee mechanism (M1–M3)'],
                ['Who Receives Professional Fee', 'The Professional'],
                ['Typical Use', 'Specialist services, reports, implementations'],
            ]],
            ['code' => 'A3', 'title' => 'Partner Introduced', 'lead' => 'TBCA introduces or coordinates. The professional contracts directly.', 'icon' => 'handshake', 'rows' => [
                ['Who Performs Professional Work', 'The Professional'],
                ['Who Contracts With You', 'The Professional (direct structure)'],
                ['How TBCA Is Paid', 'Subcontract / Introduction fee (M4) if authorised'],
                ['Who Receives Professional Fee', 'The Professional'],
                ['Typical Use', 'Introductions, mandates, advisory relationships'],
            ]],
        ];
    }

    public static function engagementProcess(): array
    {
        return [
            ['title' => 'Submit Request', 'body' => 'Tell us what you need and your jurisdiction.'],
            ['title' => 'Permission & Fit Check', 'body' => 'We confirm profession, activity, jurisdiction and arrangement.'],
            ['title' => 'Conflict Clearance', 'body' => 'Mandatory check before any engagement.'],
            ['title' => 'Partner Proposal', 'body' => 'We propose a verified professional.'],
            ['title' => 'Scope & Quote', 'body' => 'Clear T/P/X/S/C and responsibilities.'],
            ['title' => 'Engage & Deliver', 'body' => 'Work under our oversight and controls.'],
            ['title' => 'Review & Close', 'body' => 'QA, settlement and performance review.'],
        ];
    }

    /** Coverage table: profession => [SA, selected African, cross-border, note]. States: current|available|matter|output|manual|unavailable */
    public static function coverage(): array
    {
        return [
            ['icon' => 'scale', 'profession' => 'Legal Services', 'za' => 'current', 'africa' => 'matter', 'cross' => 'manual', 'note' => 'Jurisdiction depends on matter and intended use.'],
            ['icon' => 'shield-check', 'profession' => 'Audit & Assurance', 'za' => 'available', 'africa' => 'matter', 'cross' => 'manual', 'note' => 'Regulator approval or local registration may be required.'],
            ['icon' => 'calculator', 'profession' => 'Tax Advisory', 'za' => 'current', 'africa' => 'matter', 'cross' => 'manual', 'note' => 'Cross-border tax depends on treaties and local law.'],
            ['icon' => 'leaf', 'profession' => 'ESG Advisory', 'za' => 'available', 'africa' => 'output', 'cross' => 'manual', 'note' => 'Output type and framework determine coverage.'],
            ['icon' => 'sprout', 'profession' => 'Environmental Services', 'za' => 'available', 'africa' => 'matter', 'cross' => 'unavailable', 'note' => 'Environmental permits are country-specific.'],
            ['icon' => 'settings', 'profession' => 'Engineering & Technical', 'za' => 'current', 'africa' => 'matter', 'cross' => 'manual', 'note' => 'Professional registration and scope vary by country.'],
            ['icon' => 'bar-chart-3', 'profession' => 'Financial Advisory', 'za' => 'available', 'africa' => 'matter', 'cross' => 'manual', 'note' => 'Securities activities require regulatory permission.'],
            ['icon' => 'badge-check', 'profession' => 'Specialist Compliance', 'za' => 'current', 'africa' => 'output', 'cross' => 'unavailable', 'note' => 'Regulatory permissions vary by sector and country.'],
        ];
    }

    public const COVERAGE_STATES = [
        'current' => ['label' => 'Current route rules in place', 'tone' => 'good'],
        'available' => ['label' => 'Coverage rules available', 'tone' => 'good'],
        'matter' => ['label' => 'Matter review required', 'tone' => 'warn'],
        'output' => ['label' => 'Output-specific review', 'tone' => 'warn'],
        'manual' => ['label' => 'Manual confirmation required', 'tone' => 'warn'],
        'unavailable' => ['label' => 'Jurisdiction unavailable', 'tone' => 'neutral'],
    ];

    public static function limitationNotice(): array
    {
        return [
            'not_provided' => ['Legal services', 'Audit or assurance', 'Tax compliance, representation or filing', 'Regulated financial services or advice', 'Engineering certification or approval', 'Environmental impact approvals', 'Medical or health professional services', 'Immigration or visa decision-making'],
            'profession_led' => ['The professional performs the regulated service.', 'The professional accepts responsibility for their work.', 'The professional maintains their own indemnity and insurance.', 'You contract directly with the professional or through the approved arrangement structure.', 'Professional fees are paid to the professional or their firm.'],
            'information' => ['For general information only', 'From sources believed reliable', 'Not guaranteed as complete or current', 'Not legal, tax, financial, technical, environmental or professional advice'],
        ];
    }

    public static function responsibilityMatrix(): array
    {
        // [activity, tbca, professional, client, note]  values: R responsible, - not, S shared
        return [
            ['Engagement Administration & Coordination', 'R', '-', '-', 'Scheduling, communication, QA, reporting coordination.'],
            ['Scope Management (Own Deliverables)', 'R', '-', '-', "Manage TBCA's scope only as per engagement instrument."],
            ['Professional Advice & Opinion', '-', 'R', '-', 'Independent professional judgement and conclusions.'],
            ['Data Collection & Site Information', '-', 'R', 'R', 'Client to provide accurate, complete and timely information.'],
            ['Regulatory Submissions', '-', 'R', '-', 'Professional prepares and submits where mandated by law.'],
            ['Regulatory Fees & Government Charges', '-', '-', 'R', 'Borne by client unless otherwise agreed in writing.'],
            ['Third-Party Studies & Disbursements', '-', 'R', 'R', 'Professional manages; client funds.'],
            ['Final Decision on Approvals', '-', '-', '-', 'Issued by relevant Authorities / Regulators.'],
            ['Commercial & Financial Decisions', '-', '-', 'R', 'Client retains full decision-making authority at all times.'],
            ['Payment of Professional Fee (P)', '-', '-', 'R', 'Client pays P Fee to Professional.'],
            ['Payment of TBCA Coordination Fee (T)', 'R', '-', 'R', 'Client pays T Fee to TBCA.'],
        ];
    }

    public static function partnerAgreementDocs(): array
    {
        return [
            'Partner Agreement', 'Appendix A – Service & Scope Principles', 'Appendix B – Fee Mechanisms (M1–M4)', 'Appendix C – Arrangement Standards (A1–A3)',
            'Appendix D – Data Protection & VDR Access', 'Appendix E – Conflict of Interest Policy', 'Appendix F – Professional Independence',
            'Appendix G – Indemnity Requirements', 'Appendix H – Termination & Suspension',
        ];
    }

    public static function partnerDocuments(): array
    {
        return [
            ['key' => 'company_registration', 'name' => 'Company Registration Certificate', 'desc' => 'CIPC registration document.', 'required' => true],
            ['key' => 'proof_address', 'name' => 'Proof of Address', 'desc' => 'Utility bill / lease agreement (dated within last 3 months).', 'required' => true],
            ['key' => 'professional_registration', 'name' => 'Professional Registration Certificate(s)', 'desc' => 'All applicable professional body registration certificates.', 'required' => true],
            ['key' => 'qualifications', 'name' => 'Practitioner Qualification Certificates', 'desc' => 'Certified copies of highest academic and/or professional qualifications.', 'required' => true],
            ['key' => 'indemnity', 'name' => 'Professional Indemnity Insurance', 'desc' => 'Current policy schedule and confirmation of cover.', 'required' => true],
            ['key' => 'bbbee', 'name' => 'BBBEE Certificate (If applicable)', 'desc' => 'SANAS accredited certificate.', 'required' => false],
            ['key' => 'tax_clearance', 'name' => 'Tax Clearance Certificate', 'desc' => 'SARS Tax Compliance Status.', 'required' => true],
            ['key' => 'identity', 'name' => 'Directors / Partners Identity Documents', 'desc' => 'Certified ID copies of all directors / partners.', 'required' => true],
        ];
    }
}
