<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class PrivacyRequest extends Model
{
    protected $table = 'ins_privacy_requests';

    protected function casts(): array
    {
        return [
            'purposes' => 'array',
            'disposition' => 'array',
        ];
    }
}
