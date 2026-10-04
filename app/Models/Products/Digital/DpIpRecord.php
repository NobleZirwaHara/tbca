<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class DpIpRecord extends Model
{
    protected $table = 'prd_dp_ip_records';

    protected function casts(): array
    {
        return [
            'licence_classes' => 'array',
            'instrument_date' => 'date',
            'licence_effective' => 'date',
            'last_review' => 'date',
            'next_review' => 'date',
            'listed' => 'boolean',
            'marketplace' => 'boolean',
        ];
    }
}
