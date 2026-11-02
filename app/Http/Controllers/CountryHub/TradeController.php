<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\CountryHub;
use App\Support\Industries\IndustryData as D;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Import & Export heat maps (prototype pages-trade.js): the hub and the four views on the modelled
 * 54 x 54 x 10 HS-group intra-African trade matrix. Same model as the Industries trade page, with all
 * ten HS groups and the Countries page frame.
 */
class TradeController extends Controller
{
    /** View number => [who, needs a partner] (titles and sub-lines live in the page, prototype VIEWS). */
    public const VIEWS = [1 => ['import', false], 2 => ['import', true], 3 => ['export', false], 4 => ['export', true]];

    private static function pc(array $c): array
    {
        return ['iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name']];
    }

    /** @param float[] $a */
    private static function r(array $a): array
    {
        return array_map(fn ($x) => round((float) $x, 6), $a);
    }

    /** Prototype pct(): whole per cent. */
    private static function pct(float $a, float $b): int
    {
        return $b ? (int) round(100 * $a / $b) : 0;
    }

    private static function shared(array $t): array
    {
        return ['groups' => array_values($t['groups']), 'basis' => $t['basis'], 'anchors' => $t['anchors']];
    }

    public function hub(string $country): Response
    {
        $c = $this->country($country);
        $iso = $c['iso3'];
        $t = D::trade();
        $all = CountryHub::countries();
        $partners = [];
        foreach ($t['isos'] as $x) {
            if ($x !== $iso && isset($all[$x])) {
                $partners[] = self::pc($all[$x]) + ['imp' => round(array_sum(D::flow($t, $x, $iso)), 6), 'exp' => round(array_sum(D::flow($t, $iso, $x)), 6)];
            }
        }

        return $this->countryPage($c, 'Trade/Hub', self::shared($t) + [
            'E' => self::r($t['expAfrica'][$iso]),
            'M' => self::r($t['impAfrica'][$iso]),
            'partners' => $partners,
            'shelf' => CountryHub::shelf(['trade'], 4, 'Act on the heat map — trade Sprints'),
        ]);
    }

    public function view(Request $request, string $country, string $view): Response
    {
        $c = $this->country($country);
        $iso = $c['iso3'];
        $v = (int) $view;
        [$who, $needP] = self::VIEWS[$v] ?? abort(404);
        $imp = $who === 'import';
        $all = CountryHub::countries();
        $p = null;
        if ($needP) {
            $q = CountryHub::country((string) $request->query('partner', ''));
            $p = $q && $q['iso3'] !== $iso ? $q : $all[$iso === 'ZAF' ? 'BWA' : 'ZAF'];
        }
        $t = D::trade();
        $props = self::shared($t) + ['view' => $v, 'who' => $who, 'partner' => $p ? self::pc($p) : null];

        if (! $p) {
            // Rows are partners, columns the HS groups; base is the partner's Africa exports (view 1) or imports (view 3).
            $rows = [];
            foreach ($t['isos'] as $x) {
                if ($x === $iso || ! isset($all[$x])) {
                    continue;
                }
                $f = $imp ? D::flow($t, $x, $iso) : D::flow($t, $iso, $x);
                $base = $imp ? $t['expAfrica'][$x] : $t['impAfrica'][$x];
                $rows[] = self::pc($all[$x]) + ['f' => self::r($f), 'base' => self::r($base), 'tot' => round(array_sum($f), 6), 'share' => self::pct(array_sum($f), array_sum($base))];
            }
            usort($rows, fn ($a, $b) => $b['tot'] <=> $a['tot']);
            $props['rows'] = $rows;
        } else {
            // One partner: product groups as rows.
            $fc = $imp ? D::flow($t, $p['iso3'], $iso) : D::flow($t, $iso, $p['iso3']);
            $pAfr = $imp ? $t['expAfrica'][$p['iso3']] : $t['impAfrica'][$p['iso3']];
            $cAfr = $imp ? $t['impAfrica'][$iso] : $t['expAfrica'][$iso];
            $rev = $imp ? D::flow($t, $iso, $p['iso3']) : D::flow($t, $p['iso3'], $iso);
            $props['pair'] = array_map(fn ($k) => [
                'g' => $t['groups'][$k], 'f' => round($fc[$k], 6), 'pa' => round($pAfr[$k], 6), 'ca' => round($cAfr[$k], 6), 'r' => round($rev[$k], 6),
                'sh' => $pAfr[$k] ? 100 * $fc[$k] / $pAfr[$k] : 0, 'pot' => round(max(0, min($pAfr[$k], $cAfr[$k]) - $fc[$k]), 6),
            ], array_keys($t['groups']));
        }
        $props['shelf'] = CountryHub::shelf(['trade', 'market-entry'], 4, 'Trade Sprints for this view');

        return $this->countryPage($c, 'Trade/View', $props);
    }
}
