<?php

use Database\Seeders\Sections\KpArticlesSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reloads Kruger Phiri's 37 articles after the 29 October 2026 changes: no byline
 * and no AI-assistance or pre-publication approval notes. The load migration
 * 2026_10_29_110000 may already have run in production, so this one applies the
 * changed source files there.
 *
 * KpArticlesSeeder is idempotent: it updates rows by slug and never duplicates.
 * On an empty database (a fresh install or a test run) nothing is loaded here,
 * because `db:seed` loads the same articles with the rest of the content.
 *
 * Model events are switched off so loading content does not queue integration events.
 */
return new class extends Migration
{
    /** Seeding runs many statements; keep it outside one long transaction. */
    public $withinTransaction = false;

    public function up(): void
    {
        if (! $this->has('users') || ! Schema::hasTable('kp_articles')) {
            return;
        }

        Model::withoutEvents(function () {
            /** @var Seeder $seeder */
            $seeder = app(KpArticlesSeeder::class);
            $seeder->setContainer(app());
            $seeder->__invoke();
        });

        rescue(fn () => Cache::flush(), report: false);
    }

    public function down(): void
    {
        // Content only. The create_kp_articles_table migration owns the table.
    }

    private function has(string $table): bool
    {
        return Schema::hasTable($table) && DB::table($table)->exists();
    }
};
