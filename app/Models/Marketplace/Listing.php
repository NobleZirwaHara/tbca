<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Listing extends Model
{
    protected $table = 'mkt_listings';

    protected function casts(): array
    {
        return [
            'details' => 'array',
            'rating' => 'float',
        ];
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
