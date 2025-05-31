<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Coupon;
use Carbon\Carbon;

class CouponSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pulizia tabella (per testing) - uso delete invece di truncate
        Coupon::query()->delete();

        // Coupon percentuale generale
        Coupon::create([
            'code' => 'BENVENUTO10',
            'name' => 'Sconto Benvenuto',
            'description' => 'Sconto del 10% per i nuovi clienti - valido su tutti i prodotti',
            'type' => 'percentage',
            'value' => 10.00,
            'minimum_amount' => 50.00,
            'maximum_discount' => 20.00,
            'usage_limit' => 100,
            'user_usage_limit' => 1,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMonths(3),
            'is_active' => true,
            'auto_apply' => false,
            'priority' => 1
        ]);

        // Coupon importo fisso
        Coupon::create([
            'code' => 'NATALE2024',
            'name' => 'Offerta Natale',
            'description' => 'Sconto fisso di 15€ per ordini sopra i 100€ - Offerta speciale Natale',
            'type' => 'fixed',
            'value' => 15.00,
            'minimum_amount' => 100.00,
            'maximum_discount' => null,
            'usage_limit' => 50,
            'user_usage_limit' => 2,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addWeeks(4),
            'is_active' => true,
            'auto_apply' => false,
            'priority' => 2
        ]);

        // Coupon spedizione gratuita
        Coupon::create([
            'code' => 'SPEDGRATIS',
            'name' => 'Spedizione Gratuita',
            'description' => 'Spedizione gratuita per ordini sopra i 30€',
            'type' => 'free_shipping',
            'value' => 7.90,
            'minimum_amount' => 30.00,
            'maximum_discount' => null,
            'usage_limit' => null,
            'user_usage_limit' => null,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMonth(),
            'is_active' => true,
            'auto_apply' => false,
            'priority' => 3
        ]);

        // Coupon percentuale alta per ordini grandi
        Coupon::create([
            'code' => 'MEGA20',
            'name' => 'Mega Sconto',
            'description' => 'Sconto del 20% per ordini sopra i 200€',
            'type' => 'percentage',
            'value' => 20.00,
            'minimum_amount' => 200.00,
            'maximum_discount' => 50.00,
            'usage_limit' => 20,
            'user_usage_limit' => 1,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addWeeks(2),
            'is_active' => true,
            'auto_apply' => false,
            'priority' => 4
        ]);

        // Coupon per utenti specifici (sconto VIP)
        Coupon::create([
            'code' => 'VIP15',
            'name' => 'Sconto VIP',
            'description' => 'Sconto esclusivo del 15% per clienti VIP',
            'type' => 'percentage',
            'value' => 15.00,
            'minimum_amount' => 75.00,
            'maximum_discount' => 30.00,
            'usage_limit' => null,
            'user_usage_limit' => 5,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addMonths(6),
            'is_active' => true,
            'auto_apply' => false,
            'priority' => 5
        ]);

        // Coupon in scadenza (per testare urgenza)
        Coupon::create([
            'code' => 'ULTIMORA',
            'name' => 'Ultima Ora',
            'description' => 'Sconto del 25% - Solo per oggi!',
            'type' => 'percentage',
            'value' => 25.00,
            'minimum_amount' => 40.00,
            'maximum_discount' => 25.00,
            'usage_limit' => 10,
            'user_usage_limit' => 1,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addHours(24),
            'is_active' => true,
            'auto_apply' => false,
            'priority' => 6
        ]);

        // Coupon piccolo importo (accessibile)
        Coupon::create([
            'code' => 'PICCOLO5',
            'name' => 'Piccolo Sconto',
            'description' => 'Sconto di 5€ per iniziare - nessun importo minimo',
            'type' => 'fixed',
            'value' => 5.00,
            'minimum_amount' => 0,
            'maximum_discount' => null,
            'usage_limit' => 200,
            'user_usage_limit' => 1,
            'starts_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addWeeks(8),
            'is_active' => true,
            'auto_apply' => false,
            'priority' => 7
        ]);

        $this->command->info('✅ Creati ' . Coupon::count() . ' coupons di test');
    }
}
