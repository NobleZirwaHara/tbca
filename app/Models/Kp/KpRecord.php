<?php

namespace App\Models\Kp;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class KpRecord extends Model
{
    protected $table = 'kp_records';

    protected function casts(): array
    {
        return ['data' => 'array'];
    }
}
