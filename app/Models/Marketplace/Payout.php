<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Payout extends Model
{
    protected $table = 'mkt_payouts';

    protected function casts(): array
    {
        return [
            'available_from' => 'date',
            'paid_at' => 'datetime',
            'earnings_zar' => 'float',
            'fee_zar' => 'float',
            'vat_zar' => 'float',
            'amount_zar' => 'float',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function engagement(): BelongsTo
    {
        return $this->belongsTo(Engagement::class);
    }
}
