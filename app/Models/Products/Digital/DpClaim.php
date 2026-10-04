<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class DpClaim extends Model
{
    protected $table = 'prd_dp_claims';

    protected function casts(): array
    {
        return [
            'review_due' => 'date',
            'has_evidence' => 'boolean',
        ];
    }
}
