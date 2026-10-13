<?php

namespace App\Support\Integrations;

/**
 * The automation recipes from section 9 of the TBCA Zoho One Implementation
 * Guide (11 October 2026), and the ledger event types that count towards each.
 *
 * Kind "routine" is work the platform is expected to finish without staff.
 * Kind "human_gate" is a decision the guide keeps with a named person (expert
 * review, adverse findings, refunds). Both count in the overall automation
 * share; only routine events count in the straight-through rate.
 */
class Processes
{
    public const PROCESSES = [
        'A1' => ['name' => 'Enquiry to discovery', 'human_gate' => 'Complex mandates; invalid contact details go to a correction queue.'],
        'A2' => ['name' => 'Paid Sprint to workspace', 'human_gate' => 'Service owner approves scope or payment-term exceptions.'],
        'A3' => ['name' => 'Evidence intake', 'human_gate' => 'Reviewer resolves ambiguous evidence; unsafe files stay quarantined.'],
        'A4' => ['name' => 'Due Diligence case processing', 'human_gate' => 'Identity matches, adverse findings, disputes and final release.'],
        'A5' => ['name' => 'Deal room access', 'human_gate' => 'Disclosure owner approves access; an NDA alone never grants it.'],
        'A6' => ['name' => 'Recurring entitlement', 'human_gate' => 'Finance approves refunds and credit exceptions.'],
        'A7' => ['name' => 'Milestone and delivery', 'human_gate' => 'Expert signs off final advisory content.'],
        'A8' => ['name' => 'Ticket and recovery', 'human_gate' => 'Complaints and sensitive issues get human review.'],
        'A9' => ['name' => 'AIIM data freshness', 'human_gate' => 'Researcher reviews material changes.'],
        'A10' => ['name' => 'Operational control', 'human_gate' => 'Operator decides corrections for failed or blocked work.'],
    ];

    /** type => [process, kind, direction, label] */
    public const TYPES = [
        'enquiry.received' => ['A1', 'routine', 'outbound', 'Enquiry or form submission to CRM'],
        'webinar.registered' => ['A1', 'routine', 'outbound', 'Webinar registration to CRM'],
        'order.payment_verified' => ['A2', 'routine', 'outbound', 'Paid order to CRM, Books, Projects and WorkDrive'],
        'books.invoice_paid' => ['A2', 'routine', 'inbound', 'Invoice paid in Zoho Books'],
        'sign.completed' => ['A2', 'routine', 'inbound', 'Signature completed in Zoho Sign'],
        'dd.case_created' => ['A4', 'routine', 'outbound', 'Due Diligence case to Creator and CRM'],
        'dd.verification_result' => ['A4', 'routine', 'internal', 'Identity provider result applied to a check'],
        'review.decided' => ['A4', 'human_gate', 'inbound', 'Expert review decision recorded in Creator'],
        'vdr.enquiry_submitted' => ['A5', 'routine', 'outbound', 'Deal room enquiry to CRM and Creator'],
        'billing.subscription_updated' => ['A6', 'routine', 'inbound', 'Subscription state from Zoho Billing'],
        'projects.milestone_updated' => ['A7', 'routine', 'inbound', 'Milestone change from Zoho Projects'],
        'support.requested' => ['A8', 'routine', 'outbound', 'Support request to Zoho Desk'],
        'desk.ticket_updated' => ['A8', 'routine', 'inbound', 'Ticket status from Zoho Desk'],
        'flow.completed' => ['A10', 'routine', 'inbound', 'Zoho Flow confirms an event was processed'],
        'flow.failed' => ['A10', 'routine', 'inbound', 'Zoho Flow reports a failed event'],
    ];

    public static function processOf(string $type): ?string
    {
        return self::TYPES[$type][0] ?? null;
    }

    public static function kindOf(string $type): string
    {
        return self::TYPES[$type][1] ?? 'routine';
    }

    public static function inboundTypes(): array
    {
        return array_keys(array_filter(self::TYPES, fn ($t) => $t[2] === 'inbound'));
    }

    public static function typesFor(string $process): array
    {
        return array_keys(array_filter(self::TYPES, fn ($t) => $t[0] === $process));
    }
}
