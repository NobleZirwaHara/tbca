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
            'sprints' => [
                ['slug' => 'business-plan-development-sprint', 'name' => 'Business Plan Development Sprint', 'summary' => 'Investor-ready business plan for growth, funding & scaling.', 'zar' => 7600, 'turnaround' => '7–10 days', 'icon' => 'file-text'],
                ['slug' => 'market-research-feasibility-sprint', 'name' => 'Market Research & Feasibility Sprint', 'summary' => 'Validate your idea with data & market insights.', 'zar' => 6500, 'turnaround' => '5–7 days', 'icon' => 'search'],
                ['slug' => 'financial-model-valuation-sprint', 'name' => 'Financial Model & Valuation Sprint', 'summary' => 'Build investor financial models and valuations.', 'zar' => 9500, 'turnaround' => '7–10 days', 'icon' => 'trending-up'],
                ['slug' => 'ai-automation-digital-transformation-sprint', 'name' => 'AI Automation & Digital Transformation Sprint', 'summary' => 'Automate operations and scale with AI.', 'zar' => 14500, 'turnaround' => '10–15 days', 'icon' => 'bot'],
            ],
            'engines' => Platform::engines(),
            'howItWorks' => Commerce::howItWorks(),
            'differentiators' => Commerce::differentiators(),
        ]);
    }
}
