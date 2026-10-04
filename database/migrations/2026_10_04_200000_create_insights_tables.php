<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Insights section: Industries transaction ecosystem + TBCA Resources.
 * All tables are prefixed ins_.
 */
return new class extends Migration
{
    public function up(): void
    {
        /* ------------------------------------------------------------------
         | Industries — canonical taxonomy and governance registers
         * ------------------------------------------------------------------ */
        Schema::create('ins_industries', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();          // IND-01
            $table->string('short_code', 8);           // AGR
            $table->unsignedTinyInteger('number');
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->string('blurb', 300)->nullable();
            $table->text('description')->nullable();
            $table->string('tagline', 300)->nullable();
            $table->text('intro')->nullable();
            $table->string('catalogue_state')->default('deep');      // deep, thin, below_threshold
            $table->string('operating_mode')->default('FULL_SERVICE');
            $table->string('complexity_class', 4)->default('C1');    // C0..C3 (C4 = restricted)
            $table->string('regulatory_state')->default('mixed');    // low, mixed, high
            $table->string('professional_gate')->default('advisory'); // advisory, mandatory
            $table->string('status')->default('active');             // active, inactive, archived
            $table->unsignedTinyInteger('activation_stage')->default(0); // S0..S8
            $table->unsignedTinyInteger('activation_score')->default(0);
            $table->string('owner')->nullable();
            $table->date('target_live_date')->nullable();
            $table->unsignedInteger('sprints_total')->default(0);
            $table->unsignedInteger('sprints_activated')->default(0);
            $table->unsignedTinyInteger('key_risks')->default(0);
            $table->string('sprint_category')->nullable();
            $table->json('sprint_keywords')->nullable();
            $table->string('version')->default('1.0');
            $table->json('examples')->nullable();
            $table->json('rules')->nullable();
            $table->json('profile')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_sub_industries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('industry_id')->constrained('ins_industries')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('description', 300)->nullable();
            $table->string('complexity_bands')->default('C0 - C2');
            $table->string('status')->default('active');
            $table->unsignedInteger('sprint_count')->default(0);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('ins_taxonomy_changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('industry_id')->nullable()->constrained('ins_industries')->nullOnDelete();
            $table->string('changed_by');
            $table->string('change_type');
            $table->string('details');
            $table->string('version');
            $table->timestamps();
        });

        Schema::create('ins_skus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('industry_id')->nullable()->constrained('ins_industries')->nullOnDelete();
            $table->string('code')->unique();
            $table->string('slug')->nullable()->unique();
            $table->string('title');
            $table->string('industry_label')->nullable();
            $table->string('sub_industry')->nullable();
            $table->string('product_type')->default('diagnostic');
            $table->string('summary', 500)->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('price_zar')->nullable();
            $table->string('classification_state')->default('APPROVED');
            $table->string('classification_method')->nullable();
            $table->decimal('ai_confidence', 4, 3)->nullable();
            $table->json('drivers')->nullable();        // R Q E L V W
            $table->unsignedInteger('base_cost_zar')->nullable();
            $table->unsignedInteger('guidance_price_zar')->nullable();
            $table->string('sale_state')->default('sellable');   // sellable, blocked, restricted
            $table->string('block_status')->nullable();          // active, under_review, released
            $table->string('block_code')->nullable();
            $table->string('block_reason')->nullable();
            $table->text('block_detail')->nullable();
            $table->string('client_message')->nullable();
            $table->json('block_rules')->nullable();
            $table->date('blocked_on')->nullable();
            $table->date('review_by')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->json('add_ons')->nullable();
            $table->json('included')->nullable();
            $table->json('limitation')->nullable();
            $table->boolean('public')->default(false);
            $table->timestamps();
        });

        Schema::create('ins_regulators', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('acronym', 20);
            $table->string('type');
            $table->string('sectors');
            $table->string('jurisdiction')->default('South Africa');
            $table->string('permissions');
            $table->string('opinion_status')->default('active'); // active, under_review, conditional, expired, none
            $table->string('renewal')->nullable();
            $table->string('allows_sprints')->default('yes');    // yes, no, conditional
            $table->string('status')->default('active');         // active, archived
            $table->timestamps();
        });

        Schema::create('ins_misdeclarations', function (Blueprint $table) {
            $table->id();
            $table->string('case_id')->unique();
            $table->string('sku_code');
            $table->string('sprint_title');
            $table->string('client');
            $table->string('suspected_industry');
            $table->string('declared_industry');
            $table->string('priority')->default('medium'); // high, medium, low
            $table->string('status')->default('new');      // new, assigned, under_review, information_requested, pending_evidence, reclassified, dismissed
            $table->string('assigned_to')->nullable();
            $table->date('due_on')->nullable();
            $table->string('resolution')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_benchmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('industry_id')->nullable()->constrained('ins_industries')->nullOnDelete();
            $table->string('sector');
            $table->string('name');
            $table->string('type');
            $table->unsignedSmallInteger('min_n')->default(30);
            $table->unsignedSmallInteger('min_k')->default(10);
            $table->unsignedTinyInteger('min_diversity')->default(60);
            $table->unsignedSmallInteger('n_current')->default(0);
            $table->unsignedSmallInteger('k_current')->default(0);
            $table->unsignedTinyInteger('diversity_current')->default(0);
            $table->string('suppression_rule')->nullable();
            $table->boolean('suppressed')->default(false);
            $table->string('suppression_reason')->nullable();
            $table->boolean('under_review')->default(false);
            $table->date('last_review')->nullable();
            $table->date('next_review')->nullable();
            $table->json('bands')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_wa_flows', function (Blueprint $table) {
            $table->id();
            $table->string('area')->default('industries'); // industries, resources
            $table->string('code')->unique();
            $table->string('name');
            $table->string('intent');
            $table->string('industries')->default('All (17)');
            $table->string('stages')->nullable();
            $table->string('message_type');
            $table->string('status')->default('active'); // active, paused, inactive
            $table->string('language')->default('EN');
            $table->unsignedInteger('usage_30d')->default(0);
            $table->timestamps();
        });

        Schema::create('ins_wa_deliveries', function (Blueprint $table) {
            $table->id();
            $table->dateTime('sent_at');
            $table->string('contact');
            $table->string('phone');
            $table->string('campaign');
            $table->string('resource');
            $table->string('type');
            $table->string('status')->default('delivered');
            $table->boolean('engaged')->default(false);
            $table->boolean('converted')->default(false);
            $table->timestamps();
        });

        /* ------------------------------------------------------------------
         | Industries — client engagements (workspace)
         * ------------------------------------------------------------------ */
        Schema::create('ins_engagements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('industry_id')->nullable()->constrained('ins_industries')->nullOnDelete();
            $table->string('sub_industry')->nullable();
            $table->string('country')->default('South Africa');
            $table->string('title');
            $table->string('stage')->default('S0');
            $table->string('status')->default('active');
            $table->unsignedInteger('total_fee_zar')->default(0);
            $table->date('due_on')->nullable();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->string('letter_status')->default('draft'); // draft, sent_for_signature, signed
            $table->timestamp('letter_signed_at')->nullable();
            $table->string('route_status')->default('pending'); // pending, partner_selected, confirmed
            $table->json('data')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engagement_id')->constrained('ins_engagements')->cascadeOnDelete();
            $table->dateTime('occurred_at');
            $table->string('type'); // charge, payment, disbursement, refund, adjustment
            $table->string('description');
            $table->string('detail')->nullable();
            $table->unsignedInteger('amount_zar');
            $table->string('status');
            $table->string('method')->nullable();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('ins_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engagement_id')->constrained('ins_engagements')->cascadeOnDelete();
            $table->string('title');
            $table->string('detail')->nullable();
            $table->string('priority')->default('medium');
            $table->date('due_on')->nullable();
            $table->string('status')->default('open'); // open, in_progress, completed
            $table->timestamps();
        });

        Schema::create('ins_gates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engagement_id')->constrained('ins_engagements')->cascadeOnDelete();
            $table->string('code');   // G0..G8
            $table->string('name');
            $table->string('stage');
            $table->string('status')->default('locked'); // completed, pending, locked
            $table->timestamp('decided_at')->nullable();
            $table->string('decided_by')->nullable();
            $table->timestamps();
            $table->unique(['engagement_id', 'code']);
        });

        Schema::create('ins_evidence_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engagement_id')->constrained('ins_engagements')->cascadeOnDelete();
            $table->string('req_id')->unique();
            $table->string('title');
            $table->string('detail')->nullable();
            $table->string('source_type');
            $table->string('impact')->default('medium');
            $table->string('priority')->default('medium');
            $table->date('requested_on');
            $table->date('due_on');
            $table->string('status')->default('requested'); // requested, awaiting_review, resolved
            $table->json('submission')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_obligations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engagement_id')->constrained('ins_engagements')->cascadeOnDelete();
            $table->string('title');
            $table->string('authority')->nullable();
            $table->string('type')->default('filing'); // filing, renewal, reporting, payment
            $table->date('due_on');
            $table->string('status')->default('upcoming'); // upcoming, completed
            $table->boolean('recurring')->default(false);
            $table->boolean('custom')->default(false);
            $table->timestamps();
        });

        Schema::create('ins_reclass_notices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engagement_id')->constrained('ins_engagements')->cascadeOnDelete();
            $table->string('notice_id')->unique();
            $table->dateTime('issued_at');
            $table->date('effective_on');
            $table->json('previous');
            $table->json('next');
            $table->json('reasons')->nullable();
            $table->json('evidence')->nullable();
            $table->string('status')->default('action_required'); // action_required, acknowledged, clarification_requested
            $table->timestamp('acknowledged_at')->nullable();
            $table->text('clarification')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_benchmark_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('engagement_id')->nullable()->constrained('ins_engagements')->nullOnDelete();
            $table->foreignId('industry_id')->nullable()->constrained('ins_industries')->nullOnDelete();
            $table->string('choice'); // granted, declined, later
            $table->string('version')->default('BCT-1.0');
            $table->string('scope')->default('this_and_future');
            $table->timestamps();
        });

        Schema::create('ins_diagnostic_runs', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->foreignId('industry_id')->constrained('ins_industries')->cascadeOnDelete();
            $table->string('sub_industry')->nullable();
            $table->unsignedTinyInteger('step')->default(1);
            $table->json('answers')->nullable();
            $table->json('scores')->nullable();
            $table->string('status')->default('in_progress'); // in_progress, completed
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        /* ------------------------------------------------------------------
         | Resources — controlled content records
         * ------------------------------------------------------------------ */
        Schema::create('ins_resources', function (Blueprint $table) {
            $table->id();
            $table->string('record_id')->unique();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('type');                 // guide, template, toolkit, checklist, report, calculator, dashboard, scorecard, sop-pack, register, playbook, insight, commentary, viewpoint, article, case-study, reference, framework
            $table->string('collection')->default('library'); // library, insights, case-studies
            $table->string('category');             // strategy-planning, finance-funding ...
            $table->json('industries')->nullable();
            $table->json('countries')->nullable();
            $table->string('format')->default('PDF');
            $table->unsignedSmallInteger('minutes')->nullable();
            $table->unsignedSmallInteger('pages')->nullable();
            $table->string('file_size')->nullable();
            $table->string('summary', 500);
            $table->string('meta_description', 160)->nullable();
            $table->json('body')->nullable();
            $table->string('access')->default('free'); // free, gated, paid, subscription, restricted
            $table->unsignedInteger('price_zar')->nullable();
            $table->unsignedInteger('list_price_zar')->nullable(); // set when price is reduced
            $table->string('source')->default('TBCA Insights');
            $table->string('source_basis')->nullable();
            $table->unsignedSmallInteger('source_count')->default(0);
            $table->string('risk_class', 6)->default('RS-C1');   // RS-C1..RS-C3 (RS-C4 prohibited)
            $table->date('reviewed_at')->nullable();
            $table->date('next_review_at')->nullable();
            $table->boolean('restricted')->default(false);
            $table->string('human_review')->default('completed'); // completed, pending, not_required
            $table->boolean('ai_assisted')->default(false);
            $table->string('publish_state')->default('draft');   // draft, internal_review, legal_review, published, archived, retired
            $table->timestamp('published_at')->nullable();
            $table->date('retired_at')->nullable();
            $table->string('retired_reason')->nullable();
            $table->foreignId('replacement_id')->nullable()->constrained('ins_resources')->nullOnDelete();
            $table->string('version')->default('1.0');
            $table->string('owner')->nullable();
            $table->string('editor')->nullable();
            $table->string('reviewer')->nullable();
            $table->string('language')->default('English');
            $table->string('content_level')->default('L2 - Public');
            $table->string('boundary_rule')->nullable();
            $table->string('boundary_note', 500)->nullable();
            $table->boolean('protected')->default(false);
            $table->string('linked_product')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('editors_pick')->default(false);
            $table->boolean('popular')->default(false);
            $table->unsignedInteger('download_count')->default(0);
            $table->unsignedInteger('view_count')->default(0);
            $table->json('metrics')->nullable();   // seeded attribution data
            $table->json('meta')->nullable();      // case study, insight extras
            $table->timestamps();
            $table->index(['publish_state', 'collection']);
        });

        Schema::create('ins_resource_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('ins_resources')->cascadeOnDelete();
            $table->string('name');
            $table->string('type');
            $table->string('version')->default('1.0');
            $table->string('access')->default('free');
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('ins_entitlements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable()->index();
            $table->string('first_name')->nullable();
            $table->foreignId('resource_id')->constrained('ins_resources')->cascadeOnDelete();
            $table->string('source'); // free_download, gated, one_time, subscription, retainer
            $table->string('state')->default('active'); // active, pending_payment, expired, revoked
            $table->string('content_version')->nullable();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->json('data_exchange')->nullable();
            $table->timestamp('acquired_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_downloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('ins_resources')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('entitlement_id')->nullable()->constrained('ins_entitlements')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('ins_webinars', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('tagline');
            $table->string('summary', 400);
            $table->string('speaker');
            $table->string('speaker_role')->nullable();
            $table->string('topic');
            $table->string('audience')->default('All Audiences');
            $table->dateTime('starts_at');
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->boolean('cpd')->default(false);
            $table->string('icon')->default('chart');
            $table->json('gains')->nullable();
            $table->string('replay_version')->default('On-Demand v1.0');
            $table->date('review_due')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_webinar_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('webinar_id')->constrained('ins_webinars')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('job_title');
            $table->string('company');
            $table->string('country');
            $table->string('phone')->nullable();
            $table->boolean('opt_resources')->default(false);
            $table->boolean('opt_offers')->default(false);
            $table->string('access_token', 64)->nullable();
            $table->timestamps();
            $table->unique(['webinar_id', 'email']);
        });

        Schema::create('ins_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject_ref')->nullable(); // U-0001247
            $table->string('name')->nullable();
            $table->string('email')->index();
            $table->string('phone')->nullable();
            $table->string('purpose');     // essential, newsletters, webinars, offers, partners, surveys, whatsapp, data_bank, analytics, personalisation, data_sharing
            $table->string('state');       // granted, declined, withdrawn, expired, pending
            $table->string('legal_basis')->default('consent');
            $table->string('channel')->default('web');
            $table->string('version')->default('PV-Current');
            $table->timestamp('granted_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_privacy_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // withdraw, erase
            $table->string('name');
            $table->string('email');
            $table->json('purposes')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('submitted'); // submitted, verifying, processing, completed
            $table->json('disposition')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('plan')->default('premium-resources');
            $table->string('status')->default('active'); // active, paused, cancelled, awaiting_payment
            $table->string('billing_cycle')->default('monthly');
            $table->unsignedInteger('amount_zar');
            $table->date('started_at');
            $table->date('next_billing_at')->nullable();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->json('usage')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_handoffs', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('trigger_type');
            $table->foreignId('resource_id')->nullable()->constrained('ins_resources')->nullOnDelete();
            $table->json('usage')->nullable();
            $table->string('service_category');
            $table->string('recommended_service');
            $table->string('priority')->default('medium');
            $table->string('status')->default('ready_to_book'); // ready_to_book, booked, closed
            $table->string('booking_reference')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_free_diagnostics', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->json('answers');
            $table->json('result');
            $table->timestamps();
        });

        Schema::create('ins_ai_outputs', function (Blueprint $table) {
            $table->id();
            $table->string('output_id')->unique();
            $table->string('title');
            $table->string('subject')->nullable();
            $table->string('content_type');
            $table->string('model');
            $table->string('prompt', 400);
            $table->string('created_by');
            $table->string('channel')->default('Platform');
            $table->string('status')->default('under_review'); // approved, under_review, rejected
            $table->string('risk')->default('low');            // low, medium, high, critical
            $table->string('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ins_faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->string('topic');
            $table->boolean('geo')->default(false);
            $table->json('steps')->nullable();
            $table->json('related')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('ins_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('subject_type');
            $table->unsignedBigInteger('subject_id');
            $table->string('actor')->nullable();
            $table->string('action');
            $table->string('from_state')->nullable();
            $table->string('to_state')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        foreach ([
            'ins_audit_logs', 'ins_faqs', 'ins_ai_outputs', 'ins_free_diagnostics', 'ins_handoffs', 'ins_subscriptions',
            'ins_privacy_requests', 'ins_consents', 'ins_webinar_registrations', 'ins_webinars', 'ins_downloads',
            'ins_entitlements', 'ins_resource_assets', 'ins_resources', 'ins_diagnostic_runs', 'ins_benchmark_consents',
            'ins_reclass_notices', 'ins_obligations', 'ins_evidence_requests', 'ins_gates', 'ins_tasks',
            'ins_ledger_entries', 'ins_engagements', 'ins_wa_deliveries', 'ins_wa_flows', 'ins_benchmarks',
            'ins_misdeclarations', 'ins_regulators', 'ins_skus', 'ins_taxonomy_changes', 'ins_sub_industries', 'ins_industries',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
