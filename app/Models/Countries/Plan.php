<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Plan extends Model
{
    protected $table = 'ctry_plans';

    protected function casts(): array
    {
        return [
            'target_date' => 'date',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(PlanItem::class)->orderBy('sort');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
