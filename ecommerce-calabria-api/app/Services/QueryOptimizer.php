<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class QueryOptimizer
{
    /**
     * Relazioni da caricare automaticamente per ciascun modello
     */
    protected static $defaultRelations = [
        'App\Models\Product' => ['category'],
        'App\Models\Order' => ['items', 'items.product'],
        'App\Models\OrderItem' => ['product'],
        'App\Models\CartItem' => ['product'],
        'App\Models\Favorite' => ['product'],
    ];

    /**
     * Ottimizza una query applicando eager loading delle relazioni appropriate
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $modelClass Nome completo della classe del modello
     * @param array $additionalRelations Relazioni aggiuntive da caricare
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function optimizeQuery(Builder $query, string $modelClass, array $additionalRelations = []): Builder
    {
        $relations = array_merge(
            static::$defaultRelations[$modelClass] ?? [],
            $additionalRelations
        );

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query;
    }

    /**
     * Ottimizza una collection caricando le relazioni mancanti in batch
     *
     * @param \Illuminate\Support\Collection $collection
     * @param array $relations Relazioni da caricare
     * @return \Illuminate\Support\Collection
     */
    public static function optimizeCollection(Collection $collection, array $relations): Collection
    {
        if ($collection->isEmpty()) {
            return $collection;
        }

        $firstModel = $collection->first();
        $modelClass = get_class($firstModel);

        $relationsToLoad = array_merge(
            static::$defaultRelations[$modelClass] ?? [],
            $relations
        );

        if (!empty($relationsToLoad)) {
            $collection->load($relationsToLoad);
        }

        return $collection;
    }

    /**
     * Ottimizza un singolo modello caricando le relazioni appropriate
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param array $additionalRelations Relazioni aggiuntive da caricare
     * @return \Illuminate\Database\Eloquent\Model
     */
    public static function optimizeModel(Model $model, array $additionalRelations = []): Model
    {
        $modelClass = get_class($model);

        $relations = array_merge(
            static::$defaultRelations[$modelClass] ?? [],
            $additionalRelations
        );

        if (!empty($relations)) {
            $model->load($relations);
        }

        return $model;
    }
}
