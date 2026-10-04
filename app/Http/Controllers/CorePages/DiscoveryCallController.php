<?php

namespace App\Http\Controllers\CorePages;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Core\FormController;
use App\Models\Booking;
use App\Support\CorePages\DiscoveryCall;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Book a Discovery Call journey (Meeting Details + Date & Time -> Review & Confirm -> Confirmed)
 * and the signed-in "My Meetings" register with reschedule / cancel.
 */
class DiscoveryCallController extends Controller
{
    private const SESSION = 'discovery_call';

    public function book(Request $request): Response
    {
        $user = $request->user();
        $draft = $request->session()->get(self::SESSION, []);

        return Inertia::render('CorePages/DiscoveryCall/Book', [
            ...$this->shared(),
            'draft' => [
                'purpose' => $draft['purpose'] ?? 'active-sprint',
                'engagement' => $draft['engagement'] ?? DiscoveryCall::engagements()[0],
                'notes' => $draft['notes'] ?? '',
                'channel' => $draft['channel'] ?? 'video',
                'date' => $draft['date'] ?? '',
                'time' => $draft['time'] ?? '',
                'timezone' => $draft['timezone'] ?? 'SAST',
                'name' => $draft['name'] ?? $user?->name ?? '',
                'email' => $draft['email'] ?? $user?->email ?? '',
                'phone' => $draft['phone'] ?? $user?->phone ?? '',
                'company' => $draft['company'] ?? $user?->company ?? '',
                'contact_method' => $draft['contact_method'] ?? 'Email',
                'files' => $draft['files'] ?? [],
            ],
            'today' => today()->format('Y-m-d'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $slots = [...DiscoveryCall::SLOTS['morning'], ...DiscoveryCall::SLOTS['afternoon']];

        $data = $request->validate([
            'purpose' => ['required', Rule::in(collect(DiscoveryCall::purposes())->pluck('key')->all())],
            'engagement' => ['required', Rule::in(DiscoveryCall::engagements())],
            'notes' => ['nullable', 'string', 'max:500'],
            'channel' => ['required', Rule::in(['video', 'phone'])],
            'date' => ['required', 'date_format:Y-m-d', 'after:today'],
            'time' => ['required', Rule::in($slots)],
            'timezone' => ['required', Rule::in(collect(DiscoveryCall::timezones())->pluck('key')->all())],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => [Rule::requiredIf($request->input('channel') === 'phone'), 'nullable', 'string', 'max:30'],
            'company' => ['nullable', 'string', 'max:190'],
            'contact_method' => ['required', Rule::in(['Email', 'Phone', 'WhatsApp'])],
            'files' => ['nullable', 'array', 'max:3'],
            'files.*' => ['file', 'max:10240', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,png,jpg,jpeg'],
            'keep_files' => ['nullable', 'array'],
        ], [
            'date.after' => 'Please choose a date from tomorrow onwards.',
            'phone.required' => 'A phone number is required for a phone call.',
        ]);

        $date = Carbon::parse($data['date']);
        if (! DiscoveryCall::isBookableDate($date)) {
            throw ValidationException::withMessages(['date' => 'Discovery Calls are available on weekdays within the next 60 days.']);
        }
        $this->ensureSlotFree($data['date'], $data['time']);

        $previous = $request->session()->get(self::SESSION.'.files', []);
        $keep = $request->input('keep_files', []);
        $files = array_values(array_filter($previous, fn ($f) => in_array($f['path'], $keep, true)));
        foreach ($request->file('files', []) as $file) {
            $files[] = [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'path' => $file->store('discovery-call', 'local'),
            ];
        }

        $request->session()->put(self::SESSION, [...collect($data)->except(['files', 'keep_files'])->all(), 'files' => array_slice($files, 0, 3)]);

        return redirect()->route('core.discovery.review');
    }

    public function review(Request $request): Response|RedirectResponse
    {
        $draft = $request->session()->get(self::SESSION);
        if (! $draft || empty($draft['date'])) {
            return redirect()->route('core.discovery')->with('error', 'Please choose your meeting details and a time first.');
        }

        return Inertia::render('CorePages/DiscoveryCall/Review', [
            ...$this->shared(),
            'draft' => [
                ...$draft,
                'purpose_title' => DiscoveryCall::purposeTitle($draft['purpose']),
                'timezone_label' => DiscoveryCall::timezoneLabel($draft['timezone']),
                'date_label' => Carbon::parse($draft['date'])->format('d M Y'),
                'weekday' => Carbon::parse($draft['date'])->format('l'),
            ],
        ]);
    }

    public function confirm(Request $request): RedirectResponse
    {
        $draft = $request->session()->get(self::SESSION);
        if (! $draft) {
            return redirect()->route('core.discovery');
        }

        $request->validate([
            'checks' => ['required', 'array', 'size:4'],
            'checks.*' => ['accepted'],
        ], ['checks.required' => 'Please confirm all four checklist items.', 'checks.size' => 'Please confirm all four checklist items.']);

        // Hand over to the shared booking endpoint (POST /bookings) logic.
        $request->merge([
            'type' => 'discovery-call',
            'topic' => DiscoveryCall::purposeTitle($draft['purpose']),
            'date' => $draft['date'],
            'time' => $draft['time'],
            'duration_minutes' => 30,
            'channel' => $draft['channel'],
            'name' => $draft['name'],
            'email' => $draft['email'],
            'phone' => $draft['phone'] ?? null,
            'company' => $draft['company'] ?? null,
            'meta' => [
                'purpose' => $draft['purpose'],
                'engagement' => $draft['engagement'],
                'notes' => $draft['notes'] ?? null,
                'files' => $draft['files'] ?? [],
                'timezone' => $draft['timezone'],
                'manager' => 'nneka',
                'contact_method' => $draft['contact_method'],
                'title' => 'Discovery Call',
                'subtitle' => 'Initial Discovery & Needs Assessment',
                'checklist_confirmed_at' => now()->toIso8601String(),
            ],
            'redirect' => '/discovery-call/confirmed/{reference}',
        ]);

        $response = app(FormController::class)->book($request);

        $reference = $request->session()->get('reference');
        if ($reference) {
            $request->session()->push('discovery_bookings', $reference);
            $request->session()->forget(self::SESSION);
        }

        return $response;
    }

    public function confirmed(Request $request, Booking $booking): Response
    {
        $this->authorizeView($request, $booking);

        return Inertia::render('CorePages/DiscoveryCall/Confirmed', [
            ...$this->shared(),
            'booking' => DiscoveryCall::present($booking),
            'canManage' => $request->user()?->id === $booking->user_id && $booking->user_id !== null,
        ]);
    }

    public function meetings(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:80'],
            'status' => ['nullable', Rule::in(['confirmed', 'upcoming', 'pending', 'rescheduled', 'cancelled', 'completed'])],
            'view' => ['nullable', Rule::in(['list', 'calendar'])],
        ]);

        $user = $request->user();
        $all = Booking::query()
            ->where(fn ($q) => $q->where('user_id', $user->id)->orWhere(fn ($q) => $q->whereNull('user_id')->where('email', $user->email)))
            ->orderBy('starts_at')
            ->get();

        $filtered = $all
            ->when(! empty($filters['status']), fn ($c) => $c->where('status', $filters['status']))
            ->when(! empty($filters['q']), fn ($c) => $c->filter(fn ($b) => str_contains(strtolower(($b->meta['title'] ?? '').' '.$b->topic.' '.($b->meta['engagement'] ?? '')), strtolower($filters['q']))));

        $isPast = fn (Booking $b) => $b->status === 'completed' || ($b->starts_at->isPast() && $b->status !== 'cancelled');
        $upcoming = $filtered->reject($isPast)->reject(fn ($b) => $b->status === 'cancelled' && empty($filters['status']))->values();
        $past = $filtered->filter($isPast)->sortByDesc('starts_at')->values();
        $next = $all->first(fn ($b) => ! $isPast($b) && $b->status !== 'cancelled');

        return Inertia::render('CorePages/DiscoveryCall/Meetings', [
            ...$this->shared(),
            'upcoming' => $upcoming->map(fn ($b) => DiscoveryCall::present($b)),
            'past' => $past->map(fn ($b) => DiscoveryCall::present($b)),
            'next' => $next ? DiscoveryCall::present($next) : null,
            'snapshot' => [
                'upcoming' => $all->reject($isPast)->where('status', '!=', 'cancelled')->count(),
                'completed_month' => $all->filter($isPast)->filter(fn ($b) => $b->starts_at->gte(now()->subDays(30)))->count(),
                'rescheduled' => $all->where('status', 'rescheduled')->count(),
                'pending' => $all->where('status', 'pending')->count(),
            ],
            'filters' => ['q' => $filters['q'] ?? '', 'status' => $filters['status'] ?? '', 'view' => $filters['view'] ?? 'list'],
        ]);
    }

    public function reschedule(Request $request, Booking $booking): Response|RedirectResponse
    {
        $this->authorizeOwner($request, $booking);
        if (! DiscoveryCall::canChange($booking)) {
            return redirect()->route('core.discovery.meetings')->with('error', 'This meeting can no longer be changed online. Changes close '.DiscoveryCall::CHANGE_CUTOFF_HOURS.' hours before the start time.');
        }

        return Inertia::render('CorePages/DiscoveryCall/Reschedule', [
            ...$this->shared(),
            'booking' => DiscoveryCall::present($booking),
            'today' => today()->format('Y-m-d'),
        ]);
    }

    public function updateSchedule(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorizeOwner($request, $booking);
        abort_unless(DiscoveryCall::canChange($booking), 422, 'This meeting can no longer be changed online.');

        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d', 'after:today'],
            'time' => ['required', Rule::in([...DiscoveryCall::SLOTS['morning'], ...DiscoveryCall::SLOTS['afternoon']])],
            'reason' => ['nullable', 'string', 'max:300'],
        ]);
        if (! DiscoveryCall::isBookableDate(Carbon::parse($data['date']))) {
            throw ValidationException::withMessages(['date' => 'Please choose a weekday within the next 60 days.']);
        }
        $this->ensureSlotFree($data['date'], $data['time'], $booking->id);

        $meta = $booking->meta ?? [];
        $meta['history'][] = ['from' => $booking->starts_at->toIso8601String(), 'at' => now()->toIso8601String(), 'reason' => $data['reason'] ?? null];
        $booking->update([
            'starts_at' => Carbon::parse("{$data['date']} {$data['time']}"),
            'status' => 'rescheduled',
            'meta' => $meta,
        ]);

        return redirect()->route('core.discovery.confirmed', $booking)->with('success', "Meeting rescheduled to {$booking->starts_at->format('d M Y, H:i')}.");
    }

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorizeOwner($request, $booking);
        if (! DiscoveryCall::canChange($booking)) {
            return back()->with('error', 'This meeting can no longer be cancelled online. Please contact your Relationship Manager.');
        }

        $meta = $booking->meta ?? [];
        $meta['cancelled_at'] = now()->toIso8601String();
        $meta['cancel_reason'] = $request->input('reason');
        $booking->update(['status' => 'cancelled', 'meta' => $meta]);

        return redirect()->route('core.discovery.meetings')->with('success', "Meeting {$booking->reference} cancelled. The time slot has been released.");
    }

    public function calendar(Request $request, Booking $booking): HttpResponse
    {
        $this->authorizeView($request, $booking);
        $start = $booking->starts_at->copy()->setTimezone('Africa/Johannesburg');
        $fmt = fn (Carbon $d) => $d->copy()->utc()->format('Ymd\THis\Z');
        $ics = implode("\r\n", [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Business Clinic.Africa//Discovery Call//EN', 'BEGIN:VEVENT',
            'UID:'.$booking->reference.'@thebusinessclinic.africa',
            'DTSTAMP:'.$fmt(now()),
            'DTSTART:'.$fmt($start),
            'DTEND:'.$fmt($start->copy()->addMinutes($booking->duration_minutes)),
            'SUMMARY:TBCA '.($booking->meta['title'] ?? 'Discovery Call'),
            'DESCRIPTION:Booking '.$booking->reference.'. '.(DiscoveryCall::meetingLink($booking) ?? 'Your Relationship Manager will call you.'),
            'END:VEVENT', 'END:VCALENDAR',
        ]);

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$booking->reference.'.ics"',
        ]);
    }

    private function shared(): array
    {
        return [
            'purposes' => DiscoveryCall::purposes(),
            'engagements' => DiscoveryCall::engagements(),
            'timezones' => DiscoveryCall::timezones(),
            'slots' => DiscoveryCall::SLOTS,
            'manager' => DiscoveryCall::defaultManager(),
        ];
    }

    private function ensureSlotFree(string $date, string $time, ?int $ignoreId = null): void
    {
        $taken = Booking::query()
            ->where('starts_at', Carbon::parse("{$date} {$time}"))
            ->where('status', '!=', 'cancelled')
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        if ($taken) {
            throw ValidationException::withMessages(['time' => 'That slot has just been booked. Please choose another time.']);
        }
    }

    private function authorizeView(Request $request, Booking $booking): void
    {
        $user = $request->user();
        $ownsIt = $user && ($booking->user_id === $user->id || $user->isAdmin());
        $inSession = in_array($booking->reference, $request->session()->get('discovery_bookings', []), true);
        abort_unless($ownsIt || $inSession, 403);
    }

    private function authorizeOwner(Request $request, Booking $booking): void
    {
        abort_unless($booking->user_id !== null && $request->user()?->id === $booking->user_id, 403);
    }
}
