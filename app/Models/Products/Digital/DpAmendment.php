<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** GATE-DP-16 immutable RightsAmendment (upgrade, maintenance, version change, refund). */
#[Unguarded]
class DpAmendment extends Model
{
    protected $table = 'prd_dp_amendments';

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function entitlement(): BelongsTo
    {
        return $this->belongsTo(DpEntitlement::class, 'entitlement_id');
    }
}
