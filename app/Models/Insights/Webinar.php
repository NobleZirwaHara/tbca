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
            'details' => 'array',
            'featured' => 'boolean',
            'price_zar' => 'integer',
            'replay_published_at' => 'datetime',
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

    public function questions(): HasMany
    {
        return $this->hasMany(\App\Models\Webinars\Question::class);
    }

    public function chat(): HasMany
    {
        return $this->hasMany(\App\Models\Webinars\ChatMessage::class);
    }

    public function polls(): HasMany
    {
        return $this->hasMany(\App\Models\Webinars\Poll::class)->orderBy('sort');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(\App\Models\Webinars\Feedback::class);
    }

    public function records(): HasMany
    {
        return $this->hasMany(\App\Models\Webinars\ConsoleRecord::class)->orderBy('sort');
    }

    public function endsAt(): \Illuminate\Support\Carbon
    {
        return $this->starts_at->copy()->addMinutes($this->duration_minutes);
    }

    /**
     * Server-side event state (WB-COMP-01). An approved event whose slot has passed
     * without a recorded W2 close is reported as AWAITING W3: ENDED never equals PUBLISHED.
     */
    public function publicState(): string
    {
        $state = $this->state ?? 'approved';
        if (in_array($state, ['approved', 'awaiting_w1'], true) && $this->endsAt()->isPast()) {
            return 'awaiting_w3';
        }

        return $state;
    }

    public function registrationOpen(): bool
    {
        return in_array($this->publicState(), ['awaiting_w1', 'approved'], true);
    }

    public function replayAvailable(): bool
    {
        return in_array($this->publicState(), ['published', 'edited', 'corrected'], true);
    }

    public function detail(string $key, mixed $default = null): mixed
    {
        return data_get($this->details ?? [], $key, $default);
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
