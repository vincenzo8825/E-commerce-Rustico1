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
        // Indici per la tabella products
        Schema::table('products', function (Blueprint $table) {
            // Indici per ordinamento e filtri comuni
            $table->index('created_at');
            $table->index('updated_at');
            $table->index(['is_active', 'is_featured']); // Filtro combinato comune
        });

        // Indici per la tabella orders
        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            $table->index('is_paid');
        });

        // Indici per la tabella order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id');
            $table->index('product_id');
        });

        // Indici per la tabella cart_items
        Schema::table('cart_items', function (Blueprint $table) {
            $table->index(['cart_id', 'product_id']); // Per trovare rapidamente un prodotto nel carrello
        });

        // Indici per la tabella favorites
        Schema::table('favorites', function (Blueprint $table) {
            $table->index(['user_id', 'product_id']); // Per verificare rapidamente se un prodotto è tra i preferiti
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rimozione indici dalla tabella products
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['updated_at']);
            $table->dropIndex(['is_active', 'is_featured']);
        });

        // Rimozione indici dalla tabella orders
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['is_paid']);
        });

        // Rimozione indici dalla tabella order_items
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropIndex(['product_id']);
        });

        // Rimozione indici dalla tabella cart_items
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropIndex(['cart_id', 'product_id']);
        });

        // Rimozione indici dalla tabella favorites
        Schema::table('favorites', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'product_id']);
        });
    }
};
