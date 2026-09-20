<?php

namespace App\Http\Controllers;

use App\Support\Content\Commerce;
use App\Support\Content\Platform;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Home', [
            'stats' => config('tbca.stats'),
            'sprints' => Commerce::featuredSprints(),
            'engines' => Platform::engines(),
            'howItWorks' => Commerce::howItWorks(),
            'differentiators' => Commerce::differentiators(),
        ]);
    }
}
