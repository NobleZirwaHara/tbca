<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class EvidenceRequest extends Model
{
    protected $table = 'ins_evidence_requests';

    protected function casts(): array
    {
        return [
            'requested_on' => 'date',
            'due_on' => 'date',
            'submission' => 'array',
        ];
    }

    public function engagement(): BelongsTo
    {
        return $this->belongsTo(Engagement::class);
    }
}
