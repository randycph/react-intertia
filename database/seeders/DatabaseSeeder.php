<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Role;
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

        $roles = [
            ['name' => 'Super Admin', 'slug' => 'super-admin'],
            ['name' => 'School Admin', 'slug' => 'school-admin'],
            ['name' => 'Teacher', 'slug' => 'teacher'],
            ['name' => 'Student', 'slug' => 'student'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }

        // assign user 1 to role 1
        // $adminUser = \App\Models\User::find(1);
        // if ($adminUser) {
        //     $adminUser->roles()->attach(Role::where('slug', 'super-admin')->first());
        // }

        $this->call(DebugPromotionSeeder::class);
    }
}

