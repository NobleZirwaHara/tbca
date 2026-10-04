<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Service extends Model
{
    protected $table = 'adv_services';

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }
}
