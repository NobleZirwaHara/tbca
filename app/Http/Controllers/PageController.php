<?php

namespace App\Http\Controllers;

use App\Support\Content\Commerce;
use App\Support\Content\Navigation;
use App\Support\Content\Pages;
use App\Support\Content\Platform;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Generic route-page renderer for the Service Category template
 * (Section 5 — Front-End Page Template Standard).
 */
class PageController extends Controller
{
    public function show(string $key): Response
    {
        $page = Pages::get($key);

        if ($page === []) {
            throw new NotFoundHttpException();
        }

        $tab = Navigation::find('/'.$key);

        return Inertia::render('RoutePage', [
            'page' => $page,
            'tab' => $tab,
            'related' => Commerce::featuredSprints(),
            'extras' => $this->extrasFor($key),
        ]);
    }

    private function extrasFor(string $key): array
    {
        return match ($key) {
            'technology-solutions' => [
                'agentFamilies' => Platform::agentFamilies(),
                'agentTiers' => Platform::agentTiers(),
                'dashboards' => Platform::dashboards(),
            ],
            'project-advisory' => [
                'sequence' => Platform::advisorySequence(),
                'dealRoomStages' => Platform::dealRoomStages(),
            ],
            'countries' => [
                'waves' => Platform::waves(),
            ],
            default => [],
        };
    }
}
