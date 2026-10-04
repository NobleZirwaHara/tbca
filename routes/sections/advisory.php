<?php

use App\Http\Controllers\Advisory\PaAdminController;
use App\Http\Controllers\Advisory\PaPublicController;
use App\Http\Controllers\Advisory\PaWorkspaceController;
use App\Http\Controllers\Advisory\ResolverController;
use App\Http\Controllers\Advisory\ServicesAdminController;
use App\Http\Controllers\Advisory\ServicesClientController;
use App\Http\Controllers\Advisory\ServicesController;
use App\Http\Controllers\Advisory\TechAdminController;
use App\Http\Controllers\Advisory\TechJourneyController;
use App\Http\Controllers\Advisory\TechWorkspaceController;
use Illuminate\Support\Facades\Route;

/* ===================== Services ===================== */
Route::get('/services', [ServicesController::class, 'index'])->name('services');
Route::prefix('services')->name('adv.services.')->group(function () {
    Route::get('/a-z', [ServicesController::class, 'atoz'])->name('atoz');
    Route::get('/a-z-service-category', fn () => redirect('/services/a-z'));
    Route::get('/catalogue/{slug}', [ServicesController::class, 'service'])->name('service');
    Route::get('/ways-to-work-with-tbca', [ServicesController::class, 'ways'])->name('ways');
    Route::get('/ways-to-work-with-tbca/{slug}', [ServicesController::class, 'vehicle'])->name('vehicle');
    Route::get('/enterprise-relationship', [ServicesController::class, 'enterprise'])->name('enterprise');
    Route::get('/business-consultancy', fn () => app(ServicesController::class)->family('business-consultancy'))->name('business');
    Route::get('/management-consultancy', fn () => app(ServicesController::class)->family('management-consultancy'))->name('management');
    Route::get('/capability/{slug}', [ServicesController::class, 'capability'])->name('capability');

    Route::get('/resolver/{step?}', [ResolverController::class, 'show'])->whereNumber('step')->name('resolver');
    Route::post('/resolver/{step}', [ResolverController::class, 'store'])->whereNumber('step')->name('resolver.store');
    Route::get('/choice-comparison', [ResolverController::class, 'comparison'])->name('comparison');
    Route::get('/not-sure-which', [ResolverController::class, 'notSure'])->name('not-sure');
    Route::post('/not-sure-which', [ResolverController::class, 'notSureStore'])->name('not-sure.store');
    Route::get('/honest-decline', [ResolverController::class, 'decline'])->name('decline');
    Route::post('/honest-decline', [ResolverController::class, 'declineStore'])->name('decline.store');
    Route::get('/mandatory-partner-escalation', [ResolverController::class, 'escalation'])->name('escalation');
    Route::post('/mandatory-partner-escalation', [ResolverController::class, 'escalationStore'])->name('escalation.store');

    Route::get('/proposal-request', [ServicesClientController::class, 'proposal'])->name('proposal');
    Route::post('/proposal-request', [ServicesClientController::class, 'proposalStore'])->name('proposal.store');
    Route::get('/vehicle-transition-proposal', [ServicesClientController::class, 'transition'])->name('transition');
    Route::get('/sprint-to-mandate-upgrade', [ServicesClientController::class, 'upgrade'])->name('upgrade');
    Route::get('/recurrence-conversion', [ServicesClientController::class, 'recurrence'])->name('recurrence');
    Route::get('/downgrade-exit', [ServicesClientController::class, 'downgrade'])->name('downgrade');

    Route::middleware('auth')->group(function () {
        Route::post('/vehicle-changes', [ServicesClientController::class, 'changeStore'])->name('changes.store');
        Route::get('/statement', [ServicesClientController::class, 'statement'])->name('statement');
        Route::get('/relationship', [ServicesClientController::class, 'relationship'])->name('relationship');
        Route::get('/vehicles/{vehicle}/fees', [ServicesClientController::class, 'fees'])->name('fees');
        Route::post('/vehicles/{vehicle}/pay', [ServicesClientController::class, 'pay'])->name('pay');
    });
});

/* ===================== Project Advisory ===================== */
Route::get('/project-advisory', [PaPublicController::class, 'index'])->name('project-advisory');
Route::prefix('project-advisory')->name('adv.pa.')->group(function () {
    Route::get('/context', [PaPublicController::class, 'context'])->name('context');
    Route::post('/context', [PaPublicController::class, 'contextStore'])->name('context.store');
    Route::get('/services/{slug}', [PaPublicController::class, 'service'])->name('service');
    Route::get('/readiness', [PaPublicController::class, 'readiness'])->name('readiness');
    Route::post('/readiness', [PaPublicController::class, 'readinessStore'])->name('readiness.store');
    Route::get('/cost-exposure', [PaPublicController::class, 'exposure'])->name('exposure');
    Route::post('/cost-exposure', [PaPublicController::class, 'exposureStore'])->name('exposure.store');
    Route::get('/studies', [PaPublicController::class, 'studies'])->name('studies');
    Route::post('/studies', [PaPublicController::class, 'studiesStore'])->name('studies.store');
    Route::get('/engagement-options', [PaPublicController::class, 'options'])->name('options');
    Route::post('/engagement-options', [PaPublicController::class, 'optionsStore'])->name('options.store');
    Route::get('/discovery', [PaPublicController::class, 'discovery'])->name('discovery');
    Route::post('/discovery', [PaPublicController::class, 'discoveryStore'])->name('discovery.store');
    Route::get('/evidence', [PaPublicController::class, 'evidence'])->name('evidence');
    Route::get('/contingent-fee-calculator', [PaPublicController::class, 'contingent'])->name('contingent');
    Route::get('/stop-now-ladder', [PaPublicController::class, 'stopNow'])->name('stop-now');

    Route::middleware('auth')->prefix('workspace')->name('ws.')->group(function () {
        Route::get('/', [PaWorkspaceController::class, 'index'])->name('index');
        Route::get('/{mandate}', [PaWorkspaceController::class, 'show'])->name('show');
        Route::get('/{mandate}/nda', [PaWorkspaceController::class, 'nda'])->name('nda');
        Route::post('/{mandate}/nda', [PaWorkspaceController::class, 'ndaSign'])->name('nda.sign');
        Route::get('/{mandate}/method-card', [PaWorkspaceController::class, 'methodCard'])->name('method');
        Route::post('/{mandate}/method-card', [PaWorkspaceController::class, 'methodDecision'])->name('method.decide');
        Route::get('/{mandate}/engagement-letter', [PaWorkspaceController::class, 'letter'])->name('letter');
        Route::post('/{mandate}/engagement-letter', [PaWorkspaceController::class, 'letterSign'])->name('letter.sign');
        Route::get('/{mandate}/mandate-letter', [PaWorkspaceController::class, 'mandateLetter'])->name('mandate');
        Route::post('/{mandate}/mandate-letter', [PaWorkspaceController::class, 'mandateSign'])->name('mandate.sign');
        Route::get('/{mandate}/ledger', [PaWorkspaceController::class, 'ledger'])->name('ledger');
        Route::get('/{mandate}/settlement', [PaWorkspaceController::class, 'settlement'])->name('settlement');
        Route::post('/{mandate}/lines/{line}/pay', [PaWorkspaceController::class, 'payLine'])->whereNumber('line')->name('lines.pay');
        Route::post('/{mandate}/lines/{line}/direct', [PaWorkspaceController::class, 'directPaid'])->whereNumber('line')->name('lines.direct');
        Route::get('/{mandate}/fee-meter', [PaWorkspaceController::class, 'feeMeter'])->name('meter');
        Route::get('/{mandate}/contingent', [PaWorkspaceController::class, 'contingent'])->name('contingent');
        Route::post('/{mandate}/gates/{code}', [PaWorkspaceController::class, 'gateDecision'])->name('gate');
        Route::post('/{mandate}/evidence/{index}', [PaWorkspaceController::class, 'evidenceUpload'])->whereNumber('index')->name('evidence');
        Route::post('/{mandate}/stop', [PaWorkspaceController::class, 'stop'])->name('stop');
    });
});

/* ===================== Technology Solutions ===================== */
Route::get('/technology-solutions', [TechJourneyController::class, 'index'])->name('technology-solutions');
Route::prefix('technology-solutions')->name('adv.ts.')->group(function () {
    Route::get('/context', [TechJourneyController::class, 'context'])->name('context');
    Route::post('/context', [TechJourneyController::class, 'contextStore'])->name('context.store');
    Route::get('/towers', [TechJourneyController::class, 'towers'])->name('towers');
    Route::post('/towers', [TechJourneyController::class, 'towersStore'])->name('towers.store');
    Route::get('/towers/{slug}', [TechJourneyController::class, 'tower'])->name('tower');
    Route::get('/readiness', [TechJourneyController::class, 'readiness'])->name('readiness');
    Route::post('/readiness', [TechJourneyController::class, 'readinessStore'])->name('readiness.store');
    Route::get('/configure', [TechJourneyController::class, 'configure'])->name('configure');
    Route::post('/configure', [TechJourneyController::class, 'configureStore'])->name('configure.store');
    Route::get('/scope', [TechJourneyController::class, 'scope'])->name('scope');
    Route::get('/fees', [TechJourneyController::class, 'fees'])->name('fees');
    Route::get('/external-costs', [TechJourneyController::class, 'externalCosts'])->name('external');
    Route::get('/checkout', [TechJourneyController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [TechJourneyController::class, 'checkoutStore'])->name('checkout.store');
    Route::get('/engagement-letter', [TechJourneyController::class, 'letter'])->name('letter');
    Route::post('/engagement-letter', [TechJourneyController::class, 'letterSign'])->middleware('auth')->name('letter.sign');
    Route::get('/sprints/{slug}', [TechJourneyController::class, 'sprint'])->name('sprint');
    Route::post('/sprints/{slug}', [TechJourneyController::class, 'sprintStart'])->name('sprint.start');

    Route::middleware('auth')->prefix('workspace')->name('ws.')->group(function () {
        Route::get('/', [TechWorkspaceController::class, 'index'])->name('index');
        Route::get('/{engagement}', [TechWorkspaceController::class, 'dashboard'])->name('dashboard');
        Route::get('/{engagement}/scope', [TechWorkspaceController::class, 'scope'])->name('scope');
        Route::get('/{engagement}/fee-meter', [TechWorkspaceController::class, 'feeMeter'])->name('meter');
        Route::get('/{engagement}/external-costs', [TechWorkspaceController::class, 'externalCosts'])->name('external');
        Route::get('/{engagement}/payments', [TechWorkspaceController::class, 'payments'])->name('payments');
        Route::get('/{engagement}/usage', [TechWorkspaceController::class, 'usage'])->name('usage');
        Route::get('/{engagement}/tasks', [TechWorkspaceController::class, 'tasks'])->name('tasks');
        Route::get('/{engagement}/documents', [TechWorkspaceController::class, 'documents'])->name('documents');
        Route::get('/{engagement}/uat', [TechWorkspaceController::class, 'uat'])->name('uat');
        Route::get('/{engagement}/subscription', [TechWorkspaceController::class, 'subscription'])->name('subscription');
        Route::get('/{engagement}/statement', [TechWorkspaceController::class, 'statement'])->name('statement');
        Route::get('/{engagement}/support', [TechWorkspaceController::class, 'support'])->name('support');
        Route::get('/{engagement}/exit', [TechWorkspaceController::class, 'exit'])->name('exit');

        Route::post('/{engagement}/gates/{number}', [TechWorkspaceController::class, 'gateDecision'])->whereNumber('number')->name('gate');
        Route::post('/{engagement}/tasks/{task}', [TechWorkspaceController::class, 'taskAction'])->whereNumber('task')->name('task');
        Route::post('/{engagement}/documents', [TechWorkspaceController::class, 'documentStore'])->name('documents.store');
        Route::post('/{engagement}/uat', [TechWorkspaceController::class, 'uatAction'])->name('uat.action');
        Route::post('/{engagement}/usage', [TechWorkspaceController::class, 'usageRequest'])->name('usage.request');
        Route::post('/{engagement}/subscription', [TechWorkspaceController::class, 'subscriptionAction'])->name('subscription.action');
        Route::post('/{engagement}/tickets', [TechWorkspaceController::class, 'ticketStore'])->name('tickets.store');
        Route::post('/{engagement}/exit', [TechWorkspaceController::class, 'exitAction'])->name('exit.action');
    });
});

/* ===================== Admin consoles ===================== */
Route::prefix('admin/advisory')->name('admin.advisory.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [PaAdminController::class, 'index'])->name('index');
    Route::get('/mandates/{mandate}', [PaAdminController::class, 'show'])->name('mandates.show');
    Route::post('/mandates/{mandate}', [PaAdminController::class, 'action'])->name('mandates.action');
    Route::get('/stop-now', [PaAdminController::class, 'stopNow'])->name('stop-now');
    Route::post('/stop-now/{rule}', [PaAdminController::class, 'toggleRule'])->name('stop-now.toggle');

    Route::get('/vehicles', [ServicesAdminController::class, 'vehicles'])->name('vehicles');
    Route::post('/vehicles', [ServicesAdminController::class, 'vehicleStore'])->name('vehicles.store');
    Route::post('/vehicles/{vehicle}/status', [ServicesAdminController::class, 'vehicleStatus'])->name('vehicles.status');
    Route::get('/crosswalk', [ServicesAdminController::class, 'crosswalk'])->name('crosswalk');
    Route::post('/crosswalk', [ServicesAdminController::class, 'crosswalkStore'])->name('crosswalk.store');
    Route::post('/crosswalk/validate', [ServicesAdminController::class, 'crosswalkValidate'])->name('crosswalk.validate');
    Route::post('/crosswalk/{crosswalk}', [ServicesAdminController::class, 'crosswalkVerify'])->name('crosswalk.verify');
    Route::get('/dispositions', [ServicesAdminController::class, 'dispositions'])->name('dispositions');
    Route::post('/dispositions/{disposition}', [ServicesAdminController::class, 'dispositionUpdate'])->name('dispositions.update');
    Route::get('/disposition-tool', [ServicesAdminController::class, 'dispositionTool'])->name('disposition-tool');
    Route::post('/disposition-tool', [ServicesAdminController::class, 'dispositionApply'])->name('disposition-tool.apply');
    Route::get('/below-floor', [ServicesAdminController::class, 'belowFloor'])->name('below-floor');
    Route::post('/below-floor/{vehicle}', [ServicesAdminController::class, 'remediate'])->name('below-floor.remediate');
    Route::get('/margin-bias', [ServicesAdminController::class, 'marginBias'])->name('margin-bias');
    Route::post('/margin-bias/{alert}', [ServicesAdminController::class, 'biasUpdate'])->name('margin-bias.update');
    Route::get('/spine', [ServicesAdminController::class, 'spine'])->name('spine');
    Route::post('/spine/run', [ServicesAdminController::class, 'spineRun'])->name('spine.run');
    Route::post('/spine/{check}', [ServicesAdminController::class, 'spineUpdate'])->name('spine.update');
    Route::get('/vehicle-performance', [ServicesAdminController::class, 'performance'])->name('performance');
    Route::get('/proposals', [ServicesAdminController::class, 'proposals'])->name('proposals');
    Route::post('/proposals/{proposal}', [ServicesAdminController::class, 'proposalUpdate'])->name('proposals.update');

    Route::get('/tech/engagements', [TechAdminController::class, 'engagements'])->name('tech.engagements');
    Route::post('/tech/settings/{setting}', [TechAdminController::class, 'setting'])->name('tech.setting');
    Route::post('/tech/engagements/{engagement}', [TechAdminController::class, 'engagementAction'])->name('tech.engagement');
    Route::get('/tech/fee-rules', [TechAdminController::class, 'feeRules'])->name('tech.fee-rules');
    Route::post('/tech/fee-rules', [TechAdminController::class, 'feeRuleStore'])->name('tech.fee-rules.store');
    Route::post('/tech/fee-rules/{rule}', [TechAdminController::class, 'feeRuleUpdate'])->name('tech.fee-rules.update');
    Route::get('/tech/suppliers', [TechAdminController::class, 'suppliers'])->name('tech.suppliers');
    Route::post('/tech/suppliers', [TechAdminController::class, 'supplierStore'])->name('tech.suppliers.store');
    Route::post('/tech/suppliers/{supplier}', [TechAdminController::class, 'supplierUpdate'])->name('tech.suppliers.update');
    Route::get('/tech/exceptions', [TechAdminController::class, 'exceptions'])->name('tech.exceptions');
    Route::post('/tech/exceptions/{exception}', [TechAdminController::class, 'exceptionUpdate'])->name('tech.exceptions.update');
    Route::get('/tech/whatsapp', [TechAdminController::class, 'whatsapp'])->name('tech.whatsapp');
    Route::post('/tech/whatsapp/{engagement}', [TechAdminController::class, 'whatsappConsent'])->name('tech.whatsapp.consent');
});
