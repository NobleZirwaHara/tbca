<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class MerchRoute extends Model
{
    protected $table = 'shop_routes';

    protected function casts(): array
    {
        return [];
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'destination_product_id');
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'source_product_id');
    }
}
