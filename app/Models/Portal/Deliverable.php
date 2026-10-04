<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Deliverable extends Model
{
    protected $table = 'portal_deliverables';

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'topics' => 'array',
            'versions' => 'array',
            'released_at' => 'datetime',
            'acceptance_due_on' => 'date',
            'decided_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
