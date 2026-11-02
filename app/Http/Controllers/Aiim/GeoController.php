<?php

namespace App\Http\Controllers\Aiim;

use App\Models\Aiim\Country;
use App\Support\Aiim\CountryIntel;
use App\Support\Aiim\ProtoExplore as PX;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Prototype pages with no AIIM mock-up number: Map View (L0 to L5 drill-down), town profile and
 * unit economics. Botswana carries the BW-1.0 pack; other countries show their loaded map records
 * or a pack-loading state.
 */
class GeoController extends AiimController
{
    private function country(string $slug): array
    {
        $c = Country::query()->where('slug', $slug)->firstOrFail();

        return [$c, $c->iso2 === 'BW' && PX::ready()];
    }

    /* ------------------------------------------------------------------ Map View */

    public function map(Request $request, string $slug): Response
    {
        [$country, $bw] = $this->country($slug);
        $this->select($request, ['country' => $country->name]);
        if (! $bw) {
            $intel = CountryIntel::for($country);

            return $this->render($request, 'Aiim/Geo/Map', [
                'country' => $country->summary(), 'bw' => null,
                'intel' => $intel['coverage']['units'] > 0 ? $intel : null,
                'activation' => $country->activation(),
            ], 'Map View');
        }

        $sel = (string) $request->query('sel', '');

        return $this->render($request, 'Aiim/Geo/Map', [
            'country' => $country->summary(),
            'intel' => null,
            'activation' => $country->activation(),
            'focus' => (string) $request->query('focus', ''),
            'bw' => fn () => [
                'map' => PX::mapPayload(true),
                'filters' => json_encode(PX::mapFilters()),
                'summary' => PX::summary(),
                'towns' => array_map(fn ($t) => ['id' => $t['ID'], 'name' => $t['Place']], PX::reg('BW_Towns')),
                'ticker' => [
                    'reg' => array_map(fn ($r) => array_intersect_key($r, array_flip(['ID', 'Change', 'Instrument', 'Status', 'Impact'])), PX::reg('BW_RegChange')),
                    'gaps' => array_values(array_map(fn ($g) => ['ID' => $g['ID'], 'Missing data' => $g['Missing data']], array_filter(PX::reg('BW_DataGaps'), fn ($g) => $g['Priority'] === 'High'))),
                ],
                'mapstack' => PX::sheet('BW_MapStack'),
                'layers' => PX::sheet('I2_Map_Layers'),
                'brief' => PX::service('AAB-EMB-192'),
                'custom' => PX::service('AAB-EMB-223'),
                'geojson' => PX::service('AAB-EMB-169'),
                'rail' => PX::services(['AAB-EMB-168', 'AAB-EMB-169', 'AAB-EMB-170', 'AAB-EMB-171', 'AAB-EMB-160', 'AAB-EMB-161', 'AAB-EMB-090', 'AAB-EMB-152']),
            ],
            'sel' => $sel,
            // Info card for the selected unit, town, hotspot or gateway; reloaded on its own on each click.
            'card' => fn () => $this->card($sel),
        ], 'Map View');
    }

    /** Info card behind a selection key: unit:GA, town:T15729, hot:3 or gw:2. */
    private function card(string $sel): ?array
    {
        [$type, $key] = array_pad(explode(':', $sel, 2), 2, '');

        return match ($type) {
            'unit' => ($u = PX::unitCard($key)) ? ['type' => 'unit'] + $u + ['brief' => PX::service('AAB-EMB-150')] : null,
            'town' => ($t = PX::townCard($key)) ? ['type' => 'town'] + $t + ['brief' => PX::service('AAB-EMB-150')] : null,
            'hot' => $this->hotCard((int) $key),
            'gw' => $this->gwCard((int) $key),
            default => null,
        };
    }

    private function hotCard(int $i): ?array
    {
        $h = PX::mapBase(false)['hotspots'][$i] ?? null;
        if (! $h) {
            return null;
        }
        $leads = array_values(array_filter(PX::reg('BW_Hotspot_Leads'), fn ($l) => $l['Hotspot'] === $h['name']));

        return ['type' => 'hot'] + $h + [
            'leadRows' => array_map(fn ($l) => array_intersect_key($l, array_flip(['Lead ID', 'Opportunity', 'Template', 'Due', 'Tier', 'Lead score', 'Next action', 'Institution to call'])), $leads),
            'brief' => PX::service('AAB-EMB-208'),
        ];
    }

    private function gwCard(int $i): ?array
    {
        $g = PX::mapBase(false)['gateways'][$i] ?? null;
        if (! $g) {
            return null;
        }
        $towns = array_values(array_filter(PX::mapBase(false)['towns'], fn ($t) => $t['gw'] === $i));
        usort($towns, fn ($a, $b) => $b['pop'] <=> $a['pop']);
        $d2 = collect(PX::table('D-2', 0) ?? [])->first(fn ($r) => ($r[0] ?? null) === $g['name']);

        return ['type' => 'gw'] + $g + [
            'mean' => $d2[2] ?? null,
            'population' => array_sum(array_column($towns, 'pop')),
            'towns' => array_map(fn ($t) => ['id' => $t['id'], 'name' => $t['name'], 'km' => $t['km']], $towns),
            'corridors' => array_values(array_map(fn ($c) => ['id' => $c['id'], 'name' => $c['name']], array_filter(PX::CORRIDORS, fn ($c) => $c['gw'] === $i))),
            'brief' => PX::service('AAB-EMB-194'),
        ];
    }

    /* ------------------------------------------------------------------ town profile (L3) */

    public function town(Request $request, string $slug, string $id): Response
    {
        [$country, $bw] = $this->country($slug);
        if (! $bw) {
            return $this->render($request, 'Aiim/Geo/Town', ['country' => $country->summary(), 'town' => null], 'Town Profile');
        }
        $card = PX::townCard($id);
        abort_unless($card, 404);
        $this->select($request, ['country' => $country->name, 'item' => $card['name']]);
        $keep = fn (array $rows, array $keys) => array_map(fn ($r) => array_intersect_key($r, array_flip($keys)), $rows);

        return $this->render($request, 'Aiim/Geo/Town', [
            'country' => $country->summary(),
            'town' => $card,
            'coverage' => $keep(array_values(array_filter(PX::reg('BW_Coverage'), fn ($r) => $r['Place ID'] === $id)), ['Row', 'Template', 'Sector', 'Opportunity', 'Band', 'Lead score', 'Tier']),
            'ranked' => $keep(array_values(array_filter(PX::reg('BW_Ranked_Leads'), fn ($r) => $r['Place ID'] === $id)), ['Lead ID', 'Template', 'Opportunity', 'Rank', 'RA', 'M', 'H', 'F', 'G', 'Lead score', 'Tier', 'Persona', 'Time to revenue']),
            'map' => PX::mapPayload(true),
            'brief' => PX::service('AAB-EMB-150'),
        ], 'Town Profile');
    }

    /* ------------------------------------------------------------------ unit economics */

    public function economics(Request $request, string $slug): Response
    {
        [$country, $bw] = $this->country($slug);
        if (! $bw) {
            return $this->render($request, 'Aiim/Geo/Economics', ['country' => $country->summary(), 'eco' => null], 'Unit Economics');
        }

        return $this->render($request, 'Aiim/Geo/Economics', [
            'country' => $country->summary(),
            'eco' => [
                'ue' => PX::sheet('BW_UnitEconomics'),
                'tornado' => PX::reg('BW_Tornado'),
                'tornadoLead' => PX::para('H-1c', 'First Paragraph'),
                'tornadoNote' => PX::para('H-1c', 'Body Text'),
                'numbers' => PX::table('H-1b', 0),
                'revenue' => PX::table('H-5', 0),
                'fx' => PX::sheet('BW_FX'),
                'rail' => PX::services(['AAB-EMB-211', 'AAB-EMB-210', 'AAB-EMB-140', 'AAB-EMB-133']),
            ],
        ], 'Unit Economics');
    }
}
