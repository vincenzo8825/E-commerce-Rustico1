<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CouponController extends Controller
{
    /**
     * Valida e applica un coupon al carrello
     */
    public function validateCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'cart_total' => 'required|numeric|min:0',
            'products' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $code = strtoupper(trim($request->code));
        $cartTotal = $request->cart_total;
        $products = $request->products ?? [];

        try {
            $result = $this->validateCouponCode($code, $cartTotal, $products);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Errore durante la validazione del coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Applica un coupon al checkout
     */
    public function applyCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'order_id' => 'required|exists:orders,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $code = strtoupper(trim($request->code));
        $orderId = $request->order_id;

        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            // Verifica che l'ordine appartenga all'utente autenticato
            if ($order->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ordine non trovato'
                ], 404);
            }

            // Valida il coupon
            $validation = $this->validateCouponCode($code, $order->subtotal, $order->orderItems->toArray());

            if (!$validation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $validation['message']
                ], 400);
            }

            $coupon = Coupon::where('code', $code)->first();

            // Applica il coupon all'ordine
            $order->coupon_id = $coupon->id;
            $order->coupon_code = $code;
            $order->discount_amount = $validation['discount_amount'];
            $order->total = $order->subtotal + $order->shipping_cost + $order->tax_amount - $validation['discount_amount'];
            $order->save();

            // Registra l'utilizzo del coupon
            CouponUsage::create([
                'coupon_id' => $coupon->id,
                'user_id' => Auth::id(),
                'order_id' => $order->id,
                'discount_amount' => $validation['discount_amount'],
                'used_at' => now()
            ]);

            // Aggiorna statistiche coupon
            $coupon->increment('usage_count');
            $coupon->increment('total_discount_given', $validation['discount_amount']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Coupon applicato con successo',
                'discount_amount' => $validation['discount_amount'],
                'new_total' => $order->total,
                'coupon' => [
                    'code' => $coupon->code,
                    'description' => $coupon->description,
                    'type' => $coupon->type
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Errore durante l\'applicazione del coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rimuove un coupon da un ordine
     */
    public function removeCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $order = Order::findOrFail($request->order_id);

            if ($order->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ordine non trovato'
                ], 404);
            }

            if (!$order->coupon_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nessun coupon applicato a questo ordine'
                ], 400);
            }

            // Rimuovi utilizzo coupon
            CouponUsage::where('order_id', $order->id)->delete();

            // Aggiorna statistiche coupon
            $coupon = Coupon::find($order->coupon_id);
            if ($coupon) {
                $coupon->decrement('usage_count');
                $coupon->decrement('total_discount_given', $order->discount_amount);
            }

            // Reset ordine
            $order->coupon_id = null;
            $order->coupon_code = null;
            $order->discount_amount = 0;
            $order->total = $order->subtotal + $order->shipping_cost + $order->tax_amount;
            $order->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Coupon rimosso con successo',
                'new_total' => $order->total
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Errore durante la rimozione del coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni coupons disponibili per l'utente
     */
    public function getAvailableCoupons(Request $request)
    {
        try {
            $user = Auth::user();
            $cartTotal = $request->query('cart_total', 0);

            $coupons = Coupon::where('is_active', true)
                ->where('starts_at', '<=', now())
                ->where('expires_at', '>=', now())
                ->where(function ($query) use ($user) {
                    // Coupons per tutti o per utenti specifici
                    $query->whereNull('user_id')
                          ->orWhere('user_id', $user->id);
                })
                ->where(function ($query) {
                    // Non superare limite utilizzi
                    $query->whereNull('usage_limit')
                          ->orWhereRaw('usage_count < usage_limit');
                })
                ->get();

            $availableCoupons = [];

            foreach ($coupons as $coupon) {
                // Verifica se l'utente può usare questo coupon
                if ($this->canUserUseCoupon($coupon, $user, $cartTotal)) {
                    $availableCoupons[] = [
                        'id' => $coupon->id,
                        'code' => $coupon->code,
                        'description' => $coupon->description,
                        'type' => $coupon->type,
                        'value' => $coupon->value,
                        'minimum_amount' => $coupon->minimum_amount,
                        'maximum_discount' => $coupon->maximum_discount,
                        'expires_at' => $coupon->expires_at->format('Y-m-d H:i:s'),
                        'estimated_discount' => $this->calculateDiscount($coupon, $cartTotal)
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'coupons' => $availableCoupons
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore durante il recupero dei coupons',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logica principale di validazione coupon
     */
    private function validateCouponCode($code, $cartTotal, $products = [])
    {
        // Trova il coupon
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return [
                'valid' => false,
                'message' => 'Codice coupon non valido'
            ];
        }

        // Verifica se è attivo
        if (!$coupon->is_active) {
            return [
                'valid' => false,
                'message' => 'Questo coupon non è più attivo'
            ];
        }

        // Verifica date di validità
        $now = Carbon::now();
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            return [
                'valid' => false,
                'message' => 'Questo coupon non è ancora valido'
            ];
        }

        if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
            return [
                'valid' => false,
                'message' => 'Questo coupon è scaduto'
            ];
        }

        // Verifica limite utilizzi globale
        if ($coupon->usage_limit && $coupon->usage_count >= $coupon->usage_limit) {
            return [
                'valid' => false,
                'message' => 'Questo coupon ha esaurito gli utilizzi disponibili'
            ];
        }

        // Verifica utilizzi per utente
        if ($coupon->user_usage_limit) {
            $userUsageCount = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_id', Auth::id())
                ->count();

            if ($userUsageCount >= $coupon->user_usage_limit) {
                return [
                    'valid' => false,
                    'message' => 'Hai già utilizzato questo coupon il numero massimo di volte'
                ];
            }
        }

        // Verifica importo minimo
        if ($coupon->minimum_amount && $cartTotal < $coupon->minimum_amount) {
            return [
                'valid' => false,
                'message' => "Importo minimo richiesto: €" . number_format($coupon->minimum_amount, 2)
            ];
        }

        // Verifica utente specifico
        if ($coupon->user_id && $coupon->user_id !== Auth::id()) {
            return [
                'valid' => false,
                'message' => 'Questo coupon non è valido per il tuo account'
            ];
        }

        // Verifica prodotti/categorie specifiche
        if (!$this->validateProductRestrictions($coupon, $products)) {
            return [
                'valid' => false,
                'message' => 'Questo coupon non è applicabile ai prodotti nel tuo carrello'
            ];
        }

        // Calcola sconto
        $discountAmount = $this->calculateDiscount($coupon, $cartTotal, $products);

        return [
            'valid' => true,
            'message' => 'Coupon valido',
            'discount_amount' => $discountAmount,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'description' => $coupon->description,
                'type' => $coupon->type,
                'value' => $coupon->value
            ]
        ];
    }

    /**
     * Calcola lo sconto per un coupon
     */
    private function calculateDiscount($coupon, $total, $products = [])
    {
        $discount = 0;

        switch ($coupon->type) {
            case 'percentage':
                $discount = ($total * $coupon->value) / 100;
                break;

            case 'fixed':
                $discount = min($coupon->value, $total);
                break;

            case 'buy_x_get_y':
                $discount = $this->calculateBuyXGetYDiscount($coupon, $products);
                break;
        }

        // Applica sconto massimo se definito
        if ($coupon->maximum_discount && $discount > $coupon->maximum_discount) {
            $discount = $coupon->maximum_discount;
        }

        return round($discount, 2);
    }

    /**
     * Calcola sconto per tipo "compra X prendi Y"
     */
    private function calculateBuyXGetYDiscount($coupon, $products)
    {
        // Implementazione semplificata
        // In realtà dovresti analizzare i prodotti specifici
        return 0;
    }

    /**
     * Valida restrizioni su prodotti/categorie
     */
    private function validateProductRestrictions($coupon, $products)
    {
        // Se non ci sono restrizioni, il coupon è valido
        if (!$coupon->applicable_products && !$coupon->applicable_categories) {
            return true;
        }

        $applicableProducts = $coupon->applicable_products ?
            json_decode($coupon->applicable_products, true) : [];
        $applicableCategories = $coupon->applicable_categories ?
            json_decode($coupon->applicable_categories, true) : [];

        // Se non ci sono prodotti da verificare, considera valido
        if (empty($products)) {
            return true;
        }

        foreach ($products as $product) {
            $productId = $product['product_id'] ?? $product['id'] ?? null;
            $categoryId = $product['category_id'] ?? null;

            // Verifica se il prodotto è nella lista dei prodotti applicabili
            if (!empty($applicableProducts) && in_array($productId, $applicableProducts)) {
                return true;
            }

            // Verifica se la categoria è nella lista delle categorie applicabili
            if (!empty($applicableCategories) && in_array($categoryId, $applicableCategories)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica se un utente può usare un coupon
     */
    private function canUserUseCoupon($coupon, $user, $cartTotal)
    {
        // Verifica importo minimo
        if ($coupon->minimum_amount && $cartTotal < $coupon->minimum_amount) {
            return false;
        }

        // Verifica utilizzi per utente
        if ($coupon->user_usage_limit) {
            $userUsageCount = CouponUsage::where('coupon_id', $coupon->id)
                ->where('user_id', $user->id)
                ->count();

            if ($userUsageCount >= $coupon->user_usage_limit) {
                return false;
            }
        }

        return true;
    }

    /**
     * Ottieni statistiche utilizzo coupons (admin)
     */
    public function getCouponStats(Request $request)
    {
        try {
            $stats = [
                'total_coupons' => Coupon::count(),
                'active_coupons' => Coupon::where('is_active', true)->count(),
                'expired_coupons' => Coupon::where('expires_at', '<', now())->count(),
                'total_usage' => CouponUsage::count(),
                'total_discount_given' => CouponUsage::sum('discount_amount'),
                'top_coupons' => Coupon::withCount('usages')
                    ->orderBy('usages_count', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore durante il recupero delle statistiche',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
