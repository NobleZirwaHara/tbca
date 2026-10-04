<?php

namespace App\Models\DealRoom;

use App\Models\Order;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Charge extends Model
{
    protected $table = 'vdr_charges';

    protected function casts(): array
    {
        return [
            'lines' => 'array',
            'meta' => 'array',
            'due_date' => 'date',
            'paid_at' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isPaid(): bool
    {
        return in_array($this->status, ['paid', 'refunded', 'partially_refunded'], true);
    }
}
