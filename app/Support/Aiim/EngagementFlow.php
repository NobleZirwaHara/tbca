<?php

namespace App\Support\Aiim;

use App\Models\Aiim\Engagement;
use App\Models\Aiim\EngagementEvent;
use DomainException;

/**
 * Staged lifecycle for custom intelligence, advisory and verification mandates
 * (blueprint stages 4–6 and 14–15). A stage opens only when its start condition
 * and commercial entitlement are satisfied; dates alone never open a stage.
 */
class EngagementFlow
{
    public const LABELS = [
        'draft' => 'Draft',
        'submitted' => 'Submitted',
        'under_review' => 'Under Review',
        'discovery_booked' => 'Discovery Booked',
        'discovery_completed' => 'Discovery Completed',
        'quoted' => 'Quotation Issued',
        'quote_accepted' => 'Quote Accepted',
        'letter_accepted' => 'Letter Accepted',
        'declined' => 'Declined',
        'signed' => 'Signed — Deposit Due',
        'in_progress' => 'In Progress',
        'delivered' => 'Delivered',
        'accepted' => 'Accepted',
        'closed' => 'Closed',
        'paused' => 'Paused',
        'cancelled' => 'Cancelled',
    ];

    /** Allowed transitions: from => [to => actor]. */
    public const TRANSITIONS = [
        'draft' => ['submitted' => 'client'],
        'submitted' => ['under_review' => 'staff', 'discovery_booked' => 'client', 'cancelled' => 'client'],
        'under_review' => ['discovery_booked' => 'client', 'quoted' => 'staff', 'cancelled' => 'client'],
        'discovery_booked' => ['discovery_completed' => 'staff', 'under_review' => 'client'],
        'discovery_completed' => ['quoted' => 'staff', 'discovery_booked' => 'client'],
        'quoted' => ['quote_accepted' => 'client', 'quoted' => 'staff', 'declined' => 'client'],
        'quote_accepted' => ['letter_accepted' => 'client', 'declined' => 'client'],
        'letter_accepted' => ['signed' => 'client'],
        'signed' => ['in_progress' => 'system'],
        'in_progress' => ['delivered' => 'staff', 'paused' => 'client', 'cancelled' => 'client'],
        'paused' => ['in_progress' => 'client', 'cancelled' => 'client'],
        'delivered' => ['accepted' => 'client', 'in_progress' => 'client', 'paused' => 'client'],
        'accepted' => ['closed' => 'system'],
    ];

    /** Customer-facing journey used by steppers. */
    public const JOURNEY = [
        'Request', 'Review', 'Discovery', 'Quotation', 'Engagement Letter', 'Signature', 'Deposit', 'In Progress', 'Delivery', 'Accepted',
    ];

    public static function label(string $status): string
    {
        return self::LABELS[$status] ?? ucfirst(str_replace('_', ' ', $status));
    }

    public static function can(Engagement $e, string $to): bool
    {
        return array_key_exists($to, self::TRANSITIONS[$e->status] ?? []);
    }

    /**
     * Move an engagement to a new status, recording the audit event.
     *
     * @throws DomainException when the transition is not allowed
     */
    public static function transition(Engagement $e, string $to, string $actor, ?string $note = null, array $attributes = []): Engagement
    {
        if (! self::can($e, $to)) {
            throw new DomainException(sprintf('This engagement is %s and cannot move to %s.', self::label($e->status), self::label($to)));
        }

        $from = $e->status;
        $e->fill($attributes + ['status' => $to])->save();
        self::log($e, $actor, self::label($to), $from, $to, $note);

        return $e;
    }

    public static function log(Engagement $e, string $actor, string $action, ?string $from = null, ?string $to = null, ?string $note = null): void
    {
        EngagementEvent::create([
            'engagement_id' => $e->id,
            'actor' => $actor,
            'action' => $action,
            'from_status' => $from,
            'to_status' => $to,
            'note' => $note,
        ]);
    }

    /** 1-based index into JOURNEY. */
    public static function journeyIndex(Engagement $e): int
    {
        return match ($e->status) {
            'draft', 'submitted' => 1,
            'under_review' => 2,
            'discovery_booked', 'discovery_completed' => 3,
            'quoted' => 4,
            'quote_accepted' => 5,
            'letter_accepted' => 6,
            'signed' => 7,
            'in_progress', 'paused' => 8,
            'delivered' => 9,
            'accepted', 'closed' => 10,
            default => 1,
        };
    }

    /** The next client action for an engagement, used by dashboards and redirects. */
    public static function nextAction(Engagement $e): ?array
    {
        $r = $e->reference;

        return match ($e->status) {
            'draft' => ['label' => 'Continue your request', 'url' => $e->type === 'advisory' ? "/aiim/workspace/advisor-request?ref={$r}" : "/aiim/custom-intelligence?ref={$r}"],
            'submitted', 'under_review' => ['label' => 'Book discovery session', 'url' => "/aiim/workspace/engagements/{$r}/discovery"],
            'discovery_booked' => ['label' => 'View discovery confirmation', 'url' => "/aiim/workspace/engagements/{$r}/discovery/confirmed"],
            'discovery_completed' => ['label' => 'View discovery outcome', 'url' => "/aiim/workspace/engagements/{$r}/outcome"],
            'quoted' => ['label' => 'Review formal quotation', 'url' => "/aiim/workspace/engagements/{$r}/quote"],
            'quote_accepted' => ['label' => 'Review engagement letter', 'url' => "/aiim/workspace/engagements/{$r}/letter"],
            'letter_accepted' => ['label' => 'Sign engagement letter', 'url' => "/aiim/workspace/engagements/{$r}/sign"],
            'signed' => ['label' => 'Pay deposit', 'url' => "/aiim/workspace/engagements/{$r}/pay"],
            'in_progress', 'paused' => ['label' => 'Open mandate workspace', 'url' => "/aiim/workspace/engagements/{$r}"],
            'delivered' => ['label' => 'Review delivery', 'url' => "/aiim/workspace/engagements/{$r}/delivery"],
            'accepted' => ['label' => 'Settle final balance', 'url' => "/aiim/workspace/engagements/{$r}/ledger"],
            default => null,
        };
    }

    /** Standard work items quoted for an engagement type. Advisors adjust before issue. */
    public static function quoteTemplate(string $type, ?string $focus = null): array
    {
        $focus = $focus ?: 'investment';

        return $type === 'advisory'
            ? [
                ['item' => 'Opportunity Analysis & Screening', 'description' => "Detailed analysis of {$focus} opportunities", 'deliverables' => 'Opportunity shortlist, screening report', 'amount' => 25000],
                ['item' => 'Market & Sector Assessment', 'description' => 'Market intelligence and sector deep-dive', 'deliverables' => 'Market assessment report', 'amount' => 18000],
                ['item' => 'Regulatory & Policy Review', 'description' => 'Regulatory, policy and incentive landscape', 'deliverables' => 'Regulatory & policy briefing', 'amount' => 15000],
                ['item' => 'Financial & Commercial Assessment', 'description' => 'Preliminary financial analysis and commercial viability', 'deliverables' => 'Financial model summary', 'amount' => 22000],
                ['item' => 'Risk Assessment & Mitigation', 'description' => 'Identify key risks and mitigation strategies', 'deliverables' => 'Risk assessment report', 'amount' => 12000],
                ['item' => 'Advisory Session & Recommendations', 'description' => 'Advisory session and recommended next steps', 'deliverables' => 'Advisory session, recommendations report', 'amount' => 8000],
            ]
            : [
                ['item' => 'Scope Confirmation & Inception', 'description' => 'Inception note and detailed workplan', 'deliverables' => 'Inception note, workplan', 'amount' => 8000],
                ['item' => 'Data Collection & Source Verification', 'description' => 'Collect and verify data against approved sources', 'deliverables' => 'Data sources register', 'amount' => 14000],
                ['item' => 'Sector & Market Analysis', 'description' => "Analysis of {$focus} demand, supply and outlook", 'deliverables' => 'Analysis workbook', 'amount' => 16000],
                ['item' => 'Draft & Final Custom Report', 'description' => 'Decision-grade custom intelligence report', 'deliverables' => 'Draft and final report (PDF)', 'amount' => 12000],
            ];
    }
}
