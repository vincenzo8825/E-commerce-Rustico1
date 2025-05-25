<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryAlert extends Model
{
    protected $fillable = [
        'product_id',
        'alert_type',
        'threshold',
        'is_active',
        'last_triggered_at',
        'notes'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_triggered_at' => 'datetime',
    ];

    /**
     * Relazione con il prodotto
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope per alert attivi
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope per alert di stock basso
     */
    public function scopeLowStock($query)
    {
        return $query->where('alert_type', 'low_stock');
    }

    /**
     * Verifica se l'alert deve essere triggerato
     */
    public function shouldTrigger(): bool
    {
        if (!$this->is_active || !$this->product) {
            return false;
        }

        return $this->product->stock_quantity <= $this->threshold;
    }

    /**
     * Marca l'alert come triggerato
     */
    public function markAsTriggered(): void
    {
        $this->update(['last_triggered_at' => now()]);
    }
}
