<?php

namespace App\Models\Kp;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class KpAnswer extends Model
{
    protected $table = 'kp_answers';

    protected function casts(): array
    {
        return ['answer' => 'array', 'sources' => 'array', 'context' => 'array'];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }
}
