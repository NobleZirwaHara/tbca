<?php

namespace App\Models\Insights;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Client Industry engagement (e.g. AGRI-2026-EGY-001 Market Intelligence Report).
 * `data` holds display registers: timeline, activity, documents, advisor,
 * partner scope, specialists and review checklist.
 */
#[Unguarded]
class Engagement extends Model
{
    protected $table = 'ins_engagements';

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'due_on' => 'date',
            'letter_signed_at' => 'datetime',
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

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function ledger(): HasMany
    {
        return $this->hasMany(LedgerEntry::class)->orderBy('occurred_at');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderBy('due_on');
    }

    public function gates(): HasMany
    {
        return $this->hasMany(Gate::class)->orderBy('code');
    }

    public function evidence(): HasMany
    {
        return $this->hasMany(EvidenceRequest::class)->orderBy('req_id');
    }

    public function obligations(): HasMany
    {
        return $this->hasMany(Obligation::class)->orderBy('due_on');
    }

    public function notices(): HasMany
    {
        return $this->hasMany(ReclassNotice::class)->latest('issued_at');
    }

    /** @return array{charges:int,payments:int,disbursements:int,outstanding:int,paidPct:float} */
    public function ledgerTotals(): array
    {
        $entries = $this->relationLoaded('ledger') ? $this->ledger : $this->ledger()->get();
        $charges = (int) $entries->where('type', 'charge')->sum('amount_zar');
        $payments = (int) $entries->where('type', 'payment')->where('status', 'completed')->sum('amount_zar');
        $refunds = (int) $entries->where('type', 'refund')->sum('amount_zar');
        $disbursements = (int) $entries->where('type', 'disbursement')->sum('amount_zar');
        $committed = max($charges, $this->total_fee_zar);
        $outstanding = max(0, $committed - $payments + $refunds);

        return [
            'committed' => $committed,
            'charges' => $charges,
            'payments' => $payments,
            'disbursements' => $disbursements,
            'outstanding' => $outstanding,
            'paidPct' => $committed > 0 ? round($payments / $committed * 100, 1) : 0.0,
        ];
    }

    public function context(): array
    {
        return [
            'reference' => $this->reference,
            'title' => $this->title,
            'industry' => $this->industry?->name,
            'industrySlug' => $this->industry?->slug,
            'subIndustry' => $this->sub_industry,
            'country' => $this->country,
            'stage' => $this->stage,
            'stageLabel' => $this->data['stage_label'] ?? $this->stage,
            'status' => $this->status,
            'date' => $this->created_at?->format('d M Y'),
        ];
    }
}
