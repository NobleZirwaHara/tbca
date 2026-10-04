<?php

namespace App\Models\Products\Retainers;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Unguarded]
class Proposal extends Model
{
    protected $table = 'prd_ret_proposals';

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function retainer(): HasOne
    {
        return $this->hasOne(Retainer::class);
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    protected function casts(): array
    {
        return [
            'request' => 'array',
            'allowance_qty' => 'float',
            'reserved_units' => 'float',
            'start_date' => 'date',
            'valid_until' => 'date',
            'reservation_expires_at' => 'datetime',
            'issued_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }
}
