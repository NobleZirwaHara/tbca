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
 * Industries landing (P01), selector (P02), page instances (P04), selector component (P11),
 * the 17 x 54 heat map and the section hubs (prototype pages-ind-public.js and -public2.js).
 */
class PublicController extends Controller
{
    public function landing(Request $request): Response
    {
        $base = IndustryView::base();
        $pick = D::industry($request->query('map')) ?? D::industry(IndustryState::get('landInd')) ?? $base['ind'];
        if ($request->query('map')) {
            IndustryState::put('landInd', $pick['code']);
        }

        return Inertia::render('Industries/Landing', $base + [
            'all' => array_values(array_map(fn ($x) => ['code' => $x['code'], 'slug' => $x['slug'], 'name' => $x['name'], 'subs' => count($x['subs']), 'cat' => $x['cat'], 'variant' => $x['variant'], 'approved' => $x['stats']['approved']], D::industries())),
            'total' => (int) D::meta('total'),
            'blocked' => array_sum(D::meta('block_hits') ?? []) + count(D::meta('reserved') ?? []),
            'highlyRegulated' => count(array_filter(D::industries(), fn ($x) => $x['variant'] === 'Highly regulated')),
            'pick' => ['code' => $pick['code'], 'slug' => $pick['slug'], 'name' => $pick['name']],
            'map' => D::mapValues($pick),
        ]);
    }

    public function select(Request $request): Response
    {
        $ctx = IndustryState::context();

        return Inertia::render('Industries/Select', IndustryView::base() + [
            'all' => array_values(array_map(fn ($x) => ['code' => $x['code'], 'slug' => $x['slug'], 'name' => $x['name'], 'short' => $x['short'], 'cx' => $x['cx'], 'cxName' => D::cxName($x['cx']), 'reg' => $x['reg'], 'gate' => $x['gate'], 'cat' => $x['cat'], 'subs' => $x['subs']], D::industries())),
            'start' => ['ind' => D::industry($request->query('ind'))['code'] ?? $ctx['ind'], 'sub' => $ctx['sub'] ?? '', 'iso' => $ctx['iso'] ?? 'BWA'],
            'multi' => $request->query('multi') === '1',
            'secondary' => IndustryState::get('isec', []),
            'countryVat' => array_map(fn ($c) => $c['vat'], D::countries()),
        ]);
    }

    /** Save the IndustryContext (Verify & Continue) and open the industry page. */
    public function saveContext(Request $request): RedirectResponse
    {
        $data = $request->validate(['ind' => 'required|string|max:80', 'sub' => 'nullable|string|max:12', 'iso' => 'nullable|string|max:3', 'sec' => 'nullable|array', 'sec.*' => 'string|max:8', 'to' => 'nullable|string|max:200']);
        $ind = D::industry($data['ind']);
        abort_unless($ind, 404);
        $sub = D::sub($ind, $data['sub'] ?? null);
        $c = D::country($data['iso'] ?? null);
        IndustryState::setContext(['ind' => $ind['code'], 'sub' => $sub['code'] ?? '', 'iso' => $c['iso3'] ?? null]);
        if (array_key_exists('sec', $data)) {
            IndustryState::put('isec', array_values(array_filter($data['sec'] ?? [], fn ($k) => D::industry($k))));
        }
        $to = $data['to'] ?? null;

        return redirect($to && str_starts_with($to, '/industries') ? $to : '/industries/'.$ind['slug'])->with('success', 'IndustryContext saved · '.$ind['name']);
    }

    public function instances(): Response
    {
        $all = D::industries();
        $deep = collect($all)->first(fn ($x) => $x['cat'] === 'Deep' && $x['variant'] !== 'Highly regulated');
        $thin = collect($all)->first(fn ($x) => $x['cat'] === 'Below threshold') ?? collect($all)->first(fn ($x) => $x['cat'] === 'Thin');
        $reg = $all['FIN']['variant'] === 'Highly regulated' ? $all['FIN'] : collect($all)->first(fn ($x) => $x['variant'] === 'Highly regulated');
        $iso = IndustryState::context()['iso'] ?? 'BWA';
        $col = fn ($x) => IndustryView::industry($x) + ['score' => D::score($x, $iso)['s']];

        return Inertia::render('Industries/Instances', IndustryView::base() + ['deep' => $col($deep), 'thin' => $col($thin), 'regulated' => $col($reg)]);
    }

    public function selectorComponent(): Response
    {
        return Inertia::render('Industries/SelectorComponent', IndustryView::base() + [
            'all' => array_values(array_map(fn ($x) => ['code' => $x['code'], 'name' => $x['name'], 'cx' => $x['cx'], 'cxName' => D::cxName($x['cx']), 'reg' => $x['reg'], 'gate' => $x['gate'], 'cat' => $x['cat'], 'subs' => array_map(fn ($s) => ['code' => $s['code'], 'name' => $s['name']], $x['subs'])], D::industries())),
        ]);
    }

    public function heatmap(Request $request): Response
    {
        $metric = in_array($request->query('metric'), ['score', 'exp', 'imp'], true) ? $request->query('metric') : 'score';
        $region = in_array($request->query('region'), ['North', 'West', 'Central', 'East', 'Southern'], true) ? $request->query('region') : '';
        $sel = D::industry($request->query('ind')) ?? IndustryView::ctx()['ind'];
        $matrix = [];
        foreach (D::industries() as $code => $x) {
            foreach (D::countries() as $iso => $c) {
                $s = D::score($x, $iso);
                $matrix[$code][$iso] = [$s['s'], $s['e'], $s['m']];
            }
        }

        return Inertia::render('Industries/Heatmap', IndustryView::base() + [
            'metric' => $metric, 'region' => $region, 'sel' => $sel['code'], 'matrix' => $matrix, 'basis' => D::meta('score_basis'),
        ]);
    }

    public function hub(string $area): Response
    {
        $hubs = [
            'diagnostic' => ['Diagnostics', 'Sector-adapted diagnostics for all 17 industries: readiness, risk and routing in 15–20 minutes.', 'diagnostic', '/industries/diagnostics'],
            'intelligence' => ['Sector Intelligence', 'AIIM sector briefs: quick facts, market, opportunities, policy, risks, trade and sources.', 'intelligence', '/industries/sector-intelligence'],
            'benchmarks' => ['Benchmarks', 'Benchmark previews and the contribution route that unlocks full numeric benchmarks.', 'benchmarks', '/industries/benchmarks'],
            'partners' => ['Partners', 'Professional-route partner directories by industry — four-ledger transparent.', 'partners', '/industries/partners'],
        ];
        [$title, $desc, $path, $href] = $hubs[$area];

        return Inertia::render('Industries/Hub', IndustryView::base() + [
            'title' => $title, 'desc' => $desc, 'path' => $path, 'href' => $href,
            'all' => array_values(array_map(fn ($x) => ['code' => $x['code'], 'slug' => $x['slug'], 'name' => $x['name'], 'cat' => $x['cat'], 'variant' => $x['variant']], D::industries())),
        ]);
    }

    /** Remember the industry chosen on a tile before opening it (prototype setCtx on tile click). */
    public function pick(Request $request, string $industry): RedirectResponse
    {
        $ind = D::industry($industry);
        abort_unless($ind, 404);
        $c = D::country($request->query('iso'));
        IndustryState::setContext(['ind' => $ind['code'], 'iso' => $c['iso3'] ?? null] + ($request->query('sub') ? ['sub' => (string) $request->query('sub')] : []));
        $to = (string) $request->query('to', '');

        return redirect(str_starts_with($to, '/industries') ? $to : '/industries/'.$ind['slug']);
    }
}
