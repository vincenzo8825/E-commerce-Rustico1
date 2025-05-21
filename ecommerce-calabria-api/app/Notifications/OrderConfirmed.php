<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmed extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
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
        $total = '€' . number_format($this->order->total, 2, ',', '.');

        $message = (new MailMessage)
            ->subject('Conferma Ordine #' . $this->order->order_number)
            ->greeting('Grazie per il tuo acquisto, ' . $notifiable->name . '!')
            ->line('Il tuo ordine #' . $this->order->order_number . ' è stato confermato.')
            ->line('Importo totale: ' . $total)
            ->action('Visualizza Dettagli Ordine', url('/user/orders/' . $this->order->id))
            ->line('Riceverai una notifica appena il tuo ordine sarà spedito.');

        // Aggiungiamo i dettagli dell'ordine
        $message->line('Dettagli della spedizione:');
        $message->line($this->order->shipping_name . ' ' . $this->order->shipping_surname);
        $message->line($this->order->shipping_address);
        $message->line($this->order->shipping_postal_code . ' ' . $this->order->shipping_city);

        $message->line('Grazie per aver scelto Sapori di Calabria!');

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total' => $this->order->total,
            'message' => 'Il tuo ordine #' . $this->order->order_number . ' è stato confermato.'
        ];
    }
}
