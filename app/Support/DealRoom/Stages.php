<?php

namespace App\Support\DealRoom;

/**
 * The corrected transaction ecosystem (blueprint section 7): stages A, B, C
 * before the room exists commercially, then 0-15. Each stage declares its
 * start condition, output, revenue logic and gate: manual completion-test
 * ticks, named human approvals and an optional prepaid stage fee. Data-driven
 * checks (documents approved, CPs satisfied ...) are computed by Workflow.
 */
class Stages
{
    public const LOCK_RULE = 'If payment, authority, consent, permission, mandatory evidence or human approval is missing, the next stage remains locked. Existing authorised users may retain only the access needed to remedy the failure.';

    /** @return array<string, array<string, mixed>> */
    public static function all(): array
    {
        return [
            'A' => [
                'name' => 'Enquiry and Lead Qualification', 'short' => 'Enquiry', 'page' => 'enquiry', 'phase' => 'Pre-Mandate',
                'start' => 'Initial interest or referral is received.',
                'output' => 'Qualified lead, conflict result and next-step recommendation.',
                'revenue' => 'Deal diagnostic fee only if paid route is accepted.',
            ],
            'B' => [
                'name' => 'Deal Diagnostic and Commercial Proposal', 'short' => 'Diagnostic', 'page' => 'diagnostic', 'phase' => 'Pre-Mandate',
                'start' => 'Lead passes preliminary conflict and eligibility checks.',
                'output' => 'Diagnostic, scope, complexity tier, fee estimate and proposal.',
                'revenue' => 'Diagnostic and structuring expert fees.',
                'checks' => ['proposal_reviewed' => 'Commercial proposal summary reviewed by the sponsor'],
            ],
            'C' => [
                'name' => 'Mandate, Engagement and Payment Gate', 'short' => 'Mandate', 'page' => 'mandate', 'phase' => 'Pre-Mandate',
                'start' => 'Client accepts proposal.',
                'output' => 'Signed mandate, consent, accepted fee schedule and cleared deposit.',
                'revenue' => 'Mandate, activation deposit and approved third-party prepayments.',
            ],
            '0' => [
                'name' => 'Deal Creation and Workspace Configuration', 'short' => 'Configure', 'page' => 'setup', 'phase' => 'Configure',
                'start' => 'Mandate signed and activation payment cleared.',
                'output' => 'Deal ID, room, folders, roles, agents, baseline and audit register.',
                'revenue' => 'Activation and configuration platform fees.',
            ],
            '1' => [
                'name' => 'Sponsor Secure Onboarding', 'short' => 'Onboard', 'page' => 'sponsor-onboarding', 'phase' => 'Configure',
                'start' => 'Workspace is live.',
                'output' => 'Verified sponsor authority, role assignments, readiness questionnaire.',
                'revenue' => 'KYC/KYB and onboarding fees.',
                'checks' => [
                    'primary_contact' => 'Primary contact verification',
                    'company_verification' => 'Company verification (registration and legal standing)',
                    'identity_documents' => 'Identity documents uploaded for the primary contact',
                    'proof_of_authority' => 'Proof of authority (board resolution or mandate letter)',
                    'two_factor' => 'Two-factor authentication enabled',
                    'password' => 'Secure password created',
                    'security_questions' => 'Security questions set up',
                    'device_trust' => 'Device registered as trusted',
                ],
            ],
            '2' => [
                'name' => 'Data Room Build and AI Document Intake', 'short' => 'Data', 'page' => 'data-room-build', 'phase' => 'Prepare',
                'start' => 'Onboarding complete.',
                'output' => 'Classified evidence, completeness score, red-flag register and release queue.',
                'revenue' => 'Document pack, OCR, digitisation, readiness and expert clean-up fees.',
            ],
            '3' => [
                'name' => 'Buyer, Investor or Lender Qualification', 'short' => 'Qualify', 'page' => 'counterparty-qualification', 'phase' => 'Prepare',
                'start' => 'Sponsor nominates or approves counterparty.',
                'output' => 'Verified counterparty, NDA, funding pathway and access tier.',
                'revenue' => 'Verification, dedicated workspace and premium research fees.',
            ],
            '4' => [
                'name' => 'Controlled Access', 'short' => 'Access', 'page' => 'controlled-access-and-disclosure', 'phase' => 'Prepare',
                'start' => 'Counterparty passes qualification and NDA gate.',
                'output' => 'Watermarked role-specific access and activity evidence.',
                'revenue' => 'Access administration, extra seat, buyer-group and storage fees.',
                'checks' => ['matrix_reviewed' => 'Participant access matrix reviewed by the room owner'],
            ],
            '5' => [
                'name' => 'Due Diligence and Q&A', 'short' => 'Diligence', 'page' => 'ai-qa-assistant', 'phase' => 'Diligence',
                'start' => 'Controlled access opens.',
                'output' => 'Structured RFI bank, approved answers, risk register and expert escalations.',
                'revenue' => 'AI Q&A, diligence modules and expert review fees.',
            ],
            '6' => [
                'name' => 'Financial Analysis and Quality of Earnings', 'short' => 'Finance', 'page' => 'financial-analysis', 'phase' => 'Diligence',
                'start' => 'Minimum financial evidence is complete.',
                'output' => 'Financial health, QoE bridge, working capital, debt and concern list.',
                'revenue' => 'Financial intelligence and TBCA/external finance review fees.',
                'checks' => [
                    'qoe_pack' => 'QoE review pack is approved',
                    'disputed_items' => 'All disputed items are logged and acknowledged',
                ],
                'approvals' => [
                    ['Michael Tumi', 'Internal Finance Lead'],
                    ['Aisha Sekele', 'Sponsor Owner / Founder'],
                    ['John Dlamini', 'TBCA Deal Advisor'],
                    ['TBCA Finance Review', 'TBCA Finance Reviewer'],
                ],
                'fee' => ['code' => 'FIN-601', 'name' => 'TBCA finance review (QoE pack)', 'net' => 45000],
            ],
            '7' => [
                'name' => 'Valuation and Price Bridge', 'short' => 'Value', 'page' => 'valuation-price-bridge', 'phase' => 'Diligence',
                'start' => 'Validated financial analysis is available.',
                'output' => 'Low/base/high valuation range, value drivers and negotiation bridge.',
                'revenue' => 'Valuation support, model and independent valuer fees.',
                'checks' => [
                    'methodologies' => 'Methodologies selected and weighted',
                    'neutral_bridge' => 'Neutral price bridge confirmed',
                ],
                'approvals' => [
                    ['Lindiwe K.', 'Sponsor Finance Review'],
                    ['Thuste R.', 'TBCA Valuation Review'],
                    ['Independent Valuer', 'Independent Valuer Review'],
                ],
                'fee' => ['code' => 'VAL-2405', 'name' => 'Valuation support and independent valuer fee', 'net' => 65000],
            ],
            '8' => [
                'name' => 'Negotiation Preparation', 'short' => 'Prepare', 'page' => 'negotiation-preparation', 'phase' => 'Negotiate',
                'start' => 'Principals accept negotiation readiness.',
                'output' => 'Stakeholder map, red lines, concessions, issue map and agenda.',
                'revenue' => 'Preparation brief and CNO advisory fees.',
                'checks' => [
                    'team_ready' => 'Negotiation team aligned and ready',
                    'strategy' => 'Strategy, walk-away and target range approved',
                    'red_lines' => 'Red lines and concessions recorded',
                    'pack' => 'Negotiation pack documents complete',
                ],
                'approvals' => [['Kruger Phiri', 'Deal Lead (Sponsor)']],
            ],
            '9' => [
                'name' => 'Live Negotiation Room', 'short' => 'Negotiate', 'page' => 'live-negotiation', 'phase' => 'Negotiate',
                'start' => 'Agenda and attendee approvals complete.',
                'output' => 'Decision log, action register, updated economics and approved minutes.',
                'revenue' => 'Session, facilitation, recording and reviewed minutes fees.',
                'fee' => ['code' => 'NEG-901', 'name' => 'Live negotiation facilitation and reviewed minutes', 'net' => 25000],
            ],
            '10' => [
                'name' => 'Offer and Term-Sheet Management', 'short' => 'Offers', 'page' => 'offer-term-sheet-management', 'phase' => 'Negotiate',
                'start' => 'A party submits an offer or counteroffer.',
                'output' => 'Version-controlled active offer, comparison and commercial-impact view.',
                'revenue' => 'Offer comparison and term-sheet administration fees.',
                'approvals' => [
                    ['Aisha Sekele', 'Sponsor Commercial Approval'],
                    ['Lerato Pillay', 'Legal Review (Sponsor Counsel)'],
                ],
            ],
            '11' => [
                'name' => 'Legal Documentation', 'short' => 'Legal', 'page' => 'legal-documentation', 'phase' => 'Legal and Close',
                'start' => 'Heads of terms or active offer is authorised.',
                'output' => 'Draft suite, clause issues, disclosure schedules and approval record.',
                'revenue' => 'Platform legal workflow plus external lawyer actual cost and margin.',
                'approvals' => [
                    ['John Dlamini', 'Sponsor Approval (TBCA)'],
                    ['De Wet & Partners', 'Buyer Counsel Approval'],
                ],
            ],
            '12' => [
                'name' => 'Conditions Precedent and Closing Readiness', 'short' => 'CPs', 'page' => 'conditions-precedent', 'phase' => 'Legal and Close',
                'start' => 'Definitive documentation reaches execution track.',
                'output' => 'CP tracker, evidence, closing readiness and escalations.',
                'revenue' => 'CP administration and expert certification fees.',
                'approvals' => [
                    ['Aisha Sekele', 'Sponsor CP Certification'],
                    ['Lerato Pillay', 'Legal Counsel Confirmation'],
                    ['David M.', 'Investor Representative Sign-Off'],
                    ['John Dlamini', 'TBCA Deal Advisor Confirmation'],
                ],
            ],
            '13' => [
                'name' => 'Signing, Completion and Financial Close', 'short' => 'Close', 'page' => 'signing-completion-close', 'phase' => 'Legal and Close',
                'start' => 'CP threshold and signing approvals are met.',
                'output' => 'Signed documents, funds evidence, completion certificate and closing pack.',
                'revenue' => 'Fixed completion, closing pack, e-signature and bank cost fees.',
                'checks' => ['funds_flow' => 'Funds-flow evidence verified (TBCA does not take custody of proceeds)'],
                'fee' => ['code' => 'CMP-1301', 'name' => 'Fixed completion fee (not percentage based)', 'net' => 120000],
            ],
            '14' => [
                'name' => 'Post-Closing Handover and Integration', 'short' => 'Handover', 'page' => 'post-closing-handover', 'phase' => 'Post-Close',
                'start' => 'Completion certificate issued.',
                'output' => 'Handover pack, integration actions, warranty and earn-out controls.',
                'revenue' => 'Post-close implementation and monitoring fees.',
                'approvals' => [
                    ['Aisha Sekele', 'Sponsor Handover Acceptance'],
                    ['John Dlamini', 'TBCA Deal Advisor Confirmation'],
                ],
            ],
            '15' => [
                'name' => 'Archive, Monitoring, Renewals and Exit', 'short' => 'Archive', 'page' => 'archive-monitoring-exit', 'phase' => 'Post-Close',
                'start' => 'Handover accepted or room reaches terminal state.',
                'output' => 'Secure archive, retention or legal hold, renewal or deletion evidence.',
                'revenue' => 'Archive subscription, legal hold, re-verification and reporting fees.',
                'checks' => [
                    'deal_bible' => 'Deal Bible and final archive pack archived',
                    'retention' => 'Retention policy and legal hold configured',
                    'monitoring' => 'Monitoring and re-verification options activated or declined',
                ],
                'approvals' => [
                    ['Michael Tumi', 'Final Closure Acceptance'],
                    ['Sarah L.', 'Data Privacy Sign-Off'],
                ],
            ],
        ];
    }

    /** @return list<string> */
    public static function codes(): array
    {
        return array_map('strval', array_keys(self::all()));
    }

    public static function get(string $code): array
    {
        return self::all()[$code] ?? abort(404);
    }

    public static function index(string $code): int
    {
        return array_search($code, self::codes(), true);
    }

    public static function next(string $code): ?string
    {
        return self::codes()[self::index($code) + 1] ?? null;
    }

    /** Stage code that owns a page slug (some stages have secondary pages). */
    public static function forPage(string $page): ?string
    {
        $extra = [
            'ai-intake-review' => '2',
            'review-and-send-invitations' => '3',
            'created' => '0',
            'archive-renewal' => '15',
        ];
        if (isset($extra[$page])) {
            return $extra[$page];
        }
        foreach (self::all() as $code => $s) {
            if ($s['page'] === $page) {
                return (string) $code;
            }
        }

        return null;
    }

    public static function label(string $code): string
    {
        return in_array($code, ['A', 'B', 'C'], true) ? "Stage {$code}" : "Stage {$code}";
    }
}
