<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    /**
     * Durata cache in secondi (2 ore)
     */
    const CACHE_DURATION = 7200;

    /**
     * Ottiene un elenco di prodotti con filtri, ordinamento e paginazione.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Crea una chiave cache unica basata sui parametri di richiesta
        $cacheKey = 'products_' . md5(json_encode($request->all()));

        // Verifica se i risultati sono già in cache
        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $query = Product::with('category')
            ->where('is_active', true);

        // Applicazione dei filtri
        $query = $this->applyFilters($request, $query);

        // Applicazione dell'ordinamento
        $query = $this->applySorting($request, $query);

        // Paginazione risultati
        $perPage = $request->input('per_page', 12);
        $products = $query->paginate($perPage);

        $response = [
            'products' => $products,
            'filters' => $this->getAvailableFilters()
        ];

        // Memorizza i risultati in cache
        Cache::put($cacheKey, $response, self::CACHE_DURATION);

        return response()->json($response);
    }

    /**
     * Ottiene i dettagli di un singolo prodotto.
     *
     * @param  string  $slug
     * @return \Illuminate\Http\Response
     */
    public function show($slug)
    {
        $cacheKey = 'product_' . $slug;

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $product = Product::with(['category'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        // Ottieni prodotti correlati (stessa categoria)
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->limit(4)
            ->get();

        $response = [
            'product' => $product,
            'related_products' => $relatedProducts
        ];

        Cache::put($cacheKey, $response, self::CACHE_DURATION);

        return response()->json($response);
    }

    /**
     * Cerca prodotti utilizzando ricerca fulltext.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        $query = $request->input('q');
        if (!$query || strlen($query) < 3) {
            return response()->json([
                'message' => 'La query di ricerca deve contenere almeno 3 caratteri',
                'products' => []
            ], 400);
        }

        $cacheKey = 'search_' . md5($query . json_encode($request->except('q')));

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        // Utilizzo della ricerca fulltext
        $products = Product::whereRaw('MATCH(name, description, ingredients) AGAINST(? IN BOOLEAN MODE)', [$query . '*'])
            ->where('is_active', true);

        // Salviamo le categorie dei prodotti trovati per suggerire prodotti correlati
        $categoryIds = clone $products;
        $categoryIds = $categoryIds->pluck('category_id')->unique()->toArray();

        // Applicazione di eventuali filtri aggiuntivi
        $products = $this->applyFilters($request, $products);

        // Applicazione dell'ordinamento
        $products = $this->applySorting($request, $products);

        // Paginazione risultati
        $perPage = $request->input('per_page', 12);
        $results = $products->paginate($perPage);

        // Ottieni prodotti correlati dalle stesse categorie ma che non corrispondono alla query di ricerca
        $relatedProducts = [];
        if (!empty($categoryIds) && count($results) < 5) {
            $relatedProducts = Product::whereIn('category_id', $categoryIds)
                ->where('is_active', true)
                ->whereRaw('NOT MATCH(name, description, ingredients) AGAINST(? IN BOOLEAN MODE)', [$query . '*'])
                ->orderBy('is_featured', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(4)
                ->get();
        }

        $response = [
            'query' => $query,
            'products' => $results,
            'related_products' => $relatedProducts,
            'filters' => $this->getAvailableFilters()
        ];

        Cache::put($cacheKey, $response, self::CACHE_DURATION);

        return response()->json($response);
    }

    /**
     * Ottiene suggerimenti durante la digitazione nella ricerca.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function suggestions(Request $request)
    {
        $query = $request->input('q');
        if (!$query || strlen($query) < 2) {
            return response()->json([
                'suggestions' => []
            ]);
        }

        $cacheKey = 'suggestions_' . md5($query);

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        // Ottieni suggerimenti dai nomi dei prodotti
        $productSuggestions = Product::where('name', 'like', "%{$query}%")
            ->where('is_active', true)
            ->select('name')
            ->distinct()
            ->limit(5)
            ->pluck('name')
            ->toArray();

        // Ottieni suggerimenti dalle categorie
        $categorySuggestions = Category::where('name', 'like', "%{$query}%")
            ->select('name')
            ->distinct()
            ->limit(3)
            ->pluck('name')
            ->map(function($name) {
                return "Categoria: {$name}";
            })
            ->toArray();

        $suggestions = array_merge($productSuggestions, $categorySuggestions);

        $response = [
            'suggestions' => $suggestions
        ];

        Cache::put($cacheKey, $response, 3600); // Cache per 1 ora

        return response()->json($response);
    }

    /**
     * Ottieni prodotti in evidenza per la homepage.
     *
     * @return \Illuminate\Http\Response
     */
    public function featured()
    {
        $cacheKey = 'featured_products';

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $featuredProducts = Product::with('category')
            ->where('is_featured', true)
            ->where('is_active', true)
            ->limit(8)
            ->get();

        $response = [
            'featured_products' => $featuredProducts
        ];

        Cache::put($cacheKey, $response, self::CACHE_DURATION);

        return response()->json($response);
    }

    /**
     * Ottieni prodotti nuovi o recenti.
     *
     * @return \Illuminate\Http\Response
     */
    public function newArrivals()
    {
        $cacheKey = 'new_products';

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        $newProducts = Product::with('category')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        $response = [
            'new_products' => $newProducts
        ];

        Cache::put($cacheKey, $response, self::CACHE_DURATION);

        return response()->json($response);
    }

    /**
     * Applica filtri alla query dei prodotti.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function applyFilters(Request $request, $query)
    {
        // Filtro per categoria
        if ($request->has('category') && $request->category) {
            $categorySlug = $request->category;
            $query->whereHas('category', function($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Filtro per range di prezzo
        if ($request->has('price_min') && $request->price_min) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->has('price_max') && $request->price_max) {
            $query->where('price', '<=', $request->price_max);
        }

        // Filtro per disponibilità
        if ($request->has('in_stock') && $request->in_stock === 'true') {
            $query->where('stock', '>', 0);
        }

        // Filtro per offerte/sconti
        if ($request->has('discount') && $request->discount === 'true') {
            $query->whereNotNull('discount_price');
        }

        // Filtro per origine/provenienza
        if ($request->has('origin') && $request->origin) {
            $query->where('origin', $request->origin);
        }

        // Filtro per produttore
        if ($request->has('producer') && $request->producer) {
            $query->where('producer', $request->producer);
        }

        return $query;
    }

    /**
     * Applica ordinamento alla query dei prodotti.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function applySorting(Request $request, $query)
    {
        $sortBy = $request->input('sort_by', 'default');

        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'popularity': // Richiede implementazione di conteggio vendite
                // Potremmo implementarlo tramite una relazione con OrderItem
                $query->orderBy('created_at', 'desc'); // Fallback
                break;
            default:
                $query->orderBy('name', 'asc');
        }

        return $query;
    }

    /**
     * Ottiene i filtri disponibili per la UI.
     *
     * @return array
     */
    private function getAvailableFilters()
    {
        $cacheKey = 'available_filters';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Ottieni le categorie attive per i filtri
        $categories = Category::withCount(['products' => function($query) {
                $query->where('is_active', true);
            }])
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        // Ottieni il prezzo minimo e massimo per il range slider
        $priceRange = Product::where('is_active', true)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        // Ottieni elenco origini disponibili con conteggio prodotti
        $origins = Product::where('is_active', true)
            ->whereNotNull('origin')
            ->select('origin', DB::raw('count(*) as products_count'))
            ->groupBy('origin')
            ->orderBy('products_count', 'desc')
            ->get();

        // Ottieni elenco produttori disponibili con conteggio prodotti
        $producers = Product::where('is_active', true)
            ->whereNotNull('producer')
            ->select('producer', DB::raw('count(*) as products_count'))
            ->groupBy('producer')
            ->orderBy('products_count', 'desc')
            ->get();

        // Attributi disponibili per filtri dinamici nella UI
        $attributes = [
            [
                'id' => 'origin',
                'name' => 'Origine',
                'type' => 'select',
                'options' => $origins->map(function($item) {
                    return [
                        'value' => $item->origin,
                        'label' => $item->origin,
                        'count' => $item->products_count
                    ];
                })
            ],
            [
                'id' => 'producer',
                'name' => 'Produttore',
                'type' => 'select',
                'options' => $producers->map(function($item) {
                    return [
                        'value' => $item->producer,
                        'label' => $item->producer,
                        'count' => $item->products_count
                    ];
                })
            ],
            [
                'id' => 'in_stock',
                'name' => 'Disponibilità',
                'type' => 'checkbox',
                'options' => [
                    [
                        'value' => 'true',
                        'label' => 'Solo prodotti disponibili'
                    ]
                ]
            ],
            [
                'id' => 'discount',
                'name' => 'Offerte',
                'type' => 'checkbox',
                'options' => [
                    [
                        'value' => 'true',
                        'label' => 'Solo prodotti in offerta'
                    ]
                ]
            ]
        ];

        $filters = [
            'categories' => $categories,
            'price_range' => $priceRange,
            'attributes' => $attributes
        ];

        Cache::put($cacheKey, $filters, self::CACHE_DURATION);

        return $filters;
    }
}
