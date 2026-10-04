<?php

namespace App\Http\Controllers\Products\Digital;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Products\Digital\DpAmendment;
use App\Models\Products\Digital\DpCase;
use App\Models\Products\Digital\DpDownload;
use App\Models\Products\Digital\DpEntitlement;
use App\Models\Products\Digital\DpEvent;
use App\Models\Products\Digital\DpVersion;
use App\Support\Platform\Checkout;
use App\Support\Products\Digital\Artefact;
use App\Support\Products\Digital\Audit;
use App\Support\Products\Digital\Entitlements;
use App\Support\Products\Digital\Licences;
use App\Support\Products\Digital\Presenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Signed-in holder workspace (Screens 10–17): library, entitlement & download,
 * updates, upgrades, Maintained Access, version covenant, refunds and conversion.
 */
class LibraryController extends Controller
{
    /** Maintained Access plans (VAT-inclusive display price). */
    public const PLANS = [
        'annual' => ['label' => 'Annual Plan', 'incl' => 895, 'period' => 'year', 'renews' => 'Renews annually until cancelled.'],
        'monthly' => ['label' => 'Monthly Plan', 'incl' => 95, 'period' => 'month', 'renews' => 'Renews monthly until cancelled.'],
    ];

    /** Related Sprint / Advisory routes (Screen 17), VAT-inclusive "from" prices. */
    public const SERVICES = [
        'bp-implementation' => ['kind' => 'Sprint', 'title' => 'Business Plan Implementation', 'body' => 'We work with you to turn your plan into action with milestones and deliverables.', 'incl' => 5950, 'term' => 'Est. Duration: 2–3 weeks', 'slug' => 'business-plan-implementation'],
        'fin-model' => ['kind' => 'Sprint', 'title' => 'Financial Model Build & Review', 'body' => 'Professional build or review of your financial model and assumptions.', 'incl' => 4950, 'term' => 'Est. Duration: 1–2 weeks', 'slug' => 'financial-model-build-review'],
        'investor-ready' => ['kind' => 'Sprint', 'title' => 'Investor-Ready Package', 'body' => 'Polished investor deck, executive summary and supporting docs.', 'incl' => 7950, 'term' => 'Est. Duration: 2–4 weeks', 'slug' => 'investor-ready-package', 'popular' => true],
        'strategy-session' => ['kind' => 'Advisory', 'title' => 'One-on-One Strategy Session', 'body' => 'Senior advisor session to refine strategy and answer your key questions.', 'incl' => 2450, 'term' => 'Est. Duration: 90 minutes', 'slug' => null],
        'retainer' => ['kind' => 'Retainer', 'title' => 'Ongoing Business Advisory', 'body' => 'Monthly expert guidance to keep your business on track.', 'incl' => 8950, 'term' => 'Min. Term: 3 months', 'slug' => null, 'monthly' => true],
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();
        Entitlements::syncUser($user);

        $all = DpEntitlement::with('product.versions', 'version', 'downloads')
            ->where('user_id', $user->id)
            ->whereNotIn('status', ['pending_payment', 'failed'])
            ->latest('purchased_at')->get();

        $tab = (string) $request->query('tab', 'all');
        $q = mb_strtolower(trim((string) $request->query('q', '')));
        $types = array_values(array_filter((array) $request->query('types', [])));
        $licence = (string) $request->query('licence', '');
        $format = (string) $request->query('format', '');
        $sort = (string) $request->query('sort', 'recent');

        $rows = $all->map(fn ($e) => ['model' => $e, 'data' => Presenter::entitlement($e)]);
        $expiring = fn ($e) => $e->access_expires_at && $e->access_expires_at->lte(now()->addDays(60)) && $e->access_expires_at->isFuture()
            || ($e->maintenance_until && $e->maintenance_status === 'active' && $e->maintenance_until->lte(now()->addDays(60)));

        $filtered = $rows
            ->filter(fn ($r) => match ($tab) {
                'active' => in_array($r['model']->status, ['active', 'legacy'], true),
                'updates' => $r['data']['updateAvailable'],
                'expiring' => $expiring($r['model']),
                'archived' => in_array($r['model']->status, ['refunded', 'revoked', 'legacy'], true) || ($r['model']->access_expires_at?->isPast() ?? false),
                'withdrawn' => $r['model']->version?->status === 'withdrawn_unsafe',
                default => true,
            })
            ->filter(fn ($r) => $q === '' || str_contains(mb_strtolower($r['data']['product']['name'].' '.$r['data']['product']['sku']), $q))
            ->filter(fn ($r) => ! $types || in_array($r['data']['product']['type'], $types, true))
            ->filter(fn ($r) => $licence === '' || $r['data']['licence'] === $licence)
            ->filter(fn ($r) => $format === '' || $r['data']['format'] === $format);

        $filtered = $sort === 'name' ? $filtered->sortBy(fn ($r) => $r['data']['product']['name']) : $filtered;

        $perPage = 5;
        $page = max(1, (int) $request->query('page', 1));
        $total = $filtered->count();

        return Inertia::render('Products/Digital/Library/Index', [
            'items' => $filtered->values()->slice(($page - 1) * $perPage, $perPage)->map(fn ($r) => $r['data'])->values(),
            'pagination' => ['page' => $page, 'perPage' => $perPage, 'total' => $total, 'pages' => max(1, (int) ceil($total / $perPage))],
            'kpis' => [
                'active' => $all->whereIn('status', ['active', 'legacy'])->count(),
                'updates' => $rows->where('data.updateAvailable', true)->count(),
                'expiring' => $all->filter($expiring)->count(),
                'spent' => (int) Order::where('user_id', $user->id)->where('status', 'paid')
                    ->where(fn ($q) => $q->where('section', 'digital-products')->orWhereHas('items', fn ($i) => $i->where('item_type', 'digital-product')))
                    ->sum('subtotal_zar'),
            ],
            'typeCounts' => collect(Presenter::TYPES)->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => $all->where('product.type', $key)->count()])->values(),
            'filters' => compact('tab', 'q', 'types', 'licence', 'format', 'sort'),
            'pending' => DpEntitlement::with('product')->where('user_id', $user->id)->where('status', 'pending_payment')->get()
                ->map(fn ($e) => ['reference' => $e->reference, 'name' => $e->product->name, 'order' => $e->order_reference]),
        ]);
    }

    public function show(Request $request, DpEntitlement $entitlement): Response
    {
        $e = $this->load($request, $entitlement);
        $versions = Entitlements::downloadableVersions($e);

        $events = DpEvent::where('subject_type', 'DpEntitlement')->where('subject_id', $e->id)->oldest()->get();
        $trail = collect([
            ['label' => 'Purchased', 'at' => $e->purchased_at],
            ['label' => 'Payment Confirmed', 'at' => $e->activated_at ?? $events->firstWhere('event', 'DP_PAYMENT_VERIFIED')?->created_at],
            ['label' => 'Entitlement Created', 'at' => $e->activated_at],
            ['label' => 'First Download', 'at' => $e->downloads->where('success', true)->sortBy('id')->first()?->created_at],
        ])->filter(fn ($r) => $r['at'])->map(fn ($r) => ['label' => $r['label'], 'at' => $r['at']->format('d M Y H:i').' SAST'])->values();

        return Inertia::render('Products/Digital/Library/Entitlement', [
            'entitlement' => Presenter::entitlement($e),
            'licence' => Licences::all()[$e->licence_class],
            'blockReason' => Entitlements::blockReason($e),
            'downloadable' => $versions->map(fn ($v) => Presenter::version($v)),
            'formats' => $e->product->formats ?? [],
            'fileName' => $e->version ? Artefact::displayName($e, $e->version, $e->format, $e->language) : null,
            'trail' => $trail,
            'history' => $e->downloads->sortByDesc('id')->take(10)->values()->map(fn ($d) => [
                'at' => $d->created_at->format('d M Y H:i'), 'version' => 'v'.$d->version, 'format' => $d->format,
                'success' => $d->success, 'reason' => $d->failure_reason,
            ]),
            'updatesCount' => $e->product->versions->filter(fn ($v) => $v->status === 'current' && $v->id !== $e->version_id)->count(),
        ]);
    }

    /** GATE-DP-15 download: entitlement + verified payment + safe version; every attempt is logged. */
    public function download(Request $request, DpEntitlement $entitlement): HttpResponse|RedirectResponse
    {
        $e = $this->load($request, $entitlement);

        $data = $request->validate([
            'format' => ['nullable', Rule::in(collect($e->product->formats)->pluck('code')->all())],
            'version' => ['nullable', 'integer'],
        ]);

        $format = $data['format'] ?? $e->format;
        $version = isset($data['version']) ? $e->product->versions->firstWhere('id', (int) $data['version']) : $e->version;
        $reason = Entitlements::blockReason($e, $version);

        if ($reason) {
            DpDownload::create([
                'entitlement_id' => $e->id, 'user_id' => $request->user()->id, 'product_id' => $e->product_id,
                'version' => $version?->version ?? '-', 'format' => $format, 'language' => $e->language,
                'file_name' => '-', 'success' => false, 'failure_reason' => $reason, 'ip' => $request->ip(),
            ]);
            Audit::log('DP_DOWNLOAD_BLOCKED', $e, ['reason' => $reason]);

            return back()->with('error', $reason);
        }

        $pdf = Artefact::pdf($e, $version, $format, $e->language);
        $name = Artefact::fileName($e, $version, $format, $e->language);

        DpDownload::create([
            'entitlement_id' => $e->id, 'user_id' => $request->user()->id, 'product_id' => $e->product_id,
            'version' => $version->version, 'format' => $format, 'language' => $e->language,
            'file_name' => $name, 'success' => true, 'hash' => hash('sha256', $pdf), 'ip' => $request->ip(),
        ]);
        $e->product->increment('downloads_count');
        Audit::log('DP_DOWNLOAD_SUCCEEDED', $e, ['version' => $version->version, 'format' => $format]);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.str_replace('"', '', $name).'"',
        ]);
    }

    public function updates(Request $request, DpEntitlement $entitlement): Response
    {
        $e = $this->load($request, $entitlement);
        $acquired = $e->version;
        $later = $e->product->versions
            ->filter(fn (DpVersion $v) => $acquired && $v->released_at && $acquired->released_at && $v->released_at->gt($acquired->released_at))
            ->whereNotIn('status', ['draft', 'qa'])
            ->sortByDesc('released_at')->values();
        $archived = $e->product->versions
            ->filter(fn (DpVersion $v) => $acquired && $v->released_at && $acquired->released_at && $v->released_at->lte($acquired->released_at) && $v->id !== $acquired->id)
            ->sortByDesc('released_at')->values();

        $map = fn (DpVersion $v) => [...Presenter::version($v), 'included' => Entitlements::updateIncluded($e, $v), 'withdrawn' => $v->status === 'withdrawn_unsafe'];

        return Inertia::render('Products/Digital/Library/Updates', [
            'entitlement' => Presenter::entitlement($e),
            'updates' => $later->map($map),
            'archived' => $archived->map($map),
            'history' => $e->product->versions->whereNotIn('status', ['draft', 'qa'])->sortByDesc('released_at')->values()->map(fn ($v) => Presenter::version($v)),
            'notify' => (bool) ($e->manifest['notify'] ?? true),
            'defensibility' => $e->product->defensibility['gate'] ?? 'PASS',
        ]);
    }

    public function applyUpdate(Request $request, DpEntitlement $entitlement, int $version): RedirectResponse
    {
        $e = $this->load($request, $entitlement);
        $target = $e->product->versions->firstWhere('id', $version);

        abort_unless($target, 404);
        if ($reason = Entitlements::blockReason($e, $target)) {
            return redirect()->route('products.digital.library.upgrade', $e)->with('error', $reason);
        }

        $from = $e->version?->version;
        $e->update(['version_id' => $target->id, 'correction_state' => 'Delivered']);
        DpAmendment::create(['entitlement_id' => $e->id, 'type' => 'version_update', 'from_value' => $from, 'to_value' => $target->version, 'status' => 'applied']);
        Audit::log('DP_VERSION_UPDATE_APPLIED', $e, ['from' => $from, 'to' => $target->version]);

        return redirect()->route('products.digital.library.show', $e)->with('success', "Your entitlement now points to {$target->label()}. Download it below.");
    }

    public function notifications(Request $request, DpEntitlement $entitlement): RedirectResponse
    {
        $e = $this->load($request, $entitlement);
        $notify = ! ($e->manifest['notify'] ?? true);
        $e->update(['manifest' => [...($e->manifest ?? []), 'notify' => $notify]]);

        return back()->with('success', $notify ? 'Update and correction notifications switched on.' : 'Optional update notifications switched off. Critical corrections are always sent.');
    }

    public function upgrade(Request $request, DpEntitlement $entitlement): Response
    {
        $e = $this->load($request, $entitlement);
        $prices = $e->product->prices ?? [];
        $targets = collect(Licences::upgradeTargets($e->licence_class))
            ->filter(fn ($c) => ! empty($prices[$c]))
            ->map(fn ($c) => [
                ...Licences::all()[$c],
                'price' => Licences::upgradePrice($prices, $e->licence_class, $c, $e->price_zar),
                'listPrice' => (int) $prices[$c],
            ])->values();

        $pending = $e->amendments()->where('status', 'pending_payment')->with('entitlement')->latest()->first();

        return Inertia::render('Products/Digital/Library/Upgrade', [
            'entitlement' => Presenter::entitlement($e),
            'targets' => $targets,
            'l5' => Licences::all()['L5'],
            'versionUpgrade' => $e->product->currentVersion() && ! Entitlements::updateIncluded($e, $e->product->currentVersion())
                ? Presenter::version($e->product->currentVersion()) : null,
            'pendingOrder' => $pending?->order_id ? Order::find($pending->order_id)?->reference : null,
        ]);
    }

    public function upgradeStore(Request $request, DpEntitlement $entitlement): RedirectResponse
    {
        $e = $this->load($request, $entitlement);
        if (! $e->isActive()) {
            throw ValidationException::withMessages(['to' => 'Only an active entitlement can be upgraded.']);
        }

        $targets = Licences::upgradeTargets($e->licence_class);
        $data = $request->validate(['to' => ['required', Rule::in($targets)]], ['to.in' => 'That licence change is not a permitted upgrade path. L5 requires a separate rights review.']);
        $price = Licences::upgradePrice($e->product->prices ?? [], $e->licence_class, $data['to'], $e->price_zar);

        if ($price <= 0 || empty(($e->product->prices ?? [])[$data['to']])) {
            throw ValidationException::withMessages(['to' => 'This licence class is not available for this product.']);
        }

        $order = Checkout::createOrder([[
            'item_type' => 'digital-product-upgrade',
            'item_code' => "{$e->product->sku}:{$e->licence_class}>{$data['to']}",
            'name' => "{$e->product->name} — licence upgrade",
            'variant' => "{$e->licence_class} → {$data['to']}",
            'unit_zar' => $price,
            'meta' => ['entitlement' => $e->reference, 'from' => $e->licence_class, 'to' => $data['to']],
        ]], $request->user(), 'digital-products', [
            'title' => 'Licence upgrade',
            'return_url' => route('products.digital.library.upgrade', $e, false).'?done=1',
        ]);

        DpAmendment::create([
            'entitlement_id' => $e->id, 'type' => 'licence_upgrade', 'from_value' => $e->licence_class, 'to_value' => $data['to'],
            'order_id' => $order->id, 'amount_zar' => $price, 'status' => 'pending_payment',
        ]);

        return redirect()->route('checkout.show', $order);
    }

    public function maintained(Request $request, DpEntitlement $entitlement): Response
    {
        $e = $this->load($request, $entitlement);

        return Inertia::render('Products/Digital/Library/MaintainedAccess', [
            'entitlement' => Presenter::entitlement($e),
            'plans' => collect(self::PLANS)->map(fn ($p, $key) => [...$p, 'key' => $key])->values(),
        ]);
    }

    public function maintainedStore(Request $request, DpEntitlement $entitlement): RedirectResponse
    {
        $e = $this->load($request, $entitlement);
        $data = $request->validate([
            'plan' => ['required', Rule::in(array_keys(self::PLANS))],
            'auto_renew' => ['boolean'],
            'accept' => ['accepted'],
        ], ['accept.accepted' => 'Please accept the Maintained Access Terms.']);

        if (! in_array($e->status, ['active', 'legacy'], true)) {
            throw ValidationException::withMessages(['plan' => 'Maintained Access needs an active entitlement.']);
        }

        $plan = self::PLANS[$data['plan']];
        $order = Checkout::createOrder([[
            'item_type' => 'digital-product-maintenance',
            'item_code' => "{$e->product->sku}:MA-{$data['plan']}",
            'name' => "{$e->product->name} — Maintained Access",
            'variant' => $plan['label'],
            'unit_zar' => (int) round($plan['incl'] / 1.15),
            'meta' => ['entitlement' => $e->reference, 'plan' => $data['plan']],
        ]], $request->user(), 'digital-products', [
            'title' => 'Maintained Access',
            'return_url' => route('products.digital.library.maintained', $e, false).'?done=1',
        ]);

        DpAmendment::create([
            'entitlement_id' => $e->id, 'type' => 'maintained_access', 'from_value' => $e->maintenance_status, 'to_value' => $data['plan'],
            'order_id' => $order->id, 'amount_zar' => (int) round($plan['incl'] / 1.15), 'status' => 'pending_payment',
            'meta' => ['auto_renew' => (bool) ($data['auto_renew'] ?? false)],
        ]);

        return redirect()->route('checkout.show', $order);
    }

    public function autoRenew(Request $request, DpEntitlement $entitlement): RedirectResponse
    {
        $e = $this->load($request, $entitlement);
        if ($e->maintenance_status !== 'active') {
            return back()->with('error', 'Auto-renew can be managed once Maintained Access is active.');
        }

        $e->update(['auto_renew' => ! $e->auto_renew]);

        return back()->with('success', $e->auto_renew ? 'Auto-renew switched on.' : 'Auto-renew switched off. Access stays active until '.$e->maintenance_until?->format('d M Y').'.');
    }

    public function versionStatus(Request $request, DpEntitlement $entitlement): Response
    {
        $e = $this->load($request, $entitlement);
        $current = $e->product->currentVersion();
        $mine = $e->version;

        $state = match (true) {
            in_array($e->status, ['refunded', 'revoked'], true) => 'REFUNDED/RIGHTS_CHANGED',
            $mine?->status === 'withdrawn_unsafe' => 'WITHDRAWN_UNSAFE',
            $mine && $current && $mine->id === $current->id && ! $e->downloads->where('success', true)->count() => 'NO_DOWNLOAD_RECORDED',
            $mine && $current && $mine->id === $current->id => 'CURRENT',
            $current && Entitlements::updateIncluded($e, $current) => 'UPDATE_AVAILABLE_INCLUDED',
            $current && $e->maintenance_status === 'lapsed' => 'MAINTENANCE_ENDED',
            $current => 'UPDATE_AVAILABLE_PAID',
            default => 'SUPERSEDED_SAFE',
        };

        return Inertia::render('Products/Digital/Library/VersionStatus', [
            'entitlement' => Presenter::entitlement($e),
            'state' => $state,
            'nextReview' => $e->product->next_review_at?->format('d M Y'),
            'reviewCycle' => $e->product->review_cycle,
            'history' => $e->product->versions->whereNotIn('status', ['draft', 'qa'])->sortByDesc('released_at')->values()->map(fn ($v) => [
                ...Presenter::version($v),
                'downloadable' => Entitlements::blockReason($e, $v) === null,
            ]),
            'downloads' => $e->downloads->where('success', true)->sortByDesc('id')->values()->map(fn ($d) => ['at' => $d->created_at->format('d M Y H:i'), 'version' => 'v'.$d->version, 'format' => $d->format]),
            'pricing' => ['lastReview' => $e->product->verified_at?->format('d M Y'), 'nextReview' => $e->product->next_review_at?->format('d M Y')],
        ]);
    }

    public function refund(Request $request): Response
    {
        $user = $request->user();
        Entitlements::syncUser($user);
        $mine = DpEntitlement::with('product.versions', 'version', 'downloads', 'order')->where('user_id', $user->id)
            ->whereNotIn('status', ['pending_payment', 'failed'])->latest('purchased_at')->get();
        $selected = $mine->firstWhere('reference', $request->query('entitlement')) ?? $mine->first();

        return Inertia::render('Products/Digital/Library/Refund', [
            'options' => $mine->map(fn ($e) => ['reference' => $e->reference, 'label' => "{$e->product->name} ({$e->reference})"]),
            'selected' => $selected ? [
                ...Presenter::entitlement($selected),
                'amountPaid' => $selected->order?->total_zar ?? $selected->price_zar,
                'paymentStatus' => $selected->order?->status ?? 'paid',
            ] : null,
            'cases' => DpCase::with('entitlement.product')->where('user_id', $user->id)->latest()->get()->map(fn ($c) => [
                'reference' => $c->reference, 'kind' => $c->kind, 'status' => $c->status, 'product' => $c->entitlement?->product?->name,
                'created' => $c->created_at->format('d M Y'), 'outcome' => $c->outcome, 'note' => $c->decision_note,
            ]),
            'reasons' => [
                'refund' => ['Product does not match description', 'Wrong product, format or language supplied', 'File is corrupt or will not open', 'Material defect in content', 'Withdrawn or unsafe version supplied', 'Change of mind'],
                'product_issue' => ['Incorrect or outdated content', 'Calculation or formula error', 'Broken link or missing section', 'Translation issue'],
                'technical' => ['Download fails', 'File will not open', 'Wrong file delivered', 'Access link expired'],
                'other' => ['Licence question', 'Invoice or billing query', 'Other'],
            ],
            'outcomes' => ['Full refund', 'Partial refund', 'Replacement or corrected file', 'Guidance from TBCA', 'Licence change'],
        ]);
    }

    public function refundStore(Request $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'entitlement' => ['required', 'string'],
            'kind' => ['required', Rule::in(['refund', 'product_issue', 'technical', 'other'])],
            'reason' => ['required', 'string', 'max:190'],
            'description' => ['required', 'string', 'min:20', 'max:4000'],
            'outcome' => ['required', 'string', 'max:120'],
            'downloaded' => ['required', 'boolean'],
            'evidence' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,docx', 'max:10240'],
        ], ['description.min' => 'Please give a clear explanation (at least 20 characters).']);

        $e = DpEntitlement::where('reference', $data['entitlement'])->where('user_id', $user->id)->firstOrFail();

        if ($data['kind'] === 'refund' && $e->cases()->where('kind', 'refund')->whereIn('status', ['submitted', 'under_review'])->exists()) {
            throw ValidationException::withMessages(['kind' => 'A refund request for this product is already being assessed.']);
        }

        $case = DpCase::create([
            'reference' => Entitlements::caseReference(),
            'entitlement_id' => $e->id,
            'user_id' => $user->id,
            'kind' => $data['kind'],
            'reason' => $data['reason'],
            'description' => $data['description'],
            'outcome' => $data['outcome'],
            // A recorded download is evidence, not an automatic decline (Blueprint 9.3).
            'downloaded' => $data['downloaded'] || $e->downloads()->where('success', true)->exists(),
            'evidence_path' => $request->file('evidence')?->store('dp-evidence', 'local'),
            'status' => 'submitted',
            'amount_zar' => $data['kind'] === 'refund' ? $e->price_zar : 0,
        ]);

        if ($data['kind'] === 'refund' && $e->status === 'active') {
            $e->update(['status' => 'suspended', 'correction_state' => 'Refund Case']);
        }
        Audit::log('DP_REFUND_REQUESTED', $e, ['case' => $case->reference, 'kind' => $case->kind]);

        return redirect()->route('products.digital.library.refund', ['entitlement' => $e->reference])
            ->with('success', "Request {$case->reference} submitted. We aim to respond within 1 business day.")
            ->with('reference', $case->reference);
    }

    public function nextSteps(Request $request, DpEntitlement $entitlement): Response
    {
        $e = $this->load($request, $entitlement);

        return Inertia::render('Products/Digital/Library/NextSteps', [
            'entitlement' => Presenter::entitlement($e),
            'services' => collect(self::SERVICES)->map(fn ($s, $key) => [...$s, 'key' => $key])->values(),
            'credit' => $this->credit($e),
        ]);
    }

    public function nextStepsStore(Request $request, DpEntitlement $entitlement): RedirectResponse
    {
        $e = $this->load($request, $entitlement);
        $data = $request->validate(['service' => ['required', Rule::in(array_keys(self::SERVICES))], 'apply_credit' => ['boolean']]);
        $service = self::SERVICES[$data['service']];
        $credit = $this->credit($e);
        $apply = ($data['apply_credit'] ?? true) && $credit['eligible'] ? min($credit['balance'], $service['incl']) : 0;

        $order = Checkout::createOrder([[
            'item_type' => 'dp-conversion',
            'item_code' => 'DPCONV-'.strtoupper($data['service']),
            'name' => "{$service['kind']}: {$service['title']}",
            'variant' => $apply ? "Credit applied R{$apply} from {$e->reference}" : null,
            'unit_zar' => (int) round(($service['incl'] - $apply) / 1.15),
            'meta' => ['entitlement' => $e->reference, 'service' => $data['service'], 'credit' => $apply],
        ]], $request->user(), 'digital-products', [
            'title' => $service['title'],
            'return_url' => route('products.digital.library.next', $e, false).'?done=1',
        ]);

        DpAmendment::create([
            'entitlement_id' => $e->id, 'type' => 'conversion', 'to_value' => $data['service'], 'order_id' => $order->id,
            'amount_zar' => $order->subtotal_zar, 'status' => 'pending_payment', 'meta' => ['credit' => $apply],
        ]);

        return redirect()->route('checkout.show', $order);
    }

    /** GATE-DP-17: credit only for an identified paid order, disclosed before commitment, non-transferable. */
    private function credit(DpEntitlement $e): array
    {
        $expires = ($e->purchased_at ?? now())->copy()->addYear();
        $eligible = $e->isActive() && $expires->isFuture() && (! $e->order || $e->order->isPaid());

        return [
            'eligible' => $eligible,
            'available' => $e->credit_zar,
            'applied' => $e->credit_applied_zar,
            'balance' => max(0, $e->credit_zar - $e->credit_applied_zar),
            'expires' => $expires->format('d M Y'),
        ];
    }

    private function load(Request $request, DpEntitlement $entitlement): DpEntitlement
    {
        $user = $request->user();
        abort_unless($entitlement->user_id === $user->id || $user->isAdmin(), 403);

        if ($entitlement->order_id) {
            Entitlements::syncOrder($entitlement->order()->with('items', 'user')->first());
        }
        DpAmendment::where('entitlement_id', $entitlement->id)->where('status', 'pending_payment')->whereNotNull('order_id')->get()
            ->each(fn ($a) => Entitlements::syncOrder(Order::with('items', 'user')->find($a->order_id)));

        return $entitlement->fresh(['product.versions', 'version', 'downloads', 'order']);
    }
}
