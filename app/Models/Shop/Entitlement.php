<?php

namespace App\Models\Shop;

use App\Models\Order;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Entitlement extends Model
{
    protected $table = 'shop_entitlements';

    protected function casts(): array
    {
        return ['meta' => 'array', 'starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
