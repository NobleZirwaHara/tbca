<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class BiasAlert extends Model
{
    protected $table = 'adv_bias_alerts';

    protected function casts(): array
    {
        return [
            'flagged_on' => 'date',
            'score' => 'float',
        ];
    }
}
