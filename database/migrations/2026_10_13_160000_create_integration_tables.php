<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Integration layer: the event ledger (outbox and inbound webhook store),
 * the local-to-external ID map, and Due Diligence identity verifications.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_id', 100);                       // uuid for TBCA events; delivery id for inbound events
            $table->string('source', 30)->default('tbca');         // tbca, zoho, vove
            $table->string('direction', 10)->default('outbound');  // outbound, inbound, internal
            $table->string('type', 80)->index();                   // order.payment_verified, desk.ticket_updated ...
            $table->string('process', 5)->nullable()->index();     // A1-A10 from the implementation guide
            $table->string('aggregate_type', 60)->nullable();      // order, submission, dd_case ...
            $table->string('aggregate_id', 100)->nullable();       // local reference
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('idempotency_key')->nullable()->unique();
            $table->string('correlation_id', 100)->nullable();
            $table->json('payload')->nullable();
            $table->json('result')->nullable();                    // completed steps and returned external IDs
            $table->string('status', 20)->default('pending')->index(); // held, pending, sent, failed, complete
            $table->string('handled_by', 20)->nullable();          // automated, human
            $table->unsignedSmallInteger('human_minutes')->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamp('available_at')->nullable()->index();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['source', 'event_id']);
            $table->index(['aggregate_type', 'aggregate_id']);
        });

        Schema::create('integration_links', function (Blueprint $table) {
            $table->id();
            $table->string('local_type', 60);                      // user, order, ticket, dd_case ...
            $table->string('local_id', 100);
            $table->string('system', 30);                          // zoho_crm, zoho_books, zoho_desk ...
            $table->string('module', 60);                          // Accounts, Deals, invoices, tickets ...
            $table->string('external_id', 100);
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['local_type', 'local_id', 'system', 'module']);
            $table->index(['system', 'module', 'external_id']);
        });

        Schema::create('dd_identity_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('dd_cases')->cascadeOnDelete();
            $table->foreignId('check_id')->nullable()->constrained('dd_checks')->nullOnDelete();
            $table->string('provider', 30);                        // simulated, vove
            $table->string('kind', 20);                            // kyc, kyc_address, kyb, aml_individual, aml_entity
            $table->string('ref_id', 100)->unique();               // stable refId sent to the provider
            $table->string('subject_name');
            $table->string('subject_type', 20)->default('individual');
            $table->string('status', 20)->default('started');      // started, awaiting_subject, in_progress, review, passed, failed
            $table->string('provider_status', 40)->nullable();
            $table->string('provider_case_id', 100)->nullable();
            $table->string('link_hash', 64)->nullable()->unique();  // sha256 of the TBCA link token sent to the subject
            $table->timestamp('link_expires_at')->nullable();
            $table->json('summary')->nullable();                   // decision fields only, never images or biometrics
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dd_identity_verifications');
        Schema::dropIfExists('integration_links');
        Schema::dropIfExists('integration_events');
    }
};
