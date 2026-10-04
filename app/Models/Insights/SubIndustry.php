<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class SubIndustry extends Model
{
    protected $table = 'ins_sub_industries';

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }
}
