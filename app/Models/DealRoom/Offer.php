<?php

namespace App\Models\DealRoom;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Offer extends Model
{
    protected $table = 'vdr_offers';

    protected function casts(): array
    {
        return [
            'terms' => 'array',
            'approved_at' => 'datetime',
            'equity_pct' => 'float',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
