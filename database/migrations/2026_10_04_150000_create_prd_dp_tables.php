<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Digital Products family (prd_dp_*): catalogue, versions, entitlements,
 * download register, refund / issue cases, rights amendments, audit events
 * and the governance registers behind the admin consoles.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prd_dp_products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();          // DP-PLN-000123
            $table->string('sku')->unique();           // DP-TPL-BUS-PLAN
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('type');                    // report, template, toolkit, checklist, calculator, dashboard, course, guide
            $table->string('category')->nullable();    // Business & Management ...
            $table->string('tagline', 300)->nullable();
            $table->text('description')->nullable();
            $table->string('audience', 300)->nullable();
            $table->string('best_for', 300)->nullable();
            $table->json('audiences')->nullable();     // filter keys
            $table->json('industries')->nullable();
            $table->string('business_function')->nullable();
            $table->string('jurisdiction')->default('South Africa');
            $table->json('languages')->nullable();     // [{code,label,state: approved|review|unavailable}]
            $table->json('formats')->nullable();       // [{code,label,note}]
            $table->string('primary_format', 10)->default('PDF');
            $table->json('prices')->nullable();        // {L1: 1950, L2: 2450, ...} ex VAT ZAR, null = not permitted
            $table->string('current_version')->nullable();
            $table->date('verified_at')->nullable();
            $table->date('next_review_at')->nullable();
            $table->string('review_cycle')->default('Quarterly');
            $table->string('maintenance_class', 4)->default('M1'); // M0..M3
            $table->string('update_class', 4)->default('U2');      // U0..U3
            $table->unsignedSmallInteger('update_months')->default(12);
            $table->string('support')->default('Standard Email');
            $table->unsignedTinyInteger('dss')->nullable();        // 0..100
            $table->string('dss_band')->nullable();                // DSS 2 – High
            $table->string('risk')->default('Medium');
            $table->string('lifecycle_status')->default('draft');  // draft, under_review, pending_qa, pending_pricing, pending_reclass, live, withdrawn_hold
            $table->string('disposition', 8)->default('DP-PK');    // DP-PK, DP-PS, DP-PE, DP-FR, DP-RC
            $table->string('defensibility_level')->nullable();     // D3 – Strong
            $table->boolean('subscription_suitable')->default(false);
            $table->string('subscription_status')->default('Not Applicable'); // Enabled, Pending, Not Applicable
            $table->string('recurring_evidence')->nullable();
            $table->json('receive')->nullable();       // What you receive
            $table->json('compare')->nullable();       // Why this, not free AI rows
            $table->json('badges')->nullable();
            $table->json('content')->nullable();       // how_to_use, does_not_do, related_sprint ...
            $table->json('defensibility')->nullable(); // D1..D5 + substitute + gate decision
            $table->json('qa')->nullable();            // 17 checks + cycle
            $table->unsignedInteger('downloads_count')->default(0);
            $table->unsignedSmallInteger('popularity')->default(0);
            $table->string('cover_tone')->default('gold');
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
            $table->index(['type', 'lifecycle_status']);
        });

        Schema::create('prd_dp_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('prd_dp_products')->cascadeOnDelete();
            $table->string('version');                 // 1.3.0
            $table->string('status')->default('draft'); // draft, qa, current, superseded, historical, archived, withdrawn_unsafe
            $table->string('update_type')->nullable();  // major, minor, patch, critical, clarification
            $table->date('released_at')->nullable();
            $table->date('verified_at')->nullable();
            $table->date('maintenance_until')->nullable();
            $table->string('summary', 500)->nullable();
            $table->json('whats_new')->nullable();
            $table->json('impact')->nullable();
            $table->string('size')->nullable();
            $table->string('compat_works_with')->nullable();
            $table->string('compat_replaces')->nullable();
            $table->timestamps();
            $table->unique(['product_id', 'version']);
        });

        Schema::create('prd_dp_entitlements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // ENT-2026-000541
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('holder_name')->nullable();
            $table->string('holder_email')->nullable();
            $table->foreignId('product_id')->constrained('prd_dp_products')->cascadeOnDelete();
            $table->foreignId('version_id')->nullable()->constrained('prd_dp_versions')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->unsignedBigInteger('order_item_id')->nullable()->unique();
            $table->string('order_reference')->nullable();
            $table->string('licence_class', 4);
            $table->string('language', 4)->default('EN');
            $table->string('format', 8)->default('PDF');
            $table->string('jurisdiction')->default('South Africa');
            $table->string('status')->default('pending_payment'); // pending_payment, active, suspended, revoked, refunded, legacy, failed
            $table->string('terms_version')->default('v1.1');
            $table->string('disclosure_version')->default('RDP-v2.0');
            $table->string('authorised_entity')->nullable();
            $table->unsignedInteger('price_zar')->default(0);
            $table->date('update_until')->nullable();
            $table->date('access_expires_at')->nullable();
            $table->string('maintenance_status')->default('not_active'); // not_active, active, lapsed
            $table->string('maintenance_plan')->nullable();               // annual, monthly
            $table->date('maintenance_until')->nullable();
            $table->boolean('auto_renew')->default(false);
            $table->unsignedInteger('credit_zar')->default(0);
            $table->unsignedInteger('credit_applied_zar')->default(0);
            $table->string('notification_state')->nullable(); // delivered, pending, failed
            $table->string('correction_state')->nullable();
            $table->json('manifest')->nullable();      // frozen checkout manifest
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('prd_dp_downloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entitlement_id')->constrained('prd_dp_entitlements')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->constrained('prd_dp_products')->cascadeOnDelete();
            $table->string('version');
            $table->string('format', 8);
            $table->string('language', 4);
            $table->string('file_name');
            $table->boolean('success')->default(true);
            $table->string('failure_reason')->nullable();
            $table->string('hash', 64)->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('prd_dp_cases', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // REF-2026-00078
            $table->foreignId('entitlement_id')->nullable()->constrained('prd_dp_entitlements')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('kind');                    // refund, product_issue, technical, other
            $table->string('reason');
            $table->text('description');
            $table->string('outcome');
            $table->boolean('downloaded')->default(false);
            $table->string('evidence_path')->nullable();
            $table->string('status')->default('submitted'); // submitted, under_review, approved, declined, resolved
            $table->string('legal_state')->nullable();      // statutory / TBCA-failure / goodwill
            $table->unsignedInteger('amount_zar')->default(0);
            $table->text('decision_note')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_dp_amendments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entitlement_id')->constrained('prd_dp_entitlements')->cascadeOnDelete();
            $table->string('type');                    // licence_upgrade, maintained_access, version_update, conversion, refund, withdrawal
            $table->string('from_value')->nullable();
            $table->string('to_value')->nullable();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->unsignedInteger('amount_zar')->default(0);
            $table->string('status')->default('applied'); // pending_payment, applied, failed
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_dp_events', function (Blueprint $table) {
            $table->id();
            $table->string('event');                   // DP_ENTITLEMENT_CREATED ...
            $table->string('subject_type');
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_label')->nullable();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('data')->nullable();
            $table->timestamps();
            $table->index(['subject_type', 'subject_id']);
        });

        Schema::create('prd_dp_claims', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // CLM-2026-002145
            $table->foreignId('product_id')->nullable()->constrained('prd_dp_products')->nullOnDelete();
            $table->string('product_name');
            $table->string('version_label');
            $table->string('claim', 500);
            $table->string('type');                    // Feature, Statistic, Outcome, Suitability, Legal, Other
            $table->string('source')->nullable();
            $table->string('source_detail')->nullable();
            $table->string('status')->default('pending'); // pending, in_review, verified, rejected
            $table->boolean('has_evidence')->default(true);
            $table->string('priority')->default('medium');
            $table->date('review_due')->nullable();
            $table->string('reviewer')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_dp_ip_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained('prd_dp_products')->nullOnDelete();
            $table->string('product_name');
            $table->string('version_label');
            $table->string('sku')->nullable();
            $table->boolean('marketplace')->default(false);
            $table->string('provider')->nullable();
            $table->string('authorship_class', 4);     // A1..A5
            $table->string('instrument_type')->nullable();
            $table->string('instrument_ref')->nullable();
            $table->date('instrument_date')->nullable();
            $table->string('ip_status')->default('partial'); // cleared, partial, at_risk
            $table->json('licence_classes')->nullable();      // {L1: ok|pending|blocked}
            $table->string('licence_version')->nullable();
            $table->date('licence_effective')->nullable();
            $table->string('third_party')->default('PENDING'); // PASS, PENDING, NONE, FAIL
            $table->string('ai_class', 4)->default('AI-0');
            $table->string('clearance_status')->default('awaiting_evidence'); // awaiting_evidence, in_review, cleared, blocked
            $table->boolean('listed')->default(false);
            $table->string('jurisdiction')->default('South Africa');
            $table->date('last_review')->nullable();
            $table->date('next_review')->nullable();
            $table->string('reviewer')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_dp_incidents', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // CRR-2026-00051
            $table->foreignId('product_id')->nullable()->constrained('prd_dp_products')->nullOnDelete();
            $table->string('product_name');
            $table->string('version_label');
            $table->string('summary');
            $table->text('detail')->nullable();
            $table->string('severity', 4);             // S1, S2, S3
            $table->string('type');
            $table->string('detected_by');
            $table->date('detected_on');
            $table->string('status')->default('open'); // open, under_review, in_containment, resolved
            $table->string('containment')->default('not_contained'); // not_contained, in_containment, partial, contained
            $table->unsignedTinyInteger('step')->default(1); // 1..6 containment & remedy flow
            $table->unsignedInteger('holders_affected')->default(0);
            $table->unsignedInteger('downloads')->default(0);
            $table->string('assigned_to')->nullable();
            $table->timestamp('containment_started_at')->nullable();
            $table->string('replacement_version')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_dp_reclass_items', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('version_label');
            $table->string('category');
            $table->string('current_state')->default('Delayed Delivery');
            $table->string('eligibility');             // eligible, pending_rework, not_eligible, completed
            $table->string('gap_summary');
            $table->string('route')->nullable();       // R-A, R-B, R-C, R-D
            $table->string('dss_band');
            $table->string('priority');
            $table->string('owner');
            $table->date('target_release')->nullable();
            $table->unsignedTinyInteger('stage')->default(2); // 1..7
            $table->timestamps();
        });

        Schema::create('prd_dp_price_items', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('version_label');
            $table->string('sku');
            $table->string('category');
            $table->string('licence', 4);
            $table->unsignedInteger('lowest_price');
            $table->unsignedInteger('tcs');
            $table->unsignedInteger('floor_price');
            $table->unsignedInteger('proposed_price')->nullable();
            $table->string('priority');
            $table->string('status')->default('needs_review'); // needs_review, in_analysis, price_proposed, awaiting_approval, completed
            $table->boolean('bundle')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['price_items', 'reclass_items', 'incidents', 'ip_records', 'claims', 'events', 'amendments', 'cases', 'downloads', 'entitlements', 'versions', 'products'] as $t) {
            Schema::dropIfExists("prd_dp_{$t}");
        }
    }
};
