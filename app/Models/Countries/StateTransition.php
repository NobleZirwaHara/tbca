<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class StateTransition extends Model
{
    protected $table = 'ctry_state_transitions';

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'actor_id');
    }
}
