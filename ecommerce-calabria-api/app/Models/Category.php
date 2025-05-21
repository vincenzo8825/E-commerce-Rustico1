<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::saved(function ($category) {
            static::clearCategoryCache($category);
        });

        static::deleted(function ($category) {
            static::clearCategoryCache($category);
        });
    }

    /**
     * Pulisce la cache relativa alle categorie.
     *
     * @param  \App\Models\Category  $category
     * @return void
     */
    protected static function clearCategoryCache($category)
    {
        // Cancella la cache della singola categoria
        Cache::forget('public_category_' . $category->slug);

        // Cancella la cache delle liste di categorie
        Cache::forget('public_categories');
        Cache::forget('available_filters');

        // Cancella la cache dei prodotti associati
        foreach ($category->products as $product) {
            Cache::forget('product_' . $product->slug);
        }

        // Cancella cache generiche dei prodotti
        Cache::forget('products_*');
        Cache::forget('featured_products');
        Cache::forget('new_products');
    }

    /**
     * Get the products for the category.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
