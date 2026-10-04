<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Thread extends Model
{
    protected $table = 'portal_threads';

    protected function casts(): array
    {
        return [
            'participants' => 'array',
            'pinned' => 'boolean',
            'last_activity_at' => 'datetime',
        ];
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
