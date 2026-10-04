<?php

namespace App\Models\Shop;

use App\Models\Order;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Mandate extends Model
{
    protected $table = 'shop_mandates';

    protected function casts(): array
    {
        return ['consents' => 'array', 'start_date' => 'date', 'activated_at' => 'datetime'];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
