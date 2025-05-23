<?php

namespace App\Notifications;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupportTicketCreated extends Notification implements ShouldQueue
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
        return (new MailMessage)
                    ->subject('Nuovo ticket di supporto: ' . $this->ticket->subject)
                    ->greeting('Ciao ' . $notifiable->name . ',')
                    ->line('È stato creato un nuovo ticket di supporto.')
                    ->line('Ticket: ' . $this->ticket->subject)
                    ->line('Utente: ' . $this->ticket->user->name . ' (' . $this->ticket->user->email . ')')
                    ->action('Visualizza Ticket', url('/admin/support/' . $this->ticket->id))
                    ->line('Grazie per il tuo lavoro!');
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
            'user_name' => $this->ticket->user->name,
            'user_email' => $this->ticket->user->email,
            'message' => 'Nuovo ticket di supporto: ' . $this->ticket->subject . ' da ' . $this->ticket->user->name
        ];
    }
}
