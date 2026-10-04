<?php

namespace App\Support\DealRoom;

use App\Models\DealRoom\Approval;
use App\Models\DealRoom\Charge;
use App\Models\DealRoom\Room;
use App\Models\DealRoom\Stage;
use Illuminate\Validation\ValidationException;

/**
 * Gated stage machine. A stage completes only when every completion-test
 * check passes (manual ticks plus data-driven checks), every named approval
 * is approved and any stage fee is paid. Completing a stage unlocks the next
 * one, seeds its approvals and issues its stage fee.
 */
class Workflow
{
    public static function ensureStages(Room $room): void
    {
        $existing = $room->stages()->pluck('code')->map(fn ($c) => (string) $c)->all();
        $currentIndex = Stages::index((string) $room->current_stage);

        foreach (Stages::codes() as $i => $code) {
            if (in_array($code, $existing, true)) {
                continue;
            }
            $room->stages()->create([
                'code' => $code,
                'status' => $i < $currentIndex ? 'completed' : ($i === $currentIndex ? 'unlocked' : 'locked'),
                'unlocked_at' => $i <= $currentIndex ? now() : null,
                'completed_at' => $i < $currentIndex ? now() : null,
            ]);
        }
    }

    public static function stage(Room $room, string $code): Stage
    {
        self::ensureStages($room);

        return $room->stages()->where('code', $code)->firstOrFail();
    }

    public static function isUnlocked(Room $room, string $code): bool
    {
        return self::stage($room, $code)->status !== 'locked';
    }

    /**
     * Evaluate the completion test for a stage.
     *
     * @return array{checks: list<array{key: string, label: string, done: bool, auto: bool}>, approvals: list<array<string, mixed>>, fee: ?array<string, mixed>, passed: bool, blockers: list<string>}
     */
    public static function gate(Room $room, string $code): array
    {
        $def = Stages::get($code);
        $stage = self::stage($room, $code);
        $ticks = $stage->checks ?? [];

        $checks = [];
        foreach ($def['checks'] ?? [] as $key => $label) {
            $checks[] = ['key' => $key, 'label' => $label, 'done' => (bool) ($ticks[$key] ?? false), 'auto' => false];
        }
        foreach (self::autoChecks($room, $code) as $label => $done) {
            $checks[] = ['key' => 'auto:'.md5($label), 'label' => $label, 'done' => (bool) $done, 'auto' => true];
        }

        $approvals = self::approvalsFor($room, 'stage:'.$code)->map(fn (Approval $a) => self::presentApproval($a))->all();

        $fee = null;
        if (isset($def['fee'])) {
            $charge = $room->charges()->where('kind', 'stage_fee')->where('stage_code', $code)->latest('id')->first();
            $fee = [...$def['fee'], 'charge' => $charge ? Billing::present($charge) : null, 'paid' => (bool) $charge?->isPaid()];
        }

        $blockers = [];
        if ($room->isPaused()) {
            $blockers[] = 'Transaction is paused: '.($room->paused_reason ?? 'awaiting remedy').'.';
        }
        foreach ($checks as $c) {
            if (! $c['done']) {
                $blockers[] = $c['label'];
            }
        }
        foreach ($approvals as $a) {
            if ($a['status'] !== 'approved') {
                $blockers[] = "Approval: {$a['approver']} ({$a['role']})";
            }
        }
        if ($fee && ! $fee['paid']) {
            $blockers[] = "Stage fee unpaid: {$fee['name']}";
        }

        return ['checks' => $checks, 'approvals' => $approvals, 'fee' => $fee, 'passed' => $blockers === [], 'blockers' => $blockers];
    }

    /** @return array<string, bool> */
    protected static function autoChecks(Room $room, string $code): array
    {
        $c = $room->commercial ?? [];

        return match ($code) {
            'A' => [
                'Enquiry submitted with authority confirmation' => ! empty($room->enquiry['submitted_at'] ?? null),
                'Preliminary checks clear and fit score of 60% or more' => ($room->enquiry['score'] ?? 0) >= 60,
            ],
            'B' => [
                'Diagnostic questionnaire complete (24 of 24)' => Pricing::diagnosticProgress($room)['answered'] >= Pricing::diagnosticProgress($room)['total'],
            ],
            'C' => [
                'Conflict clearance completed' => true,
                'Scope of work accepted' => ! empty($c['scope_accepted_at'] ?? null),
                'Engagement pack signed (AI disclosure and POPIA notice accepted)' => ! empty($c['engagement_signed_at'] ?? null),
                'Activation deposit paid and reconciled' => (bool) $room->charges()->where('kind', 'deposit')->whereIn('status', ['paid', 'refunded', 'partially_refunded'])->exists(),
            ],
            '0' => [
                'Deal room set-up reviewed and created' => ! empty($room->setup['created_at'] ?? null),
            ],
            '2' => [
                'At least one document uploaded to the data room' => $room->documents()->exists(),
                'No flagged documents outstanding' => ! $room->documents()->where('review_status', 'flagged')->exists(),
                'All documents approved for release' => $room->documents()->exists() && ! $room->documents()->whereNotIn('review_status', ['approved', 'released'])->exists(),
            ],
            '3' => [
                'At least one counterparty qualified (score 60% or more)' => $room->parties()->where('qualification_score', '>=', 60)->exists(),
                'Invitations sent to qualified counterparties' => $room->parties()->whereIn('status', ['invited', 'active'])->whereNotIn('role', Access::INTERNAL_ROLES)->exists(),
            ],
            '4' => [
                'At least one external participant active with NDA accepted' => $room->parties()->where('status', 'active')->whereNotNull('nda_accepted_at')->whereNotIn('role', Access::INTERNAL_ROLES)->exists(),
            ],
            '5' => [
                'Due diligence questions have been raised' => $room->questions()->exists(),
                'No open questions (all answered or escalated and resolved)' => ! $room->questions()->whereIn('status', ['open', 'escalated'])->exists(),
            ],
            '9' => [
                'Buyer sign-off recorded' => $room->stateGet('negotiation.buyer') === 'approved',
                'Seller sign-off recorded' => $room->stateGet('negotiation.seller') === 'approved',
                'Session closed as agreed' => $room->stateGet('negotiation.outcome') === 'agreed',
            ],
            '10' => [
                'Exactly one active term-sheet version approved' => $room->offers()->where('status', 'approved')->count() === 1,
            ],
            '11' => [
                'All key agreements finalised' => $room->items()->where('kind', 'legal_doc')->exists() && ! $room->items()->where('kind', 'legal_doc')->where('status', '!=', 'finalised')->exists(),
                'All clause issues resolved or deferred' => ! $room->items()->where('kind', 'legal_issue')->whereNotIn('status', ['resolved', 'deferred'])->exists(),
            ],
            '12' => [
                'All conditions precedent satisfied or waived' => $room->conditions()->exists() && ! $room->conditions()->whereNotIn('status', ['satisfied', 'waived'])->exists(),
                'All CP evidence validated' => ! $room->conditions()->where('validated', false)->exists(),
            ],
            '13' => [
                'All signatories have signed the locked signing pack' => $room->items()->where('kind', 'signature')->exists() && ! $room->items()->where('kind', 'signature')->where('status', '!=', 'signed')->exists(),
            ],
            '14' => [
                'All handover items completed' => $room->items()->where('kind', 'handover')->exists() && ! $room->items()->where('kind', 'handover')->where('status', '!=', 'completed')->exists(),
            ],
            default => [],
        };
    }

    public static function approvalsFor(Room $room, string $subject)
    {
        return $room->approvals()->where('subject', $subject)->orderBy('id')->get();
    }

    public static function presentApproval(Approval $a): array
    {
        return [
            'id' => $a->id,
            'approver' => $a->approver,
            'role' => $a->approver_role,
            'status' => $a->status,
            'decidedBy' => $a->decided_by,
            'decidedAt' => $a->decided_at?->format('d M Y H:i'),
            'note' => $a->note,
            'clientSide' => Access::clientCanDecide($a->approver_role),
        ];
    }

    /** Create named approvals for a subject if they don't exist yet. */
    public static function seedApprovals(Room $room, string $subject, array $approvers): void
    {
        foreach ($approvers as [$name, $role]) {
            $room->approvals()->firstOrCreate(['subject' => $subject, 'approver' => $name, 'approver_role' => $role], ['status' => 'pending']);
        }
    }

    public static function tick(Room $room, string $code, string $key, bool $done): void
    {
        $def = Stages::get($code);
        abort_unless(array_key_exists($key, $def['checks'] ?? []), 422);
        $stage = self::stage($room, $code);
        abort_if($stage->status === 'locked', 423, 'This stage is locked.');
        $checks = $stage->checks ?? [];
        $checks[$key] = $done;
        $stage->update(['checks' => $checks]);
    }

    public static function unlock(Room $room, string $code): void
    {
        $stage = self::stage($room, $code);
        if ($stage->status === 'locked') {
            $stage->update(['status' => 'unlocked', 'unlocked_at' => now()]);
            Audit::log($room, 'stage.unlocked', 'Stage '.$code.' unlocked: '.Stages::get($code)['name']);
        }
        $room->update(['current_stage' => $code]);

        $def = Stages::get($code);
        if (! empty($def['approvals'])) {
            self::seedApprovals($room, 'stage:'.$code, $def['approvals']);
        }
        if (isset($def['fee']) && ! $room->charges()->where('kind', 'stage_fee')->where('stage_code', $code)->exists()) {
            Billing::issue($room, 'stage_fee', $def['fee']['name'], [
                ['category' => 'TBCA Expert Fee', 'item' => $def['fee']['code'].' '.$def['fee']['name'], 'provider' => 'TBCA', 'net' => $def['fee']['net']],
            ], $code);
            Audit::log($room, 'stage.fee_triggered', 'Stage fee issued for stage '.$code.': '.$def['fee']['name']);
        }
    }

    /** Complete a stage if its gate passes, then unlock the next. */
    public static function complete(Room $room, string $code, string $actor): void
    {
        $stage = self::stage($room, $code);
        if ($stage->status === 'completed') {
            return;
        }
        if ($stage->status === 'locked') {
            throw ValidationException::withMessages(['stage' => 'This stage is still locked. '.Stages::LOCK_RULE]);
        }
        $gate = self::gate($room, $code);
        if (! $gate['passed']) {
            throw ValidationException::withMessages(['stage' => 'Stage cannot complete yet: '.implode('; ', array_slice($gate['blockers'], 0, 3)).'.']);
        }

        $stage->update(['status' => 'completed', 'completed_at' => now(), 'completed_by' => $actor]);
        Audit::log($room, 'stage.completed', 'Stage '.$code.' completed: '.Stages::get($code)['name'], $actor);

        $next = Stages::next($code);
        if ($next !== null) {
            self::unlock($room->fresh(), $next);
        } else {
            $room->update(['status' => 'archived']);
            Audit::log($room, 'archive.started', 'Room moved to archive control', $actor);
        }
    }

    /** Try to complete a stage silently (used after payment or data events). */
    public static function attempt(Room $room, string $code, string $actor = 'System'): bool
    {
        try {
            self::complete($room, $code, $actor);

            return true;
        } catch (ValidationException) {
            return false;
        }
    }

    public static function stepper(Room $room): array
    {
        self::ensureStages($room);
        $rows = $room->stages()->get()->keyBy(fn ($s) => (string) $s->code);

        return collect(Stages::all())->map(fn ($s, $code) => [
            'code' => (string) $code,
            'name' => $s['name'],
            'short' => $s['short'],
            'page' => $s['page'],
            'phase' => $s['phase'],
            'status' => $rows[(string) $code]->status ?? 'locked',
        ])->values()->all();
    }

    public static function feeCharge(Room $room, string $code): ?Charge
    {
        return $room->charges()->where('kind', 'stage_fee')->where('stage_code', $code)->latest('id')->first();
    }
}
