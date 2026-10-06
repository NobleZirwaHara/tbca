<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AIIM country register: Africa's 54 countries, one Investor Cockpit each.
 *
 * Stable reference facts (names, ISO codes, region, capital, currency, area) are
 * plain columns. Headline indicators that need live data sit in `indicators`,
 * each entry flagged with a `status` of "placeholder" until an API feed or the
 * client's Test Data replaces it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aiim_countries', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->char('iso2', 2)->unique();
            $table->char('iso3', 3)->unique();
            $table->char('iso_numeric', 3);
            $table->string('region', 16)->index();     // north | west | central | east | southern
            $table->string('capital');
            $table->char('currency_code', 3);
            $table->string('currency_name');
            $table->unsignedInteger('area_km2');
            $table->json('indicators')->nullable();    // {key: {label, value, unit, year, status, source}}
            $table->json('subregions')->nullable();    // [name] — well-known sub-national regions, where reliable
            $table->boolean('has_province_pack')->default(false); // full sub-national intelligence (South Africa)
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aiim_countries');
    }
};
