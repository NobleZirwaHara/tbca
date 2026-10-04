<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class WhatsAppDelivery extends Model
{
    protected $table = 'ins_wa_deliveries';

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'engaged' => 'boolean',
            'converted' => 'boolean',
        ];
    }
}
