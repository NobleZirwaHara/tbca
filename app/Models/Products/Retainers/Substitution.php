<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Substitution extends Model
{
    protected $table = 'prd_ret_substitutions';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'current_adviser' => 'array',
            'proposed_adviser' => 'array',
            'effective_from' => 'date',
            'notice_sent_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }
}
