<?php

use Database\Seeders\Sections\KpArticlesSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads Kruger Phiri's 37 articles (Drive folder "ARTICLES-KP THOT LEADERSHIP",
 * 18 October 2026) into a database that was seeded before them, so a deploy that
 * runs `migrate` publishes them without re-seeding.
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
