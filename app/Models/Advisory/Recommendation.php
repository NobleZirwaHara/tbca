<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Recommendation extends Model
{
    protected $table = 'adv_recommendations';

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'result' => 'array',
        ];
    }
}
