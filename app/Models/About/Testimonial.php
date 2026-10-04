<?php

namespace App\Models\About;

use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Consent-governed testimonial (AB-TEB Part 7). Public display requires a
 * published record, active consent that has not lapsed or been revoked, and the
 * channel being covered by that consent (AB-CLAIM-BLD-006 / -010).
 */
#[Unguarded]
class Testimonial extends Model
{
    protected $table = 'abt_testimonials';

    public const TYPICALITY = 'This is one approved client experience. It is not presented as a guaranteed or typical result.';

    public const STATUSES = ['draft', 'pending_review', 'published', 'declined'];

    public const CHANNELS = ['website', 'linkedin', 'proposals', 'presentations'];

    protected function casts(): array
    {
        return [
            'channels' => 'array',
            'consent_date' => 'date',
            'consent_expires_at' => 'date',
            'consent_revoked_at' => 'datetime',
            'image_permission' => 'boolean',
            'featured' => 'boolean',
        ];
    }

    public function scopeDisplayable(Builder $q, string $channel = 'website'): Builder
    {
        return $q->where('status', 'published')
            ->where('consent_status', 'active')
            ->whereNotNull('consent_date')
            ->whereNull('consent_revoked_at')
            ->where(fn ($w) => $w->whereNull('consent_expires_at')->orWhereDate('consent_expires_at', '>=', now()->toDateString()))
            ->whereJsonContains('channels', $channel);
    }

    /** active | pending | revoked | declined | expired */
    public function consentState(): string
    {
        if ($this->consent_status === 'active' && $this->consent_expires_at && $this->consent_expires_at->lt(now()->startOfDay())) {
            return 'expired';
        }

        return $this->consent_status;
    }

    public function toPublic(): array
    {
        return [
            'code' => $this->code,
            'quote' => $this->quote,
            'name' => $this->person_name ?: ($this->attribution ?: 'Approved Client'),
            'role' => $this->person_role,
            'company' => $this->company,
            'industry' => $this->industry,
            'rating' => $this->rating,
            'ledger' => $this->ledger,
            'image' => $this->image_permission,
            'typicality' => self::TYPICALITY,
        ];
    }
}
