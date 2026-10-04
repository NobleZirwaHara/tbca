<?php

use App\Http\Controllers\Portal\AccountController;
use App\Http\Controllers\Portal\Admin\AdminConsoleController;
use App\Http\Controllers\Portal\Admin\AdminFinanceController;
use App\Http\Controllers\Portal\Admin\AdminTrustController;
use App\Http\Controllers\Portal\ContinuityController;
use App\Http\Controllers\Portal\DashboardController;
use App\Http\Controllers\Portal\DeliveryController;
use App\Http\Controllers\Portal\DocumentController;
use App\Http\Controllers\Portal\FinanceController;
use App\Http\Controllers\Portal\FinanceExtraController;
use App\Http\Controllers\Portal\JourneyController;
use App\Http\Controllers\Portal\LandingController;
use App\Http\Controllers\Portal\PrivacyController;
use App\Http\Controllers\Portal\SecurityController;
use App\Http\Controllers\Portal\SupportController;
use App\Http\Controllers\Portal\WorkspaceController;
use App\Support\Portal\EnsurePortalAccess;
use App\Support\Portal\SharePortalAdminNav;
use Illuminate\Support\Facades\Route;

/* --- Client Portal: public entry (CP-SCR-001..004, 008) ------------------ */
Route::get('/portal', [LandingController::class, 'index'])->name('portal');
Route::get('/portal/activate/{token}', [LandingController::class, 'activate'])->name('portal.activate');
Route::post('/portal/activate/{token}', [LandingController::class, 'activateStore']);
Route::get('/portal/recover', [LandingController::class, 'recover'])->name('portal.recover');
Route::post('/portal/recover', [LandingController::class, 'recoverStore']);
Route::get('/portal/s/{token}', [LandingController::class, 'shared'])->name('portal.shared');
Route::post('/portal/s/{token}', [LandingController::class, 'sharedConfirm']);
Route::get('/portal/s/{token}/download', [LandingController::class, 'sharedDownload']);

/* --- Client Portal: signed-in workspace ---------------------------------- */
Route::middleware(['auth', EnsurePortalAccess::class])->prefix('portal')->group(function () {
    // Overview
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('portal.dashboard');
    Route::get('/actions', [DashboardController::class, 'actions']);
    Route::get('/welcome', [DashboardController::class, 'welcome']);
    Route::post('/welcome/{step}', [DashboardController::class, 'completeStep']);
    Route::get('/next-steps', [DashboardController::class, 'nextSteps']);
    Route::get('/notifications', [DashboardController::class, 'notifications']);
    Route::post('/notifications/read-all', [DashboardController::class, 'readAll']);
    Route::post('/notifications/{notice}/read', [DashboardController::class, 'read']);
    Route::get('/sitemap', [DashboardController::class, 'sitemap']);

    // Account & organisation
    Route::get('/profile', [AccountController::class, 'profile']);
    Route::put('/profile', [AccountController::class, 'updateProfile']);
    Route::get('/organisation', [AccountController::class, 'organisation']);
    Route::put('/organisation', [AccountController::class, 'updateOrganisation']);
    Route::get('/organisations', [AccountController::class, 'organisations']);
    Route::post('/organisations/{organisation}/switch', [AccountController::class, 'switchOrganisation']);
    Route::get('/team', [AccountController::class, 'team']);
    Route::post('/team', [AccountController::class, 'invite']);
    Route::put('/team/{membership}', [AccountController::class, 'updateMember']);
    Route::post('/team/{membership}/{action}', [AccountController::class, 'memberAction'])->whereIn('action', ['resend', 'deactivate', 'reactivate', 'approve']);
    Route::get('/relationships', [AccountController::class, 'relationships']);
    Route::get('/access/api', [AccountController::class, 'api']);
    Route::post('/access/api', [AccountController::class, 'createPrincipal']);
    Route::post('/access/api/{principal}/revoke', [AccountController::class, 'revokePrincipal']);
    Route::get('/participants', [AccountController::class, 'participants']);
    Route::get('/participants/onboarding', [AccountController::class, 'participantOnboarding']);
    Route::post('/participants', [AccountController::class, 'inviteParticipant']);
    Route::post('/participants/{record}/review', [AccountController::class, 'reviewParticipant']);
    Route::get('/settings', [AccountController::class, 'settings']);
    Route::put('/settings', [AccountController::class, 'updateSettings']);
    Route::get('/accessibility', [AccountController::class, 'accessibility']);
    Route::put('/accessibility', [AccountController::class, 'updateAccessibility']);
    Route::get('/language', [AccountController::class, 'language']);
    Route::put('/language', [AccountController::class, 'updateLanguage']);

    // Security
    Route::get('/security', [SecurityController::class, 'index']);
    Route::post('/security/password', [SecurityController::class, 'password']);
    Route::post('/security/mfa/start', [SecurityController::class, 'mfaStart']);
    Route::post('/security/mfa/verify', [SecurityController::class, 'mfaVerify']);
    Route::post('/security/mfa/disable', [SecurityController::class, 'mfaDisable']);
    Route::post('/security/events/{event}/review', [SecurityController::class, 'reviewEvent']);
    Route::get('/security/sessions', [SecurityController::class, 'sessions']);
    Route::post('/security/sessions/others', [SecurityController::class, 'signOutOthers']);
    Route::post('/security/sessions/{session}/revoke', [SecurityController::class, 'revokeSession']);
    Route::post('/security/devices/{device}/{action}', [SecurityController::class, 'deviceAction'])->whereIn('action', ['trust', 'remove']);
    Route::get('/security/step-up', [SecurityController::class, 'stepUp']);
    Route::post('/security/step-up', [SecurityController::class, 'stepUpVerify']);
    Route::post('/security/step-up/send', [SecurityController::class, 'stepUpSend']);
    Route::get('/security/ownership-dispute', [SecurityController::class, 'ownershipDisputes']);

    // Finance
    Route::get('/entitlements', [FinanceController::class, 'entitlements']);
    Route::get('/orders', [FinanceController::class, 'orders']);
    Route::get('/orders/{order}', [FinanceController::class, 'order']);
    Route::post('/orders/{order}/cancel', [FinanceController::class, 'cancelOrder']);
    Route::get('/invoices', [FinanceController::class, 'invoices']);
    Route::get('/invoices/{order}', [FinanceController::class, 'invoice']);
    Route::get('/payments/{payment}', [FinanceController::class, 'payment']);
    Route::get('/statement', [FinanceController::class, 'statement']);
    Route::get('/statement/download', [FinanceController::class, 'statementDownload']);
    Route::get('/quotations', [FinanceController::class, 'quotations']);
    Route::post('/quotations/{record}/{action}', [FinanceController::class, 'quotationAction'])->whereIn('action', ['accept', 'decline', 'changes']);
    Route::get('/contracts', [FinanceController::class, 'contracts']);
    Route::post('/contracts/{record}/sign', [FinanceController::class, 'signContract']);
    Route::get('/fee-manifest', [FinanceController::class, 'feeManifest']);
    Route::get('/if-i-stop-now', [FinanceController::class, 'stopNow']);
    Route::get('/disputes', [FinanceController::class, 'disputes']);
    Route::post('/disputes', [FinanceController::class, 'raiseDispute']);
    Route::get('/renewals', [FinanceExtraController::class, 'renewals']);
    Route::post('/renewals/{record}/{action}', [FinanceExtraController::class, 'renewalAction'])->whereIn('action', ['accept', 'opt-out', 'auto']);
    Route::get('/usage', [FinanceExtraController::class, 'usage']);
    Route::post('/usage/top-up', [FinanceExtraController::class, 'topUp']);
    Route::get('/arrears', [FinanceExtraController::class, 'arrears']);
    Route::post('/arrears/help', [FinanceExtraController::class, 'arrearsHelp']);
    Route::get('/obligations', [FinanceExtraController::class, 'obligations']);
    Route::get('/forward-exposure', [FinanceExtraController::class, 'forwardExposure']);
    Route::get('/billing/group', [FinanceExtraController::class, 'groupBilling']);
    Route::get('/variations', [FinanceExtraController::class, 'variations']);
    Route::post('/variations', [FinanceExtraController::class, 'storeVariation']);
    Route::post('/variations/{case}/accept', [FinanceExtraController::class, 'acceptVariation']);
    Route::get('/procurement', [FinanceExtraController::class, 'procurement']);
    Route::post('/procurement/{record}', [FinanceExtraController::class, 'submitRequirement']);

    // Delivery
    Route::get('/projects', [DeliveryController::class, 'projects']);
    Route::get('/projects/{project}', [DeliveryController::class, 'project']);
    Route::get('/tasks', [DeliveryController::class, 'tasks']);
    Route::post('/tasks', [DeliveryController::class, 'storeTask']);
    Route::post('/tasks/{task}/complete', [DeliveryController::class, 'completeTask']);
    Route::get('/evidence', [DeliveryController::class, 'evidence']);
    Route::post('/evidence/{evidence}/upload', [DeliveryController::class, 'uploadEvidence']);
    Route::get('/deliverables', [DeliveryController::class, 'deliverables']);
    Route::get('/deliverables/{deliverable}', [DeliveryController::class, 'deliverable']);
    Route::post('/deliverables/{deliverable}/decision', [DeliveryController::class, 'decide']);
    Route::post('/deliverables/{deliverable}/share', [DeliveryController::class, 'shareDeliverable']);
    Route::get('/deliverables/{deliverable}/download', [DeliveryController::class, 'downloadDeliverable']);
    Route::get('/approvals', [DeliveryController::class, 'approvals']);
    Route::get('/qa-release', [DeliveryController::class, 'qaRelease']);
    Route::get('/timeline', [DeliveryController::class, 'timeline']);
    Route::get('/meetings', [DeliveryController::class, 'meetings']);
    Route::post('/meetings/reschedule', [DeliveryController::class, 'rescheduleMeeting'])->defaults('booking', 'reschedule');
    Route::post('/meetings/{booking}/cancel', [DeliveryController::class, 'cancelMeeting']);
    Route::post('/meetings/{booking}/reschedule', [DeliveryController::class, 'rescheduleMeeting']);
    Route::get('/meetings/calendar.ics', [DeliveryController::class, 'calendar']);
    Route::get('/closure', [DeliveryController::class, 'closure']);
    Route::post('/closure/{project}/confirm', [DeliveryController::class, 'confirmClosure']);
    Route::get('/intake', [DeliveryController::class, 'intake']);
    Route::get('/data-reuse', [DeliveryController::class, 'dataReuse']);
    Route::post('/data-reuse/{record}/{action}', [DeliveryController::class, 'dataReuseAction'])->whereIn('action', ['confirm', 'review', 'withdraw', 'confirm-all']);

    // Documents
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/documents/upload', [DocumentController::class, 'upload']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::post('/documents/folders', [DocumentController::class, 'folder']);
    Route::get('/documents/{document}', [DocumentController::class, 'show'])->whereNumber('document');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->whereNumber('document');
    Route::post('/documents/{document}/share', [DocumentController::class, 'share'])->whereNumber('document');
    Route::post('/documents/{document}/star', [DocumentController::class, 'star'])->whereNumber('document');
    Route::put('/documents/{document}', [DocumentController::class, 'update'])->whereNumber('document');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->whereNumber('document');
    Route::post('/documents/{document}/restore', [DocumentController::class, 'restore'])->whereNumber('document');
    Route::get('/exports', [DocumentController::class, 'exports']);
    Route::post('/exports', [DocumentController::class, 'createExport']);
    Route::get('/exports/{case}/download', [DocumentController::class, 'downloadExport']);

    // Workspaces
    Route::get('/diagnostics', [WorkspaceController::class, 'diagnostics']);
    Route::get('/library', [WorkspaceController::class, 'library']);
    Route::get('/workspaces/{workspace}', [WorkspaceController::class, 'workspace'])
        ->whereIn('workspace', ['subscriptions', 'retainers', 'technology', 'aiim', 'countries', 'industries', 'due-diligence', 'deal-rooms', 'project-advisory', 'partner-services', 'marketplace']);
    Route::post('/workspaces/countries/follow', [WorkspaceController::class, 'followCountry']);
    Route::get('/resources', [WorkspaceController::class, 'resources']);
    Route::post('/resources/{key}/{action}', [WorkspaceController::class, 'resourceAction'])->whereIn('action', ['download', 'bookmark']);
    Route::get('/events', [WorkspaceController::class, 'events']);
    Route::get('/kp-sessions', [WorkspaceController::class, 'kpSessions']);
    Route::post('/registrations/{kind}/{key}', [WorkspaceController::class, 'registerFor'])->whereIn('kind', ['webinar', 'kp']);
    Route::post('/registrations/{kind}/{key}/cancel', [WorkspaceController::class, 'cancelRegistration'])->whereIn('kind', ['webinar', 'kp']);
    Route::get('/reports', [WorkspaceController::class, 'reports']);
    Route::get('/benchmarks', [WorkspaceController::class, 'benchmarks']);
    Route::post('/benchmarks/{key}', [WorkspaceController::class, 'toggleBenchmark']);

    // Support & communication
    Route::get('/messages', [SupportController::class, 'messages']);
    Route::post('/messages', [SupportController::class, 'newThread']);
    Route::post('/messages/{thread}', [SupportController::class, 'reply']);
    Route::get('/whatsapp', [SupportController::class, 'whatsapp']);
    Route::put('/whatsapp', [SupportController::class, 'updateWhatsapp']);
    Route::post('/whatsapp/handoff', [SupportController::class, 'whatsappHandoff']);
    Route::get('/support', [SupportController::class, 'tickets']);
    Route::post('/support', [SupportController::class, 'storeTicket']);
    Route::get('/support/{ticket}', [SupportController::class, 'ticket']);
    Route::post('/support/{ticket}/reply', [SupportController::class, 'replyTicket']);
    Route::post('/support/{ticket}/escalate', [SupportController::class, 'escalate']);
    Route::post('/support/{ticket}/close', [SupportController::class, 'closeTicket']);
    Route::get('/natasha', [SupportController::class, 'natasha']);
    Route::post('/natasha', [SupportController::class, 'ask']);
    Route::get('/natasha/handoff', [SupportController::class, 'handoff']);
    Route::post('/natasha/handoff', [SupportController::class, 'storeHandoff']);
    Route::get('/help', [SupportController::class, 'help']);
    Route::get('/status', [SupportController::class, 'status']);
    Route::get('/escalations', [SupportController::class, 'escalations']);
    Route::post('/escalations', [SupportController::class, 'raiseEscalation']);
    Route::get('/feedback', [SupportController::class, 'feedback']);
    Route::post('/feedback', [SupportController::class, 'storeFeedback']);

    // Privacy & trust
    Route::get('/privacy', [PrivacyController::class, 'consents']);
    Route::post('/privacy/consents/{consent}', [PrivacyController::class, 'toggleConsent']);
    Route::get('/privacy/data', [PrivacyController::class, 'data']);
    Route::post('/privacy/data', [PrivacyController::class, 'storeRequest']);
    Route::get('/privacy/data/export', [PrivacyController::class, 'export']);
    Route::get('/privacy/residency', [PrivacyController::class, 'residency']);
    Route::get('/trust-passport', [PrivacyController::class, 'passport']);
    Route::get('/trust-passport/download', [PrivacyController::class, 'passportDownload']);
    Route::get('/trust-centre', [PrivacyController::class, 'trustCentre']);
    Route::get('/changes', [PrivacyController::class, 'changes']);
    Route::post('/changes/{record}/acknowledge', [PrivacyController::class, 'acknowledge']);
    Route::get('/reverification', [PrivacyController::class, 'reverification']);
    Route::post('/reverification/{record}', [PrivacyController::class, 'confirmReverification']);
    Route::get('/provenance', [PrivacyController::class, 'provenance']);
    Route::post('/provenance/{record}/{action}', [PrivacyController::class, 'provenanceAction'])->whereIn('action', ['verify', 'correct']);

    // Exit & continuity
    Route::get('/account/status', [ContinuityController::class, 'status']);
    Route::get('/account/appeal', [ContinuityController::class, 'appeal']);
    Route::post('/account/appeal/{item}', [ContinuityController::class, 'appealItem']);
    Route::post('/account/appeal', [ContinuityController::class, 'submitAppeal']);
    Route::get('/account/exit', [ContinuityController::class, 'exit']);
    Route::post('/account/exit', [ContinuityController::class, 'submitExit']);
    Route::get('/account/reactivation', [ContinuityController::class, 'reactivation']);
    Route::post('/account/reactivation', [ContinuityController::class, 'submitReactivation']);
    Route::get('/resume', [ContinuityController::class, 'resume']);
    Route::post('/resume/{case}/{action}', [ContinuityController::class, 'resumeAction'])->whereIn('action', ['pause', 'discard']);
    Route::post('/resume/clear-completed', [ContinuityController::class, 'clearCompleted']);
    Route::get('/low-data', [ContinuityController::class, 'lowData']);
    Route::put('/low-data', [ContinuityController::class, 'updateLowData']);
    Route::post('/low-data/sync', [ContinuityController::class, 'sync']);

    // Guided journeys (onboarding gates, intake, offboarding, disputes ...)
    Route::get('/journeys/{key}', [JourneyController::class, 'show'])->name('portal.journey');
    Route::post('/journeys/{key}/back', [JourneyController::class, 'back']);
    Route::post('/journeys/{key}/restart', [JourneyController::class, 'restart']);
    Route::post('/journeys/{key}', [JourneyController::class, 'advance']);
});

/* --- Client Portal Admin Control Tower (CP-SCR-089..140 back office) ------ */
Route::middleware(['auth', 'admin', SharePortalAdminNav::class])->prefix('admin/portal')->group(function () {
    Route::get('/', [AdminConsoleController::class, 'tower'])->name('admin.portal');
    Route::get('/clients', [AdminConsoleController::class, 'clients']);
    Route::post('/clients/{user}/state', [AdminConsoleController::class, 'setState']);
    Route::get('/entitlement-decisions', [AdminConsoleController::class, 'decisions']);
    Route::post('/entitlement-decisions/test', [AdminConsoleController::class, 'testDecision']);
    Route::get('/exceptions', [AdminConsoleController::class, 'exceptions']);
    Route::get('/disputes', [AdminConsoleController::class, 'disputes']);
    Route::get('/routes', [AdminConsoleController::class, 'routes']);
    Route::get('/promises', [AdminConsoleController::class, 'promises']);
    Route::get('/sla', [AdminConsoleController::class, 'sla']);
    Route::get('/capacity', [AdminConsoleController::class, 'capacity']);
    Route::get('/reviews', [AdminConsoleController::class, 'reviews']);
    Route::post('/reviews/{deliverable}/{action}', [AdminConsoleController::class, 'reviewAction'])->whereIn('action', ['approve', 'release', 'block', 'retract']);
    Route::get('/partners', [AdminConsoleController::class, 'partners']);
    Route::post('/records/{record}/status', [AdminConsoleController::class, 'recordStatus']);
    Route::post('/records', [AdminConsoleController::class, 'storeRecord']);

    Route::get('/reconciliation', [AdminFinanceController::class, 'reconciliation']);
    Route::post('/reconciliation/{order}', [AdminFinanceController::class, 'reconcile']);
    Route::get('/money-events', [AdminFinanceController::class, 'moneyEvents']);
    Route::post('/money-events/disputes/{case}', [AdminFinanceController::class, 'resolveDispute']);
    Route::get('/lifecycle', [AdminFinanceController::class, 'lifecycle']);
    Route::get('/arrears', [AdminFinanceController::class, 'arrears']);
    Route::get('/vendor-documents', [AdminFinanceController::class, 'vendorDocuments']);
    Route::get('/retention', [AdminFinanceController::class, 'retention']);
    Route::post('/retention/offers', [AdminFinanceController::class, 'createOffer']);

    Route::get('/support', [AdminTrustController::class, 'support']);
    Route::post('/support/{ticket}', [AdminTrustController::class, 'updateTicket']);
    Route::get('/communications', [AdminTrustController::class, 'communications']);
    Route::post('/communications/broadcast', [AdminTrustController::class, 'broadcast']);
    Route::get('/natasha', [AdminTrustController::class, 'natasha']);
    Route::post('/natasha/kill-switch', [AdminTrustController::class, 'killSwitch']);
    Route::get('/consent', [AdminTrustController::class, 'consent']);
    Route::post('/consent/{request_ref}', [AdminTrustController::class, 'advanceRequest']);
    Route::get('/security', [AdminTrustController::class, 'security']);
    Route::get('/successor-access', [AdminTrustController::class, 'successor']);
    Route::get('/integrations', [AdminTrustController::class, 'integrations']);
    Route::get('/uat', [AdminTrustController::class, 'uat']);
    Route::get('/handoffs', [AdminTrustController::class, 'handoffs']);
    Route::post('/handoffs/{link}/revoke', [AdminTrustController::class, 'revokeLink']);
    Route::get('/entry-surfaces', [AdminTrustController::class, 'entrySurfaces']);
    Route::post('/entry-surfaces/check', [AdminTrustController::class, 'runCheck']);
    Route::get('/continuity', [AdminTrustController::class, 'continuity']);
});
