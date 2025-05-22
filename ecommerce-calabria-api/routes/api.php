<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UserDashboardController;
use App\Http\Controllers\API\CheckoutController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\AdminDashboardController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;


// Rotta di test per verificare il collegamento
Route::get('/ping', function () {
    return response()->json([
        'message' => 'Connessione al backend riuscita!',
        'status' => 'success',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Rotta alternativa senza slash iniziale
Route::get('ping', function () {
    return response()->json([
        'message' => 'Connessione al backend riuscita!',
        'status' => 'success',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Rotte temporanee per test (da rimuovere in produzione)
Route::get('/test/admin/dashboard/statistics', [AdminDashboardController::class, 'getStatistics']);
Route::get('/test/admin/dashboard/users', [AdminDashboardController::class, 'getUsers']);
Route::get('/test/admin/dashboard/orders', [AdminDashboardController::class, 'getOrders']);
Route::get('/test/admin/dashboard/products', [AdminDashboardController::class, 'getProducts']);
Route::get('/test/admin/dashboard/categories', [AdminDashboardController::class, 'getCategories']);
Route::get('/test/admin/dashboard/discount-codes', [AdminDashboardController::class, 'getDiscountCodes']);
Route::get('/test/admin/dashboard/support-tickets', [AdminDashboardController::class, 'getSupportTickets']);
Route::get('/test/admin/dashboard/orders/{id}', [AdminDashboardController::class, 'getOrderDetails']);
Route::get('/test/admin/dashboard/users/{id}', [AdminDashboardController::class, 'getUserDetails']);
Route::get('/test/admin/dashboard/support-tickets/{id}', [AdminDashboardController::class, 'getSupportTicketDetails']);

Route::get('/test/user/dashboard/{userId}', function ($userId) {
    $user = \App\Models\User::find($userId);
    if (!$user) {
        return response()->json(['error' => 'Utente non trovato'], 404);
    }

    return response()->json([
        'user' => $user,
        'orders' => $user->orders()->with('orderItems.product')->get(),
        'tickets' => $user->supportTickets()->with('messages')->get(),
        'notifications' => $user->notifications
    ]);
});

// Rotte pubbliche per i prodotti
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/suggestions', [ProductController::class, 'suggestions']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Rotte pubbliche per le categorie
Route::get('/categories', [App\Http\Controllers\API\CategoryController::class, 'index']);
Route::get('/categories/{slug}', [App\Http\Controllers\API\CategoryController::class, 'show']);

// Rotte autenticazione
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Controllo stato autenticazione
Route::middleware('auth:sanctum')->get('/auth/check', [AuthController::class, 'checkAuthStatus']);

// Rotte protette da autenticazione
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rotta per richiedere una nuova email di verifica
    Route::post('/email/verification-notification', function (Request $request) {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email già verificata.'], 200);
        }
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Email di verifica inviata.']);
    })->middleware('throttle:6,1');

    // Rotte per la dashboard utente
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserDashboardController::class, 'getProfile']);
        Route::post('/profile', [UserDashboardController::class, 'updateProfile']);
        Route::post('/password', [UserDashboardController::class, 'updatePassword']);

        // Rotte per gli ordini
        Route::get('/orders', [UserDashboardController::class, 'getOrders']);
        Route::get('/orders/{id}', [UserDashboardController::class, 'getOrder']);

        // Rotte per i preferiti
        Route::get('/favorites', [UserDashboardController::class, 'getFavorites']);
        Route::delete('/favorites/{id}', [UserDashboardController::class, 'removeFavorite']);

        // Rotte per il supporto
        Route::get('/support-tickets', [UserDashboardController::class, 'getSupportTickets']);
        Route::post('/support-tickets', [UserDashboardController::class, 'createSupportTicket']);
        Route::post('/support-tickets/{id}/messages', [UserDashboardController::class, 'addMessageToTicket']);

        // Rotte per le notifiche
        Route::get('/notifications', [App\Http\Controllers\API\NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [App\Http\Controllers\API\NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [App\Http\Controllers\API\NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [App\Http\Controllers\API\NotificationController::class, 'destroy']);
        Route::delete('/notifications/old', [App\Http\Controllers\API\NotificationController::class, 'deleteOldNotifications']);
    });
});

// Rotta per verifica email (link ricevuto via email)
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return response()->json(['message' => 'Email verificata con successo!']);
})->middleware(['auth:sanctum', 'signed'])->name('verification.verify');

// Rotta per controllare se l'email è verificata
Route::get('/email/verified', function (Request $request) {
    return response()->json(['verified' => $request->user()->hasVerifiedEmail()]);
})->middleware(['auth:sanctum']);

// Rotte per il carrello e checkout
Route::middleware('auth:sanctum')->group(function () {
    // Checkout
    Route::post('/checkout', [CheckoutController::class, 'process']);
    Route::post('/checkout/payment', [CheckoutController::class, 'processPayment']);
    Route::post('/checkout/verify-discount', [CheckoutController::class, 'verifyDiscountCode']);
});

// Rotta per controllare se l'utente è admin
Route::middleware('auth:sanctum')->get('/admin/check-status', function (Request $request) {
    return response()->json([
        'isAdmin' => $request->user()->is_admin
    ]);
});

// Rotte per l'area amministrativa, senza il middleware isAdmin
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Rotte per la dashboard admin
    Route::get('/dashboard/statistics', [AdminDashboardController::class, 'getStatistics']);

    // Rotte per la gestione utenti
    Route::get('/dashboard/users', [AdminDashboardController::class, 'getUsers']);
    Route::get('/dashboard/users/{id}', [AdminDashboardController::class, 'getUserDetails']);

    // Rotte per la gestione ordini
    Route::get('/dashboard/orders', [AdminDashboardController::class, 'getOrders']);
    Route::get('/dashboard/orders/{id}', [AdminDashboardController::class, 'getOrderDetails']);
    Route::put('/dashboard/orders/{id}/status', [AdminDashboardController::class, 'updateOrderStatus']);

    // Rotte per la gestione prodotti
    Route::get('/dashboard/products', [AdminDashboardController::class, 'getProducts']);

    // Rotte per la gestione categorie
    Route::get('/dashboard/categories', [AdminDashboardController::class, 'getCategories']);

    // Rotte per la gestione codici sconto
    Route::get('/dashboard/discount-codes', [AdminDashboardController::class, 'getDiscountCodes']);

    // Rotte per la gestione ticket supporto
    Route::get('/dashboard/support-tickets', [AdminDashboardController::class, 'getSupportTickets']);
    Route::get('/dashboard/support-tickets/{id}', [AdminDashboardController::class, 'getSupportTicketDetails']);
    Route::put('/dashboard/support-tickets/{id}/status', [AdminDashboardController::class, 'updateSupportTicketStatus']);
    Route::post('/dashboard/support-tickets/{id}/messages', [AdminDashboardController::class, 'addMessageToTicket']);

    // Rotte per i prodotti
    Route::apiResource('products', 'App\Http\Controllers\Admin\ProductController');

    // Rotte specifiche per la gestione magazzino
    Route::put('products/{id}/stock', [App\Http\Controllers\Admin\ProductController::class, 'updateStock']);
    Route::post('products/bulk-update-stock', [App\Http\Controllers\Admin\ProductController::class, 'bulkUpdateStock']);

    // Rotte per le categorie
    Route::apiResource('categories', 'App\Http\Controllers\Admin\CategoryController');

    // Rotte per gli ordini
    Route::get('orders', [App\Http\Controllers\Admin\OrderController::class, 'index']);
    Route::get('orders/{id}', [App\Http\Controllers\Admin\OrderController::class, 'show']);
    Route::put('orders/{id}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus']);
    Route::post('orders/{id}/notes', [App\Http\Controllers\Admin\OrderController::class, 'addNote']);
    Route::get('orders/statistics', [App\Http\Controllers\Admin\OrderController::class, 'statistics']);

    // Rotte per i codici sconto
    Route::apiResource('discounts', 'App\Http\Controllers\Admin\DiscountController');
    Route::put('discounts/{id}/toggle', [App\Http\Controllers\Admin\DiscountController::class, 'toggleActive']);

    // Rotte per verificare lo stato admin
    Route::get('/check-status', [App\Http\Controllers\Admin\StatisticsController::class, 'checkStatus']);

    // Rotte statistiche
    Route::get('/statistics', [App\Http\Controllers\Admin\StatisticsController::class, 'index']);
    Route::get('/statistics/products', [App\Http\Controllers\Admin\StatisticsController::class, 'topProducts']);
});

// Rotta di debug per verificare i modelli e le relazioni
Route::get('/debug/models', function () {
    try {
        // Test sulla relazione tickets-messages
        $ticket = \App\Models\SupportTicket::with('messages')->first();

        return response()->json([
            'success' => true,
            'message' => 'Modelli e relazioni funzionano correttamente',
            'ticket' => $ticket ? $ticket->toArray() : 'Nessun ticket trovato'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Errore nel test dei modelli',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});
