<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class DiagnosticRun extends Model
{
    protected $table = 'ins_diagnostic_runs';

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'scores' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }
}
