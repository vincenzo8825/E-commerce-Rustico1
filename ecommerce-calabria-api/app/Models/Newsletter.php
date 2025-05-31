<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Newsletter extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'name',
        'token',
        'is_active',
        'preferences',
        'source',
        'subscribed_at',
        'unsubscribed_at',
        'email_verified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'preferences' => 'array',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    /**
     * Boot del model per generare token automaticamente
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($newsletter) {
            if (empty($newsletter->token)) {
                $newsletter->token = Str::random(64);
            }
            if (empty($newsletter->subscribed_at)) {
                $newsletter->subscribed_at = now();
            }
        });
    }

    /**
     * Scope per newsletter attive
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope per newsletter con email verificata
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Verifica se l'email è verificata
     */
    public function isEmailVerified(): bool
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Segna l'email come verificata
     */
    public function markEmailAsVerified()
    {
        if (!$this->isEmailVerified()) {
            $this->update(['email_verified_at' => now()]);
        }
    }

    /**
     * Disiscrive dalla newsletter
     */
    public function unsubscribe()
    {
        $this->update([
            'is_active' => false,
            'unsubscribed_at' => now()
        ]);
    }

    /**
     * Riattiva la subscription
     */
    public function resubscribe()
    {
        $this->update([
            'is_active' => true,
            'unsubscribed_at' => null,
            'subscribed_at' => now()
        ]);
    }

    /**
     * Ottieni preferenze con default
     */
    public function getPreferencesWithDefaults(): array
    {
        $defaults = [
            'new_products' => true,
            'offers' => true,
            'recipes' => true,
            'events' => false,
        ];

        return array_merge($defaults, $this->preferences ?? []);
    }
}
