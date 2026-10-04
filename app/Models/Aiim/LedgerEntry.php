<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class LedgerEntry extends Model
{
    protected $table = 'aiim_ledger_entries';

    protected function casts(): array
    {
        return [
            'amount_zar' => 'float',
            'vat_zar' => 'float',
            'posted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function engagement(): BelongsTo
    {
        return $this->belongsTo(Engagement::class);
    }
}
