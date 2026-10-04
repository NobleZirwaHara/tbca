<?php

use App\Http\Controllers\DealRoom\AdminController;
use App\Http\Controllers\DealRoom\CommercialActionController;
use App\Http\Controllers\DealRoom\CommercialController;
use App\Http\Controllers\DealRoom\DataRoomController;
use App\Http\Controllers\DealRoom\PartyController;
use App\Http\Controllers\DealRoom\PublicController;
use App\Http\Controllers\DealRoom\QaController;
use App\Http\Controllers\DealRoom\RoomController;
use App\Http\Controllers\DealRoom\SetupController;
use App\Http\Controllers\DealRoom\TransactionController;
use Illuminate\Support\Facades\Route;

/* --- Virtual Deal Room (public) ---------------------------------------- */
Route::prefix('virtual-deal-room')->name('deal-room.')->group(function () {
    Route::get('/', [PublicController::class, 'landing'])->name('landing');
    Route::get('/enquiry', [PublicController::class, 'enquiry'])->name('enquiry');

    Route::middleware('auth')->group(function () {
        Route::post('/enquiry', [PublicController::class, 'submitEnquiry'])->name('enquiry.submit');
        Route::get('/rooms', [PublicController::class, 'rooms'])->name('rooms.index');
        Route::get('/invitations/{token}', [PublicController::class, 'acceptInvite'])->name('invitations.accept');
        Route::get('/{area}/{screen?}', [PublicController::class, 'latest'])->whereIn('area', ['commercial', 'start', 'billing'])->name('latest');

        Route::prefix('rooms/{room}')->group(function () {
            Route::get('/', [RoomController::class, 'show'])->name('rooms.show');

            // Stage 0 set-up wizard
            Route::get('/setup/{step}', [SetupController::class, 'show'])->name('setup');
            Route::post('/setup/{step}', [SetupController::class, 'save'])->name('setup.save');
            Route::redirect('/security', 'setup/security-setup')->name('security');
            Route::redirect('/template-and-tools', 'setup/template-and-tools')->name('template-tools');

            // Gate actions
            Route::post('/stages/{code}/tick', [RoomController::class, 'tick'])->name('stages.tick');
            Route::post('/stages/{code}/complete', [RoomController::class, 'complete'])->name('stages.complete');
            Route::post('/stages/{code}/pay', [RoomController::class, 'payStageFee'])->name('stages.pay');
            Route::post('/approvals/{approval}', [RoomController::class, 'decide'])->name('approvals.decide');
            Route::post('/diagnostic', [RoomController::class, 'saveDiagnostic'])->name('diagnostic.save');

            // Data room
            Route::get('/data-room', [DataRoomController::class, 'index'])->name('data-room');
            Route::post('/nda', [DataRoomController::class, 'acceptNda'])->name('nda.accept');
            Route::post('/documents', [DataRoomController::class, 'upload'])->name('documents.upload');
            Route::get('/documents/{document}/download', [DataRoomController::class, 'download'])->name('documents.download');
            Route::post('/documents/{document}/view', [DataRoomController::class, 'view'])->name('documents.view');
            Route::post('/documents/{document}/review', [DataRoomController::class, 'review'])->name('documents.review');
            Route::post('/folders', [DataRoomController::class, 'storeFolder'])->name('folders.store');
            Route::patch('/folders/{folder}', [DataRoomController::class, 'updateFolder'])->name('folders.update');

            // Parties, Q&A
            Route::post('/parties', [PartyController::class, 'store'])->name('parties.store');
            Route::post('/parties/invite', [PartyController::class, 'invite'])->name('parties.invite');
            Route::patch('/parties/{party}', [PartyController::class, 'update'])->name('parties.update');
            Route::post('/questions', [QaController::class, 'store'])->name('questions.store');
            Route::patch('/questions/{question}', [QaController::class, 'update'])->name('questions.update');

            // Transaction records
            Route::post('/negotiation', [TransactionController::class, 'negotiation'])->name('negotiation');
            Route::post('/offers', [TransactionController::class, 'storeOffer'])->name('offers.store');
            Route::post('/offers/{offer}/approve', [TransactionController::class, 'approveOffer'])->name('offers.approve');
            Route::post('/items', [TransactionController::class, 'storeItem'])->name('items.store');
            Route::patch('/items/{item}', [TransactionController::class, 'updateItem'])->name('items.update');
            Route::post('/conditions', [TransactionController::class, 'storeCondition'])->name('conditions.store');
            Route::patch('/conditions/{condition}', [TransactionController::class, 'updateCondition'])->name('conditions.update');
            Route::post('/funds-flow', [TransactionController::class, 'fundsFlow'])->name('funds-flow');

            // Commercial journey and billing
            Route::get('/commercial/{screen}', [CommercialController::class, 'commercial'])->name('commercial');
            Route::get('/billing/return', [CommercialActionController::class, 'returned'])->name('billing.return');
            Route::get('/billing/{screen}', [CommercialController::class, 'billing'])->name('billing');
            Route::post('/commercial/quote', [CommercialActionController::class, 'quote'])->name('commercial.quote');
            Route::post('/commercial/fee-ack', [CommercialActionController::class, 'feeAck'])->name('commercial.fee-ack');
            Route::post('/commercial/scope', [CommercialActionController::class, 'scope'])->name('commercial.scope');
            Route::post('/commercial/engagement', [CommercialActionController::class, 'engagement'])->name('commercial.engagement');
            Route::post('/commercial/statement/pay', [CommercialActionController::class, 'payStatement'])->name('commercial.statement.pay');
            Route::post('/commercial/closing', [CommercialActionController::class, 'closing'])->name('commercial.closing');
            Route::post('/commercial/subscription', [CommercialActionController::class, 'subscription'])->name('commercial.subscription');
            Route::post('/charges/{charge}/pay', [CommercialActionController::class, 'pay'])->name('charges.pay');
            Route::post('/requests/overage', [CommercialActionController::class, 'overage'])->name('requests.overage');
            Route::post('/requests/change', [CommercialActionController::class, 'change'])->name('requests.change');
            Route::post('/requests/third-party', [CommercialActionController::class, 'thirdParty'])->name('requests.third-party');
            Route::post('/requests/refund', [CommercialActionController::class, 'refund'])->name('requests.refund');
            Route::post('/requests/dispute', [CommercialActionController::class, 'dispute'])->name('requests.dispute');
            Route::post('/requests/{req}/accept-resolution', [CommercialActionController::class, 'acceptResolution'])->name('requests.accept-resolution');
            Route::post('/restart', [CommercialActionController::class, 'restart'])->name('restart');
            Route::post('/renewal', [CommercialActionController::class, 'renewal'])->name('renewal');

            // Every transaction stage screen (shared template) — keep last.
            Route::get('/{page}', [RoomController::class, 'page'])->where('page', '[a-z0-9-]+')->name('rooms.page');
        });
    });
});

/* --- Admin: Deal Room Control Tower ------------------------------------ */
Route::prefix('admin/deal-room')->name('admin.deal-room.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('index');
    Route::get('/requests', [AdminController::class, 'requests'])->name('requests');
    Route::get('/billing', [AdminController::class, 'billing'])->name('billing');
    Route::get('/rooms/{room}', [AdminController::class, 'room'])->name('room');
    Route::post('/requests/{req}/review', [AdminController::class, 'review'])->name('requests.review');
});
