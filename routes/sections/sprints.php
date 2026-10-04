<?php

use App\Http\Controllers\Sprints\CatalogueController;
use App\Http\Controllers\Sprints\OrderController;
use App\Http\Controllers\Sprints\QuoteController;
use App\Http\Controllers\Sprints\SprintController;
use App\Support\Sprints\Taxonomy;
use Illuminate\Support\Facades\Route;

/* --- Sprint catalogue ---------------------------------------------------- */
Route::get('/sprints', [CatalogueController::class, 'index'])->name('sprints.index');
Route::get('/sprints/a-z', [CatalogueController::class, 'az'])->name('sprints.az');
Route::get('/sprints/category/{category}', [CatalogueController::class, 'category'])->name('sprints.category');
Route::get('/sprints/for/{audience}', [CatalogueController::class, 'audience'])->name('sprints.audience');
Route::get('/sprints/{view}', [CatalogueController::class, 'view'])
    ->whereIn('view', ['featured', 'new', 'popular', 'recommended', 'marketplace'])
    ->name('sprints.view');

Route::get('/sprints/request-a-quote', [QuoteController::class, 'show'])->name('sprints.quote');
Route::post('/sprints/request-a-quote', [QuoteController::class, 'store'])->name('sprints.quote.store');

// Mockup URLs (e.g. /sprints/featured-sprints, /sprints/smes) redirect to the canonical routes.
Route::get('/sprints/{alias}', [CatalogueController::class, 'alias'])
    ->whereIn('alias', array_keys(Taxonomy::aliases()))
    ->name('sprints.alias');

/* --- Sprint detail, order and quote ------------------------------------- */
Route::get('/sprints/{slug}/order', [OrderController::class, 'create'])->name('sprints.order');
Route::post('/sprints/{slug}/order', [OrderController::class, 'store'])->name('sprints.order.store');
Route::get('/sprints/{slug}/success', [OrderController::class, 'success'])->name('sprints.success');
Route::get('/sprints/{slug}/confirmation', [OrderController::class, 'success']);
Route::get('/sprints/{slug}/quote', [QuoteController::class, 'show'])->name('sprints.sprint-quote');
Route::post('/sprints/{slug}/quote', [QuoteController::class, 'store'])->name('sprints.sprint-quote.store');
Route::post('/sprints/{slug}/question', [SprintController::class, 'question'])->name('sprints.question');

Route::get('/sprints/{slug}', [SprintController::class, 'show'])->name('sprints.show');
Route::get('/sprints/{slug}/{tab}', [SprintController::class, 'show'])
    ->whereIn('tab', SprintController::TABS)
    ->name('sprints.tab');
