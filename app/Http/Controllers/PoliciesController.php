<?php

namespace App\Http\Controllers;

use App\Support\Content\Policies;
use Inertia\Inertia;
use Inertia\Response;

/** Policies hub (/policies) and the short draft policy pages. */
class PoliciesController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Policies/Index', [
            'policies' => Policies::hub(),
            'groups' => Policies::groups(),
        ]);
    }

    public function show(string $policy): Response
    {
        $page = Policies::find($policy);
        abort_unless($page, 404);

        return Inertia::render('Policies/Show', [
            'policy' => $page,
            'related' => array_values(array_filter(Policies::hub(), fn (array $p) => $p['slug'] !== $policy)),
        ]);
    }
}
