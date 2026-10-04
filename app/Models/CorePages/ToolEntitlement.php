<?php

namespace App\Models\CorePages;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Download right for a purchased digital tool. Created only once its order is paid.
 * The secure link (token) expires 7 days after issue; signed-in owners can re-issue it from My Downloads.
 */
#[Unguarded]
class ToolEntitlement extends Model
{
    protected $table = 'core_tool_entitlements';

    protected function casts(): array
    {
        return [
            'last_downloaded_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'token';
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
