<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Corridor extends Model
{
    protected $table = 'aiim_corridors';

    protected function casts(): array
    {
        return [
            'modes' => 'array',
            'profile' => 'array',
            'score' => 'float',
            'added_on' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
