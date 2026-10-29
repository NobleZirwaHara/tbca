<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tables for the Industries tab rebuilt from the client's "TBCA Industries Prototype"
 * (MP-INDUSTRIES-1.0, 21 Oct 2026): 17 industries, 56 sub-industries, the 17 x 54
 * industry x country matrix, the Sprint classification, the intra-African trade
 * model, the Botswana and continental registers it reads, and per-visitor state.
 *
 * Content is loaded by Database\Seeders\Sections\IndustriesSeeder.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ind_industries', function (Blueprint $table) {
            $table->id();
            $table->string('code', 8)->unique();
            $table->unsignedSmallInteger('number');
            $table->string('slug', 80)->unique();
            $table->string('name');
            $table->string('short')->nullable();
            $table->text('description')->nullable();
            $table->json('weights');
            $table->unsignedTinyInteger('complexity');
            $table->string('regulatory', 60);
            $table->string('human_gate', 80);
            $table->json('aiim');
            $table->json('hs');
            $table->json('stats');
            $table->string('catalogue', 30);
            $table->string('variant', 30);
            $table->timestamps();
        });

        Schema::create('ind_sub_industries', function (Blueprint $table) {
            $table->id();
            $table->string('code', 12)->unique();
            $table->string('industry_code', 8)->index();
            $table->unsignedSmallInteger('sort');
            $table->string('name');
            $table->string('description')->nullable();
            $table->json('aiim');
            $table->json('hs');
            $table->timestamps();
        });

        Schema::create('ind_meta', function (Blueprint $table) {
            $table->id();
            $table->string('key', 60)->unique();
            $table->longText('value');
            $table->timestamps();
        });

        Schema::create('ind_countries', function (Blueprint $table) {
            $table->id();
            $table->string('iso3', 3)->unique();
            $table->string('iso2', 2)->index();
            $table->string('slug', 80)->unique();
            $table->string('name');
            $table->string('region', 20);
            $table->string('wave', 4)->nullable();
            $table->string('pack', 20)->nullable();
            $table->string('pack_status', 40)->nullable();
            $table->string('capital')->nullable();
            $table->decimal('lat', 8, 3)->nullable();
            $table->decimal('lon', 8, 3)->nullable();
            $table->string('currency', 8)->nullable();
            $table->string('languages')->nullable();
            $table->decimal('pop', 10, 2)->nullable();
            $table->decimal('gdp', 10, 2)->nullable();
            $table->boolean('landlocked')->default(false);
            $table->string('recs')->nullable();
            $table->string('state', 20)->default('Activated');
            $table->unsignedTinyInteger('rcs')->default(100);
            $table->decimal('vat', 5, 2)->nullable();
            $table->unsignedSmallInteger('sort');
            $table->timestamps();
        });

        Schema::create('ind_country_scores', function (Blueprint $table) {
            $table->id();
            $table->string('industry_code', 8);
            $table->string('iso3', 3);
            $table->decimal('score', 6, 1);
            $table->decimal('exports', 12, 1);
            $table->decimal('imports', 12, 1);
            $table->timestamps();
            $table->unique(['industry_code', 'iso3']);
        });

        Schema::create('ind_sprints', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('name');
            $table->string('type', 60)->nullable();
            $table->string('family', 2);
            $table->unsignedTinyInteger('complexity');
            $table->boolean('viable')->default(false);
            $table->string('population', 20)->nullable();
            $table->string('entry_tier', 12)->nullable();
            $table->string('published_tiers', 8)->nullable();
            $table->unsignedInteger('cost_basic')->nullable();
            $table->unsignedInteger('cost_standard')->nullable();
            $table->unsignedInteger('cost_premium')->nullable();
            $table->string('rules', 40)->nullable();
            $table->string('archetype')->nullable();
            $table->timestamps();
            $table->index('family');
        });

        Schema::create('ind_trade_flows', function (Blueprint $table) {
            $table->id();
            $table->string('exporter', 3);
            $table->string('importer', 3);
            $table->json('flows');
            $table->timestamps();
            $table->unique(['exporter', 'importer']);
        });

        Schema::create('ind_register_rows', function (Blueprint $table) {
            $table->id();
            $table->string('register', 40);
            $table->unsignedInteger('row_no');
            $table->string('sector', 80)->nullable();
            $table->json('data');
            $table->timestamps();
            $table->unique(['register', 'row_no']);
            $table->index(['register', 'sector']);
        });

        /* Journey, diagnostic, consent and acknowledgement state for signed-in users
           (scope "u:{id}") and console-wide state (scope "global"). Guests keep it in the session. */
        Schema::create('ind_states', function (Blueprint $table) {
            $table->id();
            $table->string('scope', 40);
            $table->string('key', 80);
            $table->longText('value');
            $table->timestamps();
            $table->unique(['scope', 'key']);
        });
    }

    public function down(): void
    {
        foreach (['ind_states', 'ind_register_rows', 'ind_trade_flows', 'ind_sprints', 'ind_country_scores', 'ind_countries', 'ind_meta', 'ind_sub_industries', 'ind_industries'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
