<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

/**
 * Sprint catalogue entry. Type-specific detail lives in the attributes column.
 */
#[Unguarded]
class Sprint extends Model
{
    protected function casts(): array
    {
        return [
            'packages' => 'array',
            'attributes' => 'array',
            'featured' => 'boolean',
            'popular' => 'boolean',
            'is_new' => 'boolean',
            'rating' => 'float',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
