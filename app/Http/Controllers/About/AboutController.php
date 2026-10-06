<?php

namespace App\Http\Controllers\About;

use App\Http\Controllers\Controller;
use App\Models\About\Claim;
use App\Models\About\Institution;
use App\Models\About\Testimonial;
use App\Support\About\Content;
use App\Support\About\Copy;
use App\Support\Content\Platform;
use Inertia\Inertia;
use Inertia\Response;

/** About TBCA public trust surfaces. Every claim renders from the Claim Register. */
class AboutController extends Controller
{
    public function index(): Response
    {
        $featured = Testimonial::query()->displayable()->orderByDesc('featured')->orderBy('id')->first();

        return Inertia::render('About/Index', [
            'identity' => Content::identity(),
            'trustRail' => Content::trustRail(),
            'claims' => Claim::forSurface('landing'),
            'glance' => Claim::forSurface('glance'),
            'trackRecord' => Claim::forSurface('track-record'),
            'methodology' => Platform::methodology(),
            'relationships' => config('tbca.institutional_relationships'),
            'testimonial' => $featured?->toPublic(),
            'limitations' => Content::limitations(),
            'entitySummary' => Content::entitySummary(),
            'founder' => Content::leadership()[0] ?? null,
            'values' => Platform::principles(),
            'differentiators' => Copy::differentiators(),
        ]);
    }

    public function story(): Response
    {
        return Inertia::render('About/Story', [
            'identity' => Content::identity(),
            'facts' => Content::storyFacts(),
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
            'leadership' => Content::leadership(),
            'directory' => Content::teamDirectory(),
            'states' => Content::profileStates(),
        ]);
    }

    public function member(string $slug): Response
    {
        $leader = Content::findLeader($slug);

        abort_if($leader === null, 404);

        return Inertia::render('About/Member', [
            'member' => $leader,
            'limitations' => Content::limitations(),
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
            'claims' => Claim::forSurface('certifications'),
            'disclosure' => Content::certificationsDisclosure(),
        ]);
    }

    public function relationships(): Response
    {
        return Inertia::render('About/Relationships', [
            'institutions' => Institution::query()->displayable('relationships')->get()->map->toPublic(),
        ]);
    }

    public function boundaries(): Response
    {
        return Inertia::render('About/Boundaries', ['content' => Copy::boundaries()]);
    }

    public function aiDisclosure(): Response
    {
        return Inertia::render('About/AiDisclosure', ['cards' => Copy::aiDisclosure()]);
    }

    public function aiNotice(): Response
    {
        return Inertia::render('About/AiNotice', ['notice' => Copy::aiNotice()]);
    }

    public function promise(): Response
    {
        return Inertia::render('About/Promise', [
            'stats' => Claim::forSurface('promise-stats'),
            'cards' => Claim::forSurface('promise-cards'),
        ]);
    }

    public function testimonials(): Response
    {
        $items = Testimonial::query()->displayable()->where('featured', false)->orderByDesc('id')->get();

        return Inertia::render('About/Testimonials', [
            'testimonials' => $items->map->toPublic()->values(),
            'rating' => $items->isEmpty() ? null : ['average' => round($items->avg('rating'), 1), 'count' => $items->count()],
            'stats' => Claim::forSurface('testimonials'),
            'institutions' => Institution::query()->displayable('trusted-strip')->limit(9)->get()->map->toPublic(),
        ]);
    }

    public function trustedInstitutions(): Response
    {
        return Inertia::render('About/TrustedInstitutions', [
            'institutions' => Institution::query()->displayable('trusted-strip')->get()->map->toPublic(),
        ]);
    }

    public function trustBadge(): Response
    {
        return Inertia::render('About/TrustBadge', [
            'content' => Copy::trustBadge(),
            'claims' => Claim::forSurface('trust-badge'),
        ]);
    }

    public function limitationNotice(): Response
    {
        return Inertia::render('About/LimitationNotice', ['columns' => Copy::limitationNotice()]);
    }

    public function contact(): Response
    {
        return Inertia::render('About/Contact', ['content' => Copy::contact()]);
    }
}
