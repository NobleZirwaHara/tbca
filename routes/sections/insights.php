<?php

use App\Http\Controllers\Insights\IndustryAdminController;
use App\Http\Controllers\Insights\IndustryController;
use App\Http\Controllers\Insights\IndustryWorkspaceController;
use App\Http\Controllers\Insights\ResourceAccountController;
use App\Http\Controllers\Insights\ResourceAdminController;
use App\Http\Controllers\Insights\ResourceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Insights: Industries transaction ecosystem + TBCA Resources
|--------------------------------------------------------------------------
*/

/* --- Industries (public) ------------------------------------------------ */
Route::get('/industries', [IndustryController::class, 'index'])->name('industries');
Route::prefix('industries')->name('industries.')->group(function () {
    Route::get('/select', [IndustryController::class, 'select'])->name('select');
    Route::post('/context', [IndustryController::class, 'setContext'])->name('context');
    Route::delete('/context', [IndustryController::class, 'clearContext'])->name('context.clear');
    Route::post('/guidance', [IndustryController::class, 'guidance'])->name('guidance');
    Route::get('/diagnostics', [IndustryController::class, 'hub'])->defaults('area', 'diagnostic')->name('hub.diagnostics');
    Route::get('/sector-intelligence', [IndustryController::class, 'hub'])->defaults('area', 'sector-intelligence')->name('hub.intelligence');
    Route::get('/benchmarks', [IndustryController::class, 'hub'])->defaults('area', 'benchmarks')->name('hub.benchmarks');
    Route::get('/partners', [IndustryController::class, 'hub'])->defaults('area', 'partners')->name('hub.partners');

    /* Client workspace (signed-in) */
    Route::middleware('auth')->prefix('workspace')->name('workspace.')->controller(IndustryWorkspaceController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{engagement}', 'dashboard')->name('dashboard');
        Route::get('/{engagement}/verification', 'verification')->name('verification');
        Route::post('/{engagement}/verification/{evidence}', 'submitEvidence')->name('verification.submit');
        Route::get('/{engagement}/verification-export', 'exportEvidence')->name('verification.export');
        Route::get('/{engagement}/reclassification', 'reclassification')->name('reclassification');
        Route::post('/{engagement}/reclassification/{notice}', 'respondNotice')->name('reclassification.respond');
        Route::get('/{engagement}/reclassification/{notice}/print', 'printNotice')->name('reclassification.print');
        Route::get('/{engagement}/ledger', 'ledger')->name('ledger');
        Route::get('/{engagement}/ledger-export', 'exportLedger')->name('ledger.export');
        Route::get('/{engagement}/abort-ladder', 'abortLadder')->name('abort');
        Route::post('/{engagement}/abort', 'abort')->name('abort.submit');
        Route::get('/{engagement}/abort-policy', 'abortPolicy')->name('abort.policy');
        Route::get('/{engagement}/engagement-letter', 'letter')->name('letter');
        Route::post('/{engagement}/engagement-letter/sign', 'signLetter')->name('letter.sign');
        Route::get('/{engagement}/engagement-letter/pdf', 'letterPdf')->name('letter.pdf');
        Route::get('/{engagement}/split-checkout', 'splitCheckout')->name('split');
        Route::post('/{engagement}/split-checkout', 'submitSplit')->name('split.submit');
        Route::get('/{engagement}/payment-return', 'paymentReturn')->name('payment.return');
        Route::get('/{engagement}/gates', 'gates')->name('gates');
        Route::post('/{engagement}/gates/{gate}', 'decideGate')->name('gates.decide');
        Route::get('/{engagement}/partner-route', 'partnerRoute')->name('partner');
        Route::post('/{engagement}/partner-route', 'selectPartner')->name('partner.select');
        Route::get('/{engagement}/specialist-review', 'specialistReview')->name('review');
        Route::post('/{engagement}/specialist-review', 'reviewAction')->name('review.action');
        Route::get('/{engagement}/compliance-calendar', 'compliance')->name('compliance');
        Route::post('/{engagement}/compliance-calendar', 'storeObligation')->name('compliance.store');
        Route::post('/{engagement}/compliance-calendar/{obligation}/complete', 'completeObligation')->name('compliance.complete');
        Route::get('/{engagement}/compliance-calendar.ics', 'complianceIcs')->name('compliance.ics');
        Route::get('/{engagement}/benchmark-contribution', 'benchmarkConsent')->name('consent');
        Route::post('/{engagement}/benchmark-contribution', 'saveBenchmarkConsent')->name('consent.save');
    });

    Route::get('/sector-intelligence/{industry}', [IndustryController::class, 'brief'])->name('brief');
    Route::post('/sector-intelligence/{industry}/purchase', [IndustryController::class, 'purchaseBrief'])->middleware('auth')->name('brief.purchase');
    Route::get('/{industry}', [IndustryController::class, 'show'])->name('show');
    Route::get('/{industry}/diagnostic', [IndustryController::class, 'diagnostic'])->name('diagnostic');
    Route::post('/{industry}/diagnostic', [IndustryController::class, 'diagnosticStep'])->name('diagnostic.step');
    Route::post('/{industry}/diagnostic/restart', [IndustryController::class, 'diagnosticRestart'])->name('diagnostic.restart');
    Route::get('/{industry}/benchmarks', [IndustryController::class, 'benchmarks'])->name('benchmarks');
    Route::get('/{industry}/partners', [IndustryController::class, 'partners'])->name('partners');
    Route::get('/{industry}/country/{country}', [IndustryController::class, 'country'])->name('country');
    Route::get('/{industry}/services/{sku}', [IndustryController::class, 'service'])->name('service');
    Route::post('/{industry}/services/{sku}/engage', [IndustryController::class, 'engage'])->middleware('auth')->name('service.engage');
    Route::get('/{industry}/services/{sku}/disclosure', [IndustryController::class, 'disclosurePdf'])->name('service.disclosure');
});

/* --- Industries governance console -------------------------------------- */
Route::middleware(['auth', 'admin'])->prefix('admin/insights/industries')->name('admin.insights.industries.')->controller(IndustryAdminController::class)->group(function () {
    Route::get('/', 'overview')->name('overview');
    Route::get('/taxonomy', 'taxonomy')->name('taxonomy');
    Route::post('/taxonomy', 'storeIndustry')->name('taxonomy.store');
    Route::put('/taxonomy/{industry}', 'updateIndustry')->name('taxonomy.update');
    Route::post('/taxonomy/{industry}/sub-industries', 'storeSubIndustry')->name('taxonomy.sub');
    Route::get('/taxonomy-export', 'exportTaxonomy')->name('taxonomy.export');
    Route::get('/classification', 'classification')->name('classification');
    Route::put('/classification/{sku:id}', 'classify')->name('classification.update');
    Route::get('/margin', 'margin')->name('margin');
    Route::put('/margin/{sku:id}', 'updateDrivers')->name('margin.update');
    Route::post('/margin/apply-floor', 'applyFloor')->name('margin.floor');
    Route::get('/margin-export', 'exportMargin')->name('margin.export');
    Route::get('/blocked', 'blocked')->name('blocked');
    Route::post('/blocked', 'block')->name('blocked.store');
    Route::put('/blocked/{sku:id}', 'updateBlock')->name('blocked.update');
    Route::get('/regulators', 'regulators')->name('regulators');
    Route::post('/regulators', 'storeRegulator')->name('regulators.store');
    Route::put('/regulators/{regulator}', 'updateRegulator')->name('regulators.update');
    Route::get('/regulators-export', 'exportRegulators')->name('regulators.export');
    Route::get('/misdeclarations', 'misdeclarations')->name('misdeclarations');
    Route::post('/misdeclarations', 'storeMisdeclaration')->name('misdeclarations.store');
    Route::put('/misdeclarations/{misdeclaration}', 'updateMisdeclaration')->name('misdeclarations.update');
    Route::get('/benchmarks', 'benchmarks')->name('benchmarks');
    Route::post('/benchmarks', 'storeBenchmark')->name('benchmarks.store');
    Route::put('/benchmarks/{benchmark}', 'updateBenchmark')->name('benchmarks.update');
    Route::get('/activation', 'activation')->name('activation');
    Route::post('/activation/{industry}/advance', 'advance')->name('activation.advance');
    Route::get('/whatsapp', 'whatsapp')->name('whatsapp');
    Route::post('/whatsapp', 'storeFlow')->name('whatsapp.store');
    Route::put('/whatsapp/{flow}', 'updateFlow')->name('whatsapp.update');
});

/* --- Resources (public) ------------------------------------------------- */
Route::get('/resources', [ResourceController::class, 'index'])->name('resources');
Route::prefix('resources')->name('resources.')->group(function () {
    Route::get('/library', [ResourceController::class, 'library'])->defaults('collection', 'library')->name('library');
    Route::get('/guides-reports', [ResourceController::class, 'library'])->defaults('collection', 'guides-reports')->name('guides');
    Route::get('/templates-tools', [ResourceController::class, 'library'])->defaults('collection', 'templates-tools')->name('tools');
    Route::get('/insights', [ResourceController::class, 'insights'])->name('insights');
    Route::get('/case-studies/{resource}', [ResourceController::class, 'caseStudy'])->name('case-study');
    Route::get('/free-vs-paid', [ResourceController::class, 'page'])->defaults('page', 'FreeVsPaid')->name('free-vs-paid');
    Route::get('/free-diagnostic', [ResourceController::class, 'freeDiagnostic'])->name('free-diagnostic');
    Route::post('/free-diagnostic', [ResourceController::class, 'storeFreeDiagnostic'])->name('free-diagnostic.store');
    Route::get('/free-diagnostic/{reference}', [ResourceController::class, 'freeDiagnosticResult'])->name('free-diagnostic.result');
    Route::get('/faq', [ResourceController::class, 'faq'])->name('faq');
    Route::get('/content-status', [ResourceController::class, 'contentStatus'])->name('content-status');
    Route::get('/value-exchange', [ResourceController::class, 'page'])->defaults('page', 'ValueExchange')->name('value-exchange');
    Route::get('/data-statement', [ResourceController::class, 'page'])->defaults('page', 'DataStatement')->name('data-statement');
    Route::get('/limitations', [ResourceController::class, 'page'])->defaults('page', 'Limitations')->name('limitations');
    Route::get('/monetisation', [ResourceController::class, 'page'])->defaults('page', 'Monetisation')->name('monetisation');
    Route::get('/consent', [ResourceController::class, 'consent'])->name('consent');
    Route::post('/consent', [ResourceController::class, 'storeConsent'])->name('consent.store');
    Route::get('/preferences', [ResourceController::class, 'preferences'])->name('preferences');
    Route::post('/preferences', [ResourceController::class, 'savePreferences'])->name('preferences.save');
    Route::get('/withdrawal', [ResourceController::class, 'withdrawal'])->name('withdrawal');
    Route::post('/withdrawal', [ResourceController::class, 'storeWithdrawal'])->name('withdrawal.store');
    Route::post('/subscribe', [ResourceController::class, 'subscribe'])->name('subscribe');
    Route::get('/webinars', [ResourceController::class, 'webinars'])->name('webinars');
    Route::get('/webinars/{webinar}/register', [ResourceController::class, 'webinarRegister'])->name('webinars.register');
    Route::post('/webinars/{webinar}/register', [ResourceController::class, 'storeRegistration'])->name('webinars.register.store');
    Route::get('/webinars/{webinar}/replay', [ResourceController::class, 'replay'])->name('webinars.replay');
    Route::post('/webinars/{webinar}/replay', [ResourceController::class, 'replayAccess'])->name('webinars.replay.access');

    /* Signed-in resource account */
    Route::middleware('auth')->prefix('account')->name('account.')->controller(ResourceAccountController::class)->group(function () {
        Route::get('/subscription', 'subscription')->name('subscription');
        Route::post('/subscription', 'subscribe')->name('subscription.start');
        Route::post('/subscription/{action}', 'manage')->whereIn('action', ['pause', 'resume', 'cancel'])->name('subscription.manage');
        Route::get('/library', 'library')->name('library');
        Route::get('/handoff', 'handoff')->name('handoff');
        Route::post('/handoff/book', 'bookHandoff')->name('handoff.book');
    });

    Route::get('/{resource}', [ResourceController::class, 'show'])->name('show');
    Route::get('/{resource}/download', [ResourceController::class, 'download'])->name('download');
    Route::get('/{resource}/access', [ResourceController::class, 'access'])->name('access');
    Route::post('/{resource}/access', [ResourceController::class, 'storeAccess'])->name('access.store');
    Route::get('/{resource}/checkout', [ResourceController::class, 'checkout'])->middleware('auth')->name('checkout');
    Route::post('/{resource}/checkout', [ResourceController::class, 'storeCheckout'])->middleware('auth')->name('checkout.store');
});

/* --- Resources editorial / governance console --------------------------- */
Route::middleware(['auth', 'admin'])->prefix('admin/insights/resources')->name('admin.insights.resources.')->controller(ResourceAdminController::class)->group(function () {
    Route::get('/', 'overview')->name('overview');
    Route::get('/records', 'records')->name('records');
    Route::get('/records/create', 'create')->name('records.create');
    Route::post('/records', 'store')->name('records.store');
    Route::get('/records/{resource}/edit', 'edit')->name('records.edit');
    Route::put('/records/{resource}', 'update')->name('records.update');
    Route::post('/records/{resource}/transition', 'transition')->name('records.transition');
    Route::post('/records/{resource}/reviewed', 'markReviewed')->name('records.reviewed');
    Route::get('/lifecycle', 'lifecycle')->name('lifecycle');
    Route::get('/decay', 'decay')->name('decay');
    Route::get('/protected', 'protectedCatalogue')->name('protected');
    Route::post('/protected/{resource}', 'toggleProtected')->name('protected.toggle');
    Route::get('/consents', 'consents')->name('consents');
    Route::post('/privacy-requests/{privacyRequest}', 'processRequest')->name('privacy.process');
    Route::get('/roi', 'roi')->name('roi');
    Route::get('/ai-outputs', 'aiOutputs')->name('ai');
    Route::post('/ai-outputs', 'storeAiOutput')->name('ai.store');
    Route::put('/ai-outputs/{aiOutput}', 'reviewAiOutput')->name('ai.review');
    Route::get('/whatsapp', 'whatsapp')->name('whatsapp');
    Route::post('/whatsapp/broadcast', 'broadcast')->name('whatsapp.broadcast');
});
