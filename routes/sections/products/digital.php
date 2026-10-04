<?php

use App\Http\Controllers\Products\Digital\AdminActionController;
use App\Http\Controllers\Products\Digital\AdminController;
use App\Http\Controllers\Products\Digital\CatalogueController;
use App\Http\Controllers\Products\Digital\LibraryController;
use App\Http\Controllers\Products\Digital\PurchaseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Digital Products  (/digital-products, /digital-products/library, /admin/products/digital)
|--------------------------------------------------------------------------
| Purchase journey: licence -> options -> disclosure -> checkout -> shared
| payment -> payment status -> confirmed. Entitlements unlock downloads only
| once the linked order is paid (GATE-DP-15).
*/

Route::prefix('digital-products')->name('products.digital.')->group(function () {
    Route::get('/', [CatalogueController::class, 'index'])->name('index');
    Route::get('/browse', [CatalogueController::class, 'browse'])->name('browse');

    Route::middleware('auth')->group(function () {
        Route::get('/checkout', [PurchaseController::class, 'checkout'])->name('checkout');
        Route::post('/checkout', [PurchaseController::class, 'placeOrder'])->name('checkout.place');
        Route::get('/order/{order}/payment-status', [PurchaseController::class, 'paymentStatus'])->name('order.status');
        Route::get('/order/{order}/confirmed', [PurchaseController::class, 'confirmed'])->name('order.confirmed');
        Route::get('/order/{order}/receipt', [PurchaseController::class, 'receipt'])->name('order.receipt');

        Route::get('/library', [LibraryController::class, 'index'])->name('library');
        Route::get('/library/refund-and-issue', [LibraryController::class, 'refund'])->name('library.refund');
        Route::post('/library/refund-and-issue', [LibraryController::class, 'refundStore'])->name('library.refund.store');
        Route::get('/library/{entitlement}', [LibraryController::class, 'show'])->name('library.show');
        Route::get('/library/{entitlement}/download', [LibraryController::class, 'download'])->name('library.download');
        Route::get('/library/{entitlement}/updates', [LibraryController::class, 'updates'])->name('library.updates');
        Route::post('/library/{entitlement}/updates/{version}', [LibraryController::class, 'applyUpdate'])->whereNumber('version')->name('library.updates.apply');
        Route::post('/library/{entitlement}/notifications', [LibraryController::class, 'notifications'])->name('library.notifications');
        Route::get('/library/{entitlement}/upgrade', [LibraryController::class, 'upgrade'])->name('library.upgrade');
        Route::post('/library/{entitlement}/upgrade', [LibraryController::class, 'upgradeStore'])->name('library.upgrade.store');
        Route::get('/library/{entitlement}/maintained-access', [LibraryController::class, 'maintained'])->name('library.maintained');
        Route::post('/library/{entitlement}/maintained-access', [LibraryController::class, 'maintainedStore'])->name('library.maintained.store');
        Route::post('/library/{entitlement}/auto-renew', [LibraryController::class, 'autoRenew'])->name('library.autorenew');
        Route::get('/library/{entitlement}/version-status', [LibraryController::class, 'versionStatus'])->name('library.version');
        Route::get('/library/{entitlement}/next-steps', [LibraryController::class, 'nextSteps'])->name('library.next');
        Route::post('/library/{entitlement}/next-steps', [LibraryController::class, 'nextStepsStore'])->name('library.next.store');
    });

    Route::get('/{product}', [CatalogueController::class, 'show'])->name('show');
    Route::get('/{product}/licence', [PurchaseController::class, 'licence'])->name('licence');
    Route::post('/{product}/licence', [PurchaseController::class, 'licenceStore'])->name('licence.store');
    Route::get('/{product}/options', [PurchaseController::class, 'options'])->name('options');
    Route::post('/{product}/options', [PurchaseController::class, 'optionsStore'])->name('options.store');
    Route::get('/{product}/disclosure', [PurchaseController::class, 'disclosure'])->name('disclosure');
    Route::post('/{product}/disclosure', [PurchaseController::class, 'disclosureStore'])->name('disclosure.store');
});

Route::prefix('admin/products/digital')->name('products.digital.admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'controlCentre'])->name('index');
    Route::get('/defensibility', [AdminController::class, 'defensibility'])->name('defensibility');
    Route::get('/qa', [AdminController::class, 'qa'])->name('qa');
    Route::get('/claims', [AdminController::class, 'claims'])->name('claims');
    Route::get('/rights', [AdminController::class, 'rights'])->name('rights');
    Route::get('/versions', [AdminController::class, 'register'])->name('versions');
    Route::get('/corrections', [AdminController::class, 'corrections'])->name('corrections');
    Route::get('/delivery-reclassification', [AdminController::class, 'reclassification'])->name('reclass');
    Route::get('/pricing-floor', [AdminController::class, 'pricing'])->name('pricing');
    Route::get('/portfolio', [AdminController::class, 'portfolio'])->name('portfolio');
    Route::get('/marketplace-ip', [AdminController::class, 'marketplace'])->name('marketplace');
    Route::get('/control-tower', [AdminController::class, 'tower'])->name('tower');
    Route::get('/cases', [AdminController::class, 'cases'])->name('cases');

    Route::post('/defensibility/{product}/decide', [AdminActionController::class, 'defensibilityDecide'])->name('defensibility.decide');
    Route::post('/defensibility/{product}/test', [AdminActionController::class, 'defensibilityTest'])->name('defensibility.test');
    Route::post('/qa/{product}/check', [AdminActionController::class, 'qaCheck'])->name('qa.check');
    Route::post('/qa/{product}/run', [AdminActionController::class, 'qaRun'])->name('qa.run');
    Route::post('/qa/{product}/submit', [AdminActionController::class, 'qaSubmit'])->name('qa.submit');
    Route::post('/qa/{product}/release', [AdminActionController::class, 'qaRelease'])->name('qa.release');
    Route::post('/qa/{product}/note', [AdminActionController::class, 'qaNote'])->name('qa.note');
    Route::post('/claims', [AdminActionController::class, 'claimStore'])->name('claims.store');
    Route::post('/claims/{claim}/status', [AdminActionController::class, 'claimStatus'])->name('claims.status');
    Route::post('/rights', [AdminActionController::class, 'ipStore'])->name('rights.store');
    Route::post('/rights/{record}/status', [AdminActionController::class, 'ipStatus'])->name('rights.status');
    Route::post('/marketplace-ip/{record}/clearance', [AdminActionController::class, 'clearance'])->name('marketplace.clearance');
    Route::post('/versions/{entitlement}/notify', [AdminActionController::class, 'notify'])->name('versions.notify');
    Route::post('/versions/{entitlement}/correction', [AdminActionController::class, 'applyCorrection'])->name('versions.correction');
    Route::post('/corrections', [AdminActionController::class, 'incidentStore'])->name('corrections.store');
    Route::post('/corrections/{incident}/advance', [AdminActionController::class, 'incidentAdvance'])->name('corrections.advance');
    Route::post('/delivery-reclassification/{item}', [AdminActionController::class, 'reclassUpdate'])->name('reclass.update');
    Route::post('/pricing-floor/recalculate', [AdminActionController::class, 'priceRecalculate'])->name('pricing.recalculate');
    Route::post('/pricing-floor/{item}', [AdminActionController::class, 'priceStep'])->name('pricing.step');
    Route::post('/portfolio/{product}/disposition', [AdminActionController::class, 'disposition'])->name('portfolio.disposition');
    Route::post('/portfolio/{product}/subscription', [AdminActionController::class, 'subscription'])->name('portfolio.subscription');
    Route::post('/cases/{case}/decide', [AdminActionController::class, 'caseDecide'])->name('cases.decide');
});
