<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class DpIncident extends Model
{
    protected $table = 'prd_dp_incidents';

    protected function casts(): array
    {
        return [
            'detected_on' => 'date',
            'containment_started_at' => 'datetime',
        ];
    }
}
