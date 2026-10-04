<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class DpReclassItem extends Model
{
    protected $table = 'prd_dp_reclass_items';

    protected function casts(): array
    {
        return [
            'target_release' => 'date',
        ];
    }
}
