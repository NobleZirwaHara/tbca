<?php

use App\Http\Controllers\CompanyProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Company Profile
|--------------------------------------------------------------------------
| Must load before insights.php, whose /resources/{resource} catch-all would
| otherwise swallow this URI ("company-profile.php" sorts before "insights.php").
*/

Route::get('/resources/company-profile', [CompanyProfileController::class, 'show'])->name('company-profile');
Route::get('/resources/company-profile/download', [CompanyProfileController::class, 'download'])->name('company-profile.download');
