<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AIIM geographic intelligence for all 54 countries (client review 8 to 11 Oct 2026).
 *
 * - Country activation: AU region, roll-out wave and country pack status per country.
 * - Admin units: one generic hierarchy (region > district > city > municipality > town)
 *   that skips levels a country does not use. Populated only where sourced.
 * - Map layers: the Deep Registers Map_Layers catalogue plus the core AIIM layers.
 * - Map features: sourced points per country (border gateways, hotspots, institutions, airports).
 * - Opportunity templates: Deep Registers Opportunity_Register and country pack opportunity sweeps.
 * - Question chains: investor (IQ) and trader (TQ) questions, generic and per sector.
 * - Country packs: country pack content (macro facts, products, institutions, sector worked examples).
 * - Screened project briefs: screening metrics and location on aiim_projects.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('aiim_countries', function (Blueprint $table) {
            $table->string('au_region', 24)->nullable();
            $table->string('activation_wave', 32)->nullable();
            $table->string('pack_status', 32)->nullable();
            $table->string('pack_code', 32)->nullable();
            $table->json('outline')->nullable();       // [[ring of [lon, lat]]] per polygon, Natural Earth (simplified)
        });

        Schema::create('aiim_admin_units', function (Blueprint $table) {
            $table->id();
            $table->char('country_iso2', 2)->index();
            $table->foreignId('parent_id')->nullable()->constrained('aiim_admin_units')->nullOnDelete();
            $table->unsignedTinyInteger('level');          // 1 region, 2 district, 3 city, 4 municipality, 5 town
            $table->string('level_key', 16);               // region | district | city | municipality | town
            $table->string('kind')->nullable();            // local term: Province, District Council, Town council ...
            $table->string('code', 32)->nullable();
            $table->string('slug');
            $table->string('name');
            $table->json('labels')->nullable();            // {tn: "Bokone-Bophirima"} local-language names
            $table->unsignedBigInteger('population')->nullable();
            $table->string('population_source')->nullable();
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->boolean('placeholder')->default(false); // name or point still to be confirmed
            $table->string('source')->nullable();
            $table->json('meta')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
            $table->unique(['country_iso2', 'slug']);
        });

        Schema::create('aiim_map_layers', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('family', 16);                  // core | sector
            $table->string('sector_code', 8)->nullable()->index();
            $table->string('asset_id', 16)->nullable();
            $table->string('asset_type')->nullable();
            $table->string('label');
            $table->json('labels')->nullable();
            $table->string('geometry')->nullable();        // Point (pin/peg) | Polygon | Line/flow | Raster/choropleth
            $table->string('levels')->nullable();
            $table->string('security_class', 8)->nullable();
            $table->string('color', 16)->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->string('source')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_map_features', function (Blueprint $table) {
            $table->id();
            $table->char('country_iso2', 2)->index();
            $table->string('layer_key')->index();
            $table->string('code');
            $table->foreignId('admin_unit_id')->nullable()->constrained('aiim_admin_units')->nullOnDelete();
            $table->string('name');
            $table->json('labels')->nullable();
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->boolean('placeholder')->default(false);
            $table->string('status')->nullable();
            $table->string('sector_code', 8)->nullable();
            $table->json('meta')->nullable();
            $table->string('source')->nullable();
            $table->timestamps();
            $table->unique(['country_iso2', 'layer_key', 'code']);
        });

        Schema::create('aiim_opportunity_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->char('country_iso2', 2)->nullable()->index(); // null = Africa-wide template
            $table->string('sector_code', 8)->index();
            $table->string('kind', 16)->default('template');      // template | anchor | sweep | instance
            $table->string('asset_group')->nullable();
            $table->string('asset')->nullable();
            $table->string('title');
            $table->string('trigger')->nullable();
            $table->string('placement')->nullable();
            $table->string('model')->nullable();
            $table->string('scope')->nullable();
            $table->string('status')->nullable();
            $table->string('band')->nullable();
            $table->string('tier', 8)->nullable();
            $table->unsignedTinyInteger('score')->nullable();
            $table->string('persona', 16)->nullable();
            $table->string('citizen_reserved', 8)->nullable();
            $table->string('fx_earner', 8)->nullable();
            $table->string('time_to_revenue')->nullable();
            $table->foreignId('admin_unit_id')->nullable()->constrained('aiim_admin_units')->nullOnDelete();
            $table->string('place')->nullable();
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->json('meta')->nullable();
            $table->string('source')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_question_chains', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();                       // scope:sector:chain:position
            $table->char('country_iso2', 2)->nullable()->index();
            $table->string('sector_code', 8)->nullable()->index();
            $table->string('chain', 16);                           // investor | trader
            $table->string('code', 8)->nullable();                 // IQ01 / TQ01 for the generic chains
            $table->unsignedSmallInteger('position');
            $table->string('question');
            $table->text('info_types')->nullable();
            $table->string('tag', 32)->nullable();
            $table->string('map_behaviour')->nullable();
            $table->text('anchor')->nullable();
            $table->string('institution')->nullable();
            $table->string('evidence')->nullable();
            $table->string('source')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_country_packs', function (Blueprint $table) {
            $table->id();
            $table->char('country_iso2', 2)->unique();
            $table->string('code', 32);
            $table->string('title');
            $table->date('issued_on')->nullable();
            $table->json('summary')->nullable();
            $table->json('macro')->nullable();
            $table->json('products')->nullable();
            $table->json('institutions')->nullable();
            $table->json('one_stop_shop')->nullable();
            $table->json('sectors')->nullable();
            $table->json('top_opportunities')->nullable();
            $table->json('benchmark')->nullable();
            $table->json('rollout')->nullable();
            $table->json('geo')->nullable();                       // boundary and line geometry for the country map
            $table->string('fx_note')->nullable();
            $table->string('source')->nullable();
            $table->timestamps();
        });

        Schema::table('aiim_projects', function (Blueprint $table) {
            $table->char('country_iso2', 2)->nullable()->index();
            $table->foreignId('admin_unit_id')->nullable()->constrained('aiim_admin_units')->nullOnDelete();
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->boolean('coordinates_placeholder')->default(false);
            $table->string('screening_status', 16)->nullable()->index(); // QUALIFIED | WATCHLIST | NOT QUALIFIED
            $table->unsignedBigInteger('capex_zar')->nullable();
            $table->json('screening')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('aiim_projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('admin_unit_id');
            $table->dropIndex(['country_iso2']);
            $table->dropIndex(['screening_status']);
            $table->dropColumn(['country_iso2', 'latitude', 'longitude', 'coordinates_placeholder', 'screening_status', 'capex_zar', 'screening']);
        });
        foreach (['aiim_country_packs', 'aiim_question_chains', 'aiim_opportunity_templates', 'aiim_map_features', 'aiim_map_layers', 'aiim_admin_units'] as $t) {
            Schema::dropIfExists($t);
        }
        Schema::table('aiim_countries', function (Blueprint $table) {
            $table->dropColumn(['au_region', 'activation_wave', 'pack_status', 'pack_code', 'outline']);
        });
    }
};
