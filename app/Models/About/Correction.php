<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Correction extends Model
{
    protected $table = 'abt_corrections';

    /** Pipeline order shown in the Correction Workflow console. */
    public const PIPELINE = ['submitted', 'triage', 'in_review', 'awaiting_approval', 'approved', 'published', 'closed'];

    public const PRIORITIES = ['low', 'medium', 'high', 'critical'];

    protected $hidden = ['evidence_path'];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'history' => 'array',
            'submitted_at' => 'datetime',
            'target_publish_at' => 'date',
            'effective_at' => 'date',
            'last_verified_at' => 'date',
        ];
    }

    public function claim(): BelongsTo
    {
        return $this->belongsTo(Claim::class);
    }

    /** Material corrections visible on the public Corrections Register. */
    public function scopePublicRegister(Builder $q): Builder
    {
        return $q->where('is_public', true)->whereIn('status', ['published', 'closed']);
    }

    public function log(string $action, ?string $note = null, ?string $by = null): void
    {
        $history = $this->history ?? [];
        $history[] = ['at' => now()->toIso8601String(), 'by' => $by ?? 'Governance', 'action' => $action, 'note' => $note];
        $this->history = $history;
    }
}
