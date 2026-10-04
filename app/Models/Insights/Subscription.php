<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Subscription extends Model
{
    protected $table = 'ins_subscriptions';

    protected function casts(): array
    {
        return [
            'started_at' => 'date',
            'next_billing_at' => 'date',
            'usage' => 'array',
        ];
    }
}
