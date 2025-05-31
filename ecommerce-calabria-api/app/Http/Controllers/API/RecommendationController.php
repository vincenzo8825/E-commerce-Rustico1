<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Category;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class RecommendationController extends Controller
{
    /**
     * Ottieni raccomandazioni per un prodotto specifico
     */
    public function getProductRecommendations(Request $request, $productId)
    {
        $product = Product::with(['category', 'reviews'])->findOrFail($productId);
        $userId = Auth::id();
        $limit = $request->input('limit', 8);

        $cacheKey = "product_recommendations_{$productId}_{$userId}_{$limit}";

        $recommendations = Cache::remember($cacheKey, 3600, function() use ($product, $userId, $limit) {
            $recommendations = [];

            // 1. Prodotti correlati (stesso produttore/categoria)
            $relatedProducts = $this->getRelatedProducts($product, $limit / 2);
            $recommendations['related'] = $relatedProducts;

            // 2. Frequently bought together
            $frequentlyBought = $this->getFrequentlyBoughtTogether($product, $limit / 4);
            $recommendations['frequently_bought'] = $frequentlyBought;

            // 3. Prodotti simili (basato su caratteristiche)
            $similarProducts = $this->getSimilarProducts($product, $limit / 4);
            $recommendations['similar'] = $similarProducts;

            // 4. Raccomandazioni personalizzate per utente autenticato
            if ($userId) {
                $personalizedProducts = $this->getPersonalizedRecommendations($userId, $product, $limit / 2);
                $recommendations['personalized'] = $personalizedProducts;
            }

            return $recommendations;
        });

        return response()->json([
            'success' => true,
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category->name
            ],
            'recommendations' => $recommendations,
            'total_recommendations' => array_sum(array_map('count', $recommendations))
        ]);
    }

    /**
     * Ottieni raccomandazioni per l'homepage
     */
    public function getHomepageRecommendations(Request $request)
    {
        $userId = Auth::id();
        $limit = $request->input('limit', 12);

        $cacheKey = "homepage_recommendations_{$userId}_{$limit}";

        $recommendations = Cache::remember($cacheKey, 1800, function() use ($userId, $limit) {
            $recommendations = [];

            // 1. Prodotti trending (più venduti di recente)
            $recommendations['trending'] = $this->getTrendingProducts($limit / 3);

            // 2. Migliori recensioni
            $recommendations['best_rated'] = $this->getBestRatedProducts($limit / 3);

            // 3. Nuovi arrivi
            $recommendations['new_arrivals'] = $this->getNewArrivals($limit / 3);

            if ($userId) {
                // 4. Raccomandazioni personalizzate
                $recommendations['for_you'] = $this->getPersonalizedForUser($userId, $limit / 2);

                // 5. Basato sulla cronologia
                $recommendations['based_on_history'] = $this->getBasedOnHistory($userId, $limit / 4);

                // 6. Categoria preferita
                $recommendations['favorite_category'] = $this->getFavoriteCategoryProducts($userId, $limit / 4);
            } else {
                // Per utenti anonimi: prodotti popolari
                $recommendations['popular'] = $this->getPopularProducts($limit / 2);
            }

            return $recommendations;
        });

        return response()->json([
            'success' => true,
            'user_authenticated' => (bool) $userId,
            'recommendations' => $recommendations,
            'cache_info' => [
                'cached_at' => now()->toISOString(),
                'expires_in' => '30 minutes'
            ]
        ]);
    }

    /**
     * Ottieni raccomandazioni per categoria
     */
    public function getCategoryRecommendations(Request $request, $categoryId)
    {
        $category = Category::findOrFail($categoryId);
        $userId = Auth::id();
        $limit = $request->input('limit', 12);

        $cacheKey = "category_recommendations_{$categoryId}_{$userId}_{$limit}";

        $recommendations = Cache::remember($cacheKey, 3600, function() use ($category, $userId, $limit) {
            $recommendations = [];

            // 1. Best seller nella categoria
            $recommendations['bestsellers'] = $this->getCategoryBestsellers($category, $limit / 3);

            // 2. Migliori valutazioni nella categoria
            $recommendations['top_rated'] = $this->getCategoryTopRated($category, $limit / 3);

            // 3. Nuovi nella categoria
            $recommendations['newest'] = $this->getCategoryNewest($category, $limit / 3);

            if ($userId) {
                // 4. Personalizzati per la categoria
                $recommendations['personalized'] = $this->getPersonalizedForCategory($userId, $category, $limit / 3);
            }

            return $recommendations;
        });

        return response()->json([
            'success' => true,
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description
            ],
            'recommendations' => $recommendations
        ]);
    }

    /**
     * Aggiorna le raccomandazioni in base alle azioni utente
     */
    public function updateUserPreferences(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
        }

        $action = $request->input('action'); // view, purchase, add_to_cart, like, etc.
        $productId = $request->input('product_id');
        $categoryId = $request->input('category_id');

        // Salva le azioni utente per migliorare le raccomandazioni
        DB::table('user_interactions')->updateOrInsert([
            'user_id' => $userId,
            'product_id' => $productId,
            'action_type' => $action
        ], [
            'interaction_count' => DB::raw('interaction_count + 1'),
            'last_interaction' => now(),
            'category_id' => $categoryId,
            'updated_at' => now()
        ]);

        // Pulisci la cache delle raccomandazioni per questo utente
        $this->clearUserRecommendationCache($userId);

        return response()->json([
            'success' => true,
            'message' => 'User preferences updated successfully'
        ]);
    }

    /**
     * Ottieni statistiche raccomandazioni
     */
    public function getRecommendationStats(Request $request)
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Admin access required'], 403);
        }

        $stats = Cache::remember('recommendation_stats', 3600, function() {
            return [
                'total_interactions' => DB::table('user_interactions')->count(),
                'unique_users' => DB::table('user_interactions')->distinct('user_id')->count(),
                'most_viewed_products' => $this->getMostViewedProducts(10),
                'conversion_rate' => $this->calculateConversionRate(),
                'popular_categories' => $this->getPopularCategories(5),
                'recommendation_performance' => $this->getRecommendationPerformance()
            ];
        });

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    // === METODI PRIVATI ===

    private function getRelatedProducts(Product $product, int $limit): Collection
    {
        return Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('views_count')
            ->limit($limit)
            ->get();
    }

    private function getFrequentlyBoughtTogether(Product $product, int $limit): Collection
    {
        // Trova prodotti spesso acquistati insieme a questo
        $productIds = DB::table('order_items as oi1')
            ->join('order_items as oi2', 'oi1.order_id', '=', 'oi2.order_id')
            ->where('oi1.product_id', $product->id)
            ->where('oi2.product_id', '!=', $product->id)
            ->groupBy('oi2.product_id')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->limit($limit)
            ->pluck('oi2.product_id');

        return Product::whereIn('id', $productIds)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->get();
    }

    private function getSimilarProducts(Product $product, int $limit): Collection
    {
        // Trova prodotti simili basati su attributi condivisi
        return Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->whereBetween('price', [$product->price * 0.7, $product->price * 1.3])
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get();
    }

    private function getPersonalizedRecommendations(int $userId, Product $product, int $limit): Collection
    {
        // Basato su interazioni utente e prodotti simili
        $userInteractions = DB::table('user_interactions')
            ->where('user_id', $userId)
            ->where('action_type', 'purchase')
            ->pluck('product_id');

        if ($userInteractions->isEmpty()) {
            return collect();
        }

        // Trova categorie preferite dell'utente
        $preferredCategories = Product::whereIn('id', $userInteractions)
            ->groupBy('category_id')
            ->select('category_id', DB::raw('COUNT(*) as count'))
            ->orderByDesc('count')
            ->pluck('category_id');

        return Product::whereIn('category_id', $preferredCategories)
            ->where('id', '!=', $product->id)
            ->whereNotIn('id', $userInteractions)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get();
    }

    private function getTrendingProducts(int $limit): Collection
    {
        return Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->whereHas('orderItems', function($query) {
                $query->where('created_at', '>=', now()->subDays(7));
            })
            ->withCount(['orderItems' => function($query) {
                $query->where('created_at', '>=', now()->subDays(7));
            }])
            ->withAvg('reviews', 'rating')
            ->orderByDesc('order_items_count')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get();
    }

    private function getBestRatedProducts(int $limit): Collection
    {
        return Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->having('reviews_count', '>=', 3)
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('reviews_count')
            ->limit($limit)
            ->get();
    }

    private function getNewArrivals(int $limit): Collection
    {
        return Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->where('created_at', '>=', now()->subDays(30))
            ->withAvg('reviews', 'rating')
            ->orderByDesc('created_at')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get();
    }

    private function getPersonalizedForUser(int $userId, int $limit): Collection
    {
        $userOrders = DB::table('orders')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->pluck('id');

        if ($userOrders->isEmpty()) {
            return $this->getPopularProducts($limit);
        }

        $purchasedProductIds = DB::table('order_items')
            ->whereIn('order_id', $userOrders)
            ->pluck('product_id');

        $userCategories = Product::whereIn('id', $purchasedProductIds)
            ->groupBy('category_id')
            ->select('category_id', DB::raw('COUNT(*) as count'))
            ->orderByDesc('count')
            ->limit(3)
            ->pluck('category_id');

        return Product::whereIn('category_id', $userCategories)
            ->whereNotIn('id', $purchasedProductIds)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    private function getBasedOnHistory(int $userId, int $limit): Collection
    {
        $viewedProducts = DB::table('user_interactions')
            ->where('user_id', $userId)
            ->where('action_type', 'view')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderByDesc('interaction_count')
            ->limit(5)
            ->pluck('product_id');

        if ($viewedProducts->isEmpty()) {
            return collect();
        }

        $categories = Product::whereIn('id', $viewedProducts)
            ->pluck('category_id');

        return Product::whereIn('category_id', $categories)
            ->whereNotIn('id', $viewedProducts)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get();
    }

    private function getFavoriteCategoryProducts(int $userId, int $limit): Collection
    {
        $favoriteCategory = DB::table('user_interactions')
            ->where('user_id', $userId)
            ->groupBy('category_id')
            ->select('category_id', DB::raw('SUM(interaction_count) as total'))
            ->orderByDesc('total')
            ->first();

        if (!$favoriteCategory) {
            return collect();
        }

        return Product::where('category_id', $favoriteCategory->category_id)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    private function getPopularProducts(int $limit): Collection
    {
        return Product::where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withCount('orderItems')
            ->withAvg('reviews', 'rating')
            ->orderByDesc('order_items_count')
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get();
    }

    private function getCategoryBestsellers(Category $category, int $limit): Collection
    {
        return Product::where('category_id', $category->id)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withCount('orderItems')
            ->orderByDesc('order_items_count')
            ->limit($limit)
            ->get();
    }

    private function getCategoryTopRated(Category $category, int $limit): Collection
    {
        return Product::where('category_id', $category->id)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->having('reviews_count', '>=', 2)
            ->orderByDesc('reviews_avg_rating')
            ->limit($limit)
            ->get();
    }

    private function getCategoryNewest(Category $category, int $limit): Collection
    {
        return Product::where('category_id', $category->id)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    private function getPersonalizedForCategory(int $userId, Category $category, int $limit): Collection
    {
        $userInteractionScore = DB::table('user_interactions')
            ->where('user_id', $userId)
            ->where('category_id', $category->id)
            ->sum('interaction_count');

        if ($userInteractionScore == 0) {
            return collect();
        }

        return Product::where('category_id', $category->id)
            ->where('is_active', true)
            ->where('stock_quantity', '>', 0)
            ->withAvg('reviews', 'rating')
            ->orderByDesc('reviews_avg_rating')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    private function getMostViewedProducts(int $limit): Collection
    {
        return DB::table('user_interactions')
            ->join('products', 'user_interactions.product_id', '=', 'products.id')
            ->where('action_type', 'view')
            ->groupBy('product_id', 'products.name')
            ->select('product_id', 'products.name', DB::raw('SUM(interaction_count) as total_views'))
            ->orderByDesc('total_views')
            ->limit($limit)
            ->get();
    }

    private function calculateConversionRate(): float
    {
        $totalViews = DB::table('user_interactions')
            ->where('action_type', 'view')
            ->sum('interaction_count');

        $totalPurchases = DB::table('user_interactions')
            ->where('action_type', 'purchase')
            ->sum('interaction_count');

        return $totalViews > 0 ? round(($totalPurchases / $totalViews) * 100, 2) : 0;
    }

    private function getPopularCategories(int $limit): Collection
    {
        return DB::table('user_interactions')
            ->join('categories', 'user_interactions.category_id', '=', 'categories.id')
            ->groupBy('category_id', 'categories.name')
            ->select('category_id', 'categories.name', DB::raw('SUM(interaction_count) as total_interactions'))
            ->orderByDesc('total_interactions')
            ->limit($limit)
            ->get();
    }

    private function getRecommendationPerformance(): array
    {
        // Calcola metriche di performance delle raccomandazioni
        $clicks = DB::table('user_interactions')
            ->where('action_type', 'recommendation_click')
            ->count();

        $purchases = DB::table('user_interactions')
            ->where('action_type', 'recommendation_purchase')
            ->count();

        return [
            'total_clicks' => $clicks,
            'total_purchases' => $purchases,
            'click_through_rate' => $clicks > 0 ? round(($purchases / $clicks) * 100, 2) : 0
        ];
    }

    private function clearUserRecommendationCache(int $userId): void
    {
        $patterns = [
            "homepage_recommendations_{$userId}_*",
            "product_recommendations_*_{$userId}_*",
            "category_recommendations_*_{$userId}_*"
        ];

        foreach ($patterns as $pattern) {
            Cache::flush(); // In produzione usa Redis con pattern matching
        }
    }
}
