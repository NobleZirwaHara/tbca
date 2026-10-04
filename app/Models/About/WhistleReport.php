<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Restricted whistleblowing case. Isolated from Submission/CRM records; the
 * reporter checks status with a secret case token that is stored only as a hash.
 */
#[Unguarded]
class WhistleReport extends Model
{
    protected $table = 'abt_whistle_reports';

    public const STATUSES = ['received', 'case_review', 'assessment', 'investigation', 'closed'];

    protected $hidden = ['token_hash', 'reporter_name', 'reporter_email', 'evidence_path'];

    protected function casts(): array
    {
        return ['messages' => 'array', 'willing_contact' => 'boolean', 'anonymous' => 'boolean'];
    }

    public static function makeToken(): string
    {
        return strtoupper(implode('-', str_split(Str::random(16), 4)));
    }

    /** Find a report by reference + secret token (both required). */
    public static function findByToken(string $reference, string $token): ?self
    {
        $report = static::where('reference', strtoupper(trim($reference)))->first();

        return $report && Hash::check(strtoupper(trim($token)), $report->token_hash) ? $report : null;
    }

    public function addMessage(string $from, string $body): void
    {
        $messages = $this->messages ?? [];
        $messages[] = ['at' => now()->toIso8601String(), 'from' => $from, 'body' => $body];
        $this->messages = $messages;
    }
}
