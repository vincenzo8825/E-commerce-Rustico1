<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Product;

class UpdateProductsWithSearchDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Aggiornamento prodotti con dati per ricerca avanzata...');

        // Dati di esempio per certificazioni, allergeni e ingredienti
        $certificationOptions = ['DOP', 'IGP', 'BIO', 'TRADIZIONALE', 'ARTIGIANALE'];
        $allergenOptions = ['glutine', 'latte', 'uova', 'frutta a guscio', 'soia', 'sesamo'];

        $productUpdates = [
            // Salumi e insaccati
            [
                'search_terms' => ['nduja', 'piccante', 'calabrese'],
                'certifications' => 'IGP,TRADIZIONALE',
                'allergens' => '',
                'ingredients' => 'carne suina, peperoncino calabrese, sale, spezie naturali',
                'short_description' => 'Salume piccante tipico calabrese spalmabile',
                'origin' => 'Cosenza, Calabria'
            ],
            [
                'search_terms' => ['soppressata', 'salame', 'calabrese'],
                'certifications' => 'DOP',
                'allergens' => '',
                'ingredients' => 'carne suina magra, sale, pepe nero, peperoncino dolce',
                'short_description' => 'Salame tradizionale calabrese stagionato',
                'origin' => 'Catanzaro, Calabria'
            ],
            [
                'search_terms' => ['guanciale', 'suino', 'nero'],
                'certifications' => 'TRADIZIONALE',
                'allergens' => '',
                'ingredients' => 'guanciale di suino nero calabrese, sale, pepe nero',
                'short_description' => 'Guanciale del suino nero di Calabria',
                'origin' => 'Reggio Calabria'
            ],

            // Formaggi
            [
                'search_terms' => ['pecorino', 'crotonese', 'formaggio'],
                'certifications' => 'DOP',
                'allergens' => 'latte',
                'ingredients' => 'latte di pecora, caglio naturale, sale',
                'short_description' => 'Formaggio a pasta dura da latte di pecora',
                'origin' => 'Crotone, Calabria'
            ],
            [
                'search_terms' => ['caciocavallo', 'silano', 'formaggio'],
                'certifications' => 'DOP',
                'allergens' => 'latte',
                'ingredients' => 'latte vaccino, caglio naturale, sale marino',
                'short_description' => 'Formaggio a pasta filata stagionato',
                'origin' => 'Sila, Calabria'
            ],

            // Condimenti
            [
                'search_terms' => ['olio', 'extravergine', 'oliva'],
                'certifications' => 'DOP,BIO',
                'allergens' => '',
                'ingredients' => 'olive carolea, ogliarola, leccino',
                'short_description' => 'Olio extravergine di oliva biologico DOP',
                'origin' => 'Lamezia Terme, Calabria'
            ],
            [
                'search_terms' => ['peperoncino', 'calabrese', 'piccante'],
                'certifications' => 'IGP',
                'allergens' => '',
                'ingredients' => 'peperoncino calabrese piccante essiccato',
                'short_description' => 'Peperoncino piccante calabrese macinato',
                'origin' => 'Diamante, Calabria'
            ],

            // Dolci
            [
                'search_terms' => ['mostaccioli', 'dolce', 'miele'],
                'certifications' => 'TRADIZIONALE',
                'allergens' => 'glutine,uova',
                'ingredients' => 'farina, miele, mandorle, cannella, chiodi di garofano',
                'short_description' => 'Biscotti tradizionali al miele e spezie',
                'origin' => 'Soriano Calabro'
            ],
            [
                'search_terms' => ['bergamotto', 'liquore', 'dolce'],
                'certifications' => 'IGP',
                'allergens' => '',
                'ingredients' => 'bergamotto di Reggio Calabria, alcol, zucchero',
                'short_description' => 'Liquore di bergamotto calabrese',
                'origin' => 'Reggio Calabria'
            ],

            // Conserve
            [
                'search_terms' => ['pomodoro', 'san marzano', 'conserva'],
                'certifications' => 'DOP,BIO',
                'allergens' => '',
                'ingredients' => 'pomodori san marzano, basilico, sale',
                'short_description' => 'Pomodori San Marzano DOP in conserva',
                'origin' => 'Piana del Sele'
            ]
        ];

        $products = Product::where('is_active', true)->get();

        foreach ($products as $index => $product) {
            $updateData = $productUpdates[$index % count($productUpdates)];

            // Genera stock casuale
            $stockQuantity = rand(0, 100);

            $product->update([
                'certifications' => $updateData['certifications'],
                'allergens' => $updateData['allergens'],
                'ingredients' => $updateData['ingredients'],
                'short_description' => $updateData['short_description'],
                'origin' => $updateData['origin'],
                'stock_quantity' => $stockQuantity
            ]);

            $this->command->info("Aggiornato prodotto: {$product->name}");
        }

        // Crea alcuni prodotti aggiuntivi se ce ne sono pochi
        $productCount = Product::count();
        if ($productCount < 15) {
            $this->createAdditionalProducts();
        }

        $this->command->info('Aggiornamento completato!');
    }

    private function createAdditionalProducts()
    {
        $additionalProducts = [
            [
                'name' => 'Fichi di Cosenza DOP',
                'description' => 'Fichi secchi calabresi di eccellente qualità, dolci e nutrienti.',
                'short_description' => 'Fichi secchi calabresi DOP premium',
                'price' => 12.50,
                'certifications' => 'DOP',
                'allergens' => 'frutta a guscio',
                'ingredients' => 'fichi secchi, mandorle, miele',
                'origin' => 'Cosenza, Calabria',
                'stock_quantity' => 45
            ],
            [
                'name' => 'Liquirizia di Calabria',
                'description' => 'Radice di liquirizia pura calabrese, dalle proprietà benefiche uniche.',
                'short_description' => 'Liquirizia pura calabrese naturale',
                'price' => 8.90,
                'certifications' => 'BIO,TRADIZIONALE',
                'allergens' => '',
                'ingredients' => 'radice di liquirizia calabrese',
                'origin' => 'Rossano, Calabria',
                'stock_quantity' => 30
            ],
            [
                'name' => 'Miele di Zagara di Bergamotto',
                'description' => 'Miele pregiato prodotto dalle api che bottinano sui fiori di bergamotto.',
                'short_description' => 'Miele di zagara di bergamotto',
                'price' => 15.80,
                'certifications' => 'BIO',
                'allergens' => '',
                'ingredients' => 'miele di zagara di bergamotto',
                'origin' => 'Reggio Calabria',
                'stock_quantity' => 25
            ],
            [
                'name' => 'Cipolla Rossa di Tropea IGP',
                'description' => 'La famosa cipolla dolce di Tropea, perfetta cruda o cotta.',
                'short_description' => 'Cipolla rossa dolce di Tropea IGP',
                'price' => 6.50,
                'certifications' => 'IGP',
                'allergens' => '',
                'ingredients' => 'cipolla rossa di Tropea',
                'origin' => 'Tropea, Calabria',
                'stock_quantity' => 60
            ],
            [
                'name' => 'Vino Cirò Rosso DOC',
                'description' => 'Vino rosso calabrese di antica tradizione, corposo e intenso.',
                'short_description' => 'Vino rosso Cirò DOC calabrese',
                'price' => 18.00,
                'certifications' => 'DOC',
                'allergens' => '',
                'ingredients' => 'uva gaglioppo, magliocco dolce',
                'origin' => 'Cirò, Calabria',
                'stock_quantity' => 20
            ]
        ];

        foreach ($additionalProducts as $productData) {
            Product::create([
                'category_id' => 1, // Assumiamo categoria generica
                'name' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'description' => $productData['description'],
                'short_description' => $productData['short_description'],
                'ingredients' => $productData['ingredients'],
                'price' => $productData['price'],
                'discount_price' => null,
                'stock' => $productData['stock_quantity'],
                'stock_quantity' => $productData['stock_quantity'],
                'sku' => 'CAL-' . strtoupper(Str::random(6)),
                'image' => '/images/products/placeholder.jpg',
                'is_featured' => false,
                'is_active' => true,
                'origin' => $productData['origin'],
                'producer' => 'Produttore Calabrese',
                'weight' => rand(100, 1000),
                'certifications' => $productData['certifications'],
                'allergens' => $productData['allergens']
            ]);

            $this->command->info("Creato prodotto: {$productData['name']}");
        }
    }
}
