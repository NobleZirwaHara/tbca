<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sector benchmark rule and its disclosure gate (blueprint 11.3 - 11.5).
 * Numeric values render only when the benchmark is publishable.
 */
#[Unguarded]
class Benchmark extends Model
{
    protected $table = 'ins_benchmarks';

    protected function casts(): array
    {
        return [
            'bands' => 'array',
            'suppressed' => 'boolean',
            'under_review' => 'boolean',
            'last_review' => 'date',
            'next_review' => 'date',
        ];
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function nPass(): bool
    {
        return $this->n_current >= $this->min_n;
    }

    public function kPass(): bool
    {
        return $this->k_current >= $this->min_k;
    }

    public function diversityPass(): bool
    {
        return $this->diversity_current >= $this->min_diversity;
    }

    public function isPublishable(): bool
    {
        return $this->nPass() && $this->kPass() && $this->diversityPass() && ! $this->suppressed && ! $this->under_review;
    }

    /** eligible, below_threshold, suppressed, under_review */
    public function publicationStatus(): string
    {
        return match (true) {
            $this->suppressed => 'suppressed',
            $this->under_review => 'under_review',
            $this->isPublishable() => 'eligible',
            default => 'below_threshold',
        };
    }

    /** Blueprint 11.5 release state code. */
    public function releaseState(): string
    {
        return match (true) {
            $this->suppressed => 'BM-06 SUPPRESSED',
            $this->under_review => 'BM-03 PRIVACY_REVIEW',
            $this->isPublishable() => 'BM-05 PUBLISHABLE',
            $this->n_current === 0 => 'BM-01 COLLECTING',
            $this->n_current < $this->min_n => 'BM-01 COLLECTING',
            default => 'BM-02 BELOW_THRESHOLD',
        };
    }

    /** Blueprint 11.3 threshold level from independent entities. */
    public function level(): string
    {
        return match (true) {
            $this->n_current >= 100 => 'B3 (100+)',
            $this->n_current >= 50 => 'B2 (50-99)',
            $this->n_current >= 30 => 'B1 (30-49)',
            default => 'B0 (0-29)',
        };
    }

    public function nextLevel(): string
    {
        return match (true) {
            $this->n_current >= 100 => 'B3 (100+)',
            $this->n_current >= 50 => 'B3 (100+)',
            $this->n_current >= 30 => 'B2 (50-99)',
            default => 'B1 (30-49)',
        };
    }

    public function toRow(): array
    {
        return [
            'id' => $this->id,
            'sector' => $this->sector,
            'name' => $this->name,
            'type' => $this->type,
            'minN' => $this->min_n,
            'minK' => $this->min_k,
            'minDiversity' => $this->min_diversity,
            'nCurrent' => $this->n_current,
            'kCurrent' => $this->k_current,
            'diversityCurrent' => $this->diversity_current,
            'nPass' => $this->nPass(),
            'kPass' => $this->kPass(),
            'diversityPass' => $this->diversityPass(),
            'suppressionRule' => $this->suppression_rule,
            'suppressed' => $this->suppressed,
            'suppressionReason' => $this->suppression_reason,
            'underReview' => $this->under_review,
            'status' => $this->publicationStatus(),
            'releaseState' => $this->releaseState(),
            'level' => $this->level(),
            'lastReview' => $this->last_review?->format('d M Y'),
            'nextReview' => $this->next_review?->format('d M Y'),
        ];
    }
}
