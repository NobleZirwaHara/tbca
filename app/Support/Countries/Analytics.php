<?php

namespace App\Support\Countries;

use App\Models\Countries\Corridor;
use App\Models\Countries\Country;
use App\Models\Countries\Interest;
use Illuminate\Support\Collection;

/**
 * Decision analytics for the admin consoles: bias-corrected unmet demand (Part 22),
 * the activation investment workbench with the Country #2 decision test (13.3)
 * and corridor economics (NPV / IRR / payback).
 */
class Analytics
{
    /** Bias drivers applied to raw demand (share of the total correction). */
    public const BIAS_DRIVERS = [
        ['SEO & Language Dominance', -34.1], ['Population Size Bias', -18.7], ['Internet Penetration Bias', -12.9],
        ['English Content Bias', -9.3], ['Historical Coverage Bias', -8.1], ['Other Factors', -4.2],
    ];

    /**
     * CorrectedUDR = raw index × (1 + bias adjustment), with live IntentEpisodes
     * (de-duplicated waitlist registrations) lifting the raw index by 0.002 per episode (capped at 50).
     * Raw clicks are never the activation score.
     */
    public static function demand(Collection $countries): array
    {
        $episodes = Interest::query()->selectRaw('country_id, count(*) as n')->groupBy('country_id')->pluck('n', 'country_id');

        $rows = $countries->map(function (Country $c) use ($episodes) {
            [$raw, $adj, $cats, $conf] = $c->metrics['dem'];
            $raw = round($raw + 0.002 * min(50, (int) ($episodes[$c->id] ?? 0)), 2);
            $corrected = round($raw + $adj, 2);

            return [
                'iso' => $c->iso2, 'name' => $c->name, 'slug' => $c->slug, 'state' => $c->availability_state, 'region' => $c->region,
                'raw' => $raw, 'adjustment' => $adj, 'adjustment_pct' => (int) round($adj / max($raw, 0.01) * 100),
                'corrected' => $corrected, 'categories' => $cats, 'confidence' => $conf, 'episodes' => (int) ($episodes[$c->id] ?? 0),
            ];
        })->values();

        $max = max(0.01, (float) $rows->max('corrected'));
        $rows = $rows->map(fn ($r) => [...$r, 'score' => (int) round($r['corrected'] / $max * 92)])->sortByDesc('score')->values();

        return [
            'rows' => $rows->all(),
            'high' => $rows->where('score', '>=', 70)->count(),
            'medium' => $rows->whereBetween('score', [40, 69])->count(),
            'low' => $rows->where('score', '<', 40)->count(),
            'index' => round((float) $rows->avg('corrected'), 2),
            'avg_adjustment' => round((float) $rows->avg('adjustment_pct'), 1),
            'episodes' => (int) $episodes->sum(),
        ];
    }

    public const SCENARIOS = [
        'conservative' => ['label' => 'Conservative (Base Case)', 'note' => 'Most likely outcome', 'return' => 1.0, 'cost' => 1.0],
        'optimistic' => ['label' => 'Optimistic (High Case)', 'note' => 'Upside scenario', 'return' => 1.25, 'cost' => 1.0],
        'stress' => ['label' => 'Stress (Downside Case)', 'note' => 'Risk-adjusted downside', 'return' => 0.7, 'cost' => 1.15],
    ];

    /**
     * Activation investment workbench. Each candidate runs the Country #2 test:
     * APPROVE only if hard blocks = 0, ROI >= hurdle, payback <= ceiling,
     * capital at risk <= limit and G-D9 passes. DEFER / DECLINE are valid outcomes.
     */
    public static function investment(Collection $countries, string $scenario, float $hurdle, float $paybackMax, float $capitalLimit): array
    {
        $s = self::SCENARIOS[$scenario] ?? self::SCENARIOS['conservative'];
        $rows = $countries->map(function (Country $c) use ($s, $hurdle, $paybackMax, $capitalLimit) {
            [$tier, $inv, $ret, $payback, $potential, $risk] = $c->metrics['inv'];
            $profile = CountryResolver::profile($c);
            $anchor = $c->iso2 === 'ZA';
            $invS = round($inv * $s['cost'], 1);
            $retS = round($ret * $s['return'], 1);
            $roi = $invS > 0 ? round($retS / $invS, 2) : null;
            $paybackS = $invS > 0 ? round($payback * $s['cost'] / $s['return'], 1) : null;

            $fails = [];
            if (! $anchor) {
                if ($profile['hard_blocks'] > 0) {
                    $fails[] = "{$profile['hard_blocks']} hard block(s)";
                }
                if ($profile['rcs'] < 100) {
                    $fails[] = 'G-D9 not passed (RCS '.$profile['rcs_label'].')';
                }
                if ($roi !== null && $roi < $hurdle) {
                    $fails[] = "ROI {$roi}x below hurdle {$hurdle}x";
                }
                if ($paybackS !== null && $paybackS > $paybackMax) {
                    $fails[] = "Payback {$paybackS}m above ceiling {$paybackMax}m";
                }
                if ($invS > $capitalLimit) {
                    $fails[] = "Capital R{$invS}M above limit R{$capitalLimit}M";
                }
            }

            return [
                'iso' => $c->iso2, 'name' => $c->name, 'state' => $c->availability_state, 'region' => $c->region, 'tier' => $tier,
                'investment' => $invS, 'return' => $retS, 'roi' => $roi, 'payback' => $paybackS, 'potential' => $potential, 'risk' => $risk,
                'stars' => $anchor ? 0 : max(1, min(5, (int) round($potential / 18))),
                'decision' => $anchor ? 'ANCHOR' : ($fails === [] ? 'APPROVE' : (count($fails) > 2 ? 'DEFER' : 'DEFER')),
                'reasons' => $anchor ? ['Phase 1 activated anchor country'] : $fails,
            ];
        })->sortByDesc(fn ($r) => $r['iso'] === 'ZA' ? -1 : $r['potential'] * ($r['roi'] ?? 0))->values();

        $candidates = $rows->where('iso', '!=', 'ZA');
        $top = $candidates->sortByDesc('potential')->take(14);

        return [
            'rows' => $rows->all(),
            'scenario' => $scenario,
            'high_priority' => $candidates->where('potential', '>=', 70)->count(),
            'investment_total' => round($top->sum('investment'), 1),
            'return_total' => round($top->sum('return'), 1),
            'avg_cost' => round((float) $top->avg('investment'), 1),
            'avg_payback' => round((float) $top->avg('payback'), 1),
            'roi_weighted' => $top->sum('investment') > 0 ? round($top->sum('return') / $top->sum('investment'), 2) : 0,
            'approved' => $rows->where('decision', 'APPROVE')->count(),
        ];
    }

    /** Corridor economics with NPV at the given discount rate, IRR by bisection and payback in months. */
    public static function economics(float $rate, string $scenario): array
    {
        $mult = ['base' => 1.0, 'pessimistic' => 0.85, 'optimistic' => 1.15][$scenario] ?? 1.0;
        $countries = Country::all()->keyBy('iso2');
        $rows = Corridor::query()->whereNotNull('details')->get()->filter(fn ($c) => isset($c->details['investment_m']))->map(function (Corridor $c) use ($rate, $mult, $countries) {
            $inv = (float) $c->details['investment_m'];
            $rev = (float) $c->details['revenue_m'] * $mult;
            $flows = [-$inv, $rev * 0.25, $rev * 0.35, $rev * 0.40];
            $npv = self::npv($rate, $flows);
            $irr = self::irr($flows);
            $cum = -$inv;
            $payback = null;
            foreach (array_slice($flows, 1) as $y => $cf) {
                if ($cum + $cf >= 0 && $payback === null) {
                    $payback = round(($y + (-$cum / $cf)) * 12, 1);
                }
                $cum += $cf;
            }
            $resolution = CorridorResolver::resolve($c, $countries);

            return [
                'code' => $c->code, 'pair' => "{$c->from_name} → {$c->to_name}", 'group' => $c->group_name, 'path' => $c->path_type, 'risk' => $c->risk,
                'rcs' => $c->pair_rcs, 'ceiling' => $resolution['ceiling_label'], 'sellable' => $resolution['sellable'],
                'investment' => $inv, 'revenue' => round($rev, 1), 'npv' => round($npv, 1), 'irr' => $irr === null ? null : round($irr * 100, 1), 'payback' => $payback,
            ];
        })->sortByDesc('npv')->values();

        return [
            'rows' => $rows->all(),
            'positive' => $rows->filter(fn ($r) => ($r['irr'] ?? -1) > 0)->count(),
            'investment' => round($rows->sum('investment'), 1),
            'npv' => round($rows->sum('npv'), 1),
            'avg_irr' => round((float) $rows->avg('irr'), 1),
            'avg_payback' => round((float) $rows->avg('payback'), 1),
        ];
    }

    public static function npv(float $rate, array $flows): float
    {
        $v = 0.0;
        foreach ($flows as $t => $cf) {
            $v += $cf / ((1 + $rate) ** $t);
        }

        return $v;
    }

    public static function irr(array $flows): ?float
    {
        $lo = -0.99;
        $hi = 10.0;
        if (self::npv($lo, $flows) * self::npv($hi, $flows) > 0) {
            return null;
        }
        for ($i = 0; $i < 200; $i++) {
            $mid = ($lo + $hi) / 2;
            if (self::npv($mid, $flows) > 0) {
                $lo = $mid;
            } else {
                $hi = $mid;
            }
        }

        return ($lo + $hi) / 2;
    }
}
