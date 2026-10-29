<?php

use Database\Seeders\Sections\IndustriesSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads the Industries tab data (client request "INDUSTRIES", 21 Oct 2026: the published
 * "TBCA Industries Prototype") into a database that was seeded before it, so a deploy that
 * runs `migrate` brings production up to date without re-seeding.
 *
 * IndustriesSeeder is idempotent. On an empty database (a fresh install or a test run)
 * nothing is loaded here, because `db:seed` loads the same content.
 */
return new class extends Migration
{
    /** Seeding runs many statements; keep it outside one long transaction. */
    public $withinTransaction = false;

    public function up(): void
    {
        if (! $this->has('sprints') || ! Schema::hasTable('ind_industries')) {
            return;
        }

        Model::withoutEvents(function () {
            /** @var Seeder $seeder */
            $seeder = app(IndustriesSeeder::class);
            $seeder->setContainer(app());
            $seeder->__invoke();
        });

        rescue(fn () => Cache::flush(), report: false);
    }

    public function down(): void
    {
        // Content only. The schema migration before this one owns the tables.
    }

    private function has(string $table): bool
    {
        return Schema::hasTable($table) && DB::table($table)->exists();
    }
};
