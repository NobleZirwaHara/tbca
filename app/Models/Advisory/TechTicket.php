<?php

namespace App\Models\Advisory;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class TechTicket extends Model
{
    protected $table = 'adv_tech_tickets';
}
