<?php

namespace App\Models\Insights;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Unguarded]
class Webinar extends Model
{
    protected $table = 'ins_webinars';

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'review_due' => 'date',
            'cpd' => 'boolean',
            'gains' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(WebinarRegistration::class);
    }

    public function isUpcoming(): bool
    {
        return $this->starts_at->isFuture();
    }

    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'tagline' => $this->tagline,
            'summary' => $this->summary,
            'speaker' => $this->speaker,
            'speakerRole' => $this->speaker_role,
            'topic' => $this->topic,
            'audience' => $this->audience,
            'date' => $this->starts_at->format('d M Y'),
            'weekday' => $this->starts_at->format('l'),
            'time' => $this->starts_at->format('H:i').' SAST',
            'durationMinutes' => $this->duration_minutes,
            'upcoming' => $this->isUpcoming(),
            'cpd' => $this->cpd,
            'icon' => $this->icon,
            'gains' => $this->gains ?? [],
            'replayVersion' => $this->replay_version,
            'reviewDue' => $this->review_due?->format('d M Y'),
        ];
    }
}
