<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/** Complaint, media enquiry or partner enquiry with a trackable reference. */
#[Unguarded]
class TrustCase extends Model
{
    protected $table = 'abt_cases';

    public const STATUSES = [
        'complaint' => ['received', 'acknowledged', 'investigating', 'responded', 'resolved', 'closed'],
        'media' => ['received', 'in_progress', 'responded', 'closed'],
        'partner' => ['received', 'screening', 'consultation', 'approved', 'declined', 'closed'],
    ];

    public const PREFIX = ['complaint' => 'CMP', 'media' => 'MED', 'partner' => 'PRT'];

    protected $hidden = ['attachment_path'];

    protected function casts(): array
    {
        return ['details' => 'array', 'history' => 'array'];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function log(string $status, ?string $note = null): void
    {
        $history = $this->history ?? [];
        $history[] = ['at' => now()->toIso8601String(), 'status' => $status, 'note' => $note];
        $this->history = $history;
    }
}
