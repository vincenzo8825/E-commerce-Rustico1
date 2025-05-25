<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DiscountController extends Controller
{
    /**
     * Ottieni tutti i codici sconto
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search');
            $status = $request->input('status');
            $sortBy = $request->input('sort', '-created_at');
            $page = $request->input('page', 1);

            $query = DiscountCode::query();

            // Filtra per codice o descrizione
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Filtra per stato attivo/inattivo
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }

            // Ordina i risultati
            if ($sortBy) {
                $direction = 'asc';
                $column = $sortBy;

                if (substr($sortBy, 0, 1) === '-') {
                    $direction = 'desc';
                    $column = substr($sortBy, 1);
                }

                $query->orderBy($column, $direction);
            }

            $discounts = $query->paginate($perPage, ['*'], 'page', $page);

            // Mappiamo i campi database ai campi frontend per ogni elemento
            $mappedDiscounts = $discounts->getCollection()->map(function ($discount) {
                return [
                    'id' => $discount->id,
                    'code' => $discount->code,
                    'description' => $discount->description,
                    'type' => $discount->type,
                    'amount' => $discount->value,
                    'min_order_amount' => $discount->min_order_value,
                    'max_uses' => $discount->max_uses,
                    'uses' => $discount->used_count,
                    'is_active' => $discount->is_active,
                    'starts_at' => $discount->starts_at,
                    'expires_at' => $discount->expires_at,
                    'created_at' => $discount->created_at,
                    'updated_at' => $discount->updated_at,
                ];
            });

            // Sostituiamo la collection mappata
            $discounts->setCollection($mappedDiscounts);

            return response()->json([
                'discounts' => $discounts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Errore nel caricamento dei codici sconto',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Salva un nuovo codice sconto
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:discount_codes,code',
            'description' => 'nullable|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'amount' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean'
        ]);

        // Mappiamo i campi frontend ai campi database
        $data = [
            'code' => strtoupper($validated['code']),
            'description' => $validated['description'] ?? '',
            'type' => $validated['type'],
            'value' => $validated['amount'],
            'min_order_value' => $validated['min_order_amount'] ?? null,
            'max_uses' => $validated['max_uses'] ?? null,
            'used_count' => 0,
            'is_active' => $validated['is_active'] ?? true,
            'starts_at' => $validated['starts_at'] ? \Carbon\Carbon::parse($validated['starts_at']) : null,
            'expires_at' => $validated['expires_at'] ? \Carbon\Carbon::parse($validated['expires_at']) : null,
        ];

        $discount = DiscountCode::create($data);

        return response()->json([
            'message' => 'Codice sconto creato con successo',
            'discount' => $discount
        ], 201);
    }

    /**
     * Mostra i dettagli di un codice sconto
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $discount = DiscountCode::findOrFail($id);

        // Mappiamo i campi database ai campi frontend
        $mappedDiscount = [
            'id' => $discount->id,
            'code' => $discount->code,
            'description' => $discount->description,
            'type' => $discount->type,
            'amount' => $discount->value,
            'min_order_amount' => $discount->min_order_value,
            'max_uses' => $discount->max_uses,
            'uses' => $discount->used_count,
            'is_active' => $discount->is_active,
            'starts_at' => $discount->starts_at ? $discount->starts_at->format('Y-m-d') : null,
            'expires_at' => $discount->expires_at ? $discount->expires_at->format('Y-m-d') : null,
            'created_at' => $discount->created_at,
            'updated_at' => $discount->updated_at,
        ];

        return response()->json([
            'discount' => $mappedDiscount
        ]);
    }

    /**
     * Aggiorna un codice sconto
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $discount = DiscountCode::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:discount_codes,code,' . $id,
            'description' => 'nullable|string|max:255',
            'type' => 'required|in:percentage,fixed',
            'amount' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean'
        ]);

        // Mappiamo i campi frontend ai campi database
        $data = [
            'code' => strtoupper($validated['code']),
            'description' => $validated['description'] ?? '',
            'type' => $validated['type'],
            'value' => $validated['amount'],
            'min_order_value' => $validated['min_order_amount'] ?? null,
            'max_uses' => $validated['max_uses'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'starts_at' => $validated['starts_at'] ? \Carbon\Carbon::parse($validated['starts_at']) : null,
            'expires_at' => $validated['expires_at'] ? \Carbon\Carbon::parse($validated['expires_at']) : null,
        ];

        $discount->update($data);

        return response()->json([
            'message' => 'Codice sconto aggiornato con successo',
            'discount' => $discount
        ]);
    }

    /**
     * Elimina un codice sconto
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $discount = DiscountCode::findOrFail($id);

        $discount->delete();

        return response()->json([
            'message' => 'Codice sconto eliminato con successo'
        ]);
    }

    /**
     * Attiva o disattiva un codice sconto
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function toggleActive($id)
    {
        $discount = DiscountCode::findOrFail($id);

        $discount->is_active = !$discount->is_active;
        $discount->save();

        $status = $discount->is_active ? 'attivato' : 'disattivato';

        return response()->json([
            'message' => "Codice sconto {$status} con successo",
            'discount' => $discount
        ]);
    }
}
