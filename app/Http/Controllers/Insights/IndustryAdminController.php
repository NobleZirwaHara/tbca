<?php

namespace App\Http\Controllers\Insights;

use App\Http\Controllers\Controller;
use App\Models\Insights\Benchmark;
use App\Models\Insights\Industry;
use App\Models\Insights\Misdeclaration;
use App\Models\Insights\Regulator;
use App\Models\Insights\Sku;
use App\Models\Insights\SubIndustry;
use App\Models\Insights\TaxonomyChange;
use App\Models\Insights\WhatsAppFlow;
use App\Support\Insights\Audit;
use App\Support\Insights\Documents;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Industries governance console (/admin/insights/industries/...).
 */
class IndustryAdminController extends Controller
{
    public const CLASSIFICATION_STATES = ['UNCLASSIFIED', 'AI_CANDIDATE', 'HUMAN_REVIEW', 'APPROVED', 'APPROVED_AGNOSTIC', 'RECLASSIFICATION_REQUIRED', 'RETIRED'];

    public const MISDECLARATION_STATES = ['new', 'assigned', 'under_review', 'information_requested', 'pending_evidence', 'reclassified', 'dismissed'];

    private function industryOptions(): array
    {
        return Industry::orderBy('number')->get(['id', 'name', 'slug'])->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])->all();
    }

    public function overview(): Response
    {
        $skus = Sku::all();

        return Inertia::render('Insights/Industries/Admin/Overview', [
            'kpis' => [
                'industries' => Industry::count(),
                'subIndustries' => SubIndustry::count(),
                'live' => Industry::where('activation_stage', '>=', 7)->count(),
                'unclassified' => $skus->whereIn('classification_state', ['UNCLASSIFIED', 'AI_CANDIDATE', 'HUMAN_REVIEW', 'RECLASSIFICATION_REQUIRED'])->count(),
                'belowFloor' => $skus->filter(fn ($s) => $s->marginStatus() === 'below_floor')->count(),
                'blocked' => $skus->whereIn('sale_state', ['blocked', 'restricted'])->where('block_status', '!=', 'released')->count(),
                'regulators' => Regulator::count(),
                'queue' => Misdeclaration::whereNotIn('status', ['reclassified', 'dismissed'])->count(),
                'benchmarksEligible' => Benchmark::all()->filter->isPublishable()->count(),
                'benchmarks' => Benchmark::count(),
                'flows' => WhatsAppFlow::where('area', 'industries')->count(),
            ],
        ]);
    }

    /* --- Taxonomy ------------------------------------------------------ */

    public function taxonomy(Request $request): Response
    {
        $q = $request->query('q');
        $status = $request->query('status');
        $industries = Industry::query()->withCount('subIndustries')->orderBy('number')
            ->when($q, fn ($b) => $b->where('name', 'like', "%{$q}%"))
            ->when($status, fn ($b) => $b->where('status', $status))->get();
        $selected = Industry::with(['subIndustries', 'changes'])->where('slug', $request->query('industry', 'agriculture-agro-industry'))->first() ?? Industry::with(['subIndustries', 'changes'])->first();
        $skus = Sku::all();

        return Inertia::render('Insights/Industries/Admin/Taxonomy', [
            'filters' => ['q' => $q, 'status' => $status],
            'industries' => $industries->map(fn ($i) => ['id' => $i->id, 'number' => $i->number, 'slug' => $i->slug, 'name' => $i->name, 'icon' => $i->icon, 'status' => $i->status, 'subCount' => $i->sub_industries_count])->values(),
            'selected' => $selected ? [
                'id' => $selected->id, 'number' => $selected->number, 'slug' => $selected->slug, 'name' => $selected->name, 'icon' => $selected->icon,
                'code' => $selected->short_code, 'canonicalCode' => $selected->code, 'status' => $selected->status, 'version' => $selected->version,
                'created' => $selected->created_at->format('d M Y'), 'updated' => $selected->updated_at->format('d M Y'),
                'description' => $selected->description, 'examples' => $selected->examples ?? [], 'rules' => $selected->rules ?? [],
                'blurb' => $selected->blurb, 'complexityClass' => $selected->complexity_class, 'catalogueState' => $selected->catalogue_state,
                'subIndustries' => $selected->subIndustries->map(fn ($s) => ['id' => $s->id, 'code' => $s->code, 'name' => $s->name, 'description' => $s->description, 'bands' => $s->complexity_bands, 'status' => $s->status, 'sprintCount' => $s->sprint_count, 'updated' => $s->updated_at->format('d M Y')])->values(),
                'changes' => $selected->changes->map(fn ($c) => ['date' => $c->created_at->format('d M Y, H:i'), 'by' => $c->changed_by, 'type' => $c->change_type, 'details' => $c->details, 'version' => $c->version])->values(),
            ] : null,
            'summary' => [
                'industries' => Industry::count(), 'subIndustries' => SubIndustry::count(), 'active' => SubIndustry::where('status', 'active')->count(),
                'inactive' => SubIndustry::where('status', '!=', 'active')->count() + Industry::where('status', '!=', 'active')->count(),
                'mapped' => $skus->whereNotNull('industry_id')->count(), 'unmapped' => $skus->whereNull('industry_id')->count(),
            ],
            'complexity' => collect(['C0', 'C1', 'C2', 'C3', 'C4'])->map(fn ($c) => ['class' => $c, 'label' => Industry::COMPLEXITY[$c]['label'], 'count' => $skus->filter(fn ($s) => $s->complexityClass() === $c)->count()])->values(),
            'quality' => [
                'orphans' => SubIndustry::whereNotIn('industry_id', Industry::pluck('id'))->count(),
                'duplicates' => SubIndustry::select('code')->groupBy('code')->havingRaw('count(*) > 1')->count(),
                'missingDescriptions' => SubIndustry::whereNull('description')->count(),
            ],
        ]);
    }

    public function storeIndustry(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:ins_industries,name'],
            'short_code' => ['required', 'alpha', 'size:3', 'unique:ins_industries,short_code'],
            'blurb' => ['required', 'string', 'max:300'],
            'complexity_class' => ['required', 'in:C0,C1,C2,C3'],
        ]);
        $number = (int) Industry::max('number') + 1;
        $industry = Industry::create(array_merge($data, [
            'short_code' => strtoupper($data['short_code']), 'code' => sprintf('IND-%02d', $number), 'number' => $number, 'slug' => Str::slug($data['name']),
            'icon' => 'briefcase', 'description' => $data['blurb'], 'catalogue_state' => 'below_threshold', 'operating_mode' => 'BUILD', 'status' => 'inactive',
            'activation_stage' => 0, 'profile' => [], 'version' => '1.0',
        ]));
        TaxonomyChange::create(['industry_id' => $industry->id, 'changed_by' => $request->user()->name, 'change_type' => 'Created', 'details' => 'Initial creation (proposed – approval required)', 'version' => '1.0']);

        return redirect('/admin/insights/industries/taxonomy?industry='.$industry->slug)->with('success', "{$industry->name} added as a proposed industry (inactive until approved).");
    }

    public function updateIndustry(Request $request, Industry $industry): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:1000'],
            'status' => ['required', 'in:active,inactive,archived'],
            'complexity_class' => ['required', 'in:C0,C1,C2,C3'],
            'catalogue_state' => ['required', 'in:deep,thin,below_threshold'],
            'examples' => ['nullable', 'string', 'max:500'],
        ]);
        $parts = explode('.', $industry->version);
        $version = $parts[0].'.'.((int) ($parts[1] ?? 0) + 1);
        $industry->update(array_merge($data, [
            'examples' => collect(explode(',', $data['examples'] ?? ''))->map(fn ($e) => trim($e))->filter()->values()->all(),
            'version' => $version,
        ]));
        TaxonomyChange::create(['industry_id' => $industry->id, 'changed_by' => $request->user()->name, 'change_type' => 'Updated', 'details' => 'Updated '.implode(', ', array_keys($industry->getChanges() ?: ['record'])), 'version' => $version]);

        return back()->with('success', "{$industry->name} updated to version {$version}.");
    }

    public function storeSubIndustry(Request $request, Industry $industry): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:300'],
            'complexity_bands' => ['required', 'string', 'max:20'],
        ]);
        $code = $industry->short_code.str_pad((string) ($industry->subIndustries()->count() + 1), 2, '0', STR_PAD_LEFT);
        while (SubIndustry::where('code', $code)->exists()) {
            $code = $industry->short_code.str_pad((string) ((int) substr($code, 3) + 1), 2, '0', STR_PAD_LEFT);
        }
        $industry->subIndustries()->create(array_merge($data, ['code' => $code, 'status' => 'active', 'sort' => $industry->subIndustries()->count()]));
        $parts = explode('.', $industry->version);
        $version = ((int) $parts[0] + 1).'.0';
        $industry->update(['version' => $version]);
        TaxonomyChange::create(['industry_id' => $industry->id, 'changed_by' => $request->user()->name, 'change_type' => 'Added', 'details' => "Added sub-industry {$code}", 'version' => $version]);

        return back()->with('success', "Sub-industry {$code} {$data['name']} added.");
    }

    public function exportTaxonomy()
    {
        $rows = [];
        foreach (Industry::with('subIndustries')->orderBy('number')->get() as $i) {
            foreach ($i->subIndustries as $s) {
                $rows[] = ['industry_id' => $i->code, 'industry' => $i->name, 'slug' => $i->slug, 'sub_code' => $s->code, 'sub_industry' => $s->name, 'complexity_bands' => $s->complexity_bands, 'status' => $s->status];
            }
        }

        return Documents::csv('tbca-industry-taxonomy.csv', $rows);
    }

    /* --- Sprint classification ---------------------------------------- */

    public function classification(Request $request): Response
    {
        $state = $request->query('state');
        $q = $request->query('q');
        $skus = Sku::with('industry')->when($state, fn ($b) => $b->where('classification_state', $state))
            ->when($q, fn ($b) => $b->where(fn ($w) => $w->where('code', 'like', "%{$q}%")->orWhere('title', 'like', "%{$q}%")))->orderBy('code')->get();
        $all = Sku::all();

        return Inertia::render('Insights/Industries/Admin/Classification', [
            'filters' => ['state' => $state, 'q' => $q],
            'states' => self::CLASSIFICATION_STATES,
            'counts' => collect(self::CLASSIFICATION_STATES)->mapWithKeys(fn ($s) => [$s => $all->where('classification_state', $s)->count()]),
            'rows' => $skus->map(fn (Sku $s) => [
                'id' => $s->id, 'code' => $s->code, 'title' => $s->title, 'industryId' => $s->industry_id ? (string) $s->industry_id : '', 'industry' => $s->industry?->name,
                'subIndustry' => $s->sub_industry, 'state' => $s->classification_state, 'method' => $s->classification_method, 'confidence' => $s->ai_confidence,
                'complexityClass' => $s->complexityClass(),
                'band' => $s->ai_confidence === null ? null : ($s->ai_confidence >= 0.97 ? 'High' : ($s->ai_confidence >= 0.9 ? 'Intermediate' : 'Low')),
                'safety' => in_array($s->complexityClass(), ['C2', 'C3', 'C4'], true),
            ])->values(),
            'industries' => $this->industryOptions(),
        ]);
    }

    public function classify(Request $request, Sku $sku): RedirectResponse
    {
        $data = $request->validate([
            'industry_id' => ['nullable', 'exists:ins_industries,id', 'required_if:state,APPROVED,RECLASSIFICATION_REQUIRED'],
            'state' => ['required', 'in:'.implode(',', self::CLASSIFICATION_STATES)],
            'sub_industry' => ['nullable', 'string', 'max:120'],
        ]);
        // Blueprint 3.5: safety cohort (regulated/high complexity) always requires human confirmation; AI may not approve.
        $from = $sku->classification_state;
        $sku->update([
            'industry_id' => $data['industry_id'] ?? $sku->industry_id,
            'sub_industry' => $data['sub_industry'] ?? $sku->sub_industry,
            'classification_state' => $data['state'],
            'classification_method' => in_array($data['state'], ['APPROVED', 'APPROVED_AGNOSTIC'], true) ? ($from === 'AI_CANDIDATE' ? 'HUMAN_CONFIRMED' : 'HUMAN_CLASSIFIED') : $sku->classification_method,
        ]);
        Audit::log($sku, 'classified', $from, $data['state']);

        return back()->with('success', "{$sku->code} set to ".str_replace('_', ' ', $data['state']).'.');
    }

    /* --- Complexity & margin ----------------------------------------- */

    public function margin(Request $request): Response
    {
        $f = $request->only(['q', 'industry', 'class', 'status']);
        $all = Sku::with('industry')->whereNotNull('base_cost_zar')->orderBy('code')->get();
        $rows = $all->map->costRow()
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(Str::lower($r['code'].' '.$r['title']), Str::lower($q))))
            ->when($f['industry'] ?? null, fn ($c, $i) => $c->where('industry', $i))
            ->when($f['class'] ?? null, fn ($c, $cl) => $c->where('complexityClass', $cl))
            ->when($f['status'] ?? null, fn ($c, $s) => $c->where('marginStatus', $s))
            ->values();
        $statuses = $all->map->marginStatus();
        $margins = $all->map->marginPct()->filter(fn ($m) => $m !== null);

        return Inertia::render('Insights/Industries/Admin/Margin', [
            'filters' => $f,
            'rows' => $rows,
            'kpis' => [
                'total' => $all->count(), 'withComplexity' => $all->filter(fn ($s) => ! empty($s->drivers))->count(),
                'below' => $statuses->filter(fn ($s) => $s === 'below_floor')->count(), 'at' => $statuses->filter(fn ($s) => $s === 'at_floor')->count(),
                'above' => $statuses->filter(fn ($s) => $s === 'above_floor')->count(), 'avgMargin' => $margins->count() ? round($margins->avg(), 1) : 0,
            ],
            'industries' => $all->pluck('industry.name')->filter()->unique()->values(),
            'drivers' => Sku::DRIVERS,
            'classes' => collect(Industry::COMPLEXITY)->map(fn ($c, $k) => ['class' => $k, 'label' => $c['label'], 'modifier' => $c['modifier']])->values(),
            'floorMargin' => Sku::FLOOR_MARGIN * 100,
            'marginTarget' => Sku::MARGIN_TARGET * 100,
        ]);
    }

    public function updateDrivers(Request $request, Sku $sku): RedirectResponse
    {
        $rules = ['base_cost_zar' => ['required', 'integer', 'min:0'], 'guidance_price_zar' => ['required', 'integer', 'min:0']];
        foreach (Sku::DRIVERS as $k => $d) {
            $rules["drivers.{$k}"] = ['required', 'integer', 'between:0,'.$d['max']];
        }
        $data = $request->validate($rules);
        $from = $sku->complexityClass();
        $sku->update(['drivers' => array_merge($sku->drivers ?? [], $data['drivers']), 'base_cost_zar' => $data['base_cost_zar'], 'guidance_price_zar' => $data['guidance_price_zar']]);
        Audit::log($sku, 'complexity_updated', $from, $sku->complexityClass());

        return back()->with('success', "{$sku->code} recalculated: {$sku->complexityClass()} · floor R".number_format((int) $sku->floorPrice()).' · '.str_replace('_', ' ', $sku->marginStatus()).'.');
    }

    /** Lift guidance prices of below-floor Sprints to their floor (selected ids, or all). */
    public function applyFloor(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['nullable', 'array'], 'ids.*' => ['integer']])['ids'] ?? null;
        $count = 0;
        Sku::whereNotNull('base_cost_zar')->when($ids, fn ($q) => $q->whereIn('id', $ids))->get()->each(function (Sku $s) use (&$count) {
            if ($s->marginStatus() === 'below_floor') {
                $s->update(['guidance_price_zar' => $s->floorPrice()]);
                $count++;
            }
        });

        return back()->with('success', $count ? "{$count} Sprint(s) lifted to floor price." : 'All selected Sprints are at or above floor.');
    }

    public function exportMargin()
    {
        return Documents::csv('tbca-complexity-margin.csv', Sku::with('industry')->whereNotNull('base_cost_zar')->get()->map(fn ($s) => collect($s->costRow())->except(['drivers', 'id'])->merge($s->costRow()['drivers'])->all())->values()->all());
    }

    /* --- Blocked SKU register ----------------------------------------- */

    public function blocked(Request $request): Response
    {
        $f = $request->only(['q', 'type', 'status', 'industry']);
        $base = Sku::with('industry')->whereIn('sale_state', ['blocked', 'restricted']);
        $all = (clone $base)->get();
        $rows = $base->when($f['q'] ?? null, fn ($b, $q) => $b->where(fn ($w) => $w->where('code', 'like', "%{$q}%")->orWhere('title', 'like', "%{$q}%")->orWhere('block_reason', 'like', "%{$q}%")))
            ->when($f['type'] ?? null, fn ($b, $t) => $b->where('sale_state', $t))
            ->when($f['status'] ?? null, fn ($b, $s) => $b->where('block_status', $s))
            ->when($f['industry'] ?? null, fn ($b, $i) => $b->where('industry_id', $i))
            ->orderByDesc('blocked_on')->get();

        return Inertia::render('Insights/Industries/Admin/Blocked', [
            'filters' => $f,
            'rows' => $rows->map(fn (Sku $s) => [
                'id' => $s->id, 'code' => $s->code, 'title' => $s->title, 'industry' => $s->industry_label ?? $s->industry?->name, 'subIndustry' => $s->sub_industry,
                'type' => $s->sale_state, 'reason' => $s->block_reason, 'message' => $s->client_message, 'status' => $s->block_status,
                'blockedOn' => $s->blocked_on?->format('d M Y'), 'reviewBy' => $s->review_by?->format('d M Y'),
            ])->values(),
            'kpis' => [
                'total' => $all->where('block_status', '!=', 'released')->count(),
                'hidden' => $all->where('sale_state', 'blocked')->where('block_status', '!=', 'released')->count(),
                'restricted' => $all->where('sale_state', 'restricted')->where('block_status', '!=', 'released')->count(),
                'review' => $all->where('block_status', 'under_review')->count(),
                'released' => $all->where('block_status', 'released')->filter(fn ($s) => $s->released_at?->gt(now()->subDays(30)))->count(),
                'catalogue' => Sku::count(),
            ],
            'reasons' => $all->groupBy('block_reason')->map->count()->sortDesc()->take(6),
            'industries' => $this->industryOptions(),
            'candidates' => Sku::where('sale_state', 'sellable')->orderBy('code')->get(['id', 'code', 'title'])->map(fn ($s) => ['value' => (string) $s->id, 'label' => "{$s->code} – {$s->title}"]),
        ]);
    }

    public function block(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sku_id' => ['required', 'exists:ins_skus,id'],
            'sale_state' => ['required', 'in:blocked,restricted'],
            'block_reason' => ['required', 'string', 'max:190'],
            'client_message' => ['required', 'string', 'max:190'],
            'review_by' => ['nullable', 'date', 'after_or_equal:today'],
        ]);
        $sku = Sku::findOrFail($data['sku_id']);
        $sku->update([
            'sale_state' => $data['sale_state'], 'block_reason' => $data['block_reason'], 'client_message' => $data['client_message'],
            'review_by' => $data['review_by'] ?? null, 'block_status' => 'active', 'blocked_on' => today(), 'released_at' => null,
            'block_code' => $sku->block_code ?? 'IN-BLOCK-'.str_pad((string) $sku->id, 3, '0', STR_PAD_LEFT),
        ]);
        Audit::log($sku, 'blocked', 'sellable', $data['sale_state'], $data['block_reason']);

        return back()->with('success', "{$sku->code} is now {$data['sale_state']}. Clients see the approved message and alternatives.");
    }

    public function updateBlock(Request $request, Sku $sku): RedirectResponse
    {
        $action = $request->validate(['action' => ['required', 'in:review,activate,release']])['action'];
        $from = $sku->block_status;
        match ($action) {
            'review' => $sku->update(['block_status' => 'under_review', 'review_by' => today()->addDays(7)]),
            'activate' => $sku->update(['block_status' => 'active']),
            'release' => $sku->update(['block_status' => 'released', 'released_at' => now(), 'sale_state' => 'sellable']),
        };
        Audit::log($sku, "block_{$action}", $from, $sku->block_status);

        return back()->with('success', "{$sku->code}: ".['review' => 'moved to review', 'activate' => 'block re-activated', 'release' => 'released to sale'][$action].'.');
    }

    /* --- Regulators ---------------------------------------------------- */

    public function regulators(Request $request): Response
    {
        $f = $request->only(['q', 'type', 'opinion', 'allows']);
        $rows = Regulator::query()
            ->when($f['q'] ?? null, fn ($b, $q) => $b->where(fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('acronym', 'like', "%{$q}%")->orWhere('sectors', 'like', "%{$q}%")))
            ->when($f['type'] ?? null, fn ($b, $t) => $b->where('type', $t))
            ->when($f['opinion'] ?? null, fn ($b, $o) => $b->where('opinion_status', $o))
            ->when($f['allows'] ?? null, fn ($b, $a) => $b->where('allows_sprints', $a))
            ->orderByDesc('updated_at')->get();
        $all = Regulator::all();

        return Inertia::render('Insights/Industries/Admin/Regulators', [
            'filters' => $f,
            'rows' => $rows->map(fn ($r) => array_merge($r->only(['id', 'name', 'acronym', 'type', 'sectors', 'jurisdiction', 'permissions', 'renewal', 'status']), ['opinionStatus' => $r->opinion_status, 'allowsSprints' => $r->allows_sprints, 'updated' => $r->updated_at->format('d M Y')]))->values(),
            'kpis' => ['total' => $all->count(), 'active' => $all->where('status', 'active')->count(), 'permissions' => $all->filter(fn ($r) => str_contains($r->permissions, 'Permission'))->count(), 'review' => $all->where('opinion_status', 'under_review')->count(), 'archived' => $all->where('status', 'archived')->count()],
            'bySector' => $all->groupBy(fn ($r) => explode(',', $r->sectors)[0])->map->count()->sortDesc(),
            'opinions' => collect(['active', 'under_review', 'conditional', 'expired', 'none'])->mapWithKeys(fn ($s) => [$s => $all->where('opinion_status', $s)->count()]),
            'types' => $all->pluck('type')->unique()->values(),
        ]);
    }

    private function regulatorRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:190'], 'acronym' => ['required', 'string', 'max:20'], 'type' => ['required', 'string', 'max:60'],
            'sectors' => ['required', 'string', 'max:190'], 'jurisdiction' => ['required', 'string', 'max:60'], 'permissions' => ['required', 'string', 'max:120'],
            'opinion_status' => ['required', 'in:active,under_review,conditional,expired,none'], 'renewal' => ['nullable', 'string', 'max:40'],
            'allows_sprints' => ['required', 'in:yes,no,conditional'], 'status' => ['required', 'in:active,archived'],
        ];
    }

    public function storeRegulator(Request $request): RedirectResponse
    {
        $r = Regulator::create($request->validate($this->regulatorRules()));

        return back()->with('success', "{$r->acronym} added to the regulator register.");
    }

    public function updateRegulator(Request $request, Regulator $regulator): RedirectResponse
    {
        $regulator->update($request->validate($this->regulatorRules()));

        return back()->with('success', "{$regulator->acronym} updated.");
    }

    public function exportRegulators()
    {
        return Documents::csv('tbca-sector-regulators.csv', Regulator::all()->map(fn ($r) => $r->only(['name', 'acronym', 'type', 'sectors', 'jurisdiction', 'permissions', 'opinion_status', 'renewal', 'allows_sprints', 'status']))->all());
    }

    /* --- Misdeclaration queue ----------------------------------------- */

    public function misdeclarations(Request $request): Response
    {
        $f = $request->only(['q', 'priority', 'status', 'assigned']);
        $rows = Misdeclaration::query()
            ->when($f['q'] ?? null, fn ($b, $q) => $b->where(fn ($w) => $w->where('case_id', 'like', "%{$q}%")->orWhere('sku_code', 'like', "%{$q}%")->orWhere('client', 'like', "%{$q}%")->orWhere('sprint_title', 'like', "%{$q}%")))
            ->when($f['priority'] ?? null, fn ($b, $p) => $b->where('priority', $p))
            ->when($f['status'] ?? null, fn ($b, $s) => $b->where('status', $s), fn ($b) => $b->whereNotIn('status', ['reclassified', 'dismissed']))
            ->when($f['assigned'] ?? null, fn ($b, $a) => $b->where('assigned_to', $a))
            ->orderBy('due_on')->get();
        $open = Misdeclaration::whereNotIn('status', ['reclassified', 'dismissed'])->get();

        return Inertia::render('Insights/Industries/Admin/Misdeclarations', [
            'filters' => $f,
            'states' => self::MISDECLARATION_STATES,
            'rows' => $rows->map(fn ($m) => [
                'id' => $m->id, 'caseId' => $m->case_id, 'sku' => $m->sku_code, 'title' => $m->sprint_title, 'client' => $m->client,
                'suspected' => $m->suspected_industry, 'declared' => $m->declared_industry, 'priority' => $m->priority, 'status' => $m->status,
                'assigned' => $m->assigned_to, 'due' => $m->due_on?->format('d M Y'), 'days' => $m->due_on ? (int) today()->diffInDays($m->due_on, false) : null,
            ])->values(),
            'kpis' => [
                'total' => $open->count(), 'high' => $open->where('priority', 'high')->count(), 'medium' => $open->where('priority', 'medium')->count(), 'low' => $open->where('priority', 'low')->count(),
                'resolved' => Misdeclaration::whereIn('status', ['reclassified', 'dismissed'])->where('resolved_at', '>=', now()->subDays(30))->count(),
                'dueToday' => $open->filter(fn ($m) => $m->due_on?->isToday())->count(), 'overdue' => $open->filter(fn ($m) => $m->due_on?->isPast() && ! $m->due_on->isToday())->count(),
            ],
            'mismatches' => $open->groupBy(fn ($m) => "{$m->declared_industry} → {$m->suspected_industry}")->map->count()->sortDesc()->take(5),
            'reviewers' => ['P. Naidoo', 'S. Mthembu', 'L. Mokoena', 'T. Dlamini', 'N. Dube', 'R. Isaacs'],
            'industries' => Industry::orderBy('number')->pluck('name'),
        ]);
    }

    public function storeMisdeclaration(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sku_code' => ['required', 'exists:ins_skus,code'], 'client' => ['required', 'string', 'max:190'],
            'suspected_industry' => ['required', 'string', 'max:120'], 'declared_industry' => ['required', 'string', 'max:120'],
            'priority' => ['required', 'in:high,medium,low'],
        ]);
        $seq = (int) Misdeclaration::max('id') + 188;
        $m = Misdeclaration::create(array_merge($data, [
            'case_id' => sprintf('MDV-%d-%04d', now()->year, $seq), 'sprint_title' => Sku::where('code', $data['sku_code'])->value('title'),
            'status' => 'new', 'due_on' => today()->addDays(['high' => 2, 'medium' => 5, 'low' => 10][$data['priority']]),
        ]));

        return back()->with('success', "Case {$m->case_id} added to the verification queue.");
    }

    public function updateMisdeclaration(Request $request, Misdeclaration $misdeclaration): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:'.implode(',', self::MISDECLARATION_STATES)],
            'assigned_to' => ['nullable', 'string', 'max:60'],
            'resolution' => ['nullable', 'string', 'max:190'],
        ]);
        $from = $misdeclaration->status;
        $resolved = in_array($data['status'], ['reclassified', 'dismissed'], true);
        $misdeclaration->update(array_merge($data, [
            'assigned_to' => $data['assigned_to'] ?? $misdeclaration->assigned_to,
            'resolved_at' => $resolved ? now() : null,
            'resolution' => $data['resolution'] ?? ($data['status'] === 'reclassified' ? "Reclassified to {$misdeclaration->suspected_industry}" : $misdeclaration->resolution),
        ]));

        // Harm-first: verify evidence, then reclassify the Sprint and apply correct controls.
        if ($data['status'] === 'reclassified') {
            $industry = Industry::where('name', $misdeclaration->suspected_industry)->first();
            Sku::where('code', $misdeclaration->sku_code)->update(array_filter(['industry_id' => $industry?->id, 'industry_label' => $misdeclaration->suspected_industry, 'classification_state' => 'APPROVED', 'classification_method' => 'RECLASSIFIED']));
        }
        Audit::log($misdeclaration, 'status_changed', $from, $data['status']);

        return back()->with('success', "{$misdeclaration->case_id} updated to ".str_replace('_', ' ', $data['status']).'.');
    }

    /* --- Benchmark governance ----------------------------------------- */

    public function benchmarks(Request $request): Response
    {
        $f = $request->only(['q', 'status', 'type']);
        $all = Benchmark::orderBy('sector')->get();
        $rows = $all->map->toRow()
            ->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(Str::lower($r['sector'].' '.$r['name']), Str::lower($q))))
            ->when($f['status'] ?? null, fn ($c, $s) => $c->where('status', $s))
            ->when($f['type'] ?? null, fn ($c, $t) => $c->where('type', $t))->values();
        $total = max(1, $all->count());

        return Inertia::render('Insights/Industries/Admin/Benchmarks', [
            'filters' => $f,
            'rows' => $rows,
            'kpis' => [
                'configured' => $all->count(), 'sectors' => $all->pluck('sector')->unique()->count(),
                'eligible' => $all->filter->isPublishable()->count(), 'below' => $all->filter(fn ($b) => $b->publicationStatus() === 'below_threshold')->count(),
                'suppressed' => $all->where('suppressed', true)->count(), 'review' => $all->where('under_review', true)->count(),
            ],
            'compliance' => [
                ['label' => 'n ≥ (Min Contributors)', 'pass' => $all->filter->nPass()->count(), 'total' => $all->count()],
                ['label' => 'k-Anonymity (≥ k)', 'pass' => $all->filter->kPass()->count(), 'total' => $all->count()],
                ['label' => 'Diversity Index (≥ %)', 'pass' => $all->filter->diversityPass()->count(), 'total' => $all->count()],
                ['label' => 'Suppression Rules Met', 'pass' => $all->where('suppressed', false)->count(), 'total' => $all->count()],
            ],
            'diversity' => [
                ['label' => '≥ 80%', 'count' => $all->where('diversity_current', '>=', 80)->count()],
                ['label' => '60% – 79%', 'count' => $all->whereBetween('diversity_current', [60, 79])->count()],
                ['label' => '40% – 59%', 'count' => $all->whereBetween('diversity_current', [40, 59])->count()],
                ['label' => '< 40%', 'count' => $all->where('diversity_current', '<', 40)->count()],
            ],
            'suppressions' => $all->where('suppressed', true)->values()->map(fn ($b) => ['label' => "{$b->sector} – {$b->name}", 'reason' => $b->suppression_reason, 'date' => $b->updated_at->format('d M Y')]),
            'types' => $all->pluck('type')->unique()->values(),
            'industries' => $this->industryOptions(),
            'share' => round($all->filter->isPublishable()->count() / $total * 100, 1),
        ]);
    }

    public function storeBenchmark(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'sector' => ['required', 'string', 'max:60'], 'name' => ['required', 'string', 'max:120'], 'type' => ['required', 'string', 'max:60'],
            'min_n' => ['required', 'integer', 'min:30', 'max:500'], 'min_k' => ['required', 'integer', 'min:5', 'max:50'], 'min_diversity' => ['required', 'integer', 'between:0,100'],
            'industry_id' => ['nullable', 'exists:ins_industries,id'],
        ], ['min_n.min' => 'Blueprint B0: fewer than 30 independent entities never publishes a numeric benchmark.']);
        $b = Benchmark::updateOrCreate(['sector' => $data['sector'], 'name' => $data['name']], array_merge($data, ['suppression_rule' => "No cell < {$data['min_k']}; No client > 20%", 'last_review' => today(), 'next_review' => today()->addMonths(6)]));

        return back()->with('success', "Rule saved for {$b->sector} – {$b->name}: ".str_replace('_', ' ', $b->publicationStatus()).'.');
    }

    public function updateBenchmark(Request $request, Benchmark $benchmark): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', 'in:suppress,unsuppress,review,clear_review,thresholds'],
            'reason' => ['required_if:action,suppress', 'nullable', 'string', 'max:190'],
            'min_n' => ['required_if:action,thresholds', 'nullable', 'integer', 'min:30'],
            'min_k' => ['required_if:action,thresholds', 'nullable', 'integer', 'min:5'],
            'min_diversity' => ['required_if:action,thresholds', 'nullable', 'integer', 'between:0,100'],
        ]);
        $from = $benchmark->publicationStatus();
        match ($data['action']) {
            'suppress' => $benchmark->update(['suppressed' => true, 'suppression_reason' => $data['reason']]),
            'unsuppress' => $benchmark->update(['suppressed' => false, 'suppression_reason' => null]),
            'review' => $benchmark->update(['under_review' => true]),
            'clear_review' => $benchmark->update(['under_review' => false, 'last_review' => today(), 'next_review' => today()->addMonths(6)]),
            'thresholds' => $benchmark->update(['min_n' => $data['min_n'], 'min_k' => $data['min_k'], 'min_diversity' => $data['min_diversity']]),
        };
        Audit::log($benchmark, $data['action'], $from, $benchmark->publicationStatus());

        return back()->with('success', "{$benchmark->sector} – {$benchmark->name} is now ".str_replace('_', ' ', $benchmark->publicationStatus()).'.');
    }

    /* --- Activation pipeline ------------------------------------------ */

    public function activation(): Response
    {
        $industries = Industry::orderByDesc('activation_stage')->orderByDesc('activation_score')->get();
        $count = max(1, $industries->count());
        $groups = [[0, 0, 'S0', 'Intake'], [1, 1, 'S1', 'Scoping'], [2, 2, 'S2', 'Classification'], [3, 3, 'S3', 'Controls'], [4, 4, 'S4', 'Content & Cost'], [5, 5, 'S5', 'Review & Approvals'], [6, 6, 'S6', 'UAT & Quality'], [7, 8, 'S7–S8', 'Live & Optimising']];

        return Inertia::render('Insights/Industries/Admin/Activation', [
            'kpis' => [
                'total' => $industries->count(), 'live' => $industries->where('activation_stage', '>=', 7)->count(),
                'progress' => $industries->whereBetween('activation_stage', [2, 6])->count(), 'notStarted' => $industries->where('activation_stage', '<=', 1)->count(),
                'avgScore' => (int) round($industries->avg('activation_score')),
            ],
            'pipeline' => collect($groups)->map(fn ($g) => ['stage' => $g[2], 'label' => $g[3], 'count' => $n = $industries->whereBetween('activation_stage', [$g[0], $g[1]])->count(), 'pct' => round($n / $count * 100, 1)])->values(),
            'rows' => $industries->map(fn ($i) => [
                'id' => $i->id, 'slug' => $i->slug, 'name' => $i->name, 'stage' => 'S'.$i->activation_stage, 'stageLabel' => $i->stageLabel(), 'score' => $i->activation_score,
                'sprintsTotal' => $i->sprints_total, 'sprintsActivated' => $i->sprints_activated, 'activatedPct' => $i->sprints_total ? round($i->sprints_activated / $i->sprints_total * 100) : 0,
                'risks' => $i->key_risks, 'target' => $i->target_live_date?->format('d M Y'), 'owner' => $i->owner ?? 'Unassigned', 'mode' => $i->operating_mode,
            ])->values(),
            'sprints' => ['activated' => (int) $industries->sum('sprints_activated'), 'total' => (int) $industries->sum('sprints_total')],
            'trend' => [['m' => 'Nov 2025', 'v' => 41], ['m' => 'Dec 2025', 'v' => 46], ['m' => 'Jan 2026', 'v' => 52], ['m' => 'Feb 2026', 'v' => 58], ['m' => 'Mar 2026', 'v' => 63], ['m' => 'Apr 2026', 'v' => 67], ['m' => now()->format('M Y'), 'v' => (int) round($industries->avg('activation_score'))]],
            'milestones' => \App\Models\Insights\AuditLog::where('subject_type', 'Industry')->where('action', 'stage_advanced')->latest()->limit(5)->get()->map(fn ($l) => "{$l->note} – ".$l->created_at->format('d M Y')),
        ]);
    }

    public function advance(Request $request, Industry $industry): RedirectResponse
    {
        $direction = $request->validate(['direction' => ['nullable', 'in:up,down']])['direction'] ?? 'up';
        $from = $industry->activation_stage;
        $to = $direction === 'up' ? min(8, $from + 1) : max(0, $from - 1);
        // Blueprint 10.2: go-live (S7) requires a released catalogue; below-threshold industries stop at S6.
        if ($to >= 7 && $industry->catalogue_state === 'below_threshold') {
            return back()->with('error', "{$industry->name} cannot go live: the full-service threshold is not yet met.");
        }
        $industry->update([
            'activation_stage' => $to,
            'activation_score' => min(100, max(0, $industry->activation_score + ($to - $from) * 9)),
            'operating_mode' => $to >= 7 ? ($industry->catalogue_state === 'deep' ? 'FULL_SERVICE' : 'CONDITIONAL_FULL_SERVICE') : ($to >= 3 ? 'BUILD' : $industry->operating_mode),
        ]);
        Audit::log($industry, 'stage_advanced', "S{$from}", "S{$to}", "{$industry->name} moved to S{$to}");

        return back()->with('success', "{$industry->name} moved to {$industry->stageLabel()}.");
    }

    /* --- WhatsApp flows ------------------------------------------------ */

    public function whatsapp(Request $request): Response
    {
        $f = $request->only(['q', 'type', 'status']);
        $all = WhatsAppFlow::where('area', 'industries')->orderBy('code')->get();
        $rows = $all->when($f['q'] ?? null, fn ($c, $q) => $c->filter(fn ($r) => str_contains(Str::lower($r->name.' '.$r->intent), Str::lower($q))))
            ->when($f['type'] ?? null, fn ($c, $t) => $c->where('message_type', $t))
            ->when($f['status'] ?? null, fn ($c, $s) => $c->where('status', $s));

        return Inertia::render('Insights/Industries/Admin/WhatsApp', [
            'filters' => $f,
            'rows' => $rows->values()->map(fn ($r) => ['id' => $r->id, 'code' => $r->code, 'name' => $r->name, 'intent' => $r->intent, 'industries' => $r->industries, 'stages' => $r->stages, 'type' => $r->message_type, 'status' => $r->status, 'language' => $r->language, 'updated' => $r->updated_at->format('d M Y'), 'usage' => $r->usage_30d]),
            'kpis' => ['total' => $all->count(), 'active' => $all->where('status', 'active')->count(), 'messages' => (int) $all->sum('usage_30d'), 'paused' => $all->where('status', 'paused')->count(), 'inactive' => $all->where('status', 'inactive')->count()],
            'intents' => $all->groupBy('message_type')->map->count(),
            'range' => ['first' => $all->first()?->code, 'last' => $all->last()?->code],
        ]);
    }

    public function storeFlow(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'], 'intent' => ['required', 'string', 'max:60'],
            'stages' => ['required', 'string', 'max:20'], 'message_type' => ['required', 'in:Informational,Reminder,Alert,Support'],
            'industries' => ['required', 'string', 'max:40'], 'acknowledge' => ['accepted'],
        ], ['acknowledge.accepted' => 'Confirm the flow provides support and notifications only — no advice, opinions or gated outputs.']);
        $n = WhatsAppFlow::where('area', 'industries')->count() + 1;
        $code = sprintf('WA-IN-%03d', $n);
        while (WhatsAppFlow::where('code', $code)->exists()) {
            $code = sprintf('WA-IN-%03d', ++$n);
        }
        unset($data['acknowledge']);
        WhatsAppFlow::create(array_merge($data, ['area' => 'industries', 'code' => $code, 'status' => 'active', 'language' => 'EN']));

        return back()->with('success', "Flow {$code} created.");
    }

    public function updateFlow(Request $request, WhatsAppFlow $flow): RedirectResponse
    {
        $flow->update($request->validate(['status' => ['required', 'in:active,paused,inactive']]));

        return back()->with('success', "{$flow->code} is now {$flow->status}.");
    }
}
