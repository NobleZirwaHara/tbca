<?php

namespace App\Support\Insights;

use App\Models\Insights\Industry;

/**
 * The visitor's canonical IndustryContext (IN-SCR-011), held in the session:
 * { industryCode, industryName, industrySlug, subIndustryCode, subIndustryName, country }.
 * Feeds "Your Selection / Your Context" panels, diagnostics, pricing and routing.
 */
class IndustryContext
{
    private const KEY = 'insights.industry_context';

    public static function get(): array
    {
        return session(self::KEY, [
            'industryCode' => null,
            'industryName' => null,
            'industrySlug' => null,
            'subIndustryCode' => null,
            'subIndustryName' => null,
            'country' => 'ZA',
            'countryName' => 'South Africa',
        ]);
    }

    public static function set(Industry $industry, ?string $subCode = null, string $country = 'ZA'): array
    {
        $sub = $subCode ? $industry->subIndustries()->where('code', $subCode)->first() : null;

        $context = [
            'industryCode' => $industry->short_code,
            'industryName' => $industry->name,
            'industrySlug' => $industry->slug,
            'subIndustryCode' => $sub?->code,
            'subIndustryName' => $sub?->name,
            'country' => $country,
            'countryName' => collect(IndustryRegister::countries())->firstWhere('code', $country)['name'] ?? 'South Africa',
        ];

        session([self::KEY => $context]);

        return $context;
    }

    /** Remember the industry being viewed without discarding a sub-industry chosen for it. */
    public static function touch(Industry $industry): array
    {
        $current = self::get();
        if ($current['industrySlug'] === $industry->slug) {
            return $current;
        }

        return self::set($industry, null, $current['country'] ?? 'ZA');
    }

    public static function clear(): void
    {
        session()->forget(self::KEY);
    }
}
