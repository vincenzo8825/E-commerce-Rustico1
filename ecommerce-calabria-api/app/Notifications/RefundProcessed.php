<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Refund;

class RefundProcessed extends Notification implements ShouldQueue
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
        $statusMessage = $this->getStatusMessage();
        $subject = $this->getSubject();

        $mail = (new MailMessage)
                    ->subject($subject)
                    ->greeting("Ciao {$this->refund->user->name}!")
                    ->line($statusMessage)
                    ->line("**Numero Rimborso:** {$this->refund->refund_number}")
                    ->line("**Ordine:** {$this->refund->order->order_number}");

        if ($this->refund->status === 'approved') {
            $amount = $this->refund->final_amount ?? $this->refund->amount;
            $mail->line("**Importo Rimborsato:** €" . number_format($amount, 2, ',', '.'))
                 ->line('Il rimborso verrà elaborato entro 5-7 giorni lavorativi e verrà accreditato con la stessa modalità di pagamento utilizzata per l\'acquisto.');
        } elseif ($this->refund->status === 'rejected') {
            $mail->line("**Motivo del Rifiuto:** " . ($this->refund->admin_notes ?? 'Non specificato'));
        }

        if ($this->refund->admin_notes && $this->refund->status !== 'rejected') {
            $mail->line("**Note:** {$this->refund->admin_notes}");
        }

        $mail->action('Visualizza Dettagli', config('app.frontend_url') . '/user/refunds/' . $this->refund->id)
             ->line('Grazie per aver scelto Rustico Calabria.');

        return $mail;
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
            'status' => $this->refund->status,
            'amount' => $this->refund->final_amount ?? $this->refund->amount,
            'admin_notes' => $this->refund->admin_notes,
            'type' => 'refund_processed',
            'title' => $this->getNotificationTitle(),
            'message' => $this->getNotificationMessage(),
        ];
    }

    /**
     * Get status message for email
     */
    private function getStatusMessage(): string
    {
        switch ($this->refund->status) {
            case 'approved':
                return 'La tua richiesta di rimborso è stata approvata ed elaborata con successo!';
            case 'rejected':
                return 'La tua richiesta di rimborso è stata rifiutata.';
            case 'failed':
                return 'Si è verificato un problema durante l\'elaborazione del tuo rimborso. Il nostro team si metterà in contatto con te.';
            default:
                return 'La tua richiesta di rimborso è stata aggiornata.';
        }
    }

    /**
     * Get email subject
     */
    private function getSubject(): string
    {
        switch ($this->refund->status) {
            case 'approved':
                return 'Rimborso Approvato - Rustico Calabria';
            case 'rejected':
                return 'Rimborso Rifiutato - Rustico Calabria';
            case 'failed':
                return 'Problema con il Rimborso - Rustico Calabria';
            default:
                return 'Aggiornamento Rimborso - Rustico Calabria';
        }
    }

    /**
     * Get notification title
     */
    private function getNotificationTitle(): string
    {
        switch ($this->refund->status) {
            case 'approved':
                return 'Rimborso Approvato';
            case 'rejected':
                return 'Rimborso Rifiutato';
            case 'failed':
                return 'Problema con il Rimborso';
            default:
                return 'Aggiornamento Rimborso';
        }
    }

    /**
     * Get notification message
     */
    private function getNotificationMessage(): string
    {
        $amount = $this->refund->final_amount ?? $this->refund->amount;
        $amountFormatted = number_format($amount, 2, ',', '.');

        switch ($this->refund->status) {
            case 'approved':
                return "Il tuo rimborso di €{$amountFormatted} per l'ordine {$this->refund->order->order_number} è stato approvato";
            case 'rejected':
                return "Il tuo rimborso per l'ordine {$this->refund->order->order_number} è stato rifiutato";
            case 'failed':
                return "Si è verificato un problema con il rimborso per l'ordine {$this->refund->order->order_number}";
            default:
                return "Aggiornamento per il rimborso dell'ordine {$this->refund->order->order_number}";
        }
    }
}
