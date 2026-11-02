<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\AdminUnit;
use App\Models\Aiim\Brief;
use App\Models\Aiim\Corridor;
use App\Models\Aiim\Country;
use App\Models\Aiim\OpportunityTemplate;
use App\Models\Aiim\Organisation;
use App\Models\Aiim\Project;
use App\Models\Aiim\Province;
use App\Models\Aiim\Sector;
use App\Models\Aiim\Source;
use App\Support\Aiim\Catalogue;
use App\Support\Aiim\Content;
use App\Support\Aiim\CountryIntel;
use App\Support\Aiim\Grades;
use App\Support\Aiim\ProtoExplore as PX;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Free exploration layer, rebuilt from the client's "TBCA AIIM Botswana" prototype: landing (mock 1),
 * the 54 country cockpits (2), district and council selector (3), unit profile (4), sector selector
 * and profile (5, 6), risk and outlook (17) and source and evidence preview (18). Botswana carries
 * the BW-1.0 country pack; other countries use the same template with their loaded records.
 */
class ExploreController extends AiimController
{
    /* ------------------------------------------------------------------ 1: landing */

    public function landing(Request $request): Response
    {
        $act = PX::reg('I2_Country_Activation');
        $roll = PX::reg('BW_Rollout');
        $issued = ['MWI', 'GHA', 'NGA', 'EGY', 'MAR', 'ZAF', 'DZA', 'BWA'];
        $wave1 = (string) ($roll[1]['Countries'] ?? '');
        $actBy = collect($act)->keyBy('ISO3');

        $countries = Country::query()->orderBy('name')->get()->map(function (Country $c) use ($issued, $wave1, $actBy) {
            $a = $actBy[$c->iso3] ?? null;
            $state = $c->iso3 === 'BWA' ? 'live' : (in_array($c->iso3, $issued, true) ? 'issued' : ($a && $wave1 !== '' && str_contains($wave1, explode(' ', (string) $a['Country'])[0]) ? 'wave1' : 'later'));

            return $c->summary() + ['iso3' => $c->iso3, 'state' => $state, 'wave' => $a['Wave [PROPOSED]'] ?? $c->activation_wave, 'pack' => $a['Pack status'] ?? $c->pack_status];
        })->values();

        $regions = collect($act)->groupBy('AU region')->map(fn ($rows, $k) => ['region' => $k, 'n' => $rows->count(), 'names' => $rows->pluck('Country')->take(4)->values()])->values();
        $sec = array_map(fn ($c) => PX::SECTORS[$c][1] ?? '#d6a32e', array_column(PX::reg('BW_Top30'), 'Sector'));

        return $this->render($request, 'Aiim/Landing', [
            'countries' => $countries,
            'rollout' => $roll,
            'regions' => $regions,
            'top30' => array_map(fn ($r, $c) => ['id' => $r['Opp ID'], 'name' => $r['Opportunity'], 'score' => (float) $r['Score'], 'color' => $c], array_slice(PX::reg('BW_Top30'), 0, 5), array_slice($sec, 0, 5)),
            'actions' => PX::services(['AAB-EMB-192', 'AAB-EMB-141', 'AAB-EMB-173', 'AAB-EMB-205', 'AAB-EMB-196']),
            'summary' => ['templates' => PX::summary()['Sweep templates'] ?? null, 'tierA' => ((int) (PX::summary()['Tier A+'] ?? 0)) + ((int) (PX::summary()['Tier A'] ?? 0))],
            'coverage' => $this->coverage(),
        ], 'Landing');
    }

    /** All 54 countries with roll-out wave, pack status and loaded record counts. */
    private function coverage(): array
    {
        $projects = Project::query()->whereIn('screening_status', ['QUALIFIED', 'WATCHLIST'])->selectRaw('country_iso2, count(*) n')->groupBy('country_iso2')->pluck('n', 'country_iso2');
        $opps = OpportunityTemplate::query()->whereNotNull('country_iso2')->selectRaw('country_iso2, count(*) n')->groupBy('country_iso2')->pluck('n', 'country_iso2');
        $units = AdminUnit::query()->selectRaw('country_iso2, count(*) n')->groupBy('country_iso2')->pluck('n', 'country_iso2');

        return Country::query()->orderBy('name')->get(['slug', 'name', 'iso2', 'iso3', 'region', 'au_region', 'activation_wave', 'pack_status', 'pack_code'])
            ->map(fn (Country $c) => $c->summary() + $c->activation() + [
                'iso3' => $c->iso3,
                'projects' => (int) ($projects[$c->iso2] ?? 0),
                'opportunities' => (int) ($opps[$c->iso2] ?? 0),
                'units' => (int) ($units[$c->iso2] ?? 0),
            ])->all();
    }

    private function fees(Request $request): int
    {
        return count($request->session()->get('aiim.fee_items', []));
    }

    private function isBw(Country $c): bool
    {
        return $c->iso2 === 'BW' && PX::ready();
    }

    /* ------------------------------------------------------------------ 2: cockpit */

    /** Investor Cockpit for any of the 54 countries (slug = kebab-case name). */
    public function country(Request $request, string $slug): Response
    {
        $country = Country::query()->where('slug', $slug)->firstOrFail();
        $this->select($request, ['country' => $country->name]);
        $bw = $this->isBw($country);
        $tab = $request->query('tab');
        $bench = collect(PX::reg('BW_Benchmark'));

        return $this->render($request, 'Aiim/Cockpit', [
            'country' => $country->profile(),
            'countries' => Country::options(),
            'peers' => Country::query()->where('region', $country->region)->where('id', '!=', $country->id)->orderBy('name')->get()->map(fn ($c) => $c->summary()),
            // South Africa carries the province-level model pack; the other countries show their loaded records.
            'content' => $country->has_province_pack ? Content::cockpit() : null,
            'provinces' => $country->has_province_pack ? Province::query()->orderByDesc('score')->get(['slug', 'name', 'score']) : [],
            // Map explorer payload. Botswana's cockpit has its own unit map, so the explorer loads there only on a ?tab= deep link.
            'intel' => $bw && ! $tab ? null : CountryIntel::for($country),
            'bw' => $bw ? $this->cockpitBw() : null,
            'benchmark' => ! $bw && $bench->isNotEmpty() && array_key_exists($country->name, $bench->first()) ? $bench->map(fn ($r) => ['metric' => $r['Metric'], 'value' => $r[$country->name], 'bw' => $r['Botswana'] ?? null])->values() : null,
            'fees' => $this->fees($request),
            'initialTab' => (string) ($tab ?? 'overview'),
            'initialUnit' => $request->query('unit') ? (string) $request->query('unit') : null,
        ], 'Investor Cockpit');
    }

    private function cockpitBw(): array
    {
        $S = PX::summary();
        $units = PX::reg('BW_Units');
        $sw = collect(PX::reg('BW_Sweep'));
        $secAgg = [];
        foreach (PX::SECTORS as $code => [$name]) {
            $t = $sw->where('Sector', $code);
            $secAgg[] = ['code' => $code, 'name' => $name, 'n' => $t->count(), 'a' => $t->filter(fn ($o) => str_starts_with((string) $o['Tier'], 'A'))->count(), 'sc' => $t->count() ? $t->avg('Score') : 0];
        }
        usort($secAgg, fn ($a, $b) => [$b['a'], $b['sc']] <=> [$a['a'], $a['sc']]);
        usort($units, fn ($a, $b) => $b['Envelope US$ m (weighted)'] <=> $a['Envelope US$ m (weighted)']);
        $shocks = array_values(array_filter(PX::reg('BW_Shocks'), fn ($r) => $r['Sector'] !== 'Basis'));
        $buckets = [];
        foreach ($shocks as $r) {
            $i = (int) $r['Index'];
            $k = $i <= 2 ? 'Low (index ≤2)' : ($i <= 4 ? 'Moderate (3–4)' : ($i <= 6 ? 'Elevated (5–6)' : 'High (≥7)'));
            $buckets[$k] = ($buckets[$k] ?? 0) + 1;
        }
        arsort($buckets);
        $facts = PX::facts();
        $ids = ['MAC-F1', 'MAC-F2', 'MAC-F3', 'MAC-F4', 'MAC-F6', 'MAC-F8', 'MAC-F9', 'MAC-F12', 'MAC-F14', 'MAC-F15', 'MAC-F16', 'MAC-F17', 'MAC-F25', 'MAC-F27'];

        return [
            'summary' => $S,
            'macro' => ['g3' => PX::pct(PX::mac('MAC-F3')), 'g2' => PX::pct(PX::mac('MAC-F2')), 'g1' => PX::pct(PX::mac('MAC-F1')), 'infl' => PX::pct(PX::mac('MAC-F6'))],
            'topUnits' => array_map(fn ($u) => ['code' => $u['Code'], 'name' => $u['Unit'], 'env' => (float) $u['Envelope US$ m (weighted)']], array_slice($units, 0, 9)),
            'sectors' => array_slice($secAgg, 0, 8),
            'shock' => ['avg' => count($shocks) ? round(array_sum(array_column($shocks, 'Index')) / count($shocks), 1) : 0, 'buckets' => $buckets],
            'partA' => array_slice(PX::slice('PART A', 'A-1'), 1),
            'headline' => array_map(fn ($id) => ['id' => $id, 'fact' => $facts['BW-'.$id]['Fact'] ?? $id, 'value' => $facts['BW-'.$id]['Value'] ?? ''], $ids),
            'benchmark' => PX::sheet('BW_Benchmark'),
            'map' => PX::mapPayload(false),
            'briefs' => PX::services(['AAB-EMB-192', 'AAB-EMB-198']),
            'rail' => PX::services(['AAB-EMB-096', 'AAB-EMB-097', 'AAB-EMB-098', 'AAB-EMB-099', 'AAB-EMB-112', 'AAB-EMB-113']),
        ];
    }

    /* ------------------------------------------------------------------ 3: district and council selector */

    public function provinces(Request $request, string $slug): Response
    {
        $country = Country::query()->where('slug', $slug)->firstOrFail();
        $base = ['country' => $country->summary(), 'mode' => 'none', 'bw' => null, 'sa' => null, 'units' => []];

        if ($this->isBw($country)) {
            $units = PX::reg('BW_Units');
            $tot = array_sum(array_column($units, 'Population (Census 2022)'));
            usort($units, fn ($a, $b) => $b['Population (Census 2022)'] <=> $a['Population (Census 2022)']);
            $partD = collect(PX::slice('PART D'))->firstWhere('s', 'First Paragraph');

            return $this->render($request, 'Aiim/Provinces', ['mode' => 'bw', 'bw' => [
                'lead' => $partD['x'] ?? '',
                'cards' => array_map(fn ($u) => ['code' => $u['Code'], 'name' => $u['Unit'], 'kind' => $u['Kind'], 'pop' => (int) $u['Population (Census 2022)'], 'share' => $tot ? round(100 * $u['Population (Census 2022)'] / $tot, 1) : 0,
                    'env' => (float) $u['Envelope US$ m (weighted)'], 'templates' => (int) $u['Templates'], 'tierA' => (int) $u['Tier A'], 'tags' => array_slice(array_map('trim', explode(',', (string) $u['Tags'])), 0, 5)], $units),
                'units' => PX::sheet('BW_Units'),
                'envNote' => (string) (PX::slice('G-5')[1]['x'] ?? ''),
                'envelopes' => PX::sheet('BW_Envelopes'),
                'institutions' => PX::sheet('BW_Institutions'),
            ]] + $base, 'Unit Selector');
        }

        if ($country->has_province_pack) {
            $sort = $request->query('sort', 'score');
            $query = Province::query();
            $sort === 'name' ? $query->orderBy('name') : $query->orderByDesc('score');
            $sectorIcons = Sector::query()->pluck('icon', 'slug');

            return $this->render($request, 'Aiim/Provinces', ['mode' => 'sa', 'sa' => [
                'sort' => $sort,
                'glance' => Content::cockpit()['glance'],
                'provinces' => $query->get()->map(fn ($p) => [
                    'slug' => $p->slug, 'name' => $p->name, 'rank' => $p->rank, 'score' => (float) $p->score,
                    'label' => Grades::opportunityLabel((float) $p->score),
                    'sectors' => collect($p->key_sectors)->map(fn ($s) => ['slug' => $s, 'icon' => $sectorIcons[$s] ?? 'factory'])->take(4)->values(),
                ]),
            ]] + $base, 'Province Selector');
        }

        $units = AdminUnit::query()->where('country_iso2', $country->iso2)->where('level', 1)->orderBy('sort')->orderBy('name')->get()
            ->map(fn (AdminUnit $u) => ['slug' => $u->slug, 'name' => $u->name, 'kind' => $u->kind, 'population' => $u->population, 'source' => $u->population_source]);

        return $this->render($request, 'Aiim/Provinces', ['mode' => $units->isEmpty() ? 'none' : 'units', 'units' => $units] + $base, 'Unit Selector');
    }

    /* ------------------------------------------------------------------ 4: unit profile */

    public function province(Request $request, string $province): Response
    {
        $p = Province::query()->where('slug', $province)->first();
        if ($p) {
            return $this->saProvince($request, $p);
        }
        $code = PX::ready() ? PX::unitCode($province) : null;
        abort_unless($code, 404);
        $u = collect(PX::reg('BW_Units'))->firstWhere('Code', $code);
        $this->select($request, ['country' => 'Botswana', 'item' => $u['Unit']]);
        $towns = array_values(array_filter(PX::mapBase(false)['towns'], fn ($t) => $t['unit'] === $code));
        usort($towns, fn ($a, $b) => $b['pop'] <=> $a['pop']);
        $townMeta = collect(PX::reg('BW_Towns'))->keyBy('ID');
        $rl = array_values(array_filter(PX::reg('BW_Ranked_Leads'), fn ($r) => $r['Unit code'] === $code));

        return $this->render($request, 'Aiim/Province', [
            'mode' => 'bw',
            'unit' => PX::unitCard($code),
            'towns' => array_map(fn ($t) => $t + ['gateway' => $townMeta[$t['id']]['Nearest gateway'] ?? ''], $towns),
            'ranked' => array_map(fn ($r) => array_intersect_key($r, array_flip(['Lead ID', 'Template', 'Sector', 'Opportunity', 'Band', 'Persona', 'Place', 'Lead score', 'Tier', 'Time to revenue'])), $rl),
            'map' => PX::mapPayload(true),
            'brief' => PX::service('AAB-EMB-150'),
            'rail' => PX::services(['AAB-EMB-150', 'AAB-EMB-171', 'AAB-EMB-168', 'AAB-EMB-106', 'AAB-EMB-107']),
        ], 'Unit Profile');
    }

    private function saProvince(Request $request, Province $province): Response
    {
        $this->select($request, ['province' => $province->slug, 'sector' => null]);
        $sectors = Sector::query()->get()
            ->filter(fn ($s) => isset($s->scores[$province->slug]))
            ->sortByDesc(fn ($s) => $s->scores[$province->slug])
            ->take(5)->values()
            ->map(fn ($s) => ['slug' => $s->slug, 'name' => $s->name, 'score' => $s->scores[$province->slug], 'label' => Grades::opportunityLabel($s->scores[$province->slug])]);

        return $this->render($request, 'Aiim/Province', [
            'mode' => 'sa',
            'province' => $province->only(['slug', 'name', 'code', 'tagline', 'glance', 'kpis', 'economy', 'evidence']) + ['score' => (float) $province->score],
            'sectors' => $sectors,
            'projects' => Project::query()->where('province_slug', $province->slug)->orderByDesc('score')->take(5)->get()->map(fn ($p) => Catalogue::project($p)),
            'grade' => Grades::grade($province->evidence['confidence'] ?? 70),
        ], 'Province Profile');
    }

    /* ------------------------------------------------------------------ 5: sector selector */

    public function sectors(Request $request): Response
    {
        if ($request->query('province') || ! PX::ready()) {
            return $this->saSectors($request);
        }
        $sw = collect(PX::reg('BW_Sweep'));
        $shocks = collect(PX::reg('BW_Shocks'))->keyBy('Sector');
        $facts = collect(PX::reg('BW_Facts'))->countBy('Sector');
        $chains = collect(PX::reg('BW_Chains'))->groupBy('Sector');
        $cards = [];
        foreach (PX::SECTORS as $code => [$name]) {
            $t = $sw->where('Sector', $code);
            $cards[] = [
                'code' => $code, 'templates' => $t->count(), 'tierA' => $t->filter(fn ($o) => str_starts_with((string) $o['Tier'], 'A'))->count(), 'facts' => (int) ($facts[$code] ?? 0),
                'index' => $shocks[$code]['Index'] ?? null, 'downturn' => $shocks[$code]['Downturn index'] ?? null,
                'info' => mb_substr((string) ($chains[$code][0]['Information types'] ?? ''), 0, 70),
            ];
        }

        return $this->render($request, 'Aiim/Sectors', [
            'mode' => 'bw',
            'cards' => $cards,
            'scoreboard' => PX::table('G-1', 1),
            'shocks' => PX::reg('BW_Shocks'),
        ], 'Sector Selector');
    }

    private function saSectors(Request $request): Response
    {
        $slug = $request->query('province', $this->selection($request)['province'] ?? 'gauteng');
        $province = Province::query()->where('slug', $slug)->firstOrFail();
        $this->select($request, ['province' => $province->slug]);

        $sectors = Sector::query()->orderBy('sort')->get()
            ->map(fn ($s) => ['slug' => $s->slug, 'name' => $s->name, 'icon' => $s->icon, 'summary' => $s->summary, 'score' => $s->scores[$province->slug] ?? null])
            ->filter(fn ($s) => $s['score'] !== null)
            ->sortByDesc('score')->values()
            ->map(fn ($s, $i) => $s + ['rank' => $i + 1, 'label' => Grades::opportunityLabel($s['score'])]);

        return $this->render($request, 'Aiim/Sectors', [
            'mode' => 'sa',
            'province' => ['slug' => $province->slug, 'name' => $province->name, 'kpis' => $province->kpis],
            'sectors' => $sectors,
            'provinces' => Province::query()->orderBy('rank')->get(['slug', 'name']),
        ], 'Sector Selector');
    }

    /* ------------------------------------------------------------------ 6: sector profile */

    public function sector(Request $request, string $sector): Response
    {
        $model = Sector::query()->where('slug', $sector)->first();
        if ($model) {
            return $this->saSector($request, $model);
        }
        $code = strtoupper(preg_replace('/^bw-/i', '', $sector));
        abort_unless(isset(PX::SECTORS[$code]) && PX::ready(), 404);
        $n = array_search($code, array_keys(PX::SECTORS), true) + 1;
        $this->select($request, ['country' => 'Botswana', 'item' => PX::SECTORS[$code][0]]);

        $by = fn (string $reg, string $key = 'Sector') => array_values(array_filter(PX::reg($reg), fn ($r) => ($r[$key] ?? null) === $code));
        $opps = $by('BW_Opportunities');
        $head = PX::slice('E'.$n.'. ');
        $docTable = function (string $letter) use ($head) {
            foreach ($head as $i => $b) {
                if (($b['t'] ?? '') === 'p' && str_starts_with((string) $b['x'], $letter)) {
                    foreach (array_slice($head, $i + 1) as $t) {
                        if (($t['t'] ?? '') === 'tbl') {
                            return $t['rows'];
                        }
                    }
                }
            }

            return null;
        };
        $scen = [];
        foreach ($head as $i => $b) {
            if (($b['s'] ?? '') === 'Compact' && $i < 4) {
                $scen[] = $b['x'];
            }
        }
        $pbMap = ['ENR' => ['BW-PB-08'], 'MIN' => ['BW-PB-04', 'BW-PB-05'], 'AGR' => ['BW-PB-06', 'BW-PB-07'], 'TRN' => ['BW-PB-09'], 'TOU' => ['BW-PB-12'], 'HLT' => ['BW-PB-13'], 'FIN' => ['BW-PB-14', 'BW-PB-11'], 'TRD' => ['BW-PB-10'], 'MFG' => ['BW-PB-05'], 'GRN' => ['BW-PB-08']];
        $calc = ['ENR' => 'AAB-EMB-144', 'GRN' => 'AAB-EMB-144', 'AGR' => 'AAB-EMB-145', 'MIN' => 'AAB-EMB-146', 'HLT' => 'AAB-EMB-143', 'CRE' => 'AAB-EMB-142', 'TRN' => 'AAB-EMB-142'];
        $premium = collect(PX::reg('BW_Premium'))->keyBy('Code');
        $cov = array_filter(PX::reg('BW_Coverage'), fn ($r) => $r['Sector'] === $code);
        $rl = array_filter(PX::reg('BW_Ranked_Leads'), fn ($r) => $r['Sector'] === $code);

        return $this->render($request, 'Aiim/Sector', [
            'mode' => 'bw',
            'code' => $code,
            'n' => $n,
            'scenarios' => $scen,
            'sweep' => PX::sheet('BW_Sweep', $by('BW_Sweep')),
            'facts' => $by('BW_Facts'),
            'chains' => $by('BW_Chains'),
            'mapstack' => $by('BW_MapStack'),
            'levelTable' => $docTable('(f)'),
            'infoTable' => $docTable('(g)'),
            'rulesTable' => $docTable('(k)'),
            'anchors' => array_values(array_filter($opps, fn ($o) => $o['Type'] === 'Anchor')),
            'gapTemplates' => array_values(array_filter($opps, fn ($o) => $o['Type'] === 'Issue 2.0 template')),
            'shock' => collect(PX::reg('BW_Shocks'))->firstWhere('Sector', $code),
            'permit' => collect(PX::reg('BW_Permits'))->firstWhere('Sector', $code),
            'products' => $by('BW_Products'),
            'assets' => $by('I2_Asset_Register', 'Sector code'),
            'wx' => ['facts' => PX::sheet('I2_WX_Facts', $by('I2_WX_Facts')), 'chains' => PX::sheet('I2_WX_Chains', $by('I2_WX_Chains')), 'mapstack' => PX::sheet('I2_WX_MapStack', $by('I2_WX_MapStack')), 'opps' => PX::sheet('I2_WX_Opportunities', $by('I2_WX_Opportunities'))],
            'economics' => array_map(fn ($u) => ['id' => $u['ID'], 'pack' => $u['Pack'], 'irr' => $u['Project IRR']], $by('BW_UnitEconomics')),
            'regchange' => PX::sheet('BW_RegChange', $by('BW_RegChange')),
            'worked' => $head,
            'premium' => array_values(array_filter(array_map(fn ($c) => $premium[$c] ?? null, $pbMap[$code] ?? []))),
            'map' => PX::mapPayload(false),
            'heat' => collect($cov)->countBy('Place ID'),
            'townCount' => collect($rl)->countBy('Place ID'),
            'brief' => PX::service('AAB-EMB-193'),
            'rail' => PX::services(array_values(array_filter([$calc[$code] ?? null, 'AAB-EMB-116', 'AAB-EMB-117', 'AAB-EMB-118', 'AAB-EMB-120', 'AAB-EMB-121', 'AAB-EMB-124', 'AAB-EMB-185']))),
        ], 'Sector Profile');
    }

    private function saSector(Request $request, Sector $sector): Response
    {
        $provinceSlug = $request->query('province', $this->selection($request)['province'] ?? 'gauteng');
        $province = Province::query()->where('slug', $provinceSlug)->first();
        $this->select($request, ['sector' => $sector->slug, 'province' => $province?->slug]);
        $score = $sector->scores[$provinceSlug] ?? collect($sector->scores)->max();
        $evidence = $sector->profile['evidence'] ?? [];

        return $this->render($request, 'Aiim/Sector', [
            'mode' => 'sa',
            'sector' => ['slug' => $sector->slug, 'name' => $sector->name, 'icon' => $sector->icon, 'summary' => $sector->summary, 'profile' => $sector->profile, 'score' => $score, 'label' => Grades::opportunityLabel((float) $score)],
            'province' => $province?->only(['slug', 'name']),
            'grade' => Grades::grade($evidence['confidence'] ?? 80),
            'opportunities' => Project::query()->where('sector_slug', $sector->slug)->when($province, fn ($q) => $q->where('province_slug', $province->slug))->orderByDesc('score')->take(6)->get()->map(fn ($p) => Catalogue::project($p)),
            'opportunityCounts' => [
                'province' => $province ? Project::query()->whereIn('kind', ['opportunity', 'both'])->where('sector_slug', $sector->slug)->where('province_slug', $province->slug)->count() : null,
                'sector' => Project::query()->whereIn('kind', ['opportunity', 'both'])->where('sector_slug', $sector->slug)->count(),
            ],
            'saved' => $this->savedKeys($request->user()),
        ], 'Sector Profile');
    }

    /* ------------------------------------------------------------------ 17: risk and outlook */

    public function risk(Request $request): Response
    {
        if (! PX::ready()) {
            return $this->render($request, 'Aiim/Risk', ['ready' => false, 'risk' => null], 'Risk & Outlook');
        }
        $sheets = [];
        foreach (['BW_Downturn', 'BW_FX', 'BW_RegChange', 'BW_Conflicts', 'BW_DataGaps', 'BW_ClosedGaps', 'BW_Freshness', 'BW_Macro', 'BW_Challenge'] as $n) {
            $sheets[$n] = PX::sheet($n);
        }

        return $this->render($request, 'Aiim/Risk', [
            'ready' => true,
            'risk' => [
                'infl' => PX::pct(PX::mac('MAC-F6')),
                'shocks' => PX::reg('BW_Shocks'),
                'downturn' => array_slice(PX::slice('H-6'), 1),
                'fxNote' => PX::para('H-2', 'Body Text'),
                'part0' => array_values(array_filter(PX::slice('PART 0'), fn ($b) => ($b['t'] ?? '') === 'p' && ($b['s'] ?? '') !== 'Heading 1')),
                'sheets' => $sheets,
                'brief' => PX::service('AAB-EMB-196'),
                'rail' => PX::services(['AAB-EMB-152', 'AAB-EMB-153', 'AAB-EMB-154', 'AAB-EMB-155', 'AAB-EMB-156', 'AAB-EMB-157', 'AAB-EMB-159', 'AAB-EMB-177']),
            ],
            'initialTab' => (string) $request->query('tab', ''),
        ], 'Risk & Outlook');
    }

    /* ------------------------------------------------------------------ 18: source and evidence preview */

    public function source(Request $request, Source $source): Response
    {
        $profile = $source->profile ?? [];
        $premium = $profile['premium'] ?? false;
        $entitled = (bool) $this->entitled($request->user(), 'source', $source->code);
        $ev = null;
        if (PX::ready()) {
            $all = array_merge(PX::reg('BW_Facts'), PX::reg('BW_Macro'));
            $g = collect($all)->countBy(fn ($f) => (string) $f['Grade']);
            $ev = [
                'grades' => ['3' => (int) ($g['3'] ?? 0), '2' => (int) ($g['2'] ?? 0), '1' => (int) ($g['1'] ?? 0)],
                'interpretation' => PX::table('Interpretation Control', 0),
                'facts' => PX::sheet('BW_Facts'),
                'sources' => PX::sheet('BW_Sources'),
                'verify' => PX::sheet('BW_VerifyLog'),
                'validator' => PX::sheet('BW_Validator'),
                'cpds' => PX::sheet('BW_CPDS'),
                'wx' => PX::sheet('I2_Sources_WorkedExamples'),
                'pack' => PX::service('AAB-EMB-110'),
                'rail' => PX::services(['AAB-EMB-091', 'AAB-EMB-092', 'AAB-EMB-110', 'AAB-EMB-203', 'AAB-EMB-243']),
            ];
        }
        $fact = (string) $request->query('fact', '');

        return $this->render($request, 'Aiim/Source', [
            'source' => Catalogue::source($source, true),
            'access' => [
                'premium' => $premium,
                'entitled' => $entitled,
                'status' => $request->user() ? 'Included' : 'Sign in required',
                'level' => $entitled ? 'Full' : 'Preview',
                'premiumContent' => $entitled || ! $premium ? 'Unlocked' : 'Locked',
            ],
            'usedBy' => [
                'projects' => Project::query()->where('source_code', $source->code)->get(['slug', 'name'])->all(),
            ],
            'saved' => $this->savedKeys($request->user()),
            'evidence' => $ev,
            // Evidence drawer for one fact (?fact=BW-MAC-F1); reloaded on its own when a fact link is clicked.
            'fact' => $fact !== '' && PX::ready() ? (PX::factDetail($fact) ?? ['missing' => $fact]) : null,
        ], 'Source & Evidence');
    }

    public function methodology(Request $request): Response
    {
        return $this->render($request, 'Aiim/Methodology', [
            'grades' => Grades::confidenceGrades(),
            'tiers' => Grades::sourceTiers(),
            'verification' => Grades::verificationStates(),
            'threshold' => Grades::SELLABILITY_THRESHOLD,
            'sources' => Source::query()->orderBy('tier')->orderByDesc('confidence')->get()->map(fn ($s) => Catalogue::source($s)),
            'counts' => ['projects' => Project::count(), 'organisations' => Organisation::count(), 'corridors' => Corridor::count(), 'briefs' => Brief::count()],
        ], 'Methodology');
    }
}
