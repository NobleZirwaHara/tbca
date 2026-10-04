<?php

namespace App\Models\Countries;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ChangeRequest extends Model
{
    protected $table = 'ctry_change_requests';

    protected function casts(): array
    {
        return [
            'assessment' => 'array',
            'desired_date' => 'date',
            'reresolution_required' => 'boolean',
        ];
    }

    public function engagement(): BelongsTo
    {
        return $this->belongsTo(Engagement::class);
    }
}
