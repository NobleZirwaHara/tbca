<?php

use App\Http\Controllers\Aiim\AccountController;
use App\Http\Controllers\Aiim\AdminController;
use App\Http\Controllers\Aiim\CommerceController;
use App\Http\Controllers\Aiim\DeskController;
use App\Http\Controllers\Aiim\EngagementController;
use App\Http\Controllers\Aiim\ExploreController;
use App\Http\Controllers\Aiim\MandateController;
use App\Http\Controllers\Aiim\SearchController;
use App\Http\Controllers\Aiim\StoreController;
use App\Http\Controllers\Aiim\WorkspaceController;
use Illuminate\Support\Facades\Route;

/*
| AIIM — Africa Investment Intelligence Map (screen register AIIM-001..082).
| Public explorer under /aiim, signed-in workspace under /aiim/workspace,
| staff consoles under /admin/aiim.
*/
Route::prefix('aiim')->name('aiim.')->group(function () {
    /* --- Stage A / 0: free exploration ----------------------------------- */
    Route::get('/', [ExploreController::class, 'landing'])->name('index');
    Route::get('/country/{slug}', [ExploreController::class, 'country'])->name('country');
    Route::get('/country/{slug}/provinces', [ExploreController::class, 'provinces'])->name('provinces');
    Route::get('/province/{province}', [ExploreController::class, 'province'])->name('province');
    Route::get('/sectors', [ExploreController::class, 'sectors'])->name('sectors');
    Route::get('/sector/{sector}', [ExploreController::class, 'sector'])->name('sector');
    Route::get('/risk', [ExploreController::class, 'risk'])->name('risk');
    Route::get('/sources/{source}', [ExploreController::class, 'source'])->name('source');
    Route::get('/methodology', [ExploreController::class, 'methodology'])->name('methodology');

    // Registered before the {project}/{organisation} detail routes so they aren't captured as slugs.
    Route::redirect('/opportunities/search', '/aiim/opportunities');
    Route::redirect('/investors/search', '/aiim/investors');
    Route::redirect('/funders/search', '/aiim/funders');

    Route::get('/opportunities', [SearchController::class, 'opportunities'])->name('opportunities');
    Route::get('/opportunities/{project}', [SearchController::class, 'opportunity'])->name('opportunity');
    Route::get('/projects', [SearchController::class, 'projects'])->name('projects');
    Route::get('/projects/{project}', [SearchController::class, 'project'])->name('project');
    Route::get('/investors', [SearchController::class, 'investors'])->name('investors');
    Route::get('/investors/{organisation}', [SearchController::class, 'investor'])->name('investor');
    Route::get('/funders', [SearchController::class, 'funders'])->name('funders');
    Route::get('/funders/{organisation}', [SearchController::class, 'funder'])->name('funder');
    Route::get('/corridors', [SearchController::class, 'corridors'])->name('corridors');
    Route::get('/corridors/{corridor}', [SearchController::class, 'corridor'])->name('corridor');

    // Mockup / legacy URL aliases.
    Route::redirect('/trade-corridors/search', '/aiim/corridors');
    Route::redirect('/risk-outlook', '/aiim/risk');
    Route::redirect('/compare', '/aiim/workspace/compare');
    Route::get('/sectors/{slug}', fn (string $slug) => redirect("/aiim/sector/{$slug}"));
    Route::get('/projects/{slug}/overview', fn (string $slug) => redirect("/aiim/projects/{$slug}"));

    /* --- Stage 3: premium brief store ------------------------------------ */
    Route::get('/store', [StoreController::class, 'index'])->name('store');
    Route::get('/store/{brief}', [StoreController::class, 'show'])->name('store.show');

    /* --- Stage C: fee discovery (free) ----------------------------------- */
    Route::get('/fees/discover', [CommerceController::class, 'discover'])->name('fees.discover');
    Route::post('/fees/items', [CommerceController::class, 'addFeeItem'])->name('fees.add');
    Route::delete('/fees/items', [CommerceController::class, 'removeFeeItem'])->name('fees.remove');
    Route::post('/fees/clear', [CommerceController::class, 'clearFeeItems'])->name('fees.clear');
    Route::get('/unlock/{code}', [CommerceController::class, 'locked'])->name('unlock');

    Route::post('/selection/clear', [WorkspaceController::class, 'clearSelection'])->name('selection.clear');

    /* --- Stage B: registration (G1) -------------------------------------- */
    Route::middleware('guest')->group(function () {
        Route::get('/register/{step?}', [AccountController::class, 'show'])->whereNumber('step')->name('register');
        Route::post('/register/{step}', [AccountController::class, 'store'])->whereNumber('step')->name('register.step');
    });

    Route::middleware('auth')->group(function () {
        Route::get('/welcome', [AccountController::class, 'welcome'])->name('welcome');

        /* Fee manifest (G2/G3), metered unlock (G4), wallet, checkout */
        Route::post('/fees/manifest', [CommerceController::class, 'createManifest'])->name('fees.manifest');
        Route::get('/fees/{quote}', [CommerceController::class, 'manifest'])->name('fees.show');
        Route::post('/fees/{quote}/checkout', [CommerceController::class, 'checkoutManifest'])->name('fees.checkout');
        Route::get('/unlock/{code}/approve', [CommerceController::class, 'approval'])->name('unlock.approval');
        Route::post('/unlock/{code}/approve', [CommerceController::class, 'approve'])->name('unlock.approve');
        Route::get('/wallet', [CommerceController::class, 'wallet'])->name('wallet');
        Route::post('/wallet/top-up', [CommerceController::class, 'topUp'])->name('wallet.topup');
        Route::post('/wallet/auto-recharge', [CommerceController::class, 'autoRecharge'])->name('wallet.auto');
        Route::get('/checkout/{reference}', [CommerceController::class, 'checkout'])->name('checkout');
        Route::post('/checkout/{reference}', [CommerceController::class, 'billing'])->name('checkout.billing');
        Route::get('/checkout/{reference}/success', [CommerceController::class, 'success'])->name('checkout.success');

        /* Store purchase and report configuration -> quotation -> delivery */
        Route::post('/store/{brief}/buy', [StoreController::class, 'buy'])->name('store.buy');
        Route::get('/store/{brief}/configure', [StoreController::class, 'configure'])->name('store.configure');
        Route::get('/reports/{ref}/configure', [StoreController::class, 'editor'])->name('reports.configure');
        Route::post('/reports/{ref}/step', [StoreController::class, 'saveStep'])->name('reports.step');
        Route::post('/reports/{ref}/quote', [StoreController::class, 'quote'])->name('reports.quote.issue');
        Route::get('/reports/{ref}/quote', [StoreController::class, 'quotation'])->name('reports.quote');
        Route::post('/reports/{ref}/accept', [StoreController::class, 'accept'])->name('reports.accept');
        Route::post('/reports/{ref}/changes', [StoreController::class, 'requestChanges'])->name('reports.changes');

        /* Stage 4: custom intelligence request */
        Route::get('/custom-intelligence', [EngagementController::class, 'customRequest'])->name('custom');

        /* --- Signed-in workspace ----------------------------------------- */
        Route::prefix('workspace')->name('workspace.')->group(function () {
            Route::get('/', [WorkspaceController::class, 'dashboard'])->name('dashboard');
            Route::get('/saved', [WorkspaceController::class, 'saved'])->name('saved');
            Route::get('/watchlist', [WorkspaceController::class, 'watchlist'])->name('watchlist');
            Route::redirect('/watchlists', '/aiim/workspace/watchlist');
            Route::post('/items', [WorkspaceController::class, 'toggle'])->name('items.toggle');
            Route::patch('/items/{item}/alerts', [WorkspaceController::class, 'toggleAlerts'])->name('items.alerts');

            Route::get('/compare', [WorkspaceController::class, 'builder'])->name('compare');
            Route::post('/compare/items', [WorkspaceController::class, 'addItem'])->name('compare.add');
            Route::delete('/compare/items', [WorkspaceController::class, 'removeItem'])->name('compare.remove');
            Route::post('/compare/clear', [WorkspaceController::class, 'clear'])->name('compare.clear');
            Route::post('/compare/generate', [WorkspaceController::class, 'generate'])->name('compare.generate');
            Route::get('/compare/{comparison}', [WorkspaceController::class, 'results'])->name('compare.results');
            Route::get('/compare/{comparison}/export', [WorkspaceController::class, 'exportComparison'])->name('compare.export');

            Route::get('/entitlements', [CommerceController::class, 'entitlements'])->name('entitlements');
            Route::get('/entitlements/{entitlement}', [CommerceController::class, 'entitlement'])->name('entitlement');
            Route::post('/entitlements/{entitlement}/view', [CommerceController::class, 'consume'])->name('entitlement.view');

            Route::get('/reports', [StoreController::class, 'reports'])->name('reports');
            Route::get('/reports/{ref}', [StoreController::class, 'delivery'])->name('report');

            /* Stages 5–6: advisor request, discovery, quote, letter, signature, deposit */
            Route::get('/advisor-request', [EngagementController::class, 'advisorRequest'])->name('advisor');
            Route::post('/engagements/request', [EngagementController::class, 'saveRequest'])->name('engagements.request');
            Route::get('/engagements', [EngagementController::class, 'index'])->name('engagements');
            Route::get('/engagements/{ref}', [EngagementController::class, 'show'])->name('engagement');
            Route::post('/engagements/{ref}/message', [EngagementController::class, 'message'])->name('engagement.message');
            Route::get('/engagements/{ref}/discovery', [EngagementController::class, 'discovery'])->name('engagement.discovery');
            Route::get('/engagements/{ref}/booked', [EngagementController::class, 'booked'])->name('engagement.booked');
            Route::get('/engagements/{ref}/discovery/confirmed', [EngagementController::class, 'confirmed'])->name('engagement.confirmed');
            Route::post('/engagements/{ref}/discovery/cancel', [EngagementController::class, 'cancelBooking'])->name('engagement.discovery.cancel');
            Route::get('/engagements/{ref}/outcome', [EngagementController::class, 'outcome'])->name('engagement.outcome');
            Route::get('/engagements/{ref}/quote', [EngagementController::class, 'quote'])->name('engagement.quote');
            Route::post('/engagements/{ref}/quote', [EngagementController::class, 'acceptQuote'])->name('engagement.quote.accept');
            Route::get('/engagements/{ref}/letter', [EngagementController::class, 'letter'])->name('engagement.letter');
            Route::post('/engagements/{ref}/letter', [EngagementController::class, 'acceptLetter'])->name('engagement.letter.accept');
            Route::get('/engagements/{ref}/sign', [EngagementController::class, 'sign'])->name('engagement.sign');
            Route::post('/engagements/{ref}/sign', [EngagementController::class, 'applySignature'])->name('engagement.sign.apply');
            Route::get('/engagements/{ref}/pay', [EngagementController::class, 'pay'])->name('engagement.pay');
            Route::post('/engagements/{ref}/pay', [EngagementController::class, 'payDeposit'])->name('engagement.pay.deposit');

            /* Stages 7–15: mandate screens (TODO backend: POST actions) */
            Route::get('/engagements/{ref}/verification/{view?}', [MandateController::class, 'verification'])->name('mandate.verification');
            Route::get('/engagements/{ref}/deep-dive', [MandateController::class, 'deepDive'])->name('mandate.deepdive');
            Route::get('/engagements/{ref}/packaging', [MandateController::class, 'packaging'])->name('mandate.packaging');
            Route::get('/engagements/{ref}/introductions/{view?}', [MandateController::class, 'introductions'])->name('mandate.introductions');
            Route::get('/engagements/{ref}/handoff/{target}', [MandateController::class, 'handoff'])->name('mandate.handoff');
            Route::get('/engagements/{ref}/delivery', [MandateController::class, 'delivery'])->name('mandate.delivery');
            Route::get('/engagements/{ref}/ledger', [MandateController::class, 'ledger'])->name('mandate.ledger');
            Route::get('/engagements/{ref}/{kind}', [MandateController::class, 'caseFile'])->whereIn('kind', ['change', 'refund', 'dispute', 'pause', 'restart', 'cancel'])->name('mandate.case');

            /* Desks, monitoring and archive (TODO backend: actions) */
            Route::get('/enterprise', [DeskController::class, 'enterprise'])->name('enterprise');
            Route::get('/institutional', [DeskController::class, 'institutional'])->name('institutional');
            Route::get('/developer', [DeskController::class, 'developer'])->name('developer');
            Route::get('/alerts', [DeskController::class, 'alerts'])->name('alerts');
            Route::get('/archive', [DeskController::class, 'archive'])->name('archive');
        });
    });
});

/* --- Staff consoles ------------------------------------------------------ */
Route::prefix('admin/aiim')->name('admin.aiim.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/advisor', [AdminController::class, 'advisor'])->name('advisor');
    Route::get('/finance', [AdminController::class, 'finance'])->name('finance');
    Route::get('/pricing', [AdminController::class, 'pricing'])->name('pricing');
    Route::get('/sources', [AdminController::class, 'sources'])->name('sources');
});
