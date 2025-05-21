<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Olio d\'oliva',
                'description' => 'Oli extravergine d\'oliva calabresi, prodotti con olive raccolte a mano e spremute a freddo.',
                'image' => 'categories/olio.jpg',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Formaggi',
                'description' => 'Formaggi tradizionali calabresi, prodotti con latte di alta qualità e metodi artigianali.',
                'image' => 'categories/formaggi.jpg',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Salumi',
                'description' => 'Salumi tipici calabresi, preparati secondo le ricette tradizionali e stagionati naturalmente.',
                'image' => 'categories/salumi.jpg',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Conserve',
                'description' => 'Conserve artigianali calabresi, preparate con ingredienti freschi e ricette tradizionali.',
                'image' => 'categories/conserve.jpg',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Pasta e Riso',
                'description' => 'Pasta artigianale calabrese, prodotta con grani antichi e metodi tradizionali.',
                'image' => 'categories/pasta.jpg',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Dolci e Miele',
                'description' => 'Dolci tipici calabresi e miele di produzione locale.',
                'image' => 'categories/dolci.jpg',
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'name' => 'Liquori e Vini',
                'description' => 'Liquori e vini calabresi, prodotti con metodi tradizionali e ingredienti di alta qualità.',
                'image' => 'categories/liquori.jpg',
                'is_active' => true,
                'sort_order' => 7,
            ],
        ];

        foreach ($categories as $category) {
            $slug = Str::slug($category['name']);
            
            // Check if category already exists
            if (!Category::where('slug', $slug)->exists()) {
                Category::create([
                    'name' => $category['name'],
                    'slug' => $slug,
                    'description' => $category['description'],
                    'image' => $category['image'],
                    'is_active' => $category['is_active'],
                    'sort_order' => $category['sort_order'],
                ]);
            }
        }
    }
}