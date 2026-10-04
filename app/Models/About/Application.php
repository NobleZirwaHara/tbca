<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Candidate application. AI may not issue final decisions; status changes are human actions. */
#[Unguarded]
class Application extends Model
{
    protected $table = 'abt_applications';

    public const STATUSES = ['submitted', 'screening', 'interview', 'offer', 'unsuccessful', 'withdrawn'];

    protected $hidden = ['cv_path', 'cover_letter_path'];

    protected function casts(): array
    {
        return [
            'experience' => 'array',
            'education' => 'array',
            'screening' => 'array',
            'history' => 'array',
            'privacy_acknowledged_at' => 'datetime',
        ];
    }

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(Vacancy::class);
    }

    public function log(string $status, ?string $note = null): void
    {
        $history = $this->history ?? [];
        $history[] = ['at' => now()->toIso8601String(), 'status' => $status, 'note' => $note];
        $this->history = $history;
    }
}
