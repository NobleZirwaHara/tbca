<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class TechGate extends Model
{
    protected $table = 'adv_tech_gates';

    protected function casts(): array
    {
        return [
            'x_funded' => 'boolean',
            'decided_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function engagement(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(TechEngagement::class, 'engagement_id');
    }

    public function order(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Order::class);
    }
}
