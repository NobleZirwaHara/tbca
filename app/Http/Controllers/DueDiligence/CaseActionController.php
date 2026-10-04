<?php

namespace App\Http\Controllers\DueDiligence;

use App\Http\Controllers\Controller;
use App\Models\DueDiligence\CaseFile;
use App\Models\DueDiligence\Consent;
use App\Models\DueDiligence\Document;
use App\Models\DueDiligence\EvidenceItem;
use App\Models\DueDiligence\Finding;
use App\Models\DueDiligence\InfoRequest;
use App\Models\DueDiligence\Quote;
use App\Support\DueDiligence\CasePresenter;
use App\Support\DueDiligence\CaseStateMachine;
use App\Support\DueDiligence\Catalogue;
use App\Support\DueDiligence\Content;
use App\Support\DueDiligence\Refs;
use App\Support\DueDiligence\Workflow;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Client-side case actions. Every state change goes through
 * CaseStateMachine so guards are enforced server side.
 */
class CaseActionController extends Controller
{
    private const FILE_RULE = ['required', 'file', 'max:25600', 'mimes:pdf,jpg,jpeg,png,docx,doc,xlsx,csv'];

    /* --- Subject (DD-033) ------------------------------------------------ */

    public function subject(Request $request, CaseFile $case): RedirectResponse
    {
        $this->guardOpen($request, $case);
        $opts = Content::options();
        $data = $request->validate([
            'registered_name' => ['required', 'string', 'max:190'],
            'trading_name' => ['nullable', 'string', 'max:190'],
            'registration_number' => ['nullable', 'string', 'max:60'],
            'id_number' => ['nullable', 'string', 'max:60'],
            'nationality' => ['nullable', 'string', 'max:80'],
            'entity_type' => ['nullable', Rule::in($opts['entityTypes'])],
            'incorporation_date' => ['nullable', 'date', 'before_or_equal:today'],
            'country' => ['required', 'string', 'max:80'],
            'industry' => ['nullable', Rule::in($opts['industries'])],
            'nature_of_business' => ['nullable', 'string', 'max:255'],
            'head_office' => ['nullable', 'string', 'max:255'],
            'aliases' => ['nullable', 'string', 'max:255'],
            'authority_confirmed' => ['nullable', 'boolean'],
            'directors' => ['nullable', 'array', 'max:30'],
            'directors.*.name' => ['required', 'string', 'max:120'],
            'directors.*.role' => ['required', 'string', 'max:60'],
            'directors.*.ownership' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $subject = array_merge($case->subject ?? [], $data);
        $subject['directors'] = array_values($data['directors'] ?? ($case->subject['directors'] ?? []));
        $case->update(['subject' => $subject, 'subject_name' => $data['registered_name']]);
        CaseStateMachine::record($case, 'dd.subject_updated', $request->user()->name, 'client', 'Subject details updated');

        $missing = Workflow::missingSubjectFields($case->fresh());

        return back()->with('success', $missing ? 'Saved. Still required: '.implode(', ', $missing).'.' : 'Subject details complete.');
    }

    /* --- Consent centre (DD-034) ----------------------------------------- */

    public function acknowledgeConsent(Request $request, CaseFile $case, Consent $consent): RedirectResponse
    {
        $this->guardOpen($request, $case);
        abort_unless($consent->case_id === $case->id, 404);
        if (! in_array($consent->type, ['cross_border', 'report_delivery', 'monitoring', 'lawful_purpose'], true)) {
            throw ValidationException::withMessages(['consent' => 'This consent must be given by the subject or authorised signatory through a secure consent request.']);
        }
        $request->validate(['confirm' => ['accepted']]);

        $consent->update(['status' => 'received', 'given_by' => $request->user()->name, 'method' => 'Client acknowledgement (portal)', 'received_at' => now(), 'valid_until' => now()->addYear()]);
        CaseStateMachine::record($case, 'dd.consent_received', $request->user()->name, 'client', "{$consent->label} acknowledged");

        return back()->with('success', "{$consent->label} recorded.");
    }

    public function sendConsentRequest(Request $request, CaseFile $case): RedirectResponse
    {
        $this->guardOpen($request, $case);
        $data = $request->validate([
            'consent_id' => ['required', 'integer'],
            'recipient_name' => ['required', 'string', 'max:120'],
            'recipient_role' => ['required', 'string', 'max:80'],
            'recipient_email' => ['required', 'email', 'max:190'],
            'channel' => ['required', Rule::in(['Email', 'WhatsApp'])],
        ]);
        $consent = $case->consents()->whereKey($data['consent_id'])->whereIn('type', ['subject', 'authorised_request'])->firstOrFail();

        $req = $case->consentRequests()->create([
            'consent_id' => $consent->id,
            'token' => Str::random(48),
            'recipient_name' => $data['recipient_name'],
            'recipient_role' => $data['recipient_role'],
            'recipient_email' => $data['recipient_email'],
            'channel' => $data['channel'],
            'status' => $data['channel'] === 'WhatsApp' ? 'delivered' : 'pending',
            'expires_at' => now()->addDays(14),
        ]);
        CaseStateMachine::record($case, 'dd.consent_request_sent', $request->user()->name, 'client', "Secure consent link sent to {$req->recipient_role} ({$req->channel})");

        return back()->with('success', "Consent request sent to {$req->recipient_name}. The secure link expires in 14 days.");
    }

    public function remindConsent(Request $request, CaseFile $case, int $consentRequest): RedirectResponse
    {
        $this->guardOpen($request, $case);
        $req = $case->consentRequests()->whereKey($consentRequest)->whereIn('status', ['pending', 'delivered'])->firstOrFail();
        if ($req->last_reminded_at && $req->last_reminded_at->gt(now()->subDay())) {
            throw ValidationException::withMessages(['reminder' => 'A reminder was sent in the last 24 hours.']);
        }
        $req->update(['reminders' => $req->reminders + 1, 'last_reminded_at' => now(), 'expires_at' => now()->addDays(14)]);
        CaseStateMachine::record($case, 'dd.consent_reminder', $request->user()->name, 'client', "Reminder sent to {$req->recipient_role}");

        return back()->with('success', 'Reminder sent.');
    }

    public function withdrawConsent(Request $request, CaseFile $case, Consent $consent): RedirectResponse
    {
        CaseController::authorise($request, $case);
        abort_unless($consent->case_id === $case->id && $consent->status === 'received', 404);
        abort_if(in_array($case->status, ['delivered', 'closed'], true) && $consent->type !== 'monitoring', 409, 'Consent for a delivered report cannot be withdrawn here; contact the privacy team.');

        $consent->update(['status' => 'withdrawn']);
        CaseStateMachine::record($case, 'dd.consent_withdrawn', $request->user()->name, 'client', "{$consent->label} withdrawn — future processing stops");

        if ($consent->requirement === 'required' && in_array($case->status, ['intake_open', 'ready_for_checks', 'checks_running', 'review_required'], true)) {
            CaseStateMachine::transition($case, 'consent_pending', 'System', 'system', 'Consent withdrawn: case returned to Consent Pending');
        }

        return back()->with('success', 'Consent withdrawn. Processing that relies on this consent has stopped.');
    }

    public function completeConsentGate(Request $request, CaseFile $case): RedirectResponse
    {
        CaseController::authorise($request, $case);
        CaseStateMachine::transition($case, 'intake_open', $request->user()->name, 'client', 'Consent gate complete: intake opened');

        return redirect()->route('due-diligence.cases.page', [$case, 'evidence'])->with('success', 'Consent gate complete. Upload your evidence next.');
    }

    /* --- Evidence (DD-035 / DD-036) -------------------------------------- */

    public function upload(Request $request, CaseFile $case): RedirectResponse
    {
        $this->guardOpen($request, $case);
        $data = $request->validate([
            'file' => self::FILE_RULE,
            'evidence_item_id' => ['nullable', 'integer'],
            'category' => ['nullable', Rule::in(['evidence', 'consent'])],
        ]);
        $item = isset($data['evidence_item_id']) ? $case->evidence()->whereKey($data['evidence_item_id'])->firstOrFail() : null;
        if ($item && $item->status === 'rejected') {
            $item->update(['status' => 'pending']);
        }

        $doc = Workflow::store($data['file'], "cases/{$case->reference}", [
            'case_id' => $case->id, 'evidence_item_id' => $item?->id, 'category' => $data['category'] ?? 'evidence',
            'uploaded_by' => $request->user()->name, 'status' => ($data['category'] ?? '') === 'consent' ? 'pending_review' : 'received',
        ]);
        if ($item) {
            Workflow::refreshEvidence($item->fresh());
        }
        CaseStateMachine::record($case, 'dd.evidence_uploaded', $request->user()->name, 'client', "Evidence item uploaded: {$doc->original_name}".($item ? " ({$item->label})" : ''));

        return back()->with('success', 'Uploaded securely. Files are encrypted at rest and access-controlled.');
    }

    public function deleteDocument(Request $request, CaseFile $case, Document $document): RedirectResponse
    {
        $this->guardOpen($request, $case);
        abort_unless($document->case_id === $case->id, 404);
        if (CasePresenter::rank($case->status) >= 3 && $document->category === 'evidence') {
            throw ValidationException::withMessages(['document' => 'The evidence baseline is frozen once screening starts. Ask your case manager to supersede a document.']);
        }
        Workflow::deleteDocument($document);
        CaseStateMachine::record($case, 'dd.evidence_removed', $request->user()->name, 'client', "Document removed: {$document->original_name}");

        return back()->with('success', 'Document removed.');
    }

    public function submitIntake(Request $request, CaseFile $case): RedirectResponse
    {
        CaseController::authorise($request, $case);
        if ($case->status === 'consent_pending') {
            return redirect()->route('due-diligence.cases.page', [$case, 'consent'])->with('error', 'Complete the consent gate first.');
        }
        if ($blocker = Workflow::intakeBlocker($case)) {
            CaseStateMachine::record($case, 'dd.evidence_incomplete', 'System', 'system', 'Completeness gate (G6) not met');

            return redirect()->route('due-diligence.cases.page', [$case, 'missing'])->with('error', $blocker);
        }
        CaseStateMachine::transition($case, 'ready_for_checks', $request->user()->name, 'client', 'Intake submitted: evidence baseline frozen and ready for checks');

        return redirect()->route('due-diligence.cases.page', [$case, 'checks'])->with('success', 'Intake submitted. Your case is ready for approved vendor checks.');
    }

    public function proposeAlternative(Request $request, CaseFile $case, EvidenceItem $item): RedirectResponse
    {
        $this->guardOpen($request, $case);
        abort_unless($item->case_id === $case->id, 404);
        $data = $request->validate(['detail' => ['required', 'string', 'min:10', 'max:1000']]);

        $case->requests()->create([
            'reference' => Refs::child('ALT', $case->requests()->where('type', 'alternative_evidence')->count()),
            'type' => 'alternative_evidence', 'title' => "Alternative evidence for {$item->label}", 'detail' => $data['detail'],
            'requested_by' => $request->user()->name, 'requested_by_role' => 'client', 'status' => 'open', 'reason' => (string) $item->id,
        ]);
        $item->update(['status' => 'alternative_proposed', 'note' => $data['detail']]);
        CaseStateMachine::record($case, 'dd.evidence_alternative', $request->user()->name, 'client', "Alternative evidence path proposed for {$item->label}");

        return back()->with('success', 'Alternative evidence path submitted for review. No fee applies.');
    }

    public function scopeChange(Request $request, CaseFile $case): RedirectResponse
    {
        $this->guardOpen($request, $case);
        $data = $request->validate(['detail' => ['required', 'string', 'min:10', 'max:1000']]);
        $case->requests()->create([
            'reference' => Refs::child('G9', $case->requests()->where('type', 'scope_change')->count()),
            'type' => 'scope_change', 'title' => 'Scope adjustment request (G9)', 'detail' => $data['detail'],
            'requested_by' => $request->user()->name, 'requested_by_role' => 'client', 'status' => 'open',
        ]);
        CaseStateMachine::record($case, 'dd.scope_change_requested', $request->user()->name, 'client', 'Scope adjustment (G9) requested');

        return back()->with('success', 'Scope adjustment requested. Any fee change will be quoted for your approval before work begins.');
    }

    /* --- Risk flags and reviewer requests (DD-038 to DD-041) ------------- */

    public function respondFinding(Request $request, CaseFile $case, Finding $finding): RedirectResponse
    {
        CaseController::authorise($request, $case);
        abort_unless($finding->case_id === $case->id && in_array($finding->status, ['open', 'client_responded'], true), 404);
        $data = $request->validate([
            'response_type' => ['required', Rule::in(['explanation', 'not_relevant', 'rescreen'])],
            'response' => ['required', 'string', 'min:10', 'max:2000'],
            'file' => ['nullable', 'file', 'max:25600', 'mimes:pdf,jpg,jpeg,png,docx'],
        ]);
        if ($request->hasFile('file')) {
            Workflow::store($request->file('file'), "cases/{$case->reference}", ['case_id' => $case->id, 'category' => 'evidence', 'uploaded_by' => $request->user()->name]);
        }
        $finding->update(['status' => 'client_responded', 'response_type' => $data['response_type'], 'client_response' => $data['response']]);
        CaseStateMachine::record($case, 'dd.risk_flag_response', $request->user()->name, 'client', "Response submitted for flag {$finding->reference}");

        return back()->with('success', 'Thank you. Your response is with the reviewer; the risk status will be updated after review.');
    }

    public function respondRequest(Request $request, CaseFile $case, InfoRequest $infoRequest): RedirectResponse
    {
        CaseController::authorise($request, $case);
        abort_unless($infoRequest->case_id === $case->id && $infoRequest->status === 'open' && in_array($infoRequest->type, ['information', 'partner', 'clarification'], true), 404);
        $data = $request->validate([
            'response' => ['required', 'string', 'min:3', 'max:2000'],
            'file' => ['nullable', 'file', 'max:25600', 'mimes:pdf,jpg,jpeg,png,docx,xlsx'],
        ]);
        if ($request->hasFile('file')) {
            Workflow::store($request->file('file'), "cases/{$case->reference}", ['case_id' => $case->id, 'category' => 'evidence', 'uploaded_by' => $request->user()->name]);
        }
        $infoRequest->update(['status' => 'responded', 'response' => $data['response'], 'responded_at' => now()]);
        CaseStateMachine::record($case, 'dd.request_responded', $request->user()->name, 'client', "Response provided for {$infoRequest->reference}");

        return back()->with('success', 'Response sent to your reviewer.');
    }

    /* --- Report release (DD-043) ----------------------------------------- */

    public function acknowledge(Request $request, CaseFile $case): RedirectResponse
    {
        CaseController::authorise($request, $case);
        $request->validate(['confirm' => ['accepted']], ['confirm.accepted' => 'You must acknowledge the limitations to access the report.']);
        if ($case->status !== 'approved_for_release') {
            if ($case->limitations_acknowledged_at) {
                return redirect()->route('due-diligence.cases.page', [$case, 'report']);
            }
            throw ValidationException::withMessages(['status' => 'The report is not yet approved for release.']);
        }

        $case->update(['limitations_acknowledged_at' => now()]);
        CaseStateMachine::record($case, 'dd.limitations_acknowledged', $request->user()->name, 'client', 'Report limitations acknowledged (G8 delivery audit)');
        CaseStateMachine::transition($case, 'delivered', $request->user()->name, 'client', 'Report released to client portal');

        return redirect()->route('due-diligence.cases.page', [$case, 'report'])->with('success', 'Acknowledged. Your report is now available.');
    }

    /* --- Disputes (DD-045 / DD-046) -------------------------------------- */

    public function openDispute(Request $request, CaseFile $case): RedirectResponse
    {
        CaseController::authorise($request, $case);
        $data = $request->validate([
            'report_section' => ['required', 'string', 'max:120'],
            'finding' => ['required', 'string', 'max:190'],
            'finding_ref' => ['nullable', 'string', 'max:40'],
            'page' => ['nullable', 'string', 'max:10'],
            'description' => ['required', 'string', 'min:20', 'max:1000'],
            'remedy' => ['required', Rule::in(['correct', 'reclassify', 'clarify', 'other'])],
            'remedy_other' => ['required_if:remedy,other', 'nullable', 'string', 'max:255'],
            'freeze' => ['accepted'],
            'files' => ['nullable', 'array', 'max:5'],
            'files.*' => ['file', 'max:25600', 'mimes:pdf,jpg,jpeg,png,docx'],
        ], ['freeze.accepted' => 'Acknowledge the evidence freeze to submit.']);

        if (! in_array($case->status, ['delivered', 'monitoring'], true)) {
            throw ValidationException::withMessages(['status' => 'Disputes can be opened on a delivered report.']);
        }

        $dispute = $case->disputes()->create([
            'reference' => sprintf('DISP-%s-%s-%03d', now()->format('Y'), substr($case->reference, -5), $case->disputes()->count() + 1),
        ] + collect($data)->except(['freeze', 'files'])->all() + ['status' => 'received']);

        foreach ($request->file('files', []) as $file) {
            Workflow::store($file, "cases/{$case->reference}/disputes", ['case_id' => $case->id, 'dispute_id' => $dispute->id, 'category' => 'dispute', 'uploaded_by' => $request->user()->name]);
        }

        CaseStateMachine::record($case, 'dd.dispute_opened', $request->user()->name, 'client', "Dispute {$dispute->reference} opened on {$data['report_section']}");
        CaseStateMachine::transition($case, 'disputed', $request->user()->name, 'client', 'Downstream use locked pending dispute review');

        return redirect()->route('due-diligence.cases.dispute', [$case, $dispute->reference])->with('success', "Dispute {$dispute->reference} received. We will respond within the stated SLA.");
    }

    public function appeal(Request $request, CaseFile $case, string $dispute): RedirectResponse
    {
        CaseController::authorise($request, $case);
        $d = $case->disputes()->where('reference', $dispute)->where('status', 'decided')->firstOrFail();
        $request->validate(['reason' => ['required', 'string', 'min:10', 'max:1000']]);
        $d->update(['status' => 'appealed', 'reason' => trim(($d->reason ?? '')."\n\nAppeal: ".$request->input('reason'))]);
        CaseStateMachine::record($case, 'dd.dispute_appealed', $request->user()->name, 'client', "Appeal escalated on {$d->reference}");
        if (in_array($case->status, ['delivered', 'monitoring'], true)) {
            CaseStateMachine::transition($case, 'disputed', $request->user()->name, 'client', 'Appeal escalated to senior review');
        }

        return back()->with('success', 'Appeal escalated to a senior reviewer.');
    }

    /* --- Monitoring (DD-047 / DD-048) ------------------------------------ */

    public function startMonitoring(Request $request, CaseFile $case): RedirectResponse
    {
        CaseController::authorise($request, $case);
        $data = $request->validate([
            'plan' => ['required', Rule::in(array_column(Catalogue::monitoringPlans(), 'code'))],
            'consent' => ['accepted'],
        ], ['consent.accepted' => 'Confirm the monitoring scope and consent.']);
        if ($case->status !== 'delivered') {
            throw ValidationException::withMessages(['status' => 'Monitoring can be activated once the report has been delivered.']);
        }
        if ($case->subscriptions()->where('status', 'active')->exists()) {
            throw ValidationException::withMessages(['plan' => 'Monitoring is already active for this case.']);
        }

        $plan = Catalogue::monitoringPlan($data['plan']);
        $sub = $case->subscriptions()->where('status', 'awaiting_payment')->where('plan_code', $plan['code'])->first();
        if (! $sub) {
            $order = Checkout::createOrder([
                ['item_type' => 'dd-expert', 'item_code' => $plan['code'], 'name' => $plan['name'].' — TBCA Expert (month 1)', 'unit_zar' => $plan['expert']],
                ['item_type' => 'dd-platform', 'item_code' => 'DD-PLAT-MON', 'name' => 'Monitoring Platform (month 1)', 'unit_zar' => $plan['platform']],
                ['item_type' => 'dd-external', 'item_code' => 'DD-EXT-MON', 'name' => 'External Data Providers (month 1)', 'unit_zar' => $plan['external']],
            ], $request->user(), 'due-diligence', ['title' => $plan['name'], 'case' => $case->reference]);
            $order->update(['meta' => [...$order->meta, 'return_url' => route('due-diligence.payment.status', $order, false)]]);

            $sub = $case->subscriptions()->create([
                'reference' => Refs::next('SUB-SA', 'dd_monitoring_subscriptions'),
                'user_id' => $request->user()->id, 'order_id' => $order->id, 'plan_code' => $plan['code'], 'plan_name' => $plan['name'],
                'recurring_zar' => $plan['total'], 'status' => 'awaiting_payment', 'subjects' => 1 + count($case->subject['directors'] ?? []),
                'alert_allowance' => $plan['allowance'], 'included_reviews' => $plan['reviews'], 'included_rechecks' => $plan['rechecks'],
            ]);
        }

        return redirect()->route('checkout.show', $sub->order);
    }

    public function cancelMonitoring(Request $request, CaseFile $case): RedirectResponse
    {
        CaseController::authorise($request, $case);
        $sub = $case->subscriptions()->where('status', 'active')->firstOrFail();
        $sub->update(['status' => 'cancelled']);
        CaseStateMachine::record($case, 'dd.monitoring_cancelled', $request->user()->name, 'client', "Monitoring {$sub->reference} cancelled");
        if ($case->status === 'monitoring') {
            CaseStateMachine::transition($case, 'delivered', $request->user()->name, 'client', 'Monitoring cancelled');
        }

        return back()->with('success', 'Monitoring cancelled. No further recurring charges will be raised.');
    }

    /* --- Closure (DD-051) ------------------------------------------------ */

    public function close(Request $request, CaseFile $case): RedirectResponse
    {
        CaseController::authorise($request, $case);
        $data = $request->validate(['action' => ['required', Rule::in(['archive', 'renew', 'delete', 'legal_hold'])]]);
        $actor = $request->user()->name;

        if ($data['action'] === 'renew') {
            $quote = $case->quote;
            $new = Quote::create([
                'reference' => Refs::next('Q-DD', 'dd_quotes'), 'user_id' => $case->user_id, 'family' => $case->family, 'sku_code' => $case->sku_code,
                'status' => 'draft', 'step' => 1, 'requirements' => $quote?->requirements ?? [], 'payer_name' => $case->client_name,
                'inputs' => array_merge($quote?->inputs ?? [], ['subject_name' => $case->subject_name, 'accurate' => null, 'permitted_purpose' => null, 'privacy_notice' => null]),
                'addons' => [],
            ]);
            CaseStateMachine::record($case, 'dd.case_renewal', $actor, 'client', "Renewal quote {$new->reference} created (fresh consent required)");

            return redirect()->route('due-diligence.quotes.step', [$new, 'inputs'])->with('success', "Renewal quote {$new->reference} started. Fresh consent and payment are required (G3/G4/G5).");
        }

        if ($data['action'] === 'legal_hold') {
            $case->update(['legal_hold' => true, 'closure_action' => 'legal_hold', 'closure_status' => 'completed']);
            CaseStateMachine::record($case, 'dd.legal_hold', $actor, 'client', 'Legal hold placed: deletion suspended and data preserved');

            return back()->with('success', 'Legal hold placed. Deletion is suspended and all data is preserved.');
        }

        if (! in_array($case->status, ['delivered', 'monitoring', 'closed'], true)) {
            throw ValidationException::withMessages(['action' => 'A case can be archived or deleted once delivery obligations are complete.']);
        }

        if ($data['action'] === 'delete') {
            if ($case->legal_hold) {
                throw ValidationException::withMessages(['action' => 'This case is under legal hold. Deletion is suspended.']);
            }
            $case->update(['closure_action' => 'delete', 'closure_status' => 'pending_approval', 'closure_approvals' => ['privacy_lead' => false, 'finance_controller' => false]]);
            CaseStateMachine::record($case, 'dd.deletion_requested', $actor, 'client', 'Deletion requested: awaiting Privacy Lead and Finance Controller approval');

            return back()->with('success', 'Deletion requested. Dual approval (Privacy Lead + Finance Controller) is required.');
        }

        // Archive
        $case->subscriptions()->where('status', 'active')->update(['status' => 'cancelled']);
        $case->update(['closure_action' => 'archive', 'closure_status' => 'completed']);
        if ($case->status !== 'closed') {
            CaseStateMachine::transition($case, 'closed', $actor, 'client', 'Case archived per retention schedule');
        }

        return back()->with('success', 'Case archived. A closure certificate has been issued.');
    }

    /* ------------------------------------------------------------------ */

    private function guardOpen(Request $request, CaseFile $case): void
    {
        CaseController::authorise($request, $case);
        abort_if($case->status === 'closed', 409, 'This case is closed.');
    }
}
