<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in the correct order
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            DiscountCodeSeeder::class,
            OrderSeeder::class,
            SupportTicketSeeder::class,
        ]);
    }
}
