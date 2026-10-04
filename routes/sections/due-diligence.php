<?php

use App\Http\Controllers\DueDiligence\AdminController;
use App\Http\Controllers\DueDiligence\CaseActionController;
use App\Http\Controllers\DueDiligence\CaseController;
use App\Http\Controllers\DueDiligence\ConsentLinkController;
use App\Http\Controllers\DueDiligence\EnterpriseController;
use App\Http\Controllers\DueDiligence\PaymentController;
use App\Http\Controllers\DueDiligence\PublicController;
use App\Http\Controllers\DueDiligence\QuoteController;
use App\Support\DueDiligence\Catalogue;
use Illuminate\Support\Facades\Route;

/* --- Due Diligence (Part 4 blueprint, screens DD-001 to DD-051) ---------- */
Route::prefix('due-diligence')->name('due-diligence.')->group(function () {
    Route::get('/', [PublicController::class, 'index'])->name('index');
    Route::get('/services', [PublicController::class, 'services'])->name('services');
    Route::get('/start', [PublicController::class, 'start'])->name('start');
    Route::get('/pricing', [PublicController::class, 'pricing'])->name('pricing');

    /* Secure consent link for subjects and authorised signatories (no login). */
    Route::get('/consent/{token}', [ConsentLinkController::class, 'show'])->name('consent-link.show');
    Route::post('/consent/{token}', [ConsentLinkController::class, 'respond'])->middleware('throttle:10,1')->name('consent-link.respond');

    Route::middleware('auth')->group(function () {
        /* Enterprise screening (DD-023, DD-049) */
        Route::get('/enterprise/request', [EnterpriseController::class, 'request'])->name('enterprise.request');
        Route::post('/enterprise/request', [EnterpriseController::class, 'saveRequest'])->name('enterprise.request.save');
        Route::get('/enterprise/dashboard', [EnterpriseController::class, 'dashboard'])->name('enterprise.dashboard');
        Route::post('/enterprise/batches', [EnterpriseController::class, 'upload'])->name('enterprise.batches');
        Route::get('/enterprise/batches/template', [EnterpriseController::class, 'template'])->name('enterprise.template');
        Route::get('/enterprise/batches/{batch}/file', [EnterpriseController::class, 'batchFile'])->name('enterprise.batch-file');

        /* Quote journey (DD-018 to DD-027) */
        Route::post('/quotes', [QuoteController::class, 'store'])->name('quotes.store');
        Route::get('/quotes/{quote}', [QuoteController::class, 'show'])->name('quotes.show');
        Route::post('/quotes/{quote}/documents', [QuoteController::class, 'upload'])->name('quotes.upload');
        Route::delete('/quotes/{quote}/documents/{document}', [QuoteController::class, 'deleteDocument'])->name('quotes.documents.delete');
        Route::get('/quotes/{quote}/{step}', [QuoteController::class, 'step'])->whereIn('step', array_values(QuoteController::STEPS))->name('quotes.step');
        Route::post('/quotes/{quote}/{step}', [QuoteController::class, 'save'])->whereIn('step', array_values(QuoteController::STEPS))->name('quotes.save');

        /* Payment return (DD-028 to DD-030) */
        Route::get('/payment/{order}', [PaymentController::class, 'status'])->name('payment.status');

        /* Client case workspace (DD-031 to DD-051) */
        Route::get('/cases', [CaseController::class, 'index'])->name('cases.index');
        Route::get('/cases/{case}', [CaseController::class, 'show'])->name('cases.show');
        Route::get('/cases/{case}/report/download', [CaseController::class, 'download'])->name('cases.download');
        Route::get('/cases/{case}/documents/{document}', [CaseController::class, 'document'])->name('cases.document');
        Route::get('/cases/{case}/disputes/{dispute}', [CaseController::class, 'disputeOutcome'])->name('cases.dispute');
        Route::get('/cases/{case}/{page}', [CaseController::class, 'screen'])->whereIn('page', ['overview', 'subject', 'consent', 'evidence', 'missing', 'checks', 'risk', 'review', 'partner-review', 'report-status', 'report-ready', 'limitations', 'report', 'dispute', 'monitoring-offer', 'monitoring', 'vdr', 'close'])
            ->name('cases.page');

        Route::prefix('/cases/{case}')->name('cases.')->group(function () {
            Route::post('/subject', [CaseActionController::class, 'subject'])->name('subject.save');
            Route::post('/consents/{consent}/acknowledge', [CaseActionController::class, 'acknowledgeConsent'])->name('consent.acknowledge');
            Route::post('/consents/{consent}/withdraw', [CaseActionController::class, 'withdrawConsent'])->name('consent.withdraw');
            Route::post('/consent-requests', [CaseActionController::class, 'sendConsentRequest'])->name('consent.request');
            Route::post('/consent-requests/{consentRequest}/remind', [CaseActionController::class, 'remindConsent'])->whereNumber('consentRequest')->name('consent.remind');
            Route::post('/consent-gate', [CaseActionController::class, 'completeConsentGate'])->name('consent.complete');
            Route::post('/evidence', [CaseActionController::class, 'upload'])->name('evidence.upload');
            Route::delete('/documents/{document}', [CaseActionController::class, 'deleteDocument'])->name('documents.delete');
            Route::post('/intake', [CaseActionController::class, 'submitIntake'])->name('intake.submit');
            Route::post('/evidence/{item}/alternative', [CaseActionController::class, 'proposeAlternative'])->name('evidence.alternative');
            Route::post('/scope-change', [CaseActionController::class, 'scopeChange'])->name('scope-change');
            Route::post('/findings/{finding}/respond', [CaseActionController::class, 'respondFinding'])->name('findings.respond');
            Route::post('/requests/{infoRequest}/respond', [CaseActionController::class, 'respondRequest'])->name('requests.respond');
            Route::post('/limitations', [CaseActionController::class, 'acknowledge'])->name('limitations.acknowledge');
            Route::post('/disputes', [CaseActionController::class, 'openDispute'])->name('disputes.store');
            Route::post('/disputes/{dispute}/appeal', [CaseActionController::class, 'appeal'])->name('disputes.appeal');
            Route::post('/monitoring', [CaseActionController::class, 'startMonitoring'])->name('monitoring.start');
            Route::post('/monitoring/cancel', [CaseActionController::class, 'cancelMonitoring'])->name('monitoring.cancel');
            Route::post('/close', [CaseActionController::class, 'close'])->name('close.save');
        });
    });

    /* Family overviews with tabs (DD-003 to DD-016). Registered last so fixed paths win. */
    Route::get('/{slug}/{tab?}', [PublicController::class, 'family'])
        ->whereIn('slug', [...Catalogue::slugs(), 'enterprise-api'])
        ->whereIn('tab', array_keys(PublicController::TABS))
        ->name('family');
});

/* Due Diligence operations console. */
Route::prefix('admin/due-diligence')->name('admin.due-diligence.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/cases', [AdminController::class, 'cases'])->name('cases');
    Route::get('/cases/{case}', [AdminController::class, 'show'])->name('cases.show');
    Route::post('/cases/{case}/transition', [AdminController::class, 'transition'])->name('cases.transition');
    Route::post('/cases/{case}/review', [AdminController::class, 'review'])->name('cases.review');
    Route::post('/cases/{case}/partner', [AdminController::class, 'partner'])->name('cases.partner');
    Route::post('/cases/{case}/checks/{check}', [AdminController::class, 'check'])->name('cases.check');
    Route::post('/cases/{case}/findings', [AdminController::class, 'finding'])->name('cases.finding');
    Route::post('/cases/{case}/findings/{finding}', [AdminController::class, 'disposition'])->name('cases.disposition');
    Route::post('/cases/{case}/requests', [AdminController::class, 'request'])->name('cases.request');
    Route::post('/cases/{case}/requests/{infoRequest}', [AdminController::class, 'resolveRequest'])->name('cases.request.resolve');
    Route::post('/cases/{case}/evidence/{item}', [AdminController::class, 'evidence'])->name('cases.evidence');
    Route::post('/cases/{case}/consents/{consent}', [AdminController::class, 'consent'])->name('cases.consent');
    Route::post('/cases/{case}/tasks/{task}', [AdminController::class, 'task'])->name('cases.task');
    Route::post('/cases/{case}/disputes/{dispute}', [AdminController::class, 'dispute'])->name('cases.dispute');
    Route::post('/cases/{case}/closure', [AdminController::class, 'approveClosure'])->name('cases.closure');
    Route::get('/enterprise', [AdminController::class, 'enterprise'])->name('enterprise');
    Route::post('/enterprise/{enterpriseRequest}', [AdminController::class, 'enterpriseStatus'])->name('enterprise.status');
    Route::post('/batches/{batch}/advance', [AdminController::class, 'advanceBatch'])->name('batches.advance');
    Route::post('/subscriptions/{subscription}/alerts', [AdminController::class, 'alert'])->name('alerts.store');
    Route::post('/alerts/{alert}', [AdminController::class, 'reviewAlert'])->name('alerts.review');
});

/* Permanent redirect required by Section 17. Campaign parameters are retained. */
Route::permanentRedirect('/digital-due-diligence', '/due-diligence');
