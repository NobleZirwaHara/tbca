<?php

use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

/* --- Remaining canonical navigation routes ------------------------------ */
/* A slug is only served by the generic template if no section file has
   already registered its own landing page for that URI. */
$claimed = collect(Route::getRoutes()->getRoutes())->map->uri()->all();

foreach ([
    'services',
    'marketplace',
    'partner-services',
    'technology-solutions',
    'diagnostics',
    'project-advisory',
    'countries',
    'industries',
    'resources',
    'kp-thought-leadership',
    'webinars',
    'contact',
] as $slug) {
    if (in_array($slug, $claimed, true)) {
        continue;
    }
    Route::get("/{$slug}", fn () => app(PageController::class)->show($slug))->name($slug);
}
