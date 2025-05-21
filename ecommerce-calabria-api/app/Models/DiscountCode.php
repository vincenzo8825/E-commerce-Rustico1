<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiscountCode extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'description',
        'type',
        'value',
        'min_order_value',
        'max_uses',
        'used_count',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'decimal:2',
        'min_order_value' => 'decimal:2',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Check if the discount code is valid.
     *
     * @return bool
     */
    public function isValid()
    {
        // Check if the code is active
        if (!$this->is_active) {
            return false;
        }

        // Check if the code has reached its maximum uses
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        // Check if the code has started
        if ($this->starts_at !== null && now()->lt($this->starts_at)) {
            return false;
        }

        // Check if the code has expired
        if ($this->expires_at !== null && now()->gt($this->expires_at)) {
            return false;
        }

        return true;
    }

    /**
     * Get the orders that used this discount code.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'discount_code', 'code');
    }
}
