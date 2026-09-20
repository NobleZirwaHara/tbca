<?php

namespace App\Support\Content;

/**
 * Part 4 — Due Diligence Platform.
 * Consent. Evidence. Screening. Human review where risk requires it. Portal delivery.
 */
class DueDiligence
{
    public static function positioning(): array
    {
        return [
            'trust_line' => 'Consent. Evidence. Screening. Human review where risk requires it. Portal delivery.',
            'boundary' => 'TBCA Due Diligence supports risk screening and decision preparation. It does not replace legal, tax, credit, employment, procurement, investment, audit, assurance or regulated professional advice.',
            'intro' => 'Due Diligence combines consent, evidence collection, approved vendor checks, AI-assisted analysis, risk classification, human or qualified-partner review, report delivery, monitoring and enterprise dashboards.',
        ];
    }

    /** Section 17 — canonical routes and product families. */
    public static function routes(): array
    {
        return [
            ['page' => 'Overview', 'slug' => '', 'route' => '/due-diligence', 'purpose' => 'Explain scope, consent, workflow, limitations and routes.', 'icon' => 'shield-check'],
            ['page' => 'Individual Checks', 'slug' => 'individual', 'route' => '/due-diligence/individual', 'purpose' => 'Identity, sanctions, PEP, adverse media and enhanced evidence.', 'icon' => 'user-search'],
            ['page' => 'Company Checks', 'slug' => 'company', 'route' => '/due-diligence/company', 'purpose' => 'Registration, status, directors, ownership, risk and evidence.', 'icon' => 'building-2'],
            ['page' => 'Supplier Checks', 'slug' => 'supplier', 'route' => '/due-diligence/supplier', 'purpose' => 'Compliance, capacity, financial and procurement readiness.', 'icon' => 'package-search'],
            ['page' => 'Director and UBO', 'slug' => 'director-ubo', 'route' => '/due-diligence/director-ubo', 'purpose' => 'Director, beneficial ownership and control evidence.', 'icon' => 'network'],
            ['page' => 'Investor Checks', 'slug' => 'investor', 'route' => '/due-diligence/investor', 'purpose' => 'Credibility, source evidence, mandate and risk.', 'icon' => 'trending-up'],
            ['page' => 'Project Sponsor Checks', 'slug' => 'project-sponsor', 'route' => '/due-diligence/project-sponsor', 'purpose' => 'Track record, governance, capacity and funding readiness.', 'icon' => 'layout-template'],
            ['page' => 'Institution Checks', 'slug' => 'institution', 'route' => '/due-diligence/institution', 'purpose' => 'Registration, governance, counterparties and risk.', 'icon' => 'landmark'],
            ['page' => 'AML, KYC and KYB', 'slug' => 'aml-kyc-kyb', 'route' => '/due-diligence/aml-kyc-kyb', 'purpose' => 'Structured onboarding, evidence and screening.', 'icon' => 'scan-face'],
            ['page' => 'Project Due Diligence', 'slug' => 'project', 'route' => '/due-diligence/project', 'purpose' => 'Commercial, legal, technical, financial, ESG and institutional coordination.', 'icon' => 'clipboard-list'],
            ['page' => 'Enterprise Screening', 'slug' => 'enterprise', 'route' => '/due-diligence/enterprise', 'purpose' => 'Bulk supplier or counterparty screening and procurement desk.', 'icon' => 'layers'],
            ['page' => 'Monitoring', 'slug' => 'monitoring', 'route' => '/due-diligence/monitoring', 'purpose' => 'Recurring screening, alerts, review and renewal.', 'icon' => 'radar'],
            ['page' => 'Reports and Dashboards', 'slug' => 'reports', 'route' => '/due-diligence/reports', 'purpose' => 'Entitled reports, portfolio dashboards and management views.', 'icon' => 'bar-chart-3'],
            ['page' => 'Portal and API Setup', 'slug' => 'enterprise-api', 'route' => '/due-diligence/enterprise-api', 'purpose' => 'Hosted intake, API, enterprise integration and support.', 'icon' => 'plug'],
        ];
    }

    public static function findRoute(string $slug): ?array
    {
        foreach (self::routes() as $route) {
            if ($route['slug'] === $slug) {
                return $route;
            }
        }

        return null;
    }

    /** Table 18 — Due Diligence product SKU register. */
    public static function skus(): array
    {
        return [
            [
                'sku' => 'DD-IND-QC',
                'name' => 'Individual Quick Check',
                'family' => 'individual',
                'checks' => 'Identity data capture, ID or document flow where available, sanctions, PEP, adverse media and watchlist screening.',
                'automation' => 'High',
                'review_rule' => 'Only if mismatch, hit, poor data quality or client dispute.',
                'zar' => 890,
                'usd' => 52,
                'turnaround' => '1-2 days',
            ],
            [
                'sku' => 'DD-IND-EDD',
                'name' => 'Individual Enhanced Due Diligence',
                'family' => 'individual',
                'checks' => 'Quick Check plus proof of address where available, enhanced adverse media, director links where available and evidence pack.',
                'automation' => 'Medium',
                'review_rule' => 'Always before final report.',
                'zar' => 2450,
                'usd' => 138,
                'turnaround' => '3-5 days',
            ],
            [
                'sku' => 'DD-COMP-QC',
                'name' => 'Company Quick Check',
                'family' => 'company',
                'checks' => 'Registration status, company profile, sanctions and watchlist checks, basic director data where available.',
                'automation' => 'High',
                'review_rule' => 'Only if registry mismatch, company inactive or risk hit.',
                'zar' => 1250,
                'usd' => 72,
                'turnaround' => '1-2 days',
            ],
            [
                'sku' => 'DD-COMP-EDD',
                'name' => 'Company Enhanced Due Diligence',
                'family' => 'company',
                'checks' => 'Company verification, directors, UBO request, adverse media, sanctions, PEP exposure and company intelligence where available.',
                'automation' => 'Medium',
                'review_rule' => 'Always before final report.',
                'zar' => 3950,
                'usd' => 222,
                'turnaround' => '4-7 days',
            ],
            [
                'sku' => 'DD-SUPPLIER',
                'name' => 'Supplier Due Diligence',
                'family' => 'supplier',
                'checks' => 'Company check, directors, UBO, sanctions, adverse media, risk score and procurement red flags.',
                'automation' => 'Medium',
                'review_rule' => 'Always for high-value suppliers or red flags.',
                'zar' => 3200,
                'usd' => 180,
                'turnaround' => '3-6 days',
            ],
            [
                'sku' => 'DD-DIR-UBO',
                'name' => 'Director and UBO Check',
                'family' => 'director-ubo',
                'checks' => 'Director identity, beneficial owner intake, AML screening and links to company records where available.',
                'automation' => 'Medium',
                'review_rule' => 'Always if used for funding, procurement, investment or enterprise onboarding.',
                'zar' => 2850,
                'usd' => 160,
                'turnaround' => '3-5 days',
            ],
            [
                'sku' => 'DD-INV-PS',
                'name' => 'Investor or Project Sponsor Check',
                'family' => 'investor',
                'checks' => 'Company, director, ownership, sanctions, PEP, adverse media, project sponsor profile and reputational risk.',
                'automation' => 'Medium-low',
                'review_rule' => 'Always senior review.',
                'zar' => 6400,
                'usd' => 360,
                'turnaround' => '5-10 days',
            ],
            [
                'sku' => 'DD-INST',
                'name' => 'Institution Due Diligence',
                'family' => 'institution',
                'checks' => 'Legal status, ownership, public data review, sanctions, adverse media and governance notes.',
                'automation' => 'Medium-low',
                'review_rule' => 'Always senior review.',
                'zar' => 5800,
                'usd' => 325,
                'turnaround' => '5-10 days',
            ],
            [
                'sku' => 'DD-MON-M',
                'name' => 'Monthly Monitoring',
                'family' => 'monitoring',
                'checks' => 'Ongoing sanctions, PEP, adverse media and watchlist monitoring for selected individuals or companies.',
                'automation' => 'High after setup',
                'review_rule' => 'Human review only when an alert is triggered.',
                'zar' => 420,
                'usd' => 25,
                'turnaround' => 'Per subject, per month',
            ],
            [
                'sku' => 'DD-ENT-RET',
                'name' => 'Enterprise Vendor Screening Retainer',
                'family' => 'enterprise',
                'checks' => 'Bulk company and supplier screening, monitoring, risk dashboard and monthly report.',
                'automation' => 'Medium',
                'review_rule' => 'Monthly QA and escalation review.',
                'zar' => null,
                'usd' => null,
                'turnaround' => 'Contracted service level',
            ],
        ];
    }

    public static function skusForFamily(string $family): array
    {
        return array_values(array_filter(self::skus(), fn ($sku) => $sku['family'] === $family));
    }

    /** Section 19 — case status machine. */
    public static function caseStatuses(): array
    {
        return [
            ['status' => 'Draft', 'meaning' => 'Case created. Required client and subject data are incomplete.', 'control' => 'No vendor action.'],
            ['status' => 'Consent Pending', 'meaning' => 'Required consent or purpose confirmation is missing.', 'control' => 'Block verification.'],
            ['status' => 'Payment Pending', 'meaning' => 'Payment or enterprise approval is incomplete.', 'control' => 'Block verification and delivery.'],
            ['status' => 'Intake Open', 'meaning' => 'Client can complete forms and upload evidence.', 'control' => 'Reminders and completeness validation.'],
            ['status' => 'Ready for Checks', 'meaning' => 'Required fields and documents passed validation.', 'control' => 'Allow approved vendor workflow.'],
            ['status' => 'Checks Running', 'meaning' => 'One or more vendor or registry checks are in progress.', 'control' => 'Track provider, cost, result and error.'],
            ['status' => 'Review Required', 'meaning' => 'Hit, mismatch, low confidence, enterprise use or other trigger exists.', 'control' => 'Lock release and create reviewer task.'],
            ['status' => 'Report Draft', 'meaning' => 'AI-assisted or template-based report prepared.', 'control' => 'QA and source validation required.'],
            ['status' => 'Approved for Release', 'meaning' => 'Reviewer or approved low-risk rule permits delivery.', 'control' => 'Create final version and portal event.'],
            ['status' => 'Delivered', 'meaning' => 'Client received the approved report.', 'control' => 'Start support and acceptance window.'],
            ['status' => 'Disputed', 'meaning' => 'Client has challenged result, identity or evidence.', 'control' => 'Lock downstream use and create support ticket.'],
            ['status' => 'Monitoring', 'meaning' => 'Subject enrolled in recurring checks.', 'control' => 'Run scheduled events and alert rules.'],
            ['status' => 'Closed', 'meaning' => 'Case completed, accepted or formally terminated.', 'control' => 'Apply retention and closure controls.'],
        ];
    }

    /** Section 20 — end-to-end workflow. */
    public static function workflow(): array
    {
        return [
            ['step' => 1, 'event' => 'Client selects product and permitted use.', 'action' => 'Commerce event and CRM interest.'],
            ['step' => 2, 'event' => 'Privacy, consent and service limitations are accepted.', 'action' => 'Consent record linked to client and case.'],
            ['step' => 3, 'event' => 'Payment or enterprise proposal route completes.', 'action' => 'Finance event, case activation and entitlement.'],
            ['step' => 4, 'event' => 'Portal opens the correct intake and evidence request.', 'action' => 'Document folder and delivery task created.'],
            ['step' => 5, 'event' => 'Completeness and validation rules run.', 'action' => 'Missing or invalid items create client action.'],
            ['step' => 6, 'event' => 'Approved vendor or registry checks execute.', 'action' => 'Result, source, cost, timestamp and status recorded.'],
            ['step' => 7, 'event' => 'AI summarises evidence and identifies anomalies.', 'action' => 'Draft enters the DD review queue.'],
            ['step' => 8, 'event' => 'Risk engine applies release rules.', 'action' => 'High-risk, enterprise or low-confidence cases lock.'],
            ['step' => 9, 'event' => 'Human or qualified-partner review applies.', 'action' => 'Decision, evidence note, limitation and approval saved.'],
            ['step' => 10, 'event' => 'Final report is generated and delivered in the portal.', 'action' => 'Version, notification and dashboard event recorded.'],
            ['step' => 11, 'event' => 'Dispute, support, monitoring and renewal routes remain available.', 'action' => 'Support, subscription and client-success workflows.'],
        ];
    }

    /** Section 21 — human and partner review matrix. */
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

    /** Section 23 — security and acceptance controls shown publicly. */
    public static function controls(): array
    {
        return [
            ['control' => 'Consent and purpose limitation', 'requirement' => 'Verification may not start without required consent and permitted purpose.'],
            ['control' => 'Data minimisation', 'requirement' => 'Collect only fields and documents required for the selected product and jurisdiction.'],
            ['control' => 'Role-based access', 'requirement' => 'Clients see their own cases. Staff and partners see only assigned records.'],
            ['control' => 'Multi-factor authentication', 'requirement' => 'Mandatory for administrators, reviewers, partners and vendor accounts where supported.'],
            ['control' => 'Sensitive result handling', 'requirement' => 'Sensitive results are not disclosed by message or email. Notification states only that a portal action is available.'],
            ['control' => 'Vendor controls', 'requirement' => 'Data processing agreement, security review, official API, country coverage and cost approval before go-live.'],
            ['control' => 'AI controls', 'requirement' => 'Prompt version, source inputs, risk class, reviewer and final release status are logged.'],
            ['control' => 'Payment controls', 'requirement' => 'Transaction ID and status are stored. Card numbers are not.'],
            ['control' => 'Retention', 'requirement' => 'Approved case-type and document-class retention applies. Dispute and audit evidence is preserved.'],
            ['control' => 'Incident response', 'requirement' => 'Data breach, wrong report, vendor failure or client dispute creates an incident or support case.'],
        ];
    }

    /** Table 21 — report templates. */
    public static function reportTemplates(): array
    {
        return [
            ['type' => 'Individual Quick Check Report', 'sections' => 'Subject details, consent record, identity verification summary, sanctions, PEP, adverse media, result status, risk score, limitations and timestamp.'],
            ['type' => 'Individual Enhanced Due Diligence Report', 'sections' => 'Quick Check sections plus proof of address, detailed adverse media summary, director and company links, evidence summary and reviewer notes.'],
            ['type' => 'Company Quick Check Report', 'sections' => 'Company details, registration status, country, directors, sanctions and watchlist results, basic adverse media, risk score and limitations.'],
            ['type' => 'Company Enhanced Due Diligence Report', 'sections' => 'Quick sections plus directors, shareholders, UBO request, company intelligence, adverse media, ownership risks and reviewer conclusion.'],
            ['type' => 'Supplier Due Diligence Report', 'sections' => 'Company verification, procurement risk flags, ownership, sanctions, PEP exposure, reputational risk, continuity notes and recommended next steps.'],
            ['type' => 'Investor or Project Sponsor Report', 'sections' => 'Sponsor profile, ownership, director checks, adverse media, sanctions, project history, funding credibility indicators, risk register and senior review note.'],
            ['type' => 'Monitoring Alert Report', 'sections' => 'Alert date, monitored subject, vendor alert, match assessment, risk impact, recommended action and reviewer decision.'],
        ];
    }

    /** Portal areas for Due Diligence clients. */
    public static function portalAreas(): array
    {
        return [
            ['area' => 'My Due Diligence Cases', 'info' => 'Case ID, product, subject, status, SLA, action required and owner.'],
            ['area' => 'Consent and Privacy', 'info' => 'Consent purpose, date, vendor disclosure, withdrawal route and privacy notice.'],
            ['area' => 'Intake and Evidence', 'info' => 'Forms, required documents, validation and upload status.'],
            ['area' => 'Results and Reports', 'info' => 'Approved final reports only, with version and limitation notice.'],
            ['area' => 'Monitoring', 'info' => 'Subjects, frequency, last run, next run, alerts and review status.'],
            ['area' => 'Disputes and Support', 'info' => 'False-positive request, complaint, correction, refund and ticket status.'],
            ['area' => 'Enterprise Dashboard', 'info' => 'Portfolio, suppliers, cases, risk distribution, SLA and alert metrics.'],
            ['area' => 'API and Integration', 'info' => 'Approved API keys, endpoints, usage, errors and support contacts.'],
        ];
    }
}
