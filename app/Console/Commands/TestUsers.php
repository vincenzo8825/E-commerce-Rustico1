<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUsers extends Command
{
    protected $signature = 'test:users';
    protected $description = 'Crea utenti di test per le notifiche';

    public function handle()
    {
        $this->info('Creazione/Verifica utenti di test...');

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

        $this->info('Utenti creati/verificati:');
        $this->table(
            ['ID', 'Nome', 'Email', 'Admin'],
            [
                [$testUser->id, $testUser->name . ' ' . $testUser->surname, $testUser->email, $testUser->is_admin ? 'Sì' : 'No'],
                [$adminUser->id, $adminUser->name . ' ' . $adminUser->surname, $adminUser->email, $adminUser->is_admin ? 'Sì' : 'No']
            ]
        );

        $this->info('Test utenti completato!');
        return 0;
    }
} 