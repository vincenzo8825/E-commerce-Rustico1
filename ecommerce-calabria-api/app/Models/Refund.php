<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'final_amount',
        'reason',
        'status',
        'refund_type',
        'requested_at',
        'processed_at',
        'processed_by',
        'admin_notes',
        'items',
        'refund_number',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
        'items' => 'array',
    ];

    // Relazioni
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeFull($query)
    {
        return $query->where('refund_type', 'full');
    }

    public function scopePartial($query)
    {
        return $query->where('refund_type', 'partial');
    }

    public function scopeItemSpecific($query)
    {
        return $query->where('refund_type', 'item_specific');
    }

    // Accessors
    public function getStatusTextAttribute()
    {
        $statuses = [
            'pending' => 'In attesa',
            'processing' => 'In elaborazione',
            'approved' => 'Approvato',
            'rejected' => 'Rifiutato',
            'failed' => 'Fallito',
        ];

        return $statuses[$this->status] ?? 'Sconosciuto';
    }

    public function getRefundTypeTextAttribute()
    {
        $types = [
            'full' => 'Completo',
            'partial' => 'Parziale',
            'item_specific' => 'Prodotti specifici',
        ];

        return $types[$this->refund_type] ?? 'Sconosciuto';
    }

    public function getFormattedAmountAttribute()
    {
        return '€' . number_format($this->amount, 2, ',', '.');
    }

    public function getFormattedFinalAmountAttribute()
    {
        return $this->final_amount ? '€' . number_format($this->final_amount, 2, ',', '.') : null;
    }

    // Metodi helper
    public function isAutoProcessable(): bool
    {
        $autoReasons = [
            'prodotto difettoso',
            'errore nell\'ordine',
            'prodotto danneggiato',
            'prodotto non conforme',
            'defective product',
            'damaged product'
        ];

        $reason = strtolower($this->reason);

        foreach ($autoReasons as $autoReason) {
            if (strpos($reason, $autoReason) !== false) {
                return true;
            }
        }

        return false;
    }

    public function canBeProcessed(): bool
    {
        return $this->status === 'pending';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}
