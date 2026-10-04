<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class StatusIncident extends Model
{
    protected $table = 'abt_status_incidents';

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'resolved_at' => 'datetime'];
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(StatusComponent::class, 'component_id');
    }
}
