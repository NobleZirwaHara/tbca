<?php

namespace App\Http\Controllers\Industries;

use App\Http\Controllers\Controller;
use App\Support\Industries\IndustryData as D;
use App\Support\Industries\IndustryState;
use App\Support\Industries\IndustryView;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Industry x Country intersection (P09) for all 17 x 54 pairs, and the industry Import and
 * Export heat maps (four views restricted to the industry's HS groups).
 */
class CountryController extends Controller
{
    private function resolve(string $industry, string $country, Request $request, string $suffix = ''): array|RedirectResponse
    {
        $ind = D::industry($industry);
        $c = D::country($country);
        abort_unless($ind && $c, 404);
        if ($ind['slug'] !== $industry || $c['slug'] !== $country) {
            return redirect("/industries/{$ind['slug']}/country/{$c['slug']}{$suffix}".($request->getQueryString() ? '?'.$request->getQueryString() : ''), 301);
        }
        $patch = ['ind' => $ind['code'], 'iso' => $c['iso3']];
        if ($request->query('sub') && D::sub($ind, (string) $request->query('sub'))) {
            $patch['sub'] = (string) $request->query('sub');
        }
        IndustryState::setContext($patch);

        return [$ind, $c];
    }

    private function pc(array $c): array
    {
        return ['iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name']];
    }

    public function show(Request $request, string $industry, string $country): Response|RedirectResponse
    {
        $r = $this->resolve($industry, $country, $request);
        if ($r instanceof RedirectResponse) {
            return $r;
        }
        [$ind, $c] = $r;
        $bw = $c['iso3'] === 'BWA';
        $za = $c['iso3'] === 'ZAF';
        $tabs = ['overview', 'subs', 'market', 'reg', 'incent', 'risks', 'tbca', ...($bw ? ['land'] : []), 'sources'];
        $tab = in_array($request->query('tab'), $tabs, true) ? $request->query('tab') : 'overview';
        $sc = D::score($ind, $c['iso3']);
        $facts = $bw ? D::bySec(D::register('BW_Facts'), $ind) : ($za ? D::bySec(D::register('I2_WX_Facts'), $ind) : []);
        $pri = $bw ? D::bySec(D::register('BW_Priority'), $ind) : [];
        $zopps = $za ? D::bySec(D::register('I2_WX_Opportunities'), $ind) : [];
        $copps = D::bySec(D::register('I2_Opportunity_Register'), $ind);
        $gs = $ind['hs'];
        $t = D::trade();
        $partners = [];
        if ($gs) {
            foreach ($t['isos'] as $x) {
                if ($x !== $c['iso3']) {
                    $in = D::flow($t, $x, $c['iso3']);
                    $out = D::flow($t, $c['iso3'], $x);
                    $partners[] = $this->pc(D::country($x)) + ['imp' => array_sum(array_map(fn ($g) => $in[$g], $gs)), 'exp' => array_sum(array_map(fn ($g) => $out[$g], $gs))];
                }
            }
        }
        $topI = $partners;
        usort($topI, fn ($a, $b) => $b['imp'] <=> $a['imp']);
        $topE = $partners;
        usort($topE, fn ($a, $b) => $b['exp'] <=> $a['exp']);
        $subRows = array_map(function ($s) use ($pri, $copps) {
            $p = D::inSectors($pri, $s['aiim']);

            return ['code' => $s['code'], 'name' => $s['name'], 'desc' => $s['desc'], 'aiim' => array_map(fn ($k) => D::AIIM_NAMES[$k] ?? $k, $s['aiim']), 'hs' => $s['hs'],
                'avg' => $p ? array_sum(array_map(fn ($r) => (float) $r['Score'], $p)) / count($p) : null, 'n' => count($p),
                'a' => count(array_filter($p, fn ($r) => str_contains((string) $r['Tier'], 'A'))), 'tpl' => count(D::inSectors($copps, $s['aiim']))];
        }, $ind['subs']);
        $regs = D::regulators($ind, $c);

        $data = [
            'country' => $c, 'tab' => $tab, 'tabs' => $tabs, 'bw' => $bw, 'za' => $za, 'band' => D::band($sc['s']),
            'sc' => $sc, 'rank' => D::rank($ind, $c['iso3']), 'goods' => (bool) $gs, 'groups' => array_map(fn ($g) => D::short($t['groups'][$g]), range(0, count($t['groups']) - 1)),
            'kpi' => ['templates' => $bw ? count($pri) : ($za ? count($zopps) : count($copps)), 'tierA' => count(array_filter($pri, fn ($r) => str_contains((string) $r['Tier'], 'A'))), 'facts' => count($facts)],
            'topI' => array_slice($topI, 0, 8), 'topE' => array_slice($topE, 0, 8), 'subRows' => $subRows, 'coppsCount' => count($copps),
        ];
        switch ($tab) {
            case 'overview':
                $data['facts'] = array_slice($facts, 0, 6);
                $data['regs'] = array_slice($regs, 0, 7);
                $data['partnerRoutes'] = count(array_filter(D::sprints(), fn ($s) => $s['type'] === 'Partner-Delivered Sprint' && D::applies($ind, $s)));
                break;
            case 'subs':
                $data['pri'] = $pri;
                $data['zopps'] = $zopps;
                break;
            case 'market':
                $data['facts'] = $facts;
                break;
            case 'reg':
                $data['regs'] = $regs;
                $data['regChange'] = $bw ? array_values(array_filter(D::register('BW_RegChange'), fn ($r) => collect($ind['aiim'])->contains(fn ($k) => str_contains((string) $r['Sector'], $k)))) : [];
                break;
            case 'incent':
                $ids = array_flip(array_map(fn ($r) => (string) $r['Opp ID'], $pri));
                $data['policy'] = $bw ? array_values(array_filter(D::register('BW_Policy'), fn ($r) => (bool) array_intersect(preg_split('/[,;\s]+/', (string) $r['Templates']), array_keys($ids)))) : [];
                break;
            case 'risks':
                $data['shocks'] = $bw ? D::bySec(D::register('BW_Shocks'), $ind) : [];
                $data['downturn'] = $bw ? D::bySec(D::register('BW_Downturn'), $ind) : [];
                break;
            case 'tbca':
                $counts = D::familyCounts($ind);
                $w = $ind['w'];
                arsort($w);
                $data['families'] = array_map(fn ($f) => ['fam' => $f, 'name' => D::fams()[$f] ?? $f, 'n' => $counts[$f] ?? 0], array_keys($w));
                $data['shelf'] = array_map(fn ($s) => D::card($ind, $s), D::pickSprints($ind));
                break;
            case 'land':
                $leads = D::bySec(D::register('BW_Ranked_Leads'), $ind);
                $units = [];
                foreach ($leads as $l) {
                    $units[(string) $l['Unit']][] = (string) $l['Place'];
                }
                uasort($units, fn ($a, $b) => count($b) <=> count($a));
                $data['land'] = ['total' => count($leads), 'units' => array_map(fn ($u, $places) => ['unit' => $u, 'n' => count($places), 'places' => array_slice(array_values(array_unique(array_slice($places, 0, 40))), 0, 5)], array_keys(array_slice($units, 0, 12, true)), array_slice($units, 0, 12, true))];
                break;
            case 'sources':
                $ids = array_map(fn ($f) => (string) $f['Fact ID'], $facts);
                $data['sources'] = $bw ? array_values(array_filter(D::register('BW_Sources'), fn ($s) => (bool) array_intersect(preg_split('/[,;\s]+/', (string) $s['Fact IDs']), $ids))) : [];
                $data['basis'] = D::meta('score_basis');
                break;
        }

        return Inertia::render('Industries/Intersection', IndustryView::base($ind) + $data);
    }

    public const VIEWS = [1 => ['Imports vs Whole-Africa Exports', 'import', false], 2 => ['Imports vs One Partner’s Exports', 'import', true], 3 => ['Exports vs Whole-Africa Imports', 'export', false], 4 => ['Exports vs One Partner’s Imports', 'export', true]];

    public function trade(Request $request, string $industry, string $country): Response|RedirectResponse
    {
        $r = $this->resolve($industry, $country, $request, '/trade');
        if ($r instanceof RedirectResponse) {
            return $r;
        }
        [$ind, $c] = $r;
        $v = (int) $request->query('view', 1);
        $v = isset(self::VIEWS[$v]) ? $v : 1;
        [$title, $who, $needP] = self::VIEWS[$v];
        $p = $needP ? (D::country((string) $request->query('partner')) ?? D::country($c['iso3'] === 'ZAF' ? 'BWA' : 'ZAF')) : null;
        if ($p && $p['iso3'] === $c['iso3']) {
            $p = D::country($c['iso3'] === 'ZAF' ? 'BWA' : 'ZAF');
        }
        $t = D::trade();
        $gs = $ind['hs'];
        $rows = [];
        if ($gs) {
            foreach ($t['isos'] as $x) {
                if ($x === $c['iso3']) {
                    continue;
                }
                $own = $who === 'import' ? array_map(fn ($g) => D::flow($t, $x, $c['iso3'])[$g], $gs) : array_map(fn ($g) => D::flow($t, $c['iso3'], $x)[$g], $gs);
                $tot = $who === 'import' ? array_map(fn ($g) => $t['expAfrica'][$x][$g], $gs) : array_map(fn ($g) => $t['impAfrica'][$x][$g], $gs);
                $rows[] = $this->pc(D::country($x)) + ['own' => $own, 'tot' => $tot, 'o' => array_sum($own), 'T' => array_sum($tot)];
            }
            usort($rows, fn ($a, $b) => $b['o'] <=> $a['o']);
        }

        return Inertia::render('Industries/Trade', IndustryView::base($ind) + [
            'country' => $c, 'view' => $v, 'title' => $title, 'who' => $who, 'partner' => $p ? $this->pc($p) : null,
            'groups' => array_map(fn ($g) => $t['groups'][$g], $gs), 'rows' => $rows,
            'basis' => $t['basis'], 'anchors' => $t['anchors'],
        ]);
    }
}
