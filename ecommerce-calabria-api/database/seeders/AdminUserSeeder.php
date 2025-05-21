<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin user already exists
        if (!User::where('email', 'admin@calabria-ecommerce.it')->exists()) {
            User::create([
                'name' => 'Admin',
                'surname' => 'Calabria',
                'email' => 'admin@example.com',
                'password' => Hash::make('password123'),
                'address' => 'Via Calabria 1',
                'city' => 'Cosenza',
                'postal_code' => '87100',
                'phone' => '3331234567',
                'is_admin' => true,
            ]);
        }
    }
}
