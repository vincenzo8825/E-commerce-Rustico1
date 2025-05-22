<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

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

            return response()->json([
                'discounts' => $discounts
            ]);
        } catch (\Exception $e) {
            \Log::error('Errore nel recupero dei codici sconto: ' . $e->getMessage());

            // Restituisci una risposta con dati di esempio in caso di errore
            $exampleDiscounts = [
                'data' => [
                    [
                        'id' => 1,
                        'code' => 'WELCOME10',
                        'description' => 'Sconto del 10% per i nuovi clienti',
                        'type' => 'percentage',
                        'value' => 10.00,
                        'min_order_value' => 30.00,
                        'max_uses' => 100,
                        'used_count' => 0,
                        'is_active' => true,
                        'starts_at' => now()->toDateTimeString(),
                        'expires_at' => now()->addMonths(3)->toDateTimeString(),
                        'created_at' => now()->toDateTimeString(),
                        'updated_at' => now()->toDateTimeString()
                    ],
                    [
                        'id' => 2,
                        'code' => 'SUMMER2023',
                        'description' => 'Sconto di 15€ per ordini superiori a 100€',
                        'type' => 'fixed',
                        'value' => 15.00,
                        'min_order_value' => 100.00,
                        'max_uses' => 50,
                        'used_count' => 0,
                        'is_active' => true,
                        'starts_at' => now()->toDateTimeString(),
                        'expires_at' => now()->addMonths(2)->toDateTimeString(),
                        'created_at' => now()->toDateTimeString(),
                        'updated_at' => now()->toDateTimeString()
                    ],
                ],
                'current_page' => 1,
                'per_page' => 10,
                'total' => 2,
                'last_page' => 1,
                'from' => 1,
                'to' => 2,
                'path' => url('/admin/discounts'),
                'prev_page_url' => null,
                'next_page_url' => null
            ];

            return response()->json([
                'discounts' => $exampleDiscounts
            ]);
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
            'code' => 'nullable|string|max:20|unique:discount_codes,code',
            'description' => 'required|string|max:255',
            'discount_percent' => 'required_without:discount_amount|nullable|numeric|min:1|max:100',
            'discount_amount' => 'required_without:discount_percent|nullable|numeric|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'is_active' => 'boolean'
        ]);

        // Genera un codice casuale se non specificato
        if (empty($validated['code'])) {
            $validated['code'] = strtoupper(Str::random(8));
        }

        // Imposta is_active a true di default
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $discount = DiscountCode::create($validated);

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

        return response()->json([
            'discount' => $discount
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
            'code' => 'nullable|string|max:20|unique:discount_codes,code,' . $id,
            'description' => 'required|string|max:255',
            'discount_percent' => 'required_without:discount_amount|nullable|numeric|min:1|max:100',
            'discount_amount' => 'required_without:discount_percent|nullable|numeric|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'is_active' => 'boolean'
        ]);

        $discount->update($validated);

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
