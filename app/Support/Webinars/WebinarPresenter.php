<?php

namespace App\Support\Webinars;

use App\Models\Insights\Webinar;
use App\Models\Insights\WebinarRegistration;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Shapes webinar records for the public pages and staff consoles.
 */
class WebinarPresenter
{
    public static function categoryLabel(?string $key): string
    {
        return collect(WebinarRegister::categories())->firstWhere('key', $key)['label'] ?? Str::headline((string) $key);
    }

    /** Compact card used on the dashboard, replay library and right rails. */
    public static function card(Webinar $w): array
    {
        $state = $w->publicState();
        [$label, $tone] = WebinarRegister::states()[$state] ?? [Str::headline($state), 'neutral'];

        return [
            'id' => $w->id,
            'slug' => $w->slug,
            'title' => $w->title,
            'tagline' => $w->tagline,
            'summary' => $w->summary,
            'speaker' => $w->speaker,
            'speakerRole' => $w->speaker_role,
            'category' => $w->category,
            'categoryLabel' => self::categoryLabel($w->category),
            'topic' => $w->topic,
            'icon' => $w->icon,
            'startsAt' => $w->starts_at->toIso8601String(),
            'endsAt' => $w->endsAt()->toIso8601String(),
            'day' => $w->starts_at->format('d'),
            'month' => strtoupper($w->starts_at->format('M')),
            'year' => $w->starts_at->format('Y'),
            'dateLong' => $w->starts_at->format('D, j M Y'),
            'timeRange' => $w->starts_at->format('H:i').' - '.$w->endsAt()->format('H:i').' (SAST)',
            'durationMinutes' => $w->duration_minutes,
            'format' => $w->format ?? 'Online (Zoom)',
            'languages' => $w->languages ?? 'English',
            'cpd' => (bool) $w->cpd,
            'priceZar' => $w->price_zar,
            'state' => $state,
            'stateLabel' => $label,
            'stateTone' => $tone,
            'upcoming' => in_array($state, ['awaiting_w1', 'approved'], true),
            'live' => $state === 'live',
            'registrationOpen' => $w->registrationOpen(),
            'replayAvailable' => $w->replayAvailable(),
            'replayDuration' => $w->detail('replay_duration'),
            'views' => $w->views,
            'featured' => (bool) $w->featured,
        ];
    }

    /** Full detail for the selected-webinar journey pages. */
    public static function detail(Webinar $w): array
    {
        return self::card($w) + [
            'audience' => $w->audience,
            'outcomes' => $w->detail('outcomes', WebinarRegister::defaultOutcomes()),
            'agenda' => $w->detail('agenda', WebinarRegister::defaultAgenda()),
            'whoShouldAttend' => $w->detail('who', WebinarRegister::whoShouldAttend()),
            'takeaways' => $w->detail('takeaways', WebinarRegister::takeaways()),
            'about' => $w->detail('about', [$w->summary]),
            'speakers' => $w->detail('speakers', [[$w->speaker, $w->speaker_role ?? 'Presenter']]),
            'faqs' => WebinarRegister::faqs(),
            'chapters' => collect($w->detail('chapters', WebinarRegister::chapters()))->values()->map(fn ($c, $i) => ['n' => $i + 1, 'title' => $c[0], 'start' => $c[1], 'end' => $c[2], 'views' => $c[3] ?? 0])->all(),
            'resources' => WebinarRegister::resources(),
            'quote' => $w->detail('quote'),
        ];
    }

    public static function registration(?WebinarRegistration $r): ?array
    {
        if (! $r) {
            return null;
        }
        $modes = WebinarRegister::participationModes();

        return [
            'id' => $r->id,
            'reference' => $r->reference,
            'name' => $r->name,
            'email' => $r->email,
            'phone' => $r->phone,
            'country' => $r->country,
            'organisation' => $r->company,
            'role' => $r->job_title,
            'industry' => $r->industry,
            'participation' => $r->participation,
            'participationLabel' => $modes[$r->participation][0] ?? $r->participation,
            'participationBody' => $modes[$r->participation][1] ?? '',
            'status' => $r->status,
            'attendance' => $r->attendance,
            'certificate' => $r->certificate,
            'registeredAt' => $r->created_at?->format('j M Y, H:i'),
            'token' => $r->access_token,
        ];
    }

    /** Headline counts for one event, computed from the registration register. */
    public static function metrics(Webinar $w): array
    {
        $regs = $w->registrations()->get(['status', 'attendance', 'watch_minutes', 'chat_count', 'poll_count', 'download_count', 'joined_at', 'source', 'job_title', 'industry', 'consent_state', 'followup_status', 'certificate']);
        $active = $regs->where('status', 'registered');
        $attended = $active->whereIn('attendance', ['attended', 'partial']);
        $noShow = $active->where('attendance', 'no_show');
        $registered = $active->count();
        $pct = fn ($n, $d) => $d > 0 ? (int) round($n / $d * 100) : 0;

        return [
            'registered' => $registered,
            'cancelled' => $regs->where('status', 'cancelled')->count(),
            'attended' => $attended->count(),
            'attendedPct' => $pct($attended->count(), $registered),
            'noShows' => $noShow->count(),
            'noShowPct' => $pct($noShow->count(), $registered),
            'avgWatch' => (int) round($attended->avg('watch_minutes') ?? 0),
            'chat' => (int) $attended->sum('chat_count'),
            'polls' => (int) $attended->where('poll_count', '>', 0)->count(),
            'downloads' => (int) $active->sum('download_count'),
            'questions' => $w->questions()->count(),
            'feedback' => $w->feedback()->count(),
            'rating' => round((float) ($w->feedback()->avg('rating') ?? 0), 1),
            'certificates' => $active->where('certificate', 'issued')->count(),
            'followupSent' => $noShow->where('followup_status', 'sent')->count(),
            'bySource' => self::share($active->countBy('source'), $registered),
            'byRole' => self::share($active->countBy('job_title'), $registered),
            'byIndustry' => self::share($attended->countBy(fn ($r) => $r->industry ?: 'Other'), $attended->count()),
            'byConsent' => $active->countBy('consent_state')->all(),
        ];
    }

    /** @return array<int, array{label: string, value: int, pct: int}> */
    private static function share(Collection $counts, int $total): array
    {
        return $counts->sortDesc()->map(fn ($n, $k) => ['label' => (string) $k, 'value' => $n, 'pct' => $total > 0 ? (int) round($n / $total * 100) : 0])->values()->all();
    }
}
