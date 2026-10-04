<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Disposition extends Model
{
    protected $table = 'adv_dispositions';

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'target_date' => 'date',
        ];
    }
}
