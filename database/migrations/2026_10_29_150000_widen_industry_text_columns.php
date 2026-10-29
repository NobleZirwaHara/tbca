<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Two Industries columns were created too short for their data ("1 (replication test)",
 * long Sprint entry tiers). SQLite ignores varchar lengths, Postgres does not, so a
 * database created before the fix needs the columns widened.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ind_countries', fn (Blueprint $table) => $table->string('wave', 40)->nullable()->change());
        Schema::table('ind_sprints', fn (Blueprint $table) => $table->string('entry_tier', 60)->nullable()->change());
    }

    public function down(): void
    {
        // Narrowing would truncate data; leave the wider columns in place.
    }
};
