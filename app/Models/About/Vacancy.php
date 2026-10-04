<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Approved vacancy. A role catalogue does not prove a role is open (AB-TEB 12.2). */
#[Unguarded]
class Vacancy extends Model
{
    protected $table = 'abt_vacancies';

    protected function casts(): array
    {
        return [
            'posted_at' => 'date',
            'closes_at' => 'date',
            'responsibilities' => 'array',
            'requirements' => 'array',
            'offer' => 'array',
            'skills' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function scopeOpen(Builder $q): Builder
    {
        return $q->where('status', 'open')
            ->where(fn ($w) => $w->whereNull('closes_at')->orWhereDate('closes_at', '>=', now()->toDateString()));
    }

    public function isOpen(): bool
    {
        return $this->status === 'open' && (! $this->closes_at || $this->closes_at->gte(now()->startOfDay()));
    }

    public function summary(): array
    {
        return [
            'code' => $this->code,
            'slug' => $this->slug,
            'title' => $this->title,
            'department' => $this->department,
            'location' => $this->location,
            'employment_type' => $this->employment_type,
            'experience_level' => $this->experience_level,
            'travel' => $this->travel,
            'reports_to' => $this->reports_to,
            'icon' => $this->icon,
            'posted_at' => optional($this->posted_at)->toDateString(),
            'closes_at' => optional($this->closes_at)->toDateString(),
            'is_open' => $this->isOpen(),
        ];
    }
}
