<?php

namespace App\Http\Controllers\Shop\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Shop\QuoteController;
use App\Models\Order;
use App\Models\Shop\Brief;
use App\Models\Shop\Entitlement;
use App\Models\Shop\LedgerPosting;
use App\Models\Shop\Quote;
use App\Models\Shop\RetainerProposal;
use App\Models\Submission;
use App\Support\Platform\Reference;
use App\Support\Shop\Audit;
use App\Support\Shop\Reconciler;
use App\Support\Shop\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Commerce operations: orders & accounting, quotes & proposals, entitlements,
 * marketplace briefs and the QBO / entitlement reconciliation (OS-041).
 */
class CommerceController extends Controller
{
    private function orderRow(Order $o): array
    {
        $ents = Entitlement::query()->where('order_id', $o->id)->get();

        return [
            'reference' => $o->reference, 'section' => $o->section, 'status' => $o->status, 'customer' => $o->billing['company'] ?? ($o->billing['name'] ?? $o->user?->name ?? 'Guest'),
            'email' => $o->billing['email'] ?? null, 'date' => ($o->paid_at ?? $o->created_at)?->toIso8601String(), 'total' => $o->total_zar,
            'items' => $o->items->pluck('name')->implode(', '),
            'qbo' => LedgerPosting::query()->where('order_id', $o->id)->value('qbo_reference'),
            'entitlement' => $ents->first()?->reference, 'entitlement_type' => $ents->first()?->type, 'entitlement_status' => $ents->first()?->status,
            'match' => Reconciler::matchStatus($o),
        ];
    }

    /* --- Orders & Accounting ------------------------------------------------ */

    public function orders(Request $request): Response
    {
        $orders = Order::query()->with('items', 'user')
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('section'), fn ($q, $v) => $q->where('section', $v))
            ->when($request->query('q'), fn ($q, $v) => $q->where(fn ($w) => $w->where('reference', 'like', "%{$v}%")->orWhere('billing', 'like', "%{$v}%")))
            ->latest()->paginate(15)->withQueryString();

        $all = Order::query()->get(['status', 'total_zar', 'vat_zar', 'section']);

        return Inertia::render('Shop/Admin/Orders', [
            'orders' => ['data' => collect($orders->items())->map(fn ($o) => $this->orderRow($o)), 'links' => $orders->linkCollection(), 'total' => $orders->total()],
            'kpis' => [
                'paid' => $all->where('status', 'paid')->count(), 'paid_value' => $all->where('status', 'paid')->sum('total_zar'),
                'awaiting' => $all->where('status', 'awaiting_payment')->count(), 'failed' => $all->where('status', 'failed')->count(),
                'refunded' => $all->where('status', 'refunded')->count(), 'vat' => $all->where('status', 'paid')->sum('vat_zar'),
            ],
            'sections' => $all->pluck('section')->unique()->values(),
            'filters' => $request->only(['status', 'section', 'q']),
        ]);
    }

    public function refund(Order $order): RedirectResponse
    {
        abort_unless($order->status === 'paid', 409, 'Only paid orders can be refunded.');
        $order->update(['status' => 'refunded']);
        Reconciler::reconcile($order);
        Audit::log('refund', $order->reference, 'Order refunded; credit posted to Ledger C and entitlements revoked');

        return back()->with('success', "{$order->reference} refunded. Entitlements revoked and Ledger C credit posted.");
    }

    /* --- Quotes & Proposals ------------------------------------------------- */

    public function quotes(Request $request): Response
    {
        $tab = $request->query('tab', 'requests');

        return Inertia::render('Shop/Admin/Quotes', [
            'tab' => $tab,
            'requests' => Submission::query()->whereIn('type', ['quote-request', 'consultation-request'])->latest()->take(50)->get()->map(fn (Submission $s) => [
                'reference' => $s->reference, 'type' => $s->type, 'section' => $s->section, 'subject' => $s->subject, 'name' => $s->name, 'email' => $s->email,
                'status' => $s->status, 'created_at' => $s->created_at?->toIso8601String(), 'payload' => $s->payload,
                'quote' => Quote::query()->where('submission_id', $s->id)->latest('version')->value('reference'),
            ]),
            'quotes' => Quote::query()->latest()->take(50)->get()->map(fn (Quote $q) => [
                ...$q->only(['reference', 'title', 'provider', 'version', 'status', 'lines', 'client_note']),
                'valid_until' => $q->valid_until?->toDateString(), 'totals' => QuoteController::totals($q),
            ]),
            'proposals' => RetainerProposal::query()->where('status', '!=', 'draft')->latest()->take(50)->get()->map(fn (RetainerProposal $p) => [
                'id' => $p->id, 'reference' => $p->reference, 'status' => $p->status, 'estimate' => $p->estimated_monthly_zar,
                'contact' => $p->data['contact_name'] ?? null, 'email' => $p->data['contact_email'] ?? null,
                'scope' => implode(', ', $p->data['scope'] ?? []), 'allowance' => $p->data['allowance'] ?? null, 'submitted_at' => $p->submitted_at?->toIso8601String(),
            ]),
            'counts' => [
                'requests' => Submission::query()->whereIn('type', ['quote-request', 'consultation-request'])->whereIn('status', ['received', 'in_review'])->count(),
                'quotes' => Quote::query()->whereIn('status', ['issued', 'changes_requested'])->count(),
                'proposals' => RetainerProposal::query()->whereIn('status', ['submitted', 'capacity_review'])->count(),
            ],
        ]);
    }

    public function issue(Request $request, Submission $submission): RedirectResponse
    {
        $data = $request->validate([
            'provider' => ['required', 'string', 'max:190'],
            'valid_days' => ['required', 'integer', 'min:1', 'max:90'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.description' => ['required', 'string', 'max:190'],
            'lines.*.quantity' => ['required', 'integer', 'min:1'],
            'lines.*.unit_zar' => ['required', 'integer', 'min:1'],
            'deliverables' => ['nullable', 'string', 'max:2000'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $quote = Quote::create([
            'reference' => Reference::make('QTE'),
            'submission_id' => $submission->id,
            'user_id' => $submission->user_id,
            'title' => $submission->subject ?? 'Quoted engagement',
            'category' => $submission->payload['engagement_type'] ?? null,
            'provider' => $data['provider'],
            'email' => $submission->email,
            'lines' => $data['lines'],
            'deliverables' => array_values(array_filter(array_map('trim', preg_split('/\r?\n/', (string) ($data['deliverables'] ?? ''))))),
            'terms' => [['Payment Terms', '50% upfront, 50% on delivery'], ['Validity', "This quote is valid for {$data['valid_days']} days"], ['Revisions', 'Up to 2 revision cycles included']],
            'provider_note' => $data['note'] ?? null,
            'status' => 'issued',
            'valid_until' => now()->addDays($data['valid_days'])->toDateString(),
            'issued_at' => now(),
        ]);
        $submission->update(['status' => 'responded']);
        Audit::log('quote-issue', $quote->reference, "Quote v1 issued for {$submission->reference}");

        return back()->with('success', "Quote {$quote->reference} issued. The client can review it at /shop/quote/{$quote->reference}.")->with('reference', $quote->reference);
    }

    public function reissue(Request $request, Quote $quote): RedirectResponse
    {
        $data = $request->validate([
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.description' => ['required', 'string', 'max:190'],
            'lines.*.quantity' => ['required', 'integer', 'min:1'],
            'lines.*.unit_zar' => ['required', 'integer', 'min:1'],
            'valid_days' => ['required', 'integer', 'min:1', 'max:90'],
        ]);
        abort_if(in_array($quote->status, ['accepted'], true), 409, 'Accepted quotes cannot be re-issued.');

        $history = $quote->history ?? [];
        $history[] = ['version' => $quote->version, 'label' => "V{$quote->version}", 'subtotal_zar' => QuoteController::totals($quote)['subtotal'], 'issued_at' => $quote->issued_at?->toIso8601String()];
        $quote->update([
            'lines' => $data['lines'], 'version' => $quote->version + 1, 'history' => $history, 'status' => 'issued',
            'valid_until' => now()->addDays($data['valid_days'])->toDateString(), 'issued_at' => now(),
        ]);
        Audit::log('quote-reissue', $quote->reference, "Quote re-issued as v{$quote->version}; client re-acceptance required");

        return back()->with('success', "Quote {$quote->reference} re-issued as version {$quote->version}.");
    }

    public function submissionStatus(Request $request, Submission $submission): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', 'in:received,in_review,responded,closed']]);
        $submission->update($data);
        Audit::log('request-status', $submission->reference, "Request -> {$data['status']}");

        return back()->with('success', "{$submission->reference} marked ".str_replace('_', ' ', $data['status']).'.');
    }

    public function proposalStatus(Request $request, RetainerProposal $proposal): RedirectResponse
    {
        $flow = ['submitted' => ['capacity_review', 'declined'], 'capacity_review' => ['proposal_issued', 'declined'], 'proposal_issued' => ['accepted', 'declined']];
        $data = $request->validate(['status' => ['required', 'in:capacity_review,proposal_issued,accepted,declined']]);
        if (! in_array($data['status'], $flow[$proposal->status] ?? [], true)) {
            return back()->with('error', "A proposal in {$proposal->status} cannot move to {$data['status']}.");
        }
        $proposal->update($data);
        Audit::log('proposal-status', $proposal->reference, "Retainer proposal -> {$data['status']}");

        return back()->with('success', "{$proposal->reference} is now ".str_replace('_', ' ', $data['status']).'.');
    }

    /* --- Entitlements -------------------------------------------------------- */

    public function entitlements(Request $request): Response
    {
        $rows = Entitlement::query()
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('authority'), fn ($q, $v) => $q->where('authority', $v))
            ->latest()->take(100)->get();

        return Inertia::render('Shop/Admin/Entitlements', [
            'rows' => $rows->map(fn (Entitlement $e) => [
                ...$e->only(['id', 'reference', 'name', 'item_code', 'type', 'authority', 'status', 'email']),
                'order' => $e->order?->reference, 'starts_at' => $e->starts_at?->toIso8601String(), 'ends_at' => $e->ends_at?->toIso8601String(),
            ]),
            'counts' => Entitlement::query()->get(['status'])->countBy('status'),
            'filters' => $request->only(['status', 'authority']),
        ]);
    }

    public function entitlementStatus(Request $request, Entitlement $entitlement): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', 'in:active,revoked']]);
        if ($data['status'] === 'active' && $entitlement->order && ! $entitlement->order->isPaid()) {
            return back()->with('error', 'An entitlement cannot be reinstated without valid payment authority.');
        }
        $entitlement->update($data);
        Audit::log('entitlement', $entitlement->reference, "Entitlement -> {$data['status']}");

        return back()->with('success', "{$entitlement->reference} is now {$data['status']}.");
    }

    /* --- Marketplace briefs -------------------------------------------------- */

    public const BRIEF_FLOW = ['submitted' => 'matching', 'matching' => 'proposals_received', 'proposals_received' => 'provider_selected', 'provider_selected' => 'closed'];

    public function marketplace(): Response
    {
        $briefs = Brief::query()->whereNotIn('status', ['draft', 'discarded'])->latest()->get();

        return Inertia::render('Shop/Admin/Marketplace', [
            'rows' => $briefs->map(fn (Brief $b) => [
                'reference' => $b->reference, 'title' => $b->title, 'status' => $b->status, 'next' => self::BRIEF_FLOW[$b->status] ?? null,
                'category' => $b->data['category'] ?? null, 'budget' => $b->data['budget'] ?? ($b->data['value_band'] ?? null),
                'industry' => $b->data['industry'] ?? null, 'submitted_at' => $b->submitted_at?->toIso8601String(),
            ]),
            'counts' => $briefs->countBy('status'),
            'drafts' => Brief::query()->where('status', 'draft')->count(),
        ]);
    }

    public function advanceBrief(Brief $brief): RedirectResponse
    {
        $next = self::BRIEF_FLOW[$brief->status] ?? null;
        abort_if($next === null, 409);
        $brief->update(['status' => $next]);
        Audit::log('brief', $brief->reference, "Brief -> {$next}");

        return back()->with('success', "{$brief->reference} moved to ".str_replace('_', ' ', $next).'.');
    }

    /* --- OS-041 QBO and Entitlement Reconciliation ---------------------------- */

    public function reconciliation(Request $request): Response
    {
        $orders = Order::query()->with('items', 'user')->whereIn('status', ['paid', 'refunded'])->latest('paid_at')->get();
        $rows = $orders->map(fn ($o) => $this->orderRow($o));
        $filtered = $rows
            ->when($request->query('match'), fn ($c, $v) => $c->where('match', $v))
            ->when($request->query('q'), fn ($c, $v) => $c->filter(fn ($r) => str_contains(Str::lower(implode(' ', [$r['reference'], $r['customer'], $r['qbo'], $r['entitlement']])), Str::lower($v))));

        $exceptions = $rows->where('match', '!=', 'matched')->map(fn ($r) => match (true) {
            $r['status'] === 'paid' && $r['entitlement'] === null => 'Entitlement Not Created (Payment Posted)',
            $r['status'] === 'paid' && $r['qbo'] === null => 'QBO posting missing',
            $r['status'] === 'refunded' => 'Cancelled Order - Entitlement Active',
            default => 'Amount Mismatch',
        })->countBy();

        return Inertia::render('Shop/Admin/Reconciliation', [
            'rows' => $filtered->values(),
            'kpis' => [
                'paid' => $rows->count(), 'paid_value' => $orders->sum('total_zar'),
                'matched' => $rows->where('match', 'matched')->count(), 'matched_value' => $orders->filter(fn ($o) => Reconciler::matchStatus($o) === 'matched')->sum('total_zar'),
                'pending' => $rows->where('match', 'pending')->count(), 'mismatch' => $rows->where('match', 'mismatch')->count(),
                'refunds' => $orders->where('status', 'refunded')->count(), 'refund_value' => $orders->where('status', 'refunded')->sum('total_zar'),
                'last_run' => Setting::get('reconciliation_last_run'),
            ],
            'ledgers' => LedgerPosting::query()->get()->groupBy('ledger')->map->sum('amount_zar'),
            'exceptions' => $exceptions->map(fn ($c, $r) => ['reason' => $r, 'count' => $c])->values(),
            'filters' => $request->only(['match', 'q']),
        ]);
    }

    public function runReconciliation(): RedirectResponse
    {
        $counts = Reconciler::run();
        Audit::log('reconcile', 'QBO', 'Reconciliation run: '.json_encode($counts));

        return back()->with('success', 'Reconciliation complete: '.($counts['matched'] ?? 0).' matched, '.($counts['pending'] ?? 0).' pending, '.($counts['mismatch'] ?? 0).' exceptions.');
    }

    public function reconcileOne(Order $order): RedirectResponse
    {
        $status = Reconciler::reconcile($order);
        Audit::log('reconcile', $order->reference, "Order reconciled: {$status}");

        return back()->with('success', "{$order->reference}: {$status}.");
    }
}
