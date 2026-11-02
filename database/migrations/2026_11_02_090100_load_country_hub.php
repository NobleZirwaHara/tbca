<?php

use Database\Seeders\Sections\CountryHubSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads the Countries tab data (the Countries part of the client's prototype, MP-COUNTRIES-1.0)
 * into a database that was seeded before it, so a deploy that runs `migrate` brings production up
 * to date without re-seeding.
 *
 * CountryHubSeeder is idempotent. On an empty database (a fresh install or a test run) nothing is
 * loaded here, because `db:seed` loads the same content.
 */
return new class extends Migration
{
    /** Seeding runs many statements; keep it outside one long transaction. */
    public $withinTransaction = false;

    public function up(): void
    {
        if (! Schema::hasTable('ind_countries') || ! DB::table('ind_countries')->exists()) {
            return;
        }

        Model::withoutEvents(function () {
            /** @var Seeder $seeder */
            $seeder = app(CountryHubSeeder::class);
            $seeder->setContainer(app());
            $seeder->__invoke();
        });

        rescue(fn () => Cache::flush(), report: false);
    }

    public function down(): void
    {
        // Content only. The schema migration before this one owns the table.
    }
};
