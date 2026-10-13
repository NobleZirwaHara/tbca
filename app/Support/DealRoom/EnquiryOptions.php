<?php

namespace App\Support\DealRoom;

/**
 * Register of the Virtual Deal Room enquiry options (client review of 8 Oct 2026):
 * the grouped transaction types and the indicative raise bands.
 *
 * Transaction types are stored on the room as their label (rooms.transaction_type
 * is a free string), so rooms created with the earlier list still display as-is;
 * LEGACY_TYPES maps those earlier labels to their group for reporting.
 *
 * Raise bands are set in whole South African rand. The enquiry stores the band
 * code; the front end renders the label in the visitor's display currency from
 * the band's ZAR limits (resources/js/lib/moneyBands.ts).
 */
class EnquiryOptions
{
    /** Group => [label => deal_type]. deal_type keys are Rooms::DEAL_TYPES. */
    public const TRANSACTION_TYPES = [
        'Mergers & Acquisitions (M&A)' => [
            'Sell-Side M&A' => 'ma',
            'Buy-Side M&A' => 'ma',
            'Cross-Border Acquisitions' => 'ma',
            'Joint Ventures (JVs)' => 'partnership',
            'Divestitures & Carve-Outs' => 'ma',
        ],
        'Capital Raising & Financing' => [
            'Venture Capital (VC) Financings' => 'fundraising',
            'Private Equity (PE) Investments' => 'fundraising',
            'Initial Public Offerings (IPOs)' => 'fundraising',
            'Debt Financing & Syndication' => 'lending',
            'Private Placements' => 'fundraising',
        ],
        'Real Estate & Infrastructure' => [
            'Commercial Real Estate Sales' => 'ma',
            'Real Estate Portfolio Acquisitions' => 'ma',
            'Infrastructure Concessions & Project Finance' => 'procurement',
        ],
        'Restructuring & Distressed Transactions' => [
            'Corporate Restructuring & Recapitalization' => 'restructuring',
            'Bankruptcy & Insolvency Proceedings' => 'restructuring',
            'Distressed Asset Sales' => 'restructuring',
        ],
        'Strategic Partnerships & Commercial Agreements' => [
            'Licensing Agreements' => 'partnership',
            'Intellectual Property (IP) Transfers & Sales' => 'partnership',
            'Strategic Outsourcing & Vendor Bidding' => 'procurement',
        ],
    ];

    /** Transaction types used before the 8 Oct 2026 review => their group. Still displayed on old rooms. */
    public const LEGACY_TYPES = [
        'Fundraising / Capital Raise' => 'Capital Raising & Financing',
        'Fundraising & Growth Capital Raise' => 'Capital Raising & Financing',
        'Company Sale / M&A' => 'Mergers & Acquisitions (M&A)',
        'Acquisition / Buy-Side' => 'Mergers & Acquisitions (M&A)',
        'Lending / Credit Review' => 'Capital Raising & Financing',
        'Strategic Partnership / JV' => 'Strategic Partnerships & Commercial Agreements',
        'Procurement / PPP' => 'Real Estate & Infrastructure',
    ];

    /**
     * Indicative raise / deal size bands in whole ZAR. `max` is exclusive and null
     * for the open top band. `indicative_zar` is the working value stored in
     * rooms.amount_zar for fee estimates (band midpoint; the floor for the top band).
     */
    public const RAISE_BANDS = [
        'RAISE_UNDER_1M' => ['min' => 0, 'max' => 1_000_000, 'indicative_zar' => 500_000],
        'RAISE_1M_5M' => ['min' => 1_000_000, 'max' => 5_000_000, 'indicative_zar' => 3_000_000],
        'RAISE_5M_50M' => ['min' => 5_000_000, 'max' => 50_000_000, 'indicative_zar' => 27_500_000],
        'RAISE_50M_100M' => ['min' => 50_000_000, 'max' => 100_000_000, 'indicative_zar' => 75_000_000],
        'RAISE_100M_500M' => ['min' => 100_000_000, 'max' => 500_000_000, 'indicative_zar' => 300_000_000],
        'RAISE_OVER_500M' => ['min' => 500_000_000, 'max' => null, 'indicative_zar' => 500_000_000],
    ];

    /** Grouped transaction types for the enquiry select: [['group' => ..., 'options' => [label, ...]], ...]. */
    public static function transactionTypeGroups(): array
    {
        return collect(self::TRANSACTION_TYPES)
            ->map(fn (array $types, string $group) => ['group' => $group, 'options' => array_keys($types)])
            ->values()
            ->all();
    }

    /** @return list<string> every current transaction type label */
    public static function transactionTypes(): array
    {
        return collect(self::TRANSACTION_TYPES)->flatMap(fn (array $types) => array_keys($types))->values()->all();
    }

    /** Group of a transaction type label, including the earlier labels. */
    public static function groupOf(?string $type): ?string
    {
        if ($type === null) {
            return null;
        }

        foreach (self::TRANSACTION_TYPES as $group => $types) {
            if (array_key_exists($type, $types)) {
                return $group;
            }
        }

        return self::LEGACY_TYPES[$type] ?? null;
    }

    /** Rooms::DEAL_TYPES key for a transaction type label. */
    public static function dealTypeOf(string $type): string
    {
        foreach (self::TRANSACTION_TYPES as $types) {
            if (isset($types[$type])) {
                return $types[$type];
            }
        }

        return match (true) {
            str_contains($type, 'Sale'), str_contains($type, 'Acquisition') => 'ma',
            str_contains($type, 'Lending') => 'lending',
            str_contains($type, 'Partnership') => 'partnership',
            str_contains($type, 'Procurement') => 'procurement',
            default => 'fundraising',
        };
    }

    /** Raise bands as a list for the front end: [['code', 'min', 'max', 'indicative_zar'], ...]. */
    public static function raiseBands(): array
    {
        return collect(self::RAISE_BANDS)
            ->map(fn (array $band, string $code) => ['code' => $code, ...$band])
            ->values()
            ->all();
    }

    /** @return array{code: string, min: int, max: int|null, indicative_zar: int}|null */
    public static function band(?string $code): ?array
    {
        return $code !== null && isset(self::RAISE_BANDS[$code]) ? ['code' => $code, ...self::RAISE_BANDS[$code]] : null;
    }

    /** The band an amount in ZAR falls into (used to back-fill rooms created before bands existed). */
    public static function bandForAmount(int|float $zar): array
    {
        foreach (self::RAISE_BANDS as $code => $band) {
            if ($band['max'] === null || $zar < $band['max']) {
                return ['code' => $code, ...$band];
            }
        }

        return ['code' => 'RAISE_OVER_500M', ...self::RAISE_BANDS['RAISE_OVER_500M']];
    }

    /** Plain ZAR label for server-side text (emails, audit, exports), e.g. "R5m to R50m". */
    public static function zarLabel(string $code): string
    {
        $band = self::band($code);
        if (! $band) {
            return $code;
        }

        $fmt = fn (int $zar) => 'R'.rtrim(rtrim(number_format($zar / 1_000_000, 1, '.', ''), '0'), '.').'m';

        return match (true) {
            $band['min'] === 0 => 'Under '.$fmt($band['max']),
            $band['max'] === null => 'Over '.$fmt($band['min']),
            default => $fmt($band['min']).' to '.$fmt($band['max']),
        };
    }
}
