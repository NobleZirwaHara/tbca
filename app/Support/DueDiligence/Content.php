<?php

namespace App\Support\DueDiligence;

/**
 * Copy registers shared across Due Diligence pages: journey steps, trust
 * strips, process, deliverables and limitations, input checklists, review
 * triggers, FAQs, evidence and check templates.
 */
class Content
{
    public const BOUNDARY = 'TBCA Due Diligence supports risk screening and decision preparation. It does not replace legal, credit, employment, procurement, investment, audit, assurance or other regulated professional advice.';

    /** Seven public steps (Section 7.1). */
    public static function journey(): array
    {
        return [
            ['n' => 1, 'label' => 'Product or Proposal', 'short' => 'Product / Proposal', 'body' => 'Select the service or proposal.', 'icon' => 'ClipboardList'],
            ['n' => 2, 'label' => 'Consent & Payment', 'short' => 'Consent & Payment', 'body' => 'Provide consent and complete payment.', 'icon' => 'ShieldCheck'],
            ['n' => 3, 'label' => 'Intake & Evidence', 'short' => 'Intake & Evidence', 'body' => 'Submit information and supporting documents.', 'icon' => 'UploadCloud'],
            ['n' => 4, 'label' => 'Checks & Screening', 'short' => 'Checks & Screening', 'body' => 'Run comprehensive checks across verified data sources.', 'icon' => 'Search'],
            ['n' => 5, 'label' => 'Risk & Review', 'short' => 'Risk & Review', 'body' => 'Risk scoring and human expert review.', 'icon' => 'UserCheck'],
            ['n' => 6, 'label' => 'Report Generated', 'short' => 'Report Generated', 'body' => 'Detailed report with findings, evidence and recommendations.', 'icon' => 'FileText'],
            ['n' => 7, 'label' => 'Delivery & Monitoring', 'short' => 'Portal Delivery & Monitoring', 'body' => 'Secure portal delivery with ongoing monitoring and alerts.', 'icon' => 'Lock'],
        ];
    }

    /** Internal lifecycle stages 0-14 (Section 7). */
    public static function lifecycle(): array
    {
        return [
            0 => 'Case Creation', 1 => 'Onboarding', 2 => 'Intake & Evidence', 3 => 'Data Quality & Routing',
            4 => 'Identity & Registry', 5 => 'AML Screening', 6 => 'Financial & Litigation', 7 => 'Specialist Tracks',
            8 => 'AI Synthesis', 9 => 'Human Review', 10 => 'Report QA', 11 => 'Delivery', 12 => 'Dispute',
            13 => 'Monitoring', 14 => 'Closure',
        ];
    }

    public static function landingTrust(): array
    {
        return [
            ['title' => 'Consent-Led', 'body' => 'No check without explicit consent and lawful purpose.', 'icon' => 'ShieldCheck'],
            ['title' => 'Human-Reviewed', 'body' => 'All high-risk findings are reviewed by experts.', 'icon' => 'UserCheck'],
            ['title' => 'Global Data Sources', 'body' => 'Trusted local & international databases and registries.', 'icon' => 'Globe'],
            ['title' => 'Secure & Private', 'body' => 'Bank-grade security. POPIA-ready.', 'icon' => 'Lock'],
            ['title' => 'Full Audit Trail', 'body' => 'Every action is logged and time-stamped.', 'icon' => 'ClipboardList'],
            ['title' => 'Dispute & Resolution', 'body' => 'False positives resolved with priority.', 'icon' => 'Scale'],
            ['title' => 'Enterprise Ready', 'body' => 'Bulk cases, APIs and custom workflows.', 'icon' => 'FileStack'],
        ];
    }

    public static function selectorTrust(): array
    {
        return [
            ['title' => 'Consent-Led', 'body' => 'We only proceed with lawful consent and clear purpose.', 'icon' => 'ShieldCheck'],
            ['title' => 'Human Reviewed', 'body' => 'All high-risk findings are reviewed by qualified experts.', 'icon' => 'UserCheck'],
            ['title' => 'Secure & Private', 'body' => 'Bank-grade security. POPIA-ready. ISO 27001 standards.', 'icon' => 'Lock'],
            ['title' => 'Fast Turnaround', 'body' => 'Clear SLAs and timelines for every service.', 'icon' => 'Clock'],
            ['title' => 'Transparent Fees', 'body' => 'All fees shown upfront. No hidden charges. Pay for what you use.', 'icon' => 'PieChart'],
            ['title' => 'Audit Ready', 'body' => 'Complete evidence trail and source documentation.', 'icon' => 'FileCheck'],
        ];
    }

    public static function governance(string $sla): array
    {
        return [
            ['title' => 'Consent-Led', 'body' => 'Checks start only after fee disclosure, consent and lawful purpose.', 'icon' => 'ShieldCheck'],
            ['title' => 'Human-Reviewed', 'body' => 'All material findings are reviewed by qualified analysts.', 'icon' => 'UserCheck'],
            ['title' => 'Secure & Private', 'body' => 'Bank-grade security. POPIA-ready. ISO 27001 standards.', 'icon' => 'Lock'],
            ['title' => 'Audit Ready', 'body' => 'Complete audit trail, sources and decision log maintained.', 'icon' => 'FileCheck'],
            ['title' => 'Clear SLA / Turnaround', 'body' => $sla, 'icon' => 'Clock'],
        ];
    }

    /** 7-step process shown on Process screens (DD-019). */
    public static function process(string $familyName): array
    {
        return [
            ['title' => 'Scope & service selection', 'body' => 'We confirm your needs, jurisdiction and select the right service tier.', 'icon' => 'Target'],
            ['title' => 'Purpose & consent confirmation', 'body' => 'We confirm lawful-purpose, obtain consent and define who is screened.', 'icon' => 'UserCheck'],
            ['title' => 'Intake & evidence upload', 'body' => 'You provide evidence and supporting documents securely through the portal.', 'icon' => 'UploadCloud'],
            ['title' => 'Checks & screening', 'body' => 'We run automated screening across multiple trusted data sources.', 'icon' => 'ScanSearch'],
            ['title' => 'Human review & conflict checks', 'body' => 'Analysts review results and check for conflicts or data quality issues.', 'icon' => 'UserCog'],
            ['title' => 'Report generation & QA', 'body' => 'Findings are compiled, quality assured and prepared for release.', 'icon' => 'FileCheck'],
            ['title' => 'Secure portal delivery & monitoring option', 'body' => 'Reports delivered securely with optional ongoing monitoring.', 'icon' => 'Lock'],
        ];
    }

    public static function stageDetails(): array
    {
        return [
            ['title' => 'Identity & authority confirmation', 'body' => 'Verify identities, roles and authority using independent sources.', 'icon' => 'UserCheck'],
            ['title' => 'Ownership & structure review', 'body' => 'Map ultimate beneficial owners and layered structures.', 'icon' => 'Network'],
            ['title' => 'Sanctions, PEP & adverse media screening', 'body' => 'Screen against global lists, PEPs and adverse media sources.', 'icon' => 'ShieldAlert'],
            ['title' => 'Governance & conflicts checks', 'body' => 'Review governance quality and conflicts of interest indicators.', 'icon' => 'Scale'],
            ['title' => 'Analyst review & QA', 'body' => 'Human analysts validate findings and assess residual risk.', 'icon' => 'FileSearch'],
            ['title' => 'Report issue & retention', 'body' => 'Deliver final report and retain records per policy and law.', 'icon' => 'Archive'],
        ];
    }

    public static function safeguards(): array
    {
        return [
            ['title' => 'Consent-led', 'body' => 'Screening only after lawful-purpose and consent.', 'icon' => 'ShieldCheck'],
            ['title' => 'Human-reviewed', 'body' => 'Analysts review all findings before release.', 'icon' => 'Star'],
            ['title' => 'Secure & Private', 'body' => 'Bank-grade security and strict access controls.', 'icon' => 'Lock'],
            ['title' => 'Audit-ready', 'body' => 'Full evidence log and audit trail maintained.', 'icon' => 'FileCheck'],
            ['title' => 'Transparent fees', 'body' => 'External costs approved before commitment.', 'icon' => 'Receipt'],
            ['title' => 'No hidden charges', 'body' => 'Fee trigger occurs later at consent & payment stage.', 'icon' => 'Ban'],
        ];
    }

    public static function included(): array
    {
        return [
            'Comprehensive report with executive summary and key findings',
            'Detailed findings with risk ratings and supporting evidence',
            'Ownership and board structure mapping',
            'Sanctions, PEP, watchlist and adverse media screening results',
            'Regulatory and compliance checks relevant to scope',
            'Cross-border and jurisdictional risk indicators',
            'Data sources and confidence levels disclosed',
            'Report delivered in PDF and secure portal access',
        ];
    }

    public static function notIncluded(): array
    {
        return [
            'Physical site visits or on-the-ground inspections',
            'Audit opinions or financial statement assurance',
            'Legal advice or opinion on compliance or liability',
            'Ongoing monitoring or real-time alerting',
            'Third-party data provider subscriptions',
            'Remediation or implementation support',
            'Litigation research or court document retrieval',
            'Custom modelling or scenario analysis',
        ];
    }

    public static function limitations(): array
    {
        return [
            'Information is subject to source availability and timeliness',
            'Some jurisdictions have limited public data coverage',
            'Adverse media may not capture all local language sources',
            'Name variations may affect match accuracy',
            'No guarantee of completeness or absence of risk',
            'Results reflect conditions as at report date only',
            'Reliance placed on client-provided information',
            'External costs and delays may affect timelines',
        ];
    }

    public static function acceptanceCriteria(): array
    {
        return [
            'reviewed' => 'I have reviewed the deliverables, exclusions and limitations.',
            'understand' => 'I understand the scope, data sources and confidence levels.',
            'not_advice' => 'I accept that this report is not legal, financial or audit advice.',
            'context' => 'I will evaluate results within the context of my decision-making.',
            'responsibility' => 'I accept responsibility for decisions based on this report.',
        ];
    }

    /** Key report limitations shown at the G8 acknowledgement (DD-043). */
    public static function reportLimitations(string $date): array
    {
        return [
            "This report is based on information available up to {$date} and may not reflect events occurring after this date.",
            'The report is limited to the scope agreed and paid for. It does not constitute legal, financial, tax or investment advice.',
            'Third-party data providers are independent and not controlled by TBCA. Their information is used in good faith.',
            'Findings are not a guarantee of future performance or conduct. Use for decision support only.',
            'Where information was unavailable or could not be verified, this is stated in the report.',
            'This report is confidential and may not be shared outside your organisation without permission.',
        ];
    }

    /** Section 21 review matrix. */
    public static function reviewTriggers(): array
    {
        return [
            ['trigger' => 'Sanctions, watchlist, PEP or RCA hit', 'treatment' => 'Mandatory review and release lock.'],
            ['trigger' => 'Adverse media hit', 'treatment' => 'Human severity assessment and false-positive analysis.'],
            ['trigger' => 'Identity, document or liveness mismatch', 'treatment' => 'Manual evidence review and client clarification.'],
            ['trigger' => 'Company status, liquidation or registration mismatch', 'treatment' => 'Verify registry evidence and legal status.'],
            ['trigger' => 'Unresolved UBO or control issue', 'treatment' => 'Enhanced ownership evidence and partner review where required.'],
            ['trigger' => 'Enterprise, investor, sponsor, procurement or public-sector use', 'treatment' => 'Mandatory human review.'],
            ['trigger' => 'Funding, investment, credit or legal compliance use', 'treatment' => 'Qualified professional route where required.'],
            ['trigger' => 'High-risk jurisdiction or politically exposed counterparty', 'treatment' => 'Enhanced review and management escalation.'],
            ['trigger' => 'Vendor failure, stale source or data gap', 'treatment' => 'No automated release.'],
            ['trigger' => 'Low-confidence result', 'treatment' => 'No automated release.'],
            ['trigger' => 'Client dispute, false positive, complaint or refund', 'treatment' => 'Support ticket, release lock and controlled investigation.'],
            ['trigger' => 'Data or privacy incident', 'treatment' => 'Incident workflow and access restriction.'],
        ];
    }

    public static function releaseControls(): array
    {
        return [
            ['title' => 'Clear for Controlled Release', 'body' => 'The required checks and quality controls are complete. The report is ready for controlled release.', 'tone' => 'good'],
            ['title' => 'Human Review Required', 'body' => 'Results are locked pending specialist review. The report will be released once review is complete.', 'tone' => 'warn'],
            ['title' => 'Additional Information Required', 'body' => 'Missing or unclear inputs must be resolved before the report can be finalised and released.', 'tone' => 'bad'],
        ];
    }

    public static function faqs(string $familyName): array
    {
        return [
            ['q' => "What do {$familyName} cover?", 'a' => 'Each package lists exactly what is included, what is excluded and the known limitations. The Packages and Deliverables tabs show the full scope before you commit.'],
            ['q' => 'What consent is required?', 'a' => 'No check starts without a stated lawful purpose, your authority to request the check and, where required, the subject\'s consent or notice. Consent is recorded and can be withdrawn; withdrawal stops further processing.'],
            ['q' => 'How are prices calculated?', 'a' => 'Prices separate the TBCA Expert fee, the TBCA Platform fee, external third-party costs (passed through at actual cost plus a 25% administration margin where lawful) and tax/payment charges. The exact amount is confirmed on your itemised quotation before payment.'],
            ['q' => 'When is human review applied?', 'a' => 'Hits, mismatches, low-confidence results, enterprise or investment use and every Enhanced or Executive package receive human review before release.'],
            ['q' => 'How are reports delivered?', 'a' => 'Approved reports are released only through the secure client portal after you acknowledge the report limitations. Email or WhatsApp notifications never contain sensitive results.'],
            ['q' => 'Can I dispute an incorrect result?', 'a' => 'Yes. Open a dispute or false-positive review from the report viewer. TBCA corrects its own errors at no charge; new scope or evidence is quoted before any work begins.'],
        ];
    }

    /** Inputs Required tab checklists by subject type. */
    public static function inputs(string $subjectType, string $familyName): array
    {
        $subject = match ($subjectType) {
            'individual' => [
                "Subject's full legal name", 'Country and nationality where required', 'ID or passport information where lawful and necessary',
                'Date of birth where lawfully required', 'Address or proof of address for applicable Enhanced checks',
                'Relevant company or director information where applicable', 'Supporting documents required by the selected package',
            ],
            'project' => [
                'Project name, location and sector', 'Sponsor and special-purpose vehicle details', 'Project stage, CAPEX and funding structure',
                'Feasibility, technical and financial model documents', 'Permits, licences and land rights where applicable',
                'Key contracts (EPC, offtake, O&M) where applicable', 'Stakeholder and ESG information',
            ],
            default => [
                'Registered name and registration number', 'Country of incorporation and registered address', 'Directors, shareholders and beneficial owners',
                'Trading names and nature of business', 'Ownership structure / organogram', 'Authorised signatories',
                'Supporting documents required by the selected package',
            ],
        };

        return [
            'customer' => [
                'Customer full name', 'Organisation, where applicable', 'Email address', 'WhatsApp or telephone contact', 'Country',
                'Relationship to the subject', 'Permitted purpose for the check', 'Consent confirmation',
            ],
            'subject' => $subject,
            'confirmations' => [
                'Information supplied is accurate', 'The check is being requested for a permitted purpose',
                'The customer has authority or the required consent', 'The customer accepts the privacy notice and service limitations',
            ],
            'uploads' => match ($subjectType) {
                'individual' => ['ID or passport copy, if required', 'Proof of address, if applicable', 'Supporting authorisation or consent evidence', 'Relevant company or director documents, where applicable'],
                'project' => ['Feasibility study or project information memorandum', 'Financial model and funding plan', 'Permits, licences and environmental approvals', 'Key contracts and sponsor documents'],
                default => ['Registration / incorporation certificate', 'Shareholder register and organogram', 'Director and UBO identity documents', 'Board resolution authorising the check'],
            },
            'issues' => ['Incomplete names', 'Unreadable documents', 'Missing consent', 'Mismatched ID details', 'Unsupported file evidence', 'Incomplete address evidence'],
            'prepare' => [
                ['title' => 'Choose the correct package', 'body' => "Select the right {$familyName} service tier."],
                ['title' => 'Confirm purpose and authority', 'body' => 'Ensure the check is permitted and consentable.'],
                ['title' => 'Gather the minimum documents', 'body' => 'Collect and submit only what is needed.'],
                ['title' => 'Check data quality', 'body' => 'Verify names, dates and document details before submission.'],
            ],
        ];
    }

    /** Evidence register created on case activation (DD-035). */
    public static function evidenceTemplate(string $subjectType): array
    {
        return match ($subjectType) {
            'individual' => [
                ['key' => 'id_document', 'label' => 'Identity Document', 'description' => 'ID or passport copy of the subject', 'why' => 'Verifies the identity of the subject', 'type' => 'ID or passport copy', 'priority' => 'high', 'expected' => 1],
                ['key' => 'proof_address', 'label' => 'Proof of Address', 'description' => 'Utility bill or bank statement (< 3 months)', 'why' => 'Verifies residential address', 'type' => 'Utility bill or statement', 'priority' => 'high', 'expected' => 1],
                ['key' => 'consent_form', 'label' => 'Signed Subject Consent Form', 'description' => 'Signed consent for background screening', 'why' => 'Confirms lawful basis for processing', 'type' => 'Signed consent', 'priority' => 'high', 'expected' => 1],
                ['key' => 'cv', 'label' => 'CV / Employment History', 'description' => 'Latest CV with employment dates', 'why' => 'Supports employment verification', 'type' => 'CV', 'priority' => 'medium', 'expected' => 1],
                ['key' => 'qualifications', 'label' => 'Qualification Certificates', 'description' => 'Highest qualification certificates', 'why' => 'Supports education verification', 'type' => 'Certificates', 'priority' => 'low', 'expected' => 1],
                ['key' => 'other', 'label' => 'Other Supporting Documents', 'description' => 'Any additional relevant documents', 'why' => 'Various supporting records', 'type' => 'As applicable', 'priority' => 'optional', 'expected' => 5, 'required' => false],
            ],
            'project' => [
                ['key' => 'im', 'label' => 'Project Information Memorandum', 'description' => 'Project overview, scope and status', 'why' => 'Defines the project under review', 'type' => 'Memorandum', 'priority' => 'high', 'expected' => 1],
                ['key' => 'model', 'label' => 'Financial Model', 'description' => 'Latest financial model and assumptions', 'why' => 'Assesses viability and returns', 'type' => 'Spreadsheet', 'priority' => 'high', 'expected' => 1],
                ['key' => 'feasibility', 'label' => 'Feasibility / Technical Study', 'description' => 'Technical and engineering studies', 'why' => 'Assesses technical feasibility', 'type' => 'Study', 'priority' => 'high', 'expected' => 1],
                ['key' => 'permits', 'label' => 'Permits & Licences', 'description' => 'Permits, licences and approvals', 'why' => 'Confirms regulatory standing', 'type' => 'Permits', 'priority' => 'medium', 'expected' => 2],
                ['key' => 'contracts', 'label' => 'Key Contracts', 'description' => 'EPC, offtake and O&M agreements', 'why' => 'Assesses contractual risk', 'type' => 'Contracts', 'priority' => 'medium', 'expected' => 3],
                ['key' => 'sponsor', 'label' => 'Sponsor Documents', 'description' => 'Sponsor registration and ownership', 'why' => 'Verifies sponsor identity and control', 'type' => 'Company documents', 'priority' => 'medium', 'expected' => 1],
                ['key' => 'esg', 'label' => 'ESG / Environmental Approvals', 'description' => 'EIA and stakeholder engagement records', 'why' => 'Assesses ESG exposure', 'type' => 'Approvals', 'priority' => 'low', 'expected' => 1],
                ['key' => 'other', 'label' => 'Other Supporting Documents', 'description' => 'Any additional relevant documents', 'why' => 'Various supporting records', 'type' => 'As applicable', 'priority' => 'optional', 'expected' => 5, 'required' => false],
            ],
            default => [
                ['key' => 'incorporation', 'label' => 'Certificate of Incorporation', 'description' => 'Company registration certificate', 'why' => 'Confirms legal existence', 'type' => 'Registration certificate', 'priority' => 'high', 'expected' => 1],
                ['key' => 'moi', 'label' => 'Memorandum & Articles', 'description' => 'Constitution or founding documents', 'why' => 'Confirms constitution and powers', 'type' => 'Founding documents', 'priority' => 'medium', 'expected' => 1],
                ['key' => 'board_resolution', 'label' => 'Board Resolution', 'description' => 'Authorising this due diligence', 'why' => 'Confirms authority for due diligence', 'type' => 'Signed resolution', 'priority' => 'medium', 'expected' => 1],
                ['key' => 'shareholder_register', 'label' => 'Shareholder Register', 'description' => 'Latest register of shareholders', 'why' => 'Maps ownership and control', 'type' => 'Register', 'priority' => 'high', 'expected' => 1],
                ['key' => 'proof_address', 'label' => 'Proof of Registered Address', 'description' => 'Utility bill or lease agreement', 'why' => 'Verifies registered physical address', 'type' => 'Utility bill or lease agreement', 'priority' => 'high', 'expected' => 1],
                ['key' => 'financials', 'label' => 'Financial Statements', 'description' => 'Latest audited financial statements', 'why' => 'Assesses financial position and stability', 'type' => 'Audited statements', 'priority' => 'medium', 'expected' => 1],
                ['key' => 'tax', 'label' => 'Tax Compliance', 'description' => 'Tax clearance or compliance certificate', 'why' => 'Confirms tax compliance status', 'type' => 'Tax clearance certificate', 'priority' => 'low', 'expected' => 1],
                ['key' => 'ubo', 'label' => 'Ultimate Beneficial Owners', 'description' => 'UBO details and ID copies', 'why' => 'Verifies identity of ultimate beneficial owners', 'type' => 'ID or passport copies', 'priority' => 'high', 'expected' => 2],
                ['key' => 'identity', 'label' => 'Identity Documents', 'description' => 'Director / UBO ID or passport copies', 'why' => 'Verifies identity of directors', 'type' => 'ID or passport copies', 'priority' => 'high', 'expected' => 3],
                ['key' => 'other', 'label' => 'Other Supporting Documents', 'description' => 'Any additional relevant documents', 'why' => 'Various supporting records', 'type' => 'As applicable', 'priority' => 'optional', 'expected' => 5, 'required' => false],
            ],
        };
    }

    /** Vendor / registry check plan created on case activation (DD-037). Raw vendor output is never shown to clients. */
    public static function checkTemplate(string $subjectType, string $tier): array
    {
        $rows = match ($subjectType) {
            'individual' => [
                ['Identity Verification', 'Identity, document and liveness', 'Identity verification service', 'Approved provider', 6],
                ['Sanctions, PEP & Watchlists', 'Global sanctions, PEP and RCA lists', 'Global screening provider', 'Approved provider', 12],
                ['Adverse Media Check', 'News and open-source media', 'Media intelligence provider', 'Risk & compliance data', 10],
                ['Address Verification', 'Current and previous addresses', 'Address data service', 'Bureau data', 4],
                ['Employment & Education', 'Employers and institutions', 'TBCA verification desk', 'Direct confirmation', 6],
                ['Criminal / Reference Checks', 'Where lawfully permitted', 'Accredited record service', 'With subject consent', 3],
            ],
            'project' => [
                ['Sponsor & SPV Verification', 'Registry and ownership', 'CIPC', 'South Africa', 8],
                ['Commercial Viability Review', 'Market, offtake and pricing', 'TBCA expert panel', 'Specialist review', 6],
                ['Technical Feasibility Review', 'Design and engineering', 'Technical partner', 'Qualified partner', 6],
                ['Financial Model Review', 'CAPEX, OPEX and returns', 'TBCA expert panel', 'Specialist review', 8],
                ['Legal & Permits Review', 'Permits, land and contracts', 'Legal partner', 'Qualified partner', 6],
                ['ESG & Stakeholder Review', 'Environmental and social', 'ESG specialist', 'Specialist review', 5],
            ],
            default => [
                ['Director & UBO Checks', 'Identity, sanctions, PEP', 'Global screening provider', 'Approved provider', 24],
                ['Company Incorporation & Legal Status', 'Registry status and filings', 'CIPC', 'South Africa', 8],
                ['Adverse Media Check', 'News and open-source media', 'Media intelligence provider', 'Risk & compliance data', 10],
                ['Bank Verification', 'Account confirmation', 'Bank verification service', 'Verify', 6],
                ['Shareholding Structure & Ownership Mapping', 'Ownership chain', 'Ownership data provider', 'Commercial registry data', 10],
                ['Compliance & Regulatory Records', 'Licences and regulatory actions', 'Regulatory records provider', 'Regulatory intelligence', 5],
                ['Litigation & Judgments', 'Court and judgment records', 'Court records provider', 'Case monitor', 8],
            ],
        };

        if ($tier === 'essential') {
            $rows = array_slice($rows, 0, max(3, count($rows) - 3));
        }

        return array_map(fn ($r) => ['category' => $r[0], 'detail' => $r[1], 'vendor' => $r[2], 'vendor_detail' => $r[3], 'total' => $r[4]], $rows);
    }

    /** Select options used by the configurator and intake forms. */
    public static function options(): array
    {
        return [
            'subjectTypes' => [
                ['value' => 'company', 'label' => 'Company'], ['value' => 'individual', 'label' => 'Individual'],
                ['value' => 'institution', 'label' => 'Institution'], ['value' => 'project', 'label' => 'Project'],
            ],
            'jurisdictions' => [
                ['value' => 'South Africa', 'label' => 'South Africa'], ['value' => 'SADC', 'label' => 'Other SADC country'],
                ['value' => 'Africa', 'label' => 'Rest of Africa'], ['value' => 'International', 'label' => 'International (outside Africa)'],
            ],
            'purposes' => [
                'Investment decision', 'Supplier onboarding', 'Procurement / tender', 'Lending or credit', 'Employment or appointment',
                'Partnership or JV', 'Regulatory compliance (AML/KYC)', 'M&A transaction', 'Public-sector engagement',
            ],
            'uses' => ['Internal decision making', 'Board or committee approval', 'Investor or lender reliance', 'Regulatory record keeping', 'Procurement file'],
            'entityTypes' => ['Private company', 'Public company', 'State-owned entity', 'Non-profit / NGO', 'Trust', 'Partnership', 'Natural person'],
            'complexity' => [
                ['value' => 'standard', 'label' => 'Standard'], ['value' => 'complex', 'label' => 'Complex (layered ownership)'],
                ['value' => 'highly_complex', 'label' => 'Highly complex (multi-jurisdiction)'],
            ],
            'readiness' => [
                ['value' => 'high', 'label' => 'High'], ['value' => 'medium', 'label' => 'Medium'], ['value' => 'low', 'label' => 'Low'],
            ],
            'sla' => [
                ['value' => 'standard', 'label' => 'Standard'], ['value' => 'priority', 'label' => 'Priority (rush)'],
            ],
            'industries' => ['Utilities & Energy', 'Mining & Resources', 'Financial Services', 'Agriculture', 'Construction & Infrastructure', 'Technology', 'Manufacturing', 'Healthcare', 'Retail & Consumer', 'Public Sector', 'Other'],
        ];
    }

    /** Required intake fields by section (DD-018). */
    public static function inputSections(): array
    {
        return [
            'subject' => ['subject_type', 'subject_name', 'jurisdiction', 'purpose', 'expected_use'],
            'entity' => ['registration_number', 'entity_type', 'incorporation_date', 'industry', 'ownership_structure', 'ubo_count'],
            'declarations' => ['accurate', 'permitted_purpose', 'privacy_notice'],
        ];
    }
}
