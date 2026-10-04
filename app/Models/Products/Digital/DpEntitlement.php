<?php

namespace App\Models\Products\Digital;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * GATE-DP-15: the buyer's right to use (and download) one exact ProductVersion
 * under one licence class. Only created ACTIVE once the linked order is paid.
 */
#[Unguarded]
class DpEntitlement extends Model
{
    protected $table = 'prd_dp_entitlements';

    protected function casts(): array
    {
        return [
            'manifest' => 'array',
            'update_until' => 'date',
            'access_expires_at' => 'date',
            'maintenance_until' => 'date',
            'auto_renew' => 'boolean',
            'purchased_at' => 'datetime',
            'activated_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(DpProduct::class, 'product_id');
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(DpVersion::class, 'version_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(DpDownload::class, 'entitlement_id');
    }

    public function amendments(): HasMany
    {
        return $this->hasMany(DpAmendment::class, 'entitlement_id');
    }

    public function cases(): HasMany
    {
        return $this->hasMany(DpCase::class, 'entitlement_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
