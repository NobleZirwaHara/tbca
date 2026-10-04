<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class UtilisationDecision extends Model
{
    protected $table = 'prd_ret_utilisation_decisions';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'offered' => 'array',
            'effective_date' => 'date',
            'requested_allowance' => 'float',
        ];
    }
}
