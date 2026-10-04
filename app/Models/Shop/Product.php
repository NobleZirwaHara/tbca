<?php

namespace App\Models\Shop;

use App\Support\Shop\Acts;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Online Shop Product Master. Listing state, gate outcome and gate reasons are
 * derived by App\Support\Shop\ListingGate and are never written directly.
 */
#[Unguarded]
class Product extends Model
{
    protected $table = 'shop_products';

    protected function casts(): array
    {
        return [
            'buyer_types' => 'array',
            'aliases' => 'array',
            'content' => 'array',
            'variants' => 'array',
            'gates' => 'array',
            'recurrence' => 'array',
            'gate_reasons' => 'array',
            'featured' => 'boolean',
            'tax_confirmed' => 'boolean',
            'rating' => 'float',
            'gate_evaluated_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** Products a buyer may see (everything except Do-Not-List and archived masters). */
    public function scopeListed(Builder $query): Builder
    {
        return $query->where('status', 'active')->where(fn ($q) => $q->whereNull('listing_state')->orWhere('listing_state', '!=', 'LS-06'));
    }

    public function actLabel(): string
    {
        return Acts::label($this->act);
    }

    public function isMonetary(): bool
    {
        return in_array($this->act, ['A1', 'A2', 'A3'], true);
    }

    /** Binding online commitment allowed (LS-01 purchase/subscribe or LS-03 free access). */
    public function isPurchasable(): bool
    {
        return in_array($this->listing_state, ['LS-01', 'LS-03'], true);
    }

    public function isCertifiedSubscription(): bool
    {
        if ($this->act !== 'A3') {
            return false;
        }

        $r = $this->recurrence ?? [];

        return collect(['r1', 'r2', 'r3', 'r4', 'r5'])->every(fn ($k) => ($r[$k] ?? null) === 'pass');
    }

    public function contentValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->content, $key, $default);
    }

    public function url(): string
    {
        return "/shop/product/{$this->slug}";
    }
}
