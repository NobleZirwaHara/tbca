<?php

namespace App\Models\Products\Digital;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One controlled ProductVersion (semantic version + lifecycle state). */
#[Unguarded]
class DpVersion extends Model
{
    protected $table = 'prd_dp_versions';

    protected function casts(): array
    {
        return [
            'whats_new' => 'array',
            'impact' => 'array',
            'released_at' => 'date',
            'verified_at' => 'date',
            'maintenance_until' => 'date',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(DpProduct::class, 'product_id');
    }

    /** "1.3.0" -> "v1.3" */
    public function label(): string
    {
        return 'v'.preg_replace('/\.0$/', '', $this->version);
    }
}
