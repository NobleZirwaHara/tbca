<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class AiOutput extends Model
{
    protected $table = 'ins_ai_outputs';

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }
}
