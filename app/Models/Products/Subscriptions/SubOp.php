<?php

namespace App\Models\Products\Subscriptions;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Admin operating record. `kind` selects the console it belongs to:
 * billing_run, delivery, dunning_case, disuse_case, deferred_line, churn,
 * capacity, recurrence_run, adjustment, action_plan.
 */
#[Unguarded]
class SubOp extends Model
{
    protected $table = 'prd_sub_ops';

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'due_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'subscription_id');
    }

    public function scopeKind($query, string $kind)
    {
        return $query->where('kind', $kind);
    }
}
