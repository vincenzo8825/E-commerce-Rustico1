<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
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
        $users = User::where('is_admin', false)->get();

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
            $userIds = [$userId];
        } else {
            $userIds = $users->pluck('id')->toArray();
        }

        // Stati possibili degli ordini
        $statuses = ['processing', 'shipped', 'delivered', 'cancelled'];

        // Metodi di pagamento
        $paymentMethods = ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'];

        // Città italiane
        $cities = [
            'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo',
            'Bologna', 'Firenze', 'Catania', 'Bari', 'Messina',
            'Reggio Calabria', 'Cosenza', 'Catanzaro', 'Vibo Valentia', 'Crotone',
            'Lamezia Terme', 'Tropea', 'Soverato', 'Diamante', 'Scalea'
        ];

        // CAP per regione
        $postalCodes = [
            '00100', '20100', '80100', '10100', '90100',
            '40100', '50100', '95100', '70100', '98100',
            '89100', '87100', '88100', '89900', '88900',
            '88046', '89861', '88068', '87023', '87029'
        ];

        // Ottieni tutti i prodotti
        $products = Product::all();

        if ($products->isEmpty()) {
            $this->command->info("Nessun prodotto trovato. Gli ordini non avranno prodotti.");
            return;
        }

        // Generiamo ordini per gli ultimi 60 giorni con distribuzione realistica
        $orders = [];
        $totalRevenue = 0;

        // Genera ordini con date distribuite negli ultimi 60 giorni
        for ($day = 0; $day < 60; $day++) {
            $date = Carbon::now()->subDays($day);

            // Più ordini nei giorni recenti, meno nei giorni più lontani
            $numOrders = $day < 10 ? rand(1, 3) : ($day < 30 ? rand(0, 2) : rand(0, 1));

            for ($i = 0; $i < $numOrders; $i++) {
                $userId = $userIds[array_rand($userIds)];
                $user = User::find($userId);

                // Generiamo un orario casuale per l'ordine
                $orderTime = $date->copy()->addHours(rand(8, 22))->addMinutes(rand(0, 59));

                // Stato con distribuzione realistica (più completati che annullati)
                $status = $statuses[rand(0, 100) < 20 ? 3 : (rand(0, 100) < 30 ? 0 : (rand(0, 100) < 50 ? 1 : 2))];

                // Calcoliamo il pagato in base allo stato
                $isPaid = $status === 'cancelled' ? false : ($status === 'delivered' || rand(0, 100) < 80);

                // Generiamo il costo di spedizione (gratis sopra una certa soglia)
                $shippingCost = rand(0, 100) < 30 ? 0 : 4.99;

                // Randomizziamo la città e il CAP
                $cityIndex = array_rand($cities);

                $orderData = [
                    'user_id' => $userId,
                    'order_number' => 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                    'status' => $status,
                    'created_at' => $orderTime,
                    'updated_at' => $orderTime,
                    'shipping_name' => $user->name,
                    'shipping_surname' => $user->surname,
                    'shipping_address' => 'Via ' . $this->getRandomStreetName() . ' ' . rand(1, 100),
                    'shipping_city' => $cities[$cityIndex],
                    'shipping_postal_code' => $postalCodes[$cityIndex],
                    'shipping_phone' => '3' . rand(300000000, 399999999),
                    'shipping_cost' => $shippingCost,
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'notes' => rand(0, 100) < 30 ? $this->getRandomOrderNote() : '',
                    'is_paid' => $isPaid,
                    'paid_at' => $isPaid ? $orderTime : null,
                ];

                // Aggiungiamo prodotti all'ordine
                $orderProducts = $products->random(rand(1, 5))->all();
                $orderTotal = $shippingCost;

                $orderItems = [];
                foreach ($orderProducts as $product) {
                    $quantity = rand(1, 3);
                    $price = $product->price;
                    $total = $price * $quantity;
                    $orderTotal += $total;

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $quantity,
                        'price' => $price,
                        'total' => $total,
                        'created_at' => $orderTime,
                        'updated_at' => $orderTime,
                    ];
                }

                $orderData['total'] = $orderTotal;
                $totalRevenue += ($status === 'delivered' ? $orderTotal : 0);

                $orders[] = [
                    'data' => $orderData,
                    'items' => $orderItems
                ];
            }
        }

        // Inserisci gli ordini nel database
        foreach ($orders as $orderInfo) {
            $orderData = $orderInfo['data'];
            $orderItems = $orderInfo['items'];

            $order = Order::create($orderData);

            // Aggiungiamo i prodotti all'ordine
            foreach ($orderItems as $item) {
                $item['order_id'] = $order->id;
                DB::table('order_items')->insert($item);
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
        $totalRevenue = Order::where('status', 'delivered')->sum('total');
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

        $this->command->info("Statistiche ordini aggiornate: $totalOrders ordini, €" . number_format($totalRevenue, 2) . " fatturato");
    }

    /**
     * Genera un nome di strada casuale
     */
    private function getRandomStreetName()
    {
        $streets = [
            'Roma', 'Garibaldi', 'Mazzini', 'Dante', 'Verdi',
            'Vittorio Emanuele', 'Cavour', 'Italia', 'Marconi', 'Colombo',
            'XX Settembre', 'Matteotti', 'Gramsci', 'Diaz', 'Oberdan',
            'Rossini', 'Piave', 'Alfieri', 'Carducci', 'Leonardo da Vinci'
        ];

        return $streets[array_rand($streets)];
    }

    /**
     * Genera una nota per l'ordine casuale
     */
    private function getRandomOrderNote()
    {
        $notes = [
            'Consegnare al portiere.',
            'Suonare al campanello numero 3.',
            'Lasciare il pacco davanti alla porta se assente.',
            'Chiamare prima della consegna.',
            'Consegnare dopo le 18:00.',
            'Il cancello ha un codice: 1234.',
            'Attenzione al cane.',
            'Citofonare all\'appartamento 2B.',
            'In caso di assenza, lasciare dai vicini.',
            'Verificare l\'integrità del pacco alla consegna.'
        ];

        return $notes[array_rand($notes)];
    }
}
