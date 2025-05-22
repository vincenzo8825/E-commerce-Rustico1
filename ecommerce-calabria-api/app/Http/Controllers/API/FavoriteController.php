<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    /**
     * Aggiunge un prodotto ai preferiti dell'utente.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function addToFavorites(Request $request)
    {
        $user = Auth::user();

        // Verifica che l'utente abbia verificato l'email
        if (!$user->email_verified_at && !$user->is_admin) {
            return response()->json([
                'message' => 'È necessario verificare l\'email prima di aggiungere prodotti ai preferiti'
            ], 403);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        // Verifica se il prodotto è già nei preferiti dell'utente
        $existingFavorite = Favorite::where('user_id', $user->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existingFavorite) {
            return response()->json([
                'message' => 'Questo prodotto è già nei tuoi preferiti'
            ]);
        }

        try {
            // Crea il preferito
            $favorite = Favorite::create([
                'user_id' => $user->id,
                'product_id' => $validated['product_id'],
            ]);

            return response()->json([
                'message' => 'Prodotto aggiunto ai preferiti con successo',
                'favorite' => $favorite->load('product')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Si è verificato un errore durante l\'aggiunta del prodotto ai preferiti',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Recupera i preferiti dell'utente.
     *
     * @return \Illuminate\Http\Response
     */
    public function getFavorites()
    {
        $user = Auth::user();
        $favorites = Favorite::with('product')
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'favorites' => $favorites
        ]);
    }

    /**
     * Rimuove un prodotto dai preferiti.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function removeFavorite($id)
    {
        $user = Auth::user();
        $favorite = Favorite::where('user_id', $user->id)
            ->where('product_id', $id)
            ->first();

        if (!$favorite) {
            return response()->json([
                'message' => 'Preferito non trovato'
            ], 404);
        }

        try {
            $favorite->delete();

            return response()->json([
                'message' => 'Prodotto rimosso dai preferiti con successo'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Si è verificato un errore durante la rimozione del prodotto dai preferiti',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
