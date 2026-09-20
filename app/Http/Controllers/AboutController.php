<?php

namespace App\Http\Controllers;

use App\Support\Content\About;
use App\Support\Content\Platform;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('About/Index', [
            'identity' => About::identity(),
            'trustRail' => About::trustRail(),
            'certifications' => About::certifications(),
            'methodology' => Platform::methodology(),
            'relationships' => config('tbca.institutional_relationships'),
            'limitations' => About::limitations(),
            'entitySummary' => About::entitySummary(),
        ]);
    }

    public function story(): Response
    {
        return Inertia::render('About/Story', [
            'identity' => About::identity(),
            'facts' => About::storyFacts(),
            'principles' => Platform::principles(),
        ]);
    }

    public function methodology(): Response
    {
        return Inertia::render('About/Methodology', [
            'methodology' => Platform::methodology(),
            'sequence' => Platform::advisorySequence(),
            'decisions' => Platform::architectureDecisions(),
        ]);
    }

    public function team(): Response
    {
        return Inertia::render('About/Team', [
            'leadership' => About::leadership(),
            'directory' => About::teamDirectory(),
            'states' => About::profileStates(),
        ]);
    }

    public function member(string $slug): Response
    {
        $leader = About::findLeader($slug);

        abort_if($leader === null, 404);

        return Inertia::render('About/Member', [
            'member' => $leader,
            'limitations' => About::limitations(),
        ]);
    }

    public function governance(): Response
    {
        return Inertia::render('About/Governance', [
            'pillars' => Platform::governancePillars(),
            'systemsOfRecord' => Platform::systemsOfRecord(),
            'decisions' => Platform::architectureDecisions(),
        ]);
    }

    public function certifications(): Response
    {
        return Inertia::render('About/Certifications', [
            'certifications' => About::certifications(),
            'disclosure' => About::certificationsDisclosure(),
            'ledgerClasses' => config('tbca.ledger_classes'),
        ]);
    }
}
