<?php

namespace App\Models\CorePages;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * Layer 9 observation candidate (Countries blueprint, Part 21).
 * candidate -> under_review -> passed (quality gate) -> promoted; rejected from review;
 * promoted -> retracted. publication_permission defaults to false and must be true to promote.
 */
#[Unguarded]
class Observation extends Model
{
    protected $table = 'core_observations';

    public const QUALITY_THRESHOLD = 0.70;

    public const RCS_THRESHOLD = 80;

    protected function casts(): array
    {
        return [
            'captured_at' => 'datetime',
            'promoted_at' => 'datetime',
            'quality_score' => 'float',
            'publication_permission' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'obs_id';
    }

    /** @return array<string, list<string>> */
    public static function transitions(): array
    {
        return [
            'candidate' => ['under_review', 'rejected'],
            'under_review' => ['passed', 'rejected'],
            'passed' => ['promoted', 'rejected'],
            'promoted' => ['retracted'],
            'rejected' => [],
            'retracted' => [],
        ];
    }

    /** Reason the move is blocked by a gate, or null. */
    public function gateBlocker(string $to): ?string
    {
        if (! in_array($to, self::transitions()[$this->status] ?? [], true)) {
            return "An observation in status '{$this->status}' cannot move to '{$to}'.";
        }
        if ($to === 'passed') {
            if ($this->quality_score < self::QUALITY_THRESHOLD) {
                return 'Quality score '.number_format($this->quality_score, 2).' is below the '.number_format(self::QUALITY_THRESHOLD, 2).' quality gate.';
            }
            if ($this->rcs_link < self::RCS_THRESHOLD) {
                return "RCS link {$this->rcs_link}% is below the ".self::RCS_THRESHOLD.'% provenance threshold.';
            }
        }
        if ($to === 'promoted' && ! $this->publication_permission) {
            return 'Publication permission is false. Rights and anonymity review must grant permission before promotion.';
        }

        return null;
    }
}
