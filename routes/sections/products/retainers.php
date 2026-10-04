<?php

use App\Http\Controllers\Products\Retainers\AdminController;
use App\Http\Controllers\Products\Retainers\ProposalController;
use App\Http\Controllers\Products\Retainers\PublicController;
use App\Http\Controllers\Products\Retainers\WorkspaceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Retainers — public journey, client workspace and governance consoles
|--------------------------------------------------------------------------
| Static paths are registered before the /retainers/{service} wildcard.
*/

Route::name('products.retainers.')->group(function () {
    /* ---- Admin consoles (Screens 21-29) -------------------------------- */
    Route::middleware(['auth', 'admin'])->prefix('admin/products/retainers')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('index');

        Route::get('/capacity-test', [AdminController::class, 'capacityTest'])->name('capacity-test');
        Route::post('/capacity-test/scenario', [AdminController::class, 'runScenario'])->name('scenario');
        Route::delete('/capacity-test/scenario/{scenario}', [AdminController::class, 'deleteScenario'])->name('scenario.delete');
        Route::post('/capacity-test/services/{service:id}/certify', [AdminController::class, 'certify'])->name('certify');

        Route::get('/capacity-register', [AdminController::class, 'capacityRegister'])->name('capacity-register');
        Route::post('/capacity-register/commitments', [AdminController::class, 'storeCommitment'])->name('commitments.store');
        Route::post('/capacity-register/commitments/{commitment}/status', [AdminController::class, 'commitmentStatus'])->name('commitments.status');
        Route::post('/capacity-register/proposals/{proposal:id}/reserve', [AdminController::class, 'reserveCapacity'])->name('reserve');
        Route::post('/capacity-register/pools/{pool}', [AdminController::class, 'updatePool'])->name('pools.update');

        Route::get('/allocation', [AdminController::class, 'allocation'])->name('allocation');
        Route::post('/allocation', [AdminController::class, 'saveAllocation'])->name('allocation.save');
        Route::post('/allocation/usage', [AdminController::class, 'logUsage'])->name('usage.log');

        Route::get('/under-use', [AdminController::class, 'underUse'])->name('under-use');
        Route::post('/under-use/detect', [AdminController::class, 'detectUnderUse'])->name('under-use.detect');
        Route::post('/under-use/bulk', [AdminController::class, 'bulkAlerts'])->name('under-use.bulk');
        Route::post('/under-use/{alert}', [AdminController::class, 'alertAction'])->name('under-use.action');

        Route::get('/scope-creep', [AdminController::class, 'scopeCreep'])->name('scope-creep');
        Route::post('/scope-creep', [AdminController::class, 'storeScope'])->name('scope-creep.store');
        Route::post('/scope-creep/{change}', [AdminController::class, 'decideScope'])->name('scope-creep.decide');

        Route::get('/profitability', [AdminController::class, 'profitability'])->name('profitability');
        Route::post('/profitability/review', [AdminController::class, 'commercialReview'])->name('profitability.review');

        Route::get('/below-floor', [AdminController::class, 'belowFloor'])->name('below-floor');
        Route::post('/below-floor/{retainer:id}/remediate', [AdminController::class, 'remediate'])->name('below-floor.remediate');

        Route::get('/substitution', [AdminController::class, 'substitution'])->name('substitution');
        Route::post('/substitution', [AdminController::class, 'storeSubstitution'])->name('substitution.store');
        Route::post('/substitution/{substitution}/notice', [AdminController::class, 'issueNotice'])->name('substitution.notice');

        Route::get('/rollover', [AdminController::class, 'rollover'])->name('rollover');
        Route::post('/rollover/periods/{period}/reconcile', [AdminController::class, 'reconcile'])->name('reconcile');
        Route::post('/rollover/disputes/{dispute}', [AdminController::class, 'resolveDispute'])->name('dispute.resolve');
    });

    /* ---- Public journey ------------------------------------------------ */
    Route::get('/retainers', [PublicController::class, 'landing'])->name('index');
    Route::get('/retainers/compare', [PublicController::class, 'compare'])->name('compare');
    Route::get('/retainers/choose', [PublicController::class, 'choose'])->name('choose');
    Route::get('/retainers/allowance-sizing', [PublicController::class, 'sizing'])->name('sizing');
    Route::get('/retainers/proposal-request', [PublicController::class, 'proposalRequest'])->name('proposal-request');
    Route::post('/retainers/proposal-request', [PublicController::class, 'submitProposalRequest'])->middleware('auth')->name('proposal-request.store');

    Route::middleware('auth')->group(function () {
        Route::get('/retainers/proposal/{proposal}', [ProposalController::class, 'review'])->name('proposal');
        Route::post('/retainers/proposal/{proposal}/accept', [ProposalController::class, 'accept'])->name('proposal.accept');
        Route::post('/retainers/proposal/{proposal}/decline', [ProposalController::class, 'decline'])->name('proposal.decline');
        Route::get('/retainers/agreement/{proposal}', [ProposalController::class, 'agreement'])->name('agreement');
        Route::post('/retainers/agreement/{proposal}/sign', [ProposalController::class, 'sign'])->name('agreement.sign');

        /* ---- Client workspace (Screens 10-20, 4b) ---------------------- */
        Route::prefix('retainers/account')->name('account.')->group(function () {
            Route::get('/', [WorkspaceController::class, 'index'])->name('index');
            Route::get('/{retainer}', [WorkspaceController::class, 'meter'])->name('meter');
            Route::get('/{retainer}/ledger', [WorkspaceController::class, 'ledger'])->name('ledger');
            Route::get('/{retainer}/ledger/{usage}/dispute', [WorkspaceController::class, 'dispute'])->name('dispute');
            Route::post('/{retainer}/ledger/{usage}/dispute', [WorkspaceController::class, 'storeDispute'])->name('dispute.store');
            Route::get('/{retainer}/utilisation', [WorkspaceController::class, 'utilisation'])->name('utilisation');
            Route::post('/{retainer}/utilisation', [WorkspaceController::class, 'storeUtilisation'])->name('utilisation.store');
            Route::get('/{retainer}/scope-change', [WorkspaceController::class, 'scope'])->name('scope');
            Route::post('/{retainer}/scope-change', [WorkspaceController::class, 'storeScope'])->name('scope.store');
            Route::get('/{retainer}/overage', [WorkspaceController::class, 'overage'])->name('overage');
            Route::post('/{retainer}/overage', [WorkspaceController::class, 'storeOverage'])->name('overage.store');
            Route::get('/{retainer}/substitution', [WorkspaceController::class, 'substitution'])->name('substitution');
            Route::post('/{retainer}/substitution', [WorkspaceController::class, 'storeSubstitution'])->name('substitution.store');
            Route::get('/{retainer}/statement', [WorkspaceController::class, 'statement'])->name('statement');
            Route::post('/{retainer}/statement', [WorkspaceController::class, 'acknowledgeStatement'])->name('statement.ack');
            Route::get('/{retainer}/renew', [WorkspaceController::class, 'renew'])->name('renew');
            Route::post('/{retainer}/renew', [WorkspaceController::class, 'storeRenew'])->name('renew.store');
            Route::get('/{retainer}/cancel', [WorkspaceController::class, 'cancel'])->name('cancel');
            Route::post('/{retainer}/cancel', [WorkspaceController::class, 'storeCancel'])->name('cancel.store');
            Route::get('/{retainer}/sizing', [WorkspaceController::class, 'sizing'])->name('sizing');
            Route::post('/{retainer}/sizing', [WorkspaceController::class, 'storeSizing'])->name('sizing.store');
        });
    });

    /* ---- Product pages (wildcard last) --------------------------------- */
    Route::get('/retainers/{service}', [PublicController::class, 'show'])->name('show');
    Route::get('/retainers/{service}/exclusions', [PublicController::class, 'exclusions'])->name('exclusions');
    Route::post('/retainers/{service}/exclusions', [PublicController::class, 'acknowledgeExclusions'])->name('exclusions.ack');
    Route::get('/retainers/{service}/utilisation-economics', [PublicController::class, 'economics'])->name('economics');
    Route::post('/retainers/{service}/utilisation-economics', [PublicController::class, 'acknowledgeEconomics'])->name('economics.ack');
});
