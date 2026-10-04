<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class SpineCheck extends Model
{
    protected $table = 'adv_spine_checks';

    protected function casts(): array
    {
        return [
            'detected_on' => 'date',
            'due_date' => 'date',
        ];
    }
}
