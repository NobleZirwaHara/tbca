<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Account extends Model
{
    protected $table = 'portal_accounts';

    protected function casts(): array
    {
        return [
            'preferences' => 'array',
            'onboarding' => 'array',
            'mfa_enabled_at' => 'datetime',
            'password_changed_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'state_since' => 'datetime',
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
