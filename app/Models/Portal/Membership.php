<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Membership extends Model
{
    protected $table = 'portal_memberships';

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'meta' => 'array',
            'mfa' => 'boolean',
            'is_primary' => 'boolean',
            'invited_at' => 'datetime',
            'invite_expires_at' => 'datetime',
            'last_active_at' => 'datetime',
            'offboarded_at' => 'datetime',
        ];
    }

    public function organisation(): BelongsTo
    {
        return $this->belongsTo(Organisation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
