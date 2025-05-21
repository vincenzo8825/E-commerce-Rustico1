<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Notifications\OrderStatusChanged;

class OrderController extends Controller
{
    /**
     * Ottieni l'elenco degli ordini con filtri opzionali
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'orderItems.product'])
            ->latest();

        // Filtro per status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filtro per data
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filtro per ID ordine
        if ($request->has('order_id') && $request->order_id) {
            $query->where('id', $request->order_id);
        }

        // Paginazione dei risultati
        $orders = $query->paginate(15);

        return response()->json([
            'orders' => $orders
        ]);
    }

    /**
     * Ottieni dettagli di un singolo ordine
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $order = Order::with(['user', 'orderItems.product'])
            ->findOrFail($id);

        return response()->json([
            'order' => $order
        ]);
    }

    /**
     * Aggiorna lo stato di un ordine
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:in elaborazione,spedito,completato,annullato'
        ]);

        $order = Order::with('user')->findOrFail($id);
        $oldStatus = $order->status;

        // Aggiorna lo stato
        $order->status = $request->status;
        $order->save();

        // Invia notifica all'utente sul cambio di stato
        if ($order->user && $oldStatus != $request->status) {
            $order->user->notify(new OrderStatusChanged($order));
        }

        return response()->json([
            'message' => 'Stato ordine aggiornato con successo',
            'order' => $order
        ]);
    }

    /**
     * Aggiungi una nota interna all'ordine
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function addNote(Request $request, $id)
    {
        $request->validate([
            'note' => 'required|string'
        ]);

        $order = Order::findOrFail($id);
        $order->admin_notes = $request->note;
        $order->save();

        return response()->json([
            'message' => 'Nota aggiunta con successo',
            'order' => $order
        ]);
    }

    /**
     * Ottieni statistiche sugli ordini
     *
     * @return \Illuminate\Http\Response
     */
    public function statistics()
    {
        $totalOrders = Order::count();
        $completedOrders = Order::where('status', 'completato')->count();
        $processingOrders = Order::where('status', 'in elaborazione')->count();
        $shippedOrders = Order::where('status', 'spedito')->count();
        $cancelledOrders = Order::where('status', 'annullato')->count();

        $totalRevenue = Order::where('status', 'completato')->sum('total_price');

        // Ordini degli ultimi 7 giorni
        $recentOrders = Order::where('created_at', '>=', now()->subDays(7))
            ->count();

        return response()->json([
            'statistics' => [
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'processing_orders' => $processingOrders,
                'shipped_orders' => $shippedOrders,
                'cancelled_orders' => $cancelledOrders,
                'total_revenue' => $totalRevenue,
                'recent_orders' => $recentOrders
            ]
        ]);
    }
}
