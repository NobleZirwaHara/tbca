<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Digital Products market attributes: the currencies a product is offered in (ZAR, USD,
 * XOF, EUR, RMB) and the jurisdictions it is written for (ISO2 codes or PAN = Pan-African).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prd_dp_products', function (Blueprint $table) {
            if (! Schema::hasColumn('prd_dp_products', 'currencies')) {
                $table->json('currencies')->nullable();
            }
            if (! Schema::hasColumn('prd_dp_products', 'jurisdictions')) {
                $table->json('jurisdictions')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('prd_dp_products', function (Blueprint $table) {
            $table->dropColumn(['currencies', 'jurisdictions']);
        });
    }
};
