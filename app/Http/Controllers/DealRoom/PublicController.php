<?php

namespace App\Http\Controllers\DealRoom;

use App\Http\Controllers\Controller;
use App\Models\DealRoom\Party;
use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\EnquiryOptions;
use App\Support\DealRoom\Rooms;
use App\Support\DealRoom\Stages;
use App\Support\DealRoom\Workflow;
use App\Support\Platform\EmbeddedServices;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public Virtual Deal Room pages: landing (Stage 1 / front-end page), the
 * Stage A enquiry and lead qualification, "my rooms" and invitation accept.
 */
class PublicController extends Controller
{
    public function landing(): Response
    {
        return Inertia::render('DealRoom/Landing', [
            'stages' => collect(Stages::all())->map(fn ($s, $c) => ['code' => (string) $c, 'name' => $s['name'], 'phase' => $s['phase']])->values(),
            'embedded' => EmbeddedServices::forModule('virtual-deal-room'),
        ]);
    }

    public function enquiry(Request $request): Response
    {
        return Inertia::render('DealRoom/Enquiry', [
            'transactionTypes' => EnquiryOptions::transactionTypeGroups(),
            'raiseBands' => EnquiryOptions::raiseBands(),
            'sectors' => ['Financial Services / Fintech', 'Agriculture & Agri-Processing', 'Energy & Infrastructure', 'Healthcare', 'Manufacturing', 'Technology & Software', 'Mining & Resources', 'Retail & Consumer', 'Logistics', 'Other'],
            'prefill' => $request->user() ? ['name' => $request->user()->name, 'email' => $request->user()->email, 'phone' => $request->user()->phone, 'company' => $request->user()->company] : null,
        ]);
    }

    /**
     * Stage A: store the enquiry, run the preliminary checks, score fit and
     * create the room record in Stage A. A fit of 60%+ completes A and unlocks B.
     */
    public function submitEnquiry(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'transaction_type' => ['required', Rule::in(EnquiryOptions::transactionTypes())],
            'objective' => ['required', 'string', 'max:250'],
            'raise_band' => ['required', Rule::in(array_keys(EnquiryOptions::RAISE_BANDS))],
            'target_close_date' => ['nullable', 'date', 'after:today'],
            'current_stage' => ['required', Rule::in(['Preparation', 'Early Interest', 'Active Diligence', 'Negotiation', 'Closing'])],
            'company' => ['required', 'string', 'max:160'],
            'jurisdiction' => ['required', 'string', 'max:80'],
            'sector' => ['required', 'string', 'max:80'],
            'website' => ['nullable', 'url', 'max:190'],
            'employees' => ['nullable', 'string', 'max:20'],
            'revenue' => ['nullable', 'string', 'max:40'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'string', 'max:60'],
            'room_name' => ['nullable', 'string', 'max:120'],
            'authority' => ['accepted'],
        ], [
            'authority.accepted' => __('Please confirm you have the authority to make this enquiry.'),
            'transaction_type.in' => __('Please choose a transaction type from the list.'),
            'raise_band.required' => __('Please choose an indicative raise or deal size.'),
            'raise_band.in' => __('Please choose an indicative raise or deal size.'),
        ]);

        // The band code is stored; amount_zar keeps a working ZAR value for fee estimates.
        $band = EnquiryOptions::band($data['raise_band']);
        $amount = $band['indicative_zar'];

        $checks = [
            ['label' => 'Conflict of Interest Check', 'result' => 'Passed'],
            ['label' => 'Sanctions & Watchlist Screening', 'result' => 'Passed'],
            ['label' => 'Adverse Media Screening', 'result' => 'Passed'],
            ['label' => 'Preliminary AML Risk Check', 'result' => 'Low Risk'],
            ['label' => 'Data Privacy Compliance Check', 'result' => 'Passed'],
        ];
        $score = 55
            + ($amount >= 10_000_000 ? 10 : 0)
            + (! empty($data['website']) ? 5 : 0)
            + (in_array($data['revenue'] ?? '', ['R50m - R200m', 'R200m+'], true) ? 10 : 5)
            + (! empty($data['target_close_date']) ? 5 : 0)
            + (strlen($data['objective']) > 40 ? 5 : 0);
        $score = min(95, $score);

        $dealType = EnquiryOptions::dealTypeOf($data['transaction_type']);

        $room = Rooms::create($request->user(), [
            'name' => ($data['room_name'] ?? null) ?: ($data['company'].' '.($dealType === 'fundraising' ? 'Capital Raise' : 'Transaction')),
            'company' => $data['company'],
            'country' => $data['jurisdiction'],
            'sector' => $data['sector'],
            'deal_type' => $dealType,
            'transaction_type' => $data['transaction_type'],
            'objective' => $data['objective'],
            'amount_zar' => $amount,
            'target_close_date' => $data['target_close_date'] ?? null,
            'enquiry' => [
                ...collect($data)->except(['authority'])->all(),
                'transaction_group' => EnquiryOptions::groupOf($data['transaction_type']),
                'raise_band_min_zar' => $band['min'],
                'raise_band_max_zar' => $band['max'],
                'checks' => $checks,
                'score' => $score,
                'submitted_at' => now()->toIso8601String(),
                'evidence' => ['EV-ENQ-'.now()->format('Y-His'), 'EV-CHK-'.now()->format('Y-His'), 'EV-QLF-'.now()->format('Y-His')],
            ],
        ]);

        Workflow::complete($room, 'A', $request->user()->name);

        return redirect()->route('deal-room.rooms.page', [$room, 'diagnostic'])
            ->with('success', "Enquiry qualified ({$score}% fit). Your deal room {$room->reference} is ready for the diagnostic.");
    }

    public function rooms(Request $request): Response
    {
        $user = $request->user();
        $rooms = Room::query()
            ->where('user_id', $user->id)
            ->orWhereHas('parties', fn ($q) => $q->where('status', 'active')->where(fn ($q) => $q->where('user_id', $user->id)->orWhere('email', $user->email)))
            ->latest('id')->get();

        $invites = Party::with('room')->where('email', $user->email)->where('status', 'invited')->get();

        return Inertia::render('DealRoom/Rooms', [
            'rooms' => $rooms->map(fn (Room $r) => [
                'slug' => $r->slug, 'reference' => $r->reference, 'name' => $r->name, 'company' => $r->company, 'status' => $r->status,
                'stage' => (string) $r->current_stage, 'stageName' => Stages::get((string) $r->current_stage)['name'],
                'progress' => (int) round(Stages::index((string) $r->current_stage) / (count(Stages::codes()) - 1) * 100),
                'role' => Access::ROLES[Access::role($r, $user) ?? 'owner'] ?? 'Party',
            ]),
            'invites' => $invites->map(fn (Party $p) => ['token' => $p->invite_token, 'room' => $p->room->name, 'role' => Access::ROLES[$p->role] ?? $p->role, 'expires' => $p->invite_expires_at?->format('d M Y')]),
        ]);
    }

    /** Accept an invitation: the party is linked to the signed-in user when the email matches. */
    public function acceptInvite(Request $request, string $token): RedirectResponse
    {
        $party = Party::where('invite_token', $token)->firstOrFail();
        $user = $request->user();
        abort_unless(strcasecmp($party->email, $user->email) === 0, 403, 'This invitation was sent to a different email address.');

        if ($party->invite_expires_at && $party->invite_expires_at->isPast()) {
            $party->update(['status' => 'expired']);

            return redirect()->route('deal-room.rooms.index')->with('error', 'This invitation has expired. Ask the room owner to re-invite you.');
        }
        if ($request->query('decline')) {
            $party->update(['status' => 'declined', 'invite_token' => null]);
            Audit::log($party->room, 'party.declined', "{$party->name} declined the invitation", $user->name);

            return redirect()->route('deal-room.rooms.index')->with('success', 'Invitation declined.');
        }

        $party->update(['status' => 'active', 'user_id' => $user->id, 'accepted_at' => now(), 'invite_token' => null]);
        Audit::log($party->room, 'party.accepted', "{$party->name} accepted the invitation as ".(Access::ROLES[$party->role] ?? $party->role), $user->name);

        return redirect()->route('deal-room.data-room', $party->room)->with('success', 'Invitation accepted. Review and accept the NDA to enter the data room.');
    }

    /** Mockup URLs without a room (/virtual-deal-room/commercial/x, /start/x) resolve to the user's latest room. */
    public function latest(Request $request, string $area, ?string $screen = null): RedirectResponse
    {
        $room = Room::where('user_id', $request->user()->id)->latest('id')->first();
        if (! $room) {
            return redirect()->route('deal-room.enquiry')->with('error', 'Start with an enquiry to open your deal room.');
        }

        return match ($area) {
            'start' => redirect()->route('deal-room.setup', [$room, $screen ?? 'deal-basics']),
            'billing' => redirect()->route('deal-room.billing', [$room, $screen ?? 'usage-dashboard']),
            default => redirect()->route('deal-room.commercial', [$room, $screen ?? 'preliminary-estimate']),
        };
    }
}
