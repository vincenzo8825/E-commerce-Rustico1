<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class AdditionalCalabrianProductsSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Ottieni le categorie esistenti
        $categories = Category::all()->keyBy('name');

        $products = [
            [
                'name' => 'Licorice di Calabria DOP',
                'description' => 'Liquirizia pura di Calabria, dolce e aromatica, dalle radici selezionate della migliore qualità.',
                'ingredients' => 'Radice di liquirizia pura 100%',
                'price' => 8.50,
                'stock' => 75,
                'category' => 'Dolci Tipici',
                'origin' => 'Rossano, Calabria',
                'producer' => 'Azienda Liquirizia Amarelli',
                'weight' => '200g',
                'sku' => 'LIC-CAL-001'
            ],
            [
                'name' => 'Tartufo Nero di Calabria',
                'description' => 'Tartufo nero pregiato delle montagne calabresi, conservato in olio extravergine di oliva.',
                'ingredients' => 'Tartufo nero (Tuber melanosporum), olio extravergine di oliva, sale',
                'price' => 45.00,
                'stock' => 12,
                'category' => 'Conserve e Sottoli',
                'origin' => 'Sila, Calabria',
                'producer' => 'Azienda Tartufi di Calabria',
                'weight' => '80g',
                'sku' => 'TAR-NER-001'
            ],
            [
                'name' => 'Fichi Secchi di Cosenza IGP',
                'description' => 'Fichi secchi della tradizione cosentina, dolci e nutrienti, lavorati secondo metodi tradizionali.',
                'ingredients' => 'Fichi secchi 100%',
                'price' => 12.90,
                'stock' => 40,
                'category' => 'Dolci Tipici',
                'origin' => 'Cosenza, Calabria',
                'producer' => 'Cooperativa Fichi di Calabria',
                'weight' => '500g',
                'sku' => 'FIC-COS-001'
            ],
            [
                'name' => 'Stocco di Mammola',
                'description' => 'Stoccafisso della tradizione mammolese, preparato secondo antiche ricette calabresi.',
                'ingredients' => 'Stoccafisso, sale marino, spezie calabresi',
                'price' => 35.00,
                'stock' => 15,
                'category' => 'Conserve e Sottoli',
                'origin' => 'Mammola, Calabria',
                'producer' => 'Antica Pescheria Mammolese',
                'weight' => '800g',
                'sku' => 'STO-MAM-001'
            ],
            [
                'name' => 'Panna di Bufala della Sila',
                'description' => 'Panna fresca di bufala della Sila, cremosa e delicata, perfetta per dolci e cucina.',
                'ingredients' => 'Panna di bufala 100%',
                'price' => 9.80,
                'stock' => 25,
                'category' => 'Formaggi Tipici',
                'origin' => 'Sila, Calabria',
                'producer' => 'Caseificio della Sila',
                'weight' => '200ml',
                'sku' => 'PAN-BUF-001'
            ],
            [
                'name' => 'Miele di Sulla Calabrese',
                'description' => 'Miele millefiori delle montagne calabresi, ricco di profumi e sapori autentici.',
                'ingredients' => 'Miele di sulla 100%',
                'price' => 14.50,
                'stock' => 50,
                'category' => 'Dolci Tipici',
                'origin' => 'Aspromonte, Calabria',
                'producer' => 'Apicoltura Montana Calabrese',
                'weight' => '500g',
                'sku' => 'MIE-SUL-001'
            ],
            [
                'name' => 'Pasta di Pistacchio di Bronte',
                'description' => 'Pasta pura di pistacchio, ideale per dolci, gelati e preparazioni gourmet.',
                'ingredients' => 'Pistacchi di Bronte DOP 100%',
                'price' => 28.90,
                'stock' => 30,
                'category' => 'Conserve e Sottoli',
                'origin' => 'Bronte, Sicilia',
                'producer' => 'Azienda Pistacchi Siciliani',
                'weight' => '200g',
                'sku' => 'PIS-BRO-001'
            ],
            [
                'name' => 'Zafferano di Calabria DOP',
                'description' => 'Zafferano purissimo della Calabria, dal profumo intenso e dal colore dorato.',
                'ingredients' => 'Stimmi di zafferano 100%',
                'price' => 65.00,
                'stock' => 8,
                'category' => 'Conserve e Sottoli',
                'origin' => 'Corigliano, Calabria',
                'producer' => 'Azienda Oro Rosso',
                'weight' => '2g',
                'sku' => 'ZAF-CAL-001'
            ]
        ];

        foreach ($products as $productData) {
            // Trova la categoria
            $category = $categories->get($productData['category']);
            if (!$category) {
                $this->command->warn("Categoria '{$productData['category']}' non trovata per {$productData['name']}");
                continue;
            }

            Product::create([
                'category_id' => $category->id,
                'name' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'description' => $productData['description'],
                'ingredients' => $productData['ingredients'],
                'price' => $productData['price'],
                'stock' => $productData['stock'],
                'sku' => $productData['sku'],
                'is_featured' => rand(0, 1),
                'is_active' => true,
                'origin' => $productData['origin'],
                'producer' => $productData['producer'],
                'weight' => $productData['weight'],
                'image' => '/images/products/' . strtolower(str_replace(' ', '-', $productData['name'])) . '.jpg',
                'gallery' => json_encode([
                    '/images/products/' . strtolower(str_replace(' ', '-', $productData['name'])) . '-1.jpg',
                    '/images/products/' . strtolower(str_replace(' ', '-', $productData['name'])) . '-2.jpg'
                ])
            ]);

            $this->command->info("Prodotto creato: {$productData['name']}");
        }

        $this->command->info('Prodotti calabresi aggiuntivi aggiunti con successo!');
        $this->command->info('Totale prodotti ora: ' . Product::count());
    }
}
