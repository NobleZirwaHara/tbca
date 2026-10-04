<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class StatusComponent extends Model
{
    protected $table = 'abt_status_components';

    public const STATUSES = ['operational', 'degraded', 'partial_outage', 'major_outage'];

    protected function casts(): array
    {
        return ['history' => 'array', 'uptime_30d' => 'float'];
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(StatusIncident::class, 'component_id');
    }
}
