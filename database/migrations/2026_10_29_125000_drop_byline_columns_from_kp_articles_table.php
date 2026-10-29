<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * KP articles are published without a byline (Noble, 29 Oct 2026), so the author
 * and byline columns are no longer stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['author', 'byline'] as $column) {
            if (Schema::hasColumn('kp_articles', $column)) {
                Schema::table('kp_articles', fn (Blueprint $table) => $table->dropColumn($column));
            }
        }
    }

    public function down(): void
    {
        Schema::table('kp_articles', function (Blueprint $table) {
            $table->string('author')->nullable();
            $table->json('byline')->nullable();
        });
    }
};
