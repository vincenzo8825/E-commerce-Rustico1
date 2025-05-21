<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\DiscountCode;
use App\Notifications\OrderConfirmed;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    /**
     * Processa il checkout e crea un nuovo ordine.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function process(Request $request)
    {
        $user = Auth::user();

        // Verifica che l'utente abbia verificato l'email
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'È necessario verificare l\'email prima di procedere con l\'acquisto'
            ], 403);
        }

        // Verifica che l'utente abbia un carrello
        $cart = Cart::with('items.product')->where('user_id', $user->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Il carrello è vuoto'
            ], 400);
        }

        // Validazione dei dati di spedizione
        $validated = $request->validate([
            'shipping_name' => 'required|string|max:255',
            'shipping_surname' => 'required|string|max:255',
            'shipping_address' => 'required|string|max:255',
            'shipping_city' => 'required|string|max:255',
            'shipping_postal_code' => 'required|string|max:10',
            'shipping_phone' => 'required|string|max:20',
            'payment_method' => 'required|string|in:carta,paypal,bonifico',
            'notes' => 'nullable|string|max:500',
        ]);

        // Calcolo costi
        $subtotal = 0;
        $shippingCost = 7.90; // Costo spedizione fisso
        $discountAmount = 0;

        // Verifica disponibilità prodotti
        foreach ($cart->items as $item) {
            if ($item->product->stock < $item->quantity) {
                return response()->json([
                    'message' => 'Il prodotto "' . $item->product->name . '" non è disponibile nella quantità richiesta'
                ], 400);
            }

            $subtotal += $item->quantity * $item->price;
        }

        // Applica codice sconto se presente
        if ($cart->discount_code) {
            $discountCode = DiscountCode::where('code', $cart->discount_code)->first();

            if ($discountCode && $discountCode->isValid() && $subtotal >= $discountCode->min_order_value) {
                if ($discountCode->type === 'percentage') {
                    $discountAmount = ($subtotal * $discountCode->value) / 100;
                } else {
                    $discountAmount = $discountCode->value;
                }

                // Incrementa il contatore di utilizzi
                $discountCode->used_count += 1;
                $discountCode->save();
            }
        }

        // Calcolo IVA (22%)
        $taxRate = 0.22;
        $taxAmount = ($subtotal - $discountAmount) * $taxRate;

        // Calcolo totale
        $total = $subtotal + $shippingCost + $taxAmount - $discountAmount;

        try {
            // Inizia una transazione per garantire l'integrità dei dati
            return DB::transaction(function () use ($user, $cart, $validated, $subtotal, $shippingCost, $taxAmount, $discountAmount, $total) {
                // Crea l'ordine
                $order = Order::create([
                    'user_id' => $user->id,
                    'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                    'status' => 'in elaborazione',
                    'total' => $total,
                    'shipping_cost' => $shippingCost,
                    'tax' => $taxAmount,
                    'discount' => $discountAmount,
                    'discount_code' => $cart->discount_code,
                    'shipping_name' => $validated['shipping_name'],
                    'shipping_surname' => $validated['shipping_surname'],
                    'shipping_address' => $validated['shipping_address'],
                    'shipping_city' => $validated['shipping_city'],
                    'shipping_postal_code' => $validated['shipping_postal_code'],
                    'shipping_phone' => $validated['shipping_phone'],
                    'notes' => $validated['notes'] ?? null,
                    'payment_method' => $validated['payment_method'],
                    'is_paid' => false,
                ]);

                // Crea gli elementi dell'ordine
                foreach ($cart->items as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'total' => $item->quantity * $item->price,
                    ]);

                    // Aggiorna lo stock del prodotto
                    $product = Product::find($item->product_id);
                    $product->stock -= $item->quantity;
                    $product->save();
                }

                // Svuota il carrello
                CartItem::where('cart_id', $cart->id)->delete();
                $cart->total = 0;
                $cart->discount_code = null;
                $cart->discount_amount = 0;
                $cart->save();

                // Invia notifica di conferma ordine
                $user->notify(new OrderConfirmed($order));

                return response()->json([
                    'message' => 'Ordine creato con successo',
                    'order' => $order,
                    'order_number' => $order->order_number
                ], 201);
            });
        } catch (\Exception $e) {
            // Gestione dell'errore
            return response()->json([
                'message' => 'Si è verificato un errore durante la creazione dell\'ordine',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simula il completamento di un pagamento.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|string|in:carta,paypal,bonifico',
            'card_number' => 'required_if:payment_method,carta|nullable|string',
            'card_holder' => 'required_if:payment_method,carta|nullable|string',
            'card_expiry' => 'required_if:payment_method,carta|nullable|string',
            'card_cvv' => 'required_if:payment_method,carta|nullable|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // Verifica che l'ordine appartenga all'utente autenticato
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Non hai i permessi per completare questo pagamento'
            ], 403);
        }

        // Verifica che l'ordine non sia già stato pagato
        if ($order->is_paid) {
            return response()->json([
                'message' => 'Questo ordine è già stato pagato'
            ], 400);
        }

        // Simulazione pagamento (in un ambiente reale qui ci sarebbe l'integrazione con il gateway di pagamento)
        $paymentSuccessful = true;
        $paymentId = 'PAY-' . strtoupper(Str::random(12));

        if ($paymentSuccessful) {
            $order->is_paid = true;
            $order->paid_at = now();
            $order->payment_id = $paymentId;
            $order->save();

            return response()->json([
                'message' => 'Pagamento completato con successo',
                'payment_id' => $paymentId,
                'order' => $order
            ]);
        } else {
            return response()->json([
                'message' => 'Si è verificato un errore durante il pagamento'
            ], 400);
        }
    }

    /**
     * Verifica la validità di un codice sconto.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function verifyDiscountCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|exists:discount_codes,code',
        ]);

        $user = Auth::user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Carrello non trovato'
            ], 404);
        }

        $code = DiscountCode::where('code', $validated['code'])->first();

        if (!$code->isValid()) {
            return response()->json([
                'message' => 'Codice sconto non valido o scaduto'
            ], 400);
        }

        // Calcola il subtotale del carrello
        $subtotal = CartItem::where('cart_id', $cart->id)
            ->join('products', 'cart_items.product_id', '=', 'products.id')
            ->sum(DB::raw('cart_items.quantity * cart_items.price'));

        if ($code->min_order_value > 0 && $subtotal < $code->min_order_value) {
            return response()->json([
                'message' => 'L\'importo minimo per utilizzare questo codice è €' . number_format($code->min_order_value, 2, ',', '.'),
                'min_order_value' => $code->min_order_value
            ], 400);
        }

        // Calcola l'importo dello sconto
        $discountAmount = 0;
        if ($code->type === 'percentage') {
            $discountAmount = ($subtotal * $code->value) / 100;
        } else {
            $discountAmount = $code->value;
        }

        // Aggiorna il carrello con il codice sconto
        $cart->discount_code = $code->code;
        $cart->discount_amount = $discountAmount;
        $cart->save();

        return response()->json([
            'message' => 'Codice sconto applicato con successo',
            'discount_code' => $code->code,
            'discount_amount' => $discountAmount,
            'cart' => $cart
        ]);
    }
}
