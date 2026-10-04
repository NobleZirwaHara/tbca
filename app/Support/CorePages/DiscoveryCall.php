<?php

namespace App\Support\CorePages;

use App\Models\Booking;
use Illuminate\Support\Carbon;

/**
 * Book a Discovery Call: discussion purposes, relationship managers, bookable slots and portal rules.
 */
class DiscoveryCall
{
    /** Bookable start times (SAST, the platform timezone). */
    public const SLOTS = ['morning' => ['09:00', '10:00', '11:00'], 'afternoon' => ['13:00', '14:00', '15:00']];

    /** Reschedule / cancel allowed until this many hours before the meeting (portal rule). */
    public const CHANGE_CUTOFF_HOURS = 24;

    public static function purposes(): array
    {
        return [
            ['key' => 'active-sprint', 'title' => 'Discuss an Active Sprint', 'icon' => 'settings', 'body' => 'Review progress, decisions, risks or next actions for an existing Sprint.'],
            ['key' => 'growth-strategy', 'title' => 'Business Growth and Strategy', 'icon' => 'trending-up', 'body' => 'Discuss growth priorities, operating challenges or strategic direction.'],
            ['key' => 'funding', 'title' => 'Funding and Investor Readiness', 'icon' => 'coins', 'body' => 'Discuss capital raising, financial models, investment materials or funding preparation.'],
            ['key' => 'ai-technology', 'title' => 'AI, Automation and Technology', 'icon' => 'bot', 'body' => 'Discuss workflow automation, Zoho One, AI agents, integrations or digital transformation.'],
            ['key' => 'due-diligence', 'title' => 'Due Diligence or Project Advisory', 'icon' => 'shield-check', 'body' => 'Discuss an active Due Diligence case, investment opportunity or project-development mandate.'],
            ['key' => 'general', 'title' => 'General Advisory Enquiry', 'icon' => 'lightbulb', 'body' => 'Discuss another business requirement with the TBCA team.'],
        ];
    }

    public static function purposeTitle(?string $key): string
    {
        return collect(self::purposes())->firstWhere('key', $key)['title'] ?? 'General Advisory Enquiry';
    }

    public static function engagements(): array
    {
        return [
            'Business Plan Development Sprint',
            'Market Research & Feasibility Sprint',
            'Financial Model & Valuation Sprint',
            'AI Automation & Digital Transformation Sprint',
            'Due Diligence Process',
            'Not linked to an engagement',
        ];
    }

    public static function timezones(): array
    {
        return [
            ['key' => 'SAST', 'label' => 'South Africa Standard Time (SAST)', 'offset' => 0],
            ['key' => 'WAT', 'label' => 'West Africa Time (WAT)', 'offset' => -1],
            ['key' => 'CAT', 'label' => 'Central Africa Time (CAT)', 'offset' => 0],
            ['key' => 'EAT', 'label' => 'East Africa Time (EAT)', 'offset' => 1],
            ['key' => 'GMT', 'label' => 'Greenwich Mean Time (GMT)', 'offset' => -2],
        ];
    }

    public static function timezoneLabel(?string $key): string
    {
        return collect(self::timezones())->firstWhere('key', $key)['label'] ?? 'South Africa Standard Time (SAST)';
    }

    /** Relationship managers keyed by short name. */
    public static function managers(): array
    {
        return [
            'nneka' => ['name' => 'Nneka Okafor', 'title' => 'Senior Partner', 'email' => 'nneka.okafor@tbca.africa', 'phone' => '+234 809 123 4567', 'initials' => 'NO'],
            'david' => ['name' => 'David M.', 'title' => 'Research Lead', 'email' => 'david.m@tbca.africa', 'phone' => '+27 12 001 0567', 'initials' => 'DM'],
            'tosin' => ['name' => 'Tosin A.', 'title' => 'Strategy Director', 'email' => 'tosin.a@tbca.africa', 'phone' => '+234 809 555 0101', 'initials' => 'TA'],
            'michael' => ['name' => 'Michael K.', 'title' => 'Tech Lead', 'email' => 'michael.k@tbca.africa', 'phone' => '+27 12 001 0590', 'initials' => 'MK'],
        ];
    }

    public static function defaultManager(): array
    {
        return self::managers()['nneka'];
    }

    public static function meetingLink(Booking $booking): ?string
    {
        if ($booking->channel !== 'video' || $booking->status === 'cancelled') {
            return null;
        }

        return 'https://meet.thebusinessclinic.africa/room/'.str_replace('TBCA-', '', $booking->reference);
    }

    public static function canChange(Booking $booking): bool
    {
        return in_array($booking->status, ['confirmed', 'rescheduled', 'pending', 'upcoming'], true)
            && $booking->starts_at->gt(now()->addHours(self::CHANGE_CUTOFF_HOURS));
    }

    /** Available weekday dates over the next N weeks, for the calendar. */
    public static function isBookableDate(Carbon $date): bool
    {
        return ! $date->isWeekend() && $date->gte(today()->addDay()) && $date->lte(today()->addDays(60));
    }

    public static function present(Booking $b): array
    {
        $meta = $b->meta ?? [];
        $manager = self::managers()[$meta['manager'] ?? 'nneka'] ?? self::defaultManager();

        return [
            'reference' => $b->reference,
            'type' => $b->type,
            'title' => $meta['title'] ?? ($b->type === 'discovery-call' ? 'Discovery Call' : ucwords(str_replace('-', ' ', $b->type))),
            'subtitle' => $meta['subtitle'] ?? self::purposeTitle($meta['purpose'] ?? null),
            'purpose' => self::purposeTitle($meta['purpose'] ?? null),
            'topic' => $b->topic,
            'engagement' => $meta['engagement'] ?? 'Not linked to an engagement',
            'notes' => $meta['notes'] ?? null,
            'files' => $meta['files'] ?? [],
            'manager' => $manager,
            'date' => $b->starts_at->format('Y-m-d'),
            'date_label' => $b->starts_at->format('d M Y'),
            'weekday' => $b->starts_at->format('l'),
            'time' => $b->starts_at->format('H:i'),
            'timezone' => self::timezoneLabel($meta['timezone'] ?? 'SAST'),
            'channel' => $b->channel,
            'format' => $b->channel === 'phone' ? 'Phone Call' : 'Online Video Call',
            'status' => $b->status,
            'outcome' => $meta['outcome'] ?? null,
            'summary' => $meta['summary'] ?? null,
            'is_past' => $b->starts_at->isPast() || $b->status === 'completed',
            'can_change' => self::canChange($b),
            'meeting_link' => self::meetingLink($b),
            'name' => $b->name,
            'email' => $b->email,
            'phone' => $b->phone,
            'company' => $b->company,
            'contact_method' => $meta['contact_method'] ?? 'Email',
            'is_new' => $b->created_at?->gt(now()->subDay()) ?? false,
        ];
    }
}
