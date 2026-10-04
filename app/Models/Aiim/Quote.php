<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Quote extends Model
{
    protected $table = 'aiim_quotes';

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'lines' => 'array',
            'subtotal_zar' => 'float',
            'vat_zar' => 'float',
            'total_zar' => 'float',
            'valid_until' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Order::class);
    }
}
