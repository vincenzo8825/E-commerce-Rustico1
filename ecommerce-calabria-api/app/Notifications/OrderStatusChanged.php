<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusChanged extends Notification implements ShouldQueue
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
        $status = ucfirst($this->order->status);

        return (new MailMessage)
                    ->subject('Aggiornamento Stato Ordine #' . $this->order->id)
                    ->greeting('Ciao ' . $notifiable->name . ',')
                    ->line('Lo stato del tuo ordine #' . $this->order->id . ' è stato aggiornato.')
                    ->line('Nuovo stato: ' . $status)
                    ->action('Visualizza Ordine', url('/user/orders/' . $this->order->id))
                    ->line('Grazie per aver scelto Sapori di Calabria!');
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
            'status' => $this->order->status,
            'message' => 'Lo stato del tuo ordine #' . $this->order->id . ' è stato aggiornato in "' . $this->order->status . '".'
        ];
    }
}
