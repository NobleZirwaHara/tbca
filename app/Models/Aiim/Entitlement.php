<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Entitlement extends Model
{
    protected $table = 'aiim_entitlements';

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'amount_zar' => 'float',
            'extra_view_zar' => 'float',
            'expires_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Order::class);
    }
}
