<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Source extends Model
{
    protected $table = 'aiim_sources';

    protected function casts(): array
    {
        return [
            'profile' => 'array',
            'last_updated' => 'date',
            'next_review' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }
}
