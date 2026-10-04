<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class DpEvent extends Model
{
    protected $table = 'prd_dp_events';

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }
}
