<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_amount',
        'maximum_discount',
        'usage_limit',
        'user_usage_limit',
        'usage_count',
        'total_discount_given',
        'starts_at',
        'expires_at',
        'is_active',
        'user_id',
        'applicable_products',
        'applicable_categories',
        'auto_apply',
        'priority'
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'auto_apply' => 'boolean',
        'value' => 'decimal:2',
        'minimum_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2',
        'total_discount_given' => 'decimal:2',
        'applicable_products' => 'array',
        'applicable_categories' => 'array'
    ];

    /**
     * Relazione con l'utente (se il coupon è specifico per un utente)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relazione con gli utilizzi del coupon
     */
    public function usages()
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * Relazione con gli ordini che hanno usato questo coupon
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Scope per coupons attivi
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope per coupons validi (non scaduti)
     */
    public function scopeValid($query)
    {
        $now = Carbon::now();
        return $query->where(function ($q) use ($now) {
            $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>=', $now);
        });
    }

    /**
     * Scope per coupons disponibili (non raggiunto limite utilizzi)
     */
    public function scopeAvailable($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('usage_limit')
              ->orWhereRaw('usage_count < usage_limit');
        });
    }

    /**
     * Verifica se il coupon è attualmente valido
     */
    public function isValid()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = Carbon::now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Verifica se il coupon è scaduto
     */
    public function isExpired()
    {
        return $this->expires_at && Carbon::now()->gt($this->expires_at);
    }

    /**
     * Verifica se il coupon ha raggiunto il limite di utilizzi
     */
    public function hasReachedUsageLimit()
    {
        return $this->usage_limit && $this->usage_count >= $this->usage_limit;
    }

    /**
     * Calcola lo sconto per un importo dato
     */
    public function calculateDiscount($amount)
    {
        $discount = 0;

        switch ($this->type) {
            case 'percentage':
                $discount = ($amount * $this->value) / 100;
                break;

            case 'fixed':
                $discount = min($this->value, $amount);
                break;

            case 'free_shipping':
                // Logica per spedizione gratuita (dipende dal sistema di spedizione)
                $discount = 0;
                break;
        }

        // Applica sconto massimo se definito
        if ($this->maximum_discount && $discount > $this->maximum_discount) {
            $discount = $this->maximum_discount;
        }

        return round($discount, 2);
    }

    /**
     * Verifica se l'utente può usare questo coupon
     */
    public function canBeUsedBy($userId, $cartTotal = 0)
    {
        // Verifica se è valido
        if (!$this->isValid()) {
            return false;
        }

        // Verifica utente specifico
        if ($this->user_id && $this->user_id !== $userId) {
            return false;
        }

        // Verifica importo minimo
        if ($this->minimum_amount && $cartTotal < $this->minimum_amount) {
            return false;
        }

        // Verifica limite utilizzi per utente
        if ($this->user_usage_limit) {
            $userUsageCount = $this->usages()->where('user_id', $userId)->count();
            if ($userUsageCount >= $this->user_usage_limit) {
                return false;
            }
        }

        return true;
    }

    /**
     * Incrementa il contatore di utilizzi
     */
    public function incrementUsage($discountAmount = 0)
    {
        $this->increment('usage_count');
        if ($discountAmount > 0) {
            $this->increment('total_discount_given', $discountAmount);
        }
    }

    /**
     * Decrementa il contatore di utilizzi (per rollback)
     */
    public function decrementUsage($discountAmount = 0)
    {
        $this->decrement('usage_count');
        if ($discountAmount > 0) {
            $this->decrement('total_discount_given', $discountAmount);
        }
    }

    /**
     * Formatta il valore del coupon per la visualizzazione
     */
    public function getFormattedValueAttribute()
    {
        switch ($this->type) {
            case 'percentage':
                return $this->value . '%';
            case 'fixed':
                return '€' . number_format($this->value, 2);
            case 'free_shipping':
                return 'Spedizione Gratuita';
            default:
                return $this->value;
        }
    }

    /**
     * Ottieni il tipo di coupon formattato
     */
    public function getTypeNameAttribute()
    {
        $types = [
            'percentage' => 'Percentuale',
            'fixed' => 'Importo Fisso',
            'free_shipping' => 'Spedizione Gratuita',
            'buy_x_get_y' => 'Compra X Prendi Y'
        ];

        return $types[$this->type] ?? 'Sconosciuto';
    }

    /**
     * Ottieni lo stato del coupon
     */
    public function getStatusAttribute()
    {
        if (!$this->is_active) {
            return 'Disattivo';
        }

        if ($this->isExpired()) {
            return 'Scaduto';
        }

        if ($this->hasReachedUsageLimit()) {
            return 'Limite Raggiunto';
        }

        $now = Carbon::now();
        if ($this->starts_at && $now->lt($this->starts_at)) {
            return 'Non Ancora Attivo';
        }

        return 'Attivo';
    }
}
