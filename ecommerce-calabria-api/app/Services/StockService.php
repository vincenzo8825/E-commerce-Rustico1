<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use App\Notifications\LowStockAlert;
use Illuminate\Support\Facades\Log;

class StockService
{
    /**
     * Soglia predefinita per avviso stock basso.
     */
    protected $threshold;

    /**
     * Create a new service instance.
     */
    public function __construct(int $threshold = 5)
    {
        $this->threshold = $threshold;
    }

    /**
     * Controlla tutti i prodotti e invia notifiche per quelli con stock basso.
     */
    public function checkLowStockProducts()
    {
        // Ottieni tutti i prodotti con stock basso
        $lowStockProducts = Product::where('stock', '<=', $this->threshold)
            ->where('stock', '>', 0)
            ->get();

        // Ottieni tutti gli amministratori
        $admins = User::where('is_admin', true)->get();

        if ($admins->isEmpty()) {
            Log::warning('Nessun amministratore trovato per inviare notifiche di stock basso');
            return;
        }

        // Conta quanti prodotti sono stati processati
        $processedCount = 0;

        // Invia una notifica per ogni prodotto con stock basso
        foreach ($lowStockProducts as $product) {
            foreach ($admins as $admin) {
                try {
                    $admin->notify(new LowStockAlert($product, $this->threshold));
                    $processedCount++;
                } catch (\Exception $e) {
                    Log::error('Errore nell\'invio della notifica di stock basso: ' . $e->getMessage());
                }
            }
        }

        Log::info("Controllo stock completato. Inviate $processedCount notifiche per " . count($lowStockProducts) . " prodotti con stock basso.");
    }

    /**
     * Controlla se un singolo prodotto ha stock basso e invia notifiche.
     */
    public function checkProductStock(Product $product)
    {
        if ($product->stock <= $this->threshold && $product->stock > 0) {
            // Ottieni tutti gli amministratori
            $admins = User::where('is_admin', true)->get();

            if ($admins->isEmpty()) {
                Log::warning('Nessun amministratore trovato per inviare notifiche di stock basso');
                return;
            }

            // Invia notifica a ogni amministratore
            foreach ($admins as $admin) {
                try {
                    $admin->notify(new LowStockAlert($product, $this->threshold));
                } catch (\Exception $e) {
                    Log::error('Errore nell\'invio della notifica di stock basso: ' . $e->getMessage());
                }
            }

            Log::info("Inviata notifica di stock basso per il prodotto: " . $product->name);
        }
    }
}
