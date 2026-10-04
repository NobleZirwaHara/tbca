<?php

namespace App\Models\Products\Subscriptions;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A governed recurring plan. A plan is purchasable only when it carries a
 * recurrence class R1-R5, a plain-language next-period value, a known price,
 * a passing price floor and is not sales-blocked (Blueprint 2.2 GATE-SU-01).
 */
#[Unguarded]
class Plan extends Model
{
    protected $table = 'prd_sub_plans';

    public const CLASSES = [
        'R1' => ['name' => 'Refreshed', 'long' => 'Refreshed Content', 'body' => 'Content or intelligence is refreshed regularly. Value resets each period.'],
        'R2' => ['name' => 'Live System', 'long' => 'Live System', 'body' => 'Continuous system access and live monitoring.'],
        'R3' => ['name' => 'Periodic Delivery', 'long' => 'Periodic Delivery', 'body' => 'Defined outputs delivered at set intervals.'],
        'R4' => ['name' => 'Standing Readiness', 'long' => 'Standing Readiness', 'body' => 'Reserved capacity and specialist availability on an ongoing basis.'],
        'R5' => ['name' => 'Accumulating', 'long' => 'Accumulating Value', 'body' => 'Value grows through retained history and accumulated records.'],
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'entitlements' => 'array',
            'details' => 'array',
            'popular' => 'boolean',
            'pause_allowed' => 'boolean',
            'annual_available' => 'boolean',
            'sales_blocked' => 'boolean',
            'certified_until' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    public function className(): string
    {
        return self::CLASSES[$this->recurrence_class]['name'] ?? 'Retired / Legacy';
    }

    public function classLabel(): string
    {
        return "{$this->recurrence_class} – {$this->className()}";
    }

    /** Annual price for 12 months in advance after the plan's annual discount. */
    public function annualZar(): ?int
    {
        if ($this->monthly_zar === null || ! $this->annual_available) {
            return null;
        }

        return (int) round($this->monthly_zar * 12 * (100 - $this->annual_discount_pct) / 100);
    }

    public function priceFor(string $interval): ?int
    {
        return $interval === 'annual' ? $this->annualZar() : $this->monthly_zar;
    }

    public function isBelowFloor(): bool
    {
        return $this->monthly_zar !== null && $this->floor_zar !== null && $this->monthly_zar < $this->floor_zar;
    }

    /**
     * GATE-SU-01 recurrence eligibility plus the sales gates applied at checkout.
     * Returns null when the plan may be sold, otherwise the blocking code.
     */
    public function saleBlocker(): ?string
    {
        return match (true) {
            ! isset(self::CLASSES[$this->recurrence_class]) => 'SU-FAIL-NO-RECURRENCE',
            blank($this->next_period_value) => 'SU-FAIL-NO-PERIOD-VALUE',
            $this->monthly_zar === null => 'SU-FAIL-QUOTE',
            $this->status !== 'live' => 'RECURRENCE_REVIEW_REQUIRED',
            $this->isBelowFloor() => 'BLOCKED_BELOW_FLOOR',
            $this->sales_blocked => 'BLOCKED_BELOW_FLOOR',
            default => null,
        };
    }

    /** Row-level recurrence test result (no bulk PASS, no manual override). */
    public function evaluateRecurrence(): string
    {
        return match (true) {
            ! isset(self::CLASSES[$this->recurrence_class]) => 'SU-FAIL-NO-RECURRENCE',
            blank($this->next_period_value) => 'SU-FAIL-NO-PERIOD-VALUE',
            blank($this->delivery_cadence) => 'DELIVERY_REVIEW_HOLD',
            blank($this->evidence_id) => 'SU-FAIL-BULK-DEFAULT',
            $this->isBelowFloor() => 'PRICE_FLOOR_HOLD',
            default => 'PASS',
        };
    }

    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'slug' => $this->slug,
            'name' => $this->name,
            'tier' => $this->tier,
            'category' => $this->category,
            'recurrence_class' => $this->recurrence_class,
            'class_name' => $this->className(),
            'product_type' => $this->product_type,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'what_recurs' => $this->what_recurs,
            'why_recurs' => $this->why_recurs,
            'next_period_value' => $this->next_period_value,
            'who_for' => $this->who_for,
            'monthly_zar' => $this->monthly_zar,
            'annual_zar' => $this->annualZar(),
            'usd_monthly' => $this->usd_monthly,
            'annual_discount_pct' => $this->annual_discount_pct,
            'min_term_months' => $this->min_term_months,
            'delivery_cadence' => $this->delivery_cadence,
            'cancellation_route' => $this->cancellation_route,
            'pause_allowed' => $this->pause_allowed,
            'popular' => $this->popular,
            'features' => $this->features ?? [],
            'entitlements' => $this->entitlements ?? [],
            'details' => $this->details ?? (object) [],
            'status' => $this->status,
            'sale_blocker' => $this->saleBlocker(),
            'floor_zar' => $this->floor_zar,
        ];
    }
}
