<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Mostra tutti i prodotti con filtri opzionali.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Filtro per nome/descrizione
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filtro per categoria
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filtro per stock
        if ($request->has('stock') && $request->stock) {
            if ($request->stock === 'low') {
                $query->where('stock', '<=', 5)->where('stock', '>', 0);
            } elseif ($request->stock === 'out') {
                $query->where('stock', '<=', 0);
            }
        }

        // Ordinamento
        if ($request->has('sort') && $request->sort) {
            $sortField = 'name'; // default
            $sortDirection = 'asc';

            switch ($request->sort) {
                case 'name':
                    $sortField = 'name';
                    break;
                case 'price_asc':
                    $sortField = 'price';
                    break;
                case 'price_desc':
                    $sortField = 'price';
                    $sortDirection = 'desc';
                    break;
                case 'stock_asc':
                    $sortField = 'stock';
                    break;
                case 'stock_desc':
                    $sortField = 'stock';
                    $sortDirection = 'desc';
                    break;
                case 'created_desc':
                    $sortField = 'created_at';
                    $sortDirection = 'desc';
                    break;
            }

            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        // Paginazione
        $products = $query->paginate(15);

        return response()->json([
            'products' => $products
        ]);
    }

    /**
     * Salva un nuovo prodotto nel database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'sku' => 'required|string|max:50|unique:products,sku',
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'origin' => 'nullable|string|max:100',
            'producer' => 'nullable|string|max:255',
            'weight' => 'nullable|numeric|min:0',
            'ingredients' => 'nullable|string',
        ]);

        // Genera uno slug dal nome
        $validated['slug'] = Str::slug($validated['name']);

        $product = Product::create($validated);

        // Controlla se lo stock è basso e invia notifiche
        $stockService = new StockService();
        $stockService->checkProductStock($product);

        return response()->json([
            'message' => 'Prodotto creato con successo',
            'product' => $product
        ], 201);
    }

    /**
     * Mostra i dettagli di un prodotto specifico.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $product = Product::with('category')->findOrFail($id);

        return response()->json([
            'product' => $product
        ]);
    }

    /**
     * Aggiorna un prodotto nel database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'sku' => 'required|string|max:50|unique:products,sku,' . $id,
            'image' => 'nullable|string',
            'gallery' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'origin' => 'nullable|string|max:100',
            'producer' => 'nullable|string|max:255',
            'weight' => 'nullable|numeric|min:0',
            'ingredients' => 'nullable|string',
        ]);

        // Aggiorna lo slug solo se il nome è cambiato
        if ($request->has('name') && $product->name !== $request->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Salva lo stock precedente per verificare se è cambiato
        $oldStock = $product->stock;

        $product->update($validated);

        // Se lo stock è stato aggiornato ed è basso, invia notifiche
        if ($oldStock != $product->stock) {
            $stockService = new StockService();
            $stockService->checkProductStock($product);
        }

        return response()->json([
            'message' => 'Prodotto aggiornato con successo',
            'product' => $product
        ]);
    }

    /**
     * Rimuove un prodotto dal database.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Verifica se il prodotto ha ordini associati
        if ($product->orderItems()->count() > 0) {
            return response()->json([
                'message' => 'Impossibile eliminare il prodotto perché esistono ordini associati ad esso.'
            ], 400);
        }

        // Rimuovi il prodotto dal database (soft delete)
        $product->delete();

        return response()->json([
            'message' => 'Prodotto eliminato con successo'
        ]);
    }

    /**
     * Aggiorna solo lo stock di un prodotto.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateStock(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        // Salva lo stock precedente per verificare se è cambiato
        $oldStock = $product->stock;

        $product->update([
            'stock' => $validated['stock']
        ]);

        // Se lo stock è stato aggiornato ed è basso, invia notifiche
        if ($oldStock != $product->stock) {
            $stockService = new StockService();
            $stockService->checkProductStock($product);
        }

        return response()->json([
            'message' => 'Stock aggiornato con successo',
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'stock' => $product->stock
            ]
        ]);
    }

    /**
     * Aggiorna lo stock di più prodotti in blocco.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function bulkUpdateStock(Request $request)
    {
        $validated = $request->validate([
            'updates' => 'required|array',
            'updates.*.id' => 'required|exists:products,id',
            'updates.*.stock' => 'required|integer|min:0',
        ]);

        $updatedProducts = [];
        $stockService = new StockService();

        foreach ($validated['updates'] as $update) {
            $product = Product::findOrFail($update['id']);
            $oldStock = $product->stock;

            $product->update([
                'stock' => $update['stock']
            ]);

            // Se lo stock è stato aggiornato ed è basso, invia notifiche
            if ($oldStock != $product->stock) {
                $stockService->checkProductStock($product);
            }

            $updatedProducts[] = [
                'id' => $product->id,
                'name' => $product->name,
                'stock' => $product->stock
            ];
        }

        return response()->json([
            'message' => 'Stock aggiornato con successo per ' . count($updatedProducts) . ' prodotti',
            'products' => $updatedProducts
        ]);
    }
}
