<?php

use App\Http\Controllers\Marketplace\Admin\MarketplaceAdminController;
use App\Http\Controllers\Marketplace\Admin\RegisterController;
use App\Http\Controllers\Marketplace\BriefController;
use App\Http\Controllers\Marketplace\EngagementController;
use App\Http\Controllers\Marketplace\MarketplaceController;
use App\Http\Controllers\Marketplace\PartnerApplicationController;
use App\Http\Controllers\Marketplace\PartnerRequestController;
use App\Http\Controllers\Marketplace\PartnerServicesController;
use App\Http\Controllers\Marketplace\PartnerWorkspaceController;
use App\Http\Controllers\Marketplace\ProviderApplicationController;
use App\Http\Controllers\Marketplace\ProviderPortalController;
use Illuminate\Support\Facades\Route;

/* =========================================================================
 | Marketplace (MP-TEB v2.0)
 * ========================================================================= */
Route::prefix('marketplace')->name('marketplace.')->group(function () {
    Route::get('/', [MarketplaceController::class, 'landing'])->name('landing');
    Route::get('/how-it-works', [MarketplaceController::class, 'howItWorks'])->name('how');
    Route::get('/services', [MarketplaceController::class, 'catalogue'])->name('services');
    Route::get('/services/{listing}', [MarketplaceController::class, 'listing'])->name('services.show');
    Route::post('/services/{listing}/order', [MarketplaceController::class, 'order'])->name('services.order');
    Route::post('/services/{listing}/reviews', [MarketplaceController::class, 'review'])->middleware('auth')->name('services.review');
    Route::get('/providers', [MarketplaceController::class, 'providers'])->name('providers');

    // Provider onboarding (MP-SCR-015)
    Route::get('/providers/apply/submitted', [ProviderApplicationController::class, 'submitted'])->name('apply.submitted');
    Route::get('/providers/apply/{step?}', [ProviderApplicationController::class, 'show'])->whereNumber('step')->name('apply');
    Route::post('/providers/apply/{step}', [ProviderApplicationController::class, 'store'])->whereNumber('step')->name('apply.store');
    Route::get('/providers/{provider}', [MarketplaceController::class, 'provider'])->name('providers.show');

    // Quick brief from the landing page keeps answers in the session until sign-in.
    Route::post('/brief/start', [BriefController::class, 'start'])->name('brief.start');

    Route::middleware('auth')->group(function () {
        Route::get('/my', [EngagementController::class, 'index'])->name('my');

        // Buyer brief journey (MP-SCR-003..006)
        Route::get('/brief/{step?}', [BriefController::class, 'wizard'])->whereNumber('step')->name('brief');
        Route::post('/brief/{step}', [BriefController::class, 'saveStep'])->whereNumber('step')->name('brief.save');
        Route::get('/briefs/{brief}/review', [BriefController::class, 'review'])->name('briefs.review');
        Route::post('/briefs/{brief}/accept', [BriefController::class, 'accept'])->name('briefs.accept');
        Route::post('/briefs/{brief}/clarify', [BriefController::class, 'clarify'])->name('briefs.clarify');
        Route::get('/briefs/{brief}/proposals', [BriefController::class, 'proposals'])->name('briefs.proposals');
        Route::post('/briefs/{brief}/proposals/{proposal}/award', [BriefController::class, 'award'])->name('briefs.award');
        Route::post('/briefs/{brief}/assign-match', [BriefController::class, 'assignMatch'])->name('briefs.assign');
        Route::get('/briefs/{brief}/disclosure',[BriefController::class, 'disclosure'])->name('briefs.disclosure');
        Route::post('/briefs/{brief}/disclosure', [BriefController::class, 'acknowledge'])->name('briefs.acknowledge');
        Route::get('/briefs/{brief}/checkout', [BriefController::class, 'checkout'])->name('briefs.checkout');
        Route::post('/briefs/{brief}/checkout', [BriefController::class, 'pay'])->name('briefs.pay');
        Route::get('/briefs/{brief}/confirm', [BriefController::class, 'confirm'])->name('briefs.confirm');

        // Engagement delivery (MP-SCR-007..011)
        Route::get('/engagements/{engagement}/assignment', [EngagementController::class, 'assignment'])->name('engagements.assignment');
        Route::get('/engagements/{engagement}/progress', [EngagementController::class, 'progress'])->name('engagements.progress');
        Route::get('/engagements/{engagement}/deliverables/{deliverable}', [EngagementController::class, 'deliverable'])->name('engagements.deliverable');
        Route::post('/engagements/{engagement}/deliverables/{deliverable}/decision', [EngagementController::class, 'decide'])->name('engagements.decide');
        Route::post('/engagements/{engagement}/disputes', [EngagementController::class, 'raiseDispute'])->name('engagements.disputes.store');
        Route::get('/engagements/{engagement}/disputes/{dispute}', [EngagementController::class, 'dispute'])->name('engagements.dispute');
        Route::post('/engagements/{engagement}/disputes/{dispute}/messages', [EngagementController::class, 'message'])->name('engagements.dispute.message');
        Route::post('/engagements/{engagement}/disputes/{dispute}/withdraw', [EngagementController::class, 'withdraw'])->name('engagements.dispute.withdraw');
        Route::post('/engagements/{engagement}/review', [EngagementController::class, 'rate'])->name('engagements.review');

        // Provider portal (MP-SCR-017..025)
        Route::prefix('provider')->name('provider.')->group(function () {
            Route::get('/', [ProviderPortalController::class, 'home'])->name('home');
            Route::get('/dashboard', [ProviderPortalController::class, 'dashboard'])->name('dashboard');
            Route::get('/opportunities', [ProviderPortalController::class, 'opportunities'])->name('opportunities');
            Route::post('/opportunities/{brief}/save', [ProviderPortalController::class, 'toggleSave'])->name('opportunities.save');
            Route::get('/opportunities/{brief}', [ProviderPortalController::class, 'opportunity'])->name('opportunities.show');
            Route::post('/opportunities/{brief}/accept', [ProviderPortalController::class, 'acceptRate'])->name('opportunities.accept');
            Route::post('/opportunities/{brief}/decline', [ProviderPortalController::class, 'declineRate'])->name('opportunities.decline');
            Route::get('/engagements/{engagement}', [ProviderPortalController::class, 'engagement'])->name('engagements.show');
            Route::post('/engagements/{engagement}/start', [ProviderPortalController::class, 'startWork'])->name('engagements.start');
            Route::post('/engagements/{engagement}/submit', [ProviderPortalController::class, 'submitWork'])->name('engagements.submit');
            Route::get('/statements', [ProviderPortalController::class, 'statements'])->name('statements');
            Route::get('/agreement', [ProviderPortalController::class, 'agreement'])->name('agreement');
            Route::post('/agreement', [ProviderPortalController::class, 'signAgreement'])->name('agreement.sign');
            Route::get('/grievances/new/{step?}', [ProviderPortalController::class, 'grievance'])->whereNumber('step')->name('grievances.new');
            Route::post('/grievances/new/{step}', [ProviderPortalController::class, 'saveGrievance'])->whereNumber('step')->name('grievances.save');
            Route::get('/grievances/{dispute}', [ProviderPortalController::class, 'grievanceShow'])->name('grievances.show');
        });
    });
});

/* =========================================================================
 | Partner Services (PS-TEB v1.1)
 * ========================================================================= */
Route::prefix('partner-services')->name('partner-services.')->group(function () {
    Route::get('/', [PartnerServicesController::class, 'landing'])->name('landing');
    Route::get('/choose-service', [PartnerServicesController::class, 'choose'])->name('choose');
    Route::get('/how-it-works', [PartnerServicesController::class, 'howItWorks'])->name('how');
    Route::get('/coverage', [PartnerServicesController::class, 'coverage'])->name('coverage');
    Route::get('/services/{listing}', [PartnerServicesController::class, 'service'])->name('services.show');
    Route::get('/professional-limitation-notice', [PartnerServicesController::class, 'limitation'])->name('limitation');
    Route::get('/network', [PartnerServicesController::class, 'network'])->name('network');

    Route::get('/apply/submitted', [PartnerApplicationController::class, 'submitted'])->name('apply.submitted');
    Route::get('/apply/{step?}', [PartnerApplicationController::class, 'show'])->whereNumber('step')->name('apply');
    Route::post('/apply/{step}', [PartnerApplicationController::class, 'store'])->whereNumber('step')->name('apply.store');

    Route::middleware('auth')->group(function () {
        Route::get('/request', [PartnerRequestController::class, 'intake'])->name('request');
        Route::post('/request', [PartnerRequestController::class, 'storeIntake'])->name('request.store');
        Route::get('/requests', [PartnerRequestController::class, 'index'])->name('requests');
        Route::get('/requests/{partnerRequest}', [PartnerRequestController::class, 'show'])->name('requests.show');
        Route::get('/requests/{partnerRequest}/resolution', [PartnerRequestController::class, 'resolution'])->name('requests.resolution');
        Route::post('/requests/{partnerRequest}/conflict-check', [PartnerRequestController::class, 'sendForConflict'])->name('requests.send');
        Route::get('/requests/{partnerRequest}/conflict', [PartnerRequestController::class, 'conflict'])->name('requests.conflict');
        Route::post('/requests/{partnerRequest}/next-step', [PartnerRequestController::class, 'nextStep'])->name('requests.next');
        Route::get('/requests/{partnerRequest}/proposal', [PartnerRequestController::class, 'proposal'])->name('requests.proposal');
        Route::post('/requests/{partnerRequest}/proposal', [PartnerRequestController::class, 'decideProposal'])->name('requests.proposal.decide');
        Route::get('/requests/{partnerRequest}/scope-quote', [PartnerRequestController::class, 'scopeQuote'])->name('requests.quote');
        Route::post('/requests/{partnerRequest}/scope-quote', [PartnerRequestController::class, 'acceptQuote'])->name('requests.quote.accept');
        Route::get('/requests/{partnerRequest}/engagement-instrument', [PartnerRequestController::class, 'instrument'])->name('requests.instrument');
        Route::post('/requests/{partnerRequest}/engagement-instrument', [PartnerRequestController::class, 'sign'])->name('requests.sign');
        Route::get('/requests/{partnerRequest}/responsibility', [PartnerRequestController::class, 'responsibility'])->name('requests.responsibility');
        Route::post('/requests/{partnerRequest}/responsibility', [PartnerRequestController::class, 'confirmResponsibility'])->name('requests.responsibility.confirm');
        Route::get('/requests/{partnerRequest}/escalated', [PartnerRequestController::class, 'escalated'])->name('requests.escalated');
        Route::post('/requests/{partnerRequest}/escalated', [PartnerRequestController::class, 'continueEscalated'])->name('requests.escalated.continue');
        Route::get('/requests/{partnerRequest}/status', [PartnerRequestController::class, 'status'])->name('requests.status');
        Route::post('/requests/{partnerRequest}/sign-off', [PartnerRequestController::class, 'signOff'])->name('requests.signoff');

        Route::prefix('workspace')->name('workspace.')->group(function () {
            Route::get('/', [PartnerWorkspaceController::class, 'dashboard'])->name('dashboard');
            Route::post('/tasks', [PartnerWorkspaceController::class, 'toggleTask'])->name('tasks');
            Route::get('/verifications', [PartnerWorkspaceController::class, 'verifications'])->name('verifications');
            Route::get('/opportunities/{partnerRequest}', [PartnerWorkspaceController::class, 'opportunity'])->name('opportunity');
            Route::post('/opportunities/{partnerRequest}/conflict', [PartnerWorkspaceController::class, 'submitConflict'])->name('conflict');
            Route::get('/opportunities/{partnerRequest}/quote', [PartnerWorkspaceController::class, 'quote'])->name('quote');
            Route::post('/opportunities/{partnerRequest}/quote', [PartnerWorkspaceController::class, 'submitQuote'])->name('quote.submit');
            Route::get('/opportunities/{partnerRequest}/delivery', [PartnerWorkspaceController::class, 'delivery'])->name('delivery');
            Route::post('/opportunities/{partnerRequest}/delivery', [PartnerWorkspaceController::class, 'updateDelivery'])->name('delivery.update');
            Route::get('/opportunities/{partnerRequest}/settlement', [PartnerWorkspaceController::class, 'settlement'])->name('settlement');
        });
    });
});

/* =========================================================================
 | Governance consoles
 * ========================================================================= */
Route::prefix('admin/marketplace')->name('admin.marketplace.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [MarketplaceAdminController::class, 'hub'])->name('hub');
    Route::get('/providers', [MarketplaceAdminController::class, 'providers'])->name('providers');
    Route::post('/providers/{provider}/status', [MarketplaceAdminController::class, 'providerStatus'])->name('providers.status');
    Route::get('/providers/{provider}/vetting', [MarketplaceAdminController::class, 'vetting'])->name('providers.vetting');
    Route::post('/providers/{provider}/vetting', [MarketplaceAdminController::class, 'updateVetting'])->name('providers.vetting.update');
    Route::get('/listings', [MarketplaceAdminController::class, 'listings'])->name('listings');
    Route::post('/listings/{listing}/status', [MarketplaceAdminController::class, 'listingStatus'])->name('listings.status');
    Route::get('/briefs', [MarketplaceAdminController::class, 'briefs'])->name('briefs');
    Route::get('/briefs/{brief}/triage', [MarketplaceAdminController::class, 'triage'])->name('briefs.triage');
    Route::post('/briefs/{brief}/shortlist', [MarketplaceAdminController::class, 'shortlist'])->name('briefs.shortlist');
    Route::get('/qa', [MarketplaceAdminController::class, 'qa'])->name('qa');
    Route::post('/qa/{deliverable}', [MarketplaceAdminController::class, 'qaAction'])->name('qa.action');
    Route::get('/finance', [MarketplaceAdminController::class, 'payouts'])->name('payouts');
    Route::post('/finance/run', [MarketplaceAdminController::class, 'payoutRun'])->name('payouts.run');
    Route::post('/finance/{payout}', [MarketplaceAdminController::class, 'payoutAction'])->name('payouts.action');
    Route::get('/supply', [MarketplaceAdminController::class, 'supply'])->name('supply');
    Route::get('/disputes', [MarketplaceAdminController::class, 'disputes'])->name('disputes');
    Route::post('/disputes/{dispute}', [MarketplaceAdminController::class, 'disputeAction'])->name('disputes.action');
    Route::get('/partners/register', [MarketplaceAdminController::class, 'partnerRegister'])->name('partners.register');

    // Generic governance registers (capacity rules, corrections, floor, no-circumvention, permissions ...)
    $registers = array_keys(\App\Support\Marketplace\Registers::all());
    Route::get('/{register}', [RegisterController::class, 'show'])->whereIn('register', $registers)->name('registers.show');
    Route::post('/{register}', [RegisterController::class, 'store'])->whereIn('register', $registers)->name('registers.store');
    Route::post('/{register}/{record}', [RegisterController::class, 'action'])->whereIn('register', $registers)->whereNumber('record')->name('registers.action');
});
