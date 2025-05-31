<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('newsletters', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->string('token', 64)->unique(); // Token per gestire unsubscribe
            $table->boolean('is_active')->default(true);
            $table->json('preferences')->nullable(); // Preferenze di categoria per newsletter
            $table->string('source')->default('website'); // Fonte della subscription
            $table->timestamp('subscribed_at')->nullable();
            $table->timestamp('unsubscribed_at')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();

            $table->index(['email', 'is_active']);
            $table->index('token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('newsletters');
    }
};
