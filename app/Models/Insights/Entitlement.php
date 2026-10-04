<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Entitlement extends Model
{
    protected $table = 'ins_entitlements';

    protected function casts(): array
    {
        return [
            'data_exchange' => 'array',
            'acquired_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(Resource::class);
    }

    public function isActive(): bool
    {
        return $this->state === 'active' && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
