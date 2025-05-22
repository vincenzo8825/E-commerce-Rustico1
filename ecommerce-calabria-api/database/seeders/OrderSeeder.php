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
use App\Models\OrderItem;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Recupera utenti e prodotti
        $users = User::where('is_admin', false)->get();
        $products = Product::where('is_active', true)->get();

        if ($users->isEmpty() || $products->isEmpty()) {
            $this->command->error('Non ci sono utenti o prodotti nel database. Impossibile creare ordini.');
            return;
        }

        // Stati ordine disponibili (usando quelli definiti nella migrazione)
        $orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        // Metodi di pagamento (usando quelli definiti nella migrazione)
        $paymentMethods = ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'];

        // Genera 50 ordini
        $ordersCount = 50;
        $orderItems = [];

        for ($i = 0; $i < $ordersCount; $i++) {
            // Scegli un utente casuale
            $user = $users->random();

            // Scegli uno stato casuale
            $status = $orderStatuses[array_rand($orderStatuses)];

            // Genera una data casuale negli ultimi 6 mesi
            $orderDate = Carbon::now()->subDays(rand(0, 180));

            // Numero di prodotti nell'ordine (da 1 a 5)
            $itemsCount = rand(1, 5);

            // Seleziona prodotti casuali per l'ordine
            $orderProducts = $products->random($itemsCount);

            // Calcola totale ordine
            $total = 0;
            foreach ($orderProducts as $product) {
                $quantity = rand(1, 3);
                $price = $product->discount_price ?: $product->price;
                $itemTotal = $price * $quantity;
                $total += $itemTotal;

                // Salva i dettagli dell'item per dopo
                $orderItems[] = [
                    'product_id' => $product->id,
                    'price' => $price,
                    'quantity' => $quantity,
                    'product_name' => $product->name,
                    'total' => $itemTotal,
                ];
            }

            // Calcola le spese di spedizione (gratis sopra i 50€)
            $shippingCost = $total >= 50 ? 0 : 7.90;

            // Calcola IVA
            $tax = $total * 0.22; // IVA al 22%

            // Calcola totale con IVA e spedizione
            $totalWithTax = $total + $tax + $shippingCost;

            // Determina se è pagato (più probabilità se lo stato è 'delivered')
            $isPaid = $status === 'delivered' ? (rand(0, 100) < 90) : (rand(0, 100) < 50);
            $paidAt = $isPaid ? $orderDate : null;

            // Crea l'ordine
            $order = new Order();
            $order->user_id = $user->id;
            $order->order_number = 'ORD-' . date('Y') . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);
            $order->status = $status;
            $order->total = $totalWithTax;
            $order->tax = $tax;
            $order->shipping_cost = $shippingCost;
            $order->payment_method = $paymentMethods[array_rand($paymentMethods)];
            $order->is_paid = $isPaid;
            $order->paid_at = $paidAt;

            // Informazioni di spedizione
            $order->shipping_name = $user->name;
            $order->shipping_surname = $user->surname;
            $order->shipping_address = $user->address ?: 'Via ' . $this->getRandomStreetName() . ' ' . rand(1, 100);
            $order->shipping_city = $user->city ?: 'Cosenza';
            $order->shipping_postal_code = $user->postal_code ?: '87100';
            $order->shipping_phone = $user->phone ?: '3' . rand(300000000, 399999999);

            $order->created_at = $orderDate;
            $order->updated_at = $orderDate;
            $order->save();

            // Crea gli elementi dell'ordine
            foreach ($orderItems as &$item) {
                $orderItem = new OrderItem();
                $orderItem->order_id = $order->id;
                $orderItem->product_id = $item['product_id'];
                $orderItem->price = $item['price'];
                $orderItem->quantity = $item['quantity'];
                $orderItem->product_name = $item['product_name'];
                $orderItem->total = $item['total'];
                $orderItem->save();
            }

            // Svuota array degli items per il prossimo ordine
            $orderItems = [];
        }

        $this->command->info("Creati $ordersCount ordini con relativi articoli");
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
     * Genera un nome di strada casuale italiano
     */
    private function getRandomStreetName()
    {
        $streetTypes = ['Via', 'Corso', 'Viale', 'Piazza', 'Largo'];
        $streetNames = ['Roma', 'Garibaldi', 'Vittorio Emanuele', 'Dante', 'Mazzini',
                      'Cavour', 'Marconi', 'Verdi', 'Leopardi', 'Diaz',
                      'Umberto I', 'Kennedy', 'Europa', 'Nazionale', 'Gentile',
                      'Rossini', 'Pascoli', 'Carducci', 'Gramsci', 'Battisti'];

        return $streetTypes[array_rand($streetTypes)] . ' ' . $streetNames[array_rand($streetNames)];
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
