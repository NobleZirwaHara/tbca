<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Registry of Deliverables (client workbook MP-DEL-2.0, 25 October 2026): every
 * deliverable the WebApp sells, built from each tab, with its depth per tier, page
 * counts, delivery trigger and workflow, consultancy benchmark, the Sprint
 * crosswalk, design standards, automated safeguards, payment-trigger loops, the
 * HeyGen and Infogram specification and the country matrix.
 *
 * Long texts that repeat across many deliverables (the HeyGen and Infogram layers,
 * the payment-triggered loop, acceptance parameters and similar) are stored once in
 * deliverable_texts and referenced by *_text_id columns.
 */
return new class extends Migration
{
    /** Register columns held once in deliverable_texts. Kept in step with App\Models\Deliverable::POOLED. */
    private const POOLED = [
        'extent_premium', 'consulting_standard', 'audience', 'client_inputs', 'exclusions', 'add_ons',
        'next_offer', 'catalogue_price', 'catalogue_delivery', 'uplift_basic', 'uplift_standard',
        'uplift_premium', 'heygen_layer', 'infogram_layer', 'automation_route', 'payment_trigger', 'acceptance',
    ];

    public function up(): void
    {
        Schema::create('deliverable_texts', function (Blueprint $table) {
            $table->id();
            $table->char('hash', 40)->unique();                 // sha1 of the body
            $table->text('body');
            $table->timestamps();
        });

        Schema::create('deliverables', function (Blueprint $table) {
            $table->id();
            $table->string('ref', 20)->unique();                // DEL-SV-001
            $table->unsignedInteger('sort')->default(0);
            $table->string('tab', 80)->index();                 // WebApp tab
            $table->string('family', 160)->nullable()->index(); // sub-tab or family
            $table->string('name', 255);
            $table->string('format_class', 40)->index();        // one of 11 classes
            $table->string('format_detail', 60)->nullable();
            $table->string('format_code', 5)->nullable();       // RPT, TPL ... from the Standards sheet
            $table->text('description')->nullable();
            $table->text('key_issues')->nullable();
            $table->text('extent_basic')->nullable();
            $table->text('extent_standard')->nullable();
            $table->string('pages_basic', 40)->nullable();
            $table->string('pages_standard', 40)->nullable();
            $table->string('pages_premium', 40)->nullable();
            $table->string('page_unit', 40)->nullable();
            $table->string('delivery_basic', 60)->nullable();
            $table->string('delivery_standard', 60)->nullable();
            $table->string('delivery_premium', 60)->nullable();
            $table->decimal('csat_basic', 5, 4)->nullable();
            $table->decimal('csat_standard', 5, 4)->nullable();
            $table->decimal('csat_premium', 5, 4)->nullable();
            $table->text('source')->nullable();
            $table->text('linked_sprint_codes')->nullable();
            $table->string('sprint_type', 80)->nullable();
            $table->text('client_problem')->nullable();
            $table->text('package_basic')->nullable();
            $table->text('package_standard')->nullable();
            $table->text('package_premium')->nullable();
            $table->text('companion_assets')->nullable();
            $table->text('beyond_benchmark')->nullable();
            $table->text('ai_depth')->nullable();
            $table->text('safeguards')->nullable();             // "SG-01, SG-02, ..." as written
            $table->string('v2_status', 80)->nullable();
            foreach (self::POOLED as $field) {
                $table->unsignedBigInteger("{$field}_text_id")->nullable();
            }
            // Derived from the register text so the backend can route work.
            $table->string('loop_id', 30)->nullable()->index();          // LOOP-PAY-UP-01
            $table->string('automation_family', 20)->nullable();         // UP-01
            $table->string('owner_blueprint', 80)->nullable();           // BP-02 Services Resolver
            $table->timestamps();
        });

        Schema::create('deliverable_sprints', function (Blueprint $table) {
            $table->id();
            $table->string('sprint_code', 40)->unique();        // the crosswalk code (register Sprint ID)
            $table->string('sprint_name', 255)->nullable();
            $table->string('batch', 10)->nullable();
            $table->string('population', 40)->nullable();       // CATALOGUE, EMBEDDED, INTERNAL OPERATION
            $table->string('deliverable_ref', 20)->index();
            $table->string('status', 60);                       // crosswalk status as written
            $table->foreignId('sprint_id')->nullable()->constrained('sprints')->nullOnDelete();
            $table->string('match', 20)->default('unmatched');  // code, register_id, unmatched
            $table->timestamps();
        });

        Schema::create('deliverable_standards', function (Blueprint $table) {
            $table->id();
            $table->string('section', 20);                      // tier, tier_v2, size, format, csat_rule
            $table->string('code', 10)->nullable();             // format or size code
            $table->text('parameter');
            $table->text('basic')->nullable();
            $table->text('standard')->nullable();
            $table->text('premium')->nullable();
            $table->string('unit', 40)->nullable();
            $table->decimal('value', 6, 2)->nullable();         // size multiplier
            $table->text('basis')->nullable();                  // source, or the consulting standard for a format
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
            $table->unique(['section', 'sort']);
        });

        Schema::create('deliverable_safeguards', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();               // SG-01
            $table->string('name', 160);
            $table->text('rule');
            $table->string('oss_stage', 40)->nullable();
            $table->string('loop_control', 60)->nullable();
            $table->timestamps();
        });

        Schema::create('deliverable_payment_loops', function (Blueprint $table) {
            $table->id();
            $table->string('loop_id', 30)->unique();            // LOOP-PAY-UP-01
            $table->string('family', 160);
            $table->text('task');
            $table->string('owning_blueprint', 120)->nullable();
            $table->unsignedInteger('sprints')->default(0);     // Sprint count stated in the workbook
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('deliverable_integration_specs', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 20);                     // heygen, infogram
            $table->string('element', 80);
            $table->text('value');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
            $table->unique(['provider', 'element']);
        });

        Schema::create('deliverable_country_matrix', function (Blueprint $table) {
            $table->id();
            $table->char('iso3', 3);
            $table->string('country', 80);
            $table->string('au_region', 40)->nullable();
            $table->string('wave', 40)->nullable();
            $table->string('pack_status', 60)->nullable();
            $table->string('deliverable', 120);
            $table->string('status', 60)->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
            $table->unique(['iso3', 'deliverable']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliverable_country_matrix');
        Schema::dropIfExists('deliverable_integration_specs');
        Schema::dropIfExists('deliverable_payment_loops');
        Schema::dropIfExists('deliverable_safeguards');
        Schema::dropIfExists('deliverable_standards');
        Schema::dropIfExists('deliverable_sprints');
        Schema::dropIfExists('deliverables');
        Schema::dropIfExists('deliverable_texts');
    }
};
