<?php

use App\Http\Controllers\Countries\AdminActionController;
use App\Http\Controllers\Countries\AdminController;
use App\Http\Controllers\Countries\CorridorController;
use App\Http\Controllers\Countries\CountryController;
use App\Http\Controllers\Countries\DemandController;
use App\Http\Controllers\Countries\EngagementController;
use App\Http\Controllers\Countries\PlanController;
use App\Http\Controllers\Countries\PublicController;
use App\Http\Controllers\Countries\SovereignController;
use Illuminate\Support\Facades\Route;

/* Pages are still being built: until the marker file exists, keep the generic
   /countries placeholder from pages.php live instead of rendering missing pages. */
if (! is_file(resource_path('js/Pages/Countries/.ready'))) {
    return;
}

/* --- Countries Transaction Ecosystem (CT-TEB v2.0) ----------------------- */
Route::prefix('countries')->name('countries.')->group(function () {
    Route::get('/', [PublicController::class, 'landing'])->name('index');
    Route::get('/explorer', [PublicController::class, 'explorer'])->name('explorer');
    Route::get('/activation', [PublicController::class, 'activation'])->name('activation');

    /* Corridors and six-ledger fee transparency */
    Route::get('/corridors', [CorridorController::class, 'landing'])->name('corridors');
    Route::get('/corridors/selector', [CorridorController::class, 'selector'])->name('corridors.selector');
    Route::get('/corridors/network', [CorridorController::class, 'network'])->name('corridors.network');
    Route::get('/corridors/{corridor}', [CorridorController::class, 'detail'])->name('corridors.detail');
    Route::get('/corridors/{corridor}/endpoints', [CorridorController::class, 'endpoints'])->name('corridors.endpoints');
    Route::get('/corridors/{corridor}/evidence', [CorridorController::class, 'evidence'])->name('corridors.evidence');
    Route::get('/corridors/{corridor}/ledger/{ledger}', [CorridorController::class, 'ledger'])->name('corridors.ledger');
    Route::get('/corridors/{corridor}/fee-comparison', [CorridorController::class, 'feeComparison'])->name('corridors.fees');
    Route::get('/corridors/{corridor}/outlook', [CorridorController::class, 'outlook'])->name('corridors.outlook');

    /* Sovereign client journey */
    Route::get('/sovereign', [SovereignController::class, 'landing'])->name('sovereign');
    Route::get('/sovereign/panel', [SovereignController::class, 'panel'])->name('sovereign.panel');
    Route::middleware('auth')->group(function () {
        Route::get('/sovereign/intake', [SovereignController::class, 'intake'])->name('sovereign.intake');
        Route::post('/sovereign/intake', [SovereignController::class, 'storeIntake'])->name('sovereign.intake.store');
        Route::get('/sovereign/{engagement}/conflicts', [SovereignController::class, 'conflicts'])->name('sovereign.conflicts');
        Route::post('/sovereign/{engagement}/declarations', [SovereignController::class, 'addDeclaration'])->name('sovereign.declare');
        Route::post('/sovereign/{engagement}/disclosure', [SovereignController::class, 'submitDisclosure'])->name('sovereign.disclose');
        Route::get('/sovereign/{engagement}/independence', [SovereignController::class, 'independence'])->name('sovereign.independence');
        Route::post('/sovereign/{engagement}/independence', [SovereignController::class, 'confirmIndependence'])->name('sovereign.independence.confirm');
        Route::get('/sovereign/{engagement}/evidence-review', [SovereignController::class, 'review'])->name('sovereign.review');
        Route::get('/sovereign/{engagement}/release', [SovereignController::class, 'release'])->name('sovereign.release');
        Route::get('/sovereign/{engagement}/closure', [SovereignController::class, 'closure'])->name('sovereign.closure');
        Route::post('/sovereign/{engagement}/closure', [SovereignController::class, 'close'])->name('sovereign.close');

        /* Client engagement workspace (Track B) */
        Route::get('/workspace', [EngagementController::class, 'index'])->name('workspace.index');
        Route::get('/workspace/{engagement}', [EngagementController::class, 'workspace'])->name('workspace');
        Route::get('/workspace/{engagement}/letter', [EngagementController::class, 'letter'])->name('workspace.letter');
        Route::post('/workspace/{engagement}/letter', [EngagementController::class, 'decideLetter'])->name('workspace.letter.decide');
        Route::get('/workspace/{engagement}/activate', [EngagementController::class, 'activate'])->name('workspace.activate');
        Route::post('/workspace/{engagement}/pay', [EngagementController::class, 'pay'])->name('workspace.pay');
        Route::get('/workspace/{engagement}/deliverables', [EngagementController::class, 'deliverables'])->name('workspace.deliverables');
        Route::post('/workspace/{engagement}/deliverables/{index}/accept', [EngagementController::class, 'acceptDeliverable'])->whereNumber('index')->name('workspace.deliverables.accept');
        Route::get('/workspace/{engagement}/change', [EngagementController::class, 'change'])->name('workspace.change');
        Route::post('/workspace/{engagement}/change', [EngagementController::class, 'storeChange'])->name('workspace.change.store');
        Route::post('/workspace/{engagement}/change/{reference}', [EngagementController::class, 'decideChange'])->name('workspace.change.decide');
        Route::get('/workspace/{engagement}/closure', [EngagementController::class, 'closure'])->name('workspace.closure');
        Route::post('/workspace/{engagement}/closure', [EngagementController::class, 'close'])->name('workspace.close');

        Route::patch('/plan-items/{item}', [PlanController::class, 'updateItem'])->name('plan.item');
        Route::post('/{country}/plan/{kind}/start', [PlanController::class, 'start'])->name('plan.start');
        Route::post('/{country}/plan/{kind}/items', [PlanController::class, 'addItem'])->name('plan.add');
    });

    Route::get('/quote/{engagement}', [DemandController::class, 'quoteStatus'])->name('quote.status');

    /* Country hub */
    Route::get('/{country}', [CountryController::class, 'profile'])->name('profile');
    Route::get('/{country}/evidence', [CountryController::class, 'evidence'])->name('evidence');
    Route::get('/{country}/availability', [CountryController::class, 'availability'])->name('availability');
    Route::get('/{country}/services', [CountryController::class, 'services'])->name('services');
    Route::get('/{country}/services/{code}', [CountryController::class, 'service'])->name('service');
    Route::post('/{country}/services/{code}/eligibility', [CountryController::class, 'eligibility'])->name('service.eligibility');
    Route::get('/{country}/resolver', [CountryController::class, 'resolver'])->name('resolver');
    Route::post('/{country}/resolver', [CountryController::class, 'reResolve'])->name('resolver.run');
    Route::get('/{country}/impact', [PublicController::class, 'compare'])->name('impact');
    Route::get('/{country}/limitations', [CountryController::class, 'limitations'])->name('limitations');
    Route::get('/{country}/activation', [CountryController::class, 'activationDetail'])->name('activation.detail');
    Route::get('/{country}/registers/{register}', [CountryController::class, 'register'])->name('register');
    Route::get('/{country}/brief/{topic}', [CountryController::class, 'brief'])->name('brief');
    Route::get('/{country}/plan/{kind}', [PlanController::class, 'show'])->name('plan');
    Route::get('/{country}/waitlist', [DemandController::class, 'waitlist'])->name('waitlist');
    Route::post('/{country}/waitlist', [DemandController::class, 'storeInterest'])->name('waitlist.store');
    Route::get('/{country}/quote', [DemandController::class, 'quote'])->name('quote');
    Route::post('/{country}/quote', [DemandController::class, 'storeQuote'])->name('quote.store');
    Route::get('/{country}/{topic}', [CountryController::class, 'topic'])->whereIn('topic', ['tax', 'payments', 'languages', 'partners', 'legal', 'privacy'])->name('topic');
});

/* --- Countries administration ------------------------------------------ */
Route::prefix('admin/countries')->name('admin.countries.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'tower'])->name('tower');
    Route::get('/objects', [AdminController::class, 'objects'])->name('objects');
    Route::patch('/objects/{country}', [AdminActionController::class, 'updateObject'])->name('objects.update');
    Route::get('/resolver', [AdminController::class, 'resolver'])->name('resolver');
    Route::get('/states', [AdminController::class, 'states'])->name('states');
    Route::post('/states/{country}', [AdminActionController::class, 'transition'])->name('states.transition');
    Route::get('/metrics/{kind}', [AdminController::class, 'metrics'])->name('metrics');
    Route::get('/demand', [AdminController::class, 'demand'])->name('demand');
    Route::get('/investment', [AdminController::class, 'investment'])->name('investment');
    Route::get('/corridors', [AdminController::class, 'corridors'])->name('corridors');
    Route::get('/pairs', [AdminController::class, 'pairs'])->name('pairs');
    Route::get('/economics', [AdminController::class, 'economics'])->name('economics');
    Route::get('/observations', [AdminController::class, 'observations'])->name('observations');
    Route::post('/observations', [AdminActionController::class, 'storeObservation'])->name('observations.store');
    Route::post('/observations/{observation:code}', [AdminActionController::class, 'decideObservation'])->name('observations.decide');
    Route::get('/promotion', [AdminController::class, 'promotion'])->name('promotion');
    Route::get('/retractions', [AdminController::class, 'retractions'])->name('retractions');
    Route::post('/retractions', [AdminActionController::class, 'storeRetraction'])->name('retractions.store');
    Route::post('/retractions/{retraction:code}', [AdminActionController::class, 'decideRetraction'])->name('retractions.decide');
    Route::get('/agents/{agent}', [AdminController::class, 'agent'])->name('agent');
    Route::post('/agents/{agent}', [AdminActionController::class, 'ask'])->name('agent.ask');
    Route::get('/releases', [AdminController::class, 'releases'])->name('releases');
    Route::post('/releases', [AdminActionController::class, 'storeRelease'])->name('releases.store');
    Route::post('/releases/{release:code}', [AdminActionController::class, 'updateRelease'])->name('releases.update');
    Route::get('/engagements', [AdminController::class, 'engagements'])->name('engagements');
    Route::get('/sovereign', [AdminController::class, 'engagements'])->name('sovereign');
    Route::post('/engagements/{engagement}/letter', [AdminActionController::class, 'issueLetter'])->name('engagements.letter');
    Route::post('/sovereign/{engagement}/approve-review', [SovereignController::class, 'approveReview'])->name('sovereign.approve');
    Route::post('/sovereign/{engagement}/release', [SovereignController::class, 'releaseDeliverables'])->name('sovereign.release');
});
