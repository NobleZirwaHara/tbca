<?php

use App\Http\Controllers\About\AboutController;
use App\Http\Controllers\About\Admin\ClaimsAdminController;
use App\Http\Controllers\About\Admin\GovernanceAdminController;
use App\Http\Controllers\About\Admin\OperationsAdminController;
use App\Http\Controllers\About\CareersController;
use App\Http\Controllers\About\CorrectionsController;
use App\Http\Controllers\About\EnquiryController;
use App\Http\Controllers\About\NewsroomController;
use App\Http\Controllers\About\StatusController;
use App\Http\Controllers\About\TrustController;
use App\Http\Controllers\About\WhistleblowingController;
use Illuminate\Support\Facades\Route;

/* --- About TBCA ---------------------------------------------------------- */
Route::prefix('about')->name('about.')->group(function () {
    Route::get('/', [AboutController::class, 'index'])->name('index');
    Route::get('/our-story', [AboutController::class, 'story'])->name('story');
    Route::redirect('/story', '/about/our-story');
    Route::get('/methodology', [AboutController::class, 'methodology'])->name('methodology');
    Route::get('/team', [AboutController::class, 'team'])->name('team');
    Route::get('/team/{slug}', [AboutController::class, 'member'])->name('member');
    Route::get('/governance', [AboutController::class, 'governance'])->name('governance');
    Route::get('/certifications', [AboutController::class, 'certifications'])->name('certifications');
    Route::redirect('/verifications', '/about/certifications');
    Route::get('/relationships', [AboutController::class, 'relationships'])->name('relationships');
    Route::get('/corrections', [CorrectionsController::class, 'index'])->name('corrections');
    Route::get('/corrections/export', [CorrectionsController::class, 'export'])->name('corrections.export');
    Route::post('/corrections/concern', [CorrectionsController::class, 'concern'])->middleware('throttle:20,1')->name('corrections.concern');
    Route::get('/professional-boundaries', [AboutController::class, 'boundaries'])->name('boundaries');
    Route::get('/ai-disclosure', [AboutController::class, 'aiDisclosure'])->name('ai-disclosure');
    Route::get('/ai-disclosure/notice', [AboutController::class, 'aiNotice'])->name('ai-notice');
    Route::get('/our-promise', [AboutController::class, 'promise'])->name('promise');
    Route::get('/testimonials', [AboutController::class, 'testimonials'])->name('testimonials');
    Route::get('/trusted-institutions', [AboutController::class, 'trustedInstitutions'])->name('trusted-institutions');
    Route::get('/trust-badge', [AboutController::class, 'trustBadge'])->name('trust-badge');
    Route::get('/professional-limitation-notice', [AboutController::class, 'limitationNotice'])->name('limitation-notice');
    Route::get('/contact', [AboutController::class, 'contact'])->name('contact');
    Route::get('/partner-enquiry', [EnquiryController::class, 'partner'])->name('partner');
    Route::post('/partner-enquiry', [EnquiryController::class, 'storePartner'])->middleware('throttle:20,1')->name('partner.store');
});

/* --- Trust & legal --------------------------------------------------------- */
Route::get('/trust-centre', [TrustController::class, 'trustCentre'])->name('trust-centre');
Route::redirect('/trust', '/trust-centre');
Route::get('/privacy', [TrustController::class, 'privacy'])->name('privacy');
Route::get('/terms', [TrustController::class, 'terms'])->name('terms');
Route::get('/system-status', [StatusController::class, 'index'])->name('system-status');
Route::redirect('/status', '/system-status');

/* --- Careers ----------------------------------------------------------------- */
Route::prefix('careers')->name('careers.')->group(function () {
    Route::get('/', [CareersController::class, 'index'])->name('index');
    Route::get('/application-status', [CareersController::class, 'status'])->name('status');
    Route::get('/{vacancy}', [CareersController::class, 'show'])->name('show');
    Route::get('/{vacancy}/apply/{step?}', [CareersController::class, 'apply'])->name('apply');
    Route::post('/{vacancy}/apply/{step}', [CareersController::class, 'save'])->middleware('throttle:30,1')->name('apply.save');
});
Route::get('/candidate-privacy', [CareersController::class, 'candidatePrivacy'])->name('candidate-privacy');

/* --- Newsroom ------------------------------------------------------------------ */
Route::prefix('newsroom')->name('newsroom.')->group(function () {
    Route::get('/', [NewsroomController::class, 'index'])->name('index');
    Route::get('/media-contact', [NewsroomController::class, 'media'])->name('media');
    Route::redirect('/media-enquiries', '/newsroom/media-contact');
    Route::post('/media-contact', [NewsroomController::class, 'storeMedia'])->middleware('throttle:20,1')->name('media.store');
    Route::get('/{news}', [NewsroomController::class, 'show'])->name('show');
});

/* --- Complaints & whistleblowing ---------------------------------------------- */
Route::get('/complaints', [EnquiryController::class, 'complaints'])->name('complaints.create');
Route::post('/complaints', [EnquiryController::class, 'storeComplaint'])->middleware('throttle:20,1')->name('complaints.store');
Route::get('/complaints/track', [EnquiryController::class, 'track'])->name('complaints.track');

Route::prefix('whistleblowing')->name('whistleblowing.')->group(function () {
    Route::get('/', [WhistleblowingController::class, 'create'])->name('create');
    Route::post('/', [WhistleblowingController::class, 'store'])->middleware('throttle:20,1')->name('store');
    Route::post('/draft', [WhistleblowingController::class, 'saveDraft'])->name('draft');
    Route::get('/follow-up', [WhistleblowingController::class, 'followUp'])->name('follow-up');
    Route::post('/follow-up', [WhistleblowingController::class, 'access'])->middleware('throttle:20,1')->name('access');
    Route::get('/case', [WhistleblowingController::class, 'showCase'])->name('case');
    Route::post('/case/reply', [WhistleblowingController::class, 'reply'])->middleware('throttle:20,1')->name('reply');
    Route::post('/case/leave', [WhistleblowingController::class, 'leave'])->name('leave');
});

/* --- About admin consoles (34-38 + operations) ------------------------------- */
Route::prefix('admin/about')->name('admin.about.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [ClaimsAdminController::class, 'overview'])->name('overview');

    Route::get('/claims', [ClaimsAdminController::class, 'claims'])->name('claims');
    Route::get('/claims/export', [ClaimsAdminController::class, 'claimsExport'])->name('claims.export');
    Route::post('/claims/{claim}/action', [ClaimsAdminController::class, 'claimAction'])->name('claims.action');

    Route::get('/evidence', [ClaimsAdminController::class, 'evidence'])->name('evidence');
    Route::get('/evidence/export', [ClaimsAdminController::class, 'evidenceExport'])->name('evidence.export');
    Route::post('/evidence/{evidence}/action', [ClaimsAdminController::class, 'evidenceAction'])->name('evidence.action');

    Route::get('/certifications', [ClaimsAdminController::class, 'certifications'])->name('certifications');
    Route::post('/certifications', [ClaimsAdminController::class, 'certStore'])->name('certifications.store');
    Route::post('/certifications/{asset}/renew', [ClaimsAdminController::class, 'certRenew'])->name('certifications.renew');
    Route::post('/certifications/{asset}/state', [ClaimsAdminController::class, 'certState'])->name('certifications.state');

    Route::get('/testimonials', [GovernanceAdminController::class, 'testimonials'])->name('testimonials');
    Route::get('/testimonials/export', [GovernanceAdminController::class, 'consentExport'])->name('testimonials.export');
    Route::post('/testimonials', [GovernanceAdminController::class, 'testimonialStore'])->name('testimonials.store');
    Route::post('/testimonials/{testimonial}/action', [GovernanceAdminController::class, 'testimonialAction'])->name('testimonials.action');

    Route::get('/corrections', [GovernanceAdminController::class, 'corrections'])->name('corrections');
    Route::post('/corrections', [GovernanceAdminController::class, 'correctionStore'])->name('corrections.store');
    Route::post('/corrections/{correction}/action', [GovernanceAdminController::class, 'correctionAction'])->name('corrections.action');

    Route::get('/careers', [OperationsAdminController::class, 'careers'])->name('careers');
    Route::post('/careers/applications/{application}/status', [OperationsAdminController::class, 'applicationStatus'])->name('careers.application');
    Route::get('/careers/applications/{application}/cv', [OperationsAdminController::class, 'applicationCv'])->name('careers.cv');
    Route::post('/careers/vacancies/{vacancy:id}/status', [OperationsAdminController::class, 'vacancyStatus'])->name('careers.vacancy');

    Route::get('/cases', [OperationsAdminController::class, 'cases'])->name('cases');
    Route::post('/cases/{case}/status', [OperationsAdminController::class, 'caseStatus'])->name('cases.status');
    Route::post('/whistleblowing/{report}', [OperationsAdminController::class, 'whistleUpdate'])->name('whistle.update');

    Route::get('/status', [OperationsAdminController::class, 'status'])->name('status');
    Route::post('/status/components/{component}', [OperationsAdminController::class, 'componentUpdate'])->name('status.component');
    Route::post('/status/incidents', [OperationsAdminController::class, 'incidentStore'])->name('status.incident');
    Route::post('/status/incidents/{incident}/resolve', [OperationsAdminController::class, 'incidentResolve'])->name('status.resolve');
});
