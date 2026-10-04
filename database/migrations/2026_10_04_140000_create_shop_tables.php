<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Online Shop: product master register (A1-A7 commercial acts), request objects
 * (quotes, briefs, retainer proposals, subscription mandates), entitlements,
 * ledger postings and the governance registers behind the Shop Admin Control Tower.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('code')->unique();          // product master code, e.g. MES-SPR-001
            $table->string('sprint_code')->nullable(); // source sprint code, e.g. SS-00045
            $table->string('name');
            $table->string('act', 2);                  // A1..A7
            $table->string('vehicle');                 // Services, Digital Product, Subscription, Retainer ...
            $table->string('vehicle_code', 8);         // VEH-02 ...
            $table->string('aisle')->nullable();
            $table->string('subcategory')->nullable();
            $table->string('icon')->default('target');
            $table->string('tagline', 400)->nullable();
            $table->text('summary')->nullable();
            $table->unsignedInteger('price_zar')->nullable();     // binding or "from" price, excl. VAT
            $table->string('price_unit')->nullable();             // null (one-off) | month
            $table->unsignedInteger('indicative_zar')->nullable(); // proposal-based indication
            $table->unsignedInteger('floor_zar')->nullable();
            $table->string('tax_treatment')->default('standard'); // standard, zero, exempt, out_of_scope
            $table->boolean('tax_confirmed')->default(true);
            $table->string('delivery')->nullable();
            $table->string('output_format')->nullable();
            $table->json('buyer_types')->nullable();
            $table->string('best_for')->nullable();
            $table->boolean('featured')->default(false);
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedInteger('reviews_count')->default(0);
            $table->unsignedInteger('source_records')->default(1);
            $table->json('aliases')->nullable();       // legacy / near-duplicate source names
            $table->json('content')->nullable();       // page content by section
            $table->json('variants')->nullable();      // tiers, licences, plans, commitment tiers
            $table->json('gates')->nullable();         // completeness, qa, rights, release, missing[]
            $table->json('recurrence')->nullable();    // R1-R5 certification for A3
            $table->string('listing_state', 5)->nullable(); // LS-01..LS-06 (derived, never written directly)
            $table->string('gate_outcome')->nullable();     // passed, warning, blocked
            $table->json('gate_reasons')->nullable();
            $table->timestamp('gate_evaluated_at')->nullable();
            $table->string('version')->default('v1.0');
            $table->string('status')->default('active');    // active, draft, archived
            $table->timestamps();
            $table->index(['act', 'aisle', 'subcategory']);
        });

        Schema::create('shop_quotes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // TBCA-QTE-...
            $table->foreignId('submission_id')->nullable()->constrained('submissions')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('title');
            $table->string('category')->nullable();
            $table->string('licence')->nullable();
            $table->string('provider')->nullable();
            $table->string('jurisdiction')->default('South Africa');
            $table->string('engagement_type')->default('Project-Based');
            $table->string('email')->nullable();
            $table->unsignedSmallInteger('version')->default(1);
            $table->json('lines');                     // [{description, quantity, unit_zar}]
            $table->json('deliverables')->nullable();
            $table->json('terms')->nullable();
            $table->json('history')->nullable();       // previous versions [{version, total_zar, issued_at}]
            $table->text('provider_note')->nullable();
            $table->text('client_note')->nullable();
            $table->string('status')->default('issued'); // issued, changes_requested, accepted, declined, expired
            $table->date('valid_until')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_briefs', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_token')->nullable()->index();
            $table->foreignId('product_id')->nullable()->constrained('shop_products')->nullOnDelete();
            $table->string('title')->nullable();
            $table->unsignedTinyInteger('step')->default(1);
            $table->json('data')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, matching, proposals_received, provider_selected, closed, discarded
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_retainer_proposals', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_token')->nullable()->index();
            $table->foreignId('product_id')->nullable()->constrained('shop_products')->nullOnDelete();
            $table->unsignedTinyInteger('step')->default(1);
            $table->json('data')->nullable();
            $table->unsignedInteger('estimated_monthly_zar')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, capacity_review, proposal_issued, accepted, declined
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_mandates', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // MD-...
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->constrained('shop_products')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('plan');
            $table->unsignedInteger('amount_zar');
            $table->string('account_holder');
            $table->string('email');
            $table->date('start_date');
            $table->unsignedTinyInteger('billing_day')->default(1);
            $table->string('method')->default('card');
            $table->json('consents');
            $table->string('status')->default('new'); // new, pending_payment, active, cancelled
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_entitlements', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // ENT-...
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->nullOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('shop_products')->nullOnDelete();
            $table->string('name');
            $table->string('item_code');
            $table->string('type');                    // Sprint (VEH-02), Digital Product (VEH-03) ...
            $table->string('authority');               // VERIFIED_PAYMENT, APPROVED_CONTRACT, APPROVED_CREDIT, APPROVED_FREE_BASIS
            $table->string('status')->default('pending'); // pending, active, revoked, expired
            $table->string('email')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_ledger_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('ledger', 1);               // T, X, S, C
            $table->integer('amount_zar');
            $table->string('qbo_reference');           // INV-10458 / CR-10122
            $table->string('idempotency_key')->unique();
            $table->string('status')->default('posted');
            $table->timestamps();
        });

        Schema::create('shop_saved_baskets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_token')->nullable()->index();
            $table->string('name');
            $table->json('items');
            $table->timestamps();
        });

        Schema::create('shop_handoffs', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();     // HN-2026-0186
            $table->foreignId('product_id')->nullable()->constrained('shop_products')->nullOnDelete();
            $table->string('sprint_code');
            $table->string('product_name');
            $table->string('vehicle');
            $table->string('act');
            $table->string('professional')->nullable();
            $table->string('professional_type')->nullable();
            $table->string('stage')->default('client_trigger'); // client_trigger, boundary_check, professional_match, handoff_in_progress, accepted, closed, escalated
            $table->string('risk')->default('low');
            $table->string('boundary')->default('within'); // within, at_risk, breached, pending_review
            $table->string('client_name')->nullable();
            $table->string('client_email')->nullable();
            $table->text('notes')->nullable();
            $table->date('sla_due')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_product_id')->nullable()->constrained('shop_products')->nullOnDelete();
            $table->string('source_code');
            $table->string('source_name');
            $table->string('relationship_type');       // retainer, subscription, digital_product, sprint
            $table->string('legacy_relationship');
            $table->foreignId('destination_product_id')->nullable()->constrained('shop_products')->nullOnDelete();
            $table->string('destination_code')->nullable();
            $table->string('destination_name')->nullable();
            $table->string('destination_vehicle')->nullable();
            $table->string('destination_act')->nullable();
            $table->string('disposition')->default('HONEST_HOLD');
            $table->string('fit_reason')->nullable();
            $table->string('owner')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('shop_duplicate_groups', function (Blueprint $table) {
            $table->id();
            $table->string('group_code')->unique();    // DG-0001
            $table->string('title');
            $table->string('content_type');
            $table->unsignedInteger('duplicates');
            $table->string('canonical_code');
            $table->unsignedTinyInteger('match_score');
            $table->string('vehicle');
            $table->string('act');
            $table->string('status')->default('pending_review'); // pending_review, pending_validation, consolidated, rejected
            $table->json('members')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_retainer_capacities', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('product_id')->nullable()->constrained('shop_products')->nullOnDelete();
            $table->string('name');
            $table->decimal('allowance', 8, 2)->default(0); // C1
            $table->string('unit')->default('HOUR');
            $table->string('period')->default('Monthly');
            $table->string('scope')->nullable();            // C2
            $table->string('owner_model')->nullable();      // C3
            $table->string('owner')->nullable();
            $table->json('elements');                       // {c1..c5: bool}
            $table->decimal('reserved', 8, 2)->default(0);
            $table->decimal('utilised', 8, 2)->default(0);
            $table->unsignedTinyInteger('under_use_months')->default(0);
            $table->string('review_state')->nullable();     // null, under_review, right_sizing_proposed, adjusted
            $table->timestamps();
        });

        Schema::create('shop_release_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();          // MET-01
            $table->string('metric');
            $table->string('definition');
            $table->string('closure_method');
            $table->string('evidence')->nullable();
            $table->string('measured')->nullable();
            $table->string('target');
            $table->string('owner');
            $table->string('status')->default('open'); // open, closed
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_uat_cases', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();          // OS-UAT-041
            $table->string('scenario');
            $table->string('result')->default('not_executed'); // pass, fail, blocked, not_executed
            $table->string('executed_by')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->string('exception')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_audit_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('actor');
            $table->string('action');
            $table->string('subject');
            $table->string('summary');
            $table->string('version')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->json('value');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach ([
            'shop_settings', 'shop_audit_events', 'shop_uat_cases', 'shop_release_metrics', 'shop_retainer_capacities',
            'shop_duplicate_groups', 'shop_routes', 'shop_handoffs', 'shop_saved_baskets', 'shop_ledger_postings',
            'shop_entitlements', 'shop_mandates', 'shop_retainer_proposals', 'shop_briefs', 'shop_quotes', 'shop_products',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
