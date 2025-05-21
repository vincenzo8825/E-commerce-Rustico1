<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prendiamo alcuni utenti per associarli agli ordini
        $users = User::all();

        if ($users->isEmpty()) {
            // Assicuriamoci di avere almeno un utente oltre all'admin
            $userId = DB::table('users')->insertGetId([
                'name' => 'Mario',
                'surname' => 'Rossi',
                'email' => 'cliente@esempio.it',
                'password' => bcrypt('password'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            // Prendiamo l'ID del primo utente non admin
            $userId = $users->where('is_admin', false)->first()->id ?? $users->first()->id;
        }

        // Dati ordini presi dal mockup del frontend
        $orders = [
            [
                'user_id' => $userId,
                'order_number' => 'ORD-' . Str::random(10),
                'total' => 85.50,
                'status' => 'delivered',
                'created_at' => Carbon::parse('2023-05-10T10:30:00'),
                'updated_at' => Carbon::parse('2023-05-10T10:30:00'),
                'shipping_name' => 'Mario',
                'shipping_surname' => 'Rossi',
                'shipping_address' => 'Via Roma 123',
                'shipping_city' => 'Milano',
                'shipping_postal_code' => '20100',
                'shipping_phone' => '3334445556',
                'shipping_cost' => 5.90,
                'payment_method' => 'credit_card',
                'notes' => 'Consegnare al portiere',
                'is_paid' => true,
                'paid_at' => Carbon::parse('2023-05-10T10:30:00'),
            ],
            [
                'user_id' => $userId,
                'order_number' => 'ORD-' . Str::random(10),
                'total' => 42.90,
                'status' => 'processing',
                'created_at' => Carbon::parse('2023-05-09T14:20:00'),
                'updated_at' => Carbon::parse('2023-05-09T14:20:00'),
                'shipping_name' => 'Anna',
                'shipping_surname' => 'Verdi',
                'shipping_address' => 'Via Garibaldi 45',
                'shipping_city' => 'Roma',
                'shipping_postal_code' => '00100',
                'shipping_phone' => '3391112223',
                'shipping_cost' => 5.90,
                'payment_method' => 'paypal',
                'notes' => '',
                'is_paid' => true,
                'paid_at' => Carbon::parse('2023-05-09T14:20:00'),
            ],
            [
                'user_id' => $userId,
                'order_number' => 'ORD-' . Str::random(10),
                'total' => 120.00,
                'status' => 'pending',
                'created_at' => Carbon::parse('2023-05-08T09:15:00'),
                'updated_at' => Carbon::parse('2023-05-08T09:15:00'),
                'shipping_name' => 'Luigi',
                'shipping_surname' => 'Bianchi',
                'shipping_address' => 'Via Dante 78',
                'shipping_city' => 'Napoli',
                'shipping_postal_code' => '80100',
                'shipping_phone' => '3358889990',
                'shipping_cost' => 5.90,
                'payment_method' => 'credit_card',
                'notes' => 'Suonare al campanello 4B',
                'is_paid' => false,
                'paid_at' => null,
            ],
            // Aggiungiamo altri ordini per avere statistiche più realistiche
            [
                'user_id' => $userId,
                'order_number' => 'ORD-' . Str::random(10),
                'total' => 75.20,
                'status' => 'shipped',
                'created_at' => Carbon::parse('2023-05-07T11:25:00'),
                'updated_at' => Carbon::parse('2023-05-07T11:25:00'),
                'shipping_name' => 'Marco',
                'shipping_surname' => 'Neri',
                'shipping_address' => 'Via Mazzini 90',
                'shipping_city' => 'Torino',
                'shipping_postal_code' => '10100',
                'shipping_phone' => '3376667778',
                'shipping_cost' => 5.90,
                'payment_method' => 'credit_card',
                'notes' => '',
                'is_paid' => true,
                'paid_at' => Carbon::parse('2023-05-07T11:25:00'),
            ],
            [
                'user_id' => $userId,
                'order_number' => 'ORD-' . Str::random(10),
                'total' => 63.40,
                'status' => 'delivered',
                'created_at' => Carbon::parse('2023-05-06T16:30:00'),
                'updated_at' => Carbon::parse('2023-05-06T16:30:00'),
                'shipping_name' => 'Laura',
                'shipping_surname' => 'Verdi',
                'shipping_address' => 'Via Verdi 12',
                'shipping_city' => 'Bologna',
                'shipping_postal_code' => '40100',
                'shipping_phone' => '3392223334',
                'shipping_cost' => 5.90,
                'payment_method' => 'paypal',
                'notes' => '',
                'is_paid' => true,
                'paid_at' => Carbon::parse('2023-05-06T16:30:00'),
            ],
        ];

        // Inserisci gli ordini nel database
        foreach ($orders as $orderData) {
            $order = Order::create($orderData);

            // Aggiungiamo alcuni prodotti all'ordine
            // Assumiamo che esista una tabella order_items o similare
            $productIds = DB::table('products')->pluck('id')->take(3)->toArray();

            if (!empty($productIds)) {
                foreach ($productIds as $index => $productId) {
                    $quantity = rand(1, 3);
                    $product = DB::table('products')->where('id', $productId)->first();
                    $price = $product ? $product->price : 10.00;
                    $productName = $product ? $product->name : 'Prodotto #' . $productId;

                    DB::table('order_items')->insert([
                        'order_id' => $order->id,
                        'product_id' => $productId,
                        'product_name' => $productName,
                        'quantity' => $quantity,
                        'price' => $price,
                        'total' => $price * $quantity,
                        'created_at' => $orderData['created_at'],
                        'updated_at' => $orderData['updated_at'],
                    ]);
                }
            }
        }

        // Aggiorna le statistiche totali
        $this->updateOrderStatistics();
    }

    /**
     * Aggiorna le statistiche degli ordini
     */
    private function updateOrderStatistics()
    {
        // Calcoliamo il totale degli ordini, il fatturato e il valore medio
        $totalOrders = Order::count();
        $totalRevenue = Order::sum('total');
        $averageValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Salviamo queste statistiche in una tabella dedicata (se esiste)
        if (Schema::hasTable('statistics')) {
            DB::table('statistics')->updateOrInsert(
                ['key' => 'orders'],
                [
                    'data' => json_encode([
                        'total' => $totalOrders,
                        'revenue' => $totalRevenue,
                        'average_value' => $averageValue
                    ]),
                    'updated_at' => now()
                ]
            );
        }

        $this->command->info("Statistiche ordini aggiornate: $totalOrders ordini, €$totalRevenue fatturato");
    }
}
