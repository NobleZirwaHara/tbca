<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class OpportunityTemplate extends Model
{
    protected $table = 'aiim_opportunity_templates';

    protected function casts(): array
    {
        return ['meta' => 'array', 'latitude' => 'float', 'longitude' => 'float', 'score' => 'integer'];
    }
}
