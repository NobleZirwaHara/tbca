<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Shared platform records used by every section: client identity, the sprint
 * catalogue, the basket, orders and payments, bookings, generic form
 * submissions and saved items.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('client_id')->nullable()->unique();
            $table->string('role')->default('client'); // client, admin, partner
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('job_title')->nullable();
            $table->string('country', 2)->default('ZA');
            $table->string('client_type')->nullable(); // sme, founder, corporate, investor, ngo, public, sponsor
            $table->json('profile')->nullable();
        });

        Schema::create('sprints', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('type');                 // dashboard, retainer, checklist, technology-setup ...
            $table->string('category')->nullable(); // business-management, ai-automation, data-dashboards ...
            $table->string('subcategory')->nullable();
            $table->string('audience')->nullable();
            $table->string('summary', 500)->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('price_zar')->nullable(); // "From" price; null means quote only
            $table->string('delivery')->nullable();
            $table->string('commercial_act')->default('purchase'); // purchase, quote, subscription, retainer, free
            $table->json('packages')->nullable();   // [{key, name, zar, features[], popular}]
            $table->json('attributes')->nullable(); // type-specific data
            $table->boolean('featured')->default(false);
            $table->boolean('popular')->default(false);
            $table->boolean('is_new')->default(false);
            $table->decimal('rating', 2, 1)->nullable();
            $table->string('status')->default('published');
            $table->timestamps();
            $table->index(['type', 'category']);
        });

        Schema::create('basket_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->string('item_type');   // sprint, digital-product, subscription, retainer, report, credits ...
            $table->string('item_code');
            $table->string('name');
            $table->string('variant')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('unit_zar');
            $table->string('commercial_act')->default('purchase');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('section')->default('shop'); // shop, sprints, aiim, vdr, due-diligence ...
            $table->string('status')->default('awaiting_payment'); // awaiting_payment, paid, failed, cancelled, refunded
            $table->string('currency', 3)->default('ZAR');
            $table->unsignedInteger('subtotal_zar');
            $table->unsignedInteger('vat_zar');
            $table->unsignedInteger('fees_zar')->default(0);
            $table->unsignedInteger('total_zar');
            $table->json('billing')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('item_type');
            $table->string('item_code');
            $table->string('name');
            $table->string('variant')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('unit_zar');
            $table->unsignedInteger('line_zar');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->string('method'); // card, eft, wallet
            $table->string('status'); // pending, succeeded, failed
            $table->unsignedInteger('amount_zar');
            $table->string('failure_reason')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('discovery-call');
            $table->string('topic')->nullable();
            $table->dateTime('starts_at');
            $table->unsignedSmallInteger('duration_minutes')->default(30);
            $table->string('channel')->default('video'); // video, phone, in-person
            $table->string('status')->default('confirmed'); // confirmed, rescheduled, cancelled, completed
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->index(); // question, contact, quote-request, complaint, job-application ...
            $table->string('section')->nullable();
            $table->string('subject')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->json('payload')->nullable();
            $table->string('status')->default('received'); // received, in_review, responded, closed
            $table->timestamps();
        });

        Schema::create('saved_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('item_type');
            $table->string('item_key');
            $table->string('label');
            $table->string('url')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'item_type', 'item_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_items');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('basket_items');
        Schema::dropIfExists('sprints');
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['client_id']);
            $table->dropColumn(['client_id', 'role', 'phone', 'company', 'job_title', 'country', 'client_type', 'profile']);
        });
    }
};
