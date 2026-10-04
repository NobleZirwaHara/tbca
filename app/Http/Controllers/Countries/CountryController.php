<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\Corridor;
use App\Models\Countries\Country;
use App\Models\Countries\RegisterEntry;
use App\Support\Countries\AvailabilityState;
use App\Support\Countries\CountryRegister;
use App\Support\Countries\CountryResolver;
use App\Support\Countries\Present;
use App\Support\Countries\ServiceCatalogue;
use App\Support\Countries\TopicContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Country hub pages CT-003 to CT-016, CT-050 and the CT-051..056 registers. */
class CountryController extends Controller
{
    private function base(Country $country): array
    {
        $country->load('domains');
        $profile = CountryResolver::profile($country);

        return [
            'country' => Present::country($country, $profile),
            'profile' => $profile,
            'countries' => Country::orderBy('name')->get()->map(fn ($c) => Present::brief($c))->values(),
        ];
    }

    private function categories(Country $country): array
    {
        $services = $country->services()->get();

        return collect(ServiceCatalogue::CATEGORIES)->map(function ($c, $key) use ($services) {
            $s = $services->where('category', $key);

            return [
                ...ServiceCatalogue::category($key),
                'available' => $s->where('access', 'available')->count(),
                'restricted' => $s->where('access', 'restricted')->count(),
                'unavailable' => $s->where('access', 'unavailable')->count(),
                'dependency' => $s->isEmpty() ? 'Not activated' : 'Complete',
            ];
        })->values()->all();
    }

    public function profile(Country $country): Response
    {
        $updates = $country->entries()->where('register', 'history')->orderByDesc('recorded_on')->limit(4)->get()
            ->map(fn ($e) => [$e->title, $e->recorded_on?->format('d M Y')]);

        return Inertia::render('Countries/Profile', [
            ...$this->base($country),
            'categories' => $this->categories($country),
            'updates' => $updates,
            'manifest' => $country->metrics['source_manifest'] ?? [],
            'interest' => $country->interests()->count(),
        ]);
    }

    public function evidence(Request $request, Country $country): Response
    {
        $q = $country->entries()->where('register', 'evidence')->where('code', 'like', 'EV-25-%');
        if ($d = $request->query('domain')) {
            $q->where('category', $d);
        }

        return Inertia::render('Countries/Evidence', [
            ...$this->base($country),
            'items' => $q->orderBy('sort')->get()->map(fn ($e) => $this->entry($e)),
            'domains' => $country->metrics['evidence_domains'] ?? [],
            'manifest' => $country->metrics['source_manifest'] ?? [],
            'total' => $country->entries()->where('register', 'evidence')->count(),
            'filters' => $request->only('domain'),
            'gaps' => $country->entries()->where('register', 'gaps')->get()->map(fn ($e) => $this->entry($e)),
        ]);
    }

    public function availability(Country $country): Response
    {
        return Inertia::render('Countries/Availability', [
            ...$this->base($country),
            'categories' => $this->categories($country),
            'services' => $this->serviceRows($country, []),
            'history' => $country->entries()->where('register', 'history')->orderByDesc('recorded_on')->get()->map(fn ($e) => $this->entry($e)),
            'limitations' => $country->entries()->where('register', 'limitations')->orderBy('sort')->get()->map(fn ($e) => $this->entry($e)),
        ]);
    }

    private function serviceRows(Country $country, array $f): array
    {
        $profile = CountryResolver::profile($country->loadMissing('domains'));
        $q = $country->services();
        if (! empty($f['q'])) {
            $q->where('name', 'like', '%'.$f['q'].'%');
        }
        if (! empty($f['category'])) {
            $q->where('category', $f['category']);
        }
        if (! empty($f['availability'])) {
            $q->where('access', $f['availability']);
        }
        if (! empty($f['access_type'])) {
            $q->where('access_type', $f['access_type']);
        }
        if (! empty($f['model'])) {
            $q->where('commercial_model', $f['model']);
        }

        return $q->get()->map(fn ($s) => Present::service($s, $country, $profile))->all();
    }

    public function services(Request $request, Country $country): Response
    {
        $filters = $request->only(['q', 'category', 'availability', 'access_type', 'model']);

        return Inertia::render('Countries/Services', [
            ...$this->base($country),
            'categories' => $this->categories($country),
            'services' => $this->serviceRows($country, $filters),
            'filters' => $filters,
            'categoryOptions' => ServiceCatalogue::categoryOptions(),
        ]);
    }

    public function service(Country $country, string $code): Response
    {
        $service = $country->services()->where('code', $code)->firstOrFail();
        $base = $this->base($country);
        $lines = Corridor::where('code', 'COR-SA-AE-001')->first()?->feeLines()->get() ?? collect();

        return Inertia::render('Countries/ServiceDetail', [
            ...$base,
            'service' => [...Present::service($service, $country, $base['profile']), 'details' => $service->details, 'category_name' => ServiceCatalogue::category($service->category)['name']],
            'related' => $country->services()->where('category', $service->category)->where('code', '!=', $code)->limit(6)->get()->map(fn ($s) => Present::service($s, $country, $base['profile'])),
            'eligibility' => session('ctry_eligibility'),
            'ledgers' => array_keys(Present::LEDGERS),
            'history' => $country->entries()->where('register', 'history')->orderByDesc('recorded_on')->limit(5)->get()->map(fn ($e) => $this->entry($e)),
        ]);
    }

    /** GATE-CT-01..04 eligibility check for one service request. */
    public function eligibility(Request $request, Country $country, string $code): RedirectResponse
    {
        $service = $country->services()->where('code', $code)->firstOrFail();
        $data = $request->validate([
            'customer_type' => ['required', 'in:company,sole_proprietor,individual,government'],
            'residency' => ['required', 'string', 'size:2'],
            'currency' => ['required', 'in:ZAR,USD'],
        ]);
        $result = CountryResolver::service($country, $service);
        $notes = [];
        if ($data['currency'] === 'USD') {
            $notes[] = 'USD is a display currency only; the transaction currency resolves to ZAR (no unsupported FX conversion).';
        }
        if (strtoupper($data['residency']) !== $country->iso2) {
            $notes[] = 'Non-resident customer: place-of-supply and withholding treatment require the tax resolver (CT-RES-007) before any price.';
            $result['price_allowed'] = false;
            $result['reasons'][] = 'Cross-border customer context — tax treatment must be resolved for this request.';
        }
        if ($data['customer_type'] === 'government') {
            $notes[] = 'Government and institutional buyers follow the sovereign client route (independence statement required).';
        }

        return back()->with('ctry_eligibility', [...$result, 'notes' => $notes, 'input' => $data, 'checked_at' => now()->format('d M Y H:i')])
            ->with('success', $result['eligible'] ? 'Eligibility check passed for this service.' : 'Eligibility check returned a governed restriction.');
    }

    public function resolver(Country $country): Response
    {
        return Inertia::render('Countries/Resolver', [
            ...$this->base($country),
            'domains' => $country->domains->map(fn ($d) => [
                'key' => $d->key, 'label' => $d->label, 'description' => $d->description, 'required' => $d->required_fields, 'completed' => $d->completed_fields,
                'rcs' => CountryResolver::pct($d->rcs()), 'rcs_value' => $d->rcs(), 'status' => $d->evidence_status, 'verified' => $d->last_verified_at?->format('d M Y'),
                'hard_block_class' => $d->hard_block_class, 'missing' => $d->missing ?? [],
            ]),
            'transitions' => $country->transitions()->limit(6)->get()->map(fn ($t) => ['from' => $t->from_state, 'to' => $t->to_state, 'level' => $t->authority_level, 'reason' => $t->reason, 'at' => $t->created_at->format('d M Y H:i')]),
            'history' => $country->entries()->where('register', 'history')->orderByDesc('recorded_on')->limit(8)->get()->map(fn ($e) => $this->entry($e)),
            'contradictions' => $country->entries()->where('register', 'contradictions')->orderBy('sort')->limit(6)->get()->map(fn ($e) => $this->entry($e)),
        ]);
    }

    /** Re-resolve: recompute the profile now and log the result. Cache may not create authority. */
    public function reResolve(Country $country): RedirectResponse
    {
        $profile = CountryResolver::profile($country->load('domains'));
        $count = $country->entries()->where('register', 'history')->count() + 1;
        RegisterEntry::create([
            'country_id' => $country->id, 'register' => 'history', 'code' => sprintf('CT-CH-%s-R%04d', $country->iso2, $count),
            'title' => 'Context re-resolved', 'category' => 'Permission Change', 'type' => 'Resolver Completeness', 'status' => 'Recorded', 'recorded_on' => now(),
            'data' => ['at' => now()->format('Y-m-d H:i'), 'old' => '—', 'new' => $profile['rcs_label'].' / '.$profile['hard_blocks'].' hard blocks', 'by' => auth()->user()?->name ?? 'Visitor request', 'reason' => 'Re-resolve requested'],
        ]);

        return back()->with('success', $profile['price_resolution']
            ? "Context re-resolved: RCS {$profile['rcs_label']}, 0 hard blocks — price resolution permitted where a service permit exists."
            : "Context re-resolved: RCS {$profile['rcs_label']}, {$profile['hard_blocks']} hard block(s) — prices remain suppressed.");
    }

    public function limitations(Country $country): Response
    {
        return Inertia::render('Countries/Limitations', [
            ...$this->base($country),
            'limitations' => $country->entries()->where('register', 'limitations')->orderBy('sort')->get()->map(fn ($e) => $this->entry($e)),
            'gaps' => $country->entries()->where('register', 'gaps')->orderBy('sort')->get()->map(fn ($e) => $this->entry($e)),
            'manifest' => $country->metrics['source_manifest'] ?? [],
            'absenceCodes' => collect(CountryRegister::ABSENCE)->map(fn ($a, $k) => ['code' => $k, 'reason' => $a[0], 'copy' => CountryRegister::absenceCopy($k)])->values(),
            'history' => $country->entries()->where('register', 'history')->orderByDesc('recorded_on')->limit(6)->get()->map(fn ($e) => $this->entry($e)),
        ]);
    }

    public function topic(Country $country, string $topic): Response
    {
        abort_unless(in_array($topic, TopicContent::TOPICS, true), 404);

        return Inertia::render('Countries/Topic', [
            ...$this->base($country),
            'topic' => TopicContent::for($country, $topic),
            'history' => $country->entries()->where('register', 'history')->orderByDesc('recorded_on')->limit(6)->get()->map(fn ($e) => $this->entry($e)),
        ]);
    }

    public function activationDetail(Country $country): Response
    {
        $base = $this->base($country);
        $ae = Corridor::where('code', 'COR-SA-AE-001')->with('feeLines')->first();

        return Inertia::render('Countries/ActivationDetail', [
            ...$base,
            'evidence' => $country->entries()->where('register', 'evidence')->where('code', 'like', 'EV-SA-%')->orderBy('sort')->limit(8)->get()->map(fn ($e) => $this->entry($e)),
            'evidenceTotal' => $country->entries()->where('register', 'evidence')->count(),
            'outlook' => $country->metrics['ledger_outlook'] ?? null,
            'ledgers' => $ae ? Present::ledgerSummary($ae->feeLines) : null,
            'services' => ['total' => $country->services()->count(), 'available' => $country->services()->where('access', 'available')->count(), 'categories' => count(ServiceCatalogue::CATEGORIES)],
            'transitions' => $country->transitions()->limit(8)->get()->map(fn ($t) => ['from' => $t->from_state, 'to' => $t->to_state, 'level' => $t->authority_level, 'reason' => $t->reason, 'at' => $t->created_at->format('d M Y H:i')]),
        ]);
    }

    public const REGISTERS = [
        'manifest' => ['evidence', 'Country Evidence Manifest', 'Complete manifest of evidence items supporting the activation, permissions, corridors and economics for %s.', 'All Evidence Current'],
        'sources' => ['sources', 'Country Source & Freshness Register', 'Complete register of official sources used for %s activation, with freshness thresholds.', 'All Sources Current'],
        'contradictions' => ['contradictions', 'Country Contradiction Register', 'Register of all data, rule, tariff and regulatory contradictions identified for %s, with evidence and rationale.', 'All Contradictions Resolved'],
        'licences' => ['licences', 'Country Data Licence Status', 'Overview of all data sources, vendors and licences used for %s. Data is licensed, permitted or in the public domain.', 'All Licences Valid'],
        'absences' => ['absences', 'Country Absence Register', 'Register of required data, permissions, evidence or services not applicable, not available or not required for %s.', 'All Absences Accounted For'],
        'history' => ['history', 'Country Change History', 'Audit trail of all changes to country activation data, permissions, evidence, status and configuration for %s.', 'All Changes Recorded'],
    ];

    public function register(Request $request, Country $country, string $register): Response
    {
        abort_unless(isset(self::REGISTERS[$register]), 404);
        [$key, $title, $lead, $chip] = self::REGISTERS[$register];
        $all = $country->entries()->where('register', $key)->orderBy('sort')->orderByDesc('recorded_on')->get();

        $tabField = in_array($register, ['history', 'licences', 'manifest'], true) ? 'category' : ($register === 'absences' ? 'type' : 'category');
        $tabs = $all->groupBy($tabField)->map->count();
        $filtered = $all;
        if ($t = $request->query('tab')) {
            $filtered = $filtered->where($tabField, $t);
        }
        if ($s = $request->query('status')) {
            $filtered = $filtered->where('status', $s);
        }
        if ($i = $request->query('impact')) {
            $filtered = $filtered->where('impact', $i);
        }
        if ($q = $request->query('q')) {
            $filtered = $filtered->filter(fn ($e) => str_contains(strtolower($e->title.' '.$e->code), strtolower($q)));
        }
        $perPage = (int) $request->query('per', 10);
        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('Countries/Register', [
            ...$this->base($country),
            'register' => $register,
            'meta' => ['title' => $title, 'lead' => sprintf($lead, $country->name), 'chip' => $all->isEmpty() ? 'No records held' : $chip],
            'tabs' => $tabs,
            'rows' => $filtered->forPage($page, $perPage)->values()->map(fn ($e) => $this->entry($e)),
            'total' => $filtered->count(),
            'all' => $all->count(),
            'page' => $page,
            'perPage' => $perPage,
            'filters' => $request->only(['tab', 'status', 'impact', 'q']),
            'statuses' => $all->pluck('status')->unique()->values(),
            'impacts' => $all->pluck('impact')->filter()->unique()->values(),
            'breakdown' => [
                'status' => $all->countBy('status'),
                'impact' => $all->countBy('impact'),
                'type' => $all->countBy('type'),
                'month' => $all->groupBy(fn ($e) => $e->recorded_on?->format('M Y'))->map->count(),
            ],
        ]);
    }

    /** Downloadable plain-text brief built from the live records (no hard-coded file). */
    public function brief(Country $country, string $topic): StreamedResponse
    {
        $country->load('domains');
        $p = CountryResolver::profile($country);
        $lines = [
            'THE BUSINESS CLINIC.AFRICA — COUNTRY BRIEF',
            "Country: {$country->name} ({$country->iso2})",
            'State: '.AvailabilityState::label($country->availability_state)." ({$country->availability_state})",
            "Programme: {$country->programme_status}",
            "Resolver Completeness: {$p['rcs_label']} | Hard blocks: {$p['hard_blocks']}",
            'Price resolution: '.($p['price_resolution'] ? 'permitted where a service permit exists' : 'SUPPRESSED — No Resolution, No Price'),
            'Generated: '.now()->format('d M Y H:i').' SAST',
            '',
        ];
        if (in_array($topic, TopicContent::TOPICS, true)) {
            $t = TopicContent::for($country, $topic);
            $lines[] = strtoupper($t['title']);
            $lines[] = $t['lead'];
            foreach ($t['blocks'] as $b) {
                $lines[] = '';
                $lines[] = '## '.$b['title'];
                foreach ($b['rows'] ?? [] as $r) {
                    $lines[] = '- '.implode(' | ', array_filter(array_map(fn ($v) => is_scalar($v) ? (string) $v : null, $r)));
                }
                foreach ($b['items'] ?? [] as $i) {
                    $lines[] = '- '.(is_array($i) ? implode(' — ', array_slice($i, 0, 2)) : $i);
                }
                if (! empty($b['body'])) {
                    $lines[] = $b['body'];
                }
            }
        }
        foreach ($p['missing'] as $m) {
            $lines[] = "UNRESOLVED: {$m['domain']} ({$m['missing_fields']} fields) — {$m['error']} {$m['error_label']}";
        }
        $lines[] = '';
        $lines[] = 'Information only. Not legal or tax advice.';

        return response()->streamDownload(fn () => print(implode("\n", $lines)), "TBCA-{$country->iso2}-{$topic}-brief.txt", ['Content-Type' => 'text/plain']);
    }

    public static function entryArray(RegisterEntry $e): array
    {
        return ['code' => $e->code, 'title' => $e->title, 'category' => $e->category, 'type' => $e->type, 'status' => $e->status, 'impact' => $e->impact, 'date' => $e->recorded_on?->format('d M Y'), 'data' => $e->data ?? []];
    }

    private function entry(RegisterEntry $e): array
    {
        return self::entryArray($e);
    }
}
