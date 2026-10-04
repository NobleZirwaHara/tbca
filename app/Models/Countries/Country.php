<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Country extends Model
{
    protected $table = 'ctry_countries';

    protected function casts(): array
    {
        return [
            'metrics' => 'array',
            'last_reviewed_at' => 'date',
            'next_review_at' => 'date',
            'activation_date' => 'date',
            'profile_valid_to' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function domains(): HasMany
    {
        return $this->hasMany(ResolverDomain::class)->orderBy('sort');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class)->orderBy('sort');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(RegisterEntry::class);
    }

    public function transitions(): HasMany
    {
        return $this->hasMany(StateTransition::class)->latest('id');
    }

    public function interests(): HasMany
    {
        return $this->hasMany(Interest::class);
    }

    public function isActivated(): bool
    {
        return \App\Support\Countries\AvailabilityState::isActive($this->availability_state);
    }
}
