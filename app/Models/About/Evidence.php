<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Evidence extends Model
{
    protected $table = 'abt_evidence';

    public const EXPIRING_DAYS = 60;

    protected function casts(): array
    {
        return ['as_at_date' => 'date', 'expiry_date' => 'date'];
    }

    public function claim(): BelongsTo
    {
        return $this->belongsTo(Claim::class);
    }

    public function certAsset(): BelongsTo
    {
        return $this->belongsTo(CertAsset::class);
    }

    /** current | expiring_soon | expired | no_expiry */
    public function expiryStatus(): string
    {
        if (! $this->expiry_date) {
            return 'no_expiry';
        }
        $days = now()->startOfDay()->diffInDays($this->expiry_date, false);
        if ($days < 0) {
            return 'expired';
        }

        return $days <= self::EXPIRING_DAYS ? 'expiring_soon' : 'current';
    }

    public function scopeExpiryStatus(Builder $q, string $status): Builder
    {
        $today = now()->toDateString();
        $soon = now()->addDays(self::EXPIRING_DAYS)->toDateString();

        return match ($status) {
            'no_expiry' => $q->whereNull('expiry_date'),
            'expired' => $q->whereDate('expiry_date', '<', $today),
            'expiring_soon' => $q->whereDate('expiry_date', '>=', $today)->whereDate('expiry_date', '<=', $soon),
            'current' => $q->whereDate('expiry_date', '>', $soon),
            default => $q,
        };
    }
}
