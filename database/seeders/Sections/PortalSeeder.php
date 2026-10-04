<?php

namespace Database\Seeders\Sections;

use App\Models\User;
use App\Support\Portal\Demo\DemoClient;
use App\Support\Portal\Demo\DemoClientRecords;
use App\Support\Portal\Demo\DemoGlobal;
use Illuminate\Database\Seeder;

/**
 * Client Portal demo data for amahle@agritechsa.co.za plus the platform-wide
 * registers behind the /admin/portal consoles. Safe to run repeatedly.
 */
class PortalSeeder extends Seeder
{
    public function run(): void
    {
        DemoGlobal::seed();

        $user = User::where('email', 'amahle@agritechsa.co.za')->first();
        if (! $user) {
            return;
        }

        DemoClient::seed($user);
        DemoClientRecords::seed($user);
    }
}
