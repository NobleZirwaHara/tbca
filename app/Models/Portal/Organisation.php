<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Organisation extends Model
{
    protected $table = 'portal_organisations';

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'verified' => 'boolean',
            'incorporated_on' => 'date',
        ];
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }
}
