<?php

namespace App\Http\Controllers\DueDiligence;

use App\Http\Controllers\Controller;
use App\Models\DueDiligence\CaseFile;
use App\Models\DueDiligence\Dispute;
use App\Models\DueDiligence\Document;
use App\Models\DueDiligence\Quote;
use App\Support\DueDiligence\CasePresenter;
use App\Support\DueDiligence\Catalogue;
use App\Support\DueDiligence\Content;
use App\Support\DueDiligence\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Client case workspace (DD-031 to DD-051). Clients see only their own
 * cases; staff may open any case. Raw vendor output is never exposed.
 */
class CaseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        Workflow::syncPaidOrders($user->id);

        return Inertia::render('DueDiligence/Cases/Index', [
            'cases' => CaseFile::where('user_id', $user->id)->latest()->get()->map(fn (CaseFile $c) => [
                'reference' => $c->reference, 'name' => $c->case_name, 'package' => $c->package_name, 'status' => $c->status,
                'statusLabel' => \App\Support\DueDiligence\CaseStateMachine::label($c->status), 'step' => \App\Support\DueDiligence\CaseStateMachine::step($c->status),
                'slaDueAt' => $c->sla_due_at?->toIso8601String(), 'actions' => count(CasePresenter::nextActions($c)) - 1, 'isSample' => $c->is_sample,
                'updatedAt' => $c->updated_at->toIso8601String(),
            ]),
            'quotes' => Quote::where('user_id', $user->id)->where('status', '!=', 'converted')->latest()->get()->map(fn (Quote $q) => [
                'reference' => $q->reference, 'family' => Catalogue::family($q->family)['name'] ?? $q->family,
                'package' => Catalogue::sku($q->sku_code)['name'] ?? $q->sku_code, 'status' => $q->status, 'step' => $q->step,
                'total' => $q->manifest['total'] ?? null, 'updatedAt' => $q->updated_at->toIso8601String(),
            ]),
            'journey' => Content::journey(),
        ]);
    }

    /** Routes /cases/{case}/{page} to the matching screen method. */
    public function screen(Request $request, CaseFile $case, string $page): Response|RedirectResponse
    {
        return $this->{\Illuminate\Support\Str::camel($page)}($request, $case);
    }

    public function show(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'Dashboard', [
            'nextActions' => CasePresenter::nextActions($case),
            'milestones' => CasePresenter::milestones($case),
            'evidence' => $case->evidence()->withCount('documents')->get(['id', 'key', 'label', 'status', 'required', 'expected']),
            'events' => CasePresenter::events($case, 5),
            'commercial' => CasePresenter::commercial($case),
            'snapshot' => $this->snapshot($case),
            'subjects' => ['entities' => max(1, count($case->subject['directors'] ?? []) > 0 ? 1 : 1), 'individuals' => count($case->subject['directors'] ?? [])],
        ]);
    }

    public function overview(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);
        $stats = Workflow::evidenceStats($case);

        return $this->page($case, 'Overview', [
            'lifecycle' => CasePresenter::lifecycle($case),
            'snapshot' => $this->snapshot($case),
            'evidenceStats' => $stats + ['inReview' => $case->documents()->where('category', 'evidence')->where('status', 'received')->count(), 'approved' => $case->evidence()->where('status', 'approved')->count()],
            'events' => CasePresenter::events($case, 4),
            'alerts' => $this->alerts($case, $stats),
            'commercial' => CasePresenter::commercial($case),
            'nextAction' => CasePresenter::nextActions($case)[0] ?? null,
        ]);
    }

    public function subject(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'Subject', [
            'subject' => $case->subject ?? [],
            'missing' => Workflow::missingSubjectFields($case),
            'options' => Content::options(),
            'quality' => $this->quality($case),
            'documents' => $this->documents($case, 'evidence'),
            'consent' => $case->quote?->consent,
        ]);
    }

    public function consent(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'Consent', [
            'consents' => $case->consents()->get(),
            'percent' => Workflow::consentPercent($case),
            'documents' => $this->documents($case, 'consent'),
            'requests' => $case->consentRequests()->latest()->get()->map(fn ($r) => $r->only('id', 'recipient_name', 'recipient_role', 'recipient_email', 'channel', 'status', 'reminders') + [
                'sentAt' => $r->created_at->toIso8601String(), 'expiresAt' => $r->expires_at?->toIso8601String(),
                'link' => route('due-diligence.consent-link.show', $r->token),
                'consentLabel' => $r->consent?->label,
            ]),
            'audit' => CasePresenter::events($case, 8, ['dd.consent', 'dd.status_intake_open', 'dd.payment', 'dd.processing']),
            'purpose' => [
                'subject' => $case->subject_name, 'requester' => $case->client_name, 'purpose' => $case->purpose,
                'jurisdiction' => $case->jurisdiction, 'lawfulBasis' => 'Consent and legitimate interest within permitted scope',
                'scope' => Catalogue::sku($case->sku_code)['included'] ?? '',
                'authorityBasis' => $case->quote?->consent['authority_basis'] ?? 'Board mandate',
            ],
        ]);
    }

    public function evidence(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'Evidence', [
            'items' => $case->evidence()->with('documents:id,evidence_item_id,original_name,size,status,created_at')->get(),
            'stats' => Workflow::evidenceStats($case),
            'documents' => $this->documents($case),
            'blocker' => $case->status === 'intake_open' ? Workflow::intakeBlocker($case) : null,
            'canUpload' => in_array($case->status, ['consent_pending', 'intake_open', 'ready_for_checks', 'checks_running', 'review_required', 'partner_review'], true),
        ]);
    }

    public function missing(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'Missing', [
            'items' => $case->evidence()->withCount('documents')->get(),
            'stats' => Workflow::evidenceStats($case),
            'requests' => $case->requests()->whereIn('type', ['scope_change', 'alternative_evidence'])->latest()->get(),
            'lastEvent' => CasePresenter::events($case, 1, ['dd.evidence'])[0] ?? null,
        ]);
    }

    public function checks(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);
        $checks = $case->checks()->get();
        $stats = Workflow::evidenceStats($case);

        return $this->page($case, 'Checks', [
            'checks' => $checks->map(fn ($c) => $c->only('id', 'category', 'detail', 'vendor', 'vendor_detail', 'status', 'total', 'done', 'hold_reason', 'external_approved_zar', 'external_used_zar') + ['updatedAt' => $c->updated_at->toIso8601String()]),
            'feed' => CasePresenter::events($case, 8, ['dd.check', 'dd.status_checks', 'dd.evidence_submitted', 'dd.reviewer']),
            'coverage' => [
                'documents' => $stats['percent'],
                'subjects' => Workflow::missingSubjectFields($case) ? 70 : 100,
                'jurisdictions' => $case->jurisdiction === 'South Africa' ? 100 : 80,
            ],
        ]);
    }

    public function risk(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'Risk', [
            'findings' => $case->findings()->latest()->get()->map(fn ($f) => $f->only('id', 'reference', 'check_category', 'flag_type', 'source', 'severity', 'status', 'summary', 'response_type', 'client_response') + ['detectedAt' => $f->detected_at?->toIso8601String()]),
            'lastEvent' => CasePresenter::events($case, 1, ['dd.risk_flag'])[0] ?? null,
        ]);
    }

    public function review(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'Review', [
            'reviewer' => ['name' => $case->reviewer_name, 'role' => $case->reviewer_role, 'startedAt' => $case->review_started_at?->toIso8601String(), 'dueAt' => $case->review_due_at?->toIso8601String(), 'decision' => $case->review_decision],
            'requests' => $case->requests()->whereIn('type', ['information'])->latest()->get(),
            'flags' => ['total' => $case->findings()->count(), 'awaiting' => $case->findings()->where('status', 'open')->count(), 'categories' => $case->findings()->distinct('check_category')->count('check_category')],
            'documentCount' => $case->documents()->count(),
            'lastEvent' => CasePresenter::events($case, 1, ['dd.status_review'])[0] ?? null,
        ]);
    }

    public function partnerReview(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'PartnerReview', [
            'partner' => $case->partner,
            'tasks' => $case->tasks()->where('kind', 'partner')->get(),
            'requests' => $case->requests()->where('type', 'partner')->latest()->get(),
            'referredAt' => CasePresenter::events($case, 1, ['dd.status_partner'])[0]['at'] ?? null,
        ]);
    }

    public function reportStatus(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);
        $draft = $case->reports()->whereIn('status', ['draft', 'final'])->latest('id')->first();

        return $this->page($case, 'ReportStatus', [
            'tasks' => $case->tasks()->where('kind', 'qa')->get(),
            'clarifications' => $case->requests()->where('type', 'clarification')->latest()->get(),
            'report' => $draft ? $draft->only('version', 'status') + ['sections' => collect($draft->sections ?? [])->pluck('title')] : null,
            'partnerUsed' => $case->partner_review,
        ]);
    }

    public function reportReady(Request $request, CaseFile $case): Response|RedirectResponse
    {
        $this->authorise($request, $case);
        $report = Workflow::latestFinal($case);
        if (! $report) {
            return redirect()->route('due-diligence.cases.page', [$case, 'report-status'])->with('error', 'The report has not been approved for release yet.');
        }

        return $this->page($case, 'ReportReady', ['report' => $this->reportMeta($report), 'commercial' => CasePresenter::commercial($case)]);
    }

    public function limitations(Request $request, CaseFile $case): Response|RedirectResponse
    {
        $this->authorise($request, $case);
        $report = Workflow::latestFinal($case);
        if (! $report) {
            return redirect()->route('due-diligence.cases.page', [$case, 'report-status'])->with('error', 'The report has not been approved for release yet.');
        }

        return $this->page($case, 'Limitations', [
            'report' => $this->reportMeta($report),
            'limitations' => Content::reportLimitations($report->approved_at?->format('d M Y') ?? now()->format('d M Y')),
            'acknowledgedAt' => $case->limitations_acknowledged_at?->toIso8601String(),
            'commercial' => CasePresenter::commercial($case),
        ]);
    }

    public function report(Request $request, CaseFile $case): Response|RedirectResponse
    {
        $this->authorise($request, $case);
        $report = Workflow::latestFinal($case);
        if (! $report) {
            return redirect()->route('due-diligence.cases.page', [$case, 'report-status'])->with('error', 'The report has not been approved for release yet.');
        }
        if (! $case->limitations_acknowledged_at) {
            return redirect()->route('due-diligence.cases.page', [$case, 'limitations'])->with('error', 'Acknowledge the report limitations to access your report (G8).');
        }

        $this->logAccess($request, $report, 'Viewed online');

        return $this->page($case, 'Report', [
            'report' => $this->reportMeta($report) + ['sections' => $report->sections, 'access' => array_slice(array_reverse($report->fresh()->access_log ?? []), 0, 6)],
            'watermark' => $request->user()->name.' | '.$case->reference.' | '.now()->format('d M Y'),
        ]);
    }

    public function download(Request $request, CaseFile $case): StreamedResponse|RedirectResponse
    {
        $this->authorise($request, $case);
        $report = Workflow::latestFinal($case);
        abort_unless($report && $case->limitations_acknowledged_at, 403, 'Acknowledge the report limitations first.');
        $this->logAccess($request, $report, 'Downloaded report');

        $watermark = e($request->user()->name.' | '.$case->reference.' | '.now()->format('d M Y H:i'));
        $html = '<!doctype html><html><head><meta charset="utf-8"><title>'.e($report->title).'</title><style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;color:#111}h1{color:#8a6a1c}h2{border-bottom:1px solid #ccc;padding-bottom:4px}.wm{position:fixed;bottom:12px;right:12px;color:#999;font-size:11px}</style></head><body>';
        $html .= '<p><strong>The Business Clinic.Africa</strong> — Confidential</p><h1>'.e($report->title).'</h1><p>'.e($case->case_name).'<br>'.e($case->reference).' · '.e($report->version).' · SHA-256 '.e($report->hash).'</p>';
        foreach ($report->sections ?? [] as $section) {
            $html .= '<h2>'.e($section['title']).'</h2><ul>';
            foreach ($section['body'] as $line) {
                $html .= '<li>'.e($line).'</li>';
            }
            $html .= '</ul>';
        }
        $html .= '<div class="wm">Watermark: '.$watermark.'</div></body></html>';

        return response()->streamDownload(fn () => print ($html), "{$case->reference}-{$report->version}.html", ['Content-Type' => 'text/html']);
    }

    public function dispute(Request $request, CaseFile $case): Response|RedirectResponse
    {
        $this->authorise($request, $case);
        $report = Workflow::latestFinal($case);
        if (! $report || ! $case->limitations_acknowledged_at) {
            return redirect()->route('due-diligence.cases.page', [$case, 'report-ready'])->with('error', 'Disputes can be opened once the report has been delivered.');
        }

        return $this->page($case, 'Dispute', [
            'report' => $this->reportMeta($report),
            'sections' => collect($report->sections)->pluck('title'),
            'findings' => $case->findings()->get(['reference', 'report_ref', 'flag_type', 'severity'])->map(fn ($f) => ['value' => ($f->report_ref ?? $f->reference), 'label' => ucfirst($f->severity).' risk indicator: '.$f->flag_type]),
            'disputes' => $case->disputes()->latest()->get(['reference', 'status', 'outcome', 'created_at']),
            'commercial' => CasePresenter::commercial($case),
        ]);
    }

    public function disputeOutcome(Request $request, CaseFile $case, string $dispute): Response
    {
        $this->authorise($request, $case);
        $d = Dispute::where('case_id', $case->id)->where('reference', $dispute)->firstOrFail();

        return $this->page($case, 'DisputeOutcome', [
            'dispute' => $d->toArray() + ['createdAt' => $d->created_at->toIso8601String(), 'decidedAt' => $d->decided_at?->toIso8601String(), 'documents' => $d->documents()->get(['id', 'original_name'])],
            'timeline' => CasePresenter::events($case, 10, ['dd.dispute']),
            'report' => ($r = Workflow::latestFinal($case)) ? $this->reportMeta($r) : null,
        ]);
    }

    public function monitoringOffer(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);

        return $this->page($case, 'MonitoringOffer', [
            'plans' => array_map(fn ($p) => Catalogue::monitoringPlan($p['code']), Catalogue::monitoringPlans()),
            'report' => ($r = Workflow::latestFinal($case)) ? $this->reportMeta($r) : null,
            'subscription' => $case->subscriptions()->latest('id')->first()?->only('reference', 'plan_name', 'status'),
        ]);
    }

    public function monitoring(Request $request, CaseFile $case): Response|RedirectResponse
    {
        $this->authorise($request, $case);
        $sub = $case->subscriptions()->where('status', 'active')->latest('id')->first() ?? $case->subscriptions()->latest('id')->first();
        if (! $sub) {
            return redirect()->route('due-diligence.cases.page', [$case, 'monitoring-offer'])->with('error', 'Monitoring is not active for this case yet.');
        }

        $alerts = $sub->alerts()->latest('detected_at')->get();

        return $this->page($case, 'Monitoring', [
            'subscription' => $sub->only('reference', 'plan_code', 'plan_name', 'billing_cycle', 'recurring_zar', 'status', 'subjects', 'alert_allowance', 'included_reviews', 'included_rechecks') + [
                'startedAt' => $sub->started_at?->toIso8601String(), 'nextRenewalAt' => $sub->next_renewal_at?->toIso8601String(),
            ],
            'alerts' => $alerts->map(fn ($a) => $a->only('reference', 'subject', 'alert_type', 'source', 'risk_level', 'status', 'reviewer', 'disposition') + ['detectedAt' => $a->detected_at?->toIso8601String()]),
            'report' => ($r = Workflow::latestFinal($case)) ? $this->reportMeta($r) : null,
        ]);
    }

    public function vdr(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);
        $sub = $case->subscriptions()->latest('id')->first();

        return $this->page($case, 'Vdr', [
            'documents' => $case->documents()->latest()->limit(6)->get(['id', 'original_name', 'category', 'uploaded_by', 'created_at']),
            'activity' => [
                'uploaded' => $case->documents()->count(),
                'viewed' => collect($case->reports()->get()->pluck('access_log')->flatten(1))->count(),
                'events' => $case->events()->count(),
            ],
            'events' => CasePresenter::events($case, 3),
            'lifecycle' => CasePresenter::milestones($case),
            'subscription' => $sub?->only('reference', 'plan_name', 'plan_code', 'billing_cycle', 'status', 'alert_allowance'),
            'alertCounts' => $sub ? collect(['critical', 'high', 'medium', 'low'])->mapWithKeys(fn ($l) => [$l => $sub->alerts()->where('risk_level', $l)->count()]) : null,
            'report' => ($r = Workflow::latestFinal($case)) ? $this->reportMeta($r) : null,
        ]);
    }

    public function close(Request $request, CaseFile $case): Response
    {
        $this->authorise($request, $case);
        $sub = $case->subscriptions()->latest('id')->first();

        return $this->page($case, 'Close', [
            'report' => ($r = Workflow::latestFinal($case)) ? $this->reportMeta($r) : null,
            'commercial' => CasePresenter::commercial($case),
            'subscription' => $sub ? $sub->only('plan_name', 'status', 'subjects', 'included_reviews') + ['alertsReviewed' => $sub->alerts()->where('status', 'reviewed')->count(), 'endsAt' => $sub->next_renewal_at?->toIso8601String()] : null,
            'closure' => ['action' => $case->closure_action, 'status' => $case->closure_status, 'approvals' => $case->closure_approvals, 'legalHold' => $case->legal_hold, 'closedAt' => $case->closed_at?->toIso8601String()],
            'outputs' => [
                'report' => (bool) $r, 'monitoring' => (bool) $sub, 'evidence' => $case->documents()->count(), 'certificate' => (bool) $r,
                'outstanding' => $case->requests()->where('status', 'open')->count(),
            ],
        ]);
    }

    public function document(Request $request, CaseFile $case, Document $document): StreamedResponse
    {
        $this->authorise($request, $case);
        abort_unless($document->case_id === $case->id, 404);

        return Storage::disk(Workflow::DISK)->download($document->path, $document->original_name);
    }

    /* ------------------------------------------------------------------ */

    private function page(CaseFile $case, string $component, array $props): Response
    {
        return Inertia::render("DueDiligence/Cases/{$component}", $props + [
            'case' => CasePresenter::header($case),
            'journey' => Content::journey(),
            'coordinator' => ['name' => $case->coordinator_name ?? 'Naledi Mkhize', 'role' => 'Senior Due Diligence Specialist', 'email' => $case->coordinator_email ?? 'ddteam@thebusinessclinic.africa', 'phone' => '+27 10 500 8590'],
        ]);
    }

    private function snapshot(CaseFile $case): array
    {
        return [
            'caseName' => $case->case_name, 'reference' => $case->reference, 'package' => $case->package_name, 'client' => $case->client_name,
            'subjectType' => ucfirst($case->subject_type), 'jurisdiction' => $case->jurisdiction, 'purpose' => $case->purpose,
            'directors' => count($case->subject['directors'] ?? []), 'owners' => (int) ($case->quote?->inputs['ubo_count'] ?? 0),
            'lawfulBasis' => 'Consent + Legitimate Interests', 'residency' => 'South Africa', 'portalUsers' => 1 + $case->consentRequests()->count(),
            'engagement' => $case->purpose ?? 'Onboarding',
        ];
    }

    private function quality(CaseFile $case): array
    {
        $s = $case->subject ?? [];
        $stats = Workflow::evidenceStats($case);
        $directors = count($s['directors'] ?? []);
        $expectedDirectors = max(1, (int) ($case->quote?->inputs['related_parties'] ?? 3));
        $rows = [
            ['label' => 'Registered Name', 'ok' => filled($s['registered_name'] ?? null), 'value' => filled($s['registered_name'] ?? null) ? 'Verified' : 'Required'],
            ['label' => $case->subject_type === 'individual' ? 'ID / Passport Number' : 'Registration Number', 'ok' => filled($s['registration_number'] ?? $s['id_number'] ?? null), 'value' => filled($s['registration_number'] ?? $s['id_number'] ?? null) ? 'Verified' : 'Required'],
            ['label' => 'Registered Country', 'ok' => filled($s['country'] ?? null), 'value' => filled($s['country'] ?? null) ? 'Verified' : 'Required'],
            ['label' => 'Industry Sector', 'ok' => filled($s['industry'] ?? null), 'value' => filled($s['industry'] ?? null) ? 'Verified' : 'Required'],
            ['label' => 'Directors / UBOs', 'ok' => $directors >= min(3, $expectedDirectors), 'warn' => $directors > 0, 'value' => "{$directors} of ".min(3, $expectedDirectors).' added'],
            ['label' => 'Authority & Purpose', 'ok' => filled($s['authority_confirmed'] ?? null), 'warn' => true, 'value' => filled($s['authority_confirmed'] ?? null) ? 'Confirmed' : 'Purpose to be confirmed'],
            ['label' => 'Addresses', 'ok' => filled($s['head_office'] ?? null), 'value' => filled($s['head_office'] ?? null) ? 'Captured' : 'Head Office proof required'],
            ['label' => 'Documents', 'ok' => $stats['pendingItems'] === 0, 'warn' => $stats['documents'] > 0, 'value' => $stats['completeItems'].' of '.$stats['requiredItems'].' complete'],
        ];
        $ok = count(array_filter($rows, fn ($r) => $r['ok']));

        return ['rows' => $rows, 'percent' => (int) round(100 * $ok / count($rows))];
    }

    private function alerts(CaseFile $case, array $stats): array
    {
        $alerts = [];
        if ($stats['pendingItems'] > 0) {
            $alerts[] = ['text' => $stats['pendingItems'].' evidence item(s) still outstanding', 'state' => 'Action required'];
        }
        if ($case->sla_due_at) {
            $alerts[] = ['text' => 'SLA milestone in '.max(0, (int) now()->diffInDays($case->sla_due_at)).' days', 'state' => $case->sla_due_at->format('d M Y')];
        }
        if (Workflow::missingSubjectFields($case)) {
            $alerts[] = ['text' => 'Complete outstanding subject details', 'state' => 'Action required'];
        }
        if (! Workflow::consentsComplete($case)) {
            $alerts[] = ['text' => 'Mandatory consents outstanding', 'state' => 'Action required'];
        }

        return $alerts;
    }

    private function documents(CaseFile $case, ?string $category = null): array
    {
        return $case->documents()->when($category, fn ($q) => $q->where('category', $category))->latest()->get()
            ->map(fn ($d) => $d->only('id', 'original_name', 'category', 'size', 'status', 'uploaded_by', 'evidence_item_id') + ['createdAt' => $d->created_at->toIso8601String()])->all();
    }

    private function reportMeta($report): array
    {
        return [
            'title' => $report->title, 'version' => $report->version, 'status' => $report->status, 'hash' => $report->hash,
            'approvedBy' => $report->approved_by, 'approvedAt' => $report->approved_at?->toIso8601String(),
            'deliverables' => $report->deliverables ?? Workflow::deliverables(),
        ];
    }

    private function logAccess(Request $request, $report, string $action): void
    {
        $log = $report->access_log ?? [];
        $log[] = ['at' => now()->toIso8601String(), 'action' => $action, 'by' => $request->user()->name, 'device' => mb_substr((string) $request->userAgent(), 0, 40) ?: 'Browser', 'ip' => preg_replace('/\.\d+\.\d+$/', '.**.**', (string) $request->ip())];
        $report->update(['access_log' => array_slice($log, -50)]);
    }

    public static function authorise(Request $request, CaseFile $case): void
    {
        $user = $request->user();
        abort_unless($user && ($case->user_id === $user->id || $user->isAdmin()), 403);
    }
}
