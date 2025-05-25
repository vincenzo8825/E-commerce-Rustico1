<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;

class CustomNotificationSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn('Nessun utente trovato. Esegui prima UserSeeder.');
            return;
        }

        // Notifiche per utenti normali
        $customerUsers = $users->where('is_admin', false);

        foreach ($customerUsers->take(5) as $user) {
            // Notifica di benvenuto
            Notification::create([
                'user_id' => $user->id,
                'type' => 'welcome',
                'title' => 'Benvenuto su Rustico!',
                'message' => 'Grazie per esserti registrato. Scopri i migliori sapori della Calabria.',
                'data' => [
                    'action_url' => '/products',
                    'icon' => '🏠'
                ],
                'created_at' => now()->subDays(rand(1, 7))
            ]);

            // Notifica ordine confermato
            Notification::create([
                'user_id' => $user->id,
                'type' => 'order_confirmed',
                'title' => 'Ordine Confermato',
                'message' => 'Il tuo ordine è stato confermato e sarà elaborato a breve.',
                'data' => [
                    'order_id' => 'ORD-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                    'action_url' => '/dashboard/orders',
                    'icon' => '✅'
                ],
                'created_at' => now()->subDays(rand(1, 5))
            ]);

            // Notifica recensione approvata (per alcuni utenti)
            if (rand(0, 1)) {
                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'review_approved',
                    'title' => 'Recensione Approvata',
                    'message' => 'La tua recensione per "Nduja di Spilinga IGP" è stata approvata.',
                    'data' => [
                        'product_name' => 'Nduja di Spilinga IGP',
                        'action_url' => '/dashboard/reviews',
                        'icon' => '⭐'
                    ],
                    'read_at' => rand(0, 1) ? now()->subHours(rand(1, 24)) : null,
                    'created_at' => now()->subDays(rand(1, 3))
                ]);
            }
        }

        // Notifiche per admin
        $adminUsers = $users->where('is_admin', true);

        foreach ($adminUsers as $admin) {
            // Notifica nuovo ordine
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'new_order',
                'title' => 'Nuovo Ordine Ricevuto',
                'message' => 'È arrivato un nuovo ordine da Mario Rossi. Valore: €45.30',
                'data' => [
                    'order_id' => 'ORD-123',
                    'customer_name' => 'Mario Rossi',
                    'amount' => 45.30,
                    'action_url' => '/admin/orders',
                    'icon' => '🛒'
                ],
                'created_at' => now()->subHours(rand(1, 12))
            ]);

            // Notifica stock basso
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'low_stock',
                'title' => 'Attenzione: Stock Basso',
                'message' => '3 prodotti stanno per esaurirsi. Controlla l\'inventario.',
                'data' => [
                    'products_count' => 3,
                    'action_url' => '/admin/inventory',
                    'icon' => '⚠️'
                ],
                'created_at' => now()->subHours(rand(2, 8))
            ]);

            // Notifica nuova recensione da moderare
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'review_pending',
                'title' => 'Nuova Recensione da Moderare',
                'message' => 'Una nuova recensione è in attesa di approvazione.',
                'data' => [
                    'product_name' => 'Caciocavallo Silano DOP',
                    'reviewer_name' => 'Giulia Bianchi',
                    'rating' => 5,
                    'action_url' => '/admin/reviews',
                    'icon' => '📝'
                ],
                'read_at' => rand(0, 1) ? now()->subMinutes(rand(30, 120)) : null,
                'created_at' => now()->subMinutes(rand(30, 180))
            ]);

            // Notifica supporto
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'support_ticket',
                'title' => 'Nuovo Ticket di Supporto',
                'message' => 'Un cliente ha aperto un nuovo ticket di supporto.',
                'data' => [
                    'ticket_id' => 'SUP-456',
                    'customer_name' => 'Antonio Verde',
                    'subject' => 'Problema con la spedizione',
                    'action_url' => '/admin/support',
                    'icon' => '🔧'
                ],
                'created_at' => now()->subHours(rand(1, 6))
            ]);
        }

        $this->command->info('Notifiche personalizzate create con successo!');
        $this->command->info('Totale notifiche: ' . Notification::count());
    }
}
