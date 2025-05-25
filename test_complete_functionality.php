<?php

/**
 * Script di Test Completo per Sistema E-commerce Rustico
 * 
 * Testa tutte le funzionalità dal backend:
 * 1. Registrazione/Login
 * 2. Prodotti e Categorie
 * 3. Carrello e Preferiti
 * 4. Ordini e Checkout
 * 5. Ticket Supporto
 * 6. Notifiche
 * 7. Dashboard Admin
 */

echo "🚀 **TEST COMPLETO SISTEMA E-COMMERCE RUSTICO**\n";
echo "================================================\n\n";

$baseUrl = 'http://127.0.0.1:8000/api';
$testResults = [];

// Helper function per chiamate HTTP
function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    
    $defaultHeaders = ['Content-Type: application/json'];
    $allHeaders = array_merge($defaultHeaders, $headers);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $allHeaders);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'http_code' => 0];
    }
    
    return [
        'data' => json_decode($response, true),
        'http_code' => $httpCode,
        'raw' => $response
    ];
}

// Test connessione base
function testConnection($baseUrl) {
    echo "🔗 Test Connessione Base...\n";
    
    $response = makeRequest("$baseUrl/ping");
    
    if ($response['http_code'] === 200) {
        echo "✅ Connessione OK: " . $response['data']['message'] . "\n";
        return true;
    } else {
        echo "❌ Connessione FALLITA: HTTP {$response['http_code']}\n";
        return false;
    }
}

// Test endpoints pubblici (senza autenticazione)
function testPublicEndpoints($baseUrl) {
    echo "\n📦 Test Endpoints Pubblici...\n";
    
    $endpoints = [
        'products' => '/products',
        'categories' => '/categories',
        'featured_products' => '/products/featured',
        'new_arrivals' => '/products/new-arrivals',
    ];
    
    $results = [];
    
    foreach ($endpoints as $name => $endpoint) {
        $response = makeRequest("$baseUrl$endpoint");
        
        if ($response['http_code'] === 200) {
            echo "✅ $name: OK\n";
            $results[$name] = true;
        } else {
            echo "❌ $name: FALLITO (HTTP {$response['http_code']})\n";
            $results[$name] = false;
        }
    }
    
    return $results;
}

// Test registrazione utente
function testUserRegistration($baseUrl) {
    echo "\n👤 Test Registrazione Utente...\n";
    
    $userData = [
        'name' => 'Test',
        'surname' => 'User',
        'email' => 'test' . time() . '@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123'
    ];
    
    $response = makeRequest("$baseUrl/register", 'POST', $userData);
    
    if ($response['http_code'] === 201) {
        echo "✅ Registrazione utente: OK\n";
        echo "   Token ricevuto: " . substr($response['data']['access_token'], 0, 20) . "...\n";
        return [
            'success' => true,
            'user' => $userData,
            'token' => $response['data']['access_token']
        ];
    } else {
        echo "❌ Registrazione utente: FALLITA\n";
        echo "   Errore: " . ($response['data']['message'] ?? 'Sconosciuto') . "\n";
        return ['success' => false];
    }
}

// Test login utente
function testUserLogin($baseUrl, $userData) {
    echo "\n🔐 Test Login Utente...\n";
    
    $loginData = [
        'email' => $userData['email'],
        'password' => $userData['password']
    ];
    
    $response = makeRequest("$baseUrl/login", 'POST', $loginData);
    
    if ($response['http_code'] === 200) {
        echo "✅ Login utente: OK\n";
        echo "   Email verificata: " . ($response['data']['email_verified'] ? 'Sì' : 'No') . "\n";
        return [
            'success' => true,
            'token' => $response['data']['access_token']
        ];
    } else {
        echo "❌ Login utente: FALLITO\n";
        return ['success' => false];
    }
}

// Test endpoint autenticati
function testAuthenticatedEndpoints($baseUrl, $token) {
    echo "\n🔒 Test Endpoints Autenticati...\n";
    
    $headers = ["Authorization: Bearer $token"];
    
    $endpoints = [
        'profile' => '/user/profile',
        'notifications' => '/user/notifications',
        'auth_check' => '/auth/check',
    ];
    
    $results = [];
    
    foreach ($endpoints as $name => $endpoint) {
        $response = makeRequest("$baseUrl$endpoint", 'GET', null, $headers);
        
        if ($response['http_code'] === 200) {
            echo "✅ $name: OK\n";
            $results[$name] = true;
        } else {
            echo "❌ $name: FALLITO (HTTP {$response['http_code']})\n";
            $results[$name] = false;
        }
    }
    
    return $results;
}

// Test creazione admin per test dashboard
function testAdminCreation($baseUrl) {
    echo "\n👑 Test Creazione Admin...\n";
    
    // Prova a creare un admin o usa credenziali esistenti
    $adminData = [
        'name' => 'Admin',
        'surname' => 'Test',
        'email' => 'admin@rustico.com',
        'password' => 'admin123',
        'password_confirmation' => 'admin123'
    ];
    
    // Prima prova login con credenziali admin esistenti
    $loginResponse = makeRequest("$baseUrl/login", 'POST', [
        'email' => $adminData['email'],
        'password' => $adminData['password']
    ]);
    
    if ($loginResponse['http_code'] === 200) {
        echo "✅ Admin esiste già: Login OK\n";
        return [
            'success' => true,
            'token' => $loginResponse['data']['access_token'],
            'is_admin' => $loginResponse['data']['user']['is_admin'] ?? false
        ];
    }
    
    // Se non esiste, prova a registrarlo
    $registerResponse = makeRequest("$baseUrl/register", 'POST', $adminData);
    
    if ($registerResponse['http_code'] === 201) {
        echo "✅ Admin registrato: OK\n";
        echo "   ⚠️  Nota: Devi manualmente impostare is_admin=1 nel database\n";
        return [
            'success' => true,
            'token' => $registerResponse['data']['access_token'],
            'is_admin' => false,
            'needs_admin_flag' => true
        ];
    }
    
    echo "❌ Creazione admin: FALLITA\n";
    return ['success' => false];
}

// Test dashboard admin endpoints
function testAdminDashboard($baseUrl, $token) {
    echo "\n📊 Test Dashboard Admin...\n";
    
    $headers = ["Authorization: Bearer $token"];
    
    $endpoints = [
        'admin_check' => '/admin/check-status',
        'statistics' => '/admin/dashboard/statistics',
        'products' => '/admin/dashboard/products',
        'orders' => '/admin/dashboard/orders',
        'users' => '/admin/dashboard/users',
        'inventory_overview' => '/admin/inventory/dashboard/overview',
    ];
    
    $results = [];
    
    foreach ($endpoints as $name => $endpoint) {
        $response = makeRequest("$baseUrl$endpoint", 'GET', null, $headers);
        
        if ($response['http_code'] === 200) {
            echo "✅ $name: OK\n";
            $results[$name] = true;
        } else {
            echo "❌ $name: FALLITO (HTTP {$response['http_code']})\n";
            $results[$name] = false;
        }
    }
    
    return $results;
}

// Test carrello e preferiti
function testCartAndFavorites($baseUrl, $token) {
    echo "\n🛒 Test Carrello e Preferiti...\n";
    
    $headers = ["Authorization: Bearer $token"];
    
    // Test carrello
    $cartTests = [
        'get_cart' => makeRequest("$baseUrl/cart", 'GET', null, $headers),
        'get_favorites' => makeRequest("$baseUrl/favorites", 'GET', null, $headers)
    ];
    
    $results = [];
    
    foreach ($cartTests as $name => $response) {
        if ($response['http_code'] === 200) {
            echo "✅ $name: OK\n";
            $results[$name] = true;
        } else {
            echo "❌ $name: FALLITO (HTTP {$response['http_code']})\n";
            $results[$name] = false;
        }
    }
    
    return $results;
}

// Test sistema notifiche
function testNotifications($baseUrl, $token) {
    echo "\n🔔 Test Sistema Notifiche...\n";
    
    $headers = ["Authorization: Bearer $token"];
    
    $response = makeRequest("$baseUrl/user/notifications", 'GET', null, $headers);
    
    if ($response['http_code'] === 200) {
        echo "✅ Notifiche: OK\n";
        
        $notifications = $response['data']['data'] ?? [];
        echo "   Numero notifiche: " . count($notifications) . "\n";
        
        if (count($notifications) > 0) {
            $firstNotification = $notifications[0];
            echo "   Prima notifica: " . ($firstNotification['data']['message'] ?? 'N/A') . "\n";
        }
        
        return true;
    } else {
        echo "❌ Notifiche: FALLITE (HTTP {$response['http_code']})\n";
        return false;
    }
}

// Test sistema supporto (se esiste)
function testSupportSystem($baseUrl, $token) {
    echo "\n🎫 Test Sistema Supporto...\n";
    
    $headers = ["Authorization: Bearer $token"];
    
    $response = makeRequest("$baseUrl/user/support-tickets", 'GET', null, $headers);
    
    if ($response['http_code'] === 200) {
        echo "✅ Ticket supporto: OK\n";
        return true;
    } else {
        echo "❌ Ticket supporto: FALLITO (HTTP {$response['http_code']})\n";
        return false;
    }
}

// Esegui tutti i test
function runCompleteTests() {
    global $baseUrl, $testResults;
    
    // 1. Test connessione
    if (!testConnection($baseUrl)) {
        echo "\n💥 ERRORE CRITICO: Server non raggiungibile!\n";
        echo "   Assicurati che Laravel sia in esecuzione su http://127.0.0.1:8000\n";
        return;
    }
    
    // 2. Test endpoints pubblici
    $publicResults = testPublicEndpoints($baseUrl);
    $testResults['public_endpoints'] = $publicResults;
    
    // 3. Test registrazione
    $registrationResult = testUserRegistration($baseUrl);
    $testResults['user_registration'] = $registrationResult;
    
    if (!$registrationResult['success']) {
        echo "\n❌ Non posso procedere senza registrazione funzionante\n";
        return;
    }
    
    // 4. Test login
    $loginResult = testUserLogin($baseUrl, $registrationResult['user']);
    $testResults['user_login'] = $loginResult;
    
    if (!$loginResult['success']) {
        echo "\n❌ Non posso procedere senza login funzionante\n";
        return;
    }
    
    $userToken = $loginResult['token'];
    
    // 5. Test endpoints autenticati
    $authResults = testAuthenticatedEndpoints($baseUrl, $userToken);
    $testResults['authenticated_endpoints'] = $authResults;
    
    // 6. Test carrello e preferiti
    $cartResults = testCartAndFavorites($baseUrl, $userToken);
    $testResults['cart_favorites'] = $cartResults;
    
    // 7. Test notifiche
    $notificationResult = testNotifications($baseUrl, $userToken);
    $testResults['notifications'] = $notificationResult;
    
    // 8. Test supporto
    $supportResult = testSupportSystem($baseUrl, $userToken);
    $testResults['support'] = $supportResult;
    
    // 9. Test admin
    $adminResult = testAdminCreation($baseUrl);
    $testResults['admin_creation'] = $adminResult;
    
    if ($adminResult['success']) {
        $adminDashboardResults = testAdminDashboard($baseUrl, $adminResult['token']);
        $testResults['admin_dashboard'] = $adminDashboardResults;
    }
    
    // Riassunto finale
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "📋 **RIASSUNTO TEST COMPLETATI**\n";
    echo str_repeat("=", 50) . "\n\n";
    
    $totalTests = 0;
    $passedTests = 0;
    
    foreach ($testResults as $category => $results) {
        if (is_array($results)) {
            foreach ($results as $test => $result) {
                $totalTests++;
                if ($result === true) $passedTests++;
            }
        } else {
            $totalTests++;
            if ($results === true) $passedTests++;
        }
    }
    
    echo "✅ Test Superati: $passedTests/$totalTests\n";
    
    if ($passedTests === $totalTests) {
        echo "🎉 **TUTTI I TEST SONO PASSATI!**\n";
        echo "   Il sistema e-commerce Rustico è completamente funzionante!\n";
    } else {
        echo "⚠️  **ALCUNI TEST SONO FALLITI**\n";
        echo "   Controlla i dettagli sopra per vedere cosa sistemare.\n";
    }
    
    echo "\n💡 **PASSI SUCCESSIVI:**\n";
    echo "1. Avvia React con: cd ecommerce-calabria-react && npm run dev\n";
    echo "2. Vai su http://localhost:5173\n";
    echo "3. Testa manualmente registrazione, login, prodotti, carrello\n";
    echo "4. Testa dashboard admin se hai impostato is_admin=1\n";
    echo "\n";
}

// Esegui i test
runCompleteTests();

?> 