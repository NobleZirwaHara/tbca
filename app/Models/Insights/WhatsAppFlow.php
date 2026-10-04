<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class WhatsAppFlow extends Model
{
    protected $table = 'ins_wa_flows';
}
