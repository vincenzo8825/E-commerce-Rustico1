<?php

namespace Database\Seeders;

use App\Models\InventoryAlert;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InventoryAlertSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crea alert per prodotti con stock basso (sotto i 10 pezzi)
        $lowStockProducts = Product::where('stock', '<=', 10)->get();

        foreach ($lowStockProducts as $product) {
            InventoryAlert::create([
                'product_id' => $product->id,
                'alert_type' => 'low_stock',
                'threshold' => rand(5, 10), // Soglia casuale tra 5 e 10
                'is_active' => true,
                'notes' => 'Alert automatico per stock basso - ' . $product->name
            ]);
        }

        // Crea alcuni alert per reorder point
        $products = Product::inRandomOrder()->limit(5)->get();

        foreach ($products as $product) {
            InventoryAlert::create([
                'product_id' => $product->id,
                'alert_type' => 'reorder_point',
                'threshold' => rand(15, 25), // Soglia più alta per reorder
                'is_active' => true,
                'notes' => 'Punto di riordino per ' . $product->name
            ]);
        }

        // Crea alert per out of stock (prodotti con stock 0)
        $outOfStockProducts = Product::where('stock', 0)->get();

        foreach ($outOfStockProducts as $product) {
            InventoryAlert::create([
                'product_id' => $product->id,
                'alert_type' => 'out_of_stock',
                'threshold' => 0,
                'is_active' => true,
                'notes' => 'Prodotto esaurito - ' . $product->name,
                'last_triggered_at' => now()
            ]);
        }

        $this->command->info('Creati ' . InventoryAlert::count() . ' alert di inventario.');
    }
}
