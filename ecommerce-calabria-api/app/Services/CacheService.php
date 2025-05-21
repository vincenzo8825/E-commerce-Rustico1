<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CacheService
{
    /**
     * Durata cache di default in secondi (2 ore)
     */
    const DEFAULT_DURATION = 7200;

    /**
     * Gruppi di cache predefiniti
     */
    const CACHE_GROUPS = [
        'products' => ['product_*', 'products_*', 'featured_products', 'new_products', 'search_*', 'suggestions_*'],
        'categories' => ['public_categories', 'public_category_*', 'categories_admin_*'],
        'filters' => ['available_filters'],
        'stats' => ['stats_*', 'dashboard_*'],
        'user' => ['user_*', 'favorites_*', 'cart_*'],
    ];

    /**
     * Ottiene un elemento dalla cache o lo calcola se non esiste
     *
     * @param string $key Chiave cache
     * @param int $duration Durata in secondi
     * @param callable $callback Funzione da eseguire se la cache non esiste
     * @return mixed
     */
    public static function remember(string $key, int $duration, callable $callback)
    {
        return Cache::remember($key, $duration, $callback);
    }

    /**
     * Ottiene un elemento dalla cache o lo calcola se non esiste (default 2 ore)
     *
     * @param string $key Chiave cache
     * @param callable $callback Funzione da eseguire se la cache non esiste
     * @return mixed
     */
    public static function rememberDefault(string $key, callable $callback)
    {
        return static::remember($key, self::DEFAULT_DURATION, $callback);
    }

    /**
     * Invalida la cache per un modello specifico
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return void
     */
    public static function invalidateModel(Model $model)
    {
        $modelName = Str::lower(class_basename($model));

        // Invalida cache specifica per questo modello
        Cache::forget("{$modelName}_{$model->id}");

        if (method_exists($model, 'getSlug') && $model->getSlug()) {
            Cache::forget("{$modelName}_{$model->getSlug()}");
        } elseif (isset($model->slug)) {
            Cache::forget("{$modelName}_{$model->slug}");
        }

        // Invalida gruppi di cache correlati
        static::invalidateGroup($modelName);
    }

    /**
     * Invalida un gruppo di cache
     *
     * @param string $group Nome del gruppo (products, categories, ecc.)
     * @return void
     */
    public static function invalidateGroup(string $group)
    {
        if (isset(self::CACHE_GROUPS[$group])) {
            foreach (self::CACHE_GROUPS[$group] as $pattern) {
                Cache::deleteMultiple(static::getKeysByPattern($pattern));
            }
        }
    }

    /**
     * Invalida tutta la cache dell'applicazione
     *
     * @return void
     */
    public static function invalidateAll()
    {
        foreach (self::CACHE_GROUPS as $group => $patterns) {
            static::invalidateGroup($group);
        }
    }

    /**
     * Ottiene tutte le chiavi di cache che corrispondono a un pattern
     *
     * @param string $pattern Pattern con wildcard (*)
     * @return array
     */
    protected static function getKeysByPattern(string $pattern)
    {
        // Implementazione semplificata: per supportare tutti i driver di cache
        // sarebbe necessario una implementazione più complessa specifca per driver
        if (Str::endsWith($pattern, '*')) {
            $prefix = Str::beforeLast($pattern, '*');
            $keys = [];

            // Questa è una simulazione - in produzione andrebbe usato il metodo
            // specifico del driver di cache per ottenere tutte le chiavi
            // Ad esempio con Redis sarebbe possibile usare KEYS pattern

            return $keys;
        }

        return [$pattern];
    }
}
