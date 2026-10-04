<?php

namespace App\Models\Marketplace;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Provider extends Model
{
    protected $table = 'mkt_providers';

    protected function casts(): array
    {
        return [
            'profile' => 'array',
            'application' => 'array',
            'vetting' => 'array',
            'last_verified_at' => 'date',
            'next_review_at' => 'date',
            'agreement_signed_at' => 'datetime',
            'rating' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function engagements(): HasMany
    {
        return $this->hasMany(Engagement::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class);
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    /** Routable = may receive new work (blueprint: only ACTIVE / CURRENT_VERIFIED states route). */
    public function isRoutable(): bool
    {
        return in_array($this->status, ['active', 'active_with_conditions'], true);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
