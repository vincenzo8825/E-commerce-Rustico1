<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'], // Added '*' to include all paths
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://localhost:5173', '*'], // Includi l'URL del frontend React
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['*'], // Expose all headers
    'max_age' => 0,
    'supports_credentials' => true, // Modificato a true per supportare credenziali
];
