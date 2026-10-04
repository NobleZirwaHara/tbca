<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Service extends Model
{
    protected $table = 'prd_ret_services';

    public function pool(): BelongsTo
    {
        return $this->belongsTo(CapacityPool::class, 'pool_id');
    }

    public function retainers(): HasMany
    {
        return $this->hasMany(Retainer::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected function casts(): array
    {
        return [
            'owner' => 'array',
            'inclusions' => 'array',
            'exclusions' => 'array',
            'checklist' => 'array',
            'certification_notes' => 'array',
            'allowance_qty' => 'float',
            'custom_pricing' => 'boolean',
        ];
    }
}
