<?php

namespace App\Http\Controllers\Products\Retainers;

use App\Http\Controllers\Controller;
use App\Models\Products\Retainers\Service;
use App\Support\Products\Retainers\Catalogue;
use App\Support\Products\Retainers\Engine;
use App\Support\Products\Retainers\Presenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Track A public journey: discover, compare, choose, size, exclusions,
 * utilisation economics and the proposal request. No instant checkout.
 */
class PublicController extends Controller
{
    public function landing(): Response
    {
        $desks = Service::whereNotNull('desk')->orderByDesc('popularity')->get()
            ->sortBy(fn ($s) => array_search($s->desk, ['executive', 'procurement', 'due-diligence', 'project', 'technology', 'custom'], true))
            ->values()->map(fn ($s) => Presenter::service($s));

        return Inertia::render('Products/Retainers/Landing', ['desks' => $desks]);
    }

    public function compare(): Response
    {
        return Inertia::render('Products/Retainers/Compare', ['rows' => Catalogue::comparison()]);
    }

    /** Step 1 of 3: choose a category and a service (server-side search / sort). */
    public function choose(Request $request): Response
    {
        $categories = Catalogue::categories();
        $category = array_key_exists($request->query('category', ''), $categories) ? $request->query('category') : 'executive-advisory';
        $q = trim((string) $request->query('q', ''));
        $sort = in_array($request->query('sort'), ['popularity', 'price_asc', 'price_desc', 'name'], true) ? $request->query('sort') : 'popularity';

        $services = Service::where('category', $category)
            ->where('custom_pricing', false)
            ->when($q !== '', fn ($w) => $w->where(fn ($x) => $x->where('name', 'like', "%{$q}%")->orWhere('summary', 'like', "%{$q}%")))
            ->when($sort === 'popularity', fn ($w) => $w->orderByDesc('popularity'))
            ->when($sort === 'price_asc', fn ($w) => $w->orderBy('price_zar'))
            ->when($sort === 'price_desc', fn ($w) => $w->orderByDesc('price_zar'))
            ->when($sort === 'name', fn ($w) => $w->orderBy('name'))
            ->get();

        $counts = Service::where('custom_pricing', false)->selectRaw('category, count(*) as n')->groupBy('category')->pluck('n', 'category');
        $selected = $request->query('service') ? Service::where('slug', $request->query('service'))->first() : null;

        return Inertia::render('Products/Retainers/Choose', [
            'categories' => collect($categories)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => (int) ($counts[$key] ?? 0)])->values(),
            'category' => $category,
            'services' => $services->map(fn ($s) => Presenter::service($s)),
            'filters' => ['q' => $q, 'sort' => $sort],
            'selected' => $selected ? Presenter::service($selected, true) : null,
        ]);
    }

    public function sizing(Request $request): Response
    {
        $services = Service::where('custom_pricing', false)->where('certification', 'certified')->orderBy('name')->get();

        return Inertia::render('Products/Retainers/Sizing', [
            'services' => $services->map(fn ($s) => Presenter::service($s)),
            'drivers' => Catalogue::drivers(),
            'service' => $request->query('service'),
        ]);
    }

    public function show(Service $service): Response
    {
        return Inertia::render('Products/Retainers/Show', [
            'service' => Presenter::service($service->loadMissing('pool'), true),
            'alternatives' => Service::where('category', $service->category)->where('id', '!=', $service->id)->orderByDesc('popularity')->limit(3)->get()->map(fn ($s) => Presenter::service($s)),
        ]);
    }

    protected function acks(Request $request, Service $service): array
    {
        return $request->session()->get("retainers.acks.{$service->slug}", []);
    }

    /** Step 2: exclusion register (GATE-RE-04). */
    public function exclusions(Request $request, Service $service): Response
    {
        $acks = $this->acks($request, $service);

        return Inertia::render('Products/Retainers/Exclusions', [
            'service' => Presenter::service($service, true),
            'version' => Catalogue::EXCLUSIONS_VERSION,
            'acknowledged' => ($acks['exclusions'] ?? null) === Catalogue::EXCLUSIONS_VERSION,
        ]);
    }

    public function acknowledgeExclusions(Request $request, Service $service): RedirectResponse
    {
        $request->validate(['version' => ['required', 'in:'.Catalogue::EXCLUSIONS_VERSION]], ['version.in' => 'The exclusion register changed. Please review the current version.']);
        $request->session()->put("retainers.acks.{$service->slug}.exclusions", Catalogue::EXCLUSIONS_VERSION);
        if (is_numeric($request->query('allowance'))) {
            $request->session()->put("retainers.allowance.{$service->slug}", (float) $request->query('allowance'));
        }
        Engine::log('re.exclusions.acknowledged', "Exclusions {$request->version} acknowledged for {$service->name}", null, null, ['service' => $service->code]);

        return redirect("/retainers/{$service->slug}/utilisation-economics")->with('success', 'Exclusions acknowledged.');
    }

    /** Step 3: utilisation economics disclosure (GATE-RE-05). */
    public function economics(Request $request, Service $service): Response|RedirectResponse
    {
        $acks = $this->acks($request, $service);
        if (($acks['exclusions'] ?? null) !== Catalogue::EXCLUSIONS_VERSION) {
            return redirect("/retainers/{$service->slug}/exclusions")->with('error', 'Please review and acknowledge the exclusions first.');
        }

        return Inertia::render('Products/Retainers/Economics', [
            'service' => Presenter::service($service, true),
            'version' => Catalogue::DISCLOSURE_VERSION,
            'acknowledged' => ($acks['disclosure'] ?? null) === Catalogue::DISCLOSURE_VERSION,
        ]);
    }

    public function acknowledgeEconomics(Request $request, Service $service): RedirectResponse
    {
        $request->validate(['version' => ['required', 'in:'.Catalogue::DISCLOSURE_VERSION]]);
        $request->session()->put("retainers.acks.{$service->slug}.disclosure", Catalogue::DISCLOSURE_VERSION);
        Engine::log('re.disclosure.acknowledged', "Utilisation disclosure {$request->version} acknowledged for {$service->name}");

        return redirect("/retainers/proposal-request?service={$service->slug}");
    }

    public function proposalRequest(Request $request): Response|RedirectResponse
    {
        $service = Service::where('slug', (string) $request->query('service'))->first();
        if (! $service) {
            return redirect('/retainers/choose')->with('error', 'Choose a Retainer service to request a proposal.');
        }
        $acks = $this->acks($request, $service);
        if (($acks['exclusions'] ?? null) !== Catalogue::EXCLUSIONS_VERSION) {
            return redirect("/retainers/{$service->slug}/exclusions")->with('error', 'Exclusions must be reviewed before a proposal can be requested.');
        }
        if (($acks['disclosure'] ?? null) !== Catalogue::DISCLOSURE_VERSION) {
            return redirect("/retainers/{$service->slug}/utilisation-economics")->with('error', 'Please review the utilisation economics disclosure first.');
        }
        $user = $request->user();

        return Inertia::render('Products/Retainers/ProposalRequest', [
            'service' => Presenter::service($service, true),
            'allowance' => (float) $request->query('allowance', $request->session()->get("retainers.allowance.{$service->slug}", 0)) ?: null,
            'prefill' => $user ? ['organisation' => $user->company, 'email' => $user->email, 'phone' => $user->phone] : null,
            'draft' => $request->session()->get('retainers.proposal_draft'),
        ]);
    }

    public function submitProposalRequest(Request $request): RedirectResponse
    {
        $service = Service::where('slug', (string) $request->input('service'))->firstOrFail();

        if ($request->boolean('save_only')) {
            $request->session()->put('retainers.proposal_draft', $request->except(['_token', 'save_only']));

            return back()->with('success', 'Draft saved. You can return to it at any time in this session.');
        }

        $data = $request->validate([
            'organisation' => ['required', 'string', 'max:160'],
            'country' => ['required', 'string', 'max:60'],
            'role' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'primary_need' => ['required', 'string', 'max:120'],
            'objective' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'min:20', 'max:500'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'duration' => ['required', 'string'],
            'service_level' => ['required', 'in:Standard,Priority,Executive'],
            'budget' => ['nullable', 'string'],
            'heard' => ['nullable', 'string'],
            'owner_model' => ['required', 'in:NAMED_PERSON,DEFINED_ROLE,TEAM'],
            'skills' => ['array'],
            'skills.*' => ['string'],
            'allowance' => ['nullable', 'numeric', 'min:4', 'max:200'],
        ]);

        $acks = $this->acks($request, $service);
        $proposal = Engine::submitRequest($request->user(), $service, $data, $acks);
        $request->session()->forget('retainers.proposal_draft');

        return redirect("/retainers/proposal/{$proposal->reference}")->with('success', $proposal->status === 'issued'
            ? 'Your request was scoped and capacity-tested. Your proposal is ready to review.'
            : 'Your request has been received and is held for review.')->with('reference', $proposal->reference);
    }
}
