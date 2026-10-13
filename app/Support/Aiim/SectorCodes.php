<?php

namespace App\Support\Aiim;

/**
 * The 18 AIIM sector codes used by the Deep Registers 2.1, the country packs and the
 * map layer catalogue, with the matching AIIM sector page (aiim_sectors.slug) and icon.
 */
class SectorCodes
{
    /** code => [name, AIIM sector slug, icon, map colour] */
    public const CODES = [
        'ENR' => ['Energy & Power', 'energy', 'zap', '#e0a526'],
        'OGS' => ['Oil, Gas & Petroleum', 'energy', 'battery-charging', '#a05a2c'],
        'MIN' => ['Mining & Minerals', 'mining-minerals', 'pickaxe', '#8c7a6b'],
        'AGR' => ['Agriculture & Agro-processing', 'agriculture-agro-processing', 'wheat', '#5f9b3a'],
        'BLU' => ['Livestock, Fisheries & Blue Economy', 'agriculture-agro-processing', 'ship', '#2f7fb5'],
        'FOR' => ['Forestry & Timber', 'green-economy', 'leaf', '#2e6b3f'],
        'MFG' => ['Manufacturing & Industrial', 'manufacturing', 'factory', '#7a4fa3'],
        'WSW' => ['Water, Sanitation & Waste', 'green-economy', 'globe', '#3aa0a8'],
        'TRN' => ['Transport & Logistics', 'transport-logistics', 'truck', '#c0602a'],
        'ICT' => ['ICT, Digital & Telecoms', 'ict-digital-services', 'server', '#3d6fd1'],
        'CRE' => ['Construction, Real Estate & Housing', 'manufacturing', 'building-2', '#9a6d19'],
        'TOU' => ['Tourism & Hospitality', 'tourism-hospitality', 'globe', '#d0587e'],
        'HLT' => ['Health & Pharmaceuticals', 'manufacturing', 'shield-check', '#c23b3b'],
        'EDU' => ['Education & Skills', 'ict-digital-services', 'users', '#6b8e23'],
        'FIN' => ['Financial Services & Fintech', 'financial-services', 'coins', '#1f7a4c'],
        'TRD' => ['Trade, Distribution & Retail', 'transport-logistics', 'warehouse', '#b5763a'],
        'GRN' => ['Green Economy & Climate Finance', 'green-economy', 'leaf', '#3f9b6b'],
        'CSP' => ['Creative, Sport & Professional Services', 'ict-digital-services', 'trophy', '#8a5bb8'],
    ];

    public static function name(?string $code): ?string
    {
        return $code ? (self::CODES[$code][0] ?? $code) : null;
    }

    public static function slug(string $code): string
    {
        return self::CODES[$code][1] ?? 'manufacturing';
    }

    public static function icon(?string $code): string
    {
        return $code ? (self::CODES[$code][2] ?? 'factory') : 'factory';
    }

    public static function color(?string $code): string
    {
        return $code ? (self::CODES[$code][3] ?? '#9a9aa5') : '#9a9aa5';
    }

    /** @return list<array{code: string, name: string, slug: string, icon: string, color: string}> */
    public static function all(): array
    {
        return array_map(fn ($code, $r) => ['code' => $code, 'name' => $r[0], 'slug' => $r[1], 'icon' => $r[2], 'color' => $r[3]], array_keys(self::CODES), self::CODES);
    }

    /** Sector code for a project brief's sector label (screening register wording). */
    public static function fromLabel(string $label): string
    {
        $l = strtolower($label);

        return match (true) {
            str_contains($l, 'aquaculture') || str_contains($l, 'fish') => 'BLU',
            str_contains($l, 'agri') => 'AGR',
            str_contains($l, 'mining') || str_contains($l, 'mineral') => 'MIN',
            str_contains($l, 'logistics') && str_contains($l, 'energy') => 'OGS',
            str_contains($l, 'energy') => 'ENR',
            str_contains($l, 'construction') || str_contains($l, 'real estate') => 'CRE',
            str_contains($l, 'manufactur') => 'MFG',
            str_contains($l, 'digital infra') || str_contains($l, 'digital gov') => 'ICT',
            str_contains($l, 'financ') => 'FIN',
            str_contains($l, 'health') || str_contains($l, 'pharma') => 'HLT',
            str_contains($l, 'water') => 'WSW',
            str_contains($l, 'environment') => 'GRN',
            str_contains($l, 'transport') || str_contains($l, 'logistics') => 'TRN',
            str_contains($l, 'tourism') => 'TOU',
            default => 'MFG',
        };
    }
}
