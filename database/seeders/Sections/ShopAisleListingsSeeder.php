<?php

namespace Database\Seeders\Sections;

use App\Support\Shop\IndustryListings;
use Illuminate\Database\Seeder;

/**
 * Cross-lists Sprints in the industry aisles of the Online Shop (and Risk & Cybersecurity) by the
 * rules in App\Support\Shop\IndustryListings, then applies data/shop/aisle-overrides.csv. Runs after
 * SprintsRegisterSeeder (see DatabaseSeeder). Idempotent: rule rows and file overrides are rebuilt on
 * every run; manual rows from any other source are kept.
 */
class ShopAisleListingsSeeder extends Seeder
{
    /** @var array<string, mixed> result of the last run (read by tests) */
    public static array $report = [];

    public function run(): void
    {
        $result = IndustryListings::rebuild();
        self::$report = ['aisles' => $result['aisles'], 'overrides' => $result['overrides'], 'total' => count($result['rows'])];

        $this->command?->info(sprintf('Industry aisle listings: %d placements (%s).', self::$report['total'], collect($result['aisles'])
            ->map(fn ($c, $slug) => "{$slug} {$c['total']}")->implode(', ')));
    }
}
