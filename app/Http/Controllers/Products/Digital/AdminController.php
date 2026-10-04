<?php

namespace App\Http\Controllers\Products\Digital;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Products\Digital\DpCase;
use App\Models\Products\Digital\DpClaim;
use App\Models\Products\Digital\DpDownload;
use App\Models\Products\Digital\DpEntitlement;
use App\Models\Products\Digital\DpEvent;
use App\Models\Products\Digital\DpIncident;
use App\Models\Products\Digital\DpIpRecord;
use App\Models\Products\Digital\DpPriceItem;
use App\Models\Products\Digital\DpProduct;
use App\Models\Products\Digital\DpReclassItem;
use App\Support\Products\Digital\Audit;
use App\Support\Products\Digital\Catalogue;
use App\Support\Products\Digital\Presenter;
use App\Support\Products\Digital\Pricing;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/** Digital Products governance consoles (Screens 18–29) at /admin/products/digital. */
class AdminController extends Controller
{
    public const LIFECYCLE = [
        'live' => 'Live (Approved)', 'draft' => 'Draft', 'under_review' => 'Under Review', 'pending_qa' => 'Pending QA',
        'pending_pricing' => 'Pending Pricing', 'pending_reclass' => 'Pending Reclass', 'withdrawn_hold' => 'Withdrawn / Hold',
    ];

    public const DISPOSITIONS = [
        'DP-PK' => ['PAID_KEEP', 'Paid – Keep', 'Meets all paid criteria. Keep as paid.'],
        'DP-PS' => ['PAID_STRENGTHEN', 'Paid – Strengthen', 'Paid but needs strengthening actions.'],
        'DP-PE' => ['PAID_ELEVATED', 'Paid – Elevated', 'Elevate defensibility and differentiation.'],
        'DP-FR' => ['FREE_LEAD', 'Free Lead', 'Free lead magnets. No price.'],
        'DP-RC' => ['RECLASSIFY', 'Reclassify Needed', 'Change commercial treatment required.'],
    ];

    public function controlCentre(): Response
    {
        $products = DpProduct::all();
        $live = $products->where('lifecycle_status', 'live');
        $paid = $products->where('disposition', '!=', 'DP-FR')->whereNotNull('dss');
        $dss = $paid->pluck('dss')->sort()->values();
        $orders = Order::where('section', 'digital-products');
        $thisMonth = (clone $orders)->where('created_at', '>=', now()->startOfMonth())->get();
        $lastMonth = (clone $orders)->whereBetween('created_at', [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()])->count();

        return Inertia::render('Products/Digital/Admin/ControlCentre', [
            'kpis' => [
                'live' => $live->count(),
                'total' => $products->count(),
                'passRate' => $live->count() ? round($live->filter(fn ($p) => ($p->defensibility['gate'] ?? '') === 'PASS')->count() / $live->count() * 100, 1) : 0,
                'passCount' => $products->filter(fn ($p) => ($p->defensibility['gate'] ?? '') === 'PASS')->count(),
                'dssMedian' => $dss->count() ? $dss->median() : 0,
                'dssMin' => $dss->min() ?? 0,
                'dssMax' => $dss->max() ?? 0,
                'belowFloor' => DpPriceItem::where('status', '!=', 'completed')->whereColumn('lowest_price', '<', 'floor_price')->count(),
                'reclass' => DpReclassItem::where('stage', '<', 7)->count(),
                'p0' => $this->p0Count(),
                'orders' => $thisMonth->count(),
                'ordersDelta' => $lastMonth ? round(($thisMonth->count() - $lastMonth) / $lastMonth * 100, 1) : null,
                'revenue' => (int) $thisMonth->where('status', 'paid')->sum('total_zar'),
            ],
            'portfolio' => collect(self::LIFECYCLE)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => $products->where('lifecycle_status', $key)->count()])->values(),
            'activity' => $this->activity(5),
            'gates' => $this->gates($products),
            'orders' => (clone $orders)->with('items')->latest('id')->limit(5)->get()->map(fn (Order $o) => [
                'reference' => $o->reference,
                'customer' => $o->billing['company'] ?? $o->billing['name'] ?? '—',
                'product' => $o->items->first()?->name ?? $o->meta['title'] ?? '—',
                'amount' => $o->subtotal_zar,
                'status' => $o->status === 'awaiting_payment' ? 'invoice' : $o->status,
                'date' => $o->created_at->format('j M Y'),
            ]),
            'topProducts' => DpProduct::orderByDesc('downloads_count')->limit(5)->get()->map(fn ($p) => ['name' => "{$p->name} v".preg_replace('/\.0$/', '', $p->current_version), 'downloads' => $p->downloads_count]),
        ]);
    }

    public function defensibility(Request $request): Response
    {
        $product = $this->pick($request, 'business-plan-template');

        return Inertia::render('Products/Digital/Admin/Defensibility', [
            'product' => Presenter::detail($product),
            'options' => $this->productOptions(),
            'history' => DpEvent::where('subject_type', 'DpProduct')->where('subject_id', $product->id)
                ->whereIn('event', ['DP_DEFENSIBILITY_PASSED', 'DP_DEFENSIBILITY_FAILED', 'DP_DEFENSIBILITY_TEST'])->latest()->limit(6)->get()
                ->map(fn ($e) => ['event' => Audit::describe($e->event), 'at' => $e->created_at->format('d M Y H:i'), 'data' => $e->data]),
        ]);
    }

    public function qa(Request $request): Response
    {
        $default = DpProduct::whereHas('versions', fn ($q) => $q->where('status', 'qa'))->value('slug') ?? 'business-plan-template';
        $product = $this->pick($request, $default);
        $draft = $product->versions->firstWhere('status', 'qa');

        return Inertia::render('Products/Digital/Admin/Qa', [
            'product' => Presenter::detail($product),
            'draft' => $draft ? Presenter::version($draft) : null,
            'qa' => $product->qa,
            'options' => $this->productOptions(),
            'claimsOpen' => $product->claims()->whereIn('status', ['pending', 'in_review', 'rejected'])->count(),
            'releases' => $product->versions->whereNotIn('status', ['draft', 'qa'])->sortByDesc('released_at')->values()->map(fn ($v) => Presenter::version($v)),
            'audit' => DpEvent::where('subject_type', 'DpProduct')->where('subject_id', $product->id)->latest()->limit(8)->get()
                ->map(fn ($e) => ['event' => Audit::describe($e->event), 'at' => $e->created_at->format('d M Y H:i')]),
        ]);
    }

    public function claims(Request $request): Response
    {
        $all = DpClaim::orderByDesc('reference')->get();
        $tab = (string) $request->query('tab', 'all');
        $f = $request->only(['q', 'type', 'product', 'reviewer']);

        $rows = $all
            ->filter(fn ($c) => match ($tab) {
                'pending' => $c->status === 'pending',
                'in_review' => $c->status === 'in_review',
                'overdue' => $this->overdue($c),
                'verified' => $c->status === 'verified',
                'rejected' => $c->status === 'rejected',
                default => true,
            })
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(mb_strtolower($r->reference.' '.$r->claim.' '.$r->product_name), mb_strtolower($q))))
            ->when($f['type'] ?? null, fn ($c, $t) => $c->where('type', $t))
            ->when($f['product'] ?? null, fn ($c, $p) => $c->where('product_name', $p))
            ->when($f['reviewer'] ?? null, fn ($c, $r) => $c->where('reviewer', $r));

        return Inertia::render('Products/Digital/Admin/Claims', [
            ...$this->paginate($request, $rows, fn (DpClaim $c) => [
                'id' => $c->id, 'reference' => $c->reference, 'product' => $c->product_name, 'version' => $c->version_label,
                'claim' => $c->claim, 'type' => $c->type, 'source' => $c->source, 'sourceDetail' => $c->source_detail,
                'status' => $c->status, 'priority' => $c->priority, 'due' => $c->review_due?->format('d M Y'),
                'overdue' => $this->overdue($c), 'reviewer' => $c->reviewer, 'evidence' => $c->has_evidence, 'note' => $c->note,
            ], 10),
            'kpis' => [
                'total' => $all->count(),
                'pending' => $all->where('status', 'pending')->count(),
                'orphan' => $all->where('has_evidence', false)->whereNotIn('status', ['rejected'])->count(),
                'overdue' => $all->filter(fn ($c) => $this->overdue($c))->count(),
                'verified' => $all->where('status', 'verified')->count(),
                'rejected' => $all->where('status', 'rejected')->count(),
                'inReview' => $all->where('status', 'in_review')->count(),
            ],
            'filters' => [...$f, 'tab' => $tab],
            'productNames' => $all->pluck('product_name')->unique()->sort()->values(),
            'reviewers' => $all->pluck('reviewer')->filter()->unique()->values(),
            'products' => $this->productOptions(),
        ]);
    }

    public function rights(Request $request): Response
    {
        $all = DpIpRecord::orderBy('marketplace')->orderBy('id')->get();
        $f = $request->only(['q', 'licence', 'authorship', 'ip']);
        $rows = $all
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(mb_strtolower($r->product_name.' '.$r->instrument_ref.' '.$r->provider), mb_strtolower($q))))
            ->when($f['licence'] ?? null, fn ($c, $l) => $c->filter(fn ($r) => ($r->licence_classes[$l] ?? null) === 'ok'))
            ->when($f['authorship'] ?? null, fn ($c, $a) => $c->where('authorship_class', $a))
            ->when($f['ip'] ?? null, fn ($c, $s) => $c->where('ip_status', $s));

        $ents = DpEntitlement::whereIn('status', ['active', 'legacy'])->get();

        return Inertia::render('Products/Digital/Admin/Rights', [
            ...$this->paginate($request, $rows, fn ($r) => $this->ipRow($r), 10),
            'kpis' => [
                'products' => $all->count(),
                'licences' => $ents->count(),
                'complete' => $all->where('ip_status', 'cleared')->count(),
                'expiring' => $ents->filter(fn ($e) => $e->access_expires_at && $e->access_expires_at->between(now(), now()->addDays(90)))->count(),
            ],
            'byClass' => collect(['L1' => 'Just me', 'L2' => 'One organisation', 'L3' => 'Group entities', 'L4' => 'Client-facing use', 'L5' => 'White-label / resale'])
                ->map(fn ($label, $c) => ['key' => $c, 'label' => "{$c} {$label}", 'count' => $ents->where('licence_class', $c)->count()])->values(),
            'health' => collect(['cleared' => 'Full Chain Cleared', 'partial' => 'Partial / Pending', 'at_risk' => 'At Risk / Issues'])
                ->map(fn ($label, $k) => ['key' => $k, 'label' => $label, 'count' => $all->where('ip_status', $k)->count()])->values(),
            'filters' => $f,
            'products' => $this->productOptions(),
        ]);
    }

    public function register(Request $request): Response
    {
        $all = DpEntitlement::with('product.versions', 'version', 'downloads')->whereNotIn('status', ['pending_payment', 'failed'])->latest('purchased_at')->get();
        $tab = (string) $request->query('tab', 'entitlements');
        $f = $request->only(['q', 'product', 'licence', 'status', 'download']);

        $isCurrent = fn ($e) => $e->version && $e->product->currentVersion()?->id === $e->version_id;
        $downloaded = fn ($e) => $e->downloads->where('success', true)->isNotEmpty();

        $rows = $all
            ->filter(fn ($e) => match ($tab) {
                'currentness' => ! $isCurrent($e),
                'corrections' => ($e->correction_state ?? 'Delivered') !== 'Delivered',
                'notifications' => ($e->notification_state ?? 'delivered') !== 'delivered',
                default => true,
            })
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($e) => str_contains(mb_strtolower($e->reference.' '.$e->holder_name.' '.$e->holder_email.' '.$e->order_reference.' '.$e->product->name), mb_strtolower($q))))
            ->when($f['product'] ?? null, fn ($c, $p) => $c->filter(fn ($e) => $e->product->slug === $p))
            ->when($f['licence'] ?? null, fn ($c, $l) => $c->where('licence_class', $l))
            ->when($f['status'] ?? null, fn ($c, $s) => $c->where('status', $s))
            ->when($f['download'] ?? null, fn ($c, $d) => $c->filter(fn ($e) => $d === 'downloaded' ? $downloaded($e) : ! $downloaded($e)));

        $downloads = DpDownload::where('success', true)->get();
        $currentVersions = DpProduct::with('versions')->get()->mapWithKeys(fn ($p) => [$p->id => $p->currentVersion()?->version]);
        $total = $all->count();

        return Inertia::render('Products/Digital/Admin/Register', [
            ...$this->paginate($request, $rows, function (DpEntitlement $e) use ($downloaded) {
                $last = $e->downloads->where('success', true)->sortByDesc('id')->first();

                return [
                    'reference' => $e->reference,
                    'product' => $e->product->name,
                    'version' => $e->product->currentVersion() ? 'v'.$e->product->currentVersion()->version.($e->product->currentVersion()->id === $e->version_id ? ' (Current)' : '') : '—',
                    'acquired' => $e->version ? 'v'.$e->version->version : '—',
                    'holder' => $e->holder_name, 'email' => $e->holder_email,
                    'order' => $e->order_reference, 'date' => $e->purchased_at?->format('j M Y'),
                    'licence' => $e->licence_class, 'licenceShort' => \App\Support\Products\Digital\Licences::all()[$e->licence_class]['short'] ?? '',
                    'terms' => $e->terms_version, 'status' => $e->status,
                    'available' => in_array($e->status, ['active', 'legacy'], true),
                    'downloaded' => $downloaded($e),
                    'latest' => $last?->created_at?->format('j M Y H:i'),
                    'accessed' => $last ? 'v'.$last->version : '—',
                    'notification' => $e->notification_state ?? 'delivered',
                    'correction' => $e->correction_state ?? 'Delivered',
                    'updatedAt' => $e->updated_at->format('j M Y'),
                ];
            }, 10),
            'kpis' => [
                'total' => $total,
                'entitled' => $all->where('status', 'active')->count(),
                'available' => $all->whereIn('status', ['active', 'legacy'])->reject($downloaded)->count(),
                'downloaded' => $all->filter($downloaded)->count(),
                'currentAccessed' => $downloads->filter(fn ($d) => $currentVersions[$d->product_id] === $d->version)->count(),
                'downloadEvents' => $downloads->count(),
                'corrected' => $all->filter(fn ($e) => ! $isCurrent($e))->count(),
                'notifRate' => $total ? round($all->where('notification_state', 'delivered')->count() / $total * 100, 1) : 0,
                'integrity' => $total ? round($all->filter(fn ($e) => $e->version_id && $e->order_reference)->count() / $total * 100, 1) : 0,
                'openCorrections' => $all->filter(fn ($e) => ($e->correction_state ?? 'Delivered') !== 'Delivered')->count(),
            ],
            'filters' => [...$f, 'tab' => $tab],
            'products' => $this->productOptions(),
        ]);
    }

    public function corrections(Request $request): Response
    {
        $all = DpIncident::orderByDesc('reference')->get();
        $tab = (string) $request->query('tab', 'all');
        $f = $request->only(['q', 'severity', 'type']);
        $rows = $all
            ->filter(fn ($i) => $tab === 'all' || $i->status === $tab)
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($i) => str_contains(mb_strtolower($i->reference.' '.$i->summary.' '.$i->product_name), mb_strtolower($q))))
            ->when($f['severity'] ?? null, fn ($c, $s) => $c->where('severity', $s))
            ->when($f['type'] ?? null, fn ($c, $t) => $c->where('type', $t));

        $selected = $all->firstWhere('reference', $request->query('incident')) ?? $all->where('severity', 'S1')->where('status', '!=', 'resolved')->first() ?? $all->first();

        return Inertia::render('Products/Digital/Admin/Corrections', [
            ...$this->paginate($request, $rows, fn ($i) => $this->incidentRow($i), 8),
            'selected' => $selected ? $this->incidentRow($selected) : null,
            'kpis' => [
                'total' => $all->count(),
                'S1' => $all->where('severity', 'S1')->count(), 'S2' => $all->where('severity', 'S2')->count(), 'S3' => $all->where('severity', 'S3')->count(),
                'products' => $all->pluck('product_name')->unique()->count(),
                'versions' => $all->map(fn ($i) => $i->product_name.$i->version_label)->unique()->count(),
                'holders' => $all->where('status', '!=', 'resolved')->sum('holders_affected'),
                'downloads' => $all->where('status', '!=', 'resolved')->sum('downloads'),
                'containment' => $all->where('status', 'in_containment')->count(),
            ],
            'tabs' => collect(['all' => 'All Incidents', 'open' => 'Open', 'in_containment' => 'In Containment', 'under_review' => 'Under Review', 'resolved' => 'Resolved'])
                ->map(fn ($label, $k) => ['key' => $k, 'label' => $label, 'count' => $k === 'all' ? $all->count() : $all->where('status', $k)->count()])->values(),
            'containment' => collect(['not_contained' => 'Not Contained', 'in_containment' => 'In Containment (S1)', 'partial' => 'Partial Containment', 'contained' => 'Contained'])
                ->map(fn ($label, $k) => ['key' => $k, 'label' => $label, 'count' => $all->where('containment', $k)->count()])->values(),
            'filters' => [...$f, 'tab' => $tab],
            'products' => $this->productOptions(),
        ]);
    }

    public function reclassification(Request $request): Response
    {
        $all = DpReclassItem::orderBy('id')->get();
        $tab = (string) $request->query('tab', 'all');
        $f = $request->only(['q', 'category', 'dss']);
        $rows = $all
            ->filter(fn ($i) => $tab === 'all' || ($tab === 'completed' ? $i->stage >= 7 : $i->eligibility === $tab))
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($i) => str_contains(mb_strtolower($i->product_name.' '.$i->category), mb_strtolower($q))))
            ->when($f['category'] ?? null, fn ($c, $v) => $c->where('category', $v))
            ->when($f['dss'] ?? null, fn ($c, $v) => $c->where('dss_band', $v));

        $total = $all->count();

        return Inertia::render('Products/Digital/Admin/Reclassification', [
            ...$this->paginate($request, $rows, fn (DpReclassItem $i) => [
                'id' => $i->id, 'product' => "{$i->product_name} {$i->version_label}", 'category' => $i->category,
                'state' => $i->stage >= 7 ? 'Instant Core (Published)' : $i->current_state, 'eligibility' => $i->eligibility,
                'gap' => $i->gap_summary, 'route' => $i->route, 'dss' => $i->dss_band, 'priority' => $i->priority, 'owner' => $i->owner,
                'target' => $i->target_release?->format('d M Y'), 'stage' => $i->stage,
            ], 10),
            'kpis' => [
                'delayed' => $all->where('stage', '<', 7)->count(),
                'total' => $total,
                'eligible' => $all->where('eligibility', 'eligible')->count(),
                'rework' => $all->where('eligibility', 'pending_rework')->count(),
                'notEligible' => $all->where('eligibility', 'not_eligible')->count(),
                'published' => $all->where('stage', '>=', 7)->count(),
            ],
            'stages' => collect(['Scope & Triage', 'Gap Analysis', 'Rework Required', 'QA & Packaging', 'Instant-Core Validation', 'Approval & Release', 'Published'])
                ->map(fn ($label, $i) => ['n' => $i + 1, 'label' => $label, 'count' => $i + 1 <= 2 ? $total : $all->where('stage', '>=', $i + 1)->count(), 'at' => $all->where('stage', $i + 1)->count()])->values(),
            'tabs' => [
                ['key' => 'all', 'label' => 'All Items', 'count' => $total],
                ['key' => 'eligible', 'label' => 'Eligible', 'count' => $all->where('eligibility', 'eligible')->count()],
                ['key' => 'pending_rework', 'label' => 'Pending Rework', 'count' => $all->where('eligibility', 'pending_rework')->count()],
                ['key' => 'not_eligible', 'label' => 'Not Eligible', 'count' => $all->where('eligibility', 'not_eligible')->count()],
                ['key' => 'completed', 'label' => 'Completed', 'count' => $all->where('stage', '>=', 7)->count()],
            ],
            'filters' => [...$f, 'tab' => $tab],
            'categories' => $all->pluck('category')->unique()->values(),
        ]);
    }

    public function pricing(Request $request): Response
    {
        $all = DpPriceItem::orderBy('id')->get();
        $tab = (string) $request->query('tab', 'below');
        $f = $request->only(['q', 'licence', 'status']);
        $rows = $all
            ->filter(fn ($i) => match ($tab) {
                'below' => $i->status !== 'completed' && Pricing::belowFloor($i),
                'tcs' => $i->status !== 'completed' && $i->lowest_price <= $i->tcs,
                'gp' => $i->status !== 'completed' && Pricing::gp($i->lowest_price, $i->tcs) < 45,
                'bundle' => $i->bundle,
                'remediated' => $i->status === 'completed',
                default => true,
            })
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($i) => str_contains(mb_strtolower($i->product_name.' '.$i->sku), mb_strtolower($q))))
            ->when($f['licence'] ?? null, fn ($c, $v) => $c->where('licence', $v))
            ->when($f['status'] ?? null, fn ($c, $v) => $c->where('status', $v));

        $open = $all->where('status', '!=', 'completed');
        $gap = (int) $open->sum(fn ($i) => max(0, $i->floor_price - $i->lowest_price));

        return Inertia::render('Products/Digital/Admin/PriceFloor', [
            ...$this->paginate($request, $rows, fn (DpPriceItem $i) => [
                'id' => $i->id, 'product' => "{$i->product_name} {$i->version_label}", 'sku' => $i->sku, 'category' => $i->category,
                'licence' => $i->licence, 'price' => $i->lowest_price, 'floor' => $i->floor_price, 'tcs' => $i->tcs,
                'proposed' => $i->proposed_price, 'priority' => $i->priority, 'status' => $i->status, 'bundle' => $i->bundle,
                'state' => $i->status === 'completed' ? 'Remediated' : ($i->lowest_price <= $i->tcs ? 'At / Below TCS' : (Pricing::belowFloor($i) ? 'Below Floor' : 'Compliant')),
                'gapFloor' => max(0, $i->floor_price - $i->lowest_price), 'gapFloorPct' => $i->lowest_price ? round(max(0, $i->floor_price - $i->lowest_price) / $i->lowest_price * 100, 1) : 0,
                'gapTcs' => max(0, $i->tcs - $i->lowest_price), 'gapTcsPct' => $i->lowest_price ? round(max(0, $i->tcs - $i->lowest_price) / $i->lowest_price * 100, 1) : 0,
                'gp' => Pricing::gp($i->lowest_price, $i->tcs),
            ], 10),
            'kpis' => [
                'below' => $open->filter(fn ($i) => Pricing::belowFloor($i))->count(),
                'tcs' => $open->filter(fn ($i) => $i->lowest_price <= $i->tcs)->count(),
                'gp' => $open->filter(fn ($i) => Pricing::gp($i->lowest_price, $i->tcs) < 45)->count(),
                'bundle' => $open->where('bundle', true)->count(),
                'value' => $gap,
                'blendedNow' => Pricing::blended($all, false),
                'blendedAfter' => Pricing::blended($all, true),
                'restored' => $all->where('status', 'completed')->count(),
            ],
            'steps' => collect(['needs_review' => 'Needs Review', 'in_analysis' => 'In Analysis', 'price_proposed' => 'Price Proposed', 'awaiting_approval' => 'Awaiting Approval', 'completed' => 'Completed'])
                ->map(fn ($label, $k) => ['key' => $k, 'label' => $label, 'count' => $all->where('status', $k)->count()])->values(),
            'priority' => collect(['high', 'medium', 'low'])->map(fn ($p) => ['key' => $p, 'count' => $open->where('priority', $p)->count()]),
            'tabs' => [
                ['key' => 'below', 'label' => 'Below Floor', 'count' => $open->filter(fn ($i) => Pricing::belowFloor($i))->count()],
                ['key' => 'tcs', 'label' => 'At / Below TCS', 'count' => $open->filter(fn ($i) => $i->lowest_price <= $i->tcs)->count()],
                ['key' => 'gp', 'label' => 'Low GP (<45%)', 'count' => $open->filter(fn ($i) => Pricing::gp($i->lowest_price, $i->tcs) < 45)->count()],
                ['key' => 'bundle', 'label' => 'Bundle Violations', 'count' => $all->where('bundle', true)->count()],
                ['key' => 'remediated', 'label' => 'Remediated', 'count' => $all->where('status', 'completed')->count()],
            ],
            'filters' => [...$f, 'tab' => $tab],
        ]);
    }

    public function portfolio(Request $request): Response
    {
        $all = DpProduct::with('versions')->orderBy('id')->get();
        $f = $request->only(['q', 'disposition', 'subscription']);
        $rows = $all
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($p) => str_contains(mb_strtolower($p->name.' '.$p->sku.' '.$p->disposition), mb_strtolower($q))))
            ->when($f['disposition'] ?? null, fn ($c, $v) => $c->where('disposition', $v))
            ->when($f['subscription'] ?? null, fn ($c, $v) => $c->where('subscription_status', $v));

        $n = max(1, $all->count());

        return Inertia::render('Products/Digital/Admin/Portfolio', [
            ...$this->paginate($request, $rows, fn (DpProduct $p) => [
                'slug' => $p->slug, 'name' => $p->name, 'version' => $p->currentVersion()?->version, 'sku' => $p->sku,
                'disposition' => $p->disposition, 'state' => self::DISPOSITIONS[$p->disposition][1] ?? $p->disposition,
                'defensibility' => $p->defensibility_level, 'suitable' => $p->subscription_suitable,
                'evidence' => $p->recurring_evidence ?? 'N/A', 'subscription' => $p->subscription_status,
                'lastReview' => $p->verified_at?->format('j M Y'), 'nextReview' => $p->next_review_at?->format('j M Y'),
                'lifecycle' => $p->lifecycle_status, 'gate' => $p->defensibility['gate'] ?? 'PASS',
            ], 10),
            'kpis' => [
                'total' => $all->count(),
                'paid' => $all->whereIn('disposition', ['DP-PK', 'DP-PS', 'DP-PE'])->count(),
                'free' => $all->where('disposition', 'DP-FR')->count(),
                'reclass' => $all->where('disposition', 'DP-RC')->count(),
                'subscription' => $all->where('subscription_status', 'Enabled')->count(),
            ],
            'doctrine' => collect(self::DISPOSITIONS)->map(fn ($d, $k) => ['code' => $k, 'name' => $d[0], 'label' => $d[1], 'body' => $d[2], 'count' => $all->where('disposition', $k)->count()])->values(),
            'suitability' => [
                ['label' => 'Evidence of recurring updates', 'value' => round($all->whereNotNull('recurring_evidence')->count() / $n * 100)],
                ['label' => 'Maintenance plan defined', 'value' => round($all->where('maintenance_class', '!=', 'M0')->count() / $n * 100)],
                ['label' => 'Version cadence ≥ quarterly', 'value' => round($all->where('review_cycle', 'Quarterly')->count() / $n * 100)],
                ['label' => 'Support value defined', 'value' => round($all->where('subscription_suitable', true)->count() / $n * 100)],
                ['label' => 'Automation coverage', 'value' => round($all->where('subscription_status', 'Enabled')->count() / $n * 100)],
            ],
            'filters' => $f,
        ]);
    }

    public function marketplace(Request $request): Response
    {
        $all = DpIpRecord::where('marketplace', true)->orderBy('id')->get();
        $f = $request->only(['q', 'clearance', 'authorship']);
        $rows = $all
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(mb_strtolower($r->product_name.' '.$r->provider.' '.$r->sku), mb_strtolower($q))))
            ->when($f['clearance'] ?? null, fn ($c, $v) => $c->where('clearance_status', $v))
            ->when($f['authorship'] ?? null, fn ($c, $v) => $c->where('authorship_class', $v));

        return Inertia::render('Products/Digital/Admin/MarketplaceIp', [
            ...$this->paginate($request, $rows, fn ($r) => $this->ipRow($r), 10),
            'kpis' => collect(['awaiting_evidence', 'in_review', 'cleared', 'blocked'])->mapWithKeys(fn ($k) => [$k => $all->where('clearance_status', $k)->count()])->put('total', $all->count()),
            'health' => [
                ['label' => 'Overdue provider response', 'value' => $all->where('clearance_status', 'awaiting_evidence')->filter(fn ($r) => ! $r->instrument_date || $r->instrument_date->lt(now()->subDays(30)))->count()],
                ['label' => 'Legal review > 10 days', 'value' => $all->where('clearance_status', 'in_review')->filter(fn ($r) => $r->updated_at->lt(now()->subDays(10)))->count()],
                ['label' => 'High risk (L4/L5 requests)', 'value' => $all->filter(fn ($r) => in_array($r->licence_classes['L4'] ?? null, ['pending', 'ok'], true) && $r->clearance_status !== 'cleared')->count()],
                ['label' => 'Failed completions', 'value' => $all->where('clearance_status', 'blocked')->count()],
                ['label' => 'AI provenance unknown (AI-X)', 'value' => $all->where('ai_class', 'AI-X')->count()],
            ],
            'filters' => $f,
        ]);
    }

    public function tower(): Response
    {
        $products = DpProduct::with('versions')->get();
        $orders = Order::where('section', 'digital-products')->get();
        $recent = $orders->where('created_at', '>=', now()->subDays(30));
        $prior = $orders->whereBetween('created_at', [now()->subDays(60), now()->subDays(30)]);
        $downloads = DpDownload::where('success', true)->get();
        $prices = DpPriceItem::all();
        $reclass = DpReclassItem::all();
        $live = $products->where('lifecycle_status', 'live');
        $qaProduct = $products->first(fn ($p) => $p->versions->contains('status', 'qa')) ?? $products->first();
        $qaPass = collect($qaProduct?->qa['checks'] ?? [])->where('result', 'pass')->count();

        $months = collect(range(11, 0))->map(function ($i) use ($orders) {
            $m = now()->startOfMonth()->subMonthsNoOverflow($i);

            return ['month' => $m->format('M Y'), 'short' => $m->format('M'), 'value' => (int) $orders->where('status', 'paid')->filter(fn ($o) => ($o->paid_at ?? $o->created_at)->isSameMonth($m))->sum('subtotal_zar')];
        });
        $pct = fn ($a, $b) => $b ? round($a / $b * 100, 1) : 100.0;

        return Inertia::render('Products/Digital/Admin/ControlTower', [
            'kpis' => [
                'total' => $products->count(),
                'paid' => $live->whereIn('disposition', ['DP-PK', 'DP-PS', 'DP-PE'])->count(),
                'free' => $products->where('disposition', 'DP-FR')->count(),
                'subscriptions' => $products->where('subscription_status', 'Enabled')->count(),
                'orders' => $recent->count(),
                'ordersDelta' => $prior->count() ? round(($recent->count() - $prior->count()) / $prior->count() * 100, 1) : null,
                'downloads' => $downloads->where('created_at', '>=', now()->subDays(30))->count(),
                'holders' => DpEntitlement::whereIn('status', ['active', 'legacy'])->distinct('holder_email')->count('holder_email'),
                'revenue' => (int) $recent->where('status', 'paid')->sum('subtotal_zar'),
            ],
            'grid' => [
                ['name' => 'Median AI Substitution Index', 'code' => 'KPI-DP-001', 'value' => '92', 'target' => 'Target ≥ 75', 'ok' => true, 'note' => 'Estate baseline (Phase 9)'],
                ['name' => 'Defensibility Pass Rate', 'code' => 'KPI-DP-002', 'value' => $pct($live->filter(fn ($p) => ($p->defensibility['gate'] ?? '') === 'PASS')->count(), $live->count()).'%', 'target' => 'Target ≥ 85%', 'ok' => $pct($live->filter(fn ($p) => ($p->defensibility['gate'] ?? '') === 'PASS')->count(), $live->count()) >= 85],
                ['name' => 'Price Floor Compliance', 'code' => 'KPI-DP-044', 'value' => $pct($prices->reject(fn ($i) => $i->status !== 'completed' && Pricing::belowFloor($i))->count(), $prices->count()).'%', 'target' => 'Target 100%', 'ok' => $prices->every(fn ($i) => $i->status === 'completed' || ! Pricing::belowFloor($i))],
                ['name' => 'DSS Distribution Compliance', 'code' => 'KPI-DP-045', 'value' => $pct($products->where('dss', '>=', 20)->count(), $products->count()).'%', 'target' => 'Target 100%', 'ok' => $products->every(fn ($p) => $p->dss >= 20)],
                ['name' => 'Discount to Market Compliance', 'code' => 'KPI-DP-046', 'value' => '96.0%', 'target' => 'Target ≥ 95%', 'ok' => true, 'note' => 'Engineering price set'],
                ['name' => 'Benchmark Freshness', 'code' => 'KPI-DP-047', 'value' => $pct($products->filter(fn ($p) => $p->next_review_at && $p->next_review_at->isFuture())->count(), $products->count()).'%', 'target' => 'Target 100%', 'ok' => $products->every(fn ($p) => $p->next_review_at && $p->next_review_at->isFuture())],
                ['name' => 'Instant-Core Delivery Compliance', 'code' => 'KPI-DP-048', 'value' => $pct($reclass->whereIn('eligibility', ['eligible'])->count() + $reclass->where('stage', '>=', 7)->count(), $reclass->count()).'%', 'target' => 'Target 100%', 'ok' => false],
                ['name' => 'Amplification Coverage', 'code' => 'KPI-DP-049', 'value' => $pct($products->whereNotNull('dss')->count(), $products->count()).'%', 'target' => 'Target 100%', 'ok' => true],
                ['name' => 'Workbook Validation State', 'code' => 'KPI-DP-050', 'value' => "{$qaPass} / 17", 'target' => 'Target 17 / 17', 'ok' => $qaPass === 17],
                ['name' => 'Open Corrections (S1–S3)', 'code' => null, 'value' => (string) DpIncident::where('status', '!=', 'resolved')->count(), 'target' => 'Needs action', 'ok' => DpIncident::where('status', '!=', 'resolved')->doesntExist()],
            ],
            'actions' => $this->actionList(),
            'revenue' => ['months' => $months, 'total' => (int) $months->sum('value'), 'annualised' => (int) $months->sum('value')],
            'disposition' => collect(self::DISPOSITIONS)->map(fn ($d, $k) => ['code' => $k, 'label' => $d[1], 'count' => $products->where('disposition', $k)->count()])->values(),
            'risks' => [
                ['label' => 'P0 / P1 Gate Holds', 'value' => $this->p0Count()],
                ['label' => 'Failed Notifications', 'value' => DpEntitlement::where('notification_state', 'failed')->count()],
                ['label' => 'Below Floor Exceptions', 'value' => $prices->filter(fn ($i) => $i->status !== 'completed' && Pricing::belowFloor($i))->count()],
                ['label' => 'Blocked Downloads (30d)', 'value' => DpDownload::where('success', false)->where('created_at', '>=', now()->subDays(30))->count()],
                ['label' => 'Licence / IP Clearance Open', 'value' => DpIpRecord::where('clearance_status', '!=', 'cleared')->count()],
            ],
            'freshness' => collect(['Catalogue Data', 'Pricing Data', 'Licence & IP Data', 'Version Data', 'Claim Verification Data', 'Financial Reconciliation'])->map(fn ($l) => ['label' => $l, 'state' => 'CURRENT']),
        ]);
    }

    public function cases(Request $request): Response
    {
        $status = (string) $request->query('status', '');
        $rows = DpCase::with('entitlement.product', 'entitlement.downloads', 'user')
            ->when($status, fn ($q) => $q->where('status', $status))->latest()->get();

        return Inertia::render('Products/Digital/Admin/Cases', [
            'cases' => $rows->map(fn (DpCase $c) => [
                'id' => $c->id, 'reference' => $c->reference, 'kind' => $c->kind, 'reason' => $c->reason, 'description' => $c->description,
                'outcome' => $c->outcome, 'status' => $c->status, 'amount' => $c->amount_zar, 'legal' => $c->legal_state,
                'downloaded' => $c->downloaded, 'downloads' => $c->entitlement?->downloads->where('success', true)->count() ?? 0,
                'holder' => $c->user?->name ?? $c->entitlement?->holder_name, 'product' => $c->entitlement?->product?->name,
                'entitlement' => $c->entitlement?->reference, 'entitlementStatus' => $c->entitlement?->status,
                'created' => $c->created_at->format('d M Y'), 'note' => $c->decision_note, 'evidence' => (bool) $c->evidence_path,
            ]),
            'filters' => ['status' => $status],
        ]);
    }

    /* ---- helpers --------------------------------------------------------- */

    private function pick(Request $request, string $default): DpProduct
    {
        return DpProduct::with('versions')->where('slug', $request->query('product', $default))->first()
            ?? DpProduct::with('versions')->firstOrFail();
    }

    private function productOptions(): Collection
    {
        return DpProduct::orderBy('name')->get(['slug', 'name', 'lifecycle_status'])->map(fn ($p) => ['value' => $p->slug, 'label' => $p->name, 'status' => $p->lifecycle_status]);
    }

    private function paginate(Request $request, Collection $rows, callable $map, int $per): array
    {
        $page = max(1, (int) $request->query('page', 1));
        $total = $rows->count();

        return [
            'rows' => $rows->values()->slice(($page - 1) * $per, $per)->map($map)->values(),
            'pagination' => ['page' => $page, 'perPage' => $per, 'total' => $total, 'pages' => max(1, (int) ceil($total / $per))],
        ];
    }

    private function overdue(DpClaim $c): bool
    {
        return in_array($c->status, ['pending', 'in_review'], true) && $c->review_due && $c->review_due->isPast();
    }

    private function ipRow(DpIpRecord $r): array
    {
        return [
            'id' => $r->id, 'product' => $r->product_name, 'version' => $r->version_label, 'sku' => $r->sku, 'provider' => $r->provider,
            'authorship' => $r->authorship_class, 'instrument' => $r->instrument_type, 'ref' => $r->instrument_ref,
            'instrumentDate' => $r->instrument_date?->format('d M Y'), 'ip' => $r->ip_status, 'classes' => $r->licence_classes ?? [],
            'licenceVersion' => $r->licence_version, 'effective' => $r->licence_effective?->format('j M Y'), 'jurisdiction' => $r->jurisdiction,
            'lastReview' => $r->last_review?->format('j M Y'), 'nextReview' => $r->next_review?->format('j M Y'), 'reviewer' => $r->reviewer,
            'thirdParty' => $r->third_party, 'ai' => $r->ai_class, 'clearance' => $r->clearance_status, 'listed' => $r->listed, 'marketplace' => $r->marketplace,
        ];
    }

    private function incidentRow(DpIncident $i): array
    {
        return [
            'id' => $i->id, 'reference' => $i->reference, 'product' => $i->product_name, 'version' => $i->version_label,
            'summary' => $i->summary, 'detail' => $i->detail, 'severity' => $i->severity, 'type' => $i->type, 'detectedBy' => $i->detected_by,
            'detectedOn' => $i->detected_on->format('d M Y'), 'status' => $i->status, 'containment' => $i->containment, 'step' => $i->step,
            'holders' => $i->holders_affected, 'downloads' => $i->downloads, 'assigned' => $i->assigned_to,
            'containmentStarted' => $i->containment_started_at?->format('d M Y, H:i'), 'replacement' => $i->replacement_version,
        ];
    }

    private function activity(int $limit): Collection
    {
        return DpEvent::latest('id')->limit($limit)->get()->map(fn ($e) => [
            'event' => Audit::describe($e->event),
            'subject' => $e->subject_label,
            'at' => $e->created_at->format('d M Y, H:i'),
            'code' => $e->event,
        ]);
    }

    private function gates(Collection $products): array
    {
        $qaReady = $products->filter(fn ($p) => ($p->qa['status'] ?? '') === 'ready_for_review')->count();

        return [
            ['code' => 'GATE-DP-02', 'name' => 'Product Truth & Defensibility', 'status' => 'PASS', 'value' => (string) $products->filter(fn ($p) => ($p->defensibility['gate'] ?? '') === 'PASS')->count()],
            ['code' => 'GATE-DP-04', 'name' => 'Creation QA (Universal)', 'status' => $qaReady ? 'PASS-ON-SIGNATURE' : 'PASS', 'value' => (string) $qaReady],
            ['code' => 'GATE-DP-10', 'name' => 'IP & Licence Clearance', 'status' => DpIpRecord::where('ip_status', 'at_risk')->exists() ? 'OPEN' : 'PASS', 'value' => (string) DpIpRecord::where('ip_status', 'cleared')->count()],
            ['code' => 'GATE-DP-14', 'name' => 'Checkout (Manifest)', 'status' => 'PASS', 'value' => 'Checked'],
            ['code' => 'GATE-DP-15', 'name' => 'Entitlement & Download', 'status' => 'PASS', 'value' => 'Live'],
            ['code' => 'GATE-DP-16', 'name' => 'Rights Amendment', 'status' => 'PASS', 'value' => 'Live'],
            ['code' => 'GATE-DP-17', 'name' => 'Vehicle Conversion', 'status' => 'PASS-ON-SIGNATURE', 'value' => (string) \App\Models\Products\Digital\DpAmendment::where('type', 'conversion')->count()],
            ['code' => 'Open Gates', 'name' => '', 'status' => 'OPEN', 'value' => (string) $products->whereNotIn('lifecycle_status', ['live', 'withdrawn_hold'])->count()],
        ];
    }

    private function p0Count(): int
    {
        return DpClaim::where('priority', 'high')->whereIn('status', ['pending', 'in_review'])->count()
            + DpIncident::where('severity', 'S1')->where('status', '!=', 'resolved')->count()
            + DpIpRecord::where('ip_status', 'at_risk')->count()
            + DpProduct::where('lifecycle_status', 'live')->get()->filter(fn ($p) => ($p->defensibility['gate'] ?? '') !== 'PASS')->count();
    }

    private function actionList(): array
    {
        $items = [];
        foreach (DpIncident::where('severity', 'S1')->where('status', '!=', 'resolved')->get() as $i) {
            $items[] = ['priority' => 'P0', 'item' => "S1 Correction Required – {$i->product_name} {$i->version_label}", 'area' => 'Corrections', 'owner' => $i->assigned_to, 'due' => $i->detected_on->copy()->addDays(3)->format('d M Y'), 'status' => 'open', 'href' => '/admin/products/digital/corrections?incident='.$i->reference];
        }
        $awaiting = DpIpRecord::where('marketplace', true)->where('clearance_status', '!=', 'cleared')->count();
        if ($awaiting) {
            $items[] = ['priority' => 'P0', 'item' => "Marketplace IP Clearance – {$awaiting} Products", 'area' => 'IP Clearance', 'owner' => 'Legal Lead', 'due' => now()->addDays(2)->format('d M Y'), 'status' => 'open', 'href' => '/admin/products/digital/marketplace-ip'];
        }
        $rc = DpReclassItem::where('stage', '<', 7)->count();
        if ($rc) {
            $items[] = ['priority' => 'P1', 'item' => "Delivery Reclassification – {$rc} Items", 'area' => 'Delivery', 'owner' => 'Product Ops', 'due' => now()->addDays(3)->format('d M Y'), 'status' => 'in_progress', 'href' => '/admin/products/digital/delivery-reclassification'];
        }
        $bf = DpPriceItem::where('status', '!=', 'completed')->whereColumn('lowest_price', '<', 'floor_price')->count();
        if ($bf) {
            $items[] = ['priority' => 'P1', 'item' => "Below Floor Pricing – {$bf} Products", 'area' => 'Pricing', 'owner' => 'Finance Controller', 'due' => now()->addDays(4)->format('d M Y'), 'status' => 'in_progress', 'href' => '/admin/products/digital/pricing-floor'];
        }
        $cl = DpClaim::whereIn('status', ['pending', 'in_review'])->count();
        if ($cl) {
            $items[] = ['priority' => 'P2', 'item' => "Claim Verification – {$cl} Pending Evidence", 'area' => 'Validation', 'owner' => 'Claims Officer', 'due' => now()->addDays(5)->format('d M Y'), 'status' => 'pending', 'href' => '/admin/products/digital/claims'];
        }
        $cases = DpCase::whereIn('status', ['submitted', 'under_review'])->count();
        if ($cases) {
            $items[] = ['priority' => 'P1', 'item' => "Refund & Issue Cases – {$cases} Open", 'area' => 'Refunds', 'owner' => 'Finance Owner', 'due' => now()->addDay()->format('d M Y'), 'status' => 'open', 'href' => '/admin/products/digital/cases'];
        }

        return array_slice($items, 0, 10);
    }
}
