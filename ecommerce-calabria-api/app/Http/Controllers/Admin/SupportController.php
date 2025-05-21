<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportController extends Controller
{
    /**
     * Ottieni tutti i ticket di supporto con filtri opzionali
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'supportMessages'])
            ->latest();

        // Filtro per stato
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filtro per utente
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Filtro per ordine
        if ($request->has('order_id') && $request->order_id) {
            $query->where('order_id', $request->order_id);
        }

        // Paginazione dei risultati
        $tickets = $query->paginate(15);

        return response()->json([
            'tickets' => $tickets
        ]);
    }

    /**
     * Ottieni dettagli di un singolo ticket
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $ticket = SupportTicket::with(['user', 'supportMessages.user', 'order'])
            ->findOrFail($id);

        return response()->json([
            'ticket' => $ticket
        ]);
    }

    /**
     * Aggiungi un messaggio a un ticket
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function addMessage(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $ticket = SupportTicket::findOrFail($id);

        // Aggiorna lo stato del ticket a "in lavorazione" se era "aperto"
        if ($ticket->status === 'aperto') {
            $ticket->status = 'in lavorazione';
            $ticket->save();
        }

        // Crea il messaggio dall'admin
        $message = new SupportMessage([
            'user_id' => Auth::id(),
            'message' => $request->message,
            'is_from_admin' => true
        ]);

        $ticket->supportMessages()->save($message);

        return response()->json([
            'message' => 'Risposta inviata con successo',
            'support_message' => $message->load('user')
        ]);
    }

    /**
     * Aggiorna lo stato di un ticket
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:aperto,in lavorazione,chiuso'
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->status = $request->status;
        $ticket->save();

        return response()->json([
            'message' => 'Stato ticket aggiornato con successo',
            'ticket' => $ticket
        ]);
    }

    /**
     * Ottieni statistiche dei ticket di supporto
     *
     * @return \Illuminate\Http\Response
     */
    public function statistics()
    {
        $totalTickets = SupportTicket::count();
        $openTickets = SupportTicket::where('status', 'aperto')->count();
        $inProgressTickets = SupportTicket::where('status', 'in lavorazione')->count();
        $closedTickets = SupportTicket::where('status', 'chiuso')->count();

        // Ticket degli ultimi 7 giorni
        $recentTickets = SupportTicket::where('created_at', '>=', now()->subDays(7))
            ->count();

        // Tempo medio di risposta (in ore)
        $averageResponseTime = 0;
        $tickets = SupportTicket::with('supportMessages')
            ->where('status', '!=', 'aperto')
            ->get();

        if ($tickets->count() > 0) {
            $totalResponseTime = 0;
            $ticketsWithResponse = 0;

            foreach ($tickets as $ticket) {
                if ($ticket->supportMessages->count() > 1) {
                    $firstMessage = $ticket->supportMessages->sortBy('created_at')->first();
                    $adminResponse = $ticket->supportMessages->where('is_from_admin', true)->sortBy('created_at')->first();

                    if ($adminResponse) {
                        $responseTime = $adminResponse->created_at->diffInHours($firstMessage->created_at);
                        $totalResponseTime += $responseTime;
                        $ticketsWithResponse++;
                    }
                }
            }

            if ($ticketsWithResponse > 0) {
                $averageResponseTime = round($totalResponseTime / $ticketsWithResponse, 1);
            }
        }

        return response()->json([
            'statistics' => [
                'total_tickets' => $totalTickets,
                'open_tickets' => $openTickets,
                'in_progress_tickets' => $inProgressTickets,
                'closed_tickets' => $closedTickets,
                'recent_tickets' => $recentTickets,
                'average_response_time' => $averageResponseTime
            ]
        ]);
    }
}
