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
        $discountCodes = [
            [
                'code' => 'BENVENUTO10',
                'description' => 'Sconto del 10% per i nuovi clienti',
                'type' => 'percentage',
                'value' => 10,
                'min_order_value' => 30.00,
                'max_uses' => 100,
                'used_count' => 0,
                'is_active' => true,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(3),
            ],
            [
                'code' => 'ESTATE2023',
                'description' => 'Sconto di 15€ per ordini superiori a 100€',
                'type' => 'fixed',
                'value' => 15.00,
                'min_order_value' => 100.00,
                'max_uses' => 50,
                'used_count' => 0,
                'is_active' => true,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(2),
            ],
            [
                'code' => 'SPEDIZIONE',
                'description' => 'Spedizione gratuita per ordini superiori a 50€',
                'type' => 'fixed',
                'value' => 7.50,
                'min_order_value' => 50.00,
                'max_uses' => 200,
                'used_count' => 0,
                'is_active' => true,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(6),
            ],
        ];

        foreach ($discountCodes as $discountCode) {
            // Check if discount code already exists
            if (!DiscountCode::where('code', $discountCode['code'])->exists()) {
                DiscountCode::create($discountCode);
            }
        }
    }
}
