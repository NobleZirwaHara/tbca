<?php

use App\Http\Controllers\Products\Subscriptions\AccountController;
use App\Http\Controllers\Products\Subscriptions\AdminController;
use App\Http\Controllers\Products\Subscriptions\PublicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Subscriptions family (Subscriptions Transaction Ecosystem Blueprint v2.0)
|--------------------------------------------------------------------------
| Public:     /subscriptions/...
| Workspace:  /subscriptions/account/...          (auth)
| Admin:      /admin/products/subscriptions/...   (auth + admin)
*/

Route::name('products.subscriptions.')->group(function () {
    /* ---------------- signed-in client workspace (registered before /{plan}) */
    Route::middleware('auth')->prefix('subscriptions/account')->name('account.')->controller(AccountController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{subscription}', 'show')->name('show');
        Route::get('/{subscription}/engagement', 'engagement')->name('engagement');
        Route::get('/{subscription}/disuse', 'disuse')->name('disuse');
        Route::post('/{subscription}/disuse', 'disuseChoice')->name('disuse.choose');
        Route::get('/{subscription}/change-plan', 'changePlan')->name('change-plan');
        Route::post('/{subscription}/change-plan', 'applyChange')->name('change-plan.apply');
        Route::get('/{subscription}/pause', 'pause')->name('pause');
        Route::post('/{subscription}/pause', 'confirmPause')->name('pause.confirm');
        Route::post('/{subscription}/resume', 'resume')->name('resume');
        Route::get('/{subscription}/cancel', 'cancel')->name('cancel');
        Route::post('/{subscription}/cancel', 'cancelStep')->name('cancel.step');
        Route::post('/{subscription}/cancel/withdraw', 'withdrawCancel')->name('cancel.withdraw');
        Route::get('/{subscription}/cancelled', 'cancelled')->name('cancelled');
        Route::get('/{subscription}/export', 'export')->name('export');
        Route::get('/{subscription}/export/{type}', 'download')->name('export.download');
        Route::post('/{subscription}/export/request', 'requestExport')->name('export.request');
        Route::get('/{subscription}/renewal', 'renewal')->name('renewal');
        Route::post('/{subscription}/renewal', 'continueRenewal')->name('renewal.continue');
        Route::get('/{subscription}/price-change', 'priceChange')->name('price-change');
        Route::post('/{subscription}/price-change', 'decidePriceChange')->name('price-change.decide');
        Route::get('/{subscription}/billing-recovery', 'billingRecovery')->name('billing-recovery');
        Route::post('/{subscription}/billing-recovery/pay', 'payOverdue')->name('billing-recovery.pay');
        Route::post('/{subscription}/billing-recovery/card', 'updateCard')->name('billing-recovery.card');
        Route::get('/{subscription}/reactivate', 'reactivate')->name('reactivate');
        Route::post('/{subscription}/reactivate', 'confirmReactivate')->name('reactivate.confirm');
    });

    /* ---------------- commerce */
    Route::middleware('auth')->group(function () {
        Route::get('/subscriptions/checkout/{plan}', [PublicController::class, 'checkout'])->name('checkout');
        Route::post('/subscriptions/checkout/{plan}', [PublicController::class, 'subscribe'])->name('subscribe');
        Route::get('/subscriptions/order/{order}/confirmed', [PublicController::class, 'confirmed'])->name('confirmed');
    });

    /* ---------------- public */
    Route::controller(PublicController::class)->group(function () {
        Route::get('/subscriptions', 'landing')->name('landing');
        Route::get('/subscriptions/compare', 'compare')->name('compare');
        Route::get('/subscriptions/choose-subscription', 'choose')->name('choose');
        Route::get('/subscriptions/choose-model', 'chooseModel')->name('choose-model');
        Route::get('/subscriptions/{plan}', 'show')->name('show');
        Route::get('/subscriptions/{plan}/disclosure', 'disclosure')->name('disclosure');
        Route::post('/subscriptions/{plan}/disclosure', 'acknowledge')->name('acknowledge');
    });

    /* ---------------- admin consoles */
    Route::middleware(['auth', 'admin'])->prefix('admin/products/subscriptions')->name('admin.')->controller(AdminController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/recurrence-test', 'recurrenceTest')->name('recurrence-test');
        Route::post('/recurrence-test/run', 'runTest')->name('recurrence-test.run');
        Route::get('/catalogue', 'catalogue')->name('catalogue');
        Route::post('/catalogue', 'storePlan')->name('catalogue.store');
        Route::post('/catalogue/{plan}/certify', 'certify')->name('catalogue.certify');
        Route::post('/catalogue/{plan}/retire', 'retire')->name('catalogue.retire');
        Route::post('/catalogue/{plan}/price-change', 'priceChange')->name('catalogue.price-change');
        Route::get('/deferred-revenue', 'deferredRevenue')->name('deferred-revenue');
        Route::post('/deferred-revenue/adjustment', 'adjustment')->name('deferred-revenue.adjustment');
        Route::get('/billing-calendar', 'billingCalendar')->name('billing-calendar');
        Route::post('/billing-calendar/run', 'triggerRun')->name('billing-calendar.run');
        Route::get('/dunning', 'dunning')->name('dunning');
        Route::post('/dunning/{op}', 'dunningAction')->name('dunning.action');
        Route::post('/dunning/subscription/{subscription}', 'dunningSubscription')->name('dunning.subscription');
        Route::get('/engagement', 'engagement')->name('engagement');
        Route::post('/engagement/check', 'runDisuseCheck')->name('engagement.check');
        Route::post('/engagement/{op}', 'disuseAction')->name('engagement.action');
        Route::get('/delivery-calendar', 'deliveryCalendar')->name('delivery-calendar');
        Route::post('/delivery-calendar', 'storeDelivery')->name('delivery-calendar.store');
        Route::post('/delivery-calendar/{op}', 'deliveryAction')->name('delivery-calendar.action');
        Route::get('/review-capacity', 'capacity')->name('review-capacity');
        Route::post('/review-capacity/{op}', 'capacityAction')->name('review-capacity.action');
        Route::get('/churn', 'churn')->name('churn');
        Route::post('/churn/action-plan', 'actionPlan')->name('churn.action-plan');
        Route::get('/below-floor', 'belowFloor')->name('below-floor');
        Route::post('/below-floor/check', 'floorCheck')->name('below-floor.check');
        Route::post('/below-floor/{plan}', 'floorAction')->name('below-floor.action');
    });
});
