<?php

namespace App\Models\CorePages;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A Find the Right Service journey: answers per stage, generated recommendations and
 * an optional human assistance request.
 * Status: in_progress -> recommended -> assistance_requested.
 */
#[Unguarded]
class ServiceFinderRequest extends Model
{
    protected $table = 'core_service_finder_requests';

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'recommendations' => 'array',
            'assistance' => 'array',
            'assistance_requested_at' => 'datetime',
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
