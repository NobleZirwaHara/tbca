<?php

namespace App\Models\DueDiligence;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Enterprise bulk screening request (DD-023). */
#[Unguarded]
class EnterpriseRequest extends Model
{
    protected $table = 'dd_enterprise_requests';

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'fee_view' => 'array',
            'submitted_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
