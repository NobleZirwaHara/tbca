<?php

namespace App\Http\Controllers\CountryHub;

use App\Http\Controllers\Controller as BaseController;
use App\Support\CountryHub\CountryHub;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Base for the Countries tab controllers. Every country page gets `base` (the country, the country
 * list for the switcher and the activation date); the page key drives the left rail, breadcrumbs
 * and heading on the client (resources/js/Components/CountryHub/Layout.tsx).
 */
abstract class Controller extends BaseController
{
    /** Resolve a country by slug, ISO3 or ISO2; 404 when unknown or when the data is not loaded. */
    protected function country(string $key): array
    {
        abort_unless(CountryHub::ready(), 404);
        $c = CountryHub::country($key);
        abort_unless($c !== null, 404);

        return $c;
    }

    /** Render a country page (left rail, control panel) with the shared base props. */
    protected function countryPage(array $c, string $component, array $props = []): Response
    {
        return Inertia::render('CountryHub/'.$component, ['base' => CountryHub::base($c)] + $props);
    }

    /** Render a page that is not tied to one country (landing, explorer, corridors). */
    protected function plain(string $component, array $props = []): Response
    {
        abort_unless(CountryHub::ready(), 404);

        return Inertia::render('CountryHub/'.$component, ['countries' => CountryHub::options(), 'actDate' => CountryHub::ACT_DATE] + $props);
    }
}
