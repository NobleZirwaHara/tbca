<?php

namespace App\Http\Controllers\Deliverables;

use App\Http\Controllers\Controller;
use App\Models\Deliverables\CountryMatrixEntry;
use App\Models\Deliverables\Deliverable;
use App\Models\Deliverables\DeliverableSprint;
use App\Models\Deliverables\IntegrationSpec;
use App\Models\Deliverables\PaymentLoop;
use App\Models\Deliverables\Safeguard;
use App\Models\Deliverables\Standard;
use App\Models\Sprint;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * /admin/deliverables: the client's Registry of Deliverables (MP-DEL-2.0) for staff.
 * Register search and filters, a deliverable detail view (trigger, workflow,
 * safeguards, consultancy benchmark), Sprint crosswalk coverage, safeguards and
 * payment-trigger loops, design standards, the country matrix and CSV export.
 */
class AdminController extends Controller
{
    private const PER_PAGE = 25;

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);

        $page = $this->query($filters)
            ->orderBy('sort')
            ->paginate(self::PER_PAGE, ['id', 'ref', 'tab', 'family', 'name', 'format_class', 'format_detail', 'loop_id', 'v2_status', 'pages_basic', 'pages_standard', 'pages_premium', 'page_unit', 'delivery_basic', 'delivery_standard', 'delivery_premium'])
            ->withQueryString()
            ->through(fn (Deliverable $d) => [
                'ref' => $d->ref,
                'tab' => $d->tab,
                'family' => $d->family,
                'name' => $d->name,
                'format' => $d->format_class,
                'formatDetail' => $d->format_detail,
                'loopId' => $d->loop_id,
                'isNew' => str_starts_with((string) $d->v2_status, 'NEW'),
                'pages' => $d->getAttribute("pages_{$filters['tier']}"),
                'pageUnit' => $d->page_unit,
                'delivery' => $d->getAttribute("delivery_{$filters['tier']}"),
            ]);

        $total = Deliverable::count();
        $new = Deliverable::where('v2_status', 'like', 'NEW%')->count();

        return Inertia::render('Admin/Deliverables/Index', [
            'filters' => $filters,
            'results' => $page,
            'options' => [
                'tabs' => Deliverable::query()->selectRaw('tab as value, count(*) as n')->groupBy('tab')->orderByRaw('min(sort)')->get(),
                'families' => $filters['tab']
                    ? Deliverable::query()->where('tab', $filters['tab'])->selectRaw('family as value, count(*) as n')->groupBy('family')->orderByRaw('min(sort)')->get()
                    : [],
                'formats' => Deliverable::query()->selectRaw('format_class as value, count(*) as n')->groupBy('format_class')->orderByDesc('n')->get(),
                'loops' => Deliverable::query()->whereNotNull('loop_id')->selectRaw('loop_id as value, count(*) as n')->groupBy('loop_id')->orderBy('loop_id')->get(),
            ],
            'stats' => [
                'deliverables' => $total,
                'retained' => $total - $new,
                'new' => $new,
                'crosswalk' => DeliverableSprint::count(),
                'matched' => DeliverableSprint::where('match', '!=', 'unmatched')->count(),
                'safeguards' => Safeguard::count(),
                'loops' => PaymentLoop::count(),
            ],
            'control' => $this->control(),
        ]);
    }

    public function show(string $ref): Response
    {
        $d = Deliverable::query()->where('ref', $ref)->firstOrFail();
        Deliverable::withTexts([$d]);

        $codes = $d->safeguardCodes();
        $safeguards = Safeguard::query()->whereIn('code', $codes)->orderBy('code')->get(['code', 'name', 'rule', 'oss_stage', 'loop_control']);
        $loop = $d->loop_id ? PaymentLoop::query()->where('loop_id', $d->loop_id)->first(['loop_id', 'family', 'task', 'owning_blueprint', 'sprints']) : null;
        $format = $d->format_code ? Standard::query()->where('section', 'format')->where('code', $d->format_code)->first() : null;

        $sprints = $d->crosswalk()->with('sprint:id,slug,title,status')->orderBy('sprint_code')->get()->map(fn (DeliverableSprint $c) => [
            'code' => $c->sprint_code,
            'name' => $c->sprint_name,
            'batch' => $c->batch,
            'population' => $c->population,
            'status' => $c->status,
            'match' => $c->match,
            'href' => $c->sprint && $c->sprint->status === 'published' ? "/sprints/{$c->sprint->slug}" : null,
        ]);

        return Inertia::render('Admin/Deliverables/Show', [
            'register' => $d->register(),
            'derived' => [
                'format_code' => $d->format_code,
                'loop_id' => $d->loop_id,
                'automation_family' => $d->automation_family,
                'owner_blueprint' => $d->owner_blueprint,
                'trigger' => $d->trigger(),
                'workflow' => $d->workflowSteps(),
                'safeguard_codes' => $codes,
                'tiers' => collect(Deliverable::TIERS)->map(fn ($t) => $d->tier($t))->all(),
                'market_median' => preg_match('/market median ([^·]+)/u', (string) $d->text('catalogue_price'), $m) ? trim($m[1]) : null,
            ],
            'columns' => Deliverable::COLUMNS,
            'safeguards' => $safeguards,
            'missingSafeguards' => array_values(array_diff($codes, $safeguards->pluck('code')->all())),
            'loop' => $loop,
            'formatStandard' => $format ? [
                'code' => $format->code, 'format' => $format->parameter, 'basic' => $format->basic, 'standard' => $format->standard,
                'premium' => $format->premium, 'unit' => $format->unit, 'consultingStandard' => $format->basis,
            ] : null,
            'sprints' => $sprints,
        ]);
    }

    public function crosswalk(Request $request): Response
    {
        $match = in_array($request->query('match'), ['code', 'register_id', 'unmatched'], true) ? $request->query('match') : null;
        $q = trim((string) $request->query('q', ''));

        $rows = DeliverableSprint::query()
            ->with('deliverable:id,ref,name,tab', 'sprint:id,slug,title,status')
            ->when($match, fn ($w) => $w->where('match', $match))
            ->when($q !== '', fn ($w) => $w->where(fn ($x) => $x->whereLike('sprint_code', "%{$q}%")->orWhereLike('sprint_name', "%{$q}%")->orWhereLike('deliverable_ref', "%{$q}%")))
            ->orderBy('id')
            ->paginate(50)
            ->withQueryString()
            ->through(fn (DeliverableSprint $c) => [
                'code' => $c->sprint_code,
                'name' => $c->sprint_name,
                'batch' => $c->batch,
                'population' => $c->population,
                'ref' => $c->deliverable_ref,
                'deliverable' => $c->deliverable?->name,
                'status' => $c->status,
                'match' => $c->match,
                'href' => $c->sprint && $c->sprint->status === 'published' ? "/sprints/{$c->sprint->slug}" : null,
            ]);

        $byPopulation = DeliverableSprint::query()
            ->select('population', 'match')->selectRaw('count(*) as n')->groupBy('population', 'match')->get()
            ->groupBy('population')
            ->map(fn ($g, $population) => [
                'population' => $population,
                'code' => (int) ($g->firstWhere('match', 'code')->n ?? 0),
                'register_id' => (int) ($g->firstWhere('match', 'register_id')->n ?? 0),
                'unmatched' => (int) ($g->firstWhere('match', 'unmatched')->n ?? 0),
            ])->values();

        $withoutDeliverable = $this->sprintsWithoutDeliverable();

        return Inertia::render('Admin/Deliverables/Crosswalk', [
            'filters' => ['match' => $match, 'q' => $q],
            'stats' => [
                'codes' => DeliverableSprint::count(),
                'code' => DeliverableSprint::where('match', 'code')->count(),
                'register_id' => DeliverableSprint::where('match', 'register_id')->count(),
                'unmatched' => DeliverableSprint::where('match', 'unmatched')->count(),
                'sprints' => Sprint::count(),
                'sprintsWithout' => (clone $withoutDeliverable)->count(),
                'statusNew' => DeliverableSprint::where('status', 'like', 'NEW%')->count(),
                'statusLinked' => DeliverableSprint::where('status', 'like', 'LINKED%')->count(),
            ],
            'byPopulation' => $byPopulation,
            'rows' => $rows,
            'unmatched' => DeliverableSprint::query()->where('match', 'unmatched')->orderBy('sprint_code')->get(['sprint_code', 'sprint_name', 'population', 'deliverable_ref']),
            'withoutDeliverable' => $withoutDeliverable->orderBy('code')->limit(300)->get(['code', 'slug', 'title', 'type', 'status', 'register_id'])
                ->map(fn (Sprint $s) => ['code' => $s->code, 'title' => $s->title, 'type' => $s->type, 'registerId' => $s->register_id, 'href' => $s->status === 'published' ? "/sprints/{$s->slug}" : null]),
        ]);
    }

    public function automation(): Response
    {
        $perLoop = Deliverable::query()->selectRaw('loop_id, count(*) as n')->groupBy('loop_id')->pluck('n', 'loop_id');

        $safeguards = Safeguard::query()->orderBy('code')->get()->map(fn (Safeguard $s) => [
            'code' => $s->code,
            'name' => $s->name,
            'rule' => $s->rule,
            'ossStage' => $s->oss_stage,
            'loopControl' => $s->loop_control,
            'deliverables' => Deliverable::query()->where('safeguards', 'like', "%{$s->code}%")->count(),
        ]);

        return Inertia::render('Admin/Deliverables/Automation', [
            'loops' => PaymentLoop::query()->orderBy('sort')->get()->map(fn (PaymentLoop $l) => [
                'loopId' => $l->loop_id,
                'family' => $l->family,
                'task' => $l->task,
                'blueprint' => $l->owning_blueprint,
                'sprints' => $l->sprints,
                'deliverables' => (int) ($perLoop[$l->loop_id] ?? 0),
            ]),
            'triggers' => Deliverable::query()
                ->join('deliverable_texts', 'deliverable_texts.id', '=', 'deliverables.payment_trigger_text_id')
                ->selectRaw('deliverable_texts.body as body, count(*) as n')->groupBy('deliverable_texts.body')->get()
                ->groupBy(fn ($r) => trim(explode('→', $r->body, 2)[0]))
                ->map(fn ($g, $trigger) => ['trigger' => $trigger, 'deliverables' => (int) $g->sum('n')])
                ->sortByDesc('deliverables')->values(),
            'safeguards' => $safeguards,
            'specs' => IntegrationSpec::query()->orderBy('sort')->get(['provider', 'element', 'value'])
                ->groupBy('element')
                ->map(fn ($g, $element) => ['element' => $element, 'heygen' => $g->firstWhere('provider', 'heygen')?->value, 'infogram' => $g->firstWhere('provider', 'infogram')?->value])
                ->values(),
        ]);
    }

    public function standards(): Response
    {
        $standards = Standard::query()->orderBy('section')->orderBy('sort')->get()->groupBy('section');
        $row = fn (Standard $s) => ['code' => $s->code, 'parameter' => $s->parameter, 'basic' => $s->basic, 'standard' => $s->standard, 'premium' => $s->premium, 'unit' => $s->unit, 'value' => $s->value === null ? null : (float) $s->value, 'basis' => $s->basis];

        $countries = CountryMatrixEntry::query()->orderBy('sort')->get()->groupBy('iso3')->map(function ($g) {
            $first = $g->first();

            return [
                'iso3' => $first->iso3,
                'country' => $first->country,
                'region' => $first->au_region,
                'wave' => $first->wave,
                'packStatus' => $first->pack_status,
                'statuses' => $g->countBy('status')->map(fn ($n, $status) => ['status' => $status, 'n' => $n])->values(),
            ];
        })->values();

        return Inertia::render('Admin/Deliverables/Standards', [
            'tiers' => ($standards['tier'] ?? collect())->map($row)->values(),
            'tiersV2' => ($standards['tier_v2'] ?? collect())->map($row)->values(),
            'formats' => ($standards['format'] ?? collect())->map($row)->values(),
            'sizes' => ($standards['size'] ?? collect())->map($row)->values(),
            'csatRules' => ($standards['csat_rule'] ?? collect())->pluck('parameter'),
            'countryDeliverables' => CountryMatrixEntry::query()->select('deliverable')->groupBy('deliverable')->orderByRaw('min(sort)')->pluck('deliverable'),
            'countries' => $countries,
        ]);
    }

    /** CSV of the filtered register with every register column (A to AW) plus the derived routing fields. */
    public function export(Request $request): StreamedResponse
    {
        $filters = $this->filters($request);
        $query = $this->query($filters)->orderBy('sort');

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, [...array_values(Deliverable::COLUMNS), 'Format code', 'Payment-trigger loop', 'Automation family', 'Owning blueprint', 'Linked app Sprints'], escape: '');

            $query->chunk(250, function ($chunk) use ($out) {
                Deliverable::withTexts($chunk);
                $linked = DeliverableSprint::query()->whereIn('deliverable_ref', $chunk->pluck('ref'))->where('match', '!=', 'unmatched')
                    ->selectRaw('deliverable_ref, count(*) as n')->groupBy('deliverable_ref')->pluck('n', 'deliverable_ref');
                foreach ($chunk as $d) {
                    fputcsv($out, [...array_values($d->register()), $d->format_code, $d->loop_id, $d->automation_family, $d->owner_blueprint, (int) ($linked[$d->ref] ?? 0)], escape: '');
                }
            });
            fclose($out);
        }, 'tbca-deliverables-register-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** @return array{q: string, tab: ?string, family: ?string, format: ?string, loop: ?string, tier: string, source: ?string} */
    private function filters(Request $request): array
    {
        $str = fn (string $k) => is_string($v = $request->query($k)) && trim($v) !== '' ? trim($v) : null;

        return [
            'q' => (string) $str('q'),
            'tab' => $str('tab'),
            'family' => $str('family'),
            'format' => $str('format'),
            'loop' => $str('loop'),
            'tier' => Deliverable::normaliseTier($str('tier')),
            'source' => in_array($str('source'), ['retained', 'new'], true) ? $str('source') : null,
        ];
    }

    private function query(array $f): Builder
    {
        return Deliverable::query()
            ->when($f['q'] !== '', function ($w) use ($f) {
                // whereLike is case-insensitive on every driver (ILIKE on Postgres in production).
                $like = '%'.$f['q'].'%';
                $w->where(fn ($x) => $x->whereLike('ref', $like)->orWhereLike('name', $like)->orWhereLike('family', $like)
                    ->orWhereLike('description', $like)->orWhereLike('linked_sprint_codes', $like));
            })
            ->when($f['tab'], fn ($w) => $w->where('tab', $f['tab']))
            ->when($f['family'], fn ($w) => $w->where('family', $f['family']))
            ->when($f['format'], fn ($w) => $w->where('format_class', $f['format']))
            ->when($f['loop'], fn ($w) => $w->where('loop_id', $f['loop']))
            ->when($f['source'] === 'new', fn ($w) => $w->where('v2_status', 'like', 'NEW%'))
            ->when($f['source'] === 'retained', fn ($w) => $w->where('v2_status', 'not like', 'NEW%'));
    }

    /** Sprints whose code and register_id are both absent from the crosswalk. */
    private function sprintsWithoutDeliverable(): Builder
    {
        return Sprint::query()
            ->whereNotIn('code', DB::table('deliverable_sprints')->select('sprint_code'))
            ->where(fn ($w) => $w->whereNull('register_id')->orWhereNotIn('register_id', DB::table('deliverable_sprints')->select('sprint_code')));
    }

    /** Issue control fields from the workbook's Control sheet. */
    private function control(): array
    {
        $path = base_path('database/seeders/Sections/data/deliverables/control.json');
        if (! is_file($path)) {
            return [];
        }
        $doc = json_decode((string) file_get_contents($path), true) ?: [];

        return collect($doc['fields'] ?? [])
            ->whereIn('field', ['Document', 'Issue', 'Coverage', 'Tier mapping', 'Trigger', 'Automation', 'Status', 'Owner'])
            ->values()->all();
    }
}
