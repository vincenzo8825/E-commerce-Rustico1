<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;
use App\Models\Product;
use App\Models\Category;

class CacheController extends Controller
{
    /**
     * Ottimizza la cache del sistema
     */
    public function optimizeCache()
    {
        try {
            // Cache dei prodotti più venduti
            $topProducts = Cache::remember('top_products', 3600, function () {
                return Product::with('category')
                    ->withCount('orderItems')
                    ->orderBy('order_items_count', 'desc')
                    ->limit(10)
                    ->get();
            });

            // Cache delle categorie con contatori
            $categories = Cache::remember('categories_with_counts', 3600, function () {
                return Category::withCount('products')->get();
            });

            // Cache delle statistiche globali
            $globalStats = Cache::remember('global_stats', 1800, function () {
                return [
                    'total_products' => Product::count(),
                    'total_categories' => Category::count(),
                    'active_products' => Product::where('is_active', true)->count(),
                    'low_stock_products' => Product::where('stock_quantity', '<=', 10)->count()
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Cache ottimizzata con successo',
                'cached_items' => [
                    'top_products' => $topProducts->count(),
                    'categories' => $categories->count(),
                    'global_stats' => count($globalStats)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'ottimizzazione cache',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Pulisci tutta la cache
     */
    public function clearCache()
    {
        try {
            Cache::flush();
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');

            return response()->json([
                'success' => true,
                'message' => 'Cache pulita con successo'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella pulizia cache',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni statistiche della cache
     */
    public function getCacheStats()
    {
        $cacheKeys = [
            'top_products',
            'categories_with_counts',
            'global_stats'
        ];

        $stats = [];
        foreach ($cacheKeys as $key) {
            $stats[$key] = [
                'exists' => Cache::has($key),
                'ttl' => Cache::has($key) ? 'Active' : 'Expired'
            ];
        }

        return response()->json([
            'success' => true,
            'cache_stats' => $stats,
            'memory_usage' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true)
        ]);
    }

    /**
     * Pre-carica dati critici
     */
    public function preloadCriticalData()
    {
        try {
            // Pre-carica prodotti in evidenza
            Cache::remember('featured_products', 7200, function () {
                return Product::featured()->with('category')->get();
            });

            // Pre-carica prodotti più acquistati
            Cache::remember('best_sellers', 7200, function () {
                return Product::select('products.*')
                    ->join('order_items', 'products.id', '=', 'order_items.product_id')
                    ->groupBy('products.id')
                    ->orderByRaw('SUM(order_items.quantity) DESC')
                    ->limit(20)
                    ->get();
            });

            // Pre-carica categorie attive
            Cache::remember('active_categories', 7200, function () {
                return Category::where('is_active', true)
                    ->withCount(['products' => function ($query) {
                        $query->where('is_active', true);
                    }])
                    ->orderBy('name')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'message' => 'Dati critici pre-caricati con successo'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel pre-caricamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
