<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * KP Thought Leadership articles: Kruger Phiri's own texts (Drive folder
 * "ARTICLES-KP THOT LEADERSHIP", 18 Oct 2026), loaded from the versioned files in
 * database/seeders/Sections/data/kp-articles by KpArticlesSeeder.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kp_articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('category')->index(); // insights, founders-notes, resources
            $table->string('type');
            $table->string('title');
            $table->string('kicker')->nullable();
            $table->text('deck')->nullable();
            $table->json('byline')->nullable();
            $table->date('published_on')->nullable();
            $table->string('date_note')->nullable();
            $table->string('author');
            $table->string('voice', 2);
            $table->string('scope', 10);
            $table->string('theme')->index();
            $table->json('themes');
            $table->json('countries');
            $table->boolean('featured')->default(false);
            $table->unsignedSmallInteger('read_minutes')->default(1);
            $table->unsignedInteger('word_count')->default(0);
            $table->longText('body');
            $table->longText('search_text');
            $table->string('sources_heading')->nullable();
            $table->json('sources');
            $table->json('notes');
            $table->json('source');
            $table->json('conversion_fixes')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kp_articles');
    }
};
