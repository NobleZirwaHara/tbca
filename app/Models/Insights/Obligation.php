<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Obligation extends Model
{
    protected $table = 'ins_obligations';

    protected function casts(): array
    {
        return [
            'due_on' => 'date',
            'recurring' => 'boolean',
            'custom' => 'boolean',
        ];
    }
}
