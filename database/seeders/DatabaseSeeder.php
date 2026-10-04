<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Demo accounts (password "Password123!"):
     *  - amahle@agritechsa.co.za  client  (TBCA-C-000001)
     *  - admin@thebusinessclinic.africa  admin
     *
     * Each platform section ships its own seeder in database/seeders/Sections;
     * they are discovered and run here in alphabetical order.
     */
    public function run(): void
    {
        User::updateOrCreate(['email' => 'amahle@agritechsa.co.za'], [
            'name' => 'Amahle Dlamini',
            'password' => 'Password123!',
            'client_id' => 'TBCA-C-000001',
            'role' => 'client',
            'phone' => '+27 82 123 4567',
            'company' => 'AgriTech SA',
            'job_title' => 'Managing Director',
            'country' => 'ZA',
            'client_type' => 'sme',
        ]);

        User::updateOrCreate(['email' => 'admin@thebusinessclinic.africa'], [
            'name' => 'TBCA Administrator',
            'password' => 'Password123!',
            'client_id' => 'TBCA-S-000001',
            'role' => 'admin',
            'company' => 'The Business Clinic.Africa',
            'country' => 'ZA',
        ]);

        $sections = glob(__DIR__.'/Sections/*Seeder.php') ?: [];
        sort($sections);

        // The Sprints catalogue owns the flagship sprint slugs (linked from Home and the nav).
        // The sprint-type seeders give way to slugs that already exist, so it must run first.
        usort($sections, fn ($a, $b) => (basename($b) === 'SprintsCatalogueSeeder.php') <=> (basename($a) === 'SprintsCatalogueSeeder.php'));

        foreach ($sections as $file) {
            $this->call('Database\\Seeders\\Sections\\'.basename($file, '.php'));
        }
    }
}
