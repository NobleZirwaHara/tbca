<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A Digital Product master record (one controlled product with versions,
 * permitted licence classes, approved languages and formats).
 */
#[Unguarded]
class DpProduct extends Model
{
    protected $table = 'prd_dp_products';

    protected function casts(): array
    {
        return [
            'audiences' => 'array',
            'industries' => 'array',
            'languages' => 'array',
            'currencies' => 'array',
            'jurisdictions' => 'array',
            'formats' => 'array',
            'prices' => 'array',
            'receive' => 'array',
            'compare' => 'array',
            'badges' => 'array',
            'content' => 'array',
            'defensibility' => 'array',
            'qa' => 'array',
            'verified_at' => 'date',
            'next_review_at' => 'date',
            'released_at' => 'datetime',
            'subscription_suitable' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DpVersion::class, 'product_id');
    }

    public function entitlements(): HasMany
    {
        return $this->hasMany(DpEntitlement::class, 'product_id');
    }

    public function claims(): HasMany
    {
        return $this->hasMany(DpClaim::class, 'product_id');
    }

    public function currentVersion(): ?DpVersion
    {
        return $this->versions->firstWhere('status', 'current');
    }

    /** Lowest permitted licence price (ex VAT) — the "From" price. */
    public function fromPrice(): int
    {
        return (int) collect($this->prices ?? [])->filter()->min();
    }

    /** GATE-DP-18: only live, priced, non-free-lead products can be bought. */
    public function isPurchasable(): bool
    {
        return $this->lifecycle_status === 'live' && $this->disposition !== 'DP-FR' && $this->fromPrice() > 0;
    }
}
