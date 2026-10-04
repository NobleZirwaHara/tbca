<?php

namespace App\Models\DueDiligence;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class MonitoringAlert extends Model
{
    protected $table = 'dd_monitoring_alerts';

    protected function casts(): array
    {
        return [
            'detected_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(MonitoringSubscription::class, 'subscription_id');
    }
}
