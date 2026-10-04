<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Industry-classified Sprint / SKU record. Carries the Industry classification
 * state, the objective complexity drivers (R Q E L V W, blueprint 4.2), the
 * cost build-up and the blocked / restricted register entry (blueprint 7.1).
 */
#[Unguarded]
class Sku extends Model
{
    protected $table = 'ins_skus';

    /** Floor price keeps at least this gross margin on the adjusted cost. */
    public const FLOOR_MARGIN = 0.20;

    public const MARGIN_TARGET = 0.25;

    public const DRIVERS = [
        'R' => ['label' => 'Regulatory oversight', 'max' => 4],
        'Q' => ['label' => 'Qualification dependency', 'max' => 4],
        'E' => ['label' => 'Evidence burden', 'max' => 3],
        'L' => ['label' => 'Liability / harm exposure', 'max' => 3],
        'V' => ['label' => 'Review cycles', 'max' => 3],
        'W' => ['label' => 'Observed rework', 'max' => 3],
    ];

    protected function casts(): array
    {
        return [
            'drivers' => 'array',
            'block_rules' => 'array',
            'add_ons' => 'array',
            'included' => 'array',
            'limitation' => 'array',
            'blocked_on' => 'date',
            'review_by' => 'date',
            'released_at' => 'datetime',
            'public' => 'boolean',
            'ai_confidence' => 'float',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function complexityScore(): int
    {
        $d = $this->drivers ?? [];

        return collect(array_keys(self::DRIVERS))->sum(fn ($k) => is_numeric($d[$k] ?? null) ? (int) $d[$k] : 0);
    }

    /** Blueprint 4.3: C0 0-3, C1 4-7, C2 8-11, C3 12-20; hard override = C4. */
    public function complexityClass(): string
    {
        if (! empty($this->drivers['override'])) {
            return 'C4';
        }

        $s = $this->complexityScore();

        return match (true) {
            $s <= 3 => 'C0',
            $s <= 7 => 'C1',
            $s <= 11 => 'C2',
            default => 'C3',
        };
    }

    public function modifier(): ?float
    {
        return Industry::COMPLEXITY[$this->complexityClass()]['modifier'];
    }

    public function adjustedCost(): ?int
    {
        $m = $this->modifier();

        return $m === null || $this->base_cost_zar === null ? null : (int) round($this->base_cost_zar * $m);
    }

    public function floorPrice(): ?int
    {
        $a = $this->adjustedCost();

        return $a === null ? null : (int) (ceil($a / (1 - self::FLOOR_MARGIN) / 10) * 10);
    }

    public function marginPct(): ?float
    {
        $a = $this->adjustedCost();
        if ($a === null || ! $this->guidance_price_zar) {
            return null;
        }

        return round(($this->guidance_price_zar - $a) / $this->guidance_price_zar * 100, 1);
    }

    /** above_floor, at_floor (within 3%), below_floor, blocked, undefined */
    public function marginStatus(): string
    {
        $floor = $this->floorPrice();
        if ($this->complexityClass() === 'C4') {
            return 'blocked';
        }
        if ($floor === null || ! $this->guidance_price_zar) {
            return 'undefined';
        }
        if ($this->guidance_price_zar < $floor) {
            return 'below_floor';
        }

        return $this->guidance_price_zar <= $floor * 1.03 ? 'at_floor' : 'above_floor';
    }

    public function isBlocked(): bool
    {
        return $this->sale_state === 'blocked' && $this->block_status !== 'released';
    }

    public function isRestricted(): bool
    {
        return $this->sale_state === 'restricted' && $this->block_status !== 'released';
    }

    public function costRow(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'industry' => $this->industry_label ?? $this->industry?->name,
            'subIndustry' => $this->sub_industry,
            'drivers' => array_merge(array_fill_keys(array_keys(self::DRIVERS), 0), $this->drivers ?? []),
            'score' => $this->complexityScore(),
            'complexityClass' => $this->complexityClass(),
            'complexityLabel' => $this->complexityClass().' '.Industry::COMPLEXITY[$this->complexityClass()]['label'],
            'baseCost' => $this->base_cost_zar,
            'modifier' => $this->modifier(),
            'adjustedCost' => $this->adjustedCost(),
            'marginPct' => $this->marginPct(),
            'floorPrice' => $this->floorPrice(),
            'guidancePrice' => $this->guidance_price_zar,
            'marginStatus' => $this->marginStatus(),
            'updated' => $this->updated_at?->format('d M Y'),
        ];
    }
}
