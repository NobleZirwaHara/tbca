<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class MandateGate extends Model
{
    protected $table = 'adv_mandate_gates';

    protected function casts(): array
    {
        return [
            'checks' => 'array',
            'expires_at' => 'datetime',
            'decided_at' => 'datetime',
        ];
    }

    public function mandate(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Mandate::class);
    }
}
