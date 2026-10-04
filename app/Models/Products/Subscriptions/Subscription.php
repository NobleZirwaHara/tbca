<?php

namespace App\Models\Products\Subscriptions;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A client's recurring relationship with one plan.
 *
 * `status` holds the lifecycle state (see Support\Products\Subscriptions\Lifecycle):
 *   PENDING_PAYMENT, ACTIVE, PAUSED, IN_GRACE, PAST_DUE, CANCELLED_PENDING, CANCELLED, CLOSED_NONPAYMENT.
 * PRICE_CHANGE_PENDING and DISUSE_FLAGGED are overlays on an ACTIVE subscription,
 * and a CANCELLED / CLOSED_NONPAYMENT subscription is shown as REACTIVATABLE.
 */
#[Unguarded]
class Subscription extends Model
{
    protected $table = 'prd_sub_subscriptions';

    public const VAT_RATE = 0.15;

    protected function casts(): array
    {
        return [
            'mandate' => 'array',
            'price_change' => 'array',
            'usage' => 'array',
            'meta' => 'array',
            'disuse_flagged' => 'boolean',
            'started_at' => 'datetime',
            'paused_at' => 'datetime',
            'cancel_requested_at' => 'datetime',
            'disuse_flagged_at' => 'datetime',
            'disuse_notified_at' => 'datetime',
            'renewal_notice_at' => 'datetime',
            'payment_failed_at' => 'datetime',
            'current_period_start' => 'date',
            'current_period_end' => 'date',
            'next_charge_at' => 'date',
            'next_review_at' => 'date',
            'pause_until' => 'date',
            'cancel_effective_at' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function pendingPlan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'pending_plan_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(SubEvent::class, 'subscription_id');
    }

    public function exports(): HasMany
    {
        return $this->hasMany(SubExport::class, 'subscription_id');
    }

    public function priceChangePending(): bool
    {
        $pc = $this->price_change;

        return is_array($pc) && ($pc['state'] ?? null) === 'pending';
    }

    /** The universal UI state from Blueprint 14.1. */
    public function displayStatus(): string
    {
        return match (true) {
            in_array($this->status, ['CANCELLED', 'CLOSED_NONPAYMENT'], true) => 'REACTIVATABLE',
            $this->status === 'ACTIVE' && $this->priceChangePending() => 'PRICE_CHANGE_PENDING',
            $this->status === 'ACTIVE' && $this->disuse_flagged => 'DISUSE_FLAGGED',
            default => $this->status,
        };
    }

    public function vatZar(): int
    {
        return (int) round($this->price_zar * self::VAT_RATE);
    }

    public function periodDays(): int
    {
        if (! $this->current_period_start || ! $this->current_period_end) {
            return $this->billing_interval === 'annual' ? 365 : 30;
        }

        return (int) $this->current_period_start->diffInDays($this->current_period_end) + 1;
    }

    public function remainingDays(?Carbon $at = null): int
    {
        if (! $this->current_period_end) {
            return 0;
        }

        $at = ($at ?? now())->copy()->startOfDay();

        return max(0, (int) $at->diffInDays($this->current_period_end, false) + 1);
    }

    public function accessUntil(): ?Carbon
    {
        return $this->cancel_effective_at ?? $this->current_period_end;
    }

    public function engagementScore(): int
    {
        $u = $this->usage ?? [];

        return (int) ($u['score'] ?? 0);
    }

    public function toSummary(): array
    {
        $plan = $this->plan;

        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status,
            'display_status' => $this->displayStatus(),
            'billing_interval' => $this->billing_interval,
            'price_zar' => $this->price_zar,
            'vat_zar' => $this->vatZar(),
            'total_zar' => $this->price_zar + $this->vatZar(),
            'started_at' => $this->started_at?->toDateString(),
            'current_period_start' => $this->current_period_start?->toDateString(),
            'current_period_end' => $this->current_period_end?->toDateString(),
            'next_charge_at' => $this->next_charge_at?->toDateString(),
            'next_review_at' => $this->next_review_at?->toDateString(),
            'min_term_months' => $this->min_term_months,
            'mandate' => $this->mandate,
            'pause_until' => $this->pause_until?->toDateString(),
            'cancel_requested_at' => $this->cancel_requested_at?->toDateString(),
            'cancel_effective_at' => $this->cancel_effective_at?->toDateString(),
            'cancel_reason' => $this->cancel_reason,
            'access_until' => $this->accessUntil()?->toDateString(),
            'disuse_flagged' => $this->disuse_flagged,
            'price_change' => $this->price_change,
            'payment_failed_at' => $this->payment_failed_at?->toIso8601String(),
            'overdue_zar' => $this->overdue_zar,
            'usage' => $this->usage ?? (object) [],
            'meta' => $this->meta ?? (object) [],
            'pending_plan' => $this->pendingPlan?->only(['name', 'slug', 'recurrence_class', 'monthly_zar']),
            'plan' => $plan ? $plan->toCard() : null,
        ];
    }
}
