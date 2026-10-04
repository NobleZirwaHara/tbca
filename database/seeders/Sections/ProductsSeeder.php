<?php

namespace Database\Seeders\Sections;

use Illuminate\Database\Seeder;

/**
 * Seeds Digital Products, Subscriptions and Retainers demo data.
 * Each family keeps its own idempotent seed class in App\Support\Products\Seeds.
 */
class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['DigitalSeed', 'SubscriptionSeed', 'RetainerSeed'] as $seed) {
            $class = "App\\Support\\Products\\Seeds\\{$seed}";

            if (class_exists($class)) {
                (new $class)->run();
            }
        }
    }
}
