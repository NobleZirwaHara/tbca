<?php

namespace App\Support\Marketplace;

use App\Models\Marketplace\Brief;
use App\Models\Marketplace\Provider;
use Illuminate\Support\Collection;

/**
 * Scores routable marketplace providers against a brief.
 *
 *  category fit 40 · skill overlap 25 · country coverage 15 · rating 10 · capacity 10
 *
 * Only ACTIVE providers are eligible (blueprint: "Expert matching, not open directory";
 * suspended or unverified providers never appear in a match list).
 */
class Matching
{
    /** @return Collection<int, array{provider: Provider, score: int, expertise: int, capacity: int, available: string, cost: int, days: int}> */
    public static function forBrief(Brief $brief, int $limit = 5): Collection
    {
        $data = $brief->data ?? [];
        $category = $data['category'] ?? $brief->category;
        $skills = $data['skills'] ?? [];
        $country = $data['country'] ?? 'South Africa';
        $budgetMax = Options::BUDGET_MAX[$data['budget'] ?? ''] ?? null;

        return Provider::query()
            ->where('kind', 'marketplace')
            ->whereIn('status', ['active', 'active_with_conditions'])
            ->get()
            ->map(function (Provider $p) use ($category, $skills, $country, $budgetMax) {
                $profile = $p->profile ?? [];
                $categories = $profile['categories'] ?? [$p->category];
                $pSkills = $profile['skills'] ?? [];
                $countries = $profile['countries'] ?? [$p->country];
                $capacity = (int) ($profile['capacity'] ?? 70);

                $catFit = in_array($category, $categories, true) ? 40 : 12;
                $overlap = $skills ? count(array_intersect($skills, $pSkills)) / count($skills) : 0.8;
                $skillFit = (int) round(25 * $overlap);
                $countryFit = in_array($country, $countries, true) || in_array('Multiple Countries', $countries, true) ? 15 : 5;
                $ratingFit = (int) round((($p->rating ?? 4) / 5) * 10);
                $capFit = (int) round($capacity / 10);

                $score = min(99, $catFit + $skillFit + $countryFit + $ratingFit + $capFit);
                $cost = (int) ($profile['base_rate'] ?? 30000);

                return [
                    'provider' => $p,
                    'score' => $score,
                    'expertise' => min(99, (int) round(($catFit + $skillFit) / 65 * 100)),
                    'capacity' => $capacity,
                    'available' => $capacity >= 80 ? 'Available' : ($capacity >= 50 ? 'Available' : 'Limited'),
                    'cost' => $cost,
                    'days' => (int) ($profile['typical_days'] ?? 10),
                    'within_budget' => $budgetMax === null || $cost <= $budgetMax,
                ];
            })
            ->sortByDesc('score')
            ->values()
            ->take($limit);
    }

    /** Score of one provider against one brief (provider opportunity feed). */
    public static function score(Provider $p, Brief $brief): int
    {
        $data = $brief->data ?? [];
        $profile = $p->profile ?? [];
        $catFit = in_array($data['category'] ?? $brief->category, $profile['categories'] ?? [$p->category], true) ? 40 : 12;
        $skills = $data['skills'] ?? [];
        $skillFit = (int) round(25 * ($skills ? count(array_intersect($skills, $profile['skills'] ?? [])) / count($skills) : 0.8));
        $countries = $profile['countries'] ?? [$p->country];
        $countryFit = in_array($data['country'] ?? 'South Africa', $countries, true) || in_array('Multiple Countries', $countries, true) ? 15 : 5;

        return min(99, $catFit + $skillFit + $countryFit + (int) round((($p->rating ?? 4) / 5) * 10) + (int) round(($profile['capacity'] ?? 70) / 10));
    }

    public static function band(int $score): string
    {
        return match (true) {
            $score >= 80 => 'Excellent',
            $score >= 60 => 'Good',
            $score >= 40 => 'Fair',
            default => 'Poor',
        };
    }

    /** Priority score 0-100 from urgency, complexity and budget size (Brief Triage workbench). */
    public static function priority(array $data): int
    {
        $u = ['standard' => 20, 'priority' => 35, 'urgent' => 50][$data['urgency'] ?? 'standard'] ?? 20;
        $c = ['low' => 10, 'medium' => 20, 'high' => 30][$data['complexity'] ?? 'medium'] ?? 20;
        $b = ['under-15k' => 4, '15-30k' => 8, '30-75k' => 12, '75-150k' => 16, '150k-plus' => 20][$data['budget'] ?? ''] ?? 8;

        return min(100, $u + $c + $b);
    }
}
