<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class FeeLine extends Model
{
    protected $table = 'ctry_fee_lines';

    protected function casts(): array
    {
        return [
            'unit_amount' => 'float',
            'amount' => 'float',
            'fx_to_zar' => 'float',
        ];
    }

    public $timestamps = false;

    public function corridor(): BelongsTo
    {
        return $this->belongsTo(Corridor::class);
    }
}
