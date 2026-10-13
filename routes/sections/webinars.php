<?php

use App\Http\Controllers\Webinars\WebinarConsoleController;
use App\Http\Controllers\Webinars\WebinarController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Webinars transaction ecosystem (WB-TEB)
|--------------------------------------------------------------------------
| Loaded after core-pages.php, so GET /webinars here replaces the earlier
| landing-page route of the same name.
*/

Route::get('/webinars', [WebinarController::class, 'index'])->name('webinars');

Route::prefix('webinars')->name('webinars.')->controller(WebinarController::class)->group(function () {
    Route::get('/replays', 'replays')->name('replays');
    Route::get('/my-registrations', 'myRegistrations')->name('mine');

    Route::get('/{webinar}', 'show')->name('show');
    Route::get('/{webinar}/register', 'register')->name('register');
    Route::post('/{webinar}/register', 'storeRegistration')->name('register.store');
    Route::get('/{webinar}/confirmed', 'confirmed')->name('confirmed');
    Route::get('/{webinar}/my-registration', 'myRegistration')->name('registration');
    Route::patch('/{webinar}/my-registration', 'updateRegistration')->name('registration.update');
    Route::post('/{webinar}/my-registration/cancel', 'cancelRegistration')->name('registration.cancel');
    Route::get('/{webinar}/pre-event', 'preEvent')->name('pre-event');
    Route::get('/{webinar}/calendar.ics', 'calendar')->name('calendar');
    Route::get('/{webinar}/resources/{key}', 'resource')->name('resource');

    Route::get('/{webinar}/live', 'live')->name('live');
    Route::get('/{webinar}/live/qa', 'qa')->name('qa');
    Route::get('/{webinar}/live/polls', 'polls')->name('polls');
    Route::post('/{webinar}/live/chat', 'postChat')->middleware('throttle:30,1')->name('chat');
    Route::post('/{webinar}/live/questions', 'postQuestion')->middleware('throttle:10,1')->name('questions');
    Route::post('/{webinar}/live/questions/{question}/upvote', 'upvote')->name('questions.upvote');
    Route::post('/{webinar}/live/polls/{poll}/vote', 'vote')->name('polls.vote');

    Route::get('/{webinar}/thank-you', 'thanks')->name('thanks');
    Route::post('/{webinar}/feedback', 'storeFeedback')->middleware('throttle:10,1')->name('feedback');
    Route::get('/{webinar}/certificate', 'certificate')->name('certificate');
    Route::get('/{webinar}/offers', 'offers')->name('offers');
    Route::get('/{webinar}/missed', 'missed')->name('missed');
    Route::get('/{webinar}/replay', 'replay')->name('replay');
    Route::get('/{webinar}/replay/watch', 'watch')->name('watch');
    Route::post('/{webinar}/replay/notes', 'saveNotes')->name('notes');
    Route::post('/{webinar}/replay/quiz', 'quiz')->name('quiz');
});

/* --- Staff consoles ------------------------------------------------------ */
Route::middleware(['auth', 'admin'])->prefix('admin/webinars')->name('admin.webinars.')->controller(WebinarConsoleController::class)->group(function () {
    Route::get('/', 'commandCentre')->name('command-centre');
    Route::post('/{webinar}/records', 'storeRecord')->name('records.store');
    Route::patch('/{webinar}/records/{record}', 'updateRecord')->name('records.update');
    Route::post('/{webinar}/toggles', 'toggle')->name('toggles');
    Route::post('/{webinar}/transition', 'transition')->name('transition');
    Route::post('/{webinar}/questions/{question}', 'moderateQuestion')->name('questions');
    Route::post('/{webinar}/polls', 'storePoll')->name('polls.store');
    Route::post('/{webinar}/polls/{poll}', 'pollAction')->name('polls.action');
    Route::post('/{webinar}/notes', 'saveNotes')->name('notes');
    Route::post('/{webinar}/provider', 'provider')->name('provider');
    Route::post('/{webinar}/registrations/action', 'registrationAction')->name('registrations.action');
    Route::get('/{webinar}/export/{dataset}', 'export')->name('export');
    Route::get('/{webinar}/{console}', 'show')->whereIn('console', array_keys(WebinarConsoleController::CONSOLES))->name('console');
});
