<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PayPalController extends Controller
{
    private $baseUrl;
    private $clientId;
    private $clientSecret;

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id');
        $this->clientSecret = config('services.paypal.client_secret');
        $this->baseUrl = config('services.paypal.mode') === 'live'
            ? config('services.paypal.live_url')
            : config('services.paypal.sandbox_url');
    }

    /**
     * Ottieni token di accesso PayPal
     */
    private function getAccessToken()
    {
        try {
            $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
                ->asForm()
                ->post($this->baseUrl . '/v1/oauth2/token', [
                    'grant_type' => 'client_credentials'
                ]);

            if ($response->successful()) {
                return $response->json()['access_token'];
            }

            throw new \Exception('Errore ottenimento token PayPal: ' . $response->body());

        } catch (\Exception $e) {
            Log::error('PayPal: Errore token', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Crea un ordine PayPal reale con API v2
     */
    public function createOrder(Request $request)
    {
        $user = Auth::user();

        // TODO: Ripristinare verifica email dopo completamento step
        // if (!$user->hasVerifiedEmail()) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'È necessario verificare l\'email prima di procedere con il pagamento PayPal'
        //     ], 403);
        // }

        $validated = $request->validate([
            'total' => 'required|numeric|min:0.50',
            'currency' => 'string|in:EUR,USD',
            'order_data' => 'required|array',
        ]);

        try {
            // Recupera il carrello dell'utente
            $cart = Cart::with('items.product')->where('user_id', $user->id)->first();

            if (!$cart || $cart->items->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Carrello vuoto'
                ], 400);
            }

            // Calcola il totale reale dal carrello
            $calculatedTotal = $cart->items->sum(function ($item) {
                return $item->quantity * $item->price;
            });

            // Verifica che il totale corrisponda (tolleranza di 1 centesimo)
            if (abs($calculatedTotal - $validated['total']) > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => 'Totale non corrispondente'
                ], 400);
            }

            // Ottieni token di accesso
            $accessToken = $this->getAccessToken();

            // Prepara i dati dell'ordine per PayPal API v2
            $orderData = [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'amount' => [
                            'currency_code' => $validated['currency'] ?? 'EUR',
                            'value' => number_format($validated['total'], 2, '.', '')
                        ],
                        'description' => 'Ordine Rustico Calabria - Prodotti tipici calabresi',
                        'custom_id' => $user->id,
                    ]
                ],
                'application_context' => [
                    'return_url' => config('app.url') . '/api/paypal/success',
                    'cancel_url' => config('app.url') . '/api/paypal/cancel',
                    'brand_name' => 'Rustico Calabria',
                    'locale' => 'it-IT',
                    'landing_page' => 'BILLING',
                    'user_action' => 'PAY_NOW'
                ]
            ];

            // Crea l'ordine su PayPal
            $response = Http::withToken($accessToken)
                ->post($this->baseUrl . '/v2/checkout/orders', $orderData);

            if (!$response->successful()) {
                throw new \Exception('Errore creazione ordine PayPal: ' . $response->body());
            }

            $paypalOrder = $response->json();
            $paypalOrderId = $paypalOrder['id'];

            // Trova l'URL di approvazione
            $approvalUrl = '';
            foreach ($paypalOrder['links'] as $link) {
                if ($link['rel'] === 'approve') {
                    $approvalUrl = $link['href'];
                    break;
                }
            }

            // Salva i dati temporanei
            $temporaryData = [
                'user_id' => $user->id,
                'paypal_order_id' => $paypalOrderId,
                'total' => $validated['total'],
                'currency' => $validated['currency'] ?? 'EUR',
                'cart_items' => $cart->items->toArray(),
                'order_data' => $validated['order_data'],
                'created_at' => now()
            ];

            cache()->put("paypal_order_{$paypalOrderId}", $temporaryData, 3600);

            Log::info('PayPal: Ordine creato', [
                'paypal_order_id' => $paypalOrderId,
                'user_id' => $user->id,
                'total' => $validated['total']
            ]);

            return response()->json([
                'success' => true,
                'order_id' => $paypalOrderId,
                'approval_url' => $approvalUrl,
                'message' => 'Ordine PayPal creato con successo'
            ]);

        } catch (\Exception $e) {
            Log::error('PayPal: Errore creazione ordine', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Errore nella creazione dell\'ordine PayPal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Conferma il pagamento PayPal dopo l'approvazione dell'utente
     */
    public function capturePayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string'
        ]);

        try {
            $paypalOrderId = $validated['order_id'];

            // Recupera i dati temporanei
            $orderData = cache()->get("paypal_order_{$paypalOrderId}");

            if (!$orderData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dati ordine PayPal non trovati o scaduti'
                ], 404);
            }

            // Ottieni token di accesso
            $accessToken = $this->getAccessToken();

            // Cattura il pagamento su PayPal
            $response = Http::withToken($accessToken)
                ->post($this->baseUrl . "/v2/checkout/orders/{$paypalOrderId}/capture");

            if (!$response->successful()) {
                throw new \Exception('Errore cattura pagamento PayPal: ' . $response->body());
            }

            $captureResult = $response->json();

            // Verifica che il pagamento sia stato completato
            if ($captureResult['status'] === 'COMPLETED') {
                // Pagamento approvato, crea l'ordine nel database
                $order = DB::transaction(function () use ($orderData, $paypalOrderId, $captureResult) {
                    // Crea l'ordine
                    $order = Order::create([
                        'user_id' => $orderData['user_id'],
                        'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                        'status' => 'in elaborazione',
                        'total' => $orderData['total'],
                        'shipping_cost' => $orderData['order_data']['shipping_cost'] ?? 7.90,
                        'tax' => $orderData['total'] * 0.22,
                        'discount' => 0,
                        'shipping_name' => $orderData['order_data']['shipping_name'] ?? '',
                        'shipping_surname' => $orderData['order_data']['shipping_surname'] ?? '',
                        'shipping_address' => $orderData['order_data']['shipping_address'] ?? '',
                        'shipping_city' => $orderData['order_data']['shipping_city'] ?? '',
                        'shipping_postal_code' => $orderData['order_data']['shipping_postal_code'] ?? '',
                        'shipping_phone' => $orderData['order_data']['shipping_phone'] ?? '',
                        'payment_method' => 'paypal',
                        'payment_id' => $paypalOrderId,
                        'is_paid' => true,
                        'paid_at' => now(),
                    ]);

                    // Crea gli elementi dell'ordine
                    foreach ($orderData['cart_items'] as $cartItem) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $cartItem['product_id'],
                            'product_name' => $cartItem['product']['name'],
                            'quantity' => $cartItem['quantity'],
                            'price' => $cartItem['price'],
                            'total' => $cartItem['quantity'] * $cartItem['price'],
                        ]);

                        // Aggiorna lo stock
                        $product = Product::find($cartItem['product_id']);
                        if ($product) {
                            $product->decrement('stock', $cartItem['quantity']);
                        }
                    }

                    return $order;
                });

                // Svuota il carrello
                $user = Auth::user();
                $cart = Cart::where('user_id', $user->id)->first();
                if ($cart) {
                    CartItem::where('cart_id', $cart->id)->delete();
                    $cart->update(['total' => 0]);
                }

                // Rimuovi i dati temporanei
                cache()->forget("paypal_order_{$paypalOrderId}");

                Log::info('PayPal: Pagamento completato', [
                    'paypal_order_id' => $paypalOrderId,
                    'order_id' => $order->id,
                    'total' => $order->total
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Pagamento PayPal completato con successo',
                    'order' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'total' => $order->total,
                        'status' => $order->status
                    ]
                ]);

            } else {
                Log::warning('PayPal: Pagamento non completato', [
                    'paypal_order_id' => $paypalOrderId,
                    'status' => $captureResult['status']
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Pagamento PayPal non completato'
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('PayPal: Errore conferma pagamento', [
                'error' => $e->getMessage(),
                'order_id' => $validated['order_id'] ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Errore nella conferma del pagamento PayPal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gestisce l'annullamento del pagamento PayPal
     */
    public function cancelPayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string'
        ]);

        try {
            // Rimuovi i dati temporanei
            cache()->forget("paypal_order_{$validated['order_id']}");

            Log::info('PayPal: Pagamento annullato', [
                'order_id' => $validated['order_id']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pagamento PayPal annullato con successo'
            ]);

        } catch (\Exception $e) {
            Log::error('PayPal: Errore annullamento', [
                'error' => $e->getMessage(),
                'order_id' => $validated['order_id'] ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'annullamento del pagamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Endpoint per gestire il successo PayPal (redirect)
     */
    public function success(Request $request)
    {
        $token = $request->get('token'); // PayPal order ID

        if ($token) {
            // Reindirizza al frontend con i parametri
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            return redirect()->to("{$frontendUrl}/checkout/paypal-success?order_id={$token}");
        }

        return redirect()->to(config('app.frontend_url', 'http://localhost:5173') . '/checkout/error');
    }

    /**
     * Endpoint per gestire l'annullamento PayPal (redirect)
     */
    public function cancel(Request $request)
    {
        $token = $request->get('token');

        if ($token) {
            cache()->forget("paypal_order_{$token}");
        }

        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        return redirect()->to("{$frontendUrl}/checkout/paypal-cancelled");
    }

    /**
     * Verifica stato pagamento PayPal
     */
    public function checkPaymentStatus(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|string'
        ]);

        try {
            $orderId = $validated['order_id'];

            // Controlla se esistono dati temporanei
            $orderData = cache()->get("paypal_order_{$orderId}");

            if ($orderData) {
                return response()->json([
                    'success' => true,
                    'status' => 'pending',
                    'message' => 'Pagamento in attesa di approvazione'
                ]);
            }

            // Controlla se esiste un ordine completato
            $order = Order::where('payment_id', $orderId)
                          ->where('payment_method', 'paypal')
                          ->first();

            if ($order) {
                return response()->json([
                    'success' => true,
                    'status' => 'completed',
                    'message' => 'Pagamento completato',
                    'order' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'status' => 'not_found',
                'message' => 'Pagamento PayPal non trovato'
            ], 404);

        } catch (\Exception $e) {
            Log::error('PayPal: Errore verifica stato', [
                'error' => $e->getMessage(),
                'order_id' => $validated['order_id'] ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Errore nella verifica dello stato del pagamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
