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
        // create an admin with a role of 1. and create 10 random users
        // \App\Models\User::factory()->create([
        //     'name' => 'Admin User',
        //     'email' => 'randycph@gmail.com',
        //     'password' => bcrypt('password'),
        // ]);

        \App\Models\User::factory(10)->create();
    }
}
