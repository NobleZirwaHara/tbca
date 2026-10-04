<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Registration extends Model
{
    protected $table = 'portal_registrations';
}
