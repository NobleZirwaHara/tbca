<?php

namespace App\Http\Controllers\DueDiligence;

use App\Http\Controllers\Controller;
use App\Models\DueDiligence\Batch;
use App\Models\DueDiligence\CaseEvent;
use App\Models\DueDiligence\CaseFile;
use App\Models\DueDiligence\Check;
use App\Models\DueDiligence\Consent;
use App\Models\DueDiligence\Dispute;
use App\Models\DueDiligence\EnterpriseRequest;
use App\Models\DueDiligence\EvidenceItem;
use App\Models\DueDiligence\Finding;
use App\Models\DueDiligence\InfoRequest;
use App\Models\DueDiligence\MonitoringAlert;
use App\Models\DueDiligence\MonitoringSubscription;
use App\Models\DueDiligence\Quote;
use App\Models\DueDiligence\ReviewTask;
use App\Support\DueDiligence\CasePresenter;
use App\Support\DueDiligence\CaseStateMachine;
use App\Support\DueDiligence\Catalogue;
use App\Support\DueDiligence\Refs;
use App\Support\DueDiligence\Workflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Due Diligence operations console (/admin/due-diligence). Staff progress
 * cases through the status machine; every transition is guard-checked.
 */
class AdminController extends Controller
{
    public function dashboard(): Response
    {
        Workflow::syncPaidOrders();
        $cases = CaseFile::all();

        return Inertia::render('DueDiligence/Admin/Dashboard', [
            'kpis' => [
                'active' => $cases->whereNotIn('status', ['closed'])->count(),
                'review' => $cases->whereIn('status', ['review_required', 'partner_review'])->count(),
                'qa' => $cases->whereIn('status', ['report_draft'])->count(),
                'disputed' => $cases->where('status', 'disputed')->count(),
                'monitoring' => MonitoringSubscription::where('status', 'active')->count(),
                'slaBreached' => $cases->whereNotIn('status', ['delivered', 'monitoring', 'closed'])->filter(fn ($c) => $c->sla_due_at && $c->sla_due_at->isPast())->count(),
                'quotes' => Quote::whereNotIn('status', ['converted', 'expired', 'cancelled'])->count(),
                'revenue' => (int) $cases->sum('total_paid_zar'),
            ],
            'byStatus' => collect(CaseStateMachine::STATES)->map(fn ($s, $key) => ['status' => $key, 'label' => $s[0], 'count' => $cases->where('status', $key)->count()])->values(),
            'queue' => CaseFile::whereIn('status', ['ready_for_checks', 'checks_running', 'review_required', 'partner_review', 'report_draft', 'disputed'])
                ->orderBy('sla_due_at')->limit(10)->get()->map(fn ($c) => $this->row($c)),
            'events' => CaseEvent::with('caseFile:id,reference')->latest('id')->limit(10)->get()->map(fn ($e) => ['code' => $e->code, 'case' => $e->caseFile?->reference, 'description' => $e->description, 'actor' => $e->actor, 'at' => $e->created_at->toIso8601String()]),
            'quotes' => Quote::with('user:id,name,company')->latest()->limit(8)->get()->map(fn ($q) => ['reference' => $q->reference, 'client' => $q->user?->company ?: $q->user?->name, 'package' => Catalogue::sku($q->sku_code)['name'] ?? $q->sku_code, 'status' => $q->status, 'total' => $q->manifest['total'] ?? null, 'updatedAt' => $q->updated_at->toIso8601String()]),
            'closures' => CaseFile::where('closure_status', 'pending_approval')->get()->map(fn ($c) => $this->row($c) + ['approvals' => $c->closure_approvals]),
        ]);
    }

    public function cases(Request $request): Response
    {
        $q = CaseFile::query()
            ->when($request->query('status'), fn ($w, $s) => $w->where('status', $s))
            ->when($request->query('search'), fn ($w, $s) => $w->where(fn ($x) => $x->where('reference', 'like', "%{$s}%")->orWhere('case_name', 'like', "%{$s}%")))
            ->latest();

        return Inertia::render('DueDiligence/Admin/Cases', [
            'cases' => $q->get()->map(fn ($c) => $this->row($c)),
            'filters' => ['status' => $request->query('status', ''), 'search' => $request->query('search', '')],
            'statuses' => collect(CaseStateMachine::STATES)->map(fn ($s, $k) => ['value' => $k, 'label' => $s[0]])->values(),
        ]);
    }

    public function show(CaseFile $case): Response
    {
        return Inertia::render('DueDiligence/Admin/Case', [
            'case' => CasePresenter::header($case) + [
                'reviewer' => $case->reviewer_name, 'reviewerRole' => $case->reviewer_role, 'reviewDecision' => $case->review_decision,
                'riskRating' => $case->risk_rating, 'reviewMandatory' => $case->review_mandatory, 'partner' => $case->partner,
                'closure' => ['action' => $case->closure_action, 'status' => $case->closure_status, 'approvals' => $case->closure_approvals, 'legalHold' => $case->legal_hold],
                'client' => $case->user?->only('name', 'email', 'company'), 'subject' => $case->subject,
            ],
            'allowed' => collect(CaseStateMachine::allowed($case, 'staff'))->map(fn ($to) => ['value' => $to, 'label' => CaseStateMachine::label($to), 'blocker' => CaseStateMachine::guard($case, $to)])->values(),
            'consents' => $case->consents()->get(),
            'evidence' => $case->evidence()->with('documents:id,evidence_item_id,original_name,status')->get(),
            'documents' => $case->documents()->latest()->get(['id', 'original_name', 'category', 'status', 'uploaded_by', 'evidence_item_id', 'created_at']),
            'checks' => $case->checks()->get(),
            'findings' => $case->findings()->latest()->get(),
            'requests' => $case->requests()->latest()->get(),
            'tasks' => $case->tasks()->get(),
            'reports' => $case->reports()->latest('id')->get(['id', 'version', 'status', 'approved_by', 'approved_at', 'hash']),
            'disputes' => $case->disputes()->latest()->get(),
            'subscriptions' => $case->subscriptions()->with('alerts')->get(),
            'events' => CasePresenter::events($case, 40),
            'commercial' => CasePresenter::commercial($case),
        ]);
    }

    public function transition(Request $request, CaseFile $case): RedirectResponse
    {
        $data = $request->validate(['to' => ['required', Rule::in(array_keys(CaseStateMachine::STATES))], 'note' => ['nullable', 'string', 'max:255']]);
        CaseStateMachine::transition($case, $data['to'], $request->user()->name, 'staff', ($data['note'] ?? null) ?: null);

        return back()->with('success', 'Case moved to '.CaseStateMachine::label($data['to']).'.');
    }

    public function review(Request $request, CaseFile $case): RedirectResponse
    {
        $data = $request->validate([
            'reviewer_name' => ['required', 'string', 'max:120'],
            'reviewer_role' => ['required', 'string', 'max:120'],
            'review_decision' => ['nullable', 'string', 'max:1000'],
            'risk_rating' => ['nullable', Rule::in(['low', 'medium', 'high'])],
        ]);
        $case->update($data + ['review_started_at' => $case->review_started_at ?? now(), 'review_due_at' => $case->review_due_at ?? now()->addWeekdays(2)]);
        CaseStateMachine::record($case, 'dd.reviewer_updated', $request->user()->name, 'staff', 'Reviewer assignment / decision updated'.($data['risk_rating'] ?? null ? ' (risk '.$data['risk_rating'].')' : ''));

        return back()->with('success', 'Review details saved.');
    }

    public function partner(Request $request, CaseFile $case): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'], 'type' => ['required', 'string', 'max:120'], 'scope' => ['required', 'string', 'max:500'],
            'lead' => ['required', 'string', 'max:120'], 'contact' => ['required', 'email'],
        ]);
        $case->update(['partner' => $data + ['location' => 'Johannesburg, South Africa']]);
        CaseStateMachine::transition($case, 'partner_review', $request->user()->name, 'staff', "Referred to qualified partner {$data['name']} (RL4)");

        return back()->with('success', 'Referred to qualified partner.');
    }

    public function check(Request $request, CaseFile $case, Check $check): RedirectResponse
    {
        abort_unless($check->case_id === $case->id, 404);
        $data = $request->validate([
            'status' => ['required', Rule::in(['not_started', 'pending', 'in_progress', 'on_hold', 'complete'])],
            'done' => ['required', 'integer', 'min:0', 'max:'.$check->total],
            'hold_reason' => ['required_if:status,on_hold', 'nullable', 'string', 'max:190'],
            'external_used_zar' => ['nullable', 'integer', 'min:0'],
        ]);
        if (! in_array($case->status, ['checks_running', 'review_required', 'partner_review'], true) && $data['status'] !== 'not_started') {
            return back()->with('error', 'Checks can only run once the case is in Checks Running (vendor run plan authorised).');
        }
        if (($data['external_used_zar'] ?? 0) > $check->external_approved_zar + $case->quote?->external_tolerance_zar) {
            return back()->with('error', 'External cost exceeds the approved tolerance: client re-approval (G4) is required.');
        }
        if ($data['status'] === 'complete') {
            $data['done'] = $check->total;
        }
        $check->update($data);
        CaseStateMachine::record($case, 'dd.check_'.$data['status'], 'TBCA Operations', 'staff', "{$check->category}: ".str_replace('_', ' ', $data['status']).($data['status'] === 'on_hold' ? " ({$data['hold_reason']})" : ''));

        return back()->with('success', 'Check updated.');
    }

    public function finding(Request $request, CaseFile $case): RedirectResponse
    {
        $data = $request->validate([
            'check_category' => ['required', 'string', 'max:120'], 'flag_type' => ['required', 'string', 'max:120'], 'source' => ['required', 'string', 'max:120'],
            'severity' => ['required', Rule::in(['low', 'medium', 'high', 'critical'])], 'summary' => ['required', 'string', 'max:1000'],
            'report_ref' => ['nullable', 'string', 'max:20'],
        ]);
        $finding = $case->findings()->create($data + [
            'reference' => sprintf('FLG-%s-%04d', now()->format('Ymd'), $case->findings()->count() + 1),
            'report_ref' => ($data['report_ref'] ?? null) ?: 'RR-'.str_pad((string) ($case->findings()->count() + 1), 2, '0', STR_PAD_LEFT),
            'status' => 'open', 'detected_at' => now(),
        ]);
        CaseStateMachine::record($case, 'dd.risk_flag_notice', 'TBCA Screening', 'system', "Potential {$finding->flag_type} under human review ({$finding->reference})");
        if ($case->status === 'checks_running') {
            CaseStateMachine::transition($case, 'review_required', 'System', 'system', 'Risk flag raised: release locked pending human review (G7)');
        }

        return back()->with('success', 'Risk flag recorded. The client sees a review notice only, never a conclusion.');
    }

    public function disposition(Request $request, CaseFile $case, Finding $finding): RedirectResponse
    {
        abort_unless($finding->case_id === $case->id, 404);
        $data = $request->validate(['status' => ['required', Rule::in(['reviewing', 'cleared', 'confirmed'])], 'disposition' => ['required', 'string', 'max:1000']]);
        $finding->update($data);
        CaseStateMachine::record($case, 'dd.risk_flag_'.$data['status'], $request->user()->name, 'staff', "Flag {$finding->reference} {$data['status']}");

        return back()->with('success', 'Disposition recorded.');
    }

    public function request(Request $request, CaseFile $case): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['information', 'partner', 'clarification'])], 'title' => ['required', 'string', 'max:190'],
            'detail' => ['nullable', 'string', 'max:1000'], 'reason' => ['nullable', 'string', 'max:190'], 'requested_by' => ['required', 'string', 'max:120'],
            'due_days' => ['required', 'integer', 'min:1', 'max:30'],
        ]);
        $prefix = ['information' => 'IR', 'partner' => 'PR', 'clarification' => 'CL'][$data['type']];
        $case->requests()->create([
            'reference' => Refs::child($prefix, $case->requests()->where('type', $data['type'])->count()),
            'type' => $data['type'], 'title' => $data['title'], 'detail' => $data['detail'] ?? null, 'reason' => $data['reason'] ?? null,
            'requested_by' => $data['requested_by'], 'due_at' => now()->addWeekdays($data['due_days']), 'status' => 'open',
        ]);
        CaseStateMachine::record($case, 'dd.request_raised', $data['requested_by'], 'staff', "{$prefix} request raised: {$data['title']}");

        return back()->with('success', 'Request sent to the client portal.');
    }

    public function resolveRequest(Request $request, CaseFile $case, InfoRequest $infoRequest): RedirectResponse
    {
        abort_unless($infoRequest->case_id === $case->id, 404);
        $data = $request->validate(['decision' => ['required', Rule::in(['approved', 'declined', 'closed'])], 'note' => ['nullable', 'string', 'max:500']]);
        $infoRequest->update(['status' => $data['decision'], 'response' => trim(($infoRequest->response ?? '')."\nTBCA: ".($data['note'] ?? $data['decision']))]);

        if ($infoRequest->type === 'alternative_evidence' && $item = EvidenceItem::where('case_id', $case->id)->find((int) $infoRequest->reason)) {
            $item->update(['status' => $data['decision'] === 'approved' ? 'waived' : 'pending']);
        }
        CaseStateMachine::record($case, 'dd.request_'.$data['decision'], $request->user()->name, 'staff', "{$infoRequest->reference} {$data['decision']}");

        return back()->with('success', 'Request resolved.');
    }

    public function evidence(Request $request, CaseFile $case, EvidenceItem $item): RedirectResponse
    {
        abort_unless($item->case_id === $case->id, 404);
        $data = $request->validate(['status' => ['required', Rule::in(['approved', 'rejected', 'waived'])], 'note' => ['nullable', 'string', 'max:500']]);
        $item->update($data);
        if ($data['status'] === 'approved') {
            $item->documents()->update(['status' => 'verified']);
        }
        CaseStateMachine::record($case, 'dd.evidence_'.$data['status'], $request->user()->name, 'staff', "{$item->label} {$data['status']}");

        return back()->with('success', 'Evidence item updated.');
    }

    public function consent(Request $request, CaseFile $case, Consent $consent): RedirectResponse
    {
        abort_unless($consent->case_id === $case->id, 404);
        $data = $request->validate(['status' => ['required', Rule::in(['received', 'pending', 'expired'])]]);
        $consent->update(['status' => $data['status'], 'received_at' => $data['status'] === 'received' ? now() : $consent->received_at, 'valid_until' => $data['status'] === 'received' ? now()->addYear() : $consent->valid_until, 'method' => $data['status'] === 'received' ? 'Signed document verified by TBCA' : $consent->method, 'given_by' => $data['status'] === 'received' ? ($consent->given_by ?? 'Verified document') : $consent->given_by]);
        $case->documents()->where('category', 'consent')->where('status', 'pending_review')->update(['status' => $data['status'] === 'received' ? 'verified' : 'pending_review']);
        CaseStateMachine::record($case, 'dd.consent_'.$data['status'], $request->user()->name, 'staff', "{$consent->label} marked {$data['status']}");

        return back()->with('success', 'Consent updated.');
    }

    public function task(Request $request, CaseFile $case, ReviewTask $task): RedirectResponse
    {
        abort_unless($task->case_id === $case->id, 404);
        $data = $request->validate(['progress' => ['required', 'integer', 'min:0', 'max:100']]);
        $task->update(['progress' => $data['progress'], 'status' => $data['progress'] >= 100 ? 'completed' : ($data['progress'] > 0 ? 'in_progress' : 'pending')]);
        CaseStateMachine::record($case, 'dd.'.$task->kind.'_task', $request->user()->name, 'staff', "{$task->title}: {$data['progress']}%");

        return back()->with('success', 'Task updated.');
    }

    public function dispute(Request $request, CaseFile $case, Dispute $dispute): RedirectResponse
    {
        abort_unless($dispute->case_id === $case->id, 404);
        $data = $request->validate([
            'outcome' => ['required', Rule::in(['corrected', 'upheld', 'clarified', 'recheck_quoted'])], 'reason' => ['required', 'string', 'max:1000'],
            'reviewer' => ['required', 'string', 'max:120'], 'approved_by' => ['required', 'string', 'max:120'], 'refund_zar' => ['nullable', 'integer', 'min:0', 'max:'.$case->total_paid_zar],
        ]);
        if ($dispute->status === 'received') {
            $dispute->update(['status' => 'under_review']);
            CaseStateMachine::record($case, 'dd.dispute_review', $data['reviewer'], 'staff', 'Independent dispute review started');
        }

        $actions = match ($data['outcome']) {
            'corrected' => ['Incorrect record removed', 'Correct entity data applied', 'Risk assessment recalculated', 'Report updated and re-issued'],
            'clarified' => ['Clarification note added to the report', 'Report re-issued with clarification'],
            'recheck_quoted' => ['New evidence requires expanded scope', 'Recheck quote issued for client approval (G9)'],
            default => ['Original finding confirmed against source evidence', 'No change to the report'],
        };

        $newVersion = null;
        if (in_array($data['outcome'], ['corrected', 'clarified'], true) && $final = Workflow::latestFinal($case)) {
            $sections = $final->sections;
            $sections[] = ['key' => 'correction', 'title' => 'Correction Notice', 'body' => ["{$dispute->reference}: {$data['reason']}", 'Outcome: '.ucfirst($data['outcome']).'. TBCA error corrections are made at no charge.']];
            if ($dispute->finding_ref) {
                $case->findings()->where('report_ref', $dispute->finding_ref)->update(['status' => 'cleared', 'disposition' => 'Corrected after dispute '.$dispute->reference]);
            }
            $count = $case->reports()->where('status', '!=', 'draft')->count();
            $final->update(['status' => 'superseded']);
            $newVersion = 'Final v1.'.$count.($data['outcome'] === 'corrected' ? ' (Corrected)' : ' (Clarified)');
            $case->reports()->create([
                'version' => $newVersion, 'status' => 'final', 'title' => $final->title, 'sections' => $sections, 'deliverables' => $final->deliverables,
                'hash' => hash('sha256', json_encode($sections).$case->reference.$newVersion), 'approved_by' => $data['approved_by'], 'approved_at' => now(),
            ]);
        }

        $refund = (int) ($data['refund_zar'] ?? 0);
        $dispute->update(['status' => 'decided', 'outcome' => $data['outcome'], 'reason' => $data['reason'], 'reviewer' => $data['reviewer'], 'approved_by' => $data['approved_by'], 'refund_zar' => $refund, 'actions' => $actions, 'new_version' => $newVersion, 'decided_at' => now()]);
        if ($refund > 0) {
            $case->update(['credits_zar' => $case->credits_zar + $refund]);
        }
        CaseStateMachine::record($case, 'dd.dispute_decided', $data['approved_by'], 'staff', "Dispute {$dispute->reference}: ".str_replace('_', ' ', $data['outcome']).($refund ? ", refund R{$refund}" : ''));
        if ($case->status === 'disputed') {
            $back = $case->subscriptions()->where('status', 'active')->exists() ? 'delivered' : 'delivered';
            CaseStateMachine::transition($case, $back, $request->user()->name, 'staff', 'Dispute outcome delivered: report access restored');
            if ($case->fresh()->subscriptions()->where('status', 'active')->exists()) {
                CaseStateMachine::transition($case->fresh(), 'monitoring', 'System', 'system', 'Monitoring resumed');
            }
        }

        return back()->with('success', 'Dispute decided and the client notified in the portal.');
    }

    public function approveClosure(Request $request, CaseFile $case): RedirectResponse
    {
        $data = $request->validate(['role' => ['required', Rule::in(['privacy_lead', 'finance_controller'])]]);
        abort_unless($case->closure_status === 'pending_approval', 409);
        if ($case->legal_hold) {
            return back()->with('error', 'Legal hold is active: deletion cannot be approved.');
        }

        $approvals = array_merge($case->closure_approvals ?? [], [$data['role'] => true]);
        $case->update(['closure_approvals' => $approvals]);
        CaseStateMachine::record($case, 'dd.deletion_approval', $request->user()->name, 'staff', str_replace('_', ' ', ucfirst($data['role'])).' approved deletion');

        if (($approvals['privacy_lead'] ?? false) && ($approvals['finance_controller'] ?? false)) {
            foreach ($case->documents()->get() as $doc) {
                Storage::disk(Workflow::DISK)->delete($doc->path);
                $doc->delete();
            }
            $case->evidence()->update(['status' => 'pending']);
            $case->subscriptions()->whereIn('status', ['active', 'awaiting_payment'])->update(['status' => 'cancelled']);
            $case->update(['closure_status' => 'completed', 'subject' => ['registered_name' => $case->subject_name, 'deleted' => true]]);
            CaseStateMachine::record($case, 'dd.case_deleted', 'System', 'system', 'Eligible data deleted per retention schedule; deletion certificate issued');
            if ($case->status !== 'closed') {
                CaseStateMachine::transition($case->fresh(), 'closed', $request->user()->name, 'staff', 'Case closed after approved deletion');
            }
        }

        return back()->with('success', 'Approval recorded.');
    }

    public function alert(Request $request, MonitoringSubscription $subscription): RedirectResponse
    {
        $data = $request->validate([
            'alert_type' => ['required', 'string', 'max:120'], 'source' => ['required', 'string', 'max:120'],
            'risk_level' => ['required', Rule::in(['critical', 'high', 'medium', 'low'])],
        ]);
        $alert = $subscription->alerts()->create($data + [
            'reference' => Refs::next('AL', 'dd_monitoring_alerts', 'reference', 4),
            'subject' => $subscription->caseFile?->subject_name ?? 'Monitored subject', 'status' => 'pending_review', 'detected_at' => now(),
        ]);
        if ($subscription->caseFile) {
            CaseStateMachine::record($subscription->caseFile, 'dd.monitoring_alert', 'Monitoring Engine', 'system', "Alert {$alert->reference}: {$alert->alert_type} (awaiting human review)");
        }

        return back()->with('success', 'Alert raised for human review.');
    }

    public function reviewAlert(Request $request, MonitoringAlert $alert): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['under_review', 'reviewed', 'escalated'])], 'disposition' => ['nullable', 'string', 'max:500']]);
        $alert->update($data + ['reviewer' => $request->user()->name, 'reviewed_at' => $data['status'] === 'reviewed' ? now() : null]);

        return back()->with('success', 'Alert updated.');
    }

    public function enterprise(): Response
    {
        return Inertia::render('DueDiligence/Admin/Enterprise', [
            'requests' => EnterpriseRequest::with('user:id,name,company')->latest()->get()->map(fn ($r) => $r->only('id', 'reference', 'status', 'data', 'fee_view', 'staff_note') + ['client' => $r->user?->company ?: $r->user?->name, 'submittedAt' => $r->submitted_at?->toIso8601String()]),
            'batches' => Batch::with('user:id,name,company')->latest()->limit(20)->get()->map(fn ($b) => $b->only('id', 'reference', 'file_name', 'status', 'progress', 'rows', 'valid_rows', 'duplicates') + ['client' => $b->user?->company ?: $b->user?->name]),
            'alerts' => MonitoringAlert::with('subscription.caseFile:id,reference')->latest('detected_at')->limit(30)->get()->map(fn ($a) => $a->only('id', 'reference', 'subject', 'alert_type', 'source', 'risk_level', 'status', 'reviewer') + ['case' => $a->subscription?->caseFile?->reference, 'detectedAt' => $a->detected_at?->toIso8601String()]),
            'subscriptions' => MonitoringSubscription::where('status', 'active')->get(['id', 'reference', 'plan_name']),
        ]);
    }

    public function enterpriseStatus(Request $request, EnterpriseRequest $enterpriseRequest): RedirectResponse
    {
        $flow = ['submitted' => ['scoping', 'declined'], 'scoping' => ['quoted', 'declined'], 'quoted' => ['accepted', 'declined']];
        $data = $request->validate(['status' => ['required', Rule::in($flow[$enterpriseRequest->status] ?? [])], 'staff_note' => ['nullable', 'string', 'max:1000']]);
        $enterpriseRequest->update($data);

        return back()->with('success', "Request {$enterpriseRequest->reference} moved to {$data['status']}.");
    }

    public function advanceBatch(Batch $batch): RedirectResponse
    {
        abort_if(in_array($batch->status, ['completed', 'failed'], true), 409);
        $progress = min(100, $batch->progress + 35);
        $batch->update(['progress' => $progress, 'status' => $progress >= 100 ? 'completed' : 'processing']);

        return back()->with('success', "Batch {$batch->reference} at {$progress}%.");
    }

    private function row(CaseFile $c): array
    {
        return [
            'reference' => $c->reference, 'name' => $c->case_name, 'package' => $c->package_name, 'status' => $c->status,
            'statusLabel' => CaseStateMachine::label($c->status), 'slaDueAt' => $c->sla_due_at?->toIso8601String(),
            'overdue' => $c->sla_due_at && $c->sla_due_at->isPast() && ! in_array($c->status, ['delivered', 'monitoring', 'closed'], true),
            'risk' => CasePresenter::riskState($c), 'updatedAt' => $c->updated_at->toIso8601String(), 'isSample' => $c->is_sample,
        ];
    }
}
