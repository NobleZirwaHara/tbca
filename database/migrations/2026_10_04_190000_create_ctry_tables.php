<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Countries Transaction Ecosystem (CT-TEB v2.0) — country objects, resolver
 * domains, services, registers, corridors, fee ledgers, demand capture,
 * market-entry plans, engagements, sovereign engagements and governance.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ctry_countries', function (Blueprint $t) {
            $t->id();
            $t->string('iso2', 2)->unique();
            $t->string('iso3', 3);
            $t->string('slug')->unique();
            $t->string('name');
            $t->string('region');
            $t->string('currency', 3)->nullable();
            $t->string('income_group')->nullable();
            $t->string('programme_status');
            $t->string('availability_state')->index();
            $t->string('gate_status');
            $t->string('evidence_currentness')->default('partial');
            $t->string('evidence_confidence')->default('low');
            $t->unsignedInteger('confidence_pct')->default(0);
            $t->date('last_reviewed_at')->nullable();
            $t->date('next_review_at')->nullable();
            $t->date('activation_date')->nullable();
            $t->date('profile_valid_to')->nullable();
            $t->string('resolver_version')->nullable();
            $t->string('release_certificate_ref')->nullable();
            $t->string('protective_reason')->nullable();
            $t->string('updated_by')->default('TBCA System');
            $t->json('metrics')->nullable();
            $t->timestamps();
        });

        Schema::create('ctry_resolver_domains', function (Blueprint $t) {
            $t->id();
            $t->foreignId('country_id')->constrained('ctry_countries')->cascadeOnDelete();
            $t->string('key');
            $t->string('label');
            $t->string('description');
            $t->string('hard_block_class')->nullable();
            $t->unsignedInteger('required_fields');
            $t->unsignedInteger('completed_fields');
            $t->string('evidence_status')->default('current');
            $t->date('last_verified_at')->nullable();
            $t->json('missing')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->unique(['country_id', 'key']);
        });

        Schema::create('ctry_services', function (Blueprint $t) {
            $t->id();
            $t->foreignId('country_id')->constrained('ctry_countries')->cascadeOnDelete();
            $t->string('code')->unique();
            $t->string('category');
            $t->string('name');
            $t->string('summary');
            $t->string('availability_state');
            $t->string('access');
            $t->string('access_type')->default('Service-by-service');
            $t->string('commercial_model')->default('Commercial');
            $t->boolean('price_permit')->default(false);
            $t->unsignedInteger('price_zar')->nullable();
            $t->string('sprint_slug')->nullable();
            $t->string('timeline')->nullable();
            $t->string('delivery_model')->default('Managed Service');
            $t->json('details')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('ctry_register_entries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('country_id')->constrained('ctry_countries')->cascadeOnDelete();
            $t->string('register')->index();
            $t->string('code');
            $t->string('title');
            $t->string('category')->nullable();
            $t->string('type')->nullable();
            $t->string('status')->nullable();
            $t->string('impact')->nullable();
            $t->date('recorded_on')->nullable();
            $t->json('data')->nullable();
            $t->unsignedInteger('sort')->default(0);
            $t->timestamps();
            $t->unique(['country_id', 'register', 'code']);
        });

        Schema::create('ctry_state_transitions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('country_id')->constrained('ctry_countries')->cascadeOnDelete();
            $t->string('from_state');
            $t->string('to_state');
            $t->string('authority_level');
            $t->string('reason');
            $t->string('certificate_ref')->nullable();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('ctry_interests', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->foreignId('country_id')->constrained('ctry_countries')->cascadeOnDelete();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('episode_key')->unique();
            $t->string('service_category');
            $t->string('service_code')->nullable();
            $t->string('name');
            $t->string('email');
            $t->string('organisation')->nullable();
            $t->string('sector')->nullable();
            $t->string('province')->nullable();
            $t->string('interest_level')->default('medium');
            $t->string('origin_surface')->default('countries');
            $t->string('language', 5)->default('en');
            $t->string('status')->default('registered');
            $t->text('notes')->nullable();
            $t->timestamps();
        });

        Schema::create('ctry_corridors', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('from_iso', 2);
            $t->string('from_name');
            $t->string('to_iso', 2);
            $t->string('to_name');
            $t->string('to_endpoint_state')->nullable();
            $t->string('type');
            $t->string('purpose')->default('Market Entry');
            $t->string('group_name')->nullable();
            $t->string('path_type')->default('Bilateral');
            $t->string('evidence_status');
            $t->unsignedInteger('evidence_items')->default(0);
            $t->unsignedInteger('confidence_pct')->default(0);
            $t->unsignedBigInteger('cost_min_zar')->default(0);
            $t->unsignedBigInteger('cost_max_zar')->default(0);
            $t->string('time_to_activate')->nullable();
            $t->string('risk')->default('Medium');
            $t->unsignedInteger('pair_rcs')->default(0);
            $t->boolean('pair_certified')->default(false);
            $t->boolean('featured')->default(false);
            $t->json('details')->nullable();
            $t->timestamps();
        });

        Schema::create('ctry_fee_lines', function (Blueprint $t) {
            $t->id();
            $t->foreignId('corridor_id')->constrained('ctry_corridors')->cascadeOnDelete();
            $t->string('ledger', 4);
            $t->unsignedInteger('line_no');
            $t->string('name');
            $t->string('description');
            $t->string('payer')->default('Client');
            $t->string('payable_to')->nullable();
            $t->string('jurisdiction')->nullable();
            $t->string('basis');
            $t->unsignedInteger('quantity')->default(1);
            $t->decimal('unit_amount', 14, 2)->nullable();
            $t->decimal('amount', 14, 2)->nullable();
            $t->string('currency', 3)->default('ZAR');
            $t->decimal('fx_to_zar', 10, 4)->default(1);
            $t->string('when_payable')->nullable();
            $t->string('evidence_ref')->nullable();
            $t->string('certainty')->default('resolved');
            $t->string('resolver_ref')->nullable();
            $t->string('status')->default('Current');
            $t->unique(['corridor_id', 'ledger', 'line_no']);
        });

        Schema::create('ctry_plans', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('country_id')->constrained('ctry_countries')->cascadeOnDelete();
            $t->string('kind');
            $t->date('target_date')->nullable();
            $t->timestamps();
            $t->unique(['user_id', 'country_id', 'kind']);
        });

        Schema::create('ctry_plan_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('plan_id')->constrained('ctry_plans')->cascadeOnDelete();
            $t->string('code');
            $t->string('title');
            $t->string('category');
            $t->string('owner')->nullable();
            $t->date('due_date')->nullable();
            $t->string('priority')->default('Medium');
            $t->string('status')->default('not_started');
            $t->boolean('critical')->default(false);
            $t->unsignedInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('ctry_engagements', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->foreignId('country_id')->constrained('ctry_countries')->cascadeOnDelete();
            $t->string('status')->index();
            $t->string('request_type');
            $t->string('service_category');
            $t->string('service_code')->nullable();
            $t->string('title')->nullable();
            $t->text('summary');
            $t->text('scope')->nullable();
            $t->string('sector')->nullable();
            $t->string('region')->nullable();
            $t->date('desired_start')->nullable();
            $t->string('budget_range')->nullable();
            $t->json('contact');
            $t->json('letter')->nullable();
            $t->string('order_reference')->nullable();
            $t->timestamp('letter_accepted_at')->nullable();
            $t->timestamp('activated_at')->nullable();
            $t->timestamp('closed_at')->nullable();
            $t->json('workspace')->nullable();
            $t->json('closure')->nullable();
            $t->timestamps();
        });

        Schema::create('ctry_change_requests', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->foreignId('engagement_id')->constrained('ctry_engagements')->cascadeOnDelete();
            $t->string('change_type');
            $t->text('reason');
            $t->date('desired_date')->nullable();
            $t->string('requested_by');
            $t->string('impact')->default('Medium');
            $t->json('assessment')->nullable();
            $t->string('status');
            $t->boolean('reresolution_required')->default(false);
            $t->timestamps();
        });

        Schema::create('ctry_sovereign_engagements', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->foreignId('country_id')->constrained('ctry_countries')->cascadeOnDelete();
            $t->unsignedTinyInteger('stage')->default(1);
            $t->string('status')->index();
            $t->json('intake');
            $t->json('declarations')->nullable();
            $t->timestamp('disclosure_submitted_at')->nullable();
            $t->string('conflict_outcome')->nullable();
            $t->timestamp('independence_confirmed_at')->nullable();
            $t->timestamp('evidence_approved_at')->nullable();
            $t->json('deliverables')->nullable();
            $t->json('closure')->nullable();
            $t->timestamp('closed_at')->nullable();
            $t->timestamps();
        });

        Schema::create('ctry_observations', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('origin_surface');
            $t->string('subject_area');
            $t->string('observation_class');
            $t->string('metric');
            $t->string('candidate_type')->default('Evidence Candidate');
            $t->timestamp('captured_at');
            $t->unsignedInteger('rcs_link')->default(0);
            $t->decimal('quality_score', 4, 2)->default(0);
            $t->decimal('anonymity_score', 4, 2)->nullable();
            $t->boolean('rights_pass')->default(true);
            $t->boolean('provenance_complete')->default(true);
            $t->string('status')->index();
            $t->string('risk')->default('Medium');
            $t->string('decision_note')->nullable();
            $t->timestamps();
        });

        Schema::create('ctry_retractions', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('evidence_ref');
            $t->string('evidence_title');
            $t->string('evidence_type');
            $t->string('origin_surface');
            $t->string('subject_area');
            $t->string('requested_by');
            $t->text('reason')->nullable();
            $t->string('status')->index();
            $t->string('impact');
            $t->unsignedInteger('objects_impacted')->default(0);
            $t->unsignedInteger('products_impacted')->default(0);
            $t->unsignedInteger('outputs_impacted')->default(0);
            $t->unsignedInteger('clients_notified')->default(0);
            $t->timestamps();
        });

        Schema::create('ctry_releases', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('name');
            $t->string('environment');
            $t->unsignedInteger('countries')->default(54);
            $t->unsignedInteger('scope_objects')->default(0);
            $t->string('status')->index();
            $t->unsignedInteger('readiness')->default(0);
            $t->date('target_date')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->json('authorisations')->nullable();
            $t->json('defects')->nullable();
            $t->boolean('rollback_proven')->default(false);
            $t->timestamps();
        });

        Schema::create('ctry_agent_queries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('agent');
            $t->text('question');
            $t->json('answer');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'ctry_agent_queries', 'ctry_releases', 'ctry_retractions', 'ctry_observations',
            'ctry_sovereign_engagements', 'ctry_change_requests', 'ctry_engagements',
            'ctry_plan_items', 'ctry_plans', 'ctry_fee_lines', 'ctry_corridors', 'ctry_interests',
            'ctry_state_transitions', 'ctry_register_entries', 'ctry_services',
            'ctry_resolver_domains', 'ctry_countries',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
