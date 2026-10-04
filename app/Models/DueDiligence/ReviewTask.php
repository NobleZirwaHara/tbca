<?php

namespace App\Models\DueDiligence;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ReviewTask extends Model
{
    protected $table = 'dd_tasks';

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
        ];
    }

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class, 'case_id');
    }
}
