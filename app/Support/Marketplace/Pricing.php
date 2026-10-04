<?php

namespace App\Support\Marketplace;

/**
 * MP-TEB v2.0 Part 9 "Pricing before assignment" and PS-TEB floor rules.
 *
 *  Market benchmark M  -> target P = 0.80 x M
 *  CTS (cost to serve) = AI-enabled human hours x R500 + registered review hours x R800 + platform/QA/dispute provision
 *  Blended floor       = CTS / 0.40
 *  Ledger A + B price  = max(target, floor), rounded up to R250. A carries ~81 %, B ~19 %.
 *  Ledger C            = provider cost, never marked up, shown separately (capped estimate until a provider is selected).
 *
 * The three ledgers are never blended into one presented price.
 */
class Pricing
{
    public const HUMAN_RATE = 500;

    public const REVIEW_RATE = 800;

    public const PLATFORM_FEE_PCT = 10;     // provider statement: platform fee on billed amount

    public const VAT_PCT = 15;

    public const PS_FLOOR_ZAR = 38337;      // Partner Services current floor (T + P), effective 01 May 2026

    /** [benchmark M, AI-enabled human hours, registered review hours, provider cost cap] per category. */
    private const CATEGORY_MODEL = [
        'financial-advisory' => [28750, 9, 1, 7800],
        'legal-contracts' => [24000, 7, 2, 6500],
        'project-management' => [32000, 11, 1, 9500],
        'market-research' => [27000, 9, 1, 12000],
        'compliance-risk' => [26000, 8, 2, 7000],
        'tech-digital' => [36000, 12, 1, 14000],
        'due-diligence' => [42000, 14, 2, 15000],
        'automation-ai' => [38000, 12, 1, 12500],
    ];

    private const COMPLEXITY = ['low' => 0.8, 'medium' => 1.0, 'high' => 1.5];

    /**
     * Builds the commercial envelope for a brief.
     *
     * @return array{a:int,b:int,c:int,c_state:string,target:int,floor:int,cts:int,floor_status:string,benchmark:int}
     */
    public static function envelope(string $category, string $complexity = 'medium', string $urgency = 'standard', ?int $providerRate = null): array
    {
        [$m, $hours, $review, $cap] = self::CATEGORY_MODEL[$category] ?? self::CATEGORY_MODEL['financial-advisory'];
        $mult = self::COMPLEXITY[$complexity] ?? 1.0;
        $rush = $urgency === 'urgent' ? 1.25 : ($urgency === 'priority' ? 1.1 : 1.0);

        $benchmark = (int) round($m * $mult);
        $cts = (int) round(($hours * self::HUMAN_RATE + $review * self::REVIEW_RATE + 1500) * $mult * $rush);
        $target = (int) round($benchmark * 0.80);
        $floor = (int) ceil($cts / 0.40);
        $ab = self::roundUp(max($target, $floor));

        $a = self::roundUp((int) round($ab * 0.81));
        $b = $ab - $a;
        $c = $providerRate ?? (int) round($cap * $mult);

        return [
            'benchmark' => $benchmark,
            'target' => $target,
            'cts' => $cts,
            'floor' => $floor,
            'a' => $a,
            'b' => $b,
            'c' => $c,
            'c_state' => $providerRate === null ? 'estimated_cap' : 'actual',
            'floor_status' => self::floorStatus($a + $b, $floor),
        ];
    }

    public static function floorStatus(int $abPrice, int $floor): string
    {
        return $abPrice >= $floor ? 'PASS' : 'FAIL';
    }

    /** VAT split for a VAT-exclusive amount. */
    public static function vat(float $exVat): array
    {
        $vat = round($exVat * self::VAT_PCT / 100, 2);

        return ['ex' => round($exVat, 2), 'vat' => $vat, 'incl' => round($exVat + $vat, 2)];
    }

    /** Partner Services T/P/X/S/C quote (PS-011). S = VAT on T + P + X; total = T + P + X + S - C. */
    public static function partnerQuote(int $t, int $p, int $x, int $c = 0): array
    {
        $s = (int) round(($t + $p + $x) * self::VAT_PCT / 100);

        return [
            't' => $t, 'p' => $p, 'x' => $x, 's' => $s, 'c' => $c,
            'total' => $t + $p + $x + $s - $c,
            'floor' => self::PS_FLOOR_ZAR,
            'floor_status' => ($t + $p) >= self::PS_FLOOR_ZAR ? 'PASS' : 'BLOCKED',
        ];
    }

    /** Partner-side quote calculator (PS-021): P from hours x rate (T&M) or fixed; VAT on P + X. */
    public static function partnerSubmission(string $basis, int $hours, int $rate, int $fixed, int $disbursements): array
    {
        $p = $basis === 'time-materials' ? $hours * $rate : $fixed;
        $vat = (int) round(($p + $disbursements) * self::VAT_PCT / 100);

        return ['p' => $p, 'x' => $disbursements, 'vat' => $vat, 'total' => $p + $disbursements + $vat];
    }

    private static function roundUp(int $value): int
    {
        return (int) (ceil($value / 250) * 250);
    }
}
