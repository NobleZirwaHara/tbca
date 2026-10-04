<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Brief;
use App\Models\Marketplace\Dispute;
use App\Models\Marketplace\Earning;
use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\Payout;
use App\Models\Marketplace\Proposal;
use App\Models\Marketplace\Provider;
use App\Support\Marketplace\Content;
use App\Support\Marketplace\EngagementService;
use App\Support\Marketplace\Matching;
use App\Support\Marketplace\Options;
use App\Support\Marketplace\Presenter;
use App\Support\Marketplace\Pricing;
use App\Support\Marketplace\ProviderContext;
use App\Support\Marketplace\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/** External provider portal (MP-SCR-017..025). */
class ProviderPortalController extends Controller
{
    private function provider(Request $request): Provider
    {
        return ProviderContext::require($request->user(), 'marketplace');
    }

    private function active(Provider $p): void
    {
        abort_unless($p->isRoutable(), 403, 'Opportunities open once your verification and agreement are complete and your provider status is Active.');
    }

    private function ownEngagement(Provider $p, Engagement $e): void
    {
        abort_unless($e->provider_id === $p->id, 403);
    }

    private function base(Provider $p): array
    {
        return [
            'provider' => Presenter::provider($p),
            'counts' => [
                'opportunities' => $this->openBriefs()->count(),
                'engagements' => $p->engagements()->whereNotIn('stage', ['closed', 'awaiting_payment'])->count(),
            ],
        ];
    }

    private function openBriefs()
    {
        return Brief::where('open_to_providers', true)->whereIn('status', ['awaiting_buyer_confirmation', 'scope_accepted', 'clarification_requested']);
    }

    /** MP-SCR-014 Provider home. */
    public function home(Request $request): Response
    {
        $p = $this->provider($request);
        $engagements = $p->engagements()->where('stage', '!=', 'awaiting_payment')->latest()->get();
        $month = Earning::where('provider_id', $p->id)->where('kind', 'billing')->whereBetween('occurred_on', [now()->startOfMonth(), now()->endOfMonth()])->sum('amount_zar');

        return Inertia::render('Marketplace/Provider/Home', [
            ...$this->base($p),
            'engagements' => $engagements->map(fn ($e) => Presenter::engagement($e)),
            'briefs' => $this->openBriefs()->latest()->limit(3)->get()->map(fn ($b) => [...Presenter::brief($b), 'match' => Matching::score($p, $b)]),
            'kpis' => [
                'active' => $engagements->whereNotIn('stage', ['closed'])->count(),
                'proposals' => $p->proposals()->whereIn('status', ['submitted', 'shortlisted'])->count(),
                'earnings' => (float) ($month ?: ($p->profile['month_earnings'] ?? 0)),
            ],
            'checklist' => $p->profile['checklist'] ?? [],
        ]);
    }

    /** MP-SCR-018 Provider dashboard (operations). */
    public function dashboard(Request $request): Response
    {
        $p = $this->provider($request);
        $engagements = $p->engagements()->with('deliverables')->where('stage', '!=', 'awaiting_payment')->latest()->get();
        $payouts = Payout::where('provider_id', $p->id)->get();

        return Inertia::render('Marketplace/Provider/Dashboard', [
            ...$this->base($p),
            'engagements' => $engagements->map(fn ($e) => [...Presenter::engagement($e), 'qaState' => $e->deliverables->sortByDesc('id')->first()?->status]),
            'opportunities' => $this->openBriefs()->latest()->limit(6)->get()->map(fn ($b) => [...Presenter::brief($b), 'match' => Matching::score($p, $b), 'saved' => in_array($b->reference, $p->profile['saved_briefs'] ?? [], true)]),
            'kpis' => [
                'available' => $this->openBriefs()->count(),
                'active' => $engagements->whereNotIn('stage', ['closed'])->count(),
                'awaitingQa' => $engagements->where('stage', 'in_qa')->count(),
                'corrections' => $engagements->where('stage', 'corrections')->count(),
                'payoutReady' => (float) $payouts->whereIn('status', ['ready', 'scheduled'])->sum('amount_zar'),
                'pending' => (float) $payouts->where('status', 'in_transit')->sum('amount_zar'),
                'held' => (float) $payouts->where('status', 'held')->sum('amount_zar'),
                'heldCount' => $payouts->where('status', 'held')->count(),
                'lastPaid' => $payouts->where('status', 'paid')->sortByDesc('paid_at')->first()?->paid_at?->format('d M Y'),
                'grievances' => Dispute::where('provider_id', $p->id)->whereIn('kind', ['grievance', 'appeal'])->whereNotIn('status', ['closed', 'withdrawn'])->count(),
            ],
        ]);
    }

    /** MP-SCR-019 Opportunity feed with server-side filters. */
    public function opportunities(Request $request): Response
    {
        $p = $this->provider($request);
        $filters = $request->only(['q', 'country', 'category', 'budget', 'view', 'sort']);
        $saved = $p->profile['saved_briefs'] ?? [];

        $briefs = $this->openBriefs()->latest()->get()
            ->filter(function (Brief $b) use ($filters, $saved) {
                $d = $b->data ?? [];
                if (($q = strtolower(trim((string) ($filters['q'] ?? '')))) && ! str_contains(strtolower($b->title.' '.($d['description'] ?? '').' '.($d['country'] ?? '').' '.($d['industry'] ?? '')), $q)) {
                    return false;
                }
                if (! empty($filters['country']) && ($d['country'] ?? '') !== $filters['country']) {
                    return false;
                }
                if (! empty($filters['category']) && $b->category !== $filters['category']) {
                    return false;
                }
                if (! empty($filters['budget']) && ($d['budget'] ?? '') !== $filters['budget']) {
                    return false;
                }

                return ($filters['view'] ?? '') !== 'saved' || in_array($b->reference, $saved, true);
            })
            ->map(fn (Brief $b) => [...Presenter::brief($b), 'match' => Matching::score($p, $b), 'saved' => in_array($b->reference, $saved, true), 'proposed' => $p->proposals()->where('brief_id', $b->id)->exists()]);

        if (($filters['view'] ?? '') === 'matched') {
            $briefs = $briefs->filter(fn ($b) => $b['match'] >= 70);
        }
        $briefs = match ($filters['sort'] ?? 'newest') {
            'match' => $briefs->sortByDesc('match'),
            'budget' => $briefs->sortByDesc(fn ($b) => Options::BUDGET_MAX[$b['data']['budget'] ?? ''] ?? 0),
            default => $briefs,
        };

        $all = $this->openBriefs()->get();

        return Inertia::render('Marketplace/Provider/Opportunities', [
            ...$this->base($p),
            'briefs' => $briefs->values(),
            'filters' => $filters,
            'stats' => [
                'total' => $all->count(),
                'week' => $all->where('created_at', '>=', now()->subWeek())->count(),
                'high' => $all->where('priority_score', '>=', 70)->count(),
                'matching' => $all->filter(fn ($b) => Matching::score($p, $b) >= 70)->count(),
                'saved' => count($saved),
            ],
            'options' => ['countries' => Options::select(Options::COUNTRIES), 'categories' => Options::select(Options::CATEGORIES), 'budgets' => Options::select(Options::BUDGETS)],
            'trending' => $all->groupBy('category')->map(fn ($g, $k) => ['label' => Options::CATEGORIES[$k] ?? $k, 'count' => $g->count()])->sortByDesc('count')->values()->take(5),
        ]);
    }

    public function toggleSave(Request $request, Brief $brief): RedirectResponse
    {
        $p = $this->provider($request);
        $profile = $p->profile ?? [];
        $saved = $profile['saved_briefs'] ?? [];
        $profile['saved_briefs'] = in_array($brief->reference, $saved, true) ? array_values(array_diff($saved, [$brief->reference])) : [...$saved, $brief->reference];
        $p->update(['profile' => $profile]);

        return back();
    }

    /** MP-SCR-020 Brief detail, QA standard and rate acceptance (GATE-MP-26). */
    public function opportunity(Request $request, Brief $brief): Response
    {
        $p = $this->provider($request);
        abort_unless($brief->open_to_providers || $p->proposals()->where('brief_id', $brief->id)->exists(), 404);
        $proposal = $p->proposals()->where('brief_id', $brief->id)->first();
        $cap = (int) ($brief->scope['ledgers']['c'] ?? 0);

        return Inertia::render('Marketplace/Provider/Opportunity', [
            ...$this->base($p),
            'brief' => Presenter::brief($brief),
            'match' => Matching::score($p, $brief),
            'rate' => $cap,
            'proposal' => $proposal ? ['rate' => $proposal->rate_zar, 'days' => $proposal->days, 'status' => $proposal->status, 'note' => $proposal->note] : null,
            'agreementTerms' => array_slice(Content::providerAgreement(), 3, 3),
        ]);
    }

    /** Accept the disclosed rate (or propose own rate) – creates a proposal hashed to the brief, rate and QA version. */
    public function acceptRate(Request $request, Brief $brief): RedirectResponse
    {
        $p = $this->provider($request);
        $this->active($p);
        abort_unless($brief->open_to_providers, 422, 'This brief is no longer open for proposals.');
        $data = $request->validate([
            'rate' => 'required|integer|min:1000|max:5000000',
            'days' => 'required|integer|min:1|max:180',
            'note' => 'nullable|string|max:1000',
            'accept_qa' => 'accepted',
            'accept_rate_terms' => 'accepted',
        ]);

        Proposal::updateOrCreate(['brief_id' => $brief->id, 'provider_id' => $p->id], [
            'rate_zar' => $data['rate'],
            'days' => $data['days'],
            'note' => $data['note'] ?? null,
            'match_score' => Matching::score($p, $brief),
            'status' => 'submitted',
        ]);

        return redirect()->route('marketplace.provider.opportunities')->with('success', "Proposal submitted for {$brief->reference}. You'll be notified if you are selected.");
    }

    public function declineRate(Request $request, Brief $brief): RedirectResponse
    {
        $p = $this->provider($request);
        Proposal::where('brief_id', $brief->id)->where('provider_id', $p->id)->update(['status' => 'withdrawn']);
        $profile = $p->profile ?? [];
        $profile['declined_briefs'][] = $brief->reference;
        $p->update(['profile' => $profile]);

        return redirect()->route('marketplace.provider.opportunities')->with('success', 'Brief declined. Declining work never lowers your quality tier.');
    }

    /** MP-SCR-021/022 Work submission, QA outcome, payment state and corrections. */
    public function engagement(Request $request, Engagement $engagement): Response
    {
        $p = $this->provider($request);
        $this->ownEngagement($p, $engagement);
        $engagement->load('deliverables', 'brief');
        $latest = $engagement->deliverables->sortByDesc('id')->first();
        $payout = Payout::where('engagement_id', $engagement->id)->first();

        return Inertia::render('Marketplace/Provider/Engagement', [
            ...$this->base($p),
            'engagement' => Presenter::engagement($engagement),
            'stages' => Workflow::PROVIDER_STAGES,
            'deliverables' => $engagement->deliverables->sortByDesc('id')->values()->map(fn ($d) => Presenter::deliverable($d)),
            'latest' => $latest ? Presenter::deliverable($latest) : null,
            'payout' => $payout ? ['reference' => $payout->reference, 'status' => $payout->status, 'amount' => $payout->amount_zar, 'available' => $payout->available_from?->format('d M Y')] : null,
            'scope' => $engagement->brief?->scope ?? [],
        ]);
    }

    public function startWork(Request $request, Engagement $engagement): RedirectResponse
    {
        $p = $this->provider($request);
        $this->ownEngagement($p, $engagement);
        abort_unless($engagement->stage === 'assigned', 422, 'Work has already started.');
        $engagement->stage = 'in_progress';
        $engagement->progress = 25;
        EngagementService::addEvent($engagement, 'Work Commenced', 'Provider started work on agreed deliverables', $p->name);
        $engagement->save();

        return back()->with('success', 'Work started. Submit your deliverable for TBCA QA when ready.');
    }

    public function submitWork(Request $request, Engagement $engagement): RedirectResponse
    {
        $p = $this->provider($request);
        $this->ownEngagement($p, $engagement);
        abort_unless(in_array($engagement->stage, ['assigned', 'in_progress', 'corrections'], true), 422, 'Work can only be submitted while the engagement is in progress or in corrections.');
        $data = $request->validate([
            'file_name' => ['required', 'string', 'max:150', 'regex:/\.(pdf|docx|xlsx|pptx|zip)$/i'],
            'notes' => 'required|string|min:10|max:1500',
            'scope_confirm' => 'accepted',
        ]);

        $d = EngagementService::submitWork($engagement, $data['file_name'], $data['notes'], $p->name);

        return back()->with('success', "Deliverable {$d->reference} v{$d->version} submitted to TBCA QA. Provider submissions are never the client-final release.");
    }

    /** MP-SCR-023 Earnings & payout statement for a period. */
    public function statements(Request $request): Response
    {
        $p = $this->provider($request);
        $period = $request->query('period', now()->format('Y-m'));
        try {
            $start = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
        } catch (\Throwable) {
            $start = now()->startOfMonth();
        }
        $end = $start->copy()->endOfMonth();

        $rows = Earning::where('provider_id', $p->id)->whereBetween('occurred_on', [$start, $end])->get();
        $billing = $rows->where('kind', 'billing');
        $adjust = $rows->where('kind', 'adjustment');

        $breakdown = $billing->groupBy('category')->map(function ($g, $cat) {
            $billed = (float) $g->sum('amount_zar');
            $fee = round($billed * Pricing::PLATFORM_FEE_PCT / 100, 2);
            $earn = $billed - $fee;
            $vat = round($earn * Pricing::VAT_PCT / 100, 2);

            return ['category' => $cat, 'billed' => $billed, 'fee' => $fee, 'earnings' => $earn, 'vat' => $vat, 'net' => $earn - $vat];
        })->values();

        $billed = (float) $billing->sum('amount_zar');
        $fee = round($billed * Pricing::PLATFORM_FEE_PCT / 100, 2);
        $adjTotal = (float) $adjust->sum('amount_zar');
        $net = $billed - $fee + $adjTotal;

        $trend = collect(range(5, 0))->map(function ($i) use ($p) {
            $m = now()->startOfMonth()->subMonths($i);

            return ['label' => $m->format('M'), 'value' => (float) Earning::where('provider_id', $p->id)->where('kind', 'billing')->whereBetween('occurred_on', [$m, $m->copy()->endOfMonth()])->sum('amount_zar')];
        });

        $payout = Payout::where('provider_id', $p->id)->whereBetween('created_at', [$start, $end->copy()->addMonth()])->latest()->first();

        return Inertia::render('Marketplace/Provider/Statement', [
            ...$this->base($p),
            'period' => $start->format('Y-m'),
            'periodLabel' => $start->format('j M Y').' – '.$end->format('j M Y'),
            'periods' => collect(range(0, 5))->map(fn ($i) => ['value' => now()->startOfMonth()->subMonths($i)->format('Y-m'), 'label' => now()->startOfMonth()->subMonths($i)->format('F Y')]),
            'totals' => ['billed' => $billed, 'fee' => $fee, 'gross' => $billed - $fee, 'adjustments' => $adjTotal, 'net' => $net, 'vat' => round($net * Pricing::VAT_PCT / 100, 2)],
            'breakdown' => $breakdown,
            'adjustments' => $adjust->values()->map(fn ($a) => ['date' => $a->occurred_on->format('d M Y'), 'type' => $a->category, 'description' => $a->description, 'amount' => $a->amount_zar, 'status' => $a->status]),
            'invoices' => $billing->pluck('invoice')->filter()->unique()->values(),
            'trend' => $trend,
            'payout' => $payout ? ['reference' => $payout->reference, 'status' => $payout->status, 'date' => $payout->available_from?->format('d M Y'), 'method' => $payout->method, 'account' => $payout->account] : null,
        ]);
    }

    /** MP-SCR-017 Provider agreement MP-PA-v2.1 (GATE-MP-14). */
    public function agreement(Request $request): Response
    {
        $p = $this->provider($request);

        return Inertia::render('Marketplace/Provider/Agreement', [
            ...$this->base($p),
            'terms' => Content::providerAgreement(),
            'acks' => Content::providerAcks(),
            'agreementRef' => 'AGR-2026-'.str_pad((string) (140 + $p->id), 4, '0', STR_PAD_LEFT),
        ]);
    }

    public function signAgreement(Request $request): RedirectResponse
    {
        $p = $this->provider($request);
        abort_unless(in_array($p->status, ['agreement_ready', 'verified'], true), 422, 'The agreement can be signed once verification is approved. Submission of an application does not create approval.');
        $rules = collect(Content::providerAcks())->mapWithKeys(fn ($v, $k) => ["ack_{$k}" => 'accepted'])->all();
        $data = $request->validate([...$rules, 'signatory' => 'required|string|max:120']);

        $conditional = ($p->vetting['decision'] ?? '') === 'conditions';
        $p->update([
            'status' => $conditional ? 'active_with_conditions' : 'active',
            'agreement_signed_at' => now(),
            'tier' => $p->tier ?? 'Bronze',
            'profile' => [...($p->profile ?? []), 'signatory' => $data['signatory'], 'agreement_version' => 'MP-PA-v2.1'],
        ]);

        return redirect()->route('marketplace.provider.dashboard')->with('success', 'Agreement signed. Your provider status is now Active – opportunities are open to you. Signature does not guarantee work volume.');
    }

    /** MP-SCR-025 Grievance & appeal wizard (5 steps; progress kept in the session). */
    public function grievance(Request $request, int $step = 1): Response|RedirectResponse
    {
        $p = $this->provider($request);
        $state = $request->session()->get('mkt.grievance', ['reached' => 1, 'data' => ['mode' => 'grievance']]);
        if ($request->query('mode') && in_array($request->query('mode'), ['grievance', 'appeal'], true)) {
            $state['data']['mode'] = $request->query('mode');
            $request->session()->put('mkt.grievance', $state);
        }
        $step = max(1, min(4, $step));
        if ($step > $state['reached']) {
            return redirect()->route('marketplace.provider.grievances.new', $state['reached']);
        }

        return Inertia::render('Marketplace/Provider/Grievance', [
            ...$this->base($p),
            'step' => $step,
            'data' => $state['data'],
            'engagements' => $p->engagements()->get()->map(fn ($e) => ['value' => $e->reference, 'label' => "{$e->reference} - {$e->title}"]),
        ]);
    }

    public function saveGrievance(Request $request, int $step): RedirectResponse
    {
        $p = $this->provider($request);
        $state = $request->session()->get('mkt.grievance', ['reached' => 1, 'data' => ['mode' => 'grievance']]);
        $step = max(1, min(4, $step));

        $rules = match ($step) {
            1 => [
                'mode' => 'required|in:grievance,appeal',
                'engagement' => 'required|exists:mkt_engagements,reference',
                'category' => 'required|string|max:80',
                'type' => 'required|in:Service Quality,Process / Policy,Payment / Fees,Fairness / Treatment,Communication,Other',
                'urgency' => 'required|in:low,medium,high,critical',
                'subject' => 'required|string|max:150',
                'description' => 'required|string|min:20|max:2000',
            ],
            2 => ['evidence' => 'nullable|array', 'evidence.*' => 'string|max:200', 'outcome' => 'required|string|min:5|max:1000', 'decision_ref' => 'nullable|string|max:60'],
            3 => ['confirm' => 'accepted'],
            default => [],
        };

        if ($request->boolean('save_draft')) {
            $state['data'] = [...$state['data'], ...$request->except('save_draft')];
            $request->session()->put('mkt.grievance', $state);

            return back()->with('success', 'Grievance draft saved.');
        }

        $data = $request->validate($rules);
        unset($data['confirm']);
        $state['data'] = [...$state['data'], ...$data];
        $state['reached'] = max($state['reached'], $step + 1);
        $request->session()->put('mkt.grievance', $state);

        if ($step < 3) {
            return redirect()->route('marketplace.provider.grievances.new', $step + 1);
        }

        $d = $state['data'];
        $engagement = Engagement::where('reference', $d['engagement'])->firstOrFail();
        $this->ownEngagement($p, $engagement);
        $priority = ['low' => 'low', 'medium' => 'medium', 'high' => 'high', 'critical' => 'high'][$d['urgency']];

        $dispute = EngagementService::raiseDispute($engagement, [
            'type' => $d['type'],
            'category' => $d['category'],
            'priority' => $priority,
            'subject' => $d['subject'],
            'description' => $d['description'],
            'resolution_sought' => $d['outcome'] ?? null,
            'urgency' => $d['urgency'],
            'documents' => array_map(fn ($n) => ['name' => $n, 'by' => 'Provider', 'at' => now()->format('d M Y'), 'size' => '—'], $d['evidence'] ?? []),
        ], $request->user(), $d['mode']);
        $dispute->update(['provider_id' => $p->id, 'response_due_at' => Workflow::businessDays(now(), 1)]);

        $request->session()->forget('mkt.grievance');

        return redirect()->route('marketplace.provider.grievances.show', $dispute);
    }

    public function grievanceShow(Request $request, Dispute $dispute): Response
    {
        $p = $this->provider($request);
        abort_unless($dispute->provider_id === $p->id && in_array($dispute->kind, ['grievance', 'appeal'], true), 404);
        $dispute->load('engagement');

        return Inertia::render('Marketplace/Provider/GrievanceShow', [...$this->base($p), 'dispute' => Presenter::dispute($dispute)]);
    }
}
