<?php

use App\Http\Controllers\Kp\KpController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| KP Thought Leadership
|--------------------------------------------------------------------------
| Loaded after core-pages.php, so GET /kp-thought-leadership here replaces
| the earlier single landing-page route of the same name.
*/

Route::get('/kp-thought-leadership', [KpController::class, 'home'])->name('kp-thought-leadership');

Route::prefix('kp-thought-leadership')->name('kp.')->controller(KpController::class)->group(function () {
    Route::get('/articles', 'library')->defaults('kind', 'articles')->name('articles');
    Route::get('/articles/{slug}', 'article')->name('article');
    Route::get('/themes/{theme}', 'theme')->name('theme');
    Route::get('/series', 'series')->name('series');
    Route::get('/series/{slug}', 'series')->name('series.show');
    Route::get('/about-kruger-phiri', 'profile')->name('profile');
    Route::get('/speaking', 'speaking')->name('speaking');
    Route::get('/events', 'events')->name('events');
    Route::get('/podcasts', 'library')->defaults('kind', 'podcasts')->name('podcasts');
    Route::get('/downloads', 'library')->defaults('kind', 'downloads')->name('downloads');
    Route::get('/newsletter', 'connect')->name('newsletter');
    Route::get('/book', 'connect')->name('book');
});
