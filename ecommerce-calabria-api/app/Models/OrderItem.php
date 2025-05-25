<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'quantity',
        'price',
        'total',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['subtotal', 'formatted_price', 'formatted_total'];

    /**
     * Get the order that owns the item.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product that owns the item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Accessor per subtotal (alias di total per compatibilità)
     */
    public function getSubtotalAttribute()
    {
        return $this->total;
    }

    /**
     * Accessor per prezzo formattato
     */
    public function getFormattedPriceAttribute()
    {
        return '€ ' . number_format($this->price, 2, ',', '.');
    }

    /**
     * Accessor per totale formattato
     */
    public function getFormattedTotalAttribute()
    {
        return '€ ' . number_format($this->total, 2, ',', '.');
    }

    /**
     * Calcola il totale per questo item
     */
    public function calculateTotal()
    {
        return $this->quantity * $this->price;
    }
}
