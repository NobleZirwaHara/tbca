<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One node of a country's administrative hierarchy:
 * 1 region > 2 district > 3 city > 4 municipality > 5 town. Levels a country
 * does not use are skipped (a Botswana town hangs directly off its district).
 */
#[Unguarded]
class AdminUnit extends Model
{
    public const LEVELS = [1 => 'region', 2 => 'district', 3 => 'city', 4 => 'municipality', 5 => 'town'];

    public const LEVEL_LABELS = ['region' => 'Region', 'district' => 'District', 'city' => 'City', 'municipality' => 'Municipality', 'town' => 'Town'];

    protected $table = 'aiim_admin_units';

    protected function casts(): array
    {
        return [
            'labels' => 'array',
            'meta' => 'array',
            'placeholder' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'population' => 'integer',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }
}
