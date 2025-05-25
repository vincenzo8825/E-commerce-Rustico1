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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('rating')->unsigned()->comment('Valutazione da 1 a 5 stelle');
            $table->string('title')->nullable()->comment('Titolo della recensione');
            $table->text('comment')->nullable()->comment('Commento della recensione');
            $table->boolean('verified_purchase')->default(false)->comment('Acquisto verificato');
            $table->boolean('is_approved')->default(true)->comment('Recensione approvata');
            $table->integer('helpful_count')->default(0)->comment('Conteggio utilità');
            $table->json('images')->nullable()->comment('Immagini allegate alla recensione');
            $table->timestamps();

            // Indici per performance
            $table->index(['product_id', 'is_approved']);
            $table->index(['user_id', 'product_id']);
            $table->index('rating');

            // Constraint: un utente può fare solo una recensione per prodotto
            $table->unique(['user_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
