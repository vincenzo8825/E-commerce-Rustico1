<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class FeaturedCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prima resetta tutte le categorie
        Category::query()->update(['is_featured' => false]);

        // Ottieni tutte le categorie attive
        $categories = Category::where('is_active', true)->orderBy('id')->get();

        if ($categories->count() >= 4) {
            // Se ci sono almeno 4 categorie, imposta le prime 4
            $categories->take(4)->each(function ($category) {
                $category->update(['is_featured' => true]);
            });
        } else {
            // Se ci sono meno di 4 categorie, impostale tutte come featured
            $categories->each(function ($category) {
                $category->update(['is_featured' => true]);
            });
        }

        echo "Categorie in evidenza impostate:\n";
        $featured = Category::where('is_featured', true)->get();
        foreach ($featured as $category) {
            echo "- {$category->name}\n";
        }
    }
}
