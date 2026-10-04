<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class RegisterEntry extends Model
{
    protected $table = 'ctry_register_entries';

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'recorded_on' => 'date',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
