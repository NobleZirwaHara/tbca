<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class ExceptionItem extends Model
{
    protected $table = 'adv_exceptions';

    protected function casts(): array
    {
        return [
            'raised_at' => 'datetime',
            'sla_due' => 'date',
        ];
    }
}
