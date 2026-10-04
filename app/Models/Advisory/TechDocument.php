<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class TechDocument extends Model
{
    protected $table = 'adv_tech_documents';

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
        ];
    }
}
