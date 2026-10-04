<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class FeeCode extends Model
{
    protected $table = 'aiim_fee_codes';

    protected function casts(): array
    {
        return [
            'components' => 'array',
            'amount_zar' => 'float',
            'rate' => 'float',
            'effective_from' => 'date',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }
}
