<?php

namespace App\Support\DueDiligence;

/**
 * Rule-based package recommendation (DD-022). Scores the configurator
 * answers and maps the score to a package tier within the chosen family.
 */
class Recommender
{
    private const HIGH_STAKES = ['Investment decision', 'Lending or credit', 'Procurement / tender', 'M&A transaction', 'Public-sector engagement', 'Regulatory compliance (AML/KYC)'];

    /** @return array{sku: array, tier: string, score: int, reasons: list<string>, assumptions: list<array{label: string, value: string}>} */
    public static function recommend(string $family, array $req): array
    {
        $score = 0;
        $reasons = [];

        $purpose = (string) ($req['purpose'] ?? '');
        if (in_array($purpose, self::HIGH_STAKES, true)) {
            $score += 2;
            $reasons[] = "Purpose ({$purpose}) requires mandatory human review and deeper evidence.";
        }

        $parties = (int) ($req['related_parties'] ?? 0);
        if ($parties > 10) {
            $score += 2;
            $reasons[] = "{$parties} related parties need full ownership and director mapping.";
        } elseif ($parties > 5) {
            $score += 1;
            $reasons[] = "Includes ownership mapping, sanctions, PEP and adverse media for {$parties} related parties.";
        }

        $jurisdiction = (string) ($req['jurisdiction'] ?? 'South Africa');
        if ($jurisdiction !== 'South Africa') {
            $score += 1;
            $reasons[] = 'Cross-border and jurisdictional risk assessment is required.';
        }

        $complexity = (string) ($req['complexity'] ?? 'standard');
        if ($complexity === 'complex') {
            $score += 1;
            $reasons[] = 'Right-sized for complex ownership structures.';
        } elseif ($complexity === 'highly_complex') {
            $score += 2;
            $reasons[] = 'Multi-jurisdiction structures need senior review.';
        }

        if (($req['evidence_readiness'] ?? 'medium') === 'low') {
            $score += 1;
            $reasons[] = 'Low evidence readiness needs additional verification effort.';
        }

        if ((int) ($req['record_age'] ?? 5) < 2) {
            $score += 1;
            $reasons[] = 'Short operating history calls for enhanced verification.';
        }

        $tier = $score <= 1 ? 'essential' : ($score <= 3 ? 'enhanced' : 'executive');

        $skus = array_values(array_filter(Catalogue::skus($family), fn ($s) => Catalogue::purchasable($s)));
        $match = collect($skus)->first(fn ($s) => $s['tier'] === $tier && $s['popular'])
            ?? collect($skus)->first(fn ($s) => $s['tier'] === $tier)
            ?? collect($skus)->first(fn ($s) => $s['popular'])
            ?? $skus[0] ?? null;

        if ($reasons === []) {
            $reasons[] = 'Routine, low-risk screening with clear evidence: a focused package is sufficient.';
        }
        $reasons[] = 'Streamlined turnaround with quality assurance.';

        return [
            'sku' => $match,
            'tier' => $tier,
            'score' => $score,
            'reasons' => array_slice($reasons, 0, 5),
            'assumptions' => [
                ['label' => 'Jurisdiction', 'value' => $jurisdiction],
                ['label' => 'Entity Type', 'value' => (string) ($req['entity_type'] ?? 'Private company')],
                ['label' => 'Number of Related Parties', 'value' => (string) $parties],
                ['label' => 'Purpose', 'value' => $purpose ?: 'Not stated'],
                ['label' => 'Use of Report', 'value' => (string) ($req['expected_use'] ?? 'Internal decision making')],
                ['label' => 'Data Sources', 'value' => 'Public, commercial and regulatory'],
            ],
        ];
    }
}
