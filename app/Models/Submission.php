<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Generic inbound form record: questions, enquiries, quote requests, applications, complaints.
 */
#[Unguarded]
class Submission extends Model
{
    protected function casts(): array
    {
        return ['payload' => 'array'];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
