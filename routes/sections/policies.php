<?php

use App\Http\Controllers\PoliciesController;
use App\Support\Content\Policies;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Policies hub
|--------------------------------------------------------------------------
*/

Route::get('/policies', [PoliciesController::class, 'index'])->name('policies');
Route::get('/policies/{policy}', [PoliciesController::class, 'show'])->whereIn('policy', Policies::slugs())->name('policies.show');

// Short links used across the site (e.g. the checkout terms checkbox).
Route::redirect('/refund-policy', '/policies/refund-and-cancellation');
Route::redirect('/cookie-policy', '/policies/cookies');
Route::redirect('/paia', '/policies/popia-paia');
