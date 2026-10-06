<?php

namespace App\Http\Controllers\Insights;

use App\Http\Controllers\Controller;
use App\Models\Insights\Benchmark;
use App\Models\Insights\DiagnosticRun;
use App\Models\Insights\Engagement;
use App\Models\Insights\Gate;
use App\Models\Insights\Industry;
use App\Models\Insights\LedgerEntry;
use App\Models\Insights\Sku;
use App\Models\Insights\Task;
use App\Models\Order;
use App\Support\Insights\Audit;
use App\Support\Insights\Documents;
use App\Support\Insights\IndustryCatalog;
use App\Support\Insights\IndustryContext;
use App\Support\Insights\IndustryRegister;
use App\Support\Insights\SectorDiagnostic;
use App\Support\Platform\Checkout;
use App\Support\Platform\EmbeddedServices;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public Industries surfaces: landing, selector, Industry page template,
 * sector-adapted diagnostic, benchmark preview, intelligence brief,
 * country intersection, partner directory and Industry service (SKU) pages.
 */
class IndustryController extends Controller
{
    public function index(): Response
    {
        $industries = Industry::query()->orderBy('number')->get();

        return Inertia::render('Insights/Industries/Index', [
            'industries' => $industries->map->toCard()->values(),
            'context' => IndustryContext::get(),
            'glance' => [
                'industries' => $industries->count(),
                'specialists' => '250+',
                'projects' => '1,200+',
                'capital' => 'R80B+',
                'humanReviewed' => '100%',
            ],
            'embedded' => EmbeddedServices::forModule('industries'),
        ]);
    }

    public function select(Request $request): Response
    {
        $context = IndustryContext::get();
        $selected = $request->query('industry', $context['industrySlug']);

        return Inertia::render('Insights/Industries/Select', [
            'industries' => IndustryCatalog::selectorList(),
            'context' => $context,
            'selected' => $selected,
            'step' => $selected ? ($context['subIndustryCode'] ? 3 : 2) : 1,
        ]);
    }

    public function setContext(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'industry' => ['required', 'exists:ins_industries,slug'],
            'sub_industry' => ['nullable', 'exists:ins_sub_industries,code'],
            'country' => ['nullable', 'in:ZA,EG,KE,NG'],
            'redirect' => ['nullable', 'string'],
        ]);

        $industry = Industry::where('slug', $data['industry'])->firstOrFail();
        if (! empty($data['sub_industry']) && ! $industry->subIndustries()->where('code', $data['sub_industry'])->exists()) {
            return back()->withErrors(['sub_industry' => 'Choose a sub-industry from the selected industry.']);
        }

        IndustryContext::set($industry, $data['sub_industry'] ?? null, $data['country'] ?? 'ZA');

        $redirect = $data['redirect'] ?? null;

        return redirect($redirect && str_starts_with($redirect, '/') ? $redirect : "/industries/{$industry->slug}")
            ->with('success', "Industry context set to {$industry->name}.");
    }

    public function clearContext(): RedirectResponse
    {
        IndustryContext::clear();

        return redirect('/industries/select')->with('success', 'Selection cleared.');
    }

    /** "Not sure which industry fits?" — keyword match against the controlled taxonomy. */
    public function guidance(Request $request): RedirectResponse
    {
        $q = Str::lower($request->validate(['q' => ['required', 'string', 'min:3', 'max:200']])['q']);
        $words = collect(preg_split('/[^a-z0-9]+/', $q))->filter(fn ($w) => strlen($w) >= 3 && ! in_array($w, ['and', 'the', 'for', 'our', 'with', 'that', 'from', 'have', 'this', 'are', 'who', 'what', 'your', 'business', 'company', 'services'], true));

        $synonyms = [
            'agriculture-agro-industry' => 'farm farming farmer crop crops maize grain wheat citrus fruit vegetable livestock cattle poultry dairy harvest grow orchard agri irrigation',
            'retail-consumer-commerce' => 'shop store retail ecommerce online wholesale fmcg spaza supermarket',
            'manufacturing-industrial' => 'factory manufacture plant assembly production machinery fabrication',
            'transport-logistics' => 'truck trucking freight courier delivery fleet warehouse shipping',
            'mining-minerals' => 'mine mining gold platinum coal ore quarry minerals',
            'energy-utilities' => 'solar wind power electricity energy gas oil renewable water utility',
            'infrastructure-public-projects' => 'road bridge rail ppp infrastructure municipal bulk',
            'property-construction' => 'building construction contractor property developer real estate housing',
            'tourism-hospitality' => 'hotel lodge guesthouse restaurant tourism travel safari events venue',
            'professional-services' => 'law legal accounting audit consulting consultancy recruitment hr',
            'technology-ict-digital' => 'software app saas it tech digital cloud cyber data ai platform',
            'government-public-sector' => 'government department municipality soe public sector agency',
            'ngo-social-enterprise-development' => 'ngo npo nonprofit charity donor community social impact',
            'education-skills' => 'school college training tutoring university skills education learning',
            'health-pharmaceuticals' => 'clinic hospital health pharmacy medical doctor wellness pharma',
            'creative-media-entertainment' => 'film music media advertising design studio content sports entertainment',
            'financial-services' => 'bank lending loans insurance fintech investment fund microfinance payments',
        ];

        $scored = Industry::query()->with('subIndustries')->get()->map(function (Industry $i) use ($words, $synonyms) {
            $hay = Str::lower($i->name.' '.$i->blurb.' '.($synonyms[$i->slug] ?? '').' '.$i->subIndustries->pluck('name')->implode(' ').' '.$i->subIndustries->pluck('description')->implode(' '));
            $score = $words->sum(fn ($w) => substr_count($hay, rtrim($w, 's')));

            return ['industry' => $i, 'score' => $score];
        })->sortByDesc('score')->filter(fn ($r) => $r['score'] > 0)->take(3)->values();

        if ($scored->isEmpty()) {
            return back()->with('error', 'We could not match that description. Choose "I\'m not sure" to speak to an advisor.');
        }

        return redirect('/industries/select?industry='.$scored[0]['industry']->slug)
            ->with('success', 'Suggested: '.$scored->map(fn ($r) => $r['industry']->name)->implode(', ').'. Confirm your industry below.');
    }

    /** Sub-nav hubs route to the current Industry context, or to the selector. */
    public function hub(string $area): RedirectResponse
    {
        $slug = IndustryContext::get()['industrySlug'];
        if (! $slug) {
            return redirect('/industries/select')->with('success', 'Select your industry first to open '.str_replace('-', ' ', $area).'.');
        }

        return redirect($area === 'sector-intelligence' ? "/industries/sector-intelligence/{$slug}" : "/industries/{$slug}/{$area}");
    }

    public function show(Industry $industry): Response
    {
        $context = IndustryContext::touch($industry);

        return Inertia::render('Insights/Industries/Show', [
            'industry' => IndustryCatalog::page($industry),
            'context' => $context,
            'industries' => IndustryCatalog::selectorList(),
            'embedded' => EmbeddedServices::forModule('industries'),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Sector-adapted diagnostic (5 steps, persisted per session/user)    */
    /* ------------------------------------------------------------------ */

    private function run(Request $request, Industry $industry): DiagnosticRun
    {
        $user = $request->user();
        $query = DiagnosticRun::query()->where('industry_id', $industry->id)->where('status', 'in_progress');
        $query = $user ? $query->where('user_id', $user->id) : $query->where('session_id', $request->session()->getId());

        return $query->latest()->first() ?? DiagnosticRun::create([
            'reference' => Reference::make('DGN'),
            'user_id' => $user?->id,
            'session_id' => $request->session()->getId(),
            'industry_id' => $industry->id,
            'sub_industry' => IndustryContext::get()['subIndustryCode'],
            'step' => 1,
            'answers' => [],
        ]);
    }

    public function diagnostic(Request $request, Industry $industry): Response
    {
        $context = IndustryContext::touch($industry);
        $completed = $request->query('result')
            ? DiagnosticRun::where('reference', $request->query('result'))->where('industry_id', $industry->id)->where('status', 'completed')->first()
            : null;
        $run = $completed ?? $this->run($request, $industry);
        $step = $completed ? 5 : min((int) $request->query('step', $run->step), $run->step);
        $answers = $run->answers ?? [];

        $industry->loadMissing('subIndustries');

        return Inertia::render('Insights/Industries/Diagnostic', [
            'industry' => IndustryCatalog::page($industry),
            'context' => $context,
            'run' => ['reference' => $run->reference, 'step' => $run->step, 'status' => $run->status],
            'step' => max(1, $step),
            'steps' => SectorDiagnostic::STEPS,
            'answers' => $answers,
            'options' => SectorDiagnostic::options(),
            'readiness' => SectorDiagnostic::readinessQuestions($industry),
            'compliance' => SectorDiagnostic::complianceQuestions(),
            'score' => SectorDiagnostic::score($industry, $answers),
            'baseline' => (int) round($industry->profile['kpis']['opportunity'] ?? 60),
        ]);
    }

    public function diagnosticStep(Request $request, Industry $industry): RedirectResponse
    {
        $run = $this->run($request, $industry);
        $step = (int) $request->validate(['step' => ['required', 'integer', 'between:1,4']])['step'];
        abort_if($step > $run->step, 422, 'Complete the earlier steps first.');

        $data = $request->validate(SectorDiagnostic::rules($step, $industry));
        $answers = array_merge($run->answers ?? [], $data);

        if ($step === 2 && ! $industry->subIndustries()->where('code', $data['sub_industry'])->exists()) {
            return back()->withErrors(['sub_industry' => 'Choose a sub-industry within '.$industry->name.'.']);
        }

        $next = $step + 1;
        $update = ['answers' => $answers, 'step' => max($run->step, $next)];
        if ($step === 2) {
            $update['sub_industry'] = $data['sub_industry'];
            IndustryContext::set($industry, $data['sub_industry'], IndustryContext::get()['country'] ?? 'ZA');
        }
        if ($step === 4) {
            $update['scores'] = SectorDiagnostic::score($industry, $answers);
            $update['status'] = 'completed';
            $update['completed_at'] = now();
        }
        $run->update($update);

        if ($step === 4) {
            return redirect("/industries/{$industry->slug}/diagnostic?result={$run->reference}")
                ->with('success', "Diagnostic complete. Reference {$run->reference}.")
                ->with('reference', $run->reference);
        }

        return redirect("/industries/{$industry->slug}/diagnostic?step={$next}");
    }

    public function diagnosticRestart(Request $request, Industry $industry): RedirectResponse
    {
        $this->run($request, $industry)->update(['step' => 1, 'answers' => [], 'scores' => null]);

        return redirect("/industries/{$industry->slug}/diagnostic?step=1");
    }

    /* ------------------------------------------------------------------ */

    public function benchmarks(Request $request, Industry $industry): Response
    {
        $context = IndustryContext::touch($industry);
        $benchmark = Benchmark::query()->where('industry_id', $industry->id)->orderByRaw("case when bands is null then 1 else 0 end")->first();
        $consented = $request->user()
            ? \App\Models\Insights\BenchmarkConsent::where('user_id', $request->user()->id)->where('industry_id', $industry->id)->latest()->value('choice') === 'granted'
            : false;
        $publishable = $benchmark?->isPublishable() ?? false;

        $bands = collect($benchmark?->bands ?? [
            ['metric' => 'Gross Margin (%)', 'low' => '15%', 'high' => '32%', 'icon' => 'leaf'],
            ['metric' => 'Operating Expense (%)', 'low' => '12%', 'high' => '28%', 'icon' => 'pie-chart'],
            ['metric' => 'EBITDA Margin (%)', 'low' => '6%', 'high' => '18%', 'icon' => 'trending-up'],
            ['metric' => 'Asset Turnover (x)', 'low' => '0.5x', 'high' => '1.4x', 'icon' => 'layers'],
        ])->map(function ($b) use ($publishable, $consented) {
            // Blueprint 11.6: no BenchmarkReleaseID (publishable state) => no numeric render.
            if (! ($publishable && $consented)) {
                unset($b['value']);
            }

            return $b;
        })->values();

        return Inertia::render('Insights/Industries/Benchmarks', [
            'industry' => IndustryCatalog::page($industry),
            'context' => $context,
            'benchmark' => $benchmark ? array_merge($benchmark->toRow(), ['bands' => $bands]) : null,
            'unlocked' => $publishable && $consented,
            'consented' => $consented,
            'engagement' => $request->user() ? Engagement::where('user_id', $request->user()->id)->value('reference') : null,
        ]);
    }

    public function brief(Request $request, Industry $industry): Response
    {
        $context = IndustryContext::touch($industry);
        $code = 'BRIEF-'.$industry->short_code;
        $owned = $request->user() && Order::query()->where('user_id', $request->user()->id)->where('status', 'paid')
            ->whereHas('items', fn ($q) => $q->where('item_code', $code))->exists();

        return Inertia::render('Insights/Industries/Brief', [
            'industry' => IndustryCatalog::page($industry),
            'context' => $context,
            'owned' => $owned,
            'subSectors' => $industry->subIndustries->values()->map(fn ($s, $i) => ['name' => $s->name, 'text' => $s->description, 'score' => max(40, 75 - $i * 4)]),
        ]);
    }

    public function purchaseBrief(Request $request, Industry $industry): RedirectResponse
    {
        $price = (int) ($industry->profile['brief']['price'] ?? 950);
        $order = Checkout::createOrder([[
            'item_type' => 'report', 'item_code' => 'BRIEF-'.$industry->short_code, 'name' => $industry->profile['brief']['title'] ?? "{$industry->name} Brief", 'unit_zar' => $price,
        ]], $request->user(), 'insights', ['return_url' => "/industries/sector-intelligence/{$industry->slug}", 'title' => 'Sector Intelligence Brief']);

        return redirect()->route('checkout.show', $order);
    }

    public function country(Industry $industry, string $country): Response
    {
        $countries = IndustryRegister::countries();
        abort_unless(isset($countries[$country]), 404);
        $c = $countries[$country];
        $context = IndustryContext::touch($industry);

        return Inertia::render('Insights/Industries/Country', [
            'industry' => IndustryCatalog::page($industry),
            'context' => $context,
            'country' => array_merge($c, ['slug' => $country]),
            'countries' => collect($countries)->map(fn ($v, $k) => ['slug' => $k, 'name' => $v['name']])->values(),
        ]);
    }

    public function partners(Industry $industry): Response
    {
        return Inertia::render('Insights/Industries/Partners', [
            'industry' => IndustryCatalog::page($industry),
            'context' => IndustryContext::touch($industry),
            'categories' => collect(IndustryRegister::partnerCategories())->map(fn ($c, $i) => array_merge($c, [
                'name' => $i === 3 ? str_replace('Sector', explode(' ', $industry->name)[0], $c['name']) : $c['name'],
            ]))->values(),
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Industry service (SKU) pages with blocked / add-on / limitation    */
    /* ------------------------------------------------------------------ */

    public function service(Request $request, Industry $industry, Sku $sku): Response
    {
        abort_unless($sku->industry_id === $industry->id && $sku->public, 404);
        $context = IndustryContext::touch($industry);

        return Inertia::render('Insights/Industries/Service', [
            'industry' => IndustryCatalog::page($industry),
            'context' => $context,
            'sku' => [
                'slug' => $sku->slug, 'code' => $sku->code, 'title' => $sku->title, 'summary' => $sku->summary, 'description' => $sku->description,
                'priceZar' => $sku->price_zar, 'saleState' => $sku->isBlocked() ? 'blocked' : ($sku->isRestricted() ? 'restricted' : 'sellable'),
                'included' => $sku->included ?? [], 'addOns' => $sku->add_ons ?? [], 'limitation' => $sku->limitation,
                'addOnTotal' => collect($sku->add_ons ?? [])->sum(fn ($a) => $a['fee'] ?? 0),
                'hasVariableAddOn' => collect($sku->add_ons ?? [])->contains(fn ($a) => ($a['fee'] ?? null) === null),
                'block' => $sku->isBlocked() || $sku->isRestricted() ? [
                    'code' => $sku->block_code ?? 'IN-BLOCK-'.str_pad((string) $sku->id, 3, '0', STR_PAD_LEFT),
                    'reason' => $sku->block_reason, 'detail' => $sku->block_detail, 'rules' => $sku->block_rules ?? [], 'message' => $sku->client_message,
                ] : null,
                'complexityClass' => $sku->complexityClass(),
            ],
            'related' => $industry->skus()->where('public', true)->where('id', '!=', $sku->id)->get(['slug', 'title', 'sale_state', 'price_zar']),
            'blockedSku' => $request->query('requested')
                ? Sku::where('slug', $request->query('requested'))->where('industry_id', $industry->id)->first(['slug', 'code', 'title', 'block_code', 'block_reason', 'block_detail', 'block_rules', 'sale_state', 'block_status'])
                : null,
        ]);
    }

    /**
     * Commit to an Industry service: requires the limitation acknowledgement and,
     * where add-ons are mandatory, the add-on acknowledgement (blueprint 5.2/9.1 N5).
     * Creates the engagement, its quotation lines in the four-ledger view and gates.
     */
    public function engage(Request $request, Industry $industry, Sku $sku): RedirectResponse
    {
        abort_unless($sku->industry_id === $industry->id && $sku->public, 404);

        if ($sku->isBlocked() || $sku->isRestricted()) {
            return back()->with('error', 'This service is not available for your selected Industry context.');
        }

        $hasAddOns = ! empty($sku->add_ons);
        $request->validate([
            'acknowledge_limitation' => ['accepted'],
            'acknowledge_addons' => [$hasAddOns ? 'accepted' : 'nullable'],
        ], [
            'acknowledge_limitation.accepted' => 'Please acknowledge the Sector Limitation Statement to continue.',
            'acknowledge_addons.accepted' => 'Please acknowledge the mandatory add-ons to continue.',
        ]);

        $user = $request->user();
        $context = IndustryContext::get();
        $seq = Engagement::query()->where('reference', 'like', "{$industry->short_code}-".now()->year.'-%')->count() + 1;
        $reference = sprintf('%s-%d-%s-%03d', $industry->short_code, now()->year, $context['country'] ?? 'ZA', $seq);
        while (Engagement::where('reference', $reference)->exists()) {
            $reference = sprintf('%s-%d-%s-%03d', $industry->short_code, now()->year, $context['country'] ?? 'ZA', ++$seq);
        }

        $engagement = Engagement::create([
            'reference' => $reference,
            'user_id' => $user->id,
            'industry_id' => $industry->id,
            'sub_industry' => $context['industrySlug'] === $industry->slug ? $context['subIndustryName'] : null,
            'country' => $context['countryName'] ?? 'South Africa',
            'title' => $sku->title,
            'stage' => 'S5',
            'status' => 'active',
            'total_fee_zar' => (int) $sku->price_zar,
            'due_on' => now()->addDays(14),
            'progress' => 10,
            'letter_status' => 'draft',
            'data' => [
                'stage_label' => 'S5 – Report Commissioning',
                'sku' => $sku->code,
                'add_ons' => $sku->add_ons ?? [],
                'limitation_ack' => ['id' => $sku->limitation['id'] ?? null, 'at' => now()->toIso8601String()],
                'deliverables' => collect($sku->included ?? [])->map(fn ($d, $i) => ['title' => $d, 'target' => 'Within '.(5 + $i * 2).' days of payment'])->all(),
                'timeline' => [['title' => 'Scope & fee disclosure acknowledged', 'status' => 'completed', 'date' => now()->format('d M Y')], ['title' => 'Engagement letter signature', 'status' => 'pending', 'date' => 'Next']],
                'activity' => [['title' => 'Engagement created', 'text' => $sku->title, 'at' => now()->format('d M Y, h:i A'), 'icon' => 'file']],
                'documents' => [],
                'advisor' => ['name' => 'Lebo Mokoena', 'role' => 'Industry Advisory Lead', 'email' => 'lebo.mokoena@tbca.africa', 'phone' => '+27 11 123 4567'],
                'specialists' => [], 'checklist' => [], 'partner_scope' => [], 'partners' => [],
            ],
        ]);

        LedgerEntry::create(['engagement_id' => $engagement->id, 'occurred_at' => now(), 'type' => 'charge', 'description' => $sku->title, 'detail' => 'Ledger T – base price', 'amount_zar' => (int) $sku->price_zar, 'status' => 'invoiced']);
        foreach ($sku->add_ons ?? [] as $addOn) {
            LedgerEntry::create([
                'engagement_id' => $engagement->id, 'occurred_at' => now(), 'type' => 'adjustment', 'description' => $addOn['component'],
                'detail' => "Ledger {$addOn['ledger']} – mandatory add-on (estimate)", 'amount_zar' => (int) ($addOn['fee'] ?? 0),
                'status' => ($addOn['fee'] ?? null) === null ? 'to_be_confirmed' : 'estimated',
            ]);
        }

        foreach ([
            ['G0', 'Consent Gate', 'S0 – Arrival & Exploration', 'completed'], ['G1', 'Registration Gate', 'S1 – Registration & Intent Capture', 'completed'],
            ['G2', 'Disclosure Gate', 'S2 – Scope & Fee Disclosure', 'completed'], ['G3', 'Quotation Gate', 'S5 – Report Commissioning', 'pending'],
            ['G4', 'Payment Gate', 'S6 – Payment', 'locked'], ['G5', 'Acceptance Gate', 'S5 – Report Delivery', 'locked'],
            ['G6', 'Escalation Gate', 'S6+ – Human Escalation', 'locked'], ['G7', 'Specialist Gate', 'S7 – Specialist Release', 'locked'], ['G8', 'Mandate Gate', 'S8 – Capital Mandate', 'locked'],
        ] as [$code, $name, $stage, $status]) {
            Gate::create(['engagement_id' => $engagement->id, 'code' => $code, 'name' => $name, 'stage' => $stage, 'status' => $status, 'decided_at' => $status === 'completed' ? now() : null, 'decided_by' => $status === 'completed' ? $user->name : null]);
        }

        Task::create(['engagement_id' => $engagement->id, 'title' => 'Review and sign the engagement letter', 'detail' => 'Required before payment', 'priority' => 'high', 'due_on' => now()->addDays(3)]);
        Task::create(['engagement_id' => $engagement->id, 'title' => 'Approve the quotation (Gate G3)', 'detail' => 'Confirms scope and fees', 'priority' => 'high', 'due_on' => now()->addDays(3)]);

        Audit::log($engagement, 'engagement_created', null, 'S5', "Limitation {$engagement->data['limitation_ack']['id']} and add-ons acknowledged");

        return redirect("/industries/workspace/{$engagement->reference}/engagement-letter")
            ->with('success', "Engagement {$engagement->reference} created. Review your engagement letter.")
            ->with('reference', $engagement->reference);
    }

    public function disclosurePdf(Industry $industry, Sku $sku)
    {
        abort_unless($sku->industry_id === $industry->id, 404);
        $lines = ["Service: {$sku->title} ({$sku->code})", 'Base price: R'.number_format((int) $sku->price_zar).' ex VAT', '', 'Mandatory add-ons:'];
        foreach ($sku->add_ons ?? [] as $a) {
            $lines[] = "- {$a['component']} | Ledger {$a['ledger']} | ".(($a['fee'] ?? null) ? 'R'.number_format($a['fee']) : 'Varies').' | '.$a['purpose'];
        }
        $lines[] = '';
        $lines[] = 'Exact fees will be confirmed after scoping. You will see all costs before you commit.';
        if ($sku->limitation) {
            $lines[] = '';
            $lines[] = "Sector Limitation Statement {$sku->limitation['id']} v{$sku->limitation['version']}";
            foreach (array_merge($sku->limitation['limitations'] ?? [], $sku->limitation['outOfScope'] ?? []) as $l) {
                $lines[] = "- {$l}";
            }
        }

        return Documents::pdf("{$sku->slug}-disclosure.pdf", 'Mandatory Add-On Disclosure', $lines);
    }
}
