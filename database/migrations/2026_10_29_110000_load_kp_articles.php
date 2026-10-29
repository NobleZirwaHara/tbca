<?php

use Illuminate\Database\Migrations\Migration;

/**
 * First load of Kruger Phiri's 37 articles (Drive folder "ARTICLES-KP THOT
 * LEADERSHIP", 18 October 2026).
 *
 * Superseded by 2026_10_29_130000_reload_kp_articles, which loads the articles
 * after 2026_10_29_125000 drops the author and byline columns. Where this
 * migration already ran, the reload migration updates the rows in place; where it
 * has not, loading here would fail on those columns, so it does nothing.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Intentionally empty: see 2026_10_29_130000_reload_kp_articles.
    }

    public function down(): void
    {
        // Content only.
    }
};
