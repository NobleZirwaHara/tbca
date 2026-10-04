<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Supplier extends Model
{
    protected $table = 'adv_suppliers';

    protected function casts(): array
    {
        return [
            'contract_end' => 'date',
            'rating' => 'float',
        ];
    }
}
