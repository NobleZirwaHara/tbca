<?php

namespace App\Support\Platform;

/**
 * Single register of TBCA office locations (head office + 12 country offices).
 *
 * Country offices come from the client's "Office Addresses - Africa - 12 Countries"
 * document (Oct 2026). Addresses are shown exactly as supplied; offices without a
 * phone number in the source have `phone` = null.
 */
class Offices
{
    /** The Pretoria head office. */
    public static function headOffice(): array
    {
        return self::shape([
            'slug' => 'south-africa-head-office',
            'kind' => 'head',
            'country' => 'South Africa',
            'iso2' => 'ZA',
            'city' => 'Pretoria',
            'address' => '5th Floor, Blocktrax Building, Blue Gate Road, Lynnwood Ridge, Pretoria, 0081, South Africa',
            'phone' => '+27 60 801 1365',
        ]);
    }

    /** The 12 country offices, in the order given by the client. */
    public static function countryOffices(): array
    {
        $rows = [
            ['MU', 'Mauritius', 'Grand Bay', '2nd Floor, Grand Bay Coeur de Ville complex, Notre Dame de la Salette Street, Grand Bay, 30551, Mauritius', '+230 206 0000'],
            ['GH', 'Ghana', 'Accra', '19 Kofi Annan Street, Airport Residential Area, Accra, Ghana', '+233 30 703 8330'],
            ['EG', 'Egypt', 'Cairo', 'N 90th Street - Service Ln New Cairo Section No. 1, Cairo Governorate 11835, Egypt', null],
            ['NG', 'Nigeria', 'Lagos', '1 Akin Adesola Street, 6th Floor, Victoria Island, Lagos, Nigeria', '+234 201 271 9100'],
            ['BW', 'Botswana', 'Gaborone', 'The Hub, Ground and First Floor, iTowers, CBD Plot 54368, Gaborone, Botswana', null],
            ['ZM', 'Zambia', 'Lusaka', 'SunShare Tower, Plot 15585, Olympia, 1 Katima Mulilo Road, Lusaka, 15584, Zambia', '+260 211 372 710'],
            ['KE', 'Kenya', 'Nairobi', 'Ushuru Pension Plaza, Ground and First Floor, Muthangari Dr, Nairobi, Kenya', '+254 20 5148102'],
            ['ET', 'Ethiopia', 'Addis Ababa', 'The Place Building, Cape Verde Street, Bole Sub-city, Addis Ababa, Ethiopia', '+251 99 577 0777'],
            ['MA', 'Morocco', 'Casablanca', 'Crystal Building 1, 1 Almohades Avenue, Casablanca, Morocco', null],
            ['AO', 'Angola', 'Luanda', 'Condomínio Belas Business Park, Etapa V, Edifício Cuanza Sul (Torre Cuanza Sul), 6º Piso, Talatona, Luanda, Angola', '+244 225 300 600'],
            ['MG', 'Madagascar', 'Antananarivo', 'Explorer Business Park, Bâtiment A1 (or Building B1), Ankorondrano, 101 Antananarivo, Madagascar', '+261 32 71 555 42'],
            ['CI', 'Ivory Coast', 'Abidjan', '7 Boulevard Plein Ciel, Boulevard Valéry Giscard d\'Estaing (VGE), Marcory, 07 BP 512 Abidjan 07, Ivory Coast', '+225 27 21 340770'],
        ];

        return array_map(fn (array $r) => self::shape([
            'slug' => str($r[1])->slug()->toString(),
            'kind' => 'country',
            'country' => $r[1],
            'iso2' => $r[0],
            'city' => $r[2],
            'address' => $r[3],
            'phone' => $r[4],
        ]), $rows);
    }

    /** Head office first, then the country offices. */
    public static function all(): array
    {
        return [self::headOffice(), ...self::countryOffices()];
    }

    /** Adds Google Maps links (keyless embed + "open in Maps"). */
    private static function shape(array $office): array
    {
        $q = urlencode($office['address']);

        return $office + [
            'map_embed' => "https://www.google.com/maps?q={$q}&output=embed",
            'map_link' => "https://www.google.com/maps/search/?api=1&query={$q}",
        ];
    }
}
