<?php

use App\Http\Controllers\Platform\EmbeddedServicesController;
use App\Support\Platform\EmbeddedServices;
use Illuminate\Support\Facades\Route;

/* --- Embedded services (Batch 4D) by host module ------------------------- */
Route::get('/embedded-services', [EmbeddedServicesController::class, 'index'])->name('embedded.index');
Route::get('/embedded-services/{module}', [EmbeddedServicesController::class, 'show'])
    ->whereIn('module', array_keys(EmbeddedServices::MODULES))
    ->name('embedded.module');
