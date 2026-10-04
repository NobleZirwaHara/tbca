<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Commitment extends Model
{
    protected $table = 'prd_ret_commitments';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'committed_on' => 'date',
            'starts_on' => 'date',
            'ends_on' => 'date',
            'hours' => 'float',
        ];
    }
}
