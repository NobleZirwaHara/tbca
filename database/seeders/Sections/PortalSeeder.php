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

        // Re-seeding restores a usable demo: undo any restriction, pause or exit
        // left behind by trying the continuity journeys on the demo account.
        \App\Models\Portal\Account::where('user_id', $user->id)->update([
            'account_state' => 'active',
            'state_reason' => null,
            'state_case' => null,
            'state_since' => null,
        ]);
    }
}
