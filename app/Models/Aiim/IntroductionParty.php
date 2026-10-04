<?php

namespace App\Models\Aiim;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class IntroductionParty extends Model
{
    protected $table = 'aiim_introduction_parties';

    protected function casts(): array
    {
        return [
            'selected' => 'boolean',
            'responded_at' => 'datetime',
        ];
    }

    public function introduction(): BelongsTo
    {
        return $this->belongsTo(Introduction::class);
    }
}
