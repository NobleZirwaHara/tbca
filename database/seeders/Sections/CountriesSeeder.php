<?php

namespace Database\Seeders\Sections;

use App\Support\Countries\Seed;
use Illuminate\Database\Seeder;

/**
 * Countries Transaction Ecosystem — 54 country objects (South Africa activated,
 * 53 shells), resolver domains, SA service catalogue, registers, corridors and
 * six-ledger fee lines, demand, engagements and governance records. Idempotent.
 */
class CountriesSeeder extends Seeder
{
    public function run(): void
    {
        Seed::run();
    }
}
