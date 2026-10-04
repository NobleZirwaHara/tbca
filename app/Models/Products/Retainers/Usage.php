<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Usage extends Model
{
    protected $table = 'prd_ret_usage';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class);
    }

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'units' => 'float',
            'original_units' => 'float',
        ];
    }
}
