<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\PartnerRequest;
use App\Support\Marketplace\Content;
use App\Support\Marketplace\Options;
use App\Support\Marketplace\PartnerService;
use App\Support\Marketplace\Presenter;
use App\Support\Marketplace\Workflow;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Client-side Partner Services matter journey (PS intake -> PS-013 -> payment -> delivery). */
class PartnerRequestController extends Controller
{
    private function own(Request $request, PartnerRequest $r): void
    {
        abort_unless($r->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
        $r->load('partner', 'listing', 'order');
        PartnerService::syncPayment($r);
    }

    private function page(string $component, PartnerRequest $r, array $extra = []): Response
    {
        return Inertia::render('Marketplace/Partner/Request/'.$component, [
            'request' => Presenter::partnerRequest($r->fresh(['partner', 'listing', 'order'])),
            'journey' => Workflow::PS_JOURNEY,
            ...$extra,
        ]);
    }

    /** Redirects to the page that matches the matter's current stage, unless it already is. */
    private function guard(PartnerRequest $r, array $pages): ?RedirectResponse
    {
        $page = Workflow::PS_STAGE_PAGE[$r->stage] ?? 'resolution';

        return in_array($page, $pages, true) ? null : redirect()->route('partner-services.requests.show', $r);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Marketplace/Partner/Request/Index', [
            'requests' => PartnerRequest::with('partner')->where('user_id', $request->user()->id)->latest()->get()->map(fn ($r) => Presenter::partnerRequest($r)),
        ]);
    }

    public function show(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        $page = Workflow::PS_STAGE_PAGE[$partnerRequest->stage] ?? 'resolution';
        $routes = ['resolution' => 'resolution', 'conflict' => 'conflict', 'proposal' => 'proposal', 'scope-quote' => 'quote', 'engagement-instrument' => 'instrument', 'responsibility' => 'responsibility', 'escalated' => 'escalated', 'status' => 'status'];

        return redirect()->route('partner-services.requests.'.$routes[$page], $partnerRequest);
    }

    public function intake(Request $request): Response
    {
        $listing = $request->query('service') ? Listing::where('slug', $request->query('service'))->where('kind', 'partner')->first() : null;

        return Inertia::render('Marketplace/Partner/Request/Intake', [
            'listing' => $listing ? Presenter::listing($listing) : null,
            'draft' => $request->session()->get('mkt.ps_intake', []),
            'steps' => Workflow::PS_INTAKE_STEPS,
            'options' => [
                'categories' => Options::select(Content::PS_CATEGORIES),
                'outcomes' => Options::select(Options::PS_OUTCOMES),
                'timelines' => Options::select(Options::PS_TIMELINES),
                'countries' => Options::select(Options::COUNTRIES),
                'professions' => Options::select(Options::PROFESSIONS),
                'outputs' => Options::select(Options::PS_OUTPUTS),
                'uses' => Options::select(Options::INTENDED_USE),
                'roles' => Options::select(Options::PS_ROLES),
                'actFor' => Options::select(Options::PS_ACT_FOR),
            ],
        ]);
    }

    public function storeIntake(Request $request): RedirectResponse
    {
        if ($request->boolean('save_draft')) {
            $request->session()->put('mkt.ps_intake', $request->except('save_draft'));

            return back()->with('success', 'Draft saved. Nothing has been submitted yet.');
        }

        $data = $request->validate([
            'category' => ['required', Rule::in(array_keys(Content::PS_CATEGORIES))],
            'description' => 'required|string|min:20|max:1000',
            'outcome' => 'required|string|max:120',
            'timeline' => 'required|string|max:80',
            'country' => ['required', Rule::in(Options::COUNTRIES)],
            'jurisdiction' => ['required', Rule::in(Options::COUNTRIES)],
            'profession' => ['required', Rule::in(Options::PROFESSIONS)],
            'specialisation' => 'nullable|string|max:120',
            'output' => 'required|string|max:120',
            'intended_use' => 'required|string|max:120',
            'role' => 'required|string|max:80',
            'act_for' => 'required|string|max:80',
            'organisation' => 'nullable|string|max:150',
            'matter_reference' => 'nullable|string|max:60',
            'parties' => 'nullable|string|max:500',
            'service' => 'nullable|string|exists:mkt_listings,slug',
        ]);

        $user = $request->user();
        $listing = ! empty($data['service']) ? Listing::where('slug', $data['service'])->first() : null;
        $r = PartnerRequest::create([
            'reference' => PartnerService::nextReference(),
            'user_id' => $user->id,
            'listing_id' => $listing?->id,
            'client_name' => $data['organisation'] ?: ($user->company ?: $user->name),
            'title' => $listing?->title ?? (Content::PS_CATEGORIES[$data['category']].' – '.$data['profession']),
            'stage' => 'intake',
            'intake' => [...$data, 'client_country' => 'South Africa', 'matter_id' => 'PS-REQ-2026-'.str_pad((string) random_int(100, 99999), 5, '0', STR_PAD_LEFT)],
            'meta' => ['history' => [['at' => now()->format('d M Y, H:i'), 'title' => 'Request received', 'body' => 'Intake submitted.']]],
        ]);
        PartnerService::resolve($r);
        $request->session()->forget('mkt.ps_intake');

        return redirect()->route('partner-services.requests.resolution', $r);
    }

    public function resolution(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $this->own($request, $partnerRequest);

        return $this->guard($partnerRequest, ['resolution']) ?? $this->page('Resolution', $partnerRequest);
    }

    public function sendForConflict(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        abort_unless($partnerRequest->stage === 'resolution', 422, 'This matter cannot be sent for conflict check in its current state.');
        PartnerService::sendForConflict($partnerRequest);

        return redirect()->route('partner-services.requests.conflict', $partnerRequest);
    }

    public function conflict(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $this->own($request, $partnerRequest);

        return $this->guard($partnerRequest, ['conflict']) ?? $this->page('Conflict', $partnerRequest);
    }

    /** After a conflict: propose another professional, pause, or close (PS-009). Paused matters may resume. */
    public function nextStep(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        $data = $request->validate(['choice' => 'required|in:another,pause,close,resume']);
        $r = $partnerRequest;

        switch ($data['choice']) {
            case 'another':
                abort_unless(in_array($r->stage, ['conflict_identified', 'no_partner_available', 'paused'], true), 422);
                $r->update(['stage' => 'resolution']);
                PartnerService::sendForConflict($r->fresh());
                $msg = 'A new conflict check has started with an alternative professional. No fees are charged for conflict checks.';
                break;
            case 'pause':
                abort_unless(in_array($r->stage, ['conflict_identified', 'no_partner_available'], true), 422);
                PartnerService::history($r, 'Request paused', 'Paused by client.');
                $r->stage = 'paused';
                $r->save();
                $msg = 'Request paused. You can resume it at any time.';
                break;
            case 'resume':
                abort_unless($r->stage === 'paused', 422);
                $r->update(['stage' => 'conflict_identified']);
                $msg = 'Request resumed.';
                break;
            default:
                abort_if(in_array($r->stage, ['delivery', 'qa_review', 'completed'], true), 422, 'Engaged matters cannot be closed here.');
                PartnerService::history($r, 'Request closed', 'Closed by client.');
                $r->stage = 'closed';
                $r->save();
                $msg = 'Request closed. You may submit a new request in the future.';
        }

        return redirect()->route('partner-services.requests.show', $r)->with('success', $msg);
    }

    public function proposal(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $this->own($request, $partnerRequest);

        return $this->guard($partnerRequest, ['proposal']) ?? $this->page('Proposal', $partnerRequest);
    }

    public function decideProposal(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        abort_unless($partnerRequest->stage === 'proposal', 422);
        $data = $request->validate(['decision' => 'required|in:accept,decline,alternative', 'reason' => 'nullable|string|max:500']);
        $r = $partnerRequest;

        if ($data['decision'] === 'accept') {
            PartnerService::history($r, 'Proposal accepted', 'Proceeding to scope & quote.');
            $r->stage = 'scope_quote';
            $r->save();

            return redirect()->route('partner-services.requests.quote', $r);
        }

        $meta = $r->meta ?? [];
        $meta['excluded_partners'] = [...($meta['excluded_partners'] ?? []), $r->partner_id];
        unset($meta['proposal']);
        $r->meta = $meta;
        $r->quote = null;
        PartnerService::history($r, $data['decision'] === 'decline' ? 'Proposal declined' : 'Alternative requested', $data['reason'] ?? '');
        $r->stage = 'resolution';
        $r->save();
        PartnerService::sendForConflict($r->fresh());

        return redirect()->route('partner-services.requests.show', $r)->with('success', 'We are sourcing an alternative verified professional. A new conflict check has started.');
    }

    public function scopeQuote(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $this->own($request, $partnerRequest);

        return $this->guard($partnerRequest, ['scope-quote']) ?? $this->page('ScopeQuote', $partnerRequest);
    }

    public function acceptQuote(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        $r = $partnerRequest;
        abort_unless($r->stage === 'scope_quote', 422);
        $data = $request->validate(['action' => 'required|in:accept,clarify', 'message' => 'required_if:action,clarify|nullable|string|max:1000']);

        if ($data['action'] === 'clarify') {
            PartnerService::history($r, 'Clarification requested', $data['message']);
            $r->save();

            return back()->with('success', 'Clarification request sent. Your quote remains open for its validity period.');
        }

        if (($r->quote['floor_status'] ?? 'PASS') !== 'PASS') {
            PartnerService::blockBelowFloor($r);

            return back()->with('error', 'This quote is below the current Partner Services floor and is blocked. TBCA will remediate the quote before you can proceed.');
        }

        PartnerService::history($r, 'Scope & quote accepted', 'Indicative total R'.number_format($r->quote['total']));
        $r->stage = 'instrument';
        $r->save();

        return redirect()->route('partner-services.requests.instrument', $r);
    }

    public function instrument(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $this->own($request, $partnerRequest);

        return $this->guard($partnerRequest, ['engagement-instrument']) ?? $this->page('Instrument', $partnerRequest, [
            'capacities' => ['Chief Executive Officer', 'Chief Financial Officer', 'Director', 'Authorised Signatory'],
            'user' => ['name' => $request->user()->name, 'email' => $request->user()->email],
        ]);
    }

    public function sign(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        $r = $partnerRequest;
        abort_unless($r->stage === 'instrument', 422);
        $data = $request->validate([
            'full_name' => 'required|string|max:120',
            'capacity' => 'required|string|max:80',
            'email' => 'required|email',
            'date' => 'required|date',
            'signature' => 'required|string|min:2|max:120',
        ]);
        $meta = $r->meta ?? [];
        $meta['signature'] = [...$data, 'signed_at' => now()->format('d M Y, H:i'), 'ip' => $request->ip()];
        $r->meta = $meta;
        PartnerService::history($r, 'Engagement instrument signed', 'Signed by '.$data['full_name'].' ('.$data['capacity'].')');
        $r->stage = 'responsibility';
        $r->save();

        return redirect()->route('partner-services.requests.responsibility', $r)->with('success', 'Engagement instrument executed and locked.');
    }

    public function responsibility(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $this->own($request, $partnerRequest);

        return $this->guard($partnerRequest, ['responsibility']) ?? $this->page('Responsibility', $partnerRequest, ['matrix' => Content::responsibilityMatrix()]);
    }

    /** Confirming the responsibility statement opens payment (all gates passed). */
    public function confirmResponsibility(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        $r = $partnerRequest;
        abort_unless(in_array($r->stage, ['responsibility', 'payment'], true), 422);
        abort_unless(in_array($r->conflict_state, ['CLEAR', 'CLEAR_WITH_CONDITIONS'], true), 422, 'No payment before conflict clearance.');

        if ($r->stage === 'payment' && $r->order && $r->order->status === 'awaiting_payment') {
            return redirect()->route('checkout.show', $r->order);
        }

        $request->validate(['confirm' => 'accepted']);
        $order = Checkout::createOrder(PartnerService::orderLines($r), $request->user(), 'marketplace', [
            'return_url' => route('partner-services.requests.status', $r, absolute: false),
            'title' => 'Partner Services '.$r->reference,
            'partner_request' => $r->reference,
        ]);
        $meta = $r->meta ?? [];
        $meta['responsibility_confirmed_at'] = now()->format('d M Y, H:i');
        $r->meta = $meta;
        $r->order_id = $order->id;
        $r->stage = 'payment';
        $r->save();

        return redirect()->route('checkout.show', $order);
    }

    public function escalated(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $this->own($request, $partnerRequest);

        return $this->guard($partnerRequest, ['escalated']) ?? $this->page('Escalated', $partnerRequest);
    }

    public function continueEscalated(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        abort_unless($partnerRequest->stage === 'escalated', 422);
        PartnerService::resolve($partnerRequest);
        $fresh = $partnerRequest->fresh();
        if ($fresh->stage === 'resolution') {
            PartnerService::sendForConflict($fresh);
        }

        return redirect()->route('partner-services.requests.show', $partnerRequest);
    }

    public function status(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $this->own($request, $partnerRequest);
        if ($partnerRequest->stage === 'payment') {
            return redirect()->route('partner-services.requests.responsibility', $partnerRequest)->with('error', 'Payment has not cleared yet.');
        }

        return $this->guard($partnerRequest->fresh(), ['status']) ?? $this->page('Status', $partnerRequest);
    }

    public function signOff(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $this->own($request, $partnerRequest);
        abort_unless($partnerRequest->stage === 'qa_review', 422, 'Sign-off opens once the professional work has passed QA.');
        $request->validate(['confirm' => 'accepted']);
        PartnerService::settle($partnerRequest);

        return back()->with('success', 'Delivery signed off. The engagement is complete and settled.');
    }
}
