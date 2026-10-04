<?php

namespace App\Support\DueDiligence;

use App\Models\DueDiligence\CaseEvent;
use App\Models\DueDiligence\CaseFile;
use Illuminate\Validation\ValidationException;

/**
 * Case status machine (blueprint Sections 7.2, 19 and 28.3).
 *
 * Pre-payment states (Draft, Consent Pending, Payment Pending) live on the
 * quote; a case only exists once payment is verified. Every transition is
 * validated server side against the allowed map, the acting role and a guard,
 * and is written to the immutable case timeline.
 */
class CaseStateMachine
{
    /** status => [label, case-state code, public step, internal stage, review state] */
    public const STATES = [
        'consent_pending' => ['Consent Pending', 'CS3 Active', 3, 1, 'RV0'],
        'intake_open' => ['Intake Open', 'CS3 Active', 3, 2, 'RV0'],
        'ready_for_checks' => ['Ready for Checks', 'CS3 Active', 4, 3, 'RV0'],
        'checks_running' => ['Checks Running', 'CS3 Active', 4, 5, 'RV1 Executing'],
        'review_required' => ['Review Required', 'CS3 Active', 5, 9, 'RV2 Locked/Review'],
        'partner_review' => ['Qualified Partner Review', 'CS3 Active', 5, 9, 'RV2 Partner Review'],
        'report_draft' => ['Report Draft in QA', 'CS3 Active', 6, 10, 'RV3 QA in Progress'],
        'approved_for_release' => ['Approved for Release', 'CS3 Active', 6, 10, 'RV4 QA/Approved'],
        'delivered' => ['Delivered', 'CS4 Delivered', 7, 11, 'RV5 Released'],
        'disputed' => ['Disputed', 'CS5 Disputed', 7, 12, 'RV6 Dispute'],
        'monitoring' => ['Monitoring', 'CS6 Monitoring', 7, 13, 'RV7 Alert-Review'],
        'closed' => ['Closed', 'CS7 Closed', 7, 14, 'RV5 Closed'],
    ];

    /** from => [to => roles allowed] */
    public const TRANSITIONS = [
        'consent_pending' => ['intake_open' => ['client', 'staff', 'system']],
        'intake_open' => ['ready_for_checks' => ['client', 'staff'], 'consent_pending' => ['system']],
        'ready_for_checks' => ['checks_running' => ['staff'], 'intake_open' => ['staff'], 'consent_pending' => ['system']],
        'checks_running' => ['review_required' => ['staff', 'system'], 'report_draft' => ['staff'], 'consent_pending' => ['system']],
        'review_required' => ['partner_review' => ['staff'], 'report_draft' => ['staff'], 'consent_pending' => ['system']],
        'partner_review' => ['report_draft' => ['staff'], 'review_required' => ['staff']],
        'report_draft' => ['approved_for_release' => ['staff'], 'review_required' => ['staff']],
        'approved_for_release' => ['delivered' => ['client']],
        'delivered' => ['disputed' => ['client'], 'monitoring' => ['system'], 'closed' => ['client', 'staff']],
        'disputed' => ['delivered' => ['staff', 'system']],
        'monitoring' => ['delivered' => ['client', 'system'], 'disputed' => ['client'], 'closed' => ['client', 'staff']],
        'closed' => [],
    ];

    public static function label(string $status): string
    {
        return self::STATES[$status][0] ?? ucfirst(str_replace('_', ' ', $status));
    }

    public static function step(string $status): int
    {
        return self::STATES[$status][2] ?? 3;
    }

    public static function allowed(CaseFile $case, string $role): array
    {
        return array_keys(array_filter(self::TRANSITIONS[$case->status] ?? [], fn (array $roles) => in_array($role, $roles, true)));
    }

    /**
     * @throws ValidationException when the transition or its guard fails
     */
    public static function transition(CaseFile $case, string $to, string $actor, string $role, ?string $note = null, array $meta = []): CaseFile
    {
        $from = $case->status;
        $roles = self::TRANSITIONS[$from][$to] ?? null;

        if ($roles === null) {
            throw ValidationException::withMessages(['status' => 'A case cannot move from '.self::label($from).' to '.self::label($to).'.']);
        }
        if (! in_array($role, $roles, true)) {
            throw ValidationException::withMessages(['status' => 'You are not permitted to move this case to '.self::label($to).'.']);
        }

        $failure = self::guard($case, $to);
        if ($failure !== null) {
            throw ValidationException::withMessages(['status' => $failure]);
        }

        [, , , $stage, $review] = self::STATES[$to];
        $updates = ['status' => $to, 'stage' => $stage, 'review_state' => $review];

        if ($to === 'review_required' && $case->review_started_at === null) {
            $updates += ['review_started_at' => now(), 'review_due_at' => now()->addWeekdays(2)];
        }
        if ($to === 'closed') {
            $updates['closed_at'] = now();
        }

        $case->update($updates);

        self::record($case, 'dd.status_'.$to, $actor, $role, $note ?? self::label($from).' → '.self::label($to), $from, $to, $meta);

        Workflow::afterTransition($case->fresh(), $from, $to);

        return $case->fresh();
    }

    /** Returns a failure message, or null when the guard passes. */
    public static function guard(CaseFile $case, string $to): ?string
    {
        return match ($to) {
            'intake_open' => Workflow::consentsComplete($case) ? null : 'All mandatory consents must be received before intake can open (G3).',
            'ready_for_checks' => Workflow::intakeBlocker($case),
            'report_draft' => self::reportDraftBlocker($case),
            'approved_for_release' => self::releaseBlocker($case),
            'delivered' => $case->limitations_acknowledged_at ? null : 'The report limitations must be acknowledged before the report is released (G8).',
            'monitoring' => $case->subscriptions()->where('status', 'active')->exists() ? null : 'An active monitoring subscription is required.',
            'closed' => $case->disputes()->whereIn('status', ['received', 'under_review', 'appealed'])->exists() ? 'Open disputes must be resolved before the case is closed.' : null,
            default => null,
        };
    }

    private static function reportDraftBlocker(CaseFile $case): ?string
    {
        if ($case->status === 'checks_running') {
            if ($case->checks()->where('status', '!=', 'complete')->exists()) {
                return 'All checks must be complete before the draft report is assembled.';
            }
            if ($case->findings()->exists() || $case->review_mandatory) {
                return 'This case has risk flags or a mandatory review rule: it must pass human review first (G7).';
            }
        }
        if ($case->findings()->whereIn('status', ['open', 'client_responded', 'reviewing'])->exists()) {
            return 'Every risk flag needs a reviewer disposition before the draft report is assembled.';
        }
        if ($case->status === 'review_required' && blank($case->review_decision)) {
            return 'Record the reviewer decision before moving to report drafting.';
        }
        if ($case->status === 'partner_review' && $case->tasks()->where('kind', 'partner')->where('status', '!=', 'completed')->exists()) {
            return 'All qualified partner review tasks must be completed.';
        }

        return null;
    }

    private static function releaseBlocker(CaseFile $case): ?string
    {
        if ($case->tasks()->where('kind', 'qa')->where('status', '!=', 'completed')->exists()) {
            return 'All QA checklist items are mandatory before senior reviewer approval.';
        }
        if ($case->requests()->where('type', 'clarification')->where('status', 'open')->exists()) {
            return 'Open QA clarifications must be resolved before release.';
        }
        if (! $case->reports()->where('status', 'draft')->exists()) {
            return 'A draft report is required before release.';
        }

        return null;
    }

    public static function record(CaseFile $case, string $type, string $actor, string $role, string $description, ?string $from = null, ?string $to = null, array $meta = []): CaseEvent
    {
        $next = (CaseEvent::max('id') ?? 0) + 233;

        return $case->events()->create([
            'code' => 'EVT-'.str_pad((string) $next, 6, '0', STR_PAD_LEFT),
            'type' => $type,
            'actor' => $actor,
            'actor_role' => $role,
            'description' => $description,
            'from_status' => $from,
            'to_status' => $to,
            'meta' => $meta ?: null,
        ]);
    }
}
