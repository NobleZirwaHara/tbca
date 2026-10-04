<?php

namespace App\Support\Marketplace;

use App\Models\Marketplace\Deliverable;
use App\Models\Marketplace\Dispute;
use App\Models\Marketplace\Earning;
use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\Payout;
use App\Models\Marketplace\Record;
use App\Models\User;
use App\Support\Platform\Reference;

/**
 * Delivery, QA, acceptance, payout and dispute rules for engagements.
 *
 *  Provider submission -> QA (SUBMITTED -> IN_REVIEW -> PASS / RETURN_R1 / RETURN_R2 / REJECT)
 *  PASS -> released to buyer -> Accept | Request corrections | Request clarification
 *  Accept -> engagement closed, payout PAYOUT_READY (instruction within 5 business days)
 *  Dispute -> payout held for the disputed amount until resolution
 */
class EngagementService
{
    public static function addEvent(Engagement $e, string $event, string $description, string $owner, string $status = 'completed'): void
    {
        $meta = $e->meta ?? [];
        $meta['timeline'] = [Workflow::event($event, $description, $owner, $status), ...($meta['timeline'] ?? [])];
        $e->meta = $meta;
    }

    /** Provider submits a deliverable version for TBCA QA. */
    public static function submitWork(Engagement $e, string $fileName, string $notes, string $by): Deliverable
    {
        $count = $e->deliverables()->count();
        $version = $count === 0 ? '1.0' : sprintf('%d.0', $count + 1);

        $deliverable = $e->deliverables()->create([
            'reference' => self::deliverableReference(),
            'file_name' => $fileName,
            'version' => $version,
            'status' => 'submitted',
            'submitted_at' => now(),
            'meta' => ['notes' => $notes, 'submitted_by' => $by, 'submission_ref' => Reference::make('SUB'), 'type' => 'Final Deliverable'],
        ]);

        self::addEvent($e, 'Provider Submission', "Provider submitted deliverable v{$version} for review", $by);
        $e->stage = 'in_qa';
        $e->progress = max($e->progress, 70);
        $e->save();

        return $deliverable;
    }

    public static function deliverableReference(): string
    {
        $n = Deliverable::count() + 100;
        do {
            $ref = sprintf('DEL-2026-%04d', ++$n);
        } while (Deliverable::where('reference', $ref)->exists());

        return $ref;
    }

    /** TBCA QA reviewer action on a deliverable. */
    public static function qa(Deliverable $d, string $action, string $reviewer, ?string $note = null): void
    {
        $rule = Workflow::QA_ACTIONS[$action] ?? null;
        abort_if(! $rule || ! in_array($d->status, $rule['from'], true), 422, 'This QA action is not available for the current review state.');

        $e = $d->engagement;
        $qa = $d->qa ?? [];
        $qa['reviewer'] = $reviewer;
        $qa['history'][] = ['action' => $action, 'by' => $reviewer, 'at' => now()->format('d M Y, H:i'), 'note' => $note];

        if ($action === 'pass') {
            $qa = [
                ...$qa,
                'outcome' => 'Passed',
                'record' => $qa['record'] ?? Reference::make('QAR'),
                'date' => now()->format('d M Y'),
                'score' => $qa['score'] ?? 92,
                'requirements' => $qa['requirements'] ?? '12 / 12',
                'accuracy' => $qa['accuracy'] ?? '98%',
                'checks' => $qa['checks'] ?? ['Methodology Check' => 'Passed', 'Accuracy Check' => 'Passed', 'Evidence Check' => 'Passed', 'Scope Match' => 'Passed', 'Formatting Check' => 'Passed', 'Privacy Check' => 'Passed'],
            ];
            $e->stage = 'released';
            $e->progress = 90;
            $e->payment_state = 'qa_passed';
            self::addEvent($e, 'QA Passed', "Deliverable v{$d->version} approved for client review", $reviewer);
        } elseif (in_array($action, ['return_r1', 'return_r2'], true)) {
            $class = $action === 'return_r1' ? 'R1' : 'R2';
            $days = $class === 'R1' ? 5 : 7;
            $e->stage = 'corrections';
            self::addEvent($e, "QA Return ({$class})", $note ?: "Correction required within {$days} days", $reviewer, 'in_progress');
            self::openCorrection($e, $note ?: 'QA return – see reviewer notes', $class === 'R2' ? 'high' : 'medium', 'Provider Correction', $days);
        } elseif ($action === 'reject') {
            $e->stage = 'corrections';
            self::addEvent($e, 'QA Rejected', $note ?: 'Deliverable rejected – resubmission required', $reviewer, 'blocked');
        } elseif ($action === 'start') {
            self::addEvent($e, 'QA Review Started', 'Deliverable received and QA review initiated', $reviewer, 'in_progress');
        }

        $d->update(['status' => $rule['to'], 'reviewer' => $reviewer, 'qa' => $qa]);
        $e->save();
    }

    public static function openCorrection(Engagement $e, string $issue, string $priority, string $stage, int $slaDays): void
    {
        Record::updateOrCreate(
            ['register' => 'corrections', 'reference' => $e->reference],
            [
                'status' => 'in_progress',
                'priority' => $priority,
                'data' => [
                    'title' => $e->title,
                    'provider' => $e->provider?->name,
                    'qa_standard' => $e->qa_standard,
                    'issue' => $issue,
                    'cycle_stage' => $stage,
                    'category' => 'Data / Assumptions',
                    'opened' => now()->format('d M Y'),
                    'sla_due' => Workflow::businessDays(now(), $slaDays)->format('d M Y'),
                    'days_open' => 0,
                ],
            ],
        );
    }

    /** Buyer decision on a released deliverable. */
    public static function decide(Deliverable $d, string $decision, string $comment, User $user): void
    {
        abort_unless($d->status === 'released', 422, 'Only a QA-released deliverable can be accepted or returned.');
        $e = $d->engagement;

        if ($decision === 'accept') {
            $d->update(['status' => 'accepted', 'decided_at' => now(), 'meta' => [...($d->meta ?? []), 'decision_comment' => $comment]]);
            $e->stage = 'closed';
            $e->progress = 100;
            $e->payment_state = 'payout_ready';
            self::addEvent($e, 'Deliverable Accepted', 'Client accepted the deliverable – engagement closed', $user->name);
            $e->save();
            self::createPayout($e);
            Record::where('register', 'corrections')->where('reference', $e->reference)->update(['status' => 'completed']);

            return;
        }

        if ($decision === 'corrections') {
            $d->update(['status' => 'correction_requested', 'decided_at' => now(), 'meta' => [...($d->meta ?? []), 'decision_comment' => $comment]]);
            $e->stage = 'corrections';
            self::addEvent($e, 'Corrections Requested', $comment ?: 'Client requested corrections', $user->name, 'in_progress');
            self::openCorrection($e, $comment ?: 'Client requested corrections', 'medium', 'Provider Correction', 5);
        } else {
            $d->update(['status' => 'released', 'meta' => [...($d->meta ?? []), 'clarification' => $comment, 'clarification_at' => now()->format('d M Y, H:i')]]);
            self::addEvent($e, 'Clarification Requested', $comment ?: 'Client requested clarification', $user->name, 'in_progress');
        }
        $e->save();
    }

    /** PAYOUT_READY: accepted provider amount after QA pass; platform fee 10 % of billed. */
    public static function createPayout(Engagement $e): ?Payout
    {
        if (! $e->provider_id || Payout::where('engagement_id', $e->id)->exists()) {
            return null;
        }

        $billed = (float) $e->provider_rate_zar;
        $fee = round($billed * Pricing::PLATFORM_FEE_PCT / 100, 2);
        $net = $billed - $fee;
        $vat = round($net * Pricing::VAT_PCT / 100, 2);
        $held = $e->disputes()->where('kind', 'dispute')->whereNotIn('status', ['closed', 'withdrawn', 'won', 'lost', 'resolved'])->exists();

        Earning::create([
            'provider_id' => $e->provider_id,
            'engagement_id' => $e->id,
            'kind' => 'billing',
            'category' => $e->service ?? 'Marketplace Services',
            'description' => $e->title,
            'amount_zar' => $billed,
            'invoice' => Reference::make('INV'),
            'occurred_on' => now(),
        ]);

        return Payout::create([
            'reference' => $e->reference.'-'.now()->format('Ym'),
            'provider_id' => $e->provider_id,
            'engagement_id' => $e->id,
            'earnings_zar' => $net,
            'fee_zar' => $fee,
            'vat_zar' => $vat,
            'amount_zar' => $net + $vat,
            'method' => 'Bank Transfer',
            'account' => $e->provider->profile['bank'] ?? 'FNB ••••1234',
            'status' => $held ? 'held' : 'ready',
            'available_from' => Workflow::businessDays(now(), 5),
        ]);
    }

    public static function raiseDispute(Engagement $e, array $data, User $user, string $kind = 'dispute'): Dispute
    {
        $prefix = $kind === 'dispute' ? 'DIS' : ($kind === 'grievance' ? 'GRV' : 'APL');
        $n = Dispute::where('reference', 'like', "{$prefix}-2026-%")->count() + 10;
        do {
            $ref = sprintf('%s-2026-%04d', $prefix, ++$n);
        } while (Dispute::where('reference', $ref)->exists());

        $dispute = Dispute::create([
            'reference' => $ref,
            'kind' => $kind,
            'engagement_id' => $e->id,
            'user_id' => $user->id,
            'provider_id' => $e->provider_id,
            'type' => $data['type'],
            'category' => $data['category'] ?? null,
            'priority' => $data['priority'] ?? 'medium',
            'subject' => $data['subject'],
            'description' => $data['description'],
            'amount_zar' => (int) ($data['amount_zar'] ?? 0),
            'status' => 'raised',
            'response_due_at' => Workflow::businessDays(now(), 5)->setTime(14, 30),
            'meta' => [
                'resolution_sought' => $data['resolution_sought'] ?? null,
                'raised_by' => $kind === 'dispute' ? 'You (Client)' : 'Provider',
                'timeline' => [['at' => now()->format('d M Y, H:i'), 'title' => 'Dispute Raised', 'body' => 'Raised with supporting evidence.']],
                'messages' => [['from' => $user->name, 'role' => $kind === 'dispute' ? 'Client' : 'Provider', 'at' => now()->format('d M Y, H:i'), 'body' => $data['description']]],
                'documents' => $data['documents'] ?? [],
                'linked_deliverable' => $data['linked_deliverable'] ?? null,
                'linked_stage' => Workflow::ENGAGEMENT_LABELS[$e->stage] ?? $e->stage,
                'urgency' => $data['urgency'] ?? null,
            ],
        ]);

        if ($kind === 'dispute') {
            $meta = $e->meta ?? [];
            $meta['stage_before_dispute'] = $e->stage;
            $e->meta = $meta;
            $e->stage = 'disputed';
            self::addEvent($e, 'Dispute Raised', "Dispute {$ref} raised by client", $user->name, 'in_progress');
            $e->save();
            Payout::where('engagement_id', $e->id)->whereIn('status', ['ready', 'scheduled'])->update(['status' => 'held']);
        }

        return $dispute;
    }

    /** Applies an admin dispute-console transition. Resolution releases holds and restores the engagement stage. */
    public static function transitionDispute(Dispute $d, string $action, string $by, ?string $note = null): void
    {
        $rule = Workflow::DISPUTE_ACTIONS[$action] ?? null;
        abort_if(! $rule || ! in_array($d->status, $rule['from'], true), 422, 'This action is not available for the current dispute state.');

        $meta = $d->meta ?? [];
        $meta['timeline'][] = ['at' => now()->format('d M Y, H:i'), 'title' => $rule['label'], 'body' => $note ?: "Updated by {$by}."];
        $d->update(['status' => $rule['to'], 'meta' => $meta]);

        if (in_array($rule['to'], ['won', 'lost', 'closed'], true) && $d->engagement) {
            self::releaseDispute($d);
        }
    }

    public static function releaseDispute(Dispute $d): void
    {
        $e = $d->engagement;
        if (! $e || $e->stage !== 'disputed') {
            return;
        }
        $meta = $e->meta ?? [];
        $e->stage = $meta['stage_before_dispute'] ?? 'released';
        unset($meta['stage_before_dispute']);
        $e->meta = $meta;
        self::addEvent($e, 'Dispute Closed', "Dispute {$d->reference} resolved", 'TBCA Dispute Team');
        $e->save();
        Payout::where('engagement_id', $e->id)->where('status', 'held')->update(['status' => 'ready']);
    }
}
