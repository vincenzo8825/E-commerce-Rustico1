<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    /**
     * Ottieni recensioni per un prodotto specifico
     */
    public function getProductReviews(Request $request, $productId): JsonResponse
    {
        try {
            $product = Product::findOrFail($productId);

            // Parametri per filtri e ordinamento
            $perPage = $request->get('per_page', 10);
            $sortBy = $request->get('sort_by', 'newest'); // newest, helpful, rating_high, rating_low
            $filterRating = $request->get('rating', null);
            $verifiedOnly = $request->get('verified_only', false);

            $query = Review::approved()
                ->where('product_id', $productId)
                ->with(['user:id,name,surname']);

            // Filtri
            if ($filterRating) {
                $query->withRating($filterRating);
            }

            if ($verifiedOnly) {
                $query->verifiedPurchase();
            }

            // Ordinamento
            switch ($sortBy) {
                case 'helpful':
                    $query->orderByHelpful()->orderByNewest();
                    break;
                case 'rating_high':
                    $query->orderBy('rating', 'desc')->orderByNewest();
                    break;
                case 'rating_low':
                    $query->orderBy('rating', 'asc')->orderByNewest();
                    break;
                default:
                    $query->orderByNewest();
                    break;
            }

            $reviews = $query->paginate($perPage);

            // Statistiche del prodotto
            $stats = Review::getStatsForProduct($productId);

            // Controlla se l'utente corrente ha già recensito
            $userReview = null;
            if (Auth::check()) {
                $userReview = Review::where('user_id', Auth::id())
                    ->where('product_id', $productId)
                    ->first();
            }

            return response()->json([
                'reviews' => $reviews->items(),
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'total_pages' => $reviews->lastPage(),
                    'total_items' => $reviews->total(),
                    'per_page' => $reviews->perPage()
                ],
                'stats' => $stats,
                'userReview' => $userReview,
                'filters' => [
                    'sort_by' => $sortBy,
                    'rating' => $filterRating,
                    'verified_only' => $verifiedOnly
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nel caricamento delle recensioni',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni tutte le recensioni approvate (endpoint pubblico)
     */
    public function getAllReviews(Request $request): JsonResponse
    {
        try {
            // Parametri per filtri e ordinamento
            $perPage = $request->get('per_page', 12);
            $sortBy = $request->get('sort_by', 'newest');
            $filterRating = $request->get('rating', null);
            $filterProduct = $request->get('product_id', null);
            $verifiedOnly = $request->get('verified_only', false);

            $query = Review::approved()
                ->with(['user:id,name,surname', 'product:id,name,slug,image']);

            // Filtri
            if ($filterRating) {
                $query->where('rating', $filterRating);
            }

            if ($filterProduct) {
                $query->where('product_id', $filterProduct);
            }

            if ($verifiedOnly) {
                $query->where('verified_purchase', true);
            }

            // Ordinamento
            switch ($sortBy) {
                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'rating_high':
                    $query->orderBy('rating', 'desc')->orderBy('created_at', 'desc');
                    break;
                case 'rating_low':
                    $query->orderBy('rating', 'asc')->orderBy('created_at', 'desc');
                    break;
                case 'helpful':
                    $query->orderBy('helpful_count', 'desc')->orderBy('created_at', 'desc');
                    break;
                default: // newest
                    $query->orderBy('created_at', 'desc');
            }

            $reviews = $query->paginate($perPage);

            return response()->json([
                'reviews' => $reviews->items(),
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'total_pages' => $reviews->lastPage(),
                    'total_items' => $reviews->total(),
                    'per_page' => $reviews->perPage()
                ],
                'filters' => [
                    'sort_by' => $sortBy,
                    'rating' => $filterRating,
                    'product_id' => $filterProduct,
                    'verified_only' => $verifiedOnly
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nel caricamento delle recensioni',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crea una nuova recensione
     */
    public function store(Request $request, $productId): JsonResponse
    {
        try {
            $product = Product::findOrFail($productId);
            $user = Auth::user();

            // Verifica se l'utente ha già recensito questo prodotto
            $existingReview = Review::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingReview) {
                return response()->json([
                    'error' => 'Hai già recensito questo prodotto'
                ], 400);
            }

            $validated = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'title' => 'nullable|string|max:255',
                'comment' => 'nullable|string|max:2000',
                'images' => 'nullable|array|max:5',
                'images.*' => 'string|max:500'
            ]);

            // Verifica se l'utente ha acquistato il prodotto
            $hasPurchased = Order::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereHas('orderItems', function ($query) use ($productId) {
                    $query->where('product_id', $productId);
                })
                ->exists();

            $review = Review::create([
                'user_id' => $user->id,
                'product_id' => $productId,
                'rating' => $validated['rating'],
                'title' => $validated['title'] ?? null,
                'comment' => $validated['comment'] ?? null,
                'verified_purchase' => $hasPurchased,
                'images' => $validated['images'] ?? null,
                'is_approved' => true // Auto-approvazione, può essere modificato
            ]);

            $review->load(['user:id,name,surname']);

            return response()->json([
                'message' => 'Recensione creata con successo',
                'review' => $review,
                'stats' => Review::getStatsForProduct($productId)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nella creazione della recensione',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna una recensione esistente
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $user = Auth::user();

            // Verifica che l'utente sia il proprietario della recensione
            if ($review->user_id !== $user->id) {
                return response()->json([
                    'error' => 'Non hai i permessi per modificare questa recensione'
                ], 403);
            }

            $validated = $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'title' => 'nullable|string|max:255',
                'comment' => 'nullable|string|max:2000',
                'images' => 'nullable|array|max:5',
                'images.*' => 'string|max:500'
            ]);

            $review->update([
                'rating' => $validated['rating'],
                'title' => $validated['title'] ?? null,
                'comment' => $validated['comment'] ?? null,
                'images' => $validated['images'] ?? null,
            ]);

            $review->load(['user:id,name,surname']);

            return response()->json([
                'message' => 'Recensione aggiornata con successo',
                'review' => $review,
                'stats' => Review::getStatsForProduct($review->product_id)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nell\'aggiornamento della recensione',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina una recensione
     */
    public function destroy($id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $user = Auth::user();

            // Verifica che l'utente sia il proprietario della recensione
            if ($review->user_id !== $user->id) {
                return response()->json([
                    'error' => 'Non hai i permessi per eliminare questa recensione'
                ], 403);
            }

            $productId = $review->product_id;
            $review->delete();

            return response()->json([
                'message' => 'Recensione eliminata con successo',
                'stats' => Review::getStatsForProduct($productId)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nell\'eliminazione della recensione',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Segna una recensione come utile (like)
     */
    public function markHelpful(Request $request, $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);

            // Increment helpful count
            $review->increment('helpful_count');

            return response()->json([
                'message' => 'Recensione marcata come utile',
                'helpful_count' => $review->helpful_count
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nel marcare la recensione come utile',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni recensioni dell'utente corrente
     */
    public function getUserReviews(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $perPage = $request->get('per_page', 10);

            $reviews = Review::where('user_id', $user->id)
                ->with(['product:id,name,slug,image'])
                ->orderByNewest()
                ->paginate($perPage);

            return response()->json($reviews);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nel caricamento delle tue recensioni',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni una singola recensione dell'utente corrente
     */
    public function getUserReview($id): JsonResponse
    {
        try {
            $user = Auth::user();

            $review = Review::where('user_id', $user->id)
                ->where('id', $id)
                ->with(['product:id,name,slug,image'])
                ->first();

            if (!$review) {
                return response()->json([
                    'error' => 'Recensione non trovata o non hai i permessi per visualizzarla'
                ], 404);
            }

            return response()->json([
                'review' => $review
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nel caricamento della recensione',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * =================== METODI ADMIN ===================
     */

    /**
     * Ottieni tutte le recensioni per l'admin
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $status = $request->get('status', 'all'); // all, approved, pending
            $sortBy = $request->get('sort_by', 'newest');
            $perPage = $request->get('per_page', 20);

            $query = Review::with(['user:id,name,surname', 'product:id,name,slug']);

            // Filtra per stato
            if ($status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($status === 'pending') {
                $query->where('is_approved', false);
            }

            // Ordinamento
            switch ($sortBy) {
                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'rating_high':
                    $query->orderBy('rating', 'desc');
                    break;
                case 'rating_low':
                    $query->orderBy('rating', 'asc');
                    break;
                case 'helpful':
                    $query->orderBy('helpful_count', 'desc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }

            $reviews = $query->paginate($perPage);

            return response()->json($reviews);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nel caricamento delle recensioni',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approva una recensione
     */
    public function approve($id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['is_approved' => true]);

            // Crea notifica per l'utente
            $review->user->notifications()->create([
                'type' => 'review_approved',
                'title' => 'Recensione Approvata',
                'message' => "La tua recensione per \"{$review->product->name}\" è stata approvata ed è ora visibile sul sito.",
                'data' => [
                    'review_id' => $review->id,
                    'product_id' => $review->product_id,
                    'product_name' => $review->product->name
                ]
            ]);

            return response()->json([
                'message' => 'Recensione approvata con successo',
                'review' => $review->load(['user:id,name,surname', 'product:id,name'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nell\'approvazione della recensione',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rifiuta una recensione
     */
    public function reject($id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['is_approved' => false]);

            // Crea notifica per l'utente
            $review->user->notifications()->create([
                'type' => 'review_rejected',
                'title' => 'Recensione Non Approvata',
                'message' => "La tua recensione per \"{$review->product->name}\" non è stata approvata. Se ritieni sia un errore, contatta il nostro supporto.",
                'data' => [
                    'review_id' => $review->id,
                    'product_id' => $review->product_id,
                    'product_name' => $review->product->name
                ]
            ]);

            return response()->json([
                'message' => 'Recensione rifiutata',
                'review' => $review->load(['user:id,name,surname', 'product:id,name'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nel rifiuto della recensione',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina una recensione (metodo admin)
     */
    public function adminDestroy($id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);
            $productName = $review->product->name;
            $userName = $review->user->name . ' ' . $review->user->surname;

            // Crea notifica per l'utente prima dell'eliminazione
            $review->user->notifications()->create([
                'type' => 'review_deleted',
                'title' => 'Recensione Rimossa',
                'message' => "La tua recensione per \"{$productName}\" è stata rimossa dall'amministrazione per violazione delle linee guida.",
                'data' => [
                    'product_name' => $productName
                ]
            ]);

            $review->delete();

            return response()->json([
                'message' => "Recensione di {$userName} eliminata con successo"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nell\'eliminazione della recensione',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Risposta dell'admin a una recensione
     */
    public function adminReply(Request $request, $id): JsonResponse
    {
        try {
            $review = Review::findOrFail($id);

            $validated = $request->validate([
                'message' => 'required|string|max:1000'
            ]);

            // Salva la risposta dell'admin nel campo admin_reply come JSON
            $adminReply = [
                'message' => $validated['message'],
                'admin_name' => Auth::user()->name . ' ' . Auth::user()->surname,
                'created_at' => now()->toISOString()
            ];

            $review->update(['admin_reply' => $adminReply]);

            // Crea notifica per l'utente
            $review->user->notifications()->create([
                'type' => 'admin_reply',
                'title' => 'Risposta alla Recensione',
                'message' => "L'amministrazione ha risposto alla tua recensione per \"{$review->product->name}\".",
                'data' => [
                    'review_id' => $review->id,
                    'product_id' => $review->product_id,
                    'product_name' => $review->product->name,
                    'admin_reply' => $validated['message']
                ]
            ]);

            return response()->json([
                'message' => 'Risposta inviata con successo',
                'review' => $review->load(['user:id,name,surname', 'product:id,name'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nell\'invio della risposta',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
