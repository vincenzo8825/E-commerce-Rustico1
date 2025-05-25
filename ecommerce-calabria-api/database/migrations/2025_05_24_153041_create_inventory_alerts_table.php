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
        Schema::create('inventory_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('alert_type', ['low_stock', 'out_of_stock', 'reorder_point'])->default('low_stock');
            $table->integer('threshold')->default(5); // Soglia minima per alert
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_triggered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Index per performance
            $table->index(['product_id', 'alert_type']);
            $table->index(['is_active', 'threshold']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_alerts');
    }
};
