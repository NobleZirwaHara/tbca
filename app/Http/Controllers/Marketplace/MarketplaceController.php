<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Engagement;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\Provider;
use App\Models\Marketplace\Review;
use App\Models\SavedItem;
use App\Support\Marketplace\Content;
use App\Support\Marketplace\Options;
use App\Support\Marketplace\Packages;
use App\Support\Marketplace\Presenter;
use App\Support\Platform\Checkout;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Public marketplace: landing, process, catalogue, service pages, provider directory and profiles. */
class MarketplaceController extends Controller
{
    public function landing(): Response
    {
        $featured = Listing::with('provider')->where('status', 'published')->whereIn('kind', ['fixed', 'recurring'])
            ->orderByDesc('popularity')->limit(4)->get()->map(fn ($l) => Presenter::listing($l));

        $matched = Provider::where('kind', 'marketplace')->where('status', 'active')->orderByDesc('rating')->limit(3)->get()
            ->map(fn ($p, $i) => [
                'name' => $p->name, 'slug' => $p->slug, 'rating' => $p->rating,
                'match' => [98, 96, 94][$i] ?? 90, 'days' => $p->profile['typical_days'] ?? 10, 'cost' => $p->profile['base_rate'] ?? 30000,
            ]);

        return Inertia::render('Marketplace/Landing', [
            'content' => Content::landing(),
            'featured' => $featured,
            'matched' => $matched,
            'options' => Options::forBrief(),
            'spotlight' => Presenter::provider(Provider::where('kind', 'marketplace')->where('status', 'active')->orderByDesc('engagements_count')->first()),
        ]);
    }

    public function howItWorks(): Response
    {
        return Inertia::render('Marketplace/HowItWorks', ['content' => Content::howItWorks()]);
    }

    /** Server-side search, filter and sort over published listings. */
    public function catalogue(Request $request): Response
    {
        $filters = $request->only(['q', 'category', 'type', 'sort', 'max']);
        $query = Listing::with('provider')->where('status', 'published')->whereIn('kind', ['fixed', 'recurring']);

        if ($q = trim((string) ($filters['q'] ?? ''))) {
            $like = '%'.mb_strtolower($q).'%';
            $query->where(fn ($w) => $w->whereRaw('lower(title) like ?', [$like])->orWhereRaw('lower(summary) like ?', [$like])->orWhereRaw('lower(subcategory) like ?', [$like]));
        }
        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (! empty($filters['type'])) {
            $query->where('kind', $filters['type']);
        }
        if (! empty($filters['max'])) {
            $query->where('price_zar', '<=', (int) $filters['max']);
        }

        match ($filters['sort'] ?? 'popular') {
            'price_asc' => $query->orderBy('price_zar'),
            'price_desc' => $query->orderByDesc('price_zar'),
            'rating' => $query->orderByDesc('rating'),
            'newest' => $query->orderByDesc('created_at'),
            default => $query->orderByDesc('popularity'),
        };

        $counts = Listing::where('status', 'published')->whereIn('kind', ['fixed', 'recurring'])
            ->selectRaw('category, count(*) as n')->groupBy('category')->pluck('n', 'category');

        return Inertia::render('Marketplace/Catalogue', [
            'listings' => $query->get()->map(fn ($l) => Presenter::listing($l)),
            'filters' => $filters,
            'categories' => collect(Options::CATEGORIES)->map(fn ($label, $key) => ['value' => $key, 'label' => $label, 'count' => $counts[$key] ?? 0])->values(),
        ]);
    }

    public function listing(Request $request, Listing $listing): Response
    {
        abort_unless($listing->status === 'published' && $listing->kind !== 'partner', 404);
        $listing->load('provider');
        $user = $request->user();

        $canReview = $user && Engagement::where('listing_id', $listing->id)->where('user_id', $user->id)
            ->whereHas('order', fn ($q) => $q->where('status', 'paid'))->exists()
            && ! Review::where('listing_id', $listing->id)->where('user_id', $user->id)->exists();

        $saved = $user && SavedItem::where('user_id', $user->id)->where('item_type', 'marketplace-service')->where('item_key', $listing->slug)->exists();

        $presented = Presenter::listing($listing);
        $selected = $request->query('package');

        return Inertia::render('Marketplace/Service', [
            'listing' => $presented,
            'comparison' => Packages::comparison($presented['packages']),
            'selectedPackage' => array_key_exists((string) $selected, Packages::KEYS) ? $selected : 'standard',
            'initialTab' => in_array($request->query('tab'), ['overview', 'packages', 'inputs', 'process'], true) ? $request->query('tab') : 'overview',
            'provider' => Presenter::provider($listing->provider),
            'reviews' => $listing->reviews()->where('status', 'published')->latest()->limit(20)->get()
                ->map(fn ($r) => ['author' => $r->author, 'company' => $r->company, 'rating' => $r->rating, 'body' => $r->body, 'date' => $r->created_at->format('d M Y')]),
            'canReview' => $canReview,
            'saved' => $saved,
            'related' => Listing::where('status', 'published')->where('category', $listing->category)->where('id', '!=', $listing->id)
                ->whereIn('kind', ['fixed', 'recurring'])->limit(3)->get()->map(fn ($l) => Presenter::listing($l)),
        ]);
    }

    /** Buy a fixed-scope service or subscribe to a recurring service. Creates the engagement shell and the order. */
    public function order(Request $request, Listing $listing): RedirectResponse
    {
        abort_unless($listing->status === 'published' && in_array($listing->kind, ['fixed', 'recurring'], true), 404);
        abort_if($listing->provider && ! $listing->provider->isRoutable(), 422, 'This provider is not currently accepting work.');

        $data = $request->validate(['plan' => 'nullable|in:full,instalments', 'package' => 'nullable|in:'.implode(',', array_keys(Packages::KEYS))]);
        $user = $request->user();

        if (! $user) {
            return redirect()->guest(route('login'))->with('error', 'Please sign in to order a marketplace service.');
        }

        $recurring = $listing->kind === 'recurring';
        $package = Packages::find($listing, $data['package'] ?? 'standard');
        $price = (int) ($package['priceZar'] ?? $listing->price_zar);
        $order = Checkout::createOrder([[
            'item_type' => $recurring ? 'marketplace-subscription' : 'marketplace-service',
            'item_code' => 'MKT-'.$listing->id,
            'name' => $listing->title.' – '.$package['name'].' Package'.($recurring ? ' (first month)' : ''),
            'unit_zar' => $price,
            'variant' => $package['name'].($recurring ? ' · monthly' : (($data['plan'] ?? 'full') === 'instalments' ? ' · 3 instalments' : '')),
        ]], $user, 'marketplace', [
            'return_url' => route('marketplace.my', absolute: false),
            'title' => $recurring ? 'Marketplace subscription' : 'Marketplace service order',
            'listing' => $listing->slug,
            'package' => $package['key'],
        ]);

        Engagement::create([
            'reference' => \App\Support\Marketplace\BriefService::engagementReference(),
            'assignment_ref' => Reference::make('ASN'),
            'listing_id' => $listing->id,
            'user_id' => $user->id,
            'provider_id' => $listing->provider_id,
            'order_id' => $order->id,
            'title' => $listing->title,
            'service' => $listing->title,
            'category' => $listing->category,
            'client_name' => $user->company ?: $user->name,
            'stage' => 'awaiting_payment',
            'value_zar' => $price,
            'provider_rate_zar' => (int) round($price * 0.6),
            'qa_standard' => $listing->details['qa_standard'] ?? 'MP-QA-MR-02 v2.1',
            'target_date' => now()->addDays($recurring ? 30 : 10),
            'meta' => ['recurring' => $recurring, 'package' => ['key' => $package['key'], 'name' => $package['name'], 'price_zar' => $price, 'delivery' => $package['delivery'] ?? null, 'scope' => $package['scope'] ?? null], 'timeline' => [], 'documents' => [['Contract & Scope', 'Approved'], ['Provider Work Plan', 'Pending'], ['Deliverable v1.0', 'Pending'], ['Evidence Pack', 'Pending']]],
        ]);

        return redirect()->route('checkout.show', $order);
    }

    /** Only buyers with a paid engagement for the service may review it, once. */
    public function review(Request $request, Listing $listing): RedirectResponse
    {
        $user = $request->user();
        $eligible = Engagement::where('listing_id', $listing->id)->where('user_id', $user->id)
            ->whereHas('order', fn ($q) => $q->where('status', 'paid'))->exists();
        abort_unless($eligible, 403, 'Only clients who purchased this service can review it.');
        abort_if(Review::where('listing_id', $listing->id)->where('user_id', $user->id)->exists(), 422, 'You have already reviewed this service.');

        $data = $request->validate(['rating' => 'required|integer|min:1|max:5', 'body' => 'required|string|min:10|max:1000']);

        Review::create([
            'listing_id' => $listing->id,
            'provider_id' => $listing->provider_id,
            'user_id' => $user->id,
            'author' => $user->name,
            'company' => $user->company,
            'rating' => $data['rating'],
            'body' => $data['body'],
        ]);

        $stats = Review::where('listing_id', $listing->id)->where('status', 'published')->selectRaw('avg(rating) as a, count(*) as n')->first();
        $listing->update(['rating' => round((float) $stats->a, 1), 'reviews_count' => max($listing->reviews_count + 1, (int) $stats->n)]);

        return back()->with('success', 'Thank you – your review has been published.');
    }

    /** Provider directory (MP-SCR-014): search, category, country, tier filters; sort by rating / engagements / response. */
    public function providers(Request $request): Response
    {
        $filters = $request->only(['q', 'category', 'country', 'tier', 'sort']);
        $query = Provider::where('kind', 'marketplace')->whereIn('status', ['active', 'active_with_conditions']);

        if ($q = trim((string) ($filters['q'] ?? ''))) {
            $like = '%'.mb_strtolower($q).'%';
            $query->where(fn ($w) => $w->whereRaw('lower(name) like ?', [$like])->orWhereRaw('lower(city) like ?', [$like]));
        }
        foreach (['category', 'country', 'tier'] as $f) {
            if (! empty($filters[$f])) {
                $query->where($f, $filters[$f]);
            }
        }
        match ($filters['sort'] ?? 'rating') {
            'engagements' => $query->orderByDesc('engagements_count'),
            'name' => $query->orderBy('name'),
            default => $query->orderByDesc('rating'),
        };

        return Inertia::render('Marketplace/Providers', [
            'providers' => $query->get()->map(fn ($p) => Presenter::provider($p)),
            'filters' => $filters,
            'categories' => Options::select(Options::CATEGORIES),
            'countries' => Options::select(Options::COUNTRIES),
            'tiers' => ['Gold', 'Silver', 'Bronze'],
        ]);
    }

    /** Provider Rating & Tier profile (MP-SCR-024). */
    public function provider(Request $request, Provider $provider): Response
    {
        abort_unless($provider->kind === 'marketplace' && ! in_array($provider->status, ['applied', 'rejected'], true), 404);

        $breakdown = collect([5, 4, 3, 2, 1])->mapWithKeys(fn ($s) => [$s => $provider->profile['rating_breakdown'][$s] ?? 0]);
        $own = $provider->reviews()->where('status', 'published')->get();
        foreach ($own as $r) {
            $breakdown[$r->rating] = ($breakdown[$r->rating] ?? 0) + 1;
        }

        return Inertia::render('Marketplace/ProviderProfile', [
            'provider' => Presenter::provider($provider),
            'breakdown' => $breakdown,
            'reviews' => $own->sortByDesc('created_at')->take(6)->values()->map(fn ($r) => ['author' => $r->company ?: $r->author, 'rating' => $r->rating, 'body' => $r->body, 'date' => $r->created_at->format('d M Y')]),
            'recent' => $provider->engagements()->latest()->limit(3)->get()->map(fn ($e) => ['title' => $e->title, 'client' => $e->client_name, 'stage' => $e->stage, 'date' => $e->updated_at->format('d M Y')]),
            'services' => $provider->listings()->where('status', 'published')->get()->map(fn ($l) => ['title' => $l->title, 'slug' => $l->slug]),
            'saved' => $request->user() && SavedItem::where('user_id', $request->user()->id)->where('item_type', 'marketplace-provider')->where('item_key', $provider->slug)->exists(),
        ]);
    }
}
