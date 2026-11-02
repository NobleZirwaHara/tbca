<?php

use App\Http\Controllers\CountryHub\CommerceController;
use App\Http\Controllers\CountryHub\CorridorController;
use App\Http\Controllers\CountryHub\GovController;
use App\Http\Controllers\CountryHub\IntelController;
use App\Http\Controllers\CountryHub\IntelDataController;
use App\Http\Controllers\CountryHub\JourneyController;
use App\Http\Controllers\CountryHub\ProfileController;
use App\Http\Controllers\CountryHub\PublicController;
use App\Http\Controllers\CountryHub\StateController;
use App\Http\Controllers\CountryHub\TradeController;
use Illuminate\Support\Facades\Route;

/*
 * Countries tab, rebuilt from the Countries part of the client's prototype (MP-COUNTRIES-1.0,
 * 21 Oct 2026): 54 activated countries from one country template, Botswana end to end.
 * Prototype route #/c/{ISO}/{page} is /countries/{country}/{page} here, with {country} the country
 * slug (ISO3 and ISO2 also resolve). Profile is /countries/{country}. Each page has its own URI
 * (a shared /{page} pattern would let the last controller win), with the page key as a default.
 */
Route::get('/countries', [PublicController::class, 'landing'])->name('countries');

Route::prefix('countries')->name('countries.')->group(function () {
    Route::get('/explorer', [PublicController::class, 'explorer'])->name('explorer');
    Route::post('/state', [StateController::class, 'store'])->name('state');

    /* Corridors & Ledgers (P35 to P48): 54 x 53 directional pairs, prototype #/corridors */
    Route::prefix('corridors')->name('corridors.')->controller(CorridorController::class)->group(function () {
        Route::get('/', 'landing')->name('index');
        Route::get('/select', 'select')->name('select');
        Route::get('/network', 'network')->name('network');
        Route::get('/ledger/{ledger}/{a}/{b}', 'ledger')->where(['ledger' => 'T|X|S|P|D|CT-C', 'a' => '[A-Za-z]{3}', 'b' => '[A-Za-z]{3}'])->name('ledger');
        Route::get('/{view}/{a}/{b}', 'pair')->where(['view' => 'detail|compare|evidence|fees|outlook', 'a' => '[A-Za-z]{3}', 'b' => '[A-Za-z]{3}'])->name('pair');
    });

    Route::prefix('{country}')->where(['country' => '[a-z0-9-]+'])->group(function () {
        /* Country Profile & Planning (P03 to P16, P56) */
        Route::controller(ProfileController::class)->group(function () {
            Route::get('/', 'profile')->name('profile');
            Route::get('/service/{code}', 'service')->where('code', '.+')->name('service');
            foreach (['evidence', 'availability', 'catalogue', 'resolver', 'impact', 'limitations', 'tax', 'payments', 'language', 'partners', 'legal', 'privacy', 'history'] as $page) {
                Route::get("/{$page}", 'page')->defaults('page', $page)->name($page);
            }
        });

        /* Import & Export heat maps: hub and four views */
        Route::get('/trade', [TradeController::class, 'hub'])->name('trade');
        Route::get('/trade/{view}', [TradeController::class, 'view'])->where('view', '[1-4]')->name('trade.view');

        /* Intelligence (AIIM): the rest of the Botswana data set */
        Route::controller(IntelController::class)->group(function () {
            Route::get('/sector/{sector}', 'sector')->where('sector', '[A-Za-z]{3}')->name('sector');
            Route::get('/opp/{id}', 'opp')->where('id', '[A-Za-z0-9-]+')->name('opp');
            Route::get('/geo/unit/{unit}', 'unit')->where('unit', '[A-Za-z]{2}')->name('geo.unit');
            Route::get('/geo/town/{town}', 'town')->where('town', '[A-Za-z0-9]+')->name('geo.town');
            foreach (['economy', 'sectors', 'opps', 'geo', 'leads'] as $page) {
                Route::get("/{$page}", 'page')->defaults('page', $page)->name($page);
            }
        });
        Route::controller(IntelDataController::class)->group(function () {
            Route::get('/dataroom/{sheet}', 'sheet')->where('sheet', '[A-Za-z0-9_]+')->name('dataroom.sheet');
            foreach (['invest', 'risk', 'products', 'infotypes', 'continental', 'onestop', 'pack', 'dataroom'] as $page) {
                Route::get("/{$page}", 'page')->defaults('page', $page)->name($page);
            }
        });

        /* Market Entry Journey (P17 to P26) */
        foreach (['readiness', 'landing', 'localisation', 'paylocal', 'langpack', 'compliance', 'launch', 'audit', 'diaspora', 'exit'] as $page) {
            Route::get("/{$page}", [JourneyController::class, 'page'])->defaults('page', $page)->name($page);
        }

        /* Commercial journey (P27 to P34) */
        Route::controller(CommerceController::class)->group(function () {
            Route::post('/quote', 'storeQuote')->name('quote.store');
            Route::post('/waitlist', 'storeWaitlist')->name('waitlist.store');
            Route::post('/letter', 'signLetter')->name('letter.sign');
            Route::post('/pay', 'pay')->name('pay.store');
            Route::post('/deliverables', 'acceptDeliverable')->name('deliverables.accept');
            Route::post('/change', 'storeChange')->name('change.store');
            Route::post('/closure', 'close')->name('closure.store');
            foreach (['quote', 'waitlist', 'letter', 'pay', 'workspace', 'deliverables', 'change', 'closure'] as $page) {
                Route::get("/{$page}", 'page')->defaults('page', $page)->name($page);
            }
        });

        /* Governance & Admin (P49 to P84) */
        Route::get('/gov', [GovController::class, 'hub'])->name('gov');
        Route::get('/gov/{page}', [GovController::class, 'page'])->where('page', '[a-z0-9]+')->name('gov.page');
    });
});
