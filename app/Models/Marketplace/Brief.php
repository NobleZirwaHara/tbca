<?php

namespace App\Models\Marketplace;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Unguarded]
class Brief extends Model
{
    protected $table = 'mkt_briefs';

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'scope' => 'array',
            'disclosure' => 'array',
            'open_to_providers' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class);
    }

    public function engagement(): HasOne
    {
        return $this->hasOne(Engagement::class);
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }
}
