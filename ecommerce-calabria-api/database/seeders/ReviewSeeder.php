<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $users = User::where('is_admin', false)->take(10)->get();
        $products = Product::take(15)->get();

        if ($users->isEmpty() || $products->isEmpty()) {
            $this->command->warn('Assicurati di avere utenti e prodotti nel database prima di eseguire questo seeder.');
            return;
        }

        $reviewTexts = [
            [
                'title' => 'Prodotto eccellente!',
                'comment' => 'Ho ordinato questo prodotto e devo dire che ha superato le mie aspettative. Qualità top e sapore autentico della Calabria. Lo consiglio vivamente!',
                'rating' => 5
            ],
            [
                'title' => 'Tradizione calabrese autentica',
                'comment' => 'Finalmente un prodotto che mantiene il vero sapore della tradizione. Mia nonna sarebbe fiera di questo acquisto. Spedizione veloce e confezione curata.',
                'rating' => 5
            ],
            [
                'title' => 'Buono ma non eccezionale',
                'comment' => 'Il prodotto è di buona qualità, anche se mi aspettavo qualcosa in più. Il rapporto qualità-prezzo è comunque accettabile.',
                'rating' => 4
            ],
            [
                'title' => 'Fantastico!',
                'comment' => 'Ogni boccone è un viaggio in Calabria. Ingredienti di prima scelta e lavorazione artigianale che si sente. Continuerò sicuramente ad ordinare.',
                'rating' => 5
            ],
            [
                'title' => 'Nella media',
                'comment' => 'Prodotto nella media, niente di straordinario ma nemmeno deludente. Per il prezzo va bene.',
                'rating' => 3
            ],
            [
                'title' => 'Sapori di casa',
                'comment' => 'Mi ricorda i sapori di quando ero bambino e andavo dai miei nonni in Calabria. Prodotto genuino e di qualità eccellente.',
                'rating' => 5
            ],
            [
                'title' => 'Molto soddisfatto',
                'comment' => 'Acquisto più che soddisfacente. Il prodotto è arrivato perfettamente confezionato e il sapore è davvero autentico.',
                'rating' => 4
            ],
            [
                'title' => 'Top quality!',
                'comment' => 'La qualità si sente fin dal primo assaggio. Ingredienti selezionati e lavorazione tradizionale. Ottimo acquisto!',
                'rating' => 5
            ],
            [
                'title' => 'Potrebbe essere meglio',
                'comment' => 'Il prodotto non è male, ma ho assaggiato di meglio. Forse le aspettative erano troppo alte.',
                'rating' => 3
            ],
            [
                'title' => 'Consigliatissimo!',
                'comment' => 'Uno dei migliori acquisti fatti online. Prodotto artigianale di altissima qualità. Lo regalo sempre ai miei amici fuori regione.',
                'rating' => 5
            ]
        ];

        $createdReviews = 0;

        foreach ($products as $product) {
            // Crea 2-4 recensioni per prodotto
            $numReviews = rand(2, 4);
            $usedUsers = [];

            for ($i = 0; $i < $numReviews; $i++) {
                // Seleziona un utente random che non ha già recensito questo prodotto
                $availableUsers = $users->filter(function($user) use ($usedUsers) {
                    return !in_array($user->id, $usedUsers);
                });

                if ($availableUsers->isEmpty()) break;

                $user = $availableUsers->random();
                $usedUsers[] = $user->id;

                $reviewData = $reviewTexts[array_rand($reviewTexts)];

                Review::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'rating' => $reviewData['rating'],
                    'title' => $reviewData['title'],
                    'comment' => $reviewData['comment'],
                    'verified_purchase' => rand(0, 1) ? true : false,
                    'is_approved' => rand(0, 10) > 1 ? true : false, // 90% approvate
                    'helpful_count' => rand(0, 15),
                    'created_at' => now()->subDays(rand(1, 30))->subHours(rand(0, 23))
                ]);

                $createdReviews++;
            }
        }

        $this->command->info("Recensioni create con successo!");
        $this->command->info("Totale recensioni: {$createdReviews}");
        $this->command->info("Recensioni approvate: " . Review::where('is_approved', true)->count());
        $this->command->info("Recensioni in attesa: " . Review::where('is_approved', false)->count());
    }
}
