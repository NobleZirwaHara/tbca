<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class SovereignEngagement extends Model
{
    protected $table = 'ctry_sovereign_engagements';

    protected function casts(): array
    {
        return [
            'intake' => 'array',
            'declarations' => 'array',
            'deliverables' => 'array',
            'closure' => 'array',
            'disclosure_submitted_at' => 'datetime',
            'independence_confirmed_at' => 'datetime',
            'evidence_approved_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
