<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AIIM — Africa Investment Intelligence Map.
 *
 * Catalogue (provinces, sectors, projects/opportunities, investors/funders,
 * corridors, sources, premium briefs, fee codes, advisors), client state
 * (saved items, comparisons, wallet, quotes, entitlements, report requests)
 * and the staged engagement lifecycle (custom intelligence, advisory and
 * verification mandates with their cases, introductions and handoffs).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aiim_provinces', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('code', 8);
            $table->unsignedTinyInteger('rank');
            $table->decimal('score', 5, 1);
            $table->string('tagline')->nullable();
            $table->json('glance')->nullable();      // [{label, value}]
            $table->json('kpis')->nullable();        // {opportunities, projects, investors, funders, corridors, sectors, risk}
            $table->json('economy')->nullable();     // [{label, value, display}]
            $table->json('key_sectors')->nullable(); // [sector slug]
            $table->json('evidence')->nullable();    // {updated, confidence, verification, sources}
            $table->timestamps();
        });

        Schema::create('aiim_sectors', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->default('factory');
            $table->string('summary')->nullable();
            $table->json('scores')->nullable();      // {province-slug: score}
            $table->json('profile')->nullable();     // overview, performance, subsectors, risks, evidence
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('aiim_projects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();        // OPP-GA-DCC-001
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('kind')->default('both'); // opportunity | project | both
            $table->string('summary', 300)->nullable();
            $table->string('province_slug')->index();
            $table->string('sector_slug')->index();
            $table->string('location')->nullable();
            $table->string('type');                  // Greenfield Project, Expansion Project ...
            $table->string('stage');                 // Feasibility, Implementation ...
            $table->unsignedBigInteger('size_min_zar')->default(0);
            $table->unsignedBigInteger('size_max_zar')->default(0);
            $table->decimal('score', 5, 1)->default(0);
            $table->string('opportunity_level')->default('High Opportunity');
            $table->unsignedTinyInteger('confidence')->default(80);
            $table->string('verification')->default('human-reviewed');
            $table->string('source_code')->nullable();
            $table->string('icon')->default('building-2');
            $table->date('added_on')->nullable();
            $table->date('next_review_on')->nullable();
            $table->json('details')->nullable();     // metrics, highlights, funds, market, contacts, compare metrics
            $table->json('premium')->nullable();     // locked object definition
            $table->timestamps();
        });

        Schema::create('aiim_organisations', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('kind');                  // investor | funder
            $table->string('name');
            $table->string('short_name')->nullable();
            $table->string('type');                  // Venture Capital, DFI ...
            $table->string('summary', 300)->nullable();
            $table->json('focus')->nullable();       // [string]
            $table->json('stages')->nullable();      // [string]
            $table->json('instruments')->nullable(); // [string]
            $table->string('beneficiaries')->nullable();
            $table->unsignedBigInteger('ticket_min_zar')->default(0);
            $table->unsignedBigInteger('ticket_max_zar')->default(0);
            $table->string('location')->nullable();
            $table->string('origin')->default('South Africa');
            $table->decimal('match_score', 5, 1)->default(0);
            $table->unsignedTinyInteger('confidence')->default(80);
            $table->string('verification')->default('human-reviewed');
            $table->json('sector_slugs')->nullable();
            $table->date('added_on')->nullable();
            $table->json('profile')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_corridors', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('type');                  // SADC, Multilateral, Global, Emerging, Bilateral
            $table->string('countries');
            $table->string('route');
            $table->string('agreement');
            $table->json('modes')->nullable();       // road, rail, sea, air
            $table->decimal('score', 5, 1)->default(0);
            $table->unsignedBigInteger('volume_zar')->default(0);
            $table->string('sectors')->nullable();
            $table->string('destination_region')->nullable();
            $table->string('infrastructure')->nullable();
            $table->unsignedTinyInteger('confidence')->default(80);
            $table->date('added_on')->nullable();
            $table->json('profile')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_sources', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();        // SRC-SA-GOV-001 / IMF-WEO-2025-04
            $table->string('name');
            $table->string('provider');
            $table->string('category');
            $table->string('data_type')->nullable();
            $table->string('coverage')->nullable();
            $table->unsignedTinyInteger('tier')->default(1);
            $table->string('confidence_model')->default('CM-01');
            $table->unsignedTinyInteger('confidence')->default(90);
            $table->string('verification_status')->default('verified'); // verified | review | pending | rejected
            $table->string('status')->default('active');
            $table->date('last_updated')->nullable();
            $table->date('next_review')->nullable();
            $table->json('profile')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_briefs', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('title');
            $table->string('category');
            $table->string('format')->default('PDF');
            $table->string('size_label')->nullable(); // 32 pages / 150+ metrics
            $table->string('published')->nullable();  // May 2025
            $table->string('province_slug')->nullable();
            $table->unsignedInteger('price_zar');     // incl. VAT display price
            $table->unsignedInteger('enterprise_from_zar')->nullable();
            $table->string('badge')->nullable();
            $table->unsignedInteger('popularity')->default(0);
            $table->string('summary', 400)->nullable();
            $table->string('image')->default('city');
            $table->json('profile')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_fee_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('category');
            $table->string('fee_type');               // Pay per Use, Subscription, Success Fee ...
            $table->string('pricing_model');          // Fixed, Annual, Per item, At cost, Success %
            $table->decimal('amount_zar', 12, 2)->default(0);
            $table->decimal('rate', 6, 2)->nullable(); // percentage based codes
            $table->string('basis')->nullable();       // Per item / At cost / Per quote
            $table->json('components')->nullable();
            $table->string('trigger')->nullable();
            $table->string('refund_policy')->nullable();
            $table->string('status')->default('active');
            $table->date('effective_from')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_advisors', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('title');
            $table->unsignedTinyInteger('years');
            $table->json('strengths')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_saved_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('list')->default('saved');  // saved | watchlist
            $table->string('entity_type');             // opportunity, project, investor, funder, corridor, report, source, sector
            $table->string('entity_key');
            $table->string('label');
            $table->boolean('alerts')->default(true);
            $table->timestamps();
            $table->unique(['user_id', 'list', 'entity_type', 'entity_key'], 'aiim_saved_unique');
        });

        Schema::create('aiim_comparisons', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('items');                     // [{type, key}]
            $table->boolean('saved')->default(false);
            $table->timestamps();
        });

        Schema::create('aiim_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->boolean('auto_recharge')->default(false);
            $table->unsignedInteger('auto_recharge_threshold_zar')->default(500);
            $table->unsignedInteger('auto_recharge_amount_zar')->default(2000);
            $table->timestamps();
        });

        Schema::create('aiim_wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');                    // top-up | debit | credit
            $table->decimal('amount_zar', 12, 2);      // signed
            $table->decimal('balance_zar', 12, 2);
            $table->string('description');
            $table->foreignId('order_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('related_key')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_quotes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // AIIM-QUOTE-20250506-001
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('items');                     // [{type, key, label}]
            $table->json('lines');                     // fee components
            $table->decimal('subtotal_zar', 12, 2);
            $table->decimal('vat_zar', 12, 2);
            $table->decimal('total_zar', 12, 2);
            $table->string('status')->default('pending'); // pending | paid | expired
            $table->string('hash', 64);
            $table->date('valid_until');
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('aiim_entitlements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // ENT-20250506-7890
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('object_type');             // project | brief | report | premium
            $table->string('object_key');
            $table->string('title');
            $table->string('product_type')->nullable();
            $table->string('access_type');             // pay-per-view | permanent | premium-access
            $table->unsignedInteger('views_included')->nullable();
            $table->unsignedInteger('views_used')->default(0);
            $table->decimal('extra_view_zar', 10, 2)->nullable();
            $table->decimal('amount_zar', 12, 2)->default(0);
            $table->string('payment_method')->nullable();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_line_key')->nullable();
            $table->string('status')->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['order_id', 'order_line_key'], 'aiim_ent_order_line');
            $table->index(['user_id', 'object_type', 'object_key']);
        });

        Schema::create('aiim_report_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // REP-20250506-0037
            $table->string('quote_reference')->nullable()->unique(); // AIIM-QR-...
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('brief_sku')->nullable();
            $table->string('title');
            $table->string('report_type');
            $table->json('config');
            $table->unsignedTinyInteger('step')->default(1);
            $table->json('lines')->nullable();
            $table->decimal('subtotal_zar', 12, 2)->default(0);
            $table->decimal('vat_zar', 12, 2)->default(0);
            $table->decimal('total_zar', 12, 2)->default(0);
            $table->string('status')->default('draft'); // draft | quoted | changes_requested | paid | in_production | delivered
            $table->date('valid_until')->nullable();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('delivered_at')->nullable();
            $table->json('delivery')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_engagements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // ENG-20250507-001
            $table->string('mandate_reference')->nullable()->unique(); // MND-2025-05-07-001
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('advisor_id')->nullable()->constrained('aiim_advisors')->nullOnDelete();
            $table->string('type');                    // custom-intelligence | advisory
            $table->string('title');
            $table->string('status')->default('draft');
            $table->string('stage')->nullable();       // human readable workstream label
            $table->unsignedTinyInteger('progress')->default(0);
            $table->unsignedTinyInteger('step')->default(1);
            $table->json('request')->nullable();
            $table->string('booking_reference')->nullable();
            $table->timestamp('discovery_at')->nullable();
            $table->json('outcome')->nullable();
            $table->json('quote')->nullable();
            $table->timestamp('quote_accepted_at')->nullable();
            $table->timestamp('letter_accepted_at')->nullable();
            $table->string('signature_name')->nullable();
            $table->string('signature_title')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->string('signature_ip', 45)->nullable();
            $table->string('signature_hash', 64)->nullable();
            $table->foreignId('deposit_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamp('deposit_paid_at')->nullable();
            $table->foreignId('balance_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamp('balance_paid_at')->nullable();
            $table->json('workplan')->nullable();
            $table->json('deliverables')->nullable();
            $table->json('verification')->nullable();  // scope summary, approved external totals
            $table->json('deep_dive')->nullable();
            $table->json('packaging')->nullable();
            $table->json('delivery')->nullable();
            $table->string('status_before_pause')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->date('original_end_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_engagement_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engagement_id')->constrained('aiim_engagements')->cascadeOnDelete();
            $table->string('actor');
            $table->string('action');
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_verification_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engagement_id')->constrained('aiim_engagements')->cascadeOnDelete();
            $table->string('code');
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('recommendation');          // High | Medium | Low
            $table->boolean('selected')->default(false);
            $table->string('supplier')->nullable();
            $table->string('purpose')->nullable();
            $table->string('basis')->nullable();
            $table->decimal('supplier_cost_zar', 10, 2)->default(0);
            $table->decimal('expert_fee_zar', 10, 2)->default(0);
            $table->string('timeline')->nullable();
            $table->boolean('cost_approved')->default(false);
            $table->decimal('actual_cost_zar', 10, 2)->nullable();
            $table->string('status')->default('pending'); // pending | in_progress | completed | blocked | verified
            $table->string('owner')->nullable();
            $table->date('started_on')->nullable();
            $table->date('eta_on')->nullable();
            $table->string('confidence')->nullable();
            $table->unsignedTinyInteger('material_issues')->default(0);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('aiim_cases', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // CHG- / RFD- / DSP- / PSE- / CNL- / DEL-
            $table->foreignId('engagement_id')->nullable()->constrained('aiim_engagements')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');                    // scope-change | refund | dispute | pause | restart | cancellation | deletion
            $table->string('status');
            $table->json('payload')->nullable();
            $table->decimal('amount_zar', 12, 2)->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_introductions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // INT-2025-05-07-001
            $table->foreignId('engagement_id')->constrained('aiim_engagements')->cascadeOnDelete();
            $table->string('project_name');
            $table->json('project')->nullable();
            $table->json('sharing');                   // [{key, label, share: bool, state}]
            $table->string('status')->default('awaiting_consent'); // awaiting_consent | awaiting_counterparty | open | closed | withdrawn
            $table->string('consent_name')->nullable();
            $table->string('consent_title')->nullable();
            $table->timestamp('client_consented_at')->nullable();
            $table->json('activity')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_introduction_parties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('introduction_id')->constrained('aiim_introductions')->cascadeOnDelete();
            $table->string('name');
            $table->string('type');
            $table->string('focus')->nullable();
            $table->string('stage')->nullable();
            $table->unsignedTinyInteger('fit_score')->default(0);
            $table->string('location')->nullable();
            $table->boolean('selected')->default(true);
            $table->string('consent_status')->default('pending'); // pending | accepted | declined
            $table->string('engagement_status')->nullable();      // Interested | In Discussion | Awaiting response
            $table->timestamp('responded_at')->nullable();
            $table->string('contact')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_handoffs', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('engagement_id')->constrained('aiim_engagements')->cascadeOnDelete();
            $table->string('target');                  // dd | vdr | project-advisory
            $table->string('status')->default('pending_approval'); // pending_approval | approved | changes_requested | saved
            $table->json('packets');
            $table->json('summary')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->unique(['engagement_id', 'target']);
        });

        Schema::create('aiim_ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->string('reference');
            $table->foreignId('engagement_id')->nullable()->constrained('aiim_engagements')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');                    // payment | fee | adjustment | refund
            $table->string('description');
            $table->string('fee_code')->nullable();
            $table->string('category');
            $table->decimal('amount_zar', 12, 2);
            $table->decimal('vat_zar', 12, 2)->default(0);
            $table->string('status');                  // Paid | Billed | Approved | Refunded
            $table->string('document')->nullable();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('posted_at');
            $table->timestamps();
        });

        Schema::create('aiim_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('risk');                    // high | medium | low
            $table->string('category');
            $table->string('title');
            $table->string('entity')->nullable();
            $table->string('source')->nullable();
            $table->unsignedTinyInteger('confidence')->default(80);
            $table->string('status')->default('new');  // new | in_review | acknowledged
            $table->string('channel')->default('in-platform');
            $table->timestamp('raised_at');
            $table->timestamps();
        });

        Schema::create('aiim_api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('environment')->default('live'); // live | test
            $table->string('prefix', 16);
            $table->string('last_four', 4);
            $table->string('key_hash', 64);
            $table->string('status')->default('active');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('aiim_archive_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('name');
            $table->string('related');
            $table->date('archived_on');
            $table->date('retain_until');
            $table->string('size');
            $table->string('archived_by');
            $table->string('status')->default('archived'); // archived | deletion_requested | deleted
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'aiim_archive_items', 'aiim_api_keys', 'aiim_alerts', 'aiim_ledger_entries', 'aiim_handoffs',
            'aiim_introduction_parties', 'aiim_introductions', 'aiim_cases', 'aiim_verification_items',
            'aiim_engagement_events', 'aiim_engagements', 'aiim_report_requests', 'aiim_entitlements',
            'aiim_quotes', 'aiim_wallet_transactions', 'aiim_wallets', 'aiim_comparisons', 'aiim_saved_items',
            'aiim_advisors', 'aiim_fee_codes', 'aiim_briefs', 'aiim_sources', 'aiim_corridors',
            'aiim_organisations', 'aiim_projects', 'aiim_sectors', 'aiim_provinces',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
