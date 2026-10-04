<?php

use App\Http\Controllers\Shop\Admin\CapacityController;
use App\Http\Controllers\Shop\Admin\CommerceController;
use App\Http\Controllers\Shop\Admin\GovernanceController;
use App\Http\Controllers\Shop\Admin\ReleaseController;
use App\Http\Controllers\Shop\BriefController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CatalogueController;
use App\Http\Controllers\Shop\CompareController;
use App\Http\Controllers\Shop\EntitlementController;
use App\Http\Controllers\Shop\FreeAccessController;
use App\Http\Controllers\Shop\MandateController;
use App\Http\Controllers\Shop\ProductController;
use App\Http\Controllers\Shop\QuoteController;
use App\Http\Controllers\Shop\QuoteRequestController;
use App\Http\Controllers\Shop\ResolverController;
use App\Http\Controllers\Shop\RetainerProposalController;
use App\Http\Controllers\Shop\SearchController;
use Illuminate\Support\Facades\Route;

/* --- Site search --------------------------------------------------------- */
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::delete('/search/history', [SearchController::class, 'clearHistory'])->name('search.history.clear');
Route::redirect('/shop/search', '/search');

/* --- Online Shop: discovery ---------------------------------------------- */
Route::get('/shop', [CatalogueController::class, 'index'])->name('shop');
Route::get('/shop/resolver', [ResolverController::class, 'show'])->name('shop.resolver');
Route::get('/shop/a-z', [CatalogueController::class, 'aisles'])->name('shop.aisles');
Route::get('/shop/aisle/{aisle}', [CatalogueController::class, 'aisle'])->name('shop.aisle');
Route::get('/shop/aisle/{aisle}/{sub}', [CatalogueController::class, 'subcategory'])->name('shop.subcategory');
Route::get('/shop/compare', [CompareController::class, 'show'])->name('shop.compare');
Route::get('/shop/compare/export', [CompareController::class, 'export'])->name('shop.compare.export');

/* --- Product templates A1-A7 --------------------------------------------- */
Route::get('/shop/product/{product}', [ProductController::class, 'show'])->name('shop.product');
Route::get('/shop/product/{product}/configure', [ProductController::class, 'configure'])->name('shop.product.configure');
Route::get('/shop/product/{product}/licence', [ProductController::class, 'licence'])->name('shop.product.licence');
Route::post('/shop/product/{product}/add', [CartController::class, 'add'])->name('shop.product.add');
Route::post('/shop/product/{product}/save-for-later', [CartController::class, 'saveForLater'])->name('shop.product.save');
Route::post('/shop/product/{product}/consultation', [ProductController::class, 'consultation'])->name('shop.product.consultation');

/* --- Basket partition and saved baskets ---------------------------------- */
Route::patch('/shop/basket/{item}', [CartController::class, 'update'])->whereNumber('item')->name('shop.basket.update');
Route::post('/shop/basket/clear', [CartController::class, 'clear'])->name('shop.basket.clear');
Route::post('/shop/basket/checkout-purchase', [CartController::class, 'checkoutPurchase'])->name('shop.basket.checkout-purchase');
Route::post('/shop/basket/quotes', [CartController::class, 'requestQuotes'])->name('shop.basket.quotes');
Route::get('/shop/saved-baskets', [CartController::class, 'savedIndex'])->name('shop.saved-baskets');
Route::post('/shop/saved-baskets', [CartController::class, 'saveBasket'])->name('shop.saved-baskets.store');
Route::post('/shop/saved-baskets/{saved}/load', [CartController::class, 'loadBasket'])->whereNumber('saved')->name('shop.saved-baskets.load');
Route::delete('/shop/saved-baskets/{saved}', [CartController::class, 'deleteBasket'])->whereNumber('saved')->name('shop.saved-baskets.delete');

/* --- Request objects: quotes, briefs, proposals, mandates, free access ---- */
Route::get('/shop/quote-request/{product}/{step?}', [QuoteRequestController::class, 'show'])->whereNumber('step')->name('shop.quote-request');
Route::post('/shop/quote-request/{product}/{step}', [QuoteRequestController::class, 'store'])->whereNumber('step')->name('shop.quote-request.store');
Route::get('/shop/quote/{quote}', [QuoteController::class, 'show'])->name('shop.quote');
Route::post('/shop/quote/{quote}/accept', [QuoteController::class, 'accept'])->name('shop.quote.accept');
Route::post('/shop/quote/{quote}/decline', [QuoteController::class, 'decline'])->name('shop.quote.decline');
Route::post('/shop/quote/{quote}/changes', [QuoteController::class, 'changes'])->name('shop.quote.changes');

Route::post('/shop/marketplace-brief/draft', [BriefController::class, 'saveDraft'])->name('shop.brief.draft');
Route::post('/shop/marketplace-brief/discard', [BriefController::class, 'discard'])->name('shop.brief.discard');
Route::get('/shop/marketplace-brief/submitted/{brief}', [BriefController::class, 'submitted'])->name('shop.brief.submitted');
Route::get('/shop/marketplace-brief/{step?}', [BriefController::class, 'show'])->whereNumber('step')->name('shop.brief');
Route::post('/shop/marketplace-brief/{step}', [BriefController::class, 'store'])->whereNumber('step')->name('shop.brief.store');

Route::get('/shop/retainer-proposal/submitted/{proposal}', [RetainerProposalController::class, 'submitted'])->name('shop.proposal.submitted');
Route::get('/shop/retainer-proposal/{step?}', [RetainerProposalController::class, 'show'])->whereNumber('step')->name('shop.proposal');
Route::post('/shop/retainer-proposal/{step}', [RetainerProposalController::class, 'store'])->whereNumber('step')->name('shop.proposal.store');

Route::get('/shop/mandate', [MandateController::class, 'show'])->name('shop.mandate');
Route::post('/shop/mandate', [MandateController::class, 'store'])->name('shop.mandate.store');
Route::get('/shop/mandate/{mandate}/activate', [MandateController::class, 'activate'])->name('shop.mandate.activate');

Route::get('/shop/free/{product}', [FreeAccessController::class, 'show'])->name('shop.free');
Route::post('/shop/free/{product}', [FreeAccessController::class, 'store'])->name('shop.free.store');
Route::get('/shop/free/{product}/ready/{reference}', [FreeAccessController::class, 'ready'])->name('shop.free.ready');

/* --- Entitlements and receipts ------------------------------------------- */
Route::get('/shop/entitlements/{order}', [EntitlementController::class, 'show'])->name('shop.entitlements');
Route::get('/shop/receipt/{order}', [EntitlementController::class, 'receipt'])->name('shop.receipt');

/* --- Shop Admin Control Tower -------------------------------------------- */
Route::prefix('admin/shop')->middleware(['auth', 'admin'])->name('admin.shop.')->group(function () {
    Route::get('/', [GovernanceController::class, 'dashboard'])->name('dashboard');

    Route::get('/listing-gate', [GovernanceController::class, 'listingGate'])->name('listing-gate');
    Route::post('/listing-gate/scan', [GovernanceController::class, 'scan'])->name('listing-gate.scan');
    Route::post('/listing-gate/{product}/evaluate', [GovernanceController::class, 'evaluate'])->name('listing-gate.evaluate');

    Route::get('/product-master', [GovernanceController::class, 'productMaster'])->name('product-master');
    Route::post('/product-master', [GovernanceController::class, 'storeMaster'])->name('product-master.store');
    Route::patch('/product-master/{product}', [GovernanceController::class, 'updateMaster'])->name('product-master.update');
    Route::post('/product-master/{product}/variants', [GovernanceController::class, 'storeVariant'])->name('product-master.variants');
    Route::post('/product-master/{product}/archive', [GovernanceController::class, 'archiveMaster'])->name('product-master.archive');
    Route::post('/product-master/{product}/duplicate', [GovernanceController::class, 'duplicateMaster'])->name('product-master.duplicate');
    Route::get('/variants', [GovernanceController::class, 'variants'])->name('variants');

    Route::get('/pricing', [GovernanceController::class, 'pricing'])->name('pricing');
    Route::patch('/pricing/{product}', [GovernanceController::class, 'updatePrice'])->name('pricing.update');
    Route::post('/pricing/recalculate', [GovernanceController::class, 'recalculate'])->name('pricing.recalculate');

    Route::get('/versions', [GovernanceController::class, 'versions'])->name('versions');
    Route::post('/versions/{product}/qa', [GovernanceController::class, 'qa'])->name('versions.qa');
    Route::get('/licences', [GovernanceController::class, 'licences'])->name('licences');
    Route::post('/licences/{product}/rights', [GovernanceController::class, 'rights'])->name('licences.rights');

    Route::get('/listing-state', [GovernanceController::class, 'listingState'])->name('listing-state');
    Route::post('/listing-state/recalculate', [GovernanceController::class, 'recalculateLs'])->name('listing-state.recalculate');

    Route::get('/duplication', [GovernanceController::class, 'duplication'])->name('duplication');
    Route::post('/duplication/{group}/status', [GovernanceController::class, 'duplicationStatus'])->name('duplication.status');

    Route::get('/routes', [GovernanceController::class, 'routes'])->name('routes');
    Route::post('/routes/{route}/disposition', [GovernanceController::class, 'routeDisposition'])->name('routes.disposition');

    Route::get('/subscriptions', [CapacityController::class, 'subscriptions'])->name('subscriptions');
    Route::post('/subscriptions/audit', [CapacityController::class, 'audit'])->name('subscriptions.audit');
    Route::post('/subscriptions/{product}/requirement', [CapacityController::class, 'requirement'])->name('subscriptions.requirement');
    Route::post('/subscriptions/{product}/certify', [CapacityController::class, 'certify'])->name('subscriptions.certify');

    Route::get('/retainers', [CapacityController::class, 'retainers'])->name('retainers');
    Route::post('/retainers/{capacity}/element', [CapacityController::class, 'element'])->name('retainers.element');
    Route::post('/retainers/{capacity}/review', [CapacityController::class, 'review'])->name('retainers.review');

    Route::get('/handoffs', [CapacityController::class, 'handoffs'])->name('handoffs');
    Route::post('/handoffs/{handoff}/advance', [CapacityController::class, 'advance'])->name('handoffs.advance');
    Route::post('/handoffs/{handoff}/escalate', [CapacityController::class, 'escalate'])->name('handoffs.escalate');

    Route::get('/orders', [CommerceController::class, 'orders'])->name('orders');
    Route::post('/orders/{order}/refund', [CommerceController::class, 'refund'])->name('orders.refund');
    Route::get('/quotes', [CommerceController::class, 'quotes'])->name('quotes');
    Route::post('/quotes/issue/{submission}', [CommerceController::class, 'issue'])->name('quotes.issue');
    Route::post('/quotes/{quote}/reissue', [CommerceController::class, 'reissue'])->name('quotes.reissue');
    Route::post('/quotes/submissions/{submission}/status', [CommerceController::class, 'submissionStatus'])->name('quotes.submission-status');
    Route::post('/quotes/proposals/{proposal}/status', [CommerceController::class, 'proposalStatus'])->name('quotes.proposal-status');
    Route::get('/entitlements', [CommerceController::class, 'entitlements'])->name('entitlements');
    Route::post('/entitlements/{entitlement}/status', [CommerceController::class, 'entitlementStatus'])->name('entitlements.status');
    Route::get('/marketplace', [CommerceController::class, 'marketplace'])->name('marketplace');
    Route::post('/marketplace/{brief}/advance', [CommerceController::class, 'advanceBrief'])->name('marketplace.advance');
    Route::get('/reconciliation', [CommerceController::class, 'reconciliation'])->name('reconciliation');
    Route::post('/reconciliation/run', [CommerceController::class, 'runReconciliation'])->name('reconciliation.run');
    Route::post('/reconciliation/{order}', [CommerceController::class, 'reconcileOne'])->name('reconciliation.one');

    Route::get('/releases', [ReleaseController::class, 'releases'])->name('releases');
    Route::post('/releases/metrics/{metric}/close', [ReleaseController::class, 'closeMetric'])->name('releases.close');
    Route::post('/releases/metrics/{metric}/reopen', [ReleaseController::class, 'reopenMetric'])->name('releases.reopen');
    Route::post('/releases/uat/{case}', [ReleaseController::class, 'uat'])->name('releases.uat');
    Route::post('/releases/authorise', [ReleaseController::class, 'authorise'])->name('releases.authorise');
    Route::get('/audit', [ReleaseController::class, 'audit'])->name('audit');
});

/* --- Legacy /shop/{slug-or-code} links ----------------------------------- */
Route::get('/shop/{code}', [CatalogueController::class, 'legacy'])->where('code', '[A-Za-z0-9-]+')->name('shop.legacy');
