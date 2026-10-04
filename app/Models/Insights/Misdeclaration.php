<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Misdeclaration extends Model
{
    protected $table = 'ins_misdeclarations';

    protected function casts(): array
    {
        return [
            'due_on' => 'date',
            'resolved_at' => 'datetime',
        ];
    }
}
