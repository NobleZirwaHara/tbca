<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class CapacityPool extends Model
{
    protected $table = 'prd_ret_capacity_pools';

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'pool_id');
    }

    protected function casts(): array
    {
        return [
            'data_effective_at' => 'datetime',
            'productive_units' => 'float',
            'cross_vehicle_units' => 'float',
            'protective_reserve' => 'float',
            'review_reserve' => 'float',
        ];
    }
}
