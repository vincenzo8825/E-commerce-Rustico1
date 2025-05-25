<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\InventoryAlert;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    /**
     * Ottieni tutti gli alert di stock attivi
     */
    public function stockAlerts(): JsonResponse
    {
        try {
            $alerts = InventoryAlert::with('product')
                ->active()
                ->whereHas('product', function ($query) {
                    $query->where('is_active', true);
                })
                ->get()
                ->filter(function ($alert) {
                    return $alert->shouldTrigger();
                });

            return response()->json([
                'success' => true,
                'data' => $alerts,
                'message' => 'Alert di stock recuperati con successo'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel recupero degli alert: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni prodotti con stock basso
     */
    public function lowStockProducts(Request $request): JsonResponse
    {
        try {
            $threshold = $request->get('threshold', 10);

            $products = Product::with(['category', 'inventoryAlerts'])
                ->lowStock($threshold)
                ->active()
                ->orderBy('stock', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products,
                'threshold' => $threshold,
                'message' => 'Prodotti con stock basso recuperati con successo'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel recupero dei prodotti: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiornamento bulk dello stock
     */
    public function bulkUpdateStock(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'updates' => 'required|array',
                'updates.*.product_id' => 'required|exists:products,id',
                'updates.*.stock' => 'required|integer|min:0'
            ]);

            $updated = 0;
            foreach ($request->updates as $update) {
                $product = Product::find($update['product_id']);
                if ($product) {
                    $product->update(['stock' => $update['stock']]);
                    $updated++;
                }
            }

            return response()->json([
                'success' => true,
                'updated' => $updated,
                'message' => "Stock aggiornato per {$updated} prodotti"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'aggiornamento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crea un nuovo alert di inventario
     */
    public function createAlert(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'alert_type' => 'required|in:low_stock,out_of_stock,reorder_point',
                'threshold' => 'required|integer|min:0',
                'notes' => 'nullable|string|max:500'
            ]);

            $alert = InventoryAlert::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $alert->load('product'),
                'message' => 'Alert creato con successo'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella creazione dell\'alert: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna un alert esistente
     */
    public function updateAlert(Request $request, InventoryAlert $alert): JsonResponse
    {
        try {
            $request->validate([
                'alert_type' => 'sometimes|in:low_stock,out_of_stock,reorder_point',
                'threshold' => 'sometimes|integer|min:0',
                'is_active' => 'sometimes|boolean',
                'notes' => 'nullable|string|max:500'
            ]);

            $alert->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $alert->load('product'),
                'message' => 'Alert aggiornato con successo'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'aggiornamento dell\'alert: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un alert
     */
    public function deleteAlert(InventoryAlert $alert): JsonResponse
    {
        try {
            $alert->delete();

            return response()->json([
                'success' => true,
                'message' => 'Alert eliminato con successo'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'eliminazione dell\'alert: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export inventario in CSV
     */
    public function exportInventory(): JsonResponse
    {
        try {
            $products = Product::with('category')
                ->select(['id', 'name', 'sku', 'stock', 'price', 'category_id', 'is_active'])
                ->get()
                ->map(function ($product) {
                    return [
                        'ID' => $product->id,
                        'Nome' => $product->name,
                        'SKU' => $product->sku,
                        'Stock' => $product->stock,
                        'Prezzo' => $product->price,
                        'Categoria' => $product->category->name ?? 'N/A',
                        'Attivo' => $product->is_active ? 'Sì' : 'No'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $products,
                'message' => 'Inventario esportato con successo'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'export: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiche inventario
     */
    public function inventoryStats(): JsonResponse
    {
        try {
            $stats = [
                'total_products' => Product::count(),
                'active_products' => Product::active()->count(),
                'low_stock_products' => Product::lowStock(10)->count(),
                'out_of_stock_products' => Product::where('stock', 0)->count(),
                'total_stock_value' => Product::active()
                    ->selectRaw('SUM(stock * price) as total_value')
                    ->value('total_value'),
                'active_alerts' => InventoryAlert::active()->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistiche inventario recuperate con successo'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel recupero delle statistiche: ' . $e->getMessage()
            ], 500);
        }
    }
}
