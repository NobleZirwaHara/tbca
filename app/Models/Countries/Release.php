<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Release extends Model
{
    protected $table = 'ctry_releases';

    protected function casts(): array
    {
        return [
            'authorisations' => 'array',
            'defects' => 'array',
            'target_date' => 'date',
            'rollback_proven' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
