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
        Schema::table('products', function (Blueprint $table) {
            $table->text('certifications')->nullable()->after('producer')
                  ->comment('Certificazioni del prodotto (DOP, IGP, BIO, etc.)');
            $table->text('allergens')->nullable()->after('certifications')
                  ->comment('Allergeni presenti nel prodotto');
            $table->text('short_description')->nullable()->after('description')
                  ->comment('Breve descrizione per ricerca e anteprima');
            $table->integer('stock_quantity')->default(0)->after('stock')
                  ->comment('Quantità in magazzino');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['certifications', 'allergens', 'short_description', 'stock_quantity']);
        });
    }
};
