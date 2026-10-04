<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class UatCase extends Model
{
    protected $table = 'shop_uat_cases';

    protected function casts(): array
    {
        return ['executed_at' => 'datetime'];
    }
}
