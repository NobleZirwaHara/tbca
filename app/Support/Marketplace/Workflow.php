<?php

namespace App\Support\Marketplace;

use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\PartnerRequest;
use Illuminate\Support\Carbon;

/**
 * State machines and stage maps for briefs, engagements, deliverables,
 * disputes, providers and Partner Services matters.
 */
class Workflow
{
    /* --- Brief -------------------------------------------------------- */
    // draft -> awaiting_buyer_confirmation -> scope_accepted -> disclosure_complete -> awaiting_payment -> assigned
    public const BRIEF_STATUSES = [
        'draft' => 'Draft',
        'awaiting_buyer_confirmation' => 'Awaiting Buyer Confirmation',
        'clarification_requested' => 'Clarification Requested',
        'scope_accepted' => 'Scope Accepted',
        'disclosure_complete' => 'Disclosure Complete',
        'awaiting_payment' => 'Awaiting Payment',
        'assigned' => 'Assigned',
        'blocked_below_floor' => 'Blocked Below Floor',
    ];

    public const BRIEF_JOURNEY = ['Scope & Price', 'Disclosure', 'Checkout', 'Assignment', 'Delivery'];

    public static function briefJourneyStep(string $status): int
    {
        return match ($status) {
            'scope_accepted' => 2,
            'disclosure_complete', 'awaiting_payment' => 3,
            'assigned' => 4,
            default => 1,
        };
    }

    /* --- Engagement (buyer view, 8 stages) ------------------------------ */
    public const ENGAGEMENT_STAGES = ['Brief Accepted', 'Provider Assigned', 'Work Started', 'In QA Review', 'Corrections', 'Final QA', 'Delivery Ready', 'Delivered'];

    public const DELIVERABLE_STAGES = ['Brief Accepted', 'Provider Assigned', 'Work Started', 'In QA Review', 'Deliverable Received', 'Acceptance', 'Corrections (if any)', 'Closed'];

    public const PROVIDER_STAGES = ['Proposal Submitted', 'Shortlisted', 'Brief Received', 'Review & QA', 'Rate Acceptance', 'Work Submission', 'Client Review', 'Completed'];

    /** 1-based index into ENGAGEMENT_STAGES for the tracker. */
    public static function trackerStep(Engagement $e): int
    {
        return match ($e->stage) {
            'awaiting_payment' => 1,
            'assigned' => 2,
            'in_progress' => 3,
            'in_qa' => 4,
            'corrections' => 5,
            'released' => 7,
            'accepted', 'closed' => 9,
            'disputed' => 7,
            default => 2,
        };
    }

    public static function deliverableStep(Engagement $e): int
    {
        return match ($e->stage) {
            'in_progress' => 3,
            'in_qa' => 4,
            'released' => 5,
            'corrections' => 7,
            'accepted' => 8,
            'closed' => 9,
            default => 2,
        };
    }

    public static function providerStep(Engagement $e): int
    {
        return match ($e->stage) {
            'assigned' => 5,
            'in_progress', 'corrections' => 6,
            'in_qa', 'released', 'disputed' => 7,
            'accepted', 'closed' => 9,
            default => 4,
        };
    }

    public const ENGAGEMENT_LABELS = [
        'awaiting_payment' => 'Awaiting Payment',
        'assigned' => 'Assigned',
        'in_progress' => 'In Progress',
        'in_qa' => 'In QA Review',
        'corrections' => 'Corrections Requested',
        'released' => 'Deliverable Received',
        'accepted' => 'Accepted',
        'closed' => 'Completed',
        'disputed' => 'Disputed',
    ];

    /* --- QA review object (blueprint 4.4) ------------------------------ */
    // SUBMITTED -> IN_REVIEW -> PASS / RETURN_R1 / RETURN_R2 / REJECT
    public const QA_ACTIONS = [
        'start' => ['from' => ['submitted'], 'to' => 'in_review'],
        'pass' => ['from' => ['submitted', 'in_review'], 'to' => 'released'],
        'return_r1' => ['from' => ['submitted', 'in_review'], 'to' => 'returned_r1'],
        'return_r2' => ['from' => ['submitted', 'in_review'], 'to' => 'returned_r2'],
        'reject' => ['from' => ['submitted', 'in_review'], 'to' => 'rejected'],
    ];

    /* --- Disputes ------------------------------------------------------ */
    public const DISPUTE_STAGES = ['Dispute Raised', 'Acknowledged', 'Under Review', 'Mediation (If needed)', 'Decision', 'Resolution', 'Closed'];

    public const DISPUTE_ORDER = ['raised', 'acknowledged', 'under_review', 'mediation', 'decision', 'resolved', 'closed'];

    /** Admin console transitions. */
    public const DISPUTE_ACTIONS = [
        'acknowledge' => ['from' => ['raised', 'open'], 'to' => 'acknowledged', 'label' => 'Acknowledge'],
        'review' => ['from' => ['acknowledged', 'open', 'escalated'], 'to' => 'under_review', 'label' => 'Start Review'],
        'escalate' => ['from' => ['raised', 'open', 'acknowledged', 'under_review'], 'to' => 'escalated', 'label' => 'Escalate'],
        'mediate' => ['from' => ['under_review', 'escalated'], 'to' => 'mediation', 'label' => 'Move to Mediation'],
        'decide' => ['from' => ['under_review', 'mediation', 'escalated'], 'to' => 'decision', 'label' => 'Record Decision'],
        'uphold' => ['from' => ['decision', 'under_review', 'mediation'], 'to' => 'won', 'label' => 'Resolve – Upheld'],
        'reject' => ['from' => ['decision', 'under_review', 'mediation'], 'to' => 'lost', 'label' => 'Resolve – Not Upheld'],
        'close' => ['from' => ['won', 'lost', 'resolved', 'withdrawn'], 'to' => 'closed', 'label' => 'Close Case'],
    ];

    public static function disputeStep(string $status): int
    {
        $map = ['raised' => 1, 'open' => 1, 'acknowledged' => 2, 'under_review' => 3, 'escalated' => 3, 'mediation' => 4, 'decision' => 5, 'won' => 6, 'lost' => 6, 'resolved' => 6, 'closed' => 8, 'withdrawn' => 8];

        return $map[$status] ?? 1;
    }

    /* --- Provider state machine (blueprint 6.1) ------------------------- */
    // applied -> verification -> verified -> agreement_ready -> active ; + hold / suspended / offboarded / rejected
    public const PROVIDER_STATUSES = [
        'applied' => 'Applied',
        'verification' => 'In Verification',
        'action_required' => 'Action Required',
        'verified' => 'Verified',
        'agreement_ready' => 'Agreement Ready',
        'active' => 'Active',
        'active_with_conditions' => 'Active with Conditions',
        'pending_reverification' => 'Pending Re-verification',
        'suspended' => 'Suspended',
        'rejected' => 'Rejected',
        'not_found' => 'Not Found',
    ];

    public const PROVIDER_ACTIONS = [
        'approve' => ['to' => 'agreement_ready', 'label' => 'Approve & Onboard'],
        'conditions' => ['to' => 'agreement_ready', 'label' => 'Approve with Conditions'],
        'decline' => ['to' => 'rejected', 'label' => 'Decline'],
        'suspend' => ['to' => 'suspended', 'label' => 'Suspend'],
        'reinstate' => ['to' => 'active', 'label' => 'Reinstate'],
        'action' => ['to' => 'action_required', 'label' => 'Flag Action Required'],
        'reverify' => ['to' => 'pending_reverification', 'label' => 'Re-verify'],
        'activate' => ['to' => 'active', 'label' => 'Activate'],
    ];

    /** Tiering (blueprint 6.1): T0 new; T1 >=3 QA-passed; T2 >=10 completed + FPQ >=85% + on-time >=90%. */
    public static function tier(int $completed, int $firstPassPct, int $onTimePct, string $status): string
    {
        if ($status === 'suspended') {
            return 'T4 Suspended';
        }
        if ($completed >= 10 && $firstPassPct >= 85 && $onTimePct >= 90) {
            return 'T2';
        }

        return $completed >= 3 ? 'T1' : 'T0';
    }

    /* --- Partner Services matter ---------------------------------------- */
    public const PS_JOURNEY = ['Intake', 'Jurisdiction & Profession', 'Conflict Check', 'Partner Proposal', 'Scope & Quote', 'Engagement Instrument', 'Who Is Responsible for What', 'Payment', 'Delivery'];

    public const PS_INTAKE_STEPS = ['Intake Details', 'Permission & Jurisdiction', 'Conflict Clearance', 'Proposal & Scope', 'Quote & Fee Transparency', 'Engagement Agreement', 'Confirmation'];

    public const PS_STAGE_PAGE = [
        'resolution' => 'resolution',
        'jurisdiction_unavailable' => 'resolution',
        'conflict_pending' => 'conflict',
        'conflict_identified' => 'conflict',
        'no_partner_available' => 'conflict',
        'proposal' => 'proposal',
        'scope_quote' => 'scope-quote',
        'instrument' => 'engagement-instrument',
        'responsibility' => 'responsibility',
        'payment' => 'responsibility',
        'escalated' => 'escalated',
        'delivery' => 'status',
        'qa_review' => 'status',
        'completed' => 'status',
        'paused' => 'conflict',
        'closed' => 'status',
    ];

    public static function psStep(PartnerRequest $r): int
    {
        return match ($r->stage) {
            'intake' => 1,
            'resolution', 'jurisdiction_unavailable', 'escalated' => 2,
            'conflict_pending', 'conflict_identified', 'no_partner_available', 'paused' => 3,
            'proposal' => 4,
            'scope_quote' => 5,
            'instrument' => 6,
            'responsibility' => 7,
            'payment' => 8,
            'delivery', 'qa_review' => 9,
            'completed', 'closed' => 10,
            default => 1,
        };
    }

    public const PS_STAGE_LABELS = [
        'intake' => 'Intake',
        'resolution' => 'Jurisdiction Resolved',
        'jurisdiction_unavailable' => 'Jurisdiction Unavailable',
        'conflict_pending' => 'Conflict Check Pending',
        'conflict_identified' => 'Conflict Identified',
        'no_partner_available' => 'No Verified Partner Available',
        'proposal' => 'Partner Proposal',
        'scope_quote' => 'Scope & Quote',
        'instrument' => 'Engagement Instrument',
        'responsibility' => 'Responsibility Statement',
        'payment' => 'Awaiting Payment',
        'delivery' => 'In Delivery',
        'qa_review' => 'QA & Sign-off',
        'completed' => 'Completed',
        'paused' => 'Paused',
        'closed' => 'Closed',
        'escalated' => 'Escalated',
    ];

    /** Adds South African business days (Mon-Fri). */
    public static function businessDays(Carbon $from, int $days): Carbon
    {
        $d = $from->copy();
        while ($days > 0) {
            $d->addDay();
            if (! $d->isWeekend()) {
                $days--;
            }
        }

        return $d;
    }

    public static function event(string $event, string $description, string $owner, string $status = 'completed'): array
    {
        return ['at' => now()->format('d M Y, H:i'), 'event' => $event, 'description' => $description, 'owner' => $owner, 'status' => $status];
    }
}
