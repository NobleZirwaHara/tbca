<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Controlled Content Record (Resources blueprint 15.4).
 *
 * Editorial workflow (publish_state):
 *   draft -> internal_review -> legal_review -> published -> archived | retired
 * Currentness (decay state machine, blueprint 6.6) is derived:
 *   CURRENT, REVIEW_DUE (<=30 days to review), OVERDUE (past review),
 *   RESTRICTED (flagged), RETIRED (terminal).
 */
#[Unguarded]
class Resource extends Model
{
    protected $table = 'ins_resources';

    public const WORKFLOW = ['draft', 'internal_review', 'legal_review', 'published', 'archived', 'retired'];

    /** Allowed editorial transitions. */
    public const TRANSITIONS = [
        'draft' => ['internal_review'],
        'internal_review' => ['legal_review', 'draft'],
        'legal_review' => ['published', 'draft'],
        'published' => ['archived', 'retired', 'draft'],
        'archived' => ['published', 'draft'],
        'retired' => [],
    ];

    /** Maximum scheduled review interval per content risk class (blueprint 6.1). */
    public const REVIEW_DAYS = ['RS-C1' => 365, 'RS-C2' => 90, 'RS-C3' => 30];

    public const ACCESS_LABELS = [
        'free' => 'R0 Free',
        'gated' => 'R0 Gated',
        'paid' => 'Paid Access',
        'subscription' => 'Subscription',
        'restricted' => 'Restricted',
    ];

    public const CATEGORIES = [
        'strategy-planning' => 'Strategy & Planning',
        'finance-funding' => 'Finance & Funding',
        'operations-process' => 'Operations & Process',
        'project-management' => 'Project Management',
        'risk-compliance' => 'Risk & Compliance',
        'marketing-sales' => 'Marketing & Sales',
        'people-leadership' => 'People & Leadership',
        'learning-development' => 'Learning & Development',
        'due-diligence' => 'Due Diligence',
        'market-intelligence' => 'Market Intelligence',
    ];

    public const GUIDE_TYPES = ['guide', 'report', 'article'];

    public const TOOL_TYPES = ['template', 'checklist', 'calculator', 'dashboard', 'scorecard', 'sop-pack', 'register', 'playbook', 'toolkit'];

    protected function casts(): array
    {
        return [
            'industries' => 'array',
            'countries' => 'array',
            'body' => 'array',
            'metrics' => 'array',
            'meta' => 'array',
            'reviewed_at' => 'date',
            'next_review_at' => 'date',
            'retired_at' => 'date',
            'published_at' => 'datetime',
            'restricted' => 'boolean',
            'ai_assisted' => 'boolean',
            'protected' => 'boolean',
            'featured' => 'boolean',
            'editors_pick' => 'boolean',
            'popular' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function assets(): HasMany
    {
        return $this->hasMany(ResourceAsset::class);
    }

    public function replacement(): BelongsTo
    {
        return $this->belongsTo(self::class, 'replacement_id');
    }

    /** Publicly visible records: published, or retired (shown as a retired notice). */
    public function scopeVisible(Builder $q): Builder
    {
        return $q->whereIn('publish_state', ['published', 'retired']);
    }

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('publish_state', 'published');
    }

    public function currentness(?Carbon $today = null): string
    {
        $today ??= Carbon::today();

        if ($this->publish_state === 'retired') {
            return 'retired';
        }
        if ($this->restricted || $this->access === 'restricted') {
            return 'restricted';
        }
        if ($this->next_review_at === null) {
            return 'current';
        }
        if ($this->next_review_at->lt($today)) {
            return 'overdue';
        }

        return $this->next_review_at->lte($today->copy()->addDays(30)) ? 'review_due' : 'current';
    }

    /** OVERDUE, RESTRICTED and RETIRED block new entitlements/downloads (blueprint 6.6). */
    public function blocksDelivery(): bool
    {
        return in_array($this->currentness(), ['overdue', 'restricted', 'retired'], true);
    }

    public function accessLabel(): string
    {
        if ($this->access === 'paid' && $this->list_price_zar && $this->price_zar < $this->list_price_zar) {
            return 'Reduced';
        }

        return self::ACCESS_LABELS[$this->access] ?? $this->access;
    }

    public function categoryLabel(): string
    {
        return self::CATEGORIES[$this->category] ?? $this->category;
    }

    public function reviewDays(): int
    {
        return self::REVIEW_DAYS[$this->risk_class] ?? 365;
    }

    public function url(): string
    {
        return match ($this->collection) {
            'case-studies' => "/resources/case-studies/{$this->slug}",
            default => "/resources/{$this->slug}",
        };
    }

    /** Card shape for catalogues. */
    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'url' => $this->url(),
            'title' => $this->title,
            'type' => $this->type,
            'collection' => $this->collection,
            'category' => $this->category,
            'categoryLabel' => $this->categoryLabel(),
            'summary' => $this->summary,
            'format' => $this->format,
            'minutes' => $this->minutes,
            'pages' => $this->pages,
            'fileSize' => $this->file_size,
            'access' => $this->access,
            'accessLabel' => $this->accessLabel(),
            'priceZar' => $this->price_zar,
            'listPriceZar' => $this->list_price_zar,
            'source' => $this->source,
            'sourceBasis' => $this->source_basis,
            'sourceCount' => $this->source_count,
            'reviewedAt' => $this->reviewed_at?->format('d M Y'),
            'nextReviewAt' => $this->next_review_at?->format('d M Y'),
            'currentness' => $this->currentness(),
            'downloads' => $this->download_count,
            'aiAssisted' => $this->ai_assisted,
            'humanReview' => $this->human_review,
            'featured' => $this->featured,
            'industries' => $this->industries ?? [],
        ];
    }
}
