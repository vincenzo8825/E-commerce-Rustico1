<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    /**
     * Lista tutti i coupon per l'admin
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');

            $query = Coupon::with(['usages' => function($q) {
                $q->with('user:id,name,email');
            }]);

            // Filtro per ricerca
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Filtro per status
            if ($request->has('status')) {
                $query->where('is_active', $request->boolean('status'));
            }

            $coupons = $query->orderBy('created_at', 'desc')
                            ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $coupons,
                'message' => 'Coupon recuperati con successo'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel recupero dei coupon: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostra un coupon specifico
     */
    public function show(string $id): JsonResponse
    {
        try {
            $coupon = Coupon::with(['usages.user'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $coupon,
                'message' => 'Coupon trovato con successo'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon non trovato'
            ], 404);
        }
    }

    /**
     * Crea un nuovo coupon
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:coupons,code',
                'description' => 'required|string|max:255',
                'type' => 'required|in:percentage,fixed',
                'value' => 'required|numeric|min:0',
                'minimum_amount' => 'nullable|numeric|min:0',
                'maximum_discount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1',
                'user_limit' => 'nullable|integer|min:1',
                'expires_at' => 'nullable|date|after:now',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dati non validi',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Genera codice automatico se non fornito
            $data = $request->all();
            if (empty($data['code'])) {
                $data['code'] = 'RUSTICO' . strtoupper(Str::random(6));
            }

            $coupon = Coupon::create($data);

            return response()->json([
                'success' => true,
                'data' => $coupon,
                'message' => 'Coupon creato con successo'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella creazione del coupon: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna un coupon esistente
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'code' => 'sometimes|string|max:50|unique:coupons,code,' . $id,
                'description' => 'sometimes|string|max:255',
                'type' => 'sometimes|in:percentage,fixed',
                'value' => 'sometimes|numeric|min:0',
                'minimum_amount' => 'nullable|numeric|min:0',
                'maximum_discount' => 'nullable|numeric|min:0',
                'usage_limit' => 'nullable|integer|min:1',
                'user_limit' => 'nullable|integer|min:1',
                'expires_at' => 'nullable|date',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dati non validi',
                    'errors' => $validator->errors()
                ], 422);
            }

            $coupon->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $coupon->fresh(),
                'message' => 'Coupon aggiornato con successo'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'aggiornamento del coupon'
            ], 500);
        }
    }

    /**
     * Elimina un coupon
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail($id);

            // Verifica se il coupon è stato già utilizzato
            if ($coupon->usages()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossibile eliminare un coupon già utilizzato. Disattivalo invece.'
                ], 400);
            }

            $coupon->delete();

            return response()->json([
                'success' => true,
                'message' => 'Coupon eliminato con successo'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'eliminazione del coupon'
            ], 500);
        }
    }

    /**
     * Attiva/Disattiva un coupon
     */
    public function toggleActive(string $id): JsonResponse
    {
        try {
            $coupon = Coupon::findOrFail($id);
            $coupon->is_active = !$coupon->is_active;
            $coupon->save();

            $status = $coupon->is_active ? 'attivato' : 'disattivato';

            return response()->json([
                'success' => true,
                'data' => $coupon,
                'message' => "Coupon {$status} con successo"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella modifica dello stato del coupon'
            ], 500);
        }
    }
}
