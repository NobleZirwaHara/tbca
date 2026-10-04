<?php

namespace App\Support\Products\Subscriptions;

use App\Models\Order;
use App\Models\Products\Subscriptions\Plan;
use App\Models\Products\Subscriptions\SubEvent;
use App\Models\Products\Subscriptions\Subscription;
use App\Support\Platform\PaymentGateway;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Subscription state machine and the money / entitlement rules around it
 * (Blueprint Parts 4, 5, 7, 8, 11, 12 and 14.1).
 *
 * Every transition is validated against TRANSITIONS, persisted and written to
 * prd_sub_events. Illegal transitions throw a ValidationException so the
 * client sees an error instead of a silent state change.
 */
class Lifecycle
{
    /** Allowed lifecycle transitions. */
    public const TRANSITIONS = [
        'PENDING_PAYMENT' => ['ACTIVE'],
        'ACTIVE' => ['PAUSED', 'CANCELLED_PENDING', 'IN_GRACE'],
        'PAUSED' => ['ACTIVE', 'CANCELLED_PENDING'],
        'IN_GRACE' => ['ACTIVE', 'PAST_DUE', 'CANCELLED_PENDING'],
        'PAST_DUE' => ['ACTIVE', 'CLOSED_NONPAYMENT', 'CANCELLED_PENDING'],
        'CANCELLED_PENDING' => ['CANCELLED', 'ACTIVE'],
        'CANCELLED' => ['ACTIVE'],
        'CLOSED_NONPAYMENT' => ['ACTIVE'],
    ];

    /** Pause profile (mockups: 1, 2 or 3 months or custom; at most 90 days in any 12 months). */
    public const PAUSE_MIN_DAYS = 30;

    public const PAUSE_MAX_DAYS = 90;

    /** Price changes need at least this much notice and carry an exit right. */
    public const PRICE_NOTICE_DAYS = 30;

    /** Continuation notice is issued this many days before the next charge. */
    public const RENEWAL_NOTICE_DAYS = 7;

    /** Dunning profile used by the client timeline and the admin console. */
    public const DUNNING_STAGES = ['Payment Failed', '1st Notice Sent', '2nd Notice Sent', 'Final Notice Sent'];

    public static function canTransition(string $from, string $to): bool
    {
        return in_array($to, self::TRANSITIONS[$from] ?? [], true);
    }

    public static function transition(Subscription $sub, string $to, string $event, array $changes = [], array $payload = [], bool $money = false): Subscription
    {
        $from = $sub->status;

        if (! self::canTransition($from, $to)) {
            throw ValidationException::withMessages([
                'status' => "This subscription cannot move from {$from} to {$to}.",
            ]);
        }

        $sub->forceFill([...$changes, 'status' => $to])->save();

        SubEvent::log($event, $sub, [
            'previous_state' => $from,
            'new_state' => $to,
            'money_effect' => $money,
            'entitlement_effect' => true,
            'payload' => $payload ?: null,
        ]);

        return $sub;
    }

    /* ------------------------------------------------------------------ periods */

    public static function periodEnd(Carbon $start, string $interval): Carbon
    {
        return ($interval === 'annual' ? $start->copy()->addYearNoOverflow() : $start->copy()->addMonthNoOverflow())->subDay();
    }

    /**
     * Pull-style activation after the shared checkout: if the linked order is paid,
     * open the first period (or the reactivated period) and record the mandate. Idempotent.
     */
    public static function activateFromOrder(Subscription $sub, Order $order): bool
    {
        if (! $order->isPaid()) {
            return false;
        }

        $key = "activate:{$order->reference}";

        if (SubEvent::where('idempotency_key', $key)->exists()) {
            return false;
        }

        if (! in_array($sub->status, ['PENDING_PAYMENT', 'CANCELLED', 'CLOSED_NONPAYMENT'], true)) {
            return false;
        }

        return DB::transaction(function () use ($sub, $order, $key) {
            $payment = $order->payments()->where('status', 'succeeded')->latest('id')->first();
            $start = Carbon::parse($order->paid_at ?? now())->startOfDay();
            $end = self::periodEnd($start, $sub->billing_interval);
            $from = $sub->status;
            $reactivation = $from !== 'PENDING_PAYMENT';
            $mandate = $sub->mandate ?? [];

            $sub->forceFill([
                'status' => 'ACTIVE',
                'started_at' => $reactivation ? $sub->started_at : now(),
                'current_period_start' => $start,
                'current_period_end' => $end,
                'next_charge_at' => $end->copy()->addDay(),
                'next_review_at' => $sub->next_review_at ?? $start->copy()->addYear(),
                'cancel_requested_at' => null,
                'cancel_effective_at' => null,
                'cancel_reason' => null,
                'churn_code' => null,
                'payment_failed_at' => null,
                'overdue_zar' => 0,
                'pause_until' => null,
                'disuse_flagged' => false,
                'renewal_notice_at' => null,
                'order_reference' => $order->reference,
                'mandate' => [
                    ...$mandate,
                    'reference' => $mandate['reference'] ?? 'MDT-'.strtoupper(substr(md5($sub->reference), 0, 8)),
                    'status' => 'ACTIVE',
                    'method' => $payment?->method ?? 'card',
                    'brand' => $payment?->meta['brand'] ?? 'Visa',
                    'last4' => $payment?->meta['last4'] ?? ($mandate['last4'] ?? '4242'),
                    'confirmed_at' => now()->toIso8601String(),
                ],
            ])->save();

            SubEvent::log($reactivation ? 'reactivated' : 'activated', $sub, [
                'previous_state' => $from,
                'new_state' => 'ACTIVE',
                'money_effect' => true,
                'entitlement_effect' => true,
                'idempotency_key' => $key,
                'payload' => ['order' => $order->reference, 'amount_zar' => $order->total_zar],
            ]);

            return true;
        });
    }

    /**
     * Time-based transitions applied whenever a subscription is loaded: pause ends,
     * cancellation becomes effective, a scheduled downgrade or accepted price change
     * takes effect, and the continuation notice is issued ahead of the next charge.
     */
    public static function sweep(Subscription $sub, ?Carbon $today = null): Subscription
    {
        $today = ($today ?? now())->copy()->startOfDay();

        if ($sub->status === 'PAUSED' && $sub->pause_until && $sub->pause_until->lte($today)) {
            self::transition($sub, 'ACTIVE', 'pause_ended', ['pause_until' => null, 'paused_at' => null]);
        }

        if ($sub->status === 'CANCELLED_PENDING' && $sub->cancel_effective_at && $sub->cancel_effective_at->lt($today)) {
            $mandate = [...($sub->mandate ?? []), 'status' => 'STOPPED'];
            self::transition($sub, 'CANCELLED', 'cancellation_effective', ['mandate' => $mandate, 'next_charge_at' => null]);
        }

        $pc = $sub->price_change;
        if (is_array($pc) && in_array($pc['state'] ?? null, ['pending', 'accepted'], true) && Carbon::parse($pc['effective_at'])->lte($today)) {
            if (in_array($sub->status, ['ACTIVE', 'PAUSED', 'IN_GRACE', 'PAST_DUE'], true)) {
                $old = $sub->price_zar;
                $sub->forceFill(['price_zar' => (int) $pc['new_price_zar'], 'price_change' => [...$pc, 'state' => 'applied']])->save();
                SubEvent::log('price_change_applied', $sub, ['money_effect' => true, 'payload' => ['old' => $old, 'new' => $pc['new_price_zar']]]);
            }
        }

        if ($sub->pending_plan_id && $sub->next_charge_at && $sub->next_charge_at->lte($today) && $sub->status === 'ACTIVE') {
            self::applyPendingPlan($sub);
        }

        if ($sub->status === 'ACTIVE' && $sub->next_charge_at && ! $sub->renewal_notice_at
            && $sub->next_charge_at->copy()->subDays(self::RENEWAL_NOTICE_DAYS)->lte($today)) {
            $sub->forceFill(['renewal_notice_at' => now()])->save();
            SubEvent::log('continuation_notice_issued', $sub, ['payload' => ['next_charge_at' => $sub->next_charge_at->toDateString(), 'amount_zar' => $sub->price_zar]]);
        }

        return $sub;
    }

    /* ------------------------------------------------------------------ pause */

    public static function pausedDaysInLastYear(Subscription $sub): int
    {
        return (int) $sub->events()
            ->where('event_type', 'paused')
            ->where('created_at', '>=', now()->subYear())
            ->get()
            ->sum(fn (SubEvent $e) => (int) ($e->payload['days'] ?? 0));
    }

    public static function pause(Subscription $sub, int $days): Subscription
    {
        if (! $sub->plan->pause_allowed) {
            throw ValidationException::withMessages(['duration' => 'This plan has no approved pause profile. You can change plan or cancel instead.']);
        }

        if ($sub->status !== 'ACTIVE') {
            throw ValidationException::withMessages(['duration' => $sub->overdue_zar > 0
                ? 'Your billing is past due. Please settle outstanding payments before pausing.'
                : 'Only an active subscription can be paused.']);
        }

        if ($days < self::PAUSE_MIN_DAYS) {
            throw ValidationException::withMessages(['duration' => 'The minimum pause is 1 month.']);
        }

        if ($days + self::pausedDaysInLastYear($sub) > self::PAUSE_MAX_DAYS) {
            throw ValidationException::withMessages(['duration' => 'You can pause for up to 90 days in any 12 months. For a longer break, talk to a specialist.']);
        }

        $until = now()->startOfDay()->addDays($days);

        return self::transition($sub, 'PAUSED', 'paused', [
            'paused_at' => now(),
            'pause_until' => $until,
            'next_charge_at' => $sub->next_charge_at?->copy()->addDays($days),
            'current_period_end' => $sub->current_period_end?->copy()->addDays($days),
            'renewal_notice_at' => null,
        ], ['days' => $days, 'resume_on' => $until->toDateString()]);
    }

    public static function resume(Subscription $sub): Subscription
    {
        if ($sub->status !== 'PAUSED') {
            throw ValidationException::withMessages(['status' => 'This subscription is not paused.']);
        }

        // Unused pause days are given back by moving the next charge forward again.
        $unused = $sub->pause_until ? max(0, (int) now()->startOfDay()->diffInDays($sub->pause_until, false)) : 0;

        return self::transition($sub, 'ACTIVE', 'resumed', [
            'paused_at' => null,
            'pause_until' => null,
            'next_charge_at' => $sub->next_charge_at?->copy()->subDays($unused),
            'current_period_end' => $sub->current_period_end?->copy()->subDays($unused),
        ], ['unused_days' => $unused]);
    }

    /* ------------------------------------------------------------------ cancellation */

    /**
     * Records the client's exit instruction immediately (Blueprint 4.1 - 4.3).
     * Effective at the end of the current billing period; an optional reason only;
     * an unknown amount owed never blocks the request.
     */
    public static function requestCancel(Subscription $sub, ?string $reason, int $mandatoryActions = 3): Subscription
    {
        if (! in_array($sub->status, ['ACTIVE', 'PAUSED', 'IN_GRACE', 'PAST_DUE'], true)) {
            throw ValidationException::withMessages(['status' => 'This subscription is not in a state that can be cancelled.']);
        }

        $effective = $sub->current_period_end ?? now()->startOfDay();
        $proactive = $sub->disuse_flagged && $sub->disuse_notified_at;
        $pc = $sub->price_change;

        if (is_array($pc) && ($pc['state'] ?? null) === 'pending') {
            $pc['state'] = 'exit';
        }

        return self::transition($sub, 'CANCELLED_PENDING', 'cancellation_requested', [
            'cancel_requested_at' => now(),
            'cancel_effective_at' => $effective,
            'cancel_reason' => $reason ?: null,
            'churn_code' => $proactive ? 'CH-PRO' : 'CH-VOL',
            'pending_plan_id' => null,
            'price_change' => $pc,
            'next_charge_at' => null,
            'meta' => [...($sub->meta ?? []), 'cancellation' => [
                'requested_at' => now()->toIso8601String(),
                'effective_at' => $effective->toDateString(),
                'mandatory_actions' => $mandatoryActions,
                'signup_actions' => 3,
                'human_handoffs' => 0,
                'early_exit_amount_status' => 'NONE',
                'reason' => $reason ?: 'Not provided',
            ]],
        ], ['effective_at' => $effective->toDateString(), 'mandatory_actions' => $mandatoryActions, 'reason' => $reason ?: null]);
    }

    public static function withdrawCancel(Subscription $sub): Subscription
    {
        if ($sub->status !== 'CANCELLED_PENDING') {
            throw ValidationException::withMessages(['status' => 'There is no pending cancellation to withdraw.']);
        }

        $next = $sub->cancel_effective_at?->copy()->addDay();

        return self::transition($sub, 'ACTIVE', 'cancellation_withdrawn', [
            'cancel_requested_at' => null,
            'cancel_effective_at' => null,
            'churn_code' => null,
            'next_charge_at' => $next,
        ]);
    }

    /* ------------------------------------------------------------------ plan change */

    /** Upgrade: immediate with proration; downgrade: from the next billing date (Blueprint 7.4 + mockup 13). */
    public static function quoteChange(Subscription $sub, Plan $to): array
    {
        $newPrice = (int) $to->priceFor($sub->billing_interval);
        $diff = $newPrice - $sub->price_zar;
        $upgrade = $diff > 0;
        $remaining = $sub->remainingDays();
        $prorated = $upgrade ? (int) round($diff * $remaining / max(1, $sub->periodDays())) : 0;

        return [
            'direction' => $diff === 0 ? 'same' : ($upgrade ? 'upgrade' : 'downgrade'),
            'new_price_zar' => $newPrice,
            'difference_zar' => $diff,
            'prorated_zar' => $prorated,
            'remaining_days' => $remaining,
            'effective' => $upgrade ? 'immediate' : ($sub->next_charge_at?->toDateString() ?? 'next billing date'),
        ];
    }

    public static function changePlan(Subscription $sub, Plan $to): array
    {
        if ($sub->status !== 'ACTIVE') {
            throw ValidationException::withMessages(['plan' => 'Plan changes are available on active subscriptions only.']);
        }

        if ($to->id === $sub->plan_id) {
            throw ValidationException::withMessages(['plan' => 'You are already on this plan.']);
        }

        if ($to->ladder !== $sub->plan->ladder || $to->saleBlocker()) {
            throw ValidationException::withMessages(['plan' => 'That plan is not available as a change from your current plan.']);
        }

        $quote = self::quoteChange($sub, $to);
        $from = $sub->plan;

        if ($quote['direction'] === 'upgrade') {
            $meta = $sub->meta ?? [];
            $meta['pending_charges'][] = ['label' => "Prorated upgrade to {$to->name}", 'amount_zar' => $quote['prorated_zar'], 'added_at' => now()->toDateString()];
            $sub->forceFill(['plan_id' => $to->id, 'price_zar' => $quote['new_price_zar'], 'pending_plan_id' => null, 'meta' => $meta])->save();
        } else {
            $sub->forceFill(['pending_plan_id' => $to->id])->save();
        }

        SubEvent::log('plan_change_'.$quote['direction'], $sub, [
            'money_effect' => true,
            'entitlement_effect' => $quote['direction'] === 'upgrade',
            'payload' => ['from' => $from->name, 'to' => $to->name, ...$quote],
        ]);

        return $quote;
    }

    public static function applyPendingPlan(Subscription $sub): void
    {
        $to = $sub->pendingPlan;
        if (! $to) {
            return;
        }

        $from = $sub->plan->name;
        $sub->forceFill(['plan_id' => $to->id, 'price_zar' => (int) $to->priceFor($sub->billing_interval), 'pending_plan_id' => null])->save();
        SubEvent::log('plan_change_applied', $sub, ['money_effect' => true, 'entitlement_effect' => true, 'payload' => ['from' => $from, 'to' => $to->name]]);
    }

    /* ------------------------------------------------------------------ price change */

    public static function announcePriceChange(Subscription $sub, int $newPrice, ?Carbon $effective = null, string $basis = 'Annual pricing update'): Subscription
    {
        $effective = $effective ?? now()->startOfDay()->addDays(self::PRICE_NOTICE_DAYS);

        if ($effective->lt(now()->startOfDay()->addDays(self::PRICE_NOTICE_DAYS))) {
            throw ValidationException::withMessages(['effective_at' => 'A price change needs at least 30 days notice.']);
        }

        $sub->forceFill(['price_change' => [
            'state' => 'pending',
            'old_price_zar' => $sub->price_zar,
            'new_price_zar' => $newPrice,
            'notice_at' => now()->toDateString(),
            'effective_at' => $effective->toDateString(),
            'decide_by' => $effective->copy()->subDay()->toDateString(),
            'basis' => $basis,
            'decision' => null,
        ]])->save();

        SubEvent::log('price_change_notice_issued', $sub, ['payload' => ['old' => $sub->price_zar, 'new' => $newPrice, 'effective_at' => $effective->toDateString()]]);

        return $sub;
    }

    public static function decidePriceChange(Subscription $sub, string $decision): Subscription
    {
        if (! $sub->priceChangePending()) {
            throw ValidationException::withMessages(['decision' => 'There is no pending price change on this subscription.']);
        }

        $pc = $sub->price_change;

        if (now()->startOfDay()->gte(Carbon::parse($pc['effective_at']))) {
            throw ValidationException::withMessages(['decision' => 'The decision window for this price change has closed.']);
        }

        if ($decision === 'accept') {
            $sub->forceFill(['price_change' => [...$pc, 'state' => 'accepted', 'decision' => 'accept', 'decided_at' => now()->toDateString()]])->save();
            SubEvent::log('price_change_accepted', $sub, ['payload' => ['new' => $pc['new_price_zar']]]);

            return $sub;
        }

        // Exit right: cancel penalty-free before the new price applies.
        return self::requestCancel($sub, 'Exercised price-change exit right');
    }

    /* ------------------------------------------------------------------ engagement covenant */

    /** Disuse thresholds per recurrence class (Blueprint 5.1), expressed on the engagement record. */
    public static function disuseQualifies(Subscription $sub): bool
    {
        $u = $sub->usage ?? [];
        $class = $sub->plan->recurrence_class;
        $confidence = $u['confidence'] ?? 'HIGH';

        if (! in_array($confidence, ['HIGH', 'MEDIUM'], true) || $sub->status !== 'ACTIVE') {
            return false;
        }

        $idle = (int) ($u['idle_periods'] ?? 0);
        $daysInactive = (int) ($u['days_inactive'] ?? 0);

        return match ($class) {
            'R1', 'R3' => $idle >= 2,
            'R4', 'R5' => $idle >= 3,
            'R2' => ($u['interaction_expected'] ?? true) && $daysInactive >= 60,
            default => false,
        };
    }

    public static function flagDisuse(Subscription $sub): bool
    {
        if ($sub->disuse_flagged || ! self::disuseQualifies($sub)) {
            return false;
        }

        $sub->forceFill(['disuse_flagged' => true, 'disuse_flagged_at' => now(), 'disuse_notified_at' => now()])->save();
        SubEvent::log('disuse_flagged', $sub, ['actor_role' => 'system', 'payload' => [
            'recurrence_class' => $sub->plan->recurrence_class,
            'confidence' => $sub->usage['confidence'] ?? 'HIGH',
            'choices_offered' => ['CONTINUE', 'PAUSE', 'CHANGE', 'CANCEL'],
            'delivery_state' => 'DELIVERED_PORTAL',
        ]]);

        return true;
    }

    public static function disuseChoice(Subscription $sub, string $choice): void
    {
        if (! $sub->disuse_flagged) {
            throw ValidationException::withMessages(['choice' => 'There is no open low-use notice on this subscription.']);
        }

        if ($choice === 'CONTINUE') {
            $sub->forceFill(['disuse_flagged' => false])->save();
        }

        SubEvent::log('disuse_choice', $sub, ['payload' => ['client_choice' => $choice]]);
    }

    /* ------------------------------------------------------------------ billing and recovery */

    /**
     * Universal Next-Period Gate (Blueprint 11.2). Returns the list of blockers;
     * an empty list means the continuation charge may proceed.
     */
    public static function chargeBlockers(Subscription $sub): array
    {
        $plan = $sub->plan;
        $b = [];

        if ($sub->status !== 'ACTIVE') {
            $b[] = 'STATE_NOT_BILLABLE';
        }
        if (! $sub->renewal_notice_at) {
            $b[] = 'CONTINUATION_NOTICE_INCOMPLETE';
        }
        if (($sub->mandate['status'] ?? null) !== 'ACTIVE') {
            $b[] = 'MANDATE_INVALID';
        }
        if ($plan->isBelowFloor()) {
            $b[] = 'FLOOR_FAIL';
        }
        if (! isset(Plan::CLASSES[$plan->recurrence_class]) || blank($plan->next_period_value)) {
            $b[] = 'RECURRENCE_NOT_PASS';
        }
        if ($sub->disuse_flagged && ! $sub->disuse_notified_at) {
            $b[] = 'DISUSE_DISCLOSURE_INCOMPLETE';
        }
        if ($sub->cancel_effective_at) {
            $b[] = 'CANCELLATION_EFFECTIVE';
        }
        if (Capacity::classBreached($plan->recurrence_class)) {
            $b[] = 'CAPACITY_UNRESERVED';
        }

        return $b;
    }

    /** Attempts the next-period charge against the mandate. Returns SUCCESS, HOLD or DECLINED. */
    public static function runCharge(Subscription $sub, string $runRef): string
    {
        if ($blockers = self::chargeBlockers($sub)) {
            SubEvent::log('charge_held', $sub, ['actor_role' => 'system', 'payload' => ['run' => $runRef, 'blockers' => $blockers]]);

            return 'HOLD';
        }

        $key = "charge:{$sub->reference}:{$sub->next_charge_at?->toDateString()}";
        if (SubEvent::where('idempotency_key', $key)->exists()) {
            return 'DUPLICATE_BLOCKED';
        }

        if ($sub->pending_plan_id) {
            self::applyPendingPlan($sub);
            $sub->refresh();
        }

        $extra = (int) collect($sub->meta['pending_charges'] ?? [])->sum('amount_zar');
        $amount = (int) round(($sub->price_zar + $extra) * (1 + Subscription::VAT_RATE));
        $result = PaymentGateway::charge('card', $amount, ['card_number' => '400000000000'.($sub->mandate['last4'] ?? '4242')]);

        if ($result['status'] === 'succeeded') {
            $start = $sub->next_charge_at->copy();
            $end = self::periodEnd($start, $sub->billing_interval);
            $meta = $sub->meta ?? [];
            unset($meta['pending_charges']);
            $sub->forceFill([
                'current_period_start' => $start,
                'current_period_end' => $end,
                'next_charge_at' => $end->copy()->addDay(),
                'renewal_notice_at' => null,
                'meta' => $meta,
            ])->save();
            SubEvent::log('charge_succeeded', $sub, ['actor_role' => 'system', 'money_effect' => true, 'idempotency_key' => $key, 'payload' => ['run' => $runRef, 'amount_zar' => $amount]]);

            return 'SUCCESS';
        }

        self::recordPaymentFailure($sub, $sub->price_zar + $extra, $result['reason'] ?? 'Declined');

        return 'DECLINED';
    }

    /** A failed payment is a payment event, never a cancellation (Blueprint 12). */
    public static function recordPaymentFailure(Subscription $sub, int $amount, string $reason): Subscription
    {
        return self::transition($sub, 'IN_GRACE', 'payment_failed', [
            'payment_failed_at' => now(),
            'overdue_zar' => $amount,
            'meta' => [...($sub->meta ?? []), 'dunning' => ['stage' => 'Payment Failed', 'reason' => $reason, 'attempts' => 1]],
        ], ['amount_zar' => $amount, 'reason' => $reason], true);
    }

    public static function advanceDunning(Subscription $sub): string
    {
        if (! in_array($sub->status, ['IN_GRACE', 'PAST_DUE'], true)) {
            throw ValidationException::withMessages(['status' => 'This account is not in dunning.']);
        }

        $meta = $sub->meta ?? [];
        $stage = $meta['dunning']['stage'] ?? 'Payment Failed';
        $i = array_search($stage, self::DUNNING_STAGES, true);

        if ($i === false || $i >= count(self::DUNNING_STAGES) - 1) {
            throw ValidationException::withMessages(['status' => 'The final notice has already been sent.']);
        }

        $next = self::DUNNING_STAGES[$i + 1];
        $meta['dunning']['stage'] = $next;
        $meta['dunning']['last_contact'] = now()->toDateString();
        $sub->forceFill(['meta' => $meta])->save();
        SubEvent::log('dunning_notice_sent', $sub, ['payload' => ['stage' => $next]]);

        if ($next === 'Final Notice Sent' && $sub->status === 'IN_GRACE') {
            self::transition($sub, 'PAST_DUE', 'grace_expired');
        }

        return $next;
    }

    public static function recover(Subscription $sub, string $via = 'payment'): Subscription
    {
        if (! in_array($sub->status, ['IN_GRACE', 'PAST_DUE'], true)) {
            throw ValidationException::withMessages(['status' => 'There is nothing overdue on this subscription.']);
        }

        $meta = $sub->meta ?? [];
        unset($meta['dunning']);

        return self::transition($sub, 'ACTIVE', 'payment_recovered', ['overdue_zar' => 0, 'payment_failed_at' => null, 'meta' => $meta], ['via' => $via], true);
    }

    /** Involuntary closure only after the final notice and expiry of grace (Blueprint 8.6, K.2). */
    public static function closeNonPayment(Subscription $sub): Subscription
    {
        if ($sub->status !== 'PAST_DUE' || ($sub->meta['dunning']['stage'] ?? null) !== 'Final Notice Sent') {
            throw ValidationException::withMessages(['status' => 'Involuntary churn is only allowed after the final notice and expiry of the grace period.']);
        }

        return self::transition($sub, 'CLOSED_NONPAYMENT', 'closed_nonpayment', ['churn_code' => 'CH-INV', 'next_charge_at' => null, 'mandate' => [...($sub->mandate ?? []), 'status' => 'STOPPED']]);
    }
}
