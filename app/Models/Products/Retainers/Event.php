<?php

namespace App\Models\Products\Retainers;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Event extends Model
{
    protected $table = 'prd_ret_events';

    public const UPDATED_AT = null;

    public function retainer(): BelongsTo
    {
        return $this->belongsTo(Retainer::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
