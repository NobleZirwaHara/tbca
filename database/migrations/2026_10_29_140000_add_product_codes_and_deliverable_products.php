<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Links register deliverables to the app's products (not only Sprints), and gives a
 * product code to the product tables that had none (webinars, Marketplace and Partner
 * Services listings, the Services catalogue). Codes are filled by the next migration.
 */
return new class extends Migration
{
    private const CODED = ['ins_webinars', 'mkt_listings', 'adv_services'];

    public function up(): void
    {
        foreach (self::CODED as $table) {
            if (Schema::hasTable($table) && ! Schema::hasColumn($table, 'code')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->string('code', 20)->nullable()->unique();
                });
            }
        }

        Schema::create('deliverable_products', function (Blueprint $table) {
            $table->id();
            $table->string('deliverable_ref', 20)->index();
            $table->string('product_type', 40);                 // dd_family, digital_product, webinar ...
            $table->string('product_code', 60);                 // the product's code, or * for every product of the type
            $table->string('product_name', 255)->nullable();
            $table->string('product_url', 255)->nullable();
            $table->string('scope', 10)->default('product');    // product, or all (applies to every product of the type)
            $table->string('match_method', 80);
            $table->string('confidence', 10);                   // high
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['deliverable_ref', 'product_type', 'product_code']);
            $table->index(['product_type', 'product_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliverable_products');
        foreach (self::CODED as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'code')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropUnique(['code']);
                    $t->dropColumn('code');
                });
            }
        }
    }
};
