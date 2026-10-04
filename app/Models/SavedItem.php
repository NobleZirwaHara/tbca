<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class SavedItem extends Model
{
    protected function casts(): array
    {
        return ['meta' => 'array'];
    }
}
