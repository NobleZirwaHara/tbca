<?php

use App\Http\Controllers\Products\ProductsAdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Digital Products, Subscriptions and Retainers
|--------------------------------------------------------------------------
| Each product family keeps its own route file in routes/sections/products/
| (that folder is not globbed by web.php, so the files load only from here).
|
|   digital.php        /digital-products/...      /admin/products/digital/...
|   subscriptions.php  /subscriptions/...         /admin/products/subscriptions/...
|   retainers.php      /retainers/...             /admin/products/retainers/...
*/

foreach (['digital', 'subscriptions', 'retainers'] as $family) {
    $file = __DIR__."/products/{$family}.php";

    if (is_file($file)) {
        require $file;
    }
}

/* --- Products governance hub ------------------------------------------- */
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/products', [ProductsAdminController::class, 'index'])->name('admin.products');
});
