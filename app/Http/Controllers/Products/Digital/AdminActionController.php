<?php

namespace App\Http\Controllers\Products\Digital;

use App\Http\Controllers\Controller;
use App\Models\Products\Digital\DpAmendment;
use App\Models\Products\Digital\DpCase;
use App\Models\Products\Digital\DpClaim;
use App\Models\Products\Digital\DpDownload;
use App\Models\Products\Digital\DpEntitlement;
use App\Models\Products\Digital\DpIncident;
use App\Models\Products\Digital\DpIpRecord;
use App\Models\Products\Digital\DpPriceItem;
use App\Models\Products\Digital\DpProduct;
use App\Models\Products\Digital\DpReclassItem;
use App\Models\Products\Digital\DpVersion;
use App\Support\Products\Digital\Audit;
use App\Support\Products\Digital\Pricing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * State-changing governance actions behind the admin consoles. Every action
 * enforces its blueprint rule server-side and writes an audit event.
 */
class AdminActionController extends Controller
{
    /* ---- Defensibility (GATE-DP-01) -------------------------------------- */

    public function defensibilityDecide(Request $request, DpProduct $product): RedirectResponse
    {
        $data = $request->validate(['decision' => ['required', Rule::in(['approve', 'refer'])], 'note' => ['nullable', 'string', 'max:500']]);
        $d = $product->defensibility ?? [];
        $active = collect($d['tests'] ?? [])->where('status', 'active')->count();
        $delta = (int) ($d['substitute']['ours'] ?? 0) - (int) ($d['substitute']['score'] ?? 0);

        if ($data['decision'] === 'approve') {
            if ($active < 1) {
                $this->fail('decision', 'GATE-DP-01 needs at least one ACTIVE D-class with complete evidence.');
            }
            if ($delta <= 0) {
                $this->fail('decision', 'Paid value delta against the best free substitute must be evidenced (ours must beat the substitute score).');
            }
        }

        $approve = $data['decision'] === 'approve';
        $product->update([
            'defensibility' => [...$d,
                'gate' => $approve ? 'PASS' : 'WORKFLOW_HOLD',
                'decision' => $approve ? 'Approve Paid State' : 'Referred for human review',
                'decided_at' => now()->format('d M Y'),
                'decided_by' => $request->user()->name,
                'assessed_at' => now()->format('d M Y, H:i'),
                'notes' => $data['note'] ?? ($d['notes'] ?? null),
            ],
            // A paid product without a passing defensibility decision is STOP SALE (P0).
            'lifecycle_status' => $approve
                ? ($product->lifecycle_status === 'under_review' ? 'pending_qa' : $product->lifecycle_status)
                : ($product->lifecycle_status === 'live' ? 'under_review' : $product->lifecycle_status),
        ]);
        Audit::log($approve ? 'DP_DEFENSIBILITY_PASSED' : 'DP_DEFENSIBILITY_FAILED', $product, ['note' => $data['note'] ?? null]);

        return back()->with('success', $approve ? 'Paid state approved (GATE-DP-01 PASS).' : 'Referred for human review — the product is held from sale until re-approved.');
    }

    public function defensibilityTest(Request $request, DpProduct $product): RedirectResponse
    {
        $data = $request->validate(['code' => ['required', Rule::in(['D1', 'D2', 'D3', 'D4', 'D5'])], 'status' => ['required', Rule::in(['active', 'inactive'])]]);
        $d = $product->defensibility ?? [];
        $d['tests'] = collect($d['tests'] ?? [])->map(fn ($t) => $t['code'] === $data['code'] ? [...$t, 'status' => $data['status']] : $t)->all();

        $lifecycle = $product->lifecycle_status;
        if (collect($d['tests'])->where('status', 'active')->isEmpty()) {
            // The last ACTIVE D class expiring removes paid-listing eligibility.
            $d['gate'] = 'BLOCK';
            $d['decision'] = 'No active D-class — paid listing removed';
            $lifecycle = $lifecycle === 'live' ? 'under_review' : $lifecycle;
        }

        $product->update(['defensibility' => $d, 'lifecycle_status' => $lifecycle]);
        Audit::log('DP_DEFENSIBILITY_TEST', $product, $data);

        return back()->with('success', "{$data['code']} set to ".strtoupper($data['status']).'.');
    }

    /* ---- Creation QA & release (GATE-DP-04 / DP-18) ---------------------- */

    public function qaCheck(Request $request, DpProduct $product): RedirectResponse
    {
        $data = $request->validate(['n' => ['required', 'integer', 'between:1,17'], 'result' => ['required', Rule::in(['pass', 'fail', 'pending'])]]);
        $qa = $product->qa;
        $qa['checks'] = collect($qa['checks'])->map(fn ($c) => $c['n'] === (int) $data['n']
            ? [...$c, 'result' => $data['result'], 'reviewer' => $c['reviewer'], 'date' => now()->format('d M Y')]
            : $c)->all();
        $qa['status'] = $this->qaStatus($qa, $qa['status'] === 'submitted' && $data['result'] === 'pass' ? 'submitted' : null);
        $product->update(['qa' => $qa]);
        Audit::log('DP_QA_CHECK', $product, $data);

        return back()->with('success', "Check {$data['n']} marked ".strtoupper($data['result']).'.');
    }

    public function qaRun(Request $request, DpProduct $product): RedirectResponse
    {
        $qa = $product->qa;
        $openClaims = $product->claims()->where(fn ($q) => $q->whereIn('status', ['pending', 'in_review', 'rejected'])->orWhere('has_evidence', false))->count();
        $ip = DpIpRecord::where('product_id', $product->id)->first();
        $auto = [
            2 => ($product->defensibility['gate'] ?? '') === 'PASS',
            3 => $openClaims === 0,
            7 => $ip && $ip->ip_status === 'cleared',
            16 => collect($product->prices)->filter()->isNotEmpty(),
        ];

        $qa['checks'] = collect($qa['checks'])->map(fn ($c) => isset($auto[$c['n']])
            ? [...$c, 'result' => $auto[$c['n']] ? 'pass' : 'fail', 'date' => now()->format('d M Y')]
            : $c)->all();
        $qa['cycle'] = ($qa['cycle'] ?? 0) + 1;
        $qa['completed_at'] = now()->format('d M Y, H:i');
        $qa['run_by'] = $request->user()->name;
        $qa['status'] = $this->qaStatus($qa);
        $qa['note'] = $qa['status'] === 'ready_for_review'
            ? 'All checks passed. Product is eligible for submission to the Release Review Panel. No blocking issues.'
            : 'Blocking issues found: '.collect($qa['checks'])->where('result', '!=', 'pass')->pluck('name')->implode(', ').($openClaims ? " ({$openClaims} open claims)" : '').'.';
        $product->update(['qa' => $qa]);
        Audit::log('DP_QA_RUN', $product, ['cycle' => $qa['cycle'], 'status' => $qa['status']]);

        return back()->with($qa['status'] === 'ready_for_review' ? 'success' : 'error', $qa['note']);
    }

    public function qaSubmit(Request $request, DpProduct $product): RedirectResponse
    {
        $qa = $product->qa;
        if ($this->qaStatus($qa) !== 'ready_for_review') {
            $this->fail('qa', 'All 17 QA checks must PASS before submitting for review.');
        }
        $qa['status'] = 'submitted';
        $product->update(['qa' => $qa]);
        Audit::log('DP_QA_SUBMITTED', $product);

        return back()->with('success', 'Submitted to the Release Review Panel.');
    }

    public function qaRelease(Request $request, DpProduct $product): RedirectResponse
    {
        $qa = $product->qa;
        $draft = $product->versions()->where('status', 'qa')->first();

        if (! $draft) {
            $this->fail('qa', 'There is no draft version in QA to release.');
        }
        if (($qa['status'] ?? '') !== 'submitted' || $this->qaStatus($qa) !== 'ready_for_review') {
            $this->fail('qa', 'Release needs 17/17 PASS and a submitted review (GATE-DP-18).');
        }
        if (($product->defensibility['gate'] ?? '') !== 'PASS') {
            $this->fail('qa', 'GATE-DP-01 Defensibility must PASS before release.');
        }

        DB::transaction(function () use ($product, $draft, $qa) {
            $product->versions()->where('status', 'current')->update(['status' => 'superseded']);
            $draft->update(['status' => 'current', 'released_at' => now(), 'verified_at' => now(), 'maintenance_until' => now()->addYear()]);
            $product->update([
                'current_version' => $draft->version,
                'verified_at' => now(),
                'next_review_at' => now()->addMonths(3),
                'released_at' => now(),
                'lifecycle_status' => 'live',
                'qa' => [...$qa, 'status' => 'released'],
            ]);
            // Holder notice (M4): every active holder learns a new controlled edition exists.
            $product->entitlements()->whereIn('status', ['active', 'legacy'])->update([
                'correction_state' => 'Update Available '.$draft->label(),
                'notification_state' => 'delivered',
            ]);
        });
        Audit::log('DP_VERSION_RELEASED', $product, ['version' => $draft->version]);

        return back()->with('success', "{$product->name} {$draft->label()} released. Holders have been notified.");
    }

    public function qaNote(Request $request, DpProduct $product): RedirectResponse
    {
        $data = $request->validate(['note' => ['required', 'string', 'max:1000']]);
        $product->update(['qa' => [...$product->qa, 'internal_note' => $data['note']]]);

        return back()->with('success', 'Internal note saved.');
    }

    /* ---- Claims --------------------------------------------------------- */

    public function claimStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product' => ['required', 'exists:prd_dp_products,slug'],
            'claim' => ['required', 'string', 'max:500'],
            'type' => ['required', Rule::in(['Feature', 'Statistic', 'Outcome', 'Suitability', 'Legal', 'Other'])],
            'source' => ['nullable', 'string', 'max:120'],
            'source_detail' => ['nullable', 'string', 'max:120'],
            'priority' => ['required', Rule::in(['high', 'medium', 'low'])],
            'review_due' => ['required', 'date'],
            'has_evidence' => ['boolean'],
        ]);
        $product = DpProduct::with('versions')->where('slug', $data['product'])->first();
        $last = (int) DpClaim::where('reference', 'like', 'CLM-'.now()->format('Y').'-%')->max(DB::raw('CAST(SUBSTR(reference, 10) AS INTEGER)'));

        $claim = DpClaim::create([
            'reference' => sprintf('CLM-%s-%06d', now()->format('Y'), max($last, 2145) + 1),
            'product_id' => $product->id, 'product_name' => $product->name,
            'version_label' => \App\Support\Products\Digital\Presenter::versionLabel($product->currentVersion()),
            'claim' => $data['claim'], 'type' => $data['type'], 'source' => $data['source'] ?? null, 'source_detail' => $data['source_detail'] ?? null,
            'status' => 'pending', 'has_evidence' => (bool) ($data['has_evidence'] ?? false), 'priority' => $data['priority'], 'review_due' => $data['review_due'],
        ]);
        Audit::log('DP_CLAIM_UPDATED', $claim, ['status' => 'pending']);

        return back()->with('success', "Claim {$claim->reference} submitted for verification.");
    }

    public function claimStatus(Request $request, DpClaim $claim): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['start_review', 'verify', 'reject', 'reopen', 'attach_evidence'])],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $allowed = [
            'start_review' => ['pending'],
            'verify' => ['in_review'],
            'reject' => ['pending', 'in_review'],
            'reopen' => ['rejected', 'verified'],
            'attach_evidence' => ['pending', 'in_review', 'rejected'],
        ][$data['action']];

        if (! in_array($claim->status, $allowed, true)) {
            $this->fail('action', "Cannot {$data['action']} a claim that is ".str_replace('_', ' ', $claim->status).'.');
        }
        if ($data['action'] === 'verify' && ! $claim->has_evidence) {
            $this->fail('action', 'Orphan claims cannot be verified — attach traceable evidence first.');
        }

        $claim->update(match ($data['action']) {
            'start_review' => ['status' => 'in_review', 'reviewer' => $request->user()->name],
            'verify' => ['status' => 'verified', 'review_due' => now()->addMonths(3)],
            'reject' => ['status' => 'rejected'],
            'reopen' => ['status' => 'pending'],
            'attach_evidence' => ['has_evidence' => true],
        } + ['note' => $data['note'] ?? $claim->note]);
        Audit::log('DP_CLAIM_UPDATED', $claim, $data);

        return back()->with('success', "{$claim->reference}: ".str_replace('_', ' ', $data['action']).' recorded.');
    }

    /* ---- Licence & IP chain / marketplace clearance ---------------------- */

    public function ipStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_name' => ['required', 'string', 'max:190'],
            'version_label' => ['required', 'string', 'max:40'],
            'sku' => ['required', 'string', 'max:60', 'unique:prd_dp_ip_records,sku'],
            'provider' => ['nullable', 'string', 'max:120'],
            'marketplace' => ['boolean'],
            'authorship_class' => ['required', Rule::in(['A1', 'A2', 'A3', 'A4', 'A5'])],
            'instrument_type' => ['nullable', 'string', 'max:60'],
            'instrument_ref' => ['nullable', 'string', 'max:60'],
            'third_party' => ['required', Rule::in(['PASS', 'PENDING', 'NONE', 'FAIL'])],
            'ai_class' => ['required', Rule::in(['AI-0', 'AI-1', 'AI-2', 'AI-3', 'AI-X'])],
            'classes' => ['array'],
        ]);

        $record = DpIpRecord::create([
            ...collect($data)->except('classes')->all(),
            'product_id' => DpProduct::where('name', $data['product_name'])->value('id'),
            'instrument_date' => $data['instrument_ref'] ? now() : null,
            'licence_classes' => collect(['L1', 'L2', 'L3', 'L4', 'L5'])->mapWithKeys(fn ($c) => [$c => in_array($c, $data['classes'] ?? [], true) ? 'pending' : 'blocked'])->all(),
            'ip_status' => $this->ipState($data['instrument_ref'] ?? null, $data['third_party'], $data['ai_class']),
            // Marketplace default state is IP_EVIDENCE_HOLD: zero products auto-cleared.
            'clearance_status' => 'awaiting_evidence',
            'listed' => false,
            'last_review' => now(), 'next_review' => now()->addYear(), 'reviewer' => $request->user()->name,
        ]);
        Audit::log('DP_IP_UPDATED', $record, ['created' => true]);

        return back()->with('success', "IP chain record created for {$record->product_name}.");
    }

    public function ipStatus(Request $request, DpIpRecord $record): RedirectResponse
    {
        $data = $request->validate(['ip_status' => ['required', Rule::in(['cleared', 'partial', 'at_risk'])]]);

        if ($data['ip_status'] === 'cleared' && $this->ipState($record->instrument_ref, $record->third_party, $record->ai_class) !== 'cleared') {
            $this->fail('ip_status', 'A full chain needs an executed rights instrument, third-party clearance PASS and known AI provenance.');
        }

        $record->update([
            'ip_status' => $data['ip_status'],
            'licence_classes' => $data['ip_status'] === 'cleared'
                ? collect($record->licence_classes)->map(fn ($v) => $v === 'pending' ? 'ok' : $v)->all()
                : $record->licence_classes,
            'last_review' => now(),
            'reviewer' => $request->user()->name,
        ]);

        // Marketplace / A2–A5 IP chain incomplete = STOP SALE.
        if ($data['ip_status'] === 'at_risk' && $record->authorship_class !== 'A1' && $record->product_id) {
            DpProduct::where('id', $record->product_id)->where('lifecycle_status', 'live')->update(['lifecycle_status' => 'under_review']);
        }
        Audit::log('DP_IP_UPDATED', $record, $data);

        return back()->with('success', "{$record->product_name}: IP status set to ".str_replace('_', ' ', $data['ip_status']).'.');
    }

    public function clearance(Request $request, DpIpRecord $record): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['request_evidence', 'evidence_received', 'start_review', 'clear', 'block', 'list', 'unlist'])],
            'instrument_ref' => ['nullable', 'string', 'max:60'],
        ]);

        $s = $record->clearance_status;
        $ok = match ($data['action']) {
            'request_evidence' => in_array($s, ['in_review', 'awaiting_evidence', 'blocked'], true),
            'evidence_received' => $s === 'awaiting_evidence',
            'start_review' => $s === 'awaiting_evidence',
            'clear', 'block' => $s === 'in_review',
            'list' => $s === 'cleared' && ! $record->listed,
            'unlist' => $record->listed,
        };
        if (! $ok) {
            $this->fail('action', 'That transition is not allowed from '.str_replace('_', ' ', $s).'.');
        }

        if ($data['action'] === 'start_review' && ! $record->instrument_ref) {
            $this->fail('action', 'A rights instrument must be on file before legal / IP review starts.');
        }
        if ($data['action'] === 'clear' && $this->ipState($record->instrument_ref, $record->third_party, $record->ai_class) !== 'cleared') {
            $this->fail('action', 'GATE-DP-03 cannot pass: third-party clearance must be PASS and AI provenance known (not AI-X).');
        }

        $record->update(match ($data['action']) {
            'request_evidence' => ['clearance_status' => 'awaiting_evidence', 'listed' => false],
            'evidence_received' => [
                'instrument_ref' => $data['instrument_ref'] ?: ($record->instrument_ref ?? 'LIC-'.strtoupper(substr(md5($record->sku), 0, 6))),
                'instrument_type' => $record->instrument_type ?? 'Licence Agreement',
                'instrument_date' => $record->instrument_date ?? now(),
                'third_party' => 'PASS',
                'ai_class' => $record->ai_class === 'AI-X' ? 'AI-1' : $record->ai_class,
            ],
            'start_review' => ['clearance_status' => 'in_review'],
            'clear' => ['clearance_status' => 'cleared', 'ip_status' => 'cleared', 'licence_classes' => collect($record->licence_classes)->map(fn ($v) => $v === 'pending' ? 'ok' : $v)->all()],
            'block' => ['clearance_status' => 'blocked', 'listed' => false, 'ip_status' => 'at_risk'],
            'list' => ['listed' => true],
            'unlist' => ['listed' => false],
        } + ['last_review' => now(), 'reviewer' => $request->user()->name]);

        Audit::log($data['action'] === 'clear' ? 'DP_IP_CLEARED' : 'DP_IP_UPDATED', $record, $data);

        return back()->with('success', "{$record->product_name}: ".str_replace('_', ' ', $data['action']).' recorded.');
    }

    /* ---- Version / holder register --------------------------------------- */

    public function notify(Request $request, DpEntitlement $entitlement): RedirectResponse
    {
        $entitlement->update(['notification_state' => 'delivered']);
        Audit::log('DP_NOTIFICATION_SENT', $entitlement, ['correction' => $entitlement->correction_state]);

        return back()->with('success', "Notification re-sent to {$entitlement->holder_email}.");
    }

    public function applyCorrection(Request $request, DpEntitlement $entitlement): RedirectResponse
    {
        $current = $entitlement->product->versions()->where('status', 'current')->first();
        if (! $current) {
            $this->fail('entitlement', 'No current controlled version to link.');
        }
        if (in_array($entitlement->status, ['refunded', 'revoked', 'suspended'], true)) {
            $this->fail('entitlement', 'Corrections are linked only to active or legacy entitlements.');
        }

        $from = $entitlement->version?->version;
        $entitlement->update(['version_id' => $current->id, 'correction_state' => 'Delivered', 'notification_state' => 'delivered', 'status' => $entitlement->status === 'legacy' ? 'active' : $entitlement->status]);
        DpAmendment::create(['entitlement_id' => $entitlement->id, 'type' => 'version_update', 'from_value' => $from, 'to_value' => $current->version, 'status' => 'applied', 'meta' => ['by' => 'admin']]);
        Audit::log('DP_LICENCE_CHANGED', $entitlement, ['correction_to' => $current->version]);

        return back()->with('success', "{$entitlement->reference} linked to {$current->label()}.");
    }

    /* ---- Correction & withdrawal ---------------------------------------- */

    public function incidentStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product' => ['required', 'exists:prd_dp_products,slug'],
            'summary' => ['required', 'string', 'max:190'],
            'severity' => ['required', Rule::in(['S1', 'S2', 'S3'])],
            'type' => ['required', Rule::in(['Content Error', 'Calculation Error', 'Legal / Disclaimer', 'Typographical', 'Source Issue'])],
            'detected_by' => ['required', Rule::in(['QA Review', 'Customer Report', 'Legal Review', 'QA Automation'])],
        ]);
        $product = DpProduct::with('versions')->where('slug', $data['product'])->first();
        $current = $product->currentVersion();
        $n = (int) DpIncident::count() + 48;

        $incident = DpIncident::create([
            'reference' => sprintf('CRR-%s-%05d', now()->format('Y'), $n + 5),
            'product_id' => $product->id, 'product_name' => $product->name, 'version_label' => $current ? 'v'.$current->version : '—',
            'summary' => $data['summary'], 'detail' => $data['summary'], 'severity' => $data['severity'], 'type' => $data['type'],
            'detected_by' => $data['detected_by'], 'detected_on' => now(), 'status' => 'open', 'containment' => 'not_contained', 'step' => 1,
            'holders_affected' => $product->entitlements()->whereIn('status', ['active', 'legacy'])->count(),
            'downloads' => DpDownload::where('product_id', $product->id)->where('success', true)->count(),
            'assigned_to' => 'QA Lead',
        ]);
        Audit::log('DP_CORRECTION_OPENED', $incident, ['severity' => $data['severity']]);

        return redirect()->route('products.digital.admin.corrections', ['incident' => $incident->reference])->with('success', "Incident {$incident->reference} opened ({$data['severity']}).");
    }

    public function incidentAdvance(Request $request, DpIncident $incident): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['contain', 'assess', 'correct', 'notify', 'close'])],
            'replacement' => ['nullable', 'regex:/^\d+\.\d+\.\d+$/'],
        ], ['replacement.regex' => 'Use a semantic version such as 2.0.2.']);

        $required = ['contain' => 1, 'assess' => 2, 'correct' => 3, 'notify' => 4, 'close' => 5][$data['action']];
        if ($incident->step !== $required) {
            $this->fail('action', 'The containment and remedy flow must follow its order (current step '.$incident->step.' of 6).');
        }

        $product = $incident->product_id ? DpProduct::with('versions')->find($incident->product_id) : null;
        $affected = $product?->versions->firstWhere('version', ltrim($incident->version_label, 'v'));

        DB::transaction(function () use ($data, $incident, $product, $affected) {
            switch ($data['action']) {
                case 'contain':
                    $incident->update(['step' => 2, 'status' => $incident->severity === 'S1' ? 'in_containment' : 'under_review',
                        'containment' => $incident->severity === 'S1' ? 'in_containment' : 'partial', 'containment_started_at' => now()]);
                    // S1: stop sales and downloads of the unsafe version.
                    if ($incident->severity === 'S1' && $affected && in_array($affected->status, ['current', 'superseded'], true)) {
                        $wasCurrent = $affected->status === 'current';
                        $affected->update(['status' => 'withdrawn_unsafe']);
                        if ($wasCurrent) {
                            $product->update(['lifecycle_status' => 'withdrawn_hold']);
                        }
                        Audit::log('DP_VERSION_WITHDRAWN', $product, ['version' => $affected->version, 'incident' => $incident->reference]);
                    }
                    break;
                case 'assess':
                    $incident->update(['step' => 3,
                        'holders_affected' => $product ? max($incident->holders_affected, $product->entitlements()->whereIn('status', ['active', 'legacy', 'suspended'])->count()) : $incident->holders_affected]);
                    break;
                case 'correct':
                    if (empty($data['replacement'])) {
                        $this->fail('replacement', 'Enter the replacement version number.');
                    }
                    if ($product && $product->versions->contains('version', $data['replacement'])) {
                        $this->fail('replacement', 'That version already exists — silent overwrite is prohibited.');
                    }
                    if ($product) {
                        // Replacement goes through full creation QA before release.
                        DpVersion::create(['product_id' => $product->id, 'version' => $data['replacement'], 'status' => 'qa', 'update_type' => 'critical',
                            'summary' => "Correction for {$incident->reference}: {$incident->summary}.", 'whats_new' => ["Corrects: {$incident->summary}"], 'impact' => ['Correction'],
                            'size' => $affected?->size]);
                        $qa = $product->qa;
                        $qa['status'] = 'in_progress';
                        $qa['checks'] = collect($qa['checks'])->map(fn ($c) => [...$c, 'result' => 'pending'])->all();
                        $product->update(['qa' => $qa]);
                    }
                    $incident->update(['step' => 4, 'replacement_version' => 'v'.$data['replacement']]);
                    break;
                case 'notify':
                    $count = $product ? $product->entitlements()->whereIn('status', ['active', 'legacy'])->update([
                        'correction_state' => 'Correction Available '.$incident->replacement_version, 'notification_state' => 'delivered',
                    ]) : 0;
                    $incident->update(['step' => 5]);
                    Audit::log('DP_NOTIFICATION_SENT', $incident, ['holders' => $count]);
                    break;
                case 'close':
                    $incident->update(['step' => 6, 'status' => 'resolved', 'containment' => 'contained']);
                    break;
            }
        });
        Audit::log('DP_CORRECTION_ADVANCED', $incident, $data);

        return back()->with('success', "{$incident->reference}: {$data['action']} complete.");
    }

    /* ---- Delivery reclassification --------------------------------------- */

    public function reclassUpdate(Request $request, DpReclassItem $item): RedirectResponse
    {
        $data = $request->validate(['action' => ['required', Rule::in(['advance', 'reclassify', 'rework_done'])]]);

        if ($data['action'] === 'reclassify') {
            if ($item->eligibility !== 'not_eligible') {
                $this->fail('action', 'Only items that are not eligible for instant-core are reclassified to a canonical vehicle.');
            }
            $item->update(['stage' => 7, 'eligibility' => 'completed', 'current_state' => 'Reclassified – Sprint / Advisory', 'route' => 'R-B']);
        } elseif ($data['action'] === 'rework_done') {
            if ($item->eligibility !== 'pending_rework') {
                $this->fail('action', 'This item has no rework pending.');
            }
            $item->update(['eligibility' => 'eligible', 'stage' => max($item->stage, 4)]);
        } else {
            if ($item->stage >= 7) {
                $this->fail('action', 'Already published.');
            }
            if ($item->eligibility !== 'eligible' && $item->stage >= 2) {
                $this->fail('action', 'All instant-core criteria must be GREEN (eligible) before moving past gap analysis.');
            }
            $next = $item->stage + 1;
            $item->update(['stage' => $next, 'current_state' => $next >= 7 ? 'Instant Core' : $item->current_state, 'eligibility' => $next >= 7 ? 'completed' : $item->eligibility]);
        }
        Audit::log('DP_RECLASS_ADVANCED', $item, ['action' => $data['action'], 'stage' => $item->stage]);

        return back()->with('success', "{$item->product_name}: stage {$item->stage} of 7.");
    }

    /* ---- Price floor remediation ----------------------------------------- */

    public function priceRecalculate(): RedirectResponse
    {
        DpPriceItem::all()->each(fn ($i) => $i->update(['floor_price' => max($i->floor_price, Pricing::floor($i->tcs))]));
        Audit::log('DP_PRICE_UPDATED', 'DpPriceItem', ['step' => 'Floors recalculated at 45% GP'], 'All price items');

        return back()->with('success', 'Floor prices recalculated at 45% GP. Floors are never edited downward.');
    }

    public function priceStep(Request $request, DpPriceItem $item): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['analyse', 'propose', 'submit', 'approve', 'reject'])],
            'price' => ['nullable', 'integer', 'min:1'],
        ]);

        $from = ['analyse' => ['needs_review'], 'propose' => ['in_analysis', 'price_proposed'], 'submit' => ['price_proposed'], 'approve' => ['awaiting_approval'], 'reject' => ['awaiting_approval']][$data['action']];
        if (! in_array($item->status, $from, true)) {
            $this->fail('action', 'Not allowed from '.str_replace('_', ' ', $item->status).'.');
        }

        if ($data['action'] === 'propose') {
            $price = (int) ($data['price'] ?? $item->floor_price);
            if ($v = Pricing::violation($item, $price)) {
                $this->fail('price', $v);
            }
            $item->update(['status' => 'price_proposed', 'proposed_price' => $price]);
        } elseif ($data['action'] === 'approve') {
            // Finance approval (GATE-DP-14 price change) re-checks the rules before applying.
            if ($v = Pricing::violation($item, (int) $item->proposed_price)) {
                $this->fail('action', $v);
            }
            $item->update(['status' => 'completed', 'lowest_price' => $item->proposed_price]);
        } else {
            $item->update(['status' => ['analyse' => 'in_analysis', 'submit' => 'awaiting_approval', 'reject' => 'price_proposed'][$data['action']]]);
        }
        Audit::log('DP_PRICE_UPDATED', $item, $data);

        return back()->with('success', "{$item->product_name}: ".str_replace('_', ' ', $item->status).'.');
    }

    /* ---- Free / paid boundary & subscription ------------------------------ */

    public function disposition(Request $request, DpProduct $product): RedirectResponse
    {
        $data = $request->validate(['disposition' => ['required', Rule::in(['DP-PK', 'DP-PS', 'DP-PE', 'DP-FR', 'DP-RC'])]], ['disposition.in' => 'DP-RT RETIRE is obsolete in v2 and cannot be used.']);
        $paid = in_array($data['disposition'], ['DP-PK', 'DP-PS', 'DP-PE'], true);

        if ($paid && (($product->defensibility['gate'] ?? '') !== 'PASS' || (int) $product->dss < 20)) {
            $this->fail('disposition', 'A paid disposition needs GATE-DP-01 PASS and DSS ≥ 20.');
        }

        $lifecycle = match (true) {
            $data['disposition'] === 'DP-RC' => 'pending_reclass',
            $paid && $product->lifecycle_status === 'pending_reclass' => 'under_review',
            default => $product->lifecycle_status,
        };

        $product->update([
            'disposition' => $data['disposition'],
            'lifecycle_status' => $lifecycle,
            'subscription_status' => $data['disposition'] === 'DP-FR' ? 'Not Applicable' : $product->subscription_status,
        ]);
        Audit::log('DP_PRODUCT_RECLASSIFIED_OR_ARCHIVED', $product, $data);

        return back()->with('success', "{$product->name} disposition set to {$data['disposition']}.");
    }

    public function subscription(Request $request, DpProduct $product): RedirectResponse
    {
        $data = $request->validate(['action' => ['required', Rule::in(['enable', 'disable'])]]);

        if ($data['action'] === 'enable') {
            if (! $product->subscription_suitable || ! $product->recurring_evidence) {
                $this->fail('action', 'Subscription state is enabled only when real recurring value is proven (evidence of recurring updates).');
            }
            if (! in_array($product->disposition, ['DP-PK', 'DP-PS', 'DP-PE'], true) || str_starts_with((string) $product->defensibility_level, 'D1')) {
                $this->fail('action', 'Only paid products with at least moderate defensibility can carry a subscription.');
            }
        }

        $product->update(['subscription_status' => $data['action'] === 'enable' ? 'Enabled' : 'Pending']);
        Audit::log($data['action'] === 'enable' ? 'DP_SUBSCRIPTION_ACTIVATED' : 'DP_PRODUCT_RECLASSIFIED_OR_ARCHIVED', $product, $data);

        return back()->with('success', "{$product->name}: subscription ".($data['action'] === 'enable' ? 'enabled' : 'set to pending').'.');
    }

    /* ---- Refund & issue cases -------------------------------------------- */

    public function caseDecide(Request $request, DpCase $case): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['review', 'approve', 'decline', 'resolve'])],
            'legal_state' => ['nullable', Rule::in(['Statutory remedy (ECTA / CPA)', 'TBCA-failure remedy', 'Goodwill (discretionary)', 'No remedy due'])],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $from = ['review' => ['submitted'], 'approve' => ['submitted', 'under_review'], 'decline' => ['submitted', 'under_review'], 'resolve' => ['submitted', 'under_review']][$data['action']];
        if (! in_array($case->status, $from, true)) {
            $this->fail('action', 'This case is already '.str_replace('_', ' ', $case->status).'.');
        }
        if (in_array($data['action'], ['approve', 'decline'], true) && $case->kind === 'refund' && empty($data['legal_state'])) {
            // Legal / policy remedy is assessed before any goodwill decision.
            $this->fail('legal_state', 'Record the remedy basis (statutory, TBCA-failure or goodwill) before deciding.');
        }

        $e = $case->entitlement;
        DB::transaction(function () use ($data, $case, $e) {
            $case->update([
                'status' => ['review' => 'under_review', 'approve' => 'approved', 'decline' => 'declined', 'resolve' => 'resolved'][$data['action']],
                'legal_state' => $data['legal_state'] ?? $case->legal_state,
                'decision_note' => $data['note'] ?? $case->decision_note,
                'decided_at' => $data['action'] === 'review' ? null : now(),
            ]);

            if ($e && $case->kind === 'refund') {
                if ($data['action'] === 'approve') {
                    $e->update(['status' => 'refunded', 'correction_state' => 'Refunded']);
                    DpAmendment::create(['entitlement_id' => $e->id, 'type' => 'refund', 'from_value' => 'active', 'to_value' => 'refunded', 'amount_zar' => $case->amount_zar, 'status' => 'applied']);
                } elseif (in_array($data['action'], ['decline', 'resolve'], true) && $e->status === 'suspended') {
                    $e->update(['status' => 'active', 'correction_state' => 'Delivered']);
                }
            }
        });
        Audit::log(match ($data['action']) { 'approve' => 'DP_REFUND_APPROVED', 'decline' => 'DP_REFUND_DECLINED', default => 'DP_CASE_UPDATED' }, $case, $data);

        return back()->with('success', "{$case->reference}: ".str_replace('_', ' ', $case->status).'.');
    }

    /* ---- helpers --------------------------------------------------------- */

    private function qaStatus(array $qa, ?string $keep = null): string
    {
        $checks = collect($qa['checks'] ?? []);

        return match (true) {
            $checks->contains('result', 'fail') => 'blocked',
            $checks->count() === 17 && $checks->every(fn ($c) => $c['result'] === 'pass') => $keep ?? 'ready_for_review',
            default => 'in_progress',
        };
    }

    private function ipState(?string $instrument, string $thirdParty, string $ai): string
    {
        return match (true) {
            ! $instrument || $thirdParty === 'FAIL' => 'at_risk',
            $thirdParty === 'PASS' && $ai !== 'AI-X' => 'cleared',
            default => 'partial',
        };
    }

    private function fail(string $key, string $message): never
    {
        throw ValidationException::withMessages([$key => $message]);
    }
}
