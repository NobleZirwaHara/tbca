<?php

namespace App\Models\Products\Retainers;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Alert extends Model
{
    protected $table = 'prd_ret_alerts';

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    protected function casts(): array
    {
        return [
            'utilisation_pct' => 'float',
            'notice_sent_at' => 'datetime',
            'last_activity' => 'date',
        ];
    }
}
