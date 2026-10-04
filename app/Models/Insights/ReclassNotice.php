<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ReclassNotice extends Model
{
    protected $table = 'ins_reclass_notices';

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'effective_on' => 'date',
            'previous' => 'array',
            'next' => 'array',
            'reasons' => 'array',
            'evidence' => 'array',
            'acknowledged_at' => 'datetime',
        ];
    }

    public function engagement(): BelongsTo
    {
        return $this->belongsTo(Engagement::class);
    }
}
