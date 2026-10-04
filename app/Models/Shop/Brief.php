<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Brief extends Model
{
    protected $table = 'shop_briefs';

    protected function casts(): array
    {
        return ['data' => 'array', 'submitted_at' => 'datetime'];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
