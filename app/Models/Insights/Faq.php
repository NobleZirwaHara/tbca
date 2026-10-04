<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Faq extends Model
{
    protected $table = 'ins_faqs';

    protected function casts(): array
    {
        return [
            'geo' => 'boolean',
            'steps' => 'array',
            'related' => 'array',
        ];
    }
}
