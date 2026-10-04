<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ScopeChange extends Model
{
    protected $table = 'prd_ret_scope_changes';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'effective_from' => 'date',
            'impact_hours' => 'float',
        ];
    }
}
