<?php

namespace App\Support\Countries;

use App\Support\Platform\Africa;

/**
 * Appendix V — the 54-country shell register. One canonical schema, 54 instances.
 * Identity reference data only (name, ISO, geography, ISO currency code). Country
 * facts such as tax, legal system or languages are never filled from this list.
 */
class CountryRegister
{
    /**
     * Countries-section fields per country: [income group, shell RCS %]. Shared base facts
     * (ISO3, name, AU region, currency) come from App\Support\Platform\Africa.
     */
    public const EXTRAS = [
        'DZ' => ['Upper Middle Income', 18],
        'AO' => ['Lower Middle Income', 22],
        'BJ' => ['Lower Middle Income', 16],
        'BW' => ['Upper Middle Income', 25],
        'BF' => ['Low Income', 17],
        'BI' => ['Low Income', 14],
        'CV' => ['Lower Middle Income', 15],
        'CM' => ['Lower Middle Income', 19],
        'CF' => ['Low Income', 8],
        'TD' => ['Low Income', 9],
        'KM' => ['Lower Middle Income', 10],
        'CG' => ['Lower Middle Income', 12],
        'CI' => ['Lower Middle Income', 21],
        'CD' => ['Low Income', 11],
        'DJ' => ['Lower Middle Income', 13],
        'EG' => ['Lower Middle Income', 24],
        'GQ' => ['Upper Middle Income', 9],
        'ER' => ['Low Income', 6],
        'SZ' => ['Lower Middle Income', 20],
        'ET' => ['Low Income', 17],
        'GA' => ['Upper Middle Income', 12],
        'GM' => ['Low Income', 11],
        'GH' => ['Lower Middle Income', 27],
        'GN' => ['Lower Middle Income', 10],
        'GW' => ['Low Income', 8],
        'KE' => ['Lower Middle Income', 29],
        'LS' => ['Lower Middle Income', 18],
        'LR' => ['Low Income', 10],
        'LY' => ['Upper Middle Income', 7],
        'MG' => ['Low Income', 13],
        'MW' => ['Low Income', 16],
        'ML' => ['Low Income', 9],
        'MR' => ['Lower Middle Income', 10],
        'MU' => ['High Income', 28],
        'MA' => ['Lower Middle Income', 23],
        'MZ' => ['Low Income', 15],
        'NA' => ['Upper Middle Income', 24],
        'NE' => ['Low Income', 7],
        'NG' => ['Lower Middle Income', 26],
        'RW' => ['Low Income', 22],
        'ST' => ['Lower Middle Income', 8],
        'SN' => ['Lower Middle Income', 19],
        'SC' => ['High Income', 14],
        'SL' => ['Low Income', 9],
        'SO' => ['Low Income', 5],
        'ZA' => ['Upper Middle Income', 100],
        'SS' => ['Low Income', 5],
        'SD' => ['Low Income', 6],
        'TZ' => ['Lower Middle Income', 23],
        'TG' => ['Low Income', 12],
        'TN' => ['Lower Middle Income', 20],
        'UG' => ['Low Income', 18],
        'ZM' => ['Lower Middle Income', 21],
        'ZW' => ['Lower Middle Income', 14],
    ];

    /** Legacy display names kept so existing /countries slugs stay stable. */
    private const NAMES = ['CG' => 'Congo'];

    /**
     * [iso2, iso3, name, region, currency, income group, shell RCS %], alphabetical by name.
     *
     * @return list<array{0: string, 1: string, 2: string, 3: string, 4: string, 5: string, 6: int}>
     */
    public static function countries(): array
    {
        return collect(Africa::all())
            ->map(fn (array $c, string $iso) => [
                $iso,
                $c['iso3'],
                self::NAMES[$iso] ?? $c['name'],
                $c['region_name'],
                $c['currency_code'],
                ...self::EXTRAS[$iso],
            ])
            ->sortBy(fn (array $row) => Africa::slug($row[2]))
            ->values()
            ->all();
    }

    public const REGIONS = Africa::REGIONS_LIST;

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
