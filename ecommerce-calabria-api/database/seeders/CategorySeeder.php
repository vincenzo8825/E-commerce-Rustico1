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
                'name' => 'Salumi Calabresi',
                'description' => 'La tradizione norcina calabrese è ricca di prodotti unici, dalla Nduja al Capicollo, che raccontano la storia e la cultura di questo territorio.',
                'is_active' => true,
            ],
            [
                'name' => 'Formaggi Tipici',
                'description' => 'I formaggi calabresi sono il risultato di antiche tradizioni casearie, con prodotti come il Caciocavallo Silano DOP e il Pecorino del Monte Poro.',
                'is_active' => true,
            ],
            [
                'name' => 'Olio d\'Oliva',
                'description' => 'L\'olio extravergine d\'oliva calabrese è conosciuto per la sua qualità superiore, derivante da varietà autoctone come la Carolea e l\'Ottobratica.',
                'is_active' => true,
            ],
            [
                'name' => 'Conserve e Sottoli',
                'description' => 'Le conserve calabresi racchiudono i sapori intensi del territorio, dai peperoncini ripieni alle melanzane sott\'olio.',
                'is_active' => true,
            ],
            [
                'name' => 'Vini e Liquori',
                'description' => 'La Calabria vanta una tradizione vinicola millenaria, con vini DOC come il Cirò e liquori artigianali a base di erbe locali.',
                'is_active' => true,
            ],
            [
                'name' => 'Dolci Tipici',
                'description' => 'I dolci calabresi riflettono influenze greche, arabe e spagnole, con preparazioni a base di miele, frutta secca e agrumi.',
                'is_active' => true,
            ],
            [
                'name' => 'Pasta Artigianale',
                'description' => 'La pasta calabrese si caratterizza per formati unici come la Fileja e i Fusilli ferrati, spesso realizzati a mano secondo tradizione.',
                'is_active' => true,
            ],
            [
                'name' => 'Prodotti al Bergamotto',
                'description' => 'Il bergamotto, agrume coltivato quasi esclusivamente nella provincia di Reggio Calabria, è alla base di numerose specialità gastronomiche.',
                'is_active' => true,
            ],
            [
                'name' => 'Legumi e Cereali',
                'description' => 'I legumi calabresi, come la lenticchia di Mormanno e i fagioli di Cortale, sono prodotti di eccellenza della biodiversità regionale.',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::create([
                'name' => $categoryData['name'],
                'slug' => Str::slug($categoryData['name']),
                'description' => $categoryData['description'],
                'is_active' => $categoryData['is_active'],
            ]);
        }

        $this->command->info('Create ' . count($categories) . ' categorie');
    }
}
