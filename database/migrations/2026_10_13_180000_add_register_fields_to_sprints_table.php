<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Links sprints to the client's 7,008-row Sprint Design Register (Volume 11) and
 * gives every sprint a slot for a real cover image.
 *
 *  - register_id: the register's Sprint ID (TBCA-...). Also set on older mockup
 *    records that the register lists under another code.
 *  - page_family: the register's page family (which page template it uses).
 *  - shop_aisle:  the Online Shop A-Z aisle the sprint is shelved in.
 *  - image_url:   a real cover image; when empty the generated cover art is shown.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sprints', function (Blueprint $table) {
            $table->string('register_id')->nullable()->after('code')->index();
            $table->string('page_family')->nullable()->after('subcategory');
            $table->string('shop_aisle')->nullable()->after('page_family')->index();
            $table->string('image_url')->nullable()->after('rating');
            $table->index(['status', 'category']);
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::table('sprints', function (Blueprint $table) {
            $table->dropIndex(['status', 'category']);
            $table->dropIndex(['title']);
            $table->dropIndex(['register_id']);
            $table->dropIndex(['shop_aisle']);
            $table->dropColumn(['register_id', 'page_family', 'shop_aisle', 'image_url']);
        });
    }
};
