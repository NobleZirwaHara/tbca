<?php

namespace App\Support\CountryHub;

use App\Support\Industries\IndustryData;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Read model for the Countries tab (the Countries part of the client's prototype, MP-COUNTRIES-1.0).
 *
 * Mirrors the prototype's core.js country helpers. The 54 countries, the trade model, the Sprint
 * classification and the registers are shared with Industries (IndustryData); the Botswana geometry,
 * the country pack text, the register index and the country Sprint topics come from cty_meta.
 * Selling prices come only from the app's Sprint records, matched by Sprint code.
 */
class CountryHub
{
    private const TTL = 600;

    /** Pan-African activation date shown on every country (prototype ACT_DATE). */
    public const ACT_DATE = '21 Oct 2026';

    /** Date the Botswana BW-1.0 pack was loaded. */
    public const BW_DATE = '09 Oct 2026';

    /** Display FX from BW_FX (prototype FX). */
    public const FX = ['BWP_USD' => 13.84, 'ZAR_BWP' => 1.207, 'asOf' => '9 Oct 2026', 'src' => 'BW_FX / BW-MAC-F9, F10'];

    /** Country Sprint topics (prototype TOPICS). */
    public const TOPICS = [
        'market-entry' => 'Market Entry & Expansion', 'trade' => 'Trade, Export & Import', 'intelligence' => 'Country & Market Intelligence',
        'regulatory' => 'Legal, Regulatory & Compliance', 'tax' => 'Tax & Statutory', 'investment' => 'Investment, Funding & Due Diligence',
        'payments' => 'Payments, FX & Treasury', 'localisation' => 'Language & Localisation', 'risk' => 'Risk, KYC & Sanctions',
    ];

    /** The 18 AIIM sectors as the Countries pages name them (prototype SECT). */
    public const SECT = [
        'ENR' => 'Energy & Power', 'OGS' => 'Fuels, Strategic Reserves & Coal-bed Methane', 'MIN' => 'Diamonds, Copper & Mining', 'AGR' => 'Livestock, Beef & Horticulture',
        'BLU' => 'Fisheries & Aquaculture', 'FOR' => 'Forestry & Veld Products', 'MFG' => 'Manufacturing, SEZs & Beneficiation', 'WSW' => 'Water, Sanitation & Waste',
        'TRN' => 'Transport, Corridors & Logistics', 'ICT' => 'Digital, Mobile Money & 5G', 'CRE' => 'Construction, Roads & Housing', 'TOU' => 'Tourism (Okavango, Chobe, Kalahari)',
        'HLT' => 'Health & Pharmaceuticals', 'EDU' => 'Education & Skills', 'FIN' => 'Finance, Pensions & Fintech', 'TRD' => 'Trade, Retail & Citizen Markets',
        'GRN' => 'Green Economy & Climate Finance', 'CSP' => 'Creative, Sport & Professional Services',
    ];

    public static function ready(): bool
    {
        return once(fn () => Schema::hasTable('cty_meta') && DB::table('cty_meta')->exists() && IndustryData::ready());
    }

    /* ------------------------------------------------------------------ countries */

    /** @return array<string, array> all 54 countries keyed by ISO3, with the Countries display fields */
    public static function countries(): array
    {
        return once(fn () => array_map(fn ($c) => self::decorate($c), IndustryData::countries()));
    }

    /** Find a country by slug, ISO3 or ISO2. */
    public static function country(?string $key): ?array
    {
        $c = IndustryData::country($key);

        return $c ? self::countries()[$c['iso3']] : null;
    }

    public static function options(): array
    {
        return IndustryData::countryOptions();
    }

    public static function isBW(array $c): bool
    {
        return $c['iso3'] === 'BWA';
    }

    public static function isZA(array $c): bool
    {
        return $c['iso3'] === 'ZAF';
    }

    /** Country sub-line (prototype csub). */
    public static function csub(array $c): string
    {
        return match (true) {
            self::isZA($c) => 'Activated · Phase 1 market since 15 Aug 2026 · pan-African activation '.self::ACT_DATE,
            self::isBW($c) => 'Activated · full country pack BW-1.0 (09 Oct 2026) loaded',
            default => 'Activated · pan-African activation '.self::ACT_DATE.' · '.$c['region'].' Africa',
        };
    }

    private static function decorate(array $c): array
    {
        return $c + [
            'state' => 'Activated',
            'isBW' => self::isBW($c),
            'isZA' => self::isZA($c),
            'sub' => self::csub($c),
            'evidence' => self::isBW($c) ? 'Evidence current (76 % grade 3)' : (self::isZA($c) ? 'Evidence current' : 'Baseline evidence · full pack scheduled'),
            'updated' => self::isBW($c) ? self::BW_DATE : self::ACT_DATE,
        ];
    }

    /* ------------------------------------------------------------------ documents and registers */

    public static function meta(string $key): mixed
    {
        return once(fn () => Cache::remember('cty:meta:'.$key, self::TTL, function () use ($key) {
            $v = DB::table('cty_meta')->where('key', $key)->value('value');

            return $v === null ? null : json_decode($v, true);
        }));
    }

    /** All rows of a register as associative arrays (column header => value). */
    public static function register(string $name): array
    {
        return IndustryData::register($name);
    }

    /** Several registers at once, keyed by name. */
    public static function registers(string ...$names): array
    {
        return array_combine($names, array_map(fn ($n) => self::register($n), $names));
    }

    /** Register index of the 62-sheet Deep Registers workbook (Data Room). */
    public static function registerIndex(): array
    {
        return self::meta('reg_index') ?? [];
    }

    /** Measure => value from BW_Summary. */
    public static function summary(): array
    {
        return once(fn () => collect(self::register('BW_Summary'))->mapWithKeys(fn ($r) => [(string) $r['Measure'] => $r['Value']])->all());
    }

    /* ------------------------------------------------------------------ Sprints */

    /**
     * The 1,814 country Sprints (prototype SPR): the Sprint classification with the topic each one
     * serves and the app's selling prices.
     *
     * @return array<string, array> keyed by code
     */
    public static function sprints(): array
    {
        return once(function () {
            $topics = self::meta('sprint_topics') ?? [];
            $all = IndustryData::sprints();
            $out = [];
            foreach ($topics as $code => $topic) {
                if (isset($all[$code])) {
                    $out[$code] = $all[$code] + ['topic' => $topic];
                }
            }

            return $out;
        });
    }

    /**
     * Catalogue market medians per tier (ZAR ex VAT) and the full archetype code of a country Sprint
     * (prototype mb/ms/mp and arch). Reference figures for "Price vs market", never selling prices.
     *
     * @return array{Basic: ?float, Standard: ?float, Premium: ?float, arch: ?string}|null
     */
    public static function market(string $code): ?array
    {
        $m = (self::meta('sprint_market') ?? [])[$code] ?? null;

        return $m ? ['Basic' => $m['mb'], 'Standard' => $m['ms'], 'Premium' => $m['mp'], 'arch' => $m['arch']] : null;
    }

    public static function sprint(string $code): ?array
    {
        return self::sprints()[$code] ?? IndustryData::sprint($code);
    }

    /** Sellable: classified viable and published, and the app prices it. */
    public static function priced(array $s): bool
    {
        return IndustryData::priced($s);
    }

    /** Price of a tier in ZAR ex VAT, or null when that tier is not sold. */
    public static function tierPrice(?array $s, ?string $tier): ?int
    {
        if (! $s) {
            return null;
        }

        return $s['tiers'][$tier ?? ''] ?? $s['ep'];
    }

    /** Card payload for a country Sprint (prototype sprintCard). */
    public static function card(array $s): array
    {
        return [
            'code' => $s['code'], 'name' => $s['name'], 'type' => $s['type'], 'pop' => $s['pop'], 'topic' => $s['topic'] ?? null,
            'topicLabel' => self::TOPICS[$s['topic'] ?? ''] ?? ($s['topic'] ?? null), 'ep' => $s['ep'], 'entry' => $s['entry'],
            'tiers' => array_keys($s['tiers']), 'priced' => self::priced($s), 'inApp' => $s['app'] !== null,
        ];
    }

    /**
     * Sprint shelf (prototype sprintShelf): sellable Sprints in the topics, cheapest first, one per base name.
     *
     * @return array{title: string, topics: string[], items: array[], total: int}
     */
    public static function shelf(array $topics, int $n = 4, ?string $title = null): array
    {
        $list = array_filter(self::sprints(), fn ($s) => in_array($s['topic'], $topics, true) && self::priced($s));
        usort($list, fn ($a, $b) => ($a['ep'] ?? 0) <=> ($b['ep'] ?? 0));
        $seen = [];
        $pick = [];
        foreach ($list as $s) {
            $base = preg_replace('/ — .*/u', '', preg_replace('/ (Starter|Tracker|Template|Checklist)( Sprint)?/', '', $s['name']));
            if (isset($seen[$base])) {
                continue;
            }
            $seen[$base] = true;
            $pick[] = self::card($s);
            if (count($pick) >= $n) {
                break;
            }
        }

        return [
            'title' => $title ?? 'Embedded Sprints for this page', 'topics' => $topics, 'items' => $pick,
            'total' => count(array_filter(self::sprints(), fn ($s) => in_array($s['topic'], $topics, true))),
        ];
    }

    /** VAT rate for a country as a fraction (Botswana 14 %, otherwise the reference rate). */
    public static function vat(array $c): float
    {
        return ((float) ($c['vat'] ?? 0)) / 100;
    }

    /* ------------------------------------------------------------------ page payload */

    /** Props every country page receives. */
    public static function base(array $c): array
    {
        return ['c' => $c, 'countries' => self::options(), 'actDate' => self::ACT_DATE];
    }
}
