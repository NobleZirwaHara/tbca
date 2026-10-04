<?php

namespace App\Http\Controllers\Shop\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop\AuditEvent;
use App\Models\Shop\DuplicateGroup;
use App\Models\Shop\MerchRoute;
use App\Models\Shop\Product;
use App\Models\Submission;
use App\Support\Shop\Acts;
use App\Support\Shop\Audit;
use App\Support\Shop\Catalogue;
use App\Support\Shop\ListingGate;
use App\Support\Shop\ProductPresenter;
use App\Support\Shop\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Product governance consoles: listing gate, product master / variants,
 * price-floor-tax, product versions, licence & IP, listing-state derivation,
 * content duplication and merchandising route remediation.
 */
class GovernanceController extends Controller
{
    private function rows(Request $request): Collection
    {
        return Product::query()
            ->when($request->query('vehicle'), fn ($q, $v) => $q->where('vehicle', $v))
            ->when($request->query('act'), fn ($q, $v) => $q->where('act', $v))
            ->when($request->query('ls'), fn ($q, $v) => $q->where('listing_state', $v))
            ->when($request->query('outcome'), fn ($q, $v) => $q->where('gate_outcome', $v))
            ->when($request->query('q'), fn ($q, $v) => $q->where(fn ($w) => $w->where('name', 'like', "%{$v}%")->orWhere('code', 'like', "%{$v}%")->orWhere('sprint_code', 'like', "%{$v}%")))
            ->orderBy('sprint_code')
            ->get();
    }

    private function filterOptions(): array
    {
        return [
            'vehicles' => Product::query()->distinct()->orderBy('vehicle')->pluck('vehicle'),
            'acts' => Acts::options(),
            'states' => collect(Acts::LISTING_STATES)->map(fn ($l, $k) => ['value' => $k, 'label' => "{$k} {$l}"])->values(),
        ];
    }

    /* --- Gate Metrics Dashboard ---------------------------------------------- */

    public function dashboard(): Response
    {
        $products = Product::all();

        return Inertia::render('Shop/Admin/Dashboard', [
            'kpis' => [
                'products' => $products->count(),
                'passed' => $products->where('gate_outcome', 'passed')->count(),
                'warning' => $products->where('gate_outcome', 'warning')->count(),
                'blocked' => $products->where('gate_outcome', 'blocked')->count(),
                'purchasable' => $products->whereIn('listing_state', ['LS-01', 'LS-03'])->count(),
                'orders_paid' => Order::query()->where('status', 'paid')->count(),
                'quotes_open' => Submission::query()->where('type', 'quote-request')->whereIn('status', ['received', 'in_review'])->count(),
                'release' => Setting::get('release_status', 'pending'),
            ],
            'byAct' => collect(Acts::ACTS)->map(fn ($a, $k) => ['act' => $a['label'], 'count' => $products->where('act', $k)->count(), 'blocked' => $products->where('act', $k)->where('gate_outcome', 'blocked')->count()])->values(),
            'byState' => collect(Acts::LISTING_STATES)->map(fn ($l, $k) => ['state' => $k, 'label' => $l, 'count' => $products->where('listing_state', $k)->count()])->values(),
            'recent' => AuditEvent::query()->latest()->take(8)->get(['actor', 'action', 'subject', 'summary', 'created_at']),
        ]);
    }

    /* --- OS-035 Vehicle-Aware Listing Gate ------------------------------------ */

    public function listingGate(Request $request): Response
    {
        $all = Product::all();
        $rows = $this->rows($request);
        $reasons = $all->flatMap(fn ($p) => collect($p->gate_reasons ?? [])->map(fn ($r) => Str::startsWith($r, 'Missing') ? 'Missing required attributes' : $r))->countBy()->sortDesc();

        return Inertia::render('Shop/Admin/ListingGate', [
            'rows' => $rows->map(fn (Product $p) => [
                'slug' => $p->slug, 'code' => $p->sprint_code ?? $p->code, 'name' => $p->name, 'vehicle' => $p->vehicle, 'act' => Acts::label($p->act),
                'state' => $p->listing_state, 'state_label' => Acts::LISTING_STATES[$p->listing_state] ?? '-', 'outcome' => $p->gate_outcome,
                'reasons' => $p->gate_reasons ?? [], 'evaluated' => $p->gate_evaluated_at?->toIso8601String(),
            ]),
            'kpis' => [
                'total' => $all->count(),
                'passed' => $all->where('gate_outcome', 'passed')->count(),
                'blocked' => $all->where('gate_outcome', 'blocked')->count(),
                'warning' => $all->where('gate_outcome', 'warning')->count(),
                'vehicles' => $all->pluck('vehicle')->unique()->count(),
                'last_scan' => Setting::get('gate_last_scan'),
            ],
            'reasons' => $reasons->map(fn ($c, $r) => ['reason' => $r, 'count' => $c])->values()->take(6),
            'filters' => $request->only(['vehicle', 'act', 'ls', 'outcome', 'q']),
            'options' => $this->filterOptions(),
        ]);
    }

    public function scan(): RedirectResponse
    {
        $counts = ListingGate::scan();
        Audit::log('gate-scan', 'Catalogue', "Full gate scan: {$counts['passed']} passed, {$counts['warning']} warnings, {$counts['blocked']} blocked");

        return back()->with('success', "Gate scan complete: {$counts['passed']} passed, {$counts['warning']} warnings, {$counts['blocked']} blocked.");
    }

    public function evaluate(Product $product): RedirectResponse
    {
        ListingGate::apply($product);
        Audit::log('gate-evaluate', $product->code, "Re-evaluated: {$product->gate_outcome} ({$product->listing_state})");

        return back()->with('success', "{$product->name}: {$product->gate_outcome} ({$product->listing_state}).");
    }

    /* --- OS-036 Product Master / Variant Console ------------------------------ */

    public static function variantCount(Product $p): int
    {
        $v = $p->variants ?? [];

        return count($v['skus'] ?? []) + count($v['tiers'] ?? []) + count($v['licences'] ?? []) + count($v['plans'] ?? []) + count($v['commitments'] ?? []) ?: 1;
    }

    public function productMaster(Request $request): Response
    {
        $all = Product::query()->orderBy('name')->get();
        $product = $all->firstWhere('slug', $request->query('product', 'cybersecurity-risk-assessment')) ?? $all->first();
        $variants = collect($product->variants['skus'] ?? []);
        $codes = [$product->code, $product->sprint_code, ...$variants->pluck('code')->all()];
        $gate = ListingGate::evaluate($product);
        $g = $product->gates ?? [];

        $completeness = $all->avg(fn ($p) => (int) ($p->gates['completeness'] ?? 100) - count($p->gates['missing_hard'] ?? []) * 5);

        return Inertia::render('Shop/Admin/ProductMaster', [
            'masters' => $all->map(fn ($p) => ['value' => $p->slug, 'label' => "{$p->code} - {$p->name}"]),
            'product' => [
                ...$product->only(['slug', 'code', 'name', 'tagline', 'summary', 'delivery', 'output_format', 'status', 'version', 'vehicle', 'vehicle_code', 'act', 'source_records', 'sprint_code']),
                'act_label' => Acts::label($product->act),
                'aisle' => Catalogue::aisle((string) $product->aisle)['name'] ?? $product->aisle,
                'subcategory' => Str::headline((string) $product->subcategory),
                'listing_state' => $product->listing_state, 'listing_label' => Acts::LISTING_STATES[$product->listing_state] ?? '-',
                'updated_at' => $product->updated_at?->toIso8601String(), 'created_at' => $product->created_at?->toIso8601String(),
                'governance' => [
                    'owner' => $g['owner'] ?? 'Product Governance', 'steward' => $g['steward'] ?? 'Commerce Lead',
                    'qa' => $gate['gates']['version'], 'scan' => $gate['gates']['completeness'], 'claims' => $gate['gates']['release'],
                    'certificate' => $g['certificate'] ?? 'OS-RC-2026-05-'.str_pad((string) $product->id, 3, '0', STR_PAD_LEFT),
                    'rights' => $gate['gates']['licence'], 'split' => $g['split'] ?? 'VJ-01 Substantive Content', 'batches' => $g['batches'] ?? '4A',
                    'first_seen' => $g['first_seen'] ?? $product->created_at?->toDateString(),
                ],
                'variants' => $variants->values(),
                'other_variants' => collect([...($product->variants['tiers'] ?? []), ...($product->variants['licences'] ?? []), ...($product->variants['plans'] ?? []), ...($product->variants['commitments'] ?? [])])
                    ->map(fn ($v) => ['code' => $v['key'], 'name' => $v['name'], 'zar' => $v['zar'] ?? null])->values(),
            ],
            'changes' => AuditEvent::query()->whereIn('subject', array_filter($codes))->latest()->take(10)->get(['actor', 'action', 'subject', 'summary', 'version', 'created_at']),
            'kpis' => [
                'masters' => $all->count(),
                'sources' => $all->sum('source_records'),
                'variants' => $all->sum(fn ($p) => self::variantCount($p)),
                'skus' => $all->sum(fn ($p) => collect($p->variants['skus'] ?? [])->sum('skus') ?: self::variantCount($p)),
                'draft' => $all->where('status', 'draft')->count(),
                'blocked' => $all->whereIn('listing_state', ['LS-05', 'LS-06'])->count(),
            ],
            'utilisation' => ['active' => $all->where('status', 'active')->count(), 'draft' => $all->where('status', 'draft')->count(), 'archived' => $all->where('status', 'archived')->count()],
            'quality' => [
                'completeness' => (int) round($completeness),
                'accuracy' => (int) round(100 * $all->where('gate_outcome', '!=', 'blocked')->count() / max(1, $all->count())),
                'consistency' => (int) round(100 * $all->filter(fn ($p) => $p->listing_state === ListingGate::evaluate($p)['listing_state'])->count() / max(1, $all->count())),
                'timeliness' => (int) round(100 * $all->filter(fn ($p) => $p->updated_at?->gt(now()->subDays(90)))->count() / max(1, $all->count())),
            ],
            'options' => [
                'acts' => Acts::options(),
                'vehicles' => ['Services', 'Digital Product', 'Subscription', 'Retainer', 'Diagnostic', 'Tech Solution', 'Partner Service', 'Marketplace Service', 'Due Diligence'],
                'aisles' => collect(Catalogue::aisles())->map(fn ($a) => ['value' => $a['slug'], 'label' => $a['name']])->values(),
            ],
        ]);
    }

    private const VEHICLE_CODES = ['Diagnostic' => 'VEH-01', 'Services' => 'VEH-02', 'Digital Product' => 'VEH-03', 'Subscription' => 'VEH-04', 'Retainer' => 'VEH-05',
        'Due Diligence' => 'VEH-07', 'Tech Solution' => 'VEH-09', 'Partner Service' => 'VEH-10', 'Marketplace Service' => 'VEH-11'];

    public function storeMaster(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:190'],
            'act' => ['required', Rule::in(array_keys(Acts::ACTS))],
            'vehicle' => ['required', Rule::in(array_keys(self::VEHICLE_CODES))],
            'aisle' => ['required', 'string', 'max:80'],
            'price_zar' => ['nullable', 'integer', 'min:0'],
            'tagline' => ['nullable', 'string', 'max:300'],
        ]);

        $slug = Str::slug($data['name']);
        abort_if(Product::query()->where('slug', $slug)->exists(), 422, 'A Product Master with this name already exists.');
        $code = 'SMP-'.strtoupper(Str::substr(preg_replace('/[^A-Za-z]/', '', $data['name']), 0, 2)).'-'.str_pad((string) (Product::query()->max('id') + 1), 3, '0', STR_PAD_LEFT);

        $product = Product::create([
            ...$data, 'slug' => $slug, 'code' => $code, 'sprint_code' => $code, 'vehicle_code' => self::VEHICLE_CODES[$data['vehicle']],
            'status' => 'draft', 'gates' => ['completeness' => 60, 'qa' => 'pending'], 'version' => 'v0.1',
        ]);
        ListingGate::apply($product);
        Audit::log('create', $code, "Created Product Master {$product->name} (draft)", 'v0.1');

        return redirect()->route('admin.shop.product-master', ['product' => $slug])->with('success', "Product Master {$code} created as draft.");
    }

    public function updateMaster(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:190'],
            'tagline' => ['nullable', 'string', 'max:400'],
            'delivery' => ['nullable', 'string', 'max:60'],
            'output_format' => ['nullable', 'string', 'max:120'],
            'status' => ['required', 'in:active,draft,archived'],
        ]);
        $product->update($data);
        Audit::log('update', $product->code, 'Updated master details', $product->version);

        return back()->with('success', 'Product Master updated. Run the gate scan to re-derive its listing state.');
    }

    public function storeVariant(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'tier' => ['required', 'string', 'max:40'],
            'licence' => ['required', 'string', 'max:40'],
            'format' => ['required', 'string', 'max:40'],
            'language' => ['required', 'string', 'max:30'],
            'jurisdiction' => ['required', 'string', 'max:60'],
            'buyer' => ['required', 'string', 'max:40'],
        ]);
        $variants = $product->variants ?? [];
        $skus = collect($variants['skus'] ?? []);
        $prefix = Str::after($product->code, 'SMP-') ?: $product->code;
        $code = sprintf('%s-V%d', $prefix, $skus->count() + 1);
        $skus->push([...$data, 'code' => $code, 'skus' => 1, 'state' => 'Purchasable', 'status' => 'Active']);
        $variants['skus'] = $skus->values()->all();
        $product->update(['variants' => $variants]);
        Audit::log('create', $code, "Created {$data['name']} variant", $product->version);

        return back()->with('success', "Variant {$code} created.");
    }

    public function archiveMaster(Product $product): RedirectResponse
    {
        $product->update(['status' => $product->status === 'archived' ? 'active' : 'archived']);
        Audit::log($product->status === 'archived' ? 'archive' : 'restore', $product->code, ucfirst($product->status === 'archived' ? 'archived' : 'restored').' Product Master', $product->version);

        return back()->with('success', "{$product->name} is now {$product->status}.");
    }

    public function duplicateMaster(Product $product): RedirectResponse
    {
        $copy = $product->replicate(['listing_state', 'gate_outcome', 'gate_reasons', 'gate_evaluated_at']);
        $n = Product::query()->where('slug', 'like', "{$product->slug}-copy%")->count() + 1;
        $copy->fill(['slug' => "{$product->slug}-copy-{$n}", 'code' => "{$product->code}-C{$n}", 'name' => "{$product->name} (Copy {$n})", 'status' => 'draft', 'featured' => false])->save();
        ListingGate::apply($copy);
        Audit::log('duplicate', $copy->code, "Duplicated from {$product->code}", $copy->version);

        return redirect()->route('admin.shop.product-master', ['product' => $copy->slug])->with('success', "Duplicated as {$copy->code} (draft).");
    }

    /* --- Variant & SKU Console --------------------------------------------- */

    public function variants(Request $request): Response
    {
        $rows = Product::query()->orderBy('name')->get()->flatMap(function (Product $p) {
            $v = $p->variants ?? [];
            $base = ['product' => $p->name, 'slug' => $p->slug, 'act' => Acts::label($p->act), 'state' => $p->listing_state];

            return collect([
                ...collect($v['skus'] ?? [])->map(fn ($s) => [...$base, 'code' => $s['code'], 'name' => $s['name'], 'axis' => 'SKU', 'detail' => "{$s['tier']} / {$s['licence']} / {$s['format']}", 'zar' => null]),
                ...collect($v['tiers'] ?? [])->map(fn ($s) => [...$base, 'code' => $p->code.'-'.strtoupper($s['key']), 'name' => $s['name'], 'axis' => 'Tier', 'detail' => $s['fit'] ?? '', 'zar' => $s['zar']]),
                ...collect($v['licences'] ?? [])->map(fn ($s) => [...$base, 'code' => $p->code.'-'.$s['key'], 'name' => $s['name'], 'axis' => 'Licence', 'detail' => $s['body'] ?? '', 'zar' => $s['zar']]),
                ...collect($v['plans'] ?? [])->map(fn ($s) => [...$base, 'code' => $p->code.'-'.strtoupper($s['key']), 'name' => $s['name'], 'axis' => 'Plan', 'detail' => 'Recurring / '.($p->price_unit ?? 'month'), 'zar' => $s['zar']]),
                ...collect($v['commitments'] ?? [])->map(fn ($s) => [...$base, 'code' => $p->code.'-'.$s['key'], 'name' => $s['name'], 'axis' => 'Commitment', 'detail' => "{$s['hours']} hrs / month", 'zar' => $s['zar']]),
            ])->whenEmpty(fn ($c) => $c->push([...$base, 'code' => $p->code.'-STD', 'name' => 'Standard', 'axis' => 'Default', 'detail' => (string) $p->output_format, 'zar' => $p->price_zar]));
        });

        $axis = $request->query('axis');

        return Inertia::render('Shop/Admin/Variants', [
            'rows' => $rows->when($axis, fn ($c) => $c->where('axis', $axis))->values(),
            'axes' => $rows->countBy('axis'),
            'filters' => ['axis' => $axis],
        ]);
    }

    /* --- OS-037 Price, Floor & Tax ------------------------------------------- */

    public static function compliance(Product $p): string
    {
        return match (true) {
            $p->price_zar === null => 'no_price',
            $p->floor_zar === null || $p->price_zar > $p->floor_zar => 'compliant',
            $p->price_zar === $p->floor_zar => 'at_floor',
            default => 'below_floor',
        };
    }

    public function pricing(Request $request): Response
    {
        $all = Product::all();
        $rows = $this->rows($request)
            ->when($request->query('compliance'), fn ($c, $v) => $c->filter(fn ($p) => self::compliance($p) === $v))
            ->when($request->query('tax'), fn ($c, $v) => $c->where('tax_treatment', $v));

        $rate = fn (Product $p) => $p->tax_treatment === 'standard' ? 0.15 : 0.0;
        $counts = $all->countBy(fn ($p) => self::compliance($p));
        $changes = AuditEvent::query()->where('action', 'price')->where('created_at', '>=', now()->subDays(30))->get();

        return Inertia::render('Shop/Admin/Pricing', [
            'rows' => $rows->values()->map(fn (Product $p) => [
                'slug' => $p->slug, 'code' => $p->sprint_code ?? $p->code, 'name' => $p->name, 'vehicle' => $p->vehicle, 'act' => Acts::label($p->act),
                'sku' => ($p->sprint_code ?? $p->code).'-SA-'.$p->act, 'price' => $p->price_zar, 'unit' => $p->price_unit, 'vat_rate' => $rate($p),
                'vat' => $p->price_zar !== null ? round($p->price_zar * $rate($p), 2) : null, 'incl' => $p->price_zar !== null ? round($p->price_zar * (1 + $rate($p)), 2) : null,
                'floor' => $p->floor_zar, 'gap' => $p->price_zar !== null && $p->floor_zar !== null ? $p->price_zar - $p->floor_zar : null,
                'compliance' => self::compliance($p), 'tax' => $p->tax_treatment, 'tax_confirmed' => $p->tax_confirmed, 'updated' => $p->updated_at?->toIso8601String(),
            ]),
            'kpis' => [
                'total' => $all->count(), 'with_floor' => $all->whereNotNull('floor_zar')->count(),
                'compliant' => ($counts['compliant'] ?? 0) + ($counts['at_floor'] ?? 0), 'at_floor' => $counts['at_floor'] ?? 0,
                'below' => $counts['below_floor'] ?? 0, 'no_price' => $counts['no_price'] ?? 0, 'changed' => $changes->pluck('subject')->unique()->count(),
                'last' => Setting::get('price_last_recalc'),
            ],
            'tax' => $all->countBy('tax_treatment'),
            'medians' => $all->whereNotNull('price_zar')->groupBy('vehicle')->map(fn ($g) => $g->pluck('price_zar')->median())->sortKeys(),
            'changes' => [
                'total' => $changes->count(),
                'increases' => $changes->filter(fn ($e) => ($e->meta['new'] ?? 0) > ($e->meta['old'] ?? 0))->count(),
                'decreases' => $changes->filter(fn ($e) => ($e->meta['new'] ?? 0) < ($e->meta['old'] ?? 0))->count(),
            ],
            'filters' => $request->only(['vehicle', 'act', 'compliance', 'tax', 'q']),
            'options' => $this->filterOptions(),
        ]);
    }

    public function updatePrice(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'price_zar' => ['nullable', 'integer', 'min:0'],
            'floor_zar' => ['nullable', 'integer', 'min:0'],
            'tax_treatment' => ['required', 'in:standard,zero,exempt,out_of_scope'],
            'tax_confirmed' => ['required', 'boolean'],
        ]);
        $old = $product->price_zar;
        $product->update($data);
        Audit::log('price', $product->code, sprintf('Price %s -> %s, floor %s, tax %s', $old ?? '-', $data['price_zar'] ?? '-', $data['floor_zar'] ?? '-', $data['tax_treatment']), $product->version, ['old' => $old, 'new' => $data['price_zar']]);

        return back()->with('success', "{$product->name} pricing saved. Recalculate floors to update its listing state.");
    }

    public function recalculate(): RedirectResponse
    {
        ListingGate::scan();
        Setting::put('price_last_recalc', now()->toIso8601String());
        Audit::log('recalculate', 'Catalogue', 'Recalculated all floors and listing states');

        return back()->with('success', 'Floors recalculated and listing states re-derived.');
    }

    /* --- ProductVersion Control & Licence/IP -------------------------------- */

    public function licences(): Response
    {
        return $this->versions('licences');
    }

    public function versions(string $mode = 'versions'): Response
    {
        return Inertia::render('Shop/Admin/Versions', [
            'mode' => $mode,
            'rows' => Product::query()->orderBy('name')->get()->map(fn (Product $p) => [
                'slug' => $p->slug, 'code' => $p->code, 'name' => $p->name, 'act' => Acts::label($p->act), 'version' => $p->version,
                'qa' => $p->gates['qa'] ?? 'passed', 'rights' => $p->gates['rights'] ?? 'cleared', 'licence_scope' => $p->gates['licence_scope'] ?? null,
                'state' => $p->listing_state, 'updated' => $p->updated_at?->toIso8601String(),
            ]),
        ]);
    }

    public function qa(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate(['qa' => ['required', 'in:passed,pending,failed']]);
        $gates = $product->gates ?? [];
        $gates['qa'] = $data['qa'];
        $version = $product->version;
        if ($data['qa'] === 'passed' && ($product->gates['qa'] ?? 'passed') !== 'passed' && preg_match('/^v(\d+)\.(\d+)$/', $version, $m)) {
            $version = 'v'.$m[1].'.'.((int) $m[2] + 1);
        }
        $product->update(['gates' => $gates, 'version' => $version]);
        ListingGate::apply($product);
        Audit::log('creation-qa', $product->code, "Creation QA set to {$data['qa']}", $version);

        return back()->with('success', "{$product->name}: Creation QA {$data['qa']} ({$product->listing_state}).");
    }

    public function rights(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate(['rights' => ['required', 'in:cleared,not_cleared'], 'licence_scope' => ['nullable', 'string', 'max:10']]);
        $gates = $product->gates ?? [];
        $gates['rights'] = $data['rights'];
        $gates['licence_scope'] = $data['licence_scope'] ?? ($gates['licence_scope'] ?? null);
        $product->update(['gates' => $gates]);
        ListingGate::apply($product);
        Audit::log('rights', $product->code, 'Rights status set to '.str_replace('_', ' ', $data['rights']), $product->version);

        return back()->with('success', "{$product->name}: rights {$data['rights']} ({$product->listing_state}).");
    }

    /* --- OS-044 Listing-State Derivation ------------------------------------- */

    public function listingState(Request $request): Response
    {
        $all = Product::all();
        $evaluated = $all->map(function (Product $p) {
            $r = ListingGate::evaluate($p);

            return [
                'slug' => $p->slug, 'code' => $p->sprint_code ?? $p->code, 'name' => $p->name, 'vehicle' => $p->vehicle_code, 'act' => Acts::label($p->act),
                'lifecycle' => $p->listing_state, 'ca' => ListingGate::caLabel($r['ca']), 'ca_key' => $r['ca'], 'gates' => $r['gates'], 'derived' => $r['listing_state'],
                'equal' => $p->listing_state === $r['listing_state'], 'reason' => $r['hard'][0] ?? ($r['soft'][0] ?? null),
            ];
        });
        $rows = $evaluated
            ->when($request->query('act'), fn ($c, $v) => $c->filter(fn ($r) => str_starts_with($r['act'], $v)))
            ->when($request->query('ls'), fn ($c, $v) => $c->where('derived', $v))
            ->when($request->query('q'), fn ($c, $v) => $c->filter(fn ($r) => str_contains(Str::lower($r['name'].' '.$r['code']), Str::lower($v))));

        $gatePass = fn ($key) => (int) round(100 * $evaluated->filter(fn ($r) => $r['gates'][$key] === 'pass')->count() / max(1, $evaluated->count()));

        return Inertia::render('Shop/Admin/ListingState', [
            'rows' => $rows->values(),
            'kpis' => [
                'total' => $all->count(), 'derived' => $all->whereNotNull('listing_state')->count(), 'equal' => $evaluated->where('equal', true)->count(),
                'exceptions' => $evaluated->where('equal', false)->count(), 'hard' => $evaluated->whereIn('derived', ['LS-05', 'LS-06'])->count(),
                'purchasable' => $evaluated->whereIn('derived', ['LS-01', 'LS-02', 'LS-03'])->count(),
            ],
            'distribution' => collect(Acts::LISTING_STATES)->map(fn ($l, $k) => ['state' => $k, 'label' => $l, 'count' => $evaluated->where('derived', $k)->count()])->values(),
            'gates' => collect(ListingGate::GATES)->map(fn ($l, $k) => ['gate' => $l, 'pct' => $gatePass($k)])->values(),
            'failures' => $evaluated->flatMap(fn ($r) => collect($r['gates'])->filter(fn ($s) => $s !== 'pass')->keys())->countBy()->map(fn ($c, $k) => ['gate' => ListingGate::GATES[$k], 'count' => $c])->values(),
            'summary' => ['engine' => ListingGate::ENGINE_VERSION, 'ruleset' => ListingGate::RULESET, 'last_run' => Setting::get('gate_last_scan')],
            'events' => AuditEvent::query()->whereIn('action', ['gate-scan', 'recalculate', 'recalculate-ls', 'creation-qa', 'rights'])->latest()->take(5)->get(['summary', 'created_at']),
            'filters' => $request->only(['act', 'ls', 'q']),
            'options' => $this->filterOptions(),
        ]);
    }

    public function recalculateLs(): RedirectResponse
    {
        $counts = ListingGate::scan();
        Audit::log('recalculate-ls', 'Catalogue', 'Derivation run completed: '.array_sum($counts).' products evaluated');

        return back()->with('success', 'Listing states re-derived for '.array_sum($counts).' products.');
    }

    /* --- OS-043 Content Duplication ------------------------------------------ */

    public function duplication(Request $request): Response
    {
        $all = DuplicateGroup::query()->orderBy('group_code')->get();
        $tab = $request->query('tab', 'groups');
        $rows = $all
            ->when($tab === 'name', fn ($c) => $c->filter(fn ($g) => str_contains($g->content_type, 'Name')))
            ->when($tab === 'description', fn ($c) => $c->filter(fn ($g) => str_contains($g->content_type, 'Description')))
            ->when($tab === 'media', fn ($c) => $c->filter(fn ($g) => str_contains($g->content_type, 'Media')))
            ->when($request->query('status'), fn ($c, $v) => $c->where('status', $v))
            ->when($request->query('q'), fn ($c, $v) => $c->filter(fn ($g) => str_contains(Str::lower($g->title.' '.$g->group_code.' '.$g->canonical_code), Str::lower($v))));

        return Inertia::render('Shop/Admin/Duplication', [
            'rows' => $rows->values(),
            'kpis' => [
                'sources' => Product::query()->sum('source_records'), 'masters' => Product::query()->count(), 'groups' => $all->count(),
                'in_duplicates' => $all->sum('duplicates'), 'consolidated' => $all->where('status', 'consolidated')->count(),
            ],
            'statusCounts' => $all->countBy('status'),
            'typeCounts' => $all->groupBy('content_type')->map->sum('duplicates'),
            'filters' => ['tab' => $tab, 'status' => $request->query('status'), 'q' => $request->query('q')],
        ]);
    }

    public function duplicationStatus(Request $request, DuplicateGroup $group): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', 'in:pending_review,pending_validation,consolidated,rejected']]);
        $allowed = [
            'pending_review' => ['pending_validation', 'rejected'],
            'pending_validation' => ['consolidated', 'pending_review', 'rejected'],
            'consolidated' => ['pending_review'],
            'rejected' => ['pending_review'],
        ];
        if (! in_array($data['status'], $allowed[$group->status] ?? [], true)) {
            return back()->with('error', 'A group must be reviewed, then validated, before it can be consolidated.');
        }
        $group->update(['status' => $data['status']]);
        Audit::log('rationalise', $group->group_code, "Group {$group->title} -> {$data['status']}");

        return back()->with('success', "{$group->group_code} is now ".str_replace('_', ' ', $data['status']).'.');
    }

    /* --- OS-042 Merchandising Route Remediation ------------------------------ */

    public function routes(Request $request): Response
    {
        $all = MerchRoute::query()->with('destination')->orderBy('source_code')->get();
        $rows = $all
            ->when($request->query('type'), fn ($c, $v) => $c->where('relationship_type', $v))
            ->when($request->query('disposition'), fn ($c, $v) => $c->where('disposition', $v))
            ->when($request->query('q'), fn ($c, $v) => $c->filter(fn ($r) => str_contains(Str::lower($r->source_name.' '.$r->source_code.' '.$r->destination_name), Str::lower($v))));

        return Inertia::render('Shop/Admin/Routes', [
            'rows' => $rows->values()->map(fn (MerchRoute $r) => [
                ...$r->only(['id', 'source_code', 'source_name', 'relationship_type', 'legacy_relationship', 'destination_code', 'destination_name', 'destination_vehicle', 'destination_act', 'disposition', 'owner', 'fit_reason']),
                'cta' => $r->destination ? (str_starts_with($r->disposition, 'ACTIVE_') ? ProductPresenter::ctaForDisposition($r->disposition, $r->destination) : 'Hidden') : 'Hidden',
                'destination_state' => $r->destination?->listing_state,
                'price_state' => $r->destination && $r->destination->listing_state !== 'LS-05' ? 'OK' : 'Review',
            ]),
            'kpis' => [
                'total' => $all->count(),
                'remediated' => $all->filter(fn ($r) => $r->destination_product_id !== null)->count(),
                'purchase' => $all->where('disposition', 'ACTIVE_PURCHASE')->count(),
                'quote' => $all->where('disposition', 'ACTIVE_QUOTE')->count(),
                'proposal' => $all->where('disposition', 'ACTIVE_PROPOSAL')->count(),
                'hold' => $all->where('disposition', 'HONEST_HOLD')->count(),
                'broken' => $all->where('disposition', 'SUPPRESSED_BROKEN')->count(),
            ],
            'dispositions' => $all->countBy('disposition'),
            'types' => $all->countBy('relationship_type'),
            'options' => ['dispositions' => ['ACTIVE_PURCHASE', 'ACTIVE_QUOTE', 'ACTIVE_PROPOSAL', 'ACTIVE_BRIEF', 'ACTIVE_NATIVE_ROUTE', 'HONEST_HOLD', 'REPOINTED', 'SUPPRESSED_BROKEN', 'RETIRED']],
            'filters' => $request->only(['type', 'disposition', 'q']),
        ]);
    }

    public function routeDisposition(Request $request, MerchRoute $route): RedirectResponse
    {
        $data = $request->validate(['disposition' => ['required', 'in:ACTIVE_PURCHASE,ACTIVE_QUOTE,ACTIVE_PROPOSAL,ACTIVE_BRIEF,ACTIVE_NATIVE_ROUTE,HONEST_HOLD,REPOINTED,SUPPRESSED_BROKEN,RETIRED']]);
        $dest = $route->destination;

        // CTA is governed by disposition: an ACTIVE route must point at a destination whose current state supports it (blueprint 11.4-11.5).
        $required = ['ACTIVE_PURCHASE' => ['LS-01', 'LS-03'], 'ACTIVE_PROPOSAL' => ['LS-02'], 'ACTIVE_QUOTE' => ['LS-04', 'LS-02'], 'ACTIVE_BRIEF' => ['LS-04']][$data['disposition']] ?? null;
        if ($required && (! $dest || ! in_array($dest->listing_state, $required, true))) {
            return back()->with('error', 'The destination cannot currently support '.$data['disposition'].' (state '.($dest->listing_state ?? 'none').'). Use HONEST_HOLD or repoint the route.');
        }

        $route->update(['disposition' => $data['disposition']]);
        Audit::log('route', $route->source_code, "Route to {$route->destination_code} -> {$data['disposition']}");

        return back()->with('success', 'Route disposition updated.');
    }
}
