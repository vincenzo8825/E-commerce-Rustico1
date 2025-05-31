<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Newsletter;
use Carbon\Carbon;

class NewsletterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Svuota la tabella per testing pulito
        Newsletter::query()->delete();

        $this->command->info('Creazione newsletter subscribers...');

        // Subscribers attivi con email verificata
        $activeSubscribers = [
            [
                'email' => 'marco.rossi@example.com',
                'name' => 'Marco Rossi',
                'preferences' => [
                    'new_products' => true,
                    'offers' => true,
                    'recipes' => true,
                    'events' => false
                ],
                'is_active' => true,
                'email_verified_at' => Carbon::now()->subDays(rand(1, 30)),
                'subscribed_at' => Carbon::now()->subDays(rand(1, 60)),
                'source' => 'website'
            ],
            [
                'email' => 'giulia.bianchi@example.com',
                'name' => 'Giulia Bianchi',
                'preferences' => [
                    'new_products' => true,
                    'offers' => true,
                    'recipes' => false,
                    'events' => true
                ],
                'is_active' => true,
                'email_verified_at' => Carbon::now()->subDays(rand(1, 20)),
                'subscribed_at' => Carbon::now()->subDays(rand(1, 45)),
                'source' => 'footer'
            ],
            [
                'email' => 'antonio.ferrari@example.com',
                'name' => 'Antonio Ferrari',
                'preferences' => [
                    'new_products' => false,
                    'offers' => true,
                    'recipes' => true,
                    'events' => false
                ],
                'is_active' => true,
                'email_verified_at' => Carbon::now()->subDays(rand(1, 15)),
                'subscribed_at' => Carbon::now()->subDays(rand(1, 30)),
                'source' => 'checkout'
            ],
            [
                'email' => 'francesca.romano@example.com',
                'name' => 'Francesca Romano',
                'preferences' => [
                    'new_products' => true,
                    'offers' => false,
                    'recipes' => true,
                    'events' => true
                ],
                'is_active' => true,
                'email_verified_at' => Carbon::now()->subDays(rand(1, 10)),
                'subscribed_at' => Carbon::now()->subDays(rand(1, 25)),
                'source' => 'popup'
            ],
            [
                'email' => 'luca.galli@example.com',
                'name' => 'Luca Galli',
                'preferences' => [
                    'new_products' => true,
                    'offers' => true,
                    'recipes' => false,
                    'events' => false
                ],
                'is_active' => true,
                'email_verified_at' => Carbon::now()->subDays(rand(1, 8)),
                'subscribed_at' => Carbon::now()->subDays(rand(1, 20)),
                'source' => 'social'
            ]
        ];

        // Subscribers non verificati (recenti)
        $unverifiedSubscribers = [
            [
                'email' => 'mario.conti@example.com',
                'name' => 'Mario Conti',
                'preferences' => [
                    'new_products' => true,
                    'offers' => true,
                    'recipes' => true,
                    'events' => true
                ],
                'is_active' => true,
                'email_verified_at' => null,
                'subscribed_at' => Carbon::now()->subDays(rand(1, 3)),
                'source' => 'website'
            ],
            [
                'email' => 'elena.ricci@example.com',
                'name' => 'Elena Ricci',
                'preferences' => [
                    'new_products' => true,
                    'offers' => false,
                    'recipes' => true,
                    'events' => false
                ],
                'is_active' => true,
                'email_verified_at' => null,
                'subscribed_at' => Carbon::now()->subHours(rand(1, 48)),
                'source' => 'footer'
            ]
        ];

        // Subscribers disattivati (unsubscribed)
        $unsubscribedSubscribers = [
            [
                'email' => 'paolo.martini@example.com',
                'name' => 'Paolo Martini',
                'preferences' => [
                    'new_products' => false,
                    'offers' => true,
                    'recipes' => false,
                    'events' => false
                ],
                'is_active' => false,
                'email_verified_at' => Carbon::now()->subDays(rand(30, 60)),
                'subscribed_at' => Carbon::now()->subDays(rand(60, 120)),
                'unsubscribed_at' => Carbon::now()->subDays(rand(1, 10)),
                'source' => 'website'
            ],
            [
                'email' => 'sara.costa@example.com',
                'name' => 'Sara Costa',
                'preferences' => [
                    'new_products' => true,
                    'offers' => true,
                    'recipes' => false,
                    'events' => true
                ],
                'is_active' => false,
                'email_verified_at' => Carbon::now()->subDays(rand(40, 80)),
                'subscribed_at' => Carbon::now()->subDays(rand(80, 150)),
                'unsubscribed_at' => Carbon::now()->subDays(rand(5, 20)),
                'source' => 'checkout'
            ]
        ];

        // Inserisci tutti i subscribers
        $allSubscribers = array_merge(
            $activeSubscribers,
            $unverifiedSubscribers,
            $unsubscribedSubscribers
        );

        foreach ($allSubscribers as $subscriber) {
            Newsletter::create($subscriber);
        }

        // Statistiche finali
        $total = Newsletter::count();
        $active = Newsletter::active()->count();
        $verified = Newsletter::active()->verified()->count();
        $unsubscribed = Newsletter::where('is_active', false)->count();

        $this->command->info("Newsletter seeding completato:");
        $this->command->info("- Totale iscritti: {$total}");
        $this->command->info("- Attivi: {$active}");
        $this->command->info("- Verificati: {$verified}");
        $this->command->info("- Disiscritti: {$unsubscribed}");
    }
}
