<?php

namespace App\Http\Controllers\Insights;

use App\Http\Controllers\Controller;
use App\Models\Insights\Benchmark;
use App\Models\Insights\BenchmarkConsent;
use App\Models\Insights\Engagement;
use App\Models\Insights\EvidenceRequest;
use App\Models\Insights\Gate;
use App\Models\Insights\LedgerEntry;
use App\Models\Insights\Obligation;
use App\Models\Insights\ReclassNotice;
use App\Models\Order;
use App\Support\Insights\Audit;
use App\Support\Insights\Documents;
use App\Support\Platform\Checkout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Signed-in Industry workspace for an engagement: dashboard, verification,
 * re-classification, fee ledger, abort ladder, engagement letter, split
 * checkout, gates, partner route, specialist review, compliance calendar
 * and benchmark contribution consent.
 */
class IndustryWorkspaceController extends Controller
{
    public const ABORT_LADDER = [
        ['stage' => 'S0', 'point' => 'Arrival & Exploration', 'when' => 'Any time before registration', 'keep' => 'Nothing recorded. No fees. No obligations.', 'forfeit' => 'Nothing', 'fees' => 'None', 'action' => 'Abort Now'],
        ['stage' => 'S1', 'point' => 'Registration & Intent Capture', 'when' => 'Any time after registration before any paid access or report', 'keep' => 'Your profile, saved preferences, bookmarked countries.', 'forfeit' => 'Nothing', 'fees' => 'None', 'action' => 'Abort Now'],
        ['stage' => 'S2', 'point' => 'Country Selection & Fee Sweep', 'when' => 'Any time after fee sweep before first paid unlock or report order', 'keep' => 'Fee sweep summary, country comparison, disclosure manifest.', 'forfeit' => 'Nothing', 'fees' => 'None', 'action' => 'Abort Now'],
        ['stage' => 'S3', 'point' => 'Metered Intelligence Consumption', 'when' => 'Any time before committing to premium access or report order', 'keep' => 'Previously viewed Alpha (R10) intelligence you have unlocked.', 'forfeit' => 'No new intelligence beyond what you have viewed.', 'fees' => 'Alpha fees already paid are non-refundable.', 'action' => 'Abort Now'],
        ['stage' => 'S4', 'point' => 'Access Commitment (Subscription)', 'when' => 'Any time during free trial or within policy cancellation window', 'keep' => 'Previously unlocked Alpha intelligence during trial period.', 'forfeit' => 'Future Premium access and updates.', 'fees' => 'None during free trial. After trial: early cancellation fee may apply.', 'action' => 'Cancel Access'],
        ['stage' => 'S5', 'point' => 'Report Commissioning', 'when' => 'Any time before report delivery acceptance (Gate G5)', 'keep' => 'Draft report (if requested), methodology used, data sources.', 'forfeit' => 'Final report, update cycle, and associated deliverables.', 'fees' => 'Cancellation fee schedule applies (see policy).', 'action' => 'Abort Engagement'],
        ['stage' => 'S6+', 'point' => 'Human Escalation to Capital Engagement (S6–S12)', 'when' => 'Refer to engagement contract; abort possible at defined milestones.', 'keep' => 'Work completed to last accepted milestone.', 'forfeit' => 'Future work, deliverables, introductions, and outcomes.', 'fees' => 'Milestone fees are non-refundable.', 'action' => 'Abort Engagement'],
    ];

    private function authorise(Request $request, Engagement $engagement): void
    {
        $user = $request->user();
        abort_unless($engagement->user_id === $user->id || $user->role === 'admin', 403);
    }

    /** Common props for every workspace page. */
    private function base(Request $request, Engagement $engagement): array
    {
        $this->authorise($request, $engagement);
        self::settle($engagement);
        $engagement->loadMissing('industry');

        return [
            'engagement' => $engagement->context(),
            'counts' => [
                'tasks' => $engagement->tasks()->where('status', '!=', 'completed')->count(),
                'evidence' => $engagement->evidence()->where('status', 'requested')->count(),
                'notices' => $engagement->notices()->where('status', 'action_required')->count(),
                'ledger' => $engagement->ledger()->count(),
            ],
        ];
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $first = Engagement::query()->where('user_id', $request->user()->id)->latest()->first();
        if ($first) {
            return redirect("/industries/workspace/{$first->reference}");
        }

        return Inertia::render('Insights/Industries/Workspace/Empty');
    }

    public function dashboard(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $totals = $engagement->ledgerTotals();
        $tasks = $engagement->tasks()->get();

        return Inertia::render('Insights/Industries/Workspace/Dashboard', array_merge($base, [
            'progress' => $engagement->progress,
            'tasks' => $tasks->where('status', '!=', 'completed')->values()->map(fn ($t) => ['id' => $t->id, 'title' => $t->title, 'detail' => $t->detail, 'priority' => $t->priority, 'due' => $t->due_on?->format('d M Y')]),
            'taskTotals' => ['open' => $tasks->where('status', '!=', 'completed')->count(), 'total' => $tasks->count()],
            'timeline' => $engagement->data['timeline'] ?? [],
            'activity' => $engagement->data['activity'] ?? [],
            'documents' => $engagement->data['documents'] ?? [],
            'advisor' => $engagement->data['advisor'] ?? null,
            'gates' => $engagement->gates()->get()->map(fn ($g) => ['id' => $g->id, 'code' => $g->code, 'name' => $g->name, 'status' => $g->status])->values(),
            'totals' => $totals,
            'dueOn' => $engagement->due_on?->format('d M Y'),
            'nextMilestone' => collect($engagement->data['timeline'] ?? [])->firstWhere('status', '!=', 'completed'),
            'deliverablesReady' => collect($engagement->data['documents'] ?? [])->whereIn('status', ['Signed', 'Active', 'View'])->count(),
        ]));
    }

    /* --- Verification & evidence -------------------------------------- */

    public function verification(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $tab = $request->query('tab', 'requested');
        $all = $engagement->evidence()->get();
        $rows = $tab === 'all' ? $all : $all->where('status', $tab);

        return Inertia::render('Insights/Industries/Workspace/Verification', array_merge($base, [
            'tab' => $tab,
            'counts' => array_merge($base['counts'], [
                'requested' => $all->where('status', 'requested')->count(),
                'awaiting_review' => $all->where('status', 'awaiting_review')->count(),
                'resolved' => $all->where('status', 'resolved')->count(),
                'all' => $all->count(),
            ]),
            'summary' => [
                'status' => $all->where('status', 'requested')->isEmpty() ? 'Complete' : 'In Progress',
                'outstanding' => $all->where('status', 'requested')->count(),
                'submitted' => $all->whereIn('status', ['awaiting_review', 'resolved'])->count(),
                'total' => $all->count(),
                'updated' => $all->max('updated_at')?->format('d M Y, h:i A'),
            ],
            'requests' => $rows->values()->map(fn (EvidenceRequest $r) => [
                'id' => $r->id, 'reqId' => $r->req_id, 'title' => $r->title, 'detail' => $r->detail, 'sourceType' => $r->source_type,
                'impact' => $r->impact, 'priority' => $r->priority, 'requestedOn' => $r->requested_on->format('d M Y'),
                'dueOn' => $r->due_on->format('d M Y'), 'daysLeft' => (int) today()->diffInDays($r->due_on, false),
                'status' => $r->status, 'submission' => $r->submission,
            ]),
        ]));
    }

    public function submitEvidence(Request $request, Engagement $engagement, EvidenceRequest $evidence): RedirectResponse
    {
        $this->authorise($request, $engagement);
        abort_unless($evidence->engagement_id === $engagement->id, 404);
        if ($evidence->status !== 'requested') {
            return back()->with('error', 'Evidence has already been submitted for this request.');
        }

        $data = $request->validate([
            'note' => ['required', 'string', 'max:1000'],
            'link' => ['nullable', 'url', 'max:255', 'required_without:file'],
            'file' => ['nullable', 'file', 'max:10240', 'mimes:pdf,xlsx,xls,csv,docx,doc,png,jpg', 'required_without:link'],
        ], ['link.required_without' => 'Provide a link to a credible source or upload a document.']);

        $path = $request->file('file')?->store('insights/evidence', 'local');
        $evidence->update([
            'status' => 'awaiting_review',
            'submission' => ['note' => $data['note'], 'link' => $data['link'] ?? null, 'file' => $path ? basename($path) : null, 'at' => now()->format('d M Y'), 'by' => $request->user()->name],
        ]);
        Audit::log($evidence, 'evidence_submitted', 'requested', 'awaiting_review');

        return back()->with('success', "Evidence submitted for {$evidence->req_id}. Our analysts will review it.");
    }

    public function exportEvidence(Request $request, Engagement $engagement)
    {
        $this->authorise($request, $engagement);

        return Documents::csv("{$engagement->reference}-evidence.csv", $engagement->evidence()->get()->map(fn ($r) => [
            'request_id' => $r->req_id, 'evidence' => $r->title, 'source_type' => $r->source_type, 'impact' => $r->impact,
            'due' => $r->due_on->toDateString(), 'status' => $r->status,
        ])->all());
    }

    /* --- Re-classification ------------------------------------------- */

    public function reclassification(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $notice = $engagement->notices()->first();

        return Inertia::render('Insights/Industries/Workspace/Reclassification', array_merge($base, [
            'notice' => $notice ? [
                'id' => $notice->id, 'noticeId' => $notice->notice_id, 'issuedAt' => $notice->issued_at->format('d M Y, h:i A').' SAST',
                'effectiveOn' => $notice->effective_on->format('d M Y'), 'previous' => $notice->previous, 'next' => $notice->next,
                'delta' => ($notice->next['score'] ?? 0) - ($notice->previous['score'] ?? 0),
                'reasons' => $notice->reasons ?? [], 'evidence' => $notice->evidence ?? [], 'status' => $notice->status,
                'acknowledgedAt' => $notice->acknowledged_at?->format('d M Y, h:i A'), 'clarification' => $notice->clarification,
            ] : null,
            'evidenceCount' => $engagement->evidence()->where('status', 'resolved')->count(),
        ]));
    }

    public function respondNotice(Request $request, Engagement $engagement, ReclassNotice $notice): RedirectResponse
    {
        $this->authorise($request, $engagement);
        abort_unless($notice->engagement_id === $engagement->id, 404);
        $data = $request->validate([
            'action' => ['required', 'in:acknowledge,clarify'],
            'clarification' => ['required_if:action,clarify', 'nullable', 'string', 'max:2000'],
        ]);

        if ($data['action'] === 'acknowledge') {
            $notice->update(['status' => 'acknowledged', 'acknowledged_at' => now()]);
            Audit::log($notice, 'acknowledged', 'action_required', 'acknowledged');

            return back()->with('success', "Notice {$notice->notice_id} acknowledged.");
        }

        $notice->update(['status' => 'clarification_requested', 'clarification' => $data['clarification']]);
        Audit::log($notice, 'clarification_requested', $notice->getOriginal('status'), 'clarification_requested', $data['clarification']);

        return back()->with('success', 'Clarification request sent to your TBCA Advisor.');
    }

    public function printNotice(Request $request, Engagement $engagement, ReclassNotice $notice)
    {
        $this->authorise($request, $engagement);

        return Documents::pdf("{$notice->notice_id}.pdf", 'Re-Classification Notice '.$notice->notice_id, [
            "Engagement: {$engagement->reference} – {$engagement->title}",
            'Issued: '.$notice->issued_at->format('d M Y H:i').' | Effective: '.$notice->effective_on->format('d M Y'),
            "Previous: {$notice->previous['category']} | Risk score {$notice->previous['score']}/100 | Confidence {$notice->previous['confidence']}",
            "New: {$notice->next['category']} | Risk score {$notice->next['score']}/100 | Confidence {$notice->next['confidence']}",
            'Reasons:', ...array_map(fn ($r) => "- {$r}", $notice->reasons ?? []),
            'Status: '.str_replace('_', ' ', $notice->status),
        ]);
    }

    /* --- Fee transparency ledger ------------------------------------- */

    public function ledger(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $types = array_values(array_intersect((array) $request->query('types', ['charge', 'payment', 'disbursement', 'refund', 'adjustment']), ['charge', 'payment', 'disbursement', 'refund', 'adjustment']));
        $tab = $request->query('tab', 'all');
        $perPage = in_array((int) $request->query('per_page'), [5, 10, 25], true) ? (int) $request->query('per_page') : 10;

        $query = $engagement->ledger()->whereIn('type', $types ?: ['__none__']);
        if ($tab !== 'all') {
            $query->where('type', rtrim($tab, 's'));
        }
        $page = $query->reorder('occurred_at', 'desc')->paginate($perPage)->withQueryString();
        $all = $engagement->ledger()->get();

        return Inertia::render('Insights/Industries/Workspace/Ledger', array_merge($base, [
            'totals' => $engagement->ledgerTotals(),
            'tab' => $tab,
            'types' => $types,
            'perPage' => $perPage,
            'tabCounts' => ['all' => $all->count(), 'charges' => $all->where('type', 'charge')->count(), 'payments' => $all->where('type', 'payment')->count(), 'disbursements' => $all->where('type', 'disbursement')->count()],
            'entries' => [
                'data' => collect($page->items())->map(fn (LedgerEntry $l) => [
                    'id' => $l->id, 'date' => $l->occurred_at->format('d M Y'), 'time' => $l->occurred_at->format('h:i A'), 'type' => $l->type,
                    'description' => $l->description, 'detail' => $l->detail, 'amount' => $l->amount_zar, 'status' => $l->status, 'method' => $l->method,
                ]),
                'from' => $page->firstItem(), 'to' => $page->lastItem(), 'total' => $page->total(), 'currentPage' => $page->currentPage(), 'lastPage' => $page->lastPage(),
            ],
            'engagements' => Engagement::where('user_id', $request->user()->id)->get(['reference', 'title'])->map(fn ($e) => ['reference' => $e->reference, 'title' => $e->title]),
        ]));
    }

    public function exportLedger(Request $request, Engagement $engagement)
    {
        $this->authorise($request, $engagement);

        return Documents::csv("{$engagement->reference}-ledger.csv", $engagement->ledger()->get()->map(fn ($l) => [
            'date' => $l->occurred_at->format('Y-m-d H:i'), 'type' => $l->type, 'description' => $l->description, 'reference' => $engagement->reference,
            'amount_zar' => $l->amount_zar, 'status' => $l->status, 'method' => $l->method,
        ])->all());
    }

    /* --- Abort ladder ------------------------------------------------- */

    public function abortLadder(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $totals = $engagement->ledgerTotals();
        $stageIndex = $this->stageIndex($engagement->stage);
        $milestoneFees = $stageIndex >= 5 ? $totals['payments'] : 0;

        return Inertia::render('Insights/Industries/Workspace/AbortLadder', array_merge($base, [
            'ladder' => collect(self::ABORT_LADDER)->map(fn ($r, $i) => array_merge($r, [
                'available' => $engagement->status === 'active' && $i === min($stageIndex, 6),
                'passed' => $i < min($stageIndex, 6),
            ]))->values(),
            'summary' => [
                'points' => count(self::ABORT_LADDER),
                'paid' => $totals['payments'],
                'forfeiture' => 0,
                'nonRefundable' => $milestoneFees,
            ],
            'status' => $engagement->status,
        ]));
    }

    private function stageIndex(string $stage): int
    {
        return min(6, (int) filter_var($stage, FILTER_SANITIZE_NUMBER_INT));
    }

    public function abort(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->authorise($request, $engagement);
        $data = $request->validate(['confirm' => ['accepted'], 'reason' => ['nullable', 'string', 'max:500']], ['confirm.accepted' => 'Confirm that you understand what you keep and forfeit.']);

        if ($engagement->status !== 'active') {
            return back()->with('error', 'This engagement is no longer active.');
        }

        $engagement->update(['status' => 'aborted']);
        $engagement->tasks()->where('status', '!=', 'completed')->update(['status' => 'completed']);
        $engagement->gates()->where('status', 'pending')->update(['status' => 'locked']);
        LedgerEntry::where('engagement_id', $engagement->id)->where('type', 'charge')->where('status', 'invoiced')->update(['status' => 'cancelled']);
        Audit::log($engagement, 'aborted', 'active', 'aborted', $data['reason'] ?? null);

        return redirect("/industries/workspace/{$engagement->reference}/abort-ladder")->with('success', "Engagement {$engagement->reference} aborted at {$engagement->stage}. Unpaid invoices were cancelled; you can return at any time.");
    }

    public function abortPolicy(Request $request, Engagement $engagement)
    {
        $this->authorise($request, $engagement);

        return Documents::pdf('tbca-abort-policy.pdf', 'TBCA Abort Policy', array_merge(
            ['You can exit at any stage. This ladder shows when you can abort, what you keep, what you forfeit, and any fees that apply.', ''],
            array_map(fn ($r) => "{$r['stage']} {$r['point']}: {$r['when']}. Keep: {$r['keep']} Forfeit: {$r['forfeit']} Fees: {$r['fees']}", self::ABORT_LADDER)
        ));
    }

    /* --- Engagement letter ------------------------------------------- */

    public function letter(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);

        return Inertia::render('Insights/Industries/Workspace/Letter', array_merge($base, [
            'letter' => [
                'status' => $engagement->letter_status,
                'signedAt' => $engagement->letter_signed_at?->format('d M Y, h:i A'),
                'signedBy' => $engagement->data['signed_by'] ?? null,
                'issueDate' => $engagement->created_at->format('d M Y'),
                'client' => $engagement->user?->company ?? $engagement->user?->name,
                'clientName' => $engagement->user?->name,
                'totalFee' => $engagement->total_fee_zar,
                'deliverables' => $engagement->data['deliverables'] ?? [],
                'addOns' => $engagement->data['add_ons'] ?? [],
                'validUntil' => $engagement->created_at->copy()->addDays(30)->format('d M Y'),
            ],
        ]));
    }

    public function signLetter(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->authorise($request, $engagement);
        $data = $request->validate([
            'signer_name' => ['required', 'string', 'max:120'],
            'agree' => ['accepted'],
        ], ['agree.accepted' => 'Confirm that you have read and agree to the Engagement Letter.']);

        if ($engagement->letter_status === 'signed') {
            return back()->with('error', 'This engagement letter is already signed.');
        }

        $data_ = $engagement->data;
        $data_['signed_by'] = $data['signer_name'];
        $data_['documents'] = array_merge([['title' => 'Engagement Letter', 'file' => "{$engagement->reference}-EL.pdf", 'status' => 'Signed']], $data_['documents'] ?? []);
        $data_['timeline'] = collect($data_['timeline'] ?? [])->map(fn ($t) => $t['title'] === 'Engagement letter signature' ? array_merge($t, ['status' => 'completed', 'date' => now()->format('d M Y')]) : $t)->all();
        $engagement->update(['letter_status' => 'signed', 'letter_signed_at' => now(), 'data' => $data_]);
        $engagement->tasks()->where('title', 'Review and sign the engagement letter')->update(['status' => 'completed']);
        Audit::log($engagement, 'letter_signed', 'draft', 'signed', $data['signer_name']);

        return redirect("/industries/workspace/{$engagement->reference}/gates")->with('success', 'Engagement letter signed. Approve the quotation gate to proceed to payment.');
    }

    public function letterPdf(Request $request, Engagement $engagement)
    {
        $this->authorise($request, $engagement);
        $lines = [
            "Reference: {$engagement->reference} | Date: ".$engagement->created_at->format('d M Y'),
            'BETWEEN The Business Clinic.Africa (Pty) Ltd ("TBCA") Registration No: 2020/123456/07, Sandton, Johannesburg, South Africa',
            'AND '.($engagement->user?->company ?? $engagement->user?->name).' ("Client")',
            '1. PURPOSE: TBCA will provide the services described in this Letter in connection with the Africa Investment Intelligence Map (AIIM) diagnostic and advisory engagement.',
            '2. SCOPE OF WORK: Set out in Schedule 1. TBCA will perform the services with reasonable skill, care and diligence.',
        ];
        foreach ($engagement->data['deliverables'] ?? [] as $d) {
            $lines[] = "- {$d['title']}: {$d['target']}";
        }
        $lines[] = '3. FEES: R'.number_format($engagement->total_fee_zar).' excl. VAT, 100% upfront. All fees in ZAR and exclusive of VAT.';
        $lines[] = 'Status: '.str_replace('_', ' ', $engagement->letter_status).($engagement->letter_signed_at ? ' on '.$engagement->letter_signed_at->format('d M Y') : '');

        return Documents::pdf("{$engagement->reference}-EL.pdf", 'Engagement Letter', $lines);
    }

    /* --- Split checkout ---------------------------------------------- */

    private function invoiced(Engagement $engagement)
    {
        return $engagement->ledger()->where('type', 'charge')->where('status', 'invoiced')->get();
    }

    public function splitCheckout(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $invoiced = $this->invoiced($engagement);
        $amount = (int) $invoiced->sum('amount_zar');
        $user = $request->user();

        return Inertia::render('Insights/Industries/Workspace/SplitCheckout', array_merge($base, [
            'amount' => $amount,
            'invoice' => $invoiced->values()->map(fn ($l, $i) => ['item' => $i + 1, 'description' => "{$l->description} – {$engagement->country}", 'amount' => $l->amount_zar]),
            'draft' => $engagement->data['split_draft'] ?? [
                ['method' => 'card', 'label' => 'Corporate Card', 'payer' => $user->company ?: $user->name, 'role' => 'Primary Payer', 'amount' => (int) round($amount * 0.5882), 'enabled' => true],
                ['method' => 'eft', 'label' => 'Bank Transfer', 'payer' => 'Primary Development Bank', 'role' => 'Co-funder', 'amount' => (int) round($amount * 0.3529), 'enabled' => true],
                ['method' => 'wallet', 'label' => 'Wallet Balance', 'payer' => 'Client Wallet', 'role' => 'Prepaid Funds', 'amount' => $amount - (int) round($amount * 0.5882) - (int) round($amount * 0.3529), 'enabled' => true],
            ],
            'walletAvailable' => 12450,
            'letterSigned' => $engagement->letter_status === 'signed',
            'quotationApproved' => $engagement->gates()->where('code', 'G3')->value('status') === 'completed',
            'issueDate' => $engagement->created_at->format('d M Y'),
            'dueOn' => $engagement->due_on?->format('d M Y'),
        ]));
    }

    public function submitSplit(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->authorise($request, $engagement);
        $data = $request->validate([
            'mode' => ['required', 'in:draft,confirm'],
            'rows' => ['required', 'array', 'min:1', 'max:5'],
            'rows.*.method' => ['required', 'in:card,eft,wallet'],
            'rows.*.label' => ['required', 'string', 'max:60'],
            'rows.*.payer' => ['required', 'string', 'max:120'],
            'rows.*.role' => ['nullable', 'string', 'max:60'],
            'rows.*.amount' => ['required', 'integer', 'min:0'],
            'rows.*.enabled' => ['boolean'],
        ]);

        $rows = collect($data['rows'])->filter(fn ($r) => $r['enabled'] ?? true)->values();
        $stored = $engagement->data;
        $stored['split_draft'] = $data['rows'];
        $engagement->update(['data' => $stored]);

        if ($data['mode'] === 'draft') {
            return back()->with('success', 'Payment split saved as draft.');
        }

        $invoiced = $this->invoiced($engagement);
        $amount = (int) $invoiced->sum('amount_zar');

        if ($amount === 0) {
            return back()->with('error', 'There is no outstanding invoice on this engagement.');
        }
        if ($engagement->letter_status !== 'signed') {
            return back()->with('error', 'Sign the engagement letter before payment.');
        }
        if ($engagement->gates()->where('code', 'G3')->value('status') !== 'completed') {
            return back()->with('error', 'Approve the quotation gate (G3) before payment.');
        }
        if ((int) $rows->sum('amount') !== $amount) {
            return back()->withErrors(['rows' => 'The split must add up to exactly R'.number_format($amount).'.']);
        }
        if ($rows->where('method', 'wallet')->sum('amount') > 12450) {
            return back()->withErrors(['rows' => 'Wallet amount exceeds the available balance of R12,450.']);
        }

        $order = Checkout::createOrder(
            $invoiced->map(fn ($l) => ['item_type' => 'engagement', 'item_code' => $engagement->reference, 'name' => $l->description, 'unit_zar' => $l->amount_zar, 'meta' => ['ledger_entry_id' => $l->id]])->values()->all(),
            $request->user(),
            'insights',
            ['return_url' => "/industries/workspace/{$engagement->reference}/payment-return", 'title' => "Engagement {$engagement->reference}", 'engagement' => $engagement->reference, 'split' => $rows->all()]
        );

        Audit::log($engagement, 'payment_initiated', null, $order->reference);

        return redirect()->route('checkout.show', $order);
    }

    /** Settles paid split orders into the ledger (idempotent). */
    public function paymentReturn(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->authorise($request, $engagement);
        $this->settle($engagement);

        return redirect("/industries/workspace/{$engagement->reference}/ledger")->with('success', 'Ledger updated with your payment.');
    }

    public static function settle(Engagement $engagement): int
    {
        $settled = 0;
        Order::query()->where('section', 'insights')->where('status', 'paid')->where('meta->engagement', $engagement->reference)->get()
            ->each(function (Order $order) use ($engagement, &$settled) {
                if (! empty($order->meta['ledger_recorded'])) {
                    return;
                }
                foreach ($order->meta['split'] ?? [['label' => 'Payment', 'payer' => '', 'amount' => $order->subtotal_zar, 'method' => 'card']] as $row) {
                    LedgerEntry::create([
                        'engagement_id' => $engagement->id, 'occurred_at' => $order->paid_at ?? now(), 'type' => 'payment',
                        'description' => "{$row['label']} – {$order->reference}", 'detail' => $row['payer'] ?? null,
                        'amount_zar' => (int) $row['amount'], 'status' => 'completed', 'method' => strtoupper($row['method']), 'order_id' => $order->id,
                    ]);
                }
                $ids = $order->items->pluck('meta.ledger_entry_id')->filter()->all();
                LedgerEntry::whereIn('id', $ids)->update(['status' => 'paid']);
                $engagement->gates()->where('code', 'G4')->update(['status' => 'completed', 'decided_at' => now()]);
                $engagement->gates()->where('code', 'G5')->where('status', 'locked')->update(['status' => 'pending']);
                $data = $engagement->data;
                array_unshift($data['activity'], ['title' => 'Payment received', 'text' => 'R'.number_format($order->subtotal_zar).' via split payment', 'at' => now()->format('d M Y, h:i A'), 'icon' => 'check']);
                $engagement->update(['data' => $data, 'progress' => max($engagement->progress, 60), 'stage' => $engagement->stage === 'S5' ? 'S6' : $engagement->stage]);
                $order->update(['meta' => array_merge($order->meta, ['ledger_recorded' => true])]);
                $settled++;
            });

        return $settled;
    }

    /* --- Gates --------------------------------------------------------- */

    public function gates(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);

        return Inertia::render('Insights/Industries/Workspace/Gates', array_merge($base, [
            'gates' => $engagement->gates()->get()->map(fn (Gate $g) => [
                'id' => $g->id, 'code' => $g->code, 'name' => $g->name, 'stage' => $g->stage, 'status' => $g->status,
                'decidedAt' => $g->decided_at?->format('d M Y, h:i A'), 'decidedBy' => $g->decided_by,
            ])->values(),
            'quotation' => ['engagement' => $engagement->title, 'reference' => $engagement->reference, 'total' => $engagement->total_fee_zar],
            'payment' => ['total' => (int) $this->invoiced($engagement)->sum('amount_zar'), 'method' => 'Split Payment', 'milestone' => '100% upfront', 'currency' => 'ZAR'],
            'letterSigned' => $engagement->letter_status === 'signed',
            'history' => Audit::trail($engagement, 12),
        ]));
    }

    public function decideGate(Request $request, Engagement $engagement, Gate $gate): RedirectResponse
    {
        $this->authorise($request, $engagement);
        abort_unless($gate->engagement_id === $engagement->id, 404);
        $request->validate(['acknowledge' => ['accepted']], ['acknowledge.accepted' => 'Tick the confirmation to approve this gate.']);

        if ($gate->status !== 'pending') {
            return back()->with('error', "{$gate->name} is {$gate->status}.");
        }
        if ($gate->code === 'G4') {
            return redirect("/industries/workspace/{$engagement->reference}/split-checkout")->with('success', 'Complete payment to pass the Payment Gate.');
        }
        if ($gate->code === 'G3' && $engagement->letter_status !== 'signed') {
            return back()->with('error', 'Sign the engagement letter before approving the quotation.');
        }
        if ($gate->code === 'G5' && empty($engagement->data['client_ack'])) {
            return back()->with('error', 'Acceptance requires completed specialist review and your acknowledgement.');
        }

        $gate->update(['status' => 'completed', 'decided_at' => now(), 'decided_by' => $request->user()->name]);
        $next = 'G'.((int) substr($gate->code, 1) + 1);
        if ((int) substr($gate->code, 1) < 4) {
            $engagement->gates()->where('code', $next)->where('status', 'locked')->update(['status' => 'pending']);
        }
        if ($gate->code === 'G3') {
            $engagement->tasks()->where('title', 'Approve the quotation (Gate G3)')->update(['status' => 'completed']);
        }
        Audit::log($engagement, "gate_{$gate->code}_approved", 'pending', 'completed', $gate->name);

        return back()->with('success', "{$gate->name} approved and recorded to your audit trail.");
    }

    /* --- Partner route ------------------------------------------------- */

    public function partnerRoute(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);

        return Inertia::render('Insights/Industries/Workspace/PartnerRoute', array_merge($base, [
            'scope' => $engagement->data['partner_scope'] ?? [],
            'partners' => $engagement->data['partners'] ?? [],
            'selected' => $engagement->data['selected_partner'] ?? null,
            'routeStatus' => $engagement->route_status,
        ]));
    }

    public function selectPartner(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->authorise($request, $engagement);
        $ids = collect($engagement->data['partners'] ?? [])->pluck('id')->all();
        $data = $request->validate([
            'action' => ['required', 'in:select,confirm,change'],
            'partner' => ['required_if:action,select', 'nullable', 'in:'.implode(',', $ids ?: ['none'])],
            'acknowledge' => ['required_if:action,confirm', 'nullable', 'accepted'],
        ]);

        $stored = $engagement->data;
        if ($data['action'] === 'change') {
            $stored['selected_partner'] = null;
            $engagement->update(['data' => $stored, 'route_status' => 'pending']);

            return back()->with('success', 'Partner selection cleared. You can choose another partner.');
        }
        if ($data['action'] === 'select') {
            $stored['selected_partner'] = $data['partner'];
            $engagement->update(['data' => $stored, 'route_status' => 'partner_selected']);

            return back()->with('success', 'Partner selected. Review the disclosure and confirm the attachment.');
        }
        if (empty($stored['selected_partner'])) {
            return back()->with('error', 'Select a partner first.');
        }
        $partner = collect($stored['partners'])->firstWhere('id', $stored['selected_partner']);
        $engagement->update(['route_status' => 'confirmed']);
        LedgerEntry::create(['engagement_id' => $engagement->id, 'occurred_at' => now(), 'type' => 'adjustment', 'description' => "Partner route – {$partner['name']}", 'detail' => 'Ledger P – billed directly by partner (estimate)', 'amount_zar' => (int) $partner['fee'], 'status' => 'estimated']);
        Audit::log($engagement, 'partner_attached', 'partner_selected', 'confirmed', $partner['name']);

        return back()->with('success', "{$partner['name']} attached. The partner contracts with you directly under Ledger P.");
    }

    /* --- Specialist review -------------------------------------------- */

    public function specialistReview(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $specialists = collect($engagement->data['specialists'] ?? []);
        $done = $specialists->where('status', 'completed')->count();
        $releasable = $specialists->isNotEmpty() && $specialists->every(fn ($s) => in_array($s['status'], ['completed', 'not_required'], true)) && $done >= 2;

        return Inertia::render('Insights/Industries/Workspace/SpecialistReview', array_merge($base, [
            'specialists' => $specialists->values(),
            'checklist' => $engagement->data['checklist'] ?? [],
            'stats' => [
                'completed' => $done, 'inReview' => $specialists->where('status', 'in_review')->count(), 'pending' => $specialists->where('status', 'pending')->count(),
                'notRequired' => $specialists->where('status', 'not_required')->count(),
                'percent' => $specialists->count() ? (int) round(($done + $specialists->where('status', 'in_review')->count() * 0.5) / $specialists->count() * 100) : 0,
            ],
            'releasable' => $releasable,
            'clientAck' => (bool) ($engagement->data['client_ack'] ?? false),
            'requests' => $engagement->data['review_requests'] ?? [],
            'isAdmin' => $request->user()->role === 'admin',
            'summary' => ['complexity' => $engagement->industry?->complexityLabel(), 'due' => $engagement->due_on?->format('d M Y'), 'disciplines' => $specialists->count()],
        ]));
    }

    public function reviewAction(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->authorise($request, $engagement);
        $data = $request->validate([
            'action' => ['required', 'in:acknowledge,request,sign'],
            'note' => ['required_if:action,request', 'nullable', 'string', 'max:1000'],
            'index' => ['required_if:action,sign', 'nullable', 'integer', 'min:0'],
        ]);
        $stored = $engagement->data;
        $specialists = collect($stored['specialists'] ?? []);

        if ($data['action'] === 'sign') {
            abort_unless($request->user()->role === 'admin', 403);
            $i = (int) $data['index'];
            abort_unless(isset($stored['specialists'][$i]), 404);
            $stored['specialists'][$i] = array_merge($stored['specialists'][$i], ['status' => 'completed', 'signature' => $stored['specialists'][$i]['name'], 'date' => now()->format('d M Y')]);
            $engagement->update(['data' => $stored]);

            return back()->with('success', 'Specialist sign-off recorded.');
        }

        if ($data['action'] === 'request') {
            $stored['review_requests'][] = ['note' => $data['note'], 'at' => now()->format('d M Y, h:i A'), 'status' => 'requested'];
            $engagement->update(['data' => $stored]);

            return back()->with('success', 'Additional review requested.');
        }

        $done = $specialists->where('status', 'completed')->count();
        if (! ($specialists->every(fn ($s) => in_array($s['status'], ['completed', 'not_required'], true)) && $done >= 2)) {
            return back()->with('error', 'Engagement will not be released until all required specialist reviews are complete and at least two disciplines have signed off.');
        }
        $stored['client_ack'] = true;
        $engagement->update(['data' => $stored]);
        Audit::log($engagement, 'client_acknowledged_review');

        return back()->with('success', 'Acknowledgement recorded. Sign-off & release can proceed.');
    }

    /* --- Compliance calendar ------------------------------------------ */

    public static function obligationState(Obligation $o): string
    {
        if ($o->status === 'completed') {
            return 'completed';
        }
        $days = (int) today()->diffInDays($o->due_on, false);

        return match (true) {
            $days < 0 => 'overdue',
            $days <= 7 => 'at_risk',
            $days <= 90 => 'on_track',
            default => 'not_due',
        };
    }

    public function compliance(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $month = $request->query('month') && preg_match('/^\d{4}-\d{2}$/', $request->query('month'))
            ? Carbon::createFromFormat('Y-m-d', $request->query('month').'-01')->startOfDay()
            : today()->startOfMonth();
        $all = $engagement->obligations()->get();
        $rows = $all->map(fn (Obligation $o) => [
            'id' => $o->id, 'title' => $o->title, 'authority' => $o->authority, 'type' => $o->type, 'due' => $o->due_on->toDateString(),
            'dueLabel' => $o->due_on->format('d M Y'), 'days' => (int) today()->diffInDays($o->due_on, false), 'state' => self::obligationState($o),
            'recurring' => $o->recurring, 'custom' => $o->custom,
        ]);
        $open = $rows->where('state', '!=', 'completed');
        $health = $rows->count() ? (int) round(($rows->count() - $rows->whereIn('state', ['overdue', 'at_risk'])->count()) / $rows->count() * 100) : 100;

        return Inertia::render('Insights/Industries/Workspace/Compliance', array_merge($base, [
            'month' => $month->format('Y-m'),
            'monthLabel' => $month->format('F Y'),
            'today' => today()->toDateString(),
            'obligations' => $rows->values(),
            'upcoming' => $open->filter(fn ($r) => $r['days'] >= 0 && $r['days'] <= 90)->sortBy('days')->values(),
            'kpis' => [
                'total' => $rows->count(), 'upcoming' => $open->filter(fn ($r) => $r['days'] >= 0 && $r['days'] <= 90)->count(),
                'overdue' => $rows->where('state', 'overdue')->count(), 'recurring' => $rows->where('recurring', true)->count(), 'completed' => $rows->where('state', 'completed')->count(),
            ],
            'health' => ['percent' => $health, 'onTrack' => $rows->whereIn('state', ['on_track', 'completed'])->count(), 'atRisk' => $rows->where('state', 'at_risk')->count(), 'overdue' => $rows->where('state', 'overdue')->count(), 'notDue' => $rows->where('state', 'not_due')->count()],
            'typeCounts' => collect(['filing', 'renewal', 'reporting', 'payment'])->mapWithKeys(fn ($t) => [$t => $rows->where('type', $t)->count()]),
        ]));
    }

    public function storeObligation(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->authorise($request, $engagement);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'authority' => ['nullable', 'string', 'max:160'],
            'type' => ['required', 'in:filing,renewal,reporting,payment'],
            'due_on' => ['required', 'date'],
            'recurring' => ['boolean'],
        ]);
        $engagement->obligations()->create(array_merge($data, ['custom' => true, 'status' => 'upcoming', 'recurring' => $data['recurring'] ?? false]));

        return back()->with('success', "Custom obligation \"{$data['title']}\" added.");
    }

    public function completeObligation(Request $request, Engagement $engagement, Obligation $obligation): RedirectResponse
    {
        $this->authorise($request, $engagement);
        abort_unless($obligation->engagement_id === $engagement->id, 404);
        $obligation->update(['status' => 'completed']);
        if ($obligation->recurring) {
            $engagement->obligations()->create([
                'title' => $obligation->title, 'authority' => $obligation->authority, 'type' => $obligation->type,
                'due_on' => $obligation->due_on->copy()->addYear(), 'recurring' => true, 'custom' => $obligation->custom, 'status' => 'upcoming',
            ]);
        }

        return back()->with('success', "{$obligation->title} marked complete.".($obligation->recurring ? ' Next occurrence scheduled.' : ''));
    }

    public function complianceIcs(Request $request, Engagement $engagement)
    {
        $this->authorise($request, $engagement);

        return Documents::ics("{$engagement->reference}-compliance.ics", $engagement->obligations()->where('status', '!=', 'completed')->get()->map(fn ($o) => [
            'title' => $o->title, 'date' => $o->due_on, 'description' => $o->authority ?? '',
        ])->all());
    }

    /* --- Benchmark contribution consent ------------------------------- */

    public function benchmarkConsent(Request $request, Engagement $engagement): Response
    {
        $base = $this->base($request, $engagement);
        $benchmark = Benchmark::where('industry_id', $engagement->industry_id)->orderByRaw('case when bands is null then 1 else 0 end')->first();
        $choice = BenchmarkConsent::where('user_id', $request->user()->id)->where('industry_id', $engagement->industry_id)->latest()->first();

        return Inertia::render('Insights/Industries/Workspace/BenchmarkConsent', array_merge($base, [
            'benchmark' => $benchmark ? array_merge($benchmark->toRow(), ['label' => "{$engagement->industry->name} – {$engagement->country}", 'nextLevel' => $benchmark->nextLevel()]) : null,
            'choice' => $choice?->choice,
            'choiceAt' => $choice?->created_at->format('d M Y, h:i A'),
        ]));
    }

    public function saveBenchmarkConsent(Request $request, Engagement $engagement): RedirectResponse
    {
        $this->authorise($request, $engagement);
        $choice = $request->validate(['choice' => ['required', 'in:granted,declined,later']])['choice'];
        $previous = BenchmarkConsent::where('user_id', $request->user()->id)->where('industry_id', $engagement->industry_id)->latest()->value('choice');

        BenchmarkConsent::create(['user_id' => $request->user()->id, 'engagement_id' => $engagement->id, 'industry_id' => $engagement->industry_id, 'choice' => $choice]);

        // One organisation counts as one independent contributing entity (blueprint 11.2).
        $benchmark = Benchmark::where('industry_id', $engagement->industry_id)->orderByRaw('case when bands is null then 1 else 0 end')->first();
        if ($benchmark && $choice === 'granted' && $previous !== 'granted') {
            $benchmark->increment('n_current');
        } elseif ($benchmark && $previous === 'granted' && $choice !== 'granted' && $benchmark->n_current > 0) {
            $benchmark->decrement('n_current'); // withdrawal triggers dependency recalculation
        }

        $label = ['granted' => 'Consent recorded', 'declined' => 'Your decision not to contribute is recorded', 'later' => 'We will remind you later'][$choice];

        return back()->with('success', "{$label}. This does not affect any service delivered to you.");
    }
}
