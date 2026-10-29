<?php

use Database\Seeders\Sections\DeliverablesRegisterSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads the client's Registry of Deliverables (MP-DEL-2.0, 25 October 2026) into a
 * database that was seeded before it, so a deploy that runs `migrate` brings
 * production up to date without re-seeding.
 *
 * The seeder is idempotent. On an empty database (a fresh install or a test run)
 * nothing is loaded here, because `db:seed` loads the register after the Sprint
 * catalogue it links to. Model events are switched off so loading content does not
 * queue integration events.
 */
return new class extends Migration
{
    /** Seeding runs many statements; keep it outside one long transaction. */
    public $withinTransaction = false;

    public function up(): void
    {
        if (! $this->has('sprints')) {
            return;
        }

        Model::withoutEvents(function () {
            $seeder = app(DeliverablesRegisterSeeder::class);
            $seeder->setContainer(app());
            $seeder->__invoke();
        });

        rescue(fn () => Cache::flush(), report: false);
    }

    public function down(): void
    {
        // Content only. 2026_10_29_110000_create_deliverables_tables owns the tables.
    }

    private function has(string $table): bool
    {
        return Schema::hasTable($table) && DB::table($table)->exists();
    }
};
