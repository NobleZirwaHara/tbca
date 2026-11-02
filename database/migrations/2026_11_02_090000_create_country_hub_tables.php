<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Countries tab rebuilt from the Countries part of the client's "TBCA Industries Prototype"
 * (MP-COUNTRIES-1.0, 21 Oct 2026).
 *
 * The 54 countries, the trade model and the registers are shared with Industries (ind_countries,
 * ind_trade_flows, ind_register_rows). This table holds the documents the Countries pages read as
 * a whole: the Botswana geometry, the country pack text, the register index and coverage check, and
 * the topic of each country Sprint. Content is loaded by Database\Seeders\Sections\CountryHubSeeder.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cty_meta', function (Blueprint $table) {
            $table->id();
            $table->string('key', 60)->unique();
            $table->longText('value');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cty_meta');
    }
};
