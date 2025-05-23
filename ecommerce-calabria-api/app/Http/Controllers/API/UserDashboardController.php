<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use App\Models\Favorite;
use App\Models\SupportTicket;
use App\Notifications\SupportTicketCreated;
use App\Notifications\SupportTicketUserReply;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

class UserDashboardController extends Controller
{
    /**
     * Ottieni i dati del profilo utente.
     */
    public function getProfile()
    {
        $user = Auth::user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'address' => $user->address,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'phone' => $user->phone,
                'email_verified_at' => $user->email_verified_at
            ]
        ]);
    }

    /**
     * Aggiorna i dati del profilo utente.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profilo aggiornato con successo',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'address' => $user->address,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'phone' => $user->phone
            ]
        ]);
    }

    /**
     * Aggiorna la password dell'utente.
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Verifica la password attuale
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La password attuale non è corretta.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password aggiornata con successo'
        ]);
    }

    /**
     * Ottieni gli ordini dell'utente.
     */
    public function getOrders()
    {
        $user = Auth::user();
        $orders = $user->orders()->with('orderItems.product')->latest()->get();

        return response()->json([
            'orders' => $orders
        ]);
    }

    /**
     * Ottieni un singolo ordine.
     */
    public function getOrder($id)
    {
        $user = Auth::user();
        $order = $user->orders()->with('orderItems.product')->findOrFail($id);

        return response()->json([
            'order' => $order
        ]);
    }

    /**
     * Ottieni i prodotti preferiti dell'utente.
     */
    public function getFavorites()
    {
        $user = Auth::user();
        $favorites = $user->favorites()->with('product')->get();

        return response()->json([
            'favorites' => $favorites
        ]);
    }

    /**
     * Rimuovi un prodotto dai preferiti.
     */
    public function removeFavorite($id)
    {
        $user = Auth::user();
        $favorite = $user->favorites()->where('product_id', $id)->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json([
                'message' => 'Prodotto rimosso dai preferiti'
            ]);
        }

        return response()->json([
            'message' => 'Prodotto non trovato nei preferiti'
        ], 404);
    }

    /**
     * Ottieni i ticket di supporto dell'utente.
     */
    public function getSupportTickets()
    {
        $user = Auth::user();
        $tickets = $user->supportTickets()->with('messages')->latest()->get();

        return response()->json([
            'tickets' => $tickets
        ]);
    }

    /**
     * Ottieni un singolo ticket di supporto dell'utente.
     */
    public function getSupportTicket($id)
    {
        $user = Auth::user();
        $ticket = $user->supportTickets()->with(['messages.user', 'order'])->findOrFail($id);

        return response()->json([
            'ticket' => $ticket
        ]);
    }

    /**
     * Crea un nuovo ticket di supporto.
     */
    public function createSupportTicket(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'order_id' => 'nullable|exists:orders,id'
        ]);

        // Genera un numero di ticket unico
        $ticketNumber = 'TIC-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 5));

        $ticket = $user->supportTickets()->create([
            'ticket_number' => $ticketNumber,
            'subject' => $validated['subject'],
            'status' => 'open',
            'order_id' => $validated['order_id'] ?? null
        ]);

        $ticket->messages()->create([
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_from_admin' => false
        ]);

        // Invia notifica a tutti gli admin
        $admins = User::where('is_admin', true)->get();
        Notification::send($admins, new SupportTicketCreated($ticket->load('user')));

        return response()->json([
            'message' => 'Ticket di supporto creato con successo',
            'ticket' => $ticket->load('messages')
        ], 201);
    }

    /**
     * Aggiungi un messaggio a un ticket di supporto.
     */
    public function addMessageToTicket(Request $request, $id)
    {
        $user = Auth::user();

        $ticket = $user->supportTickets()->findOrFail($id);

        if ($ticket->status === 'closed') {
            return response()->json([
                'message' => 'Non puoi aggiungere messaggi a un ticket chiuso'
            ], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string'
        ]);

        $message = $ticket->messages()->create([
            'user_id' => $user->id,
            'message' => $validated['message'],
            'is_from_admin' => false
        ]);

        // Invia notifica agli admin per la nuova risposta dell'utente
        $admins = User::where('is_admin', true)->get();
        Notification::send($admins, new SupportTicketUserReply($ticket->load('user')));

        return response()->json([
            'message' => 'Messaggio aggiunto con successo',
            'new_message' => $message
        ], 201);
    }
}
