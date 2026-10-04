<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class DuplicateGroup extends Model
{
    protected $table = 'shop_duplicate_groups';

    protected function casts(): array
    {
        return ['members' => 'array'];
    }
}
