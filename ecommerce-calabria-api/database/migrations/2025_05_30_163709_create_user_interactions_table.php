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
        Schema::create('user_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');

            // Tipo di azione: view, purchase, add_to_cart, add_to_wishlist,
            // like, dislike, share, recommendation_click, recommendation_purchase, etc.
            $table->string('action_type', 50);

            // Contatore delle interazioni dello stesso tipo
            $table->integer('interaction_count')->default(1);

            // Peso/punteggio dell'interazione (utile per ML)
            $table->decimal('interaction_score', 5, 2)->default(1.0);

            // Timestamp ultima interazione
            $table->timestamp('last_interaction')->useCurrent();

            // Metadati aggiuntivi (JSON)
            $table->json('metadata')->nullable(); // es: durata visualizzazione, origine click, etc.

            // Sessione dell'utente per tracciare comportamenti anonimi
            $table->string('session_id', 100)->nullable();

            // Device/Browser info per personalizzazione
            $table->string('user_agent', 500)->nullable();
            $table->string('device_type', 50)->nullable(); // mobile, desktop, tablet

            // Geolocalizzazione per raccomandazioni locali
            $table->string('country_code', 2)->nullable();
            $table->string('city', 100)->nullable();

            // Referrer per capire come è arrivato al prodotto
            $table->string('referrer', 500)->nullable();

            $table->timestamps();

            // Indici per performance
            $table->index(['user_id', 'action_type'], 'idx_user_action');
            $table->index(['product_id', 'action_type'], 'idx_product_action');
            $table->index(['category_id', 'action_type'], 'idx_category_action');
            $table->index(['session_id', 'action_type'], 'idx_session_action');
            $table->index('last_interaction', 'idx_last_interaction');
            $table->index(['user_id', 'product_id', 'action_type'], 'idx_user_product_action');

            // Indice composto per query di raccomandazioni
            $table->index(['user_id', 'category_id', 'interaction_score'], 'idx_recommendations');

            // Unique constraint per evitare duplicati della stessa interazione
            $table->unique(['user_id', 'product_id', 'action_type'], 'unq_user_product_action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_interactions');
    }
};
