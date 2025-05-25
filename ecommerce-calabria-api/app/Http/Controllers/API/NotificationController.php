<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Ottieni le notifiche dell'utente
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utente non autenticato'
                ], 401);
            }

            $perPage = $request->get('per_page', 20);
            $onlyUnread = $request->get('unread_only', false);

            $query = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc');

            if ($onlyUnread) {
                $query->whereNull('read_at');
            }

            $notifications = $query->paginate($perPage);
            $unreadCount = Notification::where('user_id', $user->id)
                ->whereNull('read_at')
                ->count();

            return response()->json([
                'success' => true,
                'data' => $notifications->items(),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'total_pages' => $notifications->lastPage(),
                    'total_items' => $notifications->total(),
                    'per_page' => $notifications->perPage()
                ],
                'unread_count' => $unreadCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento notifiche',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Segna una notifica come letta
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::user();

            $notification = Notification::where('user_id', $user->id)
                ->findOrFail($id);

            if (!$notification->read_at) {
                $notification->update(['read_at' => now()]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Notifica segnata come letta',
                'notification' => $notification
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel segnare la notifica come letta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Segna tutte le notifiche come lette
     */
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();

            $updated = Notification::where('user_id', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Tutte le notifiche sono state segnate come lette',
                'updated_count' => $updated
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel segnare le notifiche come lette',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina una notifica
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();

            $notification = Notification::where('user_id', $user->id)
                ->findOrFail($id);
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notifica eliminata'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'eliminazione della notifica',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina le notifiche vecchie (più di 30 giorni)
     */
    public function deleteOldNotifications()
    {
        try {
            $user = Auth::user();

            $deleted = Notification::where('user_id', $user->id)
                ->where('created_at', '<', Carbon::now()->subDays(30))
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notifiche vecchie eliminate',
                'deleted_count' => $deleted
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nell\'eliminazione delle notifiche vecchie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crea una notifica di test (solo per sviluppo)
     */
    public function createTestNotification(Request $request)
    {
        try {
            $user = Auth::user();

            $notification = Notification::create([
                'user_id' => $user->id,
                'type' => 'test',
                'title' => 'Notifica di Test',
                'message' => 'Questa è una notifica di test creata manualmente.',
                'data' => [
                    'title' => 'Notifica di Test',
                    'message' => 'Questa è una notifica di test creata manualmente.',
                    'created_at' => now()->toISOString()
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notifica di test creata',
                'notification' => $notification
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nella creazione della notifica di test',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
