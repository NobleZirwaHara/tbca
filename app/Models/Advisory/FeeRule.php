<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class FeeRule extends Model
{
    protected $table = 'adv_fee_rules';

    protected function casts(): array
    {
        return [
            'value' => 'float',
        ];
    }
}
