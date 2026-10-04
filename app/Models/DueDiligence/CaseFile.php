<?php

namespace App\Models\DueDiligence;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A paid Due Diligence case (DD-031 onwards). Status follows
 * App\Support\DueDiligence\CaseStateMachine. Named CaseFile because "case"
 * is a reserved word in PHP.
 */
#[Unguarded]
class CaseFile extends Model
{
    protected $table = 'dd_cases';

    protected function casts(): array
    {
        return [
            'requirements' => 'array',
            'subject' => 'array',
            'partner' => 'array',
            'fee_lines' => 'array',
            'closure_approvals' => 'array',
            'review_mandatory' => 'boolean',
            'partner_review' => 'boolean',
            'legal_hold' => 'boolean',
            'is_sample' => 'boolean',
            'review_started_at' => 'datetime',
            'review_due_at' => 'datetime',
            'sla_due_at' => 'datetime',
            'limitations_acknowledged_at' => 'datetime',
            'closed_at' => 'datetime',
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

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(CaseEvent::class, 'case_id');
    }

    public function consents(): HasMany
    {
        return $this->hasMany(Consent::class, 'case_id');
    }

    public function consentRequests(): HasMany
    {
        return $this->hasMany(ConsentRequest::class, 'case_id');
    }

    public function evidence(): HasMany
    {
        return $this->hasMany(EvidenceItem::class, 'case_id')->orderBy('sort');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'case_id');
    }

    public function checks(): HasMany
    {
        return $this->hasMany(Check::class, 'case_id')->orderBy('sort');
    }

    public function findings(): HasMany
    {
        return $this->hasMany(Finding::class, 'case_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(InfoRequest::class, 'case_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ReviewTask::class, 'case_id')->orderBy('sort');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'case_id');
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'case_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(MonitoringSubscription::class, 'case_id');
    }

    public function currentReport(): ?Report
    {
        return $this->reports()->where('status', '!=', 'superseded')->latest('id')->first();
    }

    public function finalReport(): ?Report
    {
        return $this->reports()->where('status', 'final')->latest('id')->first();
    }
}
