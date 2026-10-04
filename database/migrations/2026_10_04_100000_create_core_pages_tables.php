<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Core pages and customer journeys: Business Health Score, Tools entitlements,
 * Find the Right Service requests, and the corridor / Layer 9 admin registers.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('core_health_assessments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();          // BHS-2026-08-02-1435-7F2A
            $table->string('resume_token', 64)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable()->index();
            $table->string('business_name')->nullable();
            $table->json('profile')->nullable();            // step 1 answers + consents
            $table->json('answers')->nullable();            // keyed by section
            $table->unsignedTinyInteger('completed_step')->default(0);
            $table->string('status')->default('draft');     // draft, submitted
            $table->json('scores')->nullable();
            $table->unsignedTinyInteger('overall_score')->nullable();
            $table->string('band')->nullable();
            $table->timestamp('saved_at')->nullable();
            $table->timestamp('reminder_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('core_tool_entitlements', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('product_slug');
            $table->string('product_name');
            $table->string('licence')->default('Single-User / One-off');
            $table->string('language')->default('English');
            $table->string('email')->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamp('last_downloaded_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();
            $table->unique(['order_id', 'product_slug']);
        });

        Schema::create('core_service_finder_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable();
            $table->json('answers')->nullable();
            $table->unsignedTinyInteger('completed_step')->default(0);
            $table->string('status')->default('in_progress'); // in_progress, recommended, assistance_requested, closed
            $table->json('recommendations')->nullable();
            $table->string('assistance_reference')->nullable()->unique();
            $table->json('assistance')->nullable();
            $table->timestamp('assistance_requested_at')->nullable();
            $table->timestamps();
        });

        Schema::create('core_corridors', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type');                         // Regional, Bilateral, Inter-Regional
            $table->string('region');
            $table->json('anchors');                        // ordered anchor countries
            $table->boolean('bidirectional')->default(false);
            $table->unsignedSmallInteger('trading_paths')->default(0);
            $table->unsignedSmallInteger('sellable_paths')->default(0);
            $table->string('state')->default('pending');    // pending, active, on_hold, retired
            $table->unsignedTinyInteger('rcs')->default(0);
            $table->boolean('sovereign_approval')->default(false);
            $table->string('risk')->default('Medium');
            $table->date('last_reviewed_at')->nullable();
            $table->date('next_review_at')->nullable();
            $table->json('history')->nullable();
            $table->timestamps();
        });

        Schema::create('core_observations', function (Blueprint $table) {
            $table->id();
            $table->string('obs_id')->unique();
            $table->string('origin_surface');
            $table->string('country');
            $table->string('country_flag', 2)->nullable();
            $table->string('observation_class');
            $table->string('subject');
            $table->string('value')->nullable();
            $table->timestamp('captured_at');
            $table->unsignedTinyInteger('rcs_link')->default(0);
            $table->decimal('quality_score', 3, 2)->default(0);
            $table->string('status')->default('candidate'); // candidate, under_review, passed, promoted, rejected, retracted
            $table->string('risk')->default('Medium');
            $table->string('availability_state')->default('Active');
            $table->boolean('publication_permission')->default(false);
            $table->string('promoted_id')->nullable();
            $table->timestamp('promoted_at')->nullable();
            $table->string('decision_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('core_observations');
        Schema::dropIfExists('core_corridors');
        Schema::dropIfExists('core_service_finder_requests');
        Schema::dropIfExists('core_tool_entitlements');
        Schema::dropIfExists('core_health_assessments');
    }
};
