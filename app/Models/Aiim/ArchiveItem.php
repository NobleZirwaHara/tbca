<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ArchiveItem extends Model
{
    protected $table = 'aiim_archive_items';

    protected function casts(): array
    {
        return [
            'archived_on' => 'date',
            'retain_until' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
