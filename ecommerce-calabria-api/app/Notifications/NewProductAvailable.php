<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewProductAvailable extends Notification implements ShouldQueue
{
    use Queueable;

    protected $productData;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $productData)
    {
        $this->productData = $productData;
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
        $productName = $this->productData['product_name'];
        $productPrice = $this->productData['product_price'];

        return (new MailMessage)
                    ->subject('Nuovo Prodotto Disponibile: ' . $productName)
                    ->greeting('Ciao ' . $notifiable->name . ',')
                    ->line('Un nuovo prodotto è ora disponibile nel nostro negozio!')
                    ->line($productName . ' a soli €' . $productPrice)
                    ->action('Visualizza Prodotto', url('/products/' . $this->productData['product_id']))
                    ->line('Scopri subito questo e altri prodotti calabresi di qualità!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'product_id' => $this->productData['product_id'],
            'product_name' => $this->productData['product_name'],
            'product_image' => $this->productData['product_image'],
            'product_price' => $this->productData['product_price'],
            'message' => 'Nuovo prodotto disponibile: ' . $this->productData['product_name'] . ' a €' . $this->productData['product_price']
        ];
    }
}
