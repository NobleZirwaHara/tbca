<?php

use App\Support\Deliverables\ProductCodes;
use Database\Seeders\Sections\DeliverablesRegisterSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Brings a database that already holds the Registry of Deliverables up to date with
 * Noble's decisions of 29 October 2026, without re-seeding:
 *
 *  - product codes for webinars, Marketplace and Partner Services listings and the
 *    Services catalogue (ProductCodes);
 *  - TBCA-generated deliverables (DEL-GEN-...) for app Sprints the register does not
 *    cover, linked in the Sprint crosswalk;
 *  - links from Issue 1.0 deliverables to app products (deliverable_products).
 *
 * Re-runs DeliverablesRegisterSeeder, which is idempotent. On an empty database
 * nothing is loaded here; `db:seed` does it. Model events are off so no integration
 * events are queued.
 */
return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        if (! $this->has('sprints')) {
            return;
        }

        Model::withoutEvents(function () {
            ProductCodes::backfill();

            $seeder = app(DeliverablesRegisterSeeder::class);
            $seeder->setContainer(app());
            $seeder->__invoke();
        });

        rescue(fn () => Cache::flush(), report: false);
    }

    public function down(): void
    {
        // Content only.
    }

    private function has(string $table): bool
    {
        return Schema::hasTable($table) && DB::table($table)->exists();
    }
};
