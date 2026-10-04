<?php

namespace Database\Seeders\Sections;

use App\Models\Sprint;
use Illuminate\Database\Seeder;

/**
 * Group-B sprint type catalogue: one row per mockup sprint (digital toolkits, training,
 * templates, reports, quote-route, premium, premium advisory feeder, implementation packs,
 * due diligence / trust, dashboards, dashboard / data, subscriptions, retainers) plus the
 * 320-row Dashboard Sprint register.
 *
 * Rows live in data/sprint-types-b/*.php (generated from the mockup extraction notes and the
 * register). Idempotent: keyed on the unique sprint code and written with a chunked upsert.
 */
class SprintTypesBSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [];
        foreach (glob(__DIR__.'/data/sprint-types-b/*.php') ?: [] as $file) {
            foreach (require $file as $row) {
                $rows[$row['code']] = $row;
            }
        }

        if ($rows === []) {
            return;
        }

        // Slugs are globally unique across every section's sprints: if another seeder already
        // owns a slug under a different code, suffix ours with the code.
        $taken = Sprint::query()
            ->whereIn('slug', array_column($rows, 'slug'))
            ->whereNotIn('code', array_keys($rows))
            ->pluck('slug')
            ->flip();

        $now = now();
        $records = [];
        foreach ($rows as $row) {
            $slug = isset($taken[$row['slug']]) ? $row['slug'].'-'.strtolower($row['code']) : $row['slug'];
            $records[] = [
                'code' => $row['code'],
                'slug' => $slug,
                'title' => $row['title'],
                'type' => $row['type'],
                'category' => $row['category'],
                'subcategory' => $row['subcategory'] !== null ? mb_substr($row['subcategory'], 0, 250) : null,
                'audience' => $row['audience'],
                'summary' => $row['summary'] !== null ? mb_substr($row['summary'], 0, 500) : null,
                'description' => $row['description'],
                'price_zar' => $row['price_zar'],
                'delivery' => $row['delivery'] !== null ? mb_substr($row['delivery'], 0, 250) : null,
                'commercial_act' => $row['commercial_act'],
                'packages' => $row['packages'] === null ? null : json_encode($row['packages'], JSON_UNESCAPED_UNICODE),
                'attributes' => json_encode($row['attributes'] ?: new \stdClass, JSON_UNESCAPED_UNICODE),
                'featured' => (bool) $row['featured'],
                'popular' => (bool) $row['popular'],
                'is_new' => (bool) $row['is_new'],
                'rating' => $row['rating'],
                'status' => $row['status'] ?? 'published',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $update = array_values(array_diff(array_keys($records[0]), ['code', 'created_at']));
        foreach (array_chunk($records, 100) as $chunk) {
            Sprint::query()->upsert($chunk, ['code'], $update);
        }
    }
}
