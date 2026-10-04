<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class RetainerCapacity extends Model
{
    protected $table = 'shop_retainer_capacities';

    protected function casts(): array
    {
        return ['elements' => 'array', 'allowance' => 'float', 'reserved' => 'float', 'utilised' => 'float'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
