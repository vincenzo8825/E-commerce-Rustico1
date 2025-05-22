<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Aggiunge un prodotto al carrello dell'utente.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function addToCart(Request $request)
    {
        $user = Auth::user();

        // Verifica che l'utente abbia verificato l'email
        if (!$user->email_verified_at && !$user->is_admin) {
            return response()->json([
                'message' => 'È necessario verificare l\'email prima di aggiungere prodotti al carrello'
            ], 403);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        // Trova o crea un carrello per l'utente
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // Trova il prodotto
        $product = Product::findOrFail($validated['product_id']);

        // Verifica disponibilità
        if ($product->stock < $validated['quantity']) {
            return response()->json([
                'message' => 'Prodotto non disponibile nella quantità richiesta'
            ], 400);
        }

        // Cerca se il prodotto è già nel carrello
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        try {
            DB::beginTransaction();

            if ($cartItem) {
                // Aggiorna la quantità se il prodotto è già nel carrello
                $cartItem->quantity += $validated['quantity'];
                $cartItem->save();
            } else {
                // Aggiungi il prodotto al carrello
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $validated['product_id'],
                    'quantity' => $validated['quantity'],
                    'price' => $product->discount_price ?? $product->price,
                ]);
            }

            // Aggiorna il totale del carrello
            $this->updateCartTotal($cart);

            DB::commit();

            return response()->json([
                'message' => 'Prodotto aggiunto al carrello con successo',
                'cart' => $cart->load('items.product')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Si è verificato un errore durante l\'aggiunta del prodotto al carrello',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recupera il carrello dell'utente.
     *
     * @return \Illuminate\Http\Response
     */
    public function getCart()
    {
        $user = Auth::user();
        $cart = Cart::with('items.product')->where('user_id', $user->id)->first();

        if (!$cart) {
            $cart = Cart::create(['user_id' => $user->id]);
        }

        return response()->json([
            'cart' => $cart
        ]);
    }

    /**
     * Aggiorna la quantità di un prodotto nel carrello.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateCartItem(Request $request)
    {
        $validated = $request->validate([
            'cart_item_id' => 'required|exists:cart_items,id',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $user = Auth::user();
        $cartItem = CartItem::with('cart')->findOrFail($validated['cart_item_id']);

        // Verifica che il carrello appartenga all'utente
        if ($cartItem->cart->user_id !== $user->id) {
            return response()->json([
                'message' => 'Non hai i permessi per modificare questo carrello'
            ], 403);
        }

        // Verifica disponibilità
        $product = Product::findOrFail($cartItem->product_id);
        if ($product->stock < $validated['quantity']) {
            return response()->json([
                'message' => 'Prodotto non disponibile nella quantità richiesta'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $cartItem->quantity = $validated['quantity'];
            $cartItem->save();

            // Aggiorna il totale del carrello
            $this->updateCartTotal($cartItem->cart);

            DB::commit();

            return response()->json([
                'message' => 'Carrello aggiornato con successo',
                'cart' => $cartItem->cart->load('items.product')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Si è verificato un errore durante l\'aggiornamento del carrello',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rimuove un prodotto dal carrello.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function removeCartItem($id)
    {
        $user = Auth::user();
        $cartItem = CartItem::with('cart')->findOrFail($id);

        // Verifica che il carrello appartenga all'utente
        if ($cartItem->cart->user_id !== $user->id) {
            return response()->json([
                'message' => 'Non hai i permessi per modificare questo carrello'
            ], 403);
        }

        try {
            DB::beginTransaction();

            $cart = $cartItem->cart;
            $cartItem->delete();

            // Aggiorna il totale del carrello
            $this->updateCartTotal($cart);

            DB::commit();

            return response()->json([
                'message' => 'Prodotto rimosso dal carrello con successo',
                'cart' => $cart->load('items.product')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Si è verificato un errore durante la rimozione del prodotto dal carrello',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Svuota completamente il carrello.
     *
     * @return \Illuminate\Http\Response
     */
    public function clearCart()
    {
        $user = Auth::user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'message' => 'Il carrello è già vuoto'
            ]);
        }

        try {
            DB::beginTransaction();

            // Elimina tutti gli elementi del carrello
            CartItem::where('cart_id', $cart->id)->delete();

            // Aggiorna il totale del carrello
            $cart->total = 0;
            $cart->discount_code = null;
            $cart->discount_amount = 0;
            $cart->save();

            DB::commit();

            return response()->json([
                'message' => 'Carrello svuotato con successo',
                'cart' => $cart
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Si è verificato un errore durante lo svuotamento del carrello',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna il totale del carrello in base agli elementi.
     *
     * @param  \App\Models\Cart  $cart
     * @return void
     */
    private function updateCartTotal($cart)
    {
        $total = CartItem::where('cart_id', $cart->id)
            ->join('products', 'cart_items.product_id', '=', 'products.id')
            ->sum(DB::raw('cart_items.quantity * cart_items.price'));

        $cart->total = $total;
        $cart->save();
    }
}
