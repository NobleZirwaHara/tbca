<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\EvidenceItem;
use App\Models\Advisory\StopRule;
use App\Models\Submission;
use App\Support\Advisory\MandateWorkflow;
use App\Support\Advisory\PaContent;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Public Project Advisory journey: context -> readiness -> cost exposure -> studies -> options -> discovery. */
class PaPublicController extends Controller
{
    private const CTX = 'adv_pa_ctx';

    public static function defaultContext(): array
    {
        return ['country' => 'South Africa', 'sector' => 'infrastructure-transport', 'sponsor' => 'Corporate', 'stage' => 'Structuring', 'size_band' => '50m-250m', 'project_name' => 'Solar PV Manufacturing Plant', 'capital' => 350000000, 'route' => 'fixed-scope'];
    }

    private function ctx(Request $request): array
    {
        return array_merge(self::defaultContext(), $request->session()->get(self::CTX, []));
    }

    /** What the context resolves (P02 right panel). */
    public static function resolve(array $c): array
    {
        $i = array_search($c['stage'], PaContent::STAGES, true);
        $i = $i === false ? 0 : $i;
        $next = PaContent::STAGES[min($i + 1, count(PaContent::STAGES) - 1)];
        $paths = [
            0 => ['project-concept-development', 'feasibility-studies'],
            1 => ['feasibility-studies', 'business-case-strategy'],
            2 => ['feasibility-studies', 'financial-modelling-valuation'],
            3 => ['project-structuring-packaging', 'funding-investor-readiness'],
            4 => ['funding-investor-readiness', 'project-structuring-packaging'],
            5 => ['implementation-support-pmo'],
        ][$i];
        $svcs = PaContent::services();

        return [
            'next_stage' => $next === $c['stage'] ? 'Impact Monitoring' : $next,
            'evidence_available' => $i < 2 ? 'Evidence Limited' : ($i < 4 ? 'Evidence Partial' : 'Evidence Substantial'),
            'evidence_required' => $i >= 2 ? 'Human Review Required' : 'Adviser Review',
            'study_categories' => count(PaContent::studies($c['sector'])).' Categories',
            'permission' => in_array($c['sponsor'], ['Public Sector', 'DFI-backed'], true) ? 'Permission Review Required' : ($i >= 4 ? 'Permission Required' : 'Permission Not Yet Required'),
            'capacity' => $c['size_band'] === 'over-1bn' ? 'Capacity Review' : 'Capacity Available',
            'path' => array_map(fn ($s) => ['slug' => $s, 'name' => $svcs[$s]['name'], 'code' => $svcs[$s]['code']], $paths),
            'gate' => $i <= 1 ? 'G1 – Discovery Method Approval' : 'G4 – Preparation Stage Approval',
        ];
    }

    private function vocab(): array
    {
        return [
            'sectors' => collect(PaContent::SECTORS)->map(fn ($s, $k) => ['key' => $k, 'label' => $s[0], 'icon' => $s[1]])->values(),
            'sponsors' => PaContent::SPONSORS,
            'stages' => PaContent::STAGES,
            'bands' => collect(PaContent::SIZE_BANDS)->map(fn ($b, $k) => ['key' => $k, 'label' => $b[0]])->values(),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('Advisory/ProjectAdvisory/Index', [
            'services' => array_values(PaContent::services()),
            'method' => PaContent::METHOD,
            'ledgers' => PaContent::LEDGERS,
            'sectors' => collect(PaContent::SECTORS)->map(fn ($s, $k) => ['key' => $k, 'label' => $s[0], 'icon' => $s[1]])->values(),
        ]);
    }

    public function context(Request $request): Response
    {
        $c = $this->ctx($request);

        return Inertia::render('Advisory/ProjectAdvisory/Context', ['ctx' => $c, 'resolved' => self::resolve($c), 'saved' => $request->session()->has(self::CTX), ...$this->vocab()]);
    }

    public function contextStore(Request $request): RedirectResponse
    {
        $d = $request->validate([
            'country' => ['required', Rule::in(['South Africa'])],
            'sector' => ['required', Rule::in(array_keys(PaContent::SECTORS))],
            'sponsor' => ['required', Rule::in(PaContent::SPONSORS)],
            'stage' => ['required', Rule::in(PaContent::STAGES)],
            'size_band' => ['required', Rule::in(array_keys(PaContent::SIZE_BANDS))],
            'next' => ['nullable', Rule::in(['save', 'build'])],
        ], ['country.in' => 'Phase 1: South Africa only. Other countries coming soon.']);
        $next = $d['next'] ?? 'build';
        unset($d['next']);
        $request->session()->put(self::CTX, array_merge($request->session()->get(self::CTX, []), $d));

        return $next === 'save'
            ? back()->with('success', 'Project context saved. Continue any time in this session.')
            : redirect()->route('adv.pa.readiness')->with('success', 'Advisory path built from your context.');
    }

    public function service(string $slug): Response
    {
        $svc = PaContent::services()[$slug] ?? abort(404);

        return Inertia::render('Advisory/ProjectAdvisory/Service', [
            'service' => $svc,
            'ledgers' => PaContent::LEDGERS,
            'others' => collect(PaContent::services())->except($slug)->map(fn ($s) => ['slug' => $s['slug'], 'name' => $s['name'], 'price' => $s['price'], 'code' => $s['code']])->values(),
        ]);
    }

    public function readiness(Request $request): Response
    {
        $c = $this->ctx($request);
        $answers = $request->session()->get('adv_pa_readiness', [
            'project-definition' => 'available', 'sponsor-readiness' => 'partial', 'site-rights' => 'missing', 'technical-evidence' => 'human_review',
            'market-evidence' => 'partial', 'financial-information' => 'human_review', 'regulatory-pathway' => 'missing', 'esg-safeguards' => 'partial',
            'funding-readiness' => 'human_review', 'transaction-documentation' => 'missing',
        ]);

        return Inertia::render('Advisory/ProjectAdvisory/Readiness', [
            'ctx' => $c,
            'sectorLabel' => PaContent::SECTORS[$c['sector']][0] ?? '',
            'dimensions' => array_map(fn ($d) => ['key' => $d[0], 'name' => $d[1], 'sub' => $d[2], 'available' => $d[3]['available'], 'gap' => $d[3]['gap']], PaContent::readinessDimensions()),
            'answers' => $answers,
            'points' => PaContent::EVIDENCE_POINTS,
            'result' => PaContent::readinessScore($answers),
            'assessedAt' => $request->session()->get('adv_pa_readiness_at', now()->format('d M Y')),
        ]);
    }

    public function readinessStore(Request $request): RedirectResponse
    {
        $keys = array_column(PaContent::readinessDimensions(), 0);
        $rules = ['project_name' => ['nullable', 'string', 'max:120'], 'capital' => ['nullable', 'integer', 'min:0']];
        foreach ($keys as $k) {
            $rules["answers.{$k}"] = ['required', Rule::in(array_keys(PaContent::EVIDENCE_POINTS))];
        }
        $d = $request->validate($rules);
        $request->session()->put('adv_pa_readiness', $d['answers']);
        $request->session()->put('adv_pa_readiness_at', now()->format('d M Y'));
        $request->session()->put(self::CTX, array_merge($this->ctx($request), array_filter(['project_name' => $d['project_name'] ?? null, 'capital' => $d['capital'] ?? null])));
        $score = PaContent::readinessScore($d['answers']);

        return back()->with('success', "Readiness signal updated: {$score['score']}/100 ({$score['band']}).");
    }

    public function exposure(Request $request): Response
    {
        $c = $this->ctx($request);
        $reuse = $request->session()->get('adv_pa_reuse', ['Market Study' => 'reusable', 'Site Data Pack' => 'partial', 'Financial Inputs' => 'partial', 'Legal Entity Docs' => 'reusable', 'ESG Baseline' => 'missing', 'Prior Feasibility Inputs' => 'human_review', 'Provider Quotes' => 'quote_pending']);
        $stageIdx = array_search($c['stage'], PaContent::STAGES, true) ?: 0;

        return Inertia::render('Advisory/ProjectAdvisory/CostExposure', [
            'ctx' => $c, 'sectorLabel' => PaContent::SECTORS[$c['sector']][0] ?? '', 'bandLabel' => PaContent::SIZE_BANDS[$c['size_band']][0] ?? '',
            'reuse' => $reuse, 'estimate' => PaContent::costExposure($c, $reuse), 'method' => PaContent::METHOD,
            'throughClose' => min(5, $stageIdx + 3), 'savedAt' => $request->session()->get('adv_pa_exposure_at'),
        ]);
    }

    public function exposureStore(Request $request): RedirectResponse
    {
        $d = $request->validate([
            'reuse' => ['array'], 'reuse.*' => [Rule::in(['reusable', 'partial', 'missing', 'human_review', 'quote_pending'])],
            'action' => ['required', Rule::in(['save', 'link'])], 'email' => ['required_if:action,link', 'nullable', 'email'],
        ]);
        $request->session()->put('adv_pa_reuse', $d['reuse'] ?? []);
        $request->session()->put('adv_pa_exposure_at', now()->format('d M Y H:i'));
        if ($d['action'] === 'link') {
            $c = $this->ctx($request);
            $s = Submission::create([
                'reference' => Reference::make('PAE'), 'type' => 'cost-exposure-link', 'section' => 'advisory', 'subject' => 'Path-to-Close estimate: '.$c['project_name'],
                'name' => $request->user()?->name ?? 'Guest', 'email' => $d['email'], 'payload' => ['context' => $c, 'estimate' => PaContent::costExposure($c, $d['reuse'] ?? [])['subtotals']], 'status' => 'received',
            ]);

            return back()->with('success', "A secure link to this estimate has been sent to {$d['email']}.")->with('reference', $s->reference);
        }

        return back()->with('success', 'Estimate saved. Continue building your advisory path.');
    }

    public function studies(Request $request): Response
    {
        $c = $this->ctx($request);
        $sector = $request->query('sector', $c['sector']);
        $sector = array_key_exists($sector, PaContent::SECTORS) ? $sector : 'energy-resources';
        $rows = PaContent::studies($sector);
        $path = $request->session()->get('adv_pa_studies', []);

        return Inertia::render('Advisory/ProjectAdvisory/Studies', [
            'ctx' => $c, 'sector' => $sector, 'sectorLabel' => PaContent::SECTORS[$sector][0], 'studies' => $rows, 'path' => $path,
            'snapshot' => ['active' => count($rows), 'reusable' => count(array_filter($rows, fn ($r) => $r['reuse'] === 'Reusable' && $r['evidence'] !== 'missing')), 'pending' => count(array_filter($rows, fn ($r) => str_contains($r['quote'], 'Pending'))), 'review' => count(array_filter($rows, fn ($r) => $r['evidence'] === 'human_review'))],
            ...$this->vocab(),
        ]);
    }

    public function studiesStore(Request $request): RedirectResponse
    {
        $d = $request->validate(['study' => ['required', 'string', 'max:120'], 'action' => ['required', Rule::in(['add', 'remove', 'evidence'])]]);
        $path = $request->session()->get('adv_pa_studies', []);
        if ($d['action'] === 'evidence') {
            $s = Submission::create(['reference' => Reference::make('PRE'), 'type' => 'provider-evidence-request', 'section' => 'advisory', 'subject' => 'Provider evidence: '.$d['study'], 'name' => $request->user()?->name ?? 'Guest', 'email' => $request->user()?->email ?? 'guest@tbca.local', 'payload' => ['study' => $d['study']], 'status' => 'received']);

            return back()->with('success', 'Provider evidence requested.')->with('reference', $s->reference);
        }
        $path = $d['action'] === 'add' ? array_values(array_unique([...$path, $d['study']])) : array_values(array_diff($path, [$d['study']]));
        $request->session()->put('adv_pa_studies', $path);

        return back()->with('success', $d['action'] === 'add' ? "{$d['study']} added to your advisory path." : "{$d['study']} removed.");
    }

    public function options(Request $request): Response
    {
        return Inertia::render('Advisory/ProjectAdvisory/Options', ['data' => PaContent::engagementOptions(), 'selected' => $this->ctx($request)['route']]);
    }

    public function optionsStore(Request $request): RedirectResponse
    {
        $d = $request->validate(['route' => ['required', Rule::in(['fixed-scope', 'recurring-advisory', 'contingent', 'co-advisory'])]]);
        $request->session()->put(self::CTX, array_merge($this->ctx($request), $d));

        return redirect()->route('adv.pa.discovery')->with('success', 'Engagement route selected. Complete your discovery request.');
    }

    public function discovery(Request $request): Response
    {
        $c = $this->ctx($request);
        $u = $request->user();

        return Inertia::render('Advisory/ProjectAdvisory/Discovery', [
            'prefill' => [
                'organisation' => $u?->company ?? '', 'contact' => $u ? "{$u->name}, {$u->job_title}" : '', 'email' => $u?->email ?? '',
                'country' => $c['country'], 'sector' => PaContent::SECTORS[$c['sector']][0], 'project_stage' => $c['stage'],
                'capital' => PaContent::SIZE_BANDS[$c['size_band']][0], 'route' => $c['route'], 'project_name' => $c['project_name'],
            ],
            'options' => [
                'sectors' => array_column(PaContent::SECTORS, 0), 'stages' => PaContent::STAGES, 'bands' => array_column(PaContent::SIZE_BANDS, 0),
                'studies' => ['None yet', 'Pre-feasibility or concept note', 'Feasibility study completed', 'Full investor pack'],
                'decisions' => ['Go / no-go on feasibility', 'Choose project structure', 'Approach funders', 'Board investment approval', 'Select implementation partner'],
                'timelines' => ['Within 1 month', '1–3 months', '3–6 months', '6–12 months'],
                'routes' => ['fixed-scope' => 'Fixed Scope', 'recurring-advisory' => 'Recurring Advisory', 'contingent' => 'Contingent', 'co-advisory' => 'Co-Advisory / Partner-Supported'],
                'countries' => ['South Africa', 'Other African country'],
            ],
            'p03' => PaContent::FEE_REGISTER['P03'][2],
        ]);
    }

    public function discoveryStore(Request $request): RedirectResponse
    {
        $d = $request->validate([
            'entry' => ['required', Rule::in(['intake', 'discovery'])],
            'organisation' => ['required', 'string', 'max:160'], 'contact' => ['required', 'string', 'max:160'], 'email' => ['required', 'email'],
            'country' => ['required', 'string'], 'sector' => ['required', Rule::in(array_column(PaContent::SECTORS, 0))],
            'project_stage' => ['required', Rule::in(PaContent::STAGES)], 'project_name' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'], 'capital' => ['required', Rule::in(array_column(PaContent::SIZE_BANDS, 0))],
            'existing_studies' => ['nullable', 'string'], 'funding_status' => ['required', Rule::in(['Not Started', 'Seeking', 'Part-Funded', 'Fully Funded'])],
            'decision' => ['required', 'string'], 'timeline' => ['required', 'string'], 'route' => ['required', Rule::in(['fixed-scope', 'recurring-advisory', 'contingent', 'co-advisory'])],
        ]);
        if ($d['entry'] === 'discovery' && ! $request->user()) {
            $request->session()->put('url.intended', route('adv.pa.discovery'));

            return redirect()->route('login')->with('error', 'Please sign in to purchase Structured Discovery (P03).');
        }
        $mandate = MandateWorkflow::createFromIntake($d, $request->user());
        if ($mandate->country !== 'South Africa') {
            $mandate->update(['status' => 'declined']);
            $mandate->log('System', 'Stop-Now SN-04: jurisdiction not active in Phase 1');

            return back()->with('error', 'Stop-Now (SN-04): Phase 1 Project Advisory is only available in South Africa. We have recorded your enquiry for when your country opens.')->with('reference', $mandate->reference);
        }
        if ($d['entry'] === 'discovery') {
            return redirect()->route('checkout.show', MandateWorkflow::discoveryOrder($mandate, $request->user()));
        }

        return $request->user()
            ? redirect()->route('adv.pa.ws.show', $mandate)->with('success', 'Project intake received. A reviewer will qualify your project.')->with('reference', $mandate->reference)
            : back()->with('success', 'Project intake received. We will confirm eligibility and likely routing.')->with('reference', $mandate->reference);
    }

    public function evidence(Request $request): Response
    {
        $f = $request->only(['type', 'industry', 'country', 'quality', 'from', 'to', 'verified']);
        $q = EvidenceItem::query()
            ->when($f['type'] ?? null, fn ($b, $v) => $b->where('type', $v))
            ->when($f['industry'] ?? null, fn ($b, $v) => $b->where('industry', $v))
            ->when($f['country'] ?? null, fn ($b, $v) => $b->where('country', $v))
            ->when($f['quality'] ?? null, fn ($b, $v) => $b->where('quality', $v))
            ->when($f['from'] ?? null, fn ($b, $v) => $b->whereDate('verified_on', '>=', $v))
            ->when($f['to'] ?? null, fn ($b, $v) => $b->whereDate('verified_on', '<=', $v))
            ->when(($f['verified'] ?? '1') === '1', fn ($b) => $b->where('verified', true))
            ->orderByDesc('verified_on');
        $all = EvidenceItem::query()->get();
        $limit = min(50, (int) $request->query('limit', 5));

        return Inertia::render('Advisory/ProjectAdvisory/Evidence', [
            'items' => $q->limit($limit)->get()->map(fn ($e) => [...$e->toArray(), 'verified_on' => $e->verified_on->format('d M Y')]),
            'more' => $q->count() > $limit, 'limit' => $limit, 'filters' => ['verified' => '1', ...$f],
            'options' => ['types' => $all->pluck('type')->unique()->values(), 'industries' => $all->pluck('industry')->unique()->values(), 'countries' => $all->pluck('country')->unique()->values()],
            'quality' => $all->groupBy('quality')->map->count(), 'total' => $all->count(),
        ]);
    }

    public function contingent(Request $request): Response
    {
        $amount = max(1_000_000, min(500_000_000, (int) $request->query('amount', 40_000_000)));

        return Inertia::render('Advisory/ProjectAdvisory/Contingent', ['calc' => PaContent::contingent($amount), 'mandate' => null, 'blocks' => null]);
    }

    public function stopNow(): Response
    {
        return Inertia::render('Advisory/ProjectAdvisory/StopNow', [
            'rules' => StopRule::query()->orderBy('code')->get(),
            'activeBlocks' => 0,
        ]);
    }
}
