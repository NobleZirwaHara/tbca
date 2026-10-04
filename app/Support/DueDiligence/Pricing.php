<?php

namespace App\Support\DueDiligence;

use App\Support\Platform\Money;

/**
 * Computes the itemised Due Diligence fee manifest (DD-017 / DD-024).
 *
 * TBCA Expert   = package fee + complexity uplift + extra related parties + add-ons
 * TBCA Platform = package platform fee (fixed)
 * External      = package external estimate x jurisdiction factor, plus a 25% admin margin
 * Tax/Payment   = VAT 15% on the subtotal + the shared payment handling fee
 *                 (platform R250 + bank charge) from App\Support\Platform\Money,
 *                 so the manifest equals the order total the shared checkout charges.
 */
class Pricing
{
    public const JURISDICTION_FACTOR = ['South Africa' => 1.0, 'SADC' => 1.25, 'Africa' => 1.5, 'International' => 2.0];

    public const COMPLEXITY_UPLIFT = ['standard' => 0.0, 'complex' => 0.15, 'highly_complex' => 0.30];

    public const EXTRA_PARTY_ZAR = 450;

    /**
     * @param  array<string, mixed>  $sku  from Catalogue::sku()
     * @param  array<string, mixed>  $req  configurator requirements
     * @param  list<string>  $addonCodes
     */
    public static function quote(array $sku, array $req = [], array $addonCodes = [], string $method = 'card'): array
    {
        $lines = [];
        $n = 0;
        $add = function (string $category, array $line) use (&$lines, &$n) {
            $n++;
            $lines[] = $line + ['no' => $n, 'category' => $category, 'payer' => 'Client'];
        };

        $expertBase = (int) $sku['expert'];
        $add('expert', [
            'item' => $sku['name'], 'code' => $sku['code'], 'description' => 'Package checks, module set and analyst time',
            'trigger' => 'Upon acceptance', 'price' => $expertBase, 'vat' => 15, 'status' => 'Board-Provisional',
            'refund' => 'No refund after start', 'recognition' => 'Report delivery',
        ]);

        $complexity = (string) ($req['complexity'] ?? 'standard');
        $uplift = (int) round($expertBase * (self::COMPLEXITY_UPLIFT[$complexity] ?? 0));
        if ($uplift > 0) {
            $add('expert', [
                'item' => 'Complexity Uplift ('.($complexity === 'complex' ? 'layered ownership' : 'multi-jurisdiction').')', 'code' => 'DD-CPLX-'.strtoupper(substr($complexity, 0, 3)),
                'description' => 'Additional analyst time for structure complexity', 'trigger' => 'Upon acceptance', 'price' => $uplift, 'vat' => 15,
                'status' => 'Board-Provisional', 'refund' => 'No refund after start', 'recognition' => 'Review sign-off',
            ]);
        }

        $parties = max(0, (int) ($req['related_parties'] ?? 0) - (int) $sku['includedParties']);
        if ($parties > 0) {
            $add('expert', [
                'item' => "Additional Related Parties ({$parties})", 'code' => 'DD-PARTY-ADD', 'description' => 'Screening of related parties beyond the '.$sku['includedParties'].' included',
                'trigger' => 'Upon acceptance', 'price' => $parties * self::EXTRA_PARTY_ZAR, 'vat' => 15, 'status' => 'Board-Provisional',
                'refund' => 'Pro-rata before screening', 'recognition' => 'Screening complete',
            ]);
        }

        foreach ($addonCodes as $code) {
            $addon = Catalogue::addon($code);
            if ($addon === null) {
                continue;
            }
            $add('expert', [
                'item' => $addon['name'], 'code' => $addon['code'], 'description' => $addon['includes'], 'trigger' => 'Upon acceptance',
                'price' => $addon['zar'], 'vat' => 15, 'status' => 'Board-Provisional', 'refund' => 'No refund after start', 'recognition' => 'Add-on delivered',
            ]);
        }

        $add('platform', [
            'item' => 'Platform Access, Automation & Secure Portal', 'code' => 'DD-PLAT-AUT', 'description' => 'Automation, orchestration, storage and secure portal (90 days)',
            'trigger' => 'Upon acceptance', 'price' => (int) $sku['platform'], 'vat' => 15, 'status' => 'Board-Provisional',
            'refund' => 'No refund after start', 'recognition' => 'Period start',
        ]);

        $jurisdiction = (string) ($req['jurisdiction'] ?? 'South Africa');
        $external = (int) round(((int) $sku['external']) * (self::JURISDICTION_FACTOR[$jurisdiction] ?? 1.0));
        if ($external > 0) {
            $add('external', [
                'item' => $jurisdiction === 'South Africa' ? 'Data Provider & Registry Searches' : 'Data Provider, Registry & International Verification',
                'code' => $jurisdiction === 'South Africa' ? 'DD-EXT-DATA' : 'DD-EXT-INTL', 'description' => 'Third-party data & registry searches (pass-through)',
                'trigger' => 'On provider invoice', 'price' => $external, 'vat' => 15, 'status' => 'Estimate',
                'refund' => 'Per provider terms', 'recognition' => 'Provider invoice',
            ]);
            $add('external', [
                'item' => 'External Admin Margin (25%)', 'code' => 'DD-EXT-ADMIN', 'description' => 'Administration of approved external costs, where lawful',
                'trigger' => 'On provider invoice', 'price' => (int) round($external * Catalogue::ADMIN_MARGIN), 'vat' => 15, 'status' => 'Estimate',
                'refund' => 'Follows external cost', 'recognition' => 'Provider invoice',
            ]);
        }

        $sum = fn (string $cat) => array_sum(array_map(fn ($l) => $l['price'], array_filter($lines, fn ($l) => $l['category'] === $cat)));
        $subtotal = $sum('expert') + $sum('platform') + $sum('external');
        $totals = Money::totals($subtotal, $method);

        [$min, $max] = self::days($sku['timeline']);
        foreach ($addonCodes as $code) {
            $max += (int) (Catalogue::addon($code)['days'] ?? 0);
        }
        if (in_array('DD-ADD-RUSH', $addonCodes, true)) {
            $min = max(1, (int) ceil($min / 2));
            $max = max($min, (int) ceil($max / 2));
        }

        return [
            'lines' => $lines,
            'expert' => $sum('expert'),
            'platform' => $sum('platform'),
            'external' => $external,
            'margin' => $sum('external') - $external,
            'subtotal' => $subtotal,
            'vat' => $totals['vat'],
            'handling' => $totals['fees'],
            'total' => $totals['total'],
            'usd' => Money::toUsd($totals['total']),
            'days' => [$min, $max],
            'turnaround' => $min === $max ? "{$min} business days" : "{$min}–{$max} business days",
        ];
    }

    /** @return array{0: int, 1: int} */
    public static function days(string $timeline): array
    {
        if (preg_match('/(\d+)\s*[–-]\s*(\d+)/u', $timeline, $m)) {
            return [(int) $m[1], (int) $m[2]];
        }
        if (preg_match('/(\d+)/', $timeline, $m)) {
            return [(int) $m[1], (int) $m[1]];
        }

        return [5, 10];
    }

    /** Lines the shared checkout charges (it adds VAT and payment handling itself). */
    public static function orderLines(array $manifest, string $quoteRef): array
    {
        return array_map(fn ($line) => [
            'item_type' => 'dd-'.$line['category'],
            'item_code' => $line['code'],
            'name' => $line['item'],
            'unit_zar' => (int) $line['price'],
            'quantity' => 1,
            'meta' => ['quote' => $quoteRef, 'category' => $line['category']],
        ], array_values(array_filter($manifest['lines'], fn ($l) => $l['price'] > 0)));
    }
}
