<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'title',
        'comment',
        'verified_purchase',
        'is_approved',
        'helpful_count',
        'images',
        'admin_reply'
    ];

    protected $casts = [
        'verified_purchase' => 'boolean',
        'is_approved' => 'boolean',
        'helpful_count' => 'integer',
        'rating' => 'integer',
        'images' => 'array',
        'admin_reply' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relazione con l'utente
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relazione con il prodotto
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope per recensioni approvate
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope per recensioni con acquisto verificato
     */
    public function scopeVerifiedPurchase($query)
    {
        return $query->where('verified_purchase', true);
    }

    /**
     * Scope per rating specifico
     */
    public function scopeWithRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Scope per ordinare per più utili
     */
    public function scopeOrderByHelpful($query)
    {
        return $query->orderBy('helpful_count', 'desc');
    }

    /**
     * Scope per ordinare per più recenti
     */
    public function scopeOrderByNewest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Calcola le statistiche delle recensioni per un prodotto
     */
    public static function getStatsForProduct($productId)
    {
        $reviews = self::approved()->where('product_id', $productId);

        $totalReviews = $reviews->count();
        $averageRating = $totalReviews > 0 ? $reviews->avg('rating') : 0;

        $ratingCounts = [];
        for ($i = 1; $i <= 5; $i++) {
            $ratingCounts[$i] = $reviews->where('rating', $i)->count();
        }

        return [
            'averageRating' => round($averageRating, 1),
            'totalReviews' => $totalReviews,
            'ratingCounts' => $ratingCounts
        ];
    }

    /**
     * Verifica se l'utente ha acquistato il prodotto
     */
    public function setVerifiedPurchaseAttribute()
    {
        // Verifica se l'utente ha effettivamente acquistato questo prodotto
        $hasPurchased = Order::where('user_id', $this->user_id)
            ->where('status', 'completed')
            ->whereHas('orderItems', function ($query) {
                $query->where('product_id', $this->product_id);
            })
            ->exists();

        $this->attributes['verified_purchase'] = $hasPurchased;
    }

    /**
     * Accessor per formattare la data in italiano
     */
    public function getFormattedDateAttribute()
    {
        return $this->created_at->format('d/m/Y');
    }

    /**
     * Accessor per stelle HTML
     */
    public function getStarsHtmlAttribute()
    {
        $stars = '';
        for ($i = 1; $i <= 5; $i++) {
            $stars .= $i <= $this->rating ? '★' : '☆';
        }
        return $stars;
    }
}
