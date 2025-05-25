<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Durata cache in secondi (2 ore)
     */
    const CACHE_DURATION = 7200;

    /**
     * Mostra tutte le categorie attive.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $cacheKey = 'public_categories';

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $categories = Category::withCount(['products' => function($query) {
                $query->where('is_active', true);
            }])
            ->where('is_active', true)
            ->having('products_count', '>', 0)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $response = [
            'categories' => $categories
        ];

        // Memorizza i risultati in cache
        Cache::put($cacheKey, $response, self::CACHE_DURATION);

        return response()->json($response);
    }

    /**
     * Ottieni le categorie in evidenza per la homepage.
     *
     * @return \Illuminate\Http\Response
     */
    public function featured()
    {
        $cacheKey = 'featured_categories';

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $featuredCategories = Category::withCount(['products' => function($query) {
                $query->where('is_active', true);
            }])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->having('products_count', '>', 0)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit(4)
            ->get();

        $response = [
            'featured_categories' => $featuredCategories
        ];

        Cache::put($cacheKey, $response, self::CACHE_DURATION);

        return response()->json($response);
    }

    /**
     * Mostra i dettagli di una categoria specifica e i suoi prodotti.
     *
     * @param  string  $slug
     * @return \Illuminate\Http\Response
     */
    public function show($slug)
    {
        $cacheKey = 'public_category_' . $slug;

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // Ottieni prodotti attivi nella categoria
        $products = $category->products()
            ->where('is_active', true)
            ->orderBy('name')
            ->paginate(12);

        $response = [
            'category' => $category,
            'products' => $products
        ];

        Cache::put($cacheKey, $response, self::CACHE_DURATION);

        return response()->json($response);
    }
}
