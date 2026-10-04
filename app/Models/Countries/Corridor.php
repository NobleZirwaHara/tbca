<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Corridor extends Model
{
    protected $table = 'ctry_corridors';

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'pair_certified' => 'boolean',
            'featured' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function feeLines(): HasMany
    {
        return $this->hasMany(FeeLine::class)->orderBy('line_no');
    }
}
