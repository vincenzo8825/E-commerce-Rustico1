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
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('countries'); // Array di codici paese (IT, FR, DE, etc.)
            $table->json('postal_codes')->nullable(); // Array di CAP specifici (opzionale)
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Ordine di priorità
            $table->timestamps();
            $table->softDeletes();

            // Indici per performance
            $table->index(['is_active', 'priority']);
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_zones');
    }
};
