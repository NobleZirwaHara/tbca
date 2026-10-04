<?php

namespace App\Http\Controllers\About;

use App\Http\Controllers\Controller;
use App\Models\About\StatusComponent;
use App\Models\About\StatusIncident;
use Inertia\Inertia;
use Inertia\Response;

/** System Status: measured component state and incidents from the status register. */
class StatusController extends Controller
{
    public function index(): Response
    {
        $components = StatusComponent::query()->orderBy('sort')->get();
        $counts = $components->countBy('status');
        $uptime = $components->whereNotNull('uptime_30d')->avg('uptime_30d');

        $incidents = StatusIncident::with('component')->orderByDesc('starts_at')->limit(20)->get()->map(fn ($i) => [
            'id' => $i->id,
            'kind' => $i->kind,
            'title' => $i->title,
            'body' => $i->body,
            'impact' => $i->impact,
            'status' => $i->status,
            'component' => $i->component?->name,
            'starts_at' => optional($i->starts_at)->toIso8601String(),
            'resolved_at' => optional($i->resolved_at)->toIso8601String(),
        ]);

        return Inertia::render('About/SystemStatus', [
            'components' => $components->map(fn ($c) => $c->only(['key', 'name', 'icon', 'status', 'uptime_30d', 'response_ms', 'history'])),
            'summary' => [
                'operational' => (int) ($counts['operational'] ?? 0),
                'degraded' => (int) ($counts['degraded'] ?? 0),
                'outages' => (int) (($counts['partial_outage'] ?? 0) + ($counts['major_outage'] ?? 0)),
                'uptime' => $uptime === null ? null : round($uptime, 2),
                'updated_at' => now()->toIso8601String(),
            ],
            'active' => $incidents->where('kind', 'incident')->whereNotIn('status', ['resolved'])->values(),
            'maintenance' => $incidents->where('kind', 'maintenance')->where('status', 'scheduled')->values(),
            'notices' => $incidents->where('kind', 'notice')->whereNotIn('status', ['resolved', 'completed'])->values(),
            'history' => $incidents->values(),
        ]);
    }
}
