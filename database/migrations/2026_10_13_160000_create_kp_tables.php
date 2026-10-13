<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * KP Thought Leadership registers: requests, governance console records, corrections
 * and KP Knowledge Assistant answers.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kp_records', function (Blueprint $table) {
            $table->id();
            $table->string('kind')->index();
            $table->string('code')->nullable()->index();
            $table->string('title');
            $table->string('status')->nullable();
            $table->json('data')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('kp_answers', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('question', 500);
            $table->string('knowledge_key')->nullable();
            $table->string('topic')->nullable();
            $table->string('status')->default('answered'); // answered, abstained, corrected
            $table->unsignedTinyInteger('confidence')->default(0);
            $table->json('answer')->nullable();
            $table->json('sources')->nullable();
            $table->json('context')->nullable();
            $table->string('owner_key')->nullable()->index();
            $table->string('feedback')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kp_answers');
        Schema::dropIfExists('kp_records');
    }
};
