<?php

use App\Http\Controllers\Integrations\AdminController;
use App\Http\Controllers\Integrations\IdentityLinkController;
use App\Http\Controllers\Integrations\VoveWebhookController;
use App\Http\Controllers\Integrations\ZohoWebhookController;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Integration layer: Zoho One and identity verification
|--------------------------------------------------------------------------
| Webhooks authenticate by signature, so CSRF protection is removed for
| them only. The status console lives at /admin/integrations.
*/

Route::post('/integrations/zoho/webhook', ZohoWebhookController::class)
    ->withoutMiddleware([PreventRequestForgery::class])
    ->middleware('throttle:120,1')
    ->name('integrations.zoho.webhook');

Route::post('/integrations/vove/webhook', VoveWebhookController::class)
    ->withoutMiddleware([PreventRequestForgery::class])
    ->middleware('throttle:120,1')
    ->name('integrations.vove.webhook');

/* One-time link sent to a Due Diligence subject; opens the provider's hosted verification journey. */
Route::get('/due-diligence/verify/{token}', [IdentityLinkController::class, 'open'])
    ->where('token', '[A-Za-z0-9]{48}')
    ->middleware('throttle:30,1')
    ->name('due-diligence.verify');
Route::get('/due-diligence/verify/{token}/done', [IdentityLinkController::class, 'done'])
    ->where('token', '[A-Za-z0-9]{48}')
    ->name('due-diligence.verify.done');

Route::prefix('admin/integrations')->name('admin.integrations.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('index');
    Route::post('/events/{event:id}/retry', [AdminController::class, 'retry'])->name('events.retry');
    Route::post('/events/{event:id}/resolve', [AdminController::class, 'resolve'])->name('events.resolve');
    Route::post('/release-held', [AdminController::class, 'releaseHeld'])->name('release-held');
    Route::post('/identity/checks/{check}', [AdminController::class, 'startCheck'])->name('identity.start');
});
