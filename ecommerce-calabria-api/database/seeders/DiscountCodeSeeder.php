<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DiscountCode;
use Carbon\Carbon;

class DiscountCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crea codici sconto attivi
        $activeDiscounts = [
            [
                'code' => 'BENVENUTO10',
                'description' => 'Sconto del 10% per i nuovi clienti',
                'type' => 'percentage',
                'value' => 10,
                'min_order_value' => 30,
                'max_uses' => 1000,
                'used_count' => 42,
                'is_active' => true,
                'starts_at' => Carbon::now()->subDays(30),
                'expires_at' => Carbon::now()->addDays(60),
            ],
            [
                'code' => 'ESTATE2023',
                'description' => 'Sconto estivo del 15% su tutti i prodotti',
                'type' => 'percentage',
                'value' => 15,
                'min_order_value' => 50,
                'max_uses' => 500,
                'used_count' => 87,
                'is_active' => true,
                'starts_at' => Carbon::now()->subDays(15),
                'expires_at' => Carbon::now()->addDays(45),
            ],
            [
                'code' => 'SPEDIZIONE',
                'description' => 'Spedizione gratuita senza minimo d\'ordine',
                'type' => 'fixed',
                'value' => 7.90,
                'min_order_value' => 0,
                'max_uses' => 300,
                'used_count' => 29,
                'is_active' => true,
                'starts_at' => Carbon::now()->subDays(5),
                'expires_at' => Carbon::now()->addDays(25),
            ],
            [
                'code' => 'FISSO20',
                'description' => 'Sconto fisso di 20€ su ordini superiori a 100€',
                'type' => 'fixed',
                'value' => 20,
                'min_order_value' => 100,
                'max_uses' => 250,
                'used_count' => 18,
                'is_active' => true,
                'starts_at' => Carbon::now()->subDays(10),
                'expires_at' => Carbon::now()->addDays(20),
            ],
        ];

        // Crea codici sconto scaduti o futuri
        $inactiveDiscounts = [
            [
                'code' => 'SCADUTO15',
                'description' => 'Sconto del 15% - SCADUTO',
                'type' => 'percentage',
                'value' => 15,
                'min_order_value' => 30,
                'max_uses' => 400,
                'used_count' => 187,
                'is_active' => true,
                'starts_at' => Carbon::now()->subDays(90),
                'expires_at' => Carbon::now()->subDays(30),
            ],
            [
                'code' => 'NATALE2023',
                'description' => 'Sconto natalizio del 20% - Disponibile a Dicembre',
                'type' => 'percentage',
                'value' => 20,
                'min_order_value' => 50,
                'max_uses' => 1000,
                'used_count' => 0,
                'is_active' => true,
                'starts_at' => Carbon::create(2023, 12, 1),
                'expires_at' => Carbon::create(2023, 12, 31),
            ],
        ];

        // Crea codici sconto disattivati
        $disabledDiscounts = [
            [
                'code' => 'DISATTIVATO25',
                'description' => 'Sconto del 25% - Disattivato',
                'type' => 'percentage',
                'value' => 25,
                'min_order_value' => 75,
                'max_uses' => 500,
                'used_count' => 56,
                'is_active' => false,
                'starts_at' => Carbon::now()->subDays(30),
                'expires_at' => Carbon::now()->addDays(30),
            ],
        ];

        // Combina tutti i codici sconto
        $allDiscounts = array_merge($activeDiscounts, $inactiveDiscounts, $disabledDiscounts);

        // Crea i codici sconto nel database
        foreach ($allDiscounts as $discountData) {
            DiscountCode::create($discountData);
        }

        $this->command->info('Creati ' . count($allDiscounts) . ' codici sconto');
    }
}
