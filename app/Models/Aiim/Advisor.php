<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Advisor extends Model
{
    protected $table = 'aiim_advisors';

    protected function casts(): array
    {
        return [
            'strengths' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
