<?php

namespace App\Models\DueDiligence;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Monitoring plan attached to a delivered case (DD-047 / DD-048). */
#[Unguarded]
class MonitoringSubscription extends Model
{
    protected $table = 'dd_monitoring_subscriptions';

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'next_renewal_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function caseFile(): BelongsTo
    {
        return $this->belongsTo(CaseFile::class, 'case_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(MonitoringAlert::class, 'subscription_id');
    }
}
