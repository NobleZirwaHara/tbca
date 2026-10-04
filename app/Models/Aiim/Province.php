<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Province extends Model
{
    protected $table = 'aiim_provinces';

    protected function casts(): array
    {
        return [
            'glance' => 'array',
            'kpis' => 'array',
            'economy' => 'array',
            'key_sectors' => 'array',
            'evidence' => 'array',
            'score' => 'float',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
