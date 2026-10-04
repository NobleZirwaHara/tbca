<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Period extends Model
{
    protected $table = 'prd_ret_periods';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    public function usage(): HasMany
    {
        return $this->hasMany(Usage::class);
    }

    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
            'opening_units' => 'float',
            'carry_units' => 'float',
            'credit_units' => 'float',
            'carry_out_units' => 'float',
            'utilisation_evaluated' => 'boolean',
            'statement_ack_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}
