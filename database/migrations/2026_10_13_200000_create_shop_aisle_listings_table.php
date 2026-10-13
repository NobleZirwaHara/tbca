<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cross-listings of Sprints in Online Shop aisles other than their home aisle.
 *
 * A Sprint's home aisle stays in sprints.shop_aisle and is never repeated here. Each row places
 * the Sprint in one more aisle (the industry aisles and Risk & Cybersecurity):
 *  - reason "named":    the Sprint names the industry (keyword rule);
 *  - reason "relevant": a general Sprint relevant to the industry (subcategory and keyword score);
 *  - reason "manual":   added by TBCA in the overrides file.
 * See App\Support\Shop\IndustryListings for the rules.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_aisle_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sprint_id')->constrained('sprints')->cascadeOnDelete();
            $table->string('aisle', 80);
            $table->enum('reason', ['named', 'relevant', 'manual']);
            $table->string('source', 40);
            $table->string('matched')->nullable();
            $table->unsignedInteger('score')->default(0);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['sprint_id', 'aisle']);
            $table->index(['aisle', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_aisle_listings');
    }
};
