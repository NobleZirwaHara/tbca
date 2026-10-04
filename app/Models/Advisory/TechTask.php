<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class TechTask extends Model
{
    protected $table = 'adv_tech_tasks';

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }
}
