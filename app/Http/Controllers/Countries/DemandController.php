<?php

namespace App\Http\Controllers\Countries;

use App\Http\Controllers\Controller;
use App\Models\Countries\Country;
use App\Models\Countries\Engagement;
use App\Models\Countries\Interest;
use App\Support\Countries\CountryResolver;
use App\Support\Countries\Present;
use App\Support\Countries\ServiceCatalogue;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CT-028 waitlist / unmet demand capture (Part 22) and CT-027 quote request.
 * Waitlist entries are voluntary IntentEpisodes, de-duplicated per person,
 * country and service category; public aggregates need n >= 30 (privacy floor).
 */
class DemandController extends Controller
{
    public const PUBLIC_AGGREGATE_MIN = 30;

    public function waitlist(Country $country): Response
    {
        $entries = $country->interests()->latest()->get();
        $n = $entries->count();
        $publish = $n >= self::PUBLIC_AGGREGATE_MIN;
        $catNames = collect(ServiceCatalogue::CATEGORIES)->map(fn ($c) => $c[1]);

        $levels = $entries->countBy('interest_level');
        $byCat = $entries->groupBy(fn ($e) => $e->notes && $country->iso2 === 'ZA' ? $e->notes : ($catNames[$e->service_category] ?? $e->service_category))->map->count()->sortDesc()->take(5);

        return Inertia::render('Countries/Waitlist', [
            'country' => Present::country($country->load('domains')),
            'publish' => $publish,
            'minimum' => self::PUBLIC_AGGREGATE_MIN,
            'stats' => $publish ? [
                'total' => $n,
                'unique' => $entries->unique('email')->count(),
                'categories' => $entries->pluck('service_category')->unique()->count(),
                'levels' => ['high' => $levels['high'] ?? 0, 'medium' => $levels['medium'] ?? 0, 'low' => $levels['low'] ?? 0, 'watchlist' => $levels['watchlist'] ?? 0],
                'byCategory' => $byCat,
                'bySector' => $entries->whereNotNull('sector')->countBy('sector')->sortDesc()->take(5),
                'byProvince' => $entries->whereNotNull('province')->countBy('province')->sortDesc()->take(5),
                'recent' => $entries->take(5)->map(fn ($e) => [$e->organisation ?: 'Individual', $e->notes ?: ($catNames[$e->service_category] ?? ''), $e->interest_level, $e->created_at->format('d M Y')])->values(),
            ] : ['total' => null],
            'categoryOptions' => ServiceCatalogue::categoryOptions(),
            'unavailable' => $country->services()->where('access', '!=', 'available')->get(['code', 'name', 'category'])->map(fn ($s) => ['value' => $s->code, 'label' => $s->name])->values(),
            'canManage' => request()->user()?->role === 'admin',
        ]);
    }

    public function storeInterest(Request $request, Country $country): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'organisation' => ['nullable', 'string', 'max:160'],
            'service_category' => ['required', Rule::in(array_keys(ServiceCatalogue::CATEGORIES))],
            'service_code' => ['nullable', 'string', 'max:40'],
            'sector' => ['nullable', 'string', 'max:80'],
            'province' => ['nullable', 'string', 'max:80'],
            'interest_level' => ['required', Rule::in(['high', 'medium', 'low', 'watchlist'])],
            'consent' => ['accepted'],
        ], ['consent.accepted' => 'Please confirm you agree to be contacted about this market (POPIA-aware processing).']);

        $key = hash('sha256', strtolower(trim($data['email'])).'|'.$country->iso2.'|'.$data['service_category']);
        $existing = Interest::where('episode_key', $key)->first();
        if ($existing) {
            $existing->update(['interest_level' => $data['interest_level'], 'service_code' => $data['service_code'] ?? $existing->service_code]);

            return back()->with('success', 'You are already registered for this market and category — we updated your interest level (repeat intent is de-duplicated).')->with('reference', $existing->reference);
        }

        $interest = Interest::create([
            ...collect($data)->except('consent')->all(),
            'reference' => Reference::make('WL'),
            'country_id' => $country->id,
            'user_id' => $request->user()?->id,
            'episode_key' => $key,
            'language' => session('tbca.language', 'en'),
            'origin_surface' => 'countries',
            'notes' => $data['service_code'] ? optional($country->services()->where('code', $data['service_code'])->first())->name : null,
        ]);

        return back()->with('success', "Interest registered for {$country->name}. This records demand only — it creates no price, commitment or activation.")->with('reference', $interest->reference);
    }

    public function quote(Request $request, Country $country): Response|RedirectResponse
    {
        $profile = CountryResolver::profile($country->load('domains'));
        if (! $profile['quote_permission']) {
            return redirect("/countries/{$country->slug}/waitlist")->with('error', "{$country->name} is a shell country object — quotes are not permitted (AL-7 Waitlist). Register your interest instead.");
        }

        return Inertia::render('Countries/Quote', [
            'country' => Present::country($country, $profile),
            'categoryOptions' => ServiceCatalogue::categoryOptions(),
            'services' => $country->services()->where('access', '!=', 'unavailable')->get(['code', 'name', 'category'])->map(fn ($s) => ['value' => $s->code, 'label' => $s->name, 'category' => $s->category])->values(),
            'preset' => $request->only(['service', 'category']),
        ]);
    }

    public function storeQuote(Request $request, Country $country): RedirectResponse
    {
        $profile = CountryResolver::profile($country->load('domains'));
        abort_unless($profile['quote_permission'], 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'organisation' => ['nullable', 'string', 'max:160'],
            'preferred' => ['nullable', 'in:Email,Phone,WhatsApp'],
            'service_category' => ['required', Rule::in(array_keys(ServiceCatalogue::CATEGORIES))],
            'service_code' => ['nullable', 'string', 'max:40'],
            'request_type' => ['required', 'in:quote,engagement,information'],
            'summary' => ['required', 'string', 'min:20', 'max:1000'],
            'title' => ['nullable', 'string', 'max:160'],
            'scope' => ['nullable', 'string', 'max:1500'],
            'sector' => ['nullable', 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:80'],
            'desired_start' => ['nullable', 'date', 'after_or_equal:today'],
            'budget_range' => ['nullable', 'string', 'max:40'],
            'confirm_accurate' => ['accepted'],
            'confirm_privacy' => ['accepted'],
        ]);

        if (! empty($data['service_code'])) {
            $service = $country->services()->where('code', $data['service_code'])->first();
            if (! $service || $service->access === 'unavailable') {
                return back()->withErrors(['service_code' => 'That service is not provided by TBCA in this country (see the honest absence register).']);
            }
        }

        $n = Engagement::count() + 125;
        $engagement = Engagement::create([
            'reference' => sprintf('ENG-%s-%05d', now()->format('Y'), $n),
            'user_id' => $request->user()?->id,
            'country_id' => $country->id,
            'status' => 'quote_requested',
            'request_type' => $data['request_type'],
            'service_category' => $data['service_category'],
            'service_code' => $data['service_code'] ?? null,
            'title' => $data['title'] ?? null,
            'summary' => $data['summary'],
            'scope' => $data['scope'] ?? null,
            'sector' => $data['sector'] ?? null,
            'region' => $data['region'] ?? null,
            'desired_start' => $data['desired_start'] ?? null,
            'budget_range' => $data['budget_range'] ?? null,
            'contact' => ['name' => $data['name'], 'email' => $data['email'], 'phone' => $data['phone'] ?? null, 'organisation' => $data['organisation'] ?? null, 'country' => $country->name, 'preferred' => $data['preferred'] ?? 'Email'],
        ]);

        return redirect("/countries/quote/{$engagement->reference}")->with('success', 'Quote request received. We will respond within 2 – 3 business days.')->with('reference', $engagement->reference);
    }

    public function quoteStatus(Engagement $engagement): Response
    {
        return Inertia::render('Countries/QuoteStatus', [
            'engagement' => [
                'reference' => $engagement->reference, 'status' => $engagement->status, 'title' => $engagement->title ?: $engagement->summary,
                'category' => ServiceCatalogue::category($engagement->service_category)['name'] ?? $engagement->service_category,
                'request_type' => $engagement->request_type, 'created' => $engagement->created_at->format('d M Y H:i'),
                'country' => $engagement->country->name, 'slug' => $engagement->country->slug,
            ],
            'owns' => $engagement->user_id && $engagement->user_id === request()->user()?->id,
        ]);
    }
}
