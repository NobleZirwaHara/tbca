<?php

namespace App\Models\Marketplace;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Deliverable extends Model
{
    protected $table = 'mkt_deliverables';

    protected function casts(): array
    {
        return [
            'qa' => 'array',
            'meta' => 'array',
            'submitted_at' => 'datetime',
            'decided_at' => 'datetime',
        ];
    }

    public function engagement(): BelongsTo
    {
        return $this->belongsTo(Engagement::class);
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }
}
