<?php

namespace App\Models\Products\Subscriptions;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Event envelope (Blueprint 16.5): every state, money and entitlement change is recorded. */
#[Unguarded]
class SubEvent extends Model
{
    protected $table = 'prd_sub_events';

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'money_effect' => 'boolean',
            'entitlement_effect' => 'boolean',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }

    public static function log(string $type, ?Subscription $sub = null, array $attrs = []): self
    {
        return self::create([
            'subscription_id' => $sub?->id,
            'plan_id' => $attrs['plan_id'] ?? $sub?->plan_id,
            'user_id' => $attrs['user_id'] ?? auth()->id(),
            'actor_role' => $attrs['actor_role'] ?? (auth()->user()?->role === 'admin' ? 'admin' : (auth()->check() ? 'client' : 'system')),
            'event_type' => $type,
            'previous_state' => $attrs['previous_state'] ?? null,
            'new_state' => $attrs['new_state'] ?? null,
            'money_effect' => $attrs['money_effect'] ?? false,
            'entitlement_effect' => $attrs['entitlement_effect'] ?? false,
            'idempotency_key' => $attrs['idempotency_key'] ?? null,
            'payload' => $attrs['payload'] ?? null,
        ]);
    }
}
