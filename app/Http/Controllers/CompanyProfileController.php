<?php

namespace App\Http\Controllers;

use App\Support\About\Content;
use App\Support\About\Copy;
use App\Support\Platform\Offices;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/** /resources/company-profile: TBCA summary + downloadable company profile PDF (when present). */
class CompanyProfileController extends Controller
{
    private const FILE = 'docs/TBCA-Company-Profile.pdf';

    public function show(): Response
    {
        $path = public_path(self::FILE);
        $exists = file_exists($path);

        return Inertia::render('Insights/Resources/CompanyProfile', [
            'identity' => Content::identity(),
            'facts' => Content::storyFacts(),
            'differentiators' => Copy::differentiators(),
            'limitations' => Content::limitations(),
            'offices' => Offices::all(),
            'download' => $exists ? [
                'href' => route('company-profile.download'),
                'size' => round(filesize($path) / 1048576, 1).' MB',
            ] : null,
        ]);
    }

    public function download(): BinaryFileResponse
    {
        $path = public_path(self::FILE);
        abort_unless(file_exists($path), 404);

        return response()->download($path, 'TBCA-Company-Profile.pdf', ['Content-Type' => 'application/pdf']);
    }
}
