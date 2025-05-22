<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\SupportTicket;
use App\Notifications\OrderStatusChanged;
use App\Notifications\NewProductAvailable;
use App\Notifications\SupportTicketReply;
use App\Notifications\DiscountCodeAvailable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class NotificationSeeder extends Seeder
{
    /**
     * Genera dati di notifica realistici.
     */
    public function run(): void
    {
        // Logghiamo l'inizio per debug
        Log::info('Inizia il seeding delle notifiche');

        $users = User::where('is_admin', false)->get();
        $orders = Order::all();
        $tickets = SupportTicket::all();
        $products = Product::all();

        if ($users->isEmpty()) {
            $this->command->info("Nessun utente trovato. Impossibile creare notifiche.");
            return;
        }

        if ($products->isEmpty()) {
            $this->command->info("Nessun prodotto trovato. Impossibile creare notifiche di prodotti.");
            return;
        }

        $this->command->info("Trovati " . $users->count() . " utenti, " . $orders->count() . " ordini e " . $tickets->count() . " ticket");

        // Notifiche per cambiamenti di stato degli ordini
        $notificationCount = 0;
        foreach ($users as $user) {
            // Seleziona alcuni ordini di questo utente
            $userOrders = $orders->where('user_id', $user->id)->take(rand(1, 3));

            if ($userOrders->isEmpty()) {
                continue;
            }

            foreach ($userOrders as $order) {
                try {
                    // Crea notifica di cambio stato ordine
                    DB::table('notifications')->insert([
                        'id' => \Illuminate\Support\Str::uuid()->toString(),
                        'type' => 'App\\Notifications\\OrderStatusChanged',
                        'notifiable_type' => 'App\\Models\\User',
                        'notifiable_id' => $user->id,
                        'data' => json_encode([
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'status' => $order->status,
                            'message' => 'Il tuo ordine ' . $order->order_number . ' è stato aggiornato a: ' . $order->status
                        ]),
                        'created_at' => Carbon::now()->subDays(rand(0, 10)),
                        'updated_at' => Carbon::now()->subDays(rand(0, 10)),
                        'read_at' => rand(0, 1) ? Carbon::now()->subDays(rand(0, 5)) : null
                    ]);
                    $notificationCount++;

                    // Imposta alcune notifiche come già lette
                    if (rand(0, 1) === 1) {
                        // Nota: le notifiche sono già marcate come lette sopra in modo casuale
                        $this->command->info("Alcune notifiche sono state marcate come lette");
                    }
                } catch (\Exception $e) {
                    $this->command->error("Errore durante la creazione della notifica per l'ordine {$order->id}: " . $e->getMessage());
                }
            }
        }

        // Notifiche per nuovi prodotti disponibili
        $randomUsers = $users->random(min(count($users), 5));
        foreach ($randomUsers as $user) {
            try {
                $randomProduct = $products->random();
                DB::table('notifications')->insert([
                    'id' => \Illuminate\Support\Str::uuid()->toString(),
                    'type' => 'App\\Notifications\\NewProductAvailable',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'product_id' => $randomProduct->id,
                        'product_name' => $randomProduct->name,
                        'product_image' => $randomProduct->image,
                        'product_price' => $randomProduct->price
                    ]),
                    'created_at' => Carbon::now()->subDays(rand(0, 7)),
                    'updated_at' => Carbon::now()->subDays(rand(0, 7)),
                    'read_at' => rand(0, 1) ? Carbon::now()->subDays(rand(0, 3)) : null
                ]);
                $notificationCount++;
            } catch (\Exception $e) {
                $this->command->error("Errore durante la creazione della notifica di nuovo prodotto: " . $e->getMessage());
            }
        }

        // Notifiche per risposte ai ticket di supporto
        if (!$tickets->isEmpty()) {
            foreach ($tickets->take(5) as $ticket) {
                try {
                    if ($ticket->status !== 'open') {
                        DB::table('notifications')->insert([
                            'id' => \Illuminate\Support\Str::uuid()->toString(),
                            'type' => 'App\\Notifications\\SupportTicketReply',
                            'notifiable_type' => 'App\\Models\\User',
                            'notifiable_id' => $ticket->user_id,
                            'data' => json_encode([
                                'ticket_id' => $ticket->id,
                                'subject' => $ticket->subject,
                                'status' => $ticket->status,
                                'message' => 'Nuova risposta al tuo ticket: ' . $ticket->subject
                            ]),
                            'created_at' => Carbon::now()->subDays(rand(0, 5)),
                            'updated_at' => Carbon::now()->subDays(rand(0, 5)),
                            'read_at' => $ticket->status === 'closed' ? Carbon::now()->subDays(rand(0, 2)) : null
                        ]);
                        $notificationCount++;
                    }
                } catch (\Exception $e) {
                    $this->command->error("Errore durante la creazione della notifica per il ticket {$ticket->id}: " . $e->getMessage());
                }
            }
        }

        // Notifiche per codici sconto disponibili
        $randomUsers = $users->random(min(count($users), 8));
        foreach ($randomUsers as $user) {
            try {
                DB::table('notifications')->insert([
                    'id' => \Illuminate\Support\Str::uuid()->toString(),
                    'type' => 'App\\Notifications\\DiscountCodeAvailable',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'code' => 'SCONTO' . rand(10, 99),
                        'discount_percent' => rand(5, 25),
                        'expires_at' => Carbon::now()->addDays(rand(3, 10))->format('Y-m-d')
                    ]),
                    'created_at' => Carbon::now()->subDays(rand(0, 14)),
                    'updated_at' => Carbon::now()->subDays(rand(0, 14)),
                    'read_at' => rand(0, 1) ? Carbon::now()->subDays(rand(0, 5)) : null
                ]);
                $notificationCount++;
            } catch (\Exception $e) {
                $this->command->error("Errore durante la creazione della notifica di codice sconto: " . $e->getMessage());
            }
        }

        $this->command->info("Notifiche create con successo: " . $notificationCount);
    }
}
