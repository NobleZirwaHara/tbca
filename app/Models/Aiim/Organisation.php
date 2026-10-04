<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Organisation extends Model
{
    protected $table = 'aiim_organisations';

    protected function casts(): array
    {
        return [
            'focus' => 'array',
            'stages' => 'array',
            'instruments' => 'array',
            'sector_slugs' => 'array',
            'profile' => 'array',
            'match_score' => 'float',
            'added_on' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
