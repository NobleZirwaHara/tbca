<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class MandateLine extends Model
{
    protected $table = 'adv_mandate_lines';

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }

    public function mandate(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Mandate::class);
    }

    public function order(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\Order::class);
    }
}
