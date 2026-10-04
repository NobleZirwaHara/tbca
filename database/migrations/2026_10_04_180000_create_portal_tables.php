<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Client Portal records (CP-TEB v3.0 / v3.1). Orders, payments, bookings and
 * saved items stay in the shared platform tables; everything else the portal
 * owns lives here under the portal_ prefix.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portal_organisations', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('name');
            $table->string('registration_number')->nullable();
            $table->string('entity_type')->nullable();
            $table->string('org_type')->nullable(); // Corporate, Operating Company, Investment Vehicle ...
            $table->string('industry')->nullable();
            $table->string('website')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('country')->default('South Africa');
            $table->string('tax_number')->nullable();
            $table->string('vat_number')->nullable();
            $table->date('incorporated_on')->nullable();
            $table->string('employees')->nullable();
            $table->string('revenue_range')->nullable();
            $table->string('head_office')->nullable();
            $table->text('about')->nullable();
            $table->boolean('verified')->default(false);
            $table->string('status')->default('active'); // active, inactive
            $table->unsignedTinyInteger('health_score')->default(80);
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('organisation_id')->nullable()->constrained('portal_organisations')->nullOnDelete();
            $table->string('account_state')->default('active'); // active, restricted, suspended, paused, exited
            $table->string('state_reason')->nullable();
            $table->string('state_case')->nullable();
            $table->timestamp('state_since')->nullable();
            $table->json('preferences')->nullable();
            $table->json('onboarding')->nullable();
            $table->string('mfa_secret')->nullable();
            $table->timestamp('mfa_enabled_at')->nullable();
            $table->timestamp('password_changed_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organisation_id')->constrained('portal_organisations')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('job_title')->nullable();
            $table->string('department')->nullable();
            $table->string('phone')->nullable();
            $table->string('role')->default('viewer'); // owner, admin, finance, project, compliance, analyst, viewer
            $table->string('access_group')->nullable();
            $table->string('status')->default('invited'); // invited, active, inactive, offboarded
            $table->boolean('is_primary')->default(false);
            $table->boolean('mfa')->default(false);
            $table->string('invite_token')->nullable()->unique();
            $table->string('invited_by')->nullable();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('invite_expires_at')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->json('permissions')->nullable();
            $table->timestamp('offboarded_at')->nullable();
            $table->string('offboard_reason')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['organisation_id', 'status']);
        });

        Schema::create('portal_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organisation_id')->nullable()->constrained('portal_organisations')->nullOnDelete();
            $table->string('reference')->unique();
            $table->string('name');
            $table->string('service')->nullable();
            $table->string('category')->nullable();
            $table->string('workspace')->default('advisory');
            $table->string('status')->default('in_progress'); // not_started, in_progress, pending_client, on_hold, completed
            $table->string('health')->default('good'); // good, fair, at_risk
            $table->unsignedTinyInteger('progress')->default(0);
            $table->string('current_stage')->nullable();
            $table->json('stages')->nullable();
            $table->string('manager')->nullable();
            $table->string('manager_email')->nullable();
            $table->json('team')->nullable();
            $table->date('starts_on')->nullable();
            $table->date('due_on')->nullable();
            $table->unsignedInteger('fee_zar')->default(0);
            $table->unsignedInteger('billed_zar')->default(0);
            $table->date('next_invoice_on')->nullable();
            $table->string('priority')->default('medium');
            $table->string('engagement_type')->nullable();
            $table->json('latest_update')->nullable();
            $table->json('risks')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('portal_projects')->cascadeOnDelete();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('kind')->default('task'); // task, milestone
            $table->string('assignee')->nullable();
            $table->string('priority')->default('medium');
            $table->string('status')->default('not_started'); // not_started, in_progress, completed
            $table->date('due_on')->nullable();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organisation_id')->nullable()->constrained('portal_organisations')->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('portal_projects')->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('portal_documents')->nullOnDelete();
            $table->boolean('is_folder')->default(false);
            $table->string('name');
            $table->string('doc_type')->nullable(); // Company Profile, Financial, Legal ...
            $table->string('extension', 12)->nullable();
            $table->string('mime')->nullable();
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->string('path')->nullable();
            $table->json('tags')->nullable();
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('version')->default(1);
            $table->string('checksum')->nullable();
            $table->string('confidentiality')->default('Confidential');
            $table->unsignedTinyInteger('retention_years')->default(7);
            $table->boolean('legal_hold')->default(false);
            $table->string('status')->default('active'); // active, deleted
            $table->string('uploaded_by')->nullable();
            $table->unsignedInteger('access_count')->default(0);
            $table->timestamp('last_accessed_at')->nullable();
            $table->string('last_accessed_by')->nullable();
            $table->boolean('starred')->default(false);
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('portal_projects')->nullOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('portal_documents')->nullOnDelete();
            $table->string('reference');
            $table->string('title');
            $table->string('type')->default('Report');
            $table->string('format')->default('PDF');
            $table->string('version')->default('1.0');
            $table->string('qa_state')->default('not_reviewed'); // not_reviewed, in_qa, qa_approved, corrections
            $table->string('release_state')->default('draft'); // draft, in_review, changes_required, release_approved, delivered, retracted
            $table->string('acceptance_state')->default('pending'); // pending, accepted, corrections_requested, disputed
            $table->string('decision_type')->default('acceptance'); // approval, review, acceptance
            $table->string('requested_by')->default('TBCA Advisory Team');
            $table->timestamp('released_at')->nullable();
            $table->date('acceptance_due_on')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->text('decision_note')->nullable();
            $table->string('file_name')->nullable();
            $table->unsignedInteger('size_kb')->default(0);
            $table->unsignedSmallInteger('pages')->default(0);
            $table->string('checksum')->nullable();
            $table->string('confidentiality')->default('Confidential');
            $table->json('tags')->nullable();
            $table->json('topics')->nullable();
            $table->json('versions')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_evidence_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('portal_projects')->nullOnDelete();
            $table->foreignId('document_id')->nullable()->constrained('portal_documents')->nullOnDelete();
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('requested_by')->nullable();
            $table->date('requested_on')->nullable();
            $table->string('priority')->default('medium');
            $table->date('due_on')->nullable();
            $table->string('status')->default('pending'); // pending, submitted, accepted
            $table->unsignedTinyInteger('progress')->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->string('subject');
            $table->string('area')->nullable();
            $table->string('category')->default('General');
            $table->string('priority')->default('medium'); // critical, high, medium, low
            $table->string('status')->default('open'); // open, in_progress, on_hold, resolved, closed
            $table->string('assigned_team')->default('TBCA Support Team');
            $table->string('assignee')->nullable();
            $table->unsignedTinyInteger('escalation_level')->default(0);
            $table->timestamp('sla_due_at')->nullable();
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->string('source')->default('portal'); // portal, natasha, whatsapp, escalation
            $table->string('related_project')->nullable();
            $table->string('preferred_channel')->default('Portal Messages & Email');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('portal_tickets')->cascadeOnDelete();
            $table->string('author_name');
            $table->string('author_role')->nullable();
            $table->boolean('is_staff')->default(false);
            $table->string('kind')->default('message'); // message, system
            $table->text('body');
            $table->json('attachments')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_notices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('system'); // action_required, project_update, compliance, reminder, message, overdue, system, finance, mention
            $table->string('category')->default('System');
            $table->string('title');
            $table->string('body')->nullable();
            $table->string('related_label')->nullable();
            $table->string('related_url')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'read_at']);
        });

        Schema::create('portal_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference');
            $table->string('title');
            $table->string('engagement_ref')->nullable();
            $table->string('purpose')->nullable();
            $table->string('project_name')->nullable();
            $table->string('owner')->nullable();
            $table->string('classification')->default('Confidential');
            $table->string('status')->default('open');
            $table->boolean('pinned')->default(false);
            $table->json('participants')->nullable();
            $table->unsignedSmallInteger('unread')->default(0);
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('portal_threads')->cascadeOnDelete();
            $table->string('author_name');
            $table->string('author_role')->nullable();
            $table->boolean('is_mine')->default(false);
            $table->string('kind')->default('reply'); // reply, note
            $table->text('body');
            $table->json('attachments')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('key');
            $table->string('label');
            $table->string('purpose')->nullable();
            $table->string('status')->default('pending'); // active, pending, withdrawn
            $table->boolean('essential')->default(false);
            $table->string('source')->default('Portal Checkpoint');
            $table->timestamp('given_at')->nullable();
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'key']);
        });

        Schema::create('portal_data_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->string('type'); // access, export, correction, deletion, restriction, withdrawal, clarification
            $table->string('scope')->nullable();
            $table->text('details')->nullable();
            $table->string('status')->default('submitted'); // submitted, in_review, pending_clarification, ready, completed, rejected
            $table->string('assigned_to')->nullable();
            $table->string('evidence')->default('ID Verified');
            $table->timestamp('due_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('response')->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('kind'); // journey keys + dispute, feedback, variation, appeal, export ...
            $table->string('reference')->nullable()->index();
            $table->string('title')->nullable();
            $table->string('status')->default('draft');
            $table->unsignedTinyInteger('step')->default(1);
            $table->string('priority')->nullable();
            $table->bigInteger('amount_zar')->nullable();
            $table->json('payload')->nullable();
            $table->text('outcome')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->timestamps();
            $table->index(['kind', 'status']);
        });

        Schema::create('portal_security_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('event'); // sign_in, failed_sign_in, unusual_sign_in, password_change, mfa_enabled ...
            $table->string('device')->nullable();
            $table->string('location')->nullable();
            $table->string('ip')->nullable();
            $table->string('status')->default('verified'); // verified, flagged, failed, resolved
            $table->string('risk')->default('low');
            $table->string('details')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('os')->nullable();
            $table->string('browser')->nullable();
            $table->string('location')->nullable();
            $table->boolean('trusted')->default(false);
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });

        Schema::create('portal_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('kind'); // webinar, kp
            $table->string('item_key');
            $table->string('reference');
            $table->string('status')->default('registered'); // registered, pending_approval, cancelled, attended
            $table->timestamps();
            $table->unique(['user_id', 'kind', 'item_key']);
        });

        Schema::create('portal_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('register'); // quotation, contract, renewal, meter, incident, policy ...
            $table->string('reference')->nullable();
            $table->string('title')->nullable();
            $table->string('status')->nullable();
            $table->bigInteger('amount_zar')->nullable();
            $table->date('due_on')->nullable();
            $table->json('data')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
            $table->index(['register', 'user_id']);
        });

        Schema::create('portal_share_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token')->unique();
            $table->string('target_type'); // document, deliverable
            $table->unsignedBigInteger('target_id');
            $table->string('label');
            $table->string('channel')->default('Secure Link');
            $table->string('recipient')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, expired, revoked
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->unsignedInteger('access_count')->default(0);
            $table->timestamps();
        });

        Schema::create('portal_principals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type')->default('api'); // human, machine, api
            $table->json('scopes')->nullable();
            $table->string('token_hash')->nullable();
            $table->string('token_hint')->nullable();
            $table->string('status')->default('active'); // active, revoked, expired
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'portal_principals', 'portal_share_links', 'portal_records', 'portal_registrations', 'portal_devices',
            'portal_security_events', 'portal_cases', 'portal_data_requests', 'portal_consents', 'portal_messages',
            'portal_threads', 'portal_notices', 'portal_ticket_messages', 'portal_tickets', 'portal_evidence_requests',
            'portal_deliverables', 'portal_documents', 'portal_tasks', 'portal_projects', 'portal_memberships',
            'portal_accounts', 'portal_organisations',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
