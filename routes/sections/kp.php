<?php

use App\Http\Controllers\Kp\KpConsoleController;
use App\Http\Controllers\Kp\KpController;
use App\Http\Controllers\Kp\KpToolsController;
use App\Support\Content\KpThoughtLeadership as Kp;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| KP Thought Leadership (KP TEB v2.0, screens KP-SCR-001 to KP-SCR-072)
|--------------------------------------------------------------------------
| Public screens 001 to 050 under /kp-thought-leadership, governance consoles
| 051 to 072 under /admin/kp (staff only). Older KP URLs redirect.
*/

Route::get('/kp-thought-leadership', [KpController::class, 'home'])->name('kp-thought-leadership');

Route::prefix('kp-thought-leadership')->name('kp.')->group(function () {
    Route::controller(KpController::class)->group(function () {
        Route::get('/handoff', 'handoff')->name('handoff');
        Route::get('/legacy-bridge', 'legacyBridge')->name('legacy-bridge');
        Route::get('/authority', 'authority')->name('authority');
        Route::get('/about', 'about')->name('about');
        Route::get('/insights', 'insights')->name('insights');
        Route::get('/insights/{slug}', 'article')->name('article');
        Route::get('/founders-notes', 'foundersNotes')->name('founders-notes');
        Route::get('/founders-notes/{slug}', 'foundersNote')->name('founders-note');
        Route::get('/african-business-clinic', 'clinic')->name('clinic');
        Route::get('/topics', 'topics')->name('topics');
        Route::get('/topics/{slug}', 'topic')->name('topic');
        Route::get('/search', 'search')->name('search');
        Route::get('/work-with-kruger', 'work')->name('work');
        Route::get('/book', 'book')->name('book');
        Route::post('/book', 'storeBooking')->middleware('throttle:10,1')->name('book.store');
        Route::get('/project-development', 'projectDesk')->name('project-desk');
        Route::post('/project-development', 'storeProjectBrief')->middleware('throttle:10,1')->name('project-desk.store');
        Route::get('/speaking-media', 'speaking')->name('speaking');
        Route::post('/speaking-media', 'storeSpeaking')->middleware('throttle:10,1')->name('speaking.store');
        Route::get('/resources', 'resources')->name('resources');
        Route::get('/resources/{slug}/download', 'downloadResource')->name('resources.download');
        Route::get('/resources/{slug}', 'resourceArticle')->name('resources.article');
        Route::get('/africa/{slug?}', 'country')->name('country');
        Route::get('/sectors/{slug?}', 'sector')->name('sector');
        Route::get('/lens/{mode}/{slug}/brief', 'lensBrief')->whereIn('mode', ['country', 'sector'])->name('lens.brief');
        Route::get('/free-and-paid', 'freePaid')->name('free-paid');
        Route::get('/related-route', 'relatedRoute')->name('related-route');
        Route::get('/standards/{component}', 'standard')->name('standard');
        Route::get('/events', 'events')->name('events');
        Route::get('/newsletter', 'newsletter')->name('newsletter');
    });

    Route::controller(KpToolsController::class)->group(function () {
        Route::get('/ask', 'assistant')->name('ask');
        Route::post('/ask', 'ask')->middleware('throttle:20,1')->name('ask.store');
        Route::get('/ask/{answer}', 'answer')->name('answer');
        Route::get('/ask/{answer}/sources', 'sources')->name('answer.sources');
        Route::post('/ask/{answer}/feedback', 'feedback')->middleware('throttle:20,1')->name('answer.feedback');
        Route::get('/ask/{answer}/export', 'exportAnswer')->name('answer.export');
        Route::get('/explain', 'explain')->name('explain');
        Route::get('/boardroom-challenger', 'challenger')->name('challenger');
        Route::get('/funder-readiness', 'funder')->name('funder');
        Route::post('/funder-readiness', 'saveFunder')->name('funder.save');
        Route::get('/project-fatal-flaw', 'fatalFlaw')->name('fatal-flaw');
        Route::get('/decision-sheet', 'decisionSheet')->name('decision-sheet');
        Route::post('/decision-sheet', 'saveDecisionSheet')->name('decision-sheet.save');
        Route::get('/decision-sheet/{code}/export', 'exportDecisionSheet')->name('decision-sheet.export');
        Route::get('/corrections', 'corrections')->name('corrections');
        Route::post('/corrections', 'reportCorrection')->middleware('throttle:10,1')->name('corrections.report');
        Route::get('/action-pack/{slug}', 'actionPack')->name('action-pack');
        Route::post('/action-pack/{slug}/progress', 'actionProgress')->name('action-pack.progress');
        Route::get('/action-pack/{slug}/download', 'downloadActionPack')->name('action-pack.download');
        Route::get('/diagnostic-questions', 'diagnostics')->name('diagnostics');
        Route::post('/diagnostic-questions', 'saveDiagnostics')->name('diagnostics.save');
        Route::get('/tools/scorecards/{key}', 'scorecard')->name('scorecard');
        Route::post('/tools/scorecards/{key}', 'saveScorecard')->name('scorecard.save');
        Route::get('/tools/scorecards/{key}/export', 'exportScorecard')->name('scorecard.export');
        Route::get('/tools/calculators/{key}', 'calculator')->name('calculator');
        Route::post('/tools/calculators/{key}', 'saveCalculation')->name('calculator.save');
        Route::get('/tools/checklists/{key}', 'checklist')->name('checklist');
        Route::post('/tools/checklists/{key}', 'saveChecklist')->name('checklist.save');

        Route::prefix('future-builders')->name('fb.')->group(function () {
            Route::get('/', 'fbHome')->name('home');
            Route::get('/topics', 'fbTopics')->name('topics');
            Route::get('/lessons/{course}/{n}', 'lesson')->whereNumber('n')->name('lesson');
            Route::post('/lessons/{course}/{n}/complete', 'completeLesson')->whereNumber('n')->name('lesson.complete');
            Route::get('/challenge', 'challenge')->name('challenge');
            Route::post('/challenge', 'storeChallenge')->middleware('throttle:10,1')->name('challenge.store');
            Route::get('/activities/{slug}', 'activity')->name('activity');
            Route::get('/activities/{slug}/download', 'downloadActivity')->name('activity.download');
            Route::get('/educators', 'educators')->name('educators');
            Route::post('/educators', 'storeEducator')->middleware('throttle:10,1')->name('educators.store');
            Route::get('/educators/packs/{course}', 'downloadPack')->name('educators.pack');
            Route::get('/guardians', 'guardians')->name('guardians');
            Route::post('/guardians', 'storeGuardian')->middleware('throttle:10,1')->name('guardians.store');
            Route::get('/lite', 'lite')->name('lite');
            Route::post('/lite', 'toggleLite')->name('lite.toggle');
        });
    });

    // Older KP URLs (phase 1 build) keep working.
    Route::redirect('/articles', Kp::BASE.'/insights', 301);
    Route::get('/articles/{slug}', fn (string $slug) => redirect(Kp::BASE.'/insights/'.$slug, 301));
    Route::get('/themes/{theme}', fn (string $theme) => redirect(Kp::BASE.'/topics/'.$theme, 301));
    Route::redirect('/about-kruger-phiri', Kp::BASE.'/about', 301);
    Route::redirect('/speaking', Kp::BASE.'/speaking-media', 301);
    Route::redirect('/podcasts', Kp::BASE.'/resources?category=media', 301);
    Route::redirect('/downloads', Kp::BASE.'/resources?category=report', 301);
    Route::redirect('/series', Kp::BASE.'/topics', 301);
    Route::get('/series/{slug}', fn () => redirect(Kp::BASE.'/topics', 301));
});

/* --- Governance consoles KP-SCR-051 to KP-SCR-072 (staff only) ----------- */
Route::middleware(['auth', 'admin'])->prefix('admin/kp')->name('admin.kp.')->controller(KpConsoleController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::patch('/records/{record}', 'update')->name('records.update');
    Route::post('/{console}/records', 'store')->name('records.store');
    Route::get('/{console}/export', 'export')->name('export');
    Route::get('/{console}', 'show')->name('console');
});
