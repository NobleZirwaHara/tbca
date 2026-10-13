<?php

namespace App\Models\Webinars;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class PollVote extends Model
{
    protected $table = 'wb_poll_votes';

    public function poll(): BelongsTo
    {
        return $this->belongsTo(Poll::class);
    }
}
