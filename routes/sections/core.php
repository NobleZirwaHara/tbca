<?php

use App\Http\Controllers\Core\AuthController;
use App\Http\Controllers\Core\BasketController;
use App\Http\Controllers\Core\CheckoutController;
use App\Http\Controllers\Core\FormController;
use Illuminate\Support\Facades\Route;

/* --- Identity ----------------------------------------------------------- */
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
    Route::get('/register/{step?}', [AuthController::class, 'showRegister'])->whereNumber('step')->name('register');
    Route::post('/register/{step}', [AuthController::class, 'register'])->whereNumber('step')->name('register.step');
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

/* --- Basket and checkout ------------------------------------------------ */
Route::get('/basket', [BasketController::class, 'show'])->name('basket');
Route::post('/basket', [BasketController::class, 'store'])->name('basket.add');
Route::delete('/basket/{item}', [BasketController::class, 'destroy'])->whereNumber('item')->name('basket.remove');
Route::post('/basket/checkout', [BasketController::class, 'checkout'])->name('basket.checkout');

Route::get('/checkout/{order}', [CheckoutController::class, 'show'])->name('checkout.show');
Route::post('/checkout/{order}/pay', [CheckoutController::class, 'pay'])->name('checkout.pay');
Route::get('/checkout/{order}/processing', [CheckoutController::class, 'processing'])->name('checkout.processing');
Route::get('/checkout/{order}/confirmation', [CheckoutController::class, 'confirmation'])->name('checkout.confirmation');

/* --- Generic inbound records -------------------------------------------- */
Route::post('/forms/{type}', [FormController::class, 'submit'])->name('forms.submit');
Route::post('/bookings', [FormController::class, 'book'])->name('bookings.store');
Route::get('/bookings/slots', [FormController::class, 'slots'])->name('bookings.slots');
Route::post('/saved', [FormController::class, 'toggleSaved'])->middleware('auth')->name('saved.toggle');
