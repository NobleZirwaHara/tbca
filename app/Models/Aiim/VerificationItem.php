<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class VerificationItem extends Model
{
    protected $table = 'aiim_verification_items';

    protected function casts(): array
    {
        return [
            'selected' => 'boolean',
            'cost_approved' => 'boolean',
            'supplier_cost_zar' => 'float',
            'expert_fee_zar' => 'float',
            'actual_cost_zar' => 'float',
            'started_on' => 'date',
            'eta_on' => 'date',
        ];
    }

    public function engagement(): BelongsTo
    {
        return $this->belongsTo(Engagement::class);
    }
}
