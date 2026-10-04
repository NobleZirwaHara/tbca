<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Dispute extends Model
{
    protected $table = 'prd_ret_disputes';

    public function usage(): BelongsTo
    {
        return $this->belongsTo(Usage::class);
    }

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'proposed_units' => 'float',
            'attachments' => 'array',
            'decided_at' => 'datetime',
        ];
    }
}
