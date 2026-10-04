<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/** Newsroom release / announcement. Embargoed and draft items never reach public queries (AB-TEB 12.3). */
#[Unguarded]
class NewsItem extends Model
{
    protected $table = 'abt_news';

    public const CATEGORIES = [
        'press_release' => 'Press Release',
        'announcement' => 'Announcement',
        'event' => 'Event',
        'thought_leadership' => 'Thought Leadership',
        'insight' => 'Insight',
        'partnership' => 'Partnership',
    ];

    protected function casts(): array
    {
        return ['body' => 'array', 'published_at' => 'datetime', 'featured' => 'boolean'];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function scopePublic(Builder $q): Builder
    {
        return $q->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function card(): array
    {
        return [
            'slug' => $this->slug,
            'kind' => $this->kind,
            'category' => $this->category,
            'category_label' => self::CATEGORIES[$this->category] ?? $this->category,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'icon' => $this->icon,
            'published_at' => optional($this->published_at)->toDateString(),
        ];
    }
}
