<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Certification, attestation and trade mark register (AB-TEB Parts 4-5).
 * Status is derived from validity dates plus a manual state (paused / withdrawn).
 */
#[Unguarded]
class CertAsset extends Model
{
    protected $table = 'abt_cert_assets';

    public const EXPIRING_DAYS = 180;

    protected function casts(): array
    {
        return ['valid_from' => 'date', 'valid_to' => 'date'];
    }

    public function evidence(): HasMany
    {
        return $this->hasMany(Evidence::class, 'cert_asset_id');
    }

    /** active | expiring_soon | expired | paused | withdrawn */
    public function status(): string
    {
        if ($this->state !== 'active') {
            return $this->state;
        }
        if ($this->valid_to) {
            $days = now()->startOfDay()->diffInDays($this->valid_to, false);
            if ($days < 0) {
                return 'expired';
            }
            if ($days <= self::EXPIRING_DAYS) {
                return 'expiring_soon';
            }
        }

        return 'active';
    }

    public function daysLeft(): ?int
    {
        return $this->valid_to ? (int) now()->startOfDay()->diffInDays($this->valid_to, false) : null;
    }

    public function scopeStatus(Builder $q, string $status): Builder
    {
        $today = now()->toDateString();
        $soon = now()->addDays(self::EXPIRING_DAYS)->toDateString();

        return match ($status) {
            'paused', 'withdrawn' => $q->where('state', $status),
            'expired' => $q->where('state', 'active')->whereDate('valid_to', '<', $today),
            'expiring_soon' => $q->where('state', 'active')->whereDate('valid_to', '>=', $today)->whereDate('valid_to', '<=', $soon),
            'active' => $q->where('state', 'active')->where(fn ($w) => $w->whereNull('valid_to')->orWhereDate('valid_to', '>', $soon)),
            default => $q,
        };
    }

    /** ® renders only for an active, current registered mark (AB-CLAIM-BLD-007). */
    public function displaySymbol(): string
    {
        if ($this->asset_type !== 'trade_mark') {
            return '';
        }

        return $this->symbol === '®' && in_array($this->status(), ['active', 'expiring_soon'], true) ? '®' : '™';
    }
}
