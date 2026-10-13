<?php

namespace App\Console\Commands;

use App\Support\Shop\Catalogue;
use App\Support\Shop\IndustryListings;
use Illuminate\Console\Command;

/**
 * Rebuilds the industry aisle cross-listings (see App\Support\Shop\IndustryListings) and writes
 * the review list for TBCA.
 *
 *   php artisan shop:industry-listings            rebuild, print counts, write the review CSV
 *   php artisan shop:industry-listings --dry-run  print the counts the rules would give; change nothing
 */
class ShopIndustryListings extends Command
{
    protected $signature = 'shop:industry-listings
        {--dry-run : Show the counts without changing the database or the review file}
        {--export=docs/knowledge-base/kruger-2026-10/industry-aisle-listings.csv : Review file to write, relative to the project}';

    protected $description = 'Rebuild the cross-listing of Sprints in the industry aisles of the Online Shop';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');
        $result = IndustryListings::rebuild($dry);

        $this->table(['Aisle', 'Named', 'Relevant', 'Manual', 'Total'], collect($result['aisles'])->map(fn ($c, $slug) => [
            Catalogue::aisle($slug)['name'] ?? $slug, $c['named'], $c['relevant'], $c['manual'], $c['total'],
        ])->values()->all());

        $o = $result['overrides'];
        $this->line("Overrides: {$o['added']} added, {$o['removed']} removed, ".count($o['skipped']).' skipped.');
        foreach ($o['skipped'] as $s) {
            $this->warn("  {$s}");
        }

        if ($dry) {
            $this->info('Dry run: nothing was changed.');

            return self::SUCCESS;
        }

        $path = base_path((string) $this->option('export'));
        $n = IndustryListings::export($path);
        $this->info(count($result['rows'])." placements saved. Review list: {$n} rows written to {$this->option('export')}.");

        return self::SUCCESS;
    }
}
