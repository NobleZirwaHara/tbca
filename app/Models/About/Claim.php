<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A governed public trust claim (AB-TEB Part 3). Publication is decided in the
 * query, never in the view:
 *
 *  - only approved, active claims with at least one verified evidence record render;
 *  - Ledger V claims whose verified evidence has all expired are withheld entirely
 *    (AB-CLAIM-BLD-008: expired V evidence cannot render as current);
 *  - other ledgers with only expired evidence render as "Under review" with the
 *    value suppressed;
 *  - claims with current evidence expiring within the review window render as
 *    "Review due" (REVERIFICATION_DUE).
 */
#[Unguarded]
class Claim extends Model
{
    protected $table = 'abt_claims';

    public const REVIEW_WINDOW_DAYS = 60;

    protected function casts(): array
    {
        return [
            'surfaces' => 'array',
            'popover' => 'array',
            'claimed_on' => 'date',
            'last_reviewed_at' => 'datetime',
        ];
    }

    public function evidence(): HasMany
    {
        return $this->hasMany(Evidence::class);
    }

    public function correction(): BelongsTo
    {
        return $this->belongsTo(Correction::class);
    }

    /** Verified evidence that has not expired. */
    public static function currentEvidence(Builder|\Illuminate\Database\Eloquent\Relations\Relation $q): void
    {
        $q->where('verification_status', 'verified')
            ->where(fn ($w) => $w->whereNull('expiry_date')->orWhereDate('expiry_date', '>=', now()->toDateString()));
    }

    /**
     * Claims that may appear on a public surface, annotated with evidence state.
     * Adds has_current_evidence and current_evidence_expiry columns.
     */
    public function scopePublished(Builder $q, ?string $surface = null): Builder
    {
        return $q->where('lifecycle', 'active')
            ->where('review_status', 'approved')
            ->whereHas('evidence', fn ($e) => $e->where('verification_status', 'verified'))
            ->where(fn ($w) => $w->where('ledger', '!=', 'V')
                ->orWhereHas('evidence', fn ($e) => self::currentEvidence($e)))
            ->when($surface, fn ($w) => $w->whereJsonContains('surfaces', $surface))
            ->withExists(['evidence as has_current_evidence' => fn ($e) => self::currentEvidence($e)])
            ->withMin(['evidence as current_evidence_expiry' => fn ($e) => self::currentEvidence($e)], 'expiry_date')
            ->orderBy('sort');
    }

    /** current | review_due | under_review — only meaningful on rows loaded via published(). */
    public function displayState(): string
    {
        if (! $this->has_current_evidence) {
            return 'under_review';
        }

        $expiry = $this->current_evidence_expiry;
        if ($expiry && now()->diffInDays($expiry, false) <= self::REVIEW_WINDOW_DAYS) {
            return 'review_due';
        }

        return 'current';
    }

    /** Public payload for trust components and the claim evidence popover. */
    public function toPublic(): array
    {
        $state = $this->displayState();
        $evidence = $this->relationLoaded('evidence') ? $this->evidence : $this->evidence()->get();

        return [
            'id' => $this->id,
            'code' => $this->code,
            'key' => $this->key,
            'statement' => $this->statement,
            'value' => $state === 'under_review' ? null : $this->value,
            'label' => $this->label,
            'description' => $this->description,
            'category' => $this->category,
            'claim_type' => $this->claim_type,
            'ledger' => $this->ledger,
            'icon' => $this->icon,
            'state' => $state,
            'as_at' => optional($this->last_reviewed_at)->toDateString(),
            'expires' => $this->current_evidence_expiry ? substr((string) $this->current_evidence_expiry, 0, 10) : null,
            'action' => $this->action_label ? ['label' => $this->action_label, 'href' => $this->action_href] : null,
            'popover' => $this->popover,
            'correction' => $this->correction_id ? optional($this->correction)->only(['code', 'title', 'effective_at']) : null,
            'evidence' => $evidence
                ->where('verification_status', 'verified')
                ->map(fn (Evidence $e) => [
                    'code' => $e->code,
                    'title' => $e->title,
                    'type' => $e->evidence_type,
                    'issuer' => $e->issuer,
                    'reference_no' => $e->reference_no,
                    'as_at' => optional($e->as_at_date)->toDateString(),
                    'expiry' => optional($e->expiry_date)->toDateString(),
                    'expiry_status' => $e->expiryStatus(),
                    'verification_url' => $e->verification_url,
                ])->values()->all(),
        ];
    }

    /** Published claims for a surface, keyed by claim key. */
    public static function forSurface(string $surface): array
    {
        return static::query()->published($surface)->with(['evidence', 'correction'])->get()
            ->map->toPublic()->values()->all();
    }
}
