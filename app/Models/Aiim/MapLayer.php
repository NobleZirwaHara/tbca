<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class MapLayer extends Model
{
    protected $table = 'aiim_map_layers';

    protected function casts(): array
    {
        return ['labels' => 'array'];
    }
}
