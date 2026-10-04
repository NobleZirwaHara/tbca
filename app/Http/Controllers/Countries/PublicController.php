<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\Country;
use App\Models\Countries\RegisterEntry;
use App\Support\Countries\AvailabilityState;
use App\Support\Countries\CorridorResolver;
use App\Support\Countries\CountryRegister;
use App\Support\Countries\CountryResolver;
use App\Support\Countries\Present;
use App\Support\Countries\ServiceCatalogue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** CT-001 landing, CT-002 explorer, CT-049 public activation ledger, CT-009 selection impact. */
class PublicController extends Controller
{
    private function counts($countries): array
    {
        $buckets = $countries->groupBy(fn ($c) => AvailabilityState::bucket($c->availability_state))->map->count();

        return [
            'total' => $countries->count(),
            'activated' => $buckets['activated'] ?? 0,
            'shell' => $buckets['shell'] ?? 0,
            'degraded' => $buckets['degraded'] ?? 0,
            'suspended' => $buckets['suspended'] ?? 0,
            'restricted' => $buckets['restricted'] ?? 0,
            'sellable_corridors' => CorridorResolver::sellableCount(),
            'raw_topology' => CorridorResolver::rawDirectionalTopology(),
            'regions' => $countries->groupBy('region')->map->count(),
        ];
    }

    public function landing(): Response
    {
        $countries = Country::with('domains')->orderBy('name')->get();
        $za = $countries->firstWhere('iso2', 'ZA');
        $updates = RegisterEntry::where('register', 'history')->where('country_id', $za->id)->orderByDesc('recorded_on')->limit(4)->get()
            ->map(fn ($e) => ['title' => $e->title.' — '.$e->type, 'detail' => ($e->data['old'] ?? '').' → '.($e->data['new'] ?? ''), 'date' => $e->recorded_on?->format('d M Y')]);

        return Inertia::render('Countries/Landing', [
            'counts' => $this->counts($countries),
            'featured' => Present::country($za),
            'countries' => $countries->map(fn ($c) => Present::brief($c))->values(),
            'updates' => $updates,
        ]);
    }

    public function explorer(Request $request): Response
    {
        $filters = $request->only(['q', 'region', 'state', 'category', 'view']);
        $all = Country::with('domains')->orderBy('name')->get();
        $rows = $all->map(fn ($c) => Present::country($c));

        $rows = $rows->filter(function ($r) use ($filters) {
            if (! empty($filters['q']) && ! str_contains(strtolower($r['name']), strtolower($filters['q'])) && strtolower($r['iso2']) !== strtolower($filters['q'])) {
                return false;
            }
            if (! empty($filters['region']) && $r['region'] !== $filters['region']) {
                return false;
            }
            if (! empty($filters['state']) && $r['bucket'] !== $filters['state']) {
                return false;
            }
            // Service categories exist only where a catalogue has been activated.
            if (! empty($filters['category']) && ! $r['activated']) {
                return false;
            }

            return true;
        })->values();

        $perPage = ($filters['view'] ?? 'list') === 'grid' ? 12 : 8;
        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('Countries/Explorer', [
            'counts' => $this->counts($all),
            'rows' => $rows->forPage($page, $perPage)->values(),
            'total' => $rows->count(),
            'page' => $page,
            'perPage' => $perPage,
            'filters' => $filters,
            'regions' => CountryRegister::REGIONS,
            'categories' => ServiceCatalogue::categoryOptions(),
            'countries' => $all->map(fn ($c) => Present::brief($c))->values(),
        ]);
    }

    public function activation(): Response
    {
        $countries = Country::with('domains')->orderBy('name')->get();
        $za = $countries->firstWhere('iso2', 'ZA');

        return Inertia::render('Countries/ActivationLedger', [
            'counts' => $this->counts($countries),
            'rows' => $countries->map(fn ($c) => [
                ...Present::country($c),
                'scope' => $c->iso2 === 'ZA' ? 'Service-by-service resolver permission (76 of 102 services available)' : 'None — geographic / data shell only',
                'limitation' => $c->iso2 === 'ZA' ? 'Not a blanket country-wide commercial permission.' : 'No transaction; no numeric price; sovereign source sweep required.',
                'version' => $c->iso2 === 'ZA' ? 'PAL-ZA-v4' : 'PAL-'.$c->iso2.'-v1',
            ])->values(),
            'za' => Present::country($za),
            'outlook' => $za->metrics['ledger_outlook'] ?? null,
        ]);
    }

    public function compare(Request $request, Country $country): Response
    {
        $countries = Country::with('domains')->orderBy('name')->get();
        $otherIso = strtoupper((string) $request->query('with', $country->iso2 === 'ZA' ? 'KE' : 'ZA'));
        $other = $countries->firstWhere('iso2', $otherIso) ?? $countries->firstWhere('iso2', 'KE');

        $side = function (Country $c) {
            $p = CountryResolver::profile($c);
            $services = $c->services()->get();
            $available = $services->where('access', 'available')->count();

            return [
                'country' => Present::country($c, $p),
                'factors' => [
                    'Activation State' => [AvailabilityState::label($c->availability_state), $p['transaction_permission'] ? 'Commercially active' : 'Shell environment', $p['transaction_permission']],
                    'Services Available' => [$available.' of 102', round($available / 102 * 100, 1).'%', $available > 0],
                    'Resolver Completeness (RCS)' => [$p['rcs_label'], $p['rcs'] >= 100 ? 'All critical fields complete' : count($p['missing']).' domain(s) incomplete', $p['rcs'] >= 100],
                    'Pricing' => [$p['price_resolution'] ? 'Price Resolution Permitted' : 'Price Suppressed', $p['price_resolution'] ? 'Price shown only where a service permit exists' : 'No price without resolution', $p['price_resolution']],
                    'Tax & Statutory' => [$c->iso2 === 'ZA' ? 'Tax treatment resolved' : 'No tax treatment', $c->iso2 === 'ZA' ? 'VAT, PAYE, duties defined' : 'Resolution required', $c->iso2 === 'ZA'],
                    'Payment Methods' => [$c->iso2 === 'ZA' ? 'Methods verified by context' : 'Not configured', $c->iso2 === 'ZA' ? 'EFT, card, invoice (conditional)' : 'No payment methods', $c->iso2 === 'ZA'],
                    'Legal & Regulatory' => [$c->iso2 === 'ZA' ? 'Clear framework' : 'Unknown', $c->iso2 === 'ZA' ? 'Operating within mandate' : 'Legal review required', $c->iso2 === 'ZA'],
                    'Data & Privacy' => [$c->iso2 === 'ZA' ? 'POPIA compliant' : 'Not assessed', $c->iso2 === 'ZA' ? 'Data residency confirmed' : 'Privacy assessment needed', $c->iso2 === 'ZA'],
                    'Commercial Conditions' => ['No resolution, no price', 'Standard commercial rule', true],
                    'Deployment Readiness' => [$c->iso2 === 'ZA' ? 'Production' : 'Not started', $c->iso2 === 'ZA' ? 'Live and supported (scope-limited)' : 'No deployment activity', $c->iso2 === 'ZA'],
                ],
                'missing' => $p['missing'],
            ];
        };

        $a = $side($country);
        $b = $side($other);
        $impacts = [];
        foreach ($a['factors'] as $factor => $va) {
            $vb = $b['factors'][$factor];
            $impacts[$factor] = match (true) {
                $factor === 'Commercial Conditions' => ['positive', 'No change'],
                $va[2] && $vb[2] => ['positive', 'No change'],
                ! $vb[2] && $factor === 'Activation State' && $other->availability_state === AvailabilityState::RESTRICTED => ['blocked', 'Restricted — no commercial override'],
                ! $vb[2] && $factor === 'Pricing' => ['blocked', 'Pricing unavailable'],
                ! $vb[2] => ['action', ['Activation State' => 'Services not commercially available', 'Services Available' => 'No services available', 'Resolver Completeness (RCS)' => 'Complete resolver required', 'Tax & Statutory' => 'Tax resolution required', 'Payment Methods' => 'Payment setup required', 'Legal & Regulatory' => 'Legal confirmation required', 'Data & Privacy' => 'Privacy assessment required', 'Deployment Readiness' => 'Deployment required'][$factor] ?? 'Requires action'],
                default => ['info', 'Compared country is stronger on this factor'],
            };
        }
        $summary = collect($impacts)->countBy(fn ($i) => $i[0]);

        return Inertia::render('Countries/Impact', [
            'a' => $a, 'b' => $b, 'impacts' => $impacts,
            'summary' => ['positive' => $summary['positive'] ?? 0, 'action' => $summary['action'] ?? 0, 'blocked' => $summary['blocked'] ?? 0, 'info' => $summary['info'] ?? 0],
            'ready' => CountryResolver::profile($other)['transaction_permission'],
            'countries' => $countries->map(fn ($c) => Present::brief($c))->values(),
        ]);
    }
}
