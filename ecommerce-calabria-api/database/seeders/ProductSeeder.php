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
        // Ottieni le categorie dal database
        $olioCategory = Category::where('name', 'Olio d\'oliva')->first();
        $formaggiCategory = Category::where('name', 'Formaggi')->first();
        $salumiCategory = Category::where('name', 'Salumi')->first();
        $conserveCategory = Category::where('name', 'Conserve')->first();
        $pastaCategory = Category::where('name', 'Pasta e Riso')->first();
        $dolciCategory = Category::where('name', 'Dolci e Miele')->first();
        $liquoriCategory = Category::where('name', 'Liquori e Vini')->first();

        // Prodotti Olio d'oliva
        $olioProducts = [
            [
                'name' => 'Olio Extravergine d\'Oliva Biologico Calabrese',
                'description' => 'Olio extravergine d\'oliva biologico prodotto in Calabria, ottenuto dalla spremitura a freddo di olive raccolte a mano. Caratterizzato da un sapore fruttato intenso con note di carciofo e mandorla.',
                'ingredients' => '100% Olive biologiche calabresi',
                'price' => 15.90,
                'stock' => 100,
                'sku' => 'OIL-BIO-001',
                'image' => 'products/olio-bio.jpg',
                'is_featured' => true,
                'origin' => 'Calabria, Italia',
                'producer' => 'Frantoio Calabrese',
                'weight' => '500ml',
            ],
            [
                'name' => 'Olio Aromatizzato al Peperoncino',
                'description' => 'Olio extravergine d\'oliva aromatizzato con peperoncino calabrese piccante. Ideale per condire pasta, pizza e bruschette.',
                'ingredients' => 'Olio extravergine d\'oliva, peperoncino calabrese',
                'price' => 12.50,
                'stock' => 75,
                'sku' => 'OIL-PEP-001',
                'image' => 'products/olio-peperoncino.jpg',
                'is_featured' => false,
                'origin' => 'Calabria, Italia',
                'producer' => 'Frantoio Calabrese',
                'weight' => '250ml',
            ],
            [
                'name' => 'Olio Extravergine d\'Oliva DOP Bruzio',
                'description' => 'Olio extravergine d\'oliva DOP Bruzio, prodotto nella provincia di Cosenza. Caratterizzato da un sapore fruttato medio con note di erbe fresche e pomodoro.',
                'ingredients' => '100% Olive calabresi varietà Carolea',
                'price' => 18.90,
                'stock' => 50,
                'sku' => 'OIL-DOP-001',
                'image' => 'products/olio-dop.jpg',
                'is_featured' => true,
                'origin' => 'Cosenza, Calabria',
                'producer' => 'Oleificio Cosentino',
                'weight' => '750ml',
            ],
        ];

        // Prodotti Formaggi
        $formaggiProducts = [
            [
                'name' => 'Pecorino Crotonese DOP',
                'description' => 'Formaggio a pasta dura prodotto con latte di pecora intero. Stagionato per almeno 6 mesi, ha un sapore intenso e leggermente piccante.',
                'ingredients' => 'Latte di pecora, sale, caglio',
                'price' => 22.50,
                'stock' => 30,
                'sku' => 'FOR-PEC-001',
                'image' => 'products/pecorino.jpg',
                'is_featured' => true,
                'origin' => 'Crotone, Calabria',
                'producer' => 'Caseificio Crotonese',
                'weight' => '500g',
            ],
            [
                'name' => 'Caciocavallo Silano DOP',
                'description' => 'Formaggio a pasta filata prodotto con latte vaccino. Stagionato per almeno 30 giorni, ha un sapore dolce e aromatico.',
                'ingredients' => 'Latte vaccino, sale, caglio',
                'price' => 18.90,
                'stock' => 25,
                'sku' => 'FOR-CAC-001',
                'image' => 'products/caciocavallo.jpg',
                'is_featured' => true,
                'origin' => 'Sila, Calabria',
                'producer' => 'Caseificio Silano',
                'weight' => '1kg',
            ],
            [
                'name' => 'Ricotta Affumicata',
                'description' => 'Ricotta di pecora affumicata naturalmente con legno di faggio. Ideale come antipasto o per condire primi piatti.',
                'ingredients' => 'Siero di latte di pecora, sale',
                'price' => 8.50,
                'stock' => 40,
                'sku' => 'FOR-RIC-001',
                'image' => 'products/ricotta.jpg',
                'is_featured' => false,
                'origin' => 'Calabria, Italia',
                'producer' => 'Caseificio Calabrese',
                'weight' => '300g',
            ],
        ];

        // Prodotti Salumi
        $salumiProducts = [
            [
                'name' => '\'Nduja di Spilinga',
                'description' => 'Salume spalmabile piccante tipico della Calabria, prodotto con carne di maiale e peperoncino calabrese. Ideale per bruschette e condimenti.',
                'ingredients' => 'Carne di maiale, peperoncino calabrese, sale, spezie',
                'price' => 9.90,
                'stock' => 60,
                'sku' => 'SAL-NDU-001',
                'image' => 'products/nduja.jpg',
                'is_featured' => true,
                'origin' => 'Spilinga, Calabria',
                'producer' => 'Salumificio Calabrese',
                'weight' => '200g',
            ],
            [
                'name' => 'Soppressata Calabrese',
                'description' => 'Salame tipico calabrese prodotto con carne di maiale selezionata e peperoncino. Stagionato naturalmente per almeno 60 giorni.',
                'ingredients' => 'Carne di maiale, sale, peperoncino, spezie',
                'price' => 14.50,
                'stock' => 45,
                'sku' => 'SAL-SOP-001',
                'image' => 'products/soppressata.jpg',
                'is_featured' => true,
                'origin' => 'Calabria, Italia',
                'producer' => 'Salumificio Calabrese',
                'weight' => '300g',
            ],
            [
                'name' => 'Pancetta Arrotolata',
                'description' => 'Pancetta di maiale arrotolata e stagionata con pepe nero e spezie. Ideale per antipasti e primi piatti.',
                'ingredients' => 'Pancetta di maiale, sale, pepe nero, spezie',
                'price' => 16.90,
                'stock' => 35,
                'sku' => 'SAL-PAN-001',
                'image' => 'products/pancetta.jpg',
                'is_featured' => false,
                'origin' => 'Calabria, Italia',
                'producer' => 'Salumificio Calabrese',
                'weight' => '400g',
            ],
        ];

        // Prodotti Conserve
        $conserveProducts = [
            [
                'name' => 'Pomodori Secchi sott\'Olio',
                'description' => 'Pomodori secchi calabresi conservati in olio extravergine d\'oliva. Ideali per antipasti, insalate e condimenti.',
                'ingredients' => 'Pomodori secchi, olio extravergine d\'oliva, aceto, sale, aglio, prezzemolo',
                'price' => 7.90,
                'stock' => 80,
                'sku' => 'CON-POM-001',
                'image' => 'products/pomodori-secchi.jpg',
                'is_featured' => false,
                'origin' => 'Calabria, Italia',
                'producer' => 'Conserve Calabresi',
                'weight' => '280g',
            ],
            [
                'name' => 'Peperoncini Ripieni al Tonno',
                'description' => 'Peperoncini calabresi ripieni di tonno e capperi, conservati in olio extravergine d\'oliva. Ideali come antipasto o aperitivo.',
                'ingredients' => 'Peperoncini, tonno, capperi, olio extravergine d\'oliva, sale',
                'price' => 8.50,
                'stock' => 65,
                'sku' => 'CON-PEP-001',
                'image' => 'products/peperoncini-ripieni.jpg',
                'is_featured' => true,
                'origin' => 'Calabria, Italia',
                'producer' => 'Conserve Calabresi',
                'weight' => '250g',
            ],
            [
                'name' => 'Melanzane sott\'Olio',
                'description' => 'Melanzane calabresi grigliate e conservate in olio extravergine d\'oliva. Ideali per antipasti e contorni.',
                'ingredients' => 'Melanzane, olio extravergine d\'oliva, aceto, sale, aglio, menta',
                'price' => 7.50,
                'stock' => 70,
                'sku' => 'CON-MEL-001',
                'image' => 'products/melanzane.jpg',
                'is_featured' => false,
                'origin' => 'Calabria, Italia',
                'producer' => 'Conserve Calabresi',
                'weight' => '280g',
            ],
        ];

        // Inserisci i prodotti nel database
        $this->insertProducts($olioProducts, $olioCategory);
        $this->insertProducts($formaggiProducts, $formaggiCategory);
        $this->insertProducts($salumiProducts, $salumiCategory);
        $this->insertProducts($conserveProducts, $conserveCategory);
    }

    /**
     * Modify the insertProducts method
     */
    private function insertProducts($products, $category)
    {
        foreach ($products as $product) {
            $slug = Str::slug($product['name']);
            
            // Check if product already exists
            if (!Product::where('slug', $slug)->exists()) {
                Product::create([
                    'category_id' => $category->id,
                    'name' => $product['name'],
                    'slug' => $slug,
                    'description' => $product['description'],
                    'ingredients' => $product['ingredients'],
                    'price' => $product['price'],
                    'stock' => $product['stock'],
                    'sku' => $product['sku'],
                    'image' => $product['image'],
                    'is_featured' => $product['is_featured'],
                    'is_active' => true,
                    'origin' => $product['origin'],
                    'producer' => $product['producer'],
                    'weight' => $product['weight'],
                ]);
            }
        }
    }
}
