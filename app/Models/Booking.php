<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A scheduled call or meeting (discovery calls, advisor sessions, consultations).
 */
#[Unguarded]
class Booking extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'meta' => 'array',
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
}
