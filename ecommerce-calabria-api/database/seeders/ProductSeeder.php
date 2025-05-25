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
        // Prodotti tipici calabresi reali
        $prodottiCalabresi = [
            // Formaggi e Latticini
            [
                'name' => 'Caciocavallo Silano DOP',
                'description' => 'Formaggio tradizionale calabrese a pasta filata, stagionato a mano secondo antica tradizione. Sapore intenso e piccante, perfetto per antipasti e piatti tradizionali.',
                'price' => 18.50,
                'stock_quantity' => 25,
                'category' => 'Formaggi Tipici',
                'image_url' => '/images/caciocavallo-silano.jpg',
                'weight' => '500g',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'name' => 'Pecorino del Pollino DOP',
                'description' => 'Formaggio di pecora stagionato prodotto nel Parco Nazionale del Pollino. Sapore delicato e profumo intenso di erbe montane.',
                'price' => 22.00,
                'stock_quantity' => 18,
                'category' => 'Formaggi Tipici',
                'image_url' => '/images/pecorino-pollino.jpg',
                'weight' => '600g',
                'is_featured' => false,
                'is_active' => true
            ],
            [
                'name' => 'Ricotta Affumicata di Mammola',
                'description' => 'Ricotta tradizionale affumicata con legno di castagno, specialità di Mammola. Ideale per condire pasta o gustare con miele di castagno.',
                'price' => 12.80,
                'stock_quantity' => 30,
                'category' => 'Formaggi Tipici',
                'image_url' => '/images/ricotta-affumicata.jpg',
                'weight' => '400g',
                'is_featured' => false,
                'is_active' => true
            ],

            // Salumi e Carni
            [
                'name' => 'Soppressata di Calabria DOP',
                'description' => 'Salume tradizionale calabrese piccante, preparato con carni suine selezionate e peperoncino calabrese. Stagionatura minima 45 giorni.',
                'price' => 24.90,
                'stock_quantity' => 20,
                'category' => 'Salumi Calabresi',
                'image_url' => '/images/soppressata-calabria.jpg',
                'weight' => '350g',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'name' => 'Capocollo di Calabria DOP',
                'description' => 'Insaccato pregiato ottenuto dalla lavorazione del muscolo del collo del maiale. Sapore delicato con note speziate tipiche calabresi.',
                'price' => 28.50,
                'stock_quantity' => 15,
                'category' => 'Salumi Calabresi',
                'image_url' => '/images/capocollo-calabria.jpg',
                'weight' => '400g',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'name' => 'Nduja di Spilinga IGP',
                'description' => 'Celebre salume spalmabile piccante di Spilinga, preparato con carni suine e peperoncino calabrese. Perfetto per bruschette e condimenti.',
                'price' => 16.90,
                'stock_quantity' => 35,
                'category' => 'Salumi Calabresi',
                'image_url' => '/images/nduja-spilinga.jpg',
                'weight' => '300g',
                'is_featured' => true,
                'is_active' => true
            ],

            // Oli e Conserve
            [
                'name' => 'Olio Extra Vergine Dolce di Rossano DOP',
                'description' => 'Olio extra vergine di oliva dal sapore fruttato e delicato, prodotto con olive Dolce di Rossano. Eccellenza della Calabria.',
                'price' => 32.00,
                'stock_quantity' => 40,
                'category' => 'Olio d\'Oliva',
                'image_url' => '/images/olio-rossano.jpg',
                'weight' => '750ml',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'name' => 'Olio Piccante al Peperoncino',
                'description' => 'Olio extra vergine di oliva infuso con peperoncino calabrese piccante. Perfetto per condire pizza, pasta e carni.',
                'price' => 14.50,
                'stock_quantity' => 50,
                'category' => 'Olio d\'Oliva',
                'image_url' => '/images/olio-piccante.jpg',
                'weight' => '250ml',
                'is_featured' => false,
                'is_active' => true
            ],
            [
                'name' => 'Olive Nocellara del Belice in Salamoia',
                'description' => 'Olive calabresi in salamoia, carnose e saporite. Ideali per antipasti e aperitivi tradizionali.',
                'price' => 8.90,
                'stock_quantity' => 60,
                'category' => 'Conserve e Sottoli',
                'image_url' => '/images/olive-nocellara.jpg',
                'weight' => '500g',
                'is_featured' => false,
                'is_active' => true
            ],

            // Pasta e Cereali
            [
                'name' => 'Fileja Calabrese Artigianale',
                'description' => 'Pasta tradizionale calabrese fatta a mano, ideale con sugo di nduja o ragù di capra. Formato tipico del vibonese.',
                'price' => 6.80,
                'stock_quantity' => 45,
                'category' => 'Pasta Artigianale',
                'image_url' => '/images/fileja-calabrese.jpg',
                'weight' => '500g',
                'is_featured' => false,
                'is_active' => true
            ],
            [
                'name' => 'Peperoncino Calabrese Piccante Macinato',
                'description' => 'Peperoncino calabrese piccante macinato finemente. Ingrediente fondamentale della cucina calabrese tradizionale.',
                'price' => 4.50,
                'stock_quantity' => 80,
                'category' => 'Conserve e Sottoli',
                'image_url' => '/images/peperoncino-macinato.jpg',
                'weight' => '100g',
                'is_featured' => false,
                'is_active' => true
            ],

            // Dolci e Confetture
            [
                'name' => 'Mostaccioli Calabresi al Miele',
                'description' => 'Dolci tradizionali calabresi al miele e spezie, ricoperti di glassa. Specialità natalizia della tradizione monastica.',
                'price' => 12.00,
                'stock_quantity' => 25,
                'category' => 'Dolci Tipici',
                'image_url' => '/images/mostaccioli.jpg',
                'weight' => '400g',
                'is_featured' => false,
                'is_active' => true
            ],
            [
                'name' => 'Confettura di Bergamotto di Reggio Calabria DOP',
                'description' => 'Confettura pregiata preparata con bergamotto DOP di Reggio Calabria. Sapore unico e inconfondibile agrume calabrese.',
                'price' => 9.50,
                'stock_quantity' => 35,
                'category' => 'Prodotti al Bergamotto',
                'image_url' => '/images/confettura-bergamotto.jpg',
                'weight' => '350g',
                'is_featured' => true,
                'is_active' => true
            ],

            // Vini e Bevande
            [
                'name' => 'Cirò Rosso Classico DOC',
                'description' => 'Vino rosso calabrese di antica tradizione, prodotto con uve Gaglioppo. Corpo pieno e sapore intenso, perfetto con carni rosse.',
                'price' => 18.90,
                'stock_quantity' => 30,
                'category' => 'Vini e Liquori',
                'image_url' => '/images/ciro-rosso.jpg',
                'weight' => '750ml',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'name' => 'Amaro del Pino Loricato',
                'description' => 'Liquore amaro calabrese alle erbe del Pollino, tra cui il raro Pino Loricato. Digestivo tradizionale delle montagne calabresi.',
                'price' => 25.00,
                'stock_quantity' => 20,
                'category' => 'Vini e Liquori',
                'image_url' => '/images/amaro-pino.jpg',
                'weight' => '700ml',
                'is_featured' => false,
                'is_active' => true
            ],

            // Prodotti del Mare
            [
                'name' => 'Tonno Rosso di Pizzo Calabro',
                'description' => 'Tonno rosso del Tirreno calabrese, pescato e lavorato secondo tradizione. Conservato in olio extra vergine di oliva.',
                'price' => 28.00,
                'stock_quantity' => 22,
                'category' => 'Conserve e Sottoli',
                'image_url' => '/images/tonno-pizzo.jpg',
                'weight' => '300g',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'name' => 'Filetti di Acciughe di Cetara',
                'description' => 'Filetti di acciughe del Mar Tirreno, salate e conservate secondo antica tradizione. Eccellenza del sud Italia.',
                'price' => 15.50,
                'stock_quantity' => 28,
                'category' => 'Conserve e Sottoli',
                'image_url' => '/images/acciughe-cetara.jpg',
                'weight' => '200g',
                'is_featured' => false,
                'is_active' => true
            ]
        ];

        foreach ($prodottiCalabresi as $prodotto) {
            // Trova la categoria
            $category = Category::where('name', $prodotto['category'])->first();

            if ($category) {
                Product::create([
                    'name' => $prodotto['name'],
                    'slug' => Str::slug($prodotto['name']),
                    'description' => $prodotto['description'],
                    'price' => $prodotto['price'],
                    'stock' => $prodotto['stock_quantity'],
                    'sku' => 'PROD-' . strtoupper(substr(Str::slug($prodotto['name']), 0, 8)) . '-' . rand(100, 999),
                    'category_id' => $category->id,
                    'image' => $prodotto['image_url'],
                    'weight' => $prodotto['weight'],
                    'is_featured' => $prodotto['is_featured'],
                    'is_active' => $prodotto['is_active'],
                    'origin' => 'Calabria',
                    'producer' => 'Produttore Calabrese',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
