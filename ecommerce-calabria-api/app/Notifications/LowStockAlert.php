<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification implements ShouldQueue
{
    use Queueable;

    protected $product;
    protected $threshold;

    /**
     * Create a new notification instance.
     */
    public function __construct(Product $product, int $threshold = 5)
    {
        $this->product = $product;
        $this->threshold = $threshold;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Avviso: Prodotto con Stock Basso')
                    ->greeting('Attenzione!')
                    ->line('Il prodotto "' . $this->product->name . '" sta per esaurirsi.')
                    ->line('Stock rimanente: ' . $this->product->stock . ' unità')
                    ->line('SKU: ' . $this->product->sku)
                    ->action('Gestisci Prodotto', url('/admin/products/' . $this->product->id . '/edit'))
                    ->line('È consigliabile rifornire il magazzino il prima possibile.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'stock' => $this->product->stock,
            'threshold' => $this->threshold,
            'message' => 'Il prodotto "' . $this->product->name . '" ha un livello di stock basso (' . $this->product->stock . ' unità).'
        ];
    }
}
