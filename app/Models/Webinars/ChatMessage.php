<?php

namespace App\Models\Webinars;

use App\Models\Insights\Webinar;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class ChatMessage extends Model
{
    protected $table = 'wb_chat_messages';

    protected function casts(): array
    {
        return ['is_host' => 'boolean', 'posted_at' => 'datetime'];
    }

    public function webinar(): BelongsTo
    {
        return $this->belongsTo(Webinar::class);
    }
}
