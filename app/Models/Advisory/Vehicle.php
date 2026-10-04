<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Vehicle extends Model
{
    protected $table = 'adv_vehicles';

    protected function casts(): array
    {
        return [
            'fees' => 'array',
            'meta' => 'array',
            'start_date' => 'date',
            'next_due_date' => 'date',
            'last_activity' => 'date',
            'remediation_due' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function outstanding(): int
    {
        return max(0, $this->invoiced_zar - $this->paid_zar);
    }
}
