<?php

namespace App\Models\Webinars;

use App\Models\Insights\Webinar;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Question extends Model
{
    protected $table = 'wb_questions';

    protected function casts(): array
    {
        return ['anonymous' => 'boolean', 'priority' => 'boolean', 'pinned' => 'boolean', 'asked_at' => 'datetime'];
    }

    public function webinar(): BelongsTo
    {
        return $this->belongsTo(Webinar::class);
    }
}
