<?php

namespace App\Http\Controllers\Marketplace\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Marketplace\ProviderApplicationController;
use App\Models\Marketplace\Brief;
use App\Models\Marketplace\Deliverable;
use App\Models\Marketplace\Dispute;
use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\Payout;
use App\Models\Marketplace\Proposal;
use App\Models\Marketplace\Provider;
use App\Models\Marketplace\Record;
use App\Models\Order;
use App\Support\Marketplace\EngagementService;
use App\Support\Marketplace\Matching;
use App\Support\Marketplace\Options;
use App\Support\Marketplace\Presenter;
use App\Support\Marketplace\Registers;
use App\Support\Marketplace\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Marketplace & Partner Services governance consoles backed by first-class models. */
class MarketplaceAdminController extends Controller
{
    private function nav(): array
    {
        return ['marketplace' => Registers::nav('marketplace'), 'partners' => Registers::nav('partners')];
    }

    public function hub(): Response
    {
        return Inertia::render('Marketplace/Admin/Hub', [
            'nav' => $this->nav(),
            'kpis' => [
                'providers' => Provider::where('kind', 'marketplace')->count(),
                'pendingProviders' => Provider::where('kind', 'marketplace')->whereIn('status', ['applied', 'verification', 'action_required'])->count(),
                'partners' => Provider::where('kind', 'partner')->count(),
                'pendingPartners' => Provider::where('kind', 'partner')->where('status', 'verification')->count(),
                'listings' => Listing::count(),
                'pendingListings' => Listing::where('status', 'pending')->count(),
                'briefs' => Brief::where('status', '!=', 'draft')->count(),
                'qa' => Deliverable::whereIn('status', ['submitted', 'in_review'])->count(),
                'disputes' => Dispute::whereNotIn('status', ['closed', 'withdrawn', 'won', 'lost'])->count(),
                'payoutReady' => (float) Payout::where('status', 'ready')->sum('amount_zar'),
                'orders' => Order::where('section', 'marketplace')->count(),
                'paidOrders' => (float) Order::where('section', 'marketplace')->where('status', 'paid')->sum('total_zar'),
            ],
            'recentOrders' => Order::where('section', 'marketplace')->latest()->limit(6)->get()->map(fn ($o) => ['reference' => $o->reference, 'title' => $o->meta['title'] ?? 'Marketplace order', 'total' => $o->total_zar, 'status' => $o->status, 'date' => $o->created_at->format('d M Y')]),
        ]);
    }

    /** MP-SCR-028 Provider Verification Register (marketplace providers). */
    public function providers(Request $request): Response
    {
        $tab = $request->query('tab', 'all');
        $q = trim((string) $request->query('q', ''));
        $all = Provider::where('kind', 'marketplace')->get();
        $groups = [
            'verified' => ['active', 'active_with_conditions', 'verified', 'agreement_ready'],
            'verification' => ['applied', 'verification'],
            'action_required' => ['action_required', 'pending_reverification'],
            'suspended' => ['suspended'],
            'rejected' => ['rejected'],
        ];
        $rows = $all->filter(fn ($p) => ($tab === 'all' || in_array($p->status, $groups[$tab] ?? [$tab], true))
            && ($q === '' || str_contains(strtolower($p->name.' '.$p->code), strtolower($q))));

        return Inertia::render('Marketplace/Admin/Providers', [
            'nav' => $this->nav(),
            'providers' => $rows->values()->map(fn ($p) => Presenter::provider($p)),
            'counts' => ['all' => $all->count(), ...collect($groups)->map(fn ($s) => $all->whereIn('status', $s)->count())->all()],
            'query' => ['tab' => $tab, 'q' => $q],
            'actions' => Workflow::PROVIDER_ACTIONS,
        ]);
    }

    public function providerStatus(Request $request, Provider $provider): RedirectResponse
    {
        $data = $request->validate(['action' => 'required|in:'.implode(',', array_keys(Workflow::PROVIDER_ACTIONS)), 'note' => 'nullable|string|max:500']);
        $rule = Workflow::PROVIDER_ACTIONS[$data['action']];

        if (in_array($data['action'], ['approve', 'conditions'], true) && $provider->kind === 'marketplace') {
            $checks = collect($provider->vetting['checklist'] ?? []);
            abort_if($checks->isNotEmpty() && $checks->contains(fn ($c) => $c['status'] !== 'verified'), 422, 'The vetting decision is locked until all checks are complete.');
        }

        $to = $rule['to'];
        // Partner Services firms go straight to routing state on approval (agreement executed during application).
        if ($provider->kind === 'partner' && in_array($data['action'], ['approve', 'activate'], true)) {
            $to = 'active';
        } elseif ($provider->kind === 'partner' && $data['action'] === 'conditions') {
            $to = 'active_with_conditions';
        }

        $vetting = $provider->vetting ?? [];
        $vetting['activity'][] = ['at' => now()->format('d M Y, H:i'), 'body' => $rule['label'].' by '.$request->user()->name.($data['note'] ? ": {$data['note']}" : '')];
        if (in_array($data['action'], ['approve', 'conditions', 'decline'], true)) {
            $vetting['decision'] = $data['action'];
            $vetting['stage'] = 'Decision';
        }
        $profile = $provider->profile ?? [];
        if ($provider->kind === 'partner') {
            $profile['verification'] = match ($to) {
                'active' => 'CURRENT_VERIFIED', 'active_with_conditions' => 'CURRENT_WITH_CONDITIONS', 'suspended' => 'SUSPENDED',
                'pending_reverification' => 'PENDING_VERIFICATION', 'rejected' => 'NOT_APPROVED', default => $profile['verification'] ?? 'PENDING_VERIFICATION',
            };
            $profile['panel'] = in_array($to, ['active', 'active_with_conditions'], true) ? 'ACTIVE' : (($to === 'suspended') ? 'SUSPENDED' : 'INACTIVE');
        }

        $provider->update([
            'status' => $to,
            'vetting' => $vetting,
            'profile' => $profile,
            'last_verified_at' => in_array($to, ['active', 'agreement_ready', 'active_with_conditions'], true) ? now() : $provider->last_verified_at,
            'next_review_at' => in_array($to, ['active', 'agreement_ready', 'active_with_conditions'], true) ? now()->addDays(90) : $provider->next_review_at,
        ]);

        return back()->with('success', "{$provider->name}: {$rule['label']} recorded.");
    }

    /** MP-SCR-016 Provider vetting & verification workbench. */
    public function vetting(Provider $provider): Response
    {
        $vetting = $provider->vetting ?? [];
        if (empty($vetting['checklist'])) {
            $vetting['checklist'] = ProviderApplicationController::checklist();
            $provider->update(['vetting' => $vetting]);
        }

        return Inertia::render('Marketplace/Admin/Vetting', [
            'nav' => $this->nav(),
            'provider' => Presenter::provider($provider),
            'application' => $provider->application ?? [],
            'vetting' => $vetting,
        ]);
    }

    public function updateVetting(Request $request, Provider $provider): RedirectResponse
    {
        $data = $request->validate([
            'index' => 'required|integer|min:0|max:20',
            'status' => 'required|in:pending,in_review,verified,failed',
            'note' => 'nullable|string|max:300',
            'evidence' => 'nullable|string|max:150',
        ]);
        $vetting = $provider->vetting ?? [];
        abort_unless(isset($vetting['checklist'][$data['index']]), 404);
        $vetting['checklist'][$data['index']] = [...$vetting['checklist'][$data['index']], 'status' => $data['status'], 'note' => $data['note'] ?? $vetting['checklist'][$data['index']]['note'], 'evidence' => $data['evidence'] ?: $vetting['checklist'][$data['index']]['evidence']];
        $vetting['activity'][] = ['at' => now()->format('d M Y, H:i'), 'body' => $vetting['checklist'][$data['index']]['area'].' marked '.str_replace('_', ' ', $data['status'])];

        $done = collect($vetting['checklist'])->where('status', 'verified')->count();
        $total = count($vetting['checklist']);
        $vetting['stage'] = $done === $total ? 'Risk Assessment' : ($done >= 4 ? 'Reference Check' : 'Document Review');
        $failed = collect($vetting['checklist'])->contains('status', 'failed');

        $provider->update([
            'vetting' => $vetting,
            'score' => (int) round($done / max(1, $total) * 100),
            'status' => in_array($provider->status, ['applied', 'verification', 'action_required'], true) ? ($failed ? 'action_required' : 'verification') : $provider->status,
        ]);

        return back()->with('success', 'Vetting checklist updated.');
    }

    /** Listing moderation (publish / suspend / reject). */
    public function listings(Request $request): Response
    {
        $tab = $request->query('tab', 'all');
        $kind = $request->query('kind', '');
        $q = trim((string) $request->query('q', ''));
        $query = Listing::with('provider')->orderBy('title');
        if ($tab !== 'all') {
            $query->where('status', $tab);
        }
        if ($kind) {
            $query->where('kind', $kind);
        }
        if ($q) {
            $query->where('title', 'like', "%{$q}%");
        }

        return Inertia::render('Marketplace/Admin/Listings', [
            'nav' => $this->nav(),
            'listings' => $query->get()->map(fn ($l) => Presenter::listing($l)),
            'counts' => Listing::selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status'),
            'query' => ['tab' => $tab, 'kind' => $kind, 'q' => $q],
        ]);
    }

    public function listingStatus(Request $request, Listing $listing): RedirectResponse
    {
        // Accepts {status, reason} or the console action-menu shape {action, note}.
        $request->merge(['status' => $request->input('status', $request->input('action')), 'reason' => $request->input('reason', $request->input('note'))]);
        $data = $request->validate(['status' => 'required|in:published,suspended,rejected,pending', 'reason' => 'nullable|string|max:300']);
        $details = $listing->details ?? [];
        $details['moderation'][] = ['at' => now()->format('d M Y, H:i'), 'by' => $request->user()->name, 'status' => $data['status'], 'reason' => $data['reason'] ?? null];
        $listing->update(['status' => $data['status'], 'details' => $details]);

        return back()->with('success', "{$listing->title} is now {$data['status']}.");
    }

    public function briefs(Request $request): Response
    {
        return Inertia::render('Marketplace/Admin/Briefs', [
            'nav' => $this->nav(),
            'briefs' => Brief::with('provider')->where('status', '!=', 'draft')->latest()->get()
                ->map(fn ($b) => [...Presenter::brief($b), 'proposals' => $b->proposals()->count()]),
        ]);
    }

    /** MP-SCR-027 Brief triage & matching workbench. */
    public function triage(Brief $brief): Response
    {
        $brief->load('provider');
        $matches = Matching::forBrief($brief, 12);
        $d = $brief->data ?? [];
        $requirements = collect($d['skills'] ?? [])->map(fn ($s, $i) => ['requirement' => $s, 'category' => $i % 2 ? 'Financial' : 'Technical', 'priority' => $i < 2 ? 'High' : 'Medium', 'weight' => max(10, 20 - $i * 3)])->values();

        return Inertia::render('Marketplace/Admin/Triage', [
            'nav' => $this->nav(),
            'brief' => Presenter::brief($brief),
            'requirements' => $requirements,
            'matches' => $matches->map(fn ($m) => [
                'provider' => Presenter::provider($m['provider']), 'score' => $m['score'], 'expertise' => $m['expertise'], 'capacity' => $m['capacity'],
                'available' => $m['available'], 'cost' => $m['cost'], 'band' => Matching::band($m['score']),
                'shortlisted' => Proposal::where('brief_id', $brief->id)->where('provider_id', $m['provider']->id)->whereIn('status', ['shortlisted', 'awarded'])->exists(),
            ])->values(),
            'proposals' => $brief->proposals()->with('provider')->get()->map(fn ($p) => ['provider' => $p->provider->name, 'rate' => $p->rate_zar, 'days' => $p->days, 'status' => $p->status, 'match' => $p->match_score]),
            'stages' => Workflow::PROVIDER_STAGES,
        ]);
    }

    /** Shortlist a matched provider: creates/updates a proposal the buyer can compare and award. */
    public function shortlist(Request $request, Brief $brief): RedirectResponse
    {
        $data = $request->validate(['provider' => 'required|exists:mkt_providers,id', 'note' => 'nullable|string|max:500']);
        $provider = Provider::findOrFail($data['provider']);
        abort_unless($provider->isRoutable(), 422, 'Only active, verified providers can be shortlisted.');
        $cap = (int) ($brief->scope['ledgers']['c'] ?? ($provider->profile['base_rate'] ?? 30000));

        Proposal::updateOrCreate(['brief_id' => $brief->id, 'provider_id' => $provider->id], [
            'rate_zar' => min($cap, (int) ($provider->profile['base_rate'] ?? $cap)),
            'days' => (int) ($provider->profile['typical_days'] ?? 10),
            'match_score' => Matching::score($provider, $brief),
            'note' => $data['note'] ?? 'Shortlisted by TBCA matching team.',
            'status' => 'shortlisted',
        ]);

        return back()->with('success', "{$provider->name} shortlisted for {$brief->reference}.");
    }

    /** MP-SCR-029 QA review queue and capacity (real deliverables). */
    public function qa(Request $request): Response
    {
        $tab = $request->query('tab', 'queue');
        $map = ['queue' => ['submitted'], 'in_review' => ['in_review'], 'completed' => ['released', 'accepted', 'returned_r1', 'returned_r2', 'rejected', 'correction_requested'], 'all' => null];
        $query = Deliverable::with('engagement.provider')->latest('submitted_at');
        if ($map[$tab] ?? null) {
            $query->whereIn('status', $map[$tab]);
        }
        $all = Deliverable::all();

        return Inertia::render('Marketplace/Admin/QaQueue', [
            'nav' => $this->nav(),
            'items' => $query->get()->map(fn (Deliverable $d) => [
                ...Presenter::deliverable($d),
                'engagement' => $d->engagement->reference,
                'engagementTitle' => $d->engagement->title,
                'provider' => $d->engagement->provider?->name,
                'qaStandard' => $d->engagement->qa_standard,
                'priority' => $d->engagement->priority,
                'age' => $d->submitted_at ? $d->submitted_at->diffForHumans(null, true) : '—',
                'overdue' => $d->submitted_at && $d->submitted_at->lt(now()->subHours(48)) && in_array($d->status, ['submitted', 'in_review'], true),
            ]),
            'counts' => [
                'queue' => $all->where('status', 'submitted')->count(),
                'in_review' => $all->where('status', 'in_review')->count(),
                'completed' => $all->whereIn('status', $map['completed'])->count(),
                'all' => $all->count(),
                'overdue' => $all->filter(fn ($d) => $d->submitted_at && $d->submitted_at->lt(now()->subHours(48)) && in_array($d->status, ['submitted', 'in_review'], true))->count(),
            ],
            'reviewers' => [['Thabo Nkosi', 5, 5], ['Lerato Mokoena', 4, 5], ['Sipho Dlamini', 3, 5], ['Aisha Patel', 3, 4], ['Johan Botha', 2, 5], ['Nomsa Khumalo', 1, 5]],
            'tab' => $tab,
        ]);
    }

    public function qaAction(Request $request, Deliverable $deliverable): RedirectResponse
    {
        $data = $request->validate(['action' => 'required|in:start,pass,return_r1,return_r2,reject', 'note' => 'required_if:action,return_r1,return_r2,reject|nullable|string|max:500']);
        EngagementService::qa($deliverable, $data['action'], $request->user()->name, $data['note'] ?? null);

        return back()->with('success', "{$deliverable->reference}: QA ".str_replace('_', ' ', $data['action']).' recorded.');
    }

    /** MP-SCR-031 Payout & float console. */
    public function payouts(Request $request): Response
    {
        $tab = $request->query('tab', 'ready');
        $query = Payout::with('provider', 'engagement')->latest();
        if ($tab !== 'all') {
            $query->where('status', $tab);
        }
        $all = Payout::all();

        return Inertia::render('Marketplace/Admin/Payouts', [
            'nav' => $this->nav(),
            'payouts' => $query->get()->map(fn (Payout $p) => [
                'id' => $p->id, 'reference' => $p->reference, 'provider' => $p->provider->name, 'tier' => $p->provider->tier,
                'engagement' => $p->engagement?->reference, 'title' => $p->engagement?->title,
                'earnings' => $p->earnings_zar, 'fee' => $p->fee_zar, 'vat' => $p->vat_zar, 'amount' => $p->amount_zar,
                'method' => $p->method, 'account' => $p->account, 'status' => $p->status,
                'available' => $p->available_from?->format('d M Y'), 'paid' => $p->paid_at?->format('d M Y'),
            ]),
            'counts' => collect(['ready', 'scheduled', 'in_transit', 'paid', 'held', 'failed'])->mapWithKeys(fn ($s) => [$s => $all->where('status', $s)->count()])->put('all', $all->count()),
            'totals' => [
                'payable' => (float) $all->whereIn('status', ['ready', 'scheduled'])->sum('amount_zar'),
                'scheduled' => (float) $all->where('status', 'scheduled')->sum('amount_zar'),
                'paid' => (float) $all->where('status', 'paid')->sum('amount_zar'),
                'held' => (float) $all->whereIn('status', ['held', 'failed'])->sum('amount_zar'),
                'transit' => (float) $all->where('status', 'in_transit')->sum('amount_zar'),
                'float' => 2185430.00,
            ],
            'tab' => $tab,
        ]);
    }

    public function payoutAction(Request $request, Payout $payout): RedirectResponse
    {
        $data = $request->validate(['action' => 'required|in:pay,schedule,hold,release,fail']);
        $map = [
            'pay' => [['ready', 'scheduled', 'in_transit'], 'paid'],
            'schedule' => [['ready'], 'scheduled'],
            'hold' => [['ready', 'scheduled'], 'held'],
            'release' => [['held', 'failed'], 'ready'],
            'fail' => [['in_transit', 'scheduled'], 'failed'],
        ];
        [$from, $to] = $map[$data['action']];
        abort_unless(in_array($payout->status, $from, true), 422, 'This payout action is not available.');
        if ($data['action'] === 'release' && $payout->engagement && $payout->engagement->stage === 'disputed') {
            abort(422, 'Payout cannot be released while the engagement dispute is open.');
        }
        $payout->update(['status' => $to, 'paid_at' => $to === 'paid' ? now() : $payout->paid_at]);
        if ($to === 'paid' && $payout->engagement) {
            $payout->engagement->update(['payment_state' => 'paid']);
        }

        return back()->with('success', "Payout {$payout->reference} {$to}.");
    }

    /** Initiate payout run: all READY payouts move to in-transit. */
    public function payoutRun(): RedirectResponse
    {
        $n = Payout::where('status', 'ready')->update(['status' => 'in_transit']);

        return back()->with('success', "Payout run initiated: {$n} payout(s) in transit.");
    }

    /** MP-SCR-033 Supply coverage & fill-rate dashboard (computed from live supply plus planning data). */
    public function supply(): Response
    {
        $providers = Provider::where('kind', 'marketplace')->get();
        $byCategory = collect(Options::CATEGORIES)->map(function ($label, $key) use ($providers) {
            $needed = ['financial-advisory' => 320, 'market-research' => 280, 'project-management' => 260, 'legal-contracts' => 240, 'automation-ai' => 200, 'due-diligence' => 180, 'tech-digital' => 220, 'compliance-risk' => 150][$key] ?? 100;
            $seedAvail = ['financial-advisory' => 278, 'market-research' => 236, 'project-management' => 218, 'legal-contracts' => 186, 'automation-ai' => 152, 'due-diligence' => 144, 'tech-digital' => 160, 'compliance-risk' => 120][$key] ?? 60;
            $available = $seedAvail + $providers->where('category', $key)->whereIn('status', ['active', 'active_with_conditions'])->count();

            return ['category' => $label, 'needed' => $needed, 'available' => $available, 'coverage' => round(min(100, $available / $needed * 100), 1), 'gap' => max(0, $needed - $available)];
        })->values();

        $briefs = Brief::where('status', '!=', 'draft')->latest()->limit(5)->with('provider')->get();

        return Inertia::render('Marketplace/Admin/Supply', [
            'nav' => $this->nav(),
            'byCategory' => $byCategory,
            'live' => [
                'applicants' => 2845 + $providers->whereIn('status', ['applied', 'verification'])->count(),
                'verified' => 1962 + $providers->whereIn('status', ['active', 'active_with_conditions', 'agreement_ready'])->count(),
                'available' => 1238 + $providers->where('status', 'active')->count(),
            ],
            'fills' => $briefs->map(fn ($b) => ['reference' => $b->reference, 'category' => Options::CATEGORIES[$b->category] ?? $b->category, 'country' => $b->data['country'] ?? 'South Africa', 'provider' => $b->provider?->name ?? '—', 'qualified' => (bool) $b->provider_id, 'status' => $b->status]),
        ]);
    }

    /** MP-SCR-034 Dispute & chargeback console (real disputes, grievances and appeals). */
    public function disputes(Request $request): Response
    {
        $tab = $request->query('tab', 'all');
        $map = ['open' => ['raised', 'open', 'acknowledged', 'under_review', 'mediation', 'decision'], 'escalated' => ['escalated'], 'won' => ['won'], 'lost' => ['lost'], 'closed' => ['closed', 'withdrawn']];
        $query = Dispute::with('engagement', 'provider')->latest();
        if (isset($map[$tab])) {
            $query->whereIn('status', $map[$tab]);
        }
        if ($kind = $request->query('kind')) {
            $query->where('kind', $kind);
        }
        $all = Dispute::all();

        return Inertia::render('Marketplace/Admin/Disputes', [
            'nav' => $this->nav(),
            'disputes' => $query->get()->map(fn ($d) => [...Presenter::dispute($d), 'actions' => collect(Workflow::DISPUTE_ACTIONS)->filter(fn ($a) => in_array($d->status, $a['from'], true))->map(fn ($a, $k) => ['key' => $k, 'label' => $a['label']])->values()]),
            'counts' => ['all' => $all->count(), ...collect($map)->map(fn ($s) => $all->whereIn('status', $s)->count())->all()],
            'byType' => $all->groupBy('type')->map(fn ($g, $k) => ['label' => $k, 'value' => $g->count()])->sortByDesc('value')->values()->take(5),
            'query' => ['tab' => $tab, 'kind' => $request->query('kind', '')],
        ]);
    }

    public function disputeAction(Request $request, Dispute $dispute): RedirectResponse
    {
        $data = $request->validate(['action' => 'required|in:'.implode(',', array_keys(Workflow::DISPUTE_ACTIONS)), 'note' => 'nullable|string|max:500']);
        EngagementService::transitionDispute($dispute, $data['action'], $request->user()->name, $data['note'] ?? null);

        return back()->with('success', "{$dispute->reference}: ".Workflow::DISPUTE_ACTIONS[$data['action']]['label'].' recorded.');
    }

    /** PS-027 Live Partner Register (real partner firms; routing follows verification state). */
    public function partnerRegister(Request $request): Response
    {
        $tab = $request->query('tab', 'all');
        $q = trim((string) $request->query('q', ''));
        $profession = $request->query('profession', '');
        $all = Provider::where('kind', 'partner')->orderBy('name')->get();
        $rows = $all->filter(fn ($p) => ($tab === 'all' || $p->status === $tab)
            && ($profession === '' || $p->profession === $profession)
            && ($q === '' || str_contains(strtolower($p->name.' '.($p->profile['practitioner'] ?? '').' '.($p->profile['professional_registration'] ?? '')), strtolower($q))));

        return Inertia::render('Marketplace/Admin/PartnerRegister', [
            'nav' => $this->nav(),
            'partners' => $rows->values()->map(fn ($p) => Presenter::provider($p)),
            'counts' => ['all' => $all->count(), ...$all->groupBy('status')->map->count()->all()],
            'professions' => $all->pluck('profession')->filter()->unique()->sort()->values(),
            'query' => ['tab' => $tab, 'q' => $q, 'profession' => $profession],
        ]);
    }
}
