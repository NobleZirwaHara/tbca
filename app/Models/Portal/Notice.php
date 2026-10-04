<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Notice extends Model
{
    protected $table = 'portal_notices';

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }
}
