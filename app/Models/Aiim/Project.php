<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Project extends Model
{
    protected $table = 'aiim_projects';

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'premium' => 'array',
            'score' => 'float',
            'added_on' => 'date',
            'next_review_on' => 'date',
            'screening' => 'array',
            'coordinates_placeholder' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'capex_zar' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
