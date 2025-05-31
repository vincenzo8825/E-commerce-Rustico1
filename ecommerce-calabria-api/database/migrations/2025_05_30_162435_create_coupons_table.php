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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'])->default('percentage');
            $table->decimal('value', 10, 2);
            $table->decimal('minimum_amount', 10, 2)->nullable();
            $table->decimal('maximum_discount', 10, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('user_usage_limit')->nullable();
            $table->integer('usage_count')->default(0);
            $table->decimal('total_discount_given', 12, 2)->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->json('applicable_products')->nullable();
            $table->json('applicable_categories')->nullable();
            $table->boolean('auto_apply')->default(false);
            $table->integer('priority')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indici per performance
            $table->index(['code', 'is_active']);
            $table->index(['is_active', 'starts_at', 'expires_at']);
            $table->index('user_id');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
