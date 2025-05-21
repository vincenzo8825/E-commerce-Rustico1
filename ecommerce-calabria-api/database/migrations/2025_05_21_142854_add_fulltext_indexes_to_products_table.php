<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Aggiunta di indici fulltext per migliorare le prestazioni delle ricerche
            DB::statement('ALTER TABLE products ADD FULLTEXT search_index (name, description, ingredients)');

            // Aggiungiamo un indice su category_id per migliorare le prestazioni dei filtri
            $table->index('category_id');

            // Aggiungiamo un indice su price per migliorare le prestazioni degli ordinamenti
            $table->index('price');

            // Aggiungiamo un indice su stock per migliorare le prestazioni dei filtri
            $table->index('stock');

            // Indice su is_featured e is_active per i filtri dei prodotti in evidenza e attivi
            $table->index('is_featured');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Rimozione dell'indice fulltext
            DB::statement('ALTER TABLE products DROP INDEX search_index');

            // Rimozione degli altri indici
            $table->dropIndex(['category_id']);
            $table->dropIndex(['price']);
            $table->dropIndex(['stock']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['is_active']);
        });
    }
};
