<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Overage extends Model
{
    protected $table = 'prd_ret_overages';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'lines' => 'array',
            'units' => 'float',
            'authorised_units' => 'float',
            'expires_at' => 'datetime',
            'authorised_at' => 'datetime',
        ];
    }
}
