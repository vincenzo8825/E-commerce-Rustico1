<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Recupera le categorie esistenti
        $categories = Category::all();

        // Array di prodotti raggruppati per categoria
        $productsByCategory = [
            'Salumi Calabresi' => [
                [
                    'name' => 'Nduja di Spilinga',
                    'description' => 'La Nduja è un salume spalmabile tipico della Calabria, dal gusto piccante. Ottima da spalmare sul pane o da utilizzare come condimento per la pasta.',
                    'price' => 9.90,
                    'discount_price' => null,
                    'sku' => 'SAL001',
                    'stock' => 50,
                    'weight' => 300,
                    'is_featured' => true,
                ],
                [
                    'name' => 'Soppressata Calabrese',
                    'description' => 'Salame tipico calabrese a grana grossa, aromatizzato con pepe nero e peperoncino. Stagionatura minima 3 mesi.',
                    'price' => 15.50,
                    'discount_price' => 13.90,
                    'sku' => 'SAL002',
                    'stock' => 35,
                    'weight' => 400,
                    'is_featured' => true,
                ],
                [
                    'name' => 'Capicollo di Calabria',
                    'description' => 'Capicollo di suino stagionato e aromatizzato con pepe nero e peperoncino piccante calabrese. Prodotto artigianale.',
                    'price' => 12.80,
                    'discount_price' => null,
                    'sku' => 'SAL003',
                    'stock' => 40,
                    'weight' => 450,
                    'is_featured' => false,
                ],
            ],
            'Formaggi Tipici' => [
                [
                    'name' => 'Caciocavallo Silano DOP',
                    'description' => 'Formaggio a pasta filata tipico del Sud Italia, prodotto con latte vaccino. Stagionatura minima 3 mesi.',
                    'price' => 18.90,
                    'discount_price' => null,
                    'sku' => 'FOR001',
                    'stock' => 30,
                    'weight' => 700,
                    'is_featured' => true,
                ],
                [
                    'name' => 'Pecorino Crotonese DOP',
                    'description' => 'Formaggio a pasta dura, prodotto con latte ovino. Sapore intenso e leggermente piccante.',
                    'price' => 16.50,
                    'discount_price' => null,
                    'sku' => 'FOR002',
                    'stock' => 25,
                    'weight' => 500,
                    'is_featured' => false,
                ],
                [
                    'name' => 'Ricotta Affumicata Calabrese',
                    'description' => 'Ricotta vaccina affumicata secondo l\'antica tradizione calabrese. Ideale per insaporire primi piatti.',
                    'price' => 7.90,
                    'discount_price' => null,
                    'sku' => 'FOR003',
                    'stock' => 45,
                    'weight' => 250,
                    'is_featured' => false,
                ],
            ],
            'Olio d\'Oliva' => [
                [
                    'name' => 'Olio Extra Vergine di Oliva Biologico',
                    'description' => 'Olio extravergine ottenuto da olive della varietà Carolea, coltivate biologicamente. Fruttato medio con note di carciofo.',
                    'price' => 19.90,
                    'discount_price' => 17.90,
                    'sku' => 'OLI001',
                    'stock' => 60,
                    'weight' => 750,
                    'is_featured' => true,
                ],
                [
                    'name' => 'Olio EVO DOP Bruzio',
                    'description' => 'Olio extravergine di oliva DOP prodotto in provincia di Cosenza da olive Carolea e Rossanese.',
                    'price' => 22.50,
                    'discount_price' => null,
                    'sku' => 'OLI002',
                    'stock' => 40,
                    'weight' => 500,
                    'is_featured' => false,
                ],
            ],
            'Conserve e Sottoli' => [
                [
                    'name' => 'Peperoncini Ripieni al Tonno',
                    'description' => 'Peperoncini piccanti calabresi ripieni di tonno e capperi, conservati in olio extra vergine di oliva.',
                    'price' => 8.90,
                    'discount_price' => null,
                    'sku' => 'CON001',
                    'stock' => 55,
                    'weight' => 280,
                    'is_featured' => false,
                ],
                [
                    'name' => 'Melanzane Sott\'Olio',
                    'description' => 'Melanzane grigliate e marinate con aglio, menta e peperoncino, conservate in olio extravergine di oliva.',
                    'price' => 7.50,
                    'discount_price' => null,
                    'sku' => 'CON002',
                    'stock' => 45,
                    'weight' => 300,
                    'is_featured' => true,
                ],
                [
                    'name' => 'Cipolla Rossa di Tropea IGP in Agrodolce',
                    'description' => 'Cipolla rossa di Tropea IGP in agrodolce, ideale come contorno o antipasto.',
                    'price' => 6.90,
                    'discount_price' => null,
                    'sku' => 'CON003',
                    'stock' => 50,
                    'weight' => 280,
                    'is_featured' => false,
                ],
            ],
            'Vini e Liquori' => [
                [
                    'name' => 'Cirò Rosso DOC',
                    'description' => 'Vino rosso prodotto da uve Gaglioppo, coltivate nella zona di Cirò. Sapore asciutto e caldo, con note di frutti rossi.',
                    'price' => 14.90,
                    'discount_price' => null,
                    'sku' => 'VIN001',
                    'stock' => 35,
                    'weight' => 750,
                    'is_featured' => true,
                ],
                [
                    'name' => 'Liquore al Bergamotto',
                    'description' => 'Liquore ottenuto dalla macerazione delle bucce di bergamotto in alcool. Gusto agrumato e rinfrescante.',
                    'price' => 19.50,
                    'discount_price' => null,
                    'sku' => 'LIQ001',
                    'stock' => 40,
                    'weight' => 500,
                    'is_featured' => true,
                ],
            ],
            'Dolci Tipici' => [
                [
                    'name' => 'Torroncini al Bergamotto',
                    'description' => 'Torroncini morbidi aromatizzati al bergamotto, realizzati secondo la ricetta tradizionale calabrese.',
                    'price' => 8.90,
                    'discount_price' => null,
                    'sku' => 'DOL001',
                    'stock' => 65,
                    'weight' => 200,
                    'is_featured' => false,
                ],
                [
                    'name' => 'Mostaccioli Calabresi',
                    'description' => 'Biscotti tipici calabresi a base di mosto cotto d\'uva, miele e spezie. Decorati a mano.',
                    'price' => 9.50,
                    'discount_price' => 7.90,
                    'sku' => 'DOL002',
                    'stock' => 30,
                    'weight' => 300,
                    'is_featured' => true,
                ],
            ],
            'Pasta Artigianale' => [
                [
                    'name' => 'Fileja Calabresi',
                    'description' => 'Pasta fresca artigianale tipica calabrese, fatta a mano. Ideale con sughi di carne o con la nduja.',
                    'price' => 7.90,
                    'discount_price' => null,
                    'sku' => 'PAS001',
                    'stock' => 40,
                    'weight' => 500,
                    'is_featured' => true,
                ],
                [
                    'name' => 'Pasta di Semola al Peperoncino',
                    'description' => 'Pasta di semola di grano duro con aggiunta di peperoncino calabrese. Formato spaghetti.',
                    'price' => 4.50,
                    'discount_price' => null,
                    'sku' => 'PAS002',
                    'stock' => 60,
                    'weight' => 500,
                    'is_featured' => false,
                ],
            ],
        ];

        // Crea i prodotti per ciascuna categoria
        foreach ($productsByCategory as $categoryName => $products) {
            // Trova la categoria per nome
            $category = $categories->where('name', $categoryName)->first();

            if (!$category) {
                $this->command->warn("Categoria non trovata: $categoryName");
                continue;
            }

            foreach ($products as $productData) {
                Product::create([
                    'name' => $productData['name'],
                    'slug' => Str::slug($productData['name']),
                    'description' => $productData['description'],
                    'price' => $productData['price'],
                    'discount_price' => $productData['discount_price'],
                    'category_id' => $category->id,
                    'sku' => $productData['sku'],
                    'stock' => $productData['stock'],
                    'weight' => $productData['weight'],
                    'is_featured' => $productData['is_featured'],
                    'is_active' => true,
                ]);
            }
        }

        $this->command->info('Creati ' . Product::count() . ' prodotti');
    }
}
