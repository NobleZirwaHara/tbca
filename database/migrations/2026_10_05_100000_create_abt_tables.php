<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * About TBCA + Trust (AB-TEB v2.0): Claim Liability Register and evidence,
 * certification / trade mark register, institutional permissions, consent-governed
 * testimonials, corrections, careers, newsroom, non-client cases (complaints, media,
 * partner), isolated whistleblowing cases and system status.
 */
return new class extends Migration
{
    public function up(): void
    {
        /* Claim Liability Register: every public trust assertion. */
        Schema::create('abt_claims', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();             // CLM-048
            $table->string('key')->unique();              // stable binding key used by components, e.g. iso-27001
            $table->string('statement', 500);             // claim_text_as_published
            $table->string('value')->nullable();          // metric value, e.g. 18,742+
            $table->string('label')->nullable();          // short display label, e.g. Clients Served
            $table->string('description', 500)->nullable();
            $table->string('category');                   // Brand & Positioning, Client Outcomes ...
            $table->string('claim_type');                 // Certification, Compliance Attestation, Scale, Performance ...
            $table->string('ledger', 1);                  // V | A | R | G
            $table->json('surfaces')->nullable();         // landing, promise, glance, certifications, track-record ...
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->string('review_status')->default('proposed'); // proposed | under_review | approved | rejected
            $table->string('verification_status')->default('unverified'); // verified | in_progress | unverified
            $table->string('lifecycle')->default('active'); // active | disputed | withdrawn | superseded | archived
            $table->string('approval_authority')->nullable();
            $table->string('owner')->nullable();
            $table->string('exposure_severity')->default('moderate'); // critical | high | moderate | low
            $table->date('claimed_on')->nullable();
            $table->timestamp('last_reviewed_at')->nullable();
            $table->string('action_label')->nullable();
            $table->string('action_href')->nullable();
            $table->json('popover')->nullable();          // evidence popover content: overview, governance, policies, proof points, metrics
            $table->unsignedBigInteger('correction_id')->nullable();
            $table->timestamps();
        });

        Schema::create('abt_cert_assets', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();             // TM-001, CERT-001
            $table->string('name');
            $table->string('asset_type');                 // trade_mark | certification | attestation
            $table->string('jurisdiction');
            $table->string('registration_no')->nullable();
            $table->string('issuer')->nullable();         // certifying body / registry
            $table->string('symbol')->nullable();         // ™ | ®
            $table->string('state')->default('active');   // active | paused | withdrawn (manual); expiry is derived
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->string('owner')->nullable();
            $table->string('scope', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('abt_evidence', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();             // EV-2024-001
            $table->foreignId('claim_id')->constrained('abt_claims')->cascadeOnDelete();
            $table->foreignId('cert_asset_id')->nullable()->constrained('abt_cert_assets')->nullOnDelete();
            $table->string('title');                      // source / document
            $table->string('evidence_type');              // Survey Report, Certificate, System Log ...
            $table->string('issuer');                     // evidence holder / issuing body
            $table->string('verification_status')->default('in_review'); // verified | in_review | rejected
            $table->string('reference_no')->nullable();
            $table->date('as_at_date')->nullable();
            $table->date('expiry_date')->nullable();      // null = no expiry
            $table->string('owner')->nullable();
            $table->string('verification_url')->nullable();
            $table->string('notes', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('abt_institutions', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('acronym');
            $table->string('ledger', 1)->default('R');
            $table->string('relationship_description', 400)->nullable();
            $table->string('relationship_detail', 800)->nullable();
            $table->string('permission_state')->default('confirmed'); // confirmed | review_due | revoked | withdrawn
            $table->date('permission_expires_at')->nullable();
            $table->json('surfaces')->nullable();         // relationships | trusted-strip
            $table->string('color')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('abt_testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();             // TS-068
            $table->string('company');
            $table->string('person_name')->nullable();
            $table->string('person_role')->nullable();
            $table->string('attribution')->nullable();    // e.g. "Approved Client" when name not authorised
            $table->string('industry')->nullable();
            $table->string('service_used')->nullable();
            $table->string('quote', 600);
            $table->unsignedTinyInteger('rating')->default(5);
            $table->string('status')->default('draft');   // draft | pending_review | published | declined
            $table->string('consent_status')->default('pending'); // pending | active | revoked | declined
            $table->date('consent_date')->nullable();
            $table->date('consent_expires_at')->nullable();
            $table->timestamp('consent_revoked_at')->nullable();
            $table->json('channels')->nullable();         // website | linkedin | proposals | presentations
            $table->boolean('image_permission')->default(false);
            $table->boolean('featured')->default(false);
            $table->string('ledger', 1)->default('R');
            $table->timestamps();
        });

        Schema::create('abt_corrections', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();             // COR-2025-046
            $table->foreignId('claim_id')->nullable()->constrained('abt_claims')->nullOnDelete();
            $table->string('title');
            $table->string('claim_type')->nullable();     // Claim type filter for public register
            $table->string('platform')->nullable();       // Platform / service
            $table->string('affected_surface')->nullable();
            $table->string('previous_wording', 600)->nullable();
            $table->string('corrected_position', 600)->nullable();
            $table->string('reason', 400)->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('submitted'); // submitted|triage|in_review|awaiting_approval|approved|published|closed|rejected
            $table->string('priority')->default('medium');  // low | medium | high | critical
            $table->boolean('is_public')->default(false);    // material public correction (appears on register once published)
            $table->string('submitted_by')->nullable();
            $table->string('submitter_email')->nullable();
            $table->string('assigned_to')->nullable();
            $table->string('evidence_name')->nullable();
            $table->string('evidence_path')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->date('target_publish_at')->nullable();
            $table->date('effective_at')->nullable();
            $table->date('last_verified_at')->nullable();
            $table->json('history')->nullable();             // [{at, by, action, note}]
            $table->timestamps();
        });

        Schema::create('abt_vacancies', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();             // VAC-2025-001
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('department');
            $table->string('location');
            $table->string('employment_type');            // Full-time | Contract | Part-time
            $table->string('experience_level')->nullable();
            $table->string('travel')->nullable();
            $table->string('reports_to')->nullable();
            $table->string('icon')->default('briefcase');
            $table->string('status')->default('open');    // draft | open | closed
            $table->date('posted_at')->nullable();
            $table->date('closes_at')->nullable();
            $table->text('overview')->nullable();
            $table->string('impact', 500)->nullable();
            $table->json('responsibilities')->nullable();
            $table->json('requirements')->nullable();
            $table->json('offer')->nullable();
            $table->json('skills')->nullable();
            $table->string('department_about', 600)->nullable();
            $table->timestamps();
        });

        Schema::create('abt_applications', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('vacancy_id')->constrained('abt_vacancies')->cascadeOnDelete();
            $table->string('status')->default('submitted'); // submitted | screening | interview | offer | unsuccessful | withdrawn
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->string('location')->nullable();
            $table->string('nationality')->nullable();
            $table->string('work_authorization')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('portfolio')->nullable();
            $table->json('experience')->nullable();
            $table->json('education')->nullable();
            $table->json('screening')->nullable();
            $table->string('cv_name')->nullable();
            $table->string('cv_path')->nullable();
            $table->string('cover_letter_name')->nullable();
            $table->string('cover_letter_path')->nullable();
            $table->timestamp('privacy_acknowledged_at')->nullable();
            $table->json('history')->nullable();
            $table->timestamps();
        });

        Schema::create('abt_news', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('kind')->default('news');      // news | announcement
            $table->string('category');                   // press_release | announcement | event | insight | thought_leadership | partnership
            $table->string('title');
            $table->string('subtitle', 400)->nullable();
            $table->string('location')->nullable();
            $table->json('body')->nullable();
            $table->string('quote', 500)->nullable();
            $table->string('quote_by')->nullable();
            $table->string('status')->default('published'); // draft | embargoed | published
            $table->timestamp('published_at')->nullable();
            $table->boolean('featured')->default(false);
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        /* Complaints, media enquiries, partner enquiries — reference + status tracking. */
        Schema::create('abt_cases', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('type');                       // complaint | media | partner
            $table->string('status')->default('received');
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('organisation')->nullable();
            $table->string('category')->nullable();
            $table->string('subject')->nullable();
            $table->text('message')->nullable();
            $table->json('details')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_path')->nullable();
            $table->json('history')->nullable();
            $table->timestamps();
        });

        /* Whistleblowing is isolated from every CRM / submission table by design. */
        Schema::create('abt_whistle_reports', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();        // WB-2026-XXXXXX (not secret)
            $table->string('token_hash');                 // hash of the secret case token
            $table->string('category');
            $table->string('relationship');
            $table->string('subject');
            $table->text('description');
            $table->string('people_involved', 500)->nullable();
            $table->string('period')->nullable();
            $table->string('business_area')->nullable();
            $table->string('follow_up_route');
            $table->boolean('willing_contact')->default(false);
            $table->boolean('anonymous')->default(false);
            $table->string('reporter_name')->nullable();
            $table->string('reporter_email')->nullable();
            $table->string('evidence_name')->nullable();
            $table->string('evidence_path')->nullable();
            $table->string('status')->default('received'); // received | case_review | assessment | investigation | closed
            $table->json('messages')->nullable();          // [{at, from: reporter|case_owner, body}]
            $table->timestamps();
        });

        Schema::create('abt_status_components', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('icon')->default('globe');
            $table->string('status')->default('operational'); // operational | degraded | partial_outage | major_outage
            $table->decimal('uptime_30d', 6, 3)->nullable();
            $table->unsignedInteger('response_ms')->nullable();
            $table->json('history')->nullable();               // last 7 days response samples
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('abt_status_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('component_id')->nullable()->constrained('abt_status_components')->nullOnDelete();
            $table->string('kind')->default('incident');   // incident | maintenance | notice
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('impact')->default('minor');    // minor | major | none
            $table->string('status')->default('investigating'); // investigating | identified | monitoring | resolved | scheduled | completed
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'abt_status_incidents', 'abt_status_components', 'abt_whistle_reports', 'abt_cases', 'abt_news',
            'abt_applications', 'abt_vacancies', 'abt_corrections', 'abt_testimonials', 'abt_institutions',
            'abt_evidence', 'abt_cert_assets', 'abt_claims',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
