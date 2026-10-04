<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Advisory section: Services catalogue & vehicles, Project Advisory mandates,
 * Technology Solutions engagements and their governance consoles.
 */
return new class extends Migration
{
    public function up(): void
    {
        /* ---------------- Services ---------------- */
        Schema::create('adv_services', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('letter', 1)->index();
            $t->string('sub_category');
            $t->string('title');
            $t->text('summary');
            $t->unsignedInteger('price_zar');
            $t->string('duration');
            $t->string('delivery');
            $t->unsignedInteger('popularity')->default(0);
            $t->json('meta')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_recommendations', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('source'); // resolver | not-sure | honest-decline
            $t->string('outcome'); // recommend | decline | escalate
            $t->json('answers');
            $t->json('result');
            $t->timestamps();
        });

        Schema::create('adv_proposals', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('status')->default('draft'); // draft | submitted | in_review | proposal_sent | closed
            $t->string('kind')->default('proposal'); // proposal | partner-escalation | enterprise
            $t->string('name')->nullable();
            $t->string('email')->nullable();
            $t->string('company')->nullable();
            $t->json('payload');
            $t->timestamps();
        });

        Schema::create('adv_vehicles', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique(); // VEH-2025-0001
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('name');
            $t->string('client');
            $t->string('type'); // Mandate | Sprint | Subscription | Product | Retainer
            $t->string('engagement_ref');
            $t->string('status')->default('active'); // active | on_hold | completed | archived
            $t->date('start_date')->nullable();
            $t->string('next_milestone')->nullable();
            $t->date('next_due_date')->nullable();
            $t->string('owner')->nullable();
            $t->unsignedTinyInteger('health')->nullable();
            $t->date('last_activity')->nullable();
            $t->string('billing_cycle')->nullable();
            $t->integer('invoiced_zar')->default(0);
            $t->integer('paid_zar')->default(0);
            $t->integer('overdue_zar')->default(0);
            $t->integer('current_price_zar')->default(0);
            $t->integer('floor_price_zar')->default(0);
            $t->integer('revenue_zar')->default(0);
            $t->integer('direct_cost_zar')->default(0);
            $t->unsignedTinyInteger('utilisation')->default(0);
            $t->string('remediation_action')->nullable();
            $t->string('remediation_status')->nullable();
            $t->date('remediation_due')->nullable();
            $t->json('fees')->nullable();
            $t->json('meta')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_vehicle_changes', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('vehicle_id')->nullable()->constrained('adv_vehicles')->nullOnDelete();
            $t->string('type'); // transition | upgrade | recurrence | downgrade | switch | exit
            $t->string('status')->default('requested'); // requested | approved | awaiting_payment | completed | declined
            $t->string('from_vehicle')->nullable();
            $t->string('to_vehicle')->nullable();
            $t->integer('new_value_zar')->default(0);
            $t->integer('credit_zar')->default(0);
            $t->integer('payable_now_zar')->default(0);
            $t->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $t->json('payload')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_dispositions', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('description');
            $t->string('vehicle_code');
            $t->string('client');
            $t->string('type');
            $t->string('disposition'); // authorised | awaiting_client_input | blocked | completed | cancelled
            $t->string('status');
            $t->string('owner');
            $t->integer('value_zar')->nullable();
            $t->date('start_date')->nullable();
            $t->date('target_date')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_crosswalks', function (Blueprint $t) {
            $t->id();
            $t->string('source_taxonomy');
            $t->string('source_code');
            $t->string('source_label');
            $t->string('target_taxonomy');
            $t->string('target_code');
            $t->string('target_label');
            $t->string('relationship');
            $t->unsignedTinyInteger('confidence');
            $t->string('status')->default('validated'); // validated | under_review | needs_attention
            $t->date('last_verified')->nullable();
            $t->timestamps();
            $t->unique(['source_taxonomy', 'source_code', 'target_taxonomy']);
        });

        Schema::create('adv_spine_checks', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('engagement');
            $t->string('client');
            $t->string('rule');
            $t->unsignedTinyInteger('rule_category');
            $t->string('breach_type');
            $t->string('severity'); // critical | high | medium | low
            $t->date('detected_on');
            $t->string('owner');
            $t->string('status')->default('open'); // open | in_progress | resolved
            $t->string('action_required');
            $t->date('due_date')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_bias_alerts', function (Blueprint $t) {
            $t->id();
            $t->string('engagement')->unique();
            $t->string('client');
            $t->string('vehicle_ref');
            $t->string('category');
            $t->string('recommended');
            $t->string('alternative');
            $t->decimal('score', 4, 2);
            $t->string('reason');
            $t->string('owner');
            $t->date('flagged_on');
            $t->string('status')->default('open'); // open | under_review | resolved
            $t->timestamps();
        });

        /* ---------------- Project Advisory ---------------- */
        Schema::create('adv_mandates', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique(); // PA-2026-0319
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('project_name');
            $t->string('organisation');
            $t->string('contact')->nullable();
            $t->string('email')->nullable();
            $t->string('country')->default('South Africa');
            $t->string('sector');
            $t->string('sponsor_type')->nullable();
            $t->string('project_stage');
            $t->string('size_band')->nullable();
            $t->string('engagement_route')->default('fixed-scope');
            $t->string('entry_route')->default('intake'); // intake (P01 free) | discovery (P03 paid)
            $t->string('status')->default('enquiry'); // enquiry | qualified | discovery | method_card | letter | active | paused | stopped | declined | completed
            $t->unsignedTinyInteger('stage')->default(0); // A0..A17
            $t->string('current_gate')->nullable();
            $t->string('service_code')->nullable();
            $t->string('lead_adviser')->nullable();
            $t->string('senior_reviewer')->nullable();
            $t->timestamp('nda_signed_at')->nullable();
            $t->string('nda_signer')->nullable();
            $t->timestamp('method_card_approved_at')->nullable();
            $t->timestamp('letter_signed_at')->nullable();
            $t->timestamp('mandate_signed_at')->nullable();
            $t->string('signer_name')->nullable();
            $t->foreignId('deposit_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $t->json('qualification')->nullable();
            $t->json('context')->nullable();
            $t->json('readiness')->nullable();
            $t->json('meta')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_mandate_gates', function (Blueprint $t) {
            $t->id();
            $t->foreignId('mandate_id')->constrained('adv_mandates')->cascadeOnDelete();
            $t->string('code'); // G0..G10
            $t->string('name');
            $t->string('binds')->nullable();
            $t->string('status')->default('locked'); // locked | pending | approved | declined | change_requested | stale
            $t->integer('amount_zar')->default(0);
            $t->json('checks')->nullable();
            $t->string('fingerprint')->nullable();
            $t->timestamp('expires_at')->nullable();
            $t->timestamp('decided_at')->nullable();
            $t->string('decided_by')->nullable();
            $t->text('note')->nullable();
            $t->timestamps();
            $t->unique(['mandate_id', 'code']);
        });

        Schema::create('adv_mandate_lines', function (Blueprint $t) {
            $t->id();
            $t->foreignId('mandate_id')->constrained('adv_mandates')->cascadeOnDelete();
            $t->string('ledger', 1); // T P X S C
            $t->string('code')->nullable();
            $t->string('item');
            $t->string('recipient');
            $t->string('basis');
            $t->string('certainty'); // fixed | estimated | metered | quote_on_trigger | contingent | as_incurred
            $t->string('status')->default('disclosed'); // disclosed | approved | invoiced | paid | direct_paid | not_triggered | none_incurred
            $t->integer('low_zar')->default(0);
            $t->integer('expected_zar')->default(0);
            $t->integer('high_zar')->default(0);
            $t->integer('paid_zar')->default(0);
            $t->integer('earned_zar')->default(0);
            $t->integer('creditable_zar')->default(0);
            $t->string('invoice_ref')->nullable();
            $t->date('due_date')->nullable();
            $t->string('gate_code')->nullable();
            $t->string('payment_route')->nullable();
            $t->string('evidence')->nullable();
            $t->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('adv_mandate_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('mandate_id')->constrained('adv_mandates')->cascadeOnDelete();
            $t->string('actor');
            $t->string('event');
            $t->string('ref')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_stop_rules', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique(); // SN-01
            $t->string('rule');
            $t->string('condition');
            $t->string('risk');
            $t->string('owner');
            $t->boolean('enabled')->default(true);
            $t->timestamps();
        });

        Schema::create('adv_evidence_items', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->string('subtitle');
            $t->string('type');
            $t->string('source');
            $t->string('source_kind');
            $t->string('country');
            $t->string('industry');
            $t->date('verified_on');
            $t->string('quality'); // high | medium | low | unverified
            $t->boolean('verified')->default(true);
            $t->timestamps();
        });

        /* ---------------- Technology Solutions ---------------- */
        Schema::create('adv_tech_engagements', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique(); // ENG-TS-1042
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('tower');
            $t->string('organisation');
            $t->string('owner')->nullable();
            $t->string('status')->default('disclosed'); // commercial state machine
            $t->unsignedTinyInteger('stage')->default(6); // 1..10 progress tracker
            $t->unsignedTinyInteger('current_gate')->default(1);
            $t->string('health')->default('on_track');
            $t->timestamp('letter_signed_at')->nullable();
            $t->string('signer_name')->nullable();
            $t->string('payment_plan')->default('deposit_milestones');
            $t->json('context')->nullable();
            $t->json('diagnostic')->nullable();
            $t->json('config')->nullable();
            $t->json('fee_lines')->nullable();
            $t->json('meters')->nullable();
            $t->json('uat')->nullable();
            $t->json('subscription')->nullable();
            $t->json('exit_plan')->nullable();
            $t->json('transactions')->nullable();
            $t->json('timeline')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_tech_gates', function (Blueprint $t) {
            $t->id();
            $t->foreignId('engagement_id')->constrained('adv_tech_engagements')->cascadeOnDelete();
            $t->unsignedTinyInteger('number');
            $t->string('name');
            $t->string('assent');
            $t->string('status')->default('locked'); // locked | presented | approved | declined | review_requested
            $t->integer('t_amount_zar')->default(0);
            $t->integer('x_low_zar')->default(0);
            $t->integer('x_high_zar')->default(0);
            $t->boolean('x_funded')->default(false);
            $t->string('fingerprint')->nullable();
            $t->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $t->timestamp('decided_at')->nullable();
            $t->timestamp('expires_at')->nullable();
            $t->timestamps();
            $t->unique(['engagement_id', 'number']);
        });

        Schema::create('adv_tech_tasks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('engagement_id')->constrained('adv_tech_engagements')->cascadeOnDelete();
            $t->string('group'); // client | tbca | dependency
            $t->string('title');
            $t->string('owner');
            $t->date('due_date');
            $t->string('status');
            $t->string('dependency')->nullable();
            $t->string('evidence')->nullable();
            $t->string('priority');
            $t->timestamps();
        });

        Schema::create('adv_tech_documents', function (Blueprint $t) {
            $t->id();
            $t->foreignId('engagement_id')->constrained('adv_tech_engagements')->cascadeOnDelete();
            $t->string('name');
            $t->string('type');
            $t->string('category');
            $t->string('linked_to');
            $t->string('uploaded_by');
            $t->timestamp('uploaded_at');
            $t->string('status');
            $t->string('visibility');
            $t->string('version')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_tech_tickets', function (Blueprint $t) {
            $t->id();
            $t->foreignId('engagement_id')->nullable()->constrained('adv_tech_engagements')->cascadeOnDelete();
            $t->string('reference')->unique();
            $t->string('kind'); // ticket | dispute
            $t->string('subject');
            $t->string('category')->nullable();
            $t->string('priority')->nullable();
            $t->string('status');
            $t->string('related_to')->nullable();
            $t->integer('amount_zar')->nullable();
            $t->string('assigned_to')->nullable();
            $t->text('details')->nullable();
            $t->timestamps();
        });

        Schema::create('adv_fee_rules', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('name');
            $t->string('tower');
            $t->string('applies_to');
            $t->string('rule_type');
            $t->string('status'); // active | draft | archived
            $t->string('priority');
            $t->string('health')->default('healthy'); // healthy | warning | error
            $t->decimal('value', 12, 2)->nullable();
            $t->string('updated_by');
            $t->timestamps();
        });

        Schema::create('adv_suppliers', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('name');
            $t->string('category');
            $t->string('services');
            $t->string('status'); // active | on_hold | inactive
            $t->date('contract_end')->nullable();
            $t->string('rate_card');
            $t->integer('last_cost_zar')->default(0);
            $t->integer('rate_card_max_zar')->default(0);
            $t->decimal('rating', 2, 1)->default(4);
            $t->timestamps();
        });

        Schema::create('adv_exceptions', function (Blueprint $t) {
            $t->id();
            $t->string('code')->unique();
            $t->string('area');
            $t->string('type');
            $t->string('subject');
            $t->string('priority');
            $t->string('status'); // new | in_review | pending_info | escalated | resolved
            $t->string('raised_by');
            $t->string('assigned_to');
            $t->timestamp('raised_at');
            $t->date('sla_due');
            $t->timestamps();
        });

        Schema::create('adv_settings', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();
            $t->string('label');
            $t->string('value');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'adv_settings', 'adv_exceptions', 'adv_suppliers', 'adv_fee_rules', 'adv_tech_tickets',
            'adv_tech_documents', 'adv_tech_tasks', 'adv_tech_gates', 'adv_tech_engagements',
            'adv_evidence_items', 'adv_stop_rules', 'adv_mandate_events', 'adv_mandate_lines',
            'adv_mandate_gates', 'adv_mandates', 'adv_bias_alerts', 'adv_spine_checks', 'adv_crosswalks',
            'adv_dispositions', 'adv_vehicle_changes', 'adv_vehicles', 'adv_proposals',
            'adv_recommendations', 'adv_services',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
