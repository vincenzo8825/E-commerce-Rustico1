<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingMethod extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'shipping_zone_id',
        'name',
        'description',
        'calculation_type',
        'base_cost',
        'percentage',
        'cost_per_kg',
        'min_cost',
        'max_cost',
        'price_tiers',
        'delivery_time',
        'delivery_time_max',
        'is_active',
        'is_express',
        'tracking_available',
        'insurance_included',
        'free_shipping_enabled',
        'remote_area_surcharge',
        'priority'
    ];

    protected $casts = [
        'base_cost' => 'decimal:2',
        'percentage' => 'decimal:2',
        'cost_per_kg' => 'decimal:2',
        'min_cost' => 'decimal:2',
        'max_cost' => 'decimal:2',
        'remote_area_surcharge' => 'decimal:2',
        'price_tiers' => 'array',
        'is_active' => 'boolean',
        'is_express' => 'boolean',
        'tracking_available' => 'boolean',
        'insurance_included' => 'boolean',
        'free_shipping_enabled' => 'boolean'
    ];

    /**
     * Relazione con la zona di spedizione
     */
    public function shippingZone()
    {
        return $this->belongsTo(ShippingZone::class);
    }

    /**
     * Relazione con gli ordini che hanno usato questo metodo
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'shipping_method_id');
    }

    /**
     * Scope per metodi attivi
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope per metodi express
     */
    public function scopeExpress($query)
    {
        return $query->where('is_express', true);
    }

    /**
     * Scope per metodi con tracking
     */
    public function scopeWithTracking($query)
    {
        return $query->where('tracking_available', true);
    }

    /**
     * Calcola il costo per un carrello specifico
     */
    public function calculateCost($cartTotal, $cartWeight = 0, $shippingData = [])
    {
        $cost = 0;

        switch ($this->calculation_type) {
            case 'fixed':
                $cost = $this->base_cost;
                break;

            case 'percentage':
                $cost = ($cartTotal * $this->percentage) / 100;
                break;

            case 'weight':
                $cost = $this->base_cost + ($cartWeight * $this->cost_per_kg);
                break;

            case 'tiered':
                $cost = $this->calculateTieredCost($cartTotal, $cartWeight);
                break;

            default:
                $cost = $this->base_cost;
        }

        // Applica limiti min/max
        if ($this->min_cost && $cost < $this->min_cost) {
            $cost = $this->min_cost;
        }

        if ($this->max_cost && $cost > $this->max_cost) {
            $cost = $this->max_cost;
        }

        // Supplemento zone remote
        if (isset($shippingData['postal_code']) && $this->isRemoteArea($shippingData['postal_code'])) {
            $cost += $this->remote_area_surcharge ?? 0;
        }

        return round($cost, 2);
    }

    /**
     * Calcola costo a fasce
     */
    private function calculateTieredCost($cartTotal, $cartWeight)
    {
        if (!$this->price_tiers) {
            return $this->base_cost;
        }

        foreach ($this->price_tiers as $tier) {
            if ($cartTotal >= $tier['min_amount'] &&
                ($tier['max_amount'] === null || $cartTotal <= $tier['max_amount'])) {
                return $tier['cost'];
            }
        }

        return $this->base_cost;
    }

    /**
     * Verifica se un CAP è in zona remota
     */
    private function isRemoteArea($postalCode)
    {
        $remoteCodes = ['98', '97', '89', '88'];
        $prefix = substr($postalCode, 0, 2);
        return in_array($prefix, $remoteCodes);
    }

    /**
     * Calcola tempo di consegna stimato
     */
    public function getEstimatedDelivery($shippingData = [])
    {
        $baseTime = $this->delivery_time;
        $maxTime = $this->delivery_time_max ?? $baseTime;

        // Aggiungi tempo extra per zone remote
        if (isset($shippingData['postal_code']) && $this->isRemoteArea($shippingData['postal_code'])) {
            $baseTime += 1;
            $maxTime += 2;
        }

        $startDate = now()->addDays($baseTime);
        $endDate = now()->addDays($maxTime);

        // Salta weekend per metodi non express
        if (!$this->is_express) {
            while ($startDate->isWeekend()) {
                $startDate->addDay();
            }
            while ($endDate->isWeekend()) {
                $endDate->addDay();
            }
        }

        return [
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'formatted' => $startDate->format('d/m') . ' - ' . $endDate->format('d/m/Y'),
            'days_min' => $baseTime,
            'days_max' => $maxTime
        ];
    }

    /**
     * Verifica se è disponibile per una destinazione
     */
    public function isAvailableFor($country, $postalCode = null)
    {
        if (!$this->is_active) {
            return false;
        }

        $zone = $this->shippingZone;

        if (!$zone || !$zone->is_active) {
            return false;
        }

        if (!$zone->coversCountry($country)) {
            return false;
        }

        if ($postalCode && !$zone->coversPostalCode($postalCode)) {
            return false;
        }

        return true;
    }

    /**
     * Ottieni tipo di calcolo formattato
     */
    public function getCalculationTypeNameAttribute()
    {
        $types = [
            'fixed' => 'Costo Fisso',
            'percentage' => 'Percentuale',
            'weight' => 'Peso',
            'tiered' => 'A Fasce'
        ];

        return $types[$this->calculation_type] ?? 'Sconosciuto';
    }

    /**
     * Ottieni descrizione completa del metodo
     */
    public function getFullDescriptionAttribute()
    {
        $description = $this->description;

        if ($this->is_express) {
            $description .= ' (Express)';
        }

        if ($this->tracking_available) {
            $description .= ' - Tracking incluso';
        }

        if ($this->insurance_included) {
            $description .= ' - Assicurazione inclusa';
        }

        return $description;
    }
}
