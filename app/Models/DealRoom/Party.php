<?php

namespace App\Models\DealRoom;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Party extends Model
{
    protected $table = 'vdr_parties';

    protected function casts(): array
    {
        return [
            'invited_at' => 'datetime',
            'invite_expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'nda_accepted_at' => 'datetime',
            'last_access_at' => 'datetime',
            'mfa' => 'boolean',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
