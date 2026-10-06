<?php

namespace App\Support\CorePages;

use App\Support\Platform\Africa;

/**
 * Find the Right Service view of the 54 African country objects.
 *
 * Base facts (name, region, capital, currency, official languages) come from the canonical
 * register App\Support\Platform\Africa. This class only adds the section's own fields: the
 * legal-system label and TBCA presence. Legal-system labels and office presence are working
 * placeholders that the country desk must confirm before publication.
 */
class AfricaCountries
{
    public const REGIONS = Africa::REGIONS_LIST;

    /** Countries whose presence/legal data has been confirmed by TBCA (everything else is placeholder). */
    public const CONFIRMED = ['ZA'];

    /** ISO2 => legal-system label (section-specific; to be confirmed by the country desk). */
    public const LEGAL_SYSTEMS = [
        'DZ' => 'Civil law (French tradition) with Islamic law elements',
        'EG' => 'Civil law with Islamic law elements',
        'LY' => 'Civil law with Islamic law elements',
        'MR' => 'Mixed civil and Islamic law',
        'MA' => 'Civil law with Islamic law elements',
        'TN' => 'Civil law (French tradition)',
        'BJ' => 'Civil law (OHADA member)',
        'BF' => 'Civil law (OHADA member)',
        'CV' => 'Civil law (Portuguese tradition)',
        'CI' => 'Civil law (OHADA member)',
        'GM' => 'Common law',
        'GH' => 'Common law',
        'GN' => 'Civil law (OHADA member)',
        'GW' => 'Civil law (OHADA member)',
        'LR' => 'Common law',
        'ML' => 'Civil law (OHADA member)',
        'NE' => 'Civil law (OHADA member)',
        'NG' => 'Common law',
        'SN' => 'Civil law (OHADA member)',
        'SL' => 'Common law',
        'TG' => 'Civil law (OHADA member)',
        'BI' => 'Civil law (Belgian tradition)',
        'CM' => 'Mixed civil and common law (OHADA member)',
        'CF' => 'Civil law (OHADA member)',
        'TD' => 'Civil law (OHADA member)',
        'CG' => 'Civil law (OHADA member)',
        'CD' => 'Civil law (OHADA member)',
        'GQ' => 'Civil law (OHADA member)',
        'GA' => 'Civil law (OHADA member)',
        'ST' => 'Civil law (OHADA member)',
        'KM' => 'Mixed civil and Islamic law (OHADA member)',
        'DJ' => 'Civil law with Islamic law elements',
        'ER' => 'Civil law',
        'ET' => 'Civil law',
        'KE' => 'Common law',
        'MG' => 'Civil law (French tradition)',
        'MU' => 'Mixed civil and common law',
        'RW' => 'Mixed civil and common law',
        'SC' => 'Mixed civil and common law',
        'SO' => 'Mixed civil, Islamic and customary law',
        'SS' => 'Common law with customary law',
        'SD' => 'Mixed Islamic and common law',
        'TZ' => 'Common law',
        'UG' => 'Common law',
        'AO' => 'Civil law (Portuguese tradition)',
        'BW' => 'Mixed Roman-Dutch and common law',
        'SZ' => 'Mixed Roman-Dutch and customary law',
        'LS' => 'Mixed Roman-Dutch and customary law',
        'MW' => 'Common law',
        'MZ' => 'Civil law (Portuguese tradition)',
        'NA' => 'Mixed Roman-Dutch and common law',
        'ZA' => 'Common law (Roman-Dutch foundation)',
        'ZM' => 'Common law',
        'ZW' => 'Mixed Roman-Dutch and common law',
    ];

    /** @return array<string, array<string, mixed>> keyed by ISO */
    public static function all(): array
    {
        $out = [];
        foreach (Africa::all() as $iso => $c) {
            $out[$iso] = [
                'iso' => $iso,
                'name' => $c['short_name'],
                'region' => $c['region_name'],
                'capital' => $c['capital'],
                'currency' => $c['currency_code'],
                'currency_name' => $c['currency_name'],
                'languages' => self::languages($c['languages']),
                'legal_system' => self::LEGAL_SYSTEMS[$iso] ?? 'To be confirmed',
                'office' => $iso === 'ZA'
                    ? 'TBCA Head Office, Pretoria'
                    : 'Served from TBCA Head Office and partner network (country office to be confirmed)',
                'confirmed' => in_array($iso, self::CONFIRMED, true),
            ];
        }

        return $out;
    }

    /** @param list<string> $languages */
    private static function languages(array $languages): string
    {
        if (count($languages) <= 5) {
            return implode(', ', $languages);
        }

        return implode(', ', array_slice($languages, 0, 4)).' and '.(count($languages) - 4).' further official languages';
    }
}
