<?php

namespace App\Models\Marketplace;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class PartnerRequest extends Model
{
    protected $table = 'mkt_partner_requests';

    protected function casts(): array
    {
        return [
            'intake' => 'array',
            'resolution' => 'array',
            'quote' => 'array',
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Provider::class, 'partner_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }
}
