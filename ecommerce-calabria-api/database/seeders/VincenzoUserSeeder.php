<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class VincenzoUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Verifica se l'utente esiste già
        $existingUser = User::where('email', 'vincenzo@esempio.it')->first();
        if ($existingUser) {
            $this->command->info('Utente vincenzo@esempio.it già esistente. Aggiorno i dati...');
            // Aggiorna i dati dell'utente esistente
            $existingUser->update([
                'name' => 'Vincenzo',
                'surname' => 'Calabrese',
                'address' => 'Via Roma 15',
                'city' => 'Cosenza',
                'postal_code' => '87100',
                'phone' => '3331234567',
            ]);
            $user = $existingUser;
        } else {
            // Crea l'utente Vincenzo
            $user = User::create([
                'name' => 'Vincenzo',
                'surname' => 'Calabrese',
                'email' => 'vincenzo@esempio.it',
                'password' => Hash::make('password123'),
                'address' => 'Via Roma 15',
                'city' => 'Cosenza',
                'postal_code' => '87100',
                'phone' => '3331234567',
                'is_admin' => false,
                'email_verified_at' => now(),
                'created_at' => now()->subDays(30)
            ]);

            $this->command->info('Utente Vincenzo creato con ID: ' . $user->id);
        }

        // Ottieni alcuni prodotti per creare ordini
        $products = Product::take(8)->get();

        if ($products->isEmpty()) {
            $this->command->error('Nessun prodotto trovato. Esegui prima ProductSeeder.');
            return;
        }

        // Crea 3 ordini per Vincenzo (tutti completati per poter scrivere recensioni)
        $ordini = [
            [
                'data' => now()->subDays(25),
                'prodotti' => [$products[0], $products[1]],
                'note' => 'Primo ordine - prodotti per la famiglia'
            ],
            [
                'data' => now()->subDays(15),
                'prodotti' => [$products[2], $products[3], $products[4]],
                'note' => 'Secondo ordine - regalo per amici al nord'
            ],
            [
                'data' => now()->subDays(8),
                'prodotti' => [$products[5], $products[6]],
                'note' => 'Ordine recente - scorte per le feste'
            ]
        ];

        $orderIds = [];

        foreach ($ordini as $index => $ordineDati) {
            $total = 0;

            // Calcola il totale dell'ordine
            foreach ($ordineDati['prodotti'] as $product) {
                $quantity = rand(1, 3);
                $price = floatval($product->discount_price ?: $product->price);
                $total += $price * $quantity;
            }

            $shipping = $total > 50 ? 0 : 8.50;
            $total += $shipping;

            // Crea l'ordine
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'VIN-' . time() . '-' . str_pad($index + 1, 2, '0', STR_PAD_LEFT),
                'status' => 'delivered', // Tutti delivered per poter scrivere recensioni
                'payment_method' => ['credit_card', 'paypal', 'bank_transfer'][array_rand(['credit_card', 'paypal', 'bank_transfer'])],
                'is_paid' => true,
                'paid_at' => $ordineDati['data']->addHours(2),
                'total' => $total,
                'shipping_cost' => $shipping,
                'tax' => 0,
                'discount' => 0,
                'shipping_name' => $user->name,
                'shipping_surname' => $user->surname,
                'shipping_address' => $user->address,
                'shipping_city' => $user->city,
                'shipping_postal_code' => $user->postal_code,
                'shipping_phone' => $user->phone,
                'notes' => $ordineDati['note'],
                'created_at' => $ordineDati['data'],
                'updated_at' => $ordineDati['data']->addDays(3), // Consegnato dopo 3 giorni
            ]);

            $orderIds[] = $order->id;

            // Crea gli item dell'ordine
            foreach ($ordineDati['prodotti'] as $product) {
                $quantity = rand(1, 3);
                $price = floatval($product->discount_price ?: $product->price);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $price * $quantity
                ]);
            }

            $this->command->info("Ordine #{$order->order_number} creato: €{$total} - {$ordineDati['note']}");
        }

        // Crea recensioni realistiche per alcuni prodotti acquistati
        $recensioni = [
            [
                'product_id' => $products[0]->id,
                'rating' => 5,
                'title' => 'Eccellente qualità calabrese!',
                'comment' => 'Sono calabrese di origine e questo prodotto mi ha riportato ai sapori della mia infanzia. Qualità eccezionale, confezionamento perfetto e spedizione veloce. Lo consiglio vivamente a tutti gli amanti dei veri sapori del sud.',
                'verified_purchase' => true,
                'created_at' => now()->subDays(20)
            ],
            [
                'product_id' => $products[2]->id,
                'rating' => 4,
                'title' => 'Molto buono, consigliato',
                'comment' => 'Ho ordinato questo prodotto per la prima volta e devo dire che sono rimasto piacevolmente sorpreso. Il sapore è autentico e si sente la qualità degli ingredienti. Prezzo giusto per quello che offre.',
                'verified_purchase' => true,
                'created_at' => now()->subDays(12)
            ],
            [
                'product_id' => $products[5]->id,
                'rating' => 5,
                'title' => 'Tradizione autentica',
                'comment' => 'Prodotto fantastico che rispetta la vera tradizione calabrese. L\'ho regalato ad amici milanesi e sono rimasti entusiasti. Sicuramente riordinerò presto.',
                'verified_purchase' => true,
                'created_at' => now()->subDays(6)
            ],
            [
                'product_id' => $products[1]->id,
                'rating' => 4,
                'title' => 'Buon acquisto',
                'comment' => 'Prodotto di qualità, arrivato in tempi giusti e ben confezionato. Il sapore è quello che mi aspettavo. Rapporto qualità-prezzo buono.',
                'verified_purchase' => true,
                'created_at' => now()->subDays(18)
            ]
        ];

        foreach ($recensioni as $recensioneDati) {
            $review = Review::create([
                'user_id' => $user->id,
                'product_id' => $recensioneDati['product_id'],
                'rating' => $recensioneDati['rating'],
                'title' => $recensioneDati['title'],
                'comment' => $recensioneDati['comment'],
                'verified_purchase' => $recensioneDati['verified_purchase'],
                'is_approved' => true, // Approva automaticamente
                'helpful_count' => rand(2, 12),
                'created_at' => $recensioneDati['created_at'],
                'updated_at' => $recensioneDati['created_at']
            ]);

            $productName = Product::find($recensioneDati['product_id'])->name;
            $this->command->info("Recensione creata per '{$productName}' - {$recensioneDati['rating']} stelle");
        }

        // Statistiche finali
        $totalOrders = Order::where('user_id', $user->id)->count();
        $totalReviews = Review::where('user_id', $user->id)->count();
        $totalSpent = Order::where('user_id', $user->id)->sum('total');

        $this->command->info('==========================================');
        $this->command->info('UTENTE VINCENZO CREATO CON SUCCESSO!');
        $this->command->info('==========================================');
        $this->command->info('Email: vincenzo@esempio.it');
        $this->command->info('Password: password123');
        $this->command->info('Ordini completati: ' . $totalOrders);
        $this->command->info('Recensioni scritte: ' . $totalReviews);
        $this->command->info('Totale speso: €' . number_format($totalSpent, 2));
        $this->command->info('==========================================');
        $this->command->info('Ora puoi fare login e verificare:');
        $this->command->info('1. Dashboard ordini (/dashboard/orders)');
        $this->command->info('2. Le tue recensioni (/dashboard/reviews)');
        $this->command->info('3. Pagina recensioni pubbliche (/reviews)');
        $this->command->info('==========================================');
    }
}
