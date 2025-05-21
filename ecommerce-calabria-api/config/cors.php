<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'], // Added '*' to include all paths
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Allow all origins for testing
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['*'], // Expose all headers
    'max_age' => 0,
    'supports_credentials' => false, // Changed to false to simplify testing
];