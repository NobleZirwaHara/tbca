<?php

namespace App\Http\Controllers\Industries;

use App\Http\Controllers\Controller;
use App\Support\Industries\IndustryData as D;
use App\Support\Industries\IndustryState;
use App\Support\Industries\IndustryView;
use App\Support\Industries\Journey;
use App\Support\Industries\ServerTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Industries admin console P27 to P35 (prototype pages-ind-admin.js), behind the staff gate.
 */
class AdminController extends Controller
{
    public const MOD = [1 => 0.9, 2 => 1.0, 3 => 1.1, 4 => 1.2, 5 => 1.35];

    private function base(): array
    {
        return IndustryView::base() + ['match' => D::matchStats()];
    }

    public function overview(): Response
    {
        return Inertia::render('Industries/Admin/Overview', $this->base() + [
            'total' => count(D::sprints()), 'ruleHits' => count(array_filter(D::sprints(), fn ($s) => $s['blk'])), 'reserved' => count(D::meta('reserved') ?? []),
        ]);
    }

    public function taxonomy(Request $request): Response
    {
        $sel = D::industry($request->query('ind')) ?? D::industries()['AGR'];

        return Inertia::render('Industries/Admin/Taxonomy', $this->base() + [
            'all' => array_values(array_map(fn ($x) => ['code' => $x['code'], 'name' => $x['name'], 'subs' => $x['subs']], D::industries())),
            'sel' => IndustryView::industry($sel), 'total' => count(D::sprints()), 'cxCount' => D::meta('cx_count'), 'cxn' => D::meta('cxn'), 'aiimNames' => D::AIIM_NAMES,
        ]);
    }

    public function classification(Request $request): Response|HttpResponse
    {
        $fams = D::fams();
        $inds = D::industries();
        $rows = [];
        foreach (D::sprints() as $s) {
            $apps = 0;
            $core = [];
            foreach ($inds as $x) {
                $w = D::famW($x, $s['fam']);
                $apps += $w >= 2 ? 1 : 0;
                if ($w >= 3) {
                    $core[] = $x;
                }
            }
            $rows[] = ['code' => $s['code'], 'name' => $s['name'], 'type' => $s['type'], 'family' => $fams[$s['fam']] ?? $s['fam'], 'cxl' => D::cxName($s['cx']), 'cx' => $s['cx'],
                'primary' => count($core) === 1 ? $core[0]['name'] : ($core ? 'Multi-industry ('.count($core).')' : 'Cross-industry support'),
                'core' => $core ? implode(', ', array_column($core, 'code')) : '—', 'apps' => $apps, 'rule' => $s['blk'] ?: '—', 'inApp' => $s['app'] ? 'Matched' : 'Not in app catalogue', 'ep' => $s['ep']];
        }
        $search = ['code', 'name', 'type', 'family', 'primary', 'core', 'rule', 'inApp'];
        $sortKeys = ['code', 'name', 'type', 'family', 'cx', 'primary', 'core', 'apps', 'rule', 'inApp', 'ep'];
        if ($request->query('csv')) {
            return ServerTable::csv('sprint-classification', $rows, $request, $search, $sortKeys, ['Code' => 'code', 'Sprint' => 'name', 'Type' => 'type', 'Family' => 'family', 'Complexity' => 'cxl', 'Primary industry' => 'primary', 'Core for' => 'core', 'Applicable (of 17)' => 'apps', 'Rule' => 'rule', 'App Sprint record' => 'inApp', 'App price from (ZAR)' => 'ep']);
        }
        $fc = D::meta('fam_count') ?? [];
        arsort($fc);

        return Inertia::render('Industries/Admin/Classification', $this->base() + [
            'kpi' => ['sprints' => count($rows), 'single' => count(array_filter($rows, fn ($r) => $r['core'] !== '—' && ! str_contains($r['core'], ','))), 'hits' => count(array_filter($rows, fn ($r) => $r['rule'] !== '—'))],
            'famBars' => array_map(fn ($f, $n) => ['label' => $f.' · '.($fams[$f] ?? $f), 'n' => $n], array_keys($fc), $fc),
            'table' => ServerTable::make($rows, $request, $search, ['family', 'cxl', 'type', 'primary', 'inApp'], $sortKeys),
        ]);
    }

    public function margin(Request $request): Response|HttpResponse
    {
        $ind = D::industry($request->query('ind'));
        $target = 0.25;
        $fams = D::fams();
        $rows = [];
        $noPrice = 0;
        foreach (D::sprints() as $s) {
            if (! $s['viable'] || ($ind && ! D::applies($ind, $s))) {
                continue;
            }
            $price = $s['ep'];
            if (! $price) {
                $noPrice++;

                continue;
            }
            $cost = (int) ($s['cost'][$s['entry']] ?? 0);
            $mod = (self::MOD[$s['cx']] ?? 1) * ($ind ? ($ind['cx'] >= 4 ? 1.1 : ($ind['cx'] === 3 ? 1.05 : 1)) : 1);
            $adj = $cost * $mod;
            $floor = $adj * (1 + $target);
            $gp = $price ? ($price - $adj) / $price : 0;
            $rows[] = ['code' => $s['code'], 'name' => $s['name'], 'cxl' => D::cxName($s['cx']), 'cx' => $s['cx'], 'family' => $fams[$s['fam']] ?? $s['fam'], 'tier' => $s['entry'], 'cost' => $cost, 'mod' => round($mod, 4), 'adj' => (int) round($adj), 'floor' => (int) round($floor), 'price' => $price, 'gp' => round($gp, 4),
                'status' => $price < $adj ? 'Below cost' : ($price < $floor ? 'Below floor' : ($price < $floor * 1.05 ? 'At floor' : 'Above floor'))];
        }
        $search = ['code', 'name', 'cxl', 'family', 'status'];
        $sortKeys = ['code', 'name', 'cx', 'cost', 'mod', 'adj', 'floor', 'price', 'gp', 'status'];
        if ($request->query('csv')) {
            return ServerTable::csv('margin-console', $rows, $request, $search, $sortKeys, ['Code' => 'code', 'Sprint' => 'name', 'Class' => 'cxl', 'Tier' => 'tier', 'Base cost (ZAR)' => 'cost', 'Modifier' => 'mod', 'Adjusted cost' => 'adj', 'Floor' => 'floor', 'Selling price' => 'price', 'Margin' => 'gp', 'Status' => 'status']);
        }
        $cnt = array_count_values(array_column($rows, 'status'));

        return Inertia::render('Industries/Admin/Margin', $this->base() + [
            'sel' => $ind ? ['code' => $ind['code'], 'name' => $ind['name']] : null, 'cnt' => $cnt, 'n' => count($rows), 'noPrice' => $noPrice,
            'avg' => $rows ? array_sum(array_column($rows, 'gp')) / count($rows) : 0, 'mods' => self::MOD, 'cxn' => D::meta('cxn'),
            'table' => ServerTable::make($rows, $request, $search, ['cxl', 'status', 'family'], $sortKeys),
        ]);
    }

    public function blocked(Request $request): Response|HttpResponse
    {
        $rules = D::rules();
        $name = fn ($k) => D::industry($k)['name'] ?? $k;
        $rows = array_map(fn ($r) => ['code' => $r['code'], 'name' => $r['name'], 'ind' => $name($r['ind']), 'type' => $r['type'], 'reason' => $r['reason'], 'msg' => $r['msg'], 'status' => 'Active', 'src' => 'Reserved (mock-up register)'], D::meta('reserved') ?? []);
        foreach (D::sprints() as $s) {
            if (! $s['blk']) {
                continue;
            }
            foreach (explode(',', $s['blk']) as $id) {
                $r = $rules[trim($id)] ?? null;
                if ($r) {
                    $rows[] = ['code' => $s['code'], 'name' => $s['name'], 'ind' => $r['inds'] === '*' ? 'All industries' : implode(', ', array_map($name, (array) $r['inds'])), 'type' => $r['type'], 'reason' => $r['reason'], 'msg' => $r['msg'], 'status' => 'Active', 'src' => $r['id']];
                }
            }
        }
        $search = ['code', 'name', 'ind', 'type', 'reason', 'msg', 'src'];
        $sortKeys = ['code', 'name', 'ind', 'type', 'reason', 'msg', 'src', 'status'];
        if ($request->query('csv')) {
            return ServerTable::csv('blocked-register', $rows, $request, $search, $sortKeys, ['Code' => 'code', 'Sprint' => 'name', 'Industry' => 'ind', 'Type' => 'type', 'Reason' => 'reason', 'Client message' => 'msg', 'Rule' => 'src', 'Status' => 'status']);
        }
        $cnt = array_count_values(array_column($rows, 'type'));

        return Inertia::render('Industries/Admin/Blocked', $this->base() + [
            'cnt' => $cnt, 'n' => count($rows), 'total' => count(D::sprints()), 'rules' => array_values($rules), 'hits' => D::meta('block_hits'),
            'table' => ServerTable::make($rows, $request, $search, ['type', 'src'], $sortKeys),
        ]);
    }

    public function regulators(Request $request): Response
    {
        $c = D::country((string) $request->query('iso', 'BWA')) ?? D::country('BWA');
        $seen = [];
        foreach (D::industries() as $x) {
            foreach (D::regulators($x, $c) as $r) {
                if (! isset($seen[$r['name']])) {
                    $seen[$r['name']] = $r + ['inds' => []];
                }
                $seen[$r['name']]['inds'][$x['name']] = true;
            }
        }
        $rows = array_values(array_map(fn ($r) => ['name' => $r['name'], 'type' => $r['type'], 'what' => $r['what'], 'time' => $r['time'], 'status' => $r['status'], 'src' => $r['src'], 'sectors' => implode(', ', array_keys($r['inds'])), 'n' => count($r['inds'])], $seen));

        return Inertia::render('Industries/Admin/Regulators', $this->base() + ['country' => $c, 'rows' => $rows]);
    }

    private function queue(): array
    {
        $st = IndustryState::global('mdq', []);
        $rules = D::rules();
        $rows = [];
        $i = 0;
        foreach (D::sprints() as $s) {
            if (! $s['blk']) {
                continue;
            }
            $r = $rules[explode(',', $s['blk'])[0]];
            $sus = $r['inds'] === '*' ? 'Professional Services' : D::industry($r['inds'][0])['name'];
            $rows[] = ['id' => sprintf('MDV-2026-%04d', 201 + $i), 'code' => $s['code'], 'name' => $s['name'], 'declared' => 'General business', 'suspected' => $sus,
                'pri' => $r['type'] === 'Blocked' || preg_match('/FAIS|regulated/i', $r['reason']) ? 'High' : ($i % 3 ? 'Medium' : 'Low'),
                'status' => $st[$i] ?? ['Under review', 'Information requested', 'Assigned', 'Pending evidence'][$i % 4], 'due' => now()->addDays(2 + ($i % 9))->format('d M Y'), 'i' => $i];
            if (++$i >= 40) {
                break;
            }
        }

        return $rows;
    }

    public function misdeclaration(): Response
    {
        return Inertia::render('Industries/Admin/Misdeclaration', $this->base() + ['rows' => $this->queue()]);
    }

    public function resolve(Request $request): RedirectResponse
    {
        $i = (int) $request->validate(['i' => 'required|integer|min:0|max:39'])['i'];
        $st = IndustryState::global('mdq', []);
        $st[$i] = 'Resolved — reclassified';
        IndustryState::putGlobal('mdq', $st);

        return back()->with('success', 'Case resolved · industry, controls and fees updated (simulation)');
    }

    public function benchmarks(): Response
    {
        $yes = [];
        foreach (DB::table('ind_states')->where('key', 'icons')->where('scope', 'like', 'u:%')->pluck('value') as $v) {
            foreach ((array) json_decode($v, true) as $code => $choice) {
                if ($choice === 'yes') {
                    $yes[$code] = ($yes[$code] ?? 0) + 1;
                }
            }
        }
        $ue = D::register('BW_UnitEconomics');
        $rows = array_values(array_map(fn ($x) => [
            'ind' => $x['name'], 'bench' => $x['code'] === 'AGR' ? 'Gross margin (%)' : ($x['code'] === 'FIN' ? 'Cost to serve' : ($x['code'] === 'MFG' ? 'Labour productivity' : 'Operating margin (%)')),
            'n' => $yes[$x['code']] ?? 0, 'nmin' => $x['cx'] >= 4 ? 30 : 20, 'k' => $x['cx'] >= 4 ? 7 : 5, 'div' => $x['cx'] >= 4 ? 70 : 60,
            'supp' => $x['cx'] >= 4 ? 'No cell < 7; no client > 15 %' : 'No cell < 5; no client > 20 %', 'status' => ($yes[$x['code']] ?? 0) >= 20 ? 'Eligible' : 'Below threshold', 'ue' => count(D::bySec($ue, $x)),
        ], D::industries()));

        return Inertia::render('Industries/Admin/Benchmarks', $this->base() + ['rows' => $rows]);
    }

    public function pipeline(): Response
    {
        $rows = array_values(array_map(function ($x) {
            $cov = $x['stats']['mapped'] ? (int) round(100 * $x['stats']['approved'] / $x['stats']['mapped']) : 0;

            return ['code' => $x['code'], 'slug' => $x['slug'], 'name' => $x['name'], 'cat' => $x['cat'], 'stage' => 'S8 Live & optimising', 'score' => (int) round(0.5 * 100 + 0.3 * $cov + 0.2 * min(100, $x['stats']['diagnostics'] * 3)), 'cov' => $cov, 'sprints' => $x['stats']['mapped'], 'act' => $x['stats']['sellable']];
        }, D::industries()));

        return Inertia::render('Industries/Admin/Pipeline', $this->base() + ['rows' => $rows]);
    }

    public function whatsapp(Request $request): Response
    {
        $e = Journey::get();

        return Inertia::render('Industries/Admin/WhatsApp', $this->base() + ['flow' => (string) $request->query('flow', 'WA-IN-001'), 'ref' => $e['ref'] ?? 'IND-AGR-BWA-001', 'due' => now()->addDays(7)->format('d M Y')]);
    }
}
