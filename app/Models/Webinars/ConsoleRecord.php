<?php

namespace App\Models\Webinars;

use App\Models\Insights\Webinar;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ConsoleRecord extends Model
{
    protected $table = 'wb_records';

    protected function casts(): array
    {
        return ['data' => 'array'];
    }

    public function webinar(): BelongsTo
    {
        return $this->belongsTo(Webinar::class);
    }
}
