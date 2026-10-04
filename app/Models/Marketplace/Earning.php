<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Earning extends Model
{
    protected $table = 'mkt_earnings';

    protected function casts(): array
    {
        return [
            'occurred_on' => 'date',
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
