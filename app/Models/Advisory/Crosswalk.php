<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Crosswalk extends Model
{
    protected $table = 'adv_crosswalks';

    protected function casts(): array
    {
        return [
            'last_verified' => 'date',
        ];
    }
}
