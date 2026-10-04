<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\AgentQuery;
use App\Models\Countries\Corridor;
use App\Models\Countries\Country;
use App\Models\Countries\Engagement;
use App\Models\Countries\Interest;
use App\Models\Countries\Observation;
use App\Models\Countries\RegisterEntry;
use App\Models\Countries\Release;
use App\Models\Countries\Retraction;
use App\Models\Countries\SovereignEngagement;
use App\Support\Countries\Agents;
use App\Support\Countries\Analytics;
use App\Support\Countries\AvailabilityState;
use App\Support\Countries\CorridorResolver;
use App\Support\Countries\CountryResolver;
use App\Support\Countries\Present;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Countries administration consoles (CT-065 to CT-084) under /admin/countries. */
class AdminController extends Controller
{
    private function countries()
    {
        return Country::with('domains')->orderBy('name')->get();
    }

    private function rows($countries): array
    {
        return $countries->map(fn ($c) => [...Present::country($c), 'metrics' => $c->metrics, 'updated_by' => $c->updated_by, 'updated' => $c->updated_at?->format('d M Y')])->all();
    }

    private function counts($countries): array
    {
        $b = $countries->groupBy(fn ($c) => AvailabilityState::bucket($c->availability_state))->map->count();

        return ['total' => $countries->count(), 'activated' => $b['activated'] ?? 0, 'shell' => $b['shell'] ?? 0, 'degraded' => $b['degraded'] ?? 0, 'suspended' => $b['suspended'] ?? 0, 'restricted' => $b['restricted'] ?? 0];
    }

    private function filter(Request $request, array $rows): array
    {
        return array_values(array_filter($rows, function ($r) use ($request) {
            if (($q = $request->query('q')) && ! str_contains(strtolower($r['name']), strtolower($q))) {
                return false;
            }
            if (($s = $request->query('state')) && $r['bucket'] !== $s) {
                return false;
            }
            if (($g = $request->query('region')) && $r['region'] !== $g) {
                return false;
            }

            return true;
        }));
    }

    public function tower(): Response
    {
        $countries = $this->countries();
        $domains = $countries->flatMap->domains;
        $demand = Analytics::demand($countries);

        return Inertia::render('Countries/Admin/Tower', [
            'counts' => $this->counts($countries),
            'resolver' => ['resolved' => (int) $domains->sum('completed_fields'), 'missing' => (int) $domains->sum(fn ($d) => $d->required_fields - $d->completed_fields), 'pct' => round($domains->sum('completed_fields') / max(1, $domains->sum('required_fields')) * 100, 1)],
            'corridors' => ['sellable' => CorridorResolver::sellableCount(), 'raw' => CorridorResolver::rawDirectionalTopology()],
            'freshness' => ['fresh' => $countries->where('evidence_currentness', 'current')->count(), 'partial' => $countries->where('evidence_currentness', 'partial')->count(), 'stale' => $countries->where('evidence_currentness', 'stale')->count()],
            'demand' => array_slice(array_values(array_filter($demand['rows'], fn ($r) => $r['iso'] !== 'ZA')), 0, 5),
            'alerts' => [
                ['Quote requests awaiting a letter', Engagement::where('status', 'quote_requested')->count(), '/admin/countries/engagements'],
                ['Sovereign reviews awaiting approval', SovereignEngagement::where('status', 'evidence_review')->count(), '/admin/countries/sovereign'],
                ['Layer 9 candidates awaiting triage', Observation::where('status', 'candidate')->count(), '/admin/countries/observations'],
                ['Open retraction requests', Retraction::whereIn('status', ['under_review', 'awaiting_info'])->count(), '/admin/countries/retractions'],
                ['Waitlist intent episodes (all countries)', Interest::count(), '/admin/countries/demand'],
            ],
            'transitions' => \App\Models\Countries\StateTransition::with('country')->latest('id')->limit(5)->get()->map(fn ($t) => [$t->country->name, $t->from_state, $t->to_state, $t->authority_level, $t->created_at->format('d M Y H:i')]),
        ]);
    }

    public function objects(Request $request): Response
    {
        $rows = $this->filter($request, $this->rows($this->countries()));
        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('Countries/Admin/Objects', [
            'rows' => array_slice($rows, ($page - 1) * 10, 10), 'total' => count($rows), 'page' => $page,
            'selected' => ($iso = $request->query('selected')) ? collect($this->rows($this->countries()))->firstWhere('iso2', strtoupper($iso)) : null,
            'filters' => $request->only(['q', 'state', 'region']),
            'changed' => RegisterEntry::where('register', 'history')->where('recorded_on', '>=', now()->subDays(30))->distinct('country_id')->count('country_id'),
            'dependencies' => (int) Country::query()->join('ctry_resolver_domains', 'ctry_countries.id', '=', 'ctry_resolver_domains.country_id')->sum('required_fields'),
        ]);
    }

    public function resolver(Request $request): Response
    {
        $countries = $this->countries();
        $rows = $this->filter($request, $countries->map(function ($c) {
            $p = CountryResolver::profile($c);

            return [...Present::country($c, $p), 'resolved' => $p['completed_fields'], 'missing_fields' => $p['required_fields'] - $p['completed_fields'], 'total' => $p['required_fields'],
                'critical' => count(array_filter($p['missing'], fn ($m) => in_array($m['key'], ['legal', 'tax', 'payments', 'sanctions', 'partner'], true))), 'top_missing' => implode(', ', array_slice(array_column($p['missing'], 'domain'), 0, 3)), 'blocks' => $p['hard_block_classes']];
        })->sortByDesc('rcs')->values()->all());
        $all = collect($rows);
        $byDomain = $countries->flatMap->domains->groupBy('label')->map(fn ($g) => round($g->sum('completed_fields') / max(1, $g->sum('required_fields')) * 100, 1));

        return Inertia::render('Countries/Admin/Resolver', [
            'rows' => $rows,
            'stats' => ['full' => $all->where('rcs', '>=', 100)->count(), 'partial' => $all->whereBetween('rcs', [50, 99.999])->count(), 'unresolved' => $all->where('rcs', '<', 50)->count(),
                'resolved' => $all->sum('resolved'), 'missing' => $all->sum('missing_fields'), 'total' => $all->sum('total')],
            'distribution' => ['90 – 100%' => $all->where('rcs', '>=', 90)->count(), '75 – 89%' => $all->whereBetween('rcs', [75, 89.999])->count(), '50 – 74%' => $all->whereBetween('rcs', [50, 74.999])->count(), '25 – 49%' => $all->whereBetween('rcs', [25, 49.999])->count(), '0 – 24%' => $all->where('rcs', '<', 25)->count()],
            'byDomain' => $byDomain,
            'filters' => $request->only(['q', 'state', 'region']),
        ]);
    }

    public function states(Request $request): Response
    {
        $countries = $this->countries();
        $rows = $this->filter($request, $this->rows($countries));

        return Inertia::render('Countries/Admin/States', [
            'rows' => $rows, 'counts' => $this->counts($countries),
            'states' => AvailabilityState::options(), 'levels' => AvailabilityState::LEVELS,
            'log' => \App\Models\Countries\StateTransition::with(['country', 'actor'])->latest('id')->limit(12)->get()->map(fn ($t) => ['country' => $t->country->name, 'from' => $t->from_state, 'to' => $t->to_state, 'level' => $t->authority_level, 'reason' => $t->reason, 'certificate' => $t->certificate_ref, 'by' => $t->actor?->name, 'at' => $t->created_at->format('d M Y H:i')]),
            'filters' => $request->only(['q', 'state', 'region']),
        ]);
    }

    public const METRIC_CONSOLES = [
        'tax' => 'Country Tax and Statutory Admin',
        'payments' => 'Country Payment and Liquidity Admin',
        'licences' => 'Country Licence and Permission Admin',
        'partners' => 'Country Partner Capacity Admin',
    ];

    public function metrics(Request $request, string $kind): Response
    {
        abort_unless(isset(self::METRIC_CONSOLES[$kind]), 404);

        return Inertia::render('Countries/Admin/Metrics', [
            'kind' => $kind, 'title' => self::METRIC_CONSOLES[$kind],
            'rows' => $this->filter($request, $this->rows($this->countries())),
            'filters' => $request->only(['q', 'state', 'region']),
        ]);
    }

    public function demand(Request $request): Response
    {
        $d = Analytics::demand($this->countries());
        if ($s = $request->query('state')) {
            $d['rows'] = array_values(array_filter($d['rows'], fn ($r) => AvailabilityState::bucket($r['state']) === $s));
        }

        return Inertia::render('Countries/Admin/Demand', [
            'demand' => $d, 'drivers' => Analytics::BIAS_DRIVERS, 'filters' => $request->only(['state']),
            'recent' => Interest::with('country')->latest()->limit(8)->get()->map(fn ($i) => [$i->reference, $i->country->name, $i->organisation ?: $i->name, $i->service_category, $i->interest_level, $i->status, $i->created_at->format('d M Y')]),
        ]);
    }

    public function investment(Request $request): Response
    {
        $scenario = $request->query('scenario', 'conservative');
        $hurdle = (float) $request->query('hurdle', 2.0);
        $payback = (float) $request->query('payback', 18);
        $capital = (float) $request->query('capital', 150);

        return Inertia::render('Countries/Admin/Investment', [
            'result' => Analytics::investment($this->countries(), $scenario, $hurdle, $payback, $capital),
            'scenarios' => Analytics::SCENARIOS,
            'thresholds' => ['scenario' => $scenario, 'hurdle' => $hurdle, 'payback' => $payback, 'capital' => $capital],
            'budget' => 600,
        ]);
    }

    public const GROUPS = [
        ['SADC Intra-Corridor', 'COR-SADC-01', 'Regional', 'South Africa → Angola → Zambia → Mozambique', 18, ['ZA', 'AO', 'ZM', 'MZ']],
        ['SACU Corridor', 'COR-SACU-02', 'Regional', 'South Africa → Botswana → Namibia → Eswatini', 12, ['ZA', 'BW', 'NA', 'SZ']],
        ['EAC Corridor', 'COR-EAC-03', 'Regional', 'Kenya → Uganda → Tanzania → Rwanda', 16, ['KE', 'UG', 'TZ', 'RW']],
        ['ECOWAS Corridor', 'COR-ECOWAS-04', 'Regional', "Nigeria → Ghana → Côte d'Ivoire → Senegal", 20, ['NG', 'GH', 'CI', 'SN']],
        ['South Africa – UK Corridor', 'COR-ZAF-UK-01', 'Bilateral', 'South Africa ↔ United Kingdom', 6, ['ZA']],
        ['South Africa – USA Corridor', 'COR-ZAF-USA-01', 'Bilateral', 'South Africa ↔ United States', 6, ['ZA']],
        ['EU – SADC Corridor', 'COR-EU-SADC-01', 'Inter-Regional', 'European Union ↔ SADC Region', 14, ['ZA', 'BW', 'NA']],
        ['Asia – Africa Corridor', 'COR-AS-AF-01', 'Inter-Regional', 'India → UAE → South Africa → Nigeria', 10, ['ZA', 'NG']],
        ['BRICS Corridor', 'COR-BRICS-01', 'Inter-Regional', 'Brazil → Russia → India → China → SA', 8, ['ZA']],
        ['Pacific – Africa Corridor', 'COR-PAC-AF-01', 'Inter-Regional', 'Australia → South Africa → Mauritius', 6, ['ZA', 'MU']],
    ];

    public function corridors(): Response
    {
        $countries = Country::with('domains')->get()->keyBy('iso2');
        $rows = collect(self::GROUPS)->map(function ($g) use ($countries) {
            $endpoints = collect($g[5])->map(fn ($iso) => $countries[$iso]);
            $shells = $endpoints->reject(fn ($c) => AvailabilityState::isActive($c->availability_state));
            $rcs = round($endpoints->avg(fn ($c) => CountryResolver::profile($c)['rcs']), 1);

            return ['name' => $g[0], 'code' => $g[1], 'type' => $g[2], 'anchors' => $g[3], 'paths' => $g[4], 'rcs' => $rcs,
                'state' => $shells->isEmpty() ? 'Endpoint-ready (pair gates pending)' : 'Blocked by endpoint ('.$shells->pluck('name')->implode(', ').')',
                'blocked' => $shells->isNotEmpty(), 'risk' => $shells->count() > 2 ? 'High' : ($shells->isEmpty() ? 'Low' : 'Medium')];
        });

        return Inertia::render('Countries/Admin/Corridors', ['rows' => $rows, 'sellable' => CorridorResolver::sellableCount()]);
    }

    public function pairs(Request $request): Response
    {
        $countries = Country::all()->keyBy('iso2');
        $rows = Corridor::orderByDesc('pair_rcs')->get()->map(fn ($c) => Present::corridor($c, $countries));
        if ($s = $request->query('ceiling')) {
            $rows = $rows->filter(fn ($r) => ($s === 'blocked') === ($r['resolution']['ceiling'] === 'BLOCKED'));
        }

        return Inertia::render('Countries/Admin/Pairs', ['rows' => $rows->values(), 'matrix' => CorridorResolver::matrix(), 'filters' => $request->only('ceiling'), 'states' => AvailabilityState::ALL]);
    }

    public function economics(Request $request): Response
    {
        $rate = (float) $request->query('rate', 14) / 100;
        $scenario = $request->query('scenario', 'base');

        return Inertia::render('Countries/Admin/Economics', [
            'result' => Analytics::economics($rate, $scenario),
            'scenarios' => collect(['pessimistic', 'base', 'optimistic'])->mapWithKeys(fn ($s) => [$s => Analytics::economics($rate, $s)])->map(fn ($r) => ['irr' => $r['avg_irr'], 'npv' => $r['npv'], 'positive' => $r['positive']]),
            'params' => ['rate' => $rate * 100, 'scenario' => $scenario],
        ]);
    }

    public function observations(Request $request): Response
    {
        $q = Observation::query()->whereIn('status', ['candidate', 'under_review'])->orWhere('code', 'like', 'L9-OC-%');
        if ($s = $request->query('status')) {
            $q = Observation::where('status', $s);
        }
        $all = Observation::all();

        return Inertia::render('Countries/Admin/Observations', [
            'rows' => $q->orderByDesc('captured_at')->get(),
            'counts' => ['candidate' => $all->where('status', 'candidate')->count(), 'under_review' => $all->where('status', 'under_review')->count(), 'passed' => $all->where('status', 'passed_gate')->count(), 'promoted' => $all->whereIn('status', ['promoted_evidence', 'promoted_product'])->count(), 'retracted' => $all->where('status', 'retracted')->count()],
            'byClass' => $all->countBy('observation_class'), 'bySurface' => $all->countBy('origin_surface'),
            'filters' => $request->only('status'),
        ]);
    }

    public function promotion(Request $request): Response
    {
        $all = Observation::all();
        $rows = Observation::where('code', 'like', 'L9-CAND-%')->orWhereIn('status', ['anonymity_review', 'passed_gate', 'promoted_evidence', 'promoted_product', 'rejected'])->orderByDesc('captured_at')->get();

        return Inertia::render('Countries/Admin/Promotion', [
            'rows' => $rows,
            'counts' => ['awaiting' => $all->where('status', 'anonymity_review')->count(), 'passed' => $all->where('status', 'passed_gate')->count(), 'evidence' => $all->where('status', 'promoted_evidence')->count(), 'product' => $all->where('status', 'promoted_product')->count(), 'rejected' => $all->whereIn('status', ['rejected', 'retracted'])->count()],
            'gate' => AdminActionController::GATE,
        ]);
    }

    public function retractions(): Response
    {
        $all = Retraction::orderByDesc('code')->get();

        return Inertia::render('Countries/Admin/Retractions', [
            'rows' => $all,
            'counts' => ['open' => $all->whereIn('status', ['under_review', 'awaiting_info'])->count(), 'approved' => $all->where('status', 'approved')->count(), 'objects' => $all->where('status', 'approved')->sum('objects_impacted'), 'products' => $all->where('status', 'approved')->sum('products_impacted'), 'outputs' => $all->where('status', 'approved')->sum('outputs_impacted'), 'clients' => $all->sum('clients_notified')],
            'byImpact' => $all->countBy('impact'), 'byStatus' => $all->countBy('status'),
        ]);
    }

    public function agent(Request $request, string $agent): Response
    {
        abort_unless(isset(Agents::AGENTS[$agent]), 404);
        $countries = $this->countries();
        $extra = match ($agent) {
            'country' => ['snapshot' => $countries->map(fn ($c) => [...Present::country($c), 'analyst' => $c->metrics['inv']])->sortByDesc('rcs')->take(8)->values()],
            'corridor' => ['snapshot' => Corridor::orderByDesc('pair_rcs')->get()->map(fn ($c) => Present::corridor($c, $countries->keyBy('iso2')))->take(10)->values()],
            default => ['snapshot' => collect(Agents::ABSENCE_AREAS)->map(fn ($a) => ['area' => $a[0], 'type' => $a[1], 'why' => $a[2], 'risk' => $a[3], 'coverage' => $a[4], 'first' => $a[5], 'updated' => $a[6]])],
        };

        return Inertia::render('Countries/Admin/Agent', [
            'agent' => $agent, 'meta' => Agents::AGENTS[$agent], ...$extra,
            'history' => AgentQuery::where('agent', $agent)->where('user_id', $request->user()->id)->latest('id')->limit(6)->get()->reverse()->values()->map(fn ($q) => ['question' => $q->question, 'answer' => $q->answer, 'at' => $q->created_at->format('H:i')]),
        ]);
    }

    public function releases(Request $request): Response
    {
        return Inertia::render('Countries/Admin/Releases', [
            'rows' => Release::with('creator')->orderByDesc('code')->get()->map(fn ($r) => [...$r->toArray(), 'creator' => $r->creator?->name, 'self' => $r->created_by === $request->user()->id, 'blocking' => ($r->defects['critical'] ?? 0)]),
            'authorities' => AdminActionController::AUTHORITIES,
        ]);
    }

    public function engagements(): Response
    {
        return Inertia::render('Countries/Admin/Engagements', [
            'rows' => Engagement::with('country')->latest()->get()->map(fn ($e) => ['reference' => $e->reference, 'country' => $e->country->name, 'title' => $e->title ?: $e->summary, 'type' => $e->request_type, 'status' => $e->status, 'client' => $e->contact['organisation'] ?? $e->contact['name'], 'created' => $e->created_at->format('d M Y'), 'price_resolution' => CountryResolver::profile($e->country->load('domains'))['price_resolution']]),
            'sovereign' => SovereignEngagement::latest()->get()->map(fn ($e) => ['reference' => $e->reference, 'title' => $e->intake['title'] ?? '', 'stage' => $e->stage, 'status' => $e->status, 'entity' => $e->intake['entity'] ?? '']),
        ]);
    }
}
