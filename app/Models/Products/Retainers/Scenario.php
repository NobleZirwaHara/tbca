<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Scenario extends Model
{
    protected $table = 'prd_ret_scenarios';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'allowance_qty' => 'float',
            'starts_on' => 'date',
            'detail' => 'array',
        ];
    }
}
