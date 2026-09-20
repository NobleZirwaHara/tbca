<?php

namespace App\Http\Controllers;

use App\Support\Content\Aiim;
use Inertia\Inertia;
use Inertia\Response;

/**
 * TBCA-AIIM-001 — intent-driven map and intelligence panels.
 * Source metadata is never hidden.
 */
class AiimController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Aiim/Index', [
            'positioning' => Aiim::positioning(),
            'intents' => Aiim::intents(),
            'layers' => Aiim::layers(),
            'countries' => Aiim::countries(),
            'sectors' => Aiim::sectors(),
            'interactions' => Aiim::interactions(),
            'confidenceGrades' => Aiim::confidenceGrades(),
            'roles' => Aiim::roles(),
        ]);
    }

    public function country(string $slug): Response
    {
        $country = Aiim::findCountry($slug);

        abort_if($country === null, 404);

        return Inertia::render('Aiim/Country', [
            'country' => $country,
            'layers' => Aiim::layers(),
            'sectors' => Aiim::sectors(),
            'metadata' => Aiim::recordMetadata(),
            'sourceTiers' => Aiim::sourceTiers(),
        ]);
    }

    public function sector(string $slug): Response
    {
        $sector = Aiim::findSector($slug);

        abort_if($sector === null, 404);

        return Inertia::render('Aiim/Sector', [
            'sector' => $sector,
            'countries' => Aiim::countries(),
            'metadata' => Aiim::recordMetadata(),
        ]);
    }

    public function compare(): Response
    {
        return Inertia::render('Aiim/Compare', [
            'countries' => Aiim::countries(),
            'sectors' => Aiim::sectors(),
            'confidenceGrades' => Aiim::confidenceGrades(),
        ]);
    }

    public function corridors(): Response
    {
        return Inertia::render('Aiim/Corridors', [
            'countries' => Aiim::countries(),
        ]);
    }

    public function store(): Response
    {
        return Inertia::render('Aiim/Store', [
            'reports' => Aiim::reports(),
            'confidenceGrades' => Aiim::confidenceGrades(),
        ]);
    }

    public function workspace(): Response
    {
        return Inertia::render('Aiim/Workspace', [
            'roles' => Aiim::roles(),
            'curationStages' => Aiim::curationStages(),
        ]);
    }

    public function watchlists(): Response
    {
        return Inertia::render('Aiim/Watchlists', [
            'countries' => Aiim::countries(),
            'sectors' => Aiim::sectors(),
        ]);
    }

    public function methodology(): Response
    {
        return Inertia::render('Aiim/Methodology', [
            'sourceTiers' => Aiim::sourceTiers(),
            'confidenceGrades' => Aiim::confidenceGrades(),
            'curationStages' => Aiim::curationStages(),
            'metadata' => Aiim::recordMetadata(),
            'routes' => Aiim::routes(),
        ]);
    }
}
