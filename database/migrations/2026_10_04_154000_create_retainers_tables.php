<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Retainers transaction ecosystem (prd_ret_*).
 *
 * Services carry the C1-C5 commercial object; proposals move through the
 * Track A gates; retainers (contracts) own service periods, an evidence-backed
 * usage ledger, disputes, overage authorisations, scope changes, substitutions,
 * capacity commitments, allocations, under-use alerts, rollover records and an
 * append-only event log.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prd_ret_capacity_pools', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('skill');
            $table->string('seniority');
            $table->decimal('productive_units', 8, 2)->default(0);   // approved productive hours / month
            $table->decimal('cross_vehicle_units', 8, 2)->default(0);
            $table->decimal('protective_reserve', 8, 2)->default(0);
            $table->decimal('review_reserve', 8, 2)->default(0);
            $table->timestamp('data_effective_at')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_services', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('category');               // executive-advisory, procurement ...
            $table->string('desk')->nullable();        // landing desk key when shown as a desk card
            $table->string('icon')->nullable();
            $table->string('summary', 500);
            $table->text('description')->nullable();
            $table->unsignedInteger('price_zar');      // monthly fee, excl. VAT ("From")
            $table->unsignedInteger('price_usd')->nullable();
            $table->unsignedInteger('floor_zar');      // approved period floor
            $table->decimal('allowance_qty', 8, 2);
            $table->string('allowance_unit')->default('HOUR');
            $table->string('period')->default('monthly');
            $table->string('unit_definition')->nullable();
            $table->string('owner_model')->default('NAMED_PERSON');
            $table->json('owner')->nullable();         // {name, role, title, seniority}
            $table->string('sla_class')->default('Standard');
            $table->string('response_window')->default('1 Business Day');
            $table->json('inclusions')->nullable();
            $table->json('exclusions')->nullable();    // EX-RE codes
            $table->json('checklist')->nullable();     // landing card bullet points
            $table->string('unused_rule')->default('CAPPED_ROLL_FORWARD');
            $table->unsignedTinyInteger('rollover_cap_pct')->default(25);
            $table->string('overage_rule')->default('PREAPPROVED_RATE');
            $table->unsignedInteger('overage_rate_zar')->default(0);
            $table->unsignedTinyInteger('min_term_months')->default(6);
            $table->unsignedSmallInteger('notice_days')->default(30);
            $table->string('certification')->default('draft');  // draft, certified, rejected
            $table->json('certification_notes')->nullable();
            $table->foreignId('pool_id')->nullable()->constrained('prd_ret_capacity_pools')->nullOnDelete();
            $table->unsignedInteger('popularity')->default(0);
            $table->boolean('custom_pricing')->default(false);
            $table->timestamps();
            $table->index(['category', 'certification']);
        });

        Schema::create('prd_ret_proposals', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_id')->constrained('prd_ret_services')->cascadeOnDelete();
            $table->string('status')->default('requested'); // requested, hold, issued, accepted, signed, declined, expired, withdrawn
            $table->string('hold_reason')->nullable();
            $table->json('request');
            $table->string('organisation');
            $table->decimal('allowance_qty', 8, 2);
            $table->unsignedInteger('monthly_fee_zar');
            $table->unsignedInteger('overage_rate_zar');
            $table->unsignedTinyInteger('rollover_cap_pct');
            $table->string('service_level')->default('Standard');
            $table->string('owner_model')->default('NAMED_PERSON');
            $table->date('start_date')->nullable();
            $table->date('valid_until')->nullable();
            $table->unsignedSmallInteger('version')->default(1);
            $table->string('hash', 64)->nullable();
            $table->string('exclusions_version')->nullable();
            $table->string('disclosure_version')->nullable();
            $table->decimal('reserved_units', 8, 2)->default(0);
            $table->timestamp('reservation_expires_at')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_retainers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();               // RET-2026-0001
            $table->string('agreement_ref')->nullable()->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_id')->constrained('prd_ret_services')->cascadeOnDelete();
            $table->foreignId('proposal_id')->nullable()->constrained('prd_ret_proposals')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('name');
            $table->string('client_name');
            $table->string('retainer_type')->default('Monthly Retainer');
            $table->string('business_unit')->default('Advisory Services');
            $table->string('status')->default('pending_activation'); // pending_activation, active, paused, cancelling, ended
            $table->decimal('allowance_qty', 8, 2);
            $table->unsignedInteger('monthly_fee_zar');
            $table->unsignedInteger('overage_rate_zar');
            $table->unsignedTinyInteger('rollover_cap_pct')->default(25);
            $table->string('service_level')->default('1 Business Day response');
            $table->string('owner_model')->default('NAMED_PERSON');
            $table->boolean('named_person_material')->default(true);
            $table->json('adviser')->nullable();             // {name, title, since, qualifications}
            $table->json('account_owner')->nullable();       // {name, role, email, phone, since, delegation{}}
            $table->unsignedTinyInteger('min_term_months')->default(6);
            $table->unsignedSmallInteger('notice_days')->default(30);
            $table->date('start_date')->nullable();
            $table->date('term_end')->nullable();
            $table->json('signatory')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->json('renewal')->nullable();             // {choice, allowance, fee, effective, decided_at}
            $table->date('cancel_effective')->nullable();
            $table->json('cancellation')->nullable();
            $table->json('sizing')->nullable();
            $table->text('allocation_notes')->nullable();
            $table->unsignedInteger('period_revenue_zar')->default(0);
            $table->unsignedInteger('period_cost_zar')->default(0);
            $table->unsignedSmallInteger('active_count')->default(1); // retainers held by this client (profitability roll-up)
            $table->string('floor_disposition')->nullable(); // RE-D1..D4 after remediation
            $table->boolean('commercial_review')->default(false);
            $table->timestamps();
            $table->index(['status']);
        });

        Schema::create('prd_ret_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->date('starts_on');
            $table->date('ends_on');
            $table->decimal('opening_units', 8, 2);
            $table->decimal('carry_units', 8, 2)->default(0);   // valid carry in (first generation only)
            $table->decimal('credit_units', 8, 2)->default(0);
            $table->string('status')->default('open');          // open, closed
            $table->boolean('utilisation_evaluated')->default(false);
            $table->decimal('carry_out_units', 8, 2)->default(0);
            $table->timestamp('statement_ack_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_usage', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->foreignId('period_id')->constrained('prd_ret_periods')->cascadeOnDelete();
            $table->dateTime('occurred_at');
            $table->string('activity');
            $table->string('description')->nullable();
            $table->string('category')->default('Strategic Advisory');
            $table->string('adviser');
            $table->decimal('units', 6, 2);
            $table->string('billing_effect')->default('INCLUDED'); // INCLUDED, OVERAGE_APPROVED, NO_CHARGE, CREDIT
            $table->string('status')->default('confirmed');        // pending, confirmed, disputed, corrected, credited
            $table->string('evidence_class')->default('E2');
            $table->decimal('original_units', 6, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_disputes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('usage_id')->constrained('prd_ret_usage')->cascadeOnDelete();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->string('reason');
            $table->text('explanation');
            $table->string('outcome');                 // remove, adjust, other
            $table->decimal('proposed_units', 6, 2)->nullable();
            $table->string('status')->default('under_review'); // under_review, upheld, rejected
            $table->text('decision_note')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_overages', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->string('scope');
            $table->json('lines');                     // [{date, description, role, hours}]
            $table->decimal('units', 6, 2);
            $table->unsignedInteger('rate_zar');
            $table->unsignedInteger('max_charge_zar'); // incl. VAT
            $table->string('status')->default('requested'); // requested, authorised, declined, cap_reached, expired
            $table->decimal('authorised_units', 6, 2)->nullable();
            $table->unsignedInteger('authorised_limit_zar')->nullable();
            $table->string('authorised_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('authorised_at')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_scope_changes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->string('change_type');             // Additional Deliverable, Additional Activity, Schedule Change, Out of Scope, Adjust Allowance ...
            $table->string('summary');
            $table->text('description')->nullable();
            $table->date('effective_from')->nullable();
            $table->string('reason')->nullable();
            $table->string('raised_by')->default('Client');
            $table->string('risk')->default('Low');
            $table->string('status')->default('under_review'); // under_review, approved, rejected
            $table->unsignedTinyInteger('stage')->default(1);  // 1..5 scope-change stepper
            $table->decimal('impact_hours', 6, 2)->default(0);
            $table->unsignedInteger('impact_zar')->default(0);
            $table->timestamps();
        });

        Schema::create('prd_ret_substitutions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->json('current_adviser');
            $table->json('proposed_adviser');
            $table->string('type')->default('Planned');   // Planned, Emergency
            $table->string('reason');
            $table->text('reason_detail')->nullable();
            $table->date('effective_from');
            $table->string('risk')->default('Low');
            $table->string('status')->default('pending_notice'); // pending_notice, awaiting_approval, approved, client_declined, discuss
            $table->string('client_response')->nullable();
            $table->text('client_note')->nullable();
            $table->timestamp('notice_sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_commitments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->string('type');                    // Deliverable, Milestone, Meeting, Event
            $table->string('description');
            $table->string('owner');
            $table->date('committed_on');
            $table->date('starts_on');
            $table->date('ends_on');
            $table->decimal('hours', 6, 2);
            $table->string('status')->default('tentative'); // confirmed, tentative, on_hold, released
            $table->timestamps();
        });

        Schema::create('prd_ret_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->string('adviser');
            $table->string('role');
            $table->unsignedTinyInteger('allocation_pct');
            $table->unsignedTinyInteger('workload_pct');
            $table->boolean('is_primary')->default(false);
            $table->boolean('available')->default(true);
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->string('level');                   // at_risk, moderate, low
            $table->decimal('utilisation_pct', 5, 1);
            $table->unsignedSmallInteger('days_elapsed')->default(0);
            $table->string('status')->default('new');  // new, in_progress, monitoring, escalated, resolved
            $table->timestamp('notice_sent_at')->nullable();
            $table->date('last_activity')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_ret_utilisation_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('choice');                  // continue, right_size, pause, cancel
            $table->json('offered');
            $table->date('effective_date')->nullable();
            $table->decimal('requested_allowance', 8, 2)->nullable();
            $table->timestamps();                      // immutable: never updated
        });

        Schema::create('prd_ret_scenarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->string('name');
            $table->string('type');
            $table->decimal('allowance_qty', 8, 2);
            $table->unsignedInteger('monthly_fee_zar');
            $table->date('starts_on');
            $table->string('result');                  // capacity_available, capacity_hold, below_floor
            $table->string('classification', 4);       // C1..C5 headroom grade
            $table->json('detail')->nullable();
            $table->string('run_by');
            $table->timestamps();
        });

        Schema::create('prd_ret_rollovers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retainer_id')->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->foreignId('source_period_id')->nullable()->constrained('prd_ret_periods')->nullOnDelete();
            $table->date('period_ended');
            $table->decimal('units', 8, 2);
            $table->string('unit_type')->default('Hours');
            $table->unsignedInteger('cost_per_unit_zar');
            $table->unsignedTinyInteger('rollover_pct');
            $table->string('note')->nullable();
            $table->date('expires_on');
            $table->string('status')->default('open'); // open, used, expired
            $table->timestamps();
        });

        Schema::create('prd_ret_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retainer_id')->nullable()->constrained('prd_ret_retainers')->cascadeOnDelete();
            $table->foreignId('proposal_id')->nullable()->constrained('prd_ret_proposals')->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type');
            $table->string('summary');
            $table->json('data')->nullable();
            $table->string('correlation_id', 40)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['type']);
        });
    }

    public function down(): void
    {
        foreach ([
            'prd_ret_events', 'prd_ret_rollovers', 'prd_ret_scenarios', 'prd_ret_utilisation_decisions', 'prd_ret_alerts',
            'prd_ret_allocations', 'prd_ret_commitments', 'prd_ret_substitutions', 'prd_ret_scope_changes', 'prd_ret_overages',
            'prd_ret_disputes', 'prd_ret_usage', 'prd_ret_periods', 'prd_ret_retainers', 'prd_ret_proposals', 'prd_ret_services',
            'prd_ret_capacity_pools',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
