<?php

namespace App\Models\Shop;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;

#[Unguarded]
class AuditEvent extends Model
{
    protected $table = 'shop_audit_events';

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }
}
