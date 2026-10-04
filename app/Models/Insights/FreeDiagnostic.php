<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class FreeDiagnostic extends Model
{
    protected $table = 'ins_free_diagnostics';

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'result' => 'array',
        ];
    }
}
