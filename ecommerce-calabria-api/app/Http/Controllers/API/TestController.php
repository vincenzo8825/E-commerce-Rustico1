<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /**
     * Test di connessione API
     *
     * @return \Illuminate\Http\Response
     */
    public function ping()
    {
        return response()->json([
            'message' => 'Connessione API riuscita!',
            'status' => 'success',
            'timestamp' => now()->toDateTimeString(),
            'environment' => config('app.env')
        ]);
    }

    /**
     * Simulazione categorie per test frontend
     *
     * @return \Illuminate\Http\Response
     */
    public function categories()
    {
        $categories = [
            [
                'id' => 1,
                'name' => 'Olio d\'oliva',
                'slug' => 'olio-oliva',
                'description' => 'Oli extravergine di oliva calabresi',
                'image_url' => 'https://via.placeholder.com/400x300/e9ecef/495057?text=Olio+d%27oliva+Calabrese',
                'is_active' => true,
                'products_count' => 5
            ],
            [
                'id' => 2,
                'name' => 'Formaggi',
                'slug' => 'formaggi',
                'description' => 'Formaggi tipici calabresi',
                'image_url' => 'https://via.placeholder.com/400x300/e9ecef/495057?text=Formaggi+Calabresi',
                'is_active' => true,
                'products_count' => 8
            ],
            [
                'id' => 3,
                'name' => 'Salumi',
                'slug' => 'salumi',
                'description' => 'Salumi calabresi tradizionali',
                'image_url' => 'https://via.placeholder.com/400x300/e9ecef/495057?text=Salumi+Calabresi',
                'is_active' => true,
                'products_count' => 6
            ],
            [
                'id' => 4,
                'name' => 'Conserve',
                'slug' => 'conserve',
                'description' => 'Conserve artigianali calabresi',
                'image_url' => 'https://via.placeholder.com/400x300/e9ecef/495057?text=Conserve+Calabresi',
                'is_active' => true,
                'products_count' => 10
            ]
        ];

        return response()->json([
            'categories' => $categories
        ]);
    }

    /**
     * Simulazione prodotti per test frontend
     *
     * @return \Illuminate\Http\Response
     */
    public function products()
    {
        $products = [
            [
                'id' => 1,
                'name' => 'Olio Extra Vergine di Oliva',
                'slug' => 'olio-extra-vergine-oliva',
                'description' => 'Olio extra vergine di oliva prodotto in Calabria, dal sapore intenso e fruttato.',
                'price' => 15.99,
                'image' => 'https://via.placeholder.com/300x200?text=Olio+EVO',
                'category' => [
                    'id' => 1,
                    'name' => 'Olio d\'oliva',
                    'slug' => 'olio-oliva'
                ],
                'stock' => 20,
                'is_active' => true
            ],
            [
                'id' => 2,
                'name' => 'Nduja di Spilinga',
                'slug' => 'nduja-spilinga',
                'description' => 'Salume spalmabile piccante tipico della tradizione calabrese.',
                'price' => 8.50,
                'image' => 'https://via.placeholder.com/300x200?text=Nduja',
                'category' => [
                    'id' => 3,
                    'name' => 'Salumi',
                    'slug' => 'salumi'
                ],
                'stock' => 15,
                'is_active' => true
            ],
            [
                'id' => 3,
                'name' => 'Pecorino Crotonese DOP',
                'slug' => 'pecorino-crotonese-dop',
                'description' => 'Formaggio a pasta dura prodotto con latte di pecora, stagionato per almeno 4 mesi.',
                'price' => 12.75,
                'image' => 'https://via.placeholder.com/300x200?text=Pecorino',
                'category' => [
                    'id' => 2,
                    'name' => 'Formaggi',
                    'slug' => 'formaggi'
                ],
                'stock' => 8,
                'is_active' => true
            ],
            [
                'id' => 4,
                'name' => 'Cipolla Rossa di Tropea IGP',
                'slug' => 'cipolla-rossa-tropea',
                'description' => 'Cipolla dolce e croccante, ideale per insalate e conserve.',
                'price' => 5.99,
                'image' => 'https://via.placeholder.com/300x200?text=Cipolla+Tropea',
                'category' => [
                    'id' => 4,
                    'name' => 'Conserve',
                    'slug' => 'conserve'
                ],
                'stock' => 25,
                'is_active' => true
            ]
        ];

        return response()->json([
            'products' => [
                'current_page' => 1,
                'data' => $products,
                'first_page_url' => url('/api/products?page=1'),
                'from' => 1,
                'last_page' => 1,
                'last_page_url' => url('/api/products?page=1'),
                'links' => [],
                'next_page_url' => null,
                'path' => url('/api/products'),
                'per_page' => 10,
                'prev_page_url' => null,
                'to' => count($products),
                'total' => count($products)
            ],
            'filters' => [
                'categories' => [
                    ['id' => 1, 'name' => 'Olio d\'oliva', 'slug' => 'olio-oliva'],
                    ['id' => 2, 'name' => 'Formaggi', 'slug' => 'formaggi'],
                    ['id' => 3, 'name' => 'Salumi', 'slug' => 'salumi'],
                    ['id' => 4, 'name' => 'Conserve', 'slug' => 'conserve']
                ],
                'price_range' => [
                    'min_price' => 5.99,
                    'max_price' => 15.99
                ]
            ]
        ]);
    }

    /**
     * Simulazione prodotti in evidenza per test frontend
     *
     * @return \Illuminate\Http\Response
     */
    public function featuredProducts()
    {
        $products = [
            [
                'id' => 1,
                'name' => 'Olio Extra Vergine di Oliva',
                'slug' => 'olio-extra-vergine-oliva',
                'description' => 'Olio extra vergine di oliva prodotto in Calabria, dal sapore intenso e fruttato.',
                'price' => 15.99,
                'image' => 'https://via.placeholder.com/300x200?text=Olio+EVO',
                'is_featured' => true,
                'is_active' => true
            ],
            [
                'id' => 2,
                'name' => 'Nduja di Spilinga',
                'slug' => 'nduja-spilinga',
                'description' => 'Salume spalmabile piccante tipico della tradizione calabrese.',
                'price' => 8.50,
                'image' => 'https://via.placeholder.com/300x200?text=Nduja',
                'is_featured' => true,
                'is_active' => true
            ]
        ];

        return response()->json([
            'featured_products' => $products
        ]);
    }
}
