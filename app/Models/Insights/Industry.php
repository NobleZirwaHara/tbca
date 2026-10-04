<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Canonical Industry master record (IND-01 .. IND-17).
 * `profile` holds the page content register: KPIs, service families,
 * diagnostics, opportunities, intelligence brief, partner categories, etc.
 */
#[Unguarded]
class Industry extends Model
{
    protected $table = 'ins_industries';

    public const COMPLEXITY = [
        'C0' => ['label' => 'Standard', 'modifier' => 1.00],
        'C1' => ['label' => 'Elevated', 'modifier' => 1.15],
        'C2' => ['label' => 'Regulated', 'modifier' => 1.35],
        'C3' => ['label' => 'Highly Regulated', 'modifier' => 1.65],
        'C4' => ['label' => 'Restricted', 'modifier' => null],
    ];

    public const STAGES = [
        0 => 'Intake', 1 => 'Scoping', 2 => 'Classification', 3 => 'Controls', 4 => 'Content & Cost',
        5 => 'Review & Approvals', 6 => 'UAT & Quality', 7 => 'Live', 8 => 'Live & Optimising',
    ];

    public const CATALOGUE = [
        'deep' => 'Deep',
        'thin' => 'Thin',
        'below_threshold' => 'Below Threshold',
    ];

    protected function casts(): array
    {
        return [
            'sprint_keywords' => 'array',
            'examples' => 'array',
            'rules' => 'array',
            'profile' => 'array',
            'target_live_date' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function subIndustries(): HasMany
    {
        return $this->hasMany(SubIndustry::class)->orderBy('sort');
    }

    public function skus(): HasMany
    {
        return $this->hasMany(Sku::class);
    }

    public function benchmarks(): HasMany
    {
        return $this->hasMany(Benchmark::class);
    }

    public function changes(): HasMany
    {
        return $this->hasMany(TaxonomyChange::class)->latest();
    }

    public function complexityLabel(): string
    {
        return $this->complexity_class.' '.(self::COMPLEXITY[$this->complexity_class]['label'] ?? '');
    }

    public function stageLabel(): string
    {
        return 'S'.$this->activation_stage.' '.(self::STAGES[$this->activation_stage] ?? '');
    }

    public function isBelowThreshold(): bool
    {
        return $this->catalogue_state === 'below_threshold';
    }

    /** Compact shape used by selectors and lists. */
    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'shortCode' => $this->short_code,
            'number' => $this->number,
            'slug' => $this->slug,
            'name' => $this->name,
            'icon' => $this->icon,
            'blurb' => $this->blurb,
            'catalogueState' => $this->catalogue_state,
            'complexityClass' => $this->complexity_class,
            'complexityLabel' => $this->complexityLabel(),
            'regulatoryState' => $this->regulatory_state,
            'professionalGate' => $this->professional_gate,
            'status' => $this->status,
        ];
    }
}
