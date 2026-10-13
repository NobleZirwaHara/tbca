<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class MapFeature extends Model
{
    protected $table = 'aiim_map_features';

    protected function casts(): array
    {
        return ['labels' => 'array', 'meta' => 'array', 'placeholder' => 'boolean', 'latitude' => 'float', 'longitude' => 'float'];
    }
}
