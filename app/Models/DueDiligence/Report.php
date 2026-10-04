<?php

namespace App\Models\DueDiligence;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Report extends Model
{
    protected $table = 'dd_reports';

    protected function casts(): array
    {
        return [
            'sections' => 'array',
            'deliverables' => 'array',
            'access_log' => 'array',
            'approved_at' => 'datetime',
        ];
    }

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class, 'case_id');
    }
}
