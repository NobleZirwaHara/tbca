<?php

use App\Http\Controllers\CorePages\CountriesController;
use App\Http\Controllers\CorePages\CountryAdminController;
use App\Http\Controllers\CorePages\DiscoveryCallController;
use App\Http\Controllers\CorePages\HealthScoreController;
use App\Http\Controllers\CorePages\InfoPagesController;
use App\Http\Controllers\CorePages\ServiceFinderController;
use App\Http\Controllers\CorePages\ToolsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Core pages and customer journeys
|--------------------------------------------------------------------------
*/

/* --- Landing pages ------------------------------------------------------- */
Route::get('/contact', [InfoPagesController::class, 'contact'])->name('contact');
Route::get('/contact/offices', [InfoPagesController::class, 'offices'])->name('contact.offices');
Route::get('/diagnostics', [InfoPagesController::class, 'diagnostics'])->name('diagnostics');

/* --- Book a Discovery Call ------------------------------------------------ */
Route::prefix('discovery-call')->name('core.discovery')->group(function () {
    Route::get('/', [DiscoveryCallController::class, 'book'])->name('');
    Route::post('/', [DiscoveryCallController::class, 'store'])->name('.store');
    Route::get('/review', [DiscoveryCallController::class, 'review'])->name('.review');
    Route::post('/confirm', [DiscoveryCallController::class, 'confirm'])->name('.confirm');
    Route::get('/confirmed/{booking}', [DiscoveryCallController::class, 'confirmed'])->name('.confirmed');
    Route::get('/meetings/{booking}/calendar.ics', [DiscoveryCallController::class, 'calendar'])->name('.calendar');

    Route::middleware('auth')->group(function () {
        Route::get('/meetings', [DiscoveryCallController::class, 'meetings'])->name('.meetings');
        Route::get('/meetings/{booking}/reschedule', [DiscoveryCallController::class, 'reschedule'])->name('.reschedule');
        Route::patch('/meetings/{booking}/reschedule', [DiscoveryCallController::class, 'updateSchedule'])->name('.reschedule.update');
        Route::post('/meetings/{booking}/cancel', [DiscoveryCallController::class, 'cancel'])->name('.cancel');
    });
});

/* --- Business Health Score ----------------------------------------------- */
Route::prefix('business-health-score')->name('core.health')->group(function () {
    Route::get('/', [HealthScoreController::class, 'show'])->name('');
    Route::get('/saved', [HealthScoreController::class, 'saved'])->name('.saved');
    Route::post('/saved/email-link', [HealthScoreController::class, 'emailLink'])->name('.email-link');
    Route::post('/saved/reminder', [HealthScoreController::class, 'reminder'])->name('.reminder');
    Route::get('/resume/{token}', [HealthScoreController::class, 'resume'])->name('.resume');
    Route::post('/restart', [HealthScoreController::class, 'restart'])->name('.restart');
    Route::get('/results/{assessment}', [HealthScoreController::class, 'results'])->name('.results');
    Route::get('/results/{assessment}/download', [HealthScoreController::class, 'download'])->name('.download');
    Route::post('/results/{assessment}/send', [HealthScoreController::class, 'send'])->name('.send');
    Route::get('/step/{step}', [HealthScoreController::class, 'show'])->whereNumber('step')->name('.step');
    Route::post('/step/{step}', [HealthScoreController::class, 'store'])->whereNumber('step')->name('.store');
});

/* --- Tools, Templates & Calculators -------------------------------------- */
Route::prefix('tools')->name('core.tools')->group(function () {
    Route::get('/', [ToolsController::class, 'index'])->name('');
    Route::get('/my-downloads', [ToolsController::class, 'downloads'])->middleware('auth')->name('.downloads');
    Route::get('/orders/{order}/complete', [ToolsController::class, 'complete'])->name('.complete');
    Route::get('/downloads/{entitlement}', [ToolsController::class, 'secure'])->name('.secure');
    Route::get('/downloads/{entitlement}/file', [ToolsController::class, 'file'])->name('.file');
    Route::get('/downloads/{entitlement}/success', [ToolsController::class, 'success'])->name('.success');
    Route::post('/downloads/{entitlement}/claim', [ToolsController::class, 'claim'])->middleware('auth')->name('.claim');

    $types = 'reports|templates|toolkits|checklists|calculators|interactive-tools|guides|courses';
    Route::get('/{type}', [ToolsController::class, 'index'])->where('type', $types)->name('.type');
    Route::get('/{type}/{slug}', [ToolsController::class, 'show'])->where('type', $types)->name('.show');
    Route::get('/{type}/{slug}/checkout', [ToolsController::class, 'checkout'])->where('type', $types)->name('.checkout');
    Route::post('/{type}/{slug}/checkout', [ToolsController::class, 'placeOrder'])->where('type', $types)->name('.order');
});

/* --- Find the Right Service (+ country and corridor views) --------------- */
Route::prefix('find-the-right-service')->group(function () {
    Route::get('/', [ServiceFinderController::class, 'start'])->name('core.finder');
    Route::get('/recommendations', [ServiceFinderController::class, 'recommendations'])->name('core.finder.recommendations');
    Route::get('/request-human-assistance', [ServiceFinderController::class, 'assistance'])->name('core.finder.assistance');
    Route::post('/request-human-assistance', [ServiceFinderController::class, 'submitAssistance'])->name('core.finder.assistance.submit');
    Route::get('/request-submitted/{reference}', [ServiceFinderController::class, 'submitted'])->name('core.finder.submitted');
    Route::get('/resume/{finder}', [ServiceFinderController::class, 'resume'])->name('core.finder.resume');
    Route::post('/restart', [ServiceFinderController::class, 'restart'])->name('core.finder.restart');

    Route::get('/countries', [CountriesController::class, 'explorer'])->name('core.countries');
    Route::get('/countries/{iso}', [CountriesController::class, 'profile'])->where('iso', '[a-zA-Z]{2}')->name('core.countries.profile');
    Route::get('/countries/{iso}/evidence', [CountriesController::class, 'evidence'])->where('iso', '[a-zA-Z]{2}')->name('core.countries.evidence');
    Route::get('/countries/{iso}/evidence/download', [CountriesController::class, 'evidencePack'])->where('iso', '[a-zA-Z]{2}')->name('core.countries.evidence.download');
    Route::get('/countries/{iso}/legal', [CountriesController::class, 'legal'])->where('iso', '[a-zA-Z]{2}')->name('core.countries.legal');
    Route::get('/countries/{iso}/services/{code}', [CountriesController::class, 'service'])->where('iso', '[a-zA-Z]{2}')->name('core.countries.service');
    Route::post('/countries/{iso}/services/{code}/eligibility', [CountriesController::class, 'eligibility'])->where('iso', '[a-zA-Z]{2}')->name('core.countries.eligibility');
    Route::post('/countries/{iso}/services/{code}/access', [CountriesController::class, 'requestAccess'])->where('iso', '[a-zA-Z]{2}')->name('core.countries.access');
    Route::get('/corridors', [CountriesController::class, 'network'])->name('core.corridors');
    Route::get('/corridors/za-ae/ledger-s', [CountriesController::class, 'ledgerS'])->name('core.corridors.ledger-s');
    Route::get('/corridors/za-ae/ledger-s/export', [CountriesController::class, 'ledgerSExport'])->name('core.corridors.ledger-s.export');

    Route::get('/{stage}', [ServiceFinderController::class, 'show'])->where('stage', 'your-need|about-you|business-context|timing-budget')->name('core.finder.step');
    Route::post('/{stage}', [ServiceFinderController::class, 'store'])->where('stage', 'your-need|about-you|business-context|timing-budget')->name('core.finder.store');
});

/* --- Admin consoles ------------------------------------------------------ */
Route::prefix('admin/core-pages')->middleware(['auth', 'admin'])->name('admin.core-pages')->group(function () {
    Route::get('/corridors', [CountryAdminController::class, 'corridors'])->name('.corridors');
    Route::post('/corridors', [CountryAdminController::class, 'storeCorridor'])->name('.corridors.store');
    Route::patch('/corridors/{corridor}', [CountryAdminController::class, 'updateCorridor'])->name('.corridors.update');
    Route::patch('/corridors/{corridor}/state', [CountryAdminController::class, 'transitionCorridor'])->name('.corridors.state');
    Route::get('/observations', [CountryAdminController::class, 'observations'])->name('.observations');
    Route::post('/observations', [CountryAdminController::class, 'storeObservation'])->name('.observations.store');
    Route::patch('/observations/{observation}/status', [CountryAdminController::class, 'transitionObservation'])->name('.observations.status');
    Route::patch('/observations/{observation}/permission', [CountryAdminController::class, 'togglePermission'])->name('.observations.permission');
});
