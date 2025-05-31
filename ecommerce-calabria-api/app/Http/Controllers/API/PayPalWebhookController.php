<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Order;

class PayPalWebhookController extends Controller
{
    /**
     * Gestisce i webhook di PayPal
     */
    public function handle(Request $request)
    {
        $payload = $request->all();

        Log::info('PayPal Webhook ricevuto', [
            'event_type' => $payload['event_type'] ?? 'sconosciuto',
            'summary' => $payload['summary'] ?? 'N/A'
        ]);

        try {
            // TODO: Implementare verifica firma PayPal in produzione
            // $this->verifyWebhookSignature($request);

            $eventType = $payload['event_type'] ?? null;

            // Gestisci diversi tipi di eventi PayPal
            switch ($eventType) {
                case 'CHECKOUT.ORDER.APPROVED':
                    $this->handleOrderApproved($payload);
                    break;

                case 'PAYMENT.CAPTURE.COMPLETED':
                    $this->handlePaymentCaptureCompleted($payload);
                    break;

                case 'PAYMENT.CAPTURE.DENIED':
                case 'PAYMENT.CAPTURE.FAILED':
                    $this->handlePaymentCaptureFailed($payload);
                    break;

                case 'PAYMENT.CAPTURE.REFUNDED':
                    $this->handlePaymentCaptureRefunded($payload);
                    break;

                case 'BILLING.SUBSCRIPTION.ACTIVATED':
                    $this->handleSubscriptionActivated($payload);
                    break;

                case 'BILLING.SUBSCRIPTION.CANCELLED':
                    $this->handleSubscriptionCancelled($payload);
                    break;

                default:
                    Log::info('PayPal: Evento webhook non gestito', [
                        'event_type' => $eventType
                    ]);
            }

            return response('Webhook PayPal gestito con successo', 200);

        } catch (\Exception $e) {
            Log::error('PayPal: Errore elaborazione webhook', [
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);

            return response('Errore elaborazione webhook', 500);
        }
    }

    /**
     * Gestisce l'approvazione dell'ordine PayPal
     */
    private function handleOrderApproved($payload)
    {
        $resource = $payload['resource'] ?? [];
        $orderId = $resource['id'] ?? null;

        if (!$orderId) {
            Log::warning('PayPal: Order ID mancante nel webhook CHECKOUT.ORDER.APPROVED');
            return;
        }

        Log::info('PayPal: Ordine approvato', [
            'paypal_order_id' => $orderId,
            'status' => $resource['status'] ?? 'N/A'
        ]);

        // L'ordine è stato approvato ma non ancora catturato
        // La cattura avverrà quando l'utente completerà il processo
    }

    /**
     * Gestisce il completamento della cattura del pagamento
     */
    private function handlePaymentCaptureCompleted($payload)
    {
        $resource = $payload['resource'] ?? [];
        $captureId = $resource['id'] ?? null;

        // Estrai l'order ID dalla struttura PayPal
        $orderId = null;
        if (isset($resource['supplementary_data']['related_ids']['order_id'])) {
            $orderId = $resource['supplementary_data']['related_ids']['order_id'];
        } elseif (isset($resource['custom_id'])) {
            // Se abbiamo salvato l'order ID come custom_id
            $orderId = $resource['custom_id'];
        }

        if (!$orderId) {
            Log::warning('PayPal: Order ID non trovato nel webhook PAYMENT.CAPTURE.COMPLETED');
            return;
        }

        Log::info('PayPal: Pagamento catturato completato', [
            'capture_id' => $captureId,
            'paypal_order_id' => $orderId,
            'amount' => $resource['amount']['value'] ?? 'N/A'
        ]);

        // Trova l'ordine nel database
        $order = Order::where('payment_id', $orderId)
                     ->where('payment_method', 'paypal')
                     ->first();

        if ($order) {
            $order->update([
                'is_paid' => true,
                'paid_at' => now(),
                'status' => 'in elaborazione'
            ]);

            Log::info('PayPal: Ordine confermato via webhook', [
                'order_id' => $order->id,
                'paypal_order_id' => $orderId
            ]);

            // Qui puoi aggiungere logica per notifiche, email, etc.
        } else {
            Log::warning('PayPal: Ordine locale non trovato', [
                'paypal_order_id' => $orderId
            ]);
        }
    }

    /**
     * Gestisce il fallimento della cattura del pagamento
     */
    private function handlePaymentCaptureFailed($payload)
    {
        $resource = $payload['resource'] ?? [];
        $captureId = $resource['id'] ?? null;

        Log::warning('PayPal: Cattura pagamento fallita', [
            'capture_id' => $captureId,
            'reason' => $resource['status_details']['reason'] ?? 'Sconosciuto'
        ]);

        // Implementa logica per gestire pagamenti falliti
        // Ad esempio, aggiornare lo stato dell'ordine
    }

    /**
     * Gestisce i rimborsi PayPal
     */
    private function handlePaymentCaptureRefunded($payload)
    {
        $resource = $payload['resource'] ?? [];
        $refundId = $resource['id'] ?? null;

        Log::info('PayPal: Rimborso processato', [
            'refund_id' => $refundId,
            'amount' => $resource['amount']['value'] ?? 'N/A',
            'status' => $resource['status'] ?? 'N/A'
        ]);

        // Implementa logica per gestire rimborsi
        // Ad esempio, aggiornare database rimborsi
    }

    /**
     * Gestisce attivazione abbonamenti
     */
    private function handleSubscriptionActivated($payload)
    {
        $resource = $payload['resource'] ?? [];
        $subscriptionId = $resource['id'] ?? null;

        Log::info('PayPal: Abbonamento attivato', [
            'subscription_id' => $subscriptionId,
            'status' => $resource['status'] ?? 'N/A'
        ]);

        // Implementa logica per abbonamenti se necessario
    }

    /**
     * Gestisce cancellazione abbonamenti
     */
    private function handleSubscriptionCancelled($payload)
    {
        $resource = $payload['resource'] ?? [];
        $subscriptionId = $resource['id'] ?? null;

        Log::info('PayPal: Abbonamento cancellato', [
            'subscription_id' => $subscriptionId,
            'reason' => $resource['status_change_note'] ?? 'Nessuna nota'
        ]);

        // Implementa logica per cancellazione abbonamenti
    }

    /**
     * Verifica la firma del webhook PayPal
     * TODO: Implementare in produzione
     */
    private function verifyWebhookSignature(Request $request)
    {
        // In produzione, implementare verifica firma PayPal
        // usando il webhook ID e il certificato PayPal

        $headers = $request->headers->all();
        $expectedHeaders = [
            'paypal-transmission-id',
            'paypal-cert-id',
            'paypal-transmission-sig',
            'paypal-transmission-time'
        ];

        foreach ($expectedHeaders as $header) {
            if (!$request->header($header)) {
                throw new \Exception("Header PayPal mancante: {$header}");
            }
        }

        // Qui implementare la vera verifica usando PayPal SDK
        // return $this->validateWebhookSignature($request);
    }
}
