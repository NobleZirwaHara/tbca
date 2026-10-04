<?php

namespace App\Http\Controllers\About;

use App\Http\Controllers\Controller;
use App\Models\About\StatusComponent;
use App\Support\About\Copy;
use Inertia\Inertia;
use Inertia\Response;

class TrustController extends Controller
{
    public function trustCentre(): Response
    {
        $statuses = StatusComponent::query()->pluck('status');
        $healthy = $statuses->isNotEmpty() && $statuses->every(fn ($s) => $s === 'operational');

        return Inertia::render('About/TrustCentre', [
            'content' => Copy::trustCentre(),
            'systemStatus' => $statuses->isEmpty()
                ? null
                : ['healthy' => $healthy, 'label' => $healthy ? 'All Systems Operational' : 'Some systems degraded'],
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('About/Privacy', ['content' => Copy::privacy()]);
    }

    public function terms(): Response
    {
        return Inertia::render('About/Terms', ['content' => Copy::terms()]);
    }
}
