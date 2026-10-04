<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SavedItem;
use App\Models\Submission;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Generic inbound records shared by every section:
 *  POST /forms/{type}   any enquiry-style form (question, contact, quote-request, complaint ...)
 *  POST /bookings       schedule a call
 *  POST /saved          save / unsave an item (clients only)
 */
class FormController extends Controller
{
    public function submit(Request $request, string $type): RedirectResponse
    {
        abort_unless(preg_match('/^[a-z0-9-]{2,40}$/', $type) === 1, 404);

        $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:190'],
            'subject' => ['nullable', 'string', 'max:190'],
            'section' => ['nullable', 'string', 'max:40'],
        ]);

        $user = $request->user();

        $submission = Submission::create([
            'reference' => Reference::make(strtoupper(substr(str_replace('-', '', $type), 0, 3))),
            'user_id' => $user?->id,
            'type' => $type,
            'section' => $request->input('section'),
            'subject' => $request->input('subject'),
            'name' => $request->input('name', $user?->name),
            'email' => $request->input('email', $user?->email),
            'payload' => $request->except(['_token', 'name', 'email', 'subject', 'section', 'redirect']),
        ]);

        $redirect = $request->input('redirect');

        return ($redirect && str_starts_with($redirect, '/') ? redirect($redirect) : back())
            ->with('success', "Thank you. Your reference is {$submission->reference}.")
            ->with('reference', $submission->reference);
    }

    public function book(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['nullable', 'string', 'max:40'],
            'topic' => ['nullable', 'string', 'max:190'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'integer', 'in:15,30,45,60,90'],
            'channel' => ['nullable', 'in:video,phone,in-person'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'company' => ['nullable', 'string', 'max:190'],
            'meta' => ['nullable', 'array'],
            'redirect' => ['nullable', 'string'],
        ]);

        $startsAt = Carbon::parse("{$data['date']} {$data['time']}");

        $taken = Booking::query()->where('starts_at', $startsAt)->where('status', '!=', 'cancelled')->exists();
        if ($taken) {
            return back()->withErrors(['time' => 'That slot has just been booked. Please choose another time.']);
        }

        $booking = Booking::create([
            'reference' => Reference::make('BKG'),
            'user_id' => $request->user()?->id,
            'type' => $data['type'] ?? 'discovery-call',
            'topic' => $data['topic'] ?? null,
            'starts_at' => $startsAt,
            'duration_minutes' => $data['duration_minutes'] ?? 30,
            'channel' => $data['channel'] ?? 'video',
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
            'meta' => $data['meta'] ?? null,
        ]);

        $redirect = $data['redirect'] ?? null;

        return redirect($redirect && str_starts_with($redirect, '/') ? str_replace('{reference}', $booking->reference, $redirect) : url()->previous())
            ->with('success', "Booking confirmed. Reference {$booking->reference}.")
            ->with('reference', $booking->reference);
    }

    /**
     * Times already taken on a date, for slot pickers: GET /bookings/slots?date=2026-10-05
     */
    public function slots(Request $request)
    {
        $date = $request->validate(['date' => ['required', 'date']])['date'];

        return response()->json([
            'taken' => Booking::query()
                ->whereDate('starts_at', $date)
                ->where('status', '!=', 'cancelled')
                ->get()
                ->map(fn ($b) => $b->starts_at->format('H:i'))
                ->values(),
        ]);
    }

    public function toggleSaved(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'item_type' => ['required', 'string', 'max:40'],
            'item_key' => ['required', 'string', 'max:120'],
            'label' => ['required', 'string', 'max:190'],
            'url' => ['nullable', 'string', 'max:255'],
            'meta' => ['nullable', 'array'],
        ]);

        $existing = SavedItem::query()
            ->where('user_id', $request->user()->id)
            ->where('item_type', $data['item_type'])
            ->where('item_key', $data['item_key'])
            ->first();

        if ($existing) {
            $existing->delete();

            return back()->with('success', "{$data['label']} removed from Saved Items.");
        }

        $request->user()->savedItems()->create($data);

        return back()->with('success', "{$data['label']} saved.");
    }
}
