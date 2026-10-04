<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Proposal extends Model
{
    protected $table = 'adv_proposals';

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }
}
