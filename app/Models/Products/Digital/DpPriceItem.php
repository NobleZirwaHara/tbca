<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class DpPriceItem extends Model
{
    protected $table = 'prd_dp_price_items';

    protected function casts(): array
    {
        return [
            'bundle' => 'boolean',
        ];
    }
}
