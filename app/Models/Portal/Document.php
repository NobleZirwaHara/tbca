<?php

namespace App\Models\Portal;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Document extends Model
{
    protected $table = 'portal_documents';

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'meta' => 'array',
            'is_folder' => 'boolean',
            'legal_hold' => 'boolean',
            'starred' => 'boolean',
            'last_accessed_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(Document::class, 'parent_id');
    }
}
