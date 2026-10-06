<?php

namespace Database\Seeders\Sections;

use App\Models\Sprint;
use App\Support\Sprints\Packages;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Sprint Types A: Technology Setup, Fixed Scope, Partner-Delivered, Checklist and Client Service sprints.
 *
 * Data files in data/sprint-types-a/*.php are generated from the product-page mockups and the
 * Checklist (327) / Client Service (338) registers and the Fixed Scope (468) control manifest.
 * Mockup sprints are written with updateOrCreate; register rows are chunk-upserted on `code`.
 */
class SprintTypesASeeder extends Seeder
{
    public const TYPES = ['technology-setup', 'fixed-scope', 'partner-delivered', 'checklist', 'client-service'];

    private const COLUMNS = [
        'slug', 'title', 'type', 'category', 'subcategory', 'audience', 'summary', 'description', 'price_zar',
        'delivery', 'commercial_act', 'packages', 'attributes', 'featured', 'popular', 'is_new', 'status',
    ];

    public function run(): void
    {
        // Slugs already taken by sprints other sections seed (slug is unique across the catalogue).
        $taken = Sprint::query()->pluck('code', 'slug')->all();
        $overrides = require __DIR__.'/data/sprint-package-overrides.php';

        foreach (self::TYPES as $type) {
            $file = require __DIR__.'/data/sprint-types-a/'.$type.'.php';
            $defaults = $file['defaults'] ?? [];
            $bulk = [];

            foreach ($file['rows'] as $row) {
                $attributes = $row['attributes'] ?? [];
                if (($attributes['source'] ?? null) !== 'mockup') {
                    $attributes += $defaults;
                }
                $row['attributes'] = $attributes;
                $row = Packages::applyToRow($row, $overrides);
                $row['status'] = 'published';
                $row['slug'] = $this->freeSlug($row['slug'], $row['code'], $taken);
                $taken[$row['slug']] = $row['code'];

                if (($attributes['source'] ?? null) === 'mockup') {
                    Sprint::updateOrCreate(['code' => $row['code']], collect($row)->except('code')->all());

                    continue;
                }

                $bulk[] = $row;
            }

            $now = now();
            foreach (array_chunk($bulk, 200) as $chunk) {
                $records = array_map(fn (array $r) => [
                    ...$r,
                    'packages' => json_encode($r['packages'], JSON_UNESCAPED_UNICODE),
                    'attributes' => json_encode($r['attributes'], JSON_UNESCAPED_UNICODE),
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $chunk);

                DB::table('sprints')->upsert($records, ['code'], [...self::COLUMNS, 'updated_at']);
            }
        }
    }

    /** @param array<string,string> $taken slug => code */
    private function freeSlug(string $slug, string $code, array $taken): string
    {
        if (! isset($taken[$slug]) || $taken[$slug] === $code) {
            return $slug;
        }

        return $slug.'-'.strtolower($code);
    }
}
