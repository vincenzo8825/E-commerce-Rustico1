<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Test route
Route::get('/test', function () {
    return 'Laravel server is working!';
});

// API test route in web routes
Route::get('/api-test', function () {
    return response()->json([
        'message' => 'Connessione al backend riuscita tramite web routes!',
        'status' => 'success',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Rotte per i prodotti (duplicato da api.php per garantire l'accesso)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/suggestions', [ProductController::class, 'suggestions']);
Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Rotte per le categorie (duplicato da api.php per garantire l'accesso)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Rotte per autenticazione
Route::post('/register', [App\Http\Controllers\API\AuthController::class, 'register']);
Route::post('/login', [App\Http\Controllers\API\AuthController::class, 'login']);
