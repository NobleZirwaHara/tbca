<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Corridor;
use App\Models\Aiim\Country;
use App\Models\Aiim\Organisation;
use App\Models\Aiim\Project;
use App\Models\Aiim\Province;
use App\Models\Aiim\Sector;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\Grades;
use App\Support\Aiim\Pricing;
use App\Support\Aiim\ProtoSearch;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Server-side search and filtering for opportunities, projects, investors,
 * funders and trade corridors, plus their preview pages.
 *
 * The search pages are global with a country filter that defaults to Botswana: Botswana shows the
 * client's "TBCA AIIM Botswana" prototype records from the BW-1.0 registers (BotswanaSearch), any
 * other country (or "all") shows the app's own records for that country.
 */
class SearchController extends AiimController
{
    use BotswanaSearch;

    private const PER_PAGE = 10;

    private const SIZE_BANDS = [
        'small' => [0, 150_000_000], 'medium' => [150_000_000, 400_000_000], 'large' => [400_000_000, PHP_INT_MAX],
    ];

    public function opportunities(Request $request): Response
    {
        return $this->isBw($request) ? $this->bwOpps($request) : $this->appProjects($request, 'opportunity');
    }

    public function projects(Request $request): Response
    {
        return $this->isBw($request) ? $this->bwProjects($request) : $this->appProjects($request, 'project');
    }

    /** Country filter value: a country slug, "all", or Botswana by default. */
    protected function countryParam(Request $request): string
    {
        $c = strtolower(trim((string) $request->query('country', ProtoSearch::COUNTRY)));

        return in_array($c, ['', 'bw', 'bwa'], true) ? ProtoSearch::COUNTRY : $c;
    }

    protected function isBw(Request $request): bool
    {
        return $this->countryParam($request) === ProtoSearch::COUNTRY && ProtoSearch::ready();
    }

    /** Country filter props shared by every search page. */
    protected function countryProps(Request $request): array
    {
        $c = $this->countryParam($request);
        $name = $c === 'all' ? 'All countries' : (Country::query()->where('slug', $c)->value('name') ?? ucwords(str_replace('-', ' ', $c)));
        if ($c !== 'all') {
            $this->select($request, ['country' => $name]);
        }

        return [
            'country' => $c,
            'countryName' => $name,
            'countries' => Country::query()->orderBy('name')->get(['slug', 'name']),
        ];
    }

    private function appProjects(Request $request, string $kind): Response
    {
        $f = $this->filters($request, ['types' => [], 'size' => '', 'stage' => '', 'country' => '']);
        $c = $this->countryParam($request);
        $f['country'] = $c === 'all' ? '' : $c;
        $q = Project::query()->whereIn('kind', [$kind, 'both']);
        $this->common($q, $f, ['name', 'summary', 'location']);
        if ($f['country']) {
            $q->where('country_iso2', Country::query()->where('slug', $f['country'])->value('iso2') ?? '--');
        }
        if ($f['types']) {
            $q->whereIn('type', $f['types']);
        }
        if ($f['size'] && isset(self::SIZE_BANDS[$f['size']])) {
            [$lo, $hi] = self::SIZE_BANDS[$f['size']];
            $q->where('size_max_zar', '>=', $lo)->where('size_max_zar', '<', $hi);
        }
        if ($f['stage']) {
            $q->where('stage', $f['stage']);
        }
        $this->sort($q, $f['sort'], ['score' => ['score', 'desc'], 'size' => ['size_max_zar', 'desc'], 'added' => ['added_on', 'desc'], 'name' => ['name', 'asc']]);
        $page = $q->paginate(self::PER_PAGE)->withQueryString();

        $base = Project::query()->whereIn('kind', [$kind, 'both']);

        return $this->render($request, 'Aiim/Search', [
            'kind' => $kind,
            'filters' => $f,
            'results' => $page->through(fn ($p) => Catalogue::project($p)),
            'options' => [
                'types' => (clone $base)->distinct()->orderBy('type')->pluck('type'),
                'stages' => (clone $base)->distinct()->orderBy('stage')->pluck('stage'),
                'sizes' => [['small', 'Small-Medium (< R150M)'], ['medium', 'Medium (R150M – R400M)'], ['large', 'Large (> R400M)']],
                'countries' => Country::query()->whereIn('iso2', (clone $base)->whereNotNull('country_iso2')->distinct()->pluck('country_iso2'))->orderBy('name')->get(['slug', 'name']),
            ] + $this->geo(),
            'saved' => $this->savedKeys($request->user()),
            'packLoading' => $page->total() === 0 && $f['country'] !== '' && ! $this->hasFilters($f),
        ] + $this->countryProps($request), $kind === 'project' ? 'Project Search' : 'Opportunity Search');
    }

    public function investors(Request $request): Response
    {
        return $this->isBw($request) ? $this->bwInvestors($request) : $this->organisations($request, 'investor');
    }

    public function funders(Request $request): Response
    {
        return $this->isBw($request) ? $this->bwFunders($request) : $this->organisations($request, 'funder');
    }

    private function hasFilters(array $f): bool
    {
        foreach ($f as $k => $v) {
            if (! in_array($k, ['sort', 'view', 'country'], true) && $v !== '' && $v !== []) {
                return true;
            }
        }

        return false;
    }

    private function organisations(Request $request, string $kind): Response
    {
        $f = $this->filters($request, ['types' => [], 'stage' => '', 'instrument' => '', 'minTicket' => '', 'origin' => '']);
        $q = Organisation::query()->where('kind', $kind);
        // The app's investor and funder records are the South Africa model data set.
        $c = $this->countryParam($request);
        if (! in_array($c, ['all', 'south-africa'], true)) {
            $q->whereRaw('1 = 0');
        }
        if ($f['q']) {
            $q->where(fn ($w) => $w->where('name', 'like', "%{$f['q']}%")->orWhere('summary', 'like', "%{$f['q']}%")->orWhere('type', 'like', "%{$f['q']}%")->orWhere('focus', 'like', "%{$f['q']}%"));
        }
        if ($f['sector']) {
            $q->where('sector_slugs', 'like', '%"'.$f['sector'].'"%');
        }
        if ($f['types']) {
            $q->whereIn('type', $f['types']);
        }
        if ($f['stage']) {
            $q->where('stages', 'like', '%"'.$f['stage'].'"%');
        }
        if ($f['instrument']) {
            $q->where('instruments', 'like', '%"'.$f['instrument'].'"%');
        }
        if ($f['minTicket'] !== '' && is_numeric($f['minTicket'])) {
            $q->where('ticket_max_zar', '>=', (int) $f['minTicket']);
        }
        if ($f['origin']) {
            $q->where('origin', $f['origin']);
        }
        $this->sort($q, $f['sort'], ['score' => ['match_score', 'desc'], 'ticket' => ['ticket_max_zar', 'desc'], 'added' => ['added_on', 'desc'], 'name' => ['name', 'asc']]);
        $base = Organisation::query()->where('kind', $kind);
        $page = $q->paginate(self::PER_PAGE)->withQueryString();

        return $this->render($request, 'Aiim/OrgSearch', [
            'kind' => $kind,
            'filters' => $f,
            'packLoading' => $page->total() === 0 && ! in_array($c, ['all', 'south-africa'], true),
            'results' => $page->through(fn ($o) => Catalogue::organisation($o)),
            'options' => [
                'types' => (clone $base)->distinct()->orderBy('type')->pluck('type'),
                'stages' => (clone $base)->pluck('stages')->flatten()->unique()->sort()->values(),
                'instruments' => (clone $base)->pluck('instruments')->flatten()->unique()->sort()->values(),
                'origins' => (clone $base)->distinct()->pluck('origin'),
                'tickets' => [['1000000', 'R1M+'], ['10000000', 'R10M+'], ['100000000', 'R100M+'], ['1000000000', 'R1B+']],
            ] + $this->geo(),
            'saved' => $this->savedKeys($request->user()),
        ] + $this->countryProps($request), $kind === 'investor' ? 'Investor Search' : 'Funder Search');
    }

    public function corridors(Request $request): Response
    {
        if ($this->isBw($request)) {
            return $this->bwCorridors($request);
        }
        $f = $this->filters($request, ['types' => [], 'mode' => '', 'agreement' => '', 'region' => '', 'infrastructure' => '', 'minScore' => '']);
        $q = Corridor::query();
        $cp = $this->countryProps($request);
        if ($cp['country'] !== 'all') {
            $q->where('countries', 'like', '%'.$cp['countryName'].'%');
        }
        if ($f['q']) {
            $q->where(fn ($w) => $w->where('name', 'like', "%{$f['q']}%")->orWhere('route', 'like', "%{$f['q']}%")->orWhere('agreement', 'like', "%{$f['q']}%")->orWhere('countries', 'like', "%{$f['q']}%"));
        }
        foreach (['types' => 'type'] as $key => $col) {
            if ($f[$key]) {
                $q->whereIn($col, $f[$key]);
            }
        }
        if ($f['mode']) {
            $q->where('modes', 'like', '%"'.$f['mode'].'"%');
        }
        foreach (['agreement' => 'agreement', 'region' => 'destination_region', 'infrastructure' => 'infrastructure'] as $key => $col) {
            if ($f[$key]) {
                $q->where($col, $f[$key]);
            }
        }
        if (is_numeric($f['minScore'])) {
            $q->where('score', '>=', (float) $f['minScore']);
        }
        $this->sort($q, $f['sort'], ['score' => ['score', 'desc'], 'volume' => ['volume_zar', 'desc'], 'added' => ['added_on', 'desc'], 'name' => ['name', 'asc']]);

        $page = $q->paginate(self::PER_PAGE)->withQueryString();

        return $this->render($request, 'Aiim/CorridorSearch', [
            'filters' => $f,
            'packLoading' => $page->total() === 0 && $cp['country'] !== 'all' && ! $this->hasFilters($f),
            'results' => $page->through(fn ($c) => Catalogue::corridor($c)),
            'options' => [
                'types' => Corridor::query()->distinct()->orderBy('type')->pluck('type'),
                'agreements' => Corridor::query()->distinct()->orderBy('agreement')->pluck('agreement'),
                'regions' => Corridor::query()->distinct()->orderBy('destination_region')->pluck('destination_region'),
                'infrastructure' => Corridor::query()->distinct()->pluck('infrastructure'),
                'modes' => ['road', 'rail', 'sea', 'air'],
            ],
            'saved' => $this->savedKeys($request->user()),
        ] + $cp, 'Trade Corridor Search');
    }

    public function opportunity(Request $request, string $project): Response
    {
        if (ProtoSearch::ready() && ProtoSearch::opp($project)) {
            return $this->bwOpp($request, $project);
        }

        return $this->showProject($request, Project::query()->where('slug', $project)->firstOrFail(), 'opportunity');
    }

    public function project(Request $request, string $project): Response
    {
        if (ProtoSearch::ready() && ($bw = $this->bwProject($request, $project))) {
            return $bw;
        }

        return $this->showProject($request, Project::query()->where('slug', $project)->firstOrFail(), 'project');
    }

    private function showProject(Request $request, Project $project, string $as): Response
    {
        $this->select($request, [
            'country' => Country::query()->where('iso2', $project->country_iso2 ?? 'ZA')->value('name'),
            'province' => $project->province_slug ?: '',
            'sector' => $project->sector_slug,
            'item' => $project->name,
        ]);
        $ent = $this->entitled($request->user(), 'project', $project->code);

        return $this->render($request, $as === 'project' ? 'Aiim/ProjectShow' : 'Aiim/OpportunityShow', [
            'item' => Catalogue::project($project, true),
            'as' => $as,
            'entitled' => (bool) $ent,
            'unlockFrom' => $project->premium ? Pricing::unlock($project)['total'] : null,
            'saved' => $this->savedKeys($request->user()),
        ], $as === 'project' ? 'Project Overview' : 'Opportunity Preview');
    }

    public function investor(Request $request, string $organisation): Response
    {
        if (ProtoSearch::ready() && ($c = ProtoSearch::persona($organisation))) {
            return $this->bwInvestor($request, $c);
        }

        return $this->showOrg($request, Organisation::query()->where('slug', $organisation)->firstOrFail(), 'investor');
    }

    public function funder(Request $request, string $organisation): Response
    {
        if (ProtoSearch::ready() && ($c = ProtoSearch::funder($organisation))) {
            return $this->bwFunder($request, $c);
        }

        return $this->showOrg($request, Organisation::query()->where('slug', $organisation)->firstOrFail(), 'funder');
    }

    private function showOrg(Request $request, Organisation $org, string $kind): Response
    {
        abort_unless($org->kind === $kind, 404);
        $this->select($request, ['item' => $org->name]);
        $related = Project::query()->whereIn('sector_slug', $org->sector_slugs ?? [])->orderByDesc('score')->take(4)->get()->map(fn ($p) => Catalogue::project($p));

        return $this->render($request, 'Aiim/OrgShow', [
            'org' => Catalogue::organisation($org, true),
            'related' => $related,
            'saved' => $this->savedKeys($request->user()),
            'grade' => Grades::grade($org->confidence),
        ], $kind === 'investor' ? 'Investor Preview' : 'Funder Preview');
    }

    public function corridor(Request $request, string $corridor): Response
    {
        if (ProtoSearch::ready() && ($c = ProtoSearch::corridor($corridor))) {
            return $this->bwCorridor($request, $c);
        }
        $corridor = Corridor::query()->where('slug', $corridor)->firstOrFail();
        $this->select($request, ['item' => $corridor->name]);

        return $this->render($request, 'Aiim/CorridorShow', [
            'corridor' => Catalogue::corridor($corridor, true),
            'saved' => $this->savedKeys($request->user()),
        ], 'Trade Corridor');
    }

    private function filters(Request $request, array $extra): array
    {
        $defaults = ['q' => '', 'province' => '', 'sector' => '', 'sort' => 'score', 'view' => 'list'] + $extra;
        $out = [];
        foreach ($defaults as $k => $d) {
            $v = $request->query($k, $d);
            $out[$k] = is_array($d) ? array_values(array_filter((array) $v, 'is_string')) : (is_string($v) ? trim($v) : $d);
        }

        return $out;
    }

    private function common($q, array $f, array $searchCols): void
    {
        if ($f['q']) {
            $q->where(function ($w) use ($f, $searchCols) {
                foreach ($searchCols as $c) {
                    $w->orWhere($c, 'like', "%{$f['q']}%");
                }
            });
        }
        if ($f['province']) {
            $q->where('province_slug', $f['province']);
        }
        if ($f['sector']) {
            $q->where('sector_slug', $f['sector']);
        }
    }

    private function sort($q, string $sort, array $map): void
    {
        [$col, $dir] = $map[$sort] ?? reset($map);
        $q->orderBy($col, $dir)->orderBy('id');
    }

    private function geo(): array
    {
        return [
            'provinces' => Province::query()->orderBy('rank')->get(['slug', 'name']),
            'sectors' => Sector::query()->orderBy('sort')->get(['slug', 'name']),
        ];
    }
}
