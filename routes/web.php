<?php

use App\Http\Controllers\ContextController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TBCA Canonical Route Matrix
|--------------------------------------------------------------------------
| Each platform section owns its own file in routes/sections/. They are
| loaded alphabetically; "pages.php" holds the generic route-page fallbacks
| and is loaded last so a section file can claim one of those slugs first.
*/

Route::get('/', HomeController::class)->name('home');

Route::post('/context', [ContextController::class, 'update'])->name('context.update');

$sections = glob(__DIR__.'/sections/*.php');
usort($sections, fn ($a, $b) => (basename($a) === 'pages.php') <=> (basename($b) === 'pages.php') ?: strcmp($a, $b));

foreach ($sections as $file) {
    require $file;
}
