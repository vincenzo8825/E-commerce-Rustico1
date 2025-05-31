<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShippingZone extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'countries',
        'postal_codes',
        'is_active',
        'priority'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'countries' => 'array',
        'postal_codes' => 'array'
    ];

    /**
     * Relazione con i metodi di spedizione
     */
    public function methods()
    {
        return $this->hasMany(ShippingMethod::class);
    }

    /**
     * Scope per zone attive
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope per zona specifica di un paese
     */
    public function scopeForCountry($query, $country)
    {
        return $query->where(function ($q) use ($country) {
            $q->where('countries', 'like', "%{$country}%")
              ->orWhereJsonContains('countries', $country);
        });
    }

    /**
     * Verifica se la zona copre un paese specifico
     */
    public function coversCountry($country)
    {
        if (is_string($this->countries)) {
            return str_contains($this->countries, $country);
        }

        if (is_array($this->countries)) {
            return in_array($country, $this->countries);
        }

        return false;
    }

    /**
     * Verifica se la zona copre un CAP specifico
     */
    public function coversPostalCode($postalCode)
    {
        if (!$this->postal_codes) {
            return true; // Se non ci sono restrizioni sui CAP, copre tutti
        }

        if (is_string($this->postal_codes)) {
            return str_contains($this->postal_codes, $postalCode);
        }

        if (is_array($this->postal_codes)) {
            return in_array($postalCode, $this->postal_codes);
        }

        return false;
    }

    /**
     * Ottieni il metodo di spedizione più economico
     */
    public function getCheapestMethod()
    {
        return $this->methods()
            ->where('is_active', true)
            ->orderBy('base_cost')
            ->first();
    }

    /**
     * Ottieni il metodo di spedizione più veloce
     */
    public function getFastestMethod()
    {
        return $this->methods()
            ->where('is_active', true)
            ->orderBy('delivery_time')
            ->first();
    }
}
