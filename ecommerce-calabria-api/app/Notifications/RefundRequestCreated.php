<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Refund;

class RefundRequestCreated extends Notification implements ShouldQueue
{
    use Queueable;

    protected $refund;

    /**
     * Create a new notification instance.
     */
    public function __construct(Refund $refund)
    {
        $this->refund = $refund;
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
                    ->subject('Nuova Richiesta di Rimborso - Rustico Calabria')
                    ->greeting('Ciao Admin!')
                    ->line('È stata ricevuta una nuova richiesta di rimborso.')
                    ->line("**Numero Rimborso:** {$this->refund->refund_number}")
                    ->line("**Ordine:** {$this->refund->order->order_number}")
                    ->line("**Cliente:** {$this->refund->user->name} {$this->refund->user->surname}")
                    ->line("**Importo:** €" . number_format($this->refund->amount, 2, ',', '.'))
                    ->line("**Motivo:** {$this->refund->reason}")
                    ->action('Gestisci Rimborso', config('app.frontend_url') . '/admin/refunds/' . $this->refund->id)
                    ->line('Accedi al pannello admin per processare la richiesta.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'refund_id' => $this->refund->id,
            'refund_number' => $this->refund->refund_number,
            'order_number' => $this->refund->order->order_number,
            'customer_name' => $this->refund->user->name . ' ' . $this->refund->user->surname,
            'amount' => $this->refund->amount,
            'reason' => $this->refund->reason,
            'type' => 'refund_request',
            'title' => 'Nuova Richiesta di Rimborso',
            'message' => "Richiesta di rimborso di €" . number_format($this->refund->amount, 2, ',', '.') . " per l'ordine {$this->refund->order->order_number}",
        ];
    }
}
