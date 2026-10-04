<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Due Diligence transaction ecosystem (Part 4 blueprint).
 *
 * Quotes carry the pre-payment journey (CS1 prospect -> CS2 order draft).
 * A case (dd_cases) is created only once the quote's order is paid, and from
 * then on the case status machine, consents, evidence, checks, findings,
 * reviews, reports, disputes, monitoring and closure hang off it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dd_quotes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();             // Q-DD-2026-00047
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('family');
            $table->string('sku_code');
            $table->string('status')->default('draft');        // draft, scoped, accepted, consent_pending, consented, payment_pending, payment_failed, converted, expired, cancelled
            $table->unsignedTinyInteger('step')->default(1);   // furthest journey step reached
            $table->json('requirements')->nullable();          // configurator inputs
            $table->json('inputs')->nullable();                // subject, entity, declarations
            $table->json('addons')->nullable();                // selected add-on codes
            $table->json('manifest')->nullable();              // accepted fee manifest snapshot
            $table->string('price_version')->nullable();
            $table->string('scope_hash')->nullable();
            $table->unsignedInteger('external_tolerance_zar')->default(25000);
            $table->string('payer_name')->nullable();
            $table->string('accepted_by')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->json('consent')->nullable();               // purpose/authority/privacy/subject-notice declarations
            $table->timestamp('consented_at')->nullable();
            $table->json('engagement')->nullable();            // order review acceptance
            $table->timestamp('engaged_at')->nullable();
            $table->json('billing')->nullable();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('dd_cases', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();             // DD-SA-2026-00047
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quote_id')->nullable()->constrained('dd_quotes')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('family');
            $table->string('sku_code');
            $table->string('package_name');
            $table->string('case_name');
            $table->string('client_name')->nullable();
            $table->string('subject_name');
            $table->string('subject_type');                    // individual, company, project, institution
            $table->string('jurisdiction')->default('South Africa');
            $table->string('purpose')->nullable();
            $table->json('requirements')->nullable();
            $table->json('subject')->nullable();               // entity / identity detail tabs
            $table->string('status')->default('consent_pending');
            $table->unsignedTinyInteger('stage')->default(1);  // internal lifecycle stage 0-14
            $table->string('review_state')->default('RV0');
            $table->string('risk_state')->default('RK0');
            $table->string('risk_rating')->nullable();         // low, medium, high
            $table->boolean('review_mandatory')->default(false);
            $table->boolean('partner_review')->default(false);
            $table->string('coordinator_name')->nullable();
            $table->string('coordinator_email')->nullable();
            $table->string('reviewer_name')->nullable();
            $table->string('reviewer_role')->nullable();
            $table->timestamp('review_started_at')->nullable();
            $table->timestamp('review_due_at')->nullable();
            $table->string('review_decision')->nullable();
            $table->json('partner')->nullable();               // name, type, scope, lead, contact
            $table->unsignedInteger('fees_ex_vat_zar')->default(0);
            $table->unsignedInteger('vat_zar')->default(0);
            $table->unsignedInteger('total_paid_zar')->default(0);
            $table->unsignedInteger('credits_zar')->default(0);
            $table->json('fee_lines')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->timestamp('limitations_acknowledged_at')->nullable();
            $table->string('closure_action')->nullable();      // archive, renew, delete, legal_hold
            $table->string('closure_status')->nullable();      // pending_approval, completed
            $table->json('closure_approvals')->nullable();
            $table->boolean('legal_hold')->default(false);
            $table->timestamp('closed_at')->nullable();
            $table->boolean('is_sample')->default(false);
            $table->timestamps();
        });

        Schema::create('dd_case_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('code');                            // EVT-DD-000233
            $table->string('type');                            // dd.case_activated
            $table->string('actor')->default('System');
            $table->string('actor_role')->default('system');   // client, staff, partner, subject, system
            $table->string('description');
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('type');                            // subject, authorised_request, lawful_purpose, cross_border, monitoring, report_delivery
            $table->string('label');
            $table->string('requirement')->default('required'); // required, optional, not_required
            $table->string('status')->default('pending');      // pending, received, withdrawn, expired, not_required, optional
            $table->string('given_by')->nullable();
            $table->string('method')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_consent_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->foreignId('consent_id')->nullable()->constrained('dd_consents')->nullOnDelete();
            $table->string('token', 64)->unique();
            $table->string('recipient_name');
            $table->string('recipient_role');
            $table->string('recipient_email')->nullable();
            $table->string('channel')->default('Email');
            $table->string('status')->default('pending');      // pending, delivered, completed, declined, expired
            $table->unsignedTinyInteger('reminders')->default(0);
            $table->timestamp('last_reminded_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_evidence_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('key');
            $table->string('label');
            $table->string('description')->nullable();
            $table->string('why')->nullable();
            $table->string('evidence_type')->nullable();
            $table->boolean('required')->default(true);
            $table->string('priority')->default('medium');     // high, medium, low, optional
            $table->unsignedTinyInteger('expected')->default(1);
            $table->string('status')->default('pending');      // pending, partial, uploaded, approved, rejected, alternative_proposed, waived
            $table->text('note')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('dd_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->nullable()->constrained('dd_cases')->cascadeOnDelete();
            $table->foreignId('quote_id')->nullable()->constrained('dd_quotes')->cascadeOnDelete();
            $table->foreignId('evidence_item_id')->nullable()->constrained('dd_evidence_items')->nullOnDelete();
            $table->unsignedBigInteger('dispute_id')->nullable();
            $table->string('category')->default('evidence');   // evidence, consent, dispute, intake, batch
            $table->string('original_name');
            $table->string('path');
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->string('checksum', 64)->nullable();
            $table->string('status')->default('received');     // received, verified, pending_review, rejected
            $table->string('uploaded_by')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('category');
            $table->string('detail')->nullable();
            $table->string('vendor');
            $table->string('vendor_detail')->nullable();
            $table->string('status')->default('not_started');  // not_started, pending, in_progress, on_hold, complete
            $table->unsignedSmallInteger('total')->default(1);
            $table->unsignedSmallInteger('done')->default(0);
            $table->string('hold_reason')->nullable();
            $table->unsignedInteger('external_approved_zar')->default(0);
            $table->unsignedInteger('external_used_zar')->default(0);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('dd_findings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('reference');                       // LEX-OSM-2026-0507-3321
            $table->string('report_ref')->nullable();          // RR-07
            $table->string('check_category');
            $table->string('flag_type');
            $table->string('source');
            $table->string('severity')->default('medium');     // low, medium, high, critical
            $table->string('status')->default('open');         // open, client_responded, reviewing, cleared, confirmed
            $table->text('summary')->nullable();
            $table->string('response_type')->nullable();       // explanation, not_relevant, rescreen
            $table->text('client_response')->nullable();
            $table->text('disposition')->nullable();
            $table->timestamp('detected_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('reference');                       // IR-0001, PR-0001, CL-0001, G9-0001, ALT-0001
            $table->string('type');                            // information, partner, clarification, scope_change, alternative_evidence
            $table->string('title');
            $table->text('detail')->nullable();
            $table->string('reason')->nullable();
            $table->string('requested_by');
            $table->string('requested_by_role')->default('staff');
            $table->timestamp('due_at')->nullable();
            $table->string('status')->default('open');         // open, responded, approved, declined, closed
            $table->text('response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('kind');                            // partner, qa
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('status')->default('pending');      // pending, in_progress, completed
            $table->unsignedTinyInteger('progress')->default(0);
            $table->timestamp('due_at')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('dd_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('version');                         // Draft v1.2, Final v1.0, Final v1.1 (Corrected)
            $table->string('status')->default('draft');        // draft, final, superseded
            $table->string('title')->default('Full Due Diligence Report');
            $table->json('sections')->nullable();
            $table->json('deliverables')->nullable();
            $table->string('hash', 64)->nullable();
            $table->string('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->json('access_log')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->string('reference');                       // DISP-2026-00047-001
            $table->string('report_section');
            $table->string('finding');
            $table->string('finding_ref')->nullable();
            $table->string('page')->nullable();
            $table->text('description');
            $table->string('remedy');                          // correct, reclassify, clarify, other
            $table->string('remedy_other')->nullable();
            $table->string('status')->default('received');     // received, under_review, decided, appealed
            $table->string('outcome')->nullable();             // corrected, upheld, clarified, recheck_quoted
            $table->text('reason')->nullable();
            $table->json('actions')->nullable();
            $table->string('reviewer')->nullable();
            $table->string('approved_by')->nullable();
            $table->unsignedInteger('refund_zar')->default(0);
            $table->string('new_version')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_monitoring_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();             // SUB-SA-2026-00047
            $table->foreignId('case_id')->nullable()->constrained('dd_cases')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('plan_code');
            $table->string('plan_name');
            $table->string('billing_cycle')->default('Monthly');
            $table->unsignedInteger('recurring_zar')->default(0);
            $table->string('status')->default('awaiting_payment'); // awaiting_payment, active, cancelled
            $table->unsignedInteger('subjects')->default(1);
            $table->unsignedInteger('alert_allowance')->default(100);
            $table->unsignedSmallInteger('included_reviews')->default(2);
            $table->unsignedSmallInteger('included_rechecks')->default(1);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('next_renewal_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_monitoring_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('dd_monitoring_subscriptions')->cascadeOnDelete();
            $table->string('reference');                       // AL-2026-0152
            $table->string('subject');
            $table->string('alert_type');
            $table->string('source');
            $table->string('risk_level');                      // critical, high, medium, low
            $table->string('status')->default('pending_review'); // pending_review, under_review, reviewed, escalated
            $table->string('reviewer')->nullable();
            $table->text('disposition')->nullable();
            $table->timestamp('detected_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_enterprise_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();             // ENT-DD-2026-00012
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('draft');        // draft, submitted, scoping, quoted, accepted, declined
            $table->json('data');
            $table->json('fee_view')->nullable();
            $table->text('staff_note')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dd_batches', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();             // B-2026-0514
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('file_name');
            $table->string('path')->nullable();
            $table->unsignedInteger('rows')->default(0);
            $table->unsignedInteger('valid_rows')->default(0);
            $table->unsignedInteger('duplicates')->default(0);
            $table->json('exceptions')->nullable();
            $table->string('status')->default('queued');       // queued, processing, completed, failed
            $table->unsignedTinyInteger('progress')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'dd_batches', 'dd_enterprise_requests', 'dd_monitoring_alerts', 'dd_monitoring_subscriptions',
            'dd_disputes', 'dd_reports', 'dd_tasks', 'dd_requests', 'dd_findings', 'dd_checks', 'dd_documents',
            'dd_evidence_items', 'dd_consent_requests', 'dd_consents', 'dd_case_events', 'dd_cases', 'dd_quotes',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
