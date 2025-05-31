<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use App\Models\ShippingMethod;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class ShippingController extends Controller
{
    /**
     * Calcola opzioni di spedizione per un carrello
     */
    public function calculateShipping(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'postal_code' => 'required|string|max:10',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:50',
            'country' => 'required|string|max:2',
            'cart_total' => 'required|numeric|min:0',
            'cart_weight' => 'sometimes|numeric|min:0',
            'cart_items' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $shippingData = [
                'postal_code' => $request->postal_code,
                'city' => $request->city,
                'province' => $request->province,
                'country' => strtoupper($request->country),
                'cart_total' => $request->cart_total,
                'cart_weight' => $request->cart_weight ?? $this->calculateCartWeight($request->cart_items ?? []),
                'cart_items' => $request->cart_items ?? []
            ];

            $shippingOptions = $this->getShippingOptions($shippingData);

            return response()->json([
                'success' => true,
                'shipping_options' => $shippingOptions,
                'free_shipping_threshold' => $this->getFreeShippingThreshold($shippingData['country']),
                'estimated_delivery' => $this->getEstimatedDelivery($shippingData)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel calcolo delle spedizioni',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni zone di spedizione disponibili
     */
    public function getShippingZones()
    {
        try {
            $zones = Cache::remember('shipping_zones', 3600, function () {
                return ShippingZone::with('methods')
                    ->where('is_active', true)
                    ->orderBy('priority')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'zones' => $zones
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel recupero delle zone di spedizione',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verifica disponibilità spedizione per codice postale
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'postal_code' => 'required|string|max:10',
            'country' => 'required|string|max:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $country = strtoupper($request->country);
            $postalCode = $request->postal_code;

            $isAvailable = $this->isShippingAvailable($country, $postalCode);
            $restrictions = $this->getShippingRestrictions($country, $postalCode);

            return response()->json([
                'success' => true,
                'available' => $isAvailable,
                'restrictions' => $restrictions,
                'supported_countries' => $this->getSupportedCountries()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella verifica della disponibilità',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Traccia una spedizione
     */
    public function trackShipment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tracking_number' => 'required|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $trackingNumber = $request->tracking_number;
            $trackingInfo = $this->getTrackingInfo($trackingNumber);

            return response()->json([
                'success' => true,
                'tracking_info' => $trackingInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel tracciamento della spedizione',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcola opzioni di spedizione
     */
    private function getShippingOptions($shippingData)
    {
        $country = $shippingData['country'];
        $cartTotal = $shippingData['cart_total'];
        $cartWeight = $shippingData['cart_weight'];
        $postalCode = $shippingData['postal_code'];

        $zone = $this->getShippingZone($country, $postalCode);

        if (!$zone) {
            return [];
        }

        $options = [];

        foreach ($zone->methods as $method) {
            if (!$method->is_active) continue;

            $cost = $this->calculateShippingCost($method, $cartTotal, $cartWeight, $shippingData);

            // Applica spedizione gratuita se applicabile
            if ($this->isFreeShippingEligible($method, $cartTotal, $country)) {
                $cost = 0;
            }

            $options[] = [
                'id' => $method->id,
                'name' => $method->name,
                'description' => $method->description,
                'cost' => round($cost, 2),
                'original_cost' => round($this->calculateShippingCost($method, $cartTotal, $cartWeight, $shippingData), 2),
                'delivery_time' => $method->delivery_time,
                'delivery_time_max' => $method->delivery_time_max,
                'is_free' => $cost == 0,
                'is_express' => $method->is_express,
                'tracking_available' => $method->tracking_available,
                'insurance_included' => $method->insurance_included,
                'estimated_delivery' => $this->calculateEstimatedDelivery($method, $shippingData)
            ];
        }

        // Ordina per costo crescente
        usort($options, function($a, $b) {
            return $a['cost'] <=> $b['cost'];
        });

        return $options;
    }

    /**
     * Calcola il costo di spedizione per un metodo
     */
    private function calculateShippingCost($method, $cartTotal, $cartWeight, $shippingData)
    {
        $cost = 0;

        switch ($method->calculation_type) {
            case 'fixed':
                $cost = $method->base_cost;
                break;

            case 'percentage':
                $cost = ($cartTotal * $method->percentage) / 100;
                break;

            case 'weight':
                $cost = $method->base_cost + ($cartWeight * $method->cost_per_kg);
                break;

            case 'tiered':
                $cost = $this->calculateTieredCost($method, $cartTotal, $cartWeight);
                break;

            default:
                $cost = $method->base_cost;
        }

        // Applica costo minimo e massimo
        if ($method->min_cost && $cost < $method->min_cost) {
            $cost = $method->min_cost;
        }

        if ($method->max_cost && $cost > $method->max_cost) {
            $cost = $method->max_cost;
        }

        // Applica supplementi per zone remote
        if ($this->isRemoteArea($shippingData['postal_code'])) {
            $cost += $method->remote_area_surcharge ?? 0;
        }

        return $cost;
    }

    /**
     * Calcola costo spedizione a fasce
     */
    private function calculateTieredCost($method, $cartTotal, $cartWeight)
    {
        $tiers = json_decode($method->price_tiers, true) ?? [];

        foreach ($tiers as $tier) {
            if ($cartTotal >= $tier['min_amount'] && ($tier['max_amount'] === null || $cartTotal <= $tier['max_amount'])) {
                return $tier['cost'];
            }
        }

        return $method->base_cost;
    }

    /**
     * Verifica se è elegibile per spedizione gratuita
     */
    private function isFreeShippingEligible($method, $cartTotal, $country)
    {
        if (!$method->free_shipping_enabled) {
            return false;
        }

        $threshold = $this->getFreeShippingThreshold($country);

        return $cartTotal >= $threshold;
    }

    /**
     * Ottieni soglia spedizione gratuita per paese
     */
    private function getFreeShippingThreshold($country)
    {
        $thresholds = [
            'IT' => 50.00,
            'EU' => 75.00,
            'WORLD' => 100.00
        ];

        if (isset($thresholds[$country])) {
            return $thresholds[$country];
        }

        // Paesi UE
        $euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

        if (in_array($country, $euCountries)) {
            return $thresholds['EU'];
        }

        return $thresholds['WORLD'];
    }

    /**
     * Ottieni zona di spedizione per paese e CAP
     */
    private function getShippingZone($country, $postalCode)
    {
        return Cache::remember("shipping_zone_{$country}_{$postalCode}", 1800, function () use ($country, $postalCode) {
            // Prima cerca zona specifica per CAP
            $zone = ShippingZone::with('methods')
                ->where('is_active', true)
                ->where(function ($query) use ($country, $postalCode) {
                    $query->where('countries', 'like', "%{$country}%")
                          ->where(function ($q) use ($postalCode) {
                              $q->whereNull('postal_codes')
                                ->orWhere('postal_codes', 'like', "%{$postalCode}%");
                          });
                })
                ->orderBy('priority')
                ->first();

            // Se non trovata, cerca zona generale per paese
            if (!$zone) {
                $zone = ShippingZone::with('methods')
                    ->where('is_active', true)
                    ->where('countries', 'like', "%{$country}%")
                    ->whereNull('postal_codes')
                    ->orderBy('priority')
                    ->first();
            }

            return $zone;
        });
    }

    /**
     * Calcola peso del carrello
     */
    private function calculateCartWeight($cartItems)
    {
        $totalWeight = 0;

        foreach ($cartItems as $item) {
            $weight = $item['weight'] ?? 0.5; // Peso di default 500g
            $quantity = $item['quantity'] ?? 1;
            $totalWeight += ($weight * $quantity);
        }

        return $totalWeight;
    }

    /**
     * Verifica se la spedizione è disponibile
     */
    private function isShippingAvailable($country, $postalCode)
    {
        $zone = $this->getShippingZone($country, $postalCode);
        return $zone !== null;
    }

    /**
     * Ottieni restrizioni di spedizione
     */
    private function getShippingRestrictions($country, $postalCode)
    {
        $restrictions = [];

        // Restrizioni per paese
        $countryRestrictions = [
            'IT' => [],
            'EU' => ['no_liquids_over_1l', 'customs_required'],
            'WORLD' => ['no_liquids', 'customs_required', 'extended_delivery']
        ];

        if (isset($countryRestrictions[$country])) {
            $restrictions = $countryRestrictions[$country];
        } elseif ($this->isEUCountry($country)) {
            $restrictions = $countryRestrictions['EU'];
        } else {
            $restrictions = $countryRestrictions['WORLD'];
        }

        // Restrizioni per zone remote
        if ($this->isRemoteArea($postalCode)) {
            $restrictions[] = 'remote_area_surcharge';
            $restrictions[] = 'extended_delivery';
        }

        return $restrictions;
    }

    /**
     * Verifica se è zona remota
     */
    private function isRemoteArea($postalCode)
    {
        // Zone remote italiane (isole minori, zone montane)
        $remoteCodes = ['98', '97', '89', '88']; // Sicilia, Sardegna, Calabria, etc.

        $prefix = substr($postalCode, 0, 2);
        return in_array($prefix, $remoteCodes);
    }

    /**
     * Verifica se è paese UE
     */
    private function isEUCountry($country)
    {
        $euCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
        return in_array($country, $euCountries);
    }

    /**
     * Ottieni paesi supportati
     */
    private function getSupportedCountries()
    {
        return Cache::remember('supported_countries', 7200, function () {
            return [
                'IT' => 'Italia',
                'AT' => 'Austria',
                'BE' => 'Belgio',
                'FR' => 'Francia',
                'DE' => 'Germania',
                'ES' => 'Spagna',
                'PT' => 'Portogallo',
                'NL' => 'Paesi Bassi',
                'CH' => 'Svizzera',
                'UK' => 'Regno Unito',
                'US' => 'Stati Uniti',
                'CA' => 'Canada'
            ];
        });
    }

    /**
     * Calcola data di consegna stimata
     */
    private function calculateEstimatedDelivery($method, $shippingData)
    {
        $baseDeliveryTime = $method->delivery_time;
        $maxDeliveryTime = $method->delivery_time_max ?? $baseDeliveryTime;

        // Aggiungi giorni extra per zone remote
        if ($this->isRemoteArea($shippingData['postal_code'])) {
            $baseDeliveryTime += 1;
            $maxDeliveryTime += 2;
        }

        // Aggiungi giorni extra per paesi non-UE
        if (!$this->isEUCountry($shippingData['country']) && $shippingData['country'] !== 'IT') {
            $baseDeliveryTime += 3;
            $maxDeliveryTime += 5;
        }

        $startDate = now()->addDays($baseDeliveryTime);
        $endDate = now()->addDays($maxDeliveryTime);

        // Salta i weekend per spedizioni non express
        if (!$method->is_express) {
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
            'formatted' => $startDate->format('d/m') . ' - ' . $endDate->format('d/m/Y')
        ];
    }

    /**
     * Ottieni stima di consegna generale
     */
    private function getEstimatedDelivery($shippingData)
    {
        $zone = $this->getShippingZone($shippingData['country'], $shippingData['postal_code']);

        if (!$zone || !$zone->methods->count()) {
            return null;
        }

        // Prendi il metodo più veloce
        $fastestMethod = $zone->methods
            ->where('is_active', true)
            ->sortBy('delivery_time')
            ->first();

        if (!$fastestMethod) {
            return null;
        }

        return $this->calculateEstimatedDelivery($fastestMethod, $shippingData);
    }

    /**
     * Ottieni informazioni di tracciamento (simulato)
     */
    private function getTrackingInfo($trackingNumber)
    {
        // In un sistema reale, questo si collegherebbe alle API dei corrieri
        return [
            'tracking_number' => $trackingNumber,
            'status' => 'in_transit',
            'status_description' => 'Pacco in transito',
            'estimated_delivery' => now()->addDays(2)->format('Y-m-d'),
            'events' => [
                [
                    'date' => now()->subDays(2)->format('Y-m-d H:i'),
                    'location' => 'Cosenza, IT',
                    'description' => 'Pacco preso in carico'
                ],
                [
                    'date' => now()->subDays(1)->format('Y-m-d H:i'),
                    'location' => 'Roma, IT',
                    'description' => 'In transito verso destinazione'
                ],
                [
                    'date' => now()->format('Y-m-d H:i'),
                    'location' => 'Milano, IT',
                    'description' => 'Arrivato al centro di smistamento'
                ]
            ]
        ];
    }
}
