<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Interest extends Model
{
    protected $table = 'ctry_interests';

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
