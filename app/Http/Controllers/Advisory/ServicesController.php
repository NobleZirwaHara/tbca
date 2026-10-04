<?php

namespace App\Http\Controllers\Advisory;

use App\Http\Controllers\Controller;
use App\Models\Advisory\Service;
use App\Models\Sprint;
use App\Support\Advisory\ServicesContent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Public Services hub: landing, A–Z catalogue, vehicles, families, pillars and capabilities. */
class ServicesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Advisory/Services/Index', [
            'clusters' => ServicesContent::clusters(),
            'featured' => ServicesContent::featured(),
            'needs' => ServicesContent::needs(),
            'categories' => ServicesContent::letterCategories(),
            'sprintCount' => Sprint::query()->count() + Service::query()->count(),
        ]);
    }

    public function atoz(Request $request): Response
    {
        $cats = ServicesContent::letterCategories();
        $letter = strtoupper((string) $request->query('letter', 'A'));
        $letter = $letter === 'ALL' ? 'ALL' : (array_key_exists($letter, $cats) ? $letter : 'A');
        $q = trim((string) $request->query('q', ''));
        $sort = (string) $request->query('sort', 'popularity');
        $delivery = (string) $request->query('delivery', '');

        $query = Service::query()
            ->when($letter !== 'ALL', fn ($b) => $b->where('letter', $letter))
            ->when($q !== '', fn ($b) => $b->where(fn ($w) => $w->where('title', 'like', "%{$q}%")->orWhere('summary', 'like', "%{$q}%")->orWhere('sub_category', 'like', "%{$q}%")))
            ->when($delivery !== '', fn ($b) => $b->where('delivery', $delivery));
        match ($sort) {
            'price-asc' => $query->orderBy('price_zar'),
            'price-desc' => $query->orderByDesc('price_zar'),
            'name' => $query->orderBy('title'),
            default => $query->orderByDesc('popularity'),
        };

        return Inertia::render('Advisory/Services/AtoZ', [
            'categories' => collect($cats)->map(fn ($name, $l) => ['letter' => $l, 'name' => $name, 'count' => 0])->values(),
            'counts' => Service::query()->selectRaw('letter, count(*) as c')->groupBy('letter')->pluck('c', 'letter'),
            'services' => $query->get(['slug', 'letter', 'sub_category', 'title', 'summary', 'price_zar', 'duration', 'delivery']),
            'filters' => ['letter' => $letter, 'q' => $q, 'sort' => $sort, 'delivery' => $delivery],
        ]);
    }

    public function service(string $slug): Response
    {
        $service = Service::query()->where('slug', $slug)->firstOrFail();
        $words = collect(explode(' ', Str::lower($service->title)))
            ->reject(fn ($w) => in_array($w, ['sprint', 'and', '&', 'the', 'support', 'setup', 'design', 'starter'], true) || strlen($w) < 4)->take(2);
        $sprints = Sprint::query()
            ->where(function ($b) use ($words) {
                foreach ($words as $w) {
                    $b->orWhere('title', 'like', "%{$w}%");
                }
            })
            ->limit(6)->get(['slug', 'title', 'summary', 'price_zar', 'delivery', 'category']);
        if ($sprints->isEmpty()) {
            $sprints = Sprint::query()->where('featured', true)->limit(3)->get(['slug', 'title', 'summary', 'price_zar', 'delivery', 'category']);
        }

        return Inertia::render('Advisory/Services/Service', [
            'service' => $service,
            'category' => ServicesContent::letterCategories()[$service->letter],
            'related' => Service::query()->where('letter', $service->letter)->where('id', '!=', $service->id)->orderByDesc('popularity')->limit(4)->get(['slug', 'title', 'price_zar', 'duration']),
            'sprints' => $sprints,
            'vat' => (int) round($service->price_zar * ServicesContent::VAT),
        ]);
    }

    public function ways(): Response
    {
        return Inertia::render('Advisory/Services/Ways', [
            'vehicles' => ServicesContent::vehicles(),
            'enterprise' => ServicesContent::enterpriseMode(),
        ]);
    }

    public function vehicle(string $slug): Response
    {
        $v = collect(ServicesContent::vehicles())->firstWhere('slug', $slug);
        abort_unless($v, 404);
        $cmp = ServicesContent::comparisonVehicles()[$slug === 'sprint' ? 'sprint' : $slug] ?? null;

        return Inertia::render('Advisory/Services/Vehicle', [
            'vehicle' => $v,
            'comparison' => $cmp,
            'others' => collect(ServicesContent::vehicles())->where('slug', '!=', $slug)->take(4)->values(),
        ]);
    }

    public function enterprise(): Response
    {
        return Inertia::render('Advisory/Services/Enterprise');
    }

    public function family(string $slug): Response
    {
        return Inertia::render('Advisory/Services/Family', ['family' => ServicesContent::families()[$slug], 'slug' => $slug]);
    }

    public function capability(string $slug): Response
    {
        $pillars = ServicesContent::pillars();
        if (isset($pillars[$slug])) {
            $p = $pillars[$slug];
            $caps = ServicesContent::capabilities();

            return Inertia::render('Advisory/Services/Pillar', [
                'pillar' => $p,
                'capabilities' => collect($p['capabilities'])->map(fn ($c) => isset($caps[$c]) ? ['slug' => $c, 'title' => $caps[$c]['title'], 'tagline' => $caps[$c]['tagline']] : null)->filter()->values(),
                'ways' => ServicesContent::families()['business-consultancy']['ways'],
            ]);
        }
        $cap = ServicesContent::capabilities()[$slug] ?? abort(404);
        $sprints = Sprint::query()->where('title', 'like', '%'.$cap['kw'].'%')->limit(4)->get(['slug', 'title', 'summary', 'price_zar']);
        $services = Service::query()->where('title', 'like', '%'.Str::title($cap['kw']).'%')->orWhere('summary', 'like', '%'.$cap['kw'].'%')->limit(4)->get(['slug', 'title', 'price_zar', 'duration']);

        return Inertia::render('Advisory/Services/Capability', [
            'capability' => $cap,
            'pillar' => $pillars[$cap['pillar']] ?? null,
            'vehicles' => ServicesContent::comparisonVehicles(),
            'sprints' => $sprints,
            'services' => $services,
            'fromResolver' => session()->has('adv_resolver'),
        ]);
    }
}
