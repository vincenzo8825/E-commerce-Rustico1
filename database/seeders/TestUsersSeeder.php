<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run()
    {
        // Utente normale di test
        $testUser = User::firstOrCreate(
            ['email' => 'prova@red.it'],
            [
                'name' => 'Mario',
                'surname' => 'Test',
                'email' => 'prova@red.it',
                'password' => Hash::make('password'),
                'is_admin' => false,
                'email_verified_at' => now()
            ]
        );

        // Admin di test
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.it'],
            [
                'name' => 'Admin',
                'surname' => 'Test',
                'email' => 'admin@example.it',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'email_verified_at' => now()
            ]
        );

        echo "Utenti di test creati:\n";
        echo "- prova@red.it (ID: {$testUser->id}, utente normale)\n";
        echo "- admin@example.it (ID: {$adminUser->id}, admin)\n";
        echo "Password per entrambi: password\n";
    }
} 