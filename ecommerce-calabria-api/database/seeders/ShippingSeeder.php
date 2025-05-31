<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ShippingZone;
use App\Models\ShippingMethod;

class ShippingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pulizia tabelle
        ShippingMethod::query()->delete();
        ShippingZone::query()->delete();

        // ZONA 1: ITALIA
        $italyZone = ShippingZone::create([
            'name' => 'Italia',
            'description' => 'Spedizioni nazionali in Italia',
            'countries' => ['IT'],
            'postal_codes' => null, // Tutti i CAP italiani
            'is_active' => true,
            'priority' => 1
        ]);

        // Metodi per Italia
        ShippingMethod::create([
            'shipping_zone_id' => $italyZone->id,
            'name' => 'Spedizione Standard Italia',
            'description' => 'Consegna in 2-4 giorni lavorativi',
            'calculation_type' => 'tiered',
            'base_cost' => 7.90,
            'price_tiers' => [
                ['min_amount' => 0, 'max_amount' => 29.99, 'cost' => 7.90],
                ['min_amount' => 30, 'max_amount' => 49.99, 'cost' => 5.90],
                ['min_amount' => 50, 'max_amount' => null, 'cost' => 0] // Spedizione gratuita
            ],
            'delivery_time' => 2,
            'delivery_time_max' => 4,
            'is_active' => true,
            'is_express' => false,
            'tracking_available' => true,
            'insurance_included' => false,
            'free_shipping_enabled' => true,
            'remote_area_surcharge' => 2.00,
            'priority' => 1
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $italyZone->id,
            'name' => 'Spedizione Express Italia',
            'description' => 'Consegna in 24-48 ore',
            'calculation_type' => 'fixed',
            'base_cost' => 12.90,
            'delivery_time' => 1,
            'delivery_time_max' => 2,
            'is_active' => true,
            'is_express' => true,
            'tracking_available' => true,
            'insurance_included' => true,
            'free_shipping_enabled' => false,
            'remote_area_surcharge' => 5.00,
            'priority' => 2
        ]);

        // ZONA 2: UNIONE EUROPEA
        $euZone = ShippingZone::create([
            'name' => 'Unione Europea',
            'description' => 'Spedizioni nei paesi dell\'Unione Europea',
            'countries' => ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'],
            'postal_codes' => null,
            'is_active' => true,
            'priority' => 2
        ]);

        // Metodi per UE
        ShippingMethod::create([
            'shipping_zone_id' => $euZone->id,
            'name' => 'Spedizione Standard UE',
            'description' => 'Consegna in 5-7 giorni lavorativi',
            'calculation_type' => 'tiered',
            'base_cost' => 12.90,
            'price_tiers' => [
                ['min_amount' => 0, 'max_amount' => 74.99, 'cost' => 12.90],
                ['min_amount' => 75, 'max_amount' => null, 'cost' => 0] // Spedizione gratuita
            ],
            'delivery_time' => 5,
            'delivery_time_max' => 7,
            'is_active' => true,
            'is_express' => false,
            'tracking_available' => true,
            'insurance_included' => false,
            'free_shipping_enabled' => true,
            'priority' => 1
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $euZone->id,
            'name' => 'Spedizione Express UE',
            'description' => 'Consegna in 2-4 giorni lavorativi',
            'calculation_type' => 'fixed',
            'base_cost' => 19.90,
            'delivery_time' => 2,
            'delivery_time_max' => 4,
            'is_active' => true,
            'is_express' => true,
            'tracking_available' => true,
            'insurance_included' => true,
            'free_shipping_enabled' => false,
            'priority' => 2
        ]);

        // ZONA 3: SVIZZERA E REGNO UNITO
        $swissUkZone = ShippingZone::create([
            'name' => 'Svizzera e Regno Unito',
            'description' => 'Spedizioni per Svizzera e Regno Unito',
            'countries' => ['CH', 'UK', 'GB'],
            'postal_codes' => null,
            'is_active' => true,
            'priority' => 3
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $swissUkZone->id,
            'name' => 'Spedizione Standard CH/UK',
            'description' => 'Consegna in 7-10 giorni lavorativi (dazi esclusi)',
            'calculation_type' => 'weight',
            'base_cost' => 15.00,
            'cost_per_kg' => 5.00,
            'min_cost' => 15.00,
            'max_cost' => 50.00,
            'delivery_time' => 7,
            'delivery_time_max' => 10,
            'is_active' => true,
            'is_express' => false,
            'tracking_available' => true,
            'insurance_included' => false,
            'free_shipping_enabled' => false,
            'priority' => 1
        ]);

        // ZONA 4: RESTO DEL MONDO
        $worldZone = ShippingZone::create([
            'name' => 'Resto del Mondo',
            'description' => 'Spedizioni internazionali per tutti gli altri paesi',
            'countries' => ['US', 'CA', 'AU', 'JP', 'BR', 'AR', 'MX', 'IN', 'CN', 'RU', 'ZA'],
            'postal_codes' => null,
            'is_active' => true,
            'priority' => 4
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $worldZone->id,
            'name' => 'Spedizione Internazionale',
            'description' => 'Consegna in 10-21 giorni lavorativi (dazi esclusi)',
            'calculation_type' => 'weight',
            'base_cost' => 25.00,
            'cost_per_kg' => 8.00,
            'min_cost' => 25.00,
            'max_cost' => 100.00,
            'delivery_time' => 10,
            'delivery_time_max' => 21,
            'is_active' => true,
            'is_express' => false,
            'tracking_available' => true,
            'insurance_included' => true,
            'free_shipping_enabled' => false,
            'priority' => 1
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $worldZone->id,
            'name' => 'Spedizione Express Internazionale',
            'description' => 'Consegna in 5-8 giorni lavorativi (dazi esclusi)',
            'calculation_type' => 'weight',
            'base_cost' => 45.00,
            'cost_per_kg' => 12.00,
            'min_cost' => 45.00,
            'max_cost' => 150.00,
            'delivery_time' => 5,
            'delivery_time_max' => 8,
            'is_active' => true,
            'is_express' => true,
            'tracking_available' => true,
            'insurance_included' => true,
            'free_shipping_enabled' => false,
            'priority' => 2
        ]);

        // ZONA 5: ZONE REMOTE ITALIANE (Isole minori)
        $italyRemoteZone = ShippingZone::create([
            'name' => 'Isole Minori Italia',
            'description' => 'Spedizioni per isole minori e zone remote',
            'countries' => ['IT'],
            'postal_codes' => ['98050', '98051', '98055', '91023', '90010'], // Esempi CAP isole
            'is_active' => true,
            'priority' => 0 // Priorità più alta per override
        ]);

        ShippingMethod::create([
            'shipping_zone_id' => $italyRemoteZone->id,
            'name' => 'Spedizione Isole Minori',
            'description' => 'Consegna in 4-7 giorni lavorativi',
            'calculation_type' => 'fixed',
            'base_cost' => 12.90,
            'delivery_time' => 4,
            'delivery_time_max' => 7,
            'is_active' => true,
            'is_express' => false,
            'tracking_available' => true,
            'insurance_included' => false,
            'free_shipping_enabled' => false,
            'remote_area_surcharge' => 0, // Già incluso nel prezzo base
            'priority' => 1
        ]);

        $this->command->info('✅ Create ' . ShippingZone::count() . ' zone di spedizione');
        $this->command->info('✅ Creati ' . ShippingMethod::count() . ' metodi di spedizione');
    }
}
