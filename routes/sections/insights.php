<?php

use App\Http\Controllers\Industries\AdminController as IndAdmin;
use App\Http\Controllers\Industries\CountryController as IndCountry;
use App\Http\Controllers\Industries\IndustryController as IndIndustry;
use App\Http\Controllers\Industries\JourneyController as IndJourney;
use App\Http\Controllers\Industries\PublicController as IndPublic;
use App\Http\Controllers\Insights\ResourceAccountController;
use App\Http\Controllers\Insights\ResourceAdminController;
use App\Http\Controllers\Insights\ResourceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Insights: Industries (MP-INDUSTRIES-1.0) + TBCA Resources
|--------------------------------------------------------------------------
*/

/* --- Industries (MP-INDUSTRIES-1.0 prototype, 21 Oct 2026) -------------- */
Route::get('/industries', [IndPublic::class, 'landing'])->name('industries');
Route::prefix('industries')->name('industries.')->group(function () {
    Route::get('/select', [IndPublic::class, 'select'])->name('select');
    Route::post('/context', [IndPublic::class, 'saveContext'])->name('context');
    Route::get('/instances', [IndPublic::class, 'instances'])->name('instances');
    Route::get('/selector-component', [IndPublic::class, 'selectorComponent'])->name('selector-component');
    Route::get('/heatmap', [IndPublic::class, 'heatmap'])->name('heatmap');
    Route::get('/diagnostics', [IndPublic::class, 'hub'])->defaults('area', 'diagnostic')->name('hub.diagnostics');
    Route::get('/sector-intelligence', [IndPublic::class, 'hub'])->defaults('area', 'intelligence')->name('hub.intelligence');
    Route::get('/benchmarks', [IndPublic::class, 'hub'])->defaults('area', 'benchmarks')->name('hub.benchmarks');
    Route::get('/partners', [IndPublic::class, 'hub'])->defaults('area', 'partners')->name('hub.partners');
    Route::redirect('/intelligence', '/industries/sector-intelligence', 301);
    Route::post('/state', [IndJourney::class, 'state'])->name('state');

    /* Engagement path and Industry Workspace (state kept on the account when signed in, else in the session) */
    Route::get('/engage', [IndJourney::class, 'start'])->name('engage');
    Route::get('/engage/gates', [IndJourney::class, 'gates'])->name('engage.gates');
    Route::get('/engage/letter', [IndJourney::class, 'letter'])->name('engage.letter');
    Route::get('/engage/checkout', [IndJourney::class, 'checkout'])->name('engage.checkout');
    Route::post('/engage/action', [IndJourney::class, 'act'])->name('engage.action');
    Route::get('/workspace', [IndJourney::class, 'workspace'])->name('workspace');
    Route::get('/workspace/ledger', [IndJourney::class, 'ledger'])->name('workspace.ledger');
    Route::get('/workspace/partner', [IndJourney::class, 'partner'])->name('workspace.partner');
    Route::get('/workspace/review', [IndJourney::class, 'review'])->name('workspace.review');
    Route::get('/workspace/calendar', [IndJourney::class, 'calendar'])->name('workspace.calendar');
    Route::get('/workspace/calendar.ics', [IndJourney::class, 'ics'])->name('workspace.ics');
    Route::get('/workspace/benchmark', [IndJourney::class, 'benchmark'])->name('workspace.benchmark');
    Route::get('/workspace/abort', [IndJourney::class, 'abort'])->name('workspace.abort');
    Route::get('/workspace/verify', [IndJourney::class, 'wsVerify'])->name('workspace.verify');
    Route::get('/workspace/reclass', [IndJourney::class, 'wsReclass'])->name('workspace.reclass');

    /* Earlier URLs (October 2026 build) */
    Route::get('/workspace/{engagement}/{page?}', function (string $engagement, ?string $page = null) {
        $map = ['verification' => 'workspace/verify', 'verification-export' => 'workspace/verify', 'reclassification' => 'workspace/reclass', 'ledger' => 'workspace/ledger', 'ledger-export' => 'workspace/ledger',
            'abort-ladder' => 'workspace/abort', 'abort-policy' => 'workspace/abort', 'engagement-letter' => 'engage/letter', 'split-checkout' => 'engage/checkout', 'payment-return' => 'engage/checkout',
            'gates' => 'engage/gates', 'partner-route' => 'workspace/partner', 'specialist-review' => 'workspace/review', 'compliance-calendar' => 'workspace/calendar', 'benchmark-contribution' => 'workspace/benchmark'];

        return redirect('/industries/'.($map[$page] ?? 'workspace'), 301);
    })->where('page', '.*');
    Route::get('/sector-intelligence/{industry}', fn (string $industry) => redirect("/industries/{$industry}/intelligence", 301));
    Route::get('/{industry}/services/{sku}/{rest?}', fn (string $industry) => redirect("/industries/{$industry}/services", 301))->where('rest', 'disclosure');

    /* Industry pages */
    Route::get('/{industry}', [IndIndustry::class, 'show'])->name('show');
    Route::get('/{industry}/services', [IndIndustry::class, 'services'])->name('services');
    Route::get('/{industry}/diagnostic', [IndIndustry::class, 'diagnostic'])->name('diagnostic');
    Route::get('/{industry}/intelligence', [IndIndustry::class, 'intelligence'])->name('intelligence');
    Route::get('/{industry}/benchmarks', [IndIndustry::class, 'benchmarks'])->name('benchmarks');
    Route::get('/{industry}/partners', [IndIndustry::class, 'partners'])->name('partners');
    Route::get('/{industry}/countries', [IndIndustry::class, 'countries'])->name('countries');
    Route::get('/{industry}/chains', [IndIndustry::class, 'chains'])->name('chains');
    Route::get('/{industry}/opps', [IndIndustry::class, 'opps'])->name('opps');
    Route::get('/{industry}/commodities', [IndIndustry::class, 'commodities'])->name('commodities');
    Route::get('/{industry}/economics', [IndIndustry::class, 'economics'])->name('economics');
    Route::get('/{industry}/regulators', [IndIndustry::class, 'regulators'])->name('regulators');
    Route::get('/{industry}/limits', [IndIndustry::class, 'limits'])->name('limits');
    Route::get('/{industry}/verify', [IndIndustry::class, 'verify'])->name('verify');
    Route::get('/{industry}/reclass', [IndIndustry::class, 'reclass'])->name('reclass');
    Route::get('/{industry}/country/{country}', [IndCountry::class, 'show'])->name('country');
    Route::get('/{industry}/country/{country}/trade', [IndCountry::class, 'trade'])->name('country.trade');
    Route::get('/{industry}/sprint/{code}', [IndJourney::class, 'sprint'])->name('sprint');
    Route::get('/{industry}/sprint/{code}/addons', [IndJourney::class, 'addons'])->name('sprint.addons');
    Route::get('/{industry}/engage', [IndJourney::class, 'engage'])->name('industry.engage');
    Route::post('/{industry}/engage', [IndJourney::class, 'create'])->name('industry.engage.create');
});

/* --- Industries admin console (P27 to P35) ------------------------------- */
Route::middleware(['auth', 'admin'])->prefix('admin/industries')->name('admin.industries.')->controller(IndAdmin::class)->group(function () {
    Route::get('/', 'overview')->name('overview');
    Route::get('/taxonomy', 'taxonomy')->name('taxonomy');
    Route::get('/classification', 'classification')->name('classification');
    Route::get('/margin', 'margin')->name('margin');
    Route::get('/blocked', 'blocked')->name('blocked');
    Route::get('/regulators', 'regulators')->name('regulators');
    Route::get('/misdeclaration', 'misdeclaration')->name('misdeclaration');
    Route::post('/misdeclaration', 'resolve')->name('misdeclaration.resolve');
    Route::get('/benchmarks', 'benchmarks')->name('benchmarks');
    Route::get('/pipeline', 'pipeline')->name('pipeline');
    Route::get('/whatsapp', 'whatsapp')->name('whatsapp');
});
Route::get('/admin/insights/industries/{page?}', function (?string $page = null) {
    $map = ['misdeclarations' => 'misdeclaration', 'activation' => 'pipeline', 'taxonomy-export' => 'taxonomy', 'margin-export' => 'margin', 'regulators-export' => 'regulators'];
    $p = explode('/', (string) $page)[0];
    $p = $map[$p] ?? $p;

    return redirect('/admin/industries'.(in_array($p, ['taxonomy', 'classification', 'margin', 'blocked', 'regulators', 'misdeclaration', 'benchmarks', 'pipeline', 'whatsapp'], true) ? '/'.$p : ''), 301);
})->where('page', '.*');

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
