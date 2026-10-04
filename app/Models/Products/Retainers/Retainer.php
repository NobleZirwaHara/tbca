<?php

namespace App\Models\Products\Retainers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * An executed Retainer (the contract). Owns service periods and every
 * operating record: usage, disputes, overages, scope changes, substitutions,
 * commitments, allocations, alerts, decisions, scenarios and rollover.
 */
#[Unguarded]
class Retainer extends Model
{
    protected $table = 'prd_ret_retainers';

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(Period::class)->orderBy('starts_on');
    }

    public function usage(): HasMany
    {
        return $this->hasMany(Usage::class);
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class);
    }

    public function overages(): HasMany
    {
        return $this->hasMany(Overage::class);
    }

    public function scopeChanges(): HasMany
    {
        return $this->hasMany(ScopeChange::class);
    }

    public function substitutions(): HasMany
    {
        return $this->hasMany(Substitution::class);
    }

    public function commitments(): HasMany
    {
        return $this->hasMany(Commitment::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(Allocation::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function decisions(): HasMany
    {
        return $this->hasMany(UtilisationDecision::class);
    }

    public function scenarios(): HasMany
    {
        return $this->hasMany(Scenario::class);
    }

    public function rollovers(): HasMany
    {
        return $this->hasMany(Rollover::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    /** The open service period (latest open, else the latest period). */
    public function currentPeriod(): ?Period
    {
        return $this->periods()->where('status', 'open')->latest('starts_on')->first()
            ?? $this->periods()->latest('starts_on')->first();
    }

    /** Hourly basis used for resize / scenario pricing (fee scales linearly with allowance). */
    public function hourlyBasis(): float
    {
        return $this->allowance_qty > 0 ? $this->monthly_fee_zar / $this->allowance_qty : 0;
    }

    protected function casts(): array
    {
        return [
            'allowance_qty' => 'float',
            'named_person_material' => 'boolean',
            'adviser' => 'array',
            'account_owner' => 'array',
            'signatory' => 'array',
            'renewal' => 'array',
            'cancellation' => 'array',
            'sizing' => 'array',
            'start_date' => 'date',
            'term_end' => 'date',
            'cancel_effective' => 'date',
            'signed_at' => 'datetime',
            'activated_at' => 'datetime',
            'commercial_review' => 'boolean',
        ];
    }
}
