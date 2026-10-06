<?php

namespace App\Support\Aiim;

use App\Support\Platform\Africa;

/**
 * Seed data for the AIIM country register (Africa's 54 countries).
 *
 * Split the way the client's Test Data is split:
 *  - PERMANENT: stable reference facts (name, ISO codes, AU region, capital,
 *    currency, land area). Safe to show as fact.
 *  - PLACEHOLDERS: headline indicators that move every year (population, GDP,
 *    growth, per-capita income) plus AIIM's own scores. Values are approximate
 *    ~2023 figures for layout only, every one is flagged status=placeholder and
 *    shown with a "Placeholder — to be replaced by API data" label until a live
 *    feed (World Bank / IMF / AfDB API) or the client's Test Data replaces it.
 */
class CountryData
{
    public const PLACEHOLDER = 'placeholder';

    public const PLACEHOLDER_NOTE = 'Placeholder — to be replaced by API data';

    /**
     * AIIM-only fields per country. Shared base facts (name, ISO3, region, capital, currency)
     * come from the canonical register App\Support\Platform\Africa.
     *
     * [iso2, ISO numeric, area km2, population (m, placeholder), GDP USD bn (placeholder),
     *  real GDP growth % (placeholder)]
     */
    private const ROWS = [
        ['DZ', '012', 2381741, 45.6, 240, 4.1],
        ['EG', '818', 1002450, 112.7, 396, 3.8],
        ['LY', '434', 1759540, 6.9, 50, null],
        ['MR', '478', 1030700, 4.9, 10.4, 6.5],
        ['MA', '504', 446550, 37.8, 141, 3.4],
        ['TN', '788', 163610, 12.5, 48.5, 0.4],

        ['BJ', '204', 114763, 13.7, 19.7, 6.4],
        ['BF', '854', 274200, 23.3, 20.3, 3.0],
        ['CV', '132', 4033, 0.6, 2.6, 5.1],
        ['CI', '384', 322463, 28.9, 78.8, 6.5],
        ['GM', '270', 11295, 2.8, 2.3, 5.3],
        ['GH', '288', 238533, 34.1, 76.4, 2.9],
        ['GN', '324', 245857, 14.2, 23.2, 5.7],
        ['GW', '624', 36125, 2.2, 2.0, 4.2],
        ['LR', '430', 111369, 5.4, 4.3, 4.6],
        ['ML', '466', 1240192, 23.3, 20.9, 3.5],
        ['NE', '562', 1267000, 27.2, 16.8, 2.4],
        ['NG', '566', 923768, 223.8, 363, 2.9],
        ['SN', '686', 196722, 18.0, 31.0, 4.6],
        ['SL', '694', 71740, 8.8, 3.8, 5.7],
        ['TG', '768', 56785, 9.1, 9.2, 5.6],

        ['BI', '108', 27834, 13.2, 2.6, 2.7],
        ['CM', '120', 475442, 28.6, 47.9, 3.2],
        ['CF', '140', 622984, 5.7, 2.6, 0.9],
        ['TD', '148', 1284000, 18.3, 13.1, 4.1],
        ['CG', '178', 342000, 6.1, 15.3, 1.9],
        ['CD', '180', 2344858, 102.3, 66.4, 8.5],
        ['GQ', '226', 28051, 1.7, 12.1, null],
        ['GA', '266', 267668, 2.4, 19.3, 2.4],
        ['ST', '678', 964, 0.2, 0.7, 0.5],

        ['KM', '174', 1862, 0.9, 1.4, 3.0],
        ['DJ', '262', 23200, 1.1, 3.9, 7.0],
        ['ER', '232', 117600, 3.7, null, null],
        ['ET', '231', 1104300, 126.5, 164, 7.2],
        ['KE', '404', 580367, 55.1, 107, 5.6],
        ['MG', '450', 587041, 30.3, 16.0, 4.2],
        ['MU', '480', 2040, 1.3, 14.4, 7.0],
        ['RW', '646', 26338, 14.1, 14.1, 8.2],
        ['SC', '690', 459, 0.1, 2.1, 3.2],
        ['SO', '706', 637657, 18.1, 11.7, 4.2],
        ['SS', '728', 619745, 11.1, null, null],
        ['SD', '729', 1886068, 48.1, null, null],
        ['TZ', '834', 945087, 67.4, 79.1, 5.1],
        ['UG', '800', 241550, 48.6, 49.3, 5.3],

        ['AO', '024', 1246700, 36.7, 84.7, 1.0],
        ['BW', '072', 581730, 2.7, 19.4, 2.7],
        ['SZ', '748', 17364, 1.2, 4.6, 4.8],
        ['LS', '426', 30355, 2.3, 2.1, 1.8],
        ['MW', '454', 118484, 20.9, 13.2, 1.5],
        ['MZ', '508', 801590, 33.9, 20.6, 5.0],
        ['NA', '516', 825615, 3.0, 12.4, 4.2],
        ['ZA', '710', 1221037, 62.0, 378, 0.7],
        ['ZM', '894', 752612, 20.6, 28.2, 5.4],
        ['ZW', '716', 390757, 16.7, 35.2, 5.3],
    ];

    /** Well-known first-level regions / economic hubs, only where stable and reliable. */
    private const SUBREGIONS = [
        'NG' => ['Lagos', 'Federal Capital Territory (Abuja)', 'Rivers', 'Kano', 'Ogun'],
        'KE' => ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu'],
        'EG' => ['Cairo', 'Alexandria', 'Giza', 'Port Said', 'Suez'],
        'GH' => ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern'],
        'MA' => ['Casablanca-Settat', 'Rabat-Salé-Kénitra', 'Tanger-Tétouan-Al Hoceïma', 'Marrakech-Safi', 'Fès-Meknès'],
        'ET' => ['Addis Ababa', 'Oromia', 'Amhara', 'Dire Dawa', 'Sidama'],
        'CI' => ['Abidjan', 'Yamoussoukro', 'Bas-Sassandra', 'Vallée du Bandama'],
        'TZ' => ['Dar es Salaam', 'Dodoma', 'Arusha', 'Mwanza', 'Zanzibar'],
        'SN' => ['Dakar', 'Thiès', 'Saint-Louis', 'Diourbel'],
        'RW' => ['Kigali', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'],
    ];

    public static function rows(): array
    {
        return array_map(fn (array $r, int $i) => self::row($r, $i), self::ROWS, array_keys(self::ROWS));
    }

    private static function row(array $r, int $sort): array
    {
        [$iso2, $num, $area, $pop, $gdp, $growth] = $r;
        $base = Africa::find($iso2);
        $perCapita = $pop && $gdp ? (int) round($gdp * 1000 / $pop) : null;

        return [
            'slug' => $base['slug'],
            'name' => $base['name'],
            'iso2' => $iso2,
            'iso3' => $base['iso3'],
            'iso_numeric' => $num,
            'region' => $base['region'],
            'capital' => $base['capital'],
            'currency_code' => $base['currency_code'],
            'currency_name' => $base['currency_name'],
            'area_km2' => $area,
            'subregions' => self::SUBREGIONS[$iso2] ?? null,
            'has_province_pack' => $iso2 === 'ZA',
            'sort' => $sort,
            'indicators' => [
                'population' => self::placeholder('Population', $pop, 'million', 2023),
                'gdp' => self::placeholder('GDP (nominal)', $gdp, 'USD billion', 2023),
                'gdp_growth' => self::placeholder('Real GDP growth', $growth, '%', 2023),
                'gdp_per_capita' => self::placeholder('GDP per capita', $perCapita, 'USD', 2023),
                // AIIM's own composite scores: deterministic layout values until scored from Test Data.
                'opportunity_score' => self::placeholder('Opportunity score', $iso2 === 'ZA' ? 78.4 : self::score($iso2, 52, 30), '/100', null, 'AIIM model'),
                'risk_score' => self::placeholder('Risk score', $iso2 === 'ZA' ? 3.2 : round(self::score($iso2.'r', 22, 22) / 10, 1), '/5', null, 'AIIM model'),
            ],
        ];
    }

    public static function slug(string $name): string
    {
        return Africa::slug($name);
    }

    private static function placeholder(string $label, int|float|null $value, string $unit, ?int $year, string $source = 'World Bank / IMF (approx.)'): array
    {
        return ['label' => $label, 'value' => $value, 'unit' => $unit, 'year' => $year, 'source' => $source, 'status' => self::PLACEHOLDER];
    }

    /** Stable pseudo-random number in [min, min + span) derived from a key. */
    private static function score(string $key, int $min, int $span): float
    {
        return round($min + (crc32($key) % ($span * 10)) / 10, 1);
    }
}
