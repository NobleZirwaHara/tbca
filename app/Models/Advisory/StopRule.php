<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class StopRule extends Model
{
    protected $table = 'adv_stop_rules';

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
        ];
    }
}
