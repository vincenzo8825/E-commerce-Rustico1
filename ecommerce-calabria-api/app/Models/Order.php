<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'total',
        'shipping_cost',
        'tax',
        'discount',
        'discount_code',
        'shipping_name',
        'shipping_surname',
        'shipping_address',
        'shipping_city',
        'shipping_postal_code',
        'shipping_phone',
        'notes',
        'payment_method',
        'payment_id',
        'is_paid',
        'paid_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'is_paid' => 'boolean',
        'paid_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['formatted_total', 'status_label'];

    /**
     * Available order statuses
     */
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the user that owns the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the order.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope per ordini pagati
     */
    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    /**
     * Scope per ordini per status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Accessor per il totale formattato
     */
    public function getFormattedTotalAttribute()
    {
        return '€ ' . number_format($this->total, 2, ',', '.');
    }

    /**
     * Accessor per la label dello status
     */
    public function getStatusLabelAttribute()
    {
        $labels = [
            self::STATUS_PENDING => 'In Attesa',
            self::STATUS_PROCESSING => 'In Elaborazione',
            self::STATUS_SHIPPED => 'Spedito',
            self::STATUS_DELIVERED => 'Consegnato',
            self::STATUS_CANCELLED => 'Annullato',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    /**
     * Calcola il totale dell'ordine
     */
    public function calculateTotal()
    {
        $subtotal = $this->orderItems()->sum('total_price');
        $total = $subtotal + $this->shipping_cost + $this->tax - $this->discount;

        return max(0, $total);
    }

    /**
     * Ottieni il subtotale dell'ordine
     */
    public function getSubtotalAttribute()
    {
        return $this->orderItems()->sum('total_price');
    }

    /**
     * Ottieni l'indirizzo di spedizione completo
     */
    public function getFullShippingAddressAttribute()
    {
        $parts = array_filter([
            $this->shipping_name . ' ' . $this->shipping_surname,
            $this->shipping_address,
            $this->shipping_city . ' ' . $this->shipping_postal_code,
            $this->shipping_phone
        ]);

        return implode(', ', $parts);
    }
}
