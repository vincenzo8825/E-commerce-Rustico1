<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DiscountController extends Controller
{
    /**
     * Ottieni tutti i codici sconto
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $discounts = DiscountCode::orderBy('valid_until', 'desc')->get();

        return response()->json([
            'discounts' => $discounts
        ]);
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
