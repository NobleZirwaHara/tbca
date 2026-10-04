<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class SavedBasket extends Model
{
    protected $table = 'shop_saved_baskets';

    protected function casts(): array
    {
        return ['items' => 'array'];
    }
}
