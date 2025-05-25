<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configurazioni Produzione E-commerce Rustico
    |--------------------------------------------------------------------------
    */

    'cache' => [
        'enabled' => true,
        'ttl' => [
            'products' => 3600,      // 1 ora
            'categories' => 7200,    // 2 ore
            'global_stats' => 1800,  // 30 minuti
            'user_sessions' => 43200 // 12 ore
        ]
    ],

    'performance' => [
        'query_logging' => false,
        'debug_mode' => false,
        'memory_limit' => '256M',
        'max_execution_time' => 60,
        'compress_output' => true
    ],

    'security' => [
        'force_https' => true,
        'secure_cookies' => true,
        'csrf_protection' => true,
        'rate_limiting' => [
            'api' => 100,      // richieste per minuto
            'auth' => 5,       // tentativi login per minuto
            'checkout' => 10   // checkout per minuto
        ]
    ],

    'database' => [
        'query_cache' => true,
        'slow_query_log' => true,
        'slow_query_time' => 2, // secondi
        'connection_pooling' => true
    ],

    'uploads' => [
        'max_file_size' => 5120,    // 5MB in KB
        'allowed_types' => ['jpg', 'jpeg', 'png', 'webp'],
        'image_optimization' => true,
        'quality' => 80
    ],

    'monitoring' => [
        'health_checks' => true,
        'error_reporting' => true,
        'performance_tracking' => true,
        'alerts' => [
            'email' => env('ADMIN_EMAIL', 'admin@rustico.it'),
            'low_stock_threshold' => 5,
            'high_memory_threshold' => 85,
            'slow_response_threshold' => 2000 // ms
        ]
    ],

    'backup' => [
        'enabled' => true,
        'frequency' => 'daily',
        'retention_days' => 30,
        'include_uploads' => true
    ],

    'seo' => [
        'meta_defaults' => [
            'title' => 'Rustico - Prodotti Tipici della Calabria',
            'description' => 'Scopri i migliori prodotti tipici calabresi nel nostro e-commerce. Qualità garantita e spedizioni rapide.',
            'keywords' => 'calabria, prodotti tipici, e-commerce, rustico, alimentari'
        ],
        'social_sharing' => true,
        'structured_data' => true
    ]
];
