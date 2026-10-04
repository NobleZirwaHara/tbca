<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Brief;
use App\Models\Marketplace\Proposal;
use App\Support\Marketplace\BriefService;
use App\Support\Marketplace\Matching;
use App\Support\Marketplace\Options;
use App\Support\Marketplace\Presenter;
use App\Support\Marketplace\Pricing;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Buyer brief journey: 5-step wizard -> Scope & Price -> Proposals -> Disclosure -> Checkout.
 * Submission is not an Authority to Proceed; nothing is charged until checkout.
 */
class BriefController extends Controller
{
    private const STEPS = ['Brief Details', 'Context & Goals', 'Scope & Requirements', 'Budget & Timing', 'Review & Submit'];

    private function own(Request $request, Brief $brief): void
    {
        abort_unless($brief->user_id === $request->user()->id || $request->user()->isAdmin(), 403);
    }

    /** Landing quick-brief: keeps answers in the session and continues in the wizard after sign-in. */
    public function start(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:120',
            'description' => 'nullable|string|max:1500',
            'industry' => 'nullable|string|max:80',
            'stage' => 'nullable|string|max:80',
            'complexity' => ['nullable', Rule::in(array_keys(Options::COMPLEXITY))],
            'category' => ['nullable', Rule::in(array_keys(Options::CATEGORIES))],
            'skills' => 'nullable|array',
            'skills.*' => 'string',
            'budget' => ['nullable', Rule::in(array_keys(Options::BUDGETS))],
            'deadline' => ['nullable', Rule::in(array_keys(Options::DEADLINES))],
        ]);
        $request->session()->put('mkt.quick_brief', array_filter($data));

        return redirect()->route('marketplace.brief', 1);
    }

    private function draft(Request $request): ?Brief
    {
        $id = $request->session()->get('mkt.brief_id');

        return $id ? Brief::where('id', $id)->where('user_id', $request->user()->id)->where('status', 'draft')->first() : null;
    }

    public function wizard(Request $request, int $step = 1): Response|RedirectResponse
    {
        $brief = $request->query('draft')
            ? Brief::where('reference', $request->query('draft'))->where('user_id', $request->user()->id)->where('status', 'draft')->first()
            : $this->draft($request);
        if ($brief) {
            $request->session()->put('mkt.brief_id', $brief->id);
        }

        $step = max(1, min(5, $step));
        $reached = $brief?->step ?? 1;
        if ($step > $reached) {
            return redirect()->route('marketplace.brief', $reached);
        }

        $data = [...$request->session()->get('mkt.quick_brief', []), ...($brief?->data ?? [])];

        return Inertia::render('Marketplace/BriefWizard', [
            'step' => $step,
            'steps' => self::STEPS,
            'reference' => $brief?->reference,
            'data' => $data,
            'options' => Options::forBrief(),
            'estimate' => isset($data['category']) ? Pricing::envelope($data['category'], $data['complexity'] ?? 'medium', $data['urgency'] ?? 'standard') : null,
        ]);
    }

    private function rules(int $step): array
    {
        return match ($step) {
            1 => [
                'title' => 'required|string|max:120',
                'description' => 'required|string|min:20|max:1000',
                'industry' => 'required|string|max:80',
                'country' => 'required|string|max:80',
                'intended_use' => 'required|string|max:80',
                'source' => 'nullable|string|max:80',
                'category' => ['required', Rule::in(array_keys(Options::CATEGORIES))],
                'profile' => 'nullable|string|max:80',
                'urgency' => ['required', Rule::in(array_keys(Options::URGENCY))],
                'budget' => ['required', Rule::in(array_keys(Options::BUDGETS))],
                'delivery_date' => 'required|date|after:today',
                'data_class' => ['required', Rule::in(array_keys(Options::DATA_CLASS))],
                'vdr' => ['required', Rule::in(array_keys(Options::VDR))],
                'constraints' => 'nullable|string|max:500',
                'files' => 'nullable|array',
                'files.*' => 'string|max:200',
            ],
            2 => [
                'outcome' => 'required|string|min:10|max:600',
                'stage' => 'required|string|max:80',
                'background' => 'nullable|string|max:1000',
                'stakeholders' => 'nullable|string|max:300',
            ],
            3 => [
                'scope' => 'required|string|min:10|max:1500',
                'deliverables' => 'required|string|min:5|max:800',
                'skills' => 'required|array|min:1',
                'skills.*' => ['string', Rule::in(Options::SKILLS)],
                'complexity' => ['required', Rule::in(array_keys(Options::COMPLEXITY))],
                'exclusions' => 'nullable|string|max:500',
            ],
            4 => [
                'deadline' => ['required', Rule::in(array_keys(Options::DEADLINES))],
                'procurement' => 'required|string|max:120',
                'authority' => 'required|string|max:120',
            ],
            5 => [
                'confirm_not_atp' => 'accepted',
                'confirm_accuracy' => 'accepted',
            ],
        };
    }

    public function saveStep(Request $request, int $step): RedirectResponse
    {
        $step = max(1, min(5, $step));
        $draftOnly = $request->boolean('save_draft');
        $data = $draftOnly ? $request->except(['save_draft']) : $request->validate($this->rules($step));

        $brief = $this->draft($request);
        if (! $brief) {
            abort_if($step !== 1, 422, 'Start your brief from step 1.');
            $user = $request->user();
            $brief = Brief::create([
                'reference' => BriefService::nextReference(),
                'user_id' => $user->id,
                'client_name' => $user->company ?: $user->name,
                'status' => 'draft',
                'step' => 1,
                'data' => [],
            ]);
            $request->session()->put('mkt.brief_id', $brief->id);
            $request->session()->forget('mkt.quick_brief');
        }

        unset($data['confirm_not_atp'], $data['confirm_accuracy']);
        $merged = [...($brief->data ?? []), ...$data];
        $brief->update([
            'data' => $merged,
            'title' => $merged['title'] ?? $brief->title,
            'category' => $merged['category'] ?? $brief->category,
            'step' => $draftOnly ? $brief->step : max($brief->step, min(5, $step + 1)),
        ]);

        if ($draftOnly) {
            return back()->with('success', "Draft {$brief->reference} saved. You can return to it from My Marketplace.");
        }

        if ($step < 5) {
            return redirect()->route('marketplace.brief', $step + 1);
        }

        BriefService::scope($brief);
        $request->session()->forget('mkt.brief_id');

        return redirect()->route('marketplace.briefs.review', $brief)
            ->with('success', "Brief {$brief->reference} submitted. Review the Methodology Brief and separated fees below.");
    }

    public function review(Request $request, Brief $brief): Response|RedirectResponse
    {
        $this->own($request, $brief);
        if ($brief->status === 'draft') {
            return redirect()->route('marketplace.brief', ['step' => $brief->step, 'draft' => $brief->reference]);
        }
        $brief->load('provider');

        return Inertia::render('Marketplace/BriefReview', [
            'brief' => Presenter::brief($brief),
            'proposalCount' => $brief->proposals()->whereIn('status', ['submitted', 'shortlisted', 'awarded'])->count(),
        ]);
    }

    /** Accept Scope and Price: requires floor PASS and an unchanged price version. */
    public function accept(Request $request, Brief $brief): RedirectResponse
    {
        $this->own($request, $brief);
        $data = $request->validate(['price_version' => 'required|string']);
        abort_unless(in_array($brief->status, ['awaiting_buyer_confirmation', 'clarification_requested'], true), 422, 'This scope is not awaiting your confirmation.');
        abort_unless(($brief->scope['floor']['status'] ?? 'FAIL') === 'PASS', 422, 'Acceptance is disabled while the floor check is unresolved.');

        if ($data['price_version'] !== ($brief->scope['price_version'] ?? '')) {
            return back()->with('error', 'The price version changed while you were reviewing. Please review the updated envelope.');
        }

        $scope = $brief->scope;
        $scope['accepted_at'] = now()->format('d M Y, H:i');
        $scope['accepted_version'] = $scope['price_version'];
        $brief->update(['status' => 'scope_accepted', 'scope' => $scope]);

        return redirect()->route($brief->provider_id ? 'marketplace.briefs.disclosure' : 'marketplace.briefs.proposals', $brief)
            ->with('success', 'Scope and price accepted. Ledgers remain separate; no work is authorised until payment.');
    }

    public function clarify(Request $request, Brief $brief): RedirectResponse
    {
        $this->own($request, $brief);
        $data = $request->validate(['message' => 'required|string|min:5|max:1000']);
        $scope = $brief->scope ?? [];
        $scope['clarifications'][] = ['at' => now()->format('d M Y, H:i'), 'message' => $data['message']];
        $brief->update(['scope' => $scope, 'status' => 'clarification_requested']);

        return back()->with('success', 'Clarification request sent to the TBCA Marketplace team.');
    }

    /** Proposal comparison: provider quotes received for the brief plus TBCA-matched providers. */
    public function proposals(Request $request, Brief $brief): Response
    {
        $this->own($request, $brief);
        $brief->load('provider');

        $proposals = $brief->proposals()->with('provider')->whereIn('status', ['submitted', 'shortlisted', 'awarded'])->get()
            ->sortByDesc('match_score')->values()
            ->map(fn (Proposal $p) => [
                'id' => $p->id, 'rate' => $p->rate_zar, 'days' => $p->days, 'match' => $p->match_score, 'note' => $p->note, 'status' => $p->status,
                'provider' => Presenter::provider($p->provider),
                'withinCap' => $p->rate_zar <= (int) ($brief->scope['ledgers']['c'] ?? 0) || ($brief->scope['ledgers']['c_state'] ?? '') === 'actual',
            ]);

        return Inertia::render('Marketplace/BriefProposals', [
            'brief' => Presenter::brief($brief),
            'proposals' => $proposals,
            'matches' => Matching::forBrief($brief, 3)->map(fn ($m) => [
                'provider' => Presenter::provider($m['provider']), 'score' => $m['score'], 'cost' => $m['cost'], 'days' => $m['days'], 'available' => $m['available'],
            ])->values(),
        ]);
    }

    public function award(Request $request, Brief $brief, Proposal $proposal): RedirectResponse
    {
        $this->own($request, $brief);
        abort_unless($proposal->brief_id === $brief->id, 404);
        abort_unless(in_array($brief->status, ['scope_accepted', 'awaiting_buyer_confirmation'], true), 422, 'A provider can only be selected before checkout.');
        abort_unless($proposal->provider->isRoutable(), 422, 'This provider is not currently routable.');

        $reopened = BriefService::award($brief, $proposal);

        if ($reopened) {
            return redirect()->route('marketplace.briefs.review', $brief)
                ->with('error', 'The selected provider\'s actual cost exceeds the Ledger C cap. A new price version was issued – please re-confirm scope and price.');
        }

        return redirect()->route('marketplace.briefs.disclosure', $brief)->with('success', "{$proposal->provider->name} selected. Review the third-party disclosure.");
    }

    /** "Let TBCA assign": the top TBCA match submits at its standard rate and is awarded. */
    public function assignMatch(Request $request, Brief $brief): RedirectResponse
    {
        $this->own($request, $brief);
        $data = $request->validate(['provider' => 'required|exists:mkt_providers,slug']);
        $match = Matching::forBrief($brief, 10)->first(fn ($m) => $m['provider']->slug === $data['provider']);
        abort_unless($match, 422, 'This provider is not an eligible match for the brief.');

        $proposal = Proposal::updateOrCreate(
            ['brief_id' => $brief->id, 'provider_id' => $match['provider']->id],
            ['rate_zar' => min($match['cost'], (int) ($brief->scope['ledgers']['c'] ?? $match['cost'])), 'days' => $match['days'], 'match_score' => $match['score'], 'note' => 'TBCA-matched provider at the capped Ledger C rate.', 'status' => 'submitted'],
        );

        return $this->award($request, $brief, $proposal);
    }

    public function disclosure(Request $request, Brief $brief): Response|RedirectResponse
    {
        $this->own($request, $brief);
        if (! in_array($brief->status, ['scope_accepted', 'disclosure_complete', 'awaiting_payment', 'assigned'], true)) {
            return redirect()->route('marketplace.briefs.review', $brief);
        }
        $brief->load('provider');

        return Inertia::render('Marketplace/BriefDisclosure', ['brief' => Presenter::brief($brief)]);
    }

    public function acknowledge(Request $request, Brief $brief): RedirectResponse
    {
        $this->own($request, $brief);
        abort_unless($brief->status === 'scope_accepted', 422, 'Disclosure can only be acknowledged after the scope is accepted.');
        abort_unless($brief->provider_id, 422, 'Select a provider before acknowledging the third-party disclosure.');

        $data = $request->validate([
            'procurement' => 'required|string|max:120',
            'ack_independent' => 'accepted',
            'ack_fees' => 'accepted',
            'ack_accountable' => 'accepted',
            'ack_payment' => 'accepted',
            'ack_terms' => 'accepted',
        ]);

        $brief->update([
            'status' => 'disclosure_complete',
            'disclosure' => ['procurement' => $data['procurement'], 'acknowledged_at' => now()->format('d M Y, H:i'), 'by' => $request->user()->name],
        ]);

        return redirect()->route('marketplace.briefs.checkout', $brief);
    }

    public function checkout(Request $request, Brief $brief): Response|RedirectResponse
    {
        $this->own($request, $brief);
        if (! in_array($brief->status, ['disclosure_complete', 'awaiting_payment'], true)) {
            return redirect()->route('marketplace.briefs.disclosure', $brief);
        }
        $brief->load('provider', 'order');

        $l = $brief->scope['ledgers'];
        $lines = collect(['a' => ['A', 'TBCA Professional Fees', 'Professional services, methodology, QA & governance', 'Due Now'], 'b' => ['B', 'Platform, QA & Administration Fees', 'Marketplace platform, QA oversight & administration', 'Due Now'], 'c' => ['C', 'External / Third-Party Costs', 'Provider fees, data, travel, tools & disbursements', 'Advance Due']])
            ->map(fn ($meta, $k) => ['ledger' => $meta[0], 'title' => $meta[1], 'body' => $meta[2], 'status' => $meta[3], ...Pricing::vat((float) $l[$k])])->values();

        return Inertia::render('Marketplace/BriefCheckout', [
            'brief' => Presenter::brief($brief),
            'lines' => $lines,
            'order' => $brief->order ? ['reference' => $brief->order->reference, 'status' => $brief->order->status] : null,
            'billing' => ['name' => $request->user()->company ?: $request->user()->name, 'email' => $request->user()->email],
        ]);
    }

    /** Authorise payment: one order carrying three separately-identified ledger lines. */
    public function pay(Request $request, Brief $brief): RedirectResponse
    {
        $this->own($request, $brief);
        abort_unless(in_array($brief->status, ['disclosure_complete', 'awaiting_payment'], true), 422, 'Payment prerequisites are not satisfied.');
        $data = $request->validate([
            'billing_name' => 'required|string|max:120',
            'billing_email' => 'required|email',
            'vat_number' => 'nullable|string|max:30',
            'rail' => 'required|in:card,eft,link',
            'accept_terms' => 'accepted',
        ]);

        if ($brief->order && $brief->order->status === 'awaiting_payment') {
            return redirect()->route('checkout.show', $brief->order);
        }

        $l = $brief->scope['ledgers'];
        $order = Checkout::createOrder([
            ['item_type' => 'marketplace-ledger', 'item_code' => $brief->reference.'-A', 'name' => 'Ledger A – TBCA Professional Fees', 'unit_zar' => (int) $l['a'], 'meta' => ['ledger' => 'A']],
            ['item_type' => 'marketplace-ledger', 'item_code' => $brief->reference.'-B', 'name' => 'Ledger B – Platform, QA & Administration Fees', 'unit_zar' => (int) $l['b'], 'meta' => ['ledger' => 'B']],
            ['item_type' => 'marketplace-ledger', 'item_code' => $brief->reference.'-C', 'name' => 'Ledger C – External / Third-Party Costs (advance held for provider)', 'unit_zar' => (int) $l['c'], 'meta' => ['ledger' => 'C']],
        ], $request->user(), 'marketplace', [
            'return_url' => route('marketplace.briefs.confirm', $brief, absolute: false),
            'title' => 'Marketplace brief '.$brief->reference,
            'brief' => $brief->reference,
            'billing' => $data,
        ]);

        $brief->update(['order_id' => $order->id, 'status' => 'awaiting_payment']);

        return redirect()->route('checkout.show', $order);
    }

    /** Return URL after payment: creates the engagement and shows the assignment notification. */
    public function confirm(Request $request, Brief $brief): RedirectResponse
    {
        $this->own($request, $brief);
        $engagement = BriefService::syncPayment($brief->load('order', 'provider', 'engagement'));

        if (! $engagement) {
            return redirect()->route('marketplace.briefs.checkout', $brief)->with('error', 'Payment has not cleared yet. Work starts only after payment authorisation.');
        }

        return redirect()->route('marketplace.engagements.assignment', $engagement)->with('success', 'Payment received – your provider has been assigned.');
    }
}
