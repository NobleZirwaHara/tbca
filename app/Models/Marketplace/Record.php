<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Record extends Model
{
    protected $table = 'mkt_records';

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

}
