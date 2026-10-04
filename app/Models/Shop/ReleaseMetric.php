<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class ReleaseMetric extends Model
{
    protected $table = 'shop_release_metrics';

    protected function casts(): array
    {
        return ['closed_at' => 'datetime'];
    }
}
