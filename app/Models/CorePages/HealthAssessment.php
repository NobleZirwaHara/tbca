<?php

namespace App\Models\CorePages;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One Business Health Score diagnostic: draft progress (resumable for 30 days) and the submitted result.
 */
#[Unguarded]
class HealthAssessment extends Model
{
    protected $table = 'core_health_assessments';

    protected function casts(): array
    {
        return [
            'profile' => 'array',
            'answers' => 'array',
            'scores' => 'array',
            'saved_at' => 'datetime',
            'reminder_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function resumeExpired(): bool
    {
        return $this->updated_at !== null && $this->updated_at->lt(now()->subDays(30));
    }
}
