<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Observation extends Model
{
    protected $table = 'ctry_observations';

    protected function casts(): array
    {
        return [
            'captured_at' => 'datetime',
            'quality_score' => 'float',
            'anonymity_score' => 'float',
            'rights_pass' => 'boolean',
            'provenance_complete' => 'boolean',
        ];
    }

}
