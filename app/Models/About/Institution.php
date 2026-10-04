<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Institutional mark permission + relationship meaning (AB-TEB Part 6).
 * A mark renders only with a confirmed, unexpired permission AND a resolved
 * relationship description; revocation suppresses it automatically.
 */
#[Unguarded]
class Institution extends Model
{
    protected $table = 'abt_institutions';

    protected function casts(): array
    {
        return ['surfaces' => 'array', 'permission_expires_at' => 'date'];
    }

    public function scopeDisplayable(Builder $q, ?string $surface = null): Builder
    {
        return $q->whereIn('permission_state', ['confirmed', 'review_due'])
            ->where(fn ($w) => $w->whereNull('permission_expires_at')->orWhereDate('permission_expires_at', '>=', now()->toDateString()))
            ->whereNotNull('relationship_description')
            ->when($surface, fn ($w) => $w->whereJsonContains('surfaces', $surface))
            ->orderBy('sort');
    }

    public function toPublic(): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->name,
            'acronym' => $this->acronym,
            'ledger' => $this->ledger,
            'description' => $this->relationship_description,
            'detail' => $this->relationship_detail,
            'color' => $this->color,
            'review_due' => $this->permission_state === 'review_due',
        ];
    }
}
