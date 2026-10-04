<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Sector extends Model
{
    protected $table = 'aiim_sectors';

    protected function casts(): array
    {
        return [
            'scores' => 'array',
            'profile' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
