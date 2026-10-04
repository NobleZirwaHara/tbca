<?php

namespace App\Models\Aiim;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A custom intelligence or advisory engagement. Its status follows the staged
 * lifecycle in App\Support\Aiim\EngagementFlow (request -> review -> discovery
 * -> quote -> engagement letter -> signature -> deposit -> mandate in progress
 * -> delivered -> accepted -> closed), with pause / cancel branches.
 */
#[Unguarded]
class Engagement extends Model
{
    protected $table = 'aiim_engagements';

    protected function casts(): array
    {
        return [
            'request' => 'array',
            'outcome' => 'array',
            'quote' => 'array',
            'workplan' => 'array',
            'deliverables' => 'array',
            'verification' => 'array',
            'deep_dive' => 'array',
            'packaging' => 'array',
            'delivery' => 'array',
            'discovery_at' => 'datetime',
            'quote_accepted_at' => 'datetime',
            'letter_accepted_at' => 'datetime',
            'signed_at' => 'datetime',
            'deposit_paid_at' => 'datetime',
            'balance_paid_at' => 'datetime',
            'paused_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'original_end_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function advisor(): BelongsTo
    {
        return $this->belongsTo(Advisor::class);
    }

    public function depositOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'deposit_order_id');
    }

    public function balanceOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'balance_order_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(EngagementEvent::class)->latest('id');
    }

    public function verificationItems(): HasMany
    {
        return $this->hasMany(VerificationItem::class)->orderBy('sort');
    }

    public function cases(): HasMany
    {
        return $this->hasMany(CaseFile::class)->latest('id');
    }

    public function introduction(): HasOne
    {
        return $this->hasOne(Introduction::class);
    }

    public function handoffs(): HasMany
    {
        return $this->hasMany(Handoff::class);
    }

    public function ledger(): HasMany
    {
        return $this->hasMany(LedgerEntry::class)->latest('posted_at');
    }

    /** Fee schedule totals agreed in the accepted quote (ex VAT). */
    public function feeExVat(): float
    {
        return (float) ($this->quote['subtotal'] ?? 0);
    }

    public function feeInclVat(): float
    {
        return (float) ($this->quote['total'] ?? 0);
    }

    public function depositExVat(): float
    {
        return round($this->feeExVat() * (($this->quote['deposit_percent'] ?? 50) / 100), 2);
    }
}
