<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Virtual Deal Room transaction ecosystem (A, B, C then stages 0-15).
 *
 * A room is created at Stage A (enquiry) and walks a gated stage machine
 * (vdr_stages). A stage completes only when its checklist, named human
 * approvals and any stage fee (vdr_charges paid through the shared checkout)
 * pass. Parties, folders, documents, Q&A, offers, conditions precedent,
 * commercial requests (change, third-party, refund, dispute, overage, restart)
 * and the audit trail hang off the room.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vdr_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();               // DR-2026-000128
            $table->string('slug')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('company');
            $table->string('country')->default('South Africa');
            $table->string('sector')->nullable();
            $table->string('deal_type')->default('fundraising');  // fundraising, ma, due_diligence, lending, partnership, procurement
            $table->string('transaction_type')->default('Fundraising & Growth Capital Raise');
            $table->text('objective')->nullable();
            $table->unsignedBigInteger('amount_zar')->default(0); // indicative raise / deal value
            $table->string('currency', 3)->default('ZAR');
            $table->date('target_close_date')->nullable();
            $table->string('current_stage', 4)->default('A');
            $table->string('status')->default('active');          // active, paused, closed, archived
            $table->json('enquiry')->nullable();                  // contact, checks, qualification
            $table->json('diagnostic')->nullable();               // questionnaire answers
            $table->json('commercial')->nullable();               // quote / scope / engagement flags
            $table->json('setup')->nullable();                    // Stage 0 wizard data
            $table->json('security')->nullable();                 // NDA gate, watermark, download policy ...
            $table->json('plan')->nullable();                     // usage allowances
            $table->json('state')->nullable();                    // per-stage working data (onboarding ticks, negotiation approvals ...)
            $table->string('paused_reason')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamps();
        });

        Schema::create('vdr_stages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->string('code', 4);                            // A, B, C, 0 ... 15
            $table->string('status')->default('locked');          // locked, unlocked, completed
            $table->json('checks')->nullable();                   // manual completion-test ticks
            $table->timestamp('unlocked_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('completed_by')->nullable();
            $table->timestamps();
            $table->unique(['room_id', 'code']);
        });

        Schema::create('vdr_parties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('organisation')->nullable();
            $table->string('role');                               // owner, tbca_advisor, finance, legal, investor, lender, advisor, auditor, valuer, government
            $table->string('group_name')->nullable();             // isolated buyer group
            $table->string('jurisdiction')->nullable();
            $table->string('access_level')->default('view_only'); // full, qa_only, view_only
            $table->string('status')->default('prospect');        // prospect, qualified, invited, active, declined, revoked, expired
            $table->unsignedTinyInteger('qualification_score')->nullable();
            $table->string('invite_token', 64)->nullable()->unique();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('invite_expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('nda_accepted_at')->nullable();
            $table->timestamp('last_access_at')->nullable();
            $table->boolean('mfa')->default(true);
            $table->timestamps();
            $table->unique(['room_id', 'email']);
        });

        Schema::create('vdr_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->unsignedSmallInteger('position')->default(0);
            $table->string('name');
            $table->json('roles')->nullable();                    // roles allowed; null = every party
            $table->boolean('staged')->default(true);             // hidden from externals until released
            $table->timestamp('released_at')->nullable();
            $table->timestamps();
        });

        Schema::create('vdr_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->foreignId('folder_id')->constrained('vdr_folders')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('path')->nullable();                   // private disk path (vdr/{room}/...)
            $table->unsignedBigInteger('size')->default(0);
            $table->string('mime')->nullable();
            $table->unsignedSmallInteger('version')->default(1);
            $table->string('sha256', 64)->nullable();
            $table->string('category')->nullable();               // AI classification
            $table->unsignedTinyInteger('confidence')->nullable();
            $table->string('review_status')->default('ready');    // ready, flagged, approved, released
            $table->string('flag_issue')->nullable();
            $table->string('flag_severity')->nullable();
            $table->unsignedInteger('pages')->default(1);
            $table->timestamps();
        });

        Schema::create('vdr_access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('vdr_documents')->nullOnDelete();
            $table->string('action');                             // view, download, upload, nda_accept, denied
            $table->string('watermark')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('vdr_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('asked_by');
            $table->text('question');
            $table->text('answer')->nullable();
            $table->json('sources')->nullable();
            $table->unsignedTinyInteger('confidence')->nullable();
            $table->string('status')->default('open');            // open, answered, escalated
            $table->string('answered_by')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
        });

        Schema::create('vdr_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->string('version');                            // TS-01
            $table->string('label');
            $table->string('side');                               // sponsor, investor
            $table->string('submitted_by');
            $table->unsignedBigInteger('valuation_zar');
            $table->unsignedBigInteger('investment_zar');
            $table->decimal('equity_pct', 5, 2);
            $table->string('key_condition')->nullable();
            $table->json('terms')->nullable();
            $table->string('status')->default('active');          // active, superseded, approved, withdrawn
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('vdr_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->unsignedSmallInteger('number');
            $table->string('condition');
            $table->string('category');
            $table->string('owner');
            $table->date('due_date')->nullable();
            $table->string('status')->default('in_progress');     // not_started, in_progress, satisfied, waived
            $table->string('evidence')->nullable();
            $table->boolean('validated')->default(false);
            $table->timestamps();
        });

        Schema::create('vdr_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->string('kind');                               // action, legal_doc, legal_issue, handover, workstream, post_close_risk, signature
            $table->unsignedSmallInteger('position')->default(0);
            $table->string('title');
            $table->string('owner')->nullable();
            $table->string('status')->default('pending');
            $table->date('due_date')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('vdr_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->string('subject');                            // stage:6, request:12
            $table->string('approver');
            $table->string('approver_role');
            $table->string('status')->default('pending');         // pending, approved, rejected
            $table->string('decided_by')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
            $table->index(['room_id', 'subject']);
        });

        Schema::create('vdr_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->string('reference')->unique();                // INV-2026-000128-D1
            $table->string('kind');                               // deposit, stage_fee, overage, plan_upgrade, change, third_party, monthly, closing, subscription, archive_renewal
            $table->string('stage_code', 4)->nullable();
            $table->string('description');
            $table->json('lines');                                // [{category, item, provider, net, vat}]
            $table->unsignedBigInteger('net_zar');
            $table->unsignedBigInteger('vat_zar');
            $table->unsignedBigInteger('total_zar');
            $table->string('status')->default('issued');          // issued, awaiting_payment, paid, failed, cancelled, refunded, partially_refunded
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->unsignedTinyInteger('failed_attempts')->default(0);
            $table->string('failure_reason')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->unsignedBigInteger('refunded_zar')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('vdr_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->string('reference')->unique();                // CR-2026-000128
            $table->string('type');                               // change, third_party, refund, dispute, overage, restart
            $table->string('status')->default('submitted');       // submitted, under_review, resolution_proposed, approved, rejected, resolved, revision_requested
            $table->string('raised_by');
            $table->foreignId('charge_id')->nullable()->constrained('vdr_charges')->nullOnDelete();
            $table->unsignedBigInteger('amount_zar')->default(0);
            $table->json('payload')->nullable();
            $table->text('resolution')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('vdr_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->string('period', 7);                          // 2026-10
            $table->string('metric');                             // ocr_pages, ai_qa, summaries, meetings, reports, exports, integrations
            $table->unsignedInteger('used')->default(0);
            $table->json('alerts')->nullable();                   // thresholds already raised
            $table->timestamps();
            $table->unique(['room_id', 'period', 'metric']);
        });

        Schema::create('vdr_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('vdr_rooms')->cascadeOnDelete();
            $table->string('event');                              // commercial event catalogue id
            $table->string('description');
            $table->string('actor')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['vdr_events', 'vdr_usage', 'vdr_requests', 'vdr_charges', 'vdr_approvals', 'vdr_items', 'vdr_conditions', 'vdr_offers', 'vdr_questions', 'vdr_access_logs', 'vdr_documents', 'vdr_folders', 'vdr_parties', 'vdr_stages', 'vdr_rooms'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
