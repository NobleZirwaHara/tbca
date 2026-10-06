<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Brief;
use App\Models\Aiim\Province;
use App\Models\Aiim\ReportRequest;
use App\Models\Aiim\Sector;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\Refs;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

/**
 * Stage 3: premium brief store, brief detail and purchase, report configuration
 * -> quotation (G2/G3) -> payment (G4) -> delivery.
 */
class StoreController extends AiimController
{
    public const MODULES = [
        'market-overview' => 'Market Overview & Size', 'growth-drivers' => 'Growth Drivers & Trends', 'investment-opportunities' => 'Investment Opportunities',
        'key-players' => 'Key Players & Competitors', 'regulatory' => 'Regulatory & Policy Analysis', 'infrastructure' => 'Infrastructure Readiness',
        'risk' => 'Risk Assessment', 'benchmarks' => 'Financial Performance Benchmarks', 'swot' => 'SWOT Analysis', 'case-studies' => 'Case Studies',
    ];

    public function index(Request $request): Response
    {
        $f = [
            'q' => trim((string) $request->query('q', '')), 'category' => (string) $request->query('category', ''),
            'format' => (string) $request->query('format', ''), 'price' => (string) $request->query('price', ''), 'sort' => (string) $request->query('sort', 'popular'),
        ];
        $q = Brief::query()
            ->when($f['q'], fn ($w) => $w->where(fn ($x) => $x->where('title', 'like', "%{$f['q']}%")->orWhere('summary', 'like', "%{$f['q']}%")))
            ->when($f['category'], fn ($w) => $w->where('category', $f['category']))
            ->when($f['format'], fn ($w) => $w->where('format', 'like', $f['format'].'%'))
            ->when($f['price'] === 'under-2500', fn ($w) => $w->where('price_zar', '<', 2500))
            ->when($f['price'] === '2500-3000', fn ($w) => $w->whereBetween('price_zar', [2500, 3000]))
            ->when($f['price'] === 'over-3000', fn ($w) => $w->where('price_zar', '>', 3000));
        match ($f['sort']) {
            'price-asc' => $q->orderBy('price_zar'), 'price-desc' => $q->orderByDesc('price_zar'), 'newest' => $q->orderByDesc('id'), default => $q->orderByDesc('popularity'),
        };

        return $this->render($request, 'Aiim/Store/Index', [
            'filters' => $f,
            'results' => $q->paginate(8)->withQueryString()->through(fn ($b) => Catalogue::brief($b)),
            'categories' => ['Investment Climate', 'Countries', 'Sectors', 'Provinces', 'Infrastructure', 'Projects', 'Markets & Trade', 'Regulatory & Policy', 'Risk & Outlook', 'Data Packs'],
            'owned' => $request->user() ? \App\Models\Aiim\Entitlement::query()->where('user_id', $request->user()->id)->where('object_type', 'brief')->pluck('object_key') : [],
        ], 'Premium Brief Store');
    }

    public function show(Request $request, Brief $brief): Response
    {
        $this->sync($request);
        $this->select($request, ['item' => $brief->title, 'province' => $brief->province_slug]);

        return $this->render($request, 'Aiim/Store/Show', [
            'brief' => Catalogue::brief($brief, true),
            'owned' => (bool) $this->entitled($request->user(), 'brief', $brief->sku),
            'saved' => $this->savedKeys($request->user()),
        ], 'Premium Brief Store');
    }

    /** Buy Now: straight to the AIIM checkout. (Add to Cart posts to the shared basket with item_type "aiim-brief".) */
    public function buy(Request $request, Brief $brief): RedirectResponse
    {
        if ($this->entitled($request->user(), 'brief', $brief->sku)) {
            return back()->with('success', 'You already own this brief.');
        }
        // Store prices are VAT-inclusive; the order line carries the ex-VAT amount.
        $order = Checkout::createOrder(
            [['item_type' => 'aiim-brief', 'item_code' => $brief->sku, 'name' => $brief->title, 'variant' => 'Standard Access', 'unit_zar' => (int) round($brief->price_zar / 1.15)]],
            $request->user(), 'aiim',
            ['title' => 'AIIM premium brief', 'aiim' => ['kind' => 'brief', 'label' => $brief->title]],
        );
        $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);

        return redirect("/aiim/checkout/{$order->reference}");
    }

    /* ------------------------------------------------- report configuration */

    public function configure(Request $request, Brief $brief): RedirectResponse
    {
        $report = ReportRequest::query()->where('user_id', $request->user()->id)->where('brief_sku', $brief->sku)->whereIn('status', ['draft', 'changes_requested'])->latest('id')->first()
            ?? ReportRequest::create([
                'reference' => Refs::make('REP'),
                'user_id' => $request->user()->id,
                'brief_sku' => $brief->sku,
                'title' => $brief->title,
                'report_type' => 'AIIM-RPT-PFM-001',
                'config' => ['type' => 'AIIM-RPT-PFM-001', 'nationwide' => true, 'provinces' => array_filter([$brief->province_slug]), 'sectors' => [], 'modules' => [], 'delivery' => 'standard', 'format' => 'pdf-excel', 'notes' => ''],
            ]);

        return redirect("/aiim/reports/{$report->reference}/configure");
    }

    private function report(Request $request, string $ref): ReportRequest
    {
        $r = ReportRequest::query()->where('reference', $ref)->firstOrFail();
        abort_unless($r->user_id === $request->user()->id, 403);

        return $r;
    }

    public function editor(Request $request, string $ref): Response|RedirectResponse
    {
        $r = $this->report($request, $ref);
        if (! in_array($r->status, ['draft', 'changes_requested'], true)) {
            return redirect($r->status === 'quoted' ? "/aiim/reports/{$r->reference}/quote" : "/aiim/workspace/reports/{$r->reference}");
        }
        $step = max(1, min(4, (int) $request->query('step', $r->step)));

        return $this->render($request, 'Aiim/Store/Configure', [
            'report' => ['reference' => $r->reference, 'title' => $r->title, 'status' => $r->status, 'config' => $r->config, 'step' => $step],
            'estimate' => Pricing::report($r->config),
            'options' => [
                'types' => collect(Pricing::reportTypes())->map(fn ($t, $code) => ['value' => $code, 'label' => $t['name'], 'mode' => $t['mode']])->values(),
                'provinces' => Province::query()->orderBy('rank')->get(['slug', 'name']),
                'sectors' => Sector::query()->orderBy('sort')->get(['slug', 'name']),
                'modules' => collect(self::MODULES)->map(fn ($l, $k) => ['value' => $k, 'label' => $l])->values(),
            ],
        ], 'Report Configuration');
    }

    public function saveStep(Request $request, string $ref): RedirectResponse
    {
        $r = $this->report($request, $ref);
        abort_unless(in_array($r->status, ['draft', 'changes_requested'], true), 409);
        $step = (int) $request->input('step', 1);
        $config = $r->config;

        if ($step === 1) {
            $data = $request->validate([
                'type' => ['required', Rule::in(array_keys(Pricing::reportTypes()))],
                'nationwide' => ['boolean'],
                'provinces' => ['array'], 'provinces.*' => ['exists:aiim_provinces,slug'],
                'sectors' => ['required', 'array', 'min:1', 'max:6'], 'sectors.*' => ['exists:aiim_sectors,slug'],
            ], ['sectors.required' => 'Select at least one sector.']);
            if (! ($data['nationwide'] ?? false) && empty($data['provinces'])) {
                return back()->withErrors(['provinces' => 'Select South Africa (Nationwide) or at least one province.']);
            }
            $config = array_merge($config, $data);
        } elseif ($step === 2) {
            $data = $request->validate(['modules' => ['required', 'array', 'min:1'], 'modules.*' => [Rule::in(array_keys(self::MODULES))]], ['modules.required' => 'Select at least one content module.']);
            $config['modules'] = $data['modules'];
        } elseif ($step === 3) {
            $data = $request->validate(['delivery' => ['required', Rule::in(['standard', 'express'])], 'format' => ['required', Rule::in(['pdf', 'pdf-excel', 'pdf-excel-dashboard'])], 'notes' => ['nullable', 'string', 'max:1000']]);
            $config = array_merge($config, $data);
        }

        $next = $request->boolean('draft') ? $step : min(4, $step + 1);
        $r->update(['config' => $config, 'report_type' => $config['type'], 'step' => $next]);

        return redirect("/aiim/reports/{$r->reference}/configure?step={$next}")->with('success', $request->boolean('draft') ? 'Draft saved.' : null);
    }

    /** Issue the formal quotation (G2/G3) from the configuration. */
    public function quote(Request $request, string $ref): RedirectResponse
    {
        $r = $this->report($request, $ref);
        $c = $r->config;
        if (empty($c['sectors']) || empty($c['modules'])) {
            return redirect("/aiim/reports/{$r->reference}/configure?step=1")->with('error', 'Complete scope and content before requesting a quotation.');
        }
        $p = Pricing::report($c);
        $r->update([
            'quote_reference' => $r->quote_reference ?? 'AIIM-QR-'.now()->format('Ymd').'-'.strtoupper(substr(md5($r->reference), 0, 3)),
            'lines' => $p['lines'], 'subtotal_zar' => $p['subtotal'], 'vat_zar' => $p['vat'], 'total_zar' => $p['total'],
            'status' => 'quoted', 'valid_until' => now()->addDays(7),
        ]);

        return redirect("/aiim/reports/{$r->reference}/quote");
    }

    public function quotation(Request $request, string $ref): Response|RedirectResponse
    {
        $r = $this->report($request, $ref);
        if (in_array($r->status, ['draft', 'changes_requested'], true)) {
            return redirect("/aiim/reports/{$r->reference}/configure");
        }

        return $this->render($request, 'Aiim/Store/Quote', [
            'report' => $this->props($r),
        ], 'Report Quotation');
    }

    public function accept(Request $request, string $ref): RedirectResponse
    {
        $r = $this->report($request, $ref);
        abort_unless($r->status === 'quoted', 409);
        if ($r->valid_until && $r->valid_until->isPast()) {
            return back()->with('error', 'This quotation has expired. Request changes to re-issue it.');
        }
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Please accept the AIIM Terms of Use, Data Policy and Commercial Terms.']);
        $order = Checkout::createOrder(
            collect($r->lines)->map(fn ($l) => ['item_type' => 'aiim-report', 'item_code' => $l['code'], 'name' => $l['label'], 'unit_zar' => (int) round($l['amount']), 'meta' => ['report' => $r->reference]])->all(),
            $request->user(), 'aiim',
            ['title' => "Premium report — {$r->title}", 'aiim' => ['kind' => 'report', 'report' => $r->reference, 'label' => $r->title]],
        );
        $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);
        $r->update(['order_id' => $order->id]);

        return redirect("/aiim/checkout/{$order->reference}");
    }

    public function requestChanges(Request $request, string $ref): RedirectResponse
    {
        $r = $this->report($request, $ref);
        abort_unless($r->status === 'quoted', 409);
        $r->update(['status' => 'changes_requested', 'step' => 1]);

        return redirect("/aiim/reports/{$r->reference}/configure?step=1")->with('success', 'Quotation withdrawn. Update the configuration to re-issue it.');
    }

    public function delivery(Request $request, string $ref): Response
    {
        $this->sync($request);
        $r = $this->report($request, $ref);

        return $this->render($request, 'Aiim/Store/Delivery', ['report' => $this->props($r)], 'Report Delivery');
    }

    public function reports(Request $request): Response
    {
        $this->sync($request);

        return $this->render($request, 'Aiim/Store/Reports', [
            'reports' => ReportRequest::query()->where('user_id', $request->user()->id)->latest('id')->get()->map(fn ($r) => $this->props($r)),
        ], 'Reports');
    }

    private function props(ReportRequest $r): array
    {
        $c = $r->config;
        $est = Pricing::report($c);

        return [
            'reference' => $r->reference, 'quoteReference' => $r->quote_reference, 'title' => $r->title, 'status' => $r->status, 'sku' => $r->brief_sku,
            'typeName' => $est['typeName'], 'typeCode' => $est['typeCode'],
            'scope' => trim((($c['nationwide'] ?? false) ? 'South Africa (Nationwide)' : '').' '.(empty($c['provinces']) ? '' : '+ '.Province::query()->whereIn('slug', $c['provinces'])->pluck('name')->implode(', ')), ' +'),
            'sectors' => Sector::query()->whereIn('slug', $c['sectors'] ?? [])->pluck('name')->implode(', '),
            'modules' => collect($c['modules'] ?? [])->map(fn ($m) => self::MODULES[$m] ?? $m)->values(),
            'pages' => $r->delivery['pages'] ?? $est['pages'], 'deliveryEstimate' => $est['delivery'], 'delivery' => $r->delivery,
            'lines' => $r->lines ?? $est['lines'], 'subtotal' => $r->subtotal_zar ?: $est['subtotal'], 'vat' => $r->vat_zar ?: $est['vat'], 'total' => $r->total_zar ?: $est['total'],
            'validUntil' => $r->valid_until?->format('j M Y'), 'issued' => $r->updated_at->format('j M Y, H:i').' SAST',
            'orderReference' => $r->order?->reference, 'paid' => (bool) $r->order?->isPaid() || $r->status === 'delivered',
            'deliveredAt' => $r->delivered_at?->format('j M Y, H:i').' SAST',
        ];
    }
}
