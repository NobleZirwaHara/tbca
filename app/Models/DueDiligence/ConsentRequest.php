<?php

namespace App\Models\DueDiligence;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ConsentRequest extends Model
{
    protected $table = 'dd_consent_requests';

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'completed_at' => 'datetime',
            'last_reminded_at' => 'datetime',
        ];
    }

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class, 'case_id');
    }

    public function consent(): BelongsTo
    {
        return $this->belongsTo(Consent::class);
    }
}
