<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marketplace (MP-TEB v2.0) and Partner Services (PS-TEB v1.1) records.
 *
 *  mkt_providers         marketplace providers and partner-services firms (kind)
 *  mkt_listings          catalogue services (fixed, recurring, partner)
 *  mkt_reviews           client ratings of listings / providers
 *  mkt_briefs            buyer briefs (wizard draft -> scope -> disclosure -> payment)
 *  mkt_proposals         provider quotes on briefs (rate acceptance)
 *  mkt_engagements       paid, assigned work
 *  mkt_deliverables      provider submissions and the QA review object
 *  mkt_disputes          client disputes, provider grievances/appeals, chargebacks
 *  mkt_payouts           provider payouts (queue -> paid)
 *  mkt_earnings          billing lines and adjustments behind provider statements
 *  mkt_partner_requests  Partner Services matters (intake -> conflict -> quote -> instrument -> payment)
 *  mkt_records           governance registers (capacity rules, permissions, conflicts, ...)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mkt_providers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();              // FIN-PRV-001 / P-2026-00058
            $table->string('slug')->unique();
            $table->string('kind')->default('marketplace'); // marketplace | partner
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('profession')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->default('South Africa');
            $table->string('status')->default('applied');   // provider state machine
            $table->string('tier')->nullable();              // Gold / Silver / Bronze
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedInteger('reviews_count')->default(0);
            $table->unsignedInteger('engagements_count')->default(0);
            $table->unsignedTinyInteger('score')->nullable(); // verification score %
            $table->string('application_ref')->nullable()->index();
            $table->date('last_verified_at')->nullable();
            $table->date('next_review_at')->nullable();
            $table->timestamp('agreement_signed_at')->nullable();
            $table->json('profile')->nullable();             // metrics, badges, services, bank, compliance ...
            $table->json('application')->nullable();         // onboarding answers
            $table->json('vetting')->nullable();             // checklist + decision
            $table->timestamps();
            $table->index(['kind', 'status']);
        });

        Schema::create('mkt_listings', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('kind')->default('fixed');       // fixed | recurring | partner
            $table->foreignId('provider_id')->nullable()->constrained('mkt_providers')->nullOnDelete();
            $table->string('title');
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->string('summary', 600)->nullable();
            $table->unsignedInteger('price_zar')->nullable();
            $table->string('period')->nullable();            // month
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedInteger('reviews_count')->default(0);
            $table->unsignedInteger('popularity')->default(0);
            $table->string('badge')->nullable();
            $table->string('status')->default('published');  // pending | published | suspended | rejected
            $table->json('details')->nullable();
            $table->timestamps();
            $table->index(['kind', 'status', 'category']);
        });

        Schema::create('mkt_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->nullable()->constrained('mkt_listings')->cascadeOnDelete();
            $table->foreignId('provider_id')->nullable()->constrained('mkt_providers')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('author');
            $table->string('company')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->text('body');
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('mkt_briefs', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('category')->nullable();
            $table->string('client_name')->nullable();
            $table->string('status')->default('draft');
            $table->unsignedTinyInteger('step')->default(1);
            $table->boolean('open_to_providers')->default(false);
            $table->unsignedTinyInteger('priority_score')->nullable();
            $table->foreignId('provider_id')->nullable()->constrained('mkt_providers')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->json('data')->nullable();        // wizard answers
            $table->json('scope')->nullable();       // methodology brief, ledgers, floor
            $table->json('disclosure')->nullable();
            $table->timestamps();
        });

        Schema::create('mkt_proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brief_id')->constrained('mkt_briefs')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('mkt_providers')->cascadeOnDelete();
            $table->unsignedInteger('rate_zar');
            $table->unsignedSmallInteger('days');
            $table->unsignedTinyInteger('match_score')->default(0);
            $table->string('note', 1000)->nullable();
            $table->string('status')->default('submitted'); // submitted | shortlisted | awarded | declined | withdrawn
            $table->timestamps();
            $table->unique(['brief_id', 'provider_id']);
        });

        Schema::create('mkt_engagements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('assignment_ref')->nullable();
            $table->foreignId('brief_id')->nullable()->constrained('mkt_briefs')->nullOnDelete();
            $table->foreignId('listing_id')->nullable()->constrained('mkt_listings')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('provider_id')->nullable()->constrained('mkt_providers')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('title');
            $table->string('service')->nullable();
            $table->string('category')->nullable();
            $table->string('client_name')->nullable();
            $table->string('stage')->default('awaiting_payment');
            $table->string('priority')->default('medium');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->unsignedInteger('value_zar')->default(0);        // billed to buyer (A+B+C, ex VAT)
            $table->unsignedInteger('provider_rate_zar')->default(0); // Ledger C provider rate
            $table->string('payment_state')->default('pay_on_qa');
            $table->string('qa_standard')->nullable();
            $table->date('target_date')->nullable();
            $table->json('meta')->nullable();       // timeline, corrections, qa outcome, scope
            $table->timestamps();
        });

        Schema::create('mkt_deliverables', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('engagement_id')->constrained('mkt_engagements')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('version')->default('1.0');
            $table->string('status')->default('submitted'); // submitted | in_review | returned_r1 | returned_r2 | rejected | released | accepted | correction_requested | clarification_requested
            $table->string('reviewer')->nullable();
            $table->json('qa')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('mkt_disputes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('kind')->default('dispute'); // dispute | grievance | appeal | chargeback
            $table->foreignId('engagement_id')->nullable()->constrained('mkt_engagements')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('provider_id')->nullable()->constrained('mkt_providers')->nullOnDelete();
            $table->string('type');
            $table->string('category')->nullable();
            $table->string('priority')->default('medium');
            $table->string('subject');
            $table->text('description')->nullable();
            $table->unsignedInteger('amount_zar')->default(0);
            $table->string('status')->default('raised');
            $table->timestamp('response_due_at')->nullable();
            $table->json('meta')->nullable(); // timeline, messages, resolution sought, documents
            $table->timestamps();
        });

        Schema::create('mkt_payouts', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('provider_id')->constrained('mkt_providers')->cascadeOnDelete();
            $table->foreignId('engagement_id')->nullable()->constrained('mkt_engagements')->nullOnDelete();
            $table->decimal('earnings_zar', 12, 2);
            $table->decimal('fee_zar', 12, 2);
            $table->decimal('vat_zar', 12, 2);
            $table->decimal('amount_zar', 12, 2);
            $table->string('method')->default('Bank Transfer');
            $table->string('account')->nullable();
            $table->string('status')->default('ready'); // ready | scheduled | in_transit | paid | held | failed
            $table->date('available_from')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('mkt_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('mkt_providers')->cascadeOnDelete();
            $table->foreignId('engagement_id')->nullable()->constrained('mkt_engagements')->nullOnDelete();
            $table->string('kind')->default('billing'); // billing | adjustment
            $table->string('category');
            $table->string('description')->nullable();
            $table->decimal('amount_zar', 12, 2);
            $table->string('invoice')->nullable();
            $table->string('status')->default('approved');
            $table->date('occurred_on');
            $table->timestamps();
        });

        Schema::create('mkt_partner_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('listing_id')->nullable()->constrained('mkt_listings')->nullOnDelete();
            $table->foreignId('partner_id')->nullable()->constrained('mkt_providers')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('client_name')->nullable();
            $table->string('title')->nullable();
            $table->string('stage')->default('intake');
            $table->string('conflict_state')->default('NOT_REQUESTED');
            $table->string('arrangement')->nullable();
            $table->string('fee_mechanism')->nullable();
            $table->string('permission_ref')->nullable();
            $table->json('intake')->nullable();
            $table->json('resolution')->nullable();
            $table->json('quote')->nullable();
            $table->json('meta')->nullable(); // conflict, proposal, signature, delivery, settlement, escalation, history
            $table->timestamps();
        });

        Schema::create('mkt_records', function (Blueprint $table) {
            $table->id();
            $table->string('register')->index(); // capacity-rules, corrections, permissions ...
            $table->string('reference');
            $table->string('status');
            $table->string('priority')->nullable();
            $table->json('data')->nullable();
            $table->timestamps();
            $table->unique(['register', 'reference']);
        });
    }

    public function down(): void
    {
        foreach (['mkt_records', 'mkt_partner_requests', 'mkt_earnings', 'mkt_payouts', 'mkt_disputes', 'mkt_deliverables',
            'mkt_engagements', 'mkt_proposals', 'mkt_briefs', 'mkt_reviews', 'mkt_listings', 'mkt_providers'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
