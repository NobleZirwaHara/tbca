<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class Consent extends Model
{
    protected $table = 'portal_consents';

    protected function casts(): array
    {
        return [
            'essential' => 'boolean',
            'given_at' => 'datetime',
            'withdrawn_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }
}
