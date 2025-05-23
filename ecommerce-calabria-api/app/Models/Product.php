<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'ingredients',
        'price',
        'discount_price',
        'stock',
        'sku',
        'image',
        'gallery',
        'is_featured',
        'is_active',
        'origin',
        'producer',
        'weight',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'gallery' => 'array',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['image_url', 'images'];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::saved(function ($product) {
            static::clearProductCache($product);
        });

        static::deleted(function ($product) {
            static::clearProductCache($product);
        });
    }

    /**
     * Pulisce la cache relativa ai prodotti.
     *
     * @param  \App\Models\Product  $product
     * @return void
     */
    protected static function clearProductCache($product)
    {
        // Cancella la cache del singolo prodotto
        Cache::forget('product_' . $product->slug);

        // Cancella la cache delle liste di prodotti
        Cache::forget('products_*');
        Cache::forget('featured_products');
        Cache::forget('new_products');
        Cache::forget('available_filters');

        // Cancella la cache della categoria associata
        Cache::forget('public_category_' . $product->category->slug);
        Cache::forget('public_categories');
    }

    /**
     * Get the category that owns the product.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the cart items for the product.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the favorites for the product.
     */
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Get the full URL for the product image.
     *
     * @return string|null
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }

        // Se l'immagine è già un URL completo, restituiscilo così com'è
        if (filter_var($this->image, FILTER_VALIDATE_URL)) {
            return $this->image;
        }

        // Usa l'URL del backend che gira su 127.0.0.1:8000
        return 'http://127.0.0.1:8000/storage/' . $this->image;
    }

    /**
     * Get the images array in the format expected by the frontend.
     *
     * @return array
     */
    public function getImagesAttribute()
    {
        $images = [];

        // Aggiungi l'immagine principale se presente
        if ($this->image_url) {
            $images[] = [
                'id' => 1,
                'url' => $this->image_url,
                'alt' => $this->name,
                'is_primary' => true
            ];
        }

        // Aggiungi le immagini della gallery se presenti
        if ($this->gallery && is_array($this->gallery)) {
            foreach ($this->gallery as $index => $galleryImage) {
                $url = filter_var($galleryImage, FILTER_VALIDATE_URL)
                    ? $galleryImage
                    : 'http://127.0.0.1:8000/storage/' . $galleryImage;

                $images[] = [
                    'id' => $index + 2,
                    'url' => $url,
                    'alt' => $this->name . ' - Immagine ' . ($index + 2),
                    'is_primary' => false
                ];
            }
        }

        return $images;
    }
}
