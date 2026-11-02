<?php

use Database\Seeders\Sections\CountryHubSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads the data the AIIM tab reads from the client's "TBCA AIIM Botswana" prototype (its service
 * catalogue and prompt pack; the registers, geometry and pack text it shares with the Countries tab
 * are reloaded unchanged) into a database seeded before it, so a deploy that runs `migrate` needs no
 * re-seed. CountryHubSeeder is idempotent; on an empty database `db:seed` loads the same content.
 */
return new class extends Migration
{
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
        // Content only.
    }
};
