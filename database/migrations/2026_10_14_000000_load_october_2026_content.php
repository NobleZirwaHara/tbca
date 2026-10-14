<?php

use Database\Seeders\Sections\AiimGeoSeeder;
use Database\Seeders\Sections\KpSeeder;
use Database\Seeders\Sections\ShopAisleListingsSeeder;
use Database\Seeders\Sections\SprintsRegisterSeeder;
use Database\Seeders\Sections\WebinarsSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads the content added for the client's 8 to 13 October 2026 requests into a
 * database that was seeded before them, so a deploy that runs `migrate` brings
 * production up to date without re-seeding.
 *
 * Every seeder called here is idempotent: it updates existing rows by their
 * natural keys and never duplicates. On an empty database (a fresh install or a
 * test run) nothing is loaded here, because `db:seed` loads the same content
 * together with the base catalogue it depends on.
 *
 * Model events are switched off so loading content does not queue integration
 * events (orders, registrations) for Zoho.
 */
return new class extends Migration
{
    /** Seeding runs many statements; keep it outside one long transaction. */
    public $withinTransaction = false;

    public function up(): void
    {
        $steps = [
            // 54-country geography, map layers, project briefs, registers and the Botswana pack.
            AiimGeoSeeder::class => fn () => $this->has('aiim_countries'),
            // Webinar catalogue, consoles and demo registrations.
            WebinarsSeeder::class => fn () => $this->has('ins_webinars') && $this->has('users'),
            // KP Thought Leadership console records.
            KpSeeder::class => fn () => $this->has('users'),
            // The 7,008-row Sprint register, linked to the Sprints already published.
            SprintsRegisterSeeder::class => fn () => $this->has('sprints'),
            // Industry aisle cross-listings, built from every Sprint.
            ShopAisleListingsSeeder::class => fn () => $this->has('sprints'),
        ];

        Model::withoutEvents(function () use ($steps) {
            foreach ($steps as $class => $ready) {
                if (! $ready()) {
                    continue;
                }

                /** @var Seeder $seeder */
                $seeder = app($class);
                $seeder->setContainer(app());
                $seeder->__invoke();
            }
        });

        rescue(fn () => Cache::flush(), report: false);
    }

    public function down(): void
    {
        // Content only. The schema migrations before this one own the tables.
    }

    private function has(string $table): bool
    {
        return Schema::hasTable($table) && DB::table($table)->exists();
    }
};
