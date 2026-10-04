<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Task extends Model
{
    protected $table = 'ins_tasks';

    protected function casts(): array
    {
        return [
            'due_on' => 'date',
        ];
    }
}
