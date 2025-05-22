<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DiscountCodeAvailable extends Notification implements ShouldQueue
{
    use Queueable;

    protected $discountData;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $discountData)
    {
        $this->discountData = $discountData;
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
        $code = $this->discountData['code'];
        $percent = $this->discountData['discount_percent'];
        $expiresAt = $this->discountData['expires_at'];

        return (new MailMessage)
                    ->subject('Codice Sconto Esclusivo per Te: ' . $percent . '% di Sconto!')
                    ->greeting('Ciao ' . $notifiable->name . ',')
                    ->line('Abbiamo creato un codice sconto esclusivo per te!')
                    ->line('Usa il codice ' . $code . ' per ottenere uno sconto del ' . $percent . '% sul tuo prossimo acquisto.')
                    ->line('Il codice scadrà il ' . $expiresAt . ', affrettati!')
                    ->action('Acquista Ora', url('/products'))
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
            'code' => $this->discountData['code'],
            'discount_percent' => $this->discountData['discount_percent'],
            'expires_at' => $this->discountData['expires_at'],
            'message' => 'Usa il codice ' . $this->discountData['code'] . ' per ottenere uno sconto del ' . $this->discountData['discount_percent'] . '%!'
        ];
    }
}
