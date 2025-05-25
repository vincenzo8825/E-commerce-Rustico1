<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\InventoryAlert;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InventoryDashboardController extends Controller
{
    /**
     * Ottieni panoramica inventario per dashboard admin
     */
    public function getInventoryOverview()
    {
        try {
            // Statistiche generali inventario
            $totalProducts = Product::count();
            $activeProducts = Product::where('is_active', true)->count();
            $lowStockProducts = Product::where('stock', '<=', 10)->count();
            $outOfStockProducts = Product::where('stock', '=', 0)->count();

            // Valore totale inventario
            $totalInventoryValue = Product::where('is_active', true)
                ->selectRaw('SUM(price * stock) as total_value')
                ->first()
                ->total_value ?? 0;

            // Top prodotti per valore
            $topValueProducts = Product::select('name', 'price', 'stock', 'weight', 'origin')
                ->selectRaw('(price * stock) as total_value')
                ->where('is_active', true)
                ->orderByRaw('(price * stock) DESC')
                ->limit(10)
                ->get();

            // Prodotti per categoria
            $productsByCategory = Category::withCount(['products' => function($query) {
                $query->where('is_active', true);
            }])
            ->with(['products' => function($query) {
                $query->select('category_id', 'stock', 'price')
                    ->where('is_active', true);
            }])
            ->get()
            ->map(function($category) {
                $categoryValue = $category->products->sum(function($product) {
                    return $product->price * $product->stock;
                });

                return [
                    'name' => $category->name,
                    'products_count' => $category->products_count,
                    'total_value' => $categoryValue,
                    'avg_stock' => $category->products->avg('stock') ?? 0
                ];
            });

            // Alert inventario attivi
            $activeAlerts = InventoryAlert::with('product')
                ->where('is_active', true)
                ->get()
                ->map(function($alert) {
                    return [
                        'id' => $alert->id,
                        'product_name' => $alert->product->name ?? 'Prodotto non trovato',
                        'alert_type' => $alert->alert_type,
                        'threshold' => $alert->threshold,
                        'current_stock' => $alert->product->stock ?? 0,
                        'created_at' => $alert->created_at->format('d/m/Y H:i')
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'overview' => [
                        'total_products' => $totalProducts,
                        'active_products' => $activeProducts,
                        'low_stock_products' => $lowStockProducts,
                        'out_of_stock_products' => $outOfStockProducts,
                        'total_inventory_value' => round($totalInventoryValue, 2)
                    ],
                    'top_value_products' => $topValueProducts,
                    'products_by_category' => $productsByCategory,
                    'active_alerts' => $activeAlerts
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento panoramica inventario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni lista completa prodotti per inventario
     */
    public function getInventoryProducts(Request $request)
    {
        try {
            $query = Product::with('category')
                ->select('id', 'name', 'sku', 'price', 'stock', 'weight', 'origin', 'producer', 'is_active', 'is_featured', 'category_id', 'created_at');

            // Filtri
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('stock_status')) {
                switch ($request->stock_status) {
                    case 'low':
                        $query->where('stock', '<=', 10);
                        break;
                    case 'out':
                        $query->where('stock', '=', 0);
                        break;
                    case 'good':
                        $query->where('stock', '>', 10);
                        break;
                }
            }

            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('sku', 'like', '%' . $request->search . '%');
                });
            }

            // Ordinamento
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginazione
            $perPage = $request->get('per_page', 20);
            $products = $query->paginate($perPage);

            // Arricchisci i dati
            $products->getCollection()->transform(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'category' => $product->category->name ?? 'N/A',
                    'price' => $product->price,
                    'stock' => $product->stock,
                    'stock_value' => $product->price * $product->stock,
                    'weight' => $product->weight,
                    'origin' => $product->origin,
                    'producer' => $product->producer,
                    'is_active' => $product->is_active,
                    'is_featured' => $product->is_featured,
                    'stock_status' => $this->getStockStatus($product->stock),
                    'created_at' => $product->created_at->format('d/m/Y'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento prodotti inventario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna stock di un prodotto
     */
    public function updateProductStock(Request $request, $productId)
    {
        try {
            $request->validate([
                'stock' => 'required|integer|min:0',
                'reason' => 'nullable|string|max:255'
            ]);

            $product = Product::findOrFail($productId);
            $oldStock = $product->stock;
            $product->stock = $request->stock;
            $product->save();

            // Log dell'operazione (in un sistema reale)
            $logData = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'old_stock' => $oldStock,
                'new_stock' => $request->stock,
                'difference' => $request->stock - $oldStock,
                'reason' => $request->reason ?? 'Aggiornamento manuale',
                'updated_by' => Auth::user()->name ?? 'Sistema',
                'updated_at' => now()->format('d/m/Y H:i:s')
            ];

            return response()->json([
                'success' => true,
                'message' => 'Stock aggiornato con successo',
                'data' => [
                    'product' => $product->name,
                    'old_stock' => $oldStock,
                    'new_stock' => $request->stock,
                    'stock_status' => $this->getStockStatus($request->stock)
                ],
                'log' => $logData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'aggiornamento dello stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiornamento stock multiplo
     */
    public function bulkUpdateStock(Request $request)
    {
        try {
            $request->validate([
                'updates' => 'required|array',
                'updates.*.product_id' => 'required|exists:products,id',
                'updates.*.stock' => 'required|integer|min:0',
                'reason' => 'nullable|string|max:255'
            ]);

            $updated = [];
            $errors = [];

            foreach ($request->updates as $update) {
                try {
                    $product = Product::find($update['product_id']);
                    if ($product) {
                        $oldStock = $product->stock;
                        $product->stock = $update['stock'];
                        $product->save();

                        $updated[] = [
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'old_stock' => $oldStock,
                            'new_stock' => $update['stock']
                        ];
                    }
                } catch (\Exception $e) {
                    $errors[] = [
                        'product_id' => $update['product_id'],
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'message' => count($updated) . ' prodotti aggiornati con successo',
                'data' => [
                    'updated' => $updated,
                    'errors' => $errors,
                    'reason' => $request->reason ?? 'Aggiornamento multiplo'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'aggiornamento multiplo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Determina lo status dello stock
     */
    private function getStockStatus($stock)
    {
        if ($stock == 0) {
            return 'out_of_stock';
        } elseif ($stock <= 10) {
            return 'low_stock';
        } elseif ($stock <= 25) {
            return 'medium_stock';
        } else {
            return 'high_stock';
        }
    }
}
