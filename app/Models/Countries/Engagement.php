<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Engagement extends Model
{
    protected $table = 'ctry_engagements';

    protected function casts(): array
    {
        return [
            'contact' => 'array',
            'letter' => 'array',
            'workspace' => 'array',
            'closure' => 'array',
            'desired_start' => 'date',
            'letter_accepted_at' => 'datetime',
            'activated_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function changeRequests(): HasMany
    {
        return $this->hasMany(ChangeRequest::class)->latest('id');
    }
}
