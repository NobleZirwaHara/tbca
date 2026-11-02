<?php

namespace App\Support\Aiim;

use App\Support\CountryHub\CountryHub;
use App\Support\CountryHub\IntelData;
use App\Support\Industries\ServerTable;
use Illuminate\Http\Request;

/**
 * Page payloads for the desks and dashboards of the "TBCA AIIM Botswana" prototype (mock-ups 72 to
 * 82). Figures come from the Botswana registers and country pack; prices come only from the app's
 * Sprint records by code.
 */
class DeskData
{
    /** Mock 72: enterprise seats, feeds, portals and licensing. */
    public static function enterprise(): array
    {
        return ['services' => array_values(array_filter(array_map(fn ($c) => ProtoDesk::svc($c), ['AAB-EMB-225', 'AAB-EMB-219', 'AAB-EMB-220', 'AAB-EMB-224', 'AAB-EMB-227', 'AAB-EMB-223'])))];
    }

    /** Mock 73: one endpoint per register of the register index. */
    public static function api(): array
    {
        return [
            'endpoints' => array_map(fn ($x) => ['sheet' => $x['sheet'], 'rows' => (int) $x['rows'], 'cols' => (int) $x['cols']], CountryHub::registerIndex()),
            'rail' => ProtoDesk::rail(['AAB-EMB-219', 'AAB-EMB-220', 'AAB-EMB-218', 'AAB-EMB-224'], 'Embedded services on this page', 4),
        ];
    }

    /** Mock 74: Tier A demand by unit, envelopes, the 90-day plan and citizen-empowerment rules. */
    public static function govDfi(): array
    {
        return [
            'envelopes' => array_map(fn ($e) => [
                'unit' => $e['Unit'], 'code' => $e['Unit code'],
                'tierA' => (float) $e['Tier A ranked leads'], 'env' => (float) $e['Envelope US$ m (weighted)'],
            ], CountryHub::register('BW_Envelopes')),
            'plan' => ProtoDesk::sheet('BW_Plan90'),
            'rules' => ProtoDesk::docTable('K-3', 0),
            'reserved' => ProtoDesk::docTable('K-3', 1),
            'rail' => ProtoDesk::rail(['AAB-EMB-221', 'AAB-EMB-222', 'AAB-EMB-213', 'AAB-EMB-147'], 'Desk services', 4),
        ];
    }

    /** Mock 75: regulatory alerts, freshness rules and open data gaps. */
    public static function alerts(): array
    {
        return [
            'changes' => IntelData::pick(CountryHub::register('BW_RegChange'), ['ID', 'Change', 'Instrument', 'Sector', 'Impact', 'Status', 'Templates affected']),
            'freshness' => ProtoDesk::sheet('BW_Freshness'),
            'gaps' => ProtoDesk::sheet('BW_DataGaps'),
            'rail' => ProtoDesk::rail(['AAB-EMB-172', 'AAB-EMB-173', 'AAB-EMB-174', 'AAB-EMB-175', 'AAB-EMB-176', 'AAB-EMB-177', 'AAB-EMB-178', 'AAB-EMB-179'], 'Subscribe to alerts', 8),
        ];
    }

    /** Mock 78: hotspot lead queue, owners and the 90-day plan. */
    public static function advisor(): array
    {
        $leads = CountryHub::register('BW_Hotspot_Leads');
        usort($leads, fn ($a, $b) => strcmp((string) $a['Due'], (string) $b['Due']));
        $owners = array_count_values(array_map(fn ($l) => (string) $l['Owner'], $leads));
        arsort($owners);

        return [
            'kpis' => [
                'leads' => count($leads),
                'aplus' => count(array_filter($leads, fn ($l) => str_starts_with((string) $l['Tier'], 'A+'))),
                'due' => count(array_filter($leads, fn ($l) => preg_match('/2026-1[01]/', (string) $l['Due']))),
                'owners' => count($owners),
            ],
            'leads' => IntelData::pick($leads, ['Lead ID', 'Hotspot', 'Place', 'Opportunity', 'Lead score', 'Tier', 'Next action', 'Institution to call', 'Owner', 'Due']),
            'byOwner' => array_map(fn ($n, $v) => ['n' => (string) $n, 'v' => $v], array_keys(array_slice($owners, 0, 12, true)), array_slice($owners, 0, 12, true)),
            'plan' => ProtoDesk::sheet('BW_Plan90'),
        ];
    }

    /** Mock 79: the price book (app prices) by module and the automation outlook. */
    public static function finance(): array
    {
        $sale = array_filter(ProtoDesk::emb(), fn ($s) => ! str_starts_with((string) ($s['sale'] ?? ''), 'NO'));
        $priced = [];
        foreach ($sale as $s) {
            $c = ProtoDesk::card($s);
            if ($c['ep'] !== null) {
                $priced[] = $c + ['raw' => $s];
            }
        }
        $eps = array_column($priced, 'ep');
        sort($eps);
        $byCat = [];
        foreach ($priced as $p) {
            $byCat[$p['cat']][] = $p['ep'];
        }
        $modules = array_map(fn ($k, $v) => ['n' => (string) $k, 'v' => array_sum($v) / count($v)], array_keys($byCat), $byCat);
        usort($modules, fn ($a, $b) => $b['v'] <=> $a['v']);
        $aiim = array_values(array_filter($sale, fn ($s) => ($s['cat'] ?? '') === 'AIIM'));
        $avg = fn (string $k) => $aiim ? (int) round(100 * array_sum(array_map(fn ($s) => (float) ($s[$k] ?? 0), $aiim)) / count($aiim)) : 0;

        return [
            'saleable' => count($priced),
            'listed' => count($sale),
            'median' => $eps ? $eps[intdiv(count($eps), 2)] : null,
            'modules' => $modules,
            'automation' => [['n' => 'AAI now', 'v' => $avg('a0')], ['n' => 'AAI H1', 'v' => $avg('a1')], ['n' => 'AAI H2', 'v' => $avg('a2')]],
            'rail' => ProtoDesk::rail(['AAB-EMB-233', 'AAB-EMB-234', 'AAB-EMB-237'], 'Embedded services on this page', 3),
        ];
    }

    /** Mock 80: pack controls, validator, edition log, open decisions, replication roles and rollout. */
    public static function admin(): array
    {
        return [
            'controls' => ProtoDesk::docTable('K-1', 0),
            'validator' => ProtoDesk::sheet('BW_Validator'),
            'editions' => ProtoDesk::sheet('BW_EditionLog'),
            'decisions' => ProtoDesk::docTable('K-8', 1),
            'roles' => ProtoDesk::sheet('I2_Replication_Roles'),
            'rollout' => ProtoDesk::sheet('BW_Rollout'),
        ];
    }

    /** Mock 81: the price book, one page at a time; entry prices are the app's Sprint prices. */
    public const PRICE_SEARCH = ['Code', 'Service', 'Module', 'Authority', 'Benchmark'];

    public const PRICE_SORT = ['Code', 'Service', 'Module', 'Authority', 'Benchmark', 'Bench Basic', 'Bench Std', 'Entry tier', 'Entry price'];

    public static function priceRows(): array
    {
        return array_map(function ($s) {
            $c = ProtoDesk::card($s);

            return [
                'Code' => $s['code'], 'Service' => $s['name'], 'Module' => $s['cat'], 'Authority' => $s['auth'] ?? '', 'Benchmark' => $s['bref'] ?? '',
                'Bench Basic' => $s['bmb'] ?? null, 'Bench Std' => $s['bms'] ?? null, 'Entry tier' => $c['et'], 'Entry price' => $c['ep'],
            ];
        }, ProtoDesk::emb());
    }

    public static function pricing(Request $request): array
    {
        return ServerTable::make(self::priceRows(), $request, self::PRICE_SEARCH, ['Module', 'Authority', 'Entry tier'], self::PRICE_SORT, 25);
    }

    /** Mock 82: sources, conflicts, verification log, freshness rules and the confidence policy. */
    public static function sources(): array
    {
        return [
            'sources' => ProtoDesk::sheet('BW_Sources'),
            'conflicts' => ProtoDesk::sheet('BW_Conflicts'),
            'verify' => ProtoDesk::sheet('BW_VerifyLog'),
            'freshness' => ProtoDesk::sheet('BW_Freshness'),
            'policy' => ProtoDesk::docTable('Interpretation Control', 0),
        ];
    }
}
