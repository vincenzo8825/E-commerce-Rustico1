<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Order;

class StripeWebhookController extends Controller
{
    /**
     * Gestisce i webhook di Stripe
     */
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        if (!$endpointSecret) {
            Log::error('Stripe: Webhook secret non configurato');
            return response('Webhook secret non configurato', 400);
        }

        try {
            // Verifica la firma del webhook
            $event = \Stripe\Webhook::constructEvent($payload, $signature, $endpointSecret);

            Log::info('Stripe Webhook ricevuto', [
                'type' => $event['type'],
                'id' => $event['id']
            ]);

            // Gestisci diversi tipi di eventi
            switch ($event['type']) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event['data']['object']);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event['data']['object']);
                    break;

                case 'charge.dispute.created':
                    $this->handleChargeDispute($event['data']['object']);
                    break;

                case 'charge.refunded':
                    $this->handleChargeRefunded($event['data']['object']);
                    break;

                case 'invoice.payment_succeeded':
                    $this->handleInvoicePaymentSucceeded($event['data']['object']);
                    break;

                default:
                    Log::info('Stripe: Evento non gestito', ['type' => $event['type']]);
            }

            return response('Webhook gestito con successo', 200);

        } catch (\UnexpectedValueException $e) {
            Log::error('Stripe: Payload webhook non valido', ['error' => $e->getMessage()]);
            return response('Payload non valido', 400);

        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Stripe: Firma webhook non valida', ['error' => $e->getMessage()]);
            return response('Firma non valida', 400);

        } catch (\Exception $e) {
            Log::error('Stripe: Errore elaborazione webhook', ['error' => $e->getMessage()]);
            return response('Errore interno', 500);
        }
    }

    /**
     * Gestisce il pagamento riuscito
     */
    private function handlePaymentIntentSucceeded($paymentIntent)
    {
        $paymentIntentId = $paymentIntent['id'];

        // Trova l'ordine correlato
        $order = Order::where('payment_id', $paymentIntentId)
                     ->where('payment_method', 'carta')
                     ->first();

        if ($order) {
            $order->update([
                'is_paid' => true,
                'paid_at' => now(),
                'status' => 'in elaborazione'
            ]);

            Log::info('Stripe: Pagamento confermato via webhook', [
                'payment_intent_id' => $paymentIntentId,
                'order_id' => $order->id
            ]);

            // Qui puoi aggiungere logica per notifiche, email, etc.
        } else {
            Log::warning('Stripe: Ordine non trovato per PaymentIntent', [
                'payment_intent_id' => $paymentIntentId
            ]);
        }
    }

    /**
     * Gestisce il pagamento fallito
     */
    private function handlePaymentIntentFailed($paymentIntent)
    {
        $paymentIntentId = $paymentIntent['id'];

        Log::warning('Stripe: Pagamento fallito', [
            'payment_intent_id' => $paymentIntentId,
            'failure_reason' => $paymentIntent['last_payment_error']['message'] ?? 'Sconosciuto'
        ]);

        // Trova l'ordine e aggiorna lo stato
        $order = Order::where('payment_id', $paymentIntentId)
                     ->where('payment_method', 'carta')
                     ->first();

        if ($order) {
            $order->update([
                'status' => 'pagamento_fallito',
                'is_paid' => false
            ]);

            Log::info('Stripe: Ordine aggiornato per pagamento fallito', [
                'order_id' => $order->id
            ]);
        }
    }

    /**
     * Gestisce le dispute/chargeback
     */
    private function handleChargeDispute($dispute)
    {
        Log::warning('Stripe: Dispute creata', [
            'dispute_id' => $dispute['id'],
            'charge_id' => $dispute['charge'],
            'amount' => $dispute['amount'],
            'reason' => $dispute['reason']
        ]);

        // Qui puoi implementare logica per gestire le dispute
        // Ad esempio, inviare notifiche agli admin
    }

    /**
     * Gestisce i pagamenti di fatture riusciti
     */
    private function handleInvoicePaymentSucceeded($invoice)
    {
        Log::info('Stripe: Pagamento fattura riuscito', [
            'invoice_id' => $invoice['id'],
            'customer_id' => $invoice['customer']
        ]);

        // Logica per abbonamenti o fatturazioni ricorrenti
    }

    /**
     * Gestisce i rimborsi di Stripe
     */
    private function handleChargeRefunded($charge)
    {
        Log::info('Stripe: Rimborso confermato via webhook', [
            'charge_id' => $charge['id'],
            'amount_refunded' => $charge['amount_refunded'],
            'refunded' => $charge['refunded']
        ]);

        // Trova l'ordine tramite il payment_intent_id
        $paymentIntentId = $charge['payment_intent'] ?? null;

        if ($paymentIntentId) {
            $order = Order::where('payment_id', $paymentIntentId)
                         ->where('payment_method', 'carta')
                         ->first();

            if ($order) {
                // Trova il rimborso in elaborazione per questo ordine
                $refund = \App\Models\Refund::where('order_id', $order->id)
                                           ->where('status', 'processing')
                                           ->first();

                if ($refund) {
                    // Aggiorna lo stato del rimborso a completato
                    $refund->update([
                        'status' => 'approved',
                        'processed_at' => now(),
                        'admin_notes' => ($refund->admin_notes ?? '') . ' - Confermato via webhook Stripe'
                    ]);

                    Log::info('Stripe: Rimborso aggiornato via webhook', [
                        'refund_id' => $refund->id,
                        'order_id' => $order->id
                    ]);
                }
            }
        }
    }
}
