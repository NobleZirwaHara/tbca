<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Rollover extends Model
{
    protected $table = 'prd_ret_rollovers';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'period_ended' => 'date',
            'expires_on' => 'date',
            'units' => 'float',
        ];
    }
}
