<?php

namespace App\Http\Controllers\DealRoom\Concerns;

use App\Models\DealRoom\Room;
use App\Support\DealRoom\Access;
use App\Support\DealRoom\Audit;
use App\Support\DealRoom\Billing;
use App\Support\DealRoom\Rooms;
use App\Support\DealRoom\Workflow;
use Illuminate\Http\Request;

trait LoadsRoom
{
    /** Authorise entry, reconcile payments and return the viewer's role. */
    protected function enter(Request $request, Room $room): string
    {
        $role = Access::authorize($room, $request->user());
        Billing::sync($room);
        Workflow::ensureStages($room);
        $room->refresh();

        if ($party = Access::party($room, $request->user())) {
            $party->update(['last_access_at' => now()]);
        }

        return $role;
    }

    protected function manage(Request $request, Room $room): void
    {
        abort_unless(Access::manages($room, $request->user()), 403, 'Only the room owner or TBCA can perform this action.');
    }

    protected function shared(Request $request, Room $room): array
    {
        return [
            'room' => Rooms::header($room, $request->user()),
            'audit' => Audit::recent($room),
        ];
    }

    protected function actor(Request $request): string
    {
        return $request->user()->name;
    }
}
