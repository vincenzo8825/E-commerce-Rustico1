<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Ottieni tutte le notifiche dell'utente autenticato.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user = Auth::user();

        // Ottieni tutte le notifiche dell'utente, con le più recenti in cima
        $notifications = $user->notifications()->latest()->get();

        // Conta le notifiche non lette
        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    /**
     * Segna una notifica come letta.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notifica segnata come letta'
        ]);
    }

    /**
     * Segna tutte le notifiche come lette.
     *
     * @return \Illuminate\Http\Response
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'Tutte le notifiche sono state segnate come lette'
        ]);
    }

    /**
     * Elimina una notifica.
     *
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);
        $notification->delete();

        return response()->json([
            'message' => 'Notifica eliminata con successo'
        ]);
    }

    /**
     * Elimina tutte le notifiche lette più vecchie di una certa data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function deleteOldNotifications(Request $request)
    {
        $user = Auth::user();
        $days = $request->input('days', 30); // Default: elimina notifiche più vecchie di 30 giorni

        $date = Carbon::now()->subDays($days);

        // Elimina solo le notifiche lette che sono più vecchie della data specificata
        $count = $user->readNotifications()
            ->where('created_at', '<', $date)
            ->delete();

        return response()->json([
            'message' => 'Notifiche vecchie eliminate con successo',
            'count' => $count
        ]);
    }
}
