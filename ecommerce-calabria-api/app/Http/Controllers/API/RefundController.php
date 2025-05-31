<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Refund;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use App\Notifications\RefundRequestCreated;
use App\Notifications\RefundProcessed;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RefundController extends Controller
{
    private $paypalBaseUrl;
    private $paypalClientId;
    private $paypalClientSecret;

    public function __construct()
    {
        $this->paypalClientId = config('services.paypal.client_id');
        $this->paypalClientSecret = config('services.paypal.client_secret');
        $this->paypalBaseUrl = config('services.paypal.mode') === 'live'
            ? config('services.paypal.live_url')
            : config('services.paypal.sandbox_url');
    }

    /**
     * Richiedi un rimborso per un ordine
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function requestRefund(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'reason' => 'required|string|max:500',
            'amount' => 'nullable|numeric|min:0.01',
            'items' => 'nullable|array',
            'items.*.product_id' => 'exists:products,id',
            'items.*.quantity' => 'integer|min:1',
            'refund_type' => 'string|in:full,partial,item_specific',
        ]);

        $user = Auth::user();
        $order = Order::with('orderItems.product')->findOrFail($validated['order_id']);

        // Verifica che l'ordine appartenga all'utente
        if ($order->user_id !== $user->id && !$user->is_admin) {
            return response()->json([
                'message' => 'Non hai i permessi per richiedere un rimborso per questo ordine'
            ], 403);
        }

        // Verifica che l'ordine sia stato pagato
        if (!$order->is_paid) {
            return response()->json([
                'message' => 'Non è possibile richiedere un rimborso per un ordine non pagato'
            ], 400);
        }

        // Verifica che l'ordine non sia troppo vecchio (configurabile)
        $maxRefundDays = config('app.max_refund_days', 30);
        $orderDate = Carbon::parse($order->created_at);
        $daysSinceOrder = $orderDate->diffInDays(now());

        if ($daysSinceOrder > $maxRefundDays) {
            return response()->json([
                'message' => "Non è possibile richiedere un rimborso per ordini più vecchi di {$maxRefundDays} giorni"
            ], 400);
        }

        // Verifica se esiste già una richiesta di rimborso per questo ordine
        $existingRefund = Refund::where('order_id', $order->id)
                               ->whereIn('status', ['pending', 'approved', 'processing'])
                               ->first();

        if ($existingRefund) {
            return response()->json([
                'message' => 'Esiste già una richiesta di rimborso in corso per questo ordine'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Calcola l'importo del rimborso
            $refundAmount = $this->calculateRefundAmount($order, $validated);

            // Crea la richiesta di rimborso
            $refund = Refund::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'amount' => $refundAmount,
                'reason' => $validated['reason'],
                'status' => 'pending',
                'requested_at' => now(),
                'items' => $validated['items'] ?? null,
                'refund_number' => 'REF-' . strtoupper(Str::random(8)),
                'refund_type' => $validated['refund_type'] ?? 'full',
            ]);

            DB::commit();

            // Notifica gli admin della nuova richiesta
            $this->notifyAdminsOfRefundRequest($refund);

            // Se è un rimborso automatico (per motivi specifici), processalo immediatamente
            if ($this->shouldAutoProcess($refund)) {
                $this->autoProcessRefund($refund);
            }

            Log::info('Richiesta rimborso creata', [
                'refund_id' => $refund->id,
                'order_id' => $order->id,
                'amount' => $refundAmount,
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Richiesta di rimborso inviata con successo',
                'refund' => [
                    'id' => $refund->id,
                    'refund_number' => $refund->refund_number,
                    'amount' => $refund->amount,
                    'status' => $refund->status,
                    'requested_at' => $refund->requested_at
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Errore creazione richiesta rimborso: ' . $e->getMessage(), [
                'order_id' => $validated['order_id'],
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Errore nella creazione della richiesta di rimborso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Processa un rimborso (solo admin)
     *
     * @param Request $request
     * @param int $refundId
     * @return \Illuminate\Http\JsonResponse
     */
    public function processRefund(Request $request, $refundId)
    {
        $user = Auth::user();

        // Solo gli admin possono processare rimborsi
        if (!$user->is_admin) {
            return response()->json([
                'message' => 'Solo gli amministratori possono processare i rimborsi'
            ], 403);
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string|max:1000',
            'partial_amount' => 'nullable|numeric|min:0.01'
        ]);

        $refund = Refund::with('order', 'user')->findOrFail($refundId);

        if ($refund->status !== 'pending') {
            return response()->json([
                'message' => 'Questa richiesta di rimborso è già stata processata'
            ], 400);
        }

        try {
            DB::beginTransaction();

            if ($validated['action'] === 'approve') {
                // Approva il rimborso
                $refundAmount = $validated['partial_amount'] ?? $refund->amount;

                // Aggiorna stato a "processing"
                $refund->update(['status' => 'processing']);

                $success = $this->executeRefund($refund->order, $refundAmount);

                if ($success) {
                    $refund->update([
                        'status' => 'approved',
                        'processed_at' => now(),
                        'processed_by' => $user->id,
                        'admin_notes' => $validated['admin_notes'],
                        'final_amount' => $refundAmount,
                    ]);

                    // Aggiorna lo stato dell'ordine
                    if ($refundAmount >= $refund->order->total) {
                        $refund->order->update(['status' => 'refunded']);
                    } else {
                        $refund->order->update(['status' => 'partially_refunded']);
                    }

                    // Ripristina stock se necessario
                    $this->restoreStock($refund);

                    $message = 'Rimborso approvato ed eseguito con successo';
                } else {
                    $refund->update([
                        'status' => 'failed',
                        'processed_at' => now(),
                        'processed_by' => $user->id,
                        'admin_notes' => $validated['admin_notes'] . ' - Errore nell\'esecuzione del rimborso',
                    ]);

                    $message = 'Rimborso approvato ma fallito nell\'esecuzione';
                }

            } else {
                // Rifiuta il rimborso
                $refund->update([
                    'status' => 'rejected',
                    'processed_at' => now(),
                    'processed_by' => $user->id,
                    'admin_notes' => $validated['admin_notes'],
                ]);

                $message = 'Richiesta di rimborso rifiutata';
            }

            DB::commit();

            // Notifica l'utente del risultato
            $this->notifyUserOfRefundResult($refund);

            Log::info('Rimborso processato', [
                'refund_id' => $refund->id,
                'action' => $validated['action'],
                'final_status' => $refund->status,
                'processed_by' => $user->id
            ]);

            return response()->json([
                'message' => $message,
                'refund' => $refund->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Errore processamento rimborso: ' . $e->getMessage(), [
                'refund_id' => $refundId,
                'action' => $validated['action'] ?? null
            ]);

            return response()->json([
                'message' => 'Errore nel processamento del rimborso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Esegue il rimborso automatico
     */
    public function autoProcessRefund(Refund $refund)
    {
        try {
            DB::beginTransaction();

            $refund->update(['status' => 'processing']);

            $success = $this->executeRefund($refund->order, $refund->amount);

            if ($success) {
                $refund->update([
                    'status' => 'approved',
                    'processed_at' => now(),
                    'admin_notes' => 'Rimborso automatico approvato dal sistema',
                    'final_amount' => $refund->amount,
                ]);

                // Aggiorna stato ordine
                if ($refund->amount >= $refund->order->total) {
                    $refund->order->update(['status' => 'refunded']);
                } else {
                    $refund->order->update(['status' => 'partially_refunded']);
                }

                // Ripristina stock
                $this->restoreStock($refund);

                Log::info('Rimborso automatico eseguito', [
                    'refund_id' => $refund->id,
                    'amount' => $refund->amount
                ]);
            } else {
                $refund->update([
                    'status' => 'failed',
                    'processed_at' => now(),
                    'admin_notes' => 'Errore nel rimborso automatico - richiesta revisione manuale',
                ]);
            }

            DB::commit();

            // Notifica l'utente
            $this->notifyUserOfRefundResult($refund);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Errore rimborso automatico: ' . $e->getMessage(), [
                'refund_id' => $refund->id
            ]);
        }
    }

    /**
     * Esegue il rimborso tramite il gateway di pagamento
     *
     * @param Order $order
     * @param float $amount
     * @return bool
     */
    private function executeRefund(Order $order, $amount)
    {
        try {
            if ($order->payment_method === 'carta' && $order->payment_id) {
                return $this->executeStripeRefund($order->payment_id, $amount);
            } elseif ($order->payment_method === 'paypal' && $order->payment_id) {
                return $this->executePayPalRefund($order->payment_id, $amount);
            } else {
                // Per altri metodi di pagamento, marca come manuale
                Log::info("Rimborso manuale richiesto per ordine {$order->order_number}, importo: €{$amount}");
                return true;
            }
        } catch (\Exception $e) {
            Log::error('Errore esecuzione rimborso: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'payment_method' => $order->payment_method,
                'amount' => $amount
            ]);
            return false;
        }
    }

    /**
     * Esegue rimborso via Stripe
     *
     * @param string $paymentIntentId
     * @param float $amount
     * @return bool
     */
    private function executeStripeRefund($paymentIntentId, $amount)
    {
        try {
            $stripeKey = config('services.stripe.secret_key');
            if (!$stripeKey) {
                throw new \Exception('Chiave Stripe non configurata');
            }

            \Stripe\Stripe::setApiKey($stripeKey);

            $refund = \Stripe\Refund::create([
                'payment_intent' => $paymentIntentId,
                'amount' => intval($amount * 100), // Converti in centesimi
                'reason' => 'requested_by_customer',
                'metadata' => [
                    'refunded_at' => now()->toISOString(),
                    'platform' => 'rustico_calabria',
                    'refund_source' => 'admin_panel'
                ]
            ]);

            Log::info("Rimborso Stripe eseguito", [
                'stripe_refund_id' => $refund->id,
                'payment_intent_id' => $paymentIntentId,
                'amount' => $amount,
                'status' => $refund->status
            ]);

            return true;

        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Errore rimborso Stripe: ' . $e->getMessage(), [
                'payment_intent_id' => $paymentIntentId,
                'amount' => $amount,
                'stripe_error_code' => $e->getStripeCode()
            ]);
            return false;
        }
    }

    /**
     * Esegue rimborso via PayPal usando API v2
     *
     * @param string $paypalOrderId
     * @param float $amount
     * @return bool
     */
    private function executePayPalRefund($paypalOrderId, $amount)
    {
        try {
            // Ottieni token di accesso PayPal
            $accessToken = $this->getPayPalAccessToken();

            // Prima trova l'ID della cattura dal PayPal Order
            $captureId = $this->getPayPalCaptureId($paypalOrderId, $accessToken);

            if (!$captureId) {
                throw new \Exception('Capture ID non trovato per l\'ordine PayPal');
            }

            // Esegui il rimborso
            $refundData = [
                'amount' => [
                    'value' => number_format($amount, 2, '.', ''),
                    'currency_code' => 'EUR'
                ],
                'note_to_payer' => 'Rimborso richiesto da Rustico Calabria'
            ];

            $response = Http::withToken($accessToken)
                ->post($this->paypalBaseUrl . "/v2/payments/captures/{$captureId}/refund", $refundData);

            if (!$response->successful()) {
                throw new \Exception('Errore API PayPal: ' . $response->body());
            }

            $refundResult = $response->json();

            Log::info("Rimborso PayPal eseguito", [
                'paypal_refund_id' => $refundResult['id'] ?? 'N/A',
                'paypal_order_id' => $paypalOrderId,
                'capture_id' => $captureId,
                'amount' => $amount,
                'status' => $refundResult['status'] ?? 'N/A'
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Errore rimborso PayPal: ' . $e->getMessage(), [
                'paypal_order_id' => $paypalOrderId,
                'amount' => $amount
            ]);
            return false;
        }
    }

    /**
     * Ottieni token di accesso PayPal
     */
    private function getPayPalAccessToken()
    {
        $response = Http::withBasicAuth($this->paypalClientId, $this->paypalClientSecret)
            ->asForm()
            ->post($this->paypalBaseUrl . '/v1/oauth2/token', [
                'grant_type' => 'client_credentials'
            ]);

        if ($response->successful()) {
            return $response->json()['access_token'];
        }

        throw new \Exception('Errore ottenimento token PayPal: ' . $response->body());
    }

    /**
     * Ottieni Capture ID da PayPal Order
     */
    private function getPayPalCaptureId($paypalOrderId, $accessToken)
    {
        $response = Http::withToken($accessToken)
            ->get($this->paypalBaseUrl . "/v2/checkout/orders/{$paypalOrderId}");

        if (!$response->successful()) {
            throw new \Exception('Errore recupero ordine PayPal: ' . $response->body());
        }

        $orderData = $response->json();

        // Cerca il capture ID nella struttura dell'ordine
        foreach ($orderData['purchase_units'] ?? [] as $unit) {
            foreach ($unit['payments']['captures'] ?? [] as $capture) {
                if ($capture['status'] === 'COMPLETED') {
                    return $capture['id'];
                }
            }
        }

        return null;
    }

    /**
     * Calcola l'importo del rimborso
     */
    private function calculateRefundAmount(Order $order, array $validated)
    {
        if (isset($validated['amount'])) {
            // Importo specifico richiesto
            return min($validated['amount'], $order->total);
        }

        if (isset($validated['items']) && $validated['refund_type'] === 'item_specific') {
            // Rimborso per prodotti specifici
            $refundAmount = 0;
            foreach ($validated['items'] as $item) {
                $orderItem = $order->orderItems()
                    ->where('product_id', $item['product_id'])
                    ->first();

                if ($orderItem) {
                    $quantity = min($item['quantity'], $orderItem->quantity);
                    $refundAmount += $quantity * $orderItem->price;
                }
            }
            return $refundAmount;
        }

        // Rimborso completo
        return $order->total;
    }

    /**
     * Determina se il rimborso dovrebbe essere processato automaticamente
     */
    private function shouldAutoProcess(Refund $refund)
    {
        $autoReasons = [
            'prodotto difettoso',
            'errore nell\'ordine',
            'prodotto danneggiato',
            'prodotto non conforme',
            'defective product',
            'damaged product'
        ];

        $reason = strtolower($refund->reason);

        foreach ($autoReasons as $autoReason) {
            if (strpos($reason, $autoReason) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Ripristina lo stock dei prodotti per il rimborso
     */
    private function restoreStock(Refund $refund)
    {
        try {
            if ($refund->items) {
                // Rimborso per prodotti specifici
                foreach ($refund->items as $item) {
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        $product->increment('stock', $item['quantity']);
                        Log::info("Stock ripristinato", [
                            'product_id' => $product->id,
                            'quantity' => $item['quantity'],
                            'new_stock' => $product->fresh()->stock
                        ]);
                    }
                }
            } else {
                // Rimborso completo - ripristina tutto
                foreach ($refund->order->orderItems as $orderItem) {
                    $product = Product::find($orderItem->product_id);
                    if ($product) {
                        $product->increment('stock', $orderItem->quantity);
                        Log::info("Stock ripristinato (rimborso completo)", [
                            'product_id' => $product->id,
                            'quantity' => $orderItem->quantity,
                            'new_stock' => $product->fresh()->stock
                        ]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Errore ripristino stock: ' . $e->getMessage(), [
                'refund_id' => $refund->id
            ]);
        }
    }

    /**
     * Notifica gli admin della nuova richiesta di rimborso
     */
    private function notifyAdminsOfRefundRequest(Refund $refund)
    {
        try {
            $admins = \App\Models\User::where('is_admin', true)->get();

            foreach ($admins as $admin) {
                $admin->notify(new RefundRequestCreated($refund));
            }

            Log::info('Notifiche admin inviate per richiesta rimborso', [
                'refund_id' => $refund->id,
                'admin_count' => $admins->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Errore invio notifiche admin: ' . $e->getMessage());
        }
    }

    /**
     * Notifica l'utente del risultato del rimborso
     */
    private function notifyUserOfRefundResult(Refund $refund)
    {
        try {
            $refund->user->notify(new RefundProcessed($refund));

            Log::info('Notifica utente inviata per rimborso processato', [
                'refund_id' => $refund->id,
                'user_id' => $refund->user_id,
                'status' => $refund->status
            ]);
        } catch (\Exception $e) {
            Log::error('Errore invio notifica utente: ' . $e->getMessage());
        }
    }

    /**
     * Ottieni le richieste di rimborso dell'utente
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserRefunds(Request $request)
    {
        $user = Auth::user();

        $refunds = Refund::where('user_id', $user->id)
                        ->with(['order:id,order_number,total'])
                        ->orderBy('created_at', 'desc')
                        ->paginate(10);

        return response()->json([
            'refunds' => $refunds
        ]);
    }

    /**
     * Ottieni tutte le richieste di rimborso (solo admin)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllRefunds(Request $request)
    {
        $user = Auth::user();

        if (!$user->is_admin) {
            return response()->json([
                'message' => 'Solo gli amministratori possono visualizzare tutte le richieste di rimborso'
            ], 403);
        }

        $status = $request->get('status');
        $search = $request->get('search');
        $perPage = $request->get('per_page', 20);

        $query = Refund::with(['order:id,order_number,total', 'user:id,name,surname,email']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('refund_number', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($orderQuery) use ($search) {
                      $orderQuery->where('order_number', 'like', "%{$search}%");
                  })
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('surname', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $refunds = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'refunds' => $refunds
        ]);
    }

    /**
     * Ottieni statistiche rimborsi (solo admin)
     */
    public function getRefundStats(Request $request)
    {
        $user = Auth::user();

        if (!$user->is_admin) {
            return response()->json([
                'message' => 'Solo gli amministratori possono visualizzare le statistiche'
            ], 403);
        }

        try {
            $stats = [
                'total_refunds' => Refund::count(),
                'pending_refunds' => Refund::where('status', 'pending')->count(),
                'approved_refunds' => Refund::where('status', 'approved')->count(),
                'rejected_refunds' => Refund::where('status', 'rejected')->count(),
                'failed_refunds' => Refund::where('status', 'failed')->count(),
                'total_refunded_amount' => Refund::where('status', 'approved')->sum('final_amount'),
                'avg_refund_amount' => Refund::where('status', 'approved')->avg('final_amount'),
                'refunds_this_month' => Refund::whereMonth('created_at', now()->month)
                                             ->whereYear('created_at', now()->year)
                                             ->count(),
                'refunds_this_week' => Refund::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
            ];

            return response()->json([
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Errore caricamento statistiche rimborsi: ' . $e->getMessage());
            return response()->json([
                'message' => 'Errore nel caricamento delle statistiche',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni dettagli rimborso specifico
     */
    public function getRefundDetails(Request $request, $refundId)
    {
        $user = Auth::user();

        $refund = Refund::with([
            'order.orderItems.product',
            'user:id,name,surname,email',
            'processedBy:id,name,surname'
        ])->findOrFail($refundId);

        // Verifica permessi
        if (!$user->is_admin && $refund->user_id !== $user->id) {
            return response()->json([
                'message' => 'Non hai i permessi per visualizzare questo rimborso'
            ], 403);
        }

        return response()->json([
            'refund' => $refund
        ]);
    }
}
