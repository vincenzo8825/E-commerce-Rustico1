<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;

class HealthController extends Controller
{
    /**
     * Health check completo del sistema
     */
    public function check()
    {
        $status = 'healthy';
        $checks = [];

        // Test connessione database
        try {
            DB::connection()->getPdo();
            $checks['database'] = [
                'status' => 'ok',
                'message' => 'Connessione database attiva'
            ];
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['database'] = [
                'status' => 'error',
                'message' => 'Errore connessione database: ' . $e->getMessage()
            ];
        }

        // Test cache
        try {
            Cache::put('health_check', 'test', 10);
            $cached = Cache::get('health_check');
            if ($cached === 'test') {
                $checks['cache'] = [
                    'status' => 'ok',
                    'message' => 'Sistema cache funzionante'
                ];
            } else {
                throw new \Exception('Cache non funziona correttamente');
            }
        } catch (\Exception $e) {
            $status = 'degraded';
            $checks['cache'] = [
                'status' => 'warning',
                'message' => 'Problemi cache: ' . $e->getMessage()
            ];
        }

        // Test modelli principali
        try {
            $userCount = User::count();
            $productCount = Product::count();
            $orderCount = Order::count();

            $checks['models'] = [
                'status' => 'ok',
                'message' => 'Modelli funzionanti',
                'data' => [
                    'users' => $userCount,
                    'products' => $productCount,
                    'orders' => $orderCount
                ]
            ];
        } catch (\Exception $e) {
            $status = 'unhealthy';
            $checks['models'] = [
                'status' => 'error',
                'message' => 'Errore modelli: ' . $e->getMessage()
            ];
        }

        // Test spazio su disco
        $diskSpace = disk_free_space('/');
        $totalSpace = disk_total_space('/');
        $usedPercentage = (($totalSpace - $diskSpace) / $totalSpace) * 100;

        if ($usedPercentage > 90) {
            $status = 'warning';
            $checks['disk'] = [
                'status' => 'warning',
                'message' => 'Spazio su disco quasi esaurito'
            ];
        } else {
            $checks['disk'] = [
                'status' => 'ok',
                'message' => 'Spazio su disco disponibile',
                'used_percentage' => round($usedPercentage, 2)
            ];
        }

        // Test memoria
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = ini_get('memory_limit');
        $memoryLimitBytes = $this->convertToBytes($memoryLimit);
        $memoryPercentage = ($memoryUsage / $memoryLimitBytes) * 100;

        $checks['memory'] = [
            'status' => $memoryPercentage > 80 ? 'warning' : 'ok',
            'message' => 'Utilizzo memoria: ' . round($memoryPercentage, 2) . '%',
            'usage_mb' => round($memoryUsage / 1024 / 1024, 2),
            'limit' => $memoryLimit
        ];

        return response()->json([
            'status' => $status,
            'timestamp' => now()->toISOString(),
            'checks' => $checks,
            'system_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_time' => now()->toDateTimeString(),
                'timezone' => config('app.timezone')
            ]
        ]);
    }

    /**
     * Statistiche dettagliate del sistema
     */
    public function stats()
    {
        try {
            // Statistiche database
            $dbStats = [
                'users_total' => User::count(),
                'users_verified' => User::whereNotNull('email_verified_at')->count(),
                'users_admin' => User::where('is_admin', true)->count(),
                'products_total' => Product::count(),
                'products_active' => Product::where('is_active', true)->count(),
                'products_low_stock' => Product::where('stock_quantity', '<=', 10)->count(),
                'orders_total' => Order::count(),
                'orders_pending' => Order::where('status', 'pending')->count(),
                'orders_completed' => Order::where('status', 'delivered')->count()
            ];

            // Statistiche performance
            $perfStats = [
                'response_time_avg' => $this->getAverageResponseTime(),
                'database_queries' => DB::getQueryLog(),
                'memory_usage' => [
                    'current' => round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB',
                    'peak' => round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB'
                ]
            ];

            // Statistiche cache
            $cacheStats = [
                'cache_hits' => Cache::has('cache_hits') ? Cache::get('cache_hits') : 0,
                'cache_misses' => Cache::has('cache_misses') ? Cache::get('cache_misses') : 0
            ];

            return response()->json([
                'success' => true,
                'stats' => [
                    'database' => $dbStats,
                    'performance' => $perfStats,
                    'cache' => $cacheStats
                ],
                'generated_at' => now()->toDateTimeString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel recupero statistiche',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset dei dati di test (solo in sviluppo)
     */
    public function resetTestData()
    {
        if (app()->environment('production')) {
            return response()->json([
                'success' => false,
                'message' => 'Operazione non consentita in produzione'
            ], 403);
        }

        try {
            // Pulisci cache
            Cache::flush();

            // Reset contatori test
            Cache::put('cache_hits', 0);
            Cache::put('cache_misses', 0);

            return response()->json([
                'success' => true,
                'message' => 'Dati di test resettati'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel reset',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Converte stringa memoria in bytes
     */
    private function convertToBytes($val)
    {
        $val = trim($val);
        $last = strtolower($val[strlen($val)-1]);
        $val = (int) $val;

        switch($last) {
            case 'g':
                $val *= 1024;
            case 'm':
                $val *= 1024;
            case 'k':
                $val *= 1024;
        }

        return $val;
    }

    /**
     * Calcola tempo medio di risposta (simulato)
     */
    private function getAverageResponseTime()
    {
        // In un sistema reale, questo dovrebbe essere calcolato dai log
        return rand(50, 200) . ' ms';
    }
}
