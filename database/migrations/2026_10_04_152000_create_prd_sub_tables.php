<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Subscriptions family (Subscriptions Transaction Ecosystem Blueprint v2.0).
 *
 *  prd_sub_plans          governed recurring plans (recurrence class R1-R5, price, floor, profiles)
 *  prd_sub_subscriptions  a client's recurring relationship and its lifecycle state
 *  prd_sub_events         event envelope / audit trail for every state, money and entitlement change
 *  prd_sub_exports        data export requests (data floor)
 *  prd_sub_ops            admin operating records: billing runs, deliveries, dunning and disuse cases,
 *                         deferred-revenue lines, churn records, capacity pools, recurrence test runs
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prd_sub_plans', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tier')->nullable();          // essentials, growth, professional, enterprise, custom, product
            $table->string('ladder')->nullable();        // plans a subscriber can move between
            $table->string('category')->nullable();      // Intelligence Dashboards, Market Monitoring ...
            $table->string('recurrence_class', 2);       // R1..R5 (R0 = retired / legacy)
            $table->string('product_type')->default('Subscription Product');
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->text('what_recurs')->nullable();
            $table->text('why_recurs')->nullable();
            $table->text('next_period_value')->nullable();
            $table->text('who_for')->nullable();
            $table->unsignedInteger('monthly_zar')->nullable(); // null = custom / tailored pricing (quote route)
            $table->unsignedInteger('usd_monthly')->nullable();
            $table->unsignedTinyInteger('annual_discount_pct')->default(15);
            $table->boolean('annual_available')->default(true);
            $table->unsignedSmallInteger('min_term_months')->default(1);
            $table->string('delivery_cadence')->nullable();
            $table->string('cancellation_route')->default('Cancel anytime in Portal');
            $table->boolean('pause_allowed')->default(true);
            $table->unsignedInteger('cost_zar')->nullable();   // monthly direct + indirect cost to serve
            $table->unsignedInteger('floor_zar')->nullable();  // price floor ex VAT
            $table->boolean('sales_blocked')->default(false);
            $table->boolean('popular')->default(false);
            $table->json('features')->nullable();
            $table->json('entitlements')->nullable();
            $table->json('details')->nullable();         // recurrence & delivery rows, matrix values, chips
            $table->string('status')->default('live');   // live, under_review, retired
            $table->string('recurrence_gate')->nullable(); // PASS or failure code (GATE-SU-01)
            $table->string('evidence_id')->nullable();
            $table->date('certified_until')->nullable();
            $table->string('jurisdiction', 2)->default('ZA');
            $table->unsignedSmallInteger('sort')->default(100);
            $table->timestamps();
            $table->index(['recurrence_class', 'status']);
        });

        Schema::create('prd_sub_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plan_id')->constrained('prd_sub_plans');
            $table->foreignId('pending_plan_id')->nullable()->constrained('prd_sub_plans')->nullOnDelete();
            $table->string('status')->default('PENDING_PAYMENT');
            $table->string('billing_interval')->default('monthly'); // monthly, annual
            $table->unsignedInteger('price_zar');                   // contracted price per interval, ex VAT
            $table->string('currency', 3)->default('ZAR');
            $table->string('order_reference')->nullable()->index();
            $table->timestamp('started_at')->nullable();
            $table->date('current_period_start')->nullable();
            $table->date('current_period_end')->nullable();
            $table->date('next_charge_at')->nullable();
            $table->date('next_review_at')->nullable();
            $table->unsignedSmallInteger('min_term_months')->default(1);
            $table->json('mandate')->nullable();
            $table->date('pause_until')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamp('cancel_requested_at')->nullable();
            $table->date('cancel_effective_at')->nullable();
            $table->string('cancel_reason')->nullable();
            $table->string('churn_code')->nullable();
            $table->boolean('disuse_flagged')->default(false);
            $table->timestamp('disuse_flagged_at')->nullable();
            $table->timestamp('disuse_notified_at')->nullable();
            $table->json('price_change')->nullable();
            $table->timestamp('renewal_notice_at')->nullable();
            $table->timestamp('payment_failed_at')->nullable();
            $table->unsignedInteger('overdue_zar')->default(0);
            $table->json('usage')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('prd_sub_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->nullable()->constrained('prd_sub_subscriptions')->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained('prd_sub_plans')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('actor_role')->default('client');
            $table->string('event_type');
            $table->string('previous_state')->nullable();
            $table->string('new_state')->nullable();
            $table->boolean('money_effect')->default(false);
            $table->boolean('entitlement_effect')->default(false);
            $table->string('idempotency_key')->nullable()->unique();
            $table->json('payload')->nullable();
            $table->timestamps();
            $table->index(['subscription_id', 'event_type']);
        });

        Schema::create('prd_sub_exports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('prd_sub_subscriptions')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('export_type');
            $table->string('file_type');
            $table->string('status')->default('Completed'); // Completed, Processing
            $table->string('size_label')->nullable();
            $table->timestamp('requested_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('prd_sub_ops', function (Blueprint $table) {
            $table->id();
            $table->string('kind');                 // billing_run, delivery, dunning_case, disuse_case, deferred_line, churn, capacity, recurrence_run, adjustment, action_plan
            $table->string('reference')->nullable();
            $table->string('title')->nullable();
            $table->string('client')->nullable();
            $table->string('plan_name')->nullable();
            $table->string('recurrence_class', 2)->nullable();
            $table->string('status')->nullable();
            $table->integer('amount_zar')->nullable();
            $table->timestamp('due_at')->nullable();
            $table->foreignId('subscription_id')->nullable()->constrained('prd_sub_subscriptions')->nullOnDelete();
            $table->json('data')->nullable();
            $table->timestamps();
            $table->index(['kind', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prd_sub_ops');
        Schema::dropIfExists('prd_sub_exports');
        Schema::dropIfExists('prd_sub_events');
        Schema::dropIfExists('prd_sub_subscriptions');
        Schema::dropIfExists('prd_sub_plans');
    }
};
