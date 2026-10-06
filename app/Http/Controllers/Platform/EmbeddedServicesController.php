<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Support\Platform\EmbeddedServices;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Embedded services (Batch 4D) by host module: the "View all" target of the
 * Embedded Services section on each host page.
 */
class EmbeddedServicesController extends Controller
{
    public function index(): Response
    {
        $counts = EmbeddedServices::counts();

        return Inertia::render('Embedded/Index', [
            'section' => null,
            'modules' => self::modules($counts),
            'total' => count(EmbeddedServices::all()),
        ]);
    }

    public function show(string $module): Response
    {
        abort_unless(isset(EmbeddedServices::MODULES[$module]), 404);

        return Inertia::render('Embedded/Index', [
            'section' => EmbeddedServices::forModule($module, null),
            'modules' => self::modules(EmbeddedServices::counts()),
            'total' => count(EmbeddedServices::all()),
        ]);
    }

    /** @param array<string, int> $counts */
    private static function modules(array $counts): array
    {
        return collect(EmbeddedServices::MODULES)
            ->map(fn ($label, $key) => ['key' => $key, 'label' => $label, 'count' => $counts[$key] ?? 0, 'href' => "/embedded-services/{$key}"])
            ->filter(fn ($m) => $m['count'] > 0)
            ->values()->all();
    }
}
