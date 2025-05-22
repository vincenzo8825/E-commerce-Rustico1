<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('it_IT');

        // Nomi e cognomi italiani comuni
        $names = [
            'Marco', 'Giuseppe', 'Antonio', 'Giovanni', 'Francesco',
            'Luigi', 'Roberto', 'Salvatore', 'Andrea', 'Alessandro',
            'Maria', 'Anna', 'Giovanna', 'Rosa', 'Laura',
            'Francesca', 'Lucia', 'Angela', 'Carmela', 'Sofia'
        ];

        $surnames = [
            'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi',
            'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
            'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa',
            'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti'
        ];

        // Città italiane
        $cities = [
            'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo',
            'Cosenza', 'Catanzaro', 'Reggio Calabria', 'Vibo Valentia', 'Crotone',
            'Bologna', 'Firenze', 'Bari', 'Catania', 'Genova',
            'Messina', 'Verona', 'Padova', 'Taranto', 'Brescia'
        ];

        // CAP corrispondenti alle città
        $postalCodes = [
            '00100', '20100', '80100', '10100', '90100',
            '87100', '88100', '89100', '89900', '88900',
            '40100', '50100', '70100', '95100', '16100',
            '98100', '37100', '35100', '74100', '25100'
        ];

        // Generiamo utenti distribuiti in vari giorni degli ultimi 6 mesi
        for ($i = 0; $i < 20; $i++) {
            $cityIndex = array_rand($cities);
            $daysAgo = rand(0, 180);
            $createdAt = Carbon::now()->subDays($daysAgo)->addHours(rand(0, 23))->addMinutes(rand(0, 59));

            // Email basata sul nome e cognome
            $name = $names[array_rand($names)];
            $surname = $surnames[array_rand($surnames)];
            $emailBase = strtolower($name . '.' . $surname);

            // Aggiungi un numero casuale se necessario per rendere l'email unica
            $email = $emailBase . '@example.com';
            if (User::where('email', $email)->exists()) {
                $email = $emailBase . rand(1, 99) . '@example.com';
            }

            User::create([
                'name' => $name,
                'surname' => $surname,
                'email' => $email,
                'password' => Hash::make('password'), // Password standard per tutti gli utenti di test
                'address' => 'Via ' . $faker->lastName . ' ' . rand(1, 100),
                'city' => $cities[$cityIndex],
                'postal_code' => $postalCodes[$cityIndex],
                'phone' => '3' . rand(300000000, 399999999),
                'is_admin' => false,
                'email_verified_at' => rand(0, 5) > 0 ? $createdAt : null, // 80% degli utenti hanno l'email verificata
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        // Creiamo anche alcuni utenti con attributi specifici
        $specificUsers = [
            [
                'name' => 'Mario',
                'surname' => 'Rossi',
                'email' => 'mario.rossi@example.com',
                'address' => 'Via Roma 123',
                'city' => 'Cosenza',
                'postal_code' => '87100',
                'phone' => '3341234567',
            ],
            [
                'name' => 'Giulia',
                'surname' => 'Bianchi',
                'email' => 'giulia.bianchi@example.com',
                'address' => 'Via Garibaldi 45',
                'city' => 'Reggio Calabria',
                'postal_code' => '89100',
                'phone' => '3357654321',
            ],
            [
                'name' => 'Antonio',
                'surname' => 'Ferrara',
                'email' => 'antonio.ferrara@example.com',
                'address' => 'Via Mazzini 78',
                'city' => 'Catanzaro',
                'postal_code' => '88100',
                'phone' => '3392223333',
            ]
        ];

        foreach ($specificUsers as $userData) {
            // Salta se esiste già
            if (User::where('email', $userData['email'])->exists()) {
                continue;
            }

            $createdAt = Carbon::now()->subDays(rand(10, 30));

            User::create([
                'name' => $userData['name'],
                'surname' => $userData['surname'],
                'email' => $userData['email'],
                'password' => Hash::make('password'),
                'address' => $userData['address'],
                'city' => $userData['city'],
                'postal_code' => $userData['postal_code'],
                'phone' => $userData['phone'],
                'is_admin' => false,
                'email_verified_at' => $createdAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $this->command->info('Creati ' . (20 + count($specificUsers)) . ' utenti normali');
    }
}
