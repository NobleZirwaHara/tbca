<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Download Event Register row (successful or blocked attempt). */
#[Unguarded]
class DpDownload extends Model
{
    protected $table = 'prd_dp_downloads';

    protected function casts(): array
    {
        return [
            'success' => 'boolean',
        ];
    }

    public function entitlement(): BelongsTo
    {
        return $this->belongsTo(DpEntitlement::class, 'entitlement_id');
    }
}
