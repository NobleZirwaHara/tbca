<?php

namespace App\Http\Controllers\Industries;

use App\Http\Controllers\Controller;
use App\Support\Industries\IndustryData as D;
use App\Support\Industries\IndustryState;
use App\Support\Industries\IndustryView;
use App\Support\Industries\ServerTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Industry pages (prototype #/i/{code}/...): overview P03 with variants P04/P05, services,
 * diagnostic P06, benchmarks P07, sector intelligence P08, partners P10, 54-country list,
 * value chains, opportunity register, products and HS codes, unit economics, regulators,
 * limitations P12/P14, verification P15 and re-classification P16.
 */
class IndustryController extends Controller
{
    /** Resolve {industry} (slug or code) and remember it in the IndustryContext. */
    public static function resolve(string $key, Request $request, string $suffix = ''): array|RedirectResponse
    {
        $ind = D::industry($key);
        abort_unless($ind, 404);
        if ($ind['slug'] !== $key) {
            return redirect('/industries/'.$ind['slug'].$suffix.($request->getQueryString() ? '?'.$request->getQueryString() : ''), 301);
        }
        $ctx = IndustryState::context();
        $patch = [];
        if (($ctx['ind'] ?? null) !== $ind['code']) {
            $patch['ind'] = $ind['code'];
        }
        if ($request->query('sub') && D::sub($ind, (string) $request->query('sub'))) {
            $patch['sub'] = (string) $request->query('sub');
        }
        if ($request->query('iso') && ($c = D::country((string) $request->query('iso')))) {
            $patch['iso'] = $c['iso3'];
        }
        if ($patch) {
            IndustryState::setContext($patch);
        }

        return $ind;
    }

    private function cards(array $ind, array $list): array
    {
        return array_map(fn ($s) => D::card($ind, $s), $list);
    }

    /* ------------------------------------------------------------------ P03 overview */
    public function show(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request);
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $base = IndustryView::base($ind);
        $iso = $base['ctx']['country']['iso3'];
        $counts = D::familyCounts($ind);
        $fam = D::fams();
        arsort($ind['w']);
        $opps = D::bySec(D::register('I2_Opportunity_Register'), $ind);
        $top10 = collect(D::countries())->map(fn ($c) => ['iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name']] + D::score($ind, $c['iso3']))->sortByDesc('s')->take(10)->values();
        $brief = D::sprint('TBCA-D-0604');

        return Inertia::render('Industries/Overview', $base + [
            'band' => D::band($base['ctx']['score']),
            'families' => array_map(fn ($f, $w) => ['fam' => $f, 'name' => $fam[$f] ?? $f, 'w' => $w, 'n' => $counts[$f] ?? 0], array_keys(array_slice($ind['w'], 0, 6, true)), array_slice($ind['w'], 0, 6, true)),
            'diags' => $this->cards($ind, D::pickSprints($ind, ['type' => 'Diagnostic', 'n' => 5])),
            'brief' => $brief ? D::card($ind, $brief) : null,
            'counts' => ['opps' => count($opps), 'bwOpps' => count(D::bySec(D::register('BW_Priority'), $ind)), 'facts' => count(D::bySec(D::register('BW_Facts'), $ind))],
            'keyOpps' => array_slice(array_merge(
                array_map(fn ($r) => [$r['Opportunity'], "BW Top 30 · rank {$r['Rank']} · tier {$r['Tier']}", '/industries/'.$ind['slug'].'/opps?tab=bw'], array_slice(D::bySec(D::register('BW_Top30'), $ind), 0, 3)),
                array_map(fn ($r) => [$r['Opportunity'], "{$r['Asset/Commodity']} · {$r['Investment model']}", '/industries/'.$ind['slug'].'/opps'], array_slice($opps, 0, 6)),
            ), 0, 6),
            'top10' => $top10,
            'map' => D::mapValues($ind),
            'shelf' => $this->cards($ind, D::pickSprints($ind)),
            'aiimNames' => D::AIIM_NAMES,
        ]);
    }

    /* ------------------------------------------------------------------ services and Sprints */
    public function services(Request $request, string $industry): Response|RedirectResponse|HttpResponse
    {
        $ind = self::resolve($industry, $request, '/services');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $fams = D::fams();
        $famFilter = $request->query('fam');
        $rows = [];
        foreach (D::sprints() as $s) {
            if (! D::applies($ind, $s) || ($famFilter && $s['fam'] !== $famFilter)) {
                continue;
            }
            $b = D::blockFor($ind, $s);
            $status = $b ? $b[0]['type'] : ($s['viable'] && $s['pop'] === 'PUBLISHED' ? ($s['app'] ? 'Sellable' : 'Not in app catalogue') : ($s['pop'] === 'PUBLISHED' ? 'Not viable' : 'Embedded / internal'));
            $rows[] = ['code' => $s['code'], 'name' => $s['name'], 'type' => $s['type'], 'family' => $fams[$s['fam']] ?? $s['fam'], 'core' => D::famW($ind, $s['fam']) >= 3 ? 'Core' : 'Supporting',
                'cxl' => D::cxName($s['cx']), 'cx' => $s['cx'], 'status' => $status, 'ep' => ! $b && D::priced($s) ? $s['ep'] : null];
        }
        $search = ['code', 'name', 'type', 'family', 'core', 'cxl', 'status'];
        $sortKeys = ['code', 'name', 'type', 'family', 'core', 'cx', 'status', 'ep'];
        if ($request->query('csv')) {
            return ServerTable::csv('sprints-'.$ind['code'], $rows, $request, $search, $sortKeys, ['Code' => 'code', 'Sprint' => 'name', 'Type' => 'type', 'Family' => 'family', 'Fit' => 'core', 'Complexity' => 'cxl', 'Status' => 'status', 'From (ZAR)' => 'ep']);
        }
        $st = array_count_values(array_column($rows, 'status'));

        return Inertia::render('Industries/Services', IndustryView::base($ind) + [
            'fam' => $famFilter ? ['code' => $famFilter, 'name' => $fams[$famFilter] ?? $famFilter] : null,
            'kpi' => ['mapped' => count($rows), 'sellable' => $st['Sellable'] ?? 0, 'restricted' => $st['Restricted'] ?? 0, 'blocked' => $st['Blocked'] ?? 0, 'unmatched' => $st['Not in app catalogue'] ?? 0],
            'shelf' => $this->cards($ind, D::pickSprints($ind)),
            'table' => ServerTable::make($rows, $request, $search, ['family', 'type', 'cxl', 'status', 'core'], $sortKeys),
        ]);
    }

    /* ------------------------------------------------------------------ P06 diagnostic */
    public function diagnostic(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/diagnostic');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $base = IndustryView::base($ind);
        $c = $base['ctx']['country'];
        $checks = $c['iso3'] === 'BWA'
            ? array_map(fn ($p) => [(string) $p['Permits'], $p['Issuer'].' · '.$p['Typical time']], D::bySec(D::register('BW_Permits'), $ind))
            : array_map(fn ($r) => [$r.' registration / licence', 'Named body confirmed by the '.$c['name'].' pack '], D::IND_REG_ROLE[$ind['code']] ?? []);
        $checks[] = ['Tax registration and VAT '.($c['vat'] === null ? '(no VAT)' : rtrim(rtrim(number_format($c['vat'], 2, '.', ''), '0'), '.').' %'), 'Revenue authority'];
        $checks[] = ['Data-protection compliance', 'Data protection authority'];

        return Inertia::render('Industries/Diagnostic', $base + [
            'state' => IndustryState::get('diag-'.$ind['code'], ['step' => 0, 'prof' => (object) [], 'ans' => (object) []]),
            'step' => $request->query('step') !== null ? (int) $request->query('step') : null,
            'chains' => array_map(fn ($r) => ['chain' => $r['Chain'], 'q' => $r['Question'], 'info' => $r['Information types']], array_slice(D::bySec(D::register('BW_Chains'), $ind), 0, 6)),
            'checks' => $checks,
            'candidates' => $this->cards($ind, D::pickSprints($ind, ['n' => 30, 'minW' => 0])),
            'aiimNames' => D::AIIM_NAMES,
        ]);
    }

    /* ------------------------------------------------------------------ P07 benchmarks */
    public function benchmarks(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/benchmarks');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }

        return Inertia::render('Industries/Benchmarks', IndustryView::base($ind) + [
            'ue' => array_map(fn ($r) => ['id' => $r['ID'], 'margin' => $r['Margin'], 'irr' => $r['Project IRR'] ?? null, 'pay' => $r['Payback yrs'] ?? null, 'capex' => $r['Capex US$ m'] ?? null], D::bySec(D::register('BW_UnitEconomics'), $ind)),
            'mine' => IndustryState::get('bm-'.$ind['code'], (object) []),
            'consent' => IndustryState::get('icons', [])[$ind['code']] ?? null,
        ]);
    }

    /* ------------------------------------------------------------------ P08 sector intelligence */
    public function intelligence(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/intelligence');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $tab = in_array($request->query('tab'), ['facts', 'exec', 'market', 'opps', 'policy', 'risks', 'trade', 'sources', 'method'], true) ? $request->query('tab') : 'facts';
        $facts = D::bySec(D::register('BW_Facts'), $ind);
        $opps = D::bySec(D::register('I2_Opportunity_Register'), $ind);
        $pri = D::bySec(D::register('BW_Priority'), $ind);
        $isos = array_keys(D::countries());
        $scores = array_map(fn ($iso) => D::score($ind, $iso), array_combine($isos, $isos));
        $avg = array_sum(array_column($scores, 's')) / max(1, count($scores));
        $totE = array_sum(array_column($scores, 'e'));
        $t = D::trade();
        $gs = $ind['hs'];
        $factIds = array_flip(array_map(fn ($f) => (string) $f['Fact ID'], $facts));
        $srcs = array_values(array_filter(D::register('BW_Sources'), fn ($s) => (bool) array_intersect(preg_split('/[,;\s]+/', (string) $s['Fact IDs']), array_keys($factIds))));
        $cn = fn ($iso) => D::country($iso);
        $pack = fn ($iso, $s) => ['iso3' => $iso, 'name' => $cn($iso)['name'], 'slug' => $cn($iso)['slug'], 'iso2' => $cn($iso)['iso2']] + $s;
        $ranked = $scores;
        uasort($ranked, fn ($a, $b) => $b['s'] <=> $a['s']);

        $data = ['tab' => $tab, 'kpi' => ['avg' => $avg, 'totE' => $totE, 'opps' => count($opps), 'facts' => count($facts), 'grade3' => count(array_filter($facts, fn ($f) => (string) $f['Grade'] === '3')), 'srcs' => count($srcs)],
            'goods' => (bool) $gs, 'brief' => ($b = D::sprint('TBCA-D-0604')) ? D::card($ind, $b) : null, 'ctxIso' => IndustryView::ctx()['c']];
        if ($tab === 'facts') {
            $data['facts'] = $facts;
        } elseif ($tab === 'exec' || $tab === 'trade') {
            $flows = [];
            if ($gs) {
                foreach ($t['flows'] as $a => $row) {
                    foreach ($row as $b2 => $f) {
                        $v = array_sum(array_map(fn ($g) => $f[$g] ?? 0, $gs));
                        if ($v > 0) {
                            $flows[] = [$a, $b2, $v];
                        }
                    }
                }
                usort($flows, fn ($x, $y) => $y[2] <=> $x[2]);
            }
            $data['flows'] = array_map(fn ($f) => ['from' => $pack($f[0], []), 'to' => $pack($f[1], []), 'v' => $f[2]], array_slice($flows, 0, 15));
            $data['top5'] = array_map(fn ($iso) => $cn($iso)['name'], array_slice(array_keys($ranked), 0, 5));
            $data['groups'] = array_map(fn ($g) => D::short($t['groups'][$g]), $gs);
            $data['oppsAll54'] = count(array_filter($opps, fn ($o) => str_contains((string) $o['Country scope'], 'All 54')));
            $data['pri'] = count($pri);
            $data['priA'] = count(array_filter($pri, fn ($r) => str_contains((string) $r['Tier'], 'A')));
            $data['regulated'] = $ind['variant'] === 'Highly regulated';
        } elseif ($tab === 'market') {
            $all = array_map(fn ($iso) => $pack($iso, $scores[$iso]), $isos);
            usort($all, fn ($a, $b) => $b['e'] <=> $a['e']);
            $data['exporters'] = array_slice($all, 0, 10);
            usort($all, fn ($a, $b) => $b['m'] <=> $a['m']);
            $data['importers'] = array_slice($all, 0, 10);
        } elseif ($tab === 'opps') {
            $sub = [];
            foreach ($pri as $r) {
                $sub[$r['Sector']][] = (float) $r['Score'];
            }
            $data['subScores'] = array_map(fn ($k, $v) => ['label' => D::AIIM_NAMES[$k] ?? $k, 'avg' => array_sum($v) / count($v)], array_keys($sub), $sub);
            $data['opps'] = $opps;
        } elseif ($tab === 'policy') {
            $ids = array_flip(array_map(fn ($r) => (string) $r['Opp ID'], $pri));
            $data['policy'] = array_values(array_filter(D::register('BW_Policy'), fn ($r) => (bool) array_intersect(preg_split('/[,;\s]+/', (string) $r['Templates']), array_keys($ids))));
            $data['regChange'] = array_values(array_filter(D::register('BW_RegChange'), fn ($r) => collect($ind['aiim'])->contains(fn ($k) => str_contains((string) $r['Sector'], $k)) || strtolower((string) $r['Sector']) === 'all'));
        } elseif ($tab === 'risks') {
            $data['shocks'] = D::bySec(D::register('BW_Shocks'), $ind);
        } elseif ($tab === 'sources') {
            $data['sources'] = $srcs;
        } elseif ($tab === 'method') {
            $data['basis'] = D::meta('score_basis');
            $data['tradeBasis'] = $t['basis'];
        }

        return Inertia::render('Industries/Intelligence', IndustryView::base($ind) + $data);
    }

    /* ------------------------------------------------------------------ P10 partners */
    public const PCATS = [
        'AGR' => ['Agricultural Advisory', 'Food Safety & Quality', 'Veterinary & Animal Health', 'Supply Chain & Logistics', 'Finance & Funding', 'Environmental Services'],
        'MIN' => ['Geology & Exploration', 'Mining Engineering', 'Environmental & Social', 'Mineral Law', 'Metallurgy & Beneficiation', 'Finance & Funding'],
        'ENE' => ['Power Engineering', 'Energy Regulation', 'Project Finance', 'Environmental & Social', 'Water & Utilities', 'Carbon & Climate'],
        'FIN' => ['Licensed Financial Advisers', 'Banking & Prudential', 'Insurance & Actuarial', 'Compliance & AML', 'Fintech Licensing', 'Audit & Assurance'],
        'HLT' => ['Registered Health Professionals', 'Medicines Regulatory', 'Clinical Quality', 'Health Facilities Licensing', 'Health-Tech & Data', 'Procurement & Supply'],
    ];

    public const PCAT_DEF = ['Legal Services', 'Accounting & Auditing', 'Tax Advisory', 'Engineering & Technical', 'Insurance & Risk', 'Technology & Digital'];

    public static function catFam(string $k): string
    {
        return match (true) {
            (bool) preg_match('/legal|law|regulat|licens|compliance/i', $k) => 'L',
            (bool) preg_match('/account|audit|tax|actuar/i', $k), (bool) preg_match('/finance|fund|bank|insur/i', $k) => 'F',
            (bool) preg_match('/engineer|technical|metallurg|power|water/i', $k) => 'P',
            (bool) preg_match('/environment|carbon|climate|social/i', $k) => 'S',
            (bool) preg_match('/tech|digital|data/i', $k) => 'T',
            (bool) preg_match('/supply|logistic|procure/i', $k) => 'O',
            (bool) preg_match('/quality|safety|clinical/i', $k) => 'Q',
            default => 'G',
        };
    }

    public function partners(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/partners');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $cats = array_slice(array_merge(self::PCATS[$ind['code']] ?? [], self::PCAT_DEF), 0, 12);
        $pd = array_values(array_filter(D::sprints(), fn ($s) => $s['type'] === 'Partner-Delivered Sprint' && D::applies($ind, $s) && $s['viable']));
        $fams = D::fams();

        return Inertia::render('Industries/Partners', IndustryView::base($ind) + [
            'cats' => array_map(fn ($k) => ['name' => $k, 'n' => count(array_filter($pd, fn ($s) => $s['fam'] === self::catFam($k)))], $cats),
            'rows' => array_map(fn ($s) => ['code' => $s['code'], 'name' => $s['name'], 'family' => $fams[$s['fam']] ?? $s['fam'], 'cx' => $s['cx'], 'cxl' => D::cxName($s['cx']), 'ep' => $s['ep']], $pd),
        ]);
    }

    /* ------------------------------------------------------------------ industry x 54 countries */
    public function countries(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/countries');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $rows = [];
        foreach (D::countries() as $iso => $c) {
            $s = D::score($ind, $iso);
            $rows[] = ['iso3' => $iso, 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name'], 'region' => $c['region'], 's' => $s['s'], 'e' => $s['e'], 'im' => $s['m'], 'rank' => D::rank($ind, $iso), 'band' => D::band($s['s'])[0]];
        }

        return Inertia::render('Industries/Countries', IndustryView::base($ind) + ['rows' => $rows, 'basis' => D::meta('score_basis')]);
    }

    /* ------------------------------------------------------------------ value chains */
    public function chains(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/chains');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }

        return Inertia::render('Industries/Chains', IndustryView::base($ind) + [
            'chains' => D::bySec(D::register('BW_Chains'), $ind), 'wx' => D::bySec(D::register('I2_WX_Chains'), $ind),
            'mapStack' => D::bySec(D::register('BW_MapStack'), $ind), 'layers' => array_slice(D::bySec(D::register('I2_Map_Layers'), $ind), 0, 20),
        ]);
    }

    /* ------------------------------------------------------------------ opportunity register */
    public function opps(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/opps');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $tab = in_array($request->query('tab'), ['cont', 'bw', 'za'], true) ? $request->query('tab') : 'cont';
        $sets = ['cont' => D::bySec(D::register('I2_Opportunity_Register'), $ind), 'bw' => D::bySec(D::register('BW_Opportunities'), $ind), 'za' => D::bySec(D::register('I2_WX_Opportunities'), $ind)];

        return Inertia::render('Industries/Opps', IndustryView::base($ind) + ['tab' => $tab, 'counts' => array_map('count', $sets), 'rows' => $sets[$tab]]);
    }

    /* ------------------------------------------------------------------ products and HS */
    public function commodities(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/commodities');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $t = D::trade();

        return Inertia::render('Industries/Commodities', IndustryView::base($ind) + [
            'groups' => array_map(fn ($g) => $t['groups'][$g], $ind['hs']),
            'commodities' => D::bySec(D::register('I2_Commodity_HS'), $ind), 'products' => D::bySec(D::register('BW_Products'), $ind),
        ]);
    }

    /* ------------------------------------------------------------------ unit economics */
    public function economics(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/economics');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $ue = D::bySec(D::register('BW_UnitEconomics'), $ind);
        $ids = array_flip(array_map(fn ($r) => (string) $r['ID'], $ue));

        return Inertia::render('Industries/Economics', IndustryView::base($ind) + [
            'ue' => $ue, 'tornado' => array_values(array_filter(D::register('BW_Tornado'), fn ($r) => isset($ids[(string) $r['ID']]))),
        ]);
    }

    /* ------------------------------------------------------------------ regulators */
    public function regulators(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/regulators');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $c = IndustryView::ctx()['c'];

        return Inertia::render('Industries/Regulators', IndustryView::base($ind) + ['rows' => D::regulators($ind, $c)]);
    }

    /* ------------------------------------------------------------------ P12 / P14 limitations */
    public function limits(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/limits');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }
        $fams = D::fams();

        return Inertia::render('Industries/Limits', IndustryView::base($ind) + [
            'rules' => array_values(array_map(fn ($r) => $r + ['famName' => $r['fams'] ? ($fams[$r['fams']] ?? $r['fams']) : null], array_filter(D::meta('block_rules') ?? [], fn ($r) => $r['inds'] === '*' || in_array($ind['code'], (array) $r['inds'], true)))),
            'reserved' => array_values(array_filter(D::meta('reserved') ?? [], fn ($r) => $r['ind'] === $ind['code'])),
        ]);
    }

    /* ------------------------------------------------------------------ P15 verification */
    public static function verifyData(array $ind): array
    {
        $c = IndustryView::ctx()['c'];
        $key = 'ver-'.$ind['code'].'-'.$c['iso3'];
        $st = IndustryState::get($key, []);
        $facts = D::bySec(D::register('BW_Facts'), $ind);
        if ($c['iso3'] === 'BWA') {
            $reqs = array_merge(
                array_map(fn ($f) => ['ev' => "Upgrade {$f['Fact ID']} to grade 3", 'desc' => "{$f['Fact']} — current value {$f['Value']} ({$f['Source']}, {$f['Date']})", 'src' => 'Official statistics / regulator', 'imp' => 'High'], array_values(array_filter($facts, fn ($f) => (float) $f['Grade'] < 3))),
                array_map(fn ($g) => ['ev' => (string) $g['Missing data'], 'desc' => 'Needed for: '.$g['Needed for'], 'src' => (string) $g['Holder'], 'imp' => (string) $g['Priority']], array_slice(D::register('BW_DataGaps'), 0, 4)),
            );
        } else {
            $reqs = array_map(fn ($f) => ['ev' => "{$c['name']} equivalent of: {$f['Fact']}", 'desc' => "Botswana reference {$f['Fact ID']}: {$f['Value']} — provide the {$c['name']} figure", 'src' => 'Official statistics / regulator', 'imp' => 'High'], array_slice($facts, 0, 8));
        }
        foreach ($reqs as $i => &$r) {
            $r['due'] = now()->addDays(10 + $i * 2)->format('d M Y');
        }
        unset($r);
        if (! $reqs) {
            $reqs[] = ['ev' => "{$ind['name']} market size and structure for {$c['name']}", 'desc' => 'Official statistics on output, employment and enterprises', 'src' => 'Statistics office', 'imp' => 'High', 'due' => now()->addDays(12)->format('d M Y')];
        }
        foreach ($reqs as $i => &$r) {
            $r += ['id' => sprintf('REQ-%s-%s-%03d', $ind['code'], $c['iso3'], $i + 1), 'file' => $st[$i] ?? null, 'i' => $i];
            $r['status'] = $r['file'] ? 'Submitted' : 'Requested';
        }
        unset($r);

        return ['reqs' => $reqs, 'stateKey' => $key, 'bw' => $c['iso3'] === 'BWA'];
    }

    public function verify(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/verify');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }

        return Inertia::render('Industries/Verify', IndustryView::base($ind) + self::verifyData($ind) + ['inWorkspace' => false]);
    }

    /* ------------------------------------------------------------------ P16 re-classification */
    public static function reclassData(array $ind): array
    {
        $ctx = IndustryView::ctx();
        $c = $ctx['c'];
        $sc = D::score($ind, $c['iso3']);
        $rc = array_values(array_filter(D::register('BW_RegChange'), fn ($r) => collect($ind['aiim'])->contains(fn ($k) => str_contains((string) $r['Sector'], $k))));
        $sh = D::bySec(D::register('BW_Shocks'), $ind);
        $shockIdx = $sh ? max(array_map(fn ($r) => (float) $r['Index'], $sh)) : 1;
        $prev = (int) round(100 - $sc['s'] * 0.6);
        $new = (int) min(95, $prev + ($c['iso3'] === 'BWA' ? 4 * count($rc) + 3 * $shockIdx : 6));
        $key = 'rcn-'.$ind['code'].'-'.$c['iso3'];

        return ['prevRisk' => $prev, 'newRisk' => $new, 'regChange' => $rc, 'shock' => $sh ? ['idx' => $shockIdx, 'rationale' => $sh[0]['Rationale']] : null, 'ack' => IndustryState::get($key), 'stateKey' => $key, 'bw' => $c['iso3'] === 'BWA'];
    }

    public function reclass(Request $request, string $industry): Response|RedirectResponse
    {
        $ind = self::resolve($industry, $request, '/reclass');
        if ($ind instanceof RedirectResponse) {
            return $ind;
        }

        return Inertia::render('Industries/Reclass', IndustryView::base($ind) + self::reclassData($ind) + ['inWorkspace' => false]);
    }
}
