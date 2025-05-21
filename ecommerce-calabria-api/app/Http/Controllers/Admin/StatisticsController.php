<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    /**
     * Restituisce le statistiche per la dashboard admin
     */
    public function index()
    {
        // Calcola statistiche per gli ordini
        $totalOrders = Order::count();
        $totalRevenue = Order::sum('total');
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Calcola statistiche per i prodotti
        $totalProducts = Product::count();
        $outOfStockProducts = Product::where('stock', '<=', 0)->count();

        // Calcola statistiche per gli utenti
        $totalUsers = User::where('is_admin', false)->count();
        $newUsersThisMonth = User::where('is_admin', false)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        return response()->json([
            'statistics' => [
                'orders' => [
                    'total' => $totalOrders,
                    'revenue' => round($totalRevenue, 2),
                    'average_value' => round($averageOrderValue, 2)
                ],
                'products' => [
                    'total' => $totalProducts,
                    'out_of_stock' => $outOfStockProducts
                ],
                'users' => [
                    'total' => $totalUsers,
                    'new_month' => $newUsersThisMonth
                ]
            ]
        ]);
    }

    /**
     * Ottieni vendite per periodo
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function salesByPeriod(Request $request)
    {
        $request->validate([
            'period' => 'required|string|in:day,week,month,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        $period = $request->period;
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->subMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();

        $format = $this->getDateFormat($period);
        $groupBy = $this->getGroupBy($period);

        $sales = Order::where('status', 'completato')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as date"),
                DB::raw('sum(total_price) as revenue'),
                DB::raw('count(*) as orders')
            )
            ->groupBy(DB::raw($groupBy))
            ->orderBy('date')
            ->get();

        return response()->json([
            'sales' => $sales
        ]);
    }

    /**
     * Restituisce i prodotti più venduti
     */
    public function topProducts(Request $request)
    {
        $limit = $request->input('limit', 5);

        // Otteniamo i prodotti più venduti basandoci sugli ordini
        $topProducts = DB::table('order_items')
            ->select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();

        // Otteniamo i dettagli completi dei prodotti
        $productDetails = [];
        foreach ($topProducts as $topProduct) {
            $product = Product::with('category')->find($topProduct->product_id);
            if ($product) {
                $product->total_sold = $topProduct->total_sold;
                $productDetails[] = $product;
            }
        }

        return response()->json([
            'products' => $productDetails
        ]);
    }

    /**
     * Ottieni le categorie più vendute
     *
     * @return \Illuminate\Http\Response
     */
    public function topCategories()
    {
        $topCategories = OrderItem::select(
                'categories.id as category_id',
                'categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
            )
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereHas('order', function ($query) {
                $query->where('status', 'completato');
            })
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_sold')
            ->get();

        return response()->json([
            'top_categories' => $topCategories
        ]);
    }

    /**
     * Verifica lo stato di admin dell'utente
     */
    public function checkStatus(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'isAdmin' => $user && $user->is_admin
        ]);
    }

    /**
     * Ottiene il formato della data per il raggruppamento
     *
     * @param  string  $period
     * @return string
     */
    private function getDateFormat($period)
    {
        switch ($period) {
            case 'day':
                return '%Y-%m-%d';
            case 'week':
                return '%Y-%u';
            case 'month':
                return '%Y-%m';
            case 'year':
                return '%Y';
            default:
                return '%Y-%m-%d';
        }
    }

    /**
     * Ottiene l'espressione SQL per il raggruppamento
     *
     * @param  string  $period
     * @return string
     */
    private function getGroupBy($period)
    {
        switch ($period) {
            case 'day':
                return "DATE_FORMAT(created_at, '%Y-%m-%d')";
            case 'week':
                return "DATE_FORMAT(created_at, '%Y-%u')";
            case 'month':
                return "DATE_FORMAT(created_at, '%Y-%m')";
            case 'year':
                return "DATE_FORMAT(created_at, '%Y')";
            default:
                return "DATE_FORMAT(created_at, '%Y-%m-%d')";
        }
    }
}
