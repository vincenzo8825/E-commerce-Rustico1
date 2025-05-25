<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    /**
     * Mostra tutte le categorie.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $categories = Category::withCount('products')->orderBy('name')->get();

        return response()->json([
            'categories' => $categories
        ]);
    }

    /**
     * Salva una nuova categoria nel database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        // Genera uno slug dal nome
        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Categoria creata con successo',
            'category' => $category
        ], 201);
    }

    /**
     * Mostra i dettagli di una categoria specifica.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $category = Category::with('products')->findOrFail($id);

        return response()->json([
            'category' => $category
        ]);
    }

    /**
     * Aggiorna una categoria nel database.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        // Aggiorna lo slug solo se il nome è cambiato
        if ($request->has('name') && $category->name !== $request->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Categoria aggiornata con successo',
            'category' => $category
        ]);
    }

    /**
     * Rimuove una categoria dal database.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        // Verifica se la categoria ha prodotti associati
        if ($category->products()->count() > 0) {
            throw ValidationException::withMessages([
                'category' => ['Impossibile eliminare la categoria perché ci sono prodotti associati ad essa.']
            ]);
        }

        $category->delete();

        return response()->json([
            'message' => 'Categoria eliminata con successo'
        ]);
    }
}
