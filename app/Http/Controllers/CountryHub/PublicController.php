<?php

namespace App\Http\Controllers\CountryHub;

use App\Support\CountryHub\Corridors;
use App\Support\CountryHub\CountryHub;
use Inertia\Response;

/** P01 Countries landing and P02 Country Explorer (prototype pages-landing.js). */
class PublicController extends Controller
{
    public const WAVES = [
        ['Wave 0', 'Governance and architecture', 'Approved architecture, field dictionaries and test strategy.'],
        ['Wave 1', 'Core platform launch', 'Paid order completes end to end and reconciles.'],
        ['Wave 2', 'AIIM and Due Diligence launch', 'Verified AIIM data and complete DD test cases pass.'],
        ['Wave 3', 'Enterprise operations', 'Enterprise role, review and bulk workflows pass.'],
        ['Wave 4', 'Virtual Deal Room', 'Transaction scenario passes security and evidence tests.'],
        ['Wave 5', 'Pan-African scale', 'Country readiness gate passed per market.'],
        ['Wave 6', 'Advanced intelligence and API', 'Data quality, entitlement, performance and support gates pass.'],
    ];

    public function landing(): Response
    {
        $all = CountryHub::countries();
        $related = [];
        foreach (['market-entry', 'intelligence', 'trade', 'investment'] as $t) {
            $list = array_filter(CountryHub::sprints(), fn ($s) => $s['topic'] === $t && CountryHub::priced($s) && $s['ep'] > 2000);
            usort($list, fn ($a, $b) => $a['ep'] <=> $b['ep']);
            if ($list) {
                $related[] = CountryHub::card($list[0]);
            }
        }

        return $this->plain('Landing', [
            'map' => array_values(array_map(fn ($c) => ['iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name'], 'region' => $c['region'], 'pack' => $c['pack'], 'rcs' => $c['rcs']], $all)),
            'activated' => count($all),
            'packs' => count(array_filter($all, fn ($c) => $c['pack'])),
            'sellable' => Corridors::sellableCount(),
            'updates' => array_slice(CountryHub::register('BW_RegChange'), 0, 5),
            'waves' => self::WAVES,
            'related' => $related,
            'za' => $all['ZAF'] ?? null,
        ]);
    }

    public function explorer(): Response
    {
        $rows = array_values(array_map(fn ($c) => [
            'iso3' => $c['iso3'], 'iso2' => $c['iso2'], 'slug' => $c['slug'], 'name' => $c['name'], 'region' => $c['region'], 'pack' => $c['pack'], 'rcs' => $c['rcs'],
            'state' => $c['state'], 'wave' => $c['wave'],
            'ev' => in_array($c['iso3'], ['ZAF', 'BWA'], true) ? 'Current' : ($c['pack'] ? 'Pack issued' : 'Baseline'),
            'upd' => $c['updated'],
        ], CountryHub::countries()));

        return $this->plain('Explorer', ['rows' => $rows, 'sellable' => Corridors::sellableCount()]);
    }
}
