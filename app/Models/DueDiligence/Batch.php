<?php

namespace App\Models\DueDiligence;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Enterprise bulk screening upload (DD-049). */
#[Unguarded]
class Batch extends Model
{
    protected $table = 'dd_batches';

    protected function casts(): array
    {
        return [
            'exceptions' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
