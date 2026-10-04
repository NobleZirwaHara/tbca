<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Contract-level approved floor (falls back to the service floor scaled by allowance). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prd_ret_retainers', function (Blueprint $table) {
            $table->unsignedInteger('floor_zar')->nullable()->after('monthly_fee_zar');
        });
    }

    public function down(): void
    {
        Schema::table('prd_ret_retainers', function (Blueprint $table) {
            $table->dropColumn('floor_zar');
        });
    }
};
