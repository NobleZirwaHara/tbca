<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * One selection in a visitor's or client's basket.
 */
#[Unguarded]
class BasketItem extends Model
{
    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function lineZar(): int
    {
        return $this->unit_zar * $this->quantity;
    }
}
