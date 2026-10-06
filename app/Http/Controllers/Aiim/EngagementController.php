<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Advisor;
use App\Models\Aiim\Country;
use App\Models\Aiim\Engagement;
use App\Models\Aiim\Province;
use App\Models\Aiim\Sector;
use App\Models\Booking;
use App\Support\Aiim\EngagementFlow;
use App\Support\Aiim\Fulfilment;
use App\Support\Aiim\Refs;
use App\Support\Platform\Checkout;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

/**
 * Stages 4–6: custom intelligence and advisor requests, discovery booking (via the
 * shared POST /bookings), discovery outcome, formal quotation, engagement letter,
 * typed electronic signature and deposit payment, then the mandate workspace.
 */
class EngagementController extends AiimController
{
    public const CATEGORIES = ['Market Entry Intelligence', 'Opportunity Scan', 'Sector Deep Dive', 'Investor & Funder Mapping', 'Regulatory & Policy Brief', 'Risk Assessment', 'Custom Dataset or Dashboard'];

    public const AREAS = ['Investment strategy & structuring', 'Market entry & expansion', 'Project due diligence support', 'Regulatory & policy navigation', 'Fundraising & capital access', 'Stakeholder & partner introductions', 'Transaction support', 'Other (please specify)'];

    public const DEPTHS = ['standard' => ['Standard', 'High-level overview with key insights', '2 – 3 business days'], 'advanced' => ['Advanced', 'Detailed analysis with data and insights', '5 – 7 business days'], 'expert' => ['Expert', 'In-depth research with expert validation', '7 – 10 business days']];

    /* ------------------------------------------------------ request wizards */

    public function customRequest(Request $request): Response|RedirectResponse
    {
        return $this->wizard($request, 'custom-intelligence');
    }

    public function advisorRequest(Request $request): Response|RedirectResponse
    {
        return $this->wizard($request, 'advisory');
    }

    private function wizard(Request $request, string $type): Response|RedirectResponse
    {
        $e = $request->query('ref') ? $this->find($request, $request->query('ref')) : null;
        abort_if($e && $e->type !== $type, 404);
        if ($e && $e->status !== 'draft') {
            // Already submitted: the wizard is read-only from here, continue in the engagement.
            return redirect(EngagementFlow::nextAction($e)['url'] ?? "/aiim/workspace/engagements/{$e->reference}");
        }
        $prefill = Country::query()->where('slug', (string) $request->query('country'))->value('slug');

        return $this->render($request, 'Aiim/Engagement/RequestWizard', [
            'type' => $type,
            'engagement' => $e ? ['reference' => $e->reference, 'status' => $e->status, 'step' => $e->step, 'request' => $e->request ?? []] : null,
            // Never skip ahead of the last saved step; a fresh request always starts at step 1.
            'step' => max(1, min(5, (int) $request->query('step', $e?->step ?? 1), $e?->step ?? 1)),
            'prefill' => ['countries' => $prefill ? [$prefill] : []],
            'options' => [
                'categories' => self::CATEGORIES, 'areas' => self::AREAS,
                'depths' => collect(self::DEPTHS)->map(fn ($d, $k) => ['value' => $k, 'label' => $d[0], 'description' => $d[1], 'time' => $d[2]])->values(),
                'countries' => Country::options(),
                'provinces' => Province::query()->orderBy('rank')->get(['slug', 'name']),
                'sectors' => Sector::query()->orderBy('sort')->get(['slug', 'name']),
                'seniority' => ['Partner', 'Director', 'Senior Manager', 'Any'],
                'timelines' => ['Less than 1 month', '1–3 months', '3–6 months', '6+ months'],
                'engagementTypes' => ['Virtual advisory (online)', 'In-person meeting (in-country)', 'Ongoing advisory retainer'],
                'formats' => ['PDF report', 'PDF report plus advisory call', 'Dataset (Excel / CSV)', 'Interactive dashboard'],
            ],
        ], $type === 'advisory' ? 'Advisor Request' : 'Custom Intelligence Request');
    }

    /** Save one wizard step; step 5 submits the request (G7 review gate). */
    public function saveRequest(Request $request): RedirectResponse
    {
        $type = $request->validate(['type' => ['required', Rule::in(['custom-intelligence', 'advisory'])]])['type'];
        $step = (int) $request->input('step', 1);
        $e = $request->input('ref') ? $this->find($request, $request->input('ref')) : null;
        abort_if($e && $e->status !== 'draft', 409, 'This request has already been submitted.');

        $rules = $this->rules($type, $step);
        $data = $rules ? $request->validate($rules, ['terms.accepted' => 'Please confirm the information is accurate and accept the review terms.']) : [];

        if (! $e) {
            $e = Engagement::create([
                'reference' => Refs::make('ENG'), 'user_id' => $request->user()->id, 'type' => $type, 'status' => 'draft',
                'title' => $data['title'] ?? ($type === 'advisory' ? 'Advisor Request' : 'Custom Intelligence Request'), 'request' => [],
            ]);
            EngagementFlow::log($e, 'client', 'Draft created');
        }
        $req = array_merge($e->request ?? [], collect($data)->except('terms')->all());
        $title = $req['title'] ?? ($type === 'advisory' ? 'Advisory: '.collect($req['areas'] ?? [])->first() : $e->title);

        if ($step >= 5) {
            $e->update(['request' => $req, 'title' => $title ?: $e->title, 'step' => 5]);
            EngagementFlow::transition($e, 'submitted', 'client', 'Submitted for TBCA expert review (G7).', ['stage' => 'Expert Review']);

            return redirect("/aiim/workspace/engagements/{$e->reference}/discovery")->with('success', "Request {$e->reference} submitted. A TBCA expert will review it within 1 business day. Book your discovery session below.");
        }

        $next = $request->boolean('draft') ? $step : $step + 1;
        $e->update(['request' => $req, 'title' => $title ?: $e->title, 'step' => $next]);
        $base = $type === 'advisory' ? '/aiim/workspace/advisor-request' : '/aiim/custom-intelligence';

        return redirect("{$base}?ref={$e->reference}&step={$next}")->with('success', $request->boolean('draft') ? 'Draft saved.' : null);
    }

    private function rules(string $type, int $step): array
    {
        $sectors = ['sectors' => ['required', 'array', 'min:1'], 'sectors.*' => ['exists:aiim_sectors,slug']];
        if ($type === 'custom-intelligence') {
            return match ($step) {
                1 => ['title' => ['required', 'string', 'max:160'], 'detail' => ['required', 'string', 'min:20', 'max:2000'], 'category' => ['required', Rule::in(self::CATEGORIES)], 'subcategory' => ['nullable', 'string', 'max:80'], 'countries' => ['required', 'array', 'min:1'], 'countries.*' => ['exists:aiim_countries,slug'], 'provinces' => ['array'], 'provinces.*' => ['exists:aiim_provinces,slug'], 'depth' => ['required', Rule::in(array_keys(self::DEPTHS))]] + $sectors,
                2 => ['questions' => ['required', 'string', 'max:1000'], 'outputs' => ['required', 'array', 'min:1']],
                3 => ['background' => ['required', 'string', 'min:20', 'max:2000'], 'decision' => ['required', 'string', 'max:200']],
                4 => ['format' => ['required', 'string', 'max:80'], 'required_by' => ['nullable', 'date', 'after:today'], 'channel' => ['required', 'string', 'max:80']],
                default => ['terms' => ['accepted']],
            };
        }

        return match ($step) {
            1 => ['areas' => ['required', 'array', 'min:1'], 'areas.*' => [Rule::in(self::AREAS)], 'other' => ['nullable', 'required_if:areas.*,Other (please specify)', 'string', 'max:200'], 'summary' => ['required', 'string', 'min:20', 'max:2000']],
            2 => ['expertise' => ['required', 'array', 'min:1'], 'seniority' => ['nullable', 'string'], 'advisor' => ['nullable', 'exists:aiim_advisors,slug']] + $sectors,
            3 => ['background' => ['required', 'string', 'min:20', 'max:2000'], 'provinces' => ['array'], 'provinces.*' => ['exists:aiim_provinces,slug']],
            4 => ['engagement_type' => ['required', 'string', 'max:80'], 'timeline' => ['required', 'string', 'max:40'], 'start_date' => ['nullable', 'date', 'after_or_equal:today']],
            default => ['terms' => ['accepted']],
        };
    }

    /* ------------------------------------------------------------ discovery */

    public function discovery(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if (! in_array($e->status, ['submitted', 'under_review', 'discovery_completed'], true)) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? "/aiim/workspace/engagements/{$e->reference}");
        }

        return $this->render($request, 'Aiim/Engagement/Discovery', [
            'engagement' => $this->props($e),
            'advisors' => Advisor::query()->get()->map(fn ($a) => $a->only(['slug', 'name', 'title', 'years', 'strengths'])),
            'user' => $request->user()->only(['name', 'email', 'phone', 'company']),
        ], 'Discovery Booking');
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

    public function confirmed(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        $booking = Booking::query()->where('reference', $e->booking_reference)->first();
        if (! $booking) {
            return redirect("/aiim/workspace/engagements/{$e->reference}/discovery");
        }

        return $this->render($request, 'Aiim/Engagement/DiscoveryConfirmed', [
            'engagement' => $this->props($e),
            'booking' => ['reference' => $booking->reference, 'date' => $booking->starts_at->format('l, j F Y'), 'time' => $booking->starts_at->format('H:i').' – '.$booking->starts_at->copy()->addMinutes($booking->duration_minutes)->format('H:i').' SAST (GMT+2)', 'duration' => $booking->duration_minutes, 'channel' => $booking->channel, 'status' => $booking->status, 'topic' => $booking->topic, 'meta' => $booking->meta, 'ics' => $booking->starts_at->format('Ymd\THis')],
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

    public function outcome(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if (! $e->outcome) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace')->with('error', 'The discovery outcome will be available once your advisor has recorded it.');
        }

        return $this->render($request, 'Aiim/Engagement/Outcome', ['engagement' => $this->props($e)], 'Discovery Outcome');
    }

    /* ------------------------------------------------- quote, letter, sign */

    public function quote(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if (! $e->quote) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace')->with('error', 'Your formal quotation has not been issued yet.');
        }

        return $this->render($request, 'Aiim/Engagement/Quote', ['engagement' => $this->props($e)], 'Formal Quotation');
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

    public function letter(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if (! in_array($e->status, ['quote_accepted', 'letter_accepted', 'signed', 'in_progress', 'paused', 'delivered', 'accepted', 'closed'], true)) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace');
        }

        return $this->render($request, 'Aiim/Engagement/Letter', ['engagement' => $this->props($e), 'mode' => 'review'], 'Engagement Letter Review');
    }

    public function acceptLetter(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        if ($request->input('decision') === 'decline') {
            $request->validate(['reason' => ['required', 'string', 'max:500']]);

            return $this->step($e, 'declined', 'Letter declined: '.$request->input('reason'), [], '/aiim/workspace');
        }
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'You must accept the terms to proceed.']);

        return $this->step($e, 'letter_accepted', 'Engagement letter accepted.', ['letter_accepted_at' => now(), 'stage' => 'Electronic Signature'], "/aiim/workspace/engagements/{$e->reference}/sign");
    }

    public function sign(Request $request, string $ref): Response|RedirectResponse
    {
        $e = $this->find($request, $ref);
        if ($e->status !== 'letter_accepted' && ! $e->signed_at) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace');
        }

        return $this->render($request, 'Aiim/Engagement/Letter', ['engagement' => $this->props($e), 'mode' => 'sign'], 'Electronic Signature');
    }

    /** Typed-name electronic signature: the typed name must match the account holder. */
    public function applySignature(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        $data = $request->validate([
            'signature' => ['required', 'string', 'max:120'],
            'title' => ['required', 'string', 'max:120'],
            'agree' => ['accepted'],
        ], ['agree.accepted' => 'Please confirm you have read and agree to the engagement letter.']);
        $norm = fn ($s) => preg_replace('/\s+/', ' ', mb_strtolower(trim($s)));
        if ($norm($data['signature']) !== $norm($request->user()->name)) {
            return back()->withErrors(['signature' => 'Type your full name exactly as it appears on your account ('.$request->user()->name.').']);
        }

        return $this->step($e, 'signed', "Signed electronically by {$data['signature']} ({$data['title']}).", [
            'signature_name' => $data['signature'], 'signature_title' => $data['title'], 'signed_at' => now(), 'signature_ip' => $request->ip(),
            'signature_hash' => hash('sha256', $e->reference.'|'.json_encode($e->quote).'|'.$data['signature'].'|'.now()->toIso8601String()),
            'stage' => 'Deposit Payment',
        ], "/aiim/workspace/engagements/{$e->reference}/pay");
    }

    public function pay(Request $request, string $ref): Response|RedirectResponse
    {
        $this->sync($request);
        $e = $this->find($request, $ref);
        if ($e->status !== 'signed') {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace');
        }

        return $this->render($request, 'Aiim/Engagement/Deposit', ['engagement' => $this->props($e)], 'Deposit Payment');
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
            'engagements' => Engagement::query()->where('user_id', $request->user()->id)->latest('id')->get()->map(fn ($e) => $this->props($e, false)),
        ], 'My Mandates');
    }

    public function show(Request $request, string $ref): Response|RedirectResponse
    {
        $this->sync($request);
        $e = $this->find($request, $ref);
        if (! in_array($e->status, ['in_progress', 'paused', 'delivered', 'accepted', 'closed', 'cancelled'], true)) {
            return redirect(EngagementFlow::nextAction($e)['url'] ?? '/aiim/workspace');
        }

        return $this->render($request, 'Aiim/Engagement/Mandate', ['engagement' => $this->props($e)], 'Active Mandate');
    }

    public function message(Request $request, string $ref): RedirectResponse
    {
        $e = $this->find($request, $ref);
        $data = $request->validate(['message' => ['required', 'string', 'max:1000']]);
        EngagementFlow::log($e, 'client', 'Message to advisor', null, null, $data['message']);

        return back()->with('success', 'Message sent to '.($e->advisor?->name ?? 'your advisor').'.');
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

    /** Shared engagement props for every staged screen (header strip, snapshot, quote, letter). */
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
