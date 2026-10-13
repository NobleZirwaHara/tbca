<?php

namespace App\Support\Aiim;

/**
 * Core AIIM map layers (always available) and small geometry helpers. Sector
 * asset layers come from the Deep Registers Map_Layers catalogue (aiim_map_layers).
 */
class MapLayers
{
    /** Map depth: G0 country to G5 site (Decision and Information Tree Booklet, 11 Oct 2026). */
    public const DEPTHS = [
        ['level' => 0, 'key' => 'country', 'label' => 'Country'],
        ['level' => 1, 'key' => 'region', 'label' => 'Regions'],
        ['level' => 2, 'key' => 'district', 'label' => 'Districts'],
        ['level' => 3, 'key' => 'city', 'label' => 'Cities'],
        ['level' => 4, 'key' => 'municipality', 'label' => 'Municipalities'],
        ['level' => 5, 'key' => 'town', 'label' => 'Towns and sites'],
    ];

    /** @return list<array{key: string, label: string, geometry: string, levels: string, color: string, labels?: array<string, string>}> */
    public static function core(): array
    {
        return [
            ['key' => 'projects', 'label' => 'Screened project briefs', 'geometry' => 'Point (pin/peg)', 'levels' => 'L0–L5', 'color' => '#d6a32e'],
            ['key' => 'opportunities', 'label' => 'Opportunity leads', 'geometry' => 'Point (pin/peg)', 'levels' => 'L1–L5', 'color' => '#2f8a5f'],
            ['key' => 'admin-units', 'label' => 'Administrative areas', 'geometry' => 'Polygon', 'levels' => 'L1–L4', 'color' => '#4f8fca'],
            ['key' => 'places', 'label' => 'Towns and places', 'geometry' => 'Point (pin/peg)', 'levels' => 'L3–L5', 'color' => '#9a9aa5'],
            ['key' => 'gateways', 'label' => 'Border gateways', 'geometry' => 'Point (pin/peg)', 'levels' => 'L0–L3', 'color' => '#c0602a'],
            ['key' => 'hotspots', 'label' => 'Evidence hotspots', 'geometry' => 'Point (pin/peg)', 'levels' => 'L0–L5', 'color' => '#b5372a'],
            ['key' => 'institutions', 'label' => 'Institutions to call', 'geometry' => 'Point (pin/peg)', 'levels' => 'L1–L5', 'color' => '#7a4fa3'],
            ['key' => 'airports', 'label' => 'Airports', 'geometry' => 'Point (pin/peg)', 'levels' => 'L0–L3', 'color' => '#2f5fa8'],
            ['key' => 'roads', 'label' => 'Main roads', 'geometry' => 'Line/flow', 'levels' => 'L0–L3', 'color' => '#a8915c'],
            ['key' => 'rail', 'label' => 'Railways', 'geometry' => 'Line/flow', 'levels' => 'L0–L3', 'color' => '#5c5c68'],
            ['key' => 'rivers', 'label' => 'Rivers and lakes', 'geometry' => 'Line/flow', 'levels' => 'L0–L3', 'color' => '#4f8fca'],
        ];
    }

    /** Ray-casting point-in-polygon over a country outline ([polygon][ring][[lon, lat]]). */
    public static function inside(float $lon, float $lat, array $outline): bool
    {
        foreach ($outline as $polygon) {
            $ring = $polygon[0] ?? [];
            $in = false;
            $n = count($ring);
            for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
                [$xi, $yi] = $ring[$i];
                [$xj, $yj] = $ring[$j];
                if ((($yi > $lat) !== ($yj > $lat)) && ($lon < ($xj - $xi) * ($lat - $yi) / (($yj - $yi) ?: 1e-12) + $xi)) {
                    $in = ! $in;
                }
            }
            if ($in) {
                return true;
            }
        }

        return false;
    }
}
