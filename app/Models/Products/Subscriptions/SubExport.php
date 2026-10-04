<?php

namespace App\Models\Products\Subscriptions;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class SubExport extends Model
{
    protected $table = 'prd_sub_exports';

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
