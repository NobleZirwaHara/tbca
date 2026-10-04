<?php

use App\Http\Controllers\Core\AdminController;
use Illuminate\Support\Facades\Route;

/* --- Staff hub. Section consoles live in their own files under /admin/<section>. */
Route::get('/admin', [AdminController::class, 'index'])->middleware(['auth', 'admin'])->name('admin');
