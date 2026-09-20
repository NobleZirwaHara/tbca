<?php

namespace App\Http\Controllers;

use App\Support\Content\Commerce;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Shop/Index', [
            'sprints' => Commerce::sprints(),
            'categories' => Commerce::sprintCategories(),
        ]);
    }

    public function sprint(string $code): Response
    {
        $sprint = collect(Commerce::sprints())
            ->firstWhere('code', strtoupper($code));

        abort_if($sprint === null, 404);

        return Inertia::render('Shop/Sprint', [
            'sprint' => $sprint,
            'related' => collect(Commerce::sprints())
                ->where('category', $sprint['category'])
                ->where('code', '!=', $sprint['code'])
                ->values()
                ->take(3)
                ->all(),
        ]);
    }

    public function digitalProducts(): Response
    {
        return Inertia::render('Shop/DigitalProducts', [
            'products' => Commerce::digitalProducts(),
        ]);
    }

    public function subscriptions(): Response
    {
        return Inertia::render('Shop/Subscriptions', [
            'plans' => Commerce::subscriptions(),
        ]);
    }

    public function retainers(): Response
    {
        return Inertia::render('Shop/Retainers', [
            'desks' => Commerce::retainers(),
        ]);
    }
}
