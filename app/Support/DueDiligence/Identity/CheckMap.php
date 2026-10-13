<?php

namespace App\Support\DueDiligence\Identity;

/**
 * Which Due Diligence checks (Content::checkTemplate categories) and add-ons
 * an identity provider can serve, and with which verification kind.
 *
 * "full" means the provider result answers the check; "partial" means it
 * supplies evidence but the check still needs other sources or an analyst.
 */
class CheckMap
{
    /** category => [kind for an individual subject, kind for an entity subject, coverage, note] */
    public const CHECKS = [
        'Identity Verification' => ['kyc', 'kyc', 'full', 'Government ID, liveness and face match.'],
        'Sanctions, PEP & Watchlists' => ['aml_individual', 'aml_entity', 'full', 'Sanctions, PEP and watchlist screening; possible matches go to an analyst.'],
        'Adverse Media Check' => ['aml_individual', 'aml_entity', 'partial', 'Adverse media is part of the AML flow; TBCA media review still applies.'],
        'Address Verification' => ['kyc_address', 'kyc_address', 'full', 'Utility bill: name and address extraction, date check and comparison.'],
        'Director & UBO Checks' => ['kyb', 'kyb', 'partial', 'KYB returns directors and beneficial owners and invites each UBO to KYC; screening of each person follows.'],
        'Company Incorporation & Legal Status' => ['kyb', 'kyb', 'partial', 'Registry check where VOVE has a flow for the country; CIPC filings stay with TBCA.'],
        'Shareholding Structure & Ownership Mapping' => ['kyb', 'kyb', 'partial', 'UBO list and ownership percentages; layered structures need analyst mapping.'],
    ];

    /** Add-on code => [kinds, coverage, note] (Catalogue::addons). */
    public const ADDONS = [
        'DD-ADD-PEP' => [['aml_individual', 'aml_entity'], 'partial', 'An enhanced AML flow covers PEP and sanctions screening; the ongoing PEP watch is a scheduled re-screen run by TBCA, as continuous monitoring is not in the public API.'],
        'DD-ADD-UBO' => [['kyb', 'kyc'], 'partial', 'KYB beneficial-owner capture plus KYC for each owner; nominee tracing and control analysis remain analyst work.'],
    ];

    public static function kindFor(string $category, string $subjectType): ?string
    {
        $row = self::CHECKS[$category] ?? null;
        if (! $row) {
            return null;
        }

        return $subjectType === 'individual' ? $row[0] : $row[1];
    }

    public static function coverage(string $category): ?string
    {
        return self::CHECKS[$category][2] ?? null;
    }

    /** Rows for the admin page and the plan. */
    public static function table(): array
    {
        $checks = collect(self::CHECKS)->map(fn ($r, $category) => [
            'item' => $category, 'kind' => $r[0] === $r[1] ? $r[0] : "{$r[0]} / {$r[1]}", 'coverage' => $r[2], 'note' => $r[3],
        ])->values();

        $addons = collect(self::ADDONS)->map(fn ($r, $code) => [
            'item' => $code, 'kind' => implode(' + ', $r[0]), 'coverage' => $r[1], 'note' => $r[2],
        ])->values();

        return $checks->concat($addons)->all();
    }
}
