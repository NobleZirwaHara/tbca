<?php

namespace App\Http\Controllers;

use App\Support\Content\DueDiligence;
use Inertia\Inertia;
use Inertia\Response;

/**
 * TBCA-DD-001 to TBCA-DD-005.
 * Consent gate, case management, vendor verification, review lock, report delivery.
 */
class DueDiligenceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('DueDiligence/Index', [
            'positioning' => DueDiligence::positioning(),
            'routes' => DueDiligence::routes(),
            'skus' => DueDiligence::skus(),
            'workflow' => DueDiligence::workflow(),
            'caseStatuses' => DueDiligence::caseStatuses(),
            'reviewTriggers' => DueDiligence::reviewTriggers(),
            'controls' => DueDiligence::controls(),
        ]);
    }

    public function family(string $slug): Response
    {
        $route = DueDiligence::findRoute($slug);

        abort_if($route === null || $slug === '', 404);

        return Inertia::render('DueDiligence/Family', [
            'route' => $route,
            'positioning' => DueDiligence::positioning(),
            'skus' => DueDiligence::skusForFamily($slug),
            'allRoutes' => DueDiligence::routes(),
            'workflow' => DueDiligence::workflow(),
            'reviewTriggers' => DueDiligence::reviewTriggers(),
            'controls' => DueDiligence::controls(),
            'reportTemplates' => DueDiligence::reportTemplates(),
        ]);
    }

    public function reports(): Response
    {
        return Inertia::render('DueDiligence/Reports', [
            'positioning' => DueDiligence::positioning(),
            'reportTemplates' => DueDiligence::reportTemplates(),
            'portalAreas' => DueDiligence::portalAreas(),
            'caseStatuses' => DueDiligence::caseStatuses(),
        ]);
    }

    public function start(): Response
    {
        return Inertia::render('DueDiligence/Start', [
            'positioning' => DueDiligence::positioning(),
            'skus' => DueDiligence::skus(),
            'controls' => DueDiligence::controls(),
            'workflow' => DueDiligence::workflow(),
        ]);
    }
}
