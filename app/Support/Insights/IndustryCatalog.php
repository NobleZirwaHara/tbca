<?php

namespace App\Support\Insights;

use App\Models\Insights\Industry;
use App\Models\Sprint;

/**
 * Read helpers shared by Industry pages.
 */
class IndustryCatalog
{
    /** All active industries with sub-industries, for selectors. */
    public static function selectorList(): array
    {
        return Industry::query()->with('subIndustries')->orderBy('number')->get()->map(fn (Industry $i) => array_merge($i->toCard(), [
            'subIndustries' => $i->subIndustries->map(fn ($s) => ['code' => $s->code, 'name' => $s->name, 'description' => $s->description])->values(),
        ]))->all();
    }

    /** Recommended Sprints from the catalogue: keyword matches first, then the mapped category. */
    public static function recommendedSprints(Industry $industry, int $limit = 4): array
    {
        $found = collect();
        foreach ($industry->sprint_keywords ?? [] as $kw) {
            if ($found->count() >= $limit) {
                break;
            }
            $found = $found->merge(
                Sprint::query()->where('status', 'published')->where('title', 'like', "%{$kw}%")
                    ->whereNotIn('id', $found->pluck('id'))->limit($limit - $found->count())->get()
            );
        }
        if ($found->count() < $limit && $industry->sprint_category) {
            $found = $found->merge(
                Sprint::query()->where('status', 'published')->where('category', $industry->sprint_category)
                    ->whereNotIn('id', $found->pluck('id'))->orderByDesc('popular')->limit($limit - $found->count())->get()
            );
        }

        return $found->take($limit)->map(fn (Sprint $s) => [
            'slug' => $s->slug,
            'title' => $s->title,
            'summary' => $s->summary,
            'priceZar' => $s->price_zar,
            'delivery' => $s->delivery,
            'category' => $s->category,
        ])->values()->all();
    }

    public static function sprintsUrl(Industry $industry): string
    {
        return $industry->sprint_category ? "/sprints?category={$industry->sprint_category}" : '/sprints';
    }

    /** Full payload for the Industry page template (IN-SCR-003 / 004 / 005). */
    public static function page(Industry $industry): array
    {
        $industry->loadMissing('subIndustries');

        return array_merge($industry->toCard(), [
            'description' => $industry->description,
            'tagline' => $industry->tagline,
            'intro' => $industry->intro,
            'operatingMode' => $industry->operating_mode,
            'profile' => $industry->profile,
            'subIndustries' => $industry->subIndustries->map(fn ($s) => ['code' => $s->code, 'name' => $s->name, 'description' => $s->description])->values(),
            'sprints' => self::recommendedSprints($industry),
            'sprintsUrl' => self::sprintsUrl($industry),
            'skus' => $industry->skus()->where('public', true)->get()->map(fn ($s) => [
                'slug' => $s->slug, 'title' => $s->title, 'priceZar' => $s->price_zar, 'saleState' => $s->sale_state, 'summary' => $s->summary,
            ])->values(),
            'approvedServices' => $industry->profile['tiles']['approvedServices'] ?? $industry->sprints_activated,
        ]);
    }
}
