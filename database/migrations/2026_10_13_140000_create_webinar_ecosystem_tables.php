<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Webinars transaction ecosystem (WB-TEB): extends the shared webinar catalogue
 * (ins_webinars, also used by /resources/webinars) and adds the live-room,
 * feedback and staff-console registers.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ins_webinars', function (Blueprint $table) {
            $table->string('category')->default('strategy');
            // draft, awaiting_w1, approved, live, ended, awaiting_w3, published, edited, withheld, corrected, withdrawn
            $table->string('state')->default('approved');
            $table->string('format')->default('Online (Zoom)');
            $table->string('languages')->default('English | Afrikaans');
            $table->unsignedInteger('price_zar')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->boolean('featured')->default(false);
            $table->json('details')->nullable();
            $table->dateTime('replay_published_at')->nullable();
            $table->unsignedInteger('views')->default(0);
        });

        Schema::table('ins_webinar_registrations', function (Blueprint $table) {
            $table->string('participation')->default('live_recorded'); // live_recorded, live_hidden, replay_only
            $table->string('industry')->nullable();
            $table->string('source')->default('TBCA Website');
            $table->string('status')->default('registered'); // registered, cancelled
            $table->string('attendance')->default('pending'); // pending, attended, partial, no_show
            $table->dateTime('joined_at')->nullable();
            $table->dateTime('left_at')->nullable();
            $table->unsignedSmallInteger('watch_minutes')->default(0);
            $table->unsignedSmallInteger('chat_count')->default(0);
            $table->unsignedSmallInteger('poll_count')->default(0);
            $table->unsignedSmallInteger('download_count')->default(0);
            $table->string('consent_state')->default('full'); // full, limited, pending, declined
            $table->string('certificate')->default('not_issued'); // issued, not_issued
            $table->string('followup_status')->nullable(); // sent, pending
            $table->dateTime('followup_sent_at')->nullable();
            $table->json('notices')->nullable();
            $table->text('notes')->nullable();
        });

        Schema::create('wb_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webinar_id')->constrained('ins_webinars')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('category')->default('General Question');
            $table->string('body', 600);
            $table->boolean('anonymous')->default(false);
            $table->boolean('priority')->default(false);
            $table->boolean('pinned')->default(false);
            $table->string('status')->default('pending'); // pending, approved, answered, dismissed
            $table->unsignedInteger('upvotes')->default(0);
            $table->dateTime('asked_at');
            $table->timestamps();
        });

        Schema::create('wb_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webinar_id')->constrained('ins_webinars')->cascadeOnDelete();
            $table->string('name');
            $table->string('body', 600);
            $table->boolean('is_host')->default(false);
            $table->dateTime('posted_at');
            $table->timestamps();
        });

        Schema::create('wb_polls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webinar_id')->constrained('ins_webinars')->cascadeOnDelete();
            $table->string('question');
            $table->json('options'); // [{label, votes}]
            $table->string('status')->default('upcoming'); // upcoming, active, closed
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('wb_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('wb_polls')->cascadeOnDelete();
            $table->string('voter');
            $table->unsignedSmallInteger('option');
            $table->timestamps();
            $table->unique(['poll_id', 'voter']);
        });

        Schema::create('wb_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webinar_id')->constrained('ins_webinars')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('relevance');
            $table->json('valuable')->nullable();
            $table->string('topics', 500)->nullable();
            $table->boolean('contact_ok')->default(false);
            $table->timestamps();
        });

        Schema::create('wb_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webinar_id')->constrained('ins_webinars')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('owner_key');
            $table->text('body');
            $table->timestamps();
            $table->unique(['webinar_id', 'owner_key']);
        });

        // Generic staff-console register: tasks, claims, guests, incidents, risks, offers, channels ...
        Schema::create('wb_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webinar_id')->nullable()->constrained('ins_webinars')->cascadeOnDelete();
            $table->string('kind')->index();
            $table->string('code')->nullable();
            $table->string('title');
            $table->string('status')->nullable();
            $table->json('data')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['wb_records', 'wb_notes', 'wb_feedback', 'wb_poll_votes', 'wb_polls', 'wb_chat_messages', 'wb_questions'] as $t) {
            Schema::dropIfExists($t);
        }

        Schema::table('ins_webinar_registrations', function (Blueprint $table) {
            $table->dropColumn(['participation', 'industry', 'source', 'status', 'attendance', 'joined_at', 'left_at', 'watch_minutes', 'chat_count', 'poll_count', 'download_count', 'consent_state', 'certificate', 'followup_status', 'followup_sent_at', 'notices', 'notes']);
        });

        Schema::table('ins_webinars', function (Blueprint $table) {
            $table->dropColumn(['category', 'state', 'format', 'languages', 'price_zar', 'capacity', 'featured', 'details', 'replay_published_at', 'views']);
        });
    }
};
