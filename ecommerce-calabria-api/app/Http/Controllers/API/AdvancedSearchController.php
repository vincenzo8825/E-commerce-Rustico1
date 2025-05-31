<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdvancedSearchController extends Controller
{
    /**
     * Ricerca avanzata con filtri combinati
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        try {
            $validated = $request->validate([
                'q' => 'nullable|string|max:255',
                'categories' => 'nullable|array',
                'categories.*' => 'integer|exists:categories,id',
                'price_range' => 'nullable|array',
                'price_range.min' => 'nullable|numeric|min:0',
                'price_range.max' => 'nullable|numeric|min:0',
                'rating' => 'nullable|numeric|min:0|max:5',
                'availability' => 'nullable|in:all,in_stock,out_of_stock',
                'origin' => 'nullable|array',
                'certifications' => 'nullable|array',
                'ingredients' => 'nullable|array',
                'sort' => 'nullable|in:relevance,price_asc,price_desc,rating,newest',
                'per_page' => 'nullable|integer|min:1|max:50',
                'page' => 'nullable|integer|min:1'
            ]);

            $query = Product::with(['category', 'reviews'])
                           ->where('is_active', true);

            // Ricerca testuale
            if (!empty($validated['q'])) {
                $searchTerm = $validated['q'];
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('short_description', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Filtro categorie
            if (!empty($validated['categories'])) {
                $query->whereIn('category_id', $validated['categories']);
            }

            // Filtro prezzo
            if (!empty($validated['price_range'])) {
                if (isset($validated['price_range']['min']) && $validated['price_range']['min'] > 0) {
                    $query->where('price', '>=', $validated['price_range']['min']);
                }
                if (isset($validated['price_range']['max']) && $validated['price_range']['max'] < 500) {
                    $query->where('price', '<=', $validated['price_range']['max']);
                }
            }

            // Filtro disponibilità
            if (isset($validated['availability'])) {
                switch ($validated['availability']) {
                    case 'in_stock':
                        $query->where('stock_quantity', '>', 0);
                        break;
                    case 'out_of_stock':
                        $query->where('stock_quantity', '<=', 0);
                        break;
                    case 'all':
                    default:
                        // Nessun filtro
                        break;
                }
            }

            // Filtro origine
            if (!empty($validated['origin'])) {
                $query->where(function($q) use ($validated) {
                    foreach ($validated['origin'] as $origin) {
                        $q->orWhere('origin', 'LIKE', "%{$origin}%");
                    }
                });
            }

            // Filtro certificazioni
            if (!empty($validated['certifications'])) {
                $query->where(function($q) use ($validated) {
                    foreach ($validated['certifications'] as $cert) {
                        $q->orWhere('certifications', 'LIKE', "%{$cert}%");
                    }
                });
            }

            // Filtro ingredienti
            if (!empty($validated['ingredients'])) {
                $query->where(function($q) use ($validated) {
                    foreach ($validated['ingredients'] as $ingredient) {
                        $q->orWhere('ingredients', 'LIKE', "%{$ingredient}%");
                    }
                });
            }

            // Filtro rating
            if (!empty($validated['rating']) && $validated['rating'] > 0) {
                $query->withAvg('reviews', 'rating')
                      ->having('reviews_avg_rating', '>=', $validated['rating']);
            }

            // Ordinamento
            $sortBy = $validated['sort'] ?? 'relevance';
            switch ($sortBy) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'rating':
                    $query->withAvg('reviews', 'rating')
                          ->orderBy('reviews_avg_rating', 'desc');
                    break;
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'relevance':
                default:
                    if (!empty($validated['q'])) {
                        $query->orderByRaw('CASE
                            WHEN name LIKE ? THEN 1
                            WHEN short_description LIKE ? THEN 2
                            ELSE 3 END',
                            ["%{$validated['q']}%", "%{$validated['q']}%"]
                        );
                    } else {
                        $query->orderBy('created_at', 'desc');
                    }
                    break;
            }

            // Aggiungi rating medio e conteggio recensioni
            $query->withAvg('reviews', 'rating')
                  ->withCount('reviews');

            // Paginazione
            $perPage = $validated['per_page'] ?? 20;
            $products = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'results' => $products->items(),
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'last_page' => $products->lastPage(),
                    'has_more' => $products->hasMorePages()
                ],
                'search_stats' => [
                    'total_results' => $products->total(),
                    'search_term' => $validated['q'] ?? null,
                    'filters_applied' => count(array_filter($validated)),
                    'execution_time' => round(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], 3)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore durante la ricerca',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suggerimenti automatici per la ricerca
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function suggestions(Request $request)
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2|max:100'
        ]);

        $query = $validated['q'];
        $cacheKey = 'search_suggestions_' . md5($query);

        try {
            $suggestions = Cache::remember($cacheKey, 1800, function() use ($query) {
                $allSuggestions = [];

                // Prodotti
                $products = Product::where('is_active', true)
                    ->where(function($q) use ($query) {
                        $q->where('name', 'LIKE', "%{$query}%")
                          ->orWhere('short_description', 'LIKE', "%{$query}%");
                    })
                    ->select('id', 'name', 'slug')
                    ->limit(5)
                    ->get();

                foreach ($products as $product) {
                    $allSuggestions[] = [
                        'type' => 'product',
                        'text' => $product->name,
                        'slug' => $product->slug,
                        'id' => $product->id
                    ];
                }

                // Categorie
                $categories = Category::where('name', 'LIKE', "%{$query}%")
                    ->select('id', 'name', 'slug')
                    ->withCount('products')
                    ->limit(3)
                    ->get();

                foreach ($categories as $category) {
                    $allSuggestions[] = [
                        'type' => 'category',
                        'text' => $category->name,
                        'slug' => $category->slug,
                        'count' => $category->products_count
                    ];
                }

                // Ingredienti comuni
                $commonIngredients = [
                    'peperoncino', 'nduja', 'olio extravergine', 'pecorino',
                    'pomodoro', 'basilico', 'aglio', 'cipolla rossa', 'bergamotto'
                ];

                foreach ($commonIngredients as $ingredient) {
                    if (stripos($ingredient, $query) !== false) {
                        $allSuggestions[] = [
                            'type' => 'ingredient',
                            'text' => ucfirst($ingredient),
                            'query' => $ingredient
                        ];
                    }
                }

                return array_slice($allSuggestions, 0, 8);
            });

            return response()->json([
                'success' => true,
                'suggestions' => $suggestions,
                'query' => $query
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento dei suggerimenti',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ricerca per ingredienti specifici
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchByIngredients(Request $request)
    {
        $validated = $request->validate([
            'ingredients' => 'required|array|min:1',
            'exclude_allergens' => 'nullable|array',
            'match_all' => 'nullable|boolean'
        ]);

        try {
            $query = Product::with(['category'])->where('is_active', true);

            $matchAll = $validated['match_all'] ?? false;
            $ingredients = $validated['ingredients'];

            if ($matchAll) {
                foreach ($ingredients as $ingredient) {
                    $query->where('ingredients', 'LIKE', "%{$ingredient}%");
                }
            } else {
                $query->where(function($q) use ($ingredients) {
                    foreach ($ingredients as $ingredient) {
                        $q->orWhere('ingredients', 'LIKE', "%{$ingredient}%");
                    }
                });
            }

            if (!empty($validated['exclude_allergens'])) {
                foreach ($validated['exclude_allergens'] as $allergen) {
                    $query->where('allergens', 'NOT LIKE', "%{$allergen}%");
                }
            }

            $products = $query->withAvg('reviews', 'rating')
                             ->withCount('reviews')
                             ->get();

            return response()->json([
                'success' => true,
                'products' => $products,
                'search_criteria' => [
                    'ingredients' => $ingredients,
                    'exclude_allergens' => $validated['exclude_allergens'] ?? [],
                    'match_all' => $matchAll
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella ricerca per ingredienti',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ricerca per certificazioni
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchByCertifications(Request $request)
    {
        $validated = $request->validate([
            'certifications' => 'required|array|min:1',
            'category_id' => 'nullable|integer|exists:categories,id'
        ]);

        try {
            $query = Product::with(['category'])->where('is_active', true);

            $query->where(function($q) use ($validated) {
                foreach ($validated['certifications'] as $cert) {
                    $q->orWhere('certifications', 'LIKE', "%{$cert}%");
                }
            });

            if (!empty($validated['category_id'])) {
                $query->where('category_id', $validated['category_id']);
            }

            $products = $query->withAvg('reviews', 'rating')
                             ->withCount('reviews')
                             ->orderBy('name', 'asc')
                             ->get();

            return response()->json([
                'success' => true,
                'products' => $products,
                'certifications' => $validated['certifications'],
                'total_certified_products' => $products->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella ricerca per certificazioni',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni i filtri disponibili per la ricerca avanzata
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableFilters()
    {
        try {
            $cacheKey = 'advanced_search_filters';

            $filters = Cache::remember($cacheKey, 3600, function() {
                // Range di prezzo
                $priceRange = Product::where('is_active', true)
                    ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
                    ->first();

                // Categorie con conteggio prodotti
                $categories = Category::select('id', 'name', 'slug')
                    ->withCount(['products' => function($query) {
                        $query->where('is_active', true);
                    }])
                    ->having('products_count', '>', 0)
                    ->orderBy('name')
                    ->get()
                    ->map(function($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug,
                            'count' => $category->products_count
                        ];
                    });

                // Origini disponibili
                $origins = Product::where('is_active', true)
                    ->whereNotNull('origin')
                    ->where('origin', '!=', '')
                    ->select('origin')
                    ->groupBy('origin')
                    ->selectRaw('origin, COUNT(*) as count')
                    ->get()
                    ->map(function($item) {
                        return [
                            'value' => $item->origin,
                            'label' => $item->origin,
                            'count' => $item->count
                        ];
                    });

                // Certificazioni disponibili
                $certifications = Product::where('is_active', true)
                    ->whereNotNull('certifications')
                    ->where('certifications', '!=', '')
                    ->pluck('certifications')
                    ->flatMap(function ($cert) {
                        return explode(',', $cert);
                    })
                    ->map(function ($cert) {
                        return trim($cert);
                    })
                    ->countBy()
                    ->map(function($count, $cert) {
                        return [
                            'value' => $cert,
                            'label' => strtoupper($cert),
                            'count' => $count
                        ];
                    })
                    ->values();

                // Ingredienti più comuni
                $ingredients = collect([
                    'peperoncino', 'nduja', 'olio extravergine', 'pecorino',
                    'pomodoro', 'basilico', 'aglio', 'cipolla rossa', 'bergamotto',
                    'soppressata', 'caciocavallo', 'fichi', 'miele', 'liquirizia'
                ])->map(function($ingredient) {
                    $count = Product::where('is_active', true)
                        ->where('ingredients', 'LIKE', "%{$ingredient}%")
                        ->count();

                    return [
                        'value' => $ingredient,
                        'label' => ucfirst($ingredient),
                        'count' => $count
                    ];
                })->filter(function($item) {
                    return $item['count'] > 0;
                })->values();

                return [
                    'price_range' => [
                        'min' => $priceRange->min_price ?? 0,
                        'max' => $priceRange->max_price ?? 500
                    ],
                    'categories' => $categories,
                    'origins' => $origins,
                    'certifications' => $certifications,
                    'ingredients' => $ingredients,
                    'sort_options' => [
                        'relevance' => 'Rilevanza',
                        'price_asc' => 'Prezzo crescente',
                        'price_desc' => 'Prezzo decrescente',
                        'rating' => 'Migliori recensioni',
                        'newest' => 'Più recenti'
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'filters' => $filters
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento dei filtri',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
