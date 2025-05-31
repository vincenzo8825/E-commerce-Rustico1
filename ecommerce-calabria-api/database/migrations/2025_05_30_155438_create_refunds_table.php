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
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('refund_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->decimal('final_amount', 10, 2)->nullable();
            $table->text('reason');
            $table->enum('status', ['pending', 'processing', 'approved', 'rejected', 'failed'])->default('pending');
            $table->enum('refund_type', ['full', 'partial', 'item_specific'])->default('full');
            $table->timestamp('requested_at');
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('admin_notes')->nullable();
            $table->json('items')->nullable(); // Prodotti specifici da rimborsare
            $table->timestamps();

            // Indici per performance
            $table->index(['user_id', 'status']);
            $table->index(['order_id', 'status']);
            $table->index('status');
            $table->index('requested_at');
            $table->index('refund_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
