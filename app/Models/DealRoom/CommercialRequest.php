<?php

namespace App\Models\DealRoom;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class CommercialRequest extends Model
{
    protected $table = 'vdr_requests';

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'decided_at' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function charge(): BelongsTo
    {
        return $this->belongsTo(Charge::class);
    }
}
