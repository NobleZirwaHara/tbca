<?php

namespace App\Support\Products\Digital;

use App\Models\Products\Digital\DpProduct;
use App\Support\Platform\Africa;

/**
 * Market attributes of a Digital Product: the languages it is published in, the currencies it
 * is priced / available in, and the jurisdictions it is written for (any of Africa's 54
 * countries, or Pan-African). Drives the browse filters and the card / detail labels.
 *
 * Prices stay stored in ZAR; a currency here means the product is offered and invoiced in it.
 */
class Markets
{
    /** The platform's 7 languages (code => label), in display order. */
    public const LANGUAGES = [
        'EN' => 'English',
        'AF' => 'Afrikaans',
        'PT' => 'Portuguese',
        'ZH' => 'Chinese (Mandarin)',
        'FR' => 'French',
        'SW' => 'Swahili',
        'AR' => 'Arabic',
    ];

    /** The platform's 5 currencies (code => label). RMB is ISO 4217 CNY. */
    public const CURRENCIES = [
        'ZAR' => 'South African Rand',
        'USD' => 'US Dollar',
        'XOF' => 'West African CFA Franc',
        'EUR' => 'Euro',
        'RMB' => 'Chinese Yuan (RMB)',
    ];

    public const PAN = 'PAN';

    private const ALL_CURRENCIES = ['ZAR', 'USD', 'XOF', 'EUR', 'RMB'];

    /**
     * Per-product market profile (slug => languages beyond English with their state,
     * currencies, jurisdictions). Products not listed: English + Pan-African + all 5 currencies.
     * Afrikaans falls back to the catalogue row's `af` state when not given here.
     */
    private const PROFILES = [
        'business-plan-template' => ['languages' => ['FR' => 'approved', 'PT' => 'approved', 'SW' => 'review'], 'jurisdictions' => ['PAN']],
        'south-africa-investment-opportunities-report-2026' => ['languages' => ['ZH' => 'approved'], 'currencies' => ['ZAR', 'USD', 'EUR', 'RMB'], 'jurisdictions' => ['ZA']],
        'financial-model-template-3-statements' => ['languages' => ['FR' => 'approved', 'PT' => 'review']],
        'esg-due-diligence-toolkit' => ['languages' => ['FR' => 'approved', 'PT' => 'approved', 'AR' => 'review']],
        'aml-kyc-compliance-checklist' => ['currencies' => ['ZAR', 'USD'], 'jurisdictions' => ['ZA', 'NA', 'BW', 'LS', 'SZ']],
        'lean-business-plan-template' => ['languages' => ['FR' => 'approved', 'SW' => 'approved', 'AR' => 'approved']],
        'pitch-deck-template' => ['languages' => ['PT' => 'approved', 'ZH' => 'approved', 'FR' => 'approved', 'SW' => 'approved', 'AR' => 'approved']],
        'cash-flow-forecast-template' => ['languages' => ['FR' => 'approved'], 'currencies' => ['XOF', 'EUR', 'USD', 'ZAR'], 'jurisdictions' => ['PAN', 'SN', 'CI', 'BJ', 'BF', 'ML', 'NE', 'TG', 'GW']],
        'market-research-toolkit' => ['languages' => ['PT' => 'approved', 'FR' => 'review'], 'jurisdictions' => ['PAN', 'AO', 'MZ', 'CV', 'GW', 'ST']],
        'board-pack-template' => ['currencies' => ['ZAR', 'USD', 'EUR'], 'jurisdictions' => ['ZA', 'KE', 'NG', 'GH', 'MU']],
        'feasibility-study-guide' => ['languages' => ['FR' => 'review']],
        'sector-opportunity-guide-energy' => ['languages' => ['FR' => 'approved', 'PT' => 'approved', 'AR' => 'approved'], 'jurisdictions' => ['PAN', 'EG', 'MA', 'NG', 'KE', 'ZA']],
        'africa-trade-101-guide' => ['languages' => ['PT' => 'approved', 'ZH' => 'approved', 'FR' => 'approved', 'SW' => 'approved', 'AR' => 'approved']],
        'local-content-compliance-toolkit' => ['currencies' => ['ZAR', 'USD'], 'jurisdictions' => ['ZA']],
        'financial-literacy-for-founders-course' => ['languages' => ['SW' => 'approved'], 'currencies' => ['ZAR', 'USD'], 'jurisdictions' => ['ZA', 'KE', 'TZ', 'UG', 'RW']],
        'marketing-strategy-toolkit' => ['languages' => ['FR' => 'review']],
    ];

    /**
     * Market fields for a catalogue row, ready to store on the product.
     *
     * @param  array<string, mixed>  $row
     * @return array{languages: list<array<string, string>>, currencies: list<string>, jurisdictions: list<string>, jurisdiction: string}
     */
    public static function forRow(array $row): array
    {
        $profile = self::PROFILES[$row['slug']] ?? [];
        $states = ['EN' => 'approved', 'AF' => $row['af'] ?? 'unavailable', ...($profile['languages'] ?? [])];
        $jurisdictions = $profile['jurisdictions'] ?? [self::PAN];

        return [
            'languages' => self::languageRows($states),
            'currencies' => $profile['currencies'] ?? self::ALL_CURRENCIES,
            'jurisdictions' => $jurisdictions,
            'jurisdiction' => self::jurisdictionLabel($jurisdictions),
        ];
    }

    /**
     * @param  array<string, string>  $states  code => approved|review|unavailable
     * @return list<array{code: string, label: string, state: string, note: string}>
     */
    public static function languageRows(array $states): array
    {
        return collect(self::LANGUAGES)->map(fn ($label, $code) => [
            'code' => $code,
            'label' => $label,
            'state' => $state = $states[$code] ?? 'unavailable',
            'note' => match ($state) {
                'approved' => $code === 'EN' ? 'Full content available' : 'Human-reviewed translation',
                'review' => 'In progress – human review pending',
                default => 'Not available',
            },
        ])->values()->all();
    }

    public static function languageLabel(?string $code): string
    {
        $code = strtoupper((string) $code ?: 'EN');

        return $code.' – '.(self::LANGUAGES[$code] ?? $code);
    }

    /** @param list<string> $codes */
    public static function jurisdictionLabel(array $codes): string
    {
        $pan = in_array(self::PAN, $codes, true);
        $names = collect($codes)->reject(fn ($c) => $c === self::PAN)->map(fn ($c) => self::jurisdictionName($c))->filter()->values();
        $list = $names->count() <= 3 ? $names->implode(', ') : $names->take(2)->implode(', ').' + '.($names->count() - 2).' more';

        return match (true) {
            $names->isEmpty() => Africa::PAN_AFRICAN,
            $pan => Africa::PAN_AFRICAN." (focus: {$list})",
            default => $list,
        };
    }

    public static function jurisdictionName(string $code): ?string
    {
        return $code === self::PAN ? Africa::PAN_AFRICAN : (Africa::find($code)['short_name'] ?? null);
    }

    /** Pan-African products apply in every country; a country filter also matches them. */
    public static function appliesIn(DpProduct $p, string $code): bool
    {
        $codes = $p->jurisdictions ?? [self::PAN];

        return in_array($code, $codes, true) || ($code !== self::PAN && in_array(self::PAN, $codes, true));
    }

    public static function hasLanguage(DpProduct $p, string $code): bool
    {
        return collect($p->languages ?? [])->where('code', $code)->where('state', 'approved')->isNotEmpty();
    }

    public static function hasCurrency(DpProduct $p, string $code): bool
    {
        return in_array($code, $p->currencies ?? self::ALL_CURRENCIES, true);
    }

    /**
     * Jurisdiction options: Pan-African first, then the 54 countries grouped by AU region.
     *
     * @return list<array{key: string, label: string, group: string}>
     */
    public static function jurisdictionOptions(): array
    {
        $countries = collect(Africa::all())
            ->sortBy(fn ($c) => array_search($c['region'], array_keys(Africa::REGIONS), true).'|'.$c['short_name'])
            ->map(fn ($c) => ['key' => $c['iso2'], 'label' => $c['short_name'], 'group' => $c['region_name']])
            ->values();

        return [['key' => self::PAN, 'label' => Africa::PAN_AFRICAN.' (all 54 countries)', 'group' => 'Africa'], ...$countries->all()];
    }
}
