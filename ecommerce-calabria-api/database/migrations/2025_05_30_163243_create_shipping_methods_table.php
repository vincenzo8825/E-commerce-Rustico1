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
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_zone_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();

            // Tipo di calcolo del costo
            $table->enum('calculation_type', ['fixed', 'percentage', 'weight', 'tiered'])->default('fixed');

            // Costi di base
            $table->decimal('base_cost', 8, 2)->default(0);
            $table->decimal('percentage', 5, 2)->nullable(); // Per calcolo percentuale
            $table->decimal('cost_per_kg', 8, 2)->nullable(); // Per calcolo a peso

            // Limiti di costo
            $table->decimal('min_cost', 8, 2)->nullable();
            $table->decimal('max_cost', 8, 2)->nullable();

            // Fasce di prezzo (JSON per calcolo tiered)
            $table->json('price_tiers')->nullable();

            // Tempi di consegna (in giorni)
            $table->integer('delivery_time')->default(3); // Tempo minimo
            $table->integer('delivery_time_max')->nullable(); // Tempo massimo

            // Caratteristiche del metodo
            $table->boolean('is_active')->default(true);
            $table->boolean('is_express')->default(false);
            $table->boolean('tracking_available')->default(true);
            $table->boolean('insurance_included')->default(false);
            $table->boolean('free_shipping_enabled')->default(false);

            // Supplementi
            $table->decimal('remote_area_surcharge', 8, 2)->nullable();

            // Ordinamento
            $table->integer('priority')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indici per performance
            $table->index(['shipping_zone_id', 'is_active']);
            $table->index(['is_active', 'priority']);
            $table->index('calculation_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};
