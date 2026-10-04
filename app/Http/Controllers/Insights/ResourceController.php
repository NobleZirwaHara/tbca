<?php

namespace App\Http\Controllers\Insights;

use App\Http\Controllers\Controller;
use App\Models\Insights\Consent;
use App\Models\Insights\Entitlement;
use App\Models\Insights\Faq;
use App\Models\Insights\FreeDiagnostic;
use App\Models\Insights\PrivacyRequest;
use App\Models\Insights\Resource;
use App\Models\Insights\Webinar;
use App\Models\Insights\WebinarRegistration;
use App\Support\Insights\Documents;
use App\Support\Insights\ResourceAccess;
use App\Support\Platform\Checkout;
use App\Support\Platform\Reference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public TBCA Resources: landing, library (search/filter/sort/pagination),
 * detail pages with gating, value exchange, paid checkout, downloads,
 * free diagnostic, KP insights, webinars, FAQ, currentness and privacy flows.
 */
class ResourceController extends Controller
{
    public const PURPOSES = [
        'essential' => ['label' => 'Essential Communications', 'hint' => 'Required to deliver our resources and service messages.', 'does' => 'Send important account updates, security alerts and respond to your requests.', 'channels' => 'Email · Portal'],
        'newsletters' => ['label' => 'Newsletters & Insights', 'hint' => 'Stay informed with expert content.', 'does' => 'Send newsletters, guides, insights and invitations to events you may find valuable.', 'channels' => 'Email · Portal · WhatsApp'],
        'webinars' => ['label' => 'Webinars & Events', 'hint' => 'Invites to webinars, workshops and TBCA events.', 'does' => 'Provide event invitations, reminders and session materials.', 'channels' => 'Email · WhatsApp'],
        'offers' => ['label' => 'Offers & Promotions', 'hint' => 'Special offers and promotions.', 'does' => 'Send special offers, promotions and early access to new resources.', 'channels' => 'Email · WhatsApp'],
        'partners' => ['label' => 'Partner Communications', 'hint' => 'Updates from trusted partners and affiliates.', 'does' => 'Share updates and offers from our trusted partners and affiliates.', 'channels' => 'Email'],
        'surveys' => ['label' => 'Surveys & Feedback', 'hint' => 'Help us improve.', 'does' => 'Invite you to optional surveys and feedback requests.', 'channels' => 'Email'],
    ];

    public const DATA_SETTINGS = [
        'data_sharing' => ['label' => 'Data Sharing', 'text' => 'Control how we share your data with trusted partners.'],
        'personalisation' => ['label' => 'Personalised Experience', 'text' => 'Allow personalised content based on your interests.'],
        'analytics' => ['label' => 'Analytics & Improvement', 'text' => 'Help us improve our services with anonymous analytics.'],
        'marketing' => ['label' => 'Marketing Consent', 'text' => 'Manage consent for marketing communications.'],
    ];

    private function categoryCounts(Builder $base): array
    {
        $counts = (clone $base)->selectRaw('category, count(*) as c')->groupBy('category')->pluck('c', 'category');

        return collect(Resource::CATEGORIES)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => (int) ($counts[$key] ?? 0)])->values()->all();
    }

    public function index(): Response
    {
        $pub = Resource::published()->where('collection', 'library');

        return Inertia::render('Insights/Resources/Index', [
            'categories' => $this->categoryCounts(clone $pub),
            'featured' => (clone $pub)->where('featured', true)->orderByDesc('download_count')->limit(5)->get()->map->toCard(),
            'guides' => (clone $pub)->whereIn('type', Resource::GUIDE_TYPES)->orderByDesc('editors_pick')->orderByDesc('download_count')->limit(3)->get()->map->toCard(),
            'tools' => (clone $pub)->whereIn('type', Resource::TOOL_TYPES)->orderByDesc('popular')->orderByDesc('download_count')->limit(3)->get()->map->toCard(),
            'popular' => (clone $pub)->where('popular', true)->orderByDesc('download_count')->limit(5)->get()->map->toCard(),
            'overview' => [
                'guides' => Resource::published()->whereIn('type', ['guide', 'toolkit'])->count(),
                'templates' => Resource::published()->whereIn('type', Resource::TOOL_TYPES)->count(),
                'caseStudies' => Resource::published()->where('collection', 'case-studies')->count(),
                'compliance' => Resource::published()->where('category', 'risk-compliance')->count(),
                'webinars' => Webinar::count(),
                'reports' => Resource::published()->where('type', 'report')->count(),
            ],
        ]);
    }

    public function library(Request $request, string $collection): Response
    {
        $f = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'array'], 'category.*' => ['string'],
            'type' => ['nullable', 'string', 'max:30'],
            'industry' => ['nullable', 'string', 'max:80'],
            'country' => ['nullable', 'string', 'max:60'],
            'access' => ['nullable', 'in:free,gated,paid,reduced,subscription,restricted'],
            'currentness' => ['nullable', 'in:current,review_due,overdue,restricted'],
            'format' => ['nullable', 'string', 'max:10'],
            'sort' => ['nullable', 'in:relevant,newest,popular,title,review'],
        ]);

        $base = Resource::published()->whereIn('collection', ['library', 'case-studies']);
        if ($collection === 'guides-reports') {
            $base->whereIn('type', array_merge(Resource::GUIDE_TYPES, ['case-study']));
        } elseif ($collection === 'templates-tools') {
            $base->whereIn('type', Resource::TOOL_TYPES);
        }
        $facetBase = clone $base;

        $q = $base
            ->when($f['q'] ?? null, fn ($b, $s) => $b->where(fn ($w) => $w->where('title', 'like', "%{$s}%")->orWhere('summary', 'like', "%{$s}%")->orWhere('source', 'like', "%{$s}%")))
            ->when($f['category'] ?? null, fn ($b, $c) => $b->whereIn('category', $c))
            ->when($f['type'] ?? null, fn ($b, $t) => $b->where('type', $t))
            ->when($f['industry'] ?? null, fn ($b, $i) => $b->where('industries', 'like', "%{$i}%"))
            ->when($f['country'] ?? null, fn ($b, $c) => $b->where('countries', 'like', "%{$c}%"))
            ->when($f['format'] ?? null, fn ($b, $fm) => $b->where('format', $fm))
            ->when($f['access'] ?? null, function ($b, $a) {
                return $a === 'reduced'
                    ? $b->where('access', 'paid')->whereColumn('price_zar', '<', 'list_price_zar')
                    : $b->where('access', $a);
            });

        $today = today()->toDateString();
        $soon = today()->addDays(30)->toDateString();
        $q->when($f['currentness'] ?? null, fn ($b, $c) => match ($c) {
            'restricted' => $b->where(fn ($w) => $w->where('restricted', true)->orWhere('access', 'restricted')),
            'overdue' => $b->where('restricted', false)->where('access', '!=', 'restricted')->where('next_review_at', '<', $today),
            'review_due' => $b->where('restricted', false)->where('access', '!=', 'restricted')->whereBetween('next_review_at', [$today, $soon]),
            default => $b->where('restricted', false)->where('access', '!=', 'restricted')->where(fn ($w) => $w->whereNull('next_review_at')->orWhere('next_review_at', '>', $soon)),
        });

        match ($f['sort'] ?? 'relevant') {
            'newest' => $q->orderByDesc('reviewed_at'),
            'popular' => $q->orderByDesc('download_count'),
            'title' => $q->orderBy('title'),
            'review' => $q->orderBy('next_review_at'),
            default => $q->orderByDesc('editors_pick')->orderByDesc('featured')->orderByDesc('download_count'),
        };

        $page = $q->paginate(12)->withQueryString();

        $typeCounts = (clone $facetBase)->selectRaw('type, count(*) as c')->groupBy('type')->pluck('c', 'type');

        return Inertia::render('Insights/Resources/Library', [
            'collection' => $collection,
            'filters' => array_merge(['category' => []], $f),
            'resources' => [
                'data' => collect($page->items())->map->toCard(),
                'from' => $page->firstItem(), 'to' => $page->lastItem(), 'total' => $page->total(),
                'currentPage' => $page->currentPage(), 'lastPage' => $page->lastPage(),
            ],
            'categories' => $this->categoryCounts($facetBase),
            'types' => collect($typeCounts)->map(fn ($c, $t) => ['key' => $t, 'label' => Str::headline($t), 'count' => (int) $c])->values(),
            'formats' => (clone $facetBase)->distinct()->pluck('format')->values(),
            'industries' => \App\Models\Insights\Industry::orderBy('number')->get(['slug', 'name'])->map(fn ($i) => ['value' => $i->slug, 'label' => $i->name]),
            'total' => (clone $facetBase)->count(),
        ]);
    }

    private function detail(Request $request, Resource $resource): array
    {
        ResourceAccess::syncPaid($request->user());
        $resource->increment('view_count');
        $access = ResourceAccess::resolve($resource, $request->user());

        return array_merge($resource->toCard(), [
            'body' => $resource->body ?? [],
            'meta' => $resource->meta ?? [],
            'publishState' => $resource->publish_state,
            'riskClass' => $resource->risk_class,
            'version' => $resource->version,
            'language' => $resource->language,
            'boundaryNote' => $resource->boundary_note,
            'linkedProduct' => $resource->linked_product,
            'protected' => $resource->protected,
            'retiredAt' => $resource->retired_at?->format('d F Y'),
            'retiredReason' => $resource->retired_reason,
            'replacement' => $resource->replacement?->toCard(),
            'accessState' => $access,
            'saved' => $request->user() ? \App\Models\SavedItem::where('user_id', $request->user()->id)->where('item_type', 'resource')->where('item_key', $resource->slug)->exists() : false,
        ]);
    }

    public function show(Request $request, Resource $resource): Response
    {
        abort_unless(in_array($resource->publish_state, ['published', 'retired'], true) || $request->user()?->role === 'admin', 404);

        if ($resource->collection === 'case-studies') {
            return $this->caseStudy($request, $resource);
        }

        $related = Resource::published()->where('id', '!=', $resource->id)->where('category', $resource->category)->orderByDesc('download_count')->limit(3)->get()->map->toCard();

        return Inertia::render($resource->publish_state === 'retired' ? 'Insights/Resources/Retired' : 'Insights/Resources/Show', [
            'resource' => $this->detail($request, $resource),
            'related' => $related,
        ]);
    }

    public function caseStudy(Request $request, Resource $resource): Response
    {
        abort_unless($resource->collection === 'case-studies' && $resource->publish_state === 'published', 404);

        return Inertia::render('Insights/Resources/CaseStudy', [
            'resource' => $this->detail($request, $resource),
            'related' => Resource::published()->where('collection', 'library')->where('category', $resource->category)->limit(3)->get()->map->toCard(),
        ]);
    }

    public function download(Request $request, Resource $resource)
    {
        ResourceAccess::syncPaid($request->user());
        $access = ResourceAccess::resolve($resource, $request->user());

        if (! $access['canDownload']) {
            $to = match ($access['state']) {
                'gate' => "/resources/{$resource->slug}/access",
                'purchase' => "/resources/{$resource->slug}/checkout",
                'login' => '/login',
                'subscribe' => '/resources/account/subscription',
                default => $resource->url(),
            };
            if ($access['state'] === 'login') {
                session()->put('url.intended', $resource->url());
            }

            return redirect($to)->with('error', $access['reason']);
        }

        ResourceAccess::recordDownload($resource, $request->user());
        $body = $resource->body ?? [];
        $lines = array_filter([
            $resource->summary, '',
            "Type: {$resource->type} | Format: {$resource->format} | Version {$resource->version} | Access: {$resource->accessLabel()}",
            "Source: {$resource->source} | Reviewed: ".($resource->reviewed_at?->format('d M Y') ?? '-').' | Next review: '.($resource->next_review_at?->format('d M Y') ?? '-'), '',
            $body['about'] ?? null,
        ]);
        foreach (array_merge($body['learn'] ?? [], $body['get'] ?? [], $body['checklist'] ?? []) as $item) {
            $lines[] = "- {$item}";
        }
        foreach ($body['preview'] ?? [] as $sec) {
            $lines[] = $sec['title'];
            foreach ($sec['items'] as $i) {
                $lines[] = "  [ ] {$i}";
            }
        }
        $lines[] = '';
        $lines[] = 'General information only. It does not replace professional advice.';

        return Documents::pdf("{$resource->slug}.pdf", $resource->title, array_values($lines));
    }

    /* --- Value exchange gate (GATE-RS-01) ----------------------------- */

    public function access(Request $request, Resource $resource): Response|RedirectResponse
    {
        abort_unless($resource->access === 'gated', 404);
        $access = ResourceAccess::resolve($resource, $request->user());
        if ($access['state'] === 'entitled') {
            return redirect($resource->url())->with('success', 'You already have access to this resource.');
        }

        $user = $request->user();

        return Inertia::render('Insights/Resources/Access', [
            'resource' => array_merge($resource->toCard(), ['version' => $resource->version, 'language' => $resource->language, 'body' => $resource->body]),
            'blocked' => $resource->blocksDelivery() ? $access['reason'] : null,
            'prefill' => ['email' => $user?->email ?? ResourceAccess::sessionEmail() ?? '', 'firstName' => $user ? strtok($user->name, ' ') : ''],
            'held' => ['organisation' => $user?->company, 'language' => 'English'],
        ]);
    }

    public function storeAccess(Request $request, Resource $resource): RedirectResponse
    {
        abort_unless($resource->access === 'gated', 404);
        if ($resource->blocksDelivery()) {
            return back()->with('error', 'This resource is not currently available for new access.');
        }

        $data = $request->validate([
            'email' => ['required', 'email', 'max:190'],
            'first_name' => ['required', 'string', 'max:80'],
            'opt_email' => ['boolean'],
            'opt_whatsapp' => ['boolean'],
            'opt_databank' => ['boolean'],
        ]);
        $user = $request->user();

        // One idempotent R0 entitlement per person + content version.
        $entitlement = Entitlement::firstOrCreate(
            ['resource_id' => $resource->id, 'email' => strtolower($data['email']), 'state' => 'active'],
            [
                'reference' => Reference::make('ENT'), 'user_id' => $user?->id, 'first_name' => $data['first_name'], 'source' => 'gated',
                'content_version' => $resource->version, 'acquired_at' => now(),
                'data_exchange' => ['fields' => ['email', 'first_name'], 'optional' => array_keys(array_filter(['email_insights' => $data['opt_email'] ?? false, 'whatsapp' => $data['opt_whatsapp'] ?? false, 'data_bank' => $data['opt_databank'] ?? false])), 'privacy' => 'PV-Current', 'disclosure' => 'Ledger D vCurrent'],
            ]
        );

        // Optional permissions are independent and OFF by default.
        foreach (['opt_email' => 'newsletters', 'opt_whatsapp' => 'whatsapp', 'opt_databank' => 'data_bank'] as $field => $purpose) {
            if (! empty($data[$field])) {
                Consent::updateOrCreate(['email' => strtolower($data['email']), 'purpose' => $purpose], ['user_id' => $user?->id, 'name' => $data['first_name'], 'state' => 'granted', 'legal_basis' => 'consent', 'channel' => 'web', 'granted_at' => now(), 'withdrawn_at' => null]);
            }
        }

        session([ResourceAccess::SESSION_EMAIL => strtolower($data['email'])]);

        return redirect($resource->url().'?unlocked=1')->with('success', "Access granted. Reference {$entitlement->reference}. Your download is ready.")->with('reference', $entitlement->reference);
    }

    /* --- Paid checkout -------------------------------------------------- */

    public function checkout(Request $request, Resource $resource): Response|RedirectResponse
    {
        abort_unless(in_array($resource->access, ['paid'], true), 404);
        ResourceAccess::syncPaid($request->user());
        if (ResourceAccess::entitlement($resource, $request->user())) {
            return redirect($resource->url())->with('success', 'You already own this resource.');
        }

        return Inertia::render('Insights/Resources/Checkout', [
            'resource' => array_merge($resource->toCard(), ['meta' => $resource->meta, 'body' => $resource->body]),
            'blocked' => $resource->blocksDelivery() ? 'This resource is not currently available for purchase.' : null,
            'vatRate' => 15,
        ]);
    }

    public function storeCheckout(Request $request, Resource $resource): RedirectResponse
    {
        abort_unless($resource->access === 'paid' && $resource->price_zar, 404);
        if ($resource->blocksDelivery()) {
            return back()->with('error', 'This resource is not currently available for purchase.');
        }
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Accept the licence terms to continue.']);
        $user = $request->user();

        $order = Checkout::createOrder([[
            'item_type' => 'digital-product', 'item_code' => $resource->record_id, 'name' => $resource->title, 'unit_zar' => (int) $resource->price_zar,
            'meta' => ['resource' => $resource->slug],
        ]], $user, 'resources', ['return_url' => $resource->url().'?purchased=1', 'title' => 'Paid resource']);

        Entitlement::create([
            'reference' => Reference::make('ENT'), 'user_id' => $user->id, 'email' => $user->email, 'first_name' => strtok($user->name, ' '),
            'resource_id' => $resource->id, 'source' => 'one_time', 'state' => 'pending_payment', 'content_version' => $resource->version, 'order_id' => $order->id,
        ]);

        return redirect()->route('checkout.show', $order);
    }

    /* --- Static / editorial pages -------------------------------------- */

    public function page(string $page): Response
    {
        abort_unless(in_array($page, ['FreeVsPaid', 'ValueExchange', 'DataStatement', 'Limitations', 'Monetisation'], true), 404);

        $props = [];
        if ($page === 'FreeVsPaid') {
            $props = [
                'free' => Resource::where('slug', 'starter-guide-problem-framing')->first()?->toCard(),
                'paid' => \App\Models\Sprint::where('status', 'published')->where('title', 'like', '%SOP%')->first(['slug', 'title', 'summary', 'price_zar']) ?? \App\Models\Sprint::where('status', 'published')->first(['slug', 'title', 'summary', 'price_zar']),
            ];
        }

        return Inertia::render("Insights/Resources/{$page}", $props);
    }

    public function insights(Request $request): Response
    {
        $f = $request->only(['q', 'topic', 'type', 'currentness', 'sort']);
        $base = Resource::published()->where('collection', 'insights');
        $featured = (clone $base)->where('featured', true)->first();
        $rows = (clone $base)->when($featured, fn ($b) => $b->where('id', '!=', $featured->id))
            ->when($f['q'] ?? null, fn ($b, $q) => $b->where(fn ($w) => $w->where('title', 'like', "%{$q}%")->orWhere('summary', 'like', "%{$q}%")))
            ->when($f['topic'] ?? null, fn ($b, $t) => $b->where('category', $t))
            ->when($f['type'] ?? null, fn ($b, $t) => $b->where('type', $t))
            ->orderBy(($f['sort'] ?? 'recent') === 'title' ? 'title' : 'reviewed_at', ($f['sort'] ?? 'recent') === 'title' ? 'asc' : 'desc')->get()
            ->map->toCard()
            ->when($f['currentness'] ?? null, fn ($c, $cur) => $c->where('currentness', $cur))->values();

        return Inertia::render('Insights/Resources/Insights', [
            'filters' => $f,
            'featured' => $featured ? array_merge($featured->toCard(), ['body' => $featured->body]) : null,
            'insights' => $rows,
            'topics' => collect(Resource::CATEGORIES)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values(),
            'article' => $request->query('read') ? Resource::published()->where('collection', 'insights')->where('slug', $request->query('read'))->first()?->toCard() : null,
        ]);
    }

    public function faq(Request $request): Response
    {
        $q = $request->query('q');
        $topic = $request->query('topic');
        $faqs = Faq::orderBy('sort')->when($q, fn ($b) => $b->where(fn ($w) => $w->where('question', 'like', "%{$q}%")->orWhere('answer', 'like', "%{$q}%")))
            ->when($topic, fn ($b) => $b->where('topic', $topic))->get();
        $geo = Faq::where('geo', true)->first();
        $related = collect($geo?->related ?? [])->map(function ($key) {
            if (str_starts_with($key, 'webinar:')) {
                $w = Webinar::where('slug', substr($key, 8))->first();

                return $w ? ['type' => 'webinar replay', 'title' => $w->title, 'summary' => $w->summary, 'url' => "/resources/webinars/{$w->slug}/replay"] : null;
            }
            $r = Resource::where('slug', $key)->first();

            return $r ? ['type' => str_replace('-', ' ', $r->type), 'title' => $r->title, 'summary' => $r->summary, 'url' => $r->url()] : null;
        })->filter()->values();

        return Inertia::render('Insights/Resources/Faq', [
            'filters' => ['q' => $q, 'topic' => $topic],
            'geo' => $geo ? ['question' => $geo->question, 'answer' => $geo->answer, 'steps' => $geo->steps ?? []] : null,
            'related' => $related,
            'faqs' => $faqs->map(fn ($f) => ['id' => $f->id, 'question' => $f->question, 'answer' => $f->answer, 'topic' => $f->topic])->values(),
            'topics' => Faq::distinct()->pluck('topic'),
        ]);
    }

    public function contentStatus(Request $request): Response
    {
        $status = $request->query('status');
        $q = $request->query('q');
        $type = $request->query('type');
        $all = Resource::visible()->get();
        $rows = $all->map->toCard()->filter(fn ($r) => $r['currentness'] !== 'retired')
            ->when($status, fn ($c) => $c->where('currentness', $status))
            ->when($type, fn ($c) => $c->where('type', $type))
            ->when($q, fn ($c) => $c->filter(fn ($r) => str_contains(Str::lower($r['title'].' '.$r['summary']), Str::lower($q))))
            ->sortByDesc('reviewedAt')->values();
        $perPage = 10;
        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('Insights/Resources/ContentStatus', [
            'filters' => ['status' => $status, 'q' => $q, 'type' => $type],
            'counts' => collect(['current', 'review_due', 'overdue', 'restricted'])->mapWithKeys(fn ($s) => [$s => $all->filter(fn ($r) => $r->currentness() === $s)->count()]),
            'rows' => $rows->forPage($page, $perPage)->values(),
            'pagination' => ['page' => $page, 'lastPage' => max(1, (int) ceil($rows->count() / $perPage)), 'total' => $rows->count()],
            'types' => $all->pluck('type')->unique()->values(),
        ]);
    }

    /* --- Free diagnostic (triage only) --------------------------------- */

    public function freeDiagnostic(): Response
    {
        return Inertia::render('Insights/Resources/FreeDiagnostic', [
            'industries' => \App\Models\Insights\Industry::orderBy('number')->pluck('name'),
        ]);
    }

    public function storeFreeDiagnostic(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'role' => ['required', 'string', 'max:60'],
            'business_type' => ['required', 'string', 'max:60'],
            'industry' => ['required', 'string', 'max:80'],
            'country' => ['required', 'string', 'max:60'],
            'province' => ['nullable', 'string', 'max:60'],
            'stage' => ['required', 'string', 'max:60'],
            'situation' => ['required', 'in:starting,growing,cashflow,funding,project'],
            'priorities' => ['required', 'array', 'min:1', 'max:3'],
            'priorities.*' => ['in:sales,cashflow,funding,efficiency,planning,market_entry,project,legal,digital,skills,other'],
        ], ['priorities.max' => 'Select up to 3 priorities.']);

        $map = [
            'sales' => 'marketing-sales', 'cashflow' => 'finance-funding', 'funding' => 'finance-funding', 'efficiency' => 'operations-process',
            'planning' => 'strategy-planning', 'market_entry' => 'market-intelligence', 'project' => 'project-management', 'legal' => 'risk-compliance',
            'digital' => 'operations-process', 'skills' => 'learning-development', 'other' => 'strategy-planning',
        ];
        $situationCat = ['starting' => 'strategy-planning', 'growing' => 'operations-process', 'cashflow' => 'finance-funding', 'funding' => 'due-diligence', 'project' => 'project-management'][$data['situation']];
        $cats = collect($data['priorities'])->map(fn ($p) => $map[$p])->prepend($situationCat)->unique()->values();

        $resources = Resource::published()->where('collection', 'library')->whereIn('access', ['free', 'gated'])->whereIn('category', $cats)
            ->orderByDesc('editors_pick')->orderByDesc('download_count')->get()
            ->filter(fn ($r) => ! $r->blocksDelivery())->take(6)->pluck('slug');

        $route = match ($data['situation']) {
            'funding' => ['title' => 'Capital Readiness route', 'text' => 'Start with investor readiness evidence, then consider a Due Diligence Readiness Sprint.', 'href' => '/sprints?category=due-diligence'],
            'project' => ['title' => 'Project Advisory route', 'text' => 'Frame the project, then test feasibility before seeking finance.', 'href' => '/sprints?category=project-advisory'],
            'cashflow' => ['title' => 'Cash Flow Stabilisation route', 'text' => 'Use the cash flow checklist, then a paid diagnostic if pressure persists.', 'href' => '/sprints?category=diagnostics'],
            default => ['title' => 'Business Growth route', 'text' => 'Clarify strategy and priorities, then select a focused Sprint.', 'href' => '/sprints?category=business-management'],
        };

        $diag = FreeDiagnostic::create([
            'reference' => Reference::make('FDX'),
            'user_id' => $request->user()?->id,
            'answers' => $data,
            'result' => ['categories' => $cats->all(), 'resources' => $resources->values()->all(), 'route' => $route],
        ]);

        return redirect("/resources/free-diagnostic/{$diag->reference}")->with('success', 'Your free diagnostic recommendations are ready.');
    }

    public function freeDiagnosticResult(string $reference): Response
    {
        $d = FreeDiagnostic::where('reference', $reference)->firstOrFail();

        return Inertia::render('Insights/Resources/FreeDiagnosticResult', [
            'reference' => $d->reference,
            'answers' => $d->answers,
            'route' => $d->result['route'] ?? null,
            'categories' => collect($d->result['categories'] ?? [])->map(fn ($c) => Resource::CATEGORIES[$c] ?? $c)->values(),
            'resources' => Resource::whereIn('slug', $d->result['resources'] ?? [])->get()->map->toCard()->values(),
        ]);
    }

    /* --- Consent, preferences, withdrawal ------------------------------ */

    private function consentsFor(?string $email): array
    {
        if (! $email) {
            return [];
        }

        return Consent::where('email', strtolower($email))->get()->mapWithKeys(fn ($c) => [$c->purpose => $c->state])->all();
    }

    public function consent(Request $request): Response
    {
        $email = $request->user()?->email ?? ResourceAccess::sessionEmail();

        return Inertia::render('Insights/Resources/Consent', [
            'purposes' => collect(self::PURPOSES)->map(fn ($p, $k) => array_merge($p, ['key' => $k]))->values(),
            'current' => $this->consentsFor($email),
            'prefill' => ['name' => $request->user()?->name ?? '', 'email' => $email ?? '', 'phone' => $request->user()?->phone ?? ''],
        ]);
    }

    public function storeConsent(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'purposes' => ['array'],
            'purposes.*' => ['in:'.implode(',', array_keys(self::PURPOSES))],
        ]);
        $selected = $data['purposes'] ?? [];
        foreach (array_keys(self::PURPOSES) as $purpose) {
            $existing = Consent::where('email', strtolower($data['email']))->where('purpose', $purpose)->first();
            $on = in_array($purpose, $selected, true);
            $state = $on ? 'granted' : ($existing?->state === 'granted' ? 'withdrawn' : 'declined');
            Consent::updateOrCreate(['email' => strtolower($data['email']), 'purpose' => $purpose], [
                'user_id' => $request->user()?->id, 'name' => $data['name'], 'phone' => $data['phone'] ?? null, 'state' => $state,
                'legal_basis' => $purpose === 'essential' ? 'contract' : 'consent', 'channel' => 'web', 'version' => 'PV-Current',
                'granted_at' => $on ? ($existing?->state === 'granted' ? $existing->granted_at : now()) : $existing?->granted_at,
                'withdrawn_at' => $state === 'withdrawn' ? now() : null, 'expires_at' => $on && $purpose !== 'essential' ? now()->addYear() : null,
            ]);
        }
        session([ResourceAccess::SESSION_EMAIL => strtolower($data['email'])]);

        return redirect('/resources/preferences')->with('success', count($selected).' consent choice(s) saved. You can change them at any time.');
    }

    public function preferences(Request $request): Response
    {
        $email = $request->user()?->email ?? ResourceAccess::sessionEmail();
        $rows = $email ? Consent::where('email', strtolower($email))->get() : collect();

        return Inertia::render('Insights/Resources/Preferences', [
            'email' => $email,
            'purposes' => collect(self::PURPOSES)->except('surveys')->map(fn ($p, $k) => array_merge($p, ['key' => $k]))->values(),
            'settings' => collect(self::DATA_SETTINGS)->map(fn ($p, $k) => array_merge($p, ['key' => $k]))->values(),
            'current' => $this->consentsFor($email),
            'summary' => [
                'active' => $rows->where('state', 'granted')->count(),
                'limited' => $rows->where('state', 'pending')->count(),
                'inactive' => $rows->whereIn('state', ['declined', 'withdrawn', 'expired'])->count(),
                'updated' => $rows->max('updated_at')?->format('d M Y'),
            ],
            'history' => $rows->sortByDesc('updated_at')->take(8)->values()->map(fn ($c) => ['purpose' => self::PURPOSES[$c->purpose]['label'] ?? Str::headline($c->purpose), 'state' => $c->state, 'at' => $c->updated_at->format('d M Y, H:i')]),
        ]);
    }

    public function savePreferences(Request $request): RedirectResponse
    {
        $email = $request->user()?->email ?? $request->validate(['email' => ['required', 'email']])['email'];
        $allowed = array_merge(array_keys(self::PURPOSES), array_keys(self::DATA_SETTINGS));
        $data = $request->validate(['prefs' => ['required', 'array'], 'prefs.*' => ['boolean'], 'reset' => ['boolean']]);
        $prefs = ! empty($data['reset']) ? ['essential' => true, 'newsletters' => true, 'webinars' => false, 'offers' => false, 'partners' => false] : $data['prefs'];

        foreach ($prefs as $purpose => $on) {
            if (! in_array($purpose, $allowed, true)) {
                continue;
            }
            if ($purpose === 'essential') {
                $on = true; // required for service delivery
            }
            $existing = Consent::where('email', strtolower($email))->where('purpose', $purpose)->first();
            $state = $on ? 'granted' : ($existing && $existing->state === 'granted' ? 'withdrawn' : ($existing?->state ?? 'declined'));
            if ($existing && $existing->state === $state) {
                continue;
            }
            Consent::updateOrCreate(['email' => strtolower($email), 'purpose' => $purpose], [
                'user_id' => $request->user()?->id, 'name' => $request->user()?->name ?? $existing?->name, 'state' => $state,
                'legal_basis' => $purpose === 'essential' ? 'contract' : 'consent', 'channel' => 'portal',
                'granted_at' => $on ? now() : $existing?->granted_at, 'withdrawn_at' => $state === 'withdrawn' ? now() : null,
            ]);
        }
        session([ResourceAccess::SESSION_EMAIL => strtolower($email)]);

        return back()->with('success', 'Preferences saved.');
    }

    public function withdrawal(Request $request): Response
    {
        return Inertia::render('Insights/Resources/Withdrawal', [
            'purposes' => collect(self::PURPOSES)->except('essential')->map(fn ($p, $k) => ['key' => $k, 'label' => $p['label']])->values(),
            'prefill' => ['name' => $request->user()?->name ?? '', 'email' => $request->user()?->email ?? ResourceAccess::sessionEmail() ?? ''],
            'requests' => $request->user() ? PrivacyRequest::where('email', $request->user()->email)->latest()->get()->map(fn ($r) => ['reference' => $r->reference, 'type' => $r->type, 'status' => $r->status, 'at' => $r->created_at->format('d M Y'), 'disposition' => $r->disposition]) : [],
        ]);
    }

    public function storeWithdrawal(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:withdraw,erase'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'purposes' => ['required_if:type,withdraw', 'array'],
            'purposes.*' => ['in:'.implode(',', array_keys(self::PURPOSES)).',whatsapp,data_bank'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ], ['purposes.required_if' => 'Choose at least one purpose to withdraw.']);
        $email = strtolower($data['email']);

        $disposition = [];
        if ($data['type'] === 'withdraw') {
            // Immediate suppression of future optional processing; no reason required (blueprint 13.6).
            foreach ($data['purposes'] as $purpose) {
                $c = Consent::where('email', $email)->where('purpose', $purpose)->first();
                if ($c) {
                    $c->update(['state' => 'withdrawn', 'withdrawn_at' => now()]);
                }
                $disposition[] = ['item' => self::PURPOSES[$purpose]['label'] ?? Str::headline($purpose), 'status' => $c ? 'suppressed' : 'no record held'];
            }
            $status = 'completed';
        } else {
            $disposition = [
                ['item' => 'Marketing and preference data', 'status' => 'delete'],
                ['item' => 'Resource access history', 'status' => 'de-identify'],
                ['item' => 'Invoices and payment records', 'status' => 'retain with reason (tax law)'],
            ];
            $status = 'verifying';
        }

        $req = PrivacyRequest::create([
            'reference' => Reference::make('PRV'), 'user_id' => $request->user()?->id, 'type' => $data['type'], 'name' => $data['name'], 'email' => $email,
            'purposes' => $data['purposes'] ?? [], 'notes' => $data['notes'] ?? null, 'status' => $status, 'disposition' => $disposition,
        ]);

        return back()->with('success', $data['type'] === 'withdraw'
            ? "Withdrawal applied immediately. Reference {$req->reference}."
            : "Erasure request received. We will verify your identity and respond within 10 business days. Reference {$req->reference}.")
            ->with('reference', $req->reference);
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:190'], 'name' => ['nullable', 'string', 'max:120']]);
        Consent::updateOrCreate(['email' => strtolower($data['email']), 'purpose' => 'newsletters'], [
            'user_id' => $request->user()?->id, 'name' => $data['name'] ?? $request->user()?->name, 'state' => 'granted', 'legal_basis' => 'consent',
            'channel' => 'web', 'granted_at' => now(), 'withdrawn_at' => null, 'expires_at' => now()->addYear(),
        ]);

        return back()->with('success', 'Subscribed to TBCA Resources & Insights. You can unsubscribe at any time in the Preference Centre.');
    }

    /* --- Webinars ------------------------------------------------------- */

    public function webinars(Request $request): Response
    {
        $f = $request->only(['q', 'tab', 'topic', 'speaker', 'cpd', 'sort']);
        $all = Webinar::orderBy('starts_at')->get();
        $rows = $all
            ->when(($f['tab'] ?? 'all') === 'upcoming', fn ($c) => $c->filter->isUpcoming())
            ->when(($f['tab'] ?? 'all') === 'on-demand', fn ($c) => $c->reject->isUpcoming())
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($w) => str_contains(Str::lower($w->title.' '.$w->summary.' '.$w->speaker.' '.$w->topic), Str::lower($q))))
            ->when($f['topic'] ?? null, fn ($c, $t) => $c->where('topic', $t))
            ->when($f['speaker'] ?? null, fn ($c, $s) => $c->where('speaker', $s))
            ->when(! empty($f['cpd']), fn ($c) => $c->where('cpd', true));
        $rows = ($f['sort'] ?? 'recent') === 'title' ? $rows->sortBy('title') : $rows->sortBy(fn ($w) => $w->isUpcoming() ? $w->starts_at->timestamp : PHP_INT_MAX - $w->starts_at->timestamp);
        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('Insights/Resources/Webinars', [
            'filters' => $f,
            'webinars' => $rows->values()->forPage($page, 8)->values()->map->toCard(),
            'pagination' => ['page' => $page, 'lastPage' => max(1, (int) ceil($rows->count() / 8)), 'total' => $rows->count()],
            'counts' => ['upcoming' => $all->filter->isUpcoming()->count(), 'onDemand' => $all->reject->isUpcoming()->count()],
            'topics' => $all->groupBy('topic')->map->count(),
            'speakers' => $all->pluck('speaker')->unique()->values(),
        ]);
    }

    public function webinarRegister(Request $request, Webinar $webinar): Response
    {
        return Inertia::render('Insights/Resources/WebinarRegister', [
            'webinar' => $webinar->toCard(),
            'prefill' => ['name' => $request->user()?->name ?? '', 'email' => $request->user()?->email ?? '', 'company' => $request->user()?->company ?? '', 'jobTitle' => $request->user()?->job_title ?? '', 'phone' => $request->user()?->phone ?? ''],
            'registered' => $request->user() ? $webinar->registrations()->where('email', $request->user()->email)->value('reference') : null,
        ]);
    }

    public function storeRegistration(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:190'],
            'job_title' => ['required', 'string', 'max:120'], 'company' => ['required', 'string', 'max:190'],
            'country' => ['required', 'string', 'max:60'], 'phone' => ['nullable', 'string', 'max:30'],
            'opt_resources' => ['boolean'], 'opt_offers' => ['boolean'], 'resend' => ['boolean'],
        ]);
        $email = strtolower($data['email']);
        $existing = $webinar->registrations()->where('email', $email)->first();
        if ($existing) {
            return back()->with('success', "You are already registered (reference {$existing->reference}). We have re-sent your confirmation email.");
        }

        $reg = $webinar->registrations()->create([
            'reference' => Reference::make('WEB'), 'user_id' => $request->user()?->id, 'name' => $data['name'], 'email' => $email,
            'job_title' => $data['job_title'], 'company' => $data['company'], 'country' => $data['country'], 'phone' => $data['phone'] ?? null,
            'opt_resources' => $data['opt_resources'] ?? false, 'opt_offers' => $data['opt_offers'] ?? false, 'access_token' => Str::random(32),
        ]);
        foreach (['opt_resources' => 'newsletters', 'opt_offers' => 'offers'] as $f => $purpose) {
            if (! empty($data[$f])) {
                Consent::updateOrCreate(['email' => $email, 'purpose' => $purpose], ['user_id' => $request->user()?->id, 'name' => $data['name'], 'state' => 'granted', 'legal_basis' => 'consent', 'channel' => 'web', 'granted_at' => now(), 'withdrawn_at' => null]);
            }
        }
        Consent::updateOrCreate(['email' => $email, 'purpose' => 'webinars'], ['user_id' => $request->user()?->id, 'name' => $data['name'], 'state' => 'granted', 'legal_basis' => 'contract', 'channel' => 'web', 'granted_at' => now()]);

        return redirect("/resources/webinars/{$webinar->slug}/register")
            ->with('success', "You're registered for {$webinar->title}. Reference {$reg->reference}. A confirmation email and calendar invite are on the way.")
            ->with('reference', $reg->reference);
    }

    public function replay(Request $request, Webinar $webinar): Response
    {
        $hasAccess = in_array($webinar->id, session('insights.replay_access', []), true)
            || ($request->user() && ($request->user()->role === 'admin' || $webinar->registrations()->where('email', $request->user()->email)->exists()));

        return Inertia::render('Insights/Resources/WebinarReplay', [
            'webinar' => $webinar->toCard(),
            'hasAccess' => $hasAccess && ! $webinar->isUpcoming(),
            'upcoming' => $webinar->isUpcoming(),
        ]);
    }

    public function replayAccess(Request $request, Webinar $webinar): RedirectResponse
    {
        $data = $request->validate([
            'mode' => ['required', 'in:email,token'],
            'email' => ['required_if:mode,email', 'nullable', 'email'],
            'token' => ['required_if:mode,token', 'nullable', 'string', 'max:64'],
        ]);
        $reg = $data['mode'] === 'email'
            ? $webinar->registrations()->where('email', strtolower($data['email']))->first()
            : WebinarRegistration::where('webinar_id', $webinar->id)->where('access_token', $data['token'])->first();

        if (! $reg) {
            return back()->withErrors([$data['mode'] => $data['mode'] === 'email' ? 'We could not find a registration for that email. Register first, then request access.' : 'That access link is not valid for this replay.']);
        }

        session()->push('insights.replay_access', $webinar->id);

        return back()->with('success', 'Registration confirmed. Your replay is unlocked on this device, and a secure link has been sent to your email.');
    }
}
