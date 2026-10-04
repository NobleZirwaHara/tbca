<?php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\Marketplace\PartnerRequest;
use App\Models\Marketplace\Provider;
use App\Models\Marketplace\Record;
use App\Support\Marketplace\Options;
use App\Support\Marketplace\PartnerService;
use App\Support\Marketplace\Presenter;
use App\Support\Marketplace\Pricing;
use App\Support\Marketplace\ProviderContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Partner firm workspace (PS-019..024): dashboard, conflict check, quote, delivery & QA, settlement, verifications. */
class PartnerWorkspaceController extends Controller
{
    private function partner(Request $request): Provider
    {
        return ProviderContext::require($request->user(), 'partner');
    }

    private function ownMatter(Provider $p, PartnerRequest $r): void
    {
        abort_unless($r->partner_id === $p->id, 403, 'This matter is not assigned to your firm.');
        $r->load('partner', 'listing', 'order');
        PartnerService::syncPayment($r);
    }

    private function base(Provider $p): array
    {
        return [
            'partner' => Presenter::provider($p),
            'counts' => [
                'matters' => PartnerRequest::where('partner_id', $p->id)->whereIn('stage', ['delivery', 'qa_review', 'scope_quote', 'instrument', 'responsibility', 'payment', 'proposal'])->count() + (int) ($p->profile['legacy_matters'] ?? 0),
                'opportunities' => PartnerRequest::where('partner_id', $p->id)->where('stage', 'conflict_pending')->count(),
                'tasks' => count(array_filter($p->profile['tasks'] ?? [], fn ($t) => ! ($t['done'] ?? false))),
            ],
        ];
    }

    public function dashboard(Request $request): Response
    {
        $p = $this->partner($request);
        $matters = PartnerRequest::where('partner_id', $p->id)->latest('updated_at')->get();

        return Inertia::render('Marketplace/Partner/Workspace/Dashboard', [
            ...$this->base($p),
            'matters' => $matters->map(fn ($r) => Presenter::partnerRequest($r)),
            'legacyMatters' => $p->profile['matters'] ?? [],
            'tasks' => $p->profile['tasks'] ?? [],
            'payments' => $p->profile['payments'] ?? [],
            'outstanding' => (float) ($p->profile['outstanding'] ?? 0),
            'notifications' => $p->profile['notifications'] ?? [],
        ]);
    }

    public function toggleTask(Request $request): RedirectResponse
    {
        $p = $this->partner($request);
        $data = $request->validate(['index' => 'required|integer|min:0']);
        $profile = $p->profile ?? [];
        abort_unless(isset($profile['tasks'][$data['index']]), 404);
        $profile['tasks'][$data['index']]['done'] = ! ($profile['tasks'][$data['index']]['done'] ?? false);
        $p->update(['profile' => $profile]);

        return back();
    }

    /** PS-020 Opportunity & conflict check. */
    public function opportunity(Request $request, PartnerRequest $partnerRequest): Response
    {
        $p = $this->partner($request);
        $this->ownMatter($p, $partnerRequest);

        return Inertia::render('Marketplace/Partner/Workspace/Opportunity', [
            ...$this->base($p),
            'request' => Presenter::partnerRequest($partnerRequest),
            'practitioners' => array_values(array_unique(array_filter([$p->profile['lead'] ?? null, ...array_column($p->profile['practitioners'] ?? [], 'name')]))),
            'recent' => PartnerRequest::where('partner_id', $p->id)->whereNotNull('meta->conflict')->latest('updated_at')->limit(4)->get()
                ->map(fn ($r) => ['reference' => $r->reference, 'client' => $r->client_name, 'date' => $r->meta['conflict']['submitted_at'] ?? '', 'result' => $r->meta['conflict']['result'] ?? '']),
        ]);
    }

    public function submitConflict(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $p = $this->partner($request);
        $this->ownMatter($p, $partnerRequest);
        $data = $request->validate([
            'performed_by' => 'required|string|max:120',
            'method' => 'required|string|max:80',
            'result' => 'required|in:clear,clear_with_conditions,conflicted',
            'performed_on' => 'required|date|before_or_equal:today',
            'records' => 'required|array|min:1',
            'records.*' => 'string|max:60',
            'notes' => 'required_if:result,clear_with_conditions|nullable|string|max:1000',
            'attest' => 'accepted',
        ]);
        unset($data['attest']);
        PartnerService::submitConflict($partnerRequest, $data);

        return $data['result'] === 'conflicted'
            ? redirect()->route('partner-services.workspace.dashboard')->with('success', 'Conflict recorded. The matter has been released for reassignment; reasons remain confidential.')
            : redirect()->route('partner-services.workspace.quote', $partnerRequest)->with('success', 'Conflict check cleared. Scope & Quote is now unlocked.');
    }

    /** PS-021 Scope & quote submission. */
    public function quote(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $p = $this->partner($request);
        $this->ownMatter($p, $partnerRequest);
        if (! in_array($partnerRequest->conflict_state, ['CLEAR', 'CLEAR_WITH_CONDITIONS'], true)) {
            return redirect()->route('partner-services.workspace.opportunity', $partnerRequest)->with('error', 'Scope & Quote unlocks after conflict clearance.');
        }

        return Inertia::render('Marketplace/Partner/Workspace/Quote', [
            ...$this->base($p),
            'request' => Presenter::partnerRequest($partnerRequest),
            'editable' => in_array($partnerRequest->stage, ['proposal', 'scope_quote'], true),
            'floor' => Pricing::PS_FLOOR_ZAR,
        ]);
    }

    public function submitQuote(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $p = $this->partner($request);
        $this->ownMatter($p, $partnerRequest);
        $data = $request->validate([
            'description' => 'required|string|min:20|max:4000',
            'methodology' => 'nullable|string|max:1000',
            'deliverables' => 'nullable|string|max:1000',
            'assumptions' => 'nullable|string|max:1000',
            'exclusions' => 'nullable|string|max:1000',
            'valid_until' => 'required|date|after:today',
            'fee_mechanism' => 'required|in:M1 – Fixed Fee,M2 – Professional Fee,M3 – Success Fee,M4 – Retainer',
            'billing_basis' => 'required|in:time-materials,fixed',
            'hours' => 'required_if:billing_basis,time-materials|nullable|integer|min:1|max:5000',
            'rate' => 'required_if:billing_basis,time-materials|nullable|integer|min:100|max:20000',
            'fixed_fee' => 'required_if:billing_basis,fixed|nullable|integer|min:1000|max:10000000',
            'disbursements' => 'required|integer|min:0|max:10000000',
        ]);
        PartnerService::submitQuote($partnerRequest, $data);
        $fresh = $partnerRequest->fresh();

        return redirect()->route('partner-services.workspace.dashboard')->with(
            ($fresh->quote['floor_status'] ?? 'PASS') === 'PASS' ? 'success' : 'error',
            ($fresh->quote['floor_status'] ?? 'PASS') === 'PASS'
                ? 'Scope & quote submitted. The client will review it before the engagement instrument is issued.'
                : 'Quote submitted but T + P is below the current floor (R'.number_format(Pricing::PS_FLOOR_ZAR).'). It is blocked at quote stage until remediated.',
        );
    }

    /** PS-022 Delivery & QA interface. */
    public function delivery(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $p = $this->partner($request);
        $this->ownMatter($p, $partnerRequest);
        if (! in_array($partnerRequest->stage, ['delivery', 'qa_review', 'completed'], true)) {
            return redirect()->route('partner-services.workspace.opportunity', $partnerRequest)->with('error', 'Delivery opens after the engagement is executed and paid. No payment, no work.');
        }

        return Inertia::render('Marketplace/Partner/Workspace/Delivery', [...$this->base($p), 'request' => Presenter::partnerRequest($partnerRequest)]);
    }

    public function updateDelivery(Request $request, PartnerRequest $partnerRequest): RedirectResponse
    {
        $p = $this->partner($request);
        $this->ownMatter($p, $partnerRequest);
        $r = $partnerRequest;
        abort_unless($r->stage === 'delivery', 422, 'This matter is not open for delivery updates.');
        $data = $request->validate([
            'action' => 'required|in:upload,progress,time,submit',
            'file_name' => ['required_if:action,upload', 'nullable', 'string', 'max:150', 'regex:/\.(pdf|docx|xlsx|pptx|zip)$/i'],
            'milestone' => 'required_if:action,progress|nullable|string|max:120',
            'progress' => 'required_if:action,progress|nullable|integer|min:0|max:100',
            'comment' => 'nullable|string|max:1000',
            'internal' => 'nullable|string|max:1000',
            'hours' => 'required_if:action,time|nullable|numeric|min:0.25|max:200',
        ]);

        $meta = $r->meta ?? [];
        $dv = $meta['delivery'] ?? [];
        $stamp = now()->format('d M Y, H:i');

        switch ($data['action']) {
            case 'upload':
                $ext = strtoupper(pathinfo($data['file_name'], PATHINFO_EXTENSION));
                $dv['files'][] = ['name' => $data['file_name'], 'type' => $ext, 'version' => '1.0', 'uploaded' => $stamp, 'status' => 'Submitted'];
                $dv['activity'][] = ['at' => $stamp, 'body' => "You uploaded {$data['file_name']}"];
                $msg = 'Document added to the work packet.';
                break;
            case 'progress':
                $dv['milestone'] = $data['milestone'];
                $dv['progress'] = (int) $data['progress'];
                $dv['comment'] = $data['comment'] ?? ($dv['comment'] ?? '');
                $dv['internal'] = $data['internal'] ?? ($dv['internal'] ?? '');
                $dv['activity'][] = ['at' => $stamp, 'body' => "Progress updated: {$data['milestone']} {$data['progress']}%"];
                $msg = 'Delivery progress saved.';
                break;
            case 'time':
                $dv['hours_logged'] = round(($dv['hours_logged'] ?? 0) + (float) $data['hours'], 2);
                $dv['activity'][] = ['at' => $stamp, 'body' => "Logged {$data['hours']} hours"];
                $msg = 'Time logged against the P component.';
                break;
            default:
                abort_if(empty($dv['files']), 422, 'Upload at least one deliverable before submitting for QA.');
                $dv['progress'] = 100;
                $dv['qa'] = array_map(fn () => 'Completed', $dv['qa'] ?? ['Scope compliance' => 1]);
                $dv['activity'][] = ['at' => $stamp, 'body' => 'Submitted for TBCA QA review and partner sign-off'];
                $r->stage = 'qa_review';
                PartnerService::history($r, 'Submitted for QA', 'Professional work submitted for QA and client sign-off.');
                $msg = 'Submitted for QA. Client sign-off unlocks after QA sign-off.';
        }

        $meta = $r->meta ?? [];
        $meta['delivery'] = $dv;
        $r->meta = $meta;
        $r->save();

        return back()->with('success', $msg);
    }

    /** PS-023 Fee settlement & statement. */
    public function settlement(Request $request, PartnerRequest $partnerRequest): Response|RedirectResponse
    {
        $p = $this->partner($request);
        $this->ownMatter($p, $partnerRequest);
        if (empty($partnerRequest->meta['settlement'])) {
            return redirect()->route('partner-services.workspace.dashboard')->with('error', 'Settlement is issued once the client signs off the delivered work.');
        }

        return Inertia::render('Marketplace/Partner/Workspace/Settlement', [...$this->base($p), 'request' => Presenter::partnerRequest($partnerRequest)]);
    }

    /** PS-024 Re-verification & lapse warning for the firm's practitioners. */
    public function verifications(Request $request): Response
    {
        $p = $this->partner($request);
        $watch = collect($p->profile['practitioners'] ?? [])->map(function ($pr) {
            $days = isset($pr['valid_until']) ? (int) now()->startOfDay()->diffInDays(\Illuminate\Support\Carbon::parse($pr['valid_until']), false) : null;
            $status = $pr['status'] ?? ($days === null ? 'Pending' : ($days < 0 ? 'Expired' : ($days <= 30 ? 'Expiring Soon' : 'Current & Valid')));

            return [...$pr, 'days_left' => $days, 'status' => $status];
        });

        return Inertia::render('Marketplace/Partner/Workspace/Verifications', [
            ...$this->base($p),
            'watchlist' => $watch,
            'summary' => $p->profile['verification_summary'] ?? ['current' => 42, 'expiring' => 12, 'expired' => 6, 'suspended' => 4, 'pending' => 4],
            'events' => $p->profile['verification_events'] ?? [],
            'expiry' => Record::where('register', 'expiry')->get()->filter(fn ($r) => ($r->data['partner'] ?? '') === $p->name)->values()->map(fn ($r) => ['reference' => $r->reference, ...$r->data, 'status' => $r->status]),
        ]);
    }
}
