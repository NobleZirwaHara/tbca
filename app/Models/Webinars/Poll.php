<?php

namespace App\Models\Webinars;

use App\Models\Insights\Webinar;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Poll extends Model
{
    protected $table = 'wb_polls';

    protected function casts(): array
    {
        return ['options' => 'array'];
    }

    public function webinar(): BelongsTo
    {
        return $this->belongsTo(Webinar::class);
    }
}
