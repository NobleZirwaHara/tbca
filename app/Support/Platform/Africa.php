<?php

namespace App\Support\Platform;

use Illuminate\Support\Str;

/**
 * The canonical register of Africa's 54 countries (the 54 UN member states that sit in the
 * African Union), grouped into the five AU regions. This is the single source of the shared
 * base facts every section reads from: name, slug, ISO codes, region, capital, ISO 4217
 * currency and official languages. Section-specific data (AIIM indicators, the Find the
 * Right Service legal-system labels, the Countries resolver metrics) stays in its section.
 *
 * Public reference data only. The slug is URL-stable (AIIM country pages use it).
 */
final class Africa
{
    /** AU region key => label, in display order. */
    public const REGIONS = [
        'north' => 'North Africa',
        'west' => 'West Africa',
        'central' => 'Central Africa',
        'east' => 'East Africa',
        'southern' => 'Southern Africa',
    ];

    /** Region labels in display order (usable in constant expressions). */
    public const REGIONS_LIST = ['North Africa', 'West Africa', 'Central Africa', 'East Africa', 'Southern Africa'];

    /** The pan-African scope label used alongside the 54 countries (filters, jurisdictions). */
    public const PAN_AFRICAN = 'Pan-African';

    /**
     * [iso2, iso3, name, short name, region key, capital, currency code, currency name, official languages]
     */
    private const ROWS = [
        // North Africa
        ['DZ', 'DZA', 'Algeria', 'Algeria', 'north', 'Algiers', 'DZD', 'Algerian Dinar', ['Arabic', 'Tamazight']],
        ['EG', 'EGY', 'Egypt', 'Egypt', 'north', 'Cairo', 'EGP', 'Egyptian Pound', ['Arabic']],
        ['LY', 'LBY', 'Libya', 'Libya', 'north', 'Tripoli', 'LYD', 'Libyan Dinar', ['Arabic']],
        ['MR', 'MRT', 'Mauritania', 'Mauritania', 'north', 'Nouakchott', 'MRU', 'Mauritanian Ouguiya', ['Arabic']],
        ['MA', 'MAR', 'Morocco', 'Morocco', 'north', 'Rabat', 'MAD', 'Moroccan Dirham', ['Arabic', 'Tamazight']],
        ['TN', 'TUN', 'Tunisia', 'Tunisia', 'north', 'Tunis', 'TND', 'Tunisian Dinar', ['Arabic']],
        // West Africa
        ['BJ', 'BEN', 'Benin', 'Benin', 'west', 'Porto-Novo', 'XOF', 'West African CFA Franc', ['French']],
        ['BF', 'BFA', 'Burkina Faso', 'Burkina Faso', 'west', 'Ouagadougou', 'XOF', 'West African CFA Franc', ['French', 'Mooré', 'Dioula', 'Fulfulde']],
        ['CV', 'CPV', 'Cabo Verde', 'Cabo Verde', 'west', 'Praia', 'CVE', 'Cape Verdean Escudo', ['Portuguese']],
        ['CI', 'CIV', "Côte d'Ivoire", "Côte d'Ivoire", 'west', 'Yamoussoukro', 'XOF', 'West African CFA Franc', ['French']],
        ['GM', 'GMB', 'Gambia', 'Gambia', 'west', 'Banjul', 'GMD', 'Gambian Dalasi', ['English']],
        ['GH', 'GHA', 'Ghana', 'Ghana', 'west', 'Accra', 'GHS', 'Ghanaian Cedi', ['English']],
        ['GN', 'GIN', 'Guinea', 'Guinea', 'west', 'Conakry', 'GNF', 'Guinean Franc', ['French']],
        ['GW', 'GNB', 'Guinea-Bissau', 'Guinea-Bissau', 'west', 'Bissau', 'XOF', 'West African CFA Franc', ['Portuguese']],
        ['LR', 'LBR', 'Liberia', 'Liberia', 'west', 'Monrovia', 'LRD', 'Liberian Dollar', ['English']],
        ['ML', 'MLI', 'Mali', 'Mali', 'west', 'Bamako', 'XOF', 'West African CFA Franc', ['Bambara', 'French (working)']],
        ['NE', 'NER', 'Niger', 'Niger', 'west', 'Niamey', 'XOF', 'West African CFA Franc', ['Hausa', 'French (working)']],
        ['NG', 'NGA', 'Nigeria', 'Nigeria', 'west', 'Abuja', 'NGN', 'Nigerian Naira', ['English']],
        ['SN', 'SEN', 'Senegal', 'Senegal', 'west', 'Dakar', 'XOF', 'West African CFA Franc', ['French', 'Wolof']],
        ['SL', 'SLE', 'Sierra Leone', 'Sierra Leone', 'west', 'Freetown', 'SLE', 'Sierra Leonean Leone', ['English']],
        ['TG', 'TGO', 'Togo', 'Togo', 'west', 'Lomé', 'XOF', 'West African CFA Franc', ['French']],
        // Central Africa
        ['BI', 'BDI', 'Burundi', 'Burundi', 'central', 'Gitega', 'BIF', 'Burundian Franc', ['Kirundi', 'French', 'English']],
        ['CM', 'CMR', 'Cameroon', 'Cameroon', 'central', 'Yaoundé', 'XAF', 'Central African CFA Franc', ['French', 'English']],
        ['CF', 'CAF', 'Central African Republic', 'Central African Republic', 'central', 'Bangui', 'XAF', 'Central African CFA Franc', ['French', 'Sango']],
        ['TD', 'TCD', 'Chad', 'Chad', 'central', "N'Djamena", 'XAF', 'Central African CFA Franc', ['French', 'Arabic']],
        ['CG', 'COG', 'Republic of the Congo', 'Congo', 'central', 'Brazzaville', 'XAF', 'Central African CFA Franc', ['French']],
        ['CD', 'COD', 'Democratic Republic of the Congo', 'DR Congo', 'central', 'Kinshasa', 'CDF', 'Congolese Franc', ['French']],
        ['GQ', 'GNQ', 'Equatorial Guinea', 'Equatorial Guinea', 'central', 'Malabo', 'XAF', 'Central African CFA Franc', ['Spanish', 'French', 'Portuguese']],
        ['GA', 'GAB', 'Gabon', 'Gabon', 'central', 'Libreville', 'XAF', 'Central African CFA Franc', ['French']],
        ['ST', 'STP', 'São Tomé and Príncipe', 'São Tomé and Príncipe', 'central', 'São Tomé', 'STN', 'São Tomé and Príncipe Dobra', ['Portuguese']],
        // East Africa
        ['KM', 'COM', 'Comoros', 'Comoros', 'east', 'Moroni', 'KMF', 'Comorian Franc', ['Comorian', 'Arabic', 'French']],
        ['DJ', 'DJI', 'Djibouti', 'Djibouti', 'east', 'Djibouti', 'DJF', 'Djiboutian Franc', ['French', 'Arabic']],
        ['ER', 'ERI', 'Eritrea', 'Eritrea', 'east', 'Asmara', 'ERN', 'Eritrean Nakfa', ['Tigrinya', 'Arabic', 'English']],
        ['ET', 'ETH', 'Ethiopia', 'Ethiopia', 'east', 'Addis Ababa', 'ETB', 'Ethiopian Birr', ['Amharic', 'Afaan Oromo', 'Tigrinya', 'Somali', 'Afar']],
        ['KE', 'KEN', 'Kenya', 'Kenya', 'east', 'Nairobi', 'KES', 'Kenyan Shilling', ['English', 'Swahili']],
        ['MG', 'MDG', 'Madagascar', 'Madagascar', 'east', 'Antananarivo', 'MGA', 'Malagasy Ariary', ['Malagasy', 'French']],
        ['MU', 'MUS', 'Mauritius', 'Mauritius', 'east', 'Port Louis', 'MUR', 'Mauritian Rupee', ['English', 'French']],
        ['RW', 'RWA', 'Rwanda', 'Rwanda', 'east', 'Kigali', 'RWF', 'Rwandan Franc', ['Kinyarwanda', 'English', 'French', 'Swahili']],
        ['SC', 'SYC', 'Seychelles', 'Seychelles', 'east', 'Victoria', 'SCR', 'Seychellois Rupee', ['English', 'French', 'Seychellois Creole']],
        ['SO', 'SOM', 'Somalia', 'Somalia', 'east', 'Mogadishu', 'SOS', 'Somali Shilling', ['Somali', 'Arabic']],
        ['SS', 'SSD', 'South Sudan', 'South Sudan', 'east', 'Juba', 'SSP', 'South Sudanese Pound', ['English']],
        ['SD', 'SDN', 'Sudan', 'Sudan', 'east', 'Khartoum', 'SDG', 'Sudanese Pound', ['Arabic', 'English']],
        ['TZ', 'TZA', 'Tanzania', 'Tanzania', 'east', 'Dodoma', 'TZS', 'Tanzanian Shilling', ['Swahili', 'English']],
        ['UG', 'UGA', 'Uganda', 'Uganda', 'east', 'Kampala', 'UGX', 'Ugandan Shilling', ['English', 'Swahili']],
        // Southern Africa
        ['AO', 'AGO', 'Angola', 'Angola', 'southern', 'Luanda', 'AOA', 'Angolan Kwanza', ['Portuguese']],
        ['BW', 'BWA', 'Botswana', 'Botswana', 'southern', 'Gaborone', 'BWP', 'Botswana Pula', ['English', 'Setswana']],
        ['SZ', 'SWZ', 'Eswatini', 'Eswatini', 'southern', 'Mbabane', 'SZL', 'Swazi Lilangeni', ['English', 'siSwati']],
        ['LS', 'LSO', 'Lesotho', 'Lesotho', 'southern', 'Maseru', 'LSL', 'Lesotho Loti', ['Sesotho', 'English']],
        ['MW', 'MWI', 'Malawi', 'Malawi', 'southern', 'Lilongwe', 'MWK', 'Malawian Kwacha', ['English', 'Chichewa']],
        ['MZ', 'MOZ', 'Mozambique', 'Mozambique', 'southern', 'Maputo', 'MZN', 'Mozambican Metical', ['Portuguese']],
        ['NA', 'NAM', 'Namibia', 'Namibia', 'southern', 'Windhoek', 'NAD', 'Namibian Dollar', ['English']],
        ['ZA', 'ZAF', 'South Africa', 'South Africa', 'southern', 'Pretoria', 'ZAR', 'South African Rand', ['English', 'Afrikaans', 'isiZulu', 'isiXhosa', 'Sepedi', 'Sesotho', 'Setswana', 'siSwati', 'Tshivenda', 'Xitsonga', 'isiNdebele', 'South African Sign Language']],
        ['ZM', 'ZMB', 'Zambia', 'Zambia', 'southern', 'Lusaka', 'ZMW', 'Zambian Kwacha', ['English']],
        ['ZW', 'ZWE', 'Zimbabwe', 'Zimbabwe', 'southern', 'Harare', 'ZWG', 'Zimbabwe Gold (ZiG)', ['English', 'Shona', 'Ndebele']],
    ];

    /** @var array<string, array<string, mixed>>|null */
    private static ?array $cache = null;

    /**
     * Every country keyed by ISO2, in AU region order.
     *
     * @return array<string, array{iso2: string, iso3: string, name: string, short_name: string, slug: string, region: string, region_name: string, capital: string, currency_code: string, currency_name: string, languages: list<string>}>
     */
    public static function all(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        $out = [];
        foreach (self::ROWS as [$iso2, $iso3, $name, $short, $region, $capital, $ccy, $ccyName, $languages]) {
            $out[$iso2] = [
                'iso2' => $iso2,
                'iso3' => $iso3,
                'name' => $name,
                'short_name' => $short,
                'slug' => self::slug($name),
                'region' => $region,
                'region_name' => self::REGIONS[$region],
                'capital' => $capital,
                'currency_code' => $ccy,
                'currency_name' => $ccyName,
                'languages' => $languages,
            ];
        }

        return self::$cache = $out;
    }

    /** @return array<string, mixed>|null */
    public static function find(string $iso2): ?array
    {
        return self::all()[strtoupper($iso2)] ?? null;
    }

    /** @return array<string, mixed>|null */
    public static function findBySlug(string $slug): ?array
    {
        foreach (self::all() as $country) {
            if ($country['slug'] === $slug) {
                return $country;
            }
        }

        return null;
    }

    /** Short display names, alphabetical (dropdowns, validation lists). @return list<string> */
    public static function names(): array
    {
        $names = array_column(self::all(), 'short_name');
        sort($names, SORT_LOCALE_STRING);

        return array_values($names);
    }

    /** @return list<string> region labels in display order */
    public static function regionNames(): array
    {
        return array_values(self::REGIONS);
    }

    public static function slug(string $name): string
    {
        return Str::slug(str_replace("'", '', Str::ascii($name)));
    }
}
