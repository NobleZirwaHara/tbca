<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class WalletTransaction extends Model
{
    protected $table = 'aiim_wallet_transactions';

    protected function casts(): array
    {
        return [
            'amount_zar' => 'float',
            'balance_zar' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
