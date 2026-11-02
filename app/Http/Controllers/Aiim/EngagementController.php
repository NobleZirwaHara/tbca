<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Advisor;
use App\Models\Aiim\CaseFile;
use App\Models\Aiim\Country;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\Introduction;
use App\Models\Aiim\Province;
use App\Models\Aiim\Sector;
use App\Models\Booking;
use App\Support\Aiim\EngagementFlow;
use App\Support\Aiim\Fulfilment;
use App\Support\Aiim\ProtoEngagement as P;
use App\Support\Aiim\Refs;
use App\Support\Aiim\SectorCodes;
use App\Support\Platform\Checkout;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Response;

/**
 * Stages 4–6 of the prototype's advisory journey (mock-ups 39 to 49): custom
 * intelligence request and its review, advisor request, discovery booking (via the
 * shared POST /bookings), discovery confirmation and outcome, formal quotation,
 * engagement letter, electronic signature and deposit, then the custom intelligence
 * report / mandate workspace. POST /engagements/{ref}/message also carries the
 * mandate-stage actions (see action()).
 */
class EngagementController extends AiimController
{
    /** Discovery call slots of the prototype's booking page (CAT, UTC+2). */
    public const SLOTS = ['09:00', '11:00', '14:00', '16:00'];

    /** Mandate-stage actions posted through the message endpoint, with the case type each one files. */
    public const CASES = ['refund' => ['refund', 'RFD', 'Refund request'], 'dispute' => ['dispute', 'DSP', 'Dispute case'], 'pause' => ['pause', 'PSE', 'Pause request'], 'restart' => ['restart', 'RST', 'Restart request'], 'cancel' => ['cancellation', 'CNL', 'Cancellation request']];

    public const SCOPE_SERVICES = ['AAB-EMB-171', 'AAB-EMB-168', 'AAB-EMB-211', 'AAB-EMB-123'];

    /* ------------------------------------------------------ request forms */

    /** Page 39 Custom Intelligence Request; after submission the same URL shows page 40 Custom Request Review. */
    public function customRequest(Request $request): Response|RedirectResponse
    {
        return $this->wizard($request, 'custom-intelligence');
    }

    /** Page 41 Advisor Request. */
    public function advisorRequest(Request $request): Response|RedirectResponse
    {
        return $this->wizard($request, 'advisory');
    }

    private function wizard(Request $request, string $type): Response|RedirectResponse
    {
        $e = $request->query('ref') ? $this->find($request, (string) $request->query('ref')) : null;
        abort_if($e && $e->type !== $type, 404);
        if ($e && $type === 'custom-intelligence' && in_array($e->status, ['submitted', 'under_review', 'discovery_booked', 'discovery_completed', 'quoted'], true)) {
            return $this->review($request, $e);
        }
        if ($e && $e->status !== 'draft') {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? "/aiim/workspace/engagements/{$e->reference}");
        }

        $country = P::countryBySlug((string) ($request->query('country') ?: ($e?->request['countries'][0] ?? 'botswana'))) ?? P::countryBySlug('botswana');
        $user = $request->user();

        return $this->render($request, 'Aiim/Engagement/RequestWizard', [
            'type' => $type,
            'engagement' => $e ? ['reference' => $e->reference, 'request' => $e->request ?? []] : null,
            'country' => $country,
            'options' => [
                'countries' => Country::query()->orderBy('name')->get(['slug', 'name'])->map(fn ($c) => ['value' => $c->slug, 'label' => $c->name])->values(),
                'sectors' => P::sectors($country),
                'units' => P::units($country),
                'tickets' => P::TICKETS,
                'desks' => P::DESKS,
                'channels' => P::CHANNELS,
            ],
            'user' => $user ? ['name' => $user->name, 'email' => $user->email] : null,
            'rail' => $type === 'advisory'
                ? P::rail(['AAB-EMB-204', 'AAB-EMB-205', 'AAB-EMB-238', 'AAB-EMB-240'], 'Advisory', 4)
                : P::rail(['AAB-EMB-123', 'AAB-EMB-243', 'AAB-EMB-190'], 'Likely services', 3),
        ], $type === 'advisory' ? 'Advisor Request' : 'Custom Intelligence Request');
    }

    /** Page 40: analyst triage of a submitted custom intelligence request. */
    private function review(Request $request, Engagement $e): Response
    {
        $country = P::country($e);
        $sector = $e->request['sector_code'] ?? null;
        $bw = $country && $country['isBw'];

        return $this->render($request, 'Aiim/Engagement/CustomReview', [
            'engagement' => self::props($e),
            'country' => $country,
            'sectorName' => P::sectorName($sector, $country),
            'coverage' => $bw ? P::coverage($sector) : null,
            'gaps' => $bw ? P::reg('BW_DataGaps') : [],
            'rail' => P::rail(['AAB-EMB-204', 'AAB-EMB-243'], 'Next', 2),
        ], 'Custom Request Review');
    }

    /** Submit the request form (pages 39 and 41). The request goes straight to TBCA review (G7). */
    public function saveRequest(Request $request): RedirectResponse
    {
        $type = $request->validate(['type' => ['required', Rule::in(['custom-intelligence', 'advisory'])]])['type'];
        $e = $request->input('ref') ? $this->find($request, (string) $request->input('ref')) : null;
        abort_if($e && $e->status !== 'draft', 409, 'This request has already been submitted.');

        $country = ['country' => ['required', 'exists:aiim_countries,slug']];
        $data = $type === 'custom-intelligence'
            ? $request->validate($country + [
                'question' => ['required', 'string', 'min:10', 'max:2000'],
                'sector' => ['required', Rule::in(array_keys(SectorCodes::CODES))],
                'unit' => ['nullable', 'string', 'max:120'],
                'ticket' => ['required', Rule::in(P::TICKETS)],
                'needed_by' => ['nullable', 'date', 'after:today'],
            ], ['question.required' => 'Tell us your question.'])
            : $request->validate($country + [
                'name' => ['required', 'string', 'max:120'],
                'email' => ['required', 'email', 'max:190'],
                'desk' => ['required', Rule::in(P::DESKS)],
                'channel' => ['required', Rule::in(P::CHANNELS)],
                'topic' => ['required', 'string', 'min:10', 'max:2000'],
            ], ['topic.required' => 'Tell us what you would like to discuss.']);

        $req = $type === 'custom-intelligence'
            ? [
                'title' => Str::limit($data['question'], 90), 'detail' => $data['question'], 'questions' => $data['question'],
                'countries' => [$data['country']], 'sector_code' => $data['sector'], 'sectors' => [SectorCodes::slug($data['sector'])],
                'unit' => $data['unit'] ?? null, 'ticket' => $data['ticket'], 'required_by' => $data['needed_by'] ?? null,
                'purpose' => Str::limit($data['question'], 180),
            ]
            : [
                'title' => 'Advisor request: '.$data['desk'], 'summary' => $data['topic'], 'purpose' => Str::limit($data['topic'], 180),
                'countries' => [$data['country']], 'desk' => $data['desk'], 'channel' => $data['channel'],
                'contact' => ['name' => $data['name'], 'email' => $data['email']],
            ];

        if (! $e) {
            $e = Engagement::create([
                'reference' => Refs::make('ENG'), 'user_id' => $request->user()->id, 'type' => $type, 'status' => 'draft',
                'title' => $req['title'], 'request' => [],
            ]);
            EngagementFlow::log($e, 'client', 'Draft created');
        }
        $e->update(['request' => array_merge($e->request ?? [], $req), 'title' => $req['title'], 'step' => 5]);
        EngagementFlow::transition($e, 'submitted', 'client', 'Submitted for TBCA expert review (G7).', ['stage' => 'Expert Review']);

        return $type === 'custom-intelligence'
            ? redirect("/aiim/custom-intelligence?ref={$e->reference}")->with('success', "Request {$e->reference} submitted. A TBCA analyst reviews it within 1 business day.")
            : redirect("/aiim/workspace/engagements/{$e->reference}/discovery")->with('success', "Advisor request {$e->reference} submitted. Pick a discovery call slot below.");
    }

    /* ------------------------------------------------------------ discovery */

    /** Page 42 Booking Discovery: a 30-minute call on one of the next five weekdays. */
    public function discovery(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if (! in_array($e->status, ['submitted', 'under_review', 'discovery_completed'], true)) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? "/aiim/workspace/engagements/{$e->reference}");
        }
        $days = [];
        $d = CarbonImmutable::today();
        while (count($days) < 5) {
            $d = $d->addDay();
            if (! $d->isWeekend()) {
                $days[] = $d;
            }
        }
        $taken = Booking::query()->where('status', '!=', 'cancelled')
            ->whereBetween('starts_at', [$days[0]->startOfDay(), end($days)->endOfDay()])->get()
            ->map(fn ($b) => $b->starts_at->format('Y-m-d H:i'))->all();
        $advisor = $e->advisor ?? Advisor::query()->orderBy('id')->first();

        return $this->render($request, 'Aiim/Engagement/Discovery', [
            'engagement' => self::props($e),
            'days' => collect($days)->map(fn ($x) => [
                'date' => $x->toDateString(), 'label' => $x->format('D j M'),
                'slots' => collect(self::SLOTS)->map(fn ($t) => ['time' => $t, 'taken' => in_array($x->toDateString().' '.$t, $taken, true)])->all(),
            ])->all(),
            'advisor' => $advisor?->slug,
            'user' => $request->user()->only(['name', 'email', 'phone', 'company']),
            'rail' => P::rail(['AAB-EMB-204', 'AAB-EMB-240'], 'Booking', 2),
        ], 'Booking Discovery');
    }

    /** Return hook from POST /bookings: attach the booking and advance to discovery_booked. */
    public function booked(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        $booking = Booking::query()->where('reference', (string) $request->query('booking'))->first();
        abort_unless($booking && ($booking->user_id === $request->user()->id || $booking->email === $request->user()->email), 404);
        $advisor = Advisor::query()->where('slug', $booking->meta['advisor'] ?? '')->first();

        try {
            EngagementFlow::transition($e, 'discovery_booked', 'client', "Discovery booked {$booking->reference}.", [
                'booking_reference' => $booking->reference, 'discovery_at' => $booking->starts_at, 'advisor_id' => $advisor?->id ?? $e->advisor_id, 'stage' => 'Discovery',
                'request' => array_merge($e->request ?? [], ['purpose' => $booking->topic, 'focus' => $booking->meta['focus'] ?? null, 'additional' => $booking->meta['additional'] ?? [], 'session_background' => $booking->meta['background'] ?? null]),
            ]);
        } catch (DomainException $ex) {
            return redirect("/aiim/workspace/engagements/{$e->reference}")->with('error', $ex->getMessage());
        }

        return redirect("/aiim/workspace/engagements/{$e->reference}/discovery/confirmed");
    }

    /** Page 43 Discovery Confirmation. */
    public function confirmed(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        $booking = Booking::query()->where('reference', $e->booking_reference)->first();
        if (! $booking) {
            return redirect("/aiim/workspace/engagements/{$e->reference}/discovery");
        }
        $channel = ['video' => 'Video (link sent by email and WhatsApp)', 'phone' => 'Phone', 'in-person' => 'In person'][$booking->channel] ?? $booking->channel;

        return $this->render($request, 'Aiim/Engagement/DiscoveryConfirmed', [
            'engagement' => self::props($e),
            'booking' => [
                'reference' => $booking->reference, 'when' => $booking->starts_at->format('D j M Y H:i').' CAT', 'duration' => $booking->duration_minutes,
                'with' => ($e->advisor?->name ? $e->advisor->name.', ' : '').'TBCA Advisor',
                'channel' => $channel, 'status' => $booking->status, 'topic' => $booking->topic,
                'ics' => $booking->starts_at->format('Ymd\THis'), 'icsEnd' => $booking->starts_at->copy()->addMinutes($booking->duration_minutes)->format('Ymd\THis'),
            ],
            'canChange' => $booking->starts_at->isAfter(now()->addDay()) && $e->status === 'discovery_booked',
        ], 'Discovery Confirmation');
    }

    /** Cancel or reschedule the discovery session (allowed up to 24 hours before). */
    public function cancelBooking(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        $booking = Booking::query()->where('reference', $e->booking_reference)->firstOrFail();
        if ($booking->starts_at->isBefore(now()->addDay())) {
            return back()->with('error', 'Sessions can only be changed up to 24 hours before the start time.');
        }
        $booking->update(['status' => 'cancelled']);
        EngagementFlow::transition($e, 'under_review', 'client', "Discovery {$booking->reference} cancelled.", ['booking_reference' => null, 'discovery_at' => null]);

        return redirect("/aiim/workspace/engagements/{$e->reference}/discovery")
            ->with('success', $request->boolean('reschedule') ? 'Previous session released. Choose a new date and time.' : 'Discovery session cancelled.');
    }

    /** Page 44 Discovery Outcome, as recorded by the advisor. */
    public function outcome(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if (! $e->outcome) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace')->with('error', 'The discovery outcome will be available once your advisor has recorded it.');
        }
        $o = $e->outcome;
        $join = fn ($v) => is_array($v) ? implode('; ', array_filter($v, 'is_string')) : (string) $v;
        $constraints = $o['constraints'] ?? collect($o['assessment'] ?? [])->map(fn ($a) => "{$a[0]}: {$a[2]}")->implode('; ');

        return $this->render($request, 'Aiim/Engagement/Outcome', [
            'engagement' => self::props($e),
            'rows' => array_values(array_filter([
                ['Need', $o['need'] ?? $join($o['objectives'] ?? []) ?: $e->title],
                ['Evidence', $o['evidence'] ?? $join($o['points'] ?? [])],
                ['Constraints', $constraints],
                ['Recommended', $o['recommended'] ?? implode(' → ', $o['next'] ?? [])],
                ['Priority', $o['priority'] ?? null],
            ], fn ($r) => filled($r[1]))),
            'opportunity' => $o['opportunity'] ?? null,
            'rail' => P::rail(['AAB-EMB-195', 'AAB-EMB-210', 'AAB-EMB-197'], 'Recommended', 3),
        ], 'Discovery Outcome');
    }

    /* ------------------------------------------------- quote, letter, sign */

    /** Page 45 Formal Quotation. */
    public function quote(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if (! $e->quote) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace')->with('error', 'Your formal quotation has not been issued yet.');
        }

        return $this->render($request, 'Aiim/Engagement/Quote', ['engagement' => self::props($e)], 'Formal Quotation');
    }

    public function acceptQuote(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Please confirm you accept the scope, fees and payment terms.']);
        if (isset($e->quote['valid_until']) && now()->startOfDay()->gt($e->quote['valid_until'])) {
            return back()->with('error', 'This quotation has expired. Ask your advisor to re-issue it.');
        }

        return $this->step($e, 'quote_accepted', 'Quote line items accepted (hash '.substr(hash('sha256', json_encode($e->quote)), 0, 10).').', ['quote_accepted_at' => now(), 'stage' => 'Engagement Letter'], "/aiim/workspace/engagements/{$e->reference}/letter");
    }

    /** Page 46 Engagement Letter Review. */
    public function letter(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if (! in_array($e->status, ['quote_accepted', 'letter_accepted', 'signed', 'in_progress', 'paused', 'delivered', 'accepted', 'closed'], true)) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace');
        }

        return $this->render($request, 'Aiim/Engagement/Letter', ['engagement' => self::props($e), 'mode' => 'review', 'country' => P::country($e)], 'Engagement Letter Review');
    }

    public function acceptLetter(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        if ($request->input('decision') === 'decline') {
            $request->validate(['reason' => ['required', 'string', 'max:500']]);

            return $this->step($e, 'declined', 'Letter declined: '.$request->input('reason'), [], '/aiim/workspace');
        }
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Confirm you have read the scope and fee terms and accept the data protection terms.']);

        return $this->step($e, 'letter_accepted', 'Engagement letter accepted.', ['letter_accepted_at' => now(), 'stage' => 'Electronic Signature'], "/aiim/workspace/engagements/{$e->reference}/sign");
    }

    /** Page 47 Electronic Signature. */
    public function sign(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if ($e->status !== 'letter_accepted' && ! $e->signed_at) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace');
        }

        return $this->render($request, 'Aiim/Engagement/Letter', ['engagement' => self::props($e), 'mode' => 'sign', 'country' => P::country($e)], 'Electronic Signature');
    }

    /** Typed-name electronic signature: the typed name must match the account holder; a drawn mark is hashed into the record. */
    public function applySignature(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        $data = $request->validate([
            'signature' => ['required', 'string', 'max:120'],
            'title' => ['nullable', 'string', 'max:120'],
            'drawn' => ['nullable', 'string', 'max:400000'],
            'agree' => ['accepted'],
        ], ['agree.accepted' => 'Please confirm that this electronic signature is binding.']);
        $norm = fn ($s) => preg_replace('/\s+/', ' ', mb_strtolower(trim($s)));
        if ($norm($data['signature']) !== $norm($request->user()->name)) {
            return back()->withErrors(['signature' => 'Type your full name exactly as it appears on your account ('.$request->user()->name.').']);
        }
        $title = $data['title'] ?? null ?: ($request->user()->job_title ?? 'Authorised signatory');

        return $this->step($e, 'signed', "Signed electronically by {$data['signature']} ({$title}).", [
            'signature_name' => $data['signature'], 'signature_title' => $title, 'signed_at' => now(), 'signature_ip' => $request->ip(),
            'signature_hash' => hash('sha256', $e->reference.'|'.json_encode($e->quote).'|'.$data['signature'].'|'.hash('sha256', (string) ($data['drawn'] ?? '')).'|'.now()->toIso8601String()),
            'stage' => 'Deposit Payment',
        ], "/aiim/workspace/engagements/{$e->reference}/pay");
    }

    /** Page 48 Deposit Payment. */
    public function pay(Request $request, string $ref): Response|RedirectResponse
    {
        $this->sync($request);
        $e = $this->find($request, $ref);
        if ($e->status !== 'signed') {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace');
        }

        return $this->render($request, 'Aiim/Engagement/Deposit', ['engagement' => self::props($e)], 'Deposit Payment');
    }

    public function payDeposit(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        abort_unless($e->status === 'signed', 409);
        $method = $request->validate(['method' => ['required', Rule::in(['card', 'eft', 'bank', 'corporate'])]])['method'];
        if ($method === 'corporate') {
            return back()->with('error', 'Corporate account billing is available for existing enterprise clients only. Contact your account manager.');
        }
        $order = $e->depositOrder && ! $e->depositOrder->isPaid() ? $e->depositOrder : Checkout::createOrder(
            [['item_type' => 'aiim-deposit', 'item_code' => 'AIIM-PAY-S1-001', 'name' => "Deposit ({$e->quote['deposit_percent']}%) — {$e->title}", 'unit_zar' => (int) round($e->depositExVat())]],
            $request->user(), 'aiim',
            ['title' => 'AIIM engagement deposit', 'aiim' => ['kind' => 'deposit', 'engagement' => $e->reference, 'label' => $e->title], 'preferred_method' => $method],
        );
        $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);
        $e->update(['deposit_order_id' => $order->id]);

        return redirect()->route('checkout.show', $order);
    }

    /* ------------------------------------------------------ mandate views */

    public function index(Request $request): Response
    {
        $this->sync($request);

        return $this->render($request, 'Aiim/Engagement/Index', [
            'engagements' => Engagement::query()->where('user_id', $request->user()->id)->latest('id')->get()->map(fn ($e) => self::props($e, false)),
        ], 'My Mandates');
    }

    /** Page 49 Custom Intelligence Report: the mandate's deliverable, built from the country pack. */
    public function show(Request $request, string $ref): Response|RedirectResponse
    {
        $this->sync($request);
        $e = $this->find($request, $ref);
        if (! in_array($e->status, ['in_progress', 'paused', 'delivered', 'accepted', 'closed', 'cancelled'], true)) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace');
        }
        $country = P::country($e);
        $sector = $e->request['sector_code'] ?? null;
        $unit = $e->request['unit'] ?? null;
        $unitCode = $unit && $country && $country['isBw'] ? collect(P::units($country))->firstWhere('name', $unit)['code'] ?? null : null;

        return $this->render($request, 'Aiim/Engagement/Mandate', [
            'engagement' => self::props($e),
            'country' => $country,
            'report' => $country && $country['isBw'] && $sector ? P::report($sector, $unitCode) : null,
            'brief' => P::svc('AAB-EMB-193'),
            'rail' => P::rail(['AAB-EMB-197', 'AAB-EMB-208', 'AAB-EMB-171'], 'Next', 3),
        ], 'Custom Intelligence Report');
    }

    /**
     * Messages to the advisor, and the mandate-stage actions of the prototype pages that
     * have no route of their own yet (field `action`): verification scope (50) and
     * external-cost approval (51), introduction consent (58) and room messages (59),
     * delivery acceptance (63), scope change (64) and the case forms (65–69).
     */
    public function message(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        $action = (string) $request->input('action', '');
        if ($action !== '') {
            return $this->action($request, $e, $action);
        }
        $data = $request->validate(['message' => ['required', 'string', 'max:1000']]);
        EngagementFlow::log($e, 'client', 'Message to advisor', null, null, $data['message']);

        return back()->with('success', 'Message sent to '.($e->advisor?->name ?? 'your advisor').'.');
    }

    private function action(Request $request, Engagement $e, string $action): RedirectResponse
    {
        $base = "/aiim/workspace/engagements/{$e->reference}";

        switch ($action) {
            case 'verify-scope':
                $data = $request->validate(['hotspot' => ['nullable', 'integer', 'min:0'], 'place' => ['nullable', 'string', 'max:190'], 'checks' => ['array'], 'checks.*' => ['string', 'max:40']]);
                $e->update(['verification' => array_merge($e->verification ?? [], ['scope' => ['hotspot' => $data['hotspot'] ?? null, 'place' => $data['place'] ?? null, 'checks' => array_values($data['checks'] ?? [])], 'scoped_at' => now()->toDateTimeString()])]);
                EngagementFlow::log($e, 'client', 'Verification scope set', null, null, 'Checks: '.implode(', ', $data['checks'] ?? []));

                return redirect("{$base}/verification/costs")->with('success', 'Verification scope saved. Approve the external cost caps next.');

            case 'ext-cost':
                $data = $request->validate(['caps' => ['required', 'array'], 'caps.*' => ['nullable', 'numeric', 'min:0', 'max:10000000'], 'approve' => ['accepted']], ['approve.accepted' => 'Confirm you approve pass-through costs up to the caps entered.']);
                $caps = collect($data['caps'])->map(fn ($v) => round((float) $v, 2))->all();
                $e->update(['verification' => array_merge($e->verification ?? [], ['caps' => $caps, 'approved_external' => array_sum($caps), 'approved_at' => now()->toDateString()])]);
                EngagementFlow::log($e, 'client', 'External costs approved (G9)', null, null, 'Caps total R '.number_format(array_sum($caps), 2));

                return redirect("{$base}/verification/progress")->with('success', 'External cost caps approved. Verification can start.');

            case 'consent':
                $request->validate(['share' => ['accepted'], 'verified' => ['accepted']], ['share.accepted' => 'Confirm TBCA may share your teaser.', 'verified.accepted' => 'Confirm the counterparty check.']);
                $intro = $e->introduction ?? Introduction::create([
                    'reference' => Refs::dated('INT'), 'engagement_id' => $e->id, 'project_name' => $e->title,
                    'sharing' => [['key' => 'name', 'label' => 'Name and organisation', 'share' => true], ['key' => 'teaser', 'label' => 'Project teaser', 'share' => true], ['key' => 'ticket', 'label' => 'Ticket band', 'share' => true], ['key' => 'contact', 'label' => 'Contact details (after both parties accept)', 'share' => false]],
                    'status' => 'awaiting_consent', 'activity' => [],
                ]);
                $intro->update(['client_consented_at' => $intro->client_consented_at ?? now(), 'consent_name' => $request->user()->name, 'status' => $intro->status === 'awaiting_consent' ? 'awaiting_counterparty' : $intro->status,
                    'activity' => array_merge($intro->activity ?? [], [['who' => 'TBCA', 'text' => 'Introduction requested and counterparty notified.', 'at' => now()->format('j M Y, H:i')]])]);
                EngagementFlow::log($e, 'client', 'Introduction consent given (G10)');

                return redirect("{$base}/introductions/room")->with('success', 'Introduction request sent. Contact details stay private until both parties accept.');

            case 'intro-message':
                $data = $request->validate(['message' => ['required', 'string', 'max:1000']]);
                $intro = $e->introduction;
                abort_unless($intro, 404);
                $intro->update(['activity' => array_merge($intro->activity ?? [], [['who' => $request->user()->name, 'text' => $data['message'], 'at' => now()->format('j M Y, H:i')]])]);

                return back()->with('success', 'Message posted to the introduction room.');

            case 'acceptance':
                $data = $request->validate(['received' => ['accepted'], 'comments' => ['nullable', 'string', 'max:1000']], ['received.accepted' => 'Confirm all deliverables were received and reviewed.']);
                if ($e->status !== 'delivered') {
                    return back()->with('error', 'Delivery acceptance opens once your advisor marks the deliverables as delivered.');
                }
                EngagementFlow::transition($e, 'accepted', 'client', 'Deliverables accepted; acceptance certificate issued (AAB-EMB-236).'.($data['comments'] ? ' Comments: '.$data['comments'] : ''), ['stage' => 'Final Balance']);
                $balance = (int) round($e->feeExVat() - $e->depositExVat());
                if ($balance <= 0) {
                    return redirect("{$base}/ledger")->with('success', 'Deliverables accepted.');
                }
                $order = Checkout::createOrder(
                    [['item_type' => 'aiim-balance', 'item_code' => 'AIIM-PAY-S14-001', 'name' => "Final balance — {$e->title}", 'unit_zar' => $balance]],
                    $request->user(), 'aiim', ['title' => 'AIIM engagement balance', 'aiim' => ['kind' => 'balance', 'engagement' => $e->reference, 'label' => $e->title]],
                );
                $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);

                return redirect()->route('checkout.show', $order)->with('success', 'Deliverables accepted. Pay the final balance to close the mandate.');

            case 'change':
                $data = $request->validate(['what' => ['required', 'string', 'min:5', 'max:1000'], 'service' => ['required', Rule::in(self::SCOPE_SERVICES)], 'approve' => ['accepted']], ['approve.accepted' => 'Confirm you approve the revised fee and timeline.']);
                $svc = P::svc($data['service']);
                if (! $svc || ! $svc['price']) {
                    return back()->with('error', 'That service is not in the app catalogue yet. Ask your advisor to quote it.');
                }
                $case = CaseFile::create(['reference' => Refs::make('CHG'), 'engagement_id' => $e->id, 'user_id' => $request->user()->id, 'type' => 'scope-change', 'status' => 'approved_awaiting_payment',
                    'payload' => ['what' => $data['what'], 'service' => $svc['code'], 'serviceName' => $svc['name']], 'amount_zar' => $svc['price']]);
                EngagementFlow::log($e, 'client', 'Scope change approved (AAB-EMB-235)', null, null, "{$case->reference}: {$data['what']}");
                $order = Checkout::createOrder([['item_type' => 'sprint', 'item_code' => $svc['code'], 'name' => "Scope change — {$svc['name']}", 'variant' => $svc['tier'], 'unit_zar' => $svc['price']]],
                    $request->user(), 'aiim', ['title' => 'AIIM scope change', 'aiim' => ['kind' => 'scope-change', 'case' => $case->reference, 'engagement' => $e->reference]]);
                $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);

                return redirect()->route('checkout.show', $order)->with('success', "Scope change {$case->reference} approved. Pay the revised fee to add it to the mandate.");

            default:
                abort_unless(isset(self::CASES[$action]), 404);
                [$type, $prefix, $label] = self::CASES[$action];
                $data = $request->validate([
                    'order' => ['nullable', 'string', 'max:120'],
                    'reason' => [$action === 'pause' || $action === 'restart' ? 'nullable' : 'required', 'string', 'max:200'],
                    'details' => [in_array($action, ['refund', 'dispute'], true) ? 'required' : 'nullable', 'string', 'max:2000'],
                    'date' => [in_array($action, ['pause', 'restart'], true) ? 'required' : 'nullable', 'date', 'after_or_equal:today'],
                    'flag' => [$action === 'cancel' ? 'accepted' : 'nullable'],
                ], ['flag.accepted' => 'Confirm you understand work completed to date is billable.', 'date.required' => 'Pick a date.']);
                $case = CaseFile::create(['reference' => Refs::make($prefix), 'engagement_id' => $e->id, 'user_id' => $request->user()->id, 'type' => $type, 'status' => 'submitted',
                    'payload' => collect($data)->except('flag')->all() + ['flag' => (bool) ($data['flag'] ?? false)]]);
                EngagementFlow::log($e, 'client', "{$label} submitted", null, null, "{$case->reference}: ".($data['reason'] ?? '').' '.($data['details'] ?? ''));

                return redirect("{$base}/ledger")->with('success', "{$label} {$case->reference} submitted. We acknowledge it within 1 business day.");
        }
    }

    /* ------------------------------------------------------------ helpers */

    protected function find(Request $request, string $ref): Engagement
    {
        $e = Engagement::query()->where('reference', $ref)->orWhere('mandate_reference', $ref)->with('advisor')->firstOrFail();
        abort_unless($e->user_id === $request->user()->id || $request->user()->isAdmin(), 403);

        return $e;
    }

    private function step(Engagement $e, string $to, string $note, array $attrs, string $redirect): RedirectResponse
    {
        try {
            EngagementFlow::transition($e, $to, 'client', $note, $attrs);
        } catch (DomainException $ex) {
            return back()->with('error', $ex->getMessage());
        }

        return redirect($redirect);
    }

    /** Shared engagement props for every staged screen. Quote items carry their embedded-service code when quoted from the catalogue. */
    public static function props(Engagement $e, bool $full = true): array
    {
        $u = $e->user;
        $base = [
            'reference' => $e->reference, 'mandate' => $e->mandate_reference, 'type' => $e->type, 'title' => $e->title,
            'status' => $e->status, 'statusLabel' => EngagementFlow::label($e->status), 'stage' => $e->stage, 'progress' => $e->progress,
            'journey' => EngagementFlow::JOURNEY, 'journeyIndex' => EngagementFlow::journeyIndex($e), 'next' => EngagementFlow::nextAction($e),
            'created' => $e->created_at->format('j M Y'), 'start' => $e->deposit_paid_at?->format('j M Y'), 'end' => $e->end_date?->format('j M Y'), 'originalEnd' => $e->original_end_date?->format('j M Y'),
            'fee' => $e->feeExVat(), 'feeTotal' => $e->feeInclVat(), 'deposit' => $e->depositExVat(), 'depositPaid' => (bool) $e->deposit_paid_at, 'balancePaid' => (bool) $e->balance_paid_at,
            'advisor' => $e->advisor?->only(['slug', 'name', 'title', 'years', 'strengths', 'email', 'phone']),
            'client' => ['name' => $u->name, 'company' => $u->company, 'email' => $u->email, 'phone' => $u->phone],
        ];
        if (! $full) {
            return $base;
        }

        return $base + [
            'request' => $e->request ?? [],
            'sectorNames' => Sector::query()->whereIn('slug', $e->request['sectors'] ?? [])->pluck('name'),
            'provinceNames' => Province::query()->whereIn('slug', $e->request['provinces'] ?? [])->pluck('name'),
            'countryNames' => Country::query()->whereIn('slug', $e->request['countries'] ?? [])->orderBy('name')->pluck('name'),
            'booking' => $e->booking_reference, 'discoveryAt' => $e->discovery_at?->format('D, j M Y, H:i'),
            'outcome' => $e->outcome, 'quote' => $e->quote,
            'quoteAcceptedAt' => $e->quote_accepted_at?->format('j M Y, H:i'), 'letterAcceptedAt' => $e->letter_accepted_at?->format('j M Y, H:i'),
            'signature' => $e->signed_at ? ['name' => $e->signature_name, 'title' => $e->signature_title, 'at' => $e->signed_at->format('j M Y, H:i'), 'hash' => substr((string) $e->signature_hash, 0, 16)] : null,
            'workplan' => $e->workplan ?? [], 'deliverables' => $e->deliverables ?? [],
            'events' => $e->events()->take(12)->get()->map(fn ($ev) => ['actor' => $ev->actor, 'action' => $ev->action, 'note' => $ev->note, 'at' => $ev->created_at->format('j M Y, H:i')]),
            'depositOrder' => $e->depositOrder?->reference,
        ];
    }

    public static function workplanFor(): array
    {
        return Fulfilment::workplan(now());
    }
}
