<?php

namespace App\Http\Controllers\CorePages;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Support\CorePages\CountryRegister;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Country Explorer, Country Profile, Evidence Panel, Legal Boundary, Service Detail,
 * Corridor Network and Ledger S, reached from the Find the Right Service journey.
 */
class CountriesController extends Controller
{
    public function explorer(Request $request): Response
    {
        $f = $request->validate([
            'q' => ['nullable', 'string', 'max:60'],
            'region' => ['nullable', 'string', 'max:40'],
            'state' => ['nullable', 'in:'.implode(',', CountryRegister::STATES)],
            'service' => ['nullable', 'string', 'max:40'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per' => ['nullable', 'in:8,54'],
        ]);

        $all = collect(CountryRegister::countries());
        $filtered = $all
            ->when(! empty($f['q']), fn ($c) => $c->filter(fn ($x) => str_contains(strtolower($x['name']), strtolower($f['q']))))
            ->when(! empty($f['region']), fn ($c) => $c->where('region', $f['region']))
            ->when(! empty($f['state']), fn ($c) => $c->where('state', $f['state']))
            // Only activated countries carry commercial services; a service filter therefore narrows to them.
            ->when(! empty($f['service']), fn ($c) => $c->where('state', 'Activated'))
            ->values();

        $per = (int) ($f['per'] ?? 8);
        $page = min((int) ($f['page'] ?? 1), max(1, (int) ceil($filtered->count() / $per)));

        return Inertia::render('CorePages/Countries/Explorer', [
            'countries' => $filtered->forPage($page, $per)->values(),
            'mapCountries' => $all->map(fn ($c) => ['iso' => $c['iso'], 'state' => $c['state']]),
            'total' => $filtered->count(),
            'page' => $page,
            'per' => $per,
            'counts' => collect(CountryRegister::STATES)->mapWithKeys(fn ($s) => [$s => $all->where('state', $s)->count()]),
            'regions' => CountryRegister::regions(),
            'filters' => ['q' => $f['q'] ?? '', 'region' => $f['region'] ?? '', 'state' => $f['state'] ?? '', 'service' => $f['service'] ?? ''],
        ]);
    }

    public function profile(string $iso): Response
    {
        abort_unless(CountryRegister::find($iso), 404);

        return Inertia::render('CorePages/Countries/Profile', [
            'profile' => CountryRegister::profile($iso),
            'services' => strtoupper($iso) === 'ZA' ? array_values(array_map(fn ($s) => collect($s)->only(['code', 'name', 'category', 'status', 'summary'])->all(), CountryRegister::services())) : [],
        ]);
    }

    public function evidence(Request $request, string $iso): Response|RedirectResponse
    {
        $country = $this->activatedOrBack($iso);
        if ($country instanceof RedirectResponse) {
            return $country;
        }

        $f = $request->only(['domain', 'class', 'freshness', 'confidence']);
        $items = collect(CountryRegister::evidenceItems())
            ->when(! empty($f['domain']), fn ($c) => $c->where('domain', $f['domain']))
            ->when(! empty($f['class']), fn ($c) => $c->where('class', $f['class']))
            ->when(! empty($f['freshness']), fn ($c) => $c->where('freshness', $f['freshness']))
            ->when(! empty($f['confidence']), fn ($c) => $c->where('confidence', $f['confidence']))
            ->values();

        return Inertia::render('CorePages/Countries/Evidence', [
            'country' => $country,
            'domains' => CountryRegister::evidenceDomains(),
            'items' => $items,
            'totalItems' => 109,
            'manifest' => CountryRegister::sourceManifest(),
            'classes' => collect(CountryRegister::evidenceItems())->pluck('class')->unique()->values(),
            'filters' => ['domain' => $f['domain'] ?? '', 'class' => $f['class'] ?? '', 'freshness' => $f['freshness'] ?? '', 'confidence' => $f['confidence'] ?? ''],
        ]);
    }

    public function evidencePack(string $iso): HttpResponse
    {
        $country = CountryRegister::find($iso);
        abort_unless($country && $country['state'] === 'Activated', 404);

        $rows = [['ID', 'Evidence Title', 'Domain', 'Source', 'Evidence Class', 'As Of', 'Freshness', 'Confidence', 'Contradictions', 'Status']];
        foreach (CountryRegister::evidenceItems() as $e) {
            $rows[] = array_values($e);
        }
        $csv = collect($rows)->map(fn ($r) => collect($r)->map(fn ($c) => '"'.str_replace('"', '""', (string) $c).'"')->implode(','))->implode("\r\n");

        return response($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="'.$country['iso'].'-evidence-pack.csv"']);
    }

    public function legal(string $iso): Response|RedirectResponse
    {
        $country = $this->activatedOrBack($iso);
        if ($country instanceof RedirectResponse) {
            return $country;
        }

        return Inertia::render('CorePages/Countries/Legal', [
            'country' => $country,
            'legal' => CountryRegister::legal(),
        ]);
    }

    public function service(string $iso, string $code): Response
    {
        $country = CountryRegister::find($iso);
        $service = CountryRegister::services()[strtoupper($code)] ?? null;
        abort_unless($country && $service && $country['state'] === 'Activated', 404);

        return Inertia::render('CorePages/Countries/ServiceDetail', [
            'country' => $country,
            'service' => $service,
            // No ResolvedPricePermit has been issued, so prices stay suppressed.
            'priceResolved' => CountryRegister::priceResolved($country, false),
        ]);
    }

    public function eligibility(Request $request, string $iso, string $code): RedirectResponse
    {
        $country = CountryRegister::find($iso);
        $service = CountryRegister::services()[strtoupper($code)] ?? null;
        abort_unless($country && $service, 404);

        $missing = collect($service['dependencies'])->filter(fn ($ok) => ! $ok)->keys();
        if ($country['state'] !== 'Activated' || $country['rcs'] < 100 || $missing->isNotEmpty()) {
            return back()->with('error', 'Not eligible: resolver dependencies incomplete ('.$missing->implode(', ').'). No Resolution, No Price.');
        }

        return back()->with('success', "Eligible: all resolver dependencies are complete for {$service['name']} in {$country['name']}. Request service access to obtain a ResolvedPricePermit and your quotation.");
    }

    public function requestAccess(Request $request, string $iso, string $code): RedirectResponse
    {
        $service = CountryRegister::services()[strtoupper($code)] ?? abort(404);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $submission = Submission::create([
            'reference' => Reference::make('SAR'),
            'user_id' => $request->user()?->id,
            'type' => 'service-access-request',
            'section' => 'core',
            'subject' => "Service access: {$service['code']} {$service['name']}",
            'name' => $data['name'],
            'email' => $data['email'],
            'payload' => ['country' => strtoupper($iso), 'service' => $service['code'], 'notes' => $data['notes'] ?? null],
        ]);

        return back()->with('success', "Service access requested. Reference {$submission->reference}.")->with('reference', $submission->reference);
    }

    public function network(Request $request): Response
    {
        $f = $request->only(['q', 'arrival', 'evidence', 'confidence']);
        $net = CountryRegister::network();
        $net['routes'] = collect($net['routes'])
            ->when(! empty($f['q']), fn ($c) => $c->filter(fn ($r) => str_contains(strtolower($r['to']), strtolower($f['q']))))
            ->when(! empty($f['arrival']), fn ($c) => $c->where('region', $f['arrival']))
            ->when(! empty($f['evidence']), fn ($c) => $c->where('evidence', $f['evidence']))
            ->when(! empty($f['confidence']), fn ($c) => $c->where('confidence', $f['confidence']))
            ->values()->all();

        return Inertia::render('CorePages/Countries/CorridorNetwork', [
            'network' => $net,
            'filters' => ['q' => $f['q'] ?? '', 'arrival' => $f['arrival'] ?? '', 'evidence' => $f['evidence'] ?? '', 'confidence' => $f['confidence'] ?? ''],
        ]);
    }

    public function ledgerS(Request $request): Response
    {
        $ledger = CountryRegister::ledgerS();
        $jurisdiction = $request->query('jurisdiction');
        $fees = collect($ledger['fees'])->when($jurisdiction, fn ($c) => $c->where('jurisdiction', $jurisdiction))->values();

        return Inertia::render('CorePages/Countries/LedgerS', [
            'ledger' => [...$ledger, 'fees' => $fees],
            'total' => round($fees->sum('amount'), 2),
            'jurisdiction' => $jurisdiction,
        ]);
    }

    public function ledgerSExport(): HttpResponse
    {
        $ledger = CountryRegister::ledgerS();
        $rows = [['#', 'Fee Category', 'Description', 'Jurisdiction', 'Payable To', 'Basis / Trigger', 'Estimated Amount (ZAR)', 'Currency', 'When Payable', 'Evidence Ref.']];
        foreach ($ledger['fees'] as $i => $f) {
            $rows[] = [$i + 1, $f['category'], $f['description'], $f['jurisdiction'], $f['payable_to'], $f['basis'], number_format($f['amount'], 2, '.', ''), 'ZAR', $f['when'], $f['ref']];
        }
        $rows[] = ['', 'Total Estimated Statutory Fees (Model Basis)', '', '', '', '', number_format(collect($ledger['fees'])->sum('amount'), 2, '.', ''), 'ZAR', '', ''];
        $csv = collect($rows)->map(fn ($r) => collect($r)->map(fn ($c) => '"'.str_replace('"', '""', (string) $c).'"')->implode(','))->implode("\r\n");

        return response($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="ledger-s-za-ae.csv"']);
    }

    private function activatedOrBack(string $iso): array|RedirectResponse
    {
        $country = CountryRegister::find($iso) ?? abort(404);
        if ($country['state'] !== 'Activated') {
            return redirect()->route('core.countries.profile', strtolower($country['iso']))
                ->with('error', "{$country['name']} is a shell country object. Detailed evidence and legal boundary views open once it is activated.");
        }

        return $country;
    }
}
