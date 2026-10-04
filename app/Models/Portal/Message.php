<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Unguarded]
class Message extends Model
{
    protected $table = 'portal_messages';

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'is_mine' => 'boolean',
        ];
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class);
    }
}
