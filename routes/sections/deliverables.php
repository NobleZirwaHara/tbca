<?php

use App\Http\Controllers\Deliverables\AdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Registry of Deliverables: staff console
|--------------------------------------------------------------------------
| The client's register of every deliverable the WebApp sells (MP-DEL-2.0).
| The Sprint pages show the client-facing part ("What you will receive").
*/

Route::prefix('admin/deliverables')->name('admin.deliverables.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('index');
    Route::get('/crosswalk', [AdminController::class, 'crosswalk'])->name('crosswalk');
    Route::get('/automation', [AdminController::class, 'automation'])->name('automation');
    Route::get('/standards', [AdminController::class, 'standards'])->name('standards');
    Route::get('/export.csv', [AdminController::class, 'export'])->name('export');
    Route::get('/{ref}', [AdminController::class, 'show'])->where('ref', 'DEL-[A-Z]{2}-[0-9]{3,5}')->name('show');
});
