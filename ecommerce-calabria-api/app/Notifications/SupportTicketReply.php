<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupportTicketReply extends Notification implements ShouldQueue
{
    use Queueable;

    protected $ticket;

    /**
     * Create a new notification instance.
     */
    public function __construct(SupportTicket $ticket)
    {
        $this->ticket = $ticket;
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
        $lastMessage = $this->ticket->messages()->latest()->first();

        return (new MailMessage)
                    ->subject('Nuova risposta al tuo ticket: ' . $this->ticket->subject)
                    ->greeting('Ciao ' . $notifiable->name . ',')
                    ->line('Hai ricevuto una nuova risposta al tuo ticket di supporto.')
                    ->line('Ticket: ' . $this->ticket->subject)
                    ->action('Visualizza Conversazione', url('/dashboard/support-tickets/' . $this->ticket->id))
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
            'ticket_id' => $this->ticket->id,
            'subject' => $this->ticket->subject,
            'status' => $this->ticket->status,
            'message' => 'Nuova risposta al tuo ticket: ' . $this->ticket->subject
        ];
    }
}
