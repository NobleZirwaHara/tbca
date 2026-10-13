<?php

namespace App\Models\DueDiligence;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One identity, business or screening verification run by an identity
 * provider for a Due Diligence check. Only decision fields are kept; ID
 * images, selfies and biometric data stay with the provider.
 */
#[Unguarded]
class IdentityVerification extends Model
{
    protected $table = 'dd_identity_verifications';

    public const TERMINAL = ['passed', 'failed'];

    protected function casts(): array
    {
        return [
            'summary' => 'array',
            'link_expires_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class, 'case_id');
    }

    public function check(): BelongsTo
    {
        return $this->belongsTo(Check::class, 'check_id');
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, self::TERMINAL, true);
    }

    /** Whether the subject must open a hosted journey (ID document, selfie, business documents). */
    public function needsSubject(): bool
    {
        return in_array($this->kind, ['kyc', 'kyc_address', 'kyb'], true);
    }
}
