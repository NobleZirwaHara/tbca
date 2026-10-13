<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row in the integration event ledger.
 *
 * Outbound rows are the outbox: a domain hook records them and
 * `php artisan zoho:sync` sends them. Inbound rows are verified webhook
 * deliveries, unique per source and event id so a replay does nothing.
 *
 * Status: held (recorded while the integration is off), pending, sent
 * (handed to Zoho Flow, awaiting confirmation), failed, complete.
 */
#[Unguarded]
class IntegrationEvent extends Model
{
    public const STATUSES = ['held', 'pending', 'sent', 'failed', 'complete'];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'result' => 'array',
            'available_at' => 'datetime',
            'sent_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'event_id';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Outbound events due for an attempt: pending ones, and failed ones whose
     * backoff has passed. A failed event with no available_at is parked for a
     * person (validation error or attempts used up) and is not retried automatically.
     */
    public function scopeDue(Builder $query): Builder
    {
        return $query->where('direction', 'outbound')->where(fn ($q) => $q
            ->where(fn ($p) => $p->where('status', 'pending')->where(fn ($t) => $t->whereNull('available_at')->orWhere('available_at', '<=', now())))
            ->orWhere(fn ($f) => $f->where('status', 'failed')->whereNotNull('available_at')->where('available_at', '<=', now())));
    }

    /** Result data saved by an earlier attempt for one step, so a retry resumes instead of repeating it. */
    public function step(string $name): mixed
    {
        return $this->result['steps'][$name] ?? null;
    }

    public function rememberStep(string $name, mixed $value): void
    {
        $result = $this->result ?? [];
        $result['steps'][$name] = $value;
        $this->forceFill(['result' => $result])->save();
    }
}
