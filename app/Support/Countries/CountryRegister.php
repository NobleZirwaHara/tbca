<?php

namespace App\Support\Countries;

/**
 * Appendix V — the 54-country shell register. One canonical schema, 54 instances.
 * Identity reference data only (name, ISO, geography, ISO currency code). Country
 * facts such as tax, legal system or languages are never filled from this list.
 */
class CountryRegister
{
    /** [iso2, iso3, name, region, currency, income group, shell RCS %] */
    public const COUNTRIES = [
        ['DZ', 'DZA', 'Algeria', 'North Africa', 'DZD', 'Upper Middle Income', 18],
        ['AO', 'AGO', 'Angola', 'Middle Africa', 'AOA', 'Lower Middle Income', 22],
        ['BJ', 'BEN', 'Benin', 'West Africa', 'XOF', 'Lower Middle Income', 16],
        ['BW', 'BWA', 'Botswana', 'Southern Africa', 'BWP', 'Upper Middle Income', 25],
        ['BF', 'BFA', 'Burkina Faso', 'West Africa', 'XOF', 'Low Income', 17],
        ['BI', 'BDI', 'Burundi', 'East Africa', 'BIF', 'Low Income', 14],
        ['CV', 'CPV', 'Cabo Verde', 'West Africa', 'CVE', 'Lower Middle Income', 15],
        ['CM', 'CMR', 'Cameroon', 'Middle Africa', 'XAF', 'Lower Middle Income', 19],
        ['CF', 'CAF', 'Central African Republic', 'Middle Africa', 'XAF', 'Low Income', 8],
        ['TD', 'TCD', 'Chad', 'Middle Africa', 'XAF', 'Low Income', 9],
        ['KM', 'COM', 'Comoros', 'East Africa', 'KMF', 'Lower Middle Income', 10],
        ['CG', 'COG', 'Congo', 'Middle Africa', 'XAF', 'Lower Middle Income', 12],
        ['CI', 'CIV', "Cote d'Ivoire", 'West Africa', 'XOF', 'Lower Middle Income', 21],
        ['CD', 'COD', 'Democratic Republic of the Congo', 'Middle Africa', 'CDF', 'Low Income', 11],
        ['DJ', 'DJI', 'Djibouti', 'East Africa', 'DJF', 'Lower Middle Income', 13],
        ['EG', 'EGY', 'Egypt', 'North Africa', 'EGP', 'Lower Middle Income', 24],
        ['GQ', 'GNQ', 'Equatorial Guinea', 'Middle Africa', 'XAF', 'Upper Middle Income', 9],
        ['ER', 'ERI', 'Eritrea', 'East Africa', 'ERN', 'Low Income', 6],
        ['SZ', 'SWZ', 'Eswatini', 'Southern Africa', 'SZL', 'Lower Middle Income', 20],
        ['ET', 'ETH', 'Ethiopia', 'East Africa', 'ETB', 'Low Income', 17],
        ['GA', 'GAB', 'Gabon', 'Middle Africa', 'XAF', 'Upper Middle Income', 12],
        ['GM', 'GMB', 'Gambia', 'West Africa', 'GMD', 'Low Income', 11],
        ['GH', 'GHA', 'Ghana', 'West Africa', 'GHS', 'Lower Middle Income', 27],
        ['GN', 'GIN', 'Guinea', 'West Africa', 'GNF', 'Lower Middle Income', 10],
        ['GW', 'GNB', 'Guinea-Bissau', 'West Africa', 'XOF', 'Low Income', 8],
        ['KE', 'KEN', 'Kenya', 'East Africa', 'KES', 'Lower Middle Income', 29],
        ['LS', 'LSO', 'Lesotho', 'Southern Africa', 'LSL', 'Lower Middle Income', 18],
        ['LR', 'LBR', 'Liberia', 'West Africa', 'LRD', 'Low Income', 10],
        ['LY', 'LBY', 'Libya', 'North Africa', 'LYD', 'Upper Middle Income', 7],
        ['MG', 'MDG', 'Madagascar', 'Southern Africa', 'MGA', 'Low Income', 13],
        ['MW', 'MWI', 'Malawi', 'Southern Africa', 'MWK', 'Low Income', 16],
        ['ML', 'MLI', 'Mali', 'West Africa', 'XOF', 'Low Income', 9],
        ['MR', 'MRT', 'Mauritania', 'North Africa', 'MRU', 'Lower Middle Income', 10],
        ['MU', 'MUS', 'Mauritius', 'Southern Africa', 'MUR', 'High Income', 28],
        ['MA', 'MAR', 'Morocco', 'North Africa', 'MAD', 'Lower Middle Income', 23],
        ['MZ', 'MOZ', 'Mozambique', 'Southern Africa', 'MZN', 'Low Income', 15],
        ['NA', 'NAM', 'Namibia', 'Southern Africa', 'NAD', 'Upper Middle Income', 24],
        ['NE', 'NER', 'Niger', 'West Africa', 'XOF', 'Low Income', 7],
        ['NG', 'NGA', 'Nigeria', 'West Africa', 'NGN', 'Lower Middle Income', 26],
        ['RW', 'RWA', 'Rwanda', 'East Africa', 'RWF', 'Low Income', 22],
        ['ST', 'STP', 'Sao Tome and Principe', 'Middle Africa', 'STN', 'Lower Middle Income', 8],
        ['SN', 'SEN', 'Senegal', 'West Africa', 'XOF', 'Lower Middle Income', 19],
        ['SC', 'SYC', 'Seychelles', 'Southern Africa', 'SCR', 'High Income', 14],
        ['SL', 'SLE', 'Sierra Leone', 'West Africa', 'SLE', 'Low Income', 9],
        ['SO', 'SOM', 'Somalia', 'East Africa', 'SOS', 'Low Income', 5],
        ['ZA', 'ZAF', 'South Africa', 'Southern Africa', 'ZAR', 'Upper Middle Income', 100],
        ['SS', 'SSD', 'South Sudan', 'East Africa', 'SSP', 'Low Income', 5],
        ['SD', 'SDN', 'Sudan', 'North Africa', 'SDG', 'Low Income', 6],
        ['TZ', 'TZA', 'Tanzania', 'East Africa', 'TZS', 'Lower Middle Income', 23],
        ['TG', 'TGO', 'Togo', 'West Africa', 'XOF', 'Low Income', 12],
        ['TN', 'TUN', 'Tunisia', 'North Africa', 'TND', 'Lower Middle Income', 20],
        ['UG', 'UGA', 'Uganda', 'East Africa', 'UGX', 'Low Income', 18],
        ['ZM', 'ZMB', 'Zambia', 'Southern Africa', 'ZMW', 'Lower Middle Income', 21],
        ['ZW', 'ZWE', 'Zimbabwe', 'Southern Africa', 'ZWG', 'Lower Middle Income', 14],
    ];

    public const REGIONS = ['North Africa', 'West Africa', 'Middle Africa', 'East Africa', 'Southern Africa'];

    /**
     * The nine resolver domains (CT-008) with required-field counts and the
     * hard-block class each one protects (Part 4.4).
     */
    public const DOMAINS = [
        ['legal', 'Legal & Regulatory', 'Company, commercial, contract and regulatory framework', 22, 'professional permission'],
        ['tax', 'Tax & Statutory', 'Corporate tax, VAT, PAYE, duties, levies and incentives', 18, 'tax'],
        ['payments', 'Payments & FX', 'Payment rails, methods, liquidity, FX and gateways', 16, 'payment/settlement'],
        ['identity', 'Identity & KYC', 'Identification, verification, AML and onboarding rules', 14, null],
        ['data', 'Data & Licences', 'Data residency, licences, IP, usage and publication', 12, 'licence/use permission'],
        ['partner', 'Partner & Professional Boundary', 'Partner routing, professional boundaries, reviews', 14, 'professional permission'],
        ['sanctions', 'Sanctions & Prohibitions', 'Sanctions, export controls, prohibitions and watchlists', 10, 'sanctions/prohibition'],
        ['corridor', 'Corridor & Trade', 'Borders, transit, trade rules and corridor dependencies', 14, 'corridor pair/crossing'],
        ['languages', 'Languages & Localisation', 'Official languages, localisation and content rules', 10, null],
    ];

    /** Appendix Q — absence object codes and client-facing copy. */
    public const ABSENCE = [
        'ABS-01' => ['NOT_SOURCED', 'No approved source currently supports the required field.'],
        'ABS-02' => ['STALE', 'The latest evidence exceeds the approved freshness window.'],
        'ABS-03' => ['CONTRADICTED', 'Material sources conflict and the contradiction is unresolved.'],
        'ABS-04' => ['LICENCE_BLOCKED', 'Evidence exists but the intended product/use is not permitted.'],
        'ABS-05' => ['OPINION_REQUIRED', 'A current qualified legal/tax/professional determination is required.'],
        'ABS-06' => ['PAYMENT_OR_LIQUIDITY_UNVERIFIED', 'The required rail/settlement/transferability condition is not verified.'],
        'ABS-07' => ['PROFESSIONAL_PERMISSION_UNRESOLVED', 'Required local/qualified professional route is not established.'],
        'ABS-08' => ['NOT_APPLICABLE', 'The field does not apply to this exact request and is excluded from completeness by rule.'],
        'ABS-09' => ['PROHIBITED_OR_RESTRICTED', 'The field/action cannot be used or exposed for the requested purpose.'],
    ];

    public const ABSENCE_SUFFIX = 'TBCA will not fill this gap with an estimate or assumption. The next permitted step is shown where one exists.';

    /** Domain key => resolver error code raised when it is incomplete (Part 4.5). */
    public const DOMAIN_ERRORS = [
        'legal' => ['CT-RES-012', 'Professional permission unresolved', 'ABS-05'],
        'tax' => ['CT-RES-007', 'Tax unresolved', 'ABS-05'],
        'payments' => ['CT-RES-009', 'Payment rail unresolved', 'ABS-06'],
        'identity' => ['CT-RES-001', 'Request invalid (identity/KYC rules unresolved)', 'ABS-01'],
        'data' => ['CT-RES-015', 'Licence unresolved/denied', 'ABS-04'],
        'partner' => ['CT-RES-013', 'Partner route unresolved', 'ABS-07'],
        'sanctions' => ['CT-RES-004', 'State not transaction-permitted (screening unresolved)', 'ABS-09'],
        'corridor' => ['CT-RES-018', 'Corridor endpoint unresolved', 'ABS-01'],
        'languages' => ['CT-RES-001', 'Language/publication rules unresolved', 'ABS-01'],
    ];

    public static function slug(string $name): string
    {
        return \Illuminate\Support\Str::slug(str_replace("'", '', $name));
    }

    public static function absenceCopy(string $code): string
    {
        return (self::ABSENCE[$code][1] ?? 'Required evidence is not currently held.').' '.self::ABSENCE_SUFFIX;
    }
}
