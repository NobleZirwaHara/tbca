<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ResolverDomain extends Model
{
    protected $table = 'ctry_resolver_domains';

    protected function casts(): array
    {
        return [
            'missing' => 'array',
            'last_verified_at' => 'date',
        ];
    }

    public $timestamps = false;

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function rcs(): float
    {
        return $this->required_fields > 0 ? round($this->completed_fields / $this->required_fields * 100, 3) : 100.0;
    }
}
