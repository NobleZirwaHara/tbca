<?php

namespace App\Models\Products\Digital;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Refund request / product issue / technical problem raised by a holder. */
#[Unguarded]
class DpCase extends Model
{
    protected $table = 'prd_dp_cases';

    protected function casts(): array
    {
        return [
            'downloaded' => 'boolean',
            'decided_at' => 'datetime',
        ];
    }

    public function entitlement(): BelongsTo
    {
        return $this->belongsTo(DpEntitlement::class, 'entitlement_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
