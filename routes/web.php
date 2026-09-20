<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\AiimController;
use App\Http\Controllers\ContextController;
use App\Http\Controllers\DueDiligenceController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TBCA Canonical Route Matrix
|--------------------------------------------------------------------------
| Table 1 — Revised Main Navigation Route Matrix.
| AIIM and Due Diligence are primary destinations.
*/

Route::get('/', HomeController::class)->name('home');

Route::post('/context', [ContextController::class, 'update'])->name('context.update');

/* --- Commercial engine ------------------------------------------------- */
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/shop/{code}', [ShopController::class, 'sprint'])->name('shop.sprint');
Route::get('/digital-products', [ShopController::class, 'digitalProducts'])->name('digital-products');
Route::get('/subscriptions', [ShopController::class, 'subscriptions'])->name('subscriptions');
Route::get('/retainers', [ShopController::class, 'retainers'])->name('retainers');

/* --- AIIM — Africa Investment Intelligence Map ------------------------- */
Route::prefix('aiim')->name('aiim.')->group(function () {
    Route::get('/', [AiimController::class, 'index'])->name('index');
    Route::get('/compare', [AiimController::class, 'compare'])->name('compare');
    Route::get('/corridors', [AiimController::class, 'corridors'])->name('corridors');
    Route::get('/store', [AiimController::class, 'store'])->name('store');
    Route::get('/methodology', [AiimController::class, 'methodology'])->name('methodology');
    Route::get('/workspace', [AiimController::class, 'workspace'])->name('workspace');
    Route::get('/workspace/watchlists', [AiimController::class, 'watchlists'])->name('watchlists');
    Route::get('/country/{slug}', [AiimController::class, 'country'])->name('country');
    Route::get('/sector/{slug}', [AiimController::class, 'sector'])->name('sector');
});

/* --- Due Diligence ------------------------------------------------------ */
Route::prefix('due-diligence')->name('due-diligence.')->group(function () {
    Route::get('/', [DueDiligenceController::class, 'index'])->name('index');
    Route::get('/start', [DueDiligenceController::class, 'start'])->name('start');
    Route::get('/reports', [DueDiligenceController::class, 'reports'])->name('reports');
    Route::get('/{slug}', [DueDiligenceController::class, 'family'])
        ->whereIn('slug', [
            'individual', 'company', 'supplier', 'director-ubo', 'investor',
            'project-sponsor', 'institution', 'aml-kyc-kyb', 'project',
            'enterprise', 'monitoring', 'enterprise-api',
        ])
        ->name('family');
});

/* Permanent redirect required by Section 17. Campaign parameters are retained. */
Route::permanentRedirect('/digital-due-diligence', '/due-diligence');

/* --- About TBCA --------------------------------------------------------- */
Route::prefix('about')->name('about.')->group(function () {
    Route::get('/', [AboutController::class, 'index'])->name('index');
    Route::get('/our-story', [AboutController::class, 'story'])->name('story');
    Route::get('/methodology', [AboutController::class, 'methodology'])->name('methodology');
    Route::get('/team', [AboutController::class, 'team'])->name('team');
    Route::get('/team/{slug}', [AboutController::class, 'member'])->name('member');
    Route::get('/governance', [AboutController::class, 'governance'])->name('governance');
    Route::get('/certifications', [AboutController::class, 'certifications'])->name('certifications');
});

/* --- Client Portal ------------------------------------------------------ */
Route::get('/portal', [PortalController::class, 'index'])->name('portal');

/* --- Remaining canonical navigation routes ------------------------------ */
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
    Route::get("/{$slug}", fn () => app(PageController::class)->show($slug))->name($slug);
}
