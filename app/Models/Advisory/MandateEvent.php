<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class MandateEvent extends Model
{
    protected $table = 'adv_mandate_events';
}
