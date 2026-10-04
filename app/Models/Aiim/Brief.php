<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Brief extends Model
{
    protected $table = 'aiim_briefs';

    protected function casts(): array
    {
        return [
            'profile' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'sku';
    }
}
