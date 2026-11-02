<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Brief;
use App\Models\Aiim\Entitlement;
use App\Models\Aiim\Province;
use App\Models\Aiim\ReportRequest;
use App\Models\Aiim\Sector;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\ProtoLibrary;
use App\Support\Aiim\Refs;
use App\Support\CountryHub\CountryHub;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Response;

/**
 * Stage 3 (prototype Pages 34 to 38): premium brief store, brief detail and purchase, report
 * configuration -> quotation (G2/G3) -> payment (G4) -> delivery.
 *
 * The store carries the 17 Botswana premium briefs (BW_Premium) and the 12 AIIM report formats,
 * priced through the embedded services from the app's Sprint records, and keeps the app's own brief
 * catalogue. Report configurations use the prototype's single form; older step-by-step
 * configurations still quote and pay as before.
 */
class StoreController extends AiimController
{
    public const MODULES = [
        'market-overview' => 'Market Overview & Size', 'growth-drivers' => 'Growth Drivers & Trends', 'investment-opportunities' => 'Investment Opportunities',
        'key-players' => 'Key Players & Competitors', 'regulatory' => 'Regulatory & Policy Analysis', 'infrastructure' => 'Infrastructure Readiness',
        'risk' => 'Risk Assessment', 'benchmarks' => 'Financial Performance Benchmarks', 'swot' => 'SWOT Analysis', 'case-studies' => 'Case Studies',
    ];

    /** What a premium brief contains (prototype Page 35 outline). */
    private const OUTLINE = [
        'Executive summary and investment thesis', 'Market size, demand gap and growth (graded facts)', 'Ranked templates with tier, RA and downturn tier',
        'Places: ranked leads, envelopes and gateways', 'Citizen-reserved activities, permits and regulatory change', 'Unit economics: after-tax IRR, tornado, equity IRR',
        'Risks, shocks and mitigants', 'Who to call: institutions and next actions', 'Source manifest and evidence appendix',
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
            'briefs' => array_map(fn ($p) => ProtoLibrary::briefCard($p), ProtoLibrary::premium()),
            'formats' => ProtoLibrary::reportFormats(),
            'filters' => $f,
            'results' => $q->paginate(8)->withQueryString()->through(fn ($b) => Catalogue::brief($b)),
            'categories' => ['Investment Climate', 'Countries', 'Sectors', 'Provinces', 'Infrastructure', 'Projects', 'Markets & Trade', 'Regulatory & Policy', 'Risk & Outlook', 'Data Packs'],
            'owned' => $request->user() ? Entitlement::query()->where('user_id', $request->user()->id)->where('object_type', 'brief')->pluck('object_key') : [],
        ], 'Premium Brief Store');
    }

    public function show(Request $request, string $brief): Response
    {
        $this->sync($request);
        if (ProtoLibrary::isBwBrief($brief)) {
            $p = ProtoLibrary::premium($brief);
            abort_unless($p !== null, 404);
            $this->select($request, ['country' => 'Botswana', 'item' => $p['Product']]);
            $svc = ProtoLibrary::card(ProtoLibrary::briefService($brief));

            return $this->render($request, 'Aiim/Store/Show', [
                'kind' => 'bw',
                'bw' => ProtoLibrary::briefCard($p),
                'outline' => self::OUTLINE,
                'preview' => array_slice(ProtoLibrary::table('G-2') ?? [], 0, 6),
                'addons' => ProtoLibrary::rail(['AAB-EMB-191', 'AAB-EMB-198', 'AAB-EMB-203']),
                'pricing' => $svc,
                'owned' => (bool) $this->entitled($request->user(), 'brief', $brief),
                'item' => null,
                'saved' => [],
            ], 'Premium Brief Detail');
        }

        $b = Brief::query()->where('sku', $brief)->firstOrFail();
        $this->select($request, ['item' => $b->title, 'province' => $b->province_slug]);

        return $this->render($request, 'Aiim/Store/Show', [
            'kind' => 'app',
            'bw' => null,
            'outline' => array_values((array) ($b->profile['inside'] ?? [])) ?: self::OUTLINE,
            'preview' => [],
            'addons' => ProtoLibrary::rail(['AAB-EMB-191', 'AAB-EMB-198', 'AAB-EMB-203']),
            'pricing' => null,
            'item' => Catalogue::brief($b, true),
            'owned' => (bool) $this->entitled($request->user(), 'brief', $b->sku),
            'saved' => $this->savedKeys($request->user()),
        ], 'Premium Brief Detail');
    }

    /** Buy Now: straight to the AIIM checkout. (Add to Cart posts to the shared basket with item_type "aiim-brief".) */
    public function buy(Request $request, string $brief): RedirectResponse
    {
        if ($this->entitled($request->user(), 'brief', $brief)) {
            return back()->with('success', 'You already own this brief.');
        }

        if (ProtoLibrary::isBwBrief($brief)) {
            $p = ProtoLibrary::premium($brief);
            abort_unless($p !== null, 404);
            $svc = ProtoLibrary::briefService($brief);
            $price = Pricing::service($svc);
            if ($price === null) {
                return back()->with('error', 'This brief is not in the app catalogue yet. Ask an advisor for a quotation.');
            }
            // Service prices are ex VAT; VAT is added at checkout.
            $line = ['item_type' => 'aiim-brief', 'item_code' => $brief, 'name' => "{$brief} {$p['Product']}", 'variant' => 'Standard Access', 'unit_zar' => (int) round($price), 'meta' => ['service' => $svc]];
            $label = $p['Product'];
        } else {
            $b = Brief::query()->where('sku', $brief)->firstOrFail();
            // Store prices are VAT-inclusive; the order line carries the ex-VAT amount.
            $line = ['item_type' => 'aiim-brief', 'item_code' => $b->sku, 'name' => $b->title, 'variant' => 'Standard Access', 'unit_zar' => (int) round($b->price_zar / 1.15)];
            $label = $b->title;
        }

        $order = Checkout::createOrder([$line], $request->user(), 'aiim', ['title' => 'AIIM premium brief', 'aiim' => ['kind' => 'brief', 'label' => $label]]);
        $order->update(['meta' => $order->meta + ['return_url' => "/aiim/checkout/{$order->reference}/success"]]);

        return redirect("/aiim/checkout/{$order->reference}");
    }

    /* ------------------------------------------------- report configuration */

    /** Start (or resume) a report configuration for a brief, or for a Botswana report with no brief (BW-REPORT). */
    public function configure(Request $request, string $brief): RedirectResponse
    {
        if ($brief === ProtoLibrary::BW_REPORT) {
            $sku = null;
            $title = 'Botswana report';
            $country = 'botswana';
            $type = 'AAB-EMB-192';
        } elseif (ProtoLibrary::isBwBrief($brief)) {
            $p = ProtoLibrary::premium($brief);
            abort_unless($p !== null, 404);
            $sku = $brief;
            $title = $p['Product'];
            $country = 'botswana';
            $svc = ProtoLibrary::briefService($brief);
            $type = ProtoLibrary::num($svc) >= 192 && ProtoLibrary::num($svc) <= 203 ? $svc : 'AAB-EMB-192';
        } else {
            $b = Brief::query()->where('sku', $brief)->firstOrFail();
            $sku = $b->sku;
            $title = $b->title;
            $country = 'south-africa';
            $type = 'AAB-EMB-192';
        }

        $report = ReportRequest::query()->where('user_id', $request->user()->id)->where('brief_sku', $sku)->where('title', $title)->whereIn('status', ['draft', 'changes_requested'])->latest('id')->first()
            ?? ReportRequest::create([
                'reference' => Refs::make('REP'),
                'user_id' => $request->user()->id,
                'brief_sku' => $sku,
                'title' => $title,
                'report_type' => $type,
                'config' => self::serviceConfig(['country' => $country, 'type' => $type]),
            ]);

        return redirect("/aiim/reports/{$report->reference}/configure");
    }

    /** Prototype report configuration with defaults (Page 36). */
    private static function serviceConfig(array $c = []): array
    {
        return array_merge(['kind' => 'service', 'country' => 'botswana', 'type' => 'AAB-EMB-192', 'sector' => '', 'unit' => '', 'language' => 'en', 'currency' => 'BWP', 'expedite' => false, 'sources' => true], $c);
    }

    private static function isService(array $c): bool
    {
        return ($c['kind'] ?? null) === 'service';
    }

    private function report(Request $request, string $ref): ReportRequest
    {
        $r = ReportRequest::query()->where('reference', $ref)->firstOrFail();
        abort_unless($r->user_id === $request->user()->id, 403);

        return $r;
    }

    /** Sector and unit options for the configuration's country. */
    private static function scopeOptions(string $country): array
    {
        if ($country === 'botswana') {
            return [
                'sectors' => collect(CountryHub::SECT)->map(fn ($n, $c) => ['value' => $c, 'label' => $n])->values()->all(),
                'units' => array_map(fn ($u) => ['value' => $u['Code'], 'label' => $u['Unit']], CountryHub::register('BW_Units')),
                'unitsLabel' => 'All 16 units',
            ];
        }

        return [
            'sectors' => Sector::query()->orderBy('sort')->get(['slug', 'name'])->map(fn ($s) => ['value' => $s->slug, 'label' => $s->name])->all(),
            'units' => Province::query()->orderBy('rank')->get(['slug', 'name'])->map(fn ($p) => ['value' => $p->slug, 'label' => $p->name])->all(),
            'unitsLabel' => 'All 9 provinces',
        ];
    }

    public function editor(Request $request, string $ref): Response|RedirectResponse
    {
        $r = $this->report($request, $ref);
        if (! in_array($r->status, ['draft', 'changes_requested'], true)) {
            return redirect($r->status === 'quoted' ? "/aiim/reports/{$r->reference}/quote" : "/aiim/workspace/reports/{$r->reference}");
        }
        // Older step-by-step configurations open in the prototype form with its defaults.
        $config = self::isService($r->config) ? $r->config : self::serviceConfig(['country' => 'south-africa']);
        $scope = self::scopeOptions($config['country']);

        return $this->render($request, 'Aiim/Store/Configure', [
            'report' => ['reference' => $r->reference, 'title' => $r->title, 'status' => $r->status, 'sku' => $r->brief_sku, 'config' => $config, 'country' => $config['country'] === 'botswana' ? 'Botswana' : 'South Africa'],
            'estimate' => Pricing::serviceReport($config),
            'options' => [
                'types' => ProtoLibrary::reportFormats(),
                'extras' => collect(Pricing::REPORT_OPTIONS)->map(fn ($o, $k) => ['key' => $k, 'svc' => ProtoLibrary::card($o[0])])->values(),
                'localise' => $config['country'] === 'botswana',
            ] + $scope,
        ], 'Report Configuration');
    }

    public function saveStep(Request $request, string $ref): RedirectResponse
    {
        $r = $this->report($request, $ref);
        abort_unless(in_array($r->status, ['draft', 'changes_requested'], true), 409);

        if ($request->input('kind') === 'service') {
            return $this->saveServiceConfig($request, $r);
        }

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

    /** Save the prototype form; with `quote` set, issue the quotation straight away ("Get quotation"). */
    private function saveServiceConfig(Request $request, ReportRequest $r): RedirectResponse
    {
        $current = self::isService($r->config) ? $r->config : self::serviceConfig(['country' => 'south-africa']);
        $scope = self::scopeOptions($current['country']);
        $data = $request->validate([
            'type' => ['required', Rule::in(array_column(ProtoLibrary::reportFormats(), 'code'))],
            'sector' => ['nullable', 'string', Rule::in(array_column($scope['sectors'], 'value'))],
            'unit' => ['nullable', 'string', Rule::in(array_column($scope['units'], 'value'))],
            'language' => ['required', Rule::in($current['country'] === 'botswana' ? ['en', 'tn'] : ['en'])],
            'currency' => ['required', Rule::in(['BWP', 'USD', 'ZAR'])],
            'expedite' => ['boolean'],
            'sources' => ['boolean'],
        ]);
        $config = self::serviceConfig(['country' => $current['country']] + array_map(fn ($v) => $v ?? '', $data));
        $config['expedite'] = (bool) ($data['expedite'] ?? false);
        $config['sources'] = (bool) ($data['sources'] ?? false);
        $r->update(['config' => $config, 'report_type' => $config['type'], 'step' => 1]);

        if ($request->boolean('quote')) {
            return $this->quote($request, $r->reference);
        }

        return redirect("/aiim/reports/{$r->reference}/configure")->with('success', 'Draft saved.');
    }

    /** Issue the formal quotation (G2/G3) from the configuration. */
    public function quote(Request $request, string $ref): RedirectResponse
    {
        $r = $this->report($request, $ref);
        $c = $r->config;
        if (self::isService($c)) {
            $p = Pricing::serviceReport($c);
            if (in_array($p['typeCode'], $p['unpriced'], true) || ! $p['lines']) {
                return redirect("/aiim/reports/{$r->reference}/configure")->with('error', 'This report format is not in the app catalogue yet. Choose another format or ask an advisor.');
            }
        } else {
            if (empty($c['sectors']) || empty($c['modules'])) {
                return redirect("/aiim/reports/{$r->reference}/configure?step=1")->with('error', 'Complete scope and content before requesting a quotation.');
            }
            $p = Pricing::report($c);
        }
        $r->update([
            'quote_reference' => $r->quote_reference ?? 'AIIM-QR-'.now()->format('Ymd').'-'.strtoupper(substr(md5($r->reference), 0, 3)),
            'lines' => $p['lines'], 'subtotal_zar' => $p['subtotal'], 'vat_zar' => $p['vat'], 'total_zar' => $p['total'],
            'status' => 'quoted', 'valid_until' => now()->addDays(self::isService($c) ? 14 : 7),
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
            'rail' => ProtoLibrary::rail(['AAB-EMB-230', 'AAB-EMB-229', 'AAB-EMB-240']),
        ], 'Report Quotation');
    }

    public function accept(Request $request, string $ref): RedirectResponse
    {
        $r = $this->report($request, $ref);
        abort_unless($r->status === 'quoted', 409);
        if ($r->valid_until && $r->valid_until->endOfDay()->isPast()) {
            return back()->with('error', 'This quotation has expired. Request changes to re-issue it.');
        }
        $request->validate(['accept' => ['accepted']], ['accept.accepted' => 'Please accept the AIIM Terms of Use, Data Policy and Commercial Terms.']);
        $order = Checkout::createOrder(
            collect($r->lines)->map(fn ($l) => ['item_type' => 'aiim-report', 'item_code' => $l['code'], 'name' => $l['label'], 'unit_zar' => (int) round($l['amount']), 'meta' => ['report' => $r->reference]])->all(),
            $request->user(), 'aiim',
            ['title' => "Premium report: {$r->title}", 'aiim' => ['kind' => 'report', 'report' => $r->reference, 'label' => $r->title]],
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

        return $this->render($request, 'Aiim/Store/Delivery', [
            'report' => $this->props($r),
            'rail' => ProtoLibrary::rail(['AAB-EMB-191', 'AAB-EMB-238', 'AAB-EMB-204']),
        ], 'Report Delivery');
    }

    public function reports(Request $request): Response
    {
        $this->sync($request);

        return $this->render($request, 'Aiim/Store/Reports', [
            'reports' => ReportRequest::query()->where('user_id', $request->user()->id)->latest('id')->get()->map(fn ($r) => $this->props($r)),
            'rail' => ProtoLibrary::rail(['AAB-EMB-191', 'AAB-EMB-238', 'AAB-EMB-204']),
        ], 'Reports');
    }

    private function props(ReportRequest $r): array
    {
        $c = $r->config;
        $service = self::isService($c);
        $est = $service ? Pricing::serviceReport($c) : Pricing::report($c);

        if ($service) {
            $scope = self::scopeOptions($c['country']);
            $country = $c['country'] === 'botswana' ? 'Botswana' : 'South Africa';
            $unit = collect($scope['units'])->firstWhere('value', $c['unit'])['label'] ?? $scope['unitsLabel'];
            $scopeText = "{$country} · {$unit}";
            $sectors = collect($scope['sectors'])->firstWhere('value', $c['sector'])['label'] ?? 'All sectors';
            $modules = array_values(array_filter([
                $c['sources'] ? 'Source manifest and evidence appendix' : null,
                $c['expedite'] ? 'Expedited delivery' : null,
                $c['language'] === 'tn' ? 'Setswana localisation' : 'English',
                'Amounts in '.$c['currency'],
            ]));
        } else {
            $scopeText = trim((($c['nationwide'] ?? false) ? 'South Africa (Nationwide)' : '').' '.(empty($c['provinces']) ? '' : '+ '.Province::query()->whereIn('slug', $c['provinces'])->pluck('name')->implode(', ')), ' +');
            $sectors = Sector::query()->whereIn('slug', $c['sectors'] ?? [])->pluck('name')->implode(', ');
            $modules = collect($c['modules'] ?? [])->map(fn ($m) => self::MODULES[$m] ?? $m)->values()->all();
        }

        return [
            'reference' => $r->reference, 'quoteReference' => $r->quote_reference, 'title' => $r->title, 'status' => $r->status, 'sku' => $r->brief_sku,
            'typeName' => $est['typeName'], 'typeCode' => $est['typeCode'],
            'scope' => $scopeText, 'sectors' => $sectors, 'modules' => $modules,
            'pages' => $r->delivery['pages'] ?? $est['pages'], 'deliveryEstimate' => $est['delivery'], 'delivery' => $r->delivery,
            'lines' => $r->lines ?? $est['lines'], 'subtotal' => $r->subtotal_zar ?: $est['subtotal'], 'vat' => $r->vat_zar ?: $est['vat'], 'total' => $r->total_zar ?: $est['total'],
            'validUntil' => $r->valid_until?->format('j M Y'), 'issued' => $r->updated_at->format('j M Y, H:i').' SAST', 'created' => $r->created_at->format('j M Y'),
            'orderReference' => $r->order?->reference, 'paid' => (bool) $r->order?->isPaid() || $r->status === 'delivered',
            'deliveredAt' => $r->delivered_at?->format('j M Y, H:i').' SAST',
        ];
    }
}
