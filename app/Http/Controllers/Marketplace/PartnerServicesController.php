<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\Listing;
use App\Models\Marketplace\Provider;
use App\Models\Marketplace\Record;
use App\Support\Marketplace\Content;
use App\Support\Marketplace\Options;
use App\Support\Marketplace\PartnerService;
use App\Support\Marketplace\Presenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Public Partner Services pages (PS landing, choose service, process, coverage, product page, limitation notice, network). */
class PartnerServicesController extends Controller
{
    public function landing(): Response
    {
        return Inertia::render('Marketplace/Partner/Landing', [
            'disciplines' => Content::disciplines(),
            'content' => Content::psLanding(),
        ]);
    }

    /** Step 1 of 3: category + service selection with search and sort (server-side). */
    public function choose(Request $request): Response
    {
        $filters = $request->only(['category', 'q', 'sort']);
        $category = $filters['category'] ?? 'legal-services';

        $query = Listing::where('kind', 'partner')->where('status', 'published')->where('category', $category);
        if ($q = trim((string) ($filters['q'] ?? ''))) {
            $like = '%'.mb_strtolower($q).'%';
            $query->where(fn ($w) => $w->whereRaw('lower(title) like ?', [$like])->orWhereRaw('lower(summary) like ?', [$like]));
        }
        ($filters['sort'] ?? 'popularity') === 'name' ? $query->orderBy('title') : $query->orderByDesc('popularity');

        $counts = Listing::where('kind', 'partner')->where('status', 'published')->selectRaw('category, count(*) as n')->groupBy('category')->pluck('n', 'category');

        return Inertia::render('Marketplace/Partner/ChooseService', [
            'categories' => collect(Content::PS_CATEGORIES)->map(fn ($label, $key) => ['value' => $key, 'label' => $label, 'count' => (int) ($counts[$key] ?? 0)])->values(),
            'services' => $query->get()->map(fn ($l) => Presenter::listing($l)),
            'filters' => [...$filters, 'category' => $category],
            'total' => (int) $counts->sum(),
        ]);
    }

    public function howItWorks(): Response
    {
        return Inertia::render('Marketplace/Partner/HowItWorks', [
            'arrangements' => Content::arrangements(),
            'process' => Content::engagementProcess(),
        ]);
    }

    /** Coverage guide plus an interactive matter-coverage check against the Permission Register. */
    public function coverage(Request $request): Response
    {
        $check = null;
        if ($request->filled('profession') && $request->filled('jurisdiction')) {
            $profession = (string) $request->query('profession');
            $jurisdiction = (string) $request->query('jurisdiction');
            $rows = Record::where('register', 'permissions')->get()
                ->filter(fn ($r) => PartnerService::professionMatches($r->data['profession'] ?? '', $profession) && ($r->data['jurisdiction'] ?? '') === $jurisdiction);
            $routable = $rows->whereIn('status', ['authorised', 'conditional']);
            $partners = Provider::where('kind', 'partner')->whereIn('status', ['active', 'active_with_conditions'])->get()
                ->filter(fn ($p) => PartnerService::professionMatches($p->profession ?? '', $profession))->count();

            $check = [
                'profession' => $profession,
                'jurisdiction' => $jurisdiction,
                'state' => $routable->isNotEmpty() ? ($partners > 0 ? 'current' : 'manual') : ($rows->isNotEmpty() ? 'matter' : 'unavailable'),
                'rows' => $rows->values()->map(fn ($r) => ['reference' => $r->reference, 'activity' => $r->data['activity'] ?? '', 'arrangement' => $r->data['arrangement'] ?? '', 'status' => $r->status]),
                'partners' => $partners,
            ];
        }

        return Inertia::render('Marketplace/Partner/Coverage', [
            'coverage' => Content::coverage(),
            'states' => Content::COVERAGE_STATES,
            'check' => $check,
            'professions' => Options::PROFESSIONS,
            'jurisdictions' => Options::COUNTRIES,
        ]);
    }

    public function service(Listing $listing): Response
    {
        abort_unless($listing->kind === 'partner' && $listing->status === 'published', 404);

        return Inertia::render('Marketplace/Partner/Service', [
            'listing' => Presenter::listing($listing),
            'related' => Listing::where('kind', 'partner')->where('status', 'published')->where('category', $listing->category)->where('id', '!=', $listing->id)->limit(4)->get()->map(fn ($l) => Presenter::listing($l)),
        ]);
    }

    public function limitation(): Response
    {
        return Inertia::render('Marketplace/Partner/Limitation', [
            'notice' => Content::limitationNotice(),
            'arrangements' => Content::arrangements(),
        ]);
    }

    /** Partner network overview + directory (profession / jurisdiction / search filters). */
    public function network(Request $request): Response
    {
        $filters = $request->only(['q', 'profession', 'jurisdiction']);
        $query = Provider::where('kind', 'partner')->whereIn('status', ['active', 'active_with_conditions']);
        if ($q = trim((string) ($filters['q'] ?? ''))) {
            $like = '%'.mb_strtolower($q).'%';
            $query->where(fn ($w) => $w->whereRaw('lower(name) like ?', [$like])->orWhereRaw('lower(profession) like ?', [$like]));
        }
        if (! empty($filters['profession'])) {
            $query->where('profession', $filters['profession']);
        }
        if (! empty($filters['jurisdiction'])) {
            $query->where('country', $filters['jurisdiction']);
        }

        return Inertia::render('Marketplace/Partner/Network', [
            'partners' => $query->orderBy('name')->get()->map(fn ($p) => Presenter::provider($p)),
            'filters' => $filters,
            'professions' => Provider::where('kind', 'partner')->whereNotNull('profession')->distinct()->orderBy('profession')->pluck('profession'),
            'jurisdictions' => Options::COUNTRIES,
        ]);
    }
}
