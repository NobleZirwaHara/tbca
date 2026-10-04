<?php

namespace App\Support\Aiim;

/**
 * Confidence grades, source tiers and verification states (blueprint §3, GAP-009,
 * GAP-041/042). Every public object carries source, date, confidence,
 * verification and next review; premium sale is blocked below the sellability
 * threshold.
 */
class Grades
{
    /** Minimum confidence (0-100) at which a premium object may be sold. */
    public const SELLABILITY_THRESHOLD = 60;

    public static function grade(int|float $confidence): array
    {
        $c = (float) $confidence;

        return match (true) {
            $c >= 85 => ['grade' => 'A', 'label' => 'High', 'tone' => 'good'],
            $c >= 70 => ['grade' => 'B', 'label' => 'Medium-High', 'tone' => 'good'],
            $c >= 55 => ['grade' => 'C', 'label' => 'Medium', 'tone' => 'warn'],
            default => ['grade' => 'D', 'label' => 'Low', 'tone' => 'bad'],
        };
    }

    public static function sellable(int|float $confidence): bool
    {
        return $confidence >= self::SELLABILITY_THRESHOLD;
    }

    /** @return list<array{grade: string, label: string, range: string, meaning: string}> */
    public static function confidenceGrades(): array
    {
        return [
            ['grade' => 'A', 'label' => 'High', 'range' => '85–100', 'meaning' => 'Multiple Tier 1–2 sources agree; human-reviewed within the review window.'],
            ['grade' => 'B', 'label' => 'Medium-High', 'range' => '70–84', 'meaning' => 'Reliable sources with minor gaps or a single institutional source; human-reviewed.'],
            ['grade' => 'C', 'label' => 'Medium', 'range' => '55–69', 'meaning' => 'Third-party or research sources; partially corroborated. Coverage warning shown.'],
            ['grade' => 'D', 'label' => 'Low', 'range' => '0–54', 'meaning' => 'Weak or stale evidence. Displayed for orientation only and never sold.'],
        ];
    }

    /** @return list<array{tier: int, name: string, model: string, examples: string}> */
    public static function sourceTiers(): array
    {
        return [
            ['tier' => 1, 'name' => 'Official', 'model' => 'CM-01', 'examples' => 'Stats SA, National Treasury, SARB, CIPC, regulators'],
            ['tier' => 2, 'name' => 'Institutional', 'model' => 'CM-02', 'examples' => 'IMF, World Bank, AfDB, DBSA, IDC'],
            ['tier' => 3, 'name' => 'Third Party', 'model' => 'CM-03', 'examples' => 'Licensed data providers, industry bodies, NBI'],
            ['tier' => 4, 'name' => 'Research', 'model' => 'CM-04', 'examples' => 'University and think-tank research'],
            ['tier' => 5, 'name' => 'Media & Analytics', 'model' => 'CM-05/06', 'examples' => 'Verified news feeds, sentiment indices'],
        ];
    }

    public static function tierName(int $tier): string
    {
        return collect(self::sourceTiers())->firstWhere('tier', $tier)['name'] ?? 'Unrated';
    }

    /** Verification states in order of strength. */
    public static function verificationStates(): array
    {
        return [
            'unverified' => 'Unverified',
            'machine-checked' => 'Machine-Checked',
            'source-confirmed' => 'Source-Confirmed',
            'human-reviewed' => 'Human-Reviewed',
            'independently-verified' => 'Independently Verified',
        ];
    }

    public static function verificationLabel(string $state): string
    {
        return self::verificationStates()[$state] ?? ucfirst(str_replace('-', ' ', $state));
    }

    /** Opportunity score label used on province and sector cards. */
    public static function opportunityLabel(float $score): string
    {
        return match (true) {
            $score >= 80 => 'Very High Opportunity',
            $score >= 72 => 'High Opportunity',
            $score >= 66 => 'Moderate-High Opportunity',
            $score >= 57 => 'Moderate Opportunity',
            default => 'Emerging Opportunity',
        };
    }

    /** Evidence block shared by every public record. */
    public static function evidence(int $confidence, string $verification, ?string $source, ?string $updated, ?string $nextReview): array
    {
        $g = self::grade($confidence);

        return [
            'confidence' => $confidence,
            'grade' => $g['grade'],
            'gradeLabel' => $g['label'],
            'tone' => $g['tone'],
            'verification' => self::verificationLabel($verification),
            'source' => $source,
            'updated' => $updated,
            'nextReview' => $nextReview,
            'sellable' => self::sellable($confidence),
        ];
    }
}
